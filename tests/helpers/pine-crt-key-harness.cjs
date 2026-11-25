// Small source-body adapter for the pure key matching/collection functions only.
function createKeyHarness(source,settings={}){
 const lines=source.split(/\r?\n/),na=x=>x==null||Number.isNaN(x);
 const makeKey=args=>{const k={kind:0,dir:0,hi:null,lo:null,born:null,knownAt:null,beforeTime:null,tf:'',...args};Object.defineProperty(k,'copy',{value:()=>makeKey(k)});return k;};
 const array={size:a=>a.length,get:(a,i)=>a[i],push:(a,k)=>a.push(k),new:()=>[],includes:(a,k)=>a.includes(k),shift:a=>a.shift(),remove:(a,i)=>a.splice(i,1)};
 function body(name){const at=lines.findIndex(l=>l.startsWith(name+'('));let end=at+1;while(end<lines.length&&(!lines[end].trim()||/^\s/.test(lines[end])))end++;return lines.slice(at+1,end).filter(l=>l.trim()&&!l.trim().startsWith('//'));}
 function calls(s){
  for(const name of ['CrtKey.new','KeyMap.new']){
   let start;
   while((start=s.indexOf(name+'('))>=0){
    let end=start+name.length+1,depth=1,quoted=false;
    for(;end<s.length;end++){const c=s[end];if(c==='"'&&s[end-1]!=='\\')quoted=!quoted;if(!quoted){if(c==='(')depth++;if(c===')'&&!--depth)break;}}
    let args=s.slice(start+name.length+1,end),replacement;
    if(name==='CrtKey.new')replacement='makeKey({'+args.replace(/\b(\w+)=/g,'$1:')+'})';else replacement='({levels:'+args+'})';
    s=s.slice(0,start)+replacement+s.slice(end+1);
   }
  }
  return s;
 }
 function expr(s){return calls(s).replace(/\bint\(/g,'Math.trunc(').replace(/\b(open|high|low|close|time)\[([^\]]+)\]/g,(_,f,n)=>`history('${f}',${n})`).replace(/\band\b/g,'&&').replace(/\bor\b/g,'||').replace(/\bnot\b/g,'!').replace(/\bna\b(?!\s*\()/g,'null');}
 function translate(name,returnLast=true){const input=body(name);let code='',blocks=[];
  for(let i=0;i<input.length;i++){
   const raw=input[i],indent=raw.match(/^\s*/)[0].length;let s=raw.trim();
   while(blocks.length&&indent<=blocks.at(-1)){code+='}\n';blocks.pop();}
   if(s.startsWith('if ')){code+='if('+expr(s.slice(3))+'){\n';blocks.push(indent);continue;}
   if(s.startsWith('while ')){code+='while('+expr(s.slice(6))+'){\n';blocks.push(indent);continue;}
   const each=s.match(/^for (\w+) in (.+)$/);
   if(each){code+=`for(const ${each[1]} of ${expr(each[2])}){\n`;blocks.push(indent);continue;}
   const loop=s.match(/^for (\w+) = (.+) to (.+?)(?: by (\d+))?$/);
   if(loop){code+=`for(let ${loop[1]}=${expr(loop[2])};${loop[1]}<=${expr(loop[3])};${loop[1]}+=${loop[4]||1}){\n`;blocks.push(indent);continue;}
   s=s.replace('array.new<CrtKey>()','array.new()').replace(/^(?:array<CrtKey>|CrtKey|KeyMap|Zone|Liquidity|bool|int|float|string) (\w+) = /,'let $1 = ').replace(/:=/g,'=');
   code+=(returnLast&&i===input.length-1?'return ':'')+expr(s)+';\n';
  }
  while(blocks.length){code+='}\n';blocks.pop();}return code;
 }
 const weekly=Function('array','makeKey','math','na','sweepSize','opening','barHigh','barLow','closing','openedAt','closedAt',translate('f_weeklyWickMap'));
 const react=Function('na','sweepSize','keyTypes','k','beforeTime','direction','barHigh','barLow','barClose',translate('f_keyReact'));
 const reaction=(k,t,d,h,l,c,types=settings.keyTypes||'All')=>react(na,settings.sweepSize??.25,types,k,t,d,h,l,c);
 const find=Function('array','makeKey','f_keyReact','zones','swings','beforeTime','direction','barHigh','barLow','barClose','sourceTf',translate('f_findCrtKey'));
 const identity=Function('str','key','return '+body('f_keyIdentity')[0].trim());
 const identify=k=>identity({tostring:String},k);
 const match=Function('array','makeKey','f_keyReact','f_keyIdentity','keyMap','usedKeys','beforeTime','direction','barHigh','barLow','barClose',translate('f_matchKeyMap'));
 const mark=Function('array','f_keyIdentity','keyMap','usedKeys','barStart','barHigh','barLow',translate('f_markHigherUsed',false));
 const collect=Function('array','makeKey','zones','swings','sourceTf',translate('f_collectKeyMap'));
 const parent=Function('array','makeKey','na','f_keyIdentity','swings','higherMap','consumed','beforeTime','sourceTf',translate('f_parentKeys'));
 const rangeReact=Function('array','makeKey','na','f_keyReact','references','beforeTime','direction','raidHigh','raidLow','closing',translate('f_rangeReaction'));
 const rangeReaction=(refs,t,d,h,l,c)=>rangeReact(array,makeKey,na,reaction,refs,t,d,h,l,c);
 const execution=Function('makeKey','f_rangeReaction','executionH1','executionMain','executionLarger','executionBias','direction','knownBefore','peakHigh','peakLow','reclaimClose',translate('f_executionKey'));
 const nextBarrier=Function('array','makeKey','na','sweepSize','keyTypes','references','beforeTime','direction','origin','targetLevel',translate('f_nextBarrier'));
 const pickBarrier=(refs,t,d,o,target)=>nextBarrier(array,makeKey,na,settings.sweepSize??.25,settings.keyTypes||'All',refs,t,d,o,target);
 const forward=Function('f_nextBarrier','executionH1','executionMain','executionLarger','executionBias','direction','beforeTime','origin','targetLevel',translate('f_forwardKey'));
 const proof=Function('na','key','reactedAt','sourceClose','sourceEnd',translate('f_keyProofValid'));
 const proofValid=(key,at,closing,end)=>proof(na,key,at,closing,end);
 const liveProof=Function('na','f_keyProofValid','executionH1','executionMain','executionLarger','executionBias','htf','largerTf','biasTf','key','reactedAt',translate('f_executionProofValid'));
 const renew=Function('makeKey','na','sweepSize','f_rangeReaction','m','opening','barHigh','barLow','closing','barTime','barEnd','currentIndex',translate('f_revalidateRange'));
 const push=Function('array','makeKey','time_close','zones','kind','direction','hi','lo','left','sourceTf',translate('f_pushKey',false));
 const zone=Function('array','makeKey','na','history','timeframe','time','time_close','open','high','low','close','f_pushKey','zones','sourceTf',translate('f_zoneKeys'));
 function zoneStep(zones,tape,tfSeconds=3600){const b=tape.at(-1),names={open:'o',high:'h',low:'l',close:'c',time:'t'},history=(f,n)=>tape.at(-1-n)?.[names[f]]??null;return zone(array,makeKey,na,history,{in_seconds:()=>tfSeconds},b.t,b.end??b.t+1,b.o,b.h,b.l,b.c,(...args)=>push(array,makeKey,b.end??b.t+1,...args),zones,String(tfSeconds/60));}
 return {weekly:(o,h,l,c,t,end)=>weekly(array,makeKey,Math,na,settings.sweepSize??.25,o,h,l,c,t,end),reaction,zoneStep,proofValid,forwardKey:(maps,d,t,o,target)=>forward(pickBarrier,...maps,d,t,o,target),executionKey:(maps,d,t,h,l,c)=>execution(makeKey,rangeReaction,...maps,d,t,h,l,c),executionProof:(maps,key,at,tf='60',large='240',bias='1D')=>liveProof(na,proofValid,...maps,tf,large,bias,key,at),find:(z,q,t,d,h,l,c,tf='60')=>find(array,makeKey,reaction,z,q,t,d,h,l,c,tf),match:(m,t,d,h,l,c,used=[])=>match(array,makeKey,reaction,identify,m,used,t,d,h,l,c),mark:(m,used,t,h,l)=>mark(array,identify,m,used,t,h,l),collect:(z,q,tf='1D')=>collect(array,makeKey,z,q,tf),makeKey,parent:(q,h,used,t,tf='60')=>parent(array,makeKey,na,identify,q,h,used,t,tf),rangeReaction,renew:(m,b,i)=>renew(makeKey,na,.25,rangeReaction,m,b.o,b.h,b.l,b.c,b.t,b.end,i)};
}
module.exports={createKeyHarness};
