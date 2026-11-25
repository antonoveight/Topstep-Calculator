const assert=require('node:assert/strict'),fs=require('node:fs');
const s=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
assert.equal(s,fs.readFileSync('chibao.txt','utf8'));
assert.doesNotMatch(s,/showFibo|f_crtFibo|fiboEt|fiboSl|fiboTp|CRT fibo|r1MainLow|r1HigherLow|showIrl/);
for(const caption of ['CRTH / TGT','CRTL / TGT','EQ','INV'])assert.ok(s.includes('"'+caption+'"'));
assert.match(s,/array<string> captions = array.from/);
assert.doesNotMatch(s,/f_level\([^\n]*"(?:IRL|ERL|iBSL|iSSL)/);
assert.match(s,/span \* 0.8/);assert.match(s,/span \* 0.5/);
console.log('PASS no fibo drawings/manual zone settings; automatic OTE is internal only; unique CRT/TS/key labels.');
