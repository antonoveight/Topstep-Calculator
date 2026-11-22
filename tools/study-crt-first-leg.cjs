const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {runCase}=require('./lib/crt-first-leg-study.cjs');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
function study(input){
 if(input?.kind!=='synthetic-first-leg-fixtures'||input.version!==1||!Array.isArray(input.cases)||!input.cases.length||input.cases.length>100||new Set(input.cases.map(c=>c.id)).size!==input.cases.length)throw Error('Expected version 1 synthetic-first-leg-fixtures, 1–100 unique cases; no market backtest input');
 const cases=input.cases.map(runCase);
 return {kind:'first-leg-research-study',version:1,marketData:false,pineRuntime:false,romeoModel1Verified:false,productionChanged:false,fillsOrPnlEvaluated:false,annotationsSupplied:['HTF context/TS event','confirmed LTF reference availability','manual zone','bias/key/wave gates'],fixtureSha256:sha(JSON.stringify(input)),implementationSha256:sha(fs.readFileSync(path.join(__dirname,'lib/crt-first-leg-study.cjs'),'utf8')),caseCount:cases.length,signalCases:cases.filter(c=>c.signals.length).length,cases};
}
if(require.main===module)try{
 const input=process.argv[2]||'docs/research/crt-first-leg-fixtures.json',output=process.argv[3]||'output/crt-first-leg/report.json';
 if(path.extname(output).toLowerCase()!=='.json'||path.resolve(input)===path.resolve(output))throw Error('Output must be a separate .json report, not the fixture or indicator source');
 const result=study(JSON.parse(fs.readFileSync(input,'utf8')));fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
 console.log(`Research candidate: ${result.caseCount} synthetic cases, ${result.signalCases} with an event. No Pine/market/PnL validation. Report: ${output}`);
}catch(e){console.error(e.message);process.exitCode=1;}
module.exports={study};
