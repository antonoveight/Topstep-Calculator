// Execute the actual restricted lifecycle and focus bodies, not a second model engine.
function createFocusHarness(source){
 const lines=source.split(/\r?\n/),na=x=>x==null||Number.isNaN(x);
 const expr=s=>s.replace(/\band\b/g,'&&').replace(/\bor\b/g,'||').replace(/\bnot\b/g,'!').replace(/\bna\b(?!\s*\()/g,'null');
 function body(name){const at=lines.findIndex(l=>l.startsWith(name+'('));if(at<0)throw Error(name);let end=at+1;while(end<lines.length&&(!lines[end].trim()||/^\s/.test(lines[end])))end++;return lines.slice(at+1,end).filter(l=>l.trim()&&!l.trim().startsWith('//'));}
 function translate(name){const input=body(name);let code='',blocks=[];
  for(let i=0;i<input.length;i++){
   const indent=input[i].match(/^\s*/)[0].length;let s=input[i].trim();while(blocks.length&&indent<=blocks.at(-1)){code+='}\n';blocks.pop();}
   if(s.startsWith('if ')){code+='if('+expr(s.slice(3))+'){\n';blocks.push(indent);continue;}
   s=s.replace(/^(?:int|bool) (\w+) = /,'let $1 = ').replace(/:=/g,'=');code+=(i===input.length-1?'return ':'')+expr(s)+';\n';
  }while(blocks.length){code+='}\n';blocks.pop();}return code;
 }
 const end=Function('direction','invalidation','targetLevel','barHigh','barLow','closing','older','outsideHistory','timedOut','entryExpired',translate('f_crtEnd'));
 const step=Function('na','f_crtEnd','state','uid','direction','confirmedAt','invalidation','targetLevel','age','barOpen','barClose','barHigh','barLow','closedBar',translate('f_stepFocus'));
 const archive=Function('na','localArchive','htfArchive',translate('f_visibleArchive'));
 return {end,step:(state,args)=>step(na,end,state,...args),archive:(local,htf)=>archive(na,local,htf),state:()=>({uid:null,reason:0,endedAt:null,archived:null})};
}
module.exports={createFocusHarness};
