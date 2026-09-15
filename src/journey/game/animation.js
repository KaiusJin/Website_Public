import {clamp} from './motion.js';

// Presentation time never drives the physics body or camera position.
export function advanceAnimation(state,{speed,verticalSpeed=0,grounded,mode,paused},seconds){
 if(paused)return state;
 const dt=clamp(seconds,0,.05);
 const flightSpeed=Math.hypot(speed,verticalSpeed);
 // Separate enter/exit thresholds prevent flickering around the hovering speed.
 const flying=flightSpeed>(state.clip==='broom-fly'?12:28);
 const clip=mode==='landing'?'broom-land':mode==='flying'?(flying?'broom-fly':'broom-idle'):!grounded?'air':speed>12?'walk':'idle';
 const phase=clip===state.clip?state.phase:0;
 const rate=clip==='walk'?10*clamp(speed/270,.25,1.2):clip==='broom-fly'?6:1;
 return {clip,phase:phase+dt*rate,elapsed:state.elapsed+dt};
}

export function animationPose(state,velocityY=0){
 const {clip,phase,elapsed}=state;
 if(clip==='walk')return {sheet:'walk',frame:Math.floor(phase)%8,stretch:1+Math.sin(phase*Math.PI/2)*.003,bob:0};
 if(clip==='broom-fly')return {sheet:'states',frame:[5,6,7,6][Math.floor(phase)%4],stretch:1,bob:Math.sin(elapsed*2.2)*1.3};
 if(clip==='broom-idle'||clip==='broom-land')return {sheet:'hover',frame:0,stretch:1,bob:0};
 if(clip==='air')return {sheet:'walk',frame:velocityY<0?2:6,stretch:1,bob:0};
 // Keep the head steady during idle; the closed-eye drawing is a short blink.
 return {sheet:'idle',frame:elapsed%4.4>4.25?2:0,stretch:1+Math.sin(elapsed*2)*.002,bob:0};
}

// Frame-specific anatomical anchors avoid shifts from different transparent margins.
export function spritePlacement(frame,flipX,height,stretch=1){
 const scale=height/frame.referenceHeight;
 return {originX:flipX?1-frame.anchorX/frame.width:frame.anchorX/frame.width,
  originY:frame.anchorY/frame.height,scaleX:scale,scaleY:scale*stretch};
}
