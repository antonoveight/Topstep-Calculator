const assert=require('node:assert/strict');
const Life=require('../assets/pond-life.js');
let seed=42;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
for(const small of [false,true]) {
 const world=Life.create(random);let spawned=0,previous=world.fish.slice();
 for(let frame=0;frame<12000;frame++) {
  Life.step(world,1/30,small);
  assert.ok(world.fish.length>0 && world.fish.length<=(small?3:5));
  spawned+=world.fish.filter(f=>!previous.includes(f)).length;previous=world.fish.slice();
  world.fish.forEach(f=>{
   const p=Life.pose(f,world.time);
   assert.ok(Number.isFinite(p.x+p.y+p.angle+p.opacity));
   assert.ok(Life.contains([p.x,p.y]),'Fish left the water');
   assert.ok(p.opacity>=0 && p.opacity<=.42);
  });
 }
 assert.ok(spawned>15,'No random renewal');
}
console.log('PASS 400 simulated seconds per device: fish bounds, water paths, fade and random renewal');
