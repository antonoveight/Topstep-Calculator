// Actual-source mechanical regressions. No quote-feed/market-profit simulation.
const assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const h=require('./helpers/pine-channel-harness.cjs').createHarness(source);
const early=require('./helpers/pine-early-c2-harness.cjs').createEarlyHarness(source);
const keys=require('./helpers/pine-crt-key-harness.cjs').createKeyHarness(source,{sweepSize:.01});
const weekly=keys.weekly(108,112,88,104,70,80);
assert.deepEqual(weekly.levels.map(k=>[k.dir,k.lo,k.hi,k.knownAt,k.tf]),[[1,96,96,80,'1W'],[-1,110,110,80,'1W']]);
const bull=keys.weekly(104,112,88,108,70,80);
assert.deepEqual(bull.levels.map(k=>k.lo),[96,110],'Wick endpoints use body min/max regardless of candle color');
assert.equal(keys.weekly(88,112,88,112,70,80).levels.length,0,'No wick means no midpoint key');
assert.equal(keys.weekly(108,112,88,104,70,null).levels.length,0,'Unknown close time cannot establish a known key');
assert.match(source,/f_weeklyWickSnapshot\(\) =>\s+KeyMap result = f_weeklyWickMap[^\n]+\s+result\[1\]/);
assert.match(source,/request.security\(syminfo.tickerid, "1W", f_weeklyWickSnapshot\(\), lookahead=barmerge.lookahead_on/);
const bars=[{t:100,end:101,o:104,h:108,l:102,c:106},{t:101,end:102,o:108,h:111,l:103,c:105},{t:102,end:103,o:104,h:105,l:99,c:100},{t:103,end:104,o:99,h:101,l:96,c:97},{t:104,end:105,o:104,h:107,l:100,c:101}];
const mirror=b=>({...b,o:220-b.o,h:220-b.l,l:220-b.h,c:220-b.c});
let prefixes=0;
for(const dir of [-1,1]){
 const key=keys.makeKey({kind:6,dir,lo:110,hi:110,knownAt:80,beforeTime:90,tf:'1W'});
 const ctx={id:90,kind:1,flags:1,phase:1,dir,confirmed:100,inv:dir===-1?130:90,cp:dir===-1?80:140,crtKey:key};
 const tape=dir===-1?bars:bars.map(mirror);
 const pair={knownHigh:dir===-1?108:118,knownHighAt:dir===-1?95:98,knownLow:dir===-1?102:112,knownLowAt:dir===-1?98:95};
 function run(opts={},input=tape,extra={}){const context={...ctx,...extra},state=h.state(context),out=[];for(let n=2;n<=input.length;n++)out.push(h.step(context,state,input.slice(0,n),{localKeys:[key],...pair,...opts}));return {state,out,hits:out.filter(x=>x.hit)};}
 assert.ok(run({bias:-dir}).hits.length>0,'Structured prior weekly-key reversal remains possible');
 assert.equal(run({bias:-dir,knownHigh:null,knownLow:null}).hits.length,0,'Unstructured adjacent TS cannot counter D1');
 assert.ok(run({knownHigh:null,knownLow:null}).hits.length>0,'Aligned TS does not gain a universal MPS/swing gate');
 assert.equal(run({knownHigh:null,knownLow:null},tape,{parentDir:-dir,parentAtKey:true,parentLive:true,parentConfirmed:90}).hits.length,0,'Opposing qualified parent uses the same swing requirement');
 assert.equal(run({localKeys:[{...key,knownAt:102}]}).hits.length,0,'Future weekly reference cannot justify a past TS');
 const rawEarly=[{t:100,o:122,h:123,l:121,c:122},{t:101,o:122,h:123,l:120,c:122},{t:102,o:122,h:123,l:118,c:121},{t:103,o:124,h:125,l:117,c:119}];
 const eTape=dir===-1?rawEarly:rawEarly.map(mirror);
 const ref=dir===-1?{start:100,finish:105,c1Time:90,c1End:100,c1O:110,c1H:120,c1L:90,c1C:115}:{start:100,finish:105,c1Time:90,c1End:100,c1O:110,c1H:130,c1L:100,c1C:105};
 const eKey=early.make('CrtKey',{kind:2,dir,lo:dir===-1?120:95,hi:dir===-1?125:100,knownAt:80,beforeTime:100,tf:'60'});
 const eState=early.state(),eEvents=[];
 for(let n=1;n<=eTape.length;n++) eEvents.push(early.step(ref,eState,eTape.slice(0,n),{bias:-dir,
  ...(dir===-1?{sellKey:n===4?eKey:early.make('CrtKey'),knownHigh:124,knownHighAt:95,knownLow:118,knownLowAt:102}:{buyKey:n===4?eKey:early.make('CrtKey'),knownLow:96,knownLowAt:95,knownHigh:102,knownHighAt:102})}));
 assert.equal(eEvents.at(-1).hit,true,'Ordered key-backed Early counter survives; counter entries are not universally banned');
 const barrier={kind:2,dir:-dir,lo:dir===-1?101:116,hi:dir===-1?104:119,knownAt:80,tf:'60'};
 const observed=run({localKeys:[key,barrier]});
 assert.equal(observed.out[0].hit,true);
 const initial=run({localKeys:[key,barrier]},tape.slice(0,2));
 assert.equal(initial.state.objectiveReached,false,'The TS candle wick is not a subsequent barrier touch');
 assert.equal(observed.state.objectiveReached,true);
 assert.ok(observed.hits.some(x=>x.tag==='MPS_OTE'),'Touch observation does not erase MPS/OTE or replenish TS budget');
 for(const opts of [{bias:-dir},{bias:-dir,knownHigh:null,knownLow:null},{localKeys:[key,barrier]}]){
  const full=run(opts).out;
  for(let n=2;n<=tape.length;n++){prefixes++;assert.deepEqual(run(opts,tape.slice(0,n)).out,full.slice(0,n-1));}
 }
}
console.log(`PASS closed-week wick math/availability, structured vs adjacent counter, aligned TS, soft barrier and ${prefixes} immutable prefixes. Synthetic only.`);
