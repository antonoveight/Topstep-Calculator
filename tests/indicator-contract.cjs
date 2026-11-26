// Current CRT V1 contracts. Source arithmetic/structure checks, not a Pine runtime.
const assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
assert.equal(source,fs.readFileSync('chibao.txt','utf8'));
assert.match(source,/@version=6/);assert.match(source,/CRT Key Reactions/);
assert.doesNotMatch(source,/signalModels|egfContext|isbContext|egfResult|isbResult|f_preferContext|f_trackTrigger|EGF|ISB/);
assert.match(source,/bool crt = tsBull or tsBear/);
assert.match(source,/if inScan and not na\(source.prevT\) and crt/);
assert.match(source,/inv=direction == 1 \? source.l : source.h, cp=direction == 1 \? rh : rl/);
assert.match(source,/float rh = source.prevH/);assert.match(source,/float rl = source.prevL/);
assert.match(source,/bool targetAtBirth = direction == 1 \? source.h >= fresh.cp : source.l <= fresh.cp/);
assert.match(source,/if endingReason != 0/);
assert.match(source,/f_sourceBundle\(htf\), lookahead=f_sourceLookahead\(htf\)/);
assert.match(source,/SourcePacket source = f_sourcePacket\(sourceTf\)/);
const mapping=require('./fixtures/crt-snapshot-fields.json');
const empty=require('./fixtures/crt-empty-model-fields.json');
assert.equal(mapping.length,64);
const meta={lastRetired:'retired',retiredReason:'reason',dropped:'dropped',historyReady:'ready','array.size(models)':'count','bar_index - selected.bornIndex':'age',lastEnded:'archive'};
for(const {name,old} of mapping){
 if(old.startsWith('selected.')&&empty[old.slice(9)]){
  const def=empty[old.slice(9)];assert.ok(source.includes(`${def.type} ${name} = ${def.initial}`));continue;
 }
 const aliases={uid:'aT',aH:'hi',aL:'lo',resolvedAt:'confirmedAt',hiT:'aT',loT:'aT',cpT:'aT',invT:'bT'};
 const compact={kind:'(not na(mainSelected.aT) ? 1 : 0)',phase:'(not na(mainSelected.aT) ? 1 : 0)'};
 const expected=compact[old.slice(9)] || (aliases[old.slice(9)]?'mainSelected.'+aliases[old.slice(9)]:null) || (old.startsWith('selected.')?old.replace('selected.','mainSelected.'):`not na(mainSnapshot) ? mainSnapshot.${meta[old]} :`);
 assert.ok(source.includes(`${name} = ${expected}`),`Preserve source alias ${name} from ${old}`);
}
assert.match(source,/EngineSnapshot.new\(model=f_exportModel\(registry.model\), archive=registry.archive/,'Freeze values before their source registry mutates');
const view=source.slice(source.indexOf('type ModelView'),source.indexOf('type ModelArchive'));
assert.doesNotMatch(view,/KeyMap|array</,'Model export has no collection-bearing field');
const exportCall=source.match(/ModelView.new\(flags=source.flags[^\n]+/)?.[0];
assert.ok(exportCall);
for(const {old} of mapping.filter(x=>x.old.startsWith('selected.')&&!empty[x.old.slice(9)])){const field=old.slice(9);if(!['uid','aH','aL','resolvedAt','hiT','loT','cpT','invT','kind','phase'].includes(field))assert.ok(exportCall.includes(field+'=source.'+field));}
assert.match(source,/ClockCandle part = ClockCandle.new\(t=time\[1\]/,'Closed transport offset is fixed exactly once');
assert.match(source,/EngineSnapshot mainSnapshot = requestedMain/);
const engine=source.slice(source.indexOf('f_stepRegistry(simple string sourceTf'),source.indexOf('f_engineFromSource('));
assert.doesNotMatch(engine,/\blive[OHLC]\b/);
assert.match(source,/bool armed = not na\(ctx.id\) and ctx.kind == 1/);
assert.match(source,/SignalContext.new\(age=sModelAge/);
assert.match(source,/bool modelEvent = changedModel and focusAvailable and sModelAge == 0 and barstate.isconfirmed/,'Retired context must not generate a fresh TS alert');
assert.match(source,/state.everSent := true/);assert.match(source,/f_countdown\(group == 2 \? largerEnd : liveEnd, timenow\)/);
assert.match(source,/overlay=true, scale=scale.none/);
assert.doesNotMatch(source,/(?:string|float|int|bool)\s+(?:text|range|return|class)\s*[,=)]/);
assert.doesNotMatch(source,/strategy.entry/);
const clean=source.replace(/\/\/[^\n]*/g,'').replace(/"(?:[^"\\]|\\.)*"/g,'""'),stack=[],pairs={')':'(',']':'[','}':'{'};
for(const c of clean){if('([{'.includes(c))stack.push(c);else if(Object.hasOwn(pairs,c))assert.equal(stack.pop(),pairs[c]);}assert.equal(stack.length,0);
console.log("PASS CRT detector/channel, 64 confirmed snapshot fields, current-bar gates, canonical sync and delimiters. Not Pine runtime.");

assert.match(source,/if canEmit and emitted > 0/);
assert.match(source,/priorKey and/);
assert.match(source,/entryBranches = input.string\("FVG \/ OTE"/);
assert.match(source,/plot\(4, "TFA audit schema"/);
assert.doesNotMatch(source,/showIrl|requireMps|r1MainLow|r1HigherLow/);
