// Compare optimized actual-source functions with the former priority semantics.
const assert=require('node:assert/strict'),fs=require('node:fs');
const s=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const keys=require('./helpers/pine-crt-key-harness.cjs').createKeyHarness(s,{sweepSize:.01});
let seed=764211;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
for(let n=0;n<160;n++){
 const zones=Array.from({length:Math.floor(random()*41)},(_,i)=>keys.makeKey({kind:[1,2,4,5][Math.floor(random()*4)],dir:random()<.5?-1:1,born:i,knownAt:i+10,lo:90+i,hi:95+i,tf:'60'}));
 const old=[];
 for(let kind=1;kind<=5;kind++)if(kind!==3)for(const dir of [-1,1]){
  let kept=0;for(let i=zones.length-1;i>=0;i--)if(kept<2&&zones[i].kind===kind&&zones[i].dir===dir){old.push(zones[i]);kept++;}
 }
 const actual=keys.appendZones(zones);
 assert.deepEqual(actual.map(k=>k.born),old.map(k=>k.born),'Preserve kind/direction/newest-two ordering');
 assert.ok(actual.every(k=>!zones.includes(k)),'Returned snapshots own key copies');
 for(const dir of [-1,1]){
  const levels=Array.from({length:24},(_,i)=>keys.makeKey({kind:1+Math.floor(random()*6),dir:random()<.5?-1:1,born:i,knownAt:random()<.2?32:28,lo:dir===1?95:101,hi:dir===1?99:105,tf:'60'}));
  const used=levels.filter(()=>random()<.15).map(k=>`${k.tf}:${k.kind}:${k.dir}:${k.knownAt}`);
  let expected=null;
  for(let pass=1;pass<=6;pass++)for(const k of levels)if(!expected&&k.kind===pass&&!used.includes(`${k.tf}:${k.kind}:${k.dir}:${k.knownAt}`)&&keys.reaction(k,30,dir,111,89,100))expected=k;
  const found=keys.match({levels},30,dir,111,89,100,used);
  assert.equal(found.kind,expected?.kind??0);
  assert.equal(found.born,expected?.born??null,'Single-pass matcher preserves first winner within the lowest matching kind');
 }
}
assert.match(s,/KeyMap earlyKeys = executionMain/);assert.match(s,/KeyMap hEarlyKeys = executionLarger/);
const early=s.slice(s.indexOf('f_earlyReference('),s.indexOf('EarlyReference mainEarlyRef'));
assert.doesNotMatch(early,/f_higherKeyMap\(/,'Early uses shared closed-source maps instead of rebuilding them');
console.log('PASS 160 actual-source zone collections and 320 matcher equivalence cases; Early shares completed execution maps.');
