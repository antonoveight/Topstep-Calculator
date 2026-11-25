// Compile-cost contract, separate from syntax translation and chart validation.
const assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
assert.match(source,/indicator\([^\n]*dynamic_requests=false/);
assert.match(source,/indicator\([^\n]*calc_bars_count=150/,'Use the chart budget validated under the strict runtime allowance');
assert.match(source,/requestDepth = calculationBudget == "Light" \? 24 : CONTEXT_BARS/);
assert.doesNotMatch(source.match(/^bool isLtf = .+$/m)[0],/last_bar_time|executionActive|calculationBudget/,'Keep timeframe identity independent from rolling execution windows');
let owner=null,requests=0;
for(const line of source.split(/\r?\n/)){
 if(line && !/^\s/.test(line) && !line.startsWith('//')) owner=/^\w+\([^\n]*\) =>$/.test(line)?line.split('(')[0]:null;
 if(!line.includes('request.security(')) continue;
 requests++;
 const indent=line.length-line.trimStart().length;
 assert.ok(indent===0 || indent===4 && owner,`Request must be global or directly in an extractable function: ${line.trim()}`);
}
assert.doesNotMatch(source,/f_requested\w+\(/,'Requests must execute globally, not via conditional wrappers');
assert.match(source,/^\[requestedMain, executionMain, mainPreview\] = request.security\(/m);
assert.match(source,/^\[requestedHigher, executionLarger, largerPreview\] = request.security\(/m);
assert.match(source,/^HigherSnapshot requestedBiasModel = request.security\(/m);
assert.match(source,/^StructureBar requestedStructure = request.security\(/m);
assert.ok(requests>0);
for(const name of ['f_engine','f_executionSnapshot']){
 const start=source.indexOf(name+'('),tail=source.slice(start).split('\n');
 let end=1;while(end<tail.length&&(!tail[end].trim()||/^\s/.test(tail[end])))end++;
 assert.doesNotMatch(tail.slice(1,end).join('\n'),/request\.security\(/,`${name} must consume shared keys, not issue nested requests`);
}
assert.equal((source.match(/request.security\(syminfo.tickerid, "1W", f_weeklyWickSnapshot\(\)/g)||[]).length,1,'One shared weekly request');
assert.match(source,/f_weeklyWickSnapshot\(\) =>\s+KeyMap result = f_weeklyWickMap[^\n]+\s+result\[1\]/);
console.log(`PASS static/extractable request contract (${requests} source call sites), confirmed weekly offset. Full chart compilation remains a separate check.`);
