// Compare unchanged, non-invalidating prefixes through the first Early event.
// Renewal is intentionally different and covered by early-c2-renewal.cjs.
const fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8'),old=fs.readFileSync('tests/fixtures/early-before-clock-consolidation.pinefragment','utf8');
const a=source.indexOf('f_stepEarly('),b=source.indexOf('// Both OHLC and key map',a);
const create=require('./helpers/pine-early-c2-harness.cjs').createEarlyHarness;
const current=create(source),reference=create(source.slice(0,a)+old+source.slice(b));
let seed=31,steps=0,hits=0,tracking=0,unseeded=0;const rand=()=>((seed=(1664525*seed+1013904223)>>>0)/2**32);
for(const dir of [1,-1])for(const branches of ['TS close','TS + FVG + OTE','FVG / OTE'])for(let scenario=0;scenario<32;scenario++){
 const ref={start:100,finish:140,c1Time:90,c1End:100,c1O:100,c1H:110,c1L:90,c1C:100};
 const states=[reference.state(),current.state()];
 const key=current.make('CrtKey',{kind:2,dir,lo:dir===1?90:105,hi:dir===1?95:110,knownAt:80,beforeTime:100,tf:'60'});
 const opts={branches,bias:scenario%7===0?-dir:dir,enabled:scenario%9!==0,permitEntry:scenario%11!==0,parentDirection:scenario%5===0?-dir:0,qualifiedParent:scenario%5===0,parentKnownAt:80,knownLow:dir===1?95:93,knownLowAt:dir===1?94:97,knownHigh:dir===1?107:105,knownHighAt:dir===1?97:94,...(dir===1?{buyKey:key}:{sellKey:key})};
 let tape=[],closing=105;
 for(let n=0;n<22;n++){
  let o=n===0?(scenario%2?106:100):closing,c=n===0?105:Math.max(96,Math.min(109,o+(rand()-.5)*8));
  const h=Math.max(o,c)+(n===0?3:rand()*3),l=n===0?89:Math.max(90,Math.min(o,c)-rand()*3);closing=c;
  let bar={t:100+n,o,h,l,c};if(dir===-1)bar={...bar,o:200-o,h:200-l,l:200-h,c:200-c};tape.push(bar);
  const option={...opts,confirmedHit:scenario%13===0&&n===3};
  const expected=reference.step(ref,states[0],tape,option),got=current.step(ref,states[1],tape,option);
  assert.deepEqual(got,expected,`Result ${dir}/${branches}/${scenario}/${n}`);
  const legacyState=x=>{const out={...x};delete out.attemptEmitted;delete out.retiredExtreme;return out;};
  assert.deepEqual(legacyState(states[1]),legacyState(states[0]),`State ${dir}/${branches}/${scenario}/${n}`);
  steps++;hits+=got.hit?1:0;tracking+=states[1].channel?.confirmIndex!=null?1:0;unseeded+=states[1].reclaimedAt!=null&&states[1].channel?.confirmIndex==null?1:0;
  if(got.hit)break; // After the first event, attempt budgeting intentionally differs.
 }
}
assert.ok(hits>0&&tracking>0&&unseeded>0,'Exercise direct, tracking and local fallback paths');
const earlyBody=source.slice(a,b);assert.equal((earlyBody.match(/= f_stepChannel\(/g)||[]).length,1,'One compiled call site for the mutually exclusive branches');
assert.match(source,/contextsToStep = array.from\(ctx, higherCtx\)/);assert.match(source,/statesToStep = array.from\(crtState, higherState\)/);
assert.match(source,/earlyStates = array.from\(earlyState, higherEarlyState\)/);
console.log(`PASS ${steps} pre-first-event old/new Early state/result comparisons, ${hits} direct hits, ${tracking} seeded and ${unseeded} local fallback prefixes. Independent channel order and reduced call sites. Constructed data only.`);
