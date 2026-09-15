import test from 'node:test';
import assert from 'node:assert/strict';
import {joystickVector,resolveAxes,landingTarget} from '../src/journey/game/motion.js';
import {localize,safeUrl,visibleItems,deriveSkills} from '../src/journey/data/content.js';
import {regions,REGION_WIDTH} from '../src/journey/data/regions.js';
import {copy} from '../src/journey/i18n/copy.js';
test('joystick dead zone avoids drift; extreme diagonal gestures remain bounded',()=>{
 assert.deepEqual(joystickVector(2,2),{x:0,y:0});
 for(const [x,y] of [[400,400],[-500,6],[0,-800],[25,30]]){const v=joystickVector(x,y);assert.ok(Math.hypot(v.x,v.y)<=1.000001);assert.equal(Math.sign(v.x),Math.sign(x));}
});
test('mixed keyboard and touch cannot create diagonal speed advantage',()=>{
 assert.deepEqual(resolveAxes({x:1,y:0},{x:-1,y:0}),{x:0,y:0});
 assert.ok(Math.abs(Math.hypot(...Object.values(resolveAxes({x:1,y:1},{x:1,y:1})))-1)<1e-8);
});
test('landing clamps targets at both edges of a long world',()=>{
 assert.deepEqual(landingTarget(-999,16800,637),{x:100,y:637});
 assert.deepEqual(landingTarget(19000,16800,637),{x:16700,y:637});
});
test('partial translations preserve stable identity and English fallback',()=>{
 const row={id:'real',title:'Source',bullets:[{text:'English'}],translations:{'zh-CN':{id:'bad',title:'译文',bullets:[],role:''}}};
 assert.deepEqual(localize(row,'zh-CN').bullets,[{text:'English'}]);assert.equal(localize(row,'zh-CN').id,'real');assert.equal(localize(row,'en').title,'Source');
});
test('private and draft rows are excluded; source records are not mutated',()=>{
 const rows=[{id:1,visibility:'private',order:0},{id:2,visibility:'public',order:2},{id:3,visibility:'draft'},{id:4,visibility:'public',order:1}];
 assert.deepEqual(visibleItems(rows).map(r=>r.id),[4,2]);assert.equal(rows[0].id,1);
});
test('untrusted links cannot execute code or open data documents',()=>{
 for(const url of ['javascript:alert(1)','data:text/html,hi','file:///etc/passwd',''])assert.equal(safeUrl(url),null);
 assert.equal(safeUrl('https://example.com/project'),'https://example.com/project');assert.equal(safeUrl('mailto:a@example.com',{email:true}),'mailto:a@example.com');
});
test('seven chapters are continuous and every displayed UI key has both languages',()=>{
 assert.equal(regions.length,7);regions.forEach((r,i)=>{assert.equal(r.x,i*REGION_WIDTH);assert.ok(r.anchor>0&&r.anchor<REGION_WIDTH);assert.ok(copy.en[r.section]);});
 assert.deepEqual(Object.keys(copy.en).sort(),Object.keys(copy['zh-CN']).sort());
});
test('empty skill table can display only technologies evidenced in public records',()=>{
 assert.deepEqual(deriveSkills([{skills:[{tag:'Python'},{tag:'Java'}]}],[{skills:[{tag:'Python'}]}]),['Python','Java']);
});
