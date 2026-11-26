// Compare configuration behavior using actual Pine function bodies, not market P/L.
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const h=require('../tests/helpers/pine-channel-harness.cjs').createHarness(source);
const b=(t,o,h,l,c)=>({t,end:t+1,o,h,l,c});
const tape=[b(100,104,108,102,106),b(101,108,111,103,105),b(102,104,105,99,100),b(103,99,101,96,97),b(104,104,107,100,101),b(105,101,104,98,100),b(106,100,104,97,99)];
const mirror=x=>({...x,o:220-x.o,h:220-x.l,l:220-x.h,c:220-x.c});
let runs=0,prefixChecks=0;
function run(profile,dir,scenario={},bars=dir===-1?tape:tape.map(mirror)){
 const ctx={id:1,kind:1,flags:1,phase:1,dir,confirmed:100,inv:dir===-1?120:100,cp:dir===-1?80:140,crtKey:{kind:2,dir,hi:dir===-1?114:110,lo:dir===-1?110:106,knownAt:80,beforeTime:90,tf:'60'},...scenario.context};
 const state=h.state(ctx),trace=[],hits=[];
 for(let i=1;i<bars.length;i++){
  const result=h.step(ctx,state,bars.slice(0,i+1),{knownLow:dir===-1?102:112,knownHigh:dir===-1?108:118,knownHighAt:dir===-1?95:98,knownLowAt:dir===-1?98:95,...profile,...scenario.options});
  trace.push(result);if(result.hit)hits.push({time:bars[i].t,tag:result.tag});
 }
 runs++;return {trace,hits};
}
const rows=[];
for(const branches of ['TS + FVG + OTE','TS close','FVG / OTE'])for(const cadence of ['Fresh reaction','One per model'])for(const requireKey of [true,false])for(const allowCrtCounter of [false,true]){
 const settings={branches,cadence,requireKey,allowCrtCounter},observed={},checks={noDirectEntry:true,pullbackRetained:true,localKeyRequired:true,counterObservationOnly:true,parentConflictBlocked:true,closedCandleOnly:true,causalPrefixes:true};
 for(const dir of [-1,1]){
  const baseline=run(settings,dir),missing=run(settings,dir,{options:{localKeys:[]},context:{crtKey:null}}),counter=run(settings,dir,{options:{bias:-dir}});
  const conflict=run(settings,dir,{context:{parentLive:true,parentDir:-dir,parentConfirmed:90,parentAtKey:true}}),open=run(settings,dir,{options:{confirmed:false}});
  observed[dir===1?'buy':'sell']={baseline:baseline.hits,withoutKey:missing.hits,counter:counter.hits};
  checks.noDirectEntry&&=!baseline.hits.some(x=>x.tag.includes('TS_CLOSE'));
  checks.pullbackRetained&&=baseline.hits.some(x=>/FVG|OTE/.test(x.tag));
  checks.localKeyRequired&&=missing.hits.length===0;
  checks.counterObservationOnly&&=counter.hits.length===0;
  checks.parentConflictBlocked&&=conflict.hits.length===0;
  checks.closedCandleOnly&&=open.hits.length===0;
  const bars=dir===-1?tape:tape.map(mirror);
  for(let n=2;n<=bars.length;n++){
   assert.deepEqual(run(settings,dir,{},bars.slice(0,n)).hits,baseline.hits.filter(x=>x.time<=bars[n-1].t));prefixChecks++;
  }
 }
 assert.ok(checks.parentConflictBlocked&&checks.closedCandleOnly,'Every candidate retains hard safety/causality gates');
 rows.push({settings,checks,observed,compatible:Object.values(checks).every(Boolean)});
}
const compatible=rows.filter(x=>x.compatible);
assert.ok(compatible.length>0,'At least one profile retains the chosen pullback workflow');
const selected=compatible.find(x=>x.settings.cadence==='Fresh reaction');
assert.ok(selected,'Keep independent fresh reactions instead of spending the entire setup on its first entry');
assert.match(source,/entryBranches = input.string\("FVG \/ OTE"/);
assert.match(source,/allowCrtCounter = input.bool\(false/);
assert.match(source,/requireKey = input.bool\(true/);
const report={date:'2026-11-26',sourceSha256:crypto.createHash('sha256').update(source.replace(/\r\n/g,'\n').trim()).digest('hex'),scope:'Actual-source configuration compatibility on constructed symmetric OHLC, known pivot and HTF snapshots. Not a feed replay or profit optimization.',candidates:rows.length,runs,prefixChecks,criteriaOrigin:{method:'Prior HTF key, directional context, closed reclaim and independent TS/FVG/OTE branches.',personal:'Pullback only; counter observation-only; keep later qualified fresh reactions within a live setup.'},compatible:compatible.map(x=>x.settings),selected:selected.settings,tieBreak:'Both cadences satisfy the measured guards. Fresh reaction retains OTE at 104 and a separate FVG branch at 105; One per model suppresses that second branch. Selection follows the user workflow, not demonstrated profitability.',notRanked:['H1 vs H2 vs H4 performance','D1 auto-bias predictive accuracy','Chart vs M15 structure performance','Early C2 profitability','Light vs Full signal completeness','Any actual-market win rate, P/L, spread or slippage'],rows};
if(require.main===module){fs.mkdirSync('output/pine-review',{recursive:true});fs.writeFileSync('output/pine-review/crt-settings-study.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({candidates:report.candidates,runs,prefixChecks,compatible:report.compatible,selected:report.selected},null,2));}
module.exports=report;
