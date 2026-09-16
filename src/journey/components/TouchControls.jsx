import {memo,useCallback,useEffect,useRef} from 'react';
import Icon from './Icon';
import {joystickVector} from '../game/motion';
function TouchControls({bridge,t,mode}){
 const knob=useRef(null),pointer=useRef(null),bounds=useRef(null);
 const reset=useCallback(()=>{pointer.current=null;bridge.current.stick={x:0,y:0};if(knob.current)knob.current.style.transform='translate(0px,0px)';},[bridge]);
 useEffect(()=>{const controls=bridge.current;window.addEventListener('blur',reset);return()=>{window.removeEventListener('blur',reset);controls.stick={x:0,y:0};};},[bridge,reset]);
 const update=e=>{
  const box=bounds.current;if(!box)return;
  const v=joystickVector(e.clientX-box.left-box.width/2,e.clientY-box.top-box.height/2,box.width*.33);
  bridge.current.stick=v;
  if(knob.current)knob.current.style.transform=`translate(${v.x*box.width*.28}px,${v.y*box.height*.28}px)`;
 };
 const actions=key=>({onPointerDown:e=>{if(e.button!==0)return;e.preventDefault();bridge.current[key]=true;},onClick:e=>{if(e.detail===0)bridge.current[key]=true;}});
 return <div className="journey-touch" aria-label={t.touch}>
  <div className="journey-joystick" role="group" aria-label={t.move}
   onPointerDown={e=>{if(pointer.current!==null)return;e.preventDefault();pointer.current=e.pointerId;bounds.current=e.currentTarget.getBoundingClientRect();e.currentTarget.setPointerCapture(e.pointerId);update(e);}}
   onPointerMove={e=>{if(pointer.current===e.pointerId)update(e);}}
   onPointerUp={e=>{if(pointer.current===e.pointerId)reset();}} onPointerCancel={reset} onLostPointerCapture={reset}>
   <span className="joystick-axis"/><span ref={knob} className="joystick-knob"/><small>{t.move}</small>
  </div>
  <div className="journey-actions">
   <button aria-label={mode==='walking'?t.fly:t.land} {...actions('fly')}><Icon name="broom" size={25}/><span>{mode==='walking'?t.fly:t.land}</span></button>
   <button aria-label={t.jump} disabled={mode!=='walking'} {...actions('jump')}><Icon name="jump" size={25}/><span>{t.jump}</span></button>
   <button className="touch-interact" aria-label={t.interact} {...actions('interact')}><Icon name="book" size={25}/><span>{t.interact}</span></button>
  </div>
 </div>;
}
export default memo(TouchControls);
