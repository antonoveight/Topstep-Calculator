// Executes the arithmetic/boolean subset extracted from the actual Pine source.
// This checks contracts and fixtures, NOT Pine compilation or TradingView runtime semantics.
const assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('indicators/funded-angler-v5.pine','utf8');
const old=fs.readFileSync('indicators/archive/crt-pro-v4-original.pine','utf8');
const Market=require('../assets/market-hours.js');
const QT=require('../assets/market-quarterly.js');
const T=require('../assets/market-time.js');
assert.equal(source,fs.readFileSync('chibao.txt','utf8'),'Familiar file must match the canonical source');
assert.match(old,/n2bullTBS = n1ok and \(n2c < n2o\) and n2c < n1l/);
assert.match(source,/@version=6/);
assert.doesNotMatch(source,/i_tbsMode|n2bullTBS|TP1|TP2|"159"|"2610"/);

function expression(name){
 const m=source.match(new RegExp('^(?:bool|float|int|string) '+name+' = (.+)$','m'));
 assert.ok(m,'Missing source expression '+name);return m[1];
}
function evaluate(name,ctx){
 const js=expression(name).replace(/\band\b/g,'&&').replace(/\bor\b/g,'||').replace(/\bnot\b/g,'!').replace(/\bmath\./g,'Math.').replace(/\bna\b(?!\s*\()/g,'null');
 return Function(...Object.keys(ctx),'return ('+js+');')(...Object.values(ctx));
}
function patterns(c1,c2,sweepSize=.25,refs={}){
 const ctx={c1o:c1.o,c1h:c1.h,c1l:c1.l,c1c:c1.c,c2o:c2.o,c2h:c2.h,c2l:c2.l,c2c:c2.c,sweepSize,tsReference:'C1 range',manualSsl:0,manualBsl:0,na:x=>x==null||Number.isNaN(x),...refs};
 for(const name of ['lowRef','highRef','tookLow','tookHigh','reclaimed','sweptBothC1','doubleSweep','tsBull','tsBear','outsideBar','insideBar','prevBodyHigh','prevBodyLow','bodyHigh','bodyLow','bodyCovers','engulfBull','engulfBear'])ctx[name]=evaluate(name,ctx);
 return ctx;
}
const c1={o:104,h:110,l:100,c:108};
assert.equal(patterns(c1,{o:103,h:109,l:99,c:102}).tsBull,true);
assert.equal(patterns(c1,{o:103,h:109,l:99,c:100}).tsBull,false,'Close on boundary is not strict reclaim');
assert.equal(patterns(c1,{o:103,h:109,l:99,c:99}).tsBull,false,'Old body-close-outside TBS must not pass');
assert.equal(patterns(c1,{o:103,h:109,l:100,c:102}).tsBull,false,'Touch alone is not TS');
assert.equal(patterns(c1,{o:103,h:109,l:99.9,c:102}).tsBull,false,'Minimum tick penetration');
assert.equal(patterns(c1,{o:103,h:111,l:99,c:102}).doubleSweep,true);
assert.equal(patterns(c1,{o:103,h:111,l:99,c:102}).tsBull,false);
assert.equal(patterns(c1,{o:103,h:111,l:99,c:102}).tsBear,false);
assert.equal(patterns(c1,{o:105,h:109,l:103,c:105},.25,{tsReference:'Marked HTF levels',manualSsl:104}).tsBull,true,'A marked HTF reference can differ from the C1 boundary');
assert.equal(patterns(c1,{o:105,h:109,l:103,c:103.5},.25,{tsReference:'Marked HTF levels',manualSsl:104}).tsBull,false,'Must reclaim the marked level, not just close somewhere inside C1');
assert.equal(patterns(c1,{o:105,h:109,l:103,c:105},.25,{tsReference:'Marked HTF levels'}).tsBull,false,'Missing marked reference must not be fabricated');
assert.equal(patterns(c1,{o:105,h:111,l:99,c:105},.25,{tsReference:'Marked HTF levels',manualSsl:104}).tsBull,false,'Both C1 sides swept stays ambiguous even with only one marked reference');
assert.equal(patterns(c1,c1).insideBar,false,'Equal whole range is not a fresh inside');
assert.equal(patterns(c1,{o:105,h:110,l:101,c:106}).insideBar,true);
assert.equal(patterns(c1,{o:109,h:111,l:99,c:103}).outsideBar,true);
assert.equal(patterns(c1,{o:109,h:109.5,l:102,c:103}).engulfBear,true);
assert.equal(patterns(c1,{o:109,h:109.5,l:102,c:103}).outsideBar,false,'Body engulf and Outside must differ');
let seed=17;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const flip=b=>({o:-b.o,h:-b.l,l:-b.h,c:-b.c});
for(let i=0;i<3000;i++){
 const h=102+Math.floor(rand()*60)/4,l=98-Math.floor(rand()*60)/4,o=l+rand()*(h-l),c=l+rand()*(h-l);
 const bar={o,h,l,c},a=patterns(c1,bar),b=patterns(flip(c1),flip(bar));
 assert.equal(a.tsBull,b.tsBear);assert.equal(a.tsBear,b.tsBull);assert.equal(a.insideBar,b.insideBar);assert.equal(a.outsideBar,b.outsideBar);
 assert.equal(a.tsBull,l<=99.75&&h<110.25&&c>100&&c<110);
}

// All 1440 minutes: evaluate the actual Pine macro expression against the web's source data.
const f_window=(v,a,b)=>v>=a&&v<b;
for(let minute=0;minute<1440;minute++){
 const expected=Market.macros.find(m=>f_window(minute,m.startHour*60+m.startMin,m.endHour*60+m.endMin))?.code||'-';
 assert.equal(evaluate('macro',{nyMinute:minute,f_window}),expected,'Macro parity at '+minute);
}
for(const date of ['2026-07-14T23:00:00Z','2026-12-14T00:00:00Z','2026-03-08T06:59:59Z','2026-03-08T07:00:00Z','2026-11-01T05:59:59Z','2026-11-01T06:00:00Z']){
 const instant=new Date(date),p=T.parts(instant,T.NY),stamp=instant.getTime();
 const second=()=>p.second,nyMinute=p.hour*60+p.minute;
 const cycleMinute=evaluate('cycleMinute',{nyMinute,second,stamp,NY:T.NY});
 const state=QT.state(instant);
 // int() is Pine truncation; this expression only sees nonnegative values.
 const ctx={cycleMinute,int:Math.trunc};
 assert.equal(evaluate('dayQuarter',ctx),state.day.quarter);
 assert.equal(evaluate('sessionQuarter',ctx),state.ninety.quarter);
 assert.equal(evaluate('microQuarter',ctx),state.micro.quarter);
}
// Explicit one-shot, closed-bar gates and HTF data contract; live data stays in display code.
assert.match(source,/\[open\[1\], high\[1\], low\[1\], close\[1\].*lookahead=barmerge.lookahead_on/s);
assert.match(source,/bool htfEvent = newHtf and barstate.isconfirmed/);
assert.match(source,/if armed and barstate.isconfirmed and isLtf/);
assert.match(source,/if selectedEntry and plannedRR and biasAllowed and timeAllowed/);
assert.match(source,/if armed and not entryNoted/);
assert.match(source,/entryNoted := true/);
assert.match(source,/HTF forming preview/);
assert.match(source,/hour\(time, NY\) >= 18 \? 1 : 0/,'TDO rolls at the theoretical 18:00 boundary');
const engine=source.slice(source.indexOf('if htfEvent'),source.indexOf('// Fixed object allocation'));
assert.doesNotMatch(engine,/\blive[OHLC]\b/,'Forming values cannot drive the setup/entry engine');
assert.equal((source.match(/table\.new\(/g)||[]).length,1);
assert.ok(!source.includes('strategy.entry'),'Indicator must not place trades');

// Minimal delimiter check with strings/comments removed; deliberately not called a Pine parser.
const clean=source.replace(/\/\/[^\n]*/g,'').replace(/"(?:[^"\\]|\\.)*"/g,'""');
const stack=[],pairs={')':'(',']':'[','}':'{'};
for(const c of clean){if('([{'.includes(c))stack.push(c);else if(Object.hasOwn(pairs,c))assert.equal(stack.pop(),pairs[c]);}
assert.equal(stack.length,0);
console.log('PASS actual Pine expression contracts: TS/engulf/inside fixtures, 3000 symmetry cases, 1440 macro minutes, DST/QT parity, confirmed HTF and one-shot gates, source sync. Pine Editor compilation remains unverified.');
