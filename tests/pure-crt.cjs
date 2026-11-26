// Actual Pine scalar body; synthetic OHLC, not market replay.
const assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const h=require('./helpers/pine-channel-harness.cjs').createHarness(source);
const b=(t,o,h,l,c)=>({t,end:t+1,o,h,l,c});
const sell=[b(100,104,108,102,106),b(101,108,111,103,105),b(102,104,105,99,100),b(103,99,101,96,97),b(104,104,107,100,101),b(105,101,104,98,100),b(106,100,104,97,99)];
const mirror=x=>({...x,o:220-x.o,h:220-x.l,l:220-x.h,c:220-x.c});
let cases=0,prefixes=0;
function run(tape,dir=-1,options={},extra={}){
 const ctx={id:1,kind:1,flags:1,phase:1,dir,age:0,confirmed:100,resolved:100,inv:dir===-1?120:100,cp:dir===-1?80:140,crtKey:{kind:1,dir,hi:dir===-1?114:110,lo:dir===-1?110:106,knownAt:80,beforeTime:90},...extra};
 const state=h.state(ctx),trace=[];
 for(let i=1;i<tape.length;i++)trace.push(h.step(ctx,state,tape.slice(0,i+1),{knownLow:dir===-1?102:112,knownHigh:dir===-1?108:118,knownHighAt:dir===-1?95:98,knownLowAt:dir===-1?98:95,...options}));
 cases++;return {state,trace,hits:trace.flatMap((r,i)=>r.hit?[{t:tape[i+1].t,tag:r.tag,low:r.zoneLow,high:r.zoneHigh,known:r.zoneKnownAt}]:[])};
}
for(const dir of [-1,1]){
 const tape=dir===-1?sell:sell.map(mirror),test=(o={},extra={},bars=tape)=>run(bars,dir,o,extra);
 const got=test();
 assert.equal(got.hits[0].t,101,'Direct triangle is on the closed sweep candle');
 assert.equal(got.hits[0].tag,'TS_CLOSE','No mandatory MPS or second retest');
 assert.equal(got.trace[0].legDetected,false);
 assert.equal(got.trace[1].legDetected,true,'Later close through pre-TS pivot records MPS');
 const retrace=got.hits.find(x=>x.tag.includes('OTE'));
 assert.ok(retrace,'Automatic OTE needs no second TS');assert.equal(retrace.t,104);
 assert.equal(retrace.low,dir===-1?103.5:112);
 assert.equal(retrace.high,dir===-1?108:116.5,'OTE uses full leg endpoint, not MPS-bar wick');
 assert.ok(got.hits.some(x=>x.tag.includes('FVG')),'FVG has its own branch budget');
 assert.ok(!got.trace[2].hit,'FVG formation is not its own retest');
 assert.equal(test({branches:'TS close'}).hits.length,1);
 assert.ok(test({branches:'FVG / OTE'}).hits.every(x=>!x.tag.includes('TS_CLOSE')));
 assert.equal(test({cadence:'One per model'}).hits.length,1);
 for(const opts of [{confirmed:false},{isLtf:false},{timeAllowed:false},{waveAllowed:false},{bias:0}])assert.deepEqual(test(opts).hits,[]);
 assert.deepEqual(test({}, {crtKey:null}).hits,[]);
 assert.ok(test({requireKey:false},{crtKey:null}).hits.length>0);
 assert.ok(test({bias:-dir,allowCrtCounter:true}).hits.length>0,'Prior held zone allows optional CRT reversal');
 assert.deepEqual(test({bias:-dir,allowCrtCounter:false}).hits,[]);
 assert.deepEqual(test({}, {crtKey:{kind:2,dir,hi:114,lo:102,knownAt:102,beforeTime:90}}).hits,[],'No future key');
 assert.ok(test({}, {age:3}).hits.length>0,'A live CRT can continue after C3');
 assert.equal(test({}, {confirmed:101}).hits[0].t,101,'Known structural P1/P2 may predate activation; the raid/entry itself must not');
 assert.deepEqual(test({knownHigh:null,knownLow:null}, {confirmed:101}).hits,[],'Fallback adjacent TS still requires its source candle after activation');
 const double=tape.slice(0,2).map((x,i)=>i===1?{...x,h:Math.max(x.h,tape[0].h+1),l:Math.min(x.l,tape[0].l-1)}:x);
 assert.equal(test({}, {},double).hits[0].t,101,'An engulfing raid can reclaim structural P1 despite sweeping both ends of the immediately previous candle');
 assert.deepEqual(test({knownHigh:null,knownLow:null}, {},double).hits,[],'No structural range: ambiguous two-sided adjacent sweep is still rejected');
 const target=tape.slice(0,2).map((x,i)=>i===1?{...x,...(dir===-1?{l:79}:{h:141})}:x);
 assert.deepEqual(test({}, {},target).hits,[]);
 const stop=tape.slice(0,2).map((x,i)=>i===1?{...x,...(dir===-1?{h:121}:{l:99})}:x);
 assert.deepEqual(test({}, {},stop).hits,[]);
 const noMps=test({knownLow:null,knownHigh:null});
 assert.ok(noMps.hits.some(x=>x.tag.includes('FVG')),'FVG works without MPS');
 assert.ok(noMps.hits.every(x=>!x.tag.includes('OTE')),'OTE requires MPS');
 const spent=test(dir===-1?{knownLow:107}:{knownHigh:113});
 assert.ok(spent.hits.every(x=>!x.tag.includes('OTE')),'A P2 already closed through before TS cannot become a fresh MPS');
 const sameClose=test(dir===-1?{knownLow:106}:{knownHigh:114});
 assert.equal(sameClose.trace[0].legDetected,true,'A TS close can also be the first structural cross; OTE still waits for a later bar');
 const extension=tape.map(x=>x.t===104?{...x,...(dir===-1?{l:95}:{h:125})}:x);
 assert.ok(!test({}, {},extension).hits.some(x=>x.t===104&&x.tag.includes('OTE')),'Do not infer intrabar new-extreme/retrace order');
 for(let n=2;n<=tape.length;n++){prefixes++;assert.deepEqual(test({}, {},tape.slice(0,n)).hits,got.hits.filter(x=>x.t<=tape[n-1].t),'No backfilled historical signal');}
 const ctx={id:2,kind:1,dir,confirmed:100,inv:dir===-1?120:100,cp:dir===-1?80:140};
 const state=h.state(ctx);h.step(ctx,state,tape.slice(0,2),{requireKey:false});assert.equal(h.step(ctx,state,tape.slice(0,2),{requireKey:false}).hit,false);
}
assert.equal(source,fs.readFileSync('chibao.txt','utf8'));
assert.doesNotMatch(source,/CISD|\bMSS\b|Quarterly|TrueOpen|requireMps|r1Mode/);
console.log(`PASS ${cases} symmetric actual-channel scenarios, ${prefixes} immutable prefixes: TS close, FVG before MPS, full-leg OTE, keys, barriers and branch dedup. Synthetic only.`);
