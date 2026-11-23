import * as assert from 'remix/assert';
import { renderToString } from 'remix/component/server';
import { describe, it } from 'remix/test';

import { getT } from '#/lib/i18n.ts';
import { AppProvider, type AppValue } from '#/ui/app-context.tsx';
import { trans } from '#/ui/trans.tsx';

import { Attended, ShowsGrid } from './shows.tsx';

const app: AppValue = {
  t: getT(),
  root: {} as AppValue['root'],
  pathname: '/',
};

const show = (id: string, date: string, artist: string, venue = 'Bowery Ballroom') => ({
  node: {
    id,
    date: new Date(date).getTime(),
    title: null,
    url: null,
    artists: [{ id: `a-${id}`, name: artist, slug: artist.toLowerCase().replaceAll(' ', '-') }],
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
                artists: [...shared.node.artists, { id: 'a-4', name: 'Bedhead', slug: 'bedhead' }],
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

describe('Attended', () => {
  it('pluralizes the heading and wraps the count in the Bold component', async () => {
    const html = await renderToString(
      <AppProvider value={app}>
        <Attended
          relation="venue"
          shows={{
            edges: [show('1', '2024-01-01', 'Sting'), show('2', '2024-02-01', 'Sting')],
          }}
        />
      </AppProvider>
    );
    assert.match(html, /<span class="[^"]+">2 Shows<\/span> we have attended at this venue/);
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
