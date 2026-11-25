// Current CRT V1 contracts. Source arithmetic/structure checks, not a Pine runtime.
const assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
assert.equal(source,fs.readFileSync('chibao.txt','utf8'));
assert.match(source,/@version=6/);assert.match(source,/CRT Key Reactions/);
assert.doesNotMatch(source,/signalModels|egfContext|isbContext|egfResult|isbResult|f_preferContext|f_trackTrigger|EGF|ISB/);
assert.match(source,/bool crt = tsBull or tsBear/);
assert.match(source,/if inScan and not na\(time\[1\]\) and crt/);
assert.match(source,/inv=direction == 1 \? low : high, cp=direction == 1 \? rh : rl/);
assert.match(source,/float rh = high\[1\]/);assert.match(source,/float rl = low\[1\]/);
assert.match(source,/bool targetAtBirth = direction == 1 \? high >= fresh.cp : low <= fresh.cp/);
assert.match(source,/if endingReason != 0/);
assert.match(source,/f_snapshot\(true\), lookahead=barmerge.lookahead_on/);
assert.match(source,/f_snapshot\(not barstate.isconfirmed\)/);
const mapping=require('./fixtures/crt-snapshot-fields.json');
const empty=require('./fixtures/crt-empty-model-fields.json');
assert.equal(mapping.length,64);
const meta={lastRetired:'retired',retiredReason:'reason',dropped:'dropped',historyReady:'ready','array.size(models)':'count','bar_index - selected.bornIndex':'age',lastEnded:'archive'};
for(const {name,old} of mapping){
 if(old.startsWith('selected.')&&empty[old.slice(9)]){
  const def=empty[old.slice(9)];assert.ok(source.includes(`${def.type} ${name} = ${def.initial}`));continue;
 }
 const expected=old.startsWith('selected.')?old.replace('selected.','mainSelected.'):`not na(mainSnapshot) ? mainSnapshot.${meta[old]} :`;
 assert.ok(source.includes(`${name} = ${expected}`),`Preserve source alias ${name} from ${old}`);
}
assert.match(source,/EngineSnapshot.new\(model=f_exportModel\(selected\), archive=lastEnded.copy\(\)/,'Freeze values before their source registry mutates');
const view=source.slice(source.indexOf('type ModelView'),source.indexOf('type ModelArchive'));
assert.doesNotMatch(view,/KeyMap|array</,'Model export has no collection-bearing field');
const exportCall=source.match(/ModelView.new\(uid=source.uid[^\n]+/)?.[0];
assert.ok(exportCall);
for(const {old} of mapping.filter(x=>x.old.startsWith('selected.')&&!empty[x.old.slice(9)])){const field=old.slice(9);assert.ok(exportCall.includes(field+'=source.'+field));}
assert.match(source,/previous \? snapshot\[1\] : snapshot/,'Offset the entire source event exactly once');
assert.match(source,/EngineSnapshot mainSnapshot = onHtf \? f_snapshot\(not barstate.isconfirmed\) : requestedMain/);
const engine=source.slice(source.indexOf('f_engine(string sourceTf) =>'),source.indexOf('// One immutable packed snapshot'));
assert.doesNotMatch(engine,/\blive[OHLC]\b/);
assert.match(source,/bool armed = not na\(ctx.id\) and ctx.kind == 1/);
assert.match(source,/SignalContext.new\(age=sModelAge/);
assert.match(source,/bool modelEvent = changedModel and focusAvailable and sModelAge == 0 and barstate.isconfirmed/,'Retired context must not generate a fresh TS alert');
assert.match(source,/state.everSent := true/);assert.match(source,/f_countdown\(group == 3 \? largerEnd : liveEnd, timenow\)/);
assert.match(source,/overlay=true, scale=scale.none/);
assert.doesNotMatch(source,/(?:string|float|int|bool)\s+(?:text|range|return|class)\s*[,=)]/);
assert.doesNotMatch(source,/strategy.entry/);
const clean=source.replace(/\/\/[^\n]*/g,'').replace(/"(?:[^"\\]|\\.)*"/g,'""'),stack=[],pairs={')':'(',']':'[','}':'{'};
for(const c of clean){if('([{'.includes(c))stack.push(c);else if(Object.hasOwn(pairs,c))assert.equal(stack.pop(),pairs[c]);}assert.equal(stack.length,0);
console.log("PASS CRT detector/channel, 64 confirmed snapshot fields, current-bar gates, canonical sync and delimiters. Not Pine runtime.");

assert.match(source,/if canEmit and emitted > 0/);
assert.match(source,/priorKey and/);
assert.match(source,/entryBranches = input.string\("TS \+ FVG \+ OTE"/);
assert.match(source,/plot\(4, "TFA audit schema"/);
assert.doesNotMatch(source,/showIrl|requireMps|r1MainLow|r1HigherLow/);
