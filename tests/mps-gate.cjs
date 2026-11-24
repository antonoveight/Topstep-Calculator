const assert=require('node:assert/strict'),fs=require('node:fs');
const s=fs.readFileSync('indicators/funded-angler-v6.pine','utf8'),h=require('./helpers/pine-mps-harness.cjs').createMpsHarness(s),legacy=require('./helpers/pine-channel-harness.cjs').createHarness(s);
const values=[[115,120,105,110],[110,110,98,100],[100,100,90,95],[95,103,94,100],[100,106,98,104],[104,110,100,106],[106,107,98,102],[102,105,97,100],[100,104,96,98],[98,102,94,96],[96,99,91,94],[94,98,85,94],[94,112,93,111],[111,113,105,108],[108,109,100,104],[104,108,99,103]];
const source=values.map(([o,hi,l,c],i)=>({start:i*10,end:(i+1)*10,o,h:hi,l,c}));
const bar=(start,o,hi,l,c)=>({start,end:start+10,o,h:hi,l,c});
let checked=0;
for(const dir of [1,-1]){
 const mirror=b=>dir===1?b:{...b,o:210-b.o,h:210-b.l,l:210-b.h,c:210-b.c};
 const bars=source.map(mirror),key={kind:3,dir,hi:dir===1?88:122,lo:dir===1?88:122,knownAt:-20,beforeTime:0};
 const ctx={id:1,kind:1,flags:1,phase:1,dir,age:0,confirmed:160,inv:dir===1?85:125,cp:dir===1?120:90,hi:120,lo:90,crtKey:key};
 const ref=(price,formedAt,knownAt,takenAt=null)=>h.make('R1Swing',{side:dir,price:dir===1?price:210-price,formedAt,knownAt,takenAt});
 const pool=[ref(118,0,20),ref(110,50,80)];
 const seed=(t=bars,p=pool,x=ctx,bEnd=160,wStart=160,wEnd=240)=>h.seed(t,p,x,0,80,80,bEnd,wStart,wEnd);
 const state=seed();checked++;assert.equal(state.terminal,'');assert.equal(state.p1At,20);assert.equal(state.p3At,110);assert.equal(state.reference,dir===1?110:100);assert.equal(state.activationAt,130);assert.equal(state.availableAt,160);
 checked++;assert.equal(h.seed(bars,pool,ctx,0,80,80,160,160,240,1,{indexBase:10000,strict:true}).reference,state.reference,'Stop as soon as complete source is covered, even with a high dataset bar index');
 let reads=0;checked++;assert.equal(h.seed(bars.slice(1),pool,ctx,0,80,80,160,160,240,1,{indexBase:10000,strict:true,onRead:()=>reads++}).terminal,'M DATA');assert.equal(reads,0,'Missing C1 before available chart start must fail without a long scan');
 const first=h.candle(mirror(bar(160,103,108,100,105)));first.bias=dir;
 const observed=h.step(ctx,state,first);checked++;assert.equal(observed.ready,true);assert.equal(observed.event,true);assert.equal(state.observedAt,170);assert.equal(state.availableAt,170,'Do not allow entry on the first observation bar');assert.ok(first.start<state.availableAt);
 const next=h.candle(mirror(bar(170,105,109,102,106)));checked++;assert.equal(h.step(ctx,state,next).event,false);assert.equal(state.terminal,'');assert.ok(next.start>=state.availableAt);
 for(const p of [[],[ref(118,0,20)], [...pool,ref(108,90,120)], [...pool.slice(0,1),ref(110,50,80,100)]]){checked++;const r=seed(bars,p);assert.notEqual(r.terminal,'');assert.equal(h.step(ctx,r,first).ready,false,'No fallback to unrelated or late/spent swing');}
 for(const k of [null,{...key,knownAt:1},{...key,dir:-dir},{...key,kind:0}]){checked++;assert.equal(seed(bars,pool,{...ctx,crtKey:k}).terminal,'M NO KEY','Key is mandatory, including aligned bias');}
 checked++;assert.equal(seed(bars.filter(b=>b.start!==30)).terminal,'M DATA');checked++;assert.equal(seed(bars.filter(b=>b.start!==100)).terminal,'M DATA');
 const noBreak=bars.map((b,i)=>i===12?mirror(bar(120,94,112,93,109)):b);
 const pending=seed(noBreak);checked++;assert.equal(pending.activationAt,null);assert.equal(h.step(ctx,pending,first).ready,false);
 const equal=h.candle(mirror(bar(170,105,111,101,110)));checked++;assert.equal(h.step(ctx,pending,equal).ready,false,'Wick/equality is not a close through P2');
 const trigger=h.candle(mirror(bar(180,110,113,105,112))),activated=h.step(ctx,pending,trigger);checked++;assert.equal(activated.ready,true);assert.equal(activated.event,true);assert.equal(pending.availableAt,190);assert.ok(trigger.start<pending.availableAt);
 const prefix=seed(noBreak),before=JSON.stringify(prefix);checked++;assert.equal(h.step(ctx,prefix,{...trigger,closed:false}).event,false);assert.equal(JSON.stringify(prefix),before,'Open bar cannot commit a shift');
 const extension=bars.map((b,i)=>i===15?mirror(bar(150,104,108,85,103)):b),extended=seed(extension);checked++;assert.equal(extended.p3At,150);assert.equal(extended.activationAt,null,'New final P3 discards activation from older raid');
 for(const [b,status] of [[bar(170,105,109,102,106),'M GAP'],[bar(160,95,100,84,95),'M INV'],[bar(160,115,121,110,115),'M TG'],[bar(160,100,121,84,100),'M AMB'],[bar(160,89,90,86,87),'M KEY LOST'],[bar(240,105,109,102,106),'M EXP']]){checked++;const st=seed();assert.equal(h.step(ctx,st,h.candle(mirror(b))).status,status);assert.equal(h.step(ctx,st,next).ready,false,'Terminal cannot reopen by itself');}
 // R1 consumes this MPS rather than requiring a second first-leg cross in C3.
 const reaction=h.make('R1State',{windowStart:160,windowEnd:240,expected:160,raidReady:false});h.handoff(reaction,state,170);checked++;assert.equal(reaction.legKnownAt,170);assert.equal(reaction.reference,state.reference);assert.equal(reaction.legStart,120);assert.equal(reaction.expected,170);assert.equal(reaction.raidAt,110);
 const oldAt=reaction.legKnownAt;h.handoff(reaction,{...state,availableAt:999},180);assert.equal(reaction.legKnownAt,oldAt,'Frozen handoff is not trailed');
 // Actual TS/Pullback function cannot accumulate a pre-MPS setup.
 const cs=legacy.state(ctx),tape=[bar(160,105,108,102,106),bar(170,105,107,101,104),bar(180,104,106,102,105),bar(190,105,108,102,106),bar(200,105,107,101,104),bar(210,104,106,102,105)].map(mirror).map(b=>({t:b.start,o:b.o,h:b.h,l:b.l,c:b.c}));
 const hits=[];for(let i=0;i<tape.length;i++){const allow=tape[i].t>=190;if(allow)cs.activatedAt=190;const r=legacy.step(ctx,cs,tape.slice(0,i+1),{bias:dir,mpsAllowed:allow});if(r.hit)hits.push(tape[i].t);if(!allow)assert.equal(cs.confirmTime,null);}
 checked++;assert.deepEqual(hits,[210],'Only post-MPS TS/retest may emit');
 // Every closed-bar prefix yields the same committed MPS state/events.
 const stream=[first,equal,trigger,h.candle(mirror(bar(190,112,114,106,110)))];
 for(let n=1;n<=stream.length;n++){checked++;const a=seed(noBreak),b=seed(noBreak),prefixEvents=stream.slice(0,n).map(c=>h.step(ctx,a,c));const all=stream.map(c=>h.step(ctx,b,c));assert.deepEqual(prefixEvents,all.slice(0,n));}
}
// Execute the actual Early body with the actual MPS provider, never final C2 OHLC.
const early=require('./helpers/pine-early-c2-harness.cjs').createEarlyHarness(s);
for(const dir of [1,-1]){
 const mirror=b=>dir===1?b:{...b,o:210-b.o,h:210-b.l,l:210-b.h,c:210-b.c};
 const changes=[...source.slice(0,14),bar(140,108,111,104,108),bar(150,108,110,105,108),bar(160,108,112,106,110)];
 const run=(extension=false,gate=true)=>{
  const bars=changes.map((b,i)=>extension&&i===14?bar(140,108,111,84,108):b).map(mirror),state=early.state(),out=[];
  const key=early.make('CrtKey',{kind:3,dir,hi:dir===1?88:122,lo:dir===1?88:122,knownAt:-20,beforeTime:0});
  const ref={start:80,finish:180,c1Time:0,c1End:80,c1O:115,c1H:120,c1L:90,c1C:100};
  const pool=[h.make('R1Swing',{side:dir,price:dir===1?110:100,formedAt:50,knownAt:80})];
  for(let i=0;i<bars.length;i++){
   const tape=bars.slice(0,i+1),b=bars[i],chart=tape.map(v=>({t:v.start,tc:v.end,o:v.o,h:v.h,l:v.l,c:v.c}));
   out.push(early.step(ref,state,chart,{bias:dir,tick:1,requireMps:gate,r1Bar:h.candle(b),pool,...(dir===1?{buyKey:key}:{sellKey:key}),mpsSeed:(p,x,...args)=>h.seed(tape,p,x,...args),mpsStep:h.step}));
  }
  return {state,out,hits:out.flatMap((r,i)=>r.hit?[bars[i].start]:[])};
 };
 const a=run();checked++;assert.deepEqual(a.hits,[150],'Early may enter only after its provisional MPS and later TS/retest');assert.equal(a.state.mps.activationAt,130);assert.equal(a.state.mps.availableAt,130);
 checked++;assert.deepEqual(run(true).hits,[],'A new C2 wick invalidates old provisional MPS before entry');
 checked++;assert.ok(run(false,false).hits.length>=1,'Switch-off retains the prior Early workflow');
}
assert.match(s,/requireMps = input.bool\(true/);assert.match(s,/mainMpsAllowed = not requireMps or \(mainMpsResult.ready and time >= mainMps.availableAt\)/);assert.match(s,/higherMpsAllowed = not requireMps or \(higherMpsResult.ready and time >= higherMps.availableAt\)/);
assert.match(s,/waveAllowed, false, mainMpsAllowed\)/);assert.match(s,/higherWaveAllowed, false, higherMpsAllowed\)/);assert.match(s,/r1Mode, earlyMpsAllowed\)/);
assert.match(s,/EarlyReference.new\([^\n]*c1End=earlyC1End/);assert.match(s,/state.mps := f_mpsSeed\(r1Swings, earlyContext, ref.c1Time, ref.c1End, ref.start, time_close/);
assert.match(s,/aEnd=q61\[1\]/);assert.match(s,/plot\(requireMps \? 3 : r1Mode \? 2 : 1/);
const plots=(s.match(/^plot\(/gm)||[]).length,alerts=(s.match(/^alertcondition\(/gm)||[]).length;assert.ok(plots+alerts<=64);assert.match(s,/MPS CONFIRMATION · NOT ENTRY/);
console.log(`PASS ${checked} symmetric actual-source MPS scenarios: causal P1/P2/P3, key both ways, closed confirmation, observation chronology, barriers/gaps/expiry, R1 handoff, post-MPS TS/retest and immutable prefixes. ${plots+alerts}/64 plot budget. Not market validation.`);
