// Restricted source-body evaluator for cluster/IRL assembly; no drawing/runtime emulation.
function createClusterHarness(source){
 const array={new:()=>[],size:a=>a.length,get:(a,i)=>a[i],push:(a,x)=>a.push(x),insert:(a,i,x)=>a.splice(i,0,x)};
 const ClusterCandle={new:(t,o,h,l,c)=>({t,o,h,l,c})};
 function translate(lines){
  let code='',blocks=[];
  for(const raw of lines){
   if(!raw.trim()||raw.trim().startsWith('//'))continue;
   const indent=raw.match(/^\s*/)[0].length;let line=raw.trim();
   while(blocks.length&&indent<=blocks.at(-1)){code+='}\n';blocks.pop();}
   const expr=s=>s.replace(/\band\b/g,'&&').replace(/\bor\b/g,'||').replace(/\bnot\b/g,'!').replace(/\bna\b(?!\s*\()/g,'null');
   if(line.startsWith('if ')){code+='if('+expr(line.slice(3))+'){\n';blocks.push(indent);continue;}
   if(line==='else'){code+='else {\n';blocks.push(indent);continue;}
   const loop=line.match(/^for (\w+) = (.+) to (.+)$/);
   if(loop){code+=`for(let ${loop[1]}=${expr(loop[2])};${loop[1]}<=${expr(loop[3])};${loop[1]}++){\n`;blocks.push(indent);continue;}
   line=line.replace(/array.new<ClusterCandle>\(\)/g,'array.new()').replace(/^(?:array<ClusterCandle>|int|bool|float|Zone|Liquidity) (\w+) = /,'let $1 = ').replace(/:=/g,'=');
   code+=expr(line)+';\n';
  }
  while(blocks.length){code+='}\n';blocks.pop();}return code;
 }
 const lines=source.split(/\r?\n/),at=lines.findIndex(l=>l.startsWith('f_insertCluster('));let end=at+1;
 while(end<lines.length&&(!lines[end].trim()||/^\s/.test(lines[end])))end++;
 const insert=Function('array','ClusterCandle','na','candles','t','o','h','l','c',translate(lines.slice(at+1,end)));
 const start=lines.findIndex(l=>l.trim()==='array<ClusterCandle> clusterCandles = array.new<ClusterCandle>()');
 const stop=lines.findIndex((l,i)=>i>start&&l.trim().startsWith('int clusterCount ='));
 const body=translate(lines.slice(start,stop))+'return clusterCandles;';
 const names=['showCluster','clusterActive','candleTimes','candleOpens','candleHighs','candleLows','candleCloses','sAT','sAO','sAH','sAL','sAC','sBT','sBO','sBH','sBL','sBC','sCT','sCO','sCH','sCL','sCC','liveComplete','liveT','liveO','liveH','liveL','liveC'];
 const run=Function('array','ClusterCandle','f_insertCluster',...names,body);
 const put=(...args)=>insert(array,ClusterCandle,x=>x==null,...args);
 const irlStart=lines.findIndex(l=>l.startsWith('f_refreshIrl('));let irlEnd=irlStart+1;
 while(irlEnd<lines.length&&(!lines[irlEnd].trim()||/^\s/.test(lines[irlEnd])))irlEnd++;
 const refresh=Function('array','na','m','zones','swings',translate(lines.slice(irlStart+1,irlEnd))+'return m;');
 const biasStart=lines.findIndex(l=>l.startsWith('f_biasStep('));let biasEnd=biasStart+1;
 while(biasEnd<lines.length&&(!lines[biasEnd].trim()||/^\s/.test(lines[biasEnd])))biasEnd++;
 const bias=Function('na','math','state','ph','pl','closing','priorClose',translate(lines.slice(biasStart+1,biasEnd))+'return state;');
 return {assemble:ctx=>run(array,ClusterCandle,put,...names.map(n=>ctx[n])),insert:put,refreshIrl:(m,zones,swings)=>refresh(array,x=>x==null,m,zones,swings),biasStep:(state,ph,pl,closing,priorClose)=>bias(x=>x==null,{min:Math.min,max:Math.max},state,ph,pl,closing,priorClose)};
}
module.exports={createClusterHarness};
