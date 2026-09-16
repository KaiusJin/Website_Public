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
const panel = (section, data, failedTables = [], extra = {}) => render('/src/journey/components/ContentPanel.jsx', {
  section, content: { data, loading: false, failedTables, retry() {} }, lang: 'en', t: copy.en, ...extra,
});

test('both entry routes construct a StrictMode root with valid imports', async () => {
  globalThis.document = { getElementById: () => ({}) };
  try {
    for (const route of ['/', '/journey']) {
      globalThis.window = { location: { pathname: route } };
      await server.ssrLoadModule(`/src/main.jsx?route=${encodeURIComponent(route)}`);
      assert.equal(globalThis.__entryTree.type, StrictMode);
      const fallback = globalThis.__entryTree.props.children.props.fallback;
      assert.equal(fallback.props['data-entry'], route === '/' ? 'classic' : 'journey');
      assert.equal(fallback.props.children, route === '/' ? 'Loading portfolio…' : 'Loading Kaius’s Journey…');
    }
  } finally { delete globalThis.window; delete globalThis.document; }
});

test('classic renders CMS profile, project dates, categorized experience and saved icons', async () => {
  const data = emptyData();
  data.site_profile = [{name:'CMS NAME',hero_badge:'CMS BADGE',hero_tags:['CMS TAG'],heading:'CMS HEADING',intro:'CMS INTRO',bio:'CMS BIO',location:'CMS CITY',education:'CMS SCHOOL',focus_areas:'CMS FOCUS',email:'cms@example.test',github:'https://example.test/github',linkedin:'https://example.test/linkedin',resume_url:'https://example.test/resume.pdf',contact_slogans:['CMS SLOGAN']}];
  data.projects = [{id:'project',title:'CMS PROJECT',start_date:'Jan 2025',is_present:true,skills:[],bullets:[]}];
  data.work_experiences = [{id:'work',title:'CMS WORK',role_icon:'fas fa-server'}];
  data.club_experiences = [{id:'club',title:'CMS CLUB',role_icon:'fas fa-code'}];
  data.volunteer_experiences = [{id:'volunteer',title:'CMS VOLUNTEER',role_icon:'fas fa-cloud'}];
  data.skills = [{id:'skills',category:'CMS SKILLS',category_icon:'fas fa-microchip',skills:[]}];
  globalThis.__cmsRows = data;
  const html = await render('/src/App.jsx', {});
  for (const text of ['CMS NAME','CMS BADGE','CMS TAG','CMS HEADING','CMS INTRO','CMS BIO','CMS CITY','CMS SCHOOL','CMS FOCUS','CMS SLOGAN','mailto:cms@example.test','https://example.test/resume.pdf','Jan 2025 — Present','Clubs &amp; Design Teams','Volunteer Experience','fas fa-microchip','fas fa-server']) assert.ok(html.includes(text), text);
  assert.ok(!html.includes('kaius.jin@outlook.com'));
});

test('cleared and missing profile fields do not resurrect static copy', async () => {
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
  assert.ok(!(await panel('contact', emptyData())).includes('mailto:'));
});

test('Journey profile and contact text come from the selected database locale', async () => {
  const data = emptyData();
  data.site_profile = [{id:'profile',location:'CMS CITY',email:'cms@example.test',journey_en:{focus:'EN FOCUS',heading:'EN HEADING',intro:'EN INTRO',bio:'EN BIO',education_school:'EN SCHOOL',education_field:'EN FIELD',location_detail:'EN DETAIL',contact_heading:'EN CONTACT',contact_intro:'EN INVITE',contact_outro:'EN CLOSING'},journey_zh:{focus:'ZH FOCUS',heading:'ZH HEADING',intro:'ZH INTRO',bio:'ZH BIO',education_school:'ZH SCHOOL',education_field:'ZH FIELD',location_detail:'ZH DETAIL',contact_heading:'ZH CONTACT',contact_intro:'ZH INVITE',contact_outro:'ZH CLOSING'}}];
  const enAbout = await panel('about', data);
  const zhAbout = await panel('about', data, [], {lang:'zh-CN',t:copy['zh-CN']});
  const enContact = await panel('contact', data);
  const zhContact = await panel('contact', data, [], {lang:'zh-CN',t:copy['zh-CN']});
  for (const text of ['EN FOCUS','EN HEADING','EN INTRO','EN BIO','EN SCHOOL','EN FIELD','EN DETAIL']) assert.ok(enAbout.includes(text), text);
  for (const text of ['ZH FOCUS','ZH HEADING','ZH INTRO','ZH BIO','ZH SCHOOL','ZH FIELD','ZH DETAIL']) assert.ok(zhAbout.includes(text), text);
  for (const text of ['EN CONTACT','EN INVITE','EN CLOSING','mailto:cms@example.test']) assert.ok(enContact.includes(text), text);
  for (const text of ['ZH CONTACT','ZH INVITE','ZH CLOSING','mailto:cms@example.test']) assert.ok(zhContact.includes(text), text);
  assert.ok(!zhAbout.includes('EN HEADING'));
});

test('personal_entries failures show retry, not the empty journal state', async () => {
  const html = await panel('personal', emptyData(), ['personal_entries']);
  assert.ok(html.includes('role="alert"'));
  assert.ok(html.includes(copy.en.retry));
  assert.ok(!html.includes(copy.en.emptyNotes));
});

test('journey skill cards omit the redundant Skills meta label', async () => {
  const data = emptyData();
  data.skills = [{ id: 'skill', category: 'CMS SKILLS', skills: [{ tag: 'React' }] }];
  const html = await panel('skills', data);
  assert.ok(html.includes('CMS SKILLS'));
  assert.ok(html.includes('React'));
  assert.ok(!html.includes('<span>Skills</span>'));
});

test('library project entries show one project, while the map keeps the full list', async () => {
  const data = emptyData();
  data.projects = Array.from({length: 6}, (_, index) => ({id: `project-${index}`, title: `Project ${index + 1}`, description: `Detail ${index + 1}`}));
  const detail = await panel('project-detail', data, [], {projectId: 'project-1'});
  assert.ok(detail.includes('Detail 2'));
  assert.ok(!detail.includes('Detail 1'));
  assert.ok(!detail.includes('Detail 5'));
  const other = await panel('other-projects', data);
  assert.ok(other.includes('Project 5'));
  assert.ok(other.includes('Project 6'));
  assert.ok(!other.includes('Project 4'));
  const all = await panel('projects', data);
  for (let index = 1; index <= 6; index++) assert.ok(all.includes(`Project ${index}`));
});

test('experience website links use the organization name in both frontends', async () => {
  const data = emptyData();
  data.work_experiences = [
    {id:'linked',title:'Ground News',role:'Backend Engineer',link:'https://example.test/ground',link_text:'Legacy website label',bullets:[],skills:[]},
    {id:'plain',title:'No Website',role:'Developer',link:'',bullets:[],skills:[]},
  ];
  globalThis.__cmsRows = data;
  const classic = await render('/src/components/sections/Experience.jsx', {});
  const journey = await panel('work_experiences', data);
  assert.ok(classic.includes('class="timeline-title-link"'));
  assert.ok(journey.includes('class="experience-name-link"'));
  for (const html of [classic, journey]) {
    assert.ok(html.includes('href="https://example.test/ground"'));
    assert.ok(html.includes('Ground News'));
    assert.ok(html.includes('No Website'));
    assert.ok(!html.includes('Legacy website label'));
    assert.ok(!html.includes('Visit Official Website'));
  }
});
