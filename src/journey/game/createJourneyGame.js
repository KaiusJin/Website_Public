import Phaser from 'phaser';
import {regions,REGION_WIDTH,WORLD_HEIGHT,GROUND_Y} from '../data/regions';
import {clamp,resolveAxes,landingTarget} from './motion';

export function createJourneyGame(parent,bridge,onState,onReady,onError,onProgress){
 const worldWidth=regions.length*REGION_WIDTH;
 class TravelWorld extends Phaser.Scene {
  constructor(){super('journey');this.layers=new Map();this.lastReport=0;this.mode='walking';this.near=null;this.wasPaused=true;this.pending=new Set();this.failed=new Set();this.lastGround=0;this.jumpUntil=0;}
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
   this.anims.create({key:'walk',frames:this.anims.generateFrameNumbers('witch-frames',{start:0,end:3}),frameRate:8,repeat:-1});
   this.physics.world.setBounds(0,0,worldWidth,WORLD_HEIGHT);
   this.physics.world.gravity.y=1250;
   const floor=this.add.rectangle(worldWidth/2,GROUND_Y+60,worldWidth,120,0,0);
   this.physics.add.existing(floor,true);
   this.player=this.physics.add.sprite(540,GROUND_Y,'witch-frames',4).setOrigin(.5,1).setScale(.55).setDepth(5);
   this.player.body.setSize(110,300).setOffset(126,55);
   this.player.setCollideWorldBounds(true);
   this.physics.add.collider(this.player,floor);
   this.shadow=this.add.ellipse(540,GROUND_Y+2,84,10,0x263028,.2).setDepth(4);
   this.targetMarker=this.add.graphics().setDepth(4);
   this.load.on('filecomplete',(key,type)=>{if(type!=='image')return;this.pending.delete(key);const region=regions.find(r=>r.id===key);if(region)this.addRegion(region);});
   this.load.off('progress',onProgress);
   this.load.on('loaderror',file=>{this.pending.delete(file.key);this.failed.add(file.key);onError(file.key);});
   this.addRegion(regions[0]);this.loadNeighbors(0);
   this.resize();this.scale.on('resize',this.resize,this);
   this.sparkles=Array.from({length:24},(_,i)=>this.add.circle((i*911)%worldWidth,150+(i*71)%430,1.5+(i%2),0xffe6ab,.5).setDepth(4));
   bridge.current={...bridge.current,ready:true,jumpTo:index=>this.jumpTo(index),retry:()=>this.retry(),pause:true};
   this.events.once('shutdown',()=>{this.scale.off('resize',this.resize,this);bridge.current.ready=false;});
   onReady();
  }
  addRegion(r){
   if(this.layers.has(r.id)||!this.textures.exists(r.id))return;
   const image=this.add.image(r.x,0,r.id).setOrigin(0).setDisplaySize(REGION_WIDTH,WORLD_HEIGHT).setDepth(0);
   this.layers.set(r.id,image);
   // A soft veil conceals the short visual seam while the road stays continuous.
   if(r.index){const seam=this.add.graphics().setDepth(1);for(let i=0;i<28;i++){seam.fillStyle(0xe8ddc3,.008);seam.fillRect(r.x-56+i*2,0,112-i*4,WORLD_HEIGHT);} }
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
   const camera=this.cameras.main;const zoom=this.scale.height/WORLD_HEIGHT;
   camera.setZoom(zoom);camera.setBounds(0,0,worldWidth,WORLD_HEIGHT);
   camera.centerOn(this.player.x,WORLD_HEIGHT/2);
  }
  jumpTo(index){
   const r=regions[clamp(index,0,6)];
   this.loadNeighbors(r.index);
   this.destination=r;
  }
  update(time,delta){
   if(!this.player)return;
   const controls=bridge.current;
   const paused=controls.pause;
   if(paused){
    this.physics.world.pause();this.player.setVelocity(0);this.player.anims.pause();
    controls.stick={x:0,y:0};controls.jump=false;controls.fly=false;
    if(!this.wasPaused){controls.keys={};this.wasPaused=true;}
   }else{
    this.physics.world.resume();this.player.anims.resume();this.wasPaused=false;
   }
   if(this.destination&&this.textures.exists(this.destination.id)){
    this.player.setPosition(this.destination.x+this.destination.anchor-220,GROUND_Y-2).setVelocity(0);
    this.player.body.setAllowGravity(true);this.mode='walking';this.destination=null;this.lastReport=0;
   }
   const current=clamp(Math.floor(this.player.x/REGION_WIDTH),0,6);
   this.loadNeighbors(current);
   if(!paused){
    const k=controls.keys||{};const axes=resolveAxes({x:Number(!!(k.KeyD||k.ArrowRight))-Number(!!(k.KeyA||k.ArrowLeft)),y:Number(!!(k.KeyS||k.ArrowDown))-Number(!!(k.KeyW||k.ArrowUp))},controls.stick||{x:0,y:0});
    const fly=controls.fly;
    controls.fly=false;
    if(fly){
     if(this.mode==='flying'){this.mode='landing';this.landing=landingTarget(this.player.x,worldWidth,GROUND_Y);}
     else if(this.mode!=='landing'){this.mode='flying';this.player.body.setAllowGravity(false);this.player.y-=25;this.player.setVelocity(0);}
    }
    if(this.mode==='flying'){
     this.player.setVelocity(axes.x*480,axes.y*340);this.player.anims.stop();this.player.setFrame(Math.abs(axes.x)+Math.abs(axes.y)>.1?10:9);
     this.player.y=clamp(this.player.y,210,GROUND_Y-20);
    }else if(this.mode==='landing'){
     this.player.setVelocity(0,220);this.player.anims.stop();this.player.setFrame(11);
     if(this.player.y>=GROUND_Y-6){this.player.setY(GROUND_Y-2);this.player.setVelocity(0);this.player.body.setAllowGravity(true);this.mode='walking';}
    }else{
     const grounded=this.player.body.blocked.down||this.player.body.touching.down;
     if(grounded)this.lastGround=time;
     if(controls.jump)this.jumpUntil=time+120;
     if(this.jumpUntil>time&&time-this.lastGround<100){this.player.setVelocityY(-610);this.jumpUntil=0;this.lastGround=-1000;}
     this.player.setVelocityX(axes.x*270);
     if(!grounded){this.player.anims.stop();this.player.setFrame(this.player.body.velocity.y<0?6:7);}
     else if(Math.abs(axes.x)>.05)this.player.anims.play('walk',true);
     else{this.player.anims.stop();this.player.setFrame(4);}
    }
    controls.jump=false;
    if(Math.abs(axes.x)>.05)this.player.setFlipX(axes.x<0);
    // Never walk into an unloaded region, even after a large frame interruption.
    const next=clamp(Math.floor((this.player.x+Math.sign(this.player.body.velocity.x)*100)/REGION_WIDTH),0,6);
    if(!this.textures.exists(regions[next].id))this.player.setVelocityX(0);
    const interact=controls.interact;
    controls.interact=false;if(interact&&this.near)controls.onInteract?.(this.near);
   }
   const camera=this.cameras.main;const visibleWidth=this.scale.width/camera.zoom;
   const target=clamp(this.player.x+visibleWidth*.14,visibleWidth/2,worldWidth-visibleWidth/2);
   const center=camera.midPoint.x||target;
   camera.centerOn(controls.reduced?target:Phaser.Math.Linear(center,target,Math.min(1,delta/150)),WORLD_HEIGHT/2);
   this.shadow.setX(this.player.x).setAlpha(clamp(1-(GROUND_Y-this.player.y)/450,0,.24));
   const r=regions[current], distance=Math.abs(this.player.x-(r.x+r.anchor));
   this.near=distance<260?r.id:null;
   this.targetMarker.clear();
   this.targetMarker.lineStyle(1,0xfff3c9,this.near ? .8 : .3);
   this.targetMarker.strokeEllipse(r.x+r.anchor,GROUND_Y,100+Math.sin(time/500)*8,12);
   this.sparkles.forEach((s,i)=>{s.visible=!controls.reduced;s.y=150+(i*71)%430+Math.sin(time/1500+i)*12;s.alpha=.2+Math.sin(time/900+i)*.2;});
   if(time-this.lastReport>70){
    this.lastReport=time;
    const project=x=>(x-camera.worldView.x)*camera.zoom;
    const hotspots=regions.filter(r=>r.x+r.anchor>camera.worldView.x-100&&r.x+r.anchor<camera.worldView.right+100).map(r=>({id:r.id,x:project(r.x+r.anchor),y:(GROUND_Y-160-camera.worldView.y)*camera.zoom}));
    onState({region:current,x:Math.round(this.player.x),y:Math.round(this.player.y),mode:this.mode,near:this.near,hotspots,progress:this.player.x/worldWidth,loading:!!this.destination});
   }
  }
 }
 return new Phaser.Game({type:Phaser.AUTO,parent,backgroundColor:'#d8d4c7',transparent:false,scene:TravelWorld,scale:{mode:Phaser.Scale.RESIZE,width:parent.clientWidth,height:parent.clientHeight},physics:{default:'arcade',arcade:{debug:false}},render:{antialias:true,roundPixels:false},fps:{target:60},input:{activePointers:3,keyboard:false},audio:{noAudio:true},banner:false});
}
