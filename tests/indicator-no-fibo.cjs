const assert=require('node:assert/strict'),fs=require('node:fs');
const s=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
assert.equal(s,fs.readFileSync('chibao.txt','utf8'));
assert.doesNotMatch(s,/showFibo|f_crtFibo|fiboVisible|fiboEt|fiboSl|fiboTp|CRT fibo|LEVEL_SLOTS/);
assert.equal((s.match(/= input\./g)||[]).length,21);
for(const [slot,caption] of [[0,'RH'],[1,'RL'],[3,'INV'],[4,'CP'],[5,'ERL+'],[6,'ERL-']])assert.ok(s.includes(`f_level(${slot}, `)&&s.match(new RegExp(`f_level\\(${slot},[^\\n]+"${caption.replace('+','\\+')}"`)),'Preserve '+caption);
assert.match(s,/showIrl = input.bool\(true/);assert.match(s,/f_level\(15, showCrtKey/);
assert.match(s,/bool entryWindow = ctx.age == 0/);
console.log('PASS no auto-fibo or stale context timeout; 21 settings including Early; range/ERL/IRL/key levels, C3 restriction and canonical sync preserved.');
