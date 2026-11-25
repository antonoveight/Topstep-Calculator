// Restricted execution of f_stepEarly plus the existing actual-source TS channel.
// No emulation of request.security, HTF map construction, rollback or chart drawing.
const {createHarness}=require('./pine-channel-harness.cjs');
function createEarlyHarness(source){
 const channel=createHarness(source),lines=source.split(/\r?\n/);
 function defaults(type){const at=lines.indexOf('type '+type),out={};if(at<0)throw Error(type);for(let i=at+1;i<lines.length&&/^\s/.test(lines[i]);i++){const m=lines[i].trim().match(/^\w+ (\w+) = (.+)$/);if(m)out[m[1]]=m[2]==='na'?null:JSON.parse(m[2]);}return out;}
 const make=(type,args={})=>{const value={...defaults(type),...args};if(type==='CrtKey')Object.defineProperty(value,'copy',{value:()=>make('CrtKey',value)});return value;};
 function expr(s){
  for(const type of ['EarlyResult','CrtKey','ReactionState','SignalContext','MpsState','MpsResult'])s=s.replace(new RegExp(type+'\\.new\\(([^\\n]*?)\\)','g'),(_,args)=>`make('${type}',{${args.replace(/\b(\w+)=/g,'$1:')}})`);
  return s.replace(/, knownHighAt=([^,]+), knownLowAt=([^\)]+)\)/g,', false, true, $1, $2)').replace(/close\[1\]/g,'previousClose').replace(/\band\b/g,'&&').replace(/\bor\b/g,'||').replace(/\bnot\b/g,'!').replace(/\bna\b(?!\s*\()/g,'null');
 }
 const at=lines.findIndex(l=>l.startsWith('f_stepEarly('));let end=at+1;while(end<lines.length&&(!lines[end].trim()||/^\s/.test(lines[end])))end++;
 const body=lines.slice(at+1,end).filter(l=>l.trim()&&!l.trim().startsWith('//'));let code='',blocks=[];
 for(let i=0;i<body.length;i++){
  const indent=body[i].match(/^\s*/)[0].length;let s=body[i].trim();
  while(blocks.length&&indent<=blocks.at(-1)){code+='}\n';blocks.pop();}
  if(s.startsWith('if ')){code+='if('+expr(s.slice(3))+'){\n';blocks.push(indent);continue;}
  if(s.startsWith('else if ')){code+='else if('+expr(s.slice(8))+'){\n';blocks.push(indent);continue;}
  if(s==='else'){code+='else {\n';blocks.push(indent);continue;}
  if(i===body.length-1&&s==='result'){code+='return result;\n';continue;}
  s=s.replace(/^(?:EarlyResult|CrtKey|ReactionState|SignalContext|ChannelResult|MpsState|MpsResult|bool|int|float|string) (\w+) = /,'let $1 = ').replace(/:=/g,'=');code+=expr(s)+';\n';
 }
 while(blocks.length){code+='}\n';blocks.pop();}
 const run=Function('requireMps','r1Swings','r1Bar','f_mpsSeed','f_stepMps','r1Mode','enableEarlyC2','isLtf','barstate','time','time_close','open','high','low','close','sweepSize','biasDir','allowCrtCounter','math','na','make','f_stepChannel','ref','state','buyKey','sellKey','buyWave','sellWave','confirmedHit','entryBranches','lastPivotHigh','lastPivotLow','lastPivotHighTime','lastPivotLowTime','bar_index','previousClose','f_executionKey','f_executionProofValid',code);
 return {make,state:()=>make('EarlyState'),step(ref,state,tape,options={}){
  const hooks=channel.keyHooks({},tape,{...options,sweepSize:options.tick??.25,localKeys:options.localKeys??[options.buyKey,options.sellKey].filter(Boolean)});
  const b=tape.at(-1),stepChannel=(ctx,cs,kh,kl,ph,pl,wave,forcePullback,mpsAllowed,khAt,klAt)=>channel.step(ctx,cs,tape,{...options,knownHigh:kh,knownLow:kl,knownHighAt:khAt,knownLowAt:klAt,forcePullback,mpsAllowed,waveAllowed:wave,sweepSize:options.tick??.25});
  return run(options.requireMps===true,options.pool??[],options.r1Bar??{},options.mpsSeed??(()=>{throw Error("Missing MPS seed provider");}),options.mpsStep??(()=>{throw Error("Missing MPS step provider");}),options.r1Mode===true,options.enabled!==false,options.isLtf!==false,{isconfirmed:options.confirmed!==false},b.t,b.tc??b.t+1,b.o,b.h,b.l,b.c,options.tick??.25,options.bias??1,options.allowCrtCounter!==false,Math,x=>x==null||Number.isNaN(x),make,stepChannel,ref,state,options.buyKey??make('CrtKey'),options.sellKey??make('CrtKey'),options.buyWave!==false,options.sellWave!==false,options.confirmedHit===true,options.branches||'TS + FVG + OTE',[null,null],[null,null],[null,null],[null,null],tape.length-1,tape.at(-2)?.c??null,hooks.lookup,hooks.valid);
 }};
}
module.exports={createEarlyHarness};
