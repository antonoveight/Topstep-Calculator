const fs=require('fs'),assert=require('node:assert/strict');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const h=require('./helpers/pine-cluster-harness.cjs').createClusterHarness(source);
const tape=Array.from({length:40},(_,i)=>({t:100+i,o:200+i,h:204+i,l:198+i,c:202+i}));
for(const kind of [1,2,3])for(const count of [2,3,8,40])for(const limit of [2,6,12]){
 const candles=tape.slice(0,count),cT=count>2?102:null;
 const {origin,follow,total}=h.split(candles,kind,100,101,cT,limit);
 assert.deepEqual(origin.map(c=>c.t),kind===1&&count>2?[100,101,102]:[100,101]);
 assert.equal(total,count-origin.length);
 assert.equal(follow.length,Math.min(total,limit));
 assert.deepEqual(follow.map(c=>c.t),candles.slice(origin.length).slice(-limit).map(c=>c.t));
 assert.equal(new Set([...origin,...follow].map(c=>c.t)).size,origin.length+follow.length,'No candle repeated between source and follow');
 if(follow.length)assert.deepEqual(follow.at(-1),candles.at(-1),'Live/newest OHLC always retained');
 assert.deepEqual(tape[0],{t:100,o:200,h:204,l:198,c:202},'Grouping never mutates source data');
}
const nested=h.split(tape,3,100,101,120,6);
assert.equal(nested.total,38,'ISB resolution does not consume all intervening follow candles as source');
assert.deepEqual(h.split([],1,null,null,null).origin,[],'No active model means no source/follow');
const m={uid:101,flags:2,kind:2,phase:0,aT:100,aO:200,aH:204,aL:198,aC:202,bT:101,bO:202,bH:206,bL:201,bC:204,cT:102,cO:204,cH:210,cL:203,cC:209};
for(const reason of [1,2,3,4,5]){
 const model={...m},ended=h.archive(model,reason,130);
 model.aH=999;model.uid=999;
 assert.equal(ended.uid,101);assert.equal(ended.aH,204,'Archive owns copied primitive OHLC, independent of later model updates');
 assert.equal(ended.endReason,reason);assert.equal(ended.endedAt,130);
 assert.deepEqual(h.endedCandles(ended).map(c=>c.t),[100,101],'EGF archive contains only original source pair');
 assert.deepEqual(h.endedCandles({...ended,kind:1}).map(c=>c.t),[100,101,102]);
 assert.deepEqual(h.endedCandles({...ended,kind:1,cT:null}).map(c=>c.t),[100,101],'No invented CRT third candle');
 assert.deepEqual(h.endedCandles(null,[{t:999}]),[],'Empty archive clears old rendered history');
}
assert.ok(source.includes('previous ? v111[1] : v111'),'Archive uses confirmed HTF history offset');
assert.equal((source.match(/lastEnded := f_archive\(/g)||[]).length,4,'All four model-ending paths preserve a snapshot');
assert.match(source,/if f_archiveAllowed\(m.kind\) and \(m.uid == priorFocusId or not archivedThisBar\)/,'Archive respects selected model family, prioritizing the focused model');
const allowedExpr=source.match(/f_archiveAllowed\(int kind\) =>\r?\n\s+(.+)/)[1].replace(/\band\b/g,'&&').replace(/\bor\b/g,'||');
const allowed=Function('kind','signalModels','return '+allowedExpr);
for(const kind of [1,2,3])for(const filter of ['All','CRT','EGF','ISB'])assert.equal(allowed(kind,filter),filter==='All'||['CRT','EGF','ISB'][kind-1]===filter);
const channel=source.slice(source.indexOf('f_stepChannel('),source.indexOf('ChannelResult crtResult ='));
assert.doesNotMatch(channel,/sArchived|showArchive|clusterFollowCount/,'History/follow visibility cannot affect entries');
assert.ok(source.includes('label.delete(array.pop(clusterLabels))'),'Resizing removes old captions with bodies/wicks');
const closedExpr=source.match(/bool currentBucketClosed = (.+)/)[1].replace(/\band\b/g,'&&').replace(/\bnot\b/g,'!');
const bucketClosed=Function('barstate','liveEnd','time_close','na','return '+closedExpr);
for(const [confirmed,end,close,expected] of [[false,3600,3600,false],[true,3600,3600,true],[true,3600,3300,false],[true,null,3600,false]])assert.equal(bucketClosed({isconfirmed:confirmed},end,close,x=>x==null),expected,'N* remains live until the final chart candle actually closes its HTF bucket');
console.log('PASS actual source grouping (36 configurations), disjoint chronology/live OHLC, frozen archive for all end reasons, focus priority wiring, confirmed snapshot and display-only isolation. Pine chart/Replay unverified.');
