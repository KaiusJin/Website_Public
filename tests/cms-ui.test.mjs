import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement, StrictMode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
import { copy } from '../src/journey/i18n/copy.js';

let server;
before(async () => {
  server = await createServer({
    configFile: false, appType: 'custom',
    server: { middlewareMode: true, hmr: false, ws: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
    resolve: { alias: [
      {find: /^.*\/hooks\/useCMSData(?:\.js)?$/, replacement: fileURLToPath(new URL('./fixtures/cms-hook.js', import.meta.url))},
      {find: 'react-dom/client', replacement: fileURLToPath(new URL('./fixtures/react-root.js', import.meta.url))},
    ] },
  });
});
after(async () => { await server?.close(); delete globalThis.__cmsRows; delete globalThis.__entryTree; });
const render = async (file, props) => {
  const { default: Component } = await server.ssrLoadModule(file);
  return renderToStaticMarkup(createElement(Component, props));
};
const emptyData = () => Object.fromEntries(['projects','work_experiences','club_experiences','volunteer_experiences','skills','awards','site_profile','personal_entries','journey_scene_content'].map(table => [table, []]));
const panel = (section, data, failedTables = []) => render('/src/journey/components/ContentPanel.jsx', {
  section, content: { data, loading: false, failedTables, retry() {} }, lang: 'en', t: copy.en,
});

test('both entry routes construct a StrictMode root with valid imports', async () => {
  globalThis.document = { getElementById: () => ({}) };
  try {
    for (const route of ['/', '/journey']) {
      globalThis.window = { location: { pathname: route } };
      await server.ssrLoadModule(`/src/main.jsx?route=${encodeURIComponent(route)}`);
      assert.equal(globalThis.__entryTree.type, StrictMode);
    }
  } finally { delete globalThis.window; delete globalThis.document; }
});

test('classic renders CMS profile, project dates, categorized experience and saved icons', async () => {
  const data = emptyData();
  data.site_profile = [{heading:'CMS HEADING',intro:'CMS INTRO',bio:'CMS BIO',location:'CMS CITY',email:'cms@example.test',github:'https://example.test/github',linkedin:'https://example.test/linkedin',resume_url:'https://example.test/resume.pdf'}];
  data.projects = [{id:'project',title:'CMS PROJECT',start_date:'Jan 2025',is_present:true,skills:[],bullets:[]}];
  data.work_experiences = [{id:'work',title:'CMS WORK',role_icon:'fas fa-server'}];
  data.club_experiences = [{id:'club',title:'CMS CLUB',role_icon:'fas fa-code'}];
  data.volunteer_experiences = [{id:'volunteer',title:'CMS VOLUNTEER',role_icon:'fas fa-cloud'}];
  data.skills = [{id:'skills',category:'CMS SKILLS',category_icon:'fas fa-microchip',skills:[]}];
  globalThis.__cmsRows = data;
  const html = await render('/src/App.jsx', {});
  for (const text of ['CMS HEADING','CMS INTRO','CMS BIO','CMS CITY','mailto:cms@example.test','https://example.test/resume.pdf','Jan 2025 — Present','Clubs &amp; Design Teams','Volunteer Experience','fas fa-microchip','fas fa-server']) assert.ok(html.includes(text), text);
  assert.ok(!html.includes('kaius.jin@outlook.com'));
});

test('cleared profile fields do not resurrect defaults in either frontend', async () => {
  const data = emptyData();
  data.site_profile = [{heading:'',intro:'',bio:'',location:null,email:null,github:'',linkedin:'',resume_url:''}];
  globalThis.__cmsRows = data;
  const classic = await render('/src/App.jsx', {});
  const journey = await panel('contact', data);
  for (const html of [classic, journey]) {
    assert.ok(!html.includes('mailto:'));
    assert.ok(!html.includes('https://github.com/KaiusJin'));
    assert.ok(!html.includes('https://www.linkedin.com/in/kaixuan-jin/'));
  }
  assert.ok((await panel('contact', emptyData())).includes('mailto:kaius.jin@outlook.com'));
});

test('personal_entries failures show retry, not the empty journal state', async () => {
  const html = await panel('personal', emptyData(), ['personal_entries']);
  assert.ok(html.includes('role="alert"'));
  assert.ok(html.includes(copy.en.retry));
  assert.ok(!html.includes(copy.en.emptyNotes));
});

