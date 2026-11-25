const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('indicators/funded-angler-v6.pine','utf8'),h=require('./helpers/pine-clock-harness.cjs').createClockHarness(s);
const tf=h.compile('f_tfName',['tf']);
const tag=h.compile('f_keyTag',['key'],{f_tfName:tf});
assert.equal(tag(null),'-','No setup/key must never read a field of na (RE10041)');
assert.equal(tag({kind:0,tf:''}),'-');assert.equal(tag({kind:1,dir:1,tf:'120'}),'FVG/H2');
const smt=h.compile('f_smtFromFrame',['frame']);
for(const frame of [null,{first:null,second:null},{first:h.candle(),second:null}])assert.equal(smt(frame).first,null,'Insufficient source history returns empty SMT instead of RE10041');
const a=h.candle({t:100,e:200,o:100,h:110,l:90,c:105}),b=h.candle({t:200,e:300,o:105,h:112,l:92,c:104});
assert.deepEqual(smt({second:a,first:b}),{first:100,firstEnd:200,second:200,secondEnd:300,firstHigh:110,firstLow:90,secondHigh:112,secondLow:92});
const putRaw=h.compile('f_putVisual',['candles','item','afterTime']);const put=(arr,item,after=null)=>putRaw(arr,item,after);
const records=[];put(records,null);put(records,h.candle());put(records,b);put(records,a);put(records,a);put(records,h.candle({t:90,o:99}),100);
assert.deepEqual(records.map(x=>x.t),[100,200],'Sorted unique real source candles only; invalid and pre-window records omitted');
assert.deepEqual(a,{t:100,e:200,o:100,h:110,l:90,c:105},'Rendering cannot mutate the source');
const origin=h.compile('f_cachedOrigin',['sourceTime','price'],{candleTimes:[100],candleHighs:[110],candleLows:[90],candleHighTimes:[140],candleLowTimes:[120],syminfo:{mintick:.1}});
assert.equal(origin(100,110),140);assert.equal(origin(100,90),120);assert.equal(origin(100,105),100);assert.equal(origin(999,110),999);
function expression(name,env){const raw=s.slice(s.indexOf('    int countMain =')).match(new RegExp('^\\s*(?:int|float|bool) '+name+' = (.+)$','m'))[1];const js=raw.replace(/\bint\(/g,'Math.trunc(').replace(/\band\b/g,'&&').replace(/\bor\b/g,'||');return Function('math',...Object.keys(env),'return '+js)(Math,...Object.values(env));}
let bounds=0;
for(const clusterOffset of [3,30,80])for(const labelLaneBars of [18,26,36,48])for(let clusterWidth=2;clusterWidth<=16;clusterWidth++)for(const countMain of [0,4,8,14])for(const countArchive of [0,3])for(const countLarger of [0,4]){
 const total=countMain+countArchive+countLarger,groups=(countMain>0)+(countArchive>0)+(countLarger>0),bar_index=10000,clusterStartIndex=bar_index+Math.max(clusterOffset,labelLaneBars+12),splitGap=countMain>4?10:0;
 const env={clusterOffset,labelLaneBars,clusterWidth,total,groups,bar_index,clusterStartIndex,splitGap};env.between=expression('between',env);env.room=expression('room',env);env.stride=expression('stride',env);env.bodyWidth=expression('bodyWidth',env);
 if(total){const right=clusterStartIndex+total*env.stride+splitGap+Math.max(0,groups-1)*env.between-env.stride+env.bodyWidth/2;assert.ok(right<=bar_index+480);assert.ok(env.bodyWidth>=2&&env.bodyWidth<env.stride);assert.equal(env.bodyWidth%2,0);}bounds++;
}
assert.match(s,/color.new\(color.black, 100\)/);assert.match(s,/group == 1 \? "LAST " \+ f_tfName\(htf\)/);
for(const setter of ['box.set_bgcolor(body, color.new(shade, archived ? 75 : 0))','box.set_border_color(body, color.new(shade, archived ? 65 : 0))','line.set_color(wick, color.new(shade, archived ? 70 : 25))'])assert.ok(s.includes(setter));
assert.match(s,/line.set_width\(wick, 1\)/);assert.match(s,/f_countdown\(group == 2 \? largerEnd : liveEnd, timenow\)/);
assert.match(s,/if not na\(item\) and not na\(item.t\)/);
console.log(`PASS no-key/empty-frame guards, native closed SMT, source candle uniqueness/order, cached wick anchors and ${bounds} actual projection geometries (<=480 future bars).`);
