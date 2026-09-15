import {clamp} from './motion.js';

// Presentation time never drives the physics body or camera position.
export function advanceAnimation(state,{speed,grounded,mode,paused},seconds){
 if(paused)return state;
 const dt=clamp(seconds,0,.05);
 const clip=mode==='flying'||mode==='landing'?'broom':!grounded?'air':speed>12?'walk':'idle';
 const phase=clip===state.clip?state.phase:0;
 const rate=clip==='walk'?10*clamp(speed/270,.25,1.2):clip==='broom'?6:1;
 return {clip,phase:phase+dt*rate,elapsed:state.elapsed+dt};
}

export function animationPose(state,velocityY=0){
 const {clip,phase,elapsed}=state;
 if(clip==='walk')return {sheet:'walk',frame:Math.floor(phase)%8,stretch:1+Math.sin(phase*Math.PI/2)*.003,bob:0};
 if(clip==='broom')return {sheet:'states',frame:4+Math.floor(phase)%4,stretch:1,bob:Math.sin(elapsed*2.2)*1.3};
 if(clip==='air')return {sheet:'walk',frame:velocityY<0?2:6,stretch:1,bob:0};
 // Keep the head steady during idle; the closed-eye drawing is a short blink.
 return {sheet:'states',frame:elapsed%4.4>4.25?2:0,stretch:1+Math.sin(elapsed*2)*.002,bob:0};
}

// Frame-specific anatomical anchors avoid shifts from different transparent margins.
export function spritePlacement(frame,flipX,height,stretch=1){
 const scale=height/frame.referenceHeight;
 return {originX:flipX?1-frame.anchorX/frame.width:frame.anchorX/frame.width,
  originY:frame.anchorY/frame.height,scaleX:scale,scaleY:scale*stretch};
}
