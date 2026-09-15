import Phaser from 'phaser';
import {regions,REGION_WIDTH,WORLD_HEIGHT,GROUND_Y} from '../data/regions';
import {clamp,resolveAxes,damp,motionVelocity,cameraFollow} from './motion';
import {createAmbience} from './ambience';
import {neighboringRegion,arrivalPosition,LIBRARY_DOOR_X,canEnterLibrary} from './travel';

export function createJourneyGame(parent,bridge,onState,onReady,onError,onProgress){
 const worldWidth=regions.length*REGION_WIDTH;
 class TravelWorld extends Phaser.Scene {
  constructor(){super('journey');this.layers=new Map();this.lastReport=0;this.mode='walking';this.near=null;this.wasPaused=true;this.pending=new Set();this.failed=new Set();this.lastGround=0;this.jumpUntil=0;this.regionIndex=0;this.room=null;this.walkDistance=0;this.characterAngle=0;}
  preload(){
   this.load.image('witch','/journey/characters/witch.webp');
   this.load.image('cottage',regions[0].image);
   this.load.on('progress',onProgress);
   this.load.on('loaderror',file=>{this.failed.add(file.key);onError(file.key);});
  }
  create(){
   if(this.failed.size){return;}
   const source=this.textures.get('witch').getSourceImage();
   this.textures.addSpriteSheet('witch-frames',source,{frameWidth:source.width/4,frameHeight:source.height/3});
   this.physics.world.setBounds(0,0,REGION_WIDTH,WORLD_HEIGHT);
   this.physics.world.gravity.y=1250;
   const floor=this.add.rectangle(worldWidth/2,GROUND_Y+60,worldWidth,120,0,0);
   this.physics.add.existing(floor,true);
   this.player=this.physics.add.sprite(540,GROUND_Y,'witch-frames',4).setOrigin(.5,1).setScale(.55).setDepth(5);
   this.player.body.setSize(110,300).setOffset(126,55);
   this.player.setVisible(false);
   this.character=this.add.sprite(540,GROUND_Y,'witch-frames',4).setOrigin(.5,1).setScale(.55).setDepth(5);
   this.player.setCollideWorldBounds(true);
   this.physics.add.collider(this.player,floor);
   this.shadow=this.add.ellipse(540,GROUND_Y+2,84,10,0x263028,.2).setDepth(4);
   this.targetMarker=this.add.graphics().setDepth(4);
   this.load.on('filecomplete',(key,type)=>{if(type!=='image')return;this.pending.delete(key);const region=regions.find(r=>r.id===key);if(region)this.addRegion(region);});
   this.load.off('progress',onProgress);
   this.load.on('loaderror',file=>{this.pending.delete(file.key);this.failed.add(file.key);onError(file.key);});
   this.addRegion(regions[0]);this.loadNeighbors(0);
   this.resize();this.scale.on('resize',this.resize,this);
   this.ambience=createAmbience(this);
   bridge.current={...bridge.current,ready:true,jumpTo:index=>this.jumpTo(index),enterLibrary:()=>this.enterLibrary(),exitLibrary:()=>this.exitLibrary(),retry:()=>this.retry(),pause:true};
   this.events.once('shutdown',()=>{this.scale.off('resize',this.resize,this);bridge.current.ready=false;});
   onReady();
  }
  addRegion(r){
   if(this.layers.has(r.id)||!this.textures.exists(r.id))return;
   const image=this.add.image(r.x,0,r.id).setOrigin(0).setDisplaySize(REGION_WIDTH,WORLD_HEIGHT).setDepth(0);
   this.layers.set(r.id,image);

  }
  loadNeighbors(index){
   let queued=false;
   for(let i=Math.max(0,index-1);i<=Math.min(6,index+1);i++){
    const r=regions[i];if(!this.textures.exists(r.id)&&!this.pending.has(r.id)&&!this.failed.has(r.id)){this.pending.add(r.id);this.load.image(r.id,r.image);queued=true;}
   }
   if(queued&&!this.load.isLoading())this.load.start();
  }
  retry(){
   const ids=[...this.failed];this.failed.clear();
   for(const id of ids){const r=regions.find(r=>r.id===id);if(r){this.pending.add(id);this.load.image(id,r.image);}}
   this.load.start();
  }
  resize(){
   const camera=this.cameras.main;const zoom=Math.max(this.scale.height/WORLD_HEIGHT,this.scale.width/REGION_WIDTH);
   camera.setZoom(zoom);camera.setBounds(this.regionIndex*REGION_WIDTH,0,REGION_WIDTH,WORLD_HEIGHT);
   camera.centerOn(this.player.x,WORLD_HEIGHT/2);
  }
  requestTravel(index,x,{room=null,preserveFlight=false}={}){
   if(this.transitioning)return;
   this.destination={region:regions[index],x,room,preserveFlight,velocity:{x:this.player.body.velocity.x,y:this.player.body.velocity.y}};this.loadNeighbors(index);
  }
  jumpTo(index){
   const r=regions[clamp(index,0,6)];
   if(index===3)this.returnX=LIBRARY_DOOR_X;
   this.requestTravel(r.index,r.x+r.anchor-220,{room:index===3?'library':null});
  }
  enterLibrary(){
   if(this.room||this.regionIndex!==2||!canEnterLibrary(this.player.x,this.player.y,this.mode,GROUND_Y))return;
   this.returnX=this.player.x;this.requestTravel(3,3*REGION_WIDTH+260,{room:'library'});
  }
  exitLibrary(){if(this.room)this.requestTravel(2,this.returnX??LIBRARY_DOOR_X);}
  beginTransition(){
   const d=this.destination;this.destination=null;this.transitioning=true;
   const y=this.player.y,mode=this.mode;this.player.setVelocity(0);
   if(!d.preserveFlight){bridge.current.keys={};bridge.current.stick={x:0,y:0};}
   const camera=this.cameras.main,duration=bridge.current.reduced?30:280;
   camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,()=>{
    this.regionIndex=d.region.index;this.room=d.room;
    this.player.setPosition(d.x,d.preserveFlight?y:GROUND_Y-2).setVelocity(0);
    this.mode=d.preserveFlight?mode:'walking';this.player.body.setAllowGravity(this.mode==='walking');
    this.physics.world.setBounds(d.region.x,0,REGION_WIDTH,WORLD_HEIGHT);
    this.resize();this.lastReport=0;
    camera.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE,()=>{this.transitioning=false;if(d.preserveFlight&&!bridge.current.pause)this.player.setVelocity(d.velocity.x,d.velocity.y);});
    camera.fadeIn(duration,27,26,32);
   });camera.fadeOut(duration,27,26,32);
  }
  update(time,delta){
   if(!this.player)return;
   const controls=bridge.current;
   const paused=controls.pause||this.transitioning||!!this.destination;
   if(paused){
    this.physics.world.pause();this.player.setVelocity(0);
    if(controls.pause){controls.stick={x:0,y:0};controls.jump=false;controls.fly=false;
     if(!this.wasPaused){controls.keys={};this.wasPaused=true;}
    }
   }else{
    this.physics.world.resume();this.wasPaused=false;
   }
   if(this.destination&&this.textures.exists(this.destination.region.id)&&!this.transitioning)this.beginTransition();
   const current=this.regionIndex;
   const dt=Math.min(delta/1000,.05);
   this.loadNeighbors(current);
   if(!paused){
    const k=controls.keys||{};const axes=resolveAxes({x:Number(!!(k.KeyD||k.ArrowRight))-Number(!!(k.KeyA||k.ArrowLeft)),y:Number(!!(k.KeyS||k.ArrowDown))-Number(!!(k.KeyW||k.ArrowUp))},controls.stick||{x:0,y:0});
    const fly=controls.fly;
    controls.fly=false;
    if(fly){
     if(this.mode==='flying'){this.mode='landing';}
     else if(this.mode!=='landing'){this.mode='flying';this.player.body.setAllowGravity(false);this.player.setVelocityY(-120);this.takeoffUntil=time+180;}
    }
    const grounded=this.player.body.blocked.down||this.player.body.touching.down;
    if(this.mode==='flying'){
     const v=motionVelocity(this.player.body.velocity,axes,'flying',false,dt);
     if(time<this.takeoffUntil)v.y=Math.min(v.y,-120);
     this.player.setVelocity(v.x,v.y);
     if(this.player.y<210){this.player.setY(210);this.player.setVelocityY(Math.max(0,v.y));}
     if(this.player.y>GROUND_Y-4){this.player.setY(GROUND_Y-4);this.player.setVelocityY(Math.min(0,v.y));}
    }else if(this.mode==='landing'){
     const height=GROUND_Y-this.player.y;
     this.player.setVelocity(damp(this.player.body.velocity.x,0,5,dt),damp(this.player.body.velocity.y,clamp(height*2.8,35,235),6,dt));
     if(height<=5){this.player.setY(GROUND_Y-2);this.player.setVelocity(0);this.player.body.setAllowGravity(true);this.mode='walking';}
    }else{
     if(grounded)this.lastGround=time;
     if(controls.jump)this.jumpUntil=time+120;
     if(this.jumpUntil>time&&time-this.lastGround<100){this.player.setVelocityY(-610);this.jumpUntil=0;this.lastGround=-1000;}
     const v=motionVelocity(this.player.body.velocity,axes,'walking',grounded,dt);
     this.player.setVelocityX(v.x);
    }
    controls.jump=false;
    if(Math.abs(this.player.body.velocity.x)>18)this.player.setFlipX(this.player.body.velocity.x<0);
    const interact=controls.interact;controls.interact=false;
    if(interact&&this.near){if(this.near==='library-door')this.enterLibrary();else if(this.near==='library-exit')this.exitLibrary();else controls.onInteract?.(this.near);}
    if(!this.room){
     const left=this.player.x-current*REGION_WIDTH<115&&this.player.body.velocity.x<-15,right=this.player.x>(current+1)*REGION_WIDTH-115&&this.player.body.velocity.x>15;
     if(left||right){const direction=right?1:-1,next=neighboringRegion(current,direction);if(next!==null)this.requestTravel(next,arrivalPosition(next,direction),{preserveFlight:true});}
    }
   }
   const camera=this.cameras.main;const visibleWidth=this.scale.width/camera.zoom;
   const center=camera.midPoint.x||this.player.x;
   const nextCenter=controls.reduced?clamp(this.player.x,current*REGION_WIDTH+visibleWidth/2,(current+1)*REGION_WIDTH-visibleWidth/2):cameraFollow(center,this.player.x,this.player.body.velocity.x,visibleWidth,current*REGION_WIDTH,(current+1)*REGION_WIDTH,dt);
   camera.centerOn(nextCenter,WORLD_HEIGHT/2);
   const speed=Math.abs(this.player.body.velocity.x),grounded=this.player.body.blocked.down||this.player.body.touching.down;
   if(!paused)this.walkDistance+=speed*dt;
   let frame=4;
   if(this.mode==='flying')frame=speed+Math.abs(this.player.body.velocity.y)>50?10:9;
   else if(this.mode==='landing')frame=11;
   else if(!grounded)frame=this.player.body.velocity.y<0?6:7;
   else if(speed>12)frame=[0,1,2,3,2,1][Math.floor(this.walkDistance/22)%6];
   this.character.setFrame(frame).setFlipX(this.player.flipX);
   const lean=this.mode==='flying'?clamp(this.player.body.velocity.x/160,-3,3):0;
   this.characterAngle=damp(this.characterAngle,lean,5,dt);
   const bob=this.mode==='flying'&&!controls.reduced?Math.sin(time/420)*1.5:0;
   this.character.setPosition(this.player.x,this.player.y+bob).setAngle(this.characterAngle);
   this.shadow.setX(this.player.x).setAlpha(clamp(1-(GROUND_Y-this.player.y)/450,0,.24));
   const r=regions[current], distance=Math.abs(this.player.x-(r.x+r.anchor));
   this.near=distance<260?r.id:null;
   if(current===2&&Math.abs(this.player.x-LIBRARY_DOOR_X)<240)this.near='library-door';
   if(this.room&&this.player.x-r.x<380)this.near='library-exit';
   this.targetMarker.clear();
   this.targetMarker.lineStyle(1,0xfff3c9,this.near ? .8 : .3);
   this.targetMarker.strokeEllipse(r.x+r.anchor,GROUND_Y,100+(controls.reduced?0:Math.sin(time/500)*8),12);
   this.ambience.update({region:current,cameraX:camera.worldView.x,playerY:this.player.y,time,reduced:controls.reduced,paused});
   controls.onVisual?.(camera.worldView.x,camera.worldView.y,camera.zoom);
   if(time-this.lastReport>100){
    this.lastReport=time;
    const project=x=>(x-camera.worldView.x)*camera.zoom;
    const points=[{id:r.id,x:r.x+r.anchor,kind:'content'}];
    if(current===2)points.push({id:'library-door',x:LIBRARY_DOOR_X,kind:'door'});
    if(this.room)points.push({id:'library-exit',x:r.x+200,kind:'exit'});
    const hotspots=points.filter(p=>p.x>camera.worldView.x-100&&p.x<camera.worldView.right+100).map(p=>({...p,worldX:p.x,x:project(p.x),y:(GROUND_Y-160-camera.worldView.y)*camera.zoom}));
    const next=neighboringRegion(current,1),previous=neighboringRegion(current,-1);
    onState({region:current,x:Math.round(this.player.x),y:Math.round(this.player.y),mode:this.mode,vx:Math.round(this.player.body.velocity.x),vy:Math.round(this.player.body.velocity.y),fps:Math.round(this.game.loop.actualFps),room:this.room,transitioning:!!this.transitioning,near:this.near,hotspots,progress:this.player.x/worldWidth,loading:!!this.destination,next,previous,atRight:this.player.x>(current+1)*REGION_WIDTH-500,atLeft:this.player.x<current*REGION_WIDTH+420});
   }
  }
 }
 return new Phaser.Game({type:Phaser.AUTO,parent,backgroundColor:'#d8d4c7',transparent:false,scene:TravelWorld,scale:{mode:Phaser.Scale.RESIZE,width:parent.clientWidth,height:parent.clientHeight},physics:{default:'arcade',arcade:{debug:false,fixedStep:false}},render:{antialias:true,roundPixels:false},fps:{target:60},input:{activePointers:3,keyboard:false},audio:{noAudio:true},banner:false});
}
