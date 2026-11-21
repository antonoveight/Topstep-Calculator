// HISTORICAL before pure CRT 2026-11-22; excluded from current check runners.
// Superseded by tests/pure-crt.cjs, crt-liquidity.cjs and crt-context.cjs.
// PERSONAL RESEARCH PROTOCOL, not an Early C2 Pine implementation or market backtest.
const assert=require('node:assert/strict'),fs=require('node:fs');
const {replay}=require('./helpers/early-c2-research-spec.cjs'),fixtures=require('./fixtures/early-c2-research.json');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
// Use the actual confirmed CRT pattern body only for the C2-close handoff.
const lines=source.split(/\r?\n/),start=lines.findIndex(l=>l.startsWith('f_patterns('));let end=start+1;while(end<lines.length&&(!lines[end].trim()||/^\s/.test(lines[end])))end++;
const body=lines.slice(start+1,end).filter(l=>l.trim()&&!l.trim().startsWith('//')).map(l=>l.trim());
const js=s=>s.replace(/\band\b/g,'&&').replace(/\bor\b/g,'||').replace(/\bnot\b/g,'!').replace(/\bna\b(?!\s*\()/g,'NaN');
const code=body.map((l,i)=>i===body.length-1?'return '+js(l)+';':js(l.replace(/^(?:float|bool) /,'let '))+';').join('\n');
const pattern=Function('na','tsReference','manualSsl','manualBsl','sweepSize','c1o','c1h','c1l','c1c','c2o','c2h','c2l','c2c',code);
const confirmed=(tick)=>(c1,c2)=>{const [buy,sell]=pattern(x=>x==null||Number.isNaN(x),'C1 range',0,0,tick,c1.open,c1.high,c1.low,c1.close,c2.close,c2.high,c2.low,c2.close);return buy?1:sell?-1:0;};
function materialize(f){const ctx={...structuredClone(fixtures.context),...f.contextPatch};if(Object.hasOwn(f,'keyPatch'))ctx.key=f.keyPatch==null?null:{...ctx.key,...f.keyPatch};const tape=fixtures.bars.filter(b=>!(f.omitAt||[]).includes(b.at)).map(b=>({...structuredClone(b),...(f.edits||[]).find(x=>x.at===b.at)}));tape.push(...structuredClone(f.addBars||[]));return {ctx,tape:tape.sort((a,b)=>a.at-b.at)};}
function mirror({ctx,tape}){const k=ctx.key;return {ctx:{...ctx,direction:-ctx.direction,bias:-ctx.bias,c1:{...ctx.c1,open:200-ctx.c1.open,high:200-ctx.c1.low,low:200-ctx.c1.high,close:200-ctx.c1.close},key:k?{...k,direction:-k.direction,high:200-k.low,low:200-k.high}:null},tape:tape.map(b=>({...b,...(b.bias!=null?{bias:-b.bias}:{}),open:200-b.open,high:200-b.low,low:200-b.high,close:200-b.close,shift:b.shift?{...b.shift,level:200-b.shift.level}:null,manualEntry:b.manualEntry?{...b.manualEntry,price:200-b.manualEntry.price,sl:200-b.manualEntry.sl,tp:200-b.manualEntry.tp}:null}))};}
let tested=0,prefixes=0;const results=[];
for(const f of fixtures.cases)for(const side of ['sell','buy']){
 const data=side==='sell'?materialize(f):mirror(materialize(f)),{ctx,tape}=data;
 for(const b of tape){assert.equal(typeof b.closed,'boolean',f.id+' closed flag');assert.ok(b.low<=Math.min(b.open,b.close)&&b.high>=Math.max(b.open,b.close),f.id+' OHLC');assert.ok(b.openAt<b.at);}
 const original=JSON.stringify(data),result=replay(ctx,tape,confirmed(ctx.tick));assert.equal(JSON.stringify(data),original,'The spec must not mutate future fixture inputs');
 assert.deepEqual(result.readyAt,f.expected.readyAt,f.id+' / '+side);
 assert.equal(result.log.at(-1)?.closeStatus??null,f.expected.closeStatus,f.id+' close / '+side);
 for(const [at,status] of Object.entries(f.expected.statuses||{}))assert.equal(result.log.find(x=>x.at===Number(at))?.status,status,f.id+' at '+at+' / '+side);
 for(const at of f.expected.notReadyAt||[])assert.equal(result.log.find(x=>x.at===at)?.earlyReady,false,'Revoked readiness must not remain live: '+f.id);
 if(f.expected.frozenSl!=null){const entered=result.log.filter(x=>x.entry);assert.ok(entered.length);assert.ok(entered.every(x=>x.entry.sl===(side==='sell'?f.expected.frozenSl:200-f.expected.frozenSl)));assert.equal(entered.at(-1).entryBarrier,f.expected.barrier);}
 // Appending the final C2 candle must not retroactively repair or erase earlier states.
 for(let n=1;n<=tape.length;n++){assert.deepEqual(replay(ctx,tape.slice(0,n),confirmed(ctx.tick)).log,result.log.slice(0,n),f.id+' immutable prefix');prefixes++;}
 for(const row of result.log.filter(x=>x.earlyReady))assert.ok(row.at<ctx.c2.closeAt,'EARLY_READY is never C3 permission');
 results.push({case:f.id,side,readyAt:result.readyAt,closeStatus:result.log.at(-1)?.closeStatus??null});tested++;
}
const base=materialize(fixtures.cases[0]);assert.throws(()=>replay(base.ctx,[base.tape[1],base.tape[0]],confirmed(.25)),/out-of-order/);
assert.throws(()=>replay(base.ctx,[base.tape[0],base.tape[0]],confirmed(.25)),/Duplicate/);
assert.doesNotMatch(source,/EARLY_READY|early-c2-research|Early C2.*input\./,'Research must not ship as live indicator signals');
if(process.argv.includes('--write')){fs.mkdirSync('output/early-c2-research',{recursive:true});fs.writeFileSync('output/early-c2-research/results.json',JSON.stringify({scope:fixtures.scope,cases:tested,prefixes,results},null,2));}
console.log(`PASS research protocol: ${tested} symmetric scenario runs, ${prefixes} immutable-prefix checks; key knowledge, closed LTF/C2 separation, C/M/retest timing, resets, frozen observed SL and HTF handoff. Not Pine Early C2 signals or profitability.`);
