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
 ctx={structuralReset:false,waveAllowed:true,...ctx};
 const js=expr.replace(/\b(open|high|low|close|time)\[1\]/g,'previous.$1').replace(/\band\b/g,'&&').replace(/\bor\b/g,'||').replace(/\bnot\b/g,'!').replace(/\bmath\./g,'Math.').replace(/\bna\b(?!\s*\()/g,'null');
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
for(let i=0;i<111;i++)assert.ok(source.includes(`previous ? v${i}[1] : v${i}`),'Every HTF snapshot field including both IRL maps must be offset');
assert.match(source,/if armed and barstate.isconfirmed and isLtf/);
assert.match(source,/if selectedEntry and risk > 0 and not na\(target\) and reward > 0 and biasAllowed and timeAllowed/);
assert.match(source,/not alreadyEmitted/);
assert.match(source,/state.sent := true/);
assert.match(source,/state.everSent := true/);
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
const expansionBars=[bar(1,108,110,100,102),bar(2,101,112,99,111)];
for(const bias of [-1,0,1]){
 const context=new RegistrySpec(patterns,{bias});for(const b of expansionBars)context.step(b);
 assert.equal(context.snapshot()[0].kind,2);
 assert.equal(context.snapshot()[0].dir,bias,'An EGF up-candle does not force a Buy scenario');
 if(bias===-1){context.bias=1;context.step(bar(3,105,109,101,106));assert.equal(context.snapshot()[0].dir,1,'A changed bias revises the scenario, not the parent candles');assert.deepEqual(context.snapshot()[0].c1,expansionBars[0]);}
}
const modelDirection=source.match(/int direction = (crt \?[^\n]+)/)[1];
for(const contextBias of [-1,0,1])assert.equal(evaluateExpr(modelDirection,{crt:false,kind:2,contextBias,tsBull:true}),contextBias);
const model={hi:110,lo:100,dir:1};
const fvg={hi:105,lo:104,dir:1,kind:1},ob={hi:103,lo:101,dir:1,kind:2};
assert.equal(pickIrl(model,[fvg,ob]),fvg,'Prefer actual internal FVG over OB candidate');
assert.equal(pickIrl(model,[{...fvg,filled:true},ob]),ob,'Preserve the existing OB fallback');
assert.equal(pickIrl(model,[{...fvg,hi:111},{...fvg,dir:-1}]),null,'No fabricated IRL when no eligible zone exists');
assert.deepEqual(pickErl(model,[{price:115,side:1},{price:112,side:1},{price:111,side:1,consumed:true},{price:98,side:-1}]),{up:112,down:98});
assert.deepEqual(pickErl(model,[]),{up:null,down:null});
const endCases=[
 [{bad:false,reached:false,expired:false,m:{uid:100},scanStart:0},0],
 [{bad:true,reached:false,expired:false,m:{uid:100},scanStart:0},1],
 [{bad:false,reached:true,expired:true,m:{uid:100},scanStart:0},2],
 [{bad:false,reached:false,expired:true,m:{uid:100},scanStart:0},3],
 [{bad:true,reached:true,expired:true,m:{uid:100},scanStart:0},4],
 [{bad:false,reached:false,expired:true,m:{uid:100},scanStart:101},5]
];
for(const [ctx,reason] of endCases)assert.equal(evaluate('endingReason',ctx),reason);
assert.ok(engine.indexOf('bool reached =')<engine.indexOf('if m.kind == 2 and m.dir != contextBias'),'Evaluate old target before bias revision can clear it');
for(const dir of [1,-1]){
 const targetFlip=new RegistrySpec(patterns,{bias:dir});
 for(const b of expansionBars)targetFlip.step(b);
 const oldId=targetFlip.models[0].id;targetFlip.models[0].cp=dir===1?115:95;
 targetFlip.bias=-dir;targetFlip.step(bar(3,105,116,94,105));
 assert.equal(targetFlip.retired.find(r=>r.id===oldId)?.reason,'target','Bias flip cannot erase a target touched in the same HTF candle');
}
assert.match(source,/htfInput = input.timeframe\("60", "HTF", options=\["60", "1D"\]/);
assert.match(source,/biasTf = input.timeframe\("1D", "Bias TF \(>= HTF\)", options=\["60", "1D"\]/);
for(const dir of [1,-1]){
 const hitBar=dir===1?bar(2,104,110,99,105):bar(2,106,111,100,105);
 const cp=dir===1?110:100;
 assert.equal(evaluate('targetAtBirth',{crt:true,direction:dir,high:hitBar.h,low:hitBar.l,fresh:{cp}}),true);
 const bornDone=new RegistrySpec(patterns);bornDone.step(first);bornDone.step(hitBar);
 assert.equal(bornDone.snapshot().length,0,'Do not arm a CRT whose opposite boundary was already touched at confirmation');
 assert.equal(bornDone.retired.at(-1).reason,'ambiguous','Do not infer intrabar order or claim TP on the formation candle');
 const resolveDone=new RegistrySpec(patterns);resolveDone.step(first);resolveDone.step(bar(2,104,108,102,106));
 const id=resolveDone.models[0].id;resolveDone.step({...hitBar,t:3});
 assert.equal(resolveDone.retired.find(x=>x.id===id)?.reason,'ambiguous','ISB resolution and target in one candle have unknown intrabar order');
 assert.equal(evaluate('resolutionReached',{backIn:true,resolveDir:dir,high:hitBar.h,low:hitBar.l,m:{cp}}),true);
}
// Read-only projection of a closed HTF snapshot: all LTF samples share the same model/candles.
const tape=new RegistrySpec(patterns),events=[];
for(const b of [first,ts,bar(3,101,109,100.5,108)])events.push({closedAt:b.t*3600000,snapshot:tape.step(b)});
for(const resolution of [60,180,300])for(let delta=0;delta<3600;delta+=resolution){
 const at=2*3600000+delta*1000,projected=events.filter(e=>e.closedAt<=at).at(-1).snapshot;
 assert.equal(projected[0].id,2);assert.deepEqual(projected[0].c1,first);assert.deepEqual(projected[0].c2,ts);
}
assert.doesNotMatch(engine,/barstate\.isconfirmed|\bchartSeconds\b|\bisLtf\b/,'Registry lifecycle must not depend on chart/LTF confirmation');
assert.match(source,/Model selected = primaryIndex >= 0 \? array.get\(models, primaryIndex\)/);
assert.match(source,/if modelAllowed and primaryIndex == -1/,'Oldest matching model stays primary');
assert.match(source,/if array.size\(models\) < queueLimit/);
assert.match(source,/last_bar_time - int\(timeframe.in_seconds\(\) \* 1000\) \* scanDepth/);
assert.match(source,/f_biasSnapshot\(true\)/);
assert.match(source,/sKind == 3 and sPhase == 2 \? boundaryTouched/);
assert.match(source,/egfPathReady and \(cisd or mss or fvgRetest or obRetest\)/);
assert.match(source,/label.set_tooltip\(caption/);
require('./bias-context.cjs');
const autoCtx={sKind:1,sPhase:1,cisd:true,mss:false,fvgRetest:false,obRetest:false,egfPathReady:false,boundaryTouched:false};
assert.equal(evaluate('autoEntry',autoCtx),true);
assert.equal(evaluate('autoEntry',{...autoCtx,sKind:2,sPhase:3}),false,'EGF needs its own IRL touch');
assert.equal(evaluate('autoEntry',{...autoCtx,sKind:2,sPhase:3,egfPathReady:true}),true);
assert.equal(evaluate('autoEntry',{...autoCtx,sKind:3,sPhase:2}),false,'ISB breakout needs mother-boundary retest');
assert.equal(evaluate('autoEntry',{...autoCtx,sKind:3,sPhase:2,boundaryTouched:true}),true);
const isNa=x=>x==null||Number.isNaN(x);
const egfBase={irlTouched:true,irlFailed:false,target:90,sIrlH:110,sIrlL:105,bullish:false,close:103,na:isNa};
assert.equal(evaluate('egfPathReady',egfBase),true,'Bearish EGF reacts below supply IRL toward a lower ERL');
assert.equal(evaluate('egfPathReady',{...egfBase,irlTouched:false}),false,'Never infer IRL visit from price merely being below it');
assert.equal(evaluate('egfPathReady',{...egfBase,close:108}),true,'Local confirmation may occur inside IRL; touching alone is never a signal');
assert.equal(evaluate('selectedEntry',{rawEntry:false,confirmationContext:true}),false,'A valid IRL location without an LTF condition is not a signal');
assert.equal(evaluate('egfPathReady',{...egfBase,close:112}),false,'Retracement above supply is not a Sell reaction');
assert.equal(evaluate('egfPathReady',{...egfBase,irlFailed:true}),false,'Broken IRL cannot reuse a previous touch');
assert.equal(evaluate('egfPathReady',{...egfBase,target:120}),false,'Do not Sell toward an upside target');
assert.equal(evaluate('egfPathReady',{...egfBase,target:null}),false,'No invented ERL target');
assert.equal(evaluate('egfPathReady',{...egfBase,bullish:true,close:112,target:130}),true,'Bullish EGF reacts above demand IRL toward higher ERL');
assert.equal(evaluate('egfPathReady',{...egfBase,bullish:true,close:112,target:90}),false);
assert.equal(evaluate('egfPathReady',{...egfBase,close:106}),true,'A local Sell confirmation may occur inside the lower half of the HTF zone');
assert.equal(evaluate('egfPathReady',{...egfBase,bullish:true,close:109,target:130}),true,'A local Buy confirmation may occur inside the upper half of the HTF zone');
assert.equal(evaluate('selectedEntry',{rawEntry:true,confirmationContext:false}),false,'Explicit mode cannot bypass model reaction context');
assert.equal(evaluate('selectedEntry',{rawEntry:true,confirmationContext:true}),true);
for(const entryMode of ['MSS','CISD','FVG retest','OB retest']){
 const expected={'MSS':'M','CISD':'C','FVG retest':'F','OB retest':'O'}[entryMode];
 assert.equal(evaluate('detectedTag',{entryMode,cisd:true,mss:true,fvgRetest:true}),expected,'Entry tag matches chosen mode, even if C/M overlap');
}
assert.match(source,/historyMarks = input.int\(100,/);
assert.match(source,/historyMode = input.string\("History",/);
for(const retainHistory of [false,true])for(const historyMarks of [0,1,20,100,200]){
 assert.equal(evaluate('markLimit',{retainHistory,historyMarks}),historyMarks===0?0:retainHistory?historyMarks:1);
}
assert.match(source,/if not retainHistory and recentOnly and barstate.islast/,'History markers are independent of line recency');
for(const signalModels of ['All','CRT','EGF','ISB'])for(const kind of [1,2,3]){
 assert.equal(evaluate('modelAllowed',{signalModels,candidate:{kind}}),signalModels==='All'||({CRT:1,EGF:2,ISB:3}[signalModels]===kind));
}
const finalGate=source.match(/if (selectedEntry and risk[^\n]+)/)[1];
const gateBase={selectedEntry:true,risk:1,target:110,reward:2,biasAllowed:true,timeAllowed:true,invalidBar:false,localTargetTaken:false,alreadyEmitted:false,na:isNa};
for(const branch of [{sKind:1,sPhase:1},{sKind:2,sPhase:0,egfPathReady:true},{sKind:3,sPhase:2,boundaryTouched:true},{sKind:3,sPhase:1}]){
 const auto=evaluate('autoEntry',{...autoCtx,...branch});
 assert.equal(auto,true,'Each HTF model has its own viable Auto path');
 assert.equal(evaluateExpr(finalGate,{...gateBase,selectedEntry:auto}),true,'A viable model can independently pass the final signal gate');
}
for(const [field,value] of [['biasAllowed',false],['timeAllowed',false],['invalidBar',true],['localTargetTaken',true],['alreadyEmitted',true],['selectedEntry',false]]){
 assert.equal(evaluateExpr(finalGate,{...gateBase,[field]:value}),false,'History review never bypasses '+field);
}
assert.equal(evaluate('freshMssPivot',{phaseAt:100,time:{2:110},pivotLength:2,bullish:true,pivotHigh:120,pivotLow:null,na:isNa}),true);
assert.equal(evaluate('freshMssPivot',{phaseAt:100,time:{2:90},pivotLength:2,bullish:true,pivotHigh:120,pivotLow:null,na:isNa}),false,'Pivot must belong to the active phase, not a pre-setup swing');
assert.equal(evaluate('freshMssPivot',{phaseAt:100,time:{2:110},pivotLength:2,bullish:true,pivotHigh:null,pivotLow:null,na:isNa}),false,'No unconfirmed pivot can refresh MSS');
const channelCode=source.slice(source.indexOf('f_stepChannel('),source.indexOf('var float lastPivotHigh'));
assert.doesNotMatch(channelCode,/\bsId\b|\bselectedKey\b|\bprimaryIndex\b/,'Signal channel cannot be gated by the displayed model');
assert.match(source,/array.push\(channelStates, ReactionState.new\(\)\)/,'Each channel allocates a distinct persistent state');
for(const family of ['crt','egf','isb'])assert.match(source,new RegExp(family+'Context = Model.new\\(\\)'));
assert.match(source,/crtSignals \+= crtResult.hit/);
assert.match(source,/egfSignals \+= egfResult.hit/);
assert.match(source,/isbSignals \+= isbResult.hit/);
const freshBase={signalCadence:'Fresh reaction',state:{sent:true,revisited:false},pivotAfterAnchor:true,progressed:true,egfScenario:false};
assert.equal(evaluate('freshReaction',freshBase),true);
assert.equal(evaluate('freshReaction',{...freshBase,pivotAfterAnchor:false}),false,'A candle color change alone cannot rearm');
assert.equal(evaluate('freshReaction',{...freshBase,progressed:false}),false,'A new pivot without directional progress cannot rearm');
assert.equal(evaluate('freshReaction',{...freshBase,signalCadence:'One per model'}),false);
assert.equal(evaluate('freshReaction',{...freshBase,egfScenario:true}),false);
assert.equal(evaluate('freshReaction',{...freshBase,egfScenario:true,state:{sent:true,revisited:true}}),true);
assert.equal(evaluate('alreadyEmitted',{signalCadence:'One per model',state:{sent:false,everSent:true}}),true);
assert.equal(evaluate('alreadyEmitted',{signalCadence:'Fresh reaction',state:{sent:false,everSent:true}}),false);
assert.equal(evaluate('cisd',{deliveryLevel:102,bullish:true,close:101,previous:{close:102},na:isNa}),false,'The pullback itself is not confirmation');
assert.equal(evaluate('cisd',{deliveryLevel:102,bullish:true,close:103,previous:{close:101},na:isNa}),true,'A later reclaim can confirm a fresh reaction');
assert.equal(evaluate('invalidBar',{bullish:true,close:101,executionSl:100,low:98,high:104}),false,'A wick sweep and close reclaim is not treated as an executed stop');
assert.equal(evaluate('invalidBar',{bullish:false,close:99,executionSl:100,low:96,high:102}),false);
assert.equal(evaluate('invalidBar',{bullish:true,close:99,executionSl:100}),true);
const htfZoneInvalid=source.match(/if not na\(m.irlT\) and time > m.irlT and \(([^\n]+)\)/)[1];
assert.equal(evaluateExpr(htfZoneInvalid,{m:{irlDir:1,irlL:100,irlH:105},low:98,high:106,close:101}),false,'An already-selected HTF IRL survives wick mitigation/reclaim');
assert.equal(evaluateExpr(htfZoneInvalid,{m:{irlDir:1,irlL:100,irlH:105},low:98,high:106,close:99}),true);
const ltfZoneInvalid=source.match(/state.irlFailed := (egfScenario[^\n]+)/)[1];
assert.equal(evaluateExpr(ltfZoneInvalid,{egfScenario:true,state:{irlTouched:true},bullish:true,close:99,sIrlL:100,sIrlH:105}),true);
assert.equal(evaluateExpr(ltfZoneInvalid,{egfScenario:true,state:{irlTouched:true,irlFailed:true},bullish:true,close:101,sIrlL:100,sIrlH:105}),false,'Pending LTF excursion can reclaim while the confirmed HTF context remains valid');
assert.match(source,/linefill.new\(leftEdge, rightEdge, markerColor\)/,'Triangle uses chart-coordinate geometry instead of a font glyph');
// Sequential OHLC fixtures execute the actual channel body through a restricted harness.
const channelHarness=require('./helpers/pine-channel-harness.cjs').createHarness(source);
const marketStep=(ctx,state,tape,options={})=>channelHarness.step(ctx,state,tape,{timing:'Confirmation close',...options});
const channelContexts=[1,2,3].map(kind=>({id:kind,kind,flags:kind===1?1:kind===2?2:4,phase:kind===1?1:kind===3?2:0,dir:1,confirmed:100,resolved:100,hi:104,lo:90,inv:90,cp:120,irlH:104,irlL:102,irlT:90}));
const reactionTape=[bar(98,100,103,99,102),bar(99,102,104,101,103),bar(100,105,106,102,103),bar(101,103,107,102,106),bar(102,106,108,105,107),bar(103,107,108,102,103),bar(104,103,109,102,108)];
function runChannels(options={}){
 const states=channelContexts.map(ctx=>channelHarness.state(ctx)),counts=[0,0,0],hits=[];
 for(let j=2;j<reactionTape.length;j++){
  const current=channelContexts.map((ctx,i)=>marketStep(ctx,states[i],reactionTape.slice(0,j+1),options));
  current.forEach((result,i)=>{counts[i]+=Number(result.hit);});hits.push(current);
 }return {states,counts,hits};
}
assert.deepEqual(runChannels().counts,[1,1,1],'No new confirmed pivot means no repeated signal in any channel');
assert.deepEqual(runChannels({cadence:'One per model'}).counts,[1,1,1],'Legacy cadence is an explicit comparison option');
assert.ok(runChannels().hits[2].every(hit=>!hit.hit),'A continuation candle does not duplicate the previous pulse');
assert.ok(runChannels({confirmed:false}).counts.every(n=>n===0),'No historical-looking unclosed-bar signal');
assert.ok(runChannels({bias:-1}).counts.every(n=>n===0),'Parallel execution does not bypass bias');
assert.ok(runChannels({timeAllowed:false}).counts.every(n=>n===0),'Parallel execution does not bypass time');
const consumedTape=[...reactionTape,bar(105,108,121,106,119),bar(106,119,120,103,104),bar(107,104,119,103,118)];
for(const ctx of channelContexts){const state=channelHarness.state(ctx);let afterTarget=0;for(let j=2;j<consumedTape.length;j++){const hit=marketStep(ctx,state,consumedTape.slice(0,j+1));if(j>=reactionTape.length)afterTarget+=Number(hit.hit);}assert.equal(afterTarget,0,'Fresh cycles cannot chase a target already taken');}
const pendingSweep=[...reactionTape.slice(0,2),bar(100,105,106,89,101),bar(101,101,107,100,106)];
const egfSweepState=channelHarness.state(channelContexts[1]);
assert.equal(marketStep(channelContexts[1],egfSweepState,pendingSweep.slice(0,3)).hit,false);
assert.equal(marketStep(channelContexts[1],egfSweepState,pendingSweep).hit,true,'LTF excursion then reclaim can confirm within a still-valid HTF context');
const oneBarCtx={...channelContexts[1],confirmed:98,resolved:98};
const oneBarState=channelHarness.state(oneBarCtx);
const approachTape=[bar(98,109,112,108,111),bar(99,111,112,105,106),bar(100,106,113,101,112)];
assert.equal(marketStep(oneBarCtx,oneBarState,approachTape.slice(0,2)).hit,false,'Approaching IRL does not emit');
const oneBarReaction=marketStep(oneBarCtx,oneBarState,approachTape);
assert.equal(oneBarReaction.hit,true,'First-touch rejection can reclaim the immediately preceding opposing run');
assert.equal(oneBarReaction.tag,'C','Do not wipe the real CISD run just as price first touches IRL');
const sellContexts=channelContexts.map(ctx=>({...ctx,dir:-1,hi:200-ctx.lo,lo:200-ctx.hi,inv:200-ctx.inv,cp:200-ctx.cp,irlH:200-ctx.irlL,irlL:200-ctx.irlH}));
const sellTape=reactionTape.map(b=>bar(b.t,200-b.o,200-b.l,200-b.h,200-b.c));
for(const ctx of sellContexts){const state=channelHarness.state(ctx);let count=0;for(let j=2;j<sellTape.length;j++)count+=Number(marketStep(ctx,state,sellTape.slice(0,j+1)).hit);assert.equal(count,1,'Structural rearm is symmetric for Sell');}
const isolatedStates=channelContexts.map(ctx=>channelHarness.state(ctx));isolatedStates[0].everSent=true;
for(let j=2;j<=3;j++){
 const hits=channelContexts.map((ctx,i)=>marketStep(ctx,isolatedStates[i],reactionTape.slice(0,j+1),{cadence:'One per model'}));
 if(j===3)assert.deepEqual(hits.map(hit=>hit.hit),[false,true,true],'A used CRT cannot starve EGF and ISB channels');
}
// Pullback timing: a confirmation is not yet a retest entry condition.
const pullbackTape=[...reactionTape.slice(0,4),bar(102,106,109,106,108),bar(103,108,109,104,106)];
function traceTiming(ctx,tape,options={},seed={}){
 const state=Object.assign(channelHarness.state(ctx),seed),hits=[];
 for(let j=2;j<tape.length;j++)hits.push(channelHarness.step(ctx,state,tape.slice(0,j+1),options));
 return {state,hits};
}
for(const ctx of channelContexts){
 const {state,hits}=traceTiming(ctx,pullbackTape);
 assert.deepEqual(hits.map(h=>h.hit),[false,false,false,true],'All families wait past confirmation and continuation until a real later retest');
 assert.equal(state.confirmLevel,105,'Freeze broken level even when a later opposing run changes deliveryLevel');
 assert.equal(hits[3].confirmTime,101,'Retest tooltip preserves actual confirmation time');
 assert.equal(state.lastSignalBar,5,'Marker event belongs to the trigger candle, not the confirmation candle');
 for(const options of [{confirmed:false},{bias:-1},{timeAllowed:false}])assert.ok(traceTiming(ctx,pullbackTape,options).hits.every(h=>!h.hit));
 const taken=[...pullbackTape.slice(0,4),bar(102,106,121,106,119),pullbackTape[5]];
 assert.ok(traceTiming(ctx,taken).hits.every(h=>!h.hit),'Target consumed while waiting prevents a late retest signal');
}
const mirrorTape=t=>t.map(b=>bar(b.t,200-b.o,200-b.l,200-b.h,200-b.c));
for(const ctx of sellContexts)assert.deepEqual(traceTiming(ctx,mirrorTape(pullbackTape)).hits.map(h=>h.hit),[false,false,false,true],'Sell timing is symmetric');
const fvgTape=[...reactionTape.slice(0,4),bar(102,109,112,108,111),bar(103,111,112,107,110)];
const fvgTrace=traceTiming(channelContexts[0],fvgTape,{entryMode:'FVG retest'});
assert.deepEqual(fvgTrace.hits.map(h=>h.hit),[false,false,false,true],'FVG formation candle cannot count as its own retest');
assert.equal(fvgTrace.hits[3].confirmTime,102);
const obTrace=traceTiming(channelContexts[0],pullbackTape,{entryMode:'OB retest'});
assert.deepEqual(obTrace.hits.map(h=>h.hit),[false,false,false,true],'OB creation candle cannot count as its own retest');
assert.equal(obTrace.hits[3].tag,'O');
const mssTape=[...reactionTape.slice(0,2),bar(100,103,110,102,106),bar(101,106,109,106,108),bar(102,108,109,104,106)];
const mssState=Object.assign(channelHarness.state(channelContexts[0]),{mssLevel:105});
const mssHits=[];
for(let j=2;j<mssTape.length;j++)mssHits.push(channelHarness.step(channelContexts[0],mssState,mssTape.slice(0,j+1),{entryMode:'MSS',pivotHigh:j===4?110:null}));
assert.deepEqual(mssHits.map(h=>h.hit),[false,false,true]);
assert.equal(mssState.mssLevel,110,'New confirmed pivot may refresh the scanner');
assert.equal(mssState.confirmLevel,105,'It cannot move the pending retest level');
assert.equal(mssHits[2].tag,'M');
assert.match(source,/signalTiming = input.string\(DEFAULT_SIGNAL_TIMING/);
assert.match(source,/recentOnly = input.bool\(true,/);
assert.doesNotMatch(source,/extend=extend.right/,'No unbounded level projection');
assert.match(source,/int markerHalfWidth = int\(chartSeconds \* 1000 \* 0.4\)/);
assert.match(source,/if entryLong and showEntryTriangles/);
assert.match(source,/if entryShort and showEntryTriangles/);
assert.match(source,/lastVisualIndex := bar_index/,'LTF anchors start at actual condition bar');
const anchorBase={onHtf:false,modelAnchorIndex:50,lastVisualKey:'',modelKey:'model-1',lastVisualIndex:null,modelObservedIndex:100,na:x=>x==null};
assert.equal(evaluate('drawAnchorIndex',anchorBase),100,'HTF references have a valid LTF anchor before C/M or E');
assert.equal(evaluate('drawAnchorIndex',{...anchorBase,lastVisualKey:'model-1',lastVisualIndex:107}),107,'Latest signal anchor is retained when it exists');
assert.equal(evaluate('drawAnchorIndex',{...anchorBase,modelObservedIndex:null}),null,'No phantom anchor without a model');
const drawingBase={sId:1,drawAnchorIndex:100,bar_index:110,drawEndIndex:130,recentOnly:true,onHtf:false,recentModel:true,recentLtfSignal:false,na:x=>x==null};
assert.equal(evaluate('drawActive',drawingBase),true,'Recent HTF reference levels stay visible with C/M off and no entry');
assert.equal(evaluate('drawActive',{...drawingBase,recentModel:false}),false,'No stale model drawing when neither model nor signal is recent');
assert.equal(evaluate('drawActive',{...drawingBase,sId:null}),false,'No fabricated levels without a model');
assert.match(source,/line.set_xy1\(ln, anchor, price\)/);
assert.doesNotMatch(source,/irlBox/,'OB/FVG zones are internal filters, never visual boxes');
assert.match(source,/liveComplete := time == bucketTime/,'Never invent first incomplete bucket open');
assert.match(source,/array.indexof\(candleTimes, sourceTime\)/,'Cluster cache must match exact source candle');
assert.equal(evaluate('endpoint',{drawEndIndex:180,currentProjection:false}),180,'The right horizon is independent of an old source swing');
assert.equal(evaluate('endpoint',{drawEndIndex:80,currentProjection:true,bar_index:100,drawSpan:30,drawingClipIndex:120}),120,'IRL of a still-active model projects to the present, clipped before cluster');
assert.equal(evaluate('anchor',{sourceTime:1000,price:110,drawAnchorTime:5000,exactTime:false,na:x=>x==null,f_extremeTime:()=>1234}),1234,'The line starts at its actual source extreme, not the latest signal');
assert.equal(evaluate('anchor',{sourceTime:1000,price:105,drawAnchorTime:5000,exactTime:true,na:x=>x==null,f_extremeTime:()=>null}),1000,'FVG midpoint anchors to the formation candle, never an invented extreme');
assert.equal(evaluate('anchor',{sourceTime:null,price:105,drawAnchorTime:5000,na:x=>x==null,f_extremeTime:()=>1234}),5000,'EQ uses the current visual anchor');
assert.match(source,/f_level\(5, sErlU, "ERL\+",[^\n]+sErlUT\)/);
assert.match(source,/f_level\(6, sErlL, "ERL-",[^\n]+sErlLT\)/);
assert.match(source,/array.push\(candleHighTimes, liveHighTime\)/);
assert.match(source,/array.push\(candleLowTimes, liveLowTime\)/);
const hiSource=source.match(/fresh.hiT := ([^\n]+)/)[1],loSource=source.match(/fresh.loT := ([^\n]+)/)[1];
const candleSource={kind:2,high:112,low:99,time:200,previous:{high:110,low:100,time:100}};
assert.equal(evaluateExpr(hiSource,candleSource),200);
assert.equal(evaluateExpr(loSource,candleSource),200);
assert.equal(evaluateExpr(hiSource,{...candleSource,high:110}),100,'Equal extrema retain the earlier genuine source');
assert.equal(evaluateExpr(loSource,{...candleSource,kind:1}),100,'CRT range keeps C1 as its boundary source despite the C2 sweep');
assert.match(source,/m.erlUT := upT/);
assert.match(source,/m.erlLT := dnT/);
assert.match(source,/upT := q.born/);
assert.match(source,/dnT := q.born/);
let previousY=null;
for(const nextPrice of [100,100,100.01,101,200]){
 const visibleLabelGap=2;
 const labelPrice=evaluate('labelPrice',{previousY,nextPrice,visibleLabelGap,na:x=>x==null});
 assert.ok(previousY==null||labelPrice-previousY>=visibleLabelGap,'Nearby annotations are vertically spaced without changing source levels');
 previousY=labelPrice;
}
require('./candle-width-markers.cjs');
for(const clusterWidth of [2,3,6,7,15,16]){
 const candleWidth=evaluate('candleWidth',{clusterWidth});
 const left=100,right=100+candleWidth,middle=evaluate('middle',{left,right,int:Math.trunc});
 assert.equal(middle,(left+right)/2,'Wick is centered on body, including odd requested widths');
}
for(const clusterWidth of [2,4,16]){
 const candleWidth=clusterWidth,clusterStep=evaluate('clusterStep',{candleWidth});
 assert.ok(clusterStep>candleWidth,'Each body has visible spacing');
 assert.ok(evaluate('groupGap',{clusterStep})>clusterStep,'Groups have more spacing than adjacent candles');
}
assert.match(source,/bool clusterActive = not na\(sId\)\s*\n/);
assert.ok(source.includes('previous ? v111[1] : v111'),'Archived object also uses confirmed snapshot');
assert.match(source,/showArchive = input.bool\(false,/,'Archive is opt-in');
assert.match(source,/clusterFollowCount = input.int\(6,/,'Follow tail defaults to six candles');
const clusterHarness=require('./helpers/pine-cluster-harness.cjs').createClusterHarness(source);
const irlModel={kind:2,hi:120,lo:80,dir:1,irlT:null};
const irlZones=[{hi:94,lo:90,dir:1,born:10,leftTime:8,kind:1},{hi:110,lo:106,dir:-1,born:11,kind:1},{hi:96,lo:92,dir:1,born:12,kind:2},{hi:130,lo:125,dir:-1,born:13,kind:1}];
const irlSwings=[{price:116,side:1,born:4},{price:84,side:-1,born:5},{price:125,side:1,born:6},{price:80,side:-1,born:7}];
const buyMap=clusterHarness.refreshIrl({...irlModel},irlZones,irlSwings);
assert.equal(buyMap.bullIrlT,10,'FVG has priority over a newer OB');
assert.equal(buyMap.bearIrlT,11,'Opposing FVG is visible even with Buy bias');
assert.equal(buyMap.irlT,10,'Active signal zone follows bias');
assert.equal(buyMap.bullIrlLeft,8,'FVG drawing begins at C1 while detection remains C3');
const sellMap=clusterHarness.refreshIrl({...irlModel,dir:-1},irlZones,irlSwings);
assert.equal(sellMap.irlT,11);assert.equal(sellMap.bullIrlT,10);
const neutralMap=clusterHarness.refreshIrl({...irlModel,dir:0},irlZones,irlSwings);
assert.equal(neutralMap.irlT,null,'Two-sided context never fabricates an active direction in neutral bias');
for(const dir of [1,-1]){
 const obMap=clusterHarness.refreshIrl({...irlModel,dir},[{hi:94,lo:90,dir,born:12,leftTime:12,kind:2}],irlSwings);
 assert.equal(obMap.irlT,12,'Retain OB candidate fallback when no FVG exists');
 assert.equal(obMap.irlKind,2);assert.equal(obMap.irlLeft,12,'OB remains anchored at its own source candle');
 const swingMap=clusterHarness.refreshIrl({...irlModel,dir},[],irlSwings);
 assert.equal(swingMap.irlKind,3,'Retain internal swing liquidity as before');
 assert.equal(swingMap.irlH,dir===1?84:116);
}
assert.match(source,/Zone.new\(leftTime=time\[2\], hi=low, lo=high\[2\], dir=1, born=time/);
assert.match(source,/int zoneTime = side == 0 \? sBullIrlLeft : sBearIrlLeft/);
const emptyMap=clusterHarness.refreshIrl({...irlModel},[],[]);assert.equal(emptyMap.irlT,null,'No data means no IRL');
const retainedMap=clusterHarness.refreshIrl({...buyMap},[],irlSwings);
assert.equal(retainedMap.bullIrlT,10,'Chosen zone remains visible when wick-mitigated but not HTF-invalidated');
const expiryBase={lifeHtf:8,bar_index:17,m:{bornIndex:10,uid:100,resolvedIndex:16},scanStart:0};
assert.equal(evaluate('expired',expiryBase),false);
assert.equal(evaluate('expired',{...expiryBase,bar_index:18}),true,'Timeout occurs at the eighth completed HTF bar, not after a bias/IRL reset');
assert.equal(evaluate('expired',{...expiryBase,lifeHtf:0,bar_index:40}),false,'Zero explicitly disables the optional age limit');
assert.equal(evaluate('expired',{...expiryBase,lifeHtf:0,scanStart:101}),true,'Recovery limit remains independent of age timeout');
assert.match(source,/lifeHtf = input.int\(8,/);
function clusterFixture(count){
 const times=Array.from({length:count},(_,i)=>i+10);
 return {showCluster:true,clusterActive:true,candleTimes:times,candleOpens:times.map(t=>t+1),candleHighs:times.map(t=>t+4),candleLows:times.map(t=>t-1),candleCloses:times.map(t=>t+2),sAT:10,sAO:999,sAH:999,sAL:999,sAC:999,sBT:12,sBO:20,sBH:25,sBL:18,sBC:21,sCT:15,sCO:30,sCH:35,sCL:28,sCC:31,liveComplete:true,liveT:count+10,liveO:40,liveH:45,liveL:38,liveC:44};
}
for(const count of [8,40,200,449]){
 const fixture=clusterFixture(count),candles=clusterHarness.assemble(fixture);
 assert.deepEqual(candles.map(c=>c.t),[...fixture.candleTimes,fixture.liveT],'Every intervening HTF candle appears exactly once, including nested mother gaps');
 assert.equal(candles[0].o,11,'Chart-derived OHLC takes priority over frozen source fallback');
 assert.equal(candles.at(-1).c,44,'Final candle uses current live OHLC');
 assert.equal(clusterHarness.assemble({...fixture,liveC:43}).at(-1).c,43,'Live update changes close without accumulating duplicates');
 assert.equal(clusterHarness.assemble({...fixture,liveComplete:false}).length,count,'Do not fabricate an incomplete first bucket');
 assert.equal(clusterHarness.assemble({...fixture,clusterActive:false}).length,0,'Inactive model clears its entire sequence');
}
const missing=clusterFixture(8);missing.candleTimes=missing.candleTimes.slice(1);for(const n of ['candleOpens','candleHighs','candleLows','candleCloses'])missing[n]=missing[n].slice(1);
assert.equal(clusterHarness.assemble(missing)[0].o,999,'Frozen model source fills a missing chart candle in chronological order');
const changed=clusterHarness.assemble({...clusterFixture(20),sAT:16,sBT:17,sCT:18});
assert.deepEqual(changed.map(c=>c.t),Array.from({length:15},(_,i)=>16+i),'Switching model removes all earlier candles');
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
console.log('PASS registry/111-field HTF contracts, timeout and two-sided IRL source-body fixtures; 3 independent LTF channels; sequential Buy/Sell source-body fixtures, fresh/legacy cadence, first-touch CISD, wick/reclaim and target guards; 3000 TS symmetry cases, 1440 macro minutes and DST/QT. Full chart execution/Replay remains unverified.');
