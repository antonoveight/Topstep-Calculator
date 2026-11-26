// Actual-source permission gate/channel, constructed states; not market Replay.
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const scalar=require('./helpers/pine-clock-harness.cjs').createClockHarness(s);
const decide=scalar.compile('f_contextDecision',['direction','baseDirection','counterEnabled','sourceClosed','sourceConfirmed','sourceAtKey','parentDirection','parentConfirmed','parentLive','parentAtKey','outerDirection','outerConfirmed','outerLive','outerAtKey','nowAt']);
let decisions=0,channels=0,prefixes=0,earlyCases=0;
for(const dir of [1,-1]){
 const gate=(extra={})=>{const v={direction:dir,baseDirection:dir,counterEnabled:false,sourceClosed:true,sourceConfirmed:100,sourceAtKey:true,parentDirection:0,parentConfirmed:null,parentLive:false,parentAtKey:false,outerDirection:0,outerConfirmed:null,outerLive:false,outerAtKey:false,nowAt:101,...extra};decisions++;return decide(...['direction','baseDirection','counterEnabled','sourceClosed','sourceConfirmed','sourceAtKey','parentDirection','parentConfirmed','parentLive','parentAtKey','outerDirection','outerConfirmed','outerLive','outerAtKey','nowAt'].map(k=>v[k]));};
 assert.equal(gate(),0);assert.equal(gate({baseDirection:0}),2);
 assert.equal(gate({baseDirection:-dir}),3,'Counter is observation-only by default');
 assert.equal(gate({baseDirection:-dir,counterEnabled:true}),0,'A closed, key-qualified HTF source may opt into reversal');
 assert.equal(gate({baseDirection:-dir,counterEnabled:true,sourceClosed:false}),4,'Early LTF structure alone is not HTF permission');
 assert.equal(gate({baseDirection:-dir,counterEnabled:true,sourceAtKey:false}),4);
 assert.equal(gate({baseDirection:-dir,counterEnabled:true,sourceConfirmed:102}),4,'Never borrow a future HTF confirmation');
 for(const parentAtKey of [false,true])for(const counterEnabled of [false,true]){
  assert.equal(gate({parentDirection:-dir,parentConfirmed:90,parentLive:true,parentAtKey,counterEnabled}),1,'Opposite active H4 veto is independent of key recognition/counter toggle');
  assert.equal(gate({outerDirection:-dir,outerConfirmed:90,outerLive:true,outerAtKey:parentAtKey,counterEnabled}),1,'Outer D1 cannot disappear behind nearer H4');
 }
 assert.equal(gate({parentDirection:dir,parentConfirmed:90,parentLive:true,parentAtKey:true,outerDirection:-dir,outerConfirmed:80,outerLive:true}),1,'Disagreeing live H4/D1 means wait');
 assert.equal(gate({parentDirection:-dir,parentConfirmed:102,parentLive:true}),0,'Future parent is not applied retrospectively');
 assert.equal(gate({parentDirection:-dir,parentConfirmed:90,parentLive:false}),0,'Retired parent no longer grants or vetoes entries');
 assert.equal(gate({baseDirection:-dir,counterEnabled:true,sourceConfirmed:85,parentDirection:dir,parentConfirmed:90,parentLive:true,parentAtKey:false}),4,'An older source cannot invent a fresh reversal after the parent changed');
 assert.equal(gate({baseDirection:-dir,counterEnabled:true,sourceClosed:false,parentDirection:dir,parentConfirmed:90,parentLive:true,parentAtKey:true}),0,'Early can follow an already confirmed key-backed higher reversal');
 const h=require('./helpers/pine-channel-harness.cjs').createHarness(s);
 const raw=[{t:100,end:101,o:104,h:108,l:102,c:106},{t:101,end:102,o:108,h:111,l:103,c:105},{t:102,end:103,o:104,h:105,l:99,c:100},{t:103,end:104,o:99,h:101,l:96,c:97},{t:104,end:105,o:104,h:107,l:100,c:101}];
 const mirror=b=>({...b,o:220-b.o,h:220-b.l,l:220-b.h,c:220-b.c});
 const tape=dir===-1?raw:raw.map(mirror);
 const key={kind:2,dir,lo:dir===-1?110:106,hi:dir===-1?114:110,knownAt:80,beforeTime:90,tf:'60'};
 function run(extra={},options={},bars=tape){const ctx={id:1,kind:1,flags:1,phase:1,dir,confirmed:100,hi:130,lo:90,inv:dir===-1?140:80,cp:dir===-1?90:130,crtKey:key,...extra},state=h.state(ctx),out=[];for(let n=2;n<=bars.length;n++)out.push(h.step(ctx,state,bars.slice(0,n),{knownHigh:dir===-1?108:118,knownHighAt:dir===-1?95:98,knownLow:dir===-1?102:112,knownLowAt:dir===-1?98:95,...(typeof options==='function'?options(n):options)}));channels++;return {state,out,hits:out.filter(x=>x.hit)};}
 const normal=run();assert.ok(normal.hits.length>0);
 for(const parentAtKey of [false,true]){
  const blocked=run({parentDir:-dir,parentLive:true,parentConfirmed:90,parentAtKey},{allowCrtCounter:true});
  assert.equal(blocked.hits.length,0);assert.equal(blocked.out[0].tsDetected,true,'Observe TS while withholding entry');
  assert.equal(blocked.state.biasRole,'HTF CONFLICT');
  assert.ok(blocked.state.mpsAt!=null,'MPS observation remains separate from entry permission');
 }
 assert.equal(run({outerDir:-dir,outerLive:true,outerConfirmed:90,outerAtKey:false},{allowCrtCounter:true}).hits.length,0);
 assert.equal(run({}, {bias:-dir}).hits.length,0);
 assert.ok(run({}, {bias:-dir,allowCrtCounter:true}).hits.length>0);
 const range=dir===-1?{hi:110,lo:90}:{hi:130,lo:110};
 const eq=run(range);assert.equal(eq.state.checkpointReached,true);
 assert.deepEqual(eq.hits.map(x=>x.tag),['TS_CLOSE'],'After EQ, do not reuse the old leg FVG/OTE');
 assert.equal(eq.state.localTargetTaken,false,'EQ checkpoint is separate from user/full CRT target');
 assert.equal(eq.out.at(-1).status,'LEG DONE / NEW TS');
 const freshRaw=[...raw.slice(0,4),{...raw[4],h:108},{t:105,end:106,o:101,h:107,l:99,c:104},{t:106,end:107,o:104,h:106,l:101,c:103},{t:107,end:108,o:103,h:107,l:102,c:106},{t:108,end:109,o:108,h:112,l:103,c:105}];
 const freshBars=dir===-1?freshRaw:freshRaw.map(mirror);
 const fresh=run(range,n=>n===9?(dir===-1?{knownHigh:108,knownHighAt:104,knownLow:99,knownLowAt:105}:{knownLow:112,knownLowAt:104,knownHigh:121,knownHighAt:105}):{},freshBars);
 assert.equal(fresh.out.at(-1).hit,true,'A genuinely new TS after the checkpoint can open a fresh leg');
 assert.equal(fresh.state.confirmTime,108);assert.equal(fresh.state.checkpointReached,false,'New leg owns a new checkpoint budget');
 for(let n=2;n<=tape.length;n++){prefixes++;assert.deepEqual(run(range,{},tape.slice(0,n)).out,eq.out.slice(0,n-1));}
 const early=require('./helpers/pine-early-c2-harness.cjs').createEarlyHarness(s);
 const eRef={start:100,finish:120,c1Time:90,c1End:100,c1O:100,c1H:110,c1L:90,c1C:100};
 const eKey=early.make('CrtKey',{kind:2,dir,lo:dir===1?90:105,hi:dir===1?95:110,knownAt:80,beforeTime:100,tf:'60'});
 const eBars=[{t:100,o:95,h:108,l:89,c:105},{t:101,o:105,h:107,l:102,c:104}];
 const eTape=dir===1?eBars:eBars.map(b=>({...b,o:200-b.o,h:200-b.l,l:200-b.h,c:200-b.c}));
 function eRun(opts){const state=early.state(),out=[];for(let n=1;n<=eTape.length;n++)out.push(early.step(eRef,state,eTape.slice(0,n),{bias:dir,allowCrtCounter:true,knownLow:dir===1?95:93,knownLowAt:dir===1?95:98,knownHigh:dir===1?107:105,knownHighAt:dir===1?98:95,...(dir===1?{buyKey:eKey}:{sellKey:eKey}),...opts}));earlyCases++;return {state,hits:out.filter(x=>x.hit)};}
 const eBlocked=eRun({parentDirection:-dir,qualifiedParent:true,parentAtKey:false,parentKnownAt:90});
 assert.equal(eBlocked.hits.length,0);assert.ok(eBlocked.state.reclaimedAt!=null,'Blocked Early still collects evidence');
 assert.equal(eRun({outerDirection:-dir,outerLive:true,outerConfirmed:90}).hits.length,0);
 assert.equal(eRun({bias:-dir}).hits.length,0,'Even opt-in Early requires a closed HTF reversal');
 assert.equal(eRun({bias:-dir,parentDirection:dir,qualifiedParent:true,parentAtKey:true,parentKnownAt:99}).hits.length,1,'A known higher reversal grants Early permission before its own source closes');
}
// Evaluate the actual declarations with the entry toggle off: context survives.
const line=name=>s.match(new RegExp('^bool '+name+' = (.+)$','m'))[1].replace(/\band\b/g,'&&').replace(/\bnot\b/g,'!');
const context=Function('higherContextTfValid','higher','higherLife','na','return '+line('higherContextLive'));
const available=Function('enableLargerSignals','higherSignalTfValid','higherContextLive','return '+line('higherAvailable'));
assert.equal(context(true,{id:1,phase:1,confirmed:90},{rangeDone:false,uid:1,confirmation:90,reason:0},x=>x==null),true);
assert.equal(available(false,true,true),false);
assert.equal(available(true,false,true),false,'Entry timeframe restrictions remain independent of parent tracking');
assert.equal(available(true,true,true),true);
assert.match(s,/HigherSnapshot higher = requestedHigher/);
assert.doesNotMatch(line('higherContextTfValid'),/biasTf|isLtf|enableLargerSignals/,'Parent tracking does not depend on entry timeframe/bias budget switches');
assert.match(s,/bool higherAtKey = higherContextLive/);
assert.match(s,/parentLive=higherContextLive/);
assert.match(s,/outerLive=biasModelLive/);
assert.match(s,/allowCrtCounter = input.bool\(false/);
assert.match(s,/bool fvgEntry = not legDelivered/);assert.match(s,/bool oteEntry = not legDelivered/);
assert.equal(s,fs.readFileSync('chibao.txt','utf8'));
console.log(`PASS ${decisions} HTF permission cases, ${channels} channel runs, ${earlyCases} Early runs and ${prefixes} immutable prefixes: two-parent conflicts, explicit confirmed reversal, observation-only counter, independent toggles and EQ checkpoints.`);
