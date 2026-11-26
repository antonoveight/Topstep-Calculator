// Same hourly prices, different candle boundaries. No market-data equivalence claim.
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const h=require('./helpers/pine-clock-harness.cjs').createClockHarness(s);
const pattern=h.compile('f_patterns',['c1o','c1h','c1l','c1c','c2o','c2h','c2l','c2c'],{sweepSize:.01,tsReference:'C1 range',manualSsl:0,manualBsl:0});
const H=3600000,base=Date.parse('2026-11-24T16:00:00-06:00');
const aggregate=parts=>h.candle({t:parts[0].t,e:parts.at(-1).e,o:parts[0].o,h:Math.max(...parts.map(x=>x.h)),l:Math.min(...parts.map(x=>x.l)),c:parts.at(-1).c});
const direction=bars=>{
 const [a,b]=bars.slice(-2);if(!a||!b)return 0;
 const [buy,sell]=pattern(a.o,a.h,a.l,a.c,b.o,b.h,b.l,b.c);
 // Registry excludes a C2 that has already touched the opposite C1 target.
 return buy&&b.h<a.h?1:sell&&b.l>a.l?-1:0;
};
let seed=763,trials=0,prefixChecks=0;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
const evidence=[];
for(const tf of ['120','240']){
 const size=+tf/60,found=new Map();
 for(let attempt=0;attempt<5000&&found.size<3;attempt++){
  let price=100;const parts=[];
  for(let n=0;n<=size*2;n++){
   const o=price,c=o+(random()-.5)*12;
   parts.push(h.candle({t:base+n*H,e:base+(n+1)*H,o,h:Math.max(o,c)+random()*4,l:Math.min(o,c)-random()*4,c}));price=c;
  }
  const aligned=h.state();for(const part of parts)h.feed(aligned,part,tf);
  const native=[aggregate(parts.slice(0,size)),aggregate(parts.slice(size,size*2))];
  const a=direction(aligned.bars),n=direction(native);trials++;
  const kind=n!==0&&a===0?'native-only':a!==0&&n===0?'aligned-only':a!==0&&n===-a?'opposite':null;
  if(kind&&!found.has(kind))found.set(kind,{tf,kind,parts,aligned:aligned.bars.slice(-2),native,alignedDirection:a,nativeDirection:n});
 }
 assert.equal(found.size,3,'Find native-only/aligned-only/opposite shapes for '+tf);
 for(const sample of found.values()){
  for(const reflect of [false,true]){
   const mirror=b=>h.candle({...b,o:220-b.o,h:220-b.l,l:220-b.h,c:220-b.c});
   const parts=reflect?sample.parts.map(mirror):sample.parts,aligned=h.state();
   for(const part of parts)h.feed(aligned,part,tf);
   const native=reflect?sample.native.map(mirror):sample.native.map(b=>h.candle(b));
   const expected=reflect?-sample.alignedDirection:sample.alignedDirection;
   assert.equal(direction(aligned.bars)||0,expected||0,'Only reconstructed C1/C2 determines aligned CRT');
   assert.notEqual(direction(aligned.bars),direction(native),'Native geometry is deliberately different');
   for(let n=1;n<=parts.length;n++){
    const prefix=h.state();for(const part of parts.slice(0,n))h.feed(prefix,part,tf);
    assert.deepEqual(prefix.bars,aligned.bars.filter(b=>b.e<=parts[n-1].e),'Closed aligned history is unchanged by later hours');prefixChecks++;
   }
   const frozen=JSON.stringify(aligned.bars);
   // A display/native request cannot be substituted for the registry packet.
   native.forEach(b=>{b.h+=1000;b.l-=1000;});
   assert.equal(JSON.stringify(aligned.bars),frozen,'Native data has no ownership of the aligned tape');
  }
  evidence.push({tf,kind:sample.kind,alignedDirection:sample.alignedDirection,nativeDirection:sample.nativeDirection,aligned:sample.aligned,native:sample.native});
 }
}
// Protect actual request routing, not just the arithmetic fixture above.
for(const [value,fn,arg] of [['completedBiasKeys','f_priorBiasKeys','biasTf'],['executionBias','f_executionSnapshot','biasTf'],['requestedBiasModel','f_higherSnapshot','biasTf']]){
 const line=s.split(/\r?\n/).find(x=>x.includes(value+' = request.security'));
 assert.ok(line&&line.includes('f_transportTf('+arg+')')&&line.includes(fn+'('),'Clock-aware request '+value);
}
for(const [name,args] of [['f_sourceBundle',['f_sourcePacket(sourceTf)','f_engineFromSource(sourceTf, source)','f_executionFromSource(source)','f_sourceFrame(sourceTf)']],['f_higherBundle',['f_sourcePacket(sourceTf)','f_sourceFrame(sourceTf)']],['f_clockBiasValues',['f_alignedTf(biasTf)','f_alignedTape(biasTf)','f_biasStep(state, ph, pl, b.c, p.c)']]]){
 const body=h.body(name).join('\n');for(const arg of args)assert.ok(body.includes(arg),name+' reads '+arg);
}
assert.match(s,/float earlyC1H = not na\(mainPreview\) \? mainPreview.first.h : na/);
assert.match(s,/float hEarlyH = not na\(largerPreview\) \? largerPreview.first.h : na/);
assert.match(s,/int bucketTime = f_alignedTf\(htf\) \? alignedBucketTime : time\(htf\)/);
assert.match(s,/int largerBucket = f_alignedTf\(largerTf\) \? alignedLargerTime : time\(largerTf\)/);
assert.doesNotMatch(h.body('f_stepRegistry').join('\n'),/(?<!\.)\b(?:open|high|low|close)\b/,'Registry consumes source OHLC, never native globals');
console.log(`PASS ${evidence.length*2} symmetric H2/H4 shape-isolation cases from ${trials} deterministic trials, ${prefixChecks} immutable prefixes: native-only, aligned-only, opposite; bias/key/Early/model/display routing.`);
module.exports={trials,prefixChecks,evidence};
