// Constructed regression based on the user's morning wave and transcribed anchor
// prices/times. This is not a complete raw-OHLC market replay or profitability test.
const assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const h=require('./helpers/pine-channel-harness.cjs').createHarness(source);
const bar=(t,o,h,l,c)=>({t,end:t+5,o,h,l,c});
const tape=[bar(495,3661.12,3664.08,3658.30,3658.93),bar(500,3658.93,3672.02,3658.74,3669.62),bar(505,3669.63,3671.76,3664.09,3667.07),bar(510,3667.11,3672.32,3666.76,3671.77),bar(515,3671.67,3677.84,3669.91,3675.54),bar(520,3675.53,3677.34,3672.05,3676.93),bar(525,3676.88,3678.49,3665.15,3669.00),bar(530,3668.94,3670.14,3661.81,3662.03),bar(535,3662.03,3665.29,3655.13,3656.51),bar(540,3656.49,3658.47,3645.32,3647.53),bar(545,3647.53,3653.15,3646.07,3653.06),bar(550,3653.04,3660.10,3652.15,3660.10),bar(555,3660.14,3660.88,3655.41,3656.71)];
const mirror=b=>({...b,o:7400-b.o,h:7400-b.l,l:7400-b.h,c:7400-b.c});
let prefixes=0;
for(const dir of [-1,1]){
 const bars=dir===-1?tape:tape.map(mirror);
 function run(input=bars, stale=false){
  const ctx={id:400,kind:1,flags:1,phase:1,dir,confirmed:480,inv:dir===-1?3700:3700,cp:dir===-1?3600:3800},state=h.state(ctx),events=[];
  if(stale)Object.assign(state,{p1Ref:dir===-1?3637.25:3762.75,p1At:390,mpsRef:dir===-1?3619.77:3780.23,mpsRefAt:405,raidIndex:-5,raidExtreme:dir===-1?3640:3760,raidReclaimed:true,confirmIndex:0,confirmTime:410,localExtreme:dir===-1?3640:3760});
  for(let i=1;i<input.length;i++){
   const t=input[i].t;
   // Later confirmed internal pivots must not replace the original parent P2.
   const p1=t>=515?3672.02:3670.22,p1At=t>=515?500:480;
   const p2=t>=555?3645.32:t>=515?3664.09:3653.24,p2At=t>=555?540:t>=515?505:485;
   const options=dir===-1?{knownHigh:p1,knownHighAt:p1At,knownLow:p2,knownLowAt:p2At}:{knownHigh:7400-p2,knownHighAt:p2At,knownLow:7400-p1,knownLowAt:p1At};
   const event=h.step(ctx,state,input.slice(0,i+1),{requireKey:false,localKeys:[{kind:2,dir,hi:dir===-1?3679:3729,lo:dir===-1?3671:3721,knownAt:400,beforeTime:480,tf:"60"}],...options});
   if(event.legDetected)events.push({bar:t,p2:state.mpsRef,source:state.mpsRefAt,ts:state.confirmTime});
  }
  return {state,events};
 }
 const full=run();assert.deepEqual(full.events,[{bar:540,p2:dir===-1?3653.24:3746.76,source:485,ts:525}],'Original P2 is broken at 09:00, not the post-TS low at 09:00 later broken in another wave');
 assert.equal(full.state.p1At,480);assert.equal(full.state.mpsRefAt,485);
 assert.deepEqual(run(bars,true).events,full.events,'An old failed range accepted into a full expansion must not lock the morning wave to 06:30/06:45');
 for(let n=2;n<=bars.length;n++){prefixes++;assert.deepEqual(run(bars.slice(0,n)).events,full.events.filter(e=>e.bar<=bars[n-1].t),'No future bars can move the historical MPS');}
}
const expression=source.match(/f_mpsFont\(int visibleBars\) =>\r?\n\s+([^\r\n]+)/)[1].replace(/\bint\(/g,'Math.trunc(').replace(/math\./g,'Math.');
const font=Function('visibleBars','return '+expression);let previous=Infinity;
for(let bars=1;bars<=1000;bars++){
 const size=font(bars);assert.ok(Number.isInteger(size)&&size>=8&&size<=12);assert.ok(size<=previous,'Zooming out never enlarges MPS text');previous=size;
}
assert.ok(font(40)>font(250));
const execution=source.slice(source.indexOf('f_stepChannel('),source.indexOf('var float lastPivotHigh'));
assert.doesNotMatch(execution,/chart\.left_visible|chart\.right_visible|mpsVisibleBars|f_mpsFont/,'Viewport is display-only');
assert.match(source,/label.set_size\(textLabel, fontPoints\)/);
assert.match(source,/line.set_x2\(leftLine, leftEdge\)/);
assert.match(source,/line.set_x1\(rightLine, rightEdge\)/);
assert.doesNotMatch(source,/rootTable|rootRows|traceTable|traceRows|traceBegin|TEMPORARY READ-ONLY DIAGNOSTIC|Temporary structure trace/,'Release source must not contain the on-chart diagnostic/time tables');
console.log(`PASS original P1/P2 through repeated raids, engulfing TS and internal-pivot replacement (${prefixes} immutable prefixes); 1000 monotone zoom-font densities, display/execution isolation.`);
