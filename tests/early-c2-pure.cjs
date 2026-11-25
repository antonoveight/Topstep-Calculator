const assert=require('node:assert/strict'),fs=require('node:fs');
const s=fs.readFileSync('indicators/funded-angler-v6.pine','utf8'),h=require('./helpers/pine-early-c2-harness.cjs').createEarlyHarness(s);
const ref={start:100,finish:112,c1Time:90,c1End:100,c1O:100,c1H:110,c1L:90,c1C:100};
const bars=[{t:100,o:100,h:108,l:89,c:105},{t:101,o:105,h:107,l:102,c:104},{t:102,o:104,h:106,l:101,c:103}];
const mirror=x=>({...x,o:200-x.o,h:200-x.l,l:200-x.h,c:200-x.c});let cases=0;
for(const dir of [1,-1]){
 const tape=dir===1?bars:bars.map(mirror),key=h.make('CrtKey',{kind:2,dir,hi:dir===1?95:110,lo:dir===1?90:105,knownAt:80,beforeTime:100,tf:'60'});
 function run(opts={},input=tape){const state=h.state(),out=[];for(let i=0;i<input.length;i++)out.push(h.step(ref,state,input.slice(0,i+1),{bias:dir,...(dir===1?{buyKey:key}:{sellKey:key}),...opts}));cases++;return {state,out,hits:out.flatMap((x,i)=>x.hit?[input[i].t]:[])};}
 assert.deepEqual(run().hits,[100],'Early marker is on actual closed sweep/reclaim bar');
 for(const opts of [{enabled:false},{confirmed:false},{isLtf:false},{bias:0},{bias:-dir,allowCrtCounter:false},{confirmedHit:true}])assert.deepEqual(run(opts).hits,[]);
 assert.deepEqual(run({bias:-dir}).hits,[],'A prior key alone cannot authorize an unstructured counter-bias Early entry');
 assert.deepEqual(run(dir===1?{buyKey:h.make('CrtKey')}:{sellKey:h.make('CrtKey')}).hits,[]);
 const future=h.make('CrtKey',{...key,knownAt:101});
 assert.deepEqual(run(dir===1?{buyKey:future}:{sellKey:future}).hits,[]);
 assert.deepEqual(run({},tape.slice(1)).hits,[],'Incomplete running C2 is not reconstructed with invented data');
 assert.deepEqual(run({},tape.slice(0,1).map(x=>({...x,t:111}))).hits,[],'No provisional event on closing C2');
 for(let n=1;n<=tape.length;n++)assert.deepEqual(run({},tape.slice(0,n)).hits,[100]);
}
assert.doesNotMatch(s,/requireMps|f_mpsSeed/);
assert.match(s,/candidate.knownAt <= ref.start/);
console.log(`PASS ${cases} symmetric actual Early C2 traces: direct closed sweep, prior HTF zone, no MPS gate, one provisional event, bias/barrier/window/data gates and immutable prefixes.`);
