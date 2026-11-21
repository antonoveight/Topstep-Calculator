// HISTORICAL before pure CRT 2026-11-22; excluded from current check runners.
// Superseded by tests/pure-crt.cjs, crt-liquidity.cjs and crt-context.cjs.
// Execute the actual Pine channel on a confirmation that fails before entry.
// Fixtures provide HTF context/known pivots; not a Pine runtime or market test.
const assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const h=require('./helpers/pine-channel-harness.cjs').createHarness(source);
const b=(t,o,h,l,c)=>({t,o,h,l,c});
const base=[b(98,100,103,99,102),b(99,102,104,101,103),b(100,105,106,102,103),b(101,103,107,102,106),b(102,106,106.5,103.5,104),b(103,104,108,104,107),b(104,107,108,104.75,107)];
const key={kind:1,dir:1,hi:105,lo:102,knownAt:80,beforeTime:90,tf:'60'};
const context={id:1,kind:1,flags:1,phase:1,dir:1,age:0,confirmed:100,resolved:100,hi:120,lo:90,inv:90,cp:120,crtKey:key};
function run(dir,entryMode='Auto',opts={},tape=base,seedCaches=false){
 const ctx=dir===1?context:{...context,dir:-1,hi:110,lo:80,inv:110,cp:80,crtKey:{...key,dir:-1,hi:98,lo:95}};
 const bars=dir===1?tape:tape.map(x=>b(x.t,200-x.o,200-x.l,200-x.h,200-x.c));
 const state={...h.state(ctx),mssLevel:dir===1?105:95},out=[];
 for(let i=2;i<bars.length;i++){
  const t=bars[i].t;
  if(t===102&&seedCaches)Object.assign(state,{fvgIndex:1,fvgTime:99,fvgTop:dir===1?105:95,fvgBottom:dir===1?104:94,obIndex:1,obTime:99,obTop:dir===1?106:96,obBottom:dir===1?104:94});
  const r=h.step({...ctx,age:opts.closeC3&&t>=103?1:0},state,bars.slice(0,i+1),{entryMode,knownHigh:dir===1?105:null,knownLow:dir===1?null:95,...opts});
  out.push({t,hit:r.hit,status:r.status,confirmTime:state.confirmTime,confirmLevel:state.confirmLevel,fvgIndex:state.fvgIndex,obIndex:state.obIndex,everSent:state.everSent,localStopTaken:state.localStopTaken,localTargetTaken:state.localTargetTaken});
 }
 return out;
}
for(const dir of [1,-1])for(const mode of ['Auto','CISD','MSS']){
 const result=run(dir,mode);
 assert.deepEqual(result.filter(x=>x.hit).map(x=>x.t),[104],`Renewed ${mode} ${dir} needs its OWN later retest`);
 const reset=result.find(x=>x.t===102);assert.equal(reset.confirmTime,null);assert.equal(reset.status,'CM RESET');assert.equal(reset.everSent,false,'An invalid pending confirmation is not an emitted signal');
 assert.equal(result.find(x=>x.t===103).confirmTime,103);assert.equal(result.find(x=>x.t===103).hit,false,'No Pullback signal on the new confirmation candle');
 const wick=base.map(x=>x.t===102?b(102,106,107,104,106):x);
 assert.deepEqual(run(dir,mode,{},wick).filter(x=>x.hit).map(x=>x.t),[102],'A wick retest with a held close is valid');
 const boundary=base.map(x=>x.t===102?b(102,106,106.5,104.75,105):x);
 assert.equal(run(dir,mode,{},boundary).find(x=>x.t===102).confirmTime,101,'Touch/equal close alone is not a strict close-through');
 assert.deepEqual(run(dir,mode,{timing:'Confirmation close',cadence:'One per model'}).filter(x=>x.hit).map(x=>x.t),[101],'Do not erase or rearm an already emitted market-close signal');
 assert.deepEqual(run(dir,mode,{closeC3:true}).filter(x=>x.hit),[],'Expiry still blocks a pending new reaction');
 for(const guard of [{timeAllowed:false},{waveAllowed:false},{bias:0},{confirmed:false}])assert.deepEqual(run(dir,mode,guard).filter(x=>x.hit),[],'Keep all existing gates after a reset');
 const ct=run(dir,mode,{bias:-dir});assert.deepEqual(ct.filter(x=>x.hit).map(x=>x.t),[104],'Counter-bias still needs its prior key and fresh confirmation/retest');
}
for(const dir of [1,-1]){
 const cached=run(dir,'Auto',{},base,true).find(x=>x.t===102);assert.equal(cached.fvgIndex,null);assert.equal(cached.obIndex,null,'Old FVG/OB cannot bypass a revoked confirmation');
 const stopped=base.map(x=>x.t===102?{...x,l:89}:x),target=base.map(x=>x.t===102?{...x,h:121}:x);
 const sl=run(dir,'Auto',{},stopped),tp=run(dir,'Auto',{},target);
 assert.deepEqual(sl.filter(x=>x.hit),[]);assert.equal(sl.at(-1).localStopTaken,true);
 assert.deepEqual(tp.filter(x=>x.hit),[]);assert.equal(tp.at(-1).localTargetTaken,true,'Reset must not clear a consumed barrier');
}
console.log('PASS actual confirmation lifecycle: revoked pending C/M, later fresh close/retest, symmetric modes/CT, wick/boundary distinction, cache cleanup, sticky barriers, preserved emitted signals and C3/close/bias/time/wave gates. Synthetic only.');
