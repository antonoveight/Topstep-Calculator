// Research only: compare existing entry timings using the restricted actual-source
// channel adapter. No HTF engine, feed, Pine rollback, fills or PnL simulation.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {createHarness}=require('../tests/helpers/pine-channel-harness.cjs');
const digest=s=>crypto.createHash('sha256').update(s).digest('hex');
function validate(input){
 if(input?.kind!=='synthetic-channel-fixtures'||input.version!==1||!Array.isArray(input.cases)||!input.cases.length||input.cases.length>100)throw Error('Expected version 1 synthetic-channel-fixtures with 1–100 cases; market CSV is not supported');
 const ids=new Set();
 for(const c of input.cases){
  if(typeof c.id!=='string'||!c.id||ids.has(c.id))throw Error('Missing/duplicate case id');ids.add(c.id);
  const m=c.context;
  if(!m||![1,-1].includes(m.dir)||![m.id,m.confirmed,m.resolved,m.inv,m.cp].every(Number.isFinite)||m.kind!==1||m.age!==0||m.phase!==1)throw Error(c.id+': supply a confirmed CRT context; no automatic HTF inference');
  if(m.dir===1?m.cp<=m.inv:m.cp>=m.inv)throw Error(c.id+': target/INV ordering');
  if(!Array.isArray(c.bars)||c.bars.length<2||c.bars.length>20000)throw Error(c.id+': invalid bar coverage');
  let prior=-Infinity;
  for(const b of c.bars){if(![b.t,b.o,b.h,b.l,b.c].every(Number.isFinite)||b.t<=prior||b.h<Math.max(b.o,b.l,b.c)||b.l>Math.min(b.o,b.h,b.c))throw Error(c.id+': invalid/unordered OHLC');prior=b.t;}
  for(const [t,age] of Object.entries(c.ageByTime||{}))if(!Number.isFinite(+t)||!Number.isInteger(age)||age<0||!c.bars.some(b=>b.t===+t))throw Error(c.id+': invalid supplied age');
  if(c.options&&('timing' in c.options||'cadence' in c.options))throw Error(c.id+': timing/cadence are controlled by this study');
  const allowed=new Set(['bias','waveAllowed','confirmed','isLtf','allowCrtCounter','sweepSize','timeAllowed']);
  for(const [key,value] of Object.entries(c.options||{})){
   if(!allowed.has(key))throw Error(c.id+': unsupported study option '+key);
   if(key==='bias'?![-1,0,1].includes(value):key==='sweepSize'?!(Number.isFinite(value)&&value>0):typeof value!=='boolean')throw Error(c.id+': invalid study option '+key);
  }
 }
 return input;
}
function study(source,input){
 validate(input);const h=createHarness(source);
 const cases=input.cases.map(c=>{
  const modes={};
  for(const timing of ['Pullback','Confirmation close']){
   const state=h.state(c.context),trace=[];
   for(let i=1;i<c.bars.length;i++){
    const bar=c.bars[i],ctx={...c.context,age:c.ageByTime?.[bar.t]??0};
    const event=h.step(ctx,state,c.bars.slice(0,i+1),{...c.options,timing,cadence:'Fresh reaction'});
    trace.push({time:bar.t,age:ctx.age,evaluated:event.evaluated,tsShape:event.tsDetected,retest:event.retestDetected,entryTrigger:event.entryDetected,signal:event.hit,status:event.status});
   }
   modes[timing]={signals:trace.filter(b=>b.signal).map(b=>b.time),evaluatedBars:trace.filter(b=>b.evaluated).length,tsShapes:trace.filter(b=>b.tsShape).length,retests:trace.filter(b=>b.retest).length,trace};
  }
  const p=modes.Pullback.signals,q=modes['Confirmation close'].signals;
  return {id:c.id,purpose:c.purpose||'',direction:c.context.dir,classification:p.length&&q.length?'both_timings':p.length?'pullback_only':q.length?'confirmation_only':'neither_timing',modes};
 });
 const classificationCounts={};for(const c of cases)classificationCounts[c.classification]=(classificationCounts[c.classification]||0)+1;
 return {kind:'synthetic-entry-timing-study',schema:1,sourceSha256:digest(source),fixtureSha256:digest(JSON.stringify(input)),baselineChanged:false,marketData:false,pineRuntime:false,htfContextsSupplied:true,profitabilityEvaluated:false,assumptions:{cadence:'Fresh reaction',defaultBias:'Aligned with supplied direction unless options.bias overrides it',defaultClosedBar:true,defaultEligibleLtf:true,defaultWaveAllowed:true,defaultSweepSize:0.01,retestTolerance:0.01,priceUnits:'Synthetic, not a symbol tick specification',pivots:'Not inferred; wave allowance supplied',htfLifecycle:'Supplied snapshots/ages, not a replay of the HTF registry'},classificationCounts,cases};
}
function main(){
 const fixture=process.argv[2]||'docs/research/crt-entry-study-fixtures.json',target=process.argv[3]||'output/crt-entry-study/report.json';
 const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8'),input=JSON.parse(fs.readFileSync(fixture,'utf8')),report=study(source,input);
 fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,JSON.stringify(report,null,2)+'\n');
 console.log('Synthetic entry timing study: '+report.cases.length+' cases; '+JSON.stringify(report.classificationCounts));
 console.log('No market backtest, HTF selection, fills or profitability comparison. Baseline unchanged. Report: '+target);
}
if(require.main===module)try{main();}catch(e){console.error(e.message);process.exitCode=1;}
module.exports={validate,study};
