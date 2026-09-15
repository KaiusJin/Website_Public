// Lightweight layers sit above the unchanged illustration; no scenery is replaced.
const OUTDOOR_CLOUD_ALPHA=[.1,.13,.065,0,.08,.025,.045];
export function ambienceProfile(region,reduced=false){
 if(reduced)return {cloud:0,mist:0,foreground:0,particles:0};
 return {cloud:OUTDOOR_CLOUD_ALPHA[region]??.07,mist:region===3?.025:region===5?.105:.055,foreground:region===3?0:.2,particles:region===3?.45:.38};
}
export function layerPosition(anchor,cameraOffset,rate,time,drift=0){return anchor+cameraOffset*(1-rate)+Math.sin(time/15000)*drift;}
export function createAmbience(scene){
 function texture(key,w,h,paint){
  if(scene.textures.exists(key))return;
  const canvas=scene.textures.createCanvas(key,w,h),ctx=canvas.getContext();paint(ctx,w,h);canvas.refresh();
 }
 texture('journey-cloud-wisp',384,160,(ctx,w,h)=>{
  for(const [x,y,rx,ry]of[[90,85,85,30],[172,72,115,50],[274,90,100,27]]){
   ctx.save();ctx.translate(x,y);ctx.scale(rx,ry);const g=ctx.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,'rgba(255,250,235,.75)');g.addColorStop(.4,'rgba(255,250,235,.35)');g.addColorStop(1,'rgba(255,250,235,0)');ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore();
  }
 });
 texture('journey-soft-leaves',192,160,(ctx)=>{
  ctx.filter='blur(1.8px)';ctx.strokeStyle='#67784d';ctx.fillStyle='#67784d';ctx.lineWidth=1.7;
  for(let stem=0;stem<5;stem++){
   const rootX=25+stem*30,tipX=rootX+(stem-2)*18,tipY=32+(stem%3)*22;
   ctx.beginPath();ctx.moveTo(rootX,170);ctx.quadraticCurveTo(rootX+12,100,tipX,tipY);ctx.stroke();
   for(let leaf=0;leaf<5;leaf++){
    const t=.2+leaf*.13,y=170+(tipY-170)*t,x=rootX+(tipX-rootX)*t;
    for(const sign of [-1,1]){ctx.save();ctx.translate(x,y);ctx.rotate(sign*.65);ctx.beginPath();ctx.ellipse(sign*8,-9,4.5,13,sign*.4,0,Math.PI*2);ctx.fill();ctx.restore();}
   }
  }
 });
 const clouds=Array.from({length:4},(_,i)=>scene.add.image(0,85+(i%3)*43,'journey-cloud-wisp').setDisplaySize(680+(i%2)*190,180).setDepth(1));
 const mist=Array.from({length:3},(_,i)=>scene.add.image(0,565+i*38,'journey-cloud-wisp').setDisplaySize(1250,175).setDepth(3));
 const leaves=Array.from({length:5},(_,i)=>scene.add.image(0,810,'journey-soft-leaves').setOrigin(.5,1).setDisplaySize(180+(i%2)*40,130+(i%3)*15).setDepth(7));
 const particles=Array.from({length:18},(_,i)=>scene.add.ellipse(0,0,i%3===0?4:2,i%3===0?2:2,i%3===0?0xe9d8b2:0xffe9b7,.4).setDepth(i%2?4:7));
 return {
  update({region,cameraX,playerY,time,reduced,paused}){
   const origin=region*2400,offset=cameraX-origin,p=ambienceProfile(region,reduced);
   // Freeze decorative drifting during reading. Camera-relative depth still follows navigation.
   const elapsed=this.lastTime===undefined?0:Math.min(time-this.lastTime,50);this.lastTime=time;
   if(!paused)this.elapsed=(this.elapsed||0)+elapsed;
   const clock=this.elapsed||0,flightLift=(637-playerY)*.018;
   clouds.forEach((s,i)=>s.setPosition(origin+layerPosition(220+i*730,offset,.22,clock+i*2000,22),85+(i%3)*43-flightLift).setAlpha(p.cloud));
   mist.forEach((s,i)=>s.setPosition(origin+layerPosition(360+i*960,offset,.64,clock+i*3500,36),565+i*38-flightLift*.5).setAlpha(p.mist));
   leaves.forEach((s,i)=>s.setPosition(origin+layerPosition(120+i*590,offset,1.12,0),810+flightLift).setRotation(Math.sin(clock/3200+i)*.018).setAlpha(p.foreground));
   particles.forEach((s,i)=>{
    const localX=(i*149+Math.sin(clock/4600+i)*28)%2400;
    const y=region===3?230+(i*37)%330+Math.sin(clock/2000+i)*12:100+((i*47+clock*.011)%500);
    s.setPosition(origin+layerPosition(localX,offset,i%2?.76:1.07,0),y).setAlpha(p.particles*(.55+.25*Math.sin(clock/1300+i))).setRotation(clock/2800+i);
   });
  },
  destroy(){[...clouds,...mist,...leaves,...particles].forEach(s=>s.destroy());}
 };
}
