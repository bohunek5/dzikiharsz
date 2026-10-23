/** Local, dependency-free translations. Polish remains the canonical DOM source. */
export const supportedLanguages = Object.freeze(['pl', 'de', 'en', 'lt', 'hu', 'cs', 'sk']);
const storageKey = 'dziki-harsz-language';
const ignored = 'script,style,noscript,code,pre,textarea,[data-no-translate],[translate="no"]';
const attributes = ['aria-label', 'aria-description', 'title', 'placeholder', 'alt'];
const originals = new WeakMap();
const dictionaries = new Map();
let language = 'pl';
let dictionary = {};
let observer;
let initialized = false;
let scheduled = false;
let request = 0;

const normalize = value => String(value).replace(/\s+/gu, ' ').trim();
const excluded = node => Boolean((node.nodeType === 1 ? node : node.parentElement)?.closest(ignored));
function message(key, count) {
  const forms = dictionary._messages?.[key];
  if (!forms) return null;
  const category = new Intl.PluralRules(language).select(Number(count));
  return (typeof forms === 'string' ? forms : forms[category] || forms.other || forms.one).replaceAll('{count}', String(count));
}
function core(source) {
  if (language === 'pl' || !source) return source;
  if (Object.hasOwn(dictionary, source)) return dictionary[source];
  let match = source.match(/^W menu: (\d+) produkt(?:y|ów)?$/u);
  if (match) return message('menu', match[1]) || source;
  match = source.match(/^Twoja paczka: (\d+) produktów$/u);
  if (match) return message('bag', match[1]) || source;
  match = source.match(/^(\d+) sztuk \/ porcja$/u);
  if (match) return message('pieces', match[1]) || source;
  match = source.match(/^(\d+) (porcji|szt\.)$/u);
  if (match) return message(match[2] === 'porcji' ? 'portions' : 'items', match[1]) || source;
  const prefixes = ['Zobacz:', 'Szybki podgląd:', 'Dodaj do swojej paczki:', 'Zwiększ ilość:', 'Zmniejsz ilość:', 'Usuń z paczki:', 'Zapisano na liście:', 'W Twojej paczce:'];
  for (const prefix of prefixes) {
    if (source.startsWith(prefix + ' ')) return (dictionary[prefix] || prefix) + ' ' + core(source.slice(prefix.length + 1));
  }
  // Only well-defined UI delimiters are split: never mutate URLs or arbitrary prose.
  for (const delimiter of [' · ', ' — ']) {
    if (source.includes(delimiter)) return source.split(delimiter).map(core).join(delimiter);
  }
  match = source.match(/^(.*?)(\s*[↗↑↓+])$/u);
  if (match && match[1]) return core(match[1].trimEnd()) + match[2];
  match = source.match(/^(·\s*)(.*)$/u);
  if (match) return match[1] + core(match[2]);
  return source;
}
/** Translate a Polish string; unknown strings safely retain their source. */
export function t(polishText) {
  const source = String(polishText ?? '');
  if (!source.trim() || language === 'pl') return source;
  const prefix = source.match(/^\s*/u)[0];
  const suffix = source.match(/\s*$/u)[0];
  return prefix + core(normalize(source)) + suffix;
}
export function getLanguage() { return language; }

function update(node, key, current, write) {
  let values = originals.get(node);
  if (!values) { values = new Map(); originals.set(node, values); }
  let record = values.get(key);
  // app.js may reuse an existing node for a different product, quantity or status.
  if (!record || current !== record.last) record = { source: current, last: current };
  const translated = t(record.source);
  if (current !== translated) write(translated);
  record.last = translated;
  values.set(key, record);
}
function translateElement(element) {
  if (excluded(element)) return;
  for (const name of attributes) {
    if (element.hasAttribute(name)) update(element, name, element.getAttribute(name), value => element.setAttribute(name, value));
  }
  if (element.matches('meta[name="description"],meta[property="og:title"],meta[property="og:description"],meta[name="twitter:title"],meta[name="twitter:description"]')) {
    update(element, 'content', element.getAttribute('content') || '', value => element.setAttribute('content', value));
  }
}
function observe() {
  if (observer && document.documentElement) observer.observe(document.documentElement, {
    subtree: true, childList: true, characterData: true, attributes: true,
    attributeFilter: [...attributes, 'content']
  });
}
/** Preserve markup, listeners and original Polish values while translating text. */
export function translate(root = document.body) {
  if (!root) return;
  observer?.disconnect();
  try {
    if (root.nodeType === 3) {
      if (!excluded(root)) update(root, 'text', root.data, value => { root.data = value; });
      return;
    }
    if (root.nodeType === 1) translateElement(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode(node) { return excluded(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
    });
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.nodeType === 3) update(node, 'text', node.data, value => { node.data = value; });
      else translateElement(node);
    }
    if (document.head && root !== document.head) {
      document.head.querySelectorAll('meta[content]').forEach(translateElement);
      const title = document.head.querySelector('title');
      if (title && !excluded(title)) for (const node of title.childNodes) {
        if (node.nodeType === 3) update(node, 'text', node.data, value => { node.data = value; });
      }
    }
  } finally { observe(); }
}

async function load(code) {
  if (code === 'pl') return {};
  if (!dictionaries.has(code)) {
    const url = new URL(`../data/locales/${code}.json`, import.meta.url);
    url.searchParams.set('v', '20261023-menu');
    const pending = fetch(url).then(response => {
      if (!response.ok) throw new Error(`Translation ${code}: HTTP ${response.status}`);
      return response.json();
    }).then(value => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`Invalid translations: ${code}`);
      return value;
    }).catch(error => { dictionaries.delete(code); throw error; });
    dictionaries.set(code, pending);
  }
  return dictionaries.get(code);
}
/** Resolves to the active code. Failed requests preserve the current language. */
export async function setLanguage(code) {
  const next = supportedLanguages.includes(code) ? code : 'pl';
  const ticket = ++request;
  const nextDictionary = await load(next);
  if (ticket !== request) return language;
  language = next; dictionary = nextDictionary;
  document.documentElement.lang = language;
  try { localStorage.setItem(storageKey, language); } catch { /* Session-only preference. */ }
  document.querySelectorAll('#language-select,#mobile-language-select').forEach(select => { select.value = language; });
  translate();
  window.dispatchEvent(new CustomEvent('languagechange', { detail: { language } }));
  return language;
}
/** Call once after the DOM exists; select wiring also works if it is added later. */
export async function initI18n() {
  if (!initialized) {
    initialized = true;
    observer = new MutationObserver(records => {
      if (scheduled || !records.some(record => !excluded(record.target))) return;
      scheduled = true;
      queueMicrotask(() => { scheduled = false; translate(); });
    });
    observe();
    document.addEventListener('change', event => {
      if (!['language-select', 'mobile-language-select'].includes(event.target?.id)) return;
      const attempted = event.target.value;
      setLanguage(attempted).catch(error => {
        event.target.value = language;
        window.dispatchEvent(new CustomEvent('languageerror', { detail: { language: attempted, message: error.message } }));
      });
    });
  }
  let preferred = 'pl';
  try { preferred = localStorage.getItem(storageKey) || 'pl'; } catch { /* Default Polish. */ }
  try { return await setLanguage(preferred); }
  catch { return setLanguage('pl'); }
}
