// Inline HTML from the site settings, such as the footer's copyright, which has links and line
// breaks. Rather than strip what's dangerous, this keeps only what's known to be safe: a few
// inline tags, links to web or mail addresses, and text, which is escaped. Everything it puts
// out it builds itself, so nothing in the input reaches the page as markup.

const ALLOWED_TAGS = new Set(['a', 'b', 'br', 'em', 'i', 'strong']);
const VOID_TAGS = new Set(['br']);
const LINK_ATTRIBUTES = new Set(['href', 'class', 'title']);
const SAFE_HREF = /^(?:https?:|mailto:|\/(?!\/))/i;

const TAG = /<(\/?)([a-z]+)\b([^<>]*)>/iy;
const ENTITY = /&(?:#\d{1,7}|#x[0-9a-f]{1,6}|[a-z][a-z0-9]{1,31});/iy;
const ATTRIBUTE = /([a-z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;

const ESCAPES: Record<string, string> = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapes text, keeping character references such as `&copy;` or `&#xA9;`. */
function escape(text: string): string {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '&') {
      ENTITY.lastIndex = i;
      const entity = ENTITY.exec(text);
      if (entity) {
        out += entity[0];
        i += entity[0].length - 1;
      } else {
        out += '&amp;';
      }
    } else {
      out += ESCAPES[char] ?? char;
    }
  }
  return out;
}

function linkAttributes(source: string): string {
  let out = '';
  for (const [, name, double, single] of source.matchAll(ATTRIBUTE)) {
    const attribute = name.toLowerCase();
    const value = (double ?? single).trim();
    if (!LINK_ATTRIBUTES.has(attribute) || (attribute === 'href' && !SAFE_HREF.test(value))) {
      continue;
    }
    out += ` ${attribute}="${escape(value)}"`;
  }
  return out;
}

/** The allowed inline tags and escaped text of `html`, with every opened tag closed. */
export function sanitizeInlineHTML(html: string): string {
  let out = '';
  let text = '';
  const open: string[] = [];
  let i = 0;
  while (i < html.length) {
    if (html[i] === '<') {
      TAG.lastIndex = i;
      const tag = TAG.exec(html);
      if (tag) {
        out += escape(text);
        text = '';
        i += tag[0].length;
        const [, closing, rawName, attributes] = tag;
        const name = rawName.toLowerCase();
        if (!ALLOWED_TAGS.has(name)) {
          continue;
        }
        if (VOID_TAGS.has(name)) {
          out += closing ? '' : `<${name}>`;
        } else if (!closing) {
          out += `<${name}${name === 'a' ? linkAttributes(attributes) : ''}>`;
          open.push(name);
        } else if (open.includes(name)) {
          // Closes anything opened inside it, as a browser would
          while (open.length > 0) {
            const last = open.pop()!;
            out += `</${last}>`;
            if (last === name) {
              break;
            }
          }
        }
        continue;
      }
    }
    text += html[i];
    i += 1;
  }
  out += escape(text);
  while (open.length > 0) {
    out += `</${open.pop()}>`;
  }
  return out;
}
