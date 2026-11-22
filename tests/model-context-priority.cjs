// Actual source predicate: live attempts take priority; a WATCH parent is context only.
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const expr=s.match(/if (na\(selected.uid\) and candidate.phase == 1)/)[1].replace(/\band\b/g,'&&');
const choose=Function('selected','candidate','na','return '+expr);
const pick=models=>{let selected={uid:null},watching={uid:null};for(const c of models){if(c.phase===0)watching=c;if(choose(selected,c,x=>x==null))selected=c;}return selected.uid==null?watching:selected;};
const a={uid:1,phase:1},b={uid:2,phase:1},c={uid:3,phase:0};
assert.equal(pick([a,b,c]).uid,1);assert.equal(pick([c,b]).uid,2);assert.equal(pick([{...a,phase:0},c]).uid,3);assert.equal(pick([]).uid,null);
assert.match(s,/selected := watching/);assert.match(s,/id=focusAvailable \? sId : na, flags=sFlags/);
assert.match(s,/bool rangeAvailable =/);assert.match(s,/bool focusAvailable = rangeAvailable and sPhase == 1/);
assert.match(s,/lastEnded := f_archive\(oldest, 6, time_close\)/);
console.log('PASS oldest live attempt priority, newest WATCH context, lifecycle-gated entries and bounded parent storage.');
