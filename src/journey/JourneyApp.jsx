import {useCallback,useEffect,useRef,useState} from 'react';
import {createJourneyGame} from './game/createJourneyGame';
import {regions,regionText,GROUND_Y} from './data/regions';
import {copy,initialLanguage} from './i18n/copy';
import {localize,experienceTables} from './data/content';
import useJourneyContent from './data/useJourneyContent';
import Icon from './components/Icon';
import Modal from './components/Modal';
import ContentPanel from './components/ContentPanel';
import TouchControls from './components/TouchControls';
import './journey.css';
function savedBool(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
export default function JourneyApp(){
 const host=useRef(null),hotspotNodes=useRef(new Map()),bridge=useRef({stick:{x:0,y:0},pause:true}),game=useRef(null);
 const [lang,setLang]=useState(initialLanguage),[panel,setPanel]=useState(null),[ready,setReady]=useState(false),[progress,setProgress]=useState(0),[errors,setErrors]=useState([]),[version,setVersion]=useState(0);
 const [started,setStarted]=useState(false),[blurred,setBlurred]=useState(false),[portrait,setPortrait]=useState(false);
 const [touch,setTouch]=useState(()=>savedBool('journey-touch',matchMedia('(pointer:coarse)').matches));
 const reduced=false;
 const [world,setWorld]=useState({region:0,x:540,y:GROUND_Y,mode:'walking',near:null,hotspots:[],progress:0});
 const content=useJourneyContent();const t=copy[lang],region=regions[world.region];
 const openRegion=useCallback(id=>{const r=regions.find(r=>r.id===id);if(id==='library-door'){bridge.current.enterLibrary?.();return;}if(id==='library-exit'){bridge.current.exitLibrary?.();return;}if(experienceTables.includes(id)){setPanel(id);return;}if(r)setPanel(r.section);},[]);
 bridge.current.onVisual=(cameraX,cameraY,zoom)=>{for(const node of hotspotNodes.current.values()){if(node){node.style.left=`${(Number(node.dataset.worldX)-cameraX)*zoom}px`;node.style.top=`${(477-cameraY)*zoom}px`;}}};
 bridge.current.pause=!!panel||portrait||blurred||!ready;
 bridge.current.reduced=reduced;bridge.current.onInteract=openRegion;
 const clear=useCallback(()=>{bridge.current.stick={x:0,y:0};bridge.current.jump=false;bridge.current.fly=false;bridge.current.interact=false;bridge.current.keys={};},[]);
 useEffect(()=>{
  setReady(false);setProgress(0);setErrors([]);
  let active=true;
  game.current=createJourneyGame(host.current,bridge,s=>{if(active)setWorld(s);},()=>{if(active)setReady(true);},key=>{if(active)setErrors(e=>[...new Set([...e,key])]);},n=>{if(active)setProgress(n);});
  return()=>{active=false;game.current?.destroy(true);game.current=null;};
 },[version]);
 useEffect(()=>{
  const resize=()=>{setPortrait(matchMedia('(orientation:portrait)').matches&&(touch||navigator.maxTouchPoints>0||matchMedia('(pointer:coarse)').matches));clear();};
  const blur=()=>{setBlurred(true);clear();};const focus=()=>{setBlurred(false);clear();};
  const visibility=()=>{document.hidden?blur():focus();};
  resize();window.addEventListener('resize',resize);window.addEventListener('blur',blur);window.addEventListener('focus',focus);document.addEventListener('visibilitychange',visibility);
  return()=>{window.removeEventListener('resize',resize);window.removeEventListener('blur',blur);window.removeEventListener('focus',focus);document.removeEventListener('visibilitychange',visibility);};
 },[clear,touch]);
 useEffect(()=>{if(world.x>620)setStarted(true);},[world.x]);
 useEffect(()=>{clear();},[panel,portrait,clear]);
 useEffect(()=>{
  const down=e=>{
   if(e.metaKey||e.ctrlKey||e.altKey)return;
   if(e.key==='Escape'&&!panel){setPanel('settings');return;}
   if(panel||portrait||e.target.closest('input,textarea,select')||(e.code==='Space'&&e.target.closest('button,a')))return;
   setBlurred(false);
   const c=bridge.current;c.keys??={};c.keys[e.code]=true;
   if(!e.repeat){if(e.code==='Space')c.jump=true;if(e.code==='KeyF')c.fly=true;if(e.code==='KeyE'||e.code==='Enter')c.interact=true;}
   if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
  };
  const up=e=>{if(bridge.current.keys)bridge.current.keys[e.code]=false;};
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);
  return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);clear();};
 },[panel,portrait,clear]);
 useEffect(()=>{
  document.documentElement.lang=lang;
  document.title=lang==='en'?'Kaius’s Journey · A Wandering Developer':'Kaius 的魔女旅途 · 漫游开发者';
  try{localStorage.setItem('journey-language',lang);localStorage.setItem('journey-touch',JSON.stringify(touch));}catch{/* Optional preferences. */}
 },[lang,reduced,touch]);
 const travel=index=>{clear();bridge.current.jumpTo?.(index);setPanel(null);setStarted(true);};
 const close=()=>setPanel(null);
 const sceneRecord=content.data.journey_scene_content.find(s=>s.scene_id===region.id);
 const scene=sceneRecord?localize(sceneRecord,lang):null;
 const chapterTitle=scene?.title||regionText(region,'title',lang);
 const title=panel==='map'?t.map:panel==='settings'?t.settings:panel==='personal'?t.journal:t[panel];
 return <main className={`journey-root ${world.region>4?'journey-night':''} ${touch?'has-touch':''}`} onPointerDownCapture={()=>setBlurred(false)} onFocusCapture={()=>setBlurred(false)} data-paused={String(bridge.current.pause)} data-player-x={world.x} data-player-y={world.y} data-player-mode={world.mode} data-velocity-x={world.vx} data-velocity-y={world.vy} data-fps={world.fps} data-room={world.room||'outdoors'} data-region={region.id}>
  <div ref={host} className="journey-canvas" tabIndex={-1} aria-label={t.brand}/>
  <div className="journey-vignette" aria-hidden="true"/>
  <header className="journey-header">
   <div className="journey-brand"><span className="brand-seal"><Icon name="moon" size={23}/></span><span><strong>{t.brand}</strong><small>{t.subtitle}</small></span></div>
   <nav aria-label={t.map}><button aria-label={t.journal} onClick={()=>setPanel('personal')}><Icon name="book"/><span>{t.journal}</span></button><button aria-label={t.map} onClick={()=>setPanel('map')}><Icon name="map"/><span>{t.map}</span></button><span className="nav-divider"/><button className="language-button" onClick={()=>setLang(lang==='en'?'zh-CN':'en')} aria-label={t.language}>{lang==='en'?'中':'EN'}</button><button className="settings-button" onClick={()=>setPanel('settings')} aria-label={t.settings}><Icon name="settings"/></button><a href="/" className="classic-link">{t.classic}<Icon name="external" size={14}/></a></nav>
  </header>
  {content.preview&&<div className="preview-badge">{lang==='en'?'Private draft preview':'私有草稿预览'}</div>}
  {world.room&&!panel&&<button className="room-exit" onClick={()=>bridge.current.exitLibrary?.()}><Icon name="arrow"/>{t.leaveRoom}</button>}
  {ready&&!started&&<section className="journey-intro"><p className="intro-eyebrow"><span/> {t.eyebrow}</p><h1>{t.hero.split('\n').map((line,i)=><span key={i}>{line}</span>)}</h1><p className="intro-body">{t.intro}</p></section>}
  {ready&&started&&!panel&&<aside className="chapter-caption" key={region.id}><span>{t.chapter} {String(world.region+1).padStart(2,'0')} <i> / 07</i></span><h1>{chapterTitle}</h1><p>{scene?.description||regionText(region,'description',lang)}</p></aside>}
  {ready&&started&&!panel&&!portrait&&!world.transitioning&&world.hotspots.map(h=>{const r=regions.find(r=>r.id===h.id)||regions[3];const label=h.kind==='exit'?t.leaveRoom:h.kind==='door'?t.libraryDoor:t[h.id]||t[r.section];return <button className={`world-hotspot ${world.near===h.id?'is-near':''}`} key={h.id} ref={node=>{if(node)hotspotNodes.current.set(h.id,node);else hotspotNodes.current.delete(h.id);}} data-world-x={h.worldX} style={{left:h.x,top:h.y}} onClick={()=>openRegion(h.id)} disabled={h.kind==='door'&&world.near!==h.id} aria-label={label}><span className="hotspot-symbol"><Icon name={h.kind==='exit'?'arrow':h.icon||r.icon} size={23}/></span><span>{label}</span><small>{world.near===h.id?'E / ↵':'✧'}</small></button>;})}
  {ready&&started&&!panel&&!world.room&&!world.transitioning&&world.atRight&&world.next!==null&&<button className="route-sign route-sign-right" onClick={()=>travel(world.next)} aria-label={`${t.visit}: ${regionText(regions[world.next],'title',lang)}`}><span>{regionText(regions[world.next],'title',lang)}</span><Icon name="arrow"/></button>}
  {ready&&started&&!panel&&!world.room&&!world.transitioning&&world.atLeft&&world.previous!==null&&world.previous!==undefined&&<button className="route-sign route-sign-left" onClick={()=>travel(world.previous)} aria-label={`${t.visit}: ${regionText(regions[world.previous],'title',lang)}`}><Icon name="arrow"/><span>{regionText(regions[world.previous],'title',lang)}</span></button>}
  {ready&&!panel&&<footer className="journey-footer"><div className="journey-position"><small>{touch?t.touchHelp:world.mode==='walking'?t.help:t.flyHelp}</small></div><div className="mini-map" aria-label={t.map}>{regions.map(r=><button key={r.id} className={r.index===world.region?'active':r.index<world.region?'visited':''} onClick={()=>travel(r.index)} aria-label={`${t.visit}: ${regionText(r,'title',lang)}`} aria-current={r.index===world.region?'step':undefined}><span/><small>{String(r.index+1).padStart(2,'0')}</small></button>)}</div><button className="next-chapter" onClick={()=>travel((world.region+1)%7)} aria-label={t.next}><Icon name="arrow"/></button></footer>}
  {ready&&touch&&!panel&&!portrait&&<TouchControls bridge={bridge} t={t} mode={world.mode}/>}
  {world.loading&&!panel&&<div className="world-status" role="status">{t.loading}…</div>}
  {!ready&&<div className="journey-loading" role="status"><div className="loading-emblem"><Icon name="moon" size={48}/></div><p>{t.brand}</p><h1>{errors.length?t.loadError:t.loading}</h1><div className="loading-track"><span style={{width:`${progress*100}%`}}/></div>{errors.length?<button className="journey-primary" onClick={()=>setVersion(n=>n+1)}>{t.retry}</button>:<small>{Math.round(progress*100)}%</small>}<a href="/">{t.classic}</a></div>}
  {ready&&errors.length>0&&<div className="world-error" role="alert">{t.loadError}<button onClick={()=>{setErrors([]);bridge.current.retry?.();}}>{t.retry}</button></div>}
  {portrait&&<section className="journey-rotate" role="dialog" aria-modal="true" aria-label={t.rotate}><Icon name="rotate" size={56}/><h1>{t.rotate}</h1><p>{t.rotateBody}</p><a href="/">{t.rotateBack}<Icon name="arrow"/></a></section>}
  {panel&&!portrait&&<Modal title={title} onClose={close} t={t} wide={panel==='map'}>
   {panel==='map'?<div className="travel-map"><div className="map-directory">{['about',...experienceTables,'projects','skills','awards','contact'].map(section=><button key={section} onClick={()=>setPanel(section)}>{t[section]}</button>)}</div>{regions.map(r=><button className={`map-destination ${r.index===world.region?'current':''}`} key={r.id} onClick={()=>travel(r.index)}><div className="map-thumb" style={{backgroundImage:`url(${r.image})`}}><span>{String(r.index+1).padStart(2,'0')}</span><Icon name={r.icon} size={28}/></div><div><small>{t[r.section]}</small><h3>{regionText(r,'title',lang)}</h3><p>{regionText(r,'description',lang)}</p></div><Icon name="arrow"/></button>)}</div>:panel==='settings'?<><div className="setting-row"><label htmlFor="touch"><strong>{t.touch}</strong><span>{t.touchSetting}</span></label><input id="touch" type="checkbox" checked={touch} onChange={e=>setTouch(e.target.checked)}/></div><h3>{t.controls}</h3><dl className="controls-list"><div><dt>A / D · ← / →</dt><dd>{t.step}</dd></div><div><dt>SPACE</dt><dd>{t.jump}</dd></div><div><dt>F</dt><dd>{t.fly} / {t.land}</dd></div><div><dt>W / S · ↑ / ↓</dt><dd>{t.ascend}</dd></div><div><dt>E · ENTER</dt><dd>{t.interact}</dd></div></dl><p>{t.pause}</p><p className="fine-print">{t.saved}<br/>{t.credits}</p><a className="journal-text-button" href="/">{t.classic}<Icon name="external"/></a></>:<ContentPanel section={panel} content={content} lang={lang} t={t} onPersonal={()=>setPanel('personal')} onRestart={()=>travel(0)}/>}
  </Modal>}
 </main>;
}
