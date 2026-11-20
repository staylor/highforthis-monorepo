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
  isAuthenticated: false,
  graphqlHost: 'http://graphql.test',
};

const show = (id: string, date: string, artist: string, venue = 'Bowery Ballroom') => ({
  node: {
    id,
    date: new Date(date).getTime(),
    title: null,
    url: null,
    artists: [{ id: `a-${id}`, name: artist, slug: artist.toLowerCase() }],
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
    assert.match(html, /href="\/artist\/lucy dacus"/);
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
