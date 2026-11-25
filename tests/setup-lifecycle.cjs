const assert=require('node:assert/strict'),fs=require('node:fs');
const s=fs.readFileSync('indicators/funded-angler-v6.pine','utf8'),h=require('./helpers/pine-focus-lifecycle.cjs').createFocusHarness(s);
let traces=0;
for(const dir of [1,-1]){
 const prices=(hi,lo)=>dir===1?[hi,lo]:[200-lo,200-hi];
 const end=(hi,lo,expired=false,older=true)=>{traces++;return h.end(dir,dir===1?90:110,dir===1?110:90,...prices(hi,lo),100,older,false,false,expired);};
 assert.equal(end(109,90),1,'Touching INV is terminal even if the candle closes back inside');
 assert.equal(end(110,91),2);assert.equal(end(110,90),4,'Two barriers in one observed bar are ambiguous');
 assert.equal(end(109,91,true),7);assert.equal(end(109,90,true),1);assert.equal(end(110,91,true),2);
 assert.equal(end(110,90,false,false),0,'C2 source candle cannot retire itself');
 assert.equal(end(105,95),0,'EQ-only move is not full TP');
 const state=h.state();
 const step=(uid,open,hi,lo,closed=true,age=0)=>{traces++;return h.step(state,[uid,dir,100,dir===1?90:110,dir===1?110:90,age,open,open+1,...prices(hi,lo),closed]);};
 assert.equal(step(1,99,110,90),0);assert.equal(state.reason,0);
 assert.equal(step(1,100,109,89,false),0,'Forming bars do not commit an end');assert.equal(state.reason,0);
 assert.equal(step(1,100,109,90),1,'Retire immediately on a closed LTF bar, before HTF ends');assert.equal(state.endedAt,101);
 assert.equal(step(1,101,111,95),0);assert.equal(state.reason,1,'A later TP cannot rewrite an earlier INV');assert.equal(state.endedAt,101);
 assert.equal(step(null,102,109,95),0);assert.equal(step(1,103,109,95),0);assert.equal(state.reason,1,'An empty snapshot then same UID cannot revive a setup');
 assert.equal(step(2,104,109,95),0);assert.equal(state.uid,2);assert.equal(state.reason,0,'A fresh UID is eligible immediately');
 assert.equal(step(2,105,109,95,true,1),0);assert.equal(state.reason,0,'C3 close alone does not end an attempt or its parent');
 assert.equal(step(3,106,110,95),2);assert.equal(state.reason,2,'New UID can complete on its first observed post-C2 bar');
 const targetFirst=h.state();assert.equal(h.step(targetFirst,[9,dir,100,dir===1?90:110,dir===1?110:90,0,100,101,...prices(110,95),true]),2);
 h.step(targetFirst,[9,dir,100,dir===1?90:110,dir===1?110:90,0,101,102,...prices(108,89),true]);assert.equal(targetFirst.reason,2);
}
// Screenshot-like 59.8k INV: no need to wait for H1 close at 22:00 NY.
const shot=h.state();assert.equal(h.step(shot,[42,1,100,59850,60300,1,150,155,59600,59320,true]),1);
const local={aT:1,bEnd:100,endReason:1,endedAt:150},laterSame={aT:1,bEnd:100,endReason:4,endedAt:200},newer={aT:2,bEnd:101,endReason:2,endedAt:201};
assert.equal(h.archive(local,laterSame),local,'Keep first observed LTF chronology for the same setup');
assert.equal(h.archive(local,newer),newer);assert.equal(h.archive(local,null),local);assert.equal(h.archive(null,newer),newer);
assert.ok(!h.archive(null,null));
assert.doesNotMatch(s,/older and bar_index > m.bornIndex\)/,'No automatic parent expiry at C3');
assert.doesNotMatch(s,/Model fallback|selected := fallback|Context timeout \(HTF/);
assert.match(s,/bool origin = showCluster and rangeAvailable/);assert.match(s,/bool visible = showLevels and rangeAvailable/);assert.match(s,/bool hasModel = rangeAvailable/);
assert.match(s,/f_contextKey\(focusAvailable \? sId : na/);assert.match(s,/id=focusAvailable \? sId : na/);
assert.match(s,/"SEARCH"/);assert.match(s,/reason == 7 \? "EXP"/);
const localArchive=s.match(/focusLife.archived := ModelArchive.new\((.+)\)/)[1];assert.doesNotMatch(localArchive,/(?:cO|cH|cL|cC|cT|cEnd)=/,'A mid-HTF event must not invent closed C3 OHLC');
assert.match(s,/f_putVisual\(archiveVisual, ClockCandle.new\(t=visibleArchive.aT/);assert.match(s,/if showCluster and showArchive/);
assert.equal(s,fs.readFileSync('chibao.txt','utf8'));
console.log(`PASS ${traces} symmetric actual-source lifecycle traces: wick/equality INV, target, entry expiry separate from parent, ambiguity, no self-invalidation, closed-bar latch, fresh setup handoff, first-event archive and screenshot regression. Not market Replay.`);
