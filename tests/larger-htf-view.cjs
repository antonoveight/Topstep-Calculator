const assert=require('node:assert/strict'),fs=require('node:fs');
const s=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const fields=s.slice(s.indexOf('f_sourceFrame(simple string sourceTf)'),s.indexOf('// Rightmost equal extreme'));
// Confirmed data must never contain the current larger candle with lookahead_on.
const offsets=[...fields.matchAll(/(time_close|time|open|high|low|close)\[(\d)\]/g)];
assert.equal(offsets.length,18); offsets.sort((a,b)=>+b[2]-+a[2]);
for(let candle=0;candle<3;candle++)assert.deepEqual(offsets.slice(candle*6,candle*6+6).map(m=>[m[1],+m[2]]),['time','time_close','open','high','low','close'].map(f=>[f,3-candle]));
assert.match(s,/largerComplete := time == largerBucket/);
assert.match(s,/largerLiveH := math.max\(largerLiveH, high\)/);
assert.match(s,/largerLiveL := math.min\(largerLiveL, low\)/);
assert.match(s,/largerLiveC := close/);
assert.match(s,/timeframe.in_seconds\(requestedLargerTf\) > timeframe.in_seconds\(htf\)/);
const render=s.slice(s.indexOf('    int countMain ='),s.indexOf('bool modelEvent ='));
assert.match(render,/total = countMain \+ countArchive \+ countLarger/);
assert.match(render,/box.delete\(array.pop\(clusterBodies\)\)/);
assert.match(render,/line.delete\(array.pop\(clusterWicks\)\)/);
assert.match(render,/label.set_text\(heading, ""\)/);
// Same hue for body, border and wick, retaining LAST's accepted opacity.
for(const setter of ['box.set_bgcolor(body, color.new(shade, archived ? 75 : 0))','box.set_border_color(body, color.new(shade, archived ? 65 : 0))','line.set_color(wick, color.new(shade, archived ? 70 : 25))'])assert.ok(render.includes(setter));
assert.match(render,/between = math.max\(clusterOffset, labelLaneBars \+ 12\)/);
assert.match(render,/int bodyWidth = math.max/);
assert.match(render,/f_countdown\(group == 2 \? largerEnd : liveEnd, timenow\)/);
assert.match(render,/label.set_text\(heading, group == 1/);
// Display additions may not become hidden trading gates.
const signal=s.slice(s.indexOf('type FocusLifecycle'),s.indexOf('f_tfName('));
assert.doesNotMatch(signal,/largerLive|h[123][TOHLC]|showLargerCluster/);
console.log('PASS larger HTF confirmed source offsets, chart OHLC preview, distinct timeframes, display-only isolation, object cleanup, shared body/wick hue and caption/gap contracts. Native layout checked separately.');
