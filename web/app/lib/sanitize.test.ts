import * as assert from 'remix/assert';
import { describe, it } from 'remix/test';

import { sanitizeInlineHTML } from './sanitize.ts';

describe('sanitizeInlineHTML', () => {
  it('keeps links, line breaks, emphasis and character references', () => {
    const footer =
      '© High For This <a class="text-pink underline" href="https://youtube.com/@highforthisnyc">@highforthisnyc</a>.<br />Made in <strong>Bushwick</strong> &amp; <em>Brooklyn</em> &#xA9;';
    assert.equal(
      sanitizeInlineHTML(footer),
      '© High For This <a class="text-pink underline" href="https://youtube.com/@highforthisnyc">@highforthisnyc</a>.<br>Made in <strong>Bushwick</strong> &amp; <em>Brooklyn</em> &#xA9;'
    );
  });

  it('drops scripts, handlers and other tags, keeping their text escaped', () => {
    assert.equal(sanitizeInlineHTML('<script>alert(1)</script>'), 'alert(1)');
    assert.equal(sanitizeInlineHTML('<img src=x onerror=alert(1)>hi'), 'hi');
    assert.equal(
      sanitizeInlineHTML('<a href="https://x.test" onclick="alert(1)">x</a>'),
      '<a href="https://x.test">x</a>'
    );
    assert.equal(sanitizeInlineHTML('<iframe src="https://evil.test"></iframe>'), '');
    assert.equal(sanitizeInlineHTML('<svg onload=alert(1)>'), '');
  });

  it('keeps only web, mail and same-site links', () => {
    // Built up, so the lint rule against script URLs leaves them be
    const script = 'javascript';
    for (const href of [
      `${script}:alert(1)`,
      ` ${script}:alert(1)`,
      `${script.toUpperCase()}:alert(1)`,
      `${script}&colon;alert(1)`,
      'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
      '//evil.test',
      'vbscript:x',
    ]) {
      assert.equal(sanitizeInlineHTML(`<a href="${href}">x</a>`), '<a>x</a>', href);
    }
    assert.equal(sanitizeInlineHTML("<a href='/shows'>x</a>"), '<a href="/shows">x</a>');
    assert.equal(
      sanitizeInlineHTML('<a href="mailto:a@b.test">x</a>'),
      '<a href="mailto:a@b.test">x</a>'
    );
  });

  it('escapes anything that would break out of the markup it builds', () => {
    assert.equal(sanitizeInlineHTML('1 < 2 > 0 & "q"'), '1 &lt; 2 &gt; 0 &amp; &quot;q&quot;');
    assert.equal(
      sanitizeInlineHTML(
        '<a title="&quot; onmouseover=&quot;alert(1)" href="https://x.test">x</a>'
      ),
      '<a title="&quot; onmouseover=&quot;alert(1)" href="https://x.test">x</a>'
    );
    assert.equal(sanitizeInlineHTML('<a href="https://x.test>y">z</a>'), '<a>y&quot;&gt;z</a>');
    assert.equal(
      sanitizeInlineHTML('<<script>script>alert(1)<</script>/script>'),
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    );
  });

  it('closes what it opens, and ignores closing tags nothing opened', () => {
    assert.equal(sanitizeInlineHTML('<strong><em>x</strong>'), '<strong><em>x</em></strong>');
    assert.equal(sanitizeInlineHTML('<a href="/x">open'), '<a href="/x">open</a>');
    assert.equal(sanitizeInlineHTML('</strong>x</a>'), 'x');
  });
});
