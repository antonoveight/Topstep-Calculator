const assert=require('node:assert/strict'),fs=require('node:fs');
const {C,audit,compare,parseCsv,timestamp}=require('../tools/lib/crt-replay-audit.cjs');
const base=Date.parse('2026-11-16T10:00:00Z'),minute=60000;
const fields=['time','open','high','low','close',...Object.values(C)];
function tape(dir=1){
 const bars=[[105,108,102,106],[105,107,101,104],[104,106,102,105],[105,109,104,108]].map(([open,high,low,close],i)=>({time:base+i*5*minute,open,high,low,close,schema:1,end:base+(i+1)*5*minute,htf:3600,ltf:300,pullback:1,tick:1}));
 Object.assign(bars[2],{model:base-60*minute,ts:base+5*minute,confirmed:base,start:base,finish:base+60*minute,age:0,level:102,extreme:101,dir:1,target:120,inv:90,reference:105});
 if(dir===-1)for(const b of bars){const h=b.high;b.open=200-b.open;b.high=200-b.low;b.low=200-h;b.close=200-b.close;if(b.dir){for(const k of ['level','extreme','target','inv','reference'])b[k]=200-b[k];b.dir=-1;}}
 return bars;
}
function csv(bars,prefix=''){
 const reverse=Object.fromEntries(Object.entries(C).map(([k,v])=>[v,k]));
 const escape=v=>'"'+String(v??'').replaceAll('"','""')+'"';
 return '\uFEFF'+fields.map(f=>escape(f in reverse?prefix+f:f)).join(',')+'\r\n'+bars.map(b=>fields.map(f=>escape(f==='time'?b.time/1000:b[reverse[f]||f])).join(',')).join('\r\n');
}
let checked=0;
for(const dir of [1,-1]){
 const bars=tape(dir),baseline=audit(csv(bars));assert.equal(baseline.status,'checks_passed');assert.equal(baseline.signals.length,1);assert.equal(baseline.marketReplayVerified,false);checked++;
 assert.equal(audit(csv(bars,'TFA v6: ')).status,'checks_passed');
 const test=(mutate,rule)=>{const copy=structuredClone(bars);mutate(copy);const r=audit(csv(copy));assert.ok(r.issues.some(x=>x.rule===rule),rule);checked++;};
 test(x=>x[2].age=1,'outside_confirmed_c3');
 test(x=>x[2].finish=x[2].time,'outside_confirmed_c3');
 test(x=>x[2].ts=x[2].time,'confirmation_not_one_sided_ts');
 test(x=>x[2].level+=1,'confirmation_anchor_mismatch');
 test(x=>x[2].reference+=1,'signal_reference_not_bar_close');
 test(x=>x[2].end=null,'signal_on_unclosed_bar');
 test(x=>x[2].model=null,'signal_metadata_missing');
 test(x=>dir===1?x[0].low=89:x[0].high=111,'htf_barrier_taken_earlier_in_c3');
 test(x=>dir===1?x[1].high=109:x[1].low=91,'confirmation_not_one_sided_ts');
 test(x=>dir===1?x[2].low=100:x[2].high=100,'invalid_retest');
 const noSignal=structuredClone(bars);for(const x of noSignal)x.dir=null;assert.equal(audit(csv(noSignal)).status,'incomplete');
 const partial=audit(csv(bars.slice(1)));assert.equal(partial.status,'incomplete');
 assert.equal(compare(baseline,audit(csv(bars))).status,'matched_common_bars');
 assert.equal(compare(baseline,audit(csv(noSignal))).status,'differences');
 const changed=structuredClone(bars);changed[0].close+=dir;assert.equal(compare(baseline,audit(csv(changed))).status,'incomparable');
 const future=tape(dir);for(const b of future){b.time+=86400000;if(b.end)b.end+=86400000;}assert.equal(compare(baseline,audit(csv(future))).status,'incomplete');
 const market=[...bars.slice(0,2),{...bars[2],dir:null},bars[3],{...bars[2],time:base+20*minute,end:base+25*minute}];
 if(dir===1){market[2].low=101;market[2].close=102;}else{market[2].high=99;market[2].close=98;}
 assert.ok(audit(csv(market)).issues.some(x=>x.rule==='pending_was_revoked_before_signal'));
}
assert.throws(()=>audit(csv([])),/no data rows/);
assert.throws(()=>audit('time,open\n1,1'),/Expected one column/);
assert.throws(()=>audit(csv([...tape(),tape()[0]])),/unordered time/);
assert.throws(()=>timestamp('2026-11-16T10:00:00'),/explicit UTC offset/);
assert.equal(timestamp('2026-11-16T17:00:00+07:00'),base);
assert.deepEqual(parseCsv('a,b\n"a,b","He said ""yes"""').rows,[['a,b','He said "yes"']]);
assert.throws(()=>parseCsv('a,b\n"broken,1'),/Unclosed/);
const s=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
for(const title of Object.values(C))assert.ok(s.includes('"'+title+'"'),'Actual plot missing '+title);
for(const line of s.split(/\r?\n/).filter(l=>l.startsWith('plot(')&&l.includes('"TFA audit ')))assert.ok(line.includes('display=display.data_window'));
assert.equal((s.match(/= input\./g)||[]).length,21,'Audit must not add settings');
assert.equal(s,fs.readFileSync('chibao.txt','utf8'));
// Exercise CLI exit codes/report output without touching the user's real report.
const path=require('node:path'),{spawnSync}=require('node:child_process');
fs.mkdirSync('output/crt-replay',{recursive:true});
const sandbox=fs.mkdtempSync(path.resolve('output/crt-replay/synthetic-cli-'));
fs.mkdirSync(path.join(sandbox,'indicators'));fs.writeFileSync(path.join(sandbox,'indicators/funded-angler-v6.pine'),s);
const input=path.join(sandbox,'synthetic.csv'),reload=path.join(sandbox,'synthetic-reload.csv');
fs.writeFileSync(input,csv(tape()));fs.writeFileSync(reload,csv(tape()));
const cli=(...args)=>spawnSync(process.execPath,[path.resolve('tools/audit-crt-replay.cjs'),...args],{cwd:sandbox,encoding:'utf8'});
assert.equal(cli(input,reload).status,0);
const report=()=>JSON.parse(fs.readFileSync(path.join(sandbox,'output/crt-replay/audit.json'),'utf8'));
assert.equal(report().comparison.status,'matched_common_bars');assert.equal(report().replay.marketReplayVerified,false);
const empty=tape().map(x=>({...x,dir:null}));fs.writeFileSync(reload,csv(empty));
assert.equal(cli(input,reload).status,1);assert.equal(report().comparison.status,'differences');
assert.equal(cli(reload).status,2);assert.equal(report().replay.status,'incomplete');
assert.equal(cli().status,1);
console.log(`PASS ${checked} symmetric export audit cases; strict CSV/time parsing, partial/no-signal coverage, reload differences, changed OHLC/feed, actual plot wiring and unchanged 21 inputs. Synthetic only.`);
