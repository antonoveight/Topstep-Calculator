// HISTORICAL before pure CRT 2026-11-22; excluded from current check runners.
// Superseded by tests/pure-crt.cjs, crt-liquidity.cjs and crt-context.cjs.
const assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const prior=fs.readFileSync('indicators/archive/funded-angler-v6-multimodel-2026-11-21.pine','utf8');
const {createHarness}=require('./helpers/pine-channel-harness.cjs'),h=createHarness(source),old=createHarness(prior);
const data=require('./fixtures/crt-v1-patterns.json');
function js(s){return s.replace(/\band\b/g,'&&').replace(/\bor\b/g,'||').replace(/\bnot\b/g,'!').replace(/\bna\b(?!\s*\()/g,'null');}
function pattern(c1,c2){const vars={c1o:c1.o,c1h:c1.h,c1l:c1.l,c1c:c1.c,c2o:c2.o,c2h:c2.h,c2l:c2.l,c2c:c2.c,sweepSize:data.sweepSize,tsReference:'C1 range',manualSsl:0,manualBsl:0,na:x=>x==null};for(const name of ['lowRef','highRef','tookLow','tookHigh','reclaimed','sweptBothC1','doubleSweep','tsBull','tsBear']){const expr=source.match(new RegExp('^    (?:bool|float) '+name+' = (.+)$','m'))[1];vars[name]=Function(...Object.keys(vars),'return '+js(expr))(...Object.values(vars));}return vars.tsBull?1:vars.tsBear?-1:0;}
const mirror=c=>({o:200-c.o,h:200-c.l,l:200-c.h,c:200-c.c});
for(const c of data.cases){assert.equal(pattern(data.c1,c.c2),c.dir,c.name);assert.ok(pattern(mirror(data.c1),mirror(c.c2))===-c.dir,c.name+' mirrored');}
let seed=17;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
for(let i=0;i<3000;i++){const l=98-rand()*5,hi=102+rand()*15,c2={o:104,h:hi,l,c:l+rand()*(hi-l)};const got=pattern(data.c1,c2),expected=l<=99.75&&hi<110.25&&c2.c>100&&c2.c<110?1:hi>=110.25&&l>99.75&&c2.c>100&&c2.c<110?-1:0;assert.equal(got,expected);assert.ok(pattern(mirror(data.c1),mirror(c2))===-got);}
// Execute the actual source lifecycle helper, not a parallel registry implementation.
const body=source.match(/f_crtEnd\([^\n]+=>\n([\s\S]*?)\n\n/)[1].trim().split('\n').filter(l=>l.trim()&&!l.trim().startsWith('//'));
const endCode=body.map((l,i)=>i===body.length-1?'return '+js(l.trim())+';':js(l.trim().replace(/^bool /,'let '))+';').join('\n');
const end=Function('direction','invalidation','targetLevel','barHigh','barLow','closing','older','outsideHistory','timedOut',endCode);
for(const dir of [1,-1])for(const [high,low,close,older,hist,timeout,want] of [[109,101,105,true,false,false,0],[111,101,109,true,false,false,2],[109,98,98,true,false,false,1],[111,98,98,true,false,false,4],[109,101,105,true,false,true,3],[109,101,105,true,true,true,5],[111,98,98,false,false,false,0],[111,101,109,true,false,true,2]]){
 assert.equal(dir===1?end(1,99,110,high,low,close,older,hist,timeout):end(-1,101,90,200-low,200-high,200-close,older,hist,timeout),want);
}
const b=(t,o,h,l,c)=>({t,o,h,l,c}),ctx={id:1,kind:1,flags:1,phase:1,dir:1,age:0,confirmed:100,resolved:100,hi:120,lo:90,inv:90,cp:120,irlT:null,irlH:null,irlL:null};
const tape=[b(98,100,103,99,102),b(99,102,104,101,103),b(100,105,106,102,103),b(101,103,107,102,106),b(102,106,109,106,108),b(103,108,109,104,106)];
function trace(adapter,c=ctx,t=tape,options={},ages={}){const state=adapter.state(c),out=[];for(let i=2;i<t.length;i++)out.push(adapter.step({...c,age:ages[t[i].t]??c.age},state,t.slice(0,i+1),options));return {out,hits:out.flatMap((r,i)=>r.hit?[t[i+2].t]:[]),state};}
for(const dir of [1,-1]){
 const c=dir===1?ctx:{...ctx,dir:-1,hi:110,lo:80,inv:110,cp:80};
 const t=dir===1?tape:tape.map(x=>b(x.t,200-x.o,200-x.l,200-x.h,200-x.c));
 assert.deepEqual(trace(h,c,t).hits,[103]);
 for(const timing of ['Pullback','Confirmation close'])assert.deepEqual(trace(h,c,t,{timing}).hits,trace(old,c,t,{timing}).hits,'Preserve prior CRT baseline within C3');
 assert.deepEqual(trace(h,c,t,{}, {103:1}).hits,[],'First C4 bar cannot fill a pending C3 confirmation');
 assert.equal(trace(h,c,t,{}, {103:1}).out.at(-1).status,'C3 CLOSED');
 assert.deepEqual(trace(h,{...c,age:8},t).hits,[],'Context timeout is not entry permission');
 assert.deepEqual(trace(h,c,t,{confirmed:false}).hits,[]);
 assert.deepEqual(trace(h,{...c,confirmed:104},t).hits,[],'C2/pre-activation shift cannot emit');
 const stop=t.map((x,i)=>i===4?{...x,...(dir===1?{l:89}:{h:111})}:x);
 const stopped=trace(h,c,stop);assert.deepEqual(stopped.hits,[]);assert.equal(stopped.out.at(-1).status,'SL TOUCHED','Wick-through cannot recover into a later signal');
 const target=t.map((x,i)=>i===4?{...x,...(dir===1?{h:121}:{l:79})}:x);
 assert.deepEqual(trace(h,c,target).hits,[]);assert.equal(trace(h,c,target).out.at(-1).status,'CP TAKEN');
 for(const kind of [2,3])assert.deepEqual(trace(h,{...c,kind},t).hits,[],'No hidden EGF/ISB route');
}
assert.match(source,/if older and \(m.dir == 1 \? high >= equilibrium : low <= equilibrium\)\n\s+m.eqTouched := true/);
assert.doesNotMatch(source.match(/f_crtEnd\([^\n]+=>\n[\s\S]*?\n\n/)[0],/equilibrium|eqTouched/);
console.log('PASS CRT V1: 11 named + 3000 symmetric sweep fixtures, actual lifecycle helper, C3 expiry, sticky barriers, closed-bar causality, no E/I entry and old/new CRT baseline. Synthetic only.');
