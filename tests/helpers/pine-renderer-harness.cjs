// Execute the actual display assembly; this is not a TradingView runtime.
function createRendererHarness(source){
 const begin=source.indexOf('    array<ClockCandle> mainVisual ='),end=source.indexOf('    int countMain =',begin);
 if(begin<0||end<0)throw Error('Missing renderer assembly');
 const h=require('./pine-clock-harness.cjs').createClockHarness(source+'\nf_assembleVisual() =>\n'+source.slice(begin,end)+'    array.from(mainVisual, archiveVisual, largerVisual)\n');
 const put=h.compile('f_putVisual',['candles','item','afterTime']);
 const defaults={showCluster:true,rangeAvailable:false,mainPreview:null,showArchive:false,visibleArchive:null,showLargerCluster:false,largerPreview:null,clusterFollowCount:6,liveComplete:false,largerComplete:false};
 for(const prefix of ['sA','sB','sC'])for(const field of ['T','End','O','H','L','C'])defaults[prefix+field]=null;
 for(const field of ['liveT','liveEnd','liveO','liveH','liveL','liveC','largerLiveT','largerEnd','largerLiveO','largerLiveH','largerLiveL','largerLiveC'])defaults[field]=null;
 for(const field of ['candleTimes','candleEndTimes','candleOpens','candleHighs','candleLows','candleCloses'])defaults[field]=[];
 const names=Object.keys(defaults),raw=h.compile('f_assembleVisual',names,{f_putVisual:(a,b,c=null)=>put(a,b,c)});
 function assemble(config={}){const values={...defaults,...config};const [main,archive,larger]=raw(...names.map(n=>values[n]));return {main,archive,larger};}
 function scene({root=[],cache=[],live=null,frame=null,...settings}={}){
  const config={...settings,rangeAvailable:root.length>0,mainPreview:frame};
  root.forEach((c,i)=>{for(const [key,value]of Object.entries(c))config['s'+['A','B','C'][i]+({t:'T',e:'End',o:'O',h:'H',l:'L',c:'C'})[key]]=value;});
  for(const [suffix,field]of [['Times','t'],['EndTimes','e'],['Opens','o'],['Highs','h'],['Lows','l'],['Closes','c']])config['candle'+suffix]=cache.map(c=>c[field]);
  if(live){config.liveComplete=true;for(const [field,suffix]of Object.entries({t:'T',e:'End',o:'O',h:'H',l:'L',c:'C'}))config['live'+suffix]=live[field];}
  return assemble(config);
 }
 return {assemble,scene,candle:h.candle};
}
module.exports={createRendererHarness};
