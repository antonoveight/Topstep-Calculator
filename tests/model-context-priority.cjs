// Execute the actual source preference, including stale-root screenshot regression.
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const expr=s.match(/f_preferCrt\([^\n]+\) =>\r?\n\s+([^\r\n]+)/)[1].replace(/\band\b/g,'&&').replace(/\bor\b/g,'||');
const prefer=Function('candidateBorn','candidateRoot','selectedBorn','selectedRoot','currentIndex','na','return '+expr);
const pick=(models,index)=>{let selected={aT:null,bornIndex:null};for(const c of models)if(c.phase===1&&prefer(c.bornIndex,c.aT,selected.bornIndex,selected.aT,index,x=>x==null))selected=c;return selected;};
const old={aT:10,bornIndex:2,phase:1},near={aT:100,bornIndex:11,phase:1},fresh={aT:120,bornIndex:12,phase:1};
assert.equal(pick([old,near,fresh],12),fresh,'Entry-open pair must not be starved by an ancient C1');
assert.equal(pick([fresh,old,near],12),fresh,'Selection is independent of queue order');
assert.equal(pick([old,near,fresh],16),fresh,'TRACK uses nearest valid C1, not oldest surviving parent');
assert.equal(pick([{...old,bornIndex:12},near,fresh],12),fresh,'A renewed old root cannot displace a fresh adjacent pair');
assert.equal(pick([old,near],12),near);assert.equal(pick([old],16),old,'C4/C5 tracking is retained when no nearer valid setup exists');
assert.equal(pick([{...fresh,phase:0}],12).aT,null,'Invalid parent cannot become WATCH fallback');
assert.match(s,/candidate.phase == 1 and f_preferCrt/);
assert.match(s,/id=focusAvailable \? sId : na, flags=sFlags/);
assert.doesNotMatch(s,/selected := watching/);
console.log('PASS actual source selection: fresh entry priority, nearest valid C1, queue-order independence, no invalid fallback and retained C4/C5 tracking.');
