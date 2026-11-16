// Actual source-body fixtures; not a Pine runtime or a market backtest.
const assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const h=require('./helpers/pine-channel-harness.cjs').createHarness(source);
const b=(t,o,hi,lo,c)=>({t,o,h:hi,l:lo,c});
const buy={id:21,kind:2,flags:2,phase:0,dir:1,confirmed:100,resolved:100,hi:120,lo:90,inv:90,cp:120,irlKind:3,irlH:100,irlL:100,irlT:80};
const tape=[b(98,108,110,107,109),b(99,109,110,104,105),b(100,105,106,100,103),b(101,103,108,100,107),b(102,107,108,99,101),b(103,101,109,100.5,108),b(104,108,109,106,107.5)];
function run(ctx,t){const state=h.state(ctx),out=[];for(let j=2;j<t.length;j++)out.push(h.step(ctx,state,t.slice(0,j+1)));return {state,out};}
for(const dir of [1,-1]){
 const mirror=x=>x==null?x:200-x;
 const ctx=dir===1?buy:{...buy,dir:-1,hi:110,lo:80,inv:110,cp:80};
 const t=dir===1?tape:tape.map(x=>b(x.t,mirror(x.o),mirror(x.l),mirror(x.h),mirror(x.c)));
 const r=run(ctx,t);
 assert.equal(r.out[0].status,'WAIT SWEEP','Exact touch does not count as taking stops');
 assert.equal(r.out[1].hit,false,'C/M before a raid is not EGF confirmation');
 assert.equal(r.out[2].hit,false,'Raid/reclaim alone does not emit');
 assert.equal(r.out[3].hit,false,'Pullback waits after the new confirmation');
 assert.equal(r.out[4].hit,true,'Post-raid C/M then retest may emit');
 for(const depth of [0,.005]){
  const noRaid=t.map((x,j)=>j===4?{...x,...(dir===1?{l:100-depth}:{h:100+depth})}:x);
  assert.equal(run(ctx,noRaid).out.some(x=>x.hit),false,'Touch/sub-tick excursion cannot qualify');
 }
 const noReclaim=t.map((x,j)=>j>=4?{...x,c:dir===1?99:101}:x);
 assert.equal(run(ctx,noReclaim).out.some(x=>x.hit),false,'No close back inside means no reaction signal');
 const absent=run({...ctx,irlKind:0,irlH:null,irlL:null,irlT:null},t);
 assert.ok(absent.out.every(x=>!x.hit&&x.status==='NO REF'),'No fabricated EQ fallback');
}
assert.match(source,/previous \? v113\[1\] : v113/,'EGF reference type must use confirmed HTF snapshot');
assert.match(source,/SignalContext.new\(irlKind=kEIrlKind, kind=2/);
assert.match(source,/sBullIrlKind == 1 \? "FVG\+" : "OB\+"/);
assert.match(source,/"iBSL"/);assert.match(source,/"iSSL"/);
assert.match(source,/"B", "REF", "T"/);
console.log('PASS symmetric EGF internal stops: touch vs raid, reclaim, fresh confirmation, later Pullback, no-reference guard and confirmed type wiring. Synthetic only.');
