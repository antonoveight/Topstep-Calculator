// Execute the actual scalar Pine channel body; not request.security or Pine rollback.
const assert=require('node:assert/strict'),fs=require('node:fs');
const s=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const {createHarness}=require('./helpers/pine-channel-harness.cjs');const h=createHarness(s);
assert.ok(!/CISD|MSS|FVG|\bOB\b|\bICT\b|Quarterly|macro|TrueOpen|obSeed|cisd|mss|fvg/i.test(s),'Removed concepts absent from active Pine');
assert.equal(s,fs.readFileSync('chibao.txt','utf8'));
const b=(t,o,hi,l,c)=>({t,o,h:hi,l,c}),mirror=x=>({...x,o:200-x.o,h:200-x.l,l:200-x.h,c:200-x.c});
const base=[b(99,105,108,102,106),b(100,105,108,102,106),b(101,105,107,101,104),b(102,104,106,102,105),b(103,105,109,104,108)];
function run(tape,dir=1,options={},ctxExtra={}){
 const ctx={id:1,kind:1,flags:1,phase:1,dir,age:0,confirmed:100,resolved:100,inv:dir===1?90:110,cp:dir===1?120:80,...ctxExtra},state=h.state(ctx),out=[];
 for(let i=1;i<tape.length;i++)out.push(h.step(ctx,state,tape.slice(0,i+1),options));
 return {state,out,hits:out.flatMap((r,i)=>r.hit?[tape[i+1].t]:[])};
}
let cases=0;
for(const dir of [1,-1]){
 const transform=t=>dir===1?t:t.map(mirror),test=(t=base,o={},c={})=>{cases++;return run(transform(t),dir,o,c);};
 assert.deepEqual(test().hits,[102],'Pullback emits on retest close, never sweep candle');
 assert.deepEqual(test(base,{timing:'Confirmation close'}).hits,[101]);
 assert.deepEqual(test(base,{confirmed:false}).hits,[]);
 assert.deepEqual(test(base,{isLtf:false}).hits,[]);
 assert.deepEqual(test(base,{}, {age:1}).hits,[]);
 assert.deepEqual(test(base,{}, {confirmed:101}).hits,[],'Both local candles must form after activation');
 const doubled=base.map(x=>x.t===101?{...x,h:109}:x);assert.deepEqual(test(doubled).hits,[]);
 const noReclaim=base.slice(0,3).map(x=>x.t===101?{...x,c:102}:x);assert.deepEqual(test(noReclaim,{timing:'Confirmation close'}).hits,[]);
 const stopped=base.map(x=>x.t===101?{...x,l:89}:x);assert.deepEqual(test(stopped).hits,[]);assert.equal(test(stopped).out.at(-1).status,'SL TOUCHED');
 const targeted=base.map(x=>x.t===101?{...x,h:121}:x);assert.deepEqual(test(targeted).hits,[]);assert.equal(test(targeted).out.at(-1).status,'CP TAKEN');
 assert.deepEqual(test(base,{waveAllowed:false}).hits,[]);
 assert.deepEqual(test(base,{bias:0}).hits,[]);
 assert.deepEqual(test(base,{bias:-dir}).hits,[],'Counter-bias without prior key is blocked');
 const key={kind:3,dir,hi:dir===1?95:105,lo:dir===1?95:105,knownAt:80,beforeTime:90};
 assert.deepEqual(test(base,{bias:-dir},{crtKey:key}).hits,[102]);
 assert.deepEqual(test(base,{bias:-dir,allowCrtCounter:false},{crtKey:key}).hits,[]);
 assert.deepEqual(test(base,{bias:-dir},{crtKey:{...key,knownAt:91}}).hits,[]);
 assert.deepEqual(test(base,{bias:-dir},{crtKey:{...key,kind:1}}).hits,[],'Removed zone key cannot authorize a reversal');
 const renewed=[...base.slice(0,3),b(102,104,106,100,104),b(103,104,106,101,103)];
 const reset=test(renewed);assert.deepEqual(reset.hits,[103]);assert.equal(reset.out[2].hit,false,'New raid invalidates old pending retest and must confirm again');
 assert.equal(reset.state.confirmTime,102);
 const repeated=[...base.slice(0,4),b(103,106,109,104,108),b(104,108,109,103,106),b(105,106,108,104,107)];
 assert.deepEqual(test(repeated).hits,[102,105]);
 assert.deepEqual(test(repeated,{cadence:'One per model'}).hits,[102]);
 for(let n=1;n<base.length;n++){const prefix=test(base.slice(0,n));assert.deepEqual(prefix.hits,test().hits.filter(t=>t<=base[n-1].t),'Appending future bars does not backfill historical signals');}
}
const fields=s.match(/^    \[selected.uid,.+$/m)[0].trim().slice(1,-1).split(', ');
assert.equal(fields.length,63);assert.ok(fields.length+7+6<=127);
assert.match(s,/bool entryWindow = ctx.age == 0/);
assert.match(s,/bool timeAllowed = true/);
assert.match(s,/str.format_time\(liveEnd, "HH:mm", NY\)/);
assert.match(s,/q.price < m.hi and q.price > m.lo/);
assert.match(s,/k.knownAt <= beforeTime/);
assert.match(s,/if q.born < scanStart or \(q.side == 1 \? high >= q.price : low <= q.price\)/);
console.log(`PASS ${cases} symmetric pure-CRT traces: closed TS, later retest, expiry, barriers, key timing, duplicate suppression and immutable prefixes. Synthetic only.`);
