const assert=require('node:assert/strict');
const Catch=require('../assets/pond-catch.js');
const origin={x:628,y:436};
const start=Catch.sample(0,origin),raised=Catch.sample(.065,origin),reeled=Catch.sample(.5,origin),done=Catch.sample(1,origin);
assert.deepEqual(start.fish,origin);
assert.ok(raised.fish.y<origin.y-150,'Fish must clear the water');
assert.ok(reeled.fish.x<raised.fish.x-200,'Fish must reel toward the dock');
const fast=Catch.sample(.1/Catch.duration,origin);
assert.ok(fast.fish.y<origin.y-150,'Fish must burst upward within 100 ms');
assert.ok(fast.tip.y<start.tip.y-150,'Rod must snap up within 100 ms');
assert.ok(Catch.sample(.12,origin).tip.y>raised.tip.y,'Rod should recoil once after the strike');
assert.equal(done.phase,'done');assert.equal(done.deposited,true);assert.equal(done.attached,false);
assert.deepEqual(done.fish,{x:134,y:504});
let previous=start;
for(let i=1;i<=2000;i++) {
 const p=Catch.sample(i/2000,origin);
 assert.ok(Number.isFinite(p.fish.x+p.fish.y+p.tip.x+p.tip.y+p.mouth.x+p.float.x));
 assert.ok(Math.hypot(p.fish.x-previous.fish.x,p.fish.y-previous.fish.y)<9,'Landing path discontinuity');
 if(p.attached) assert.ok(Math.abs((p.float.y+17)-p.mouth.y)<.001);
 previous=p;
}
console.log('PASS decisive 100 ms hook-set, short recoil, continuous line, reel and basket deposit');
