export function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
export function joystickVector(dx,dy,radius=46){
 const distance=Math.hypot(dx,dy);
 if(distance<radius*.13)return {x:0,y:0};
 const scale=Math.min(distance,radius)/distance/radius;
 return {x:dx*scale,y:dy*scale};
}
export function landingTarget(x,width,ground){return {x:clamp(x,100,width-100),y:ground};}
export function resolveAxes(keyboard,stick){
 const x=clamp(keyboard.x+stick.x,-1,1),y=clamp(keyboard.y+stick.y,-1,1);
 const length=Math.hypot(x,y);
 return length>1?{x:x/length,y:y/length}:{x,y};
}

// Exponential response is stable across different display refresh rates.
export function damp(current,target,response,seconds){
 const dt=clamp(seconds,0,.05);
 const next=target+(current-target)*Math.exp(-response*dt);
 return Math.abs(next-target)<.35?target:next;
}
export function motionVelocity(velocity,axes,mode,grounded,seconds){
 if(mode==='flying')return {x:damp(velocity.x,axes.x*480,Math.abs(axes.x)>.04?4.8:3.5,seconds),y:damp(velocity.y,axes.y*340,Math.abs(axes.y)>.04?4.8:3.5,seconds)};
 const moving=Math.abs(axes.x)>.04,reversing=moving&&Math.sign(axes.x)!==Math.sign(velocity.x);
 const response=grounded?(reversing?12:moving?9:10):(moving?4.8:1.5);
 return {x:damp(velocity.x,axes.x*270,response,seconds),y:velocity.y};
}
export function cameraFollow(center,playerX,velocityX,viewWidth,min,max,seconds){
 const lookAhead=clamp(velocityX/480,-1,1)*viewWidth*.12;
 const next=damp(center,clamp(playerX+lookAhead,min+viewWidth/2,max-viewWidth/2),5.5,seconds);
 // Shrinking look-ahead during braking must not pull the scenery backwards.
 // Follow may reverse only after the character's actual velocity reverses.
 const directional=velocityX>.5?Math.max(center,next):velocityX<-.5?Math.min(center,next):center;
 return clamp(directional,min+viewWidth/2,max-viewWidth/2);
}
