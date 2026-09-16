import test from 'node:test';
import assert from 'node:assert/strict';
import {joystickVector,resolveAxes} from '../src/journey/game/motion.js';
import {safeUrl} from '../src/journey/data/content.js';
import {regions,REGION_WIDTH,townExperienceHotspots} from '../src/journey/data/regions.js';
import {copy} from '../src/journey/i18n/copy.js';
test('joystick dead zone avoids drift; extreme diagonal gestures remain bounded',()=>{
 assert.deepEqual(joystickVector(2,2),{x:0,y:0});
 for(const [x,y] of [[400,400],[-500,6],[0,-800],[25,30]]){const v=joystickVector(x,y);assert.ok(Math.hypot(v.x,v.y)<=1.000001);assert.equal(Math.sign(v.x),Math.sign(x));}
});
test('mixed keyboard and touch cannot create diagonal speed advantage',()=>{
 assert.deepEqual(resolveAxes({x:1,y:0},{x:-1,y:0}),{x:0,y:0});
 assert.ok(Math.abs(Math.hypot(...Object.values(resolveAxes({x:1,y:1},{x:1,y:1})))-1)<1e-8);
});
test('untrusted links cannot execute code or open data documents',()=>{
 for(const url of ['javascript:alert(1)','data:text/html,hi','file:///etc/passwd',''])assert.equal(safeUrl(url),null);
 assert.equal(safeUrl('https://example.com/project'),'https://example.com/project');assert.equal(safeUrl('mailto:a@example.com',{email:true}),'mailto:a@example.com');
});
test('seven chapters are continuous and every displayed UI key has both languages',()=>{
 assert.equal(regions.length,7);regions.forEach((r,i)=>{assert.equal(r.x,i*REGION_WIDTH);assert.ok(r.anchor>0&&r.anchor<REGION_WIDTH);assert.ok(copy.en[r.section]);});
 assert.deepEqual(Object.keys(copy.en).sort(),Object.keys(copy['zh-CN']).sort());
});
test('desktop hotspots follow scene landmarks while phones can keep one aligned row',()=>{
 const positions=[...regions.filter(r=>r.hotspot).map(r=>r.hotspot),...townExperienceHotspots.map(({offset,y})=>({offset,y}))];
 positions.forEach(({offset,y})=>{assert.ok(offset>0&&offset<REGION_WIDTH);assert.ok(y>150&&y<650);});
 assert.ok(new Set(positions.map(point=>point.y)).size>4);
});

import {neighboringRegion,arrivalPosition,LIBRARY_DOOR_X,canEnterLibrary} from '../src/journey/game/travel.js';
test('outdoor route passes the library building without entering the indoor room',()=>{
 assert.equal(neighboringRegion(2,1),4);assert.equal(neighboringRegion(4,-1),2);assert.equal(neighboringRegion(3,1),null);assert.equal(neighboringRegion(0,-1),null);assert.equal(neighboringRegion(6,1),null);
});
test('crossing a chapter boundary lands inside its destination and away from the trigger',()=>{
 for(const index of [0,1,2,4,5,6])for(const dir of [-1,1]){const x=arrivalPosition(index,dir);assert.ok(x>index*REGION_WIDTH+115&&x<(index+1)*REGION_WIDTH-115);}
});
test('library entrance proximity rejects a distant player',()=>{
 assert.equal(canEnterLibrary(LIBRARY_DOOR_X),true);
 assert.equal(canEnterLibrary(LIBRARY_DOOR_X-100),true);
 assert.equal(canEnterLibrary(LIBRARY_DOOR_X-400),false);
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
test('light parallax keeps indoor clouds and foliage off',()=>{
 assert.equal(ambienceProfile(3).cloud,0);assert.equal(ambienceProfile(3).foreground,0);
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

test('broom settles on one still image; purely vertical flight also animates',()=>{
 let state={clip:'broom-fly',phase:2,elapsed:0};
 const fly={speed:0,verticalSpeed:0,grounded:false,mode:'flying'};
 for(let i=0;i<300;i++){
  state=advanceAnimation(state,fly,1/60);
  assert.deepEqual(animationPose(state),{sheet:'hover',frame:0,stretch:1,bob:0});
 }
 state=advanceAnimation(state,{...fly,verticalSpeed:-100},1/60);
 assert.equal(state.clip,'broom-fly');assert.equal(animationPose(state).sheet,'states');
 state=advanceAnimation(state,{...fly,mode:'landing',verticalSpeed:80},1/60);
 assert.equal(state.clip,'broom-land');assert.equal(animationPose(state).sheet,'hover');
});
test('broom hover hysteresis avoids repeated pose changes near the speed threshold',()=>{
 let state={clip:'broom-idle',phase:0,elapsed:0};
 const step=speed=>state=advanceAnimation(state,{speed,grounded:false,mode:'flying'},1/60);
 for(const speed of [14,22,27,16])assert.equal(step(speed).clip,'broom-idle');
 assert.equal(step(30).clip,'broom-fly');
 for(const speed of [27,22,14])assert.equal(step(speed).clip,'broom-fly');
 assert.equal(step(10).clip,'broom-idle');
 assert.equal(advanceAnimation(state,{speed:100,mode:'flying',paused:true},1/60),state);
});

import {displayMetrics} from '../src/journey/game/display.js';
test('high-DPI rendering adds real canvas pixels without changing CSS/world proportions',()=>{
 for(const [w,h] of [[1440,900],[844,390],[1194,834]]){
  const one=displayMetrics(w,h,1),two=displayMetrics(w,h,2);
  assert.equal(two.width,one.width*2);assert.equal(two.height,one.height*2);
  assert.equal(two.width*two.zoom,w);assert.equal(two.height*two.zoom,h);
  assert.equal(two.height/800*two.zoom,one.height/800*one.zoom);
 }
});
test('large screens have a bounded render budget; minimized parents stay valid',()=>{
 const big=displayMetrics(2560,1440,3);
 assert.ok(big.width*big.height<8_010_000);assert.ok(big.zoom>=.5);
 assert.deepEqual(displayMetrics(0,0,1),{width:1,height:1,zoom:1});
});
