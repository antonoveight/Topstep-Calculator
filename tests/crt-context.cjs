const assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
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
const end=Function('direction','invalidation','targetLevel','barHigh','barLow','closing','older','outsideHistory','timedOut','entryExpired',endCode);
for(const dir of [1,-1])for(const [high,low,close,older,hist,timeout,want] of [[109,101,105,true,false,false,0],[111,101,109,true,false,false,2],[109,98,98,true,false,false,1],[111,98,98,true,false,false,4],[109,101,105,true,false,true,3],[109,101,105,true,true,true,5],[111,98,98,false,false,false,0],[111,101,109,true,false,true,2]]){
 assert.equal(dir===1?end(1,99,110,high,low,close,older,hist,timeout):end(-1,101,90,200-low,200-high,200-close,older,hist,timeout),want);
}
console.log("PASS 11 named and 3000 symmetric HTF TS fixtures plus actual model lifecycle helper.");
