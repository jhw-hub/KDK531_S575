import {byId} from './curriculum.js';
import {APP_VERSION} from './disclosures.js';
const KEY='pfs_profiles_v3';
export const fresh=(nickname='Learner',guest=false)=>({id:crypto.randomUUID(),nickname,guest,created:new Date().toISOString(),courses:['K531','S575'],minutes:30,experience:'New to Python',active:'variables',lessons:{},journal:[],review:[],appVersion:APP_VERSION});
let memory={profiles:[],active:null};let persistenceError='';
export function load(){try{const raw=localStorage.getItem(KEY);if(raw){const obj=JSON.parse(raw);if(Array.isArray(obj.profiles))memory={profiles:obj.profiles.filter(x=>!x.guest).map(validateProfile),active:typeof obj.active==='string'?obj.active:null}}}catch(e){persistenceError='Local storage could not be read; progress may not survive refresh.'}return memory;}
export function getStore(){return memory;}
export function activeProfile(){return memory.profiles.find(p=>p.id===memory.active)||null;}
export function save(){const p=activeProfile();try{localStorage.setItem(KEY,JSON.stringify({profiles:memory.profiles.filter(x=>!x.guest),active:p?.guest?null:memory.active}));persistenceError='';return p?.guest?'Ephemeral guest: not saved':'Saved on this device'}catch(e){persistenceError='Save failed ('+e.message+'). Your current work is in memory only; export a backup.';return persistenceError}}
export function storageStatus(){return persistenceError;}
export function setActive(id){memory.active=id;return save()}
export function newProfile(name,guest=false){const p=fresh((name||'Learner').slice(0,50),guest);memory.profiles.push(p);memory.active=p.id;save();return p}
export function removeProfile(id){memory.profiles=memory.profiles.filter(x=>x.id!==id);if(memory.active===id)memory.active=memory.profiles[0]?.id||null;save()}
export function lessonRecord(p,id){return p.lessons[id] ||= {draft:'',transferDraft:'',attempts:[],hint:0,solutionViewed:false,completed:false,independent:[],prediction:'',explanation:'',assessment:null,stage:'challenge'};}
export function exportProfile(p){return JSON.stringify({format:'pfs-backup',schema:1,exported:new Date().toISOString(),appVersion:APP_VERSION,contains:'All local learner records, code, attempts and private co-pilot journal',profile:p},null,2)}
function validateProfile(value){
 const fail=()=>{throw Error('Invalid or incompatible Python Flight School backup')};
 const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
 if(!object(value)||typeof value.id!=='string'||typeof value.nickname!=='string'||value.nickname.length>100||!object(value.lessons)||!Array.isArray(value.journal))fail();
 const p={...fresh(value.nickname),...value};
 if(!Array.isArray(p.courses)||p.courses.some(c=>!['K531','S575'].includes(c))||!Array.isArray(p.review)||typeof p.active!=='string'||typeof p.experience!=='string'||![15,30,45].includes(p.minutes))fail();
 for(const [id,r] of Object.entries(p.lessons)){
  if(['__proto__','prototype','constructor'].includes(id)||!object(r))fail();
  for(const key of ['draft','transferDraft','prediction','explanation'])if(r[key]!==undefined&&!['string','number'].includes(typeof r[key]))fail();
  if(!Array.isArray(r.attempts)||!Array.isArray(r.independent)||!['challenge','transfer','done'].includes(r.stage)||!Number.isInteger(r.hint)||r.hint<0||r.hint>3)fail();
  if(r.attempts.some(x=>!object(x))||r.independent.some(x=>!object(x)||typeof x.at!=='string'||typeof x.version!=='number'))fail();
 }
 if(p.journal.some(j=>!object(j)||Object.values(j).some(x=>typeof x!=='string'))||p.review.some(r=>!object(r)||typeof r.id!=='string'||!Number.isFinite(Date.parse(r.due))))fail();
 if(!Object.hasOwn(byId,p.active))p.active='variables';
 return p;
}
export function importPreview(text){if(text.length>3_000_000)throw Error('Backup too large');const obj=JSON.parse(text);if(obj?.format!=='pfs-backup'||obj.schema!==1)throw Error('Invalid or incompatible Python Flight School backup');return validateProfile(obj.profile)}
export function importAsNew(profile){const p=validateProfile(structuredClone(profile));p.id=crypto.randomUUID();p.nickname+=' (imported)';p.guest=false;memory.profiles.push(p);memory.active=p.id;save();return p}
export function dueReview(p){return (p.review||[]).filter(r=>new Date(r.due)<=new Date()).length}
export function recordSuccess(p,l,rec,kind,assisted){const now=new Date();rec.completed=true;rec.assessment={kind,at:now.toISOString(),assisted};if(!assisted&&!rec.independent.some(e=>e.version===l.version&&e.kind===kind)){rec.independent.push({kind,at:now.toISOString(),version:l.version});if(rec.independent.length===1){p.review.push({id:l.id,due:new Date(now.valueOf()+86400000).toISOString()})}else if(rec.independent.length>=2){p.review=p.review.filter(x=>x.id!==l.id)}}save()}
export function skillLevel(rec){if(!rec)return 'Not introduced';if(rec.independent?.length)return 'Demonstrated independently';if(rec.completed)return 'Practiced with assistance';return 'Introduced'}
