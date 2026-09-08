// Run with Node.js 18 or newer: node scripts/test-language-navigation.cjs
// Uses Node built-ins only; the working directory may be outside the repository.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'site.js'), 'utf8');
let checks = 0;

// Execute the full site.js with only the DOM surface needed for the language
// switch. Real page language and alternate URLs are read from repository HTML.
// This tests URL/event behavior, not browser layout, navigation or rendering.
class Element extends EventTarget {
  constructor(tag) {
    super();
    this.tagName = tag;
    this.attributes = new Map();
    this.children = [];
    this.classList = { add() {}, remove() {}, contains() { return false; }, toggle() {} };
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  removeAttribute(name) { this.attributes.delete(name); }
  set href(value) { this.setAttribute('href', value); }
  get href() { return this.getAttribute('href'); }
  set innerHTML(value) {
    this.children = Array.from(value.matchAll(/<a\b([^>]*)>/g), ([, attributes]) => {
      const link = new Element('a');
      for (const [, name, value] of attributes.matchAll(/([\w-]+)="([^"]*)"/g)) link.setAttribute(name, value);
      return link;
    });
  }
  querySelector(selector) {
    if (selector === ':scope > nav') return this.navigation;
    if (selector === '.header-inner') return this.inner;
    const language = selector.match(/\[hreflang="([^"]+)"\]/)?.[1];
    if (language) return this.children.find(link => link.getAttribute('hreflang') === language) ?? null;
    return null;
  }
  querySelectorAll() { return []; }
  insertBefore(child) { this.children.push(child); }
  appendChild(child) { this.children.push(child); }
  contains(child) { return this.children.includes(child); }
}

function page(relativeFile, initialUrl) {
  const html = fs.readFileSync(path.join(root, relativeFile), 'utf8');
  const header = new Element('header');
  header.inner = new Element('div');
  header.inner.navigation = new Element('nav');
  const alternates = new Map(Array.from(html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g), ([, language, href]) => [language, { href }]));
  const document = new EventTarget();
  document.documentElement = { lang: html.match(/<html lang="([^"]+)"/)[1] };
  document.querySelector = selector => alternates.get(selector.match(/hreflang="([^"]+)"/)?.[1]) ?? null;
  document.querySelectorAll = selector => selector === '.site-header' ? [header] : [];
  document.createElement = tag => new Element(tag);
  const window = new EventTarget();
  window.location = new URL(initialUrl);
  window.matchMedia = () => ({ matches: true, addEventListener() {} });
  window.clearTimeout = clearTimeout;
  window.setTimeout = setTimeout;
  vm.runInNewContext(source, { document, window, URL }, { filename: 'site.js' });
  const languageSwitch = header.inner.children.find(child => child.className === 'site-language-switch');
  assert.ok(languageSwitch, 'site.js creates the language switch');
  return {
    navigate(url, eventType) {
      window.location = new URL(url, window.location);
      window.dispatchEvent(new Event(eventType));
    },
    expect(language, expected, label) {
      const actual = languageSwitch.querySelector(`[hreflang="${language}"]`).getAttribute('href');
      assert.equal(actual, expected, label);
      checks++;
      console.log(`PASS ${label}`);
    },
  };
}

const en = page('solutions/index.html', 'https://xilume.co/solutions/?src=email&filter=a%26b#embedded-can-fd-expansion');
en.expect('zh-CN', '/zh-cn/solutions/?src=email&filter=a%26b#embedded-can-fd-expansion', 'initial English page preserves encoded query and hash');
en.navigate('#external-usb-expansion', 'hashchange');
en.expect('zh-CN', '/zh-cn/solutions/?src=email&filter=a%26b#external-usb-expansion', 'in-page anchor change updates the Chinese target');
en.expect('en', '/solutions/?src=email&filter=a%26b#external-usb-expansion', 'current-language link also follows the new anchor');
en.navigate('/solutions/?src=history#can-fd-serial-expansion', 'popstate');
en.expect('zh-CN', '/zh-cn/solutions/?src=history#can-fd-serial-expansion', 'back/forward popstate reads the current query and hash');
en.navigate('/solutions/?src=query-only', 'popstate');
en.expect('zh-CN', '/zh-cn/solutions/?src=query-only', 'query-only history change clears the previous hash');
en.navigate('/solutions/', 'popstate');
en.expect('zh-CN', '/zh-cn/solutions/', 'history restoration without query or hash clears both');

const zh = page('zh-cn/solutions/index.html', 'https://xilume.co/zh-cn/solutions/?view=compact#embedded-can-fd-expansion');
zh.expect('en', '/solutions/?view=compact#embedded-can-fd-expansion', 'initial Chinese page preserves query and hash');
zh.navigate('#interface-ic-integration', 'hashchange');
zh.expect('en', '/solutions/?view=compact#interface-ic-integration', 'Chinese in-page anchor change updates the English target');
zh.navigate('/zh-cn/solutions/?view=full#external-usb-expansion', 'popstate');
zh.expect('en', '/solutions/?view=full#external-usb-expansion', 'Chinese history restoration preserves current query and hash');

const tracebox = page('downloads/tracebox-analyzer-pro/index.html', 'https://xilume.co/downloads/tracebox-analyzer-pro/?source=downloads#workflow');
tracebox.expect('zh-CN', '/zh-cn/downloads/', 'untranslated TraceBox falls back without its page-specific suffix');
tracebox.navigate('#requirements', 'hashchange');
tracebox.expect('zh-CN', '/zh-cn/downloads/', 'untranslated fallback remains clean after an anchor change');
tracebox.navigate('?source=history#release-notes', 'popstate');
tracebox.expect('zh-CN', '/zh-cn/downloads/', 'untranslated fallback remains clean after a history change');
console.log(`PASS ${checks} assertions. Scope: full script in isolated minimal DOM; real browser interactions are separate.`);
