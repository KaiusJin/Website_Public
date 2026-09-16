// These requests are one-shot inputs, separate from the held movement keys.
export function keyboardCommand(code){
 return {KeyQ:'front',KeyE:'back',KeyF:'fly',Space:'jump',Enter:'interact'}[code]??null;
}

export function resolveFacing(current,{request,axes={x:0,y:0},jump=false}={}){
 if(request==='front'||request==='back')return request;
 if(request==='toggle')return current==='front'?'back':'front';
 // Deliberate movement releases the pose; inertia, gravity and camera motion do not.
 if(Math.abs(axes.x)>.04||Math.abs(axes.y)>.04||jump)return 'side';
 return current;
}

export function isCharacterTap(start,pointer,zoom=1){
 return !!start&&start.id===pointer.id&&Math.hypot(pointer.x-start.x,pointer.y-start.y)*zoom<=12;
}
