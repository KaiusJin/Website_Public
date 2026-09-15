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
