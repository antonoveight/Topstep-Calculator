// Executes the arithmetic/boolean subset extracted from the actual Pine source.
// This checks contracts and fixtures, NOT Pine compilation or TradingView runtime semantics.
const assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const old=fs.readFileSync('indicators/archive/crt-pro-v4-original.pine','utf8');
const Market=require('../assets/market-hours.js');
const QT=require('../assets/market-quarterly.js');
const T=require('../assets/market-time.js');
assert.equal(source,fs.readFileSync('chibao.txt','utf8'),'Familiar file must match the canonical source');
assert.match(old,/n2bullTBS = n1ok and \(n2c < n2o\) and n2c < n1l/);
assert.match(source,/@version=6/);
assert.doesNotMatch(source,/i_tbsMode|n2bullTBS|TP1|TP2|"159"|"2610"/);

function expression(name){
 const m=source.match(new RegExp('^\\s*(?:bool|float|int|string) '+name+' = (.+)$','m'));
 assert.ok(m,'Missing source expression '+name);return m[1];
}
function evaluate(name,ctx){
 return evaluateExpr(expression(name),ctx);
}
function evaluateExpr(expr,ctx){
 const js=expr.replace(/\b(open|high|low|close)\[1\]/g,'previous.$1').replace(/\band\b/g,'&&').replace(/\bor\b/g,'||').replace(/\bnot\b/g,'!').replace(/\bmath\./g,'Math.').replace(/\bna\b(?!\s*\()/g,'null');
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
 assert.equal(evaluate('macroNow',{nyNowMinute:minute,f_window}),expected,'Realtime macro parity at '+minute);
}
for(const date of ['2026-07-14T23:00:00Z','2026-12-14T00:00:00Z','2026-03-08T06:59:59Z','2026-03-08T07:00:00Z','2026-11-01T05:59:59Z','2026-11-01T06:00:00Z']){
 const instant=new Date(date),p=T.parts(instant,T.NY),stamp=instant.getTime();
 const second=()=>p.second,nyMinute=p.hour*60+p.minute;
 const cycleMinute=evaluate('cycleMinute',{nyNowMinute:nyMinute,second,contextStamp:stamp,NY:T.NY});
 const state=QT.state(instant);
 // int() is Pine truncation; this expression only sees nonnegative values.
 const ctx={cycleMinute,int:Math.trunc};
 assert.equal(evaluate('dayQuarter',ctx),state.day.quarter);
 assert.equal(evaluate('sessionQuarter',ctx),state.ninety.quarter);
 assert.equal(evaluate('microQuarter',ctx),state.micro.quarter);
}
// Explicit one-shot, closed-bar gates and HTF data contract; live data stays in display code.
assert.match(source,/f_snapshot\(true\), lookahead=barmerge.lookahead_on/);
assert.match(source,/f_snapshot\(not barstate.isconfirmed\)/);
for(let i=0;i<52;i++)assert.ok(source.includes(`previous ? v${i}[1] : v${i}`),'Every HTF snapshot field must be offset');
assert.match(source,/if armed and barstate.isconfirmed and isLtf/);
assert.match(source,/if selectedEntry and plannedRR and biasAllowed and timeAllowed/);
assert.match(source,/not alreadyEmitted/);
assert.match(source,/array.push\(emitted, modelKey\)/);
assert.match(source,/"N\*"/);
assert.match(source,/hour\(time, NY\) >= 18 \? 1 : 0/,'TDO rolls at the theoretical 18:00 boundary');
const engine=source.slice(source.indexOf('f_engine() =>'),source.indexOf('// f_snapshot'));
assert.doesNotMatch(engine,/\blive[OHLC]\b/,'Forming values cannot drive the setup/entry engine');
assert.equal((source.match(/table\.new\(/g)||[]).length,1);
assert.ok(!source.includes('strategy.entry'),'Indicator must not place trades');
assert.match(source,/overlay=true, scale=scale.none/);
assert.doesNotMatch(source,/input.string\("CRT", "Primary structure"/);
assert.doesNotMatch(source,/chartSeconds >= htfSeconds/,'HTF chart must be supported');
assert.doesNotMatch(source,/(?:string|float|int|bool)\s+(?:text|range|return|class)\s*[,=)]/,'Known Pine reserved names');

// Minimal delimiter check with strings/comments removed; deliberately not called a Pine parser.
const clean=source.replace(/\/\/[^\n]*/g,'').replace(/"(?:[^"\\]|\\.)*"/g,'""');
const stack=[],pairs={')':'(',']':'[','}':'{'};
for(const c of clean){if('([{'.includes(c))stack.push(c);else if(Object.hasOwn(pairs,c))assert.equal(stack.pop(),pairs[c]);}
assert.equal(stack.length,0);

// Registry acceptance scenarios use actual extracted pattern formulas + an independent lifecycle spec.
const {RegistrySpec,pickIrl,pickErl}=require('./helpers/auto-model-spec.cjs');
const bar=(t,o,h,l,c)=>({t,o,h,l,c});
const first=bar(1,104,110,100,108),ts=bar(2,103,109,99,102);
const r=new RegistrySpec(patterns);
r.step(first);r.step(ts);
assert.equal(r.snapshot()[0].kind,1);
const original=r.snapshot()[0];
r.step(bar(3,101,109,100.5,108));
assert.equal(r.snapshot()[0].id,2,'New engulf/inside must not replace older valid CRT');
assert.equal(r.snapshot()[1].kind,3,'Same-pair Inside+Engulf remains a compression compound');
assert.deepEqual(r.snapshot()[0].c1,original.c1);assert.deepEqual(r.snapshot()[0].c2,original.c2);
r.step(bar(4,103,108,98,98.5));
assert.notEqual(r.snapshot()[0]?.id,2,'Confirmed invalidation promotes an already-waiting model');
assert.equal(r.retired.find(x=>x.id===2).reason,'invalid');
const closeRegistry=new RegistrySpec(patterns),wickRegistry=new RegistrySpec(patterns,{mode:'Wick'});
for(const b of [first,ts,bar(3,102,109,98.5,103)]){closeRegistry.step(b);wickRegistry.step(b);}
assert.equal(closeRegistry.snapshot()[0].id,2,'Close rule tolerates an unconfirmed wick excursion');
assert.equal(wickRegistry.retired[0].reason,'invalid');
const targetRegistry=new RegistrySpec(patterns);for(const b of [first,ts,bar(3,103,111,101,109)])targetRegistry.step(b);
assert.equal(targetRegistry.retired[0].reason,'target');
const ambiguous=new RegistrySpec(patterns,{mode:'Wick'});for(const b of [first,ts,bar(3,103,111,98,102)])ambiguous.step(b);
assert.equal(ambiguous.retired[0].reason,'ambiguous');
const nested=new RegistrySpec(patterns);
for(const b of [first,bar(2,104,108,102,106),bar(3,104.5,107,103,105.5),bar(4,104.8,106.5,103.5,105.2)])nested.step(b);
assert.equal(nested.snapshot().length,1,'Nested compression keeps the first mother');
assert.equal(nested.snapshot()[0].hi,110);assert.equal(nested.snapshot()[0].lo,100);
nested.step(bar(5,103,109,99,104));
assert.equal(nested.snapshot()[0].id,2);assert.equal(nested.snapshot()[0].phase,1);
assert.equal(nested.snapshot()[0].c3.t,5,'The frozen resolution candle must be the actual TS bar');
const noExpiry=new RegistrySpec(patterns),expiry=new RegistrySpec(patterns,{life:2});
for(const b of [first,ts,bar(3,103,108,101,104),bar(4,103.5,107,102,104.5),bar(5,104,106,103,104.5)]){noExpiry.step(b);expiry.step(b);}
assert.equal(noExpiry.snapshot()[0].id,2);assert.equal(expiry.retired.find(x=>x.id===2).reason,'expiry');
const capacity=new RegistrySpec(patterns,{limit:1});for(const b of [first,ts,bar(3,101,109,100.5,108)])capacity.step(b);
assert.equal(capacity.snapshot()[0].id,2);assert.equal(capacity.dropped,1,'Full queue refuses newest, never evicts older valid primary');
const combo=new RegistrySpec(patterns);combo.step(first);combo.step(bar(2,109,109.5,99,103));
assert.equal(combo.snapshot().length,1);assert.equal(combo.snapshot()[0].flags,3,'Same-pair CRT+body engulf is one compound');
const model={hi:110,lo:100,dir:1};
const fvg={hi:105,lo:104,dir:1,kind:1},ob={hi:103,lo:101,dir:1,kind:2};
assert.equal(pickIrl(model,[fvg,ob]),fvg,'Prefer actual internal FVG over OB candidate');
assert.equal(pickIrl(model,[{...fvg,filled:true},ob]),ob);
assert.equal(pickIrl(model,[{...fvg,hi:111},{...fvg,dir:-1}]),null,'No fabricated IRL when no eligible zone exists');
assert.deepEqual(pickErl(model,[{price:115,side:1},{price:112,side:1},{price:111,side:1,consumed:true},{price:98,side:-1}]),{up:112,down:98});
assert.deepEqual(pickErl(model,[]),{up:null,down:null});
// Read-only projection of a closed HTF snapshot: all LTF samples share the same model/candles.
const tape=new RegistrySpec(patterns),events=[];
for(const b of [first,ts,bar(3,101,109,100.5,108)])events.push({closedAt:b.t*3600000,snapshot:tape.step(b)});
for(const resolution of [60,180,300])for(let delta=0;delta<3600;delta+=resolution){
 const at=2*3600000+delta*1000,projected=events.filter(e=>e.closedAt<=at).at(-1).snapshot;
 assert.equal(projected[0].id,2);assert.deepEqual(projected[0].c1,first);assert.deepEqual(projected[0].c2,ts);
}
assert.doesNotMatch(engine,/barstate\.isconfirmed|\bchartSeconds\b|\bisLtf\b/,'Registry lifecycle must not depend on chart/LTF confirmation');
assert.match(source,/Model selected = array.size\(models\) > 0 \? array.get\(models, 0\)/);
assert.match(source,/if array.size\(models\) < queueLimit/);
assert.match(source,/last_bar_time - int\(timeframe.in_seconds\(\) \* 1000\) \* scanDepth/);
assert.match(source,/f_biasSnapshot\(true\)/);
assert.match(source,/sKind == 3 and sPhase == 2 \? boundaryTouched/);
assert.match(source,/irlTouched and \(cisd or mss or fvgRetest or obRetest\)/);
assert.match(source,/label.set_tooltip\(caption/);
function biasEvent(before,now){
 const ctx={low:now.l,high:now.h,close:now.c,previous:{low:before.l,high:before.h,close:before.c,open:before.o}};
 for(const name of ['lowTaken','highTaken','inPrior','nextDir'])ctx[name]=evaluate(name,ctx);
 return ctx.nextDir;
}
assert.equal(biasEvent(first,ts),1);
assert.equal(biasEvent(first,bar(3,105,111,101,108)),-1);
assert.equal(biasEvent(first,bar(3,106,112,102,111)),1);
assert.equal(biasEvent(first,bar(3,104,111,99,105)),0,'Ambiguous outside is not an automatic directional bias');
const autoCtx={sKind:1,sPhase:1,cisd:true,mss:false,fvgRetest:false,obRetest:false,irlTouched:false,boundaryTouched:false};
assert.equal(evaluate('autoEntry',autoCtx),true);
assert.equal(evaluate('autoEntry',{...autoCtx,sKind:2,sPhase:3}),false,'EGF needs its own IRL touch');
assert.equal(evaluate('autoEntry',{...autoCtx,sKind:2,sPhase:3,irlTouched:true}),true);
assert.equal(evaluate('autoEntry',{...autoCtx,sKind:3,sPhase:2}),false,'ISB breakout needs mother-boundary retest');
assert.equal(evaluate('autoEntry',{...autoCtx,sKind:3,sPhase:2,boundaryTouched:true}),true);
assert.match(source,/historyMarks = input.int\(1,/);
assert.match(source,/recentOnly = input.bool\(true,/);
assert.doesNotMatch(source,/extend=extend.right/,'No unbounded level projection');
assert.match(source,/label.style_triangleup : label.style_triangledown/);
assert.match(source,/if entryEvent and showEntryTriangles/);
assert.match(source,/lastVisualIndex := bar_index/,'LTF anchors start at actual condition bar');
assert.match(source,/line.set_xy1\(ln, anchor, price\)/);
assert.match(source,/box.set_lefttop\(irlBox, drawAnchorIndex, sIrlH\)/);
assert.match(source,/liveComplete := time == bucketTime/,'Never invent first incomplete bucket open');
assert.match(source,/array.indexof\(candleTimes, sourceTime\)/,'Cluster cache must match exact source candle');
assert.match(source,/confirmedC := cMarkPrice/,'CISD visual level freezes the price known on confirmation');
assert.match(source,/confirmedM := mMarkPrice/,'MSS visual level freezes the price known on confirmation');
assert.match(source,/confirmedCIndex := bar_index/);
assert.match(source,/confirmedMIndex := bar_index/);
for(const anchor of [100,107,140]){
 const endpoint=evaluate('endpoint',{anchor,drawSpan:60,drawingClipIndex:180,na:x=>x==null});
 assert.equal(endpoint,Math.min(anchor+60,180),'Each confirmation keeps its own start and finite horizon');
}
let previousY=null;
for(const nextPrice of [100,100,100.01,101,200]){
 const visibleLabelGap=2;
 const labelPrice=evaluate('labelPrice',{previousY,nextPrice,visibleLabelGap,na:x=>x==null});
 assert.ok(previousY==null||labelPrice-previousY>=visibleLabelGap,'Nearby annotations are vertically spaced without changing source levels');
 previousY=labelPrice;
}
// Native candle-relative placement must not depend on ATR or price-scale offsets.
for(const up of [true,false]){
 const yloc={belowbar:'belowbar',abovebar:'abovebar'};
 assert.equal(evaluate('markerLocation',{up,yloc}),up?'belowbar':'abovebar');
}
for(const clusterWidth of [2,3,6,7,15,16]){
 const candleWidth=evaluate('candleWidth',{clusterWidth});
 const left=100,middle=evaluate('middle',{left,candleWidth,int:Math.trunc});
 assert.equal(middle,(left+left+candleWidth)/2,'Wick is centered on body, including odd requested widths');
}
const na=x=>x==null||Number.isNaN(x),int=Math.trunc;
for(const htfSeconds of [3600,7200,14400,86400])for(const chartSeconds of [60,180,300,htfSeconds])for(const drawHtfBars of [2,3])for(const offset of [3,15,80]){
 const drawAnchorIndex=100,bar_index=102,clusterStartIndex=bar_index+offset,labelLaneBars=14;
 const drawSpan=evaluate('drawSpan',{drawHtfBars,htfSeconds,chartSeconds,int});
 const drawingClipIndex=evaluate('drawingClipIndex',{showCluster:true,clusterStartIndex,labelLaneBars,bar_index});
 const end=evaluate('drawEndIndex',{drawAnchorIndex,drawSpan,drawingClipIndex,na});
 assert.ok(end<=clusterStartIndex-3,'Projection ends before mini candles');
 assert.ok(end<=drawAnchorIndex+drawSpan,'Projection is finite in HTF-equivalent bars');
 assert.ok(end<=bar_index+499,'Never exceed Pine future-index constraint');
}
const updateHigh=source.match(/liveH := (math.max\([^\n]+\))/)[1];
const updateLow=source.match(/liveL := (math.min\([^\n]+\))/)[1];
let live={o:100,h:102,l:99,c:101};
for(const b of [{h:105,l:100,c:104},{h:104,l:98,c:99}]){
 live.h=evaluateExpr(updateHigh,{liveH:live.h,high:b.h});live.l=evaluateExpr(updateLow,{liveL:live.l,low:b.l});live.c=b.c;
}
assert.deepEqual(live,{o:100,h:105,l:98,c:99},'Aggregated live candle matches LTF OHLC');
console.log('PASS auto-registry specification: FIFO validity/promotion, nested mother/resolution candles, compound overlap, limits/expiry, IRL/ERL, HTF/LTF projection; extracted Pine formulas, 3000 TS symmetry cases, 1440 macro minutes and DST/QT. Full chart compilation/runtime remains unverified.');
