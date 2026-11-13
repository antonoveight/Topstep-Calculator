// Configuration compatibility sweep on deterministic causal fixtures.
// NOT a backtest or a market-performance optimizer. HTF contexts/pivots are inputs.
const fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const harness=require('./helpers/pine-channel-harness.cjs').createHarness(source);
const bar=(t,o,h,l,c)=>({t,o,h,l,c});
const crt={id:1,kind:1,flags:1,phase:1,dir:1,confirmed:100,resolved:100,hi:120,lo:90,inv:90,cp:120,irlH:null,irlL:null,irlT:null};
const egf={...crt,id:2,kind:2,flags:2,phase:0,irlH:104,irlL:102,irlT:90};
const start=[bar(98,100,103,99,102),bar(99,102,104,101,103)];
const cases={
 cisd:{ctx:crt,tape:[...start,bar(100,105,106,102,103),bar(101,103,107,102,106),bar(102,106,109,106,108),bar(103,108,109,104,106)],expected:[103]},
 mss:{ctx:crt,seed:{mssLevel:105},tape:[bar(98,102,104,101,103),bar(99,103,105,102,104),bar(100,104,107,103,106),bar(101,106,108,104.5,107)],expected:[101]},
 fvg:{ctx:egf,tape:[...start,bar(100,103,105,102,104),bar(101,104,109,103,108),bar(102,108,111,107,110),bar(103,110,112,106,109)],expected:[103]},
 ob:{ctx:egf,tape:[...start,bar(100,105,106,102,103),bar(101,103,107,102,106),bar(102,106,108,104,107)],expected:[102]},
 renewed:{ctx:crt,pivots:{106:{pivotLow:106}},tape:[...start,bar(100,105,106,102,103),bar(101,103,107,102,106),bar(102,106,107,104,105.5),bar(103,105.5,110,105,109),bar(104,109,110,106,107),bar(105,107,112,107,111),bar(106,111,112,108,110),bar(107,110,112,108.5,110.5)],expected:[102,107]}
};
function mirror(test){
 const ctx={...test.ctx,dir:-1,hi:200-test.ctx.lo,lo:200-test.ctx.hi,inv:200-test.ctx.inv,cp:200-test.ctx.cp,irlH:test.ctx.irlL==null?null:200-test.ctx.irlL,irlL:test.ctx.irlH==null?null:200-test.ctx.irlH};
 return {...test,ctx,seed:test.seed?{mssLevel:200-test.seed.mssLevel}:undefined,pivots:Object.fromEntries(Object.entries(test.pivots||{}).map(([t,p])=>[t,{pivotHigh:200-p.pivotLow}])),tape:test.tape.map(b=>bar(b.t,200-b.o,200-b.l,200-b.h,200-b.c))};
}
function run(test,options){
 const state=Object.assign(harness.state(test.ctx),test.seed),hits=[];
 for(let j=2;j<test.tape.length;j++)if(harness.step(test.ctx,state,test.tape.slice(0,j+1),{...options,...test.pivots?.[test.tape[j].t]}).hit)hits.push(test.tape[j].t);
 return hits;
}
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),results=[];
let blockedChecks=0;
for(const entryMode of ['Auto','CISD','MSS','FVG retest','OB retest'])for(const timing of ['Pullback','Confirmation close'])for(const cadence of ['Fresh reaction','One per model']){
 const settings={entryMode,timing,cadence},row={...settings,matchingWorkflowCases:0,totalCases:10,observed:{}};
 for(const [name,test] of Object.entries(cases))for(const [direction,fixture] of [['Buy',test],['Sell',mirror(test)]]){
  const hits=run(fixture,settings);row.observed[name+direction]=hits;
  row.matchingWorkflowCases+=Number(same(hits,fixture.expected));
  for(const guard of [{confirmed:false},{bias:-fixture.ctx.dir},{timeAllowed:false},{waveAllowed:false}]){
   assert.deepEqual(run(fixture,{...settings,...guard}),[],'Every candidate must retain close/bias/time/wave gates');blockedChecks++;
  }
 }
 results.push(row);
}
const eligible=results.filter(r=>r.matchingWorkflowCases===r.totalCases);
assert.equal(eligible.length,1,'One combination satisfies these explicitly chosen workflow contracts');
assert.deepEqual([eligible[0].entryMode,eligible[0].timing,eligible[0].cadence],['Auto','Pullback','Fresh reaction']);
for(const [name,field,input] of [['DEFAULT_ENTRY_MODE','entryMode','entryMode'],['DEFAULT_SIGNAL_TIMING','timing','signalTiming'],['DEFAULT_SIGNAL_CADENCE','cadence','signalCadence']]){
 const declared=source.match(new RegExp('const string '+name+' = "([^"]+)"'));
 assert.ok(declared,'Default must be explicitly declared');
 assert.equal(declared[1],eligible[0][field],'Source default matches the workflow-compatible profile');
 assert.ok(source.includes(input+' = input.string('+name+','),'Input must actually consume the validated default');
}
const report={date:'2026-11-14',scope:'synthetic workflow compatibility; NOT market optimization',combinations:results.length,blockedChecks,eligible:eligible.map(({entryMode,timing,cadence})=>({entryMode,timing,cadence})),notEvaluated:['HTF H1/H2/H4','Bias TF','model timeout','time windows','profit','drawdown','spread/slippage','actual XAUUSD history','Pine chart/Replay'],results};
if(require.main===module){
 console.table(results.map(({entryMode,timing,cadence,matchingWorkflowCases,totalCases})=>({entryMode,timing,cadence,match:matchingWorkflowCases+'/'+totalCases})));
 console.log(JSON.stringify({combinations:report.combinations,blockedChecks,eligible:report.eligible,scope:report.scope}));
 if(process.argv.includes('--write')){fs.mkdirSync('output/settings-review',{recursive:true});fs.writeFileSync('output/settings-review/workflow-matrix.json',JSON.stringify(report,null,2)+'\n');}
}
module.exports={report};
