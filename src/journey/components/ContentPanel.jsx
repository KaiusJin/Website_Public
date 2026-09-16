import {useState} from 'react';
import {safeUrl,experienceTables} from '../data/content';
import Icon from './Icon';
import {resolveProfile,dateRange} from '../../data/profile';
const External=({href,children,...props})=>{const url=safeUrl(href,{email:true});return url?<a href={url} target={url.startsWith('mailto:')?undefined:'_blank'} rel="noopener noreferrer" {...props}>{children}<Icon name="external" size={15}/></a>:null;};
function Record({item:r,t,type,hideTitle=false,hideType=false,titleFirst=false,skillRecord=false,experience=false}){
 const meta=r.organization||r.role||(hideType?'':type===t.skills?'':type),date=r.year||dateRange(r,t.present);
 const website=experience?safeUrl(r.link):null;
 const titleNode=!hideTitle&&<h3>{website?<a className="experience-name-link" href={website} target="_blank" rel="noopener noreferrer" aria-label={`${t.website}: ${r.title}`}><span>{r.title}</span><Icon name="external" size={18}/></a>:r.title||r.category}</h3>;
 const metaNode=(meta||date)&&<div className="record-meta">{meta&&<span>{meta}</span>}{date&&<span>{date}</span>}</div>;
 return <article className={`journal-record${titleFirst?' project-record':''}${skillRecord?' skill-record':''}`}>
  {titleFirst?<div className="record-title-row">{titleNode}{metaNode}</div>:<>{metaNode}{titleNode}</>}
  {safeUrl(r.image_url)&&<img className="record-image" src={safeUrl(r.image_url)} alt={r.image_alt||r.title} loading="lazy"/>}
  {r.description&&<p>{r.description}</p>}
  {r.bullets?.length>0&&<ul>{r.bullets.map((b,i)=><li key={i}>{b.text}</li>)}</ul>}
  {r.skills?.length>0&&<div className="record-tags">{r.skills.map((s,i)=><span key={i}>{s.tag}</span>)}</div>}
  {(safeUrl(r.github_link)||(!experience&&safeUrl(r.link)))&&<div className="record-links"><External href={r.github_link}>{t.source}</External>{!experience&&<External href={r.link}>{r.link_text||(type===t.awards?t.certificate:t.website)}</External>}</div>}
 </article>;
}
function Personal({entries,t}){
 const [filter,setFilter]=useState('all');const categories=['all','photography','travel','daily','music'];
 const items=entries.filter(e=>filter==='all'||e.kind===filter);
 return <><p className="journal-lead">{t.notesIntro}</p><div className="journal-filters" aria-label={t.personal}>{categories.map(c=><button key={c} className={filter===c?'active':''} aria-pressed={filter===c} onClick={()=>setFilter(c)}>{t[c]}</button>)}</div>
  {items.length?items.map(item=><article className="journal-record" key={item.id}><div className="record-meta"><span>{t[item.kind]}</span><span>{item.date}</span></div><h3>{item.title}</h3>{item.body&&<p style={{whiteSpace:'pre-line'}}>{item.body}</p>}<div className="photo-grid">{(item.images||[]).map((photo,i)=>safeUrl(photo.url)&&<figure key={i}><a href={safeUrl(photo.url)} target="_blank" rel="noopener noreferrer" aria-label={photo.alt||t.photo}><img src={safeUrl(photo.url)} alt={photo.alt||''} loading="lazy"/></a>{photo.caption&&<figcaption>{photo.caption}</figcaption>}</figure>)}</div><div className="record-links"><External href={item.external_url}>{t.website}</External></div></article>):<div className="journal-empty"><Icon name={filter==='music'?'music':'camera'} size={42}/><h3>{t.emptyNotes}</h3><p>{t.emptyNotesBody}</p></div>}</>;
}
export default function ContentPanel({section,content,lang,t,onPersonal,onRestart,projectId}){
 const {data,loading,failedTables,retry}=content;
 const profile=resolveProfile(data.site_profile);
 const journey=profile?.[lang==='en'?'journey_en':'journey_zh']||{};
 const sourceTable={about:'site_profile',contact:'site_profile',personal:'personal_entries','project-detail':'projects','other-projects':'projects'}[section]||section;
 if(loading)return <p role="status">{t.loading}…</p>;
 if(failedTables.includes(sourceTable))return <div className="journal-empty"><p role="alert">{t.dataError}</p><button className="journey-primary" onClick={retry}>{t.retry}</button></div>;
 if((section==='about'||section==='contact')&&!profile)return <p>{t.noItems}</p>;
 if(section==='about')return <><span className="record-meta">{journey.focus}</span><h3 className="profile-heading">{journey.heading}</h3><p className="journal-lead">{journey.intro}</p><p>{journey.bio}</p><div className="profile-facts"><div><small>{lang==='en'?'EDUCATION':'教育'}</small><strong>{journey.education_school}</strong><span>{journey.education_field}</span></div><div><small>{lang==='en'?'BASED IN':'所在城市'}</small><strong>{profile.location}</strong><span>{journey.location_detail}</span></div></div><button className="journal-text-button" onClick={onPersonal}>{t.personal}<Icon name="arrow"/></button></>;
 if(section==='contact')return <><h3 className="profile-heading">{journey.contact_heading}</h3><p className="journal-lead">{journey.contact_intro}</p><div className="contact-stamps"><External href={profile.email?`mailto:${profile.email}`:null}><Icon name="letter"/>{t.email}</External><External href={profile.github}>{t.github}</External><External href={profile.linkedin}>{t.linkedin}</External>{profile.resume_url&&<External href={profile.resume_url}>{t.resume}</External>}</div><p>{journey.contact_outro}</p><button className="journal-text-button" onClick={onRestart}>{t.replay}<Icon name="arrow"/></button></>;

 if(section==='personal')return <Personal entries={data.personal_entries} t={t}/>;
 if(section==='project-detail'){
  const project=data.projects.find(item=>item.id===projectId);
  return project?<Record item={project} t={t} type={t.projects} hideType titleFirst/>:<p>{t.noItems}</p>;
 }
 if(section==='other-projects'){
  const projects=data.projects.slice(4);
  return projects.length?projects.map(item=><Record key={item.id} item={item} t={t} type={t.projects} hideType titleFirst/>):<p>{t.noOtherProjects}</p>;
 }
 return <>{data[section]?.length?data[section].map(item=><Record key={item.id} item={item} t={t} type={t[section]} hideType={section==='projects'} titleFirst={section==='projects'} skillRecord={section==='skills'} experience={experienceTables.includes(section)}/>):<p>{t.noItems}</p>}{section==='awards'&&profile?.resume_url&&<div className="record-links"><External href={profile.resume_url}>{t.resume}</External></div>}</>;
}
