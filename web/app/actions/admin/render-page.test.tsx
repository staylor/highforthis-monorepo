import * as assert from 'remix/assert';
import { render } from 'remix/middleware/render';
import { createRouter } from 'remix/router';
import { describe, it, type TestContext } from 'remix/test';

import { assets } from '#/assets.ts';
import { getAdminT } from '#/lib/i18n.ts';
import { graphql } from '#/middleware/app.ts';
import type { AppContext } from '#/router.ts';
import { Message } from '#/ui/admin/message.tsx';

import { renderAdminPage } from './render-page.tsx';

const origin = 'http://localhost';
const translate = getAdminT();

// Without the controllers' middleware, so no session is needed
const router = createRouter({ middleware: [graphql(), render({ assets })] });
router.get('/admin/user', (context) =>
  renderAdminPage(
    context as unknown as AppContext,
    <Message param="deleted" text="Deleted 2 users" />,
    { title: 'Users' }
  )
);

function stubAppQuery(t: TestContext) {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ data: {} }));
}

const page = async (path: string) => (await router.fetch(new URL(path, origin))).text();
const link = (html: string, href: string) =>
  html.match(new RegExp(`<a[^>]*href="${href}"[^>]*>`))?.[0];

describe('renderAdminPage', () => {
  it("renders the admin's document: title, stylesheet, and no RUM", async (t) => {
    stubAppQuery(t);
    const html = await page('/admin/user');
    assert.match(html, /<title>Users » Admin » High for This<\/title>/);
    assert.match(html, /<link rel="stylesheet" href="\/assets\/app\/styles\/public\/admin\.css/);
    assert.doesNotMatch(html, /public\/main\.css/);
    assert.doesNotMatch(html, /__OPENOBSERVE_RUM__/);
  });

  it('marks the section being viewed and lists its pages', async (t) => {
    stubAppQuery(t);
    const html = await page('/admin/user');
    assert.match(link(html, '/admin/user') ?? '', /aria-current="page"/);
    assert.ok(html.includes(translate('users.heading')));
    assert.ok(html.includes(translate('users.all')));
    assert.ok(html.includes(translate('users.add')));
    // Every section's pages are in the page, for the collapsed rail's flyouts, but only the
    // current section's are marked to show under it
    const lists = [...html.matchAll(/<ul\b[^>]*>[\s\S]*?<\/ul>/g)].map(([list]) => list);
    const openingTag = (list?: string) => list?.slice(0, list.indexOf('>')) ?? '';
    const users = lists.find((list) => list.includes(translate('users.add')));
    const posts = lists.find((list) => list.includes(translate('posts.all')));
    assert.match(openingTag(users), /data-current/);
    assert.ok(posts, "other sections' pages are there for the flyouts");
    assert.doesNotMatch(openingTag(posts), /data-current/, "and don't show under their section");
  });

  it('collapses the sidebar from a stored choice before first paint, and keeps it', async (t) => {
    stubAppQuery(t);
    const html = await page('/admin/user');
    assert.match(html, /<html[^>]*data-rmx-preserve-attrs="data-nav"/);
    assert.match(
      html,
      /localStorage\.getItem\('adminNavCollapsed'\)\)document\.documentElement\.dataset\.nav='collapsed'/
    );
    assert.match(html, /aria-expanded="true" aria-label="Collapse menu"/);
  });

  it("stays light when the public site's dark mode is on", async (t) => {
    stubAppQuery(t);
    const html = await page('/admin/user');
    // The site keeps its choice under this key and puts `dark` on <html>, which the admin has no
    // styles for
    assert.doesNotMatch(html, /darkMode/);
    assert.doesNotMatch(html, /classList/);
  });

  it('signs out with a posted form and a full page load, and opens the site in a new tab', async (t) => {
    stubAppQuery(t);
    const html = await page('/admin/user');
    assert.equal(link(html, '/admin/logout'), undefined, 'a link elsewhere could sign you out');
    assert.match(
      html,
      /<form method="post" action="\/admin\/logout" data-rmx-document[^>]*>\s*<button type="submit"/
    );
    assert.doesNotMatch(link(html, '/admin/passkeys') ?? '', /data-rmx-document/);
    assert.doesNotMatch(link(html, '/admin') ?? '', /data-rmx-document/);
    assert.match(link(html, '/') ?? '', /target="_blank"/);
  });

  it('shows a message for its query parameter, with a link that dismisses it', async (t) => {
    stubAppQuery(t);
    assert.doesNotMatch(await page('/admin/user'), /Deleted 2 users/);
    const html = await page('/admin/user?deleted=2&page=3');
    assert.match(html, /Deleted 2 users/);
    assert.match(html, /<a href="\/admin\/user\?page=3" aria-label="Dismiss"/);
  });
});
