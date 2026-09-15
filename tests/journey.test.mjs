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

import {neighboringRegion,arrivalPosition,LIBRARY_DOOR_X,canEnterLibrary} from '../src/journey/game/travel.js';
test('outdoor route passes the library building without entering the indoor room',()=>{
 assert.equal(neighboringRegion(2,1),4);assert.equal(neighboringRegion(4,-1),2);assert.equal(neighboringRegion(3,1),null);assert.equal(neighboringRegion(0,-1),null);assert.equal(neighboringRegion(6,1),null);
});
test('crossing a chapter boundary lands inside its destination and away from the trigger',()=>{
 for(const index of [0,1,2,4,5,6])for(const dir of [-1,1]){const x=arrivalPosition(index,dir);assert.ok(x>index*REGION_WIDTH+115&&x<(index+1)*REGION_WIDTH-115);}
});
test('library entrance requires proximity and landing',()=>{
 assert.equal(canEnterLibrary(LIBRARY_DOOR_X,637,'walking',637),true);
 assert.equal(canEnterLibrary(LIBRARY_DOOR_X,637,'flying',637),false);
 assert.equal(canEnterLibrary(LIBRARY_DOOR_X,500,'walking',637),false);
 assert.equal(canEnterLibrary(LIBRARY_DOOR_X-400,637,'walking',637),false);
});

import {damp,motionVelocity,cameraFollow} from '../src/journey/game/motion.js';
test('movement accelerates progressively and coasts after release',()=>{
 let v={x:0,y:0};v=motionVelocity(v,{x:1,y:0},'walking',true,1/60);assert.ok(v.x>0&&v.x<80);
 for(let i=0;i<40;i++)v=motionVelocity(v,{x:1,y:0},'walking',true,1/60);
 assert.ok(v.x>260&&v.x<=270);
 const coast=motionVelocity(v,{x:0,y:0},'walking',true,1/60);assert.ok(coast.x>0&&coast.x<v.x);
 const flight=motionVelocity({x:480,y:-200},{x:0,y:0},'flying',false,1/60);assert.ok(flight.x>440&&flight.y<0);
});
test('inertia has the same response at 30, 60 and 120 FPS',()=>{
 const result=fps=>{let v=0;for(let i=0;i<fps;i++)v=damp(v,480,4.8,1/fps);return v;};
 assert.ok(Math.abs(result(30)-result(120))<.001);assert.ok(Math.abs(result(60)-result(120))<.001);
});
test('direction reversal decelerates before moving the other way; camera remains bounded',()=>{
 const v=motionVelocity({x:270,y:0},{x:-1,y:0},'walking',true,1/60);assert.ok(v.x>0&&v.x<270);
 const c=cameraFollow(1200,1600,480,1000,0,2400,1/60);assert.ok(c>1200&&c<1700);
 assert.equal(damp(10,100,5,0),10);
});

import {ambienceProfile,layerPosition} from '../src/journey/game/ambience.js';
test('light parallax keeps indoor clouds and foliage off and respects reduced motion',()=>{
 assert.equal(ambienceProfile(3).cloud,0);assert.equal(ambienceProfile(3).foreground,0);
 assert.deepEqual(ambienceProfile(1,true),{cloud:0,mist:0,foreground:0,particles:0});
});
test('overlay layers move at different rates without changing the background',()=>{
 const screenTravel=rate=>(layerPosition(400,100,rate,0)-100)-layerPosition(400,0,rate,0);
 assert.ok(Math.abs(screenTravel(.22)+22)<1e-9);assert.ok(Math.abs(screenTravel(1.12)+112)<1e-9);
});

import {advanceAnimation,animationPose,spritePlacement} from '../src/journey/game/animation.js';
test('walking animation visits all eight drawings in one cycle',()=>{
 let state={clip:'walk',phase:0,elapsed:0};
 const frames=new Set();
 for(let i=0;i<60;i++){
  state=advanceAnimation(state,{speed:270,grounded:true,mode:'walking',paused:false},1/60);
  frames.add(animationPose(state).frame);
 }
 assert.equal(frames.size,8);
});
test('animation clock has consistent cadence at 30, 60 and 120 Hz and freezes during reading',()=>{
 const run=fps=>{let s={clip:'walk',phase:0,elapsed:0};for(let i=0;i<fps;i++)s=advanceAnimation(s,{speed:270,grounded:true,mode:'walking'},1/fps);return s;};
 assert.ok(Math.abs(run(30).phase-run(120).phase)<1e-8);
 const state=run(60);assert.equal(advanceAnimation(state,{paused:true},.05),state);
});
test('frame anchors remain at the same anatomical point when facing either direction',()=>{
 const f={width:400,height:450,anchorX:245,anchorY:430,referenceHeight:400};
 const right=spritePlacement(f,false,190),left=spritePlacement(f,true,190);
 assert.ok(Math.abs(right.originX+left.originX-1)<1e-8);
 assert.equal(right.originY*f.height,430);assert.equal(left.originY,right.originY);
 assert.equal(spritePlacement(f,false,190,1.003).originY,right.originY);
});

test('camera never rolls back while coasting to a stop in either direction',()=>{
 for(const direction of [-1,1])for(const fps of [30,60,120]){
  let x=1200,v=direction*480,c=1200;
  for(let i=0;i<fps*3;i++){
   v=damp(v,0,3.5,1/fps);x+=v/fps;
   const next=cameraFollow(c,x,v,800,0,2400,1/fps);
   assert.ok(direction*(next-c)>=-1e-8,`camera rolled back at ${fps}Hz`);c=next;
  }
  assert.equal(cameraFollow(c,x,0,800,0,2400,1/fps),c);
  // A deliberate reversal must still move the camera in the new direction.
  const next=cameraFollow(c,x-direction*300,-direction*270,800,0,2400,1/fps);
  assert.ok(direction*(next-c)<0);
 }
});
