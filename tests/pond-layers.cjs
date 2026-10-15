const assert=require('node:assert/strict');
const fs=require('node:fs');
for(const name of ['fisherman-v2.png','foliage-v2.png','lantern-v2.png','lantern-post-v2.png']){
 const png=fs.readFileSync('assets/pond/'+name);
 assert.equal(png[25],6,name+' must retain RGBA transparency');
}
const Scene=require('../assets/pond-scene.js'),Water=require('../assets/pond-water.js'),Behavior=require('../assets/pond-behavior.js');
for(let t=0;t<180;t+=.2){
 const p=Scene.pose(t,0,false,1),small=Scene.pose(t,0,false,.55);
 assert.ok(Math.abs(p.angle)<.03&&Math.abs(p.breath)<1.26);
 assert.ok(Math.abs(small.y)<=Math.abs(p.y)+1e-10);
 const dx=303-p.pivot.x,dy=443-p.pivot.y;
 assert.ok(Math.abs(p.hand.x-(p.pivot.x+dx*Math.cos(p.angle)-dy*Math.sin(p.angle)+p.x))<1e-9,'Rod hand must share the actor transform');
 for(let y=195;y<650;y+=30){const w=Water.wave(y,t);assert.ok(Math.abs(w.x)<2.36&&Math.abs(w.y)<.86);}
}
const names=[];
for(let setup=1;setup<=4;setup++){
 const fish=Behavior.target({setup,stage:2},{x:650,y:412},4,2);names.push(fish.behavior);
 for(const stage of [2,3,4,5,6])for(let age=0;age<40;age+=.5){const p=Behavior.target({setup,stage},{x:650,y:412},age,age);assert.ok(Number.isFinite(p.x+p.y+p.angle+p.tail));}
}
assert.equal(new Set(names).size,4);
for(const [width,height] of [[720,640],[400,355.55],[1920,1080]]){
 const v=Scene.viewport(width,height,true);
 assert.ok(v.x<=0&&v.y<=0&&v.x+1000*v.scale>=width-.01&&v.y+750*v.scale>=height-.01,'Camera stays inside artwork');
 assert.ok(53*v.scale+v.x>=0&&215*v.scale+v.x<width&&650*v.scale+v.x<width,'Entire large basket and float remain visible together');
}
assert.equal(Behavior.target({setup:1,stage:7},{x:650,y:412},1,1),null);
console.log('PASS layered actor/hand transform, gentle intensity bounds, two-scale wave bounds and four setup narratives.');
