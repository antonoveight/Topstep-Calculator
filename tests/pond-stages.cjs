const assert=require('node:assert/strict');
const Behavior=require('../assets/pond-behavior.js'),Scene=require('../assets/pond-scene.js');
const range=values=>Math.max(...values)-Math.min(...values);
for(let setup=1;setup<=4;setup++){
 const samples={3:[],4:[],5:[]};
 for(const stage of [3,4,5])for(let t=0;t<30;t+=.04){
  const m=Behavior.motion({setup,stage},t,20);
  assert.ok(Object.values(m).every(Number.isFinite));samples[stage].push(m);
  const gentle=Behavior.motion({setup,stage},t,20,.55);
  assert.ok(Math.abs(gentle.tipY)<=Math.abs(m.tipY)+1e-9);
  const actor=Scene.pose(t,stage,false,1,m),dx=303-actor.pivot.x,dy=439-actor.pivot.y;
  assert.ok(Math.abs(actor.hand.x-(actor.pivot.x+dx*Math.cos(actor.angle)-dy*Math.sin(actor.angle)+actor.x))<1e-9);
 }
 assert.ok(range(samples[3].map(m=>m.tipY))<2,'Waiting angler must not fight or reel');
 assert.ok(range(samples[3].map(m=>m.bobberY))<5,'Tentative nibble stays subtle');
 assert.ok(samples[3].filter(m=>m.nibble<.01).length>samples[3].length*.5,'Fish pauses between nibbles');
 assert.ok(range(samples[4].map(m=>m.bobberX))>40,'Hooked fish must run sideways');
 assert.ok(samples[4].every(m=>m.lineSag<2),'Hooked line stays taut');
 assert.ok(range(samples[5].map(m=>m.tipY))>40,'1R must visibly lift and lower the rod');
 assert.ok(samples[5].every(m=>m.bobberX<-50),'Controlled retrieve brings fish closer to the dock');
 assert.ok(range(samples[5].map(m=>m.bobberY))<range(samples[4].map(m=>m.bobberY)),'1R fish is calmer');
 const strike=Behavior.motion({setup,stage:4},0,.3),restored=Behavior.motion({setup,stage:4},0,99);
 assert.ok(strike.tipY<restored.tipY-50,'Hook-set is a single entry impulse');
 const from=Behavior.motion({setup,stage:4},2,20);
 assert.deepEqual(Behavior.motion({setup,stage:5},2,0,1,from),from,'Changing stage begins from the displayed pose');
}
console.log('PASS distinct nibble/fight/pump motions across four setups, sustained effects, gentle bounds, shared rod hand, smooth transitions and no restored hook-set');
