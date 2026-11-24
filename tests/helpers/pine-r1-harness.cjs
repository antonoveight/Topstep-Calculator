// Restricted actual-source execution, not a Pine runtime. Tests inject closed
// OHLC, confirmed pivots/context and clocks; security/rollback are not emulated.
function createR1Harness(source){
 const lines=source.split(/\r?\n/),na=x=>x==null||Number.isNaN(x);
 function defaults(type){const at=lines.indexOf('type '+type);if(at<0)throw Error(type);const out={};for(let i=at+1;i<lines.length&&/^\s/.test(lines[i]);i++){const m=lines[i].trim().match(/^\w+ (\w+) = (.+)$/);if(m)out[m[1]]=m[2]==='na'?null:JSON.parse(m[2]);}return out;}
 function make(type,args={}){const out={...defaults(type),...args};Object.defineProperty(out,'copy',{value:()=>make(type,out)});return out;}
 const arr={size:a=>a.length,get:(a,i)=>a[i],push:(a,v)=>a.push(v),shift:a=>a.shift()};
 function expr(s){
  const ctor=/\b(ChannelResult|R1Swing|R1State|MpsState|MpsResult)\.new\(/;let m;
  while((m=s.match(ctor))){let i=m.index+m[0].length,depth=1,j=i;for(;j<s.length&&depth;j++){if(s[j]==='(')depth++;if(s[j]===')')depth--;}if(depth)throw Error('Unbalanced constructor');const args=s.slice(i,j-1).replace(/\b(\w+)=/g,'$1:');s=s.slice(0,m.index)+`make('${m[1]}',{${args}})`+s.slice(j);}
  return s.replace(/\b(time_close|time|high|low|close)\[([^\]]+)\]/g,(_,field,n)=>`history('${field}',${n})`).replace(/\barray\./g,'arr.').replace(/\bmath\./g,'Math.').replace(/\band\b/g,'&&').replace(/\bor\b/g,'||').replace(/\bnot\b/g,'!').replace(/\bna\b(?!\s*\()/g,'null');
 }
 function compile(name,params){
  const at=lines.findIndex(l=>l.startsWith(name+'('));if(at<0)throw Error(name);let end=at+1;while(end<lines.length&&(!lines[end].trim()||/^\s/.test(lines[end])))end++;
  const body=lines.slice(at+1,end).filter(l=>l.trim()&&!l.trim().startsWith('//'));let code='',blocks=[];
  for(let i=0;i<body.length;i++){
   const indent=body[i].match(/^\s*/)[0].length;let s=body[i].trim();
   while(blocks.length&&indent<=blocks.at(-1)){code+='}\n';blocks.pop();}
   let header=s.startsWith('if ')?'if ('+expr(s.slice(3))+')':s.startsWith('else if ')?'else if ('+expr(s.slice(8))+')':s==='else'?'else':s.startsWith('while ')?'while ('+expr(s.slice(6))+')':null;
   const loop=s.match(/^for (\w+) = (.+) to (.+)$/);if(loop)header=`for (let ${loop[1]}=${expr(loop[2])}; ${loop[1]}<=${expr(loop[3])}; ${loop[1]}++)`;
   if(header){code+=header+' {\n';blocks.push(indent);continue;}
   if(i===body.length-1){code+='return '+expr(s)+';\n';continue;}
   s=s.replace(/^(?:ChannelResult|R1Swing|R1State|MpsState|MpsResult|bool|int|float|string) (\w+) = /,'let $1 = ').replace(/:=/g,'=');code+=expr(s)+';\n';
  }
  while(blocks.length){code+='}\n';blocks.pop();}
  return Function('na','make','arr',...params,code).bind(null,na,make,arr);
 }
 const step=compile('f_stepR1',['ctx','state','candle','requestedLow','requestedHigh','publishedAt','waveAllowed']);
 const select=compile('f_r1Reference',['pool','direction','raidAt']);
 const raid=compile('f_r1Raid',['sourceStart','sourceEnd','direction','rangeHigh','rangeLow','bar_index','sweepSize','history','availableChartStart']);
 const update=compile('f_r1Update',['pool','ph','pl','high','low','time_close','pivotLength','history']);
 return {make,compile,step,select,update,raid:(bars,start,end,dir,rh,rl,tick=1)=>raid(start,end,dir,rh,rl,bars.length-1,tick,(field,n)=>{const b=bars.at(-1-n);return b?.[{time:'start',time_close:'end',high:'h',low:'l'}[field]]??null;},bars[0]?.start??null)};
}
module.exports={createR1Harness};
