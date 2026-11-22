// Usage: node tools/audit-crt-replay.cjs replay.csv [reload.csv]
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {audit,compare}=require('./lib/crt-replay-audit.cjs');
if(require.main===module){
 try{
  const args=process.argv.slice(2);if(args.length<1||args.length>2)throw Error('Usage: node tools/audit-crt-replay.cjs replay.csv [reload.csv]');
  const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8'),result={localSourceSha256:crypto.createHash('sha256').update(source.replace(/\r\n/g,'\n')).digest('hex'),inputs:args.map(p=>({name:path.basename(p),sha256:crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')}))};
  const a=audit(fs.readFileSync(args[0],'utf8'));result.replay={...a};delete result.replay.rows;
  if(args[1]){const b=audit(fs.readFileSync(args[1],'utf8'));result.reload={...b};delete result.reload.rows;result.comparison=compare(a,b);}
  fs.mkdirSync('output/crt-replay',{recursive:true});fs.writeFileSync('output/crt-replay/audit.json',JSON.stringify(result,null,2)+'\n');
  console.log(`Replay export: ${a.closedBars} closed bars, ${a.signals.length} signals, ${a.issues.length} issues, ${a.incomplete.length} incomplete checks.`);
  if(result.comparison)console.log('Reload comparison: '+result.comparison.status);
  console.log('Report: output/crt-replay/audit.json. This does not measure profitability or certify market Replay.');
  const bad=[result.replay,result.reload].filter(Boolean).some(x=>x.issues.length)||result.comparison?.differences.length||result.comparison?.incomparable.length;
  const incomplete=[result.replay,result.reload].filter(Boolean).some(x=>x.incomplete.length)||(result.comparison&&result.comparison.commonClosedBars===0);
  process.exitCode=bad?1:incomplete?2:0;
 }catch(error){console.error(error.message+'; no new report written.');process.exitCode=1;}
}
