// Test-only execution of the restricted scalar/object statements in f_stepChannel.
// Not a Pine compiler/runtime: request.security, ta.pivots, rollback and drawing APIs
// are NOT emulated. Confirmed pivots and HTF contexts are explicit fixture inputs.
function createHarness(source){
 const keySettings={sweepSize:.01,keyTypes:'All'};
 const keyAdapter=require('./pine-crt-key-harness.cjs').createKeyHarness(source,keySettings);
 function keyHooks(ctx,tape,options={}){
  keySettings.sweepSize=options.sweepSize??.01;keySettings.keyTypes=options.keyTypes||'All';
  const normalize=key=>keyAdapter.makeKey({...key,tf:key.tf||'60'});
  const refs=options.localKeys??(ctx.crtKey?[ctx.crtKey]:[]);
  const maps=options.executionMaps??[{levels:refs.filter(Boolean).map(normalize)},...Array.from({length:3},()=>({levels:[]}))];
  return {forward:(d,t,o,target)=>keyAdapter.forwardKey(maps,d,t,o,target),lookup:(d,t,h,l,c)=>keyAdapter.executionKey(maps,d,t,h,l,c),valid:(key,at)=>keyAdapter.executionProof(maps,key,at,options.htf||'60',options.largerTf||'240',options.biasTf||'1D')};
 }
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
 const environment=['barstate','isLtf','time','bar_index','open','high','low','close','history','na','signalCadence','pivotLength','tolerance','entryMode','signalTiming','filterBias','allowCrtCounter','biasDir','timeAllowed','f_clearReaction','makeResult'];
 environment.push('time_close','requireKey','entryBranches','f_has','math');
 environment.push('sweepSize');
 environment.push('f_obDisplacement');
 environment.push('f_executionKey','f_executionProofValid','f_keyReact','f_forwardKey','structureBarReady','structureClosing','structurePriorClose','structureBeforeClose','structureClosedAt');
 const displacementBody=source.includes('f_obDisplacement(')?body('f_obDisplacement').map((l,i,a)=>i===a.length-1?'return '+expr(l.trim())+';':expr(l.trim().replace(/^float /,'let '))+';').join('\n'):'return false;';
 const displacement=Function('direction','opening','barHigh','barLow','closing',displacementBody);
 const stepWithSweep=Function(...environment,'ctx','state','knownHigh','knownLow','pivotHigh','pivotLow','waveAllowed','forcePullback','mpsAllowed','knownHighAt','knownLowAt',translate('f_stepChannel'));
 return {
  keyHooks,
  state(ctx){return {...defaults('ReactionState'),key:String(ctx.id),activatedAt:ctx.confirmed,phaseAt:ctx.kind===2?null:ctx.confirmed,mssLevel:null};},
  step(ctx,state,tape,options={}){
   const b=tape.at(-1),keys={open:'o',high:'h',low:'l',close:'c',time:'t'};
   const history=(field,n)=>{const prior=tape.at(-1-n);return prior?prior[keys[field]]:null;};
   const env=[{isconfirmed:options.confirmed!==false},options.isLtf!==false,b.t,tape.length-1,b.o,b.h,b.l,b.c,history,x=>x==null||Number.isNaN(x),options.cadence||'Fresh reaction',2,.01,options.entryMode||'Auto',options.timing||'Pullback',true,options.allowCrtCounter!==false,options.bias??ctx.dir,options.timeAllowed!==false,clear,args=>({...defaults('ChannelResult'),...args})];
   env.push(b.end??b.t+1,options.requireKey!==false,options.branches||'TS + FVG + OTE',(flags,bit)=>Math.floor(flags/bit)%2===1,Math);
   const hooks=keyHooks(ctx,tape,options);
   return stepWithSweep(...env,options.sweepSize??.01,displacement,hooks.lookup,hooks.valid,keyAdapter.reaction,hooks.forward,options.structureReady!==false,options.structureClose??b.c,options.structurePrior??tape.at(-2)?.c??null,options.structureBefore??tape.at(-2)?.c??null,options.structureEnd??b.end??b.t+1,{age:0,irlKind:0,...ctx},state,options.knownHigh??null,options.knownLow??null,options.pivotHigh??null,options.pivotLow??null,options.waveAllowed!==false,options.forcePullback===true,options.mpsAllowed!==false,options.knownHighAt??null,options.knownLowAt??null);
  }
 };
}
module.exports={createHarness};
