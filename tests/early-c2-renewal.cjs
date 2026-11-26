// Actual Early body + channel, constructed closed OHLC; not MNQ market Replay.
const fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const h=require('./helpers/pine-early-c2-harness.cjs').createEarlyHarness(source);
const ref={start:100,finish:120,c1Time:90,c1End:100,c1O:100,c1H:110,c1L:90,c1C:100};
const base=[{t:100,o:100,h:108,l:95,c:100},{t:101,o:95,h:104,l:89,c:100},{t:102,o:100,h:106,l:97,c:104},{t:103,o:100,h:106,l:88,c:104},{t:104,o:104,h:107,l:98,c:105}];
const mirror=b=>({...b,o:200-b.o,h:200-b.l,l:200-b.h,c:200-b.c});
let cases=0,prefixes=0;
function run(dir,bars=base,options={},reference=ref){
 const tape=dir===1?bars:bars.map(mirror),state=h.state(),results=[],snapshots=[];
 const key=h.make('CrtKey',{kind:1,dir,lo:dir===1?88:105,hi:dir===1?95:112,knownAt:80,beforeTime:reference.start,tf:'60'});
 for(let n=1;n<=tape.length;n++){
  const opts={bias:dir,branches:'TS close',...(dir===1?{buyKey:key}:{sellKey:key}),...(typeof options==='function'?options(n):options)};
  results.push(h.step(reference,state,tape.slice(0,n),opts));snapshots.push(JSON.parse(JSON.stringify(state)));
 }
 cases++;return {state,results,snapshots,hits:results.flatMap((r,i)=>r.hit?[{...r,t:tape[i].t}]:[])};
}
for(const dir of [1,-1]){
 const fresh=run(dir);
 assert.deepEqual(fresh.hits.map(x=>[x.t,x.attempt]),[[101,1],[103,2]],'Deeper sweep + reclaim may qualify on the stop bar itself');
 assert.deepEqual(fresh.hits.map(x=>x.inv),dir===1?[89,88]:[111,112]);
 assert.equal(fresh.hits[0].inv,dir===1?89:111,'New attempt never rewrites the historical reference');
 assert.equal(fresh.snapshots[3].retiredExtreme,dir===1?89:111);
 assert.equal(fresh.state.attemptEmitted,true);
 const fallback=[{t:100,o:100,h:108,l:95,c:100},{t:101,o:106,h:108,l:89,c:105},{t:102,o:105,h:106,l:101,c:102},{t:103,o:102,h:105,l:99,c:104},{t:104,o:102,h:105,l:98,c:103},{t:105,o:101,h:105,l:97,c:104}];
 const local=h.make('CrtKey',{kind:2,dir,lo:dir===1?94:99,hi:dir===1?101:106,knownAt:80,beforeTime:100,tf:'60'});
 assert.deepEqual(run(dir,fallback,{localKeys:[local]}).hits.map(x=>x.t),[103],'Local fallback also spends exactly one Early event until the whole attempt extreme is invalidated');
 for(let n=1;n<=base.length;n++){prefixes++;assert.deepEqual(run(dir,base.slice(0,n)).hits,fresh.hits.filter(x=>x.t<=base[n-1].t),'No later bar inserts/removes an earlier event');}
 const one=run(dir,base,{cadence:'One per model'});
 assert.deepEqual(one.hits.map(x=>x.t),[101]);assert.equal(one.state.attempts,2,'Observation continues despite the window emission limit');
 assert.equal(one.state.channel.everSent,true,'Handoff must retain the One-per-model budget after renewal');
 assert.equal(fresh.state.channel.everSent,true,'Fresh handoff carries the current attempt emission to prevent a duplicate');
 for(const low of [89,88.9]){
  const bars=base.map((b,i)=>i===3?{...b,l:low}:b);
  assert.deepEqual(run(dir,bars).hits.map(x=>x.t),[101],'Equality/sub-tick touch cannot rearm');
 }
 const delayed=[...base.slice(0,3),{t:103,o:100,h:101,l:88,c:89},{t:104,o:89,h:96,l:88.5,c:92},{t:105,o:92,h:103,l:91,c:100}];
 const wait=run(dir,delayed);
 assert.deepEqual(wait.hits.map(x=>x.t),[101,105],'Wait for inside range + key reclaim after a deeper raid');
 assert.equal(wait.hits[1].inv,dir===1?88:112,'SL reference includes the full earlier wick, not just reclaim candle');
 const contact=[{t:100,o:100,h:108,l:95,c:100},{t:101,o:94,h:96,l:89,c:92},{t:102,o:92,h:103,l:91,c:100}];
 const pending=run(dir,contact);
 assert.equal(pending.snapshots[1].blocked,false,'Unreclaimed candidate key is pending, not permanently lost');
 assert.deepEqual(pending.hits.map(x=>x.t),[102]);
 const target=base.map((b,i)=>i===3?{...b,h:111}:b);
 const terminal=run(dir,target);assert.deepEqual(terminal.hits.map(x=>x.t),[101]);assert.equal(terminal.state.blocked,true,'Target + stop same bar remains ambiguous and terminal');
 const noKey=run(dir,base,n=>n>=4?{localKeys:[]}:{});
 assert.deepEqual(noKey.hits.map(x=>x.t),[101],'A deeper sweep alone cannot substitute for fresh local HTF key proof');
 for(const opts of [{enabled:false},{permitEntry:false},{confirmed:false},{bias:0},{confirmedHit:true},{isLtf:false}])assert.equal(run(dir,base,opts).hits.length,0,'Keep existing entry gates');
 assert.deepEqual(run(dir,base,{}, {...ref,finish:104}).hits.map(x=>x.t),[101],'No new Early on C2 closing bar');
 const repeated=[...base,{t:105,o:100,h:106,l:87,c:104},{t:106,o:104,h:108,l:99,c:106}];
 assert.deepEqual(run(dir,repeated).hits.map(x=>[x.t,x.attempt]),[[101,1],[103,2],[105,3]],'Each strict renewed extreme owns one event');
 const shifted=base.map(b=>({...b,t:b.t+20}));
 const state=h.state(),key=h.make('CrtKey',{kind:1,dir,lo:dir===1?88:105,hi:dir===1?95:112,knownAt:80,beforeTime:100,tf:'60'});
 const first=dir===1?base:base.map(mirror);
 for(let n=1;n<=first.length;n++)h.step(ref,state,first.slice(0,n),{bias:dir,...(dir===1?{buyKey:key}:{sellKey:key})});
 const newRef={...ref,start:120,finish:140,c1Time:110,c1End:120},newKey=h.make('CrtKey',{...key,beforeTime:120}),next=dir===1?shifted:shifted.map(mirror),hits=[];
 for(let n=1;n<=next.length;n++){const out=h.step(newRef,state,next.slice(0,n),{bias:dir,...(dir===1?{buyKey:newKey}:{sellKey:newKey})});if(out.hit)hits.push(out.attempt);}
 assert.deepEqual(hits,[1,2],'A new C2 starts a separate attempt sequence');
}
assert.equal(source,fs.readFileSync('chibao.txt','utf8'));
console.log(`PASS ${cases} symmetric Early renewal scenarios and ${prefixes} immutable prefixes: new extreme/reclaim, same-bar renewal, cadence, pending key, terminal target, source gates and frozen historical references.`);
