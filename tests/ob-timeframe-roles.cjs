// HISTORICAL before pure CRT 2026-11-22; excluded from current check runners.
// Superseded by tests/pure-crt.cjs, crt-liquidity.cjs and crt-context.cjs.
// Executes the actual pure OB seed/strength bodies, plus the existing LTF adapter.
// Does not emulate security, pivots, Pine rollback or market fills.
const assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
function body(name){const lines=source.split(/\r?\n/),start=lines.findIndex(l=>l.startsWith(name+'('));assert.ok(start>=0);let end=start+1;while(end<lines.length&&(!lines[end].trim()||/^\s/.test(lines[end])))end++;return lines.slice(start+1,end).filter(l=>l.trim()&&!l.trim().startsWith('//'));}
function js(s){return s.replace(/\band\b/g,'&&').replace(/\bor\b/g,'||').replace(/\bnot\b/g,'!').replace(/\bna\b(?!\s*\()/g,'null').replace(/:=/g,'=').replace(/^(?:float|int|bool) /,'let ');}
function compile(name,args){const lines=body(name);let code='',blocks=[];for(let i=0;i<lines.length;i++){const raw=lines[i],indent=raw.match(/^\s*/)[0].length,s=raw.trim();while(blocks.length&&indent<=blocks.at(-1)){code+='}\n';blocks.pop();}if(s.startsWith('if ')){code+='if('+js(s.slice(3))+'){\n';blocks.push(indent);}else code+=(i===lines.length-1?'return ':'')+js(s)+';\n';}while(blocks.length){code+='}\n';blocks.pop();}return Function(...args,code);}
const displacement=compile('f_obDisplacement',['direction','opening','barHigh','barLow','closing']);
const step=compile('f_obSeedStep',['na','f_obDisplacement','seed','direction','candidateOpen','candidateHigh','candidateLow','candidateClose','candidateTime','candidateIndex','localExtreme','structureLevel','opening','barHigh','barLow','closing','priorClose','currentIndex']);
const na=x=>x==null||Number.isNaN(x),empty=()=>({sourceIndex:null,used:false});
function htf(seed,over={}){const a={direction:1,candidateOpen:104,candidateHigh:105,candidateLow:100,candidateClose:101,candidateTime:1000,candidateIndex:10,localExtreme:true,structureLevel:108,opening:102,barHigh:112,barLow:101,closing:111,priorClose:101,currentIndex:11,...over};return step(na,displacement,seed,...Object.values(a));}
for(const d of [1,-1]){
 const mirror=(over={})=>d===1?over:Object.fromEntries(Object.entries({direction:1,candidateOpen:104,candidateHigh:105,candidateLow:100,candidateClose:101,structureLevel:108,opening:102,barHigh:112,barLow:101,closing:111,priorClose:101,...over}).map(([k,v])=>[k,k==='direction'?-1:k==='candidateHigh'?200-({candidateLow:100,...over}.candidateLow):k==='candidateLow'?200-({candidateHigh:105,...over}.candidateHigh):k==='barHigh'?200-({barLow:101,...over}.barLow):k==='barLow'?200-({barHigh:112,...over}.barHigh):v==null?v:200-v]));
 let s=empty();assert.equal(htf(s,mirror()),true,'Local HTF extreme plus prior structure break and displacement validates');assert.equal(s.sourceTime,1000);assert.equal(s.sourceIndex,10);
 for(const bad of [{structureLevel:null},{localExtreme:false},{closing:104.5},{opening:110,closing:111},{barLow:99}]){
  const params=d===1?bad:{...mirror(bad),...('localExtreme' in bad?{localExtreme:bad.localExtreme}:{})};
  assert.equal(htf(empty(),params),false,'Reject absent structure, non-extreme, candle-only break, weak body or violated source: '+JSON.stringify(bad));
 }
}
let seed=empty();assert.equal(htf(seed,{barHigh:107,closing:106}),false,'Candidate can wait beyond the immediate next bar');
const later={candidateOpen:106,candidateClose:107,localExtreme:false,opening:106,barHigh:112,barLow:103,closing:111,priorClose:106,currentIndex:13};
assert.equal(htf(seed,later),true);assert.equal(seed.sourceTime,1000,'Late validation retains original source, not confirmation candle');
assert.equal(htf(seed,{...later,currentIndex:14,priorClose:106}),false,'A seed cannot validate twice');
seed=empty();htf(seed,{barHigh:107,closing:106});assert.equal(htf(seed,{...later,currentIndex:19}),false,'Pending seed has a bounded eight-bar confirmation window');
const harness=require('./helpers/pine-channel-harness.cjs').createHarness(source),b=(t,o,h,l,c)=>({t,o,h,l,c});
const ctx={id:41,kind:1,flags:1,phase:1,dir:1,confirmed:100,resolved:100,hi:120,lo:90,inv:90,cp:120,irlT:null,irlH:null,irlL:null};
const tape=[b(98,107,109,106,108),b(99,108,111,107,110),b(100,110,111,104,105),b(101,105,106,101,102),b(102,102,108,102,107),b(103,107,108,104,106)];
function trace(c,t,opts={}){const state={...harness.state(c),mssLevel:c.dir===1?104:96},out=[];for(let i=2;i<t.length;i++)out.push(harness.step(c,state,t.slice(0,i+1),{entryMode:'OB retest',knownHigh:c.dir===1?104:null,knownLow:c.dir===-1?96:null,...opts}));return {state,out};}
for(const dir of [1,-1]){const c=dir===1?ctx:{...ctx,dir:-1,hi:110,lo:80,inv:110,cp:80};const t=dir===1?tape:tape.map(x=>b(x.t,200-x.o,200-x.l,200-x.h,200-x.c));const r=trace(c,t);assert.equal(r.out[2].hit,false,'OB validation cannot be its own retest');assert.equal(r.out[3].hit,true,'MSS-only displacement can form entry OB');assert.equal(r.out[3].tag,'O');assert.equal(r.state.confirmTag,'M','CISD level is still unbroken');assert.equal(r.state.obTime,102);
 const weak=t.map((x,i)=>i===4?{...x,o:dir===1?106:94}:x);assert.equal(trace(c,weak).out.some(x=>x.hit),false,'Weak structure-crossing candle cannot create entry OB');
 assert.ok(trace(c,t,{confirmed:false}).out.every(x=>!x.hit),'Unclosed bars cannot validate/emit');}
assert.match(source,/knownAt=time_close, leftTime=bullOb.sourceTime/);
assert.ok(source.indexOf('bool bullishOb = f_obSeedStep')<source.indexOf('knownObHigh := ph'),'Do not use pivots newly confirmed on the validation bar as prior context');
console.log('PASS HTF structural OB vs LTF C/M entry OB, symmetric rejection, delayed validation/source causality, expiry and MSS-only retest. Synthetic only.');
