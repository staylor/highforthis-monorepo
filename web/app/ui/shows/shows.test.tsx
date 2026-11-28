import * as assert from 'remix/assert';
import { renderToString } from 'remix/component/server';
import { describe, it } from 'remix/test';

import { getT } from '#/lib/i18n.ts';
import { AppProvider, type AppValue } from '#/ui/app-context.tsx';
import { trans } from '#/ui/trans.tsx';

import { Attended, ShowsGrid, ShowsList } from './shows.tsx';

const app: AppValue = {
  t: getT(),
  root: {} as AppValue['root'],
  pathname: '/',
};

/** An artist, with Apple Music's artwork when there's a URL for it */
const artist = (id: string, name: string, artwork?: string) => ({
  id,
  name,
  slug: name.toLowerCase().replaceAll(' ', '-'),
  appleMusic: artwork ? { id: `am-${id}`, artwork: { url: artwork } } : null,
});

const show = (
  id: string,
  date: string,
  name: string,
  venue = 'Bowery Ballroom',
  artwork?: string
) => ({
  cursor: `cursor-${id}`,
  node: {
    id,
    schedule: { localDate: date.slice(0, 10), localTime: date.slice(11) },
    title: null,
    url: null,
    artists: [artist(`a-${id}`, name, artwork)],
    venue: {
      id: 'v1',
      name: venue,
      slug: 'bowery-ballroom',
      city: 'New York',
      state: 'NY',
    },
  },
});

describe('ShowsGrid', () => {
  it('groups shows under year and month headings in date order', async () => {
    const html = await renderToString(
      <ShowsGrid
        shows={{
          edges: [
            show('2', '2025-02-01T20:00:00', 'Yo La Tengo'),
            show('1', '2024-12-31T20:00:00', 'Lucy Dacus'),
          ].map((edge) => ({ ...edge, cursor: edge.node.id })),
          pageInfo: { hasNextPage: false },
        }}
      />
    );
    const order = ['2024', 'December', 'Lucy Dacus', '2025', 'February', 'Yo La Tengo'].map(
      (text) => html.indexOf(text)
    );
    assert.deepEqual(
      order,
      [...order].sort((a, b) => a - b)
    );
    assert.match(html, /href="\/artist\/lucy-dacus"/);
  });

  it("links a show with a title, a website or several artists to the show's own page", async () => {
    const titled = show('1', '2025-02-01T20:00:00', 'Wilco');
    const listed = show('2', '2025-02-02T20:00:00', 'Spoon');
    const shared = show('3', '2025-02-03T20:00:00', 'Low');
    const html = await renderToString(
      <ShowsGrid
        shows={{
          edges: [
            { ...titled, node: { ...titled.node, title: 'Solid Sound' } },
            { ...listed, node: { ...listed.node, url: 'https://tickets.example/spoon' } },
            {
              ...shared,
              node: {
                ...shared.node,
                artists: [...shared.node.artists, artist('a-4', 'Bedhead')],
              },
            },
          ].map((edge) => ({ ...edge, cursor: edge.node.id })),
          pageInfo: { hasNextPage: false },
        }}
      />
    );
    assert.match(html, /<a [^>]*href="\/shows\/1"[^>]*>Solid Sound<\/a>/);
    assert.match(html, /<a [^>]*href="\/shows\/2"[^>]*>Spoon<\/a>/);
    assert.match(html, /<a [^>]*href="\/shows\/3"[^>]*>Low \/ Bedhead<\/a>/);
  });

  it("puts each show's main artist's picture beside it, or their initials without one", async () => {
    const wilco = 'https://is1-ssl.mzstatic.com/image/thumb/wilco/{w}x{h}bb.jpg';
    const shows = {
      edges: [
        show('1', '2025-02-01T20:00:00', 'Wilco', undefined, wilco),
        show('2', '2025-02-02T20:00:00', 'The Hold Steady'),
      ].map((edge) => ({ ...edge, cursor: edge.node.id })),
      pageInfo: { hasNextPage: false },
    };

    // A small picture beside a row of the table, and a larger one beside the list's three lines
    const grid = await renderToString(<ShowsGrid shows={shows} />);
    assert.match(
      grid,
      /<img [^>]*src="https:\/\/is1-ssl\.mzstatic\.com\/image\/thumb\/wilco\/64x64bb\.jpg"/
    );
    assert.match(grid, /<span [^>]*aria-hidden="true"[^>]*>HS<\/span>/);
    const list = await renderToString(<ShowsList shows={shows} />);
    assert.match(list, /<img [^>]*src="[^"]*\/wilco\/96x96bb\.jpg"/);
    assert.match(list, /<span [^>]*aria-hidden="true"[^>]*>HS<\/span>/);
  });

  // The history: a page that goes on from one that ended in March 2025, with a frame for the next
  it('lists the newest first, without heading the year the page before already did', async () => {
    const html = await renderToString(
      <ShowsGrid
        newestFirst
        showMonths={false}
        previous="2025-03"
        more={<p>More to come</p>}
        shows={{
          edges: [
            show('1', '2024-12-31T20:00:00', 'Lucy Dacus'),
            show('3', '2025-02-01T20:00:00', 'Yo La Tengo'),
            show('2', '2025-02-01T20:00:00', 'Wilco'),
          ].map((edge) => ({ ...edge, cursor: edge.node.id })),
          pageInfo: { hasNextPage: true },
        }}
      />
    );
    assert.doesNotMatch(html, />2025</);
    assert.doesNotMatch(html, /February/);
    // The next page's frame goes after the table, not in it
    assert.match(html, /<\/table><p>More to come<\/p>/);
    const order = ['Wilco', 'Yo La Tengo', '>2024<', 'Lucy Dacus', 'More to come'].map((text) =>
      html.indexOf(text)
    );
    assert.ok(order.every((index) => index >= 0));
    assert.deepEqual(
      order,
      [...order].sort((a, b) => a - b)
    );
  });

  it('lists shows whose artists have all been deleted by their venue', async () => {
    // Two on one date, which the grid sorts by artist
    const orphans = ['1', '2'].map((id) => {
      const { node } = show(id, '2025-02-01T20:00:00', 'Deleted');
      return { cursor: id, node: { ...node, artists: [] } };
    });
    const html = await renderToString(
      <ShowsGrid shows={{ edges: orphans, pageInfo: { hasNextPage: false } }} />
    );
    assert.match(html, /<a [^>]*href="\/shows\/1"[^>]*>Bowery Ballroom<\/a>/);
    assert.match(html, /<a [^>]*href="\/shows\/2"[^>]*>Bowery Ballroom<\/a>/);
  });
});

describe('ShowsList', () => {
  it('heads a new month, but not the year the page before already did', async () => {
    const html = await renderToString(
      <ShowsList
        previous="2025-03"
        more={<p>More to come</p>}
        shows={{
          edges: [show('2', '2025-02-01T20:00:00', 'Yo La Tengo')].map((edge) => ({
            ...edge,
            cursor: edge.node.id,
          })),
          pageInfo: { hasNextPage: true },
        }}
      />
    );
    assert.doesNotMatch(html, />2025</);
    const order = ['February', 'Yo La Tengo', 'More to come'].map((text) => html.indexOf(text));
    assert.ok(order.every((index) => index >= 0));
    assert.deepEqual(
      order,
      [...order].sort((a, b) => a - b)
    );
  });
});

describe('Attended', () => {
  const attended = (count: number | null) => ({
    count,
    edges: [show('1', '2024-01-01', 'Sting'), show('2', '2024-02-01', 'Sting')],
    pageInfo: { hasNextPage: false },
  });

  it('pluralizes the heading and wraps the count in the Bold component', async () => {
    const html = await renderToString(
      <AppProvider value={app}>
        <Attended relation="venue" shows={attended(null)} />
      </AppProvider>
    );
    assert.match(html, /<span class="[^"]+">2 Shows<\/span> we have attended at this venue/);
  });

  // It counted the shows listed, which stopped at the first page
  it('counts every show the connection has', async () => {
    const html = await renderToString(
      <AppProvider value={app}>
        <Attended relation="venue" shows={attended(120)} />
      </AppProvider>
    );
    assert.match(html, /<span class="[^"]+">120 Shows<\/span> we have attended at this venue/);
  });
});

describe('trans', () => {
  it('turns translated markup into elements', async () => {
    const html = await renderToString(
      <p>{trans(getT(), 'sphere.stats.songs', { songCount: 3, setlistCount: 2 })}</p>
    );
    assert.equal(
      html,
      '<p><strong>3</strong> songs played total during the residency (<strong>2</strong> shows)</p>'
    );
  });
});
