// Actual Pine scalar/provider bodies. Context/pivots are injected; this is not
// security/rollback emulation or an assertion of market performance.
const {createR1Harness}=require('./pine-r1-harness.cjs');
function createMpsHarness(source){
 const h=createR1Harness(source);
 const select=h.compile('f_mpsSelect',['pool','direction','p1At','p3At']);
 const key=h.compile('f_mpsKey',['ctx','c1Start','sweepSize']);
 const step=h.compile('f_stepMps',['ctx','state','candle']);
 const handoff=h.compile('f_mpsHandoff',['reaction','state','time']);
 const seedBody=h.compile('f_mpsSeed',['pool','ctx','aStart','aEnd','bStart','bEnd','windowStart','windowEnd','bar_index','history','f_mpsSelect','f_mpsKey','availableChartStart']);
 const seed=(bars,pool,ctx,aStart,aEnd,bStart,bEnd,windowStart,windowEnd,tick=1,options={})=>seedBody(pool,ctx,aStart,aEnd,bStart,bEnd,windowStart,windowEnd,(options.indexBase??0)+bars.length-1,(field,n)=>{options.onRead?.(field,n);if(options.strict&&n>=bars.length)throw Error('Read past loaded calculation history');return bars.at(-1-n)?.[{time:'start',time_close:'end',high:'h',low:'l',close:'c'}[field]]??null;},select,(context,start)=>key(context,start,tick),bars[0]?.start??null);
 const candle=b=>h.make('R1Bar',{start:b.start,finish:b.end,o:b.o,h:b.h,l:b.l,c:b.c,closed:true,eligible:true,bias:1,tick:1});
 return {...h,select,key,step,handoff,seed,candle};
}
module.exports={createMpsHarness};
