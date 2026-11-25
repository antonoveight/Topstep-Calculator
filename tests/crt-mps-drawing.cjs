const assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const lines=source.split(/\r?\n/),at=lines.findIndex(x=>x.startsWith('f_mpsSegment('));
let end=at+1;while(end<lines.length&&/^\s/.test(lines[end]))end++;
const body=lines.slice(at+1,end).map((line,i,all)=>{
 let s=line.trim().replace(/^int /,'let ').replace(/\bint\(/g,'Math.trunc(').replace(/math\./g,'Math.');
 return i===all.length-1?'return '+s+';':s+';';
}).join('\n');
const segment=Function('sourceAt','brokenAt','barMs',body);
for(const barMs of [60000,180000,300000])for(const bars of [1,2,3,5,10,30,200]){
 const start=Date.parse('2026-11-24T01:00:00Z'),finish=start+bars*barMs;
 const [middle,left,right]=segment(start,finish,barMs);
 assert.ok(start<left&&left<middle&&middle<right&&right<finish,'Text gap and both line segments stay inside real source/break interval');
 assert.equal(middle,start+Math.trunc((finish-start)/2));
 assert.equal(right-middle,middle-left);assert.ok(right-left<=4*barMs);
}
const h=require('./helpers/pine-channel-harness.cjs').createHarness(source);
const ctx={id:90,kind:1,dir:-1,confirmed:100,inv:120,cp:80,crtKey:{kind:2,dir:-1,hi:114,lo:110,knownAt:80,beforeTime:90}};
const tape=[{t:100,o:104,h:108,l:102,c:106},{t:101,o:108,h:111,l:103,c:105},{t:102,o:104,h:105,l:99,c:100}];
const state=h.state(ctx);
for(let n=2;n<=tape.length;n++)h.step(ctx,state,tape.slice(0,n),{requireKey:false,knownHigh:108,knownHighAt:90,knownLow:102,knownLowAt:95});
assert.equal(state.mpsEvent,true);assert.equal(state.mpsRef,102);assert.equal(state.mpsRefAt,95,'Drawing starts at the P2 source, not TS or break candle');
const drawing=source.slice(source.indexOf('f_mpsSegment('),source.indexOf('if not retainHistory and markLimit > 0'));
assert.doesNotMatch(drawing,/mpsPadding|ta.atr|low -|high \+/);
assert.match(drawing,/line.new\(sourceAt, price, gapLeft, price/);
assert.match(drawing,/line.new\(gapRight, price, time, price/);
assert.match(drawing,/label.new\(middle, price/);
assert.match(drawing,/xloc=xloc.bar_time/);assert.match(drawing,/style=label.style_none/);
assert.match(drawing,/sharedMps and pass == 1/,'Identical Main/Larger level is rendered once');
for(const pool of ['mpsLeftLines','mpsRightLines'])assert.equal((drawing.match(new RegExp('line.delete\\(array.shift\\('+pool+'\\)\\)','g'))||[]).length,2,'Latest and history-cap cleanup remove each paired line');
assert.equal(source,fs.readFileSync('chibao.txt','utf8'));
console.log('PASS MPS source timestamp capture, 21 actual line/text geometry cases, price anchoring, duplicate merge and paired-object cleanup.');
