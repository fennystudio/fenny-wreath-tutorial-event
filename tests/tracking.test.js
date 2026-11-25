const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tracking.json'), 'utf8'));

function run(search = '') {
  const links = manifest.buttons.map(b => ({
    dataset: { trackId: b.id, trackLabel: b.label, trackPosition: b.position }, href: b.url
  }));
  const listeners = {};
  let visibility;
  let loaded;
  const context = {
    URLSearchParams, Date, Set,
    location: { search, href: manifest.page_url + search },
    IntersectionObserver: function (callback) {
      visibility = callback;
      this.observe = () => {};
      this.unobserve = () => {};
    },
    document: {
      createElement: () => ({}),
      head: { appendChild: tag => { loaded = tag.src; } },
      addEventListener: (name, callback) => { listeners[name] = callback; },
      querySelectorAll: () => links
    }
  };
  context.window = context;
  vm.runInNewContext(fs.readFileSync(path.join(root, 'analytics.js'), 'utf8'), context);
  return { context, links, listeners, visibility, loaded,
    events: () => context.dataLayer.filter(x => x[0] === 'event').map(x => x[1]) };
}

test('every outbound link has a unique stable ID and a manifest entry', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const anchors = [...html.matchAll(/<a\b[^>]*>/g)].map(x => x[0]);
  assert.equal(anchors.length, 2);
  assert.equal(manifest.buttons.length, anchors.length);
  assert.equal(new Set(manifest.buttons.map(b => b.id)).size, anchors.length);
  for (const b of manifest.buttons) {
    const anchor = anchors.find(a => a.includes(`data-track-id="${b.id}"`));
    assert.ok(anchor, b.id);
    assert.ok(anchor.includes(`data-track-position="${b.position}"`));
    assert.ok(anchor.includes(`href="${b.url}"`));
  }
  assert.match(html, /<script defer src="analytics\.js\?v=20261125"><\/script>/);
});

test('all 2 real click handlers send distinct events without blocking links', () => {
  const state = run();
  assert.match(state.loaded, /gtag\/js\?id=G-FEYLE5FWZZ$/);
  assert.ok(state.events().includes('wreath_event_view'));
  for (const link of state.links) {
    state.listeners.click({ target: { closest: () => link },
      preventDefault: () => assert.fail('navigation blocked') });
    assert.ok(state.events().includes('wreath_event_click_' + link.dataset.trackId));
  }
  assert.equal(state.events().filter(n => n.startsWith('wreath_event_click_')).length, 2);
});

test('QA visits and clicks never enter the production event namespace', () => {
  const state = run('?fenny_qa=1&qa_run=smoke23');
  state.listeners.click({ target: { closest: () => state.links[0] } });
  assert.ok(state.events().every(n => n.startsWith('wreath_event_qa_smoke23_')));
  const config = state.context.dataLayer.find(x => x[0] === 'config')[2];
  assert.equal(config.send_page_view, false);
});

test('visible impressions deduplicate; right clicks are ignored, middle clicks count', () => {
  const state = run();
  const link = state.links[0];
  const entry = { target: link, isIntersecting: true, intersectionRatio: 0.8 };
  state.visibility([entry, entry]);
  assert.equal(state.events().filter(n => n === 'wreath_event_seen_b01').length, 1);
  state.listeners.auxclick({ type: 'auxclick', button: 2, target: { closest: () => link } });
  assert.equal(state.events().filter(n => n === 'wreath_event_click_b01').length, 0);
  state.listeners.auxclick({ type: 'auxclick', button: 1, target: { closest: () => link } });
  assert.equal(state.events().filter(n => n === 'wreath_event_click_b01').length, 1);
});

test('event copy carries no shop or kit purchase links', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.doesNotMatch(html, /flowers\.fenny-studio\.com/);
  assert.doesNotMatch(html, /購買|材料包/);
  assert.equal((html.match(/<section class="step" id="step-\d+">/g) || []).length, 9);
});
