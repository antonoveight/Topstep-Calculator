const assert=require('node:assert/strict'),T=require('../assets/market-time.js'),Q=require('../assets/market-quarterly.js'),M=require('../assets/market-hours.js');
const as1=M.macros.find(m=>m.code==='AS1'),as2=M.macros.find(m=>m.code==='AS2');
assert.equal(M.macros.length,10);assert.equal(new Set(M.macros.map(m=>m.id)).size,10);
M.selectedTimezone='Asia/Bangkok';
for(const [date,first,second] of [
 ['2026-10-30T00:00:00Z',350,410],['2026-11-02T00:00:00Z',410,470],
 ['2026-11-01T06:30:00Z',350,410], // NY has already fallen back; this VN morning's macros happened before it.
 ['2026-03-08T08:00:00Z',410,470],['2026-03-09T00:00:00Z',350,410]
]){
 const a=M.calculateMacroIntervalsInTarget(as1,new Date(date)),b=M.calculateMacroIntervalsInTarget(as2,new Date(date));
 assert.deepEqual(a.intervals,[{start:first,end:first+20}]);assert.deepEqual(b.intervals,[{start:second,end:second+20}]);
 assert.equal(M.isMacroActiveAt(as1,first,new Date(date)),true);assert.equal(M.isMacroActiveAt(as1,first+20,new Date(date)),false);
}
for(const zone of ['America/New_York','Asia/Bangkok','Europe/London','UTC','Pacific/Kiritimati'])for(const date of ['2026-03-08T12:00:00Z','2026-11-01T12:00:00Z','2026-11-02T00:00:00Z'])for(const size of [360,90]){
 const intervals=Q.segments(size,zone,new Date(date)).flatMap(x=>x.intervals).sort((a,b)=>a.start-b.start);
 assert.equal(intervals[0].start,0);assert.equal(intervals.at(-1).end,1440);
 for(let i=1;i<intervals.length;i++)assert.equal(intervals[i-1].end,intervals[i].start,`${zone}/${date}/${size}: no gaps or overlaps`);
}
const at=ny=>T.wall({year:2026,month:11,day:2,hour:Number(ny.slice(0,2)),minute:Number(ny.slice(3,5)),second:Number(ny.slice(6,8)||0)},T.NY);
for(const [clock,d,n,m] of [['18:00:00',1,1,1],['18:22:29',1,1,1],['18:22:30',1,1,2],['18:45:00',1,1,3],['19:07:30',1,1,4],['19:30:00',1,2,1],['21:00:00',1,3,1],['22:30:00',1,4,1],['00:00:00',2,1,1],['06:00:00',3,1,1],['12:00:00',4,1,1]]){
 const s=Q.state(at(clock));assert.deepEqual([s.day.quarter,s.ninety.quarter,s.micro.quarter],[d,n,m],clock);
}
const state=Q.state(at('20:00:00'));
assert.equal(T.minute(state.trueOpens.day,T.NY),0);assert.equal(T.minute(state.trueOpens.session,T.NY),1170);assert.equal(T.minute(state.trueOpens.micro,T.NY),1192.5);
assert.equal(state.trueOpens.day.toISOString(),'2026-11-03T05:00:00.000Z','The daily true open belongs to this NY trading cycle, after midnight');
assert.equal(T.wall({year:2026,month:3,day:8,hour:2,minute:30},T.NY),null,'Nonexistent NY local time must not become a phantom macro');
const calls=[];M.pushEnabled=true;M.firePushNotification=(macro,before)=>calls.push([macro.code,before]);
M.checkMacroNotifications(new Date('2026-11-02T00:45:00Z'));M.checkMacroNotifications(new Date('2026-11-02T00:45:01Z'));M.checkMacroNotifications(new Date('2026-11-02T00:50:00Z'));M.checkMacroNotifications(new Date('2026-11-02T00:50:01Z'));
assert.deepEqual(calls,[['AS2',5],['AS2',0]],'Existing opt-in notification path includes AS2 without duplicate alerts');
console.log('PASS 10 macros; Asia DST and transition dates; exclusive endpoints; QT full-day coverage in five zones; 6h/90m/micro boundaries; true opens and deduplicated AS2 alerts');
