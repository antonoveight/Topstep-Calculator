const assert=require('node:assert/strict'),fs=require('node:fs');
const s=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const keys=require('./helpers/pine-crt-key-harness.cjs').createKeyHarness(s);
const focus=require('./helpers/pine-focus-lifecycle.cjs').createFocusHarness(s);
const clusters=require('./helpers/pine-cluster-harness.cjs').createClusterHarness(s);
const b=(t,o,h,l,c)=>({t,end:t+10,o,h,l,c});let cases=0;
for(const dir of [-1,1]){
 const mirror=x=>({...x,o:220-x.o,h:220-x.l,l:220-x.h,c:220-x.c});
 const bar=x=>dir===-1?x:mirror(x);
 const key=keys.makeKey({kind:3,dir,hi:dir===-1?113:107,lo:dir===-1?113:107,knownAt:80,beforeTime:90,tf:'60'});
 const make=()=>({uid:90,aT:90,aEnd:100,aO:105,aH:110,aL:100,aC:108,hi:110,lo:100,dir,inv:dir===-1?112:108,cp:dir===-1?100:120,flags:1,kind:1,phase:0,confirmedAt:110,resolvedAt:110,bornIndex:1,bT:100,bEnd:110,bO:108,bH:112,bL:104,bC:108,cT:null,raidTime:null,rangeKeys:{levels:[key]}});
 // Buy uses the mirrored parent [110,120].
 const model=()=>{const m=make();if(dir===1)Object.assign(m,{hi:120,lo:110,aH:120,aL:110});return m;};
 const m=model(),prior=clusters.archive({...m,phase:1},1,115),oldSL=m.inv;
 const raid=bar(b(110,108,114,105,109));cases++;assert.equal(keys.renew(m,raid,2),true);
 assert.equal(m.uid,90);assert.equal(m.aT,90);assert.equal(m.flags,3);assert.equal(m.phase,1);assert.equal(m.confirmedAt,120);assert.equal(m.inv,dir===-1?114:106);assert.equal(prior.confirmedAt,110);assert.equal(prior.inv,undefined);assert.equal(oldSL,dir===-1?112:108);
 assert.equal(m.bEnd,120);assert.equal(m.cT,null);assert.equal(m.raidTime,null);
 // Closing inside old C2 but outside C1 must not validate the parent.
 const pending=model();cases++;assert.equal(keys.renew(pending,bar(b(110,108,114,105,111)),2),false);assert.equal(pending.phase,0);
 cases++;assert.equal(keys.renew(pending,bar(b(120,111,112,105,109)),3),true);assert.equal(pending.bT,110);assert.equal(pending.bEnd,120);assert.equal(pending.confirmedAt,130,'Raid close and confirmation close stay separate');
 const late=model();late.rangeKeys={levels:[keys.makeKey({...key,knownAt:91})]};cases++;assert.equal(keys.renew(late,raid,2),false);
 const untouched=model();cases++;assert.equal(keys.renew(untouched,bar(b(110,108,112.5,105,109)),2),false,'Original key has not been swept');
 const completed=model();cases++;assert.equal(keys.renew(completed,bar(b(110,108,114,99,109)),2),false,'A spent target cannot generate a new attempt');
 const same=model();cases++;assert.equal(keys.renew(same,bar(b(110,108,112,105,109)),2),false,'No new extension beyond the old SL');
 const state=focus.state(),px=dir===-1?[114,105]:[115,106],inv=dir===-1?112:108,tp=dir===-1?100:120;
 focus.step(state,[90,dir,110,inv,tp,0,110,115,...px,true]);assert.equal(state.reason,1);
 // Same parent may only reset its failed latch using a NEW confirmed attempt token.
 focus.step(state,[90,dir,120,m.inv,tp,0,120,125,dir===-1?113:115,dir===-1?105:107,true]);assert.equal(state.reason,0);assert.equal(state.confirmation,120);
 focus.step(state,[90,dir,120,m.inv,tp,4,160,165,dir===-1?113:115,dir===-1?105:107,true]);assert.equal(state.reason,0,'C4/C5 does not expire a valid attempt');
 const done=focus.state();focus.step(done,[90,dir,110,inv,tp,0,110,115,...px,true]);
 focus.step(done,[90,dir,110,inv,tp,5,160,165,dir===-1?109:121,dir===-1?99:111,true,false]);assert.equal(done.rangeDone,true,'A WATCH parent ends when the target is spent, without repairing its stopped attempt');assert.equal(done.reason,1);
}
const frozen=keys.parent([{price:113,side:1,born:70,knownAt:80},{price:114,side:1,born:75,knownAt:95}],{levels:[]},[],90);
assert.equal(frozen.levels.length,1);assert.equal(frozen.levels[0].knownAt,80);
const old={uid:90,confirmedAt:110,endReason:1,endedAt:115},fresh={uid:90,confirmedAt:120,endReason:2,endedAt:140};assert.equal(focus.archive(old,fresh),fresh,'New attempt archive beats old local INV on the same parent');
assert.match(s,/uid=time\[1\]/);assert.match(s,/KeyMap parentReferences = f_parentKeys/);
assert.doesNotMatch(s,/older and bar_index > m.bornIndex\)/);
assert.match(s,/candidate.phase == 1/);assert.match(s,/selected := watching/);
console.log(`PASS ${cases} symmetric parent revalidation cases, preserved C1/old attempt, separate raid/confirmation timestamps, pre-C1 key, no target reuse, C4/C5 tracking, WATCH completion and same-parent archive chronology. Synthetic only.`);
