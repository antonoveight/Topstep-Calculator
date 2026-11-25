// Restricted actual Pine function bodies; explicit completed-pivot inputs.
// Constructed cases, not an XAUUSD feed replay or profitability test.
const assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync(process.argv[2]||'indicators/funded-angler-v6.pine','utf8');
const h=require('./helpers/pine-early-c2-harness.cjs').createEarlyHarness(source);
const channel=require('./helpers/pine-channel-harness.cjs').createHarness(source);
const baseRef={start:100,finish:112,c1Time:90,c1End:100,c1O:110,c1H:120,c1L:90,c1C:115};
const bar=(t,o,h,l,c)=>({t,o,h,l,c});
const oldPeak=[bar(100,122,125,121,124),bar(101,124,124,120,122),bar(102,122,123,118,121),bar(103,120,120,117,119),bar(104,119,119,115,116)];
const validPeak=oldPeak.map(b=>b.t===100?{...b,h:123,c:122}:b.t===101?{...b,o:122,h:123}:b.t===103?{...b,o:124,h:125}:b);
const mirror=b=>({...b,o:220-b.o,h:220-b.l,l:220-b.h,c:220-b.c});
let prefixes=0;
for(const dir of [-1,1]){
 const ref=dir===-1?baseRef:{...baseRef,c1O:220-baseRef.c1O,c1H:220-baseRef.c1L,c1L:220-baseRef.c1H,c1C:220-baseRef.c1C};
 const key=h.make('CrtKey',{kind:2,dir,lo:dir===-1?120:95,hi:dir===-1?125:100,knownAt:80,beforeTime:100,tf:'60'});
 function run(input,{p2At=102,confirmed=true}={}){
  const bars=dir===-1?input:input.map(mirror),state=h.state(),out=[];
  for(let i=0;i<bars.length;i++){
   // The pair is supplied only after its source bars can have completed.
   const pivots=i<3?{}:dir===-1?{knownHigh:124,knownHighAt:95,knownLow:118,knownLowAt:p2At}:{knownLow:96,knownLowAt:95,knownHigh:102,knownHighAt:p2At};
   const options={bias:dir,confirmed,...pivots,...(dir===-1?{sellKey:i>=3?key:h.make('CrtKey')}:{buyKey:i>=3?key:h.make('CrtKey')})};
   const result=h.step(ref,state,bars.slice(0,i+1),options);
   out.push({bar:bars[i].t,hit:result.hit,mps:state.channel?.mpsAt??null});
  }
  return {state,out};
 }
 const invalid=run(oldPeak);
 assert.equal(invalid.state.channel.mpsAt,null,'P3 before P2 must never seed a later MPS');
 assert.equal(invalid.state.channel.mpsRef,null,'Invalid early structure is not handed to the confirmed parent');
 assert.equal(invalid.out.filter(x=>x.hit).length,1,'A pure TS-close Early entry remains independent of MPS');
 const valid=run(validPeak);
 assert.equal(valid.state.channel.p1At,95);
 assert.equal(valid.state.channel.mpsRefAt,102);
 assert.equal(valid.state.channel.p3At,103);
 assert.equal(valid.state.channel.mpsAt,105,'A valid post-P2 P3 still confirms on the later closed break bar');
 assert.equal(valid.state.channel.localExtreme,dir===-1?125:95,'Wick extreme, not candle body');
 const sameCandle=oldPeak.map(b=>b.t===100?{...b,l:118}:b);
 assert.equal(run(sameCandle,{p2At:100}).state.channel.mpsAt,null,'P2 and P3 in one candle have unknown intrabar order');
 const retouch=oldPeak.map(b=>b.t===103?{...b,o:124,h:125}:b);
 const touched=run(retouch);
 assert.equal(touched.state.channel.p3At,103,'Equal extreme revisited after P2 is a real new touch');
 assert.equal(touched.state.channel.mpsAt,105);
 assert.equal(dir===-1?touched.state.highCandleLow:touched.state.lowCandleHigh,dir===-1?117:103,'Companion wick belongs to the same latest peak candle');
 const noSweep=validPeak.map(b=>b.t===103?{...b,o:122,h:123}:b);
 assert.equal(run(noSweep).state.channel.mpsAt,null,'P3 must actually exceed P1 by the minimum sweep');
 const immediate=validPeak.slice(0,4).map(b=>b.t===103?{...b,l:115,c:116}:b);
 assert.equal(run(immediate).state.channel.mpsAt,104,'Same TS candle can confirm MPS after an earlier completed P2');
 const immediateBad=oldPeak.slice(0,4).map(b=>b.t===103?{...b,l:115,c:116}:b);
 assert.equal(run(immediateBad).state.channel.mpsAt,null,'Initial MPS uses the same chronological gate');
 const unknownPair=run(validPeak,{p2At:null});
 assert.equal(unknownPair.state.channel.mpsAt,null);
 assert.ok(run(validPeak,{confirmed:false}).out.every(x=>!x.hit&&x.mps==null));
 for(const tape of [oldPeak,validPeak,sameCandle,retouch,noSweep,immediate,immediateBad]){
  const full=run(tape).out;
  for(let n=1;n<=tape.length;n++){
   prefixes++;
   assert.deepEqual(run(tape.slice(0,n)).out,full.slice(0,n),'No future bars alter an earlier signal/MPS');
  }
 }
 // Shared gate protects both Main/Larger and evidence copied across handoff.
 const previous=dir===-1?oldPeak[3]:mirror(oldPeak[3]),current=dir===-1?oldPeak[4]:mirror(oldPeak[4]);
 const ctx={id:90,kind:1,dir,confirmed:100,inv:dir===-1?130:90,cp:dir===-1?90:130,crtKey:key};
 function seeded(peakAt,extreme=dir===-1?125:95){
  const state=channel.state(ctx);
  Object.assign(state,{confirmIndex:0,confirmTime:103,localExtreme:extreme,p1Ref:dir===-1?124:96,p1At:95,mpsRef:dir===-1?118:102,mpsRefAt:102,p3At:peakAt,p3Key:key,p3KeyAt:104,raidIndex:0,raidExtreme:extreme,raidReclaimed:true,branchMask:1,legExtreme:dir===-1?117:103});
  const result=channel.step(ctx,state,[previous,current]);
  return result.legDetected;
 }
 assert.equal(seeded(100),false);
 assert.equal(seeded(102),false);
 assert.equal(seeded(104),false,'A peak after the TS confirmation cannot backfill it');
 assert.equal(seeded(null),false);
 assert.equal(seeded(103,dir===-1?123:97),false,'Chronology alone cannot replace the required sweep');
 assert.equal(seeded(103),true,'Valid chronology and sweep survive shared validation');
 // New C2 must discard peak timestamps from the preceding window.
 h.step({...ref,start:105,finish:117},valid.state,[dir===-1?bar(105,110,113,108,111):mirror(bar(105,110,113,108,111))],{bias:dir});
 assert.equal(valid.state.hiAt,105);assert.equal(valid.state.loAt,105);
}
console.log(`PASS symmetric Early MPS chronology: pre-P2/equal-time rejection, post-P2 wick and retouch acceptance, immediate/later close, independent TS entry, shared/handoff guard and window reset; ${prefixes} immutable prefixes. Constructed data only.`);
