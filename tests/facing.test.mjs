import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {keyboardCommand,resolveFacing,isCharacterTap} from '../src/journey/game/facing.js';
import {animationPose,spritePlacement} from '../src/journey/game/animation.js';
const atlas=JSON.parse(readFileSync(new URL('../src/journey/data/character-atlas.json',import.meta.url)));

test('Q and E select distinct views, while Enter remains the exploration key',()=>{
 assert.equal(keyboardCommand('KeyQ'),'front');
 assert.equal(keyboardCommand('KeyE'),'back');
 assert.equal(keyboardCommand('Enter'),'interact');
 assert.equal(keyboardCommand('KeyD'),null);
});

test('a selected view persists indefinitely after key release, even while coasting',()=>{
 for(const request of ['front','back']){
  let facing=resolveFacing('side',{request});
  for(let i=0;i<360;i++){
   facing=resolveFacing(facing);
   const pose=animationPose({clip:'walk',phase:i/6,elapsed:i/60},0,facing,'walking');
   assert.equal(pose.sheet,`ground-${request}`);
   assert.equal(pose.frame,0);
  }
 }
});

test('deliberate keyboard/joystick movement resumes normal animation, but tiny drift does not',()=>{
 for(const axes of [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1},{x:.2,y:-.3}]){
  assert.equal(resolveFacing('front',{axes}),'side');
  assert.equal(resolveFacing('back',{axes}),'side');
 }
 assert.equal(resolveFacing('back',{axes:{x:.02,y:-.01}}),'back');
 assert.equal(resolveFacing('front',{jump:true}),'side');
 assert.equal(resolveFacing('back',{request:'front',axes:{x:1,y:0}}),'front');
 assert.equal(animationPose({clip:'walk',phase:3,elapsed:1},0,'side').sheet,'walk');
});

test('character taps cycle front then back and restart at front after movement',()=>{
 let facing='side';
 for(const expected of ['front','back','front','back']){
  facing=resolveFacing(facing,{request:'toggle'});assert.equal(facing,expected);
 }
 facing=resolveFacing(facing,{axes:{x:1,y:0}});
 assert.equal(resolveFacing(facing,{request:'toggle'}),'front');
});

test('the chosen orientation survives takeoff and landing and selects the correct artwork',()=>{
 for(const facing of ['front','back'])for(const mode of ['walking','flying','landing']){
  const pose=animationPose({clip:'broom-fly',phase:4,elapsed:2},120,facing,mode);
  const expected=`${mode==='walking'?'ground':'broom'}-${facing}`;
  assert.deepEqual(pose,{sheet:expected,frame:0,stretch:1,bob:0});
  assert.ok(existsSync(new URL(`../public${atlas[expected].image}`,import.meta.url)));
 }
});

test('tap detection rejects drags and mismatched touch pointers at both pixel densities',()=>{
 for(const zoom of [1,.5]){
  const start={id:2,x:100,y:200};
  assert.equal(isCharacterTap(start,{id:2,x:100+10/zoom,y:200},zoom),true);
  assert.equal(isCharacterTap(start,{id:2,x:100+20/zoom,y:200},zoom),false);
  assert.equal(isCharacterTap(start,{id:3,x:100,y:200},zoom),false);
 }
 assert.equal(isCharacterTap(null,{id:2,x:100,y:200}),false);
});

test('front/back ground soles stay on the floor and broom seats align with the existing hover pose',()=>{
 for(const name of ['ground-front','ground-back']){
  const f=atlas[name].frames[0],p=spritePlacement(f,false,190);
  assert.equal((940-p.originY*f.height)*p.scaleY,0);
 }
 const hover=atlas.hover.frames[0],p=spritePlacement(hover,false,190);
 const hoverSeat=(625-p.originY*hover.height)*p.scaleY;
 for(const [name,seat] of [['broom-front',632],['broom-back',642]]){
  const f=atlas[name].frames[0],p=spritePlacement(f,false,190);
  assert.ok(Math.abs((seat-p.originY*f.height)*p.scaleY-hoverSeat)<5);
 }
});
