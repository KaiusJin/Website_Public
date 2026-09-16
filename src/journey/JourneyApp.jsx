import {useCallback,useEffect,useRef,useState} from 'react';
import {createJourneyGame} from './game/createJourneyGame';
import {keyboardCommand} from './game/facing';
import {regions,sceneText,MOBILE_HOTSPOT_Y} from './data/regions';
import {copy,initialLanguage} from './i18n/copy';
import {experienceTables} from './data/content';
import useJourneyContent from './data/useJourneyContent';
import Icon from './components/Icon';
import Modal from './components/Modal';
import ContentPanel from './components/ContentPanel';
import TouchControls from './components/TouchControls';
import MusicPlayer from '../components/MusicPlayer';
import './journey.css';
function savedBool(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
export default function JourneyApp(){
 const host=useRef(null),hotspotNodes=useRef(new Map()),bridge=useRef({stick:{x:0,y:0},pause:true,phoneHotspots:matchMedia('(max-width:700px), (max-height:550px) and (pointer:coarse)').matches}),game=useRef(null);
 const [lang,setLang]=useState(initialLanguage),[panel,setPanel]=useState(null),[ready,setReady]=useState(false),[progress,setProgress]=useState(0),[errors,setErrors]=useState([]),[version,setVersion]=useState(0);
 const [started,setStarted]=useState(false),[blurred,setBlurred]=useState(false),[portrait,setPortrait]=useState(false),[cleanScreen,setCleanScreen]=useState(()=>savedBool('journey-clean-screen',false));
 const [touch,setTouch]=useState(()=>savedBool('journey-touch',matchMedia('(pointer:coarse)').matches));
 const [world,setWorld]=useState({region:0,mode:'walking',near:null,hotspots:[]});
 const content=useJourneyContent();const t=copy[lang],region=regions[world.region];
 const openRegion=useCallback(id=>{const r=regions.find(r=>r.id===id);if(id==='library-door'){bridge.current.enterLibrary?.();return;}if(id==='library-exit'){bridge.current.exitLibrary?.();return;}if(experienceTables.includes(id)){setPanel(id);return;}if(r)setPanel(r.section);},[]);
 bridge.current.onVisual=(cameraX,cameraY,zoom)=>{for(const node of hotspotNodes.current.values()){if(node){const worldY=bridge.current.phoneHotspots?MOBILE_HOTSPOT_Y:Number(node.dataset.worldY),x=(Number(node.dataset.worldX)-cameraX)*zoom,y=(worldY-cameraY)*zoom,transform=`translate3d(${x}px,${y}px,0) translate(-50%,-100%)`;if(node.style.transform!==transform)node.style.transform=transform;}}};
 bridge.current.pause=!!panel||portrait||blurred||!ready;
 bridge.current.onInteract=openRegion;bridge.current.touch=touch;
 const clear=useCallback(()=>{bridge.current.stick={x:0,y:0};bridge.current.jump=false;bridge.current.fly=false;bridge.current.interact=false;bridge.current.facingRequest=null;bridge.current.keys={};},[]);
 const releasePointerFocus=useCallback(event=>{const control=event.target.closest?.('button,a');if(control)queueMicrotask(()=>control.blur());},[]);
 useEffect(()=>{
  setReady(false);setProgress(0);setErrors([]);
  let active=true;
  game.current=createJourneyGame(host.current,bridge,state=>{if(active){const {started:journeyStarted,...nextWorld}=state;if(journeyStarted)setStarted(true);setWorld(nextWorld);}},()=>{if(active)setReady(true);},key=>{if(active)setErrors(e=>[...new Set([...e,key])]);},n=>{if(active)setProgress(n);});
  return()=>{active=false;game.current?.destroy(true);game.current=null;};
 },[version]);
 useEffect(()=>{
  const resize=()=>{setPortrait(matchMedia('(orientation:portrait)').matches&&(touch||navigator.maxTouchPoints>0||matchMedia('(pointer:coarse)').matches));bridge.current.phoneHotspots=matchMedia('(max-width:700px), (max-height:550px) and (pointer:coarse)').matches;clear();};
  const blur=()=>{setBlurred(true);clear();};const focus=()=>{setBlurred(false);clear();};
  const visibility=()=>{document.hidden?blur():focus();};
  resize();window.addEventListener('resize',resize);window.addEventListener('blur',blur);window.addEventListener('focus',focus);document.addEventListener('visibilitychange',visibility);
  return()=>{window.removeEventListener('resize',resize);window.removeEventListener('blur',blur);window.removeEventListener('focus',focus);document.removeEventListener('visibilitychange',visibility);};
 },[clear,touch]);
 useEffect(()=>{clear();},[panel,portrait,clear]);
 useEffect(()=>{
  const down=e=>{
   if(e.metaKey||e.ctrlKey||e.altKey)return;
   if(e.key==='Escape'&&!panel){setPanel('settings');return;}
   if(panel||portrait||e.target.closest('input,textarea,select,[contenteditable="true"]')||(['Space','Enter'].includes(e.code)&&e.target.closest('button,a')))return;
   setBlurred(false);
   const c=bridge.current;c.keys??={};c.keys[e.code]=true;
   if(!e.repeat){const command=keyboardCommand(e.code);if(command==='front'||command==='back')c.facingRequest=command;else if(command)c[command]=true;}
   if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
  };
  const up=e=>{if(bridge.current.keys)bridge.current.keys[e.code]=false;};
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);
  return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);clear();};
 },[panel,portrait,clear]);
 useEffect(()=>{
  document.documentElement.lang=lang;
  document.title=lang==='en'?'Kaius’s Journey · A Wandering Developer':'Kaius 的魔女旅途 · 漫游开发者';
  try{localStorage.setItem('journey-language',lang);localStorage.setItem('journey-touch',JSON.stringify(touch));localStorage.setItem('journey-clean-screen',JSON.stringify(cleanScreen));}catch{/* Optional preferences. */}
 },[lang,touch,cleanScreen]);
 const travel=index=>{clear();bridge.current.jumpTo?.(index);setPanel(null);setStarted(true);};
 const close=()=>setPanel(null);
 const sceneLabel=(r,key)=>sceneText(r,key,lang,content.data.journey_scene_content);
 const title=panel==='map'?t.map:panel==='settings'?t.settings:panel==='personal'?t.journal:t[panel];
 return <main className={`journey-root ${world.region>4?'journey-night':''} ${touch?'has-touch':''}`} onPointerDownCapture={()=>setBlurred(false)} onClickCapture={releasePointerFocus} onFocusCapture={()=>setBlurred(false)} data-room={world.room||'outdoors'}>
  <div ref={host} className="journey-canvas" tabIndex={-1} aria-label={t.brand}/>
  <div className="journey-vignette" aria-hidden="true"/>
  <header className={`journey-header ${cleanScreen?'is-clean':''}`}>
   {!cleanScreen&&<div className="journey-brand"><span className="brand-seal"><Icon name="moon" size={23}/></span><span><strong>{t.brand}</strong><small>{t.subtitle}</small></span></div>}
   <nav aria-label={t.map}>{!cleanScreen&&<><button aria-label={t.journal} onClick={()=>setPanel('personal')}><Icon name="book"/><span>{t.journal}</span></button><button aria-label={t.map} onClick={()=>setPanel('map')}><Icon name="map"/><span>{t.map}</span></button><span className="nav-divider"/></>}<MusicPlayer/>{!cleanScreen&&<><button className="language-button" onClick={()=>setLang(lang==='en'?'zh-CN':'en')} aria-label={t.language}>{lang==='en'?'中':'EN'}</button><button className="settings-button" onClick={()=>setPanel('settings')} aria-label={t.settings}><Icon name="settings"/></button></>}<button className="clean-screen-button" onClick={()=>setCleanScreen(value=>!value)} aria-label={cleanScreen?t.showInterface:t.clearScreen} title={cleanScreen?t.showInterface:t.clearScreen}><Icon name="screen"/></button>{!cleanScreen&&<a href="/" className="classic-link">{t.classic}<Icon name="external" size={14}/></a>}</nav>
  </header>
  {!cleanScreen&&world.room&&!panel&&<button className="room-exit" onClick={()=>bridge.current.exitLibrary?.()}><Icon name="arrow"/>{t.leaveRoom}</button>}
  {!cleanScreen&&ready&&!started&&<section className="journey-intro"><p className="intro-eyebrow"><span/> {t.eyebrow}</p><h1>{t.hero.split('\n').map((line,i)=><span key={i}>{line}</span>)}</h1><p className="intro-body">{t.intro}</p></section>}
  {!cleanScreen&&ready&&started&&!panel&&<aside className="chapter-caption" key={region.id}><span>{t.chapter} {String(world.region+1).padStart(2,'0')} <i> / 07</i></span><h1>{sceneLabel(region,'title')}</h1><p>{sceneLabel(region,'description')}</p></aside>}
  {!cleanScreen&&ready&&started&&!panel&&!portrait&&!world.transitioning&&world.hotspots.map(h=>{const r=regions.find(r=>r.id===h.id)||regions[3];const label=h.kind==='exit'?t.leaveRoom:h.kind==='door'?t.libraryDoor:t[h.id]||t[r.section];return <button className={`world-hotspot ${world.near===h.id?'is-near':''}`} key={h.id} ref={node=>{if(node){hotspotNodes.current.set(h.id,node);if(!node.dataset.visualReady){node.style.transform=`translate3d(${h.x}px,${h.y}px,0) translate(-50%,-100%)`;node.dataset.visualReady='true';}}else hotspotNodes.current.delete(h.id);}} data-world-x={h.worldX} data-world-y={h.worldY} onClick={()=>openRegion(h.id)} disabled={h.kind==='door'&&world.near!==h.id} aria-label={label}><span className="hotspot-symbol"><Icon name={h.kind==='exit'?'arrow':h.icon||r.icon} size={23}/></span><span>{label}</span><small>{world.near===h.id?'↵':'✧'}</small></button>;})}
  {!cleanScreen&&ready&&started&&!panel&&!world.room&&!world.transitioning&&world.atRight&&world.next!==null&&<button className="route-sign route-sign-right" onClick={()=>travel(world.next)} aria-label={`${t.visit}: ${sceneLabel(regions[world.next],'title')}`}><span>{sceneLabel(regions[world.next],'title')}</span><Icon name="arrow"/></button>}
  {!cleanScreen&&ready&&started&&!panel&&!world.room&&!world.transitioning&&world.atLeft&&world.previous!==null&&<button className="route-sign route-sign-left" onClick={()=>travel(world.previous)} aria-label={`${t.visit}: ${sceneLabel(regions[world.previous],'title')}`}><Icon name="arrow"/><span>{sceneLabel(regions[world.previous],'title')}</span></button>}
  {!cleanScreen&&ready&&!panel&&<footer className="journey-footer"><div className="journey-position"><small>{touch?t.touchHelp:world.mode==='walking'?t.help:t.flyHelp}</small></div><div className="mini-map" aria-label={t.map}>{regions.map(r=><button key={r.id} className={r.index===world.region?'active':r.index<world.region?'visited':''} onClick={()=>travel(r.index)} aria-label={`${t.visit}: ${sceneLabel(r,'title')}`} aria-current={r.index===world.region?'step':undefined}><span/><small>{String(r.index+1).padStart(2,'0')}</small></button>)}</div><button className="next-chapter" onClick={()=>travel((world.region+1)%7)} aria-label={t.next}><Icon name="arrow"/></button></footer>}
  {!cleanScreen&&ready&&touch&&!panel&&!portrait&&<TouchControls bridge={bridge} t={t} mode={world.mode}/>}
  {world.loading&&!panel&&<div className="world-status" role="status">{t.loading}…</div>}
  {!ready&&<div className="journey-loading" role="status"><div className="loading-emblem"><Icon name="moon" size={48}/></div><p>{t.brand}</p><h1>{errors.length?t.loadError:t.loading}</h1><div className="loading-track"><span style={{width:`${progress*100}%`}}/></div>{errors.length?<button className="journey-primary" onClick={()=>setVersion(n=>n+1)}>{t.retry}</button>:<small>{Math.round(progress*100)}%</small>}<a href="/">{t.classic}</a></div>}
  {ready&&!panel&&content.failedTables.includes('journey_scene_content')&&<div className="world-error" role="alert">{t.dataError}<button onClick={content.retry}>{t.retry}</button></div>}
  {ready&&errors.length>0&&<div className="world-error" role="alert">{t.loadError}<button onClick={()=>{setErrors([]);bridge.current.retry?.();}}>{t.retry}</button></div>}
  {portrait&&<section className="journey-rotate" role="dialog" aria-modal="true" aria-label={t.rotate}><Icon name="rotate" size={56}/><h1>{t.rotate}</h1><p>{t.rotateBody}</p><a href="/">{t.rotateBack}<Icon name="arrow"/></a></section>}
  {panel&&!portrait&&<Modal title={title} onClose={close} t={t} wide={panel==='map'}>
   {panel==='map'?<div className="travel-map"><div className="map-directory">{['about',...experienceTables,'projects','skills','awards','contact'].map(section=><button key={section} onClick={()=>setPanel(section)}>{t[section]}</button>)}</div>{regions.map(r=><button className={`map-destination ${r.index===world.region?'current':''}`} key={r.id} onClick={()=>travel(r.index)}><div className="map-thumb" style={{backgroundImage:`url(${r.image})`}}><span>{String(r.index+1).padStart(2,'0')}</span><Icon name={r.icon} size={28}/></div><div><small>{t[r.section]}</small><h3>{sceneLabel(r,'title')}</h3><p>{sceneLabel(r,'description')}</p></div><Icon name="arrow"/></button>)}</div>:panel==='settings'?<><div className="setting-row"><label htmlFor="touch"><strong>{t.touch}</strong><span>{t.touchSetting}</span></label><input id="touch" type="checkbox" checked={touch} onChange={e=>setTouch(e.target.checked)}/></div><h3>{t.controls}</h3><dl className="controls-list"><div><dt>A / D · ← / →</dt><dd>{t.step}</dd></div><div><dt>SPACE</dt><dd>{t.jump}</dd></div><div><dt>F</dt><dd>{t.fly} / {t.land}</dd></div><div><dt>W / S · ↑ / ↓</dt><dd>{t.ascend}</dd></div><div><dt>Q / E</dt><dd>{t.faceFront} / {t.faceBack}</dd></div><div><dt>ENTER</dt><dd>{t.interact}</dd></div></dl><p>{t.pause}</p><p className="fine-print">{t.saved}<br/>{t.credits}</p><a className="journal-text-button" href="/">{t.classic}<Icon name="external"/></a></>:<ContentPanel section={panel} content={content} lang={lang} t={t} onPersonal={()=>setPanel('personal')} onRestart={()=>travel(0)}/>}
  </Modal>}
 </main>;
}
