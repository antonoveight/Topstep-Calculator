// Current CRT V1 contracts. Source arithmetic/structure checks, not a Pine runtime.
const assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
assert.equal(source,fs.readFileSync('chibao.txt','utf8'));
assert.match(source,/@version=6/);assert.match(source,/CRT V1/);
assert.doesNotMatch(source,/signalModels|egfContext|isbContext|egfResult|isbResult|f_preferContext|f_trackTrigger|EGF|ISB/);
assert.match(source,/bool crt = tsBull or tsBear/);
assert.match(source,/if inScan and not na\(time\[1\]\) and crt/);
assert.match(source,/inv=direction == 1 \? low : high, cp=direction == 1 \? rh : rl/);
assert.match(source,/float rh = high\[1\]/);assert.match(source,/float rl = low\[1\]/);
assert.match(source,/bool targetAtBirth = direction == 1 \? high >= fresh.cp : low <= fresh.cp/);
assert.match(source,/if endingReason != 0/);
assert.match(source,/f_snapshot\(true\), lookahead=barmerge.lookahead_on/);
assert.match(source,/f_snapshot\(not barstate.isconfirmed\)/);
const fields=source.match(/^    \[selected.uid,.+$/m)[0].trim().slice(1,-1).split(', ');
const names=source.match(/^\[sId,.+\] = if onHtf/m)[0].split('] =')[0].slice(1).split(', ');
assert.equal(fields.length,61);assert.equal(names.length,fields.length);
for(let i=0;i<fields.length;i++)assert.ok(source.includes(`previous ? v${i}[1] : v${i}`));
assert.equal(fields[names.indexOf('sArchived')],'lastEnded');
assert.equal(fields[names.indexOf('kCrtKey')],'selected.crtKey');
assert.equal(fields[names.indexOf('sEqTouched')],'selected.eqTouched');
assert.ok(fields.length+7+6<=127,'All nested request tuple fields fit Pine budget');
const engine=source.slice(source.indexOf('f_engine() =>'),source.indexOf('// Every snapshot'));
assert.doesNotMatch(engine,/\blive[OHLC]\b/);
assert.match(source,/if armed and barstate.isconfirmed and isLtf and entryWindow and time >= activatedAt/);
assert.match(source,/bool armed = not na\(ctx.id\) and ctx.kind == 1/);
assert.match(source,/SignalContext.new\(age=sModelAge/);
assert.match(source,/bool entryWindow = ctx.age == 0/);
assert.match(source,/"C3 CLOSED"/);
assert.match(source,/bool modelEvent = changedModel and not na\(sId\) and sModelAge == 0 and barstate.isconfirmed/,'Context fallback must not generate a fresh TS alert');
assert.match(source,/if selectedEntry and risk > 0 and not na\(target\) and reward > 0 and biasAllowed and timeAllowed/);
assert.match(source,/not invalidBar and not localTargetTaken and not alreadyEmitted and waveAllowed/);
assert.equal((source.match(/ChannelResult crtResult = f_stepChannel/g)||[]).length,1);
assert.match(source,/state.everSent := true/);assert.match(source,/"N\*"/);
assert.match(source,/overlay=true, scale=scale.none/);
assert.doesNotMatch(source,/(?:string|float|int|bool)\s+(?:text|range|return|class)\s*[,=)]/);
assert.doesNotMatch(source,/strategy.entry/);
const Market=require('../assets/market-hours.js'),QT=require('../assets/market-quarterly.js'),T=require('../assets/market-time.js');
function evaluate(name,ctx){const m=source.match(new RegExp('^\\s*(?:bool|float|int|string) '+name+' = (.+)$','m'));assert.ok(m);const js=m[1].replace(/\band\b/g,'&&').replace(/\bor\b/g,'||').replace(/\bnot\b/g,'!');return Function(...Object.keys(ctx),'return ('+js+');')(...Object.values(ctx));}
const f_window=(v,a,b)=>v>=a&&v<b;
for(let minute=0;minute<1440;minute++){
 const expected=Market.macros.find(m=>f_window(minute,m.startHour*60+m.startMin,m.endHour*60+m.endMin))?.code||'-';
 assert.equal(evaluate('macro',{nyMinute:minute,f_window}),expected);assert.equal(evaluate('macroNow',{nyNowMinute:minute,f_window}),expected);
}
for(const date of ['2026-07-14T23:00:00Z','2026-12-14T00:00:00Z','2026-03-08T06:59:59Z','2026-03-08T07:00:00Z','2026-11-01T05:59:59Z','2026-11-01T06:00:00Z']){
 const instant=new Date(date),p=T.parts(instant,T.NY),second=()=>p.second,nyMinute=p.hour*60+p.minute;
 const cycleMinute=evaluate('cycleMinute',{nyNowMinute:nyMinute,second,contextStamp:instant.getTime(),NY:T.NY});
 const state=QT.state(instant),ctx={cycleMinute,int:Math.trunc,math:Math};
 assert.equal(evaluate('dayQuarter',ctx),state.day.quarter);assert.equal(evaluate('sessionQuarter',ctx),state.ninety.quarter);assert.equal(evaluate('microQuarter',ctx),state.micro.quarter);
}
const clean=source.replace(/\/\/[^\n]*/g,'').replace(/"(?:[^"\\]|\\.)*"/g,'""'),stack=[],pairs={')':'(',']':'[','}':'{'};
for(const c of clean){if('([{'.includes(c))stack.push(c);else if(Object.hasOwn(pairs,c))assert.equal(stack.pop(),pairs[c]);}assert.equal(stack.length,0);
console.log('PASS CRT-only detector/channel, 61 confirmed snapshot fields (74 total request fields), current-bar gates, sync, macros 1440 minutes, DST/QT and delimiters. Not Pine runtime.');
