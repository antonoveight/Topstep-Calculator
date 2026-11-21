// Execute the selection predicate: C3 candidates cannot be starved by old contexts.
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const expr=s.match(/if (na\(selected.uid\) and bar_index == candidate.bornIndex)/)[1].replace(/\band\b/g,'&&');
const choose=Function('selected','candidate','bar_index','na','return '+expr);
const pick=(models,index)=>{let selected={uid:null};for(const candidate of models)if(choose(selected,candidate,index,x=>x==null))selected=candidate;return selected.uid==null?models[0]??selected:selected;};
const a={uid:1,bornIndex:10},b={uid:2,bornIndex:11},c={uid:3,bornIndex:12};
assert.equal(pick([a,b,c],12).uid,3);assert.equal(pick([a,b,c],13).uid,1);
assert.equal(pick([a,b],11).uid,2);assert.equal(pick([],12).uid,null);
assert.match(s,/id=sId, flags=sFlags, phase=sPhase, dir=sDir/);
assert.doesNotMatch(s,/f_contextTier|f_preferContext|crtFallback|egfContext|isbContext/);
assert.match(s,/if array.size\(models\) >= queueLimit and freshPath\n\s+Model oldest = array.shift\(models\)/,'Timeout-off contexts cannot consume all slots and block a fresh C3');
assert.match(s,/lastEnded := f_archive\(oldest, 6, time_close\)/,'Capacity pruning has an explicit non-trade outcome');
console.log('PASS entry-open CRT priority, oldest context fallback and shared signal/drawing model.');
