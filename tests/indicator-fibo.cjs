// Executes fibo and drawing/layout function bodies from the actual Pine source.
// Drawing APIs are mocks; this is not a TradingView renderer or market backtest.
const assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
function body(name){const lines=source.split(/\r?\n/),at=lines.findIndex(l=>l.startsWith(name+'('));assert.ok(at>=0);let end=at+1;while(end<lines.length&&(!lines[end].trim()||/^\s/.test(lines[end])))end++;return lines.slice(at+1,end).filter(l=>l.trim()&&!l.trim().startsWith('//'));}
function expr(s){return s.replace(/\band\b/g,'&&').replace(/\bor\b/g,'||').replace(/\bnot\b/g,'!').replace(/\bna\b(?!\s*\()/g,'NaN').replace(/:=/g,'=');}
function translate(name,returns=false){const lines=body(name);let code='',blocks=[];for(let i=0;i<lines.length;i++){let raw=lines[i],indent=raw.match(/^\s*/)[0].length,line=raw.trim();while(blocks.length&&indent<=blocks.at(-1)){code+='}\n';blocks.pop();}if(line.startsWith('if ')){code+='if('+expr(line.slice(3))+'){\n';blocks.push(indent);continue;}const loop=line.match(/^for (\w+) = (.+) to (.+)$/);if(loop){code+=`for(let ${loop[1]}=${expr(loop[2])};${loop[1]}<=${expr(loop[3])};${loop[1]}++){\n`;blocks.push(indent);continue;}if(line==='break'){code+='break;\n';continue;}line=line.replace(/^array<bool> (\w+) = array.new<bool>\((.+)\)$/,'let $1 = array.make($2)').replace(/^(?:bool|float|int|string|line|label) (\w+) = /,'let $1 = ');code+=(returns&&i===lines.length-1?'return ':'')+expr(line)+';\n';}while(blocks.length){code+='}\n';blocks.pop();}return code;}
const na=x=>x==null||Number.isNaN(x);
const fibo=Function('na','direction','c1High','c1Low','c2High','c2Low','c2Close',translate('f_crtFibo',true)).bind(null,na);
const expectedRatios=[0,.1,.2,.4,.6,.8,1],near=(a,b)=>assert.ok(Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(b)),`${a} != ${b}`);
assert.deepEqual(fibo(-1,110,100,115,101,108),[115,113.5,112,109,106,103,100]);
assert.deepEqual(fibo(1,110,100,109,95,102),[95,96.5,98,101,104,107,110]);
for(const args of [[0,110,100,115,101,108],[-1,110,100,110,101,108],[-1,110,100,115,99,108],[-1,110,100,115,100,108],[-1,110,100,115,101,110],[-1,110,100,115,101,100],[-1,100,110,115,101,108],[-1,NaN,100,115,101,108],[-1,110,100,115,101,116]])assert.ok(fibo(...args).every(na),'Reject unresolved, ambiguous, no sweep, consumed target, missing or malformed OHLC');
let seed=23;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
for(let i=0;i<1000;i++){
 const low=-100+rand()*10000,high=low+1+rand()*100,extreme=high+1+rand()*50;
 const sell=fibo(-1,high,low,extreme,low+(high-low)*.1,low+(high-low)*.5);
 const buy=fibo(1,-low,-high,-(low+(high-low)*.1),-extreme,-(low+(high-low)*.5));
 for(let j=0;j<7;j++){near(sell[j],extreme+expectedRatios[j]*(low-extreme));near(buy[j],-sell[j]);if(j)assert.ok(sell[j]<sell[j-1]&&buy[j]>buy[j-1]);}
}
const shared=Function('na','math','price','priorPrice','anchor','priorAnchor','endpoint','priorEndpoint','tickSize',translate('f_sharedLevel',true)).bind(null,na,Math);
const visibleExpr=source.match(/bool fiboVisible = (.+)/)[1];
const baseGate={showFibo:true,drawActive:true,hasModel:true,sKind:1,fiboSl:115,fiboTp:100,fiboSlTime:1000,fiboTpTime:900,sInv:115,sCp:100,sConfirmed:2000,time_close:3000};
function visible(over={}){const args={...baseGate,...over};return Function('na',...Object.keys(args),'return '+expr(visibleExpr))(na,...Object.values(args));}
assert.equal(visible(),true);
for(const fail of [{showFibo:false},{drawActive:false},{hasModel:false},{sKind:2},{fiboSl:NaN},{fiboTp:NaN},{fiboSlTime:NaN},{fiboTpTime:NaN},{sInv:114},{sCp:101},{sConfirmed:3001}])assert.equal(visible(fail),false,'No partial, mismatched, unknown-source or unconfirmed fibo');
assert.equal(shared(100,100,1000,900,2000,2000,.25),true,'Equal price with different source time merges');
assert.equal(shared(100.05,100,1000,900,2000,2000,.25),false,'Nearby fractional-tick levels must not be silently rounded together');
assert.equal(shared(100,100,2100,900,3000,2000,.25),false,'Disjoint drawings do not merge');
assert.equal(shared(100,NaN,1000,900,2000,2000,.25),false);
const slots=Number(source.match(/const int LEVEL_SLOTS = (\d+)/)[1]);assert.equal(slots,17);
const makeEnv=()=>({levelLines:Array.from({length:slots},()=>({})),levelLabels:Array.from({length:slots},()=>({})),renderedPrices:Array(slots).fill(NaN),renderedPriorities:Array(slots).fill(0),renderedAnchors:Array(slots).fill(NaN),renderedEnds:Array(slots).fill(NaN),renderedDetails:Array(slots).fill(''),labelLeaders:Array.from({length:slots},()=>({}))});
const api={get:(a,i)=>{assert.ok(i>=0&&i<a.length,'Object pool index');return a[i];},set:(a,i,v)=>{assert.ok(i>=0&&i<a.length);a[i]=v;},make:(n,v)=>Array(n).fill(v)};
const line={set_xy1:(o,x,y)=>Object.assign(o,{x1:x,y1:y}),set_xy2:(o,x,y)=>Object.assign(o,{x2:x,y2:y}),set_color:(o,c)=>o.color=c};
const label={set_xy:(o,x,y)=>Object.assign(o,{x,y}),set_text:(o,t)=>o.text=t,set_textcolor:(o,c)=>o.textcolor=c,set_tooltip:(o,t)=>o.tooltip=t,get_text:o=>o.text||''};
const color={gray:'gray',new:(shade,alpha)=>({shade,alpha})},indexTime=i=>na(i)?NaN:1000+i*100;
const priority=Function('slot',translate('f_levelPriority',true));
const fieldNames=Object.keys(makeEnv());
const level=Function('array','line','label','color','chart','math','str','format','syminfo','na','f_indexTime','f_extremeTime','f_sharedLevel','f_levelPriority','drawAnchorTime','drawEndIndex','bar_index','drawSpan','drawingClipIndex',...fieldNames,'slot','price','caption','shade','visible','sourceTime','exactTime','currentProjection','detail',translate('f_level'));
const layout=Function('array','line','label','color','chart','math','syminfo','na','LEVEL_SLOTS','visibleLabelGap',...fieldNames,translate('f_layoutLabels'));
let env=makeEnv();
function draw(slot,price,caption,shade='black',visible=true,anchor=1000,detail='',currentProjection=false){
 level(api,line,label,color,{fg_color:'black'},Math,{tostring:String},{mintick:'tick'},{mintick:.25},na,indexTime,t=>t,shared,priority,1000,20,10,3,25,...fieldNames.map(n=>env[n]),slot,price,caption,shade,visible,anchor,true,currentProjection,detail);
}
draw(0,110,'RH','teal',true,900,'',true);draw(4,110,'TP','black',true,1100,'1 = TP | CRT #42');
assert.equal(env.levelLabels[0].text,'RH / TP');assert.equal(env.levelLabels[4].text,'');assert.equal(env.levelLines[0].x1,900);assert.match(env.levelLabels[0].tooltip,/CRT #42/);
assert.equal(env.levelLines[0].x2,indexTime(20),'Merged drawing keeps the longer end as well as earlier source');
assert.equal(env.levelLabels[0].textcolor,'black','Higher-priority TP owns the merged color');
draw(7,108.5,'ET2','blue',true,1000,'0.1 = ET2');draw(8,108.45,'ET1','teal');draw(9,105,'break');draw(10,103,'BE');draw(11,103,'FVG+','teal',true,950,'FVG source');draw(16,100,'TL');
assert.equal(env.levelLabels[10].text,'BE / FVG+');assert.equal(env.levelLines[10].x1,950);assert.equal(env.levelLabels[11].text,'');
const prices=env.renderedPrices.slice();layout(api,line,label,color,{fg_color:'black'},Math,{mintick:.25},na,slots,3,...fieldNames.map(n=>env[n]));
const active=env.renderedPrices.flatMap((p,i)=>na(p)?[]:[{slot:i,price:p,y:env.levelLabels[i].y}]).sort((a,b)=>a.price-b.price);
for(let i=0;i<active.length;i++){const r=active[i];assert.equal(env.levelLines[r.slot].y1,prices[r.slot],'Collision layout cannot move price lines');assert.equal(env.levelLines[r.slot].y2,prices[r.slot]);assert.equal(env.levelLabels[r.slot].x,env.renderedEnds[r.slot]+2,'Text is after the line');if(i)assert.ok(r.y-active[i-1].y>=3,'Minimum label spacing');}
// The next drawing frame must clear old fibo/IRL labels and lines when hidden.
for(const field of ['renderedPrices','renderedAnchors','renderedEnds'])env[field].fill(NaN);env.renderedDetails.fill('');
for(let i=0;i<slots;i++)draw(i,100,'hidden','gray',false);
assert.ok(env.levelLabels.every(l=>l.text===''));assert.ok(env.levelLines.every(l=>l.color.alpha===100));
const display=source.slice(source.indexOf('if barstate.islast\n    bool hasModel'));
assert.deepEqual([...display.matchAll(/^    f_level\((\d+),/gm)].map(m=>Number(m[1])),Array.from({length:slots},(_,i)=>i),'Ascending slots ensure dedup sees every earlier level');
for(const [slot,field,caption] of [[7,'fiboEt2','ET2'],[8,'fiboEt1','ET1'],[9,'fiboBreak','break'],[10,'fiboBe','BE'],[16,'fiboTl','TL']])assert.ok(display.includes(`f_level(${slot}, ${field}, "${caption}"`)&&display.match(new RegExp(`f_level\\(${slot},[^\\n]+fiboVisible, sConfirmed, true, false`)));
assert.match(source,/f_crtFibo\(sDir, sAH, sAL, sBH, sBL, sBC\)/,'Never use live cluster or candle bodies as anchors');
assert.match(source,/fiboSl == sInv and fiboTp == sCp/);
assert.match(source,/sConfirmed <= time_close/);
assert.match(source,/int fiboSlTime = f_extremeTime\(sInvT, sInv\)/);
assert.match(source,/int fiboTpTime = f_extremeTime\(sCpT, sCp\)/);
assert.match(source,/not na\(fiboSlTime\) and not na\(fiboTpTime\)/,'Hide the whole fibo when source wick timestamps are not available');
assert.match(source,/showFibo = input.bool\(true/);
for(const fn of ['f_engine','f_stepChannel'])assert.doesNotMatch(body(fn).join('\n'),/showFibo|fiboEt|f_crtFibo/,'Drawing toggle cannot influence model or signal');
assert.match(source,/const int LEVEL_SLOTS = 17/);assert.doesNotMatch(source,/for (?:slot|pass|i) = 0 to 15/);
console.log('PASS actual Pine fibo: wick anchors, 7 levels, 1000 mirrored cases, invalid inputs, exact-price merge/tooltip/source, 17-slot layout/cleanup, confirmed-only display and isolated signals. Drawing APIs mocked.');
