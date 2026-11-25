const fs=require('fs'),assert=require('node:assert/strict');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const h=require('./helpers/pine-cluster-harness.cjs').createClusterHarness(source);
const r=require('./helpers/pine-renderer-harness.cjs').createRendererHarness(source);
const tape=Array.from({length:40},(_,i)=>({t:100+i*10,e:110+i*10,o:200+i,h:204+i,l:198+i,c:202+i}));
for(const count of [2,3,8,40])for(const limit of [2,6,12]){
 const candles=tape.slice(0,count), root=candles.slice(0,2),live=count>2?candles.at(-1):null,cache=candles.slice(2,-1);
 const {main}=r.scene({root,cache,live,clusterFollowCount:limit});
 assert.deepEqual(main.slice(0,2),root);
 const expected=candles.slice(2).slice(-limit);
 assert.deepEqual(main.slice(2),expected);
 assert.equal(new Set(main.map(c=>c.t)).size,main.length);
 assert.deepEqual(tape[0],{t:100,e:110,o:200,h:204,l:198,c:202},'Display never mutates source');
}
assert.deepEqual(r.scene().main,[]);
assert.deepEqual(r.scene({root:tape.slice(0,2),showCluster:false}).main,[]);
const frame={third:tape[0],second:tape[1],first:tape[2]};
assert.deepEqual(r.scene({frame,live:tape[3]}).main,tape.slice(0,4),'No model: raw recent context without inventing C1');
const m={uid:101,flags:1,kind:1,phase:1,aT:100,aEnd:110,aO:200,aH:204,aL:198,aC:202,bT:110,bEnd:120,bO:202,bH:206,bL:201,bC:204,cT:120,cEnd:130,cO:204,cH:210,cL:203,cC:209};
for(const reason of [1,2,3,4,5,6,7]){
 const model={...m},ended=h.archive(model,reason,130);model.aH=999;model.aT=999;
 assert.equal(ended.aT,100);assert.equal(ended.aH,204);
 assert.equal(ended.endReason,reason);assert.equal(ended.endedAt,130);
 assert.deepEqual(r.assemble({showArchive:true,visibleArchive:ended}).archive.map(c=>c.t),[100,110,120]);
 assert.deepEqual(r.assemble({showArchive:true,visibleArchive:{...ended,cT:null}}).archive.map(c=>c.t),[100,110]);
 assert.deepEqual(r.assemble({showArchive:true,visibleArchive:null}).archive,[]);
}
assert.match(source,/archive=lastEnded.copy\(\)/,'Archive is copied before its event is stored');
assert.match(source,/sArchived = not na\(mainSnapshot\) \? mainSnapshot.archive/);
assert.equal((source.match(/lastEnded := f_archive\(/g)||[]).length,3,'Lifecycle, capacity and target-at-birth paths preserve snapshots');
assert.match(source,/if f_archiveAllowed\(m.kind\) and \(m.uid == priorFocusId or not archivedThisBar\)/,'Archive respects selected model family, prioritizing the focused model');
const allowedExpr=source.match(/f_archiveAllowed\(int kind\) =>\r?\n\s+(.+)/)[1].replace(/\band\b/g,'&&').replace(/\bor\b/g,'||');
const allowed=Function('kind','signalModels','return '+allowedExpr);
for(const kind of [1,2,3])assert.equal(allowed(kind,'CRT'),kind===1);
const channel=source.slice(source.indexOf('f_stepChannel('),source.indexOf('ChannelResult crtResult ='));
assert.doesNotMatch(channel,/sArchived|showArchive|clusterFollowCount/,'History/follow visibility cannot affect entries');
assert.ok(source.includes('label.set_text(heading, "")'),'Unused group headings are cleared');
assert.match(source,/if liveComplete/);
console.log('PASS actual source/FOLLOW assembly, frozen archives, explicit live OHLC and display-only isolation.');
