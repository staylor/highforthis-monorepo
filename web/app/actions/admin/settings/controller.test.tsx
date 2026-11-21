import * as assert from 'remix/assert';
import { afterEach, beforeEach, describe, it, type TestContext } from 'remix/test';

import { testSecret, testSession } from '#/lib/adminSession.fixtures.ts';
import { router } from '#/router.ts';

const origin = 'http://localhost';

type Operation = { operationName: string; variables: Record<string, any> };

/**
 * Stands in for GraphQL: accepts the session, answers each operation by name, and records the
 * operations it was sent.
 */
function stubGraphQL(t: TestContext, answers: Record<string, unknown> = {}) {
  const operations: Operation[] = [];
  t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : input);
    if (url.pathname === '/auth/session') {
      return new Response(null, { status: 200 });
    }
    const { operationName, variables } = JSON.parse(String(init?.body));
    operations.push({ operationName, variables });
    return Response.json({ data: answers[operationName] ?? {} });
  });
  return operations;
}

const get = (path: string, cookie = testSession) =>
  router.fetch(new Request(new URL(path, origin), { headers: cookie ? { cookie } : {} }));

const post = (path: string, body: string) =>
  router.fetch(
    new Request(new URL(path, origin), {
      method: 'POST',
      body: new URLSearchParams(body),
      headers: { cookie: testSession, origin },
    })
  );

const siteSettings = {
  id: 'site',
  siteTitle: 'High for This',
  tagline: 'Music, live',
  siteUrl: 'https://highforthis.com',
  emailAddress: 'hello@example.com',
  language: 'en-US',
  copyrightText: '© High for This',
};

const storage = 'https://storage.googleapis.com/wonderboymusic';

describe('admin settings', () => {
  beforeEach(() => {
    process.env.TOKEN_SECRET = testSecret;
  });
  afterEach(() => {
    delete process.env.TOKEN_SECRET;
  });

  it('sends someone who is signed out to the login page', async (t) => {
    stubGraphQL(t);
    const response = await get('/admin/settings', '');
    assert.equal(response.status, 302);
  });

  it('shows the general settings at /settings and /settings/site', async (t) => {
    stubGraphQL(t, { SiteSettings: { siteSettings } });
    for (const path of ['/admin/settings', '/admin/settings/site']) {
      const html = await (await get(path)).text();
      assert.match(html, /<h1[^>]*>General Settings<\/h1>/);
      assert.match(html, /<input type="text" name="siteTitle" value="High for This"/);
      assert.match(html, /<input type="url" name="siteUrl" value="https:\/\/highforthis.com"/);
      assert.match(html, /<input type="email" name="emailAddress" value="hello@example.com"/);
      assert.match(html, /<option value="en-US" selected>English \(United States\)<\/option>/);
      assert.match(html, /<button type="submit"[^>]*>Update Settings<\/button>/);
    }
  });

  it('saves the general settings, keeping every field a string and clearing empty ones', async (t) => {
    const operations = stubGraphQL(t, {
      UpdateSiteSettings: { updateSiteSettings: { id: 'site' } },
    });
    const response = await post('/admin/settings', 'siteTitle=1999&tagline=&copyrightText=2024');
    assert.equal(response.status, 303);
    assert.equal(
      response.headers.get('location'),
      'http://localhost/admin/settings?message=updated'
    );
    assert.deepEqual(operations, [
      {
        operationName: 'UpdateSiteSettings',
        variables: { id: 'site', input: { siteTitle: '1999', tagline: '', copyrightText: '2024' } },
      },
    ]);
  });

  it('shows the crop sizes, one row each', async (t) => {
    stubGraphQL(t, {
      MediaSettings: {
        mediaSettings: {
          id: 'media',
          crops: [
            { name: 'thumbnail', width: 150, height: 150 },
            { name: 'wide', width: 1200, height: null },
          ],
        },
      },
    });
    const html = await (await get('/admin/settings/media?message=updated')).text();
    assert.match(html, /<h1[^>]*>Media Settings<\/h1>/);
    // The inputs are uncontrolled, so their values come last
    assert.match(html, /<input type="text" name="crops\[0\]\[name\]"[^>]*value="thumbnail"/);
    assert.match(html, /<input type="number" name="crops\[0\]\[width\]"[^>]*value="150"/);
    assert.match(html, /<input type="number" name="crops\[1\]\[width\]"[^>]*value="1200"/);
    assert.match(html, /<input type="number" name="crops\[1\]\[height\]"[^>]*value=""/);
    assert.match(html, /Add Crop/);
    assert.match(html, /Settings Updated\./);
  });

  it('saves the crop sizes, leaving out rows without a name', async (t) => {
    const operations = stubGraphQL(t, {
      UpdateMediaSettings: { updateMediaSettings: { id: 'media' } },
    });
    const response = await post(
      '/admin/settings/media',
      [
        'crops[0][name]=300&crops[0][width]=300&crops[0][height]=300',
        'crops[1][name]=&crops[1][width]=10&crops[1][height]=',
        'crops[2][name]=+wide+&crops[2][width]=1200&crops[2][height]=',
      ].join('&')
    );
    assert.equal(
      response.headers.get('location'),
      'http://localhost/admin/settings/media?message=updated'
    );
    assert.deepEqual(operations, [
      {
        operationName: 'UpdateMediaSettings',
        variables: {
          id: 'media',
          input: {
            crops: [
              { name: '300', width: 300, height: 300 },
              { name: 'wide', width: 1200, height: null },
            ],
          },
        },
      },
    ]);
  });

  it('shows the podcast settings with the podcast image', async (t) => {
    stubGraphQL(t, {
      PodcastSettings: {
        podcastSettings: {
          id: 'podcast',
          title: 'High for This',
          description: 'A podcast',
          managingEditor: 'Scott',
          copyrightText: null,
          websiteLink: null,
          feedLink: null,
          itunesName: null,
          itunesEmail: null,
          generator: null,
          language: 'en-US',
          explicit: 'false',
          category: 'Music',
          image: {
            id: 'm1',
            destination: '2024/07',
            fileName: 'cover.jpg',
            type: 'image',
            crops: [{ fileName: 'cover-300.jpg', width: 300 }],
          },
        },
      },
    });
    const html = await (await get('/admin/settings/podcast')).text();
    assert.match(html, /<h1[^>]*>Podcast Settings<\/h1>/);
    assert.match(html, /<input type="text" name="title" value="High for This"/);
    assert.match(html, /<input type="text" name="explicit" value="false"/);
    assert.match(html, /<input type="text" name="category" value="Music"/);
    assert.match(html, /<input type="hidden" name="image" value="m1"/);
    assert.ok(html.includes(`src="${storage}/2024/07/cover-300.jpg"`));
    assert.match(html, /Set Podcast Image/);
  });

  it('saves the podcast settings, keeping "explicit" a string', async (t) => {
    const operations = stubGraphQL(t, {
      UpdatePodcastSettings: { updatePodcastSettings: { id: 'podcast' } },
    });
    await post(
      '/admin/settings/podcast',
      'title=High+for+This&explicit=false&image=m2&generator=1'
    );
    assert.deepEqual(operations, [
      {
        operationName: 'UpdatePodcastSettings',
        variables: {
          id: 'podcast',
          input: { title: 'High for This', explicit: 'false', image: 'm2', generator: '1' },
        },
      },
    ]);
  });

  it('says so when a save fails', async (t) => {
    stubGraphQL(t);
    const response = await post('/admin/settings/site', 'siteTitle=Anything');
    assert.equal(
      response.headers.get('location'),
      'http://localhost/admin/settings/site?saveFailed=1'
    );
  });
});
