// Restricted source-body evaluator for cluster assembly only; no drawing/runtime emulation.
function createClusterHarness(source){
 const array={new:()=>[],size:a=>a.length,get:(a,i)=>a[i],push:(a,x)=>a.push(x),insert:(a,i,x)=>a.splice(i,0,x)};
 const ClusterCandle={new:(t,o,h,l,c)=>({t,o,h,l,c})};
 function translate(lines){
  let code='',blocks=[];
  for(const raw of lines){
   if(!raw.trim()||raw.trim().startsWith('//'))continue;
   const indent=raw.match(/^\s*/)[0].length;let line=raw.trim();
   while(blocks.length&&indent<=blocks.at(-1)){code+='}\n';blocks.pop();}
   const expr=s=>s.replace(/\band\b/g,'&&').replace(/\bor\b/g,'||').replace(/\bnot\b/g,'!');
   if(line.startsWith('if ')){code+='if('+expr(line.slice(3))+'){\n';blocks.push(indent);continue;}
   const loop=line.match(/^for (\w+) = (.+) to (.+)$/);
   if(loop){code+=`for(let ${loop[1]}=${expr(loop[2])};${loop[1]}<=${expr(loop[3])};${loop[1]}++){\n`;blocks.push(indent);continue;}
   line=line.replace(/array.new<ClusterCandle>\(\)/g,'array.new()').replace(/^(?:array<ClusterCandle>|int|bool|float) (\w+) = /,'let $1 = ').replace(/:=/g,'=');
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
 return {assemble:ctx=>run(array,ClusterCandle,put,...names.map(n=>ctx[n])),insert:put};
}
module.exports={createClusterHarness};
