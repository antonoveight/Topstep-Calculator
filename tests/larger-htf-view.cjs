const assert=require('node:assert/strict'),fs=require('node:fs');
const s=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const fields=s.match(/f_largerClosed\(\) =>\s*\[([^\]]*(?:\][^\]]*)*)\]\r?\n\[h3T/)[1];
// Confirmed data must never contain the current larger candle with lookahead_on.
const offsets=[...fields.matchAll(/(time_close|time|open|high|low|close)\[(\d)\]/g)];
assert.equal(offsets.length,18);
for(let candle=0;candle<3;candle++)assert.deepEqual(offsets.slice(candle*6,candle*6+6).map(m=>[m[1],+m[2]]),['time','open','high','low','close','time_close'].map(f=>[f,3-candle]));
assert.match(s,/largerComplete := time == largerBucket/);
assert.match(s,/largerLiveH := math.max\(largerLiveH, high\)/);
assert.match(s,/largerLiveL := math.min\(largerLiveL, low\)/);
assert.match(s,/largerLiveC := close/);
assert.match(s,/timeframe.in_seconds\(requestedLargerTf\) > timeframe.in_seconds\(htf\)/);
const render=s.slice(s.indexOf('    int originCount ='),s.indexOf('            label.set_tooltip(heading'));
assert.match(render,/renderCount = originCount \+ followCount \+ endedCount \+ largerCount/);
assert.match(render,/box.delete\(array.pop\(clusterBodies\)\)/);
assert.match(render,/line.delete\(array.pop\(clusterWicks\)\)/);
assert.match(render,/label.delete\(array.pop\(clusterLabels\)\)/);
// Same hue for body, border and wick, retaining LAST's accepted opacity.
for(const setter of ['box.set_bgcolor(body, color.new(shade, archived ? 75 : 0))','box.set_border_color(body, color.new(shade, archived ? 65 : 0))','line.set_color(wick, color.new(shade, archived ? 70 : 25))'])assert.ok(render.includes(setter));
assert.match(render,/interHtfGap = math.max\(clusterOffset, labelLaneBars \+ 12\)/);
assert.match(render,/float bodyWidth = candleWidth/);
assert.match(render,/f_countdown\(group == 3 \? largerEnd : liveEnd, timenow\)/);
assert.match(render,/headingText = group == 0 \? f_tfName\(htf\) : group == 3 \? f_tfName\(largerTf\) : ""/);
// Display additions may not become hidden trading gates.
const signal=s.slice(s.indexOf('type FocusLifecycle'),s.indexOf('f_tfName('));
assert.doesNotMatch(signal,/largerLive|h[123][TOHLC]|showLargerCluster/);
console.log('PASS larger HTF confirmed source offsets, chart OHLC preview, distinct timeframes, display-only isolation, object cleanup, shared body/wick hue and caption/gap contracts. Native layout checked separately.');
