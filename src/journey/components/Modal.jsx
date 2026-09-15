import {useEffect,useRef} from 'react';
import Icon from './Icon';
export default function Modal({title,eyebrow,onClose,t,children,wide=false,onLanguage,lang}){
 const dialog=useRef(null),close=useRef(null);
 useEffect(()=>{
  const previous=document.activeElement;dialog.current.showModal();close.current.focus();
  return()=>{previous?.focus?.();};
 },[]);
 return <dialog className={`journey-modal ${wide?'is-wide':''}`} ref={dialog} aria-labelledby="journal-title" onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===dialog.current){const r=dialog.current.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}}>
  <header className="journal-header"><div><span className="journal-eyebrow">{eyebrow}</span><h2 id="journal-title">{title}</h2></div><button className="journal-language" onClick={onLanguage} aria-label={t.language}>{lang==='en'?'中':'EN'}</button><button ref={close} className="journal-close" onClick={onClose} aria-label={t.close}><Icon name="close"/></button></header>
  <div className="journal-body">{children}</div>
  <footer className="journal-footer"><span>✧ &nbsp; {t.built}</span><span>EST. 2026</span></footer>
 </dialog>;
}
