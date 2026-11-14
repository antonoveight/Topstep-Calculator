// Small source-body adapter for the pure key matching/collection functions only.
function createKeyHarness(source){
 const lines=source.split(/\r?\n/),na=x=>x==null||Number.isNaN(x);
 const makeKey=args=>{const k={kind:0,dir:0,hi:null,lo:null,born:null,knownAt:null,beforeTime:null,tf:'',...args};Object.defineProperty(k,'copy',{value:()=>makeKey(k)});return k;};
 const array={size:a=>a.length,get:(a,i)=>a[i],push:(a,k)=>a.push(k),new:()=>[],includes:(a,k)=>a.includes(k),shift:a=>a.shift()};
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
 function expr(s){return calls(s).replace(/\band\b/g,'&&').replace(/\bor\b/g,'||').replace(/\bnot\b/g,'!').replace(/\bna\b(?!\s*\()/g,'null');}
 function translate(name,returnLast=true){const input=body(name);let code='',blocks=[];
  for(let i=0;i<input.length;i++){
   const raw=input[i],indent=raw.match(/^\s*/)[0].length;let s=raw.trim();
   while(blocks.length&&indent<=blocks.at(-1)){code+='}\n';blocks.pop();}
   if(s.startsWith('if ')){code+='if('+expr(s.slice(3))+'){\n';blocks.push(indent);continue;}
   if(s.startsWith('while ')){code+='while('+expr(s.slice(6))+'){\n';blocks.push(indent);continue;}
   const loop=s.match(/^for (\w+) = (.+) to (.+?)(?: by (\d+))?$/);
   if(loop){code+=`for(let ${loop[1]}=${expr(loop[2])};${loop[1]}<=${expr(loop[3])};${loop[1]}+=${loop[4]||1}){\n`;blocks.push(indent);continue;}
   s=s.replace('array.new<CrtKey>()','array.new()').replace(/^(?:array<CrtKey>|CrtKey|Zone|Liquidity|bool|int|string) (\w+) = /,'let $1 = ').replace(/:=/g,'=');
   code+=(returnLast&&i===input.length-1?'return ':'')+expr(s)+';\n';
  }
  while(blocks.length){code+='}\n';blocks.pop();}return code;
 }
 const react=Function('na','sweepSize','k','beforeTime','direction','barHigh','barLow','barClose',translate('f_keyReact'));
 const reaction=(k,t,d,h,l,c)=>react(na,.25,k,t,d,h,l,c);
 const find=Function('array','makeKey','f_keyReact','zones','swings','beforeTime','direction','barHigh','barLow','barClose','sourceTf',translate('f_findCrtKey'));
 const identity=Function('str','key','return '+body('f_keyIdentity')[0].trim());
 const identify=k=>identity({tostring:String},k);
 const match=Function('array','makeKey','f_keyReact','f_keyIdentity','keyMap','usedKeys','beforeTime','direction','barHigh','barLow','barClose',translate('f_matchKeyMap'));
 const mark=Function('array','f_keyIdentity','keyMap','usedKeys','barStart','barHigh','barLow',translate('f_markHigherUsed',false));
 const collect=Function('array','makeKey','zones','swings','sourceTf',translate('f_collectKeyMap'));
 return {reaction,find:(z,q,t,d,h,l,c,tf='60')=>find(array,makeKey,reaction,z,q,t,d,h,l,c,tf),match:(m,t,d,h,l,c,used=[])=>match(array,makeKey,reaction,identify,m,used,t,d,h,l,c),mark:(m,used,t,h,l)=>mark(array,identify,m,used,t,h,l),collect:(z,q,tf='1D')=>collect(array,makeKey,z,q,tf),makeKey};
}
module.exports={createKeyHarness};
