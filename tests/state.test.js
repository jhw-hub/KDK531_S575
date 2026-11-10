import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,lessonRecord,recordSuccess,skillLevel,importPreview,exportProfile,newProfile,getStore,setActive,save} from '../src/state.js';
import {byId} from '../src/curriculum.js';
test('replaying the same challenge cannot create independent mastery',()=>{
 const p=fresh(),r=lessonRecord(p,'variables');
 recordSuccess(p,byId.variables,r,'write',false);recordSuccess(p,byId.variables,r,'write',false);
 assert.equal(r.independent.length,1);assert.equal(skillLevel(r),'Demonstrated independently');
});
test('malformed nested backups and injected course labels are rejected',()=>{
 for(const mutate of [p=>p.lessons=null,p=>p.journal=[null],p=>p.courses=['<img src=x onerror=alert(1)>'],p=>p.review=[{}],p=>p.lessons={variables:{stage:'transfer',attempts:null}}]){
  const p=fresh();mutate(p);assert.throws(()=>importPreview(exportProfile(p)));
 }
});
test('guest profiles are excluded even when saving another profile',()=>{
 let saved;globalThis.localStorage={setItem:(k,v)=>saved=JSON.parse(v)};
 const p=newProfile('Persistent');const guest=newProfile('Guest',true);setActive(p.id);save();
 assert.ok(getStore().profiles.some(p=>p.id===guest.id));assert.ok(!saved.profiles.some(p=>p.id===guest.id));
 delete globalThis.localStorage;
});
