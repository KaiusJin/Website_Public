import {useEffect,useRef} from 'react';
import Icon from './Icon';
export default function Modal({title,onClose,t,children,wide=false,projectPanel=false,skillPanel=false}){
 const dialog=useRef(null),close=useRef(null);
 useEffect(()=>{
  const previous=document.activeElement;dialog.current.showModal();close.current.focus();
  return()=>{previous?.focus?.();};
 },[]);
 return <dialog className={`journey-modal ${wide?'is-wide':''} ${projectPanel?'is-projects':''} ${skillPanel?'is-skills':''}`} ref={dialog} aria-labelledby="journal-title" onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===dialog.current){const r=dialog.current.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}}>
  <header className="journal-header"><div><h2 id="journal-title">{title}</h2></div><button ref={close} className="journal-close" onClick={onClose} aria-label={t.close}><Icon name="close"/></button></header>
  <div className="journal-body">{children}</div>
  <footer className="journal-footer"><span>✧ &nbsp; {t.built}</span></footer>
 </dialog>;
}
