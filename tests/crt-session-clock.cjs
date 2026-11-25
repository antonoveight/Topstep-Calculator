const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const h=require('./helpers/pine-clock-harness.cjs').createClockHarness(s),H=3600000,at=t=>Date.parse(t),iso=x=>new Date(x).toISOString();
for(const [date,tf,start,end] of [
 ['2026-11-25T17:13:00+07:00','120','2026-11-25T16:00:00+07:00','2026-11-25T18:00:00+07:00'],
 ['2026-11-25T17:13:00+07:00','240','2026-11-25T14:00:00+07:00','2026-11-25T18:00:00+07:00'],
 ['2026-07-15T16:13:00+07:00','240','2026-07-15T13:00:00+07:00','2026-07-15T17:00:00+07:00'],
 ['2026-11-25T15:20:00-06:00','240','2026-11-25T13:00:00-06:00','2026-11-25T16:00:00-06:00'],
 ['2026-03-08T17:00:00-05:00','240','2026-03-08T17:00:00-05:00','2026-03-08T21:00:00-05:00'],
 ['2026-11-01T17:00:00-06:00','240','2026-11-01T17:00:00-06:00','2026-11-01T21:00:00-06:00'],
 ['2026-12-31T23:20:00-06:00','120','2026-12-31T23:00:00-06:00','2027-01-01T01:00:00-06:00'],
])assert.deepEqual(h.session(at(date),tf),[at(start),at(end)],date+' regular clock (not holiday calendar)');
for(const t of ['2026-11-25T16:30:00-06:00','2026-11-27T17:00:00-06:00','2026-11-28T12:00:00-06:00'])assert.deepEqual(h.session(at(t),'240'),[null,null],'No maintenance/weekend bucket');
const base=at('2026-11-24T17:00:00-06:00'),hour=(n,props={})=>h.candle({t:base+n*H,e:base+(n+1)*H,o:100+n,h:106+n,l:90-n,c:102+n,...props});
const patterns=h.compile('f_patterns',['c1o','c1h','c1l','c1c','c2o','c2h','c2l','c2c'],{sweepSize:.25,tsReference:'C1 range',manualSsl:0,manualBsl:0});
for(const tf of ['120','240']){
 const size=+tf/60,state=h.state();for(let n=0;n<size-1;n++)assert.equal(h.feed(state,hour(n),tf),false,'No premature HTF completion');
 assert.equal(h.feed(state,hour(size-1),tf),true);assert.deepEqual(state.bars[0],h.candle({t:base,e:base+size*H,o:100,h:105+size,l:91-size,c:101+size}),'Exact wick extremes and first-open/last-close');
 const frozen=JSON.stringify(state.bars[0]);assert.equal(h.feed(state,hour(size-1,{h:999}),tf),false,'Same completed H1 cannot revise history');
 h.feed(state,hour(size,{h:999}),tf);assert.equal(JSON.stringify(state.bars[0]),frozen,'Later forming bar never changes closed C1');
 const partial=h.state();for(let n=1;n<size;n++)h.feed(partial,hour(n),tf);assert.equal(partial.bars.length,0,'Incomplete first bucket discarded');
 const gap=h.state();for(let n=0;n<size;n++)if(n!==1)h.feed(gap,hour(n),tf);assert.equal(gap.bars.length,0,'Missing H1 cannot form a candle');
}
const tail=h.state();for(let n=20;n<23;n++)h.feed(tail,hour(n),'240');assert.equal(tail.bars.length,1);assert.equal(tail.bars[0].e-tail.bars[0].t,3*H,'Last regular H4 closes at 16 CT after three hours');
const wholeGap=h.state();h.feed(wholeGap,hour(0),'120');h.feed(wholeGap,hour(1),'120');h.feed(wholeGap,hour(4),'120');h.feed(wholeGap,hour(5),'120');assert.equal(wholeGap.bars.length,1,'Missing entire bucket cannot supply the previous C1');assert.ok(wholeGap.seq>1,'Missing source cannot masquerade as original C3');
for(const lastHour of [19,20]){
 const missingTail=h.state();for(let n=16;n<=lastHour;n++)h.feed(missingTail,hour(n),'240');
 assert.ok(missingTail.bars.length>0);h.feed(missingTail,hour(24),'240');
 assert.equal(missingTail.bars.length,0,'Missing all/part of the last bucket cannot be disguised as the daily break');
}
for(const [friday,sunday] of [['2026-03-06T13:00:00-06:00','2026-03-08T17:00:00-05:00'],['2026-10-30T13:00:00-05:00','2026-11-01T17:00:00-06:00'],['2026-11-20T13:00:00-06:00','2026-11-22T17:00:00-06:00']]){
 const weekend=h.state(),t=at(friday);for(let n=0;n<3;n++)h.feed(weekend,h.candle({t:t+n*H,e:t+(n+1)*H,o:100,h:105,l:95,c:101}),'240');
 const before=JSON.stringify(weekend.bars);const next=at(sunday);h.feed(weekend,h.candle({t:next,e:next+H,o:101,h:104,l:96,c:102}),'240');
 assert.equal(JSON.stringify(weekend.bars),before,'Regular 48/49/50-hour DST weekends preserve the preceding complete candle');
}
const nativeFeed=h.state();const nativeBars=[h.candle({t:base,e:base+23*H,o:100,h:110,l:90,c:105}),h.candle({t:base+72*H,e:base+96*H,o:105,h:112,l:92,c:106})];
for(const item of nativeBars)assert.equal(h.nativeFeed(nativeFeed,item),true);
assert.deepEqual(nativeFeed.bars,nativeBars,'Native candle OHLC/endpoints and native calendar gaps are unchanged');
// Both custom directions: candles are built from explicit H1 prefixes, not native H2 open/close.
for(const dir of [1,-1]){const state=h.state();const data=dir===1?[
 {o:104,h:110,l:100,c:105},{o:105,h:109,l:101,c:104},{o:104,h:106,l:98,c:102},{o:102,h:107,l:99,c:103}
]:[{o:104,h:110,l:100,c:105},{o:105,h:109,l:101,c:104},{o:104,h:112,l:102,c:108},{o:108,h:111,l:101,c:106}];
 data.forEach((b,i)=>h.feed(state,hour(i,b),'120'));const [c1,c2]=state.bars;assert.equal(dir===1?c2.l<c1.l:c2.h>c1.h,true);assert.ok(c2.c>c1.l&&c2.c<c1.h);assert.equal(c1.t,base);assert.equal(c2.t,base+2*H);
 assert.deepEqual(patterns(c1.o,c1.h,c1.l,c1.c,c2.o,c2.h,c2.l,c2.c),[dir===1,dir===-1],'Actual CRT detector uses the reconstructed C1/C2 wick and close');
}
const native=require('./helpers/pine-crt-key-harness.cjs').createKeyHarness(s);let zones=[],reference=[],tape=[];let seed=13;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
for(let i=0;i<240;i++){const o=100+random()*40,c=o+(random()-.5)*16;tape.push({t:base+i*2*H,e:base+(i+1)*2*H,end:base+(i+1)*2*H,o,h:Math.max(o,c)+random()*5,l:Math.min(o,c)-random()*5,c});h.zones(zones,tape.slice(-8),'120');native.zoneStep(reference,tape,7200);assert.deepEqual(zones,reference,'Aligned keys preserve native FVG/OB/open/close formulas at '+i);}
const piv=(values)=>h.pivots(values.map((v,i)=>h.candle({t:i,h:v,l:-v})));
assert.deepEqual(piv([1,2,5,4,3]),[5,-5,2]);assert.deepEqual(piv([1,5,5,4,3]),[5,-5,2]);assert.deepEqual(piv([1,2,5,5,3]),[null,null,2]);
assert.match(s,/htfClock = input.string\("TopstepX"/);
const market=h.compile('f_topstepClockMarket',['mainTicker']);
let policies=0;
for(const id of ['OANDA:XAUUSD','STONEXTRADING:USTECH100CFD','OANDA:NAS100USD','BINANCE:BTCUSDT','CME_MINI:MNQ1!','FOREXCOM:EURUSD'])for(const clock of ['TopstepX','Native'])for(const tf of ['60','120','240','1D']){
 const aligned=h.compile('f_alignedTf',['sourceTf'],{htfClock:clock,f_topstepClockMarket:market,ticker:{standard:x=>x},syminfo:{main_tickerid:id,tickerid:'OTHER:SMT_PEER'}});
 const supported=['OANDA:XAUUSD','STONEXTRADING:USTECH100CFD'].includes(id);
 assert.equal(market(id),supported);assert.equal(aligned(tf),clock==='TopstepX'&&supported&&['120','240'].includes(tf),'Policy '+id+' / '+clock+' / '+tf);policies++;
}
assert.equal(policies,48);
assert.match(s,/f_topstepClockMarket\(ticker.standard\(syminfo.main_tickerid\)\)/,'SMT request inherits main market identity, never peer identity');
assert.match(s,/overviewMode = timeframe.in_seconds\(timeframe.main_period\)/,'Main H2/H4 chart identity survives an H1 transport request');
assert.match(s,/f_alignedTf\(sourceTf\) \? "60" : sourceTf/);
assert.match(s,/ClockCandle part = ClockCandle.new\(t=time\[1\], e=time_close\[1\], o=open\[1\], h=high\[1\], l=low\[1\], c=close\[1\]\)/);
assert.doesNotMatch(h.body('f_stepRegistry').join('\n'),/\b(?:open|high|low|close|time|time_close)\[/,'Registry reads explicit source candle, never native HTF history');
assert.match(s,/\[requestedMain, executionMain, mainPreview\] = request.security\([^\n]+lookahead=f_sourceLookahead\(htf\)/);
assert.match(s,/\[requestedHigher, executionLarger, largerPreview\] = request.security\([^\n]+lookahead=f_sourceLookahead\(largerTf\)/);
assert.doesNotMatch(s.slice(s.indexOf('f_stepChannel('),s.indexOf('f_tfName(')),/(?:mainPreview|largerPreview)\.live/,'Developing display values cannot enter signals');
assert.match(s,/f_alignedTf\(sourceTf\) and chartSeconds > 3600 \? barmerge.lookahead_off : barmerge.lookahead_on/);
assert.match(s,/AlignedTape feed = f_alignedTape\(sourceTf\)/,'Native and aligned sources share one closed-source packet');
assert.match(s,/f_alignedTf\(sourceTf\) \? start\[1\] : time\[1\]/,'Native H1/D1 source boundaries stay native, exactly one offset');
assert.match(s,/f_patterns\(source.prevO, source.prevH, source.prevL, source.prevC, source.o, source.h, source.l, source.c\)/,'Detector reads the exact packet used by its clock');
assert.match(s,/if advance\s+priorKeys := keys/,'Source keys advance once per closed source candle');
console.log('PASS clock API/reference CT calendar and actual-source H2/H4 OHLC/partial/gap/causal feed, both raid directions, 240 key equivalence traces, pivots and display/engine separation. No claim of MGC price equivalence or holiday coverage.');
