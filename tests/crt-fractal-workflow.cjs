// Actual restricted Pine bodies, constructed OHLC/pivots/snapshots only.
// request.security/rollback/feed alignment still require native chart validation.
const assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const channel=require('./helpers/pine-channel-harness.cjs').createHarness(source);
const early=require('./helpers/pine-early-c2-harness.cjs').createEarlyHarness(source);
const keys=require('./helpers/pine-crt-key-harness.cjs').createKeyHarness(source,{sweepSize:.01});
const bar=(t,o,h,l,c)=>({t,end:t+1,o,h,l,c});
const sell=[bar(100,104,108,102,106),bar(101,108,111,103,105),bar(102,104,105,99,100),bar(103,99,101,96,97),bar(104,104,107,100,101)];
const mirror=b=>({...b,o:220-b.o,h:220-b.l,l:220-b.h,c:220-b.c});
const mirrorKey=k=>({...k,dir:-k.dir,lo:220-k.hi,hi:220-k.lo});
let prefixes=0;
for(const dir of [-1,1]){
 const key={kind:2,dir,lo:dir===-1?110:106,hi:dir===-1?114:110,knownAt:80,beforeTime:90,tf:'60'};
 const bars=dir===-1?sell:sell.map(mirror);
 function run(options={},extra={},tape=bars){
  const ctx={id:90,kind:1,flags:1,phase:1,dir,confirmed:100,inv:dir===-1?130:90,cp:dir===-1?80:140,crtKey:key,...extra};
  const state=channel.state(ctx),out=[];
  for(let n=2;n<=tape.length;n++)out.push(channel.step(ctx,state,tape.slice(0,n),{knownHigh:dir===-1?108:118,knownHighAt:dir===-1?95:98,knownLow:dir===-1?102:112,knownLowAt:dir===-1?98:95,...(typeof options==='function'?options(n):options)}));
  return {ctx,state,out,hits:out.filter(x=>x.hit)};
 }
 // Step 2: exact source identity and feed intervals, without automatic C3 expiry.
 const intervals={c1T:90,c2T:95,c2End:100,c3End:110};
 assert.equal(run({},intervals).state.chainRole,'LOCAL C3');
 assert.equal(run({},{...intervals,c3End:101}).state.chainRole,'LOCAL TRACK');
 assert.equal(run({},{...intervals,c2T:102,c2End:110}).hits.length,0,'No pre-C2 raid borrowed for a new source');
 const wrongCtx={...run().ctx,...intervals},wrong=channel.state(wrongCtx);
 Object.assign(wrong,{sourceRoot:89,sourceC2:95,sourceEnd:100});
 const mismatch=channel.step(wrongCtx,wrong,bars.slice(0,2));
 assert.equal(mismatch.hit,false);assert.equal(wrong.chainRole,'SOURCE LOST');
 // Step 3: qualified parent, base bias and local trigger are distinct evidence.
 const parent={parentLive:true,parentAtKey:true,parentDir:dir,parentConfirmed:90};
 assert.equal(run({},parent).state.biasRole,'CONT');
 assert.equal(run({bias:-dir,allowCrtCounter:true},parent).state.biasRole,'HTF KEY REV');
 assert.equal(run({bias:-dir,allowCrtCounter:true}).state.biasRole,'KEY REV');
 assert.equal(run({},{...parent,parentDir:-dir}).state.biasRole,'HTF CONFLICT');
 assert.equal(run({allowCrtCounter:false},{...parent,parentDir:-dir}).hits.length,0);
 assert.equal(run({localKeys:[key]},{...parent,parentDir:-dir,crtKey:null}).hits.length,0,'A counter-parent trigger needs a source key as well as a local key');
 assert.equal(run({localKeys:[key]},{...parent,parentDir:-dir,parentAtKey:false,crtKey:null}).hits.length,0,'Live opposite CRT remains context even without a detected key');
 assert.equal(run({},{...parent,parentConfirmed:200}).state.biasRole,'FLOW','Future parent context is not borrowed');
 assert.equal(run({bias:0},parent).hits.length,0);
 // Step 4: nearest pre-known opposing key ends the old leg, not the HTF parent.
 const barrier=dir===-1?{kind:2,dir:1,lo:98,hi:100,knownAt:80,tf:'60'}:{kind:2,dir:-1,lo:120,hi:122,knownAt:80,tf:'60'};
 const delivered=run({localKeys:[key,barrier]});
 assert.equal(delivered.hits.length,1,'After delivery, old-leg pullback entries require a new TS');
 assert.equal(delivered.hits[0].tag,'TS_CLOSE');
 assert.equal(delivered.state.nextObjective,dir===-1?100:120);
 assert.equal(delivered.state.objectiveReached,true);
 assert.ok(delivered.state.mpsAt!==null,'Intermediate observation preserves MPS and its OTE branch');
 assert.equal(delivered.state.localTargetTaken,false,'Intermediate key is separate from the C1 range target');
 assert.equal(run({localKeys:[key,{...barrier,knownAt:102}]}).state.objectiveReached,false,'No future-created key changes the TS objective');
 const again=[...bars.slice(0,3),dir===-1?bar(103,107,108,102,105):mirror(bar(103,107,108,102,105))];
 const newKey=dir===-1?{...key,lo:106,hi:110}:mirrorKey({...key,dir:-1,lo:106,hi:110});
 const renewed=run(n=>({localKeys:[key,newKey,barrier],...(n===4?(dir===-1?{knownHigh:106,knownHighAt:101,knownLow:99,knownLowAt:102}:{knownLow:114,knownLowAt:101,knownHigh:121,knownHighAt:102}):{})}),{},again);
 assert.equal(renewed.state.confirmTime,101,'An intermediate touch does not reset the TS budget or borrow a later root');
 assert.equal(renewed.out.at(-1).hit,false,'Do not reuse old OTE after key delivery');
 assert.equal(renewed.out.at(-1).status,'LEG DONE / NEW TS');
 // Step 5: M15 close is independent from intrabar M5 closes.
 const gated=run(n=>({structureReady:n===4,structureClose:dir===-1?100:120,structurePrior:dir===-1?105:115,structureEnd:104}));
 assert.equal(gated.out[1].legDetected,false,'An intrabar M5 break is not a closed M15 MPS');
 assert.equal(gated.out[2].legDetected,true);assert.equal(gated.state.mpsAt,104);
 const noClose=run({structureReady:false});
 assert.ok(noClose.hits.some(x=>x.tag==='TS_CLOSE'),'TS entry remains independent');
 assert.ok(noClose.hits.every(x=>!x.tag.includes('OTE')));
 for(const options of [{},{localKeys:[key,barrier]},{structureReady:false}]){
  const full=run(options).out;
  for(let n=2;n<=bars.length;n++){prefixes++;assert.deepEqual(run(options,{},bars.slice(0,n)).out,full.slice(0,n-1));}
 }
 // Step 1: observation reaches the last C2 close with Early disabled/no entry.
 const raw=[bar(100,122,123,121,122),bar(101,122,123,120,122),bar(102,122,123,118,121),bar(103,124,125,117,119),bar(104,119,119,115,116)];
 const tape=dir===-1?raw:raw.map(mirror);
 const ref=dir===-1?{start:100,finish:105,c1Time:90,c1End:100,c1O:110,c1H:120,c1L:90,c1C:115}:{start:100,finish:105,c1Time:90,c1End:100,c1O:110,c1H:130,c1L:100,c1C:105};
 const ek=early.make('CrtKey',{kind:2,dir,lo:dir===-1?120:95,hi:dir===-1?125:100,knownAt:80,beforeTime:100,tf:'60'});
 function observe(opts={}){
  const state=early.state(),events=[];
  for(let i=0;i<tape.length;i++){
   const pair=i>=3?(dir===-1?{knownHigh:124,knownHighAt:95,knownLow:118,knownLowAt:102}:{knownLow:96,knownLowAt:95,knownHigh:102,knownHighAt:102}):{};
   events.push(early.step(ref,state,tape.slice(0,i+1),{bias:dir,...pair,...(dir===-1?{sellKey:i>=3?ek:early.make('CrtKey')}:{buyKey:i>=3?ek:early.make('CrtKey')}),...opts}));
  }
  return {state,events};
 }
 for(const opts of [{enabled:false},{branches:'FVG / OTE'},{permitEntry:false},{enabled:false,bias:0}]){
  const got=observe(opts);
  assert.equal(got.events.some(x=>x.hit),false);
  assert.equal(got.state.channel.confirmTime,103);assert.equal(got.state.channel.mpsAt,105);
  assert.equal(got.state.blocked,false,'C2 close alone does not invalidate known evidence');
  assert.equal(got.state.channel.sourceRoot,90);assert.equal(got.state.channel.sourceC2,100);assert.equal(got.state.channel.sourceEnd,105);
 }
 const enabled=observe();assert.equal(enabled.events.filter(x=>x.hit).length,1);
 assert.equal(enabled.state.channel.mpsAt,observe({enabled:false}).state.channel.mpsAt);
 // A stopped E remains in history, but observation can collect a later raid.
 const rerun=early.state(),extendedRef={...ref,finish:110};
 const rerunRaw=[...raw.slice(0,4),bar(104,124,126,118,124),bar(105,123,123,117,119),bar(106,119,119,115,116)];
 const rerunTape=dir===-1?rerunRaw:rerunRaw.map(mirror);let count=0;
 for(let i=0;i<rerunTape.length;i++){
  const pair=i>=3?(dir===-1?{knownHigh:124,knownHighAt:95,knownLow:118,knownLowAt:102}:{knownLow:96,knownLowAt:95,knownHigh:102,knownHighAt:102}):{};
  const event=early.step(extendedRef,rerun,rerunTape.slice(0,i+1),{bias:dir,cadence:'One per model',...pair,...(dir===-1?{sellKey:i>=3?ek:early.make('CrtKey')}:{buyKey:i>=3?ek:early.make('CrtKey')})});
  count+=Number(event.hit);
 }
 assert.equal(count,1,'One per model retains one E after an invalidation; Fresh is covered separately');
 assert.equal(rerun.lockedSl,dir===-1?125:95,'Old entry reference is never widened');
 assert.equal(rerun.channel.localExtreme,dir===-1?126:94);
 assert.equal(rerun.channel.confirmTime,105);assert.equal(rerun.channel.mpsAt,107);
 // P3 can itself become a confirmed pivot before the reclaim. It must not
 // overwrite the P1/P2 pair captured before the original raid.
 const frozen=early.state();
 const delayedRaw=[bar(100,122,125,121,124),bar(101,124,124,120,122),bar(102,122,123,118,121),bar(103,120,120,117,119),bar(104,119,119,115,116)];
 const delayed=dir===-1?delayedRaw:delayedRaw.map(mirror);
 for(let i=0;i<delayed.length;i++){
  const pair=dir===-1?{knownHigh:i>=3?125:124,knownHighAt:i>=3?100:95,knownLow:118,knownLowAt:98}:{knownLow:i>=3?95:96,knownLowAt:i>=3?100:95,knownHigh:102,knownHighAt:98};
  early.step(ref,frozen,delayed.slice(0,i+1),{enabled:false,bias:dir,...pair,...(dir===-1?{sellKey:i>=3?ek:early.make('CrtKey')}:{buyKey:i>=3?ek:early.make('CrtKey')})});
 }
 assert.equal(frozen.channel.p1At,95);assert.equal(frozen.channel.mpsRefAt,98);
 assert.equal(frozen.channel.mpsAt,105,'Newly confirmed P3 cannot erase the original pre-raid structure');
}
// Actual forward-key matcher across all source snapshots.
const map=items=>({levels:items.map(x=>keys.makeKey(x))});
const zone=(lo,hi,extra={})=>({kind:2,dir:-1,lo,hi,knownAt:90,tf:'60',...extra});
const maps=[map([zone(125,127)]),map([zone(112,114,{tf:'120'})]),map([zone(118,120,{tf:'240'})]),map([zone(135,137,{tf:'1D'})])];
assert.equal(keys.forwardKey(maps,1,100,110,140).lo,112);
assert.equal(keys.forwardKey([map([zone(112,114,{knownAt:101}),zone(105,106),zone(142,144)]),map([]),map([]),map([])],1,100,110,140).kind,0);
const expr=source.match(/f_structureReady\([^\n]+\) =>\r?\n\s+([^\r\n]+)/)[1].replace(/\band\b/g,'&&').replace(/\bor\b/g,'||').replace(/\bnot\b/g,'!');
const ready=Function('na','sourceEnd','chartEnd','previousEnd','return '+expr),na=x=>x==null;
for(const [end,chart,prev,want] of [[105,104,null,false],[105,105,null,true],[105,105,105,false],[104,105,105,false],[120,120,105,true],[null,120,105,false]])assert.equal(ready(na,end,chart,prev),want);
assert.match(source,/structureMode = input.string\("Chart"/);
assert.match(source,/chartSeconds == 900/);
assert.match(source,/f_structureSource\(\), lookahead=barmerge.lookahead_off/);
assert.match(source,/if structureUpdated\r?\n\s+structureClosed := structureRaw.copy\(\)/);
assert.equal(source,fs.readFileSync('chibao.txt','utf8'));
console.log(`PASS integrated five-step CRT workflow: observation/entry separation, source intervals, contextual bias, delivered-key lifecycle, independent M15 close/cache and ${prefixes} immutable prefixes. Constructed fixtures only.`);
