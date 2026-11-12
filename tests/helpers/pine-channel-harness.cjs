// Test-only execution of the restricted scalar/object statements in f_stepChannel.
// Not a Pine compiler/runtime: request.security, ta.pivots, rollback and drawing APIs
// are NOT emulated. Confirmed pivots and HTF contexts are explicit fixture inputs.
function createHarness(source){
 function body(name){const lines=source.split(/\r?\n/),at=lines.findIndex(l=>l.startsWith(name+'('));if(at<0)throw Error('Missing '+name);let end=at+1;while(end<lines.length&&(!lines[end].trim()||/^\s/.test(lines[end])))end++;return lines.slice(at+1,end).filter(l=>l.trim()&&!l.trim().startsWith('//'));}
 function defaults(name){const lines=source.split(/\r?\n/),at=lines.indexOf('type '+name),out={};for(let i=at+1;i<lines.length&&/^\s/.test(lines[i]);i++){const m=lines[i].trim().match(/^\w+ (\w+) = (.+)$/);if(m)out[m[1]]=m[2]==='na'?null:JSON.parse(m[2]);}return out;}
 function expr(s){return s.replace(/\b(open|high|low|close|time)\[([^\]]+)\]/g,(_,field,n)=>`history('${field}',${n})`).replace(/\band\b/g,'&&').replace(/\bor\b/g,'||').replace(/\bnot\b/g,'!').replace(/\bna\b(?!\s*\()/g,'null').replace(/ChannelResult\.new\(([^\n]+)\)/g,(_,args)=>'makeResult({'+args.replace(/\b(\w+)=/g,'$1:')+'})');}
 function translate(name){
  const original=body(name),lines=[];
  for(let i=0;i<original.length;i++){
   const line=original[i],m=line.trim().match(/^bool (\w+) = switch (\w+)$/);
   if(!m){lines.push(line);continue;}
   const indent=line.match(/^\s*/)[0],parts=[];let fallback='false';
   while(i+1<original.length&&original[i+1].match(/^\s*/)[0].length>indent.length){const branch=original[++i].trim().match(/^(?:("[^"]+") )?=> (.+)$/);if(!branch)throw Error('Unsupported switch');if(branch[1])parts.push(m[2]+' === '+branch[1]+' ? '+branch[2]+' : ');else fallback=branch[2];}
   lines.push(indent+'bool '+m[1]+' = '+parts.join('')+fallback);
  }
  let out='',blocks=[];
  for(let i=0;i<lines.length;i++){
   const raw=lines[i],indent=raw.match(/^\s*/)[0].length;let line=raw.trim();
   while(blocks.length&&indent<=blocks.at(-1)){out+='}\n';blocks.pop();}
   if(/^if /.test(line)){out+='if ('+expr(line.slice(3))+') {\n';blocks.push(indent);continue;}
   if(/^else if /.test(line)){out+='else if ('+expr(line.slice(8))+') {\n';blocks.push(indent);continue;}
   if(line==='else'){out+='else {\n';blocks.push(indent);continue;}
   if(name==='f_stepChannel'&&i===lines.length-1&&line==='result'){out+='return result;\n';continue;}
   line=line.replace(/^(?:bool|int|float|string|ChannelResult) (\w+) = /,'let $1 = ').replace(/:=/g,'=');
   out+=expr(line)+';\n';
  }
  while(blocks.length){out+='}\n';blocks.pop();}return out;
 }
 const clear=Function('state','phaseAt','seedPivot','keepRun',translate('f_clearReaction'));
 const environment=['barstate','isLtf','time','bar_index','open','high','low','close','history','na','signalCadence','pivotLength','tolerance','entryMode','filterBias','biasDir','timeAllowed','f_clearReaction','makeResult'];
 const step=Function(...environment,'ctx','state','knownHigh','knownLow','pivotHigh','pivotLow',translate('f_stepChannel'));
 return {
  state(ctx){return {...defaults('ReactionState'),key:String(ctx.id),activatedAt:ctx.confirmed,phaseAt:ctx.kind===2?null:ctx.confirmed,mssLevel:null};},
  step(ctx,state,tape,options={}){
   const b=tape.at(-1),keys={open:'o',high:'h',low:'l',close:'c',time:'t'};
   const history=(field,n)=>{const prior=tape.at(-1-n);return prior?prior[keys[field]]:null;};
   const env=[{isconfirmed:options.confirmed!==false},options.isLtf!==false,b.t,tape.length-1,b.o,b.h,b.l,b.c,history,x=>x==null||Number.isNaN(x),options.cadence||'Fresh reaction',2,.01,options.entryMode||'Auto',true,options.bias??ctx.dir,options.timeAllowed!==false,clear,args=>({...defaults('ChannelResult'),...args})];
   return step(...env,ctx,state,options.knownHigh??null,options.knownLow??null,options.pivotHigh??null,options.pivotLow??null);
  }
 };
}
module.exports={createHarness};
