// Execute restricted actual-source functions with constructed OHLC/key snapshots.
// These cases isolate the screenshot defect; they are not a full ETH/XAU replay.
const assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const h=require('./helpers/pine-channel-harness.cjs').createHarness(source);
const k=require('./helpers/pine-crt-key-harness.cjs').createKeyHarness(source);
const b=(t,o,h,l,c)=>({t,end:t+1,o,h,l,c});
const sell=[b(100,104,108,102,106),b(101,108,111,103,105),b(102,104,105,99,100),b(103,99,101,96,97),b(104,104,107,100,101)];
const mirror=x=>({...x,o:220-x.o,h:220-x.l,l:220-x.h,c:220-x.c});
const empty=()=>({levels:[]});
const map=(keys,close,end)=>({levels:keys.map(x=>k.makeKey(x)),sourceClose:close,sourceEnd:end});
function run(tape,dir=-1,options={},context={}){
 const key={kind:2,dir,hi:dir===-1?114:110,lo:dir===-1?110:106,knownAt:80,beforeTime:90,tf:'60'};
 const ctx={id:1,kind:1,flags:1,phase:1,dir,confirmed:100,resolved:100,inv:dir===-1?130:90,cp:dir===-1?80:140,crtKey:key,...context},state=h.state(ctx),out=[];
 for(let n=2;n<=tape.length;n++)out.push(h.step(ctx,state,tape.slice(0,n),{knownHigh:dir===-1?108:118,knownLow:dir===-1?102:112,knownHighAt:dir===-1?95:98,knownLowAt:dir===-1?98:95,...(typeof options==='function'?options(n):options)}));
 return {state,out,hits:out.filter(x=>x.hit),mps:out.filter(x=>x.legDetected)};
}
for(const dir of [-1,1]){
 const tape=dir===-1?sell:sell.map(mirror);
 assert.ok(run(tape,dir).hits.length>0);
 assert.equal(run(tape,dir,{localKeys:[]}).hits.length,0,'Old context cannot substitute for direct P3 contact');
 assert.equal(run(tape,dir,{localKeys:[]}).mps.length,0);
 const diagnostic=run(tape,dir,{localKeys:[],requireKey:false});
 assert.ok(diagnostic.hits.some(x=>x.tag==='TS_CLOSE'));
 assert.equal(diagnostic.mps.length,0,'Disabling entry key filter never labels an unkeyed MPS as qualified');
 assert.ok(diagnostic.hits.every(x=>!x.tag.includes('OTE')));
 assert.equal(run(tape,dir,{localKeys:[],requireKey:false,bias:-dir}).hits.length,0,'CT still requires local proof');
 const key={kind:2,dir,hi:dir===-1?114:110,lo:dir===-1?110:106,knownAt:80,tf:'60'};
 const unknown={...key,knownAt:102};
 assert.equal(run(tape,dir,{localKeys:[unknown]}).hits.length,0);
 for(const [slot,tf] of [[0,'60'],[1,'120'],[2,'240'],[3,'1D']]){
  const maps=Array.from({length:4},empty);maps[slot]=map([{...key,tf}]);
  const got=run(tape,dir,{executionMaps:maps,htf:'120'});
  assert.ok(got.hits.length>0,`Local key can originate on ${tf}`);
  assert.equal(got.hits[0].keyRef.tf,tf);
 }
 assert.equal(run(tape,dir,{keyTypes:'Swing',localKeys:[key]}).mps.length,0,'Respect type selection');
 const broken=run(tape,dir,n=>{
  const closed=n===3?(dir===-1?115:105):(dir===-1?109:111);
  return {executionMaps:[map([key],closed,n===2?99:103),empty(),empty(),empty()]};
 });
 assert.equal(broken.state.p3KeyBroken,true,'Confirmed distal break latches even after source recovers');
 assert.equal(broken.mps.length,0);
 assert.ok(broken.hits.every(x=>x.tag==='TS_CLOSE'));
 const full=run(tape,dir);
 for(let n=2;n<=tape.length;n++)assert.deepEqual(run(tape.slice(0,n),dir).hits,full.out.slice(0,n-1).filter(x=>x.hit),'No future prefix changes signal provenance');
}
// ETH screenshot prices: a local Buy sweep near 1684 is far above the old OB.
const eth=[b(100,1684,1685,1683,1684.5),b(101,1684.2,1685,1682,1684.86)];
const oldOb={kind:2,dir:1,lo:1645.23,hi:1667.94,knownAt:80,beforeTime:90,tf:'120'};
const ethContext={crtKey:oldOb,inv:1665.23,cp:1686.63};
const ethOptions={bias:-1,htf:'120',knownLow:1683,knownLowAt:95,knownHigh:1685,knownHighAt:98};
assert.equal(run(eth,1,ethOptions,ethContext).hits.length,0,'Held old OB does not authorize a distant counter-bias Buy');
assert.equal(run(eth,1,{...ethOptions,localKeys:[{...oldOb,lo:1681,hi:1683}]},ethContext).hits.length,1,'A genuine local HTF reaction remains possible');
// Multi-bar raid: peak touches the key, a later smaller candle reclaims P1.
const delayed=[sell[0],b(101,108,112,103,110),b(102,110,111,104,105),b(103,104,105,99,100)];
const key={kind:2,dir:-1,lo:110,hi:114,knownAt:80,beforeTime:90,tf:'60'};
const removed=run(delayed,-1,n=>({localKeys:n===2?[key]:[]}));
assert.ok(removed.hits.length>0,'Capture contact before the key is consumed/removed by its own HTF raid');
assert.equal(removed.hits[0].keyRef.beforeTime,101);
assert.equal(run(delayed,-1,n=>({localKeys:n===2?[]:[{...key,knownAt:102}]})).hits.length,0,'No key born after the first raid can backfill the reclaim');
const away=[sell[0],b(101,108,112,103,110),b(102,117,120,116,119),b(103,119,119,104,105),b(104,104,105,89,90)];
assert.equal(run(away,-1,{knownLow:90}).hits.length,0,'A new higher P3 away from the zone cannot borrow the earlier peak contact');
// Proof does not require the old key still to be listed; own swing consumption
// is different from a later closed HTF acceptance through its distal boundary.
const proof=k.makeKey({...key,kind:3,lo:110,hi:110,beforeTime:101});
assert.equal(k.proofValid(proof,102,111,102),true);
assert.equal(k.proofValid(proof,102,111,103),false);
assert.equal(k.proofValid(proof,102,109,103),true);
assert.match(source,/keys\[1\]/);
assert.match(source,/f_keyProofHint\(proofState.p3Key, proofState.p3KeyAt\)/);
assert.match(source,/Historical source at signal time/);
assert.match(source,/Source C1 .*Asia\/Ho_Chi_Minh/);
assert.equal(source,fs.readFileSync('chibao.txt','utf8'));
console.log('PASS local P3 HTF key proof: both directions, four sources, remote ETH OB, pre-raid timing, peak retention/replacement, sticky distal failure, no unkeyed MPS/OTE or CT, immutable prefixes and historical provenance. Constructed data only.');
