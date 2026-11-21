// ARCHIVED multi-model baseline; this does not validate the current CRT-only runtime.
// Actual pure Pine helper bodies; synthetic HTF context events, not a Pine runtime.
const assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('indicators/archive/funded-angler-v6-multimodel-2026-11-21.pine','utf8');
function body(name){const lines=source.split(/\r?\n/),at=lines.findIndex(l=>l.startsWith(name+'('));assert.ok(at>=0);let end=at+1;while(end<lines.length&&(!lines[end].trim()||/^\s/.test(lines[end])))end++;return lines.slice(at+1,end).filter(l=>l.trim()&&!l.trim().startsWith('//'));}
function expr(s){return s.replace(/\band\b/g,'&&').replace(/\bor\b/g,'||').replace(/\bnot\b/g,'!').replace(/\bna\b(?!\s*\()/g,'null').replace(/:=/g,'=').replace(/^(?:float|int|bool) /,'let ');}
function compile(name,args,returns=true){const input=body(name);let code='',blocks=[];for(let i=0;i<input.length;i++){const raw=input[i],indent=raw.match(/^\s*/)[0].length,s=raw.trim();while(blocks.length&&indent<=blocks.at(-1)){code+='}\n';blocks.pop();}if(s.startsWith('if ')){code+='if('+expr(s.slice(3))+'){\n';blocks.push(indent);}else code+=(returns&&i===input.length-1?'return ':'')+expr(s)+';\n';}while(blocks.length){code+='}\n';blocks.pop();}return Function(...args,code);}
const na=x=>x==null||Number.isNaN(x);
const tierRaw=compile('f_contextTier',['na','m','direction']),tier=(m,d)=>tierRaw(na,m,d);
const preferRaw=compile('f_preferContext',['na','f_contextTier','candidate','current','direction']),prefer=(a,b,d)=>preferRaw(na,tier,a,b,d);
const trackRaw=compile('f_trackTrigger',['na','sweepSize','m','barStart','barEnd','barHigh','barLow','closing'],false);
const track=(m,h,l,c,t=200)=>trackRaw(na,.25,m,t,t+1,h,l,c);
const model=over=>({uid:1,kind:2,dir:1,cp:120,confirmedAt:100,resolvedAt:100,phase:0,hi:115,lo:85,irlT:80,irlH:100,irlL:98,irlKind:1,triggerAt:null,triggerRef:null,triggerDir:0,triggerKind:0,triggerLeft:false,...over});
const empty=model({uid:null,kind:0,dir:0,cp:null,irlT:null});
for(const dir of [1,-1]){
 const base=model({dir,cp:dir===1?120:80,irlH:102,irlL:98});
 assert.equal(tier(base,dir),1);assert.equal(tier(base,-dir),0);assert.equal(tier({...base,cp:null},dir),0);assert.equal(tier({...base,irlT:null},dir),0);
 track(base,103,97,dir===1?101:99);assert.equal(tier(base,dir),2);assert.equal(base.triggerAt,201);
 track(base,103,97,dir===1?101:99,210);assert.equal(base.triggerAt,201,'Sitting in the zone does not create newer events');
 track(base,dir===1?108:96,dir===1?104:92,dir===1?106:94,220);
 track(base,103,97,dir===1?101:99,230);assert.equal(base.triggerAt,231,'Leaving then revisiting can record a new confirmed event');
 const waiting=model({uid:2,dir,cp:base.cp,irlH:102,irlL:98});assert.equal(prefer(base,waiting,dir),true);assert.equal(prefer(waiting,base,dir),false);
 assert.equal(prefer({...base,uid:3,triggerAt:301},base,dir),true,'More recent confirmed reaction wins only within ready tier');
 assert.equal(prefer({...base,uid:3},base,dir),false,'Equal event time keeps FIFO');
 assert.equal(prefer(waiting,{...waiting,irlT:null},dir),true,'No-reference EGF cannot lock out an eligible model');
 assert.equal(prefer({...waiting,uid:4},waiting,dir),false,'New shape alone never wins');
 const point=model({dir,cp:base.cp,irlH:100,irlL:100,irlKind:3});track(point,100,100,dir===1?101:99);assert.equal(point.triggerAt,null,'Exact point touch is not a raid');
 track(point,dir===1?102:101,dir===1?99:98,dir===1?101:99);assert.equal(point.triggerAt,201);
 point.irlT=81;track(point,110,105,108,300);assert.equal(point.triggerAt,null,'New reference clears old reaction');
 const early=model({dir,cp:base.cp,confirmedAt:300});track(early,103,97,dir===1?101:99);assert.equal(early.triggerAt,null,'A forming model has no confirmed reaction priority');
 const isb=model({kind:3,dir,cp:base.cp,phase:0,irlT:null});assert.equal(tier(isb,dir),0,'Unresolved mother is only display context');
 isb.phase=1;track(isb,110,90,100);assert.equal(tier(isb,dir),2,'Resolved false break records its confirmed event');
 const breakout=model({kind:3,dir,cp:base.cp,phase:2,hi:105,lo:95,irlT:null});track(breakout,106,94,dir===1?106:94);assert.equal(breakout.triggerAt,201,'Breakout must retest boundary and close on breakout side');
}
assert.equal(prefer(model(),empty,1),true);
assert.match(source,/if modelAllowed and primaryIndex == -1/,'Range display remains FIFO');
assert.match(source,/candidate.kind == 2 and f_preferContext\(candidate, egfContext, contextBias\)/);
assert.match(source,/candidate.kind == 3 and f_preferContext\(candidate, isbContext, contextBias\)/);
assert.ok(source.indexOf('f_refreshIrl(m, zones, swings)')<source.indexOf('f_trackTrigger(m, time,'),'Match reference before recording event');
console.log('PASS readiness/event-based EGF/ISB context priority, symmetric raids, confirmed timing, FIFO ties and display isolation. No market ranking claimed.');
