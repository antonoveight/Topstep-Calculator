const assert=require('node:assert/strict'),fs=require('node:fs');
const s=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const k=require('./helpers/pine-crt-key-harness.cjs').createKeyHarness(s);
const h=require('./helpers/pine-cluster-harness.cjs').createClusterHarness(s);
const q=(price,side,born=50,knownAt=60)=>({price,side,born,knownAt});
for(const dir of [1,-1]){
 const ref=k.makeKey({kind:3,dir,hi:100,lo:100,knownAt:60,beforeTime:70,tf:'60'});
 assert.equal(k.reaction(ref,70,dir,dir===1?103:101,dir===1?99:97,dir===1?102:98),true);
 assert.equal(k.reaction({...ref,knownAt:71},70,dir,103,99,dir===1?102:98),false);
 assert.equal(k.reaction({...ref,dir:-dir},70,dir,103,99,dir===1?102:98),false);
 for(const kind of [0,1,2])assert.equal(k.reaction({...ref,kind},70,dir,103,99,dir===1?102:98),false);
 const swings=[q(100,-dir)];const got=k.find([],swings,70,dir,103,99,dir===1?102:98);assert.equal(got.kind,3);assert.equal(got.knownAt,60);
 const late=k.find([],[q(100,-dir,50,71)],70,dir,103,99,dir===1?102:98);assert.equal(late.kind,0);
}
const collected=k.collect([],[q(99,-1),q(98,-1),q(97,-1),q(101,1),q(102,1),q(103,1)]);
assert.equal(collected.levels.length,4);assert.ok(collected.levels.every(x=>x.kind===3));
let m={hi:110,lo:90,dir:1};h.refreshIrl(m,[],[q(89,-1),q(111,1),q(94,-1,10),q(96,-1,20),q(104,1,30),q(106,1,40)]);
assert.equal(m.innerHi,106);assert.equal(m.innerLo,94);assert.equal(m.irlKind,3);assert.equal(m.irlT,10);
m.dir=-1;h.refreshIrl(m,[],[q(104,1,30)]);assert.equal(m.irlH,104);assert.equal(m.irlT,30);
h.refreshIrl(m,[],[]);assert.equal(m.irlKind,0);assert.equal(m.irlT,null);assert.equal(m.innerHi,null);
assert.match(s,/f_refreshIrl\(m, swings\)/);assert.match(s,/f_level\(13, sInnerHi/);assert.match(s,/f_level\(14, sInnerLo/);
console.log('PASS actual HTF swing key matcher/collection and IRL refresh: prior knowledge, direction, removed-zone rejection, source anchors, range membership and no fabricated IRL.');
