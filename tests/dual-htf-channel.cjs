// Run the actual scalar channel/lifecycle bodies with independent HTF snapshots.
const assert=require('node:assert/strict'),fs=require('node:fs');
const s=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const h=require('./helpers/pine-channel-harness.cjs').createHarness(s),life=require('./helpers/pine-focus-lifecycle.cjs').createFocusHarness(s);
const tape=[{t:99,o:105,h:108,l:102,c:106},{t:100,o:105,h:108,l:102,c:106},{t:101,o:105,h:107,l:101,c:104},{t:102,o:104,h:106,l:102,c:105}];
const base={id:1,kind:1,flags:1,phase:1,dir:1,age:0,confirmed:100,resolved:100,hi:120,lo:90,inv:90,cp:120};let cases=0;
for(const dir of [1,-1]){
 const bars=dir===1?tape:tape.map(b=>({...b,o:220-b.o,h:220-b.l,l:220-b.h,c:220-b.c}));
 const ctx={...base,dir,inv:dir===1?90:130,cp:dir===1?120:100},higher={...ctx,id:2};
 const a=h.state(ctx),b=h.state(higher);let main=[],large=[];
 for(let i=1;i<bars.length;i++){main.push(h.step({...ctx,age:1},a,bars.slice(0,i+1)));large.push(h.step(higher,b,bars.slice(0,i+1)));}
 cases++;assert.equal(main.some(r=>r.hit),false);assert.equal(large.at(-1).hit,true,'H4 C3 can trigger after H1 C3 has closed');
 const stopped=life.state();life.step(stopped,[1,dir,100,ctx.inv,ctx.cp,0,100,101,dir===1?110:131,dir===1?89:105,true]);
 cases++;assert.equal(stopped.reason,1);assert.equal(b.everSent,true,'Main invalidation did not stop the independent higher state');
 const bothA=h.state(ctx),bothB=h.state(higher);let aa,bb;
 for(let i=1;i<bars.length;i++){aa=h.step(ctx,bothA,bars.slice(0,i+1));bb=h.step(higher,bothB,bars.slice(0,i+1));}
 cases++;assert.equal(aa.hit,true);assert.equal(bb.hit,true,'Same-bar same-direction signals remain attributed to both source models');
 const end=life.state(),trigger=bars.at(-1);
 life.step(end,[2,dir,100,higher.inv,higher.cp,0,100,101,dir===1?120:115,dir===1?102:100,true]);
 const disabled=h.step({...higher,id:end.reason?null:higher.id},h.state(higher),bars);
 cases++;assert.equal(end.reason,2);assert.equal(disabled.hit,false,'A higher target consumed on an earlier closed bar cannot emit later');
 cases++;assert.equal(h.step({...higher,age:1},h.state(higher),bars).hit,false,'Higher C3 expiry closes entry only for that channel');
}
// Different pending TS references can both retest on one LTF candle.
const oppositeTape=[{t:98,o:105,h:108,l:102,c:105},{t:99,o:105,h:108,l:102,c:105},{t:100,o:105,h:108,l:102,c:105}];
const buy={...base,confirmed:80,resolved:80},sell={...buy,id:2,dir:-1,inv:150,cp:60,crtKey:{kind:3,dir:-1,hi:120,lo:120,knownAt:60,beforeTime:70}};
const buyState={...h.state(buy),confirmIndex:0,confirmTime:98,confirmLevel:103,localExtreme:100};
const sellState={...h.state(sell),confirmIndex:0,confirmTime:98,confirmLevel:107,localExtreme:110};
assert.equal(h.step(buy,buyState,oppositeTape,{bias:1}).hit,true);
assert.equal(h.step(sell,sellState,oppositeTape,{bias:1}).hit,true,'An eligible keyed counter-bias source is preserved alongside the other source');
// Actual merged-marker predicates: one marker per direction, with both hints retained.
for(const up of [true,false]){
 const expr=s.match(new RegExp('bool '+(up?'entryLong':'entryShort')+' = ([^\\r\\n]+)'))[1].replace(/\band\b/g,'&&').replace(/\bor\b/g,'||');
 const combine=Function('entryEvent','crtResult','higherResult','return '+expr),d=up?1:-1;
 assert.equal(combine(true,{dir:d},{hit:true,dir:d}),true);
 assert.equal(combine(false,{dir:-d},{hit:true,dir:d}),true);
 assert.equal(combine(true,{dir:d},{hit:true,dir:-d}),true,'Opposing confirmed sources are not silently discarded');
}
const packed=s.match(/HigherSnapshot.new\(id=q0\[1\][^\r\n]+/)[0];
for(const [field,offset] of [['id',0],['flags',1],['phase',3],['dir',4],['hi',5],['lo',6],['inv',7],['cp',8],['confirmed',15],['resolved',16],['age',37],['aT',22],['key',59]])assert.ok(packed.includes(field+'=q'+offset+'[1]'));
assert.match(s,/f_engine\(string sourceTf\)/);assert.match(s,/f_findCrtKey\(swings, time\[1\], 1, high, low, close, sourceTf\)/);
assert.match(s,/f_engine\(largerTf\)/);assert.match(s,/f_higherSnapshot\(\), lookahead=barmerge.lookahead_on/);
assert.match(s,/var ReactionState higherState = ReactionState.new\(\)/);
assert.match(s,/bool higherSignalTfValid = isLtf/);assert.match(s,/timeframe.in_seconds\(biasTf\) >= timeframe.in_seconds\(largerTf\)/);
const higherCode=s.slice(s.indexOf('// Independent higher-TF channel:'),s.indexOf('// Cache by attempt:'));
assert.doesNotMatch(higherCode,/\n\s+(?:lastBuyTime|lastSellTime|lastBuyBar|lastSellBar|crtState) :=/);
assert.doesNotMatch(higherCode,/showCluster|showLargerCluster|largerLive[OHLC]/);
assert.match(s,/markerResults = array.from\(crtResult, higherResult\)/);
assert.equal((s.match(/f_note\(true, buyHint\)/g)||[]).length,1);assert.equal((s.match(/f_note\(false, sellHint\)/g)||[]).length,1);
assert.match(s,/plot\(higherResult.hit \? higherResult.dir : na, "Higher CRT direction/);
assert.match(s,/bool entryEvent = crtResult.hit/,'Legacy main export remains isolated from higher-only events');
assert.match(s,/diagnosticToken = htf \+ ":"/);assert.match(s,/higherDiagnosticToken = largerTf \+ ":"/);
assert.match(s,/int markLimit = historyMarks == 0 \? 0 : retainHistory \? historyMarks : 2/);
assert.match(s,/if not retainHistory and markLimit > 0 and \(entryLong or entryShort or earlyResult.hit\)\r?\n\s+while array.size\(eventLabels\) > 0\r?\n\s+f_dropMark\(0\)/,'Latest clears older event bars before keeping both current directions');
assert.equal((s.match(/= input\./g)||[]).length,24);
console.log(`PASS ${cases} symmetric dual-HTF channel traces, own windows/barriers/states, merged marker predicates, explicit source attribution, previous-only packed snapshot, display isolation and main audit isolation. Not market Replay.`);
