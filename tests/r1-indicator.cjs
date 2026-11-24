const assert=require('node:assert/strict'),fs=require('node:fs');
const s=fs.readFileSync('indicators/funded-angler-v6.pine','utf8'),h=require('./helpers/pine-r1-harness.cjs').createR1Harness(s);
const {runCase,selectReference}=require('../tools/lib/crt-first-leg-study.cjs'),cases=JSON.parse(fs.readFileSync('docs/research/crt-first-leg-fixtures.json','utf8')).cases;
function execute(c){
 const x=c.context,ref=selectReference(c),state=h.make('R1State',{key:x.id,raidReady:true,reference:ref?.price??null,referenceKnownAt:ref?.knownAt??null,windowStart:x.confirmedAt,windowEnd:x.windowEnd,expected:x.confirmedAt}),out=[];
 for(let i=0;i<c.bars.length;i++){
  const b=c.bars[i],prior=c.bars[i-1],g={...x.gates,...c.gatesByStart?.[b.start]};
  const ctx={id:1,kind:1,dir:x.dir,flags:1,phase:1,age:0,cp:x.target,inv:x.inv,confirmed:x.confirmedAt,crtKey:null};
  const candle=h.make('R1Bar',{start:b.start,finish:b.end,o:b.o,h:b.h,l:b.l,c:b.c,previousClose:prior?.c??null,previousEnd:prior?.end??null,closed:b.closed,eligible:true,tick:x.tick,bias:!g.bias?0:!g.key?-x.dir:x.dir,useBias:true,allowCounter:true,allowedTime:true});
  out.push(h.step(ctx,state,candle,c.zone?.low??null,c.zone?.high??null,c.zone?.knownAt??0,g.wave));
 }
 return {state,out};
}
let prefixes=0;
for(const c of cases){
 const expected=runCase(c),actual=execute(c);
 assert.deepEqual(actual.out.map(r=>r.status),expected.trace.map(r=>r.status),c.id+' statuses');
 assert.deepEqual(actual.out.map(r=>r.hit),expected.trace.map(r=>r.signal),c.id+' signals');
 for(let i=1;i<=c.bars.length;i++){prefixes++;assert.deepEqual(execute({...c,bars:c.bars.slice(0,i)}).out,actual.out.slice(0,i),c.id+' prefix');}
 for(const r of actual.out.filter(r=>r.hit)){assert.equal(r.legKnownAt,expected.leg.knownAt);assert.equal(r.referencePrice,expected.reference.price);assert.equal(r.zoneKnownAt,c.zone.knownAt);}
}
// Actual selector: known before earliest raid, unconsumed then, latest formation.
for(const dir of [1,-1]){
 const make=(price,formedAt,knownAt,takenAt=null)=>h.make('R1Swing',{side:dir,price,formedAt,knownAt,takenAt});
 const pool=[make(102,10,20),make(103,30,40,110),make(104,50,101),make(105,60,70,99),h.make('R1Swing',{side:-dir,price:101,formedAt:80,knownAt:90})];
 assert.equal(h.select(pool,dir,100).price,103,'Spent after raid remains eligible as of raid');
 assert.equal(h.select([...pool].reverse(),dir,100).price,103);
 const frozen=h.select(pool,dir,100);pool[1].price=999;assert.equal(frozen.price,103,'Value is frozen, not a live pool reference');
 assert.equal(h.select([],dir,100).price,null);
 assert.equal(h.select([make(200,80,90),make(102,10,20)],dir,100).price,200,'Do not fall back to an easier reference outside path');
}
const raidBars=[{start:80,end:90,h:109,l:99},{start:90,end:100,h:108,l:98},{start:100,end:110,h:112,l:97},{start:110,end:120,h:115,l:95},{start:120,end:130,h:114,l:96}];
for(const dir of [1,-1]){
 const bars=dir===1?raidBars:raidBars.map(b=>({...b,h:210-b.l,l:210-b.h}));
 assert.deepEqual(h.raid(bars,90,120,dir,110,100),[90,true],'First sweep, not later wick extreme');
 assert.equal(h.raid(bars.filter(b=>b.start!==100),90,120,dir,110,100)[1],false,'Missing raid coverage is not guessed');
 assert.equal(h.raid(bars.slice(2),90,120,dir,110,100)[1],false);
 assert.deepEqual(h.raid(bars,90,120,dir,200,1),[null,true],'No sweep despite complete source');
}
// Pool learns pivots only at close and keeps spent-at time for historical queries.
const pool=[];h.update(pool,104,null,103,99,100,2,()=>80);assert.equal(pool[0].knownAt,100);assert.equal(pool[0].takenAt,null);
h.update(pool,null,null,105,100,110,2,()=>90);assert.equal(pool[0].takenAt,110);assert.equal(h.select(pool,1,100).price,104);assert.equal(h.select(pool,1,110).price,null);
const valid=cases.find(c=>c.id==='valid-buy'),r=execute(valid);
const ctx={id:1,kind:1,dir:1,age:0,inv:90,cp:120,confirmed:110,crtKey:null};
const candle=h.make('R1Bar',{start:130,finish:140,o:106,h:108,l:103,c:106,closed:true,eligible:true,tick:1,bias:1});
assert.equal(h.step(ctx,r.state,candle,102,104,120,true).hit,false,'Used state cannot signal again');
const blocked=execute({...valid,zone:null});assert.equal(blocked.out.at(-1).status,'WAIT_ZONE');
const noData=h.make('R1State',{raidReady:false,windowStart:110,windowEnd:160,expected:130});assert.equal(h.step(ctx,noData,candle,102,104,120,true).status,'NO_RAID_DATA');
const noTime=execute({...valid,bars:valid.bars.slice(0,2)});assert.equal(h.step(ctx,noTime.state,{...candle,start:120,finish:130,allowedTime:false},102,104,120,true).status,'TIME_BLOCKED');
assert.equal(h.step(ctx,h.make('R1State'),{...candle,closed:false},102,104,120,true).hit,false);
assert.equal(h.step(ctx,h.make('R1State'),{...candle,eligible:false},102,104,120,true).hit,false);
assert.match(s,/DEFAULT_SIGNAL_TIMING = "Pullback"/);
for(const line of s.split(/\r?\n/).filter(l=>/^r1(?:Main|Higher)(?:Low|High|At) = input\./.test(l)))assert.ok(line.includes('display=display.none'),'Manual prices/times do not clutter chart header');
assert.match(s,/R1State mainR1 = r1Mode and isLtf and focusAvailable/);
assert.match(s,/R1State higherR1 = r1Mode and higherAvailable/);
assert.match(s,/f_stepR1\(ctx, mainR1, r1Bar, r1MainLow, r1MainHigh, r1MainAt, waveAllowed\)/);
assert.match(s,/f_stepR1\(higherCtx, higherR1, r1Bar, r1HigherLow, r1HigherHigh, r1HigherAt, higherWaveAllowed\)/);
assert.match(s,/bT=q27\[1\], bEnd=q63\[1\]/);
assert.match(s,/bool legacyEntryEvent = entryEvent and not r1Mode/);assert.match(s,/plot\(requireMps \? 3 : r1Mode \? 2 : 1, "TFA audit schema"/);
assert.match(s,/not confirmedHit, r1Mode, earlyMpsAllowed\)/);assert.match(s,/signalTiming == "Pullback" or forcePullback/);
assert.match(s,/map.contains\(records, token\) \? map.get\(records, token\) : R1State.new\(\)/);
const core=s.slice(s.indexOf('f_stepR1('),s.indexOf('// Cache state by source/attempt:'));
assert.doesNotMatch(core,/live[OHLC]|request.security|f_stepChannel|localTs/);
assert.equal((s.match(/^plot\(/gm)||[]).length+(s.match(/^alertcondition\(/gm)||[]).length<=64,true,'Pine plot/alert budget');
console.log(`PASS R1 actual-source parity: ${cases.length} mirrored cases, ${prefixes} immutable prefixes, real reference/raid provider, closed-bar gates, isolated inputs/states and schema separation. Not market/runtime verification.`);
