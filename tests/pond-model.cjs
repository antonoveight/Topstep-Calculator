const assert=require('node:assert/strict');
const {derive}=require('../assets/pond-model.js');
let tested=0;
for(let setup=1;setup<=4;setup++) for(let mask=0;mask<128;mask++) {
 const steps=[0,1,2,3].map(i=>!!(mask&(1<<i))),risk=[4,5,6].map(i=>!!(mask&(1<<i)));
 const s=derive(steps,risk,setup);
 assert.equal(s.checked,steps.filter(Boolean).length);
 assert.ok(steps.slice(0,s.phase).every(Boolean));
 if(s.phase<4) assert.equal(steps[s.phase],false);
 const riskPhase=risk[2]?3:risk[1]?2:risk[0]?1:0;
 assert.equal(s.riskPhase,riskPhase);
 assert.equal(s.stage,riskPhase?4+riskPhase:s.phase);
 if(s.stage===7) assert.equal(risk[2],true);
 if(!riskPhase && s.phase<4) assert.notEqual(s.fishState,'hooked');
 assert.equal(s.setup,setup);tested++;
}
assert.equal(derive([false,false,false,true],[]).stage,0);
assert.equal(derive([false,false,false,false],[false,false,true]).stage,7);
assert.equal(derive([true,true,true,true],[false,true,false]).stage,6);
assert.notEqual(derive([true,true,false,false],[],1).effect,derive([true,true,false,false],[],3).effect);
console.log('PASS '+tested+' combinations: entry prerequisites, independent management and TP priority');
