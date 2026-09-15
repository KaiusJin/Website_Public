import {useEffect,useRef,useState} from 'react';
import Icon from './Icon';
import {joystickVector} from '../game/motion';
export default function TouchControls({bridge,t,mode}){
 const pad=useRef(null),pointer=useRef(null);const [knob,setKnob]=useState({x:0,y:0});
 const reset=()=>{pointer.current=null;bridge.current.stick={x:0,y:0};setKnob({x:0,y:0});};
 useEffect(()=>{return()=>{bridge.current.stick={x:0,y:0};};},[bridge]);
 const update=e=>{const box=pad.current.getBoundingClientRect();const v=joystickVector(e.clientX-box.left-box.width/2,e.clientY-box.top-box.height/2,box.width*.33);bridge.current.stick=v;setKnob({x:v.x*box.width*.28,y:v.y*box.height*.28});};
 const action=(key)=>()=>{bridge.current[key]=true;};
 return <div className="journey-touch" aria-label={t.touch}>
  <div ref={pad} className="journey-joystick" role="group" aria-label={t.move}
   onPointerDown={e=>{if(pointer.current!==null)return;pointer.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);update(e);}}
   onPointerMove={e=>{if(pointer.current===e.pointerId)update(e);}}
   onPointerUp={e=>{if(pointer.current===e.pointerId)reset();}} onPointerCancel={reset} onLostPointerCapture={reset}>
   <span className="joystick-axis"/><span className="joystick-knob" style={{transform:`translate(${knob.x}px,${knob.y}px)`}}/><small>{t.move}</small>
  </div>
  <div className="journey-actions">
   <button aria-label={mode==='walking'?t.fly:t.land} onClick={action('fly')}><Icon name="broom" size={25}/><span>{mode==='walking'?t.fly:t.land}</span></button>
   <button aria-label={t.jump} disabled={mode!=='walking'} onClick={action('jump')}><Icon name="jump" size={25}/><span>{t.jump}</span></button>
   <button className="touch-interact" aria-label={t.interact} onClick={action('interact')}><Icon name="book" size={25}/><span>{t.interact}</span></button>
  </div>
 </div>;
}
