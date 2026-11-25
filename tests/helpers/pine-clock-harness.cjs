// Executes the restricted actual Pine clock/feed bodies; not a Pine runtime.
const fs=require('node:fs');
function createClockHarness(source){
 const lines=source.split(/\r?\n/),na=x=>x==null||Number.isNaN(x);
 const array={size:a=>a.length,get:(a,i)=>a[i],push:(a,x)=>a.push(x),shift:a=>a.shift(),remove:(a,i)=>a.splice(i,1),clear:a=>{a.length=0;},indexof:(a,x)=>a.indexOf(x),insert:(a,i,x)=>a.splice(i,0,x),new:()=>[],from:(...items)=>items};
 const candle=(v={})=>{const c={t:null,e:null,o:null,h:null,l:null,c:null,...v};Object.defineProperty(c,'copy',{value:()=>candle(c)});return c;};
 function body(name){const at=lines.findIndex(l=>l.startsWith(name+'('));if(at<0)throw Error(name);let end=at+1;while(end<lines.length&&(!lines[end].trim()||/^\s/.test(lines[end])))end++;return lines.slice(at+1,end).filter(l=>l.trim()&&!l.trim().startsWith('//'));}
 function expr(s){
  s=s.replaceAll('array.new<ClockCandle>()','array.new()');
  for(const [type,make] of [['ClockCandle','candle'],['CrtKey','makeKey'],['SmtBars','makeSmt']]){
   const marker=type+'.new(';let start;
   while((start=s.indexOf(marker))>=0){let end=start+marker.length,depth=1;for(;end<s.length;end++){if(s[end]==='(')depth++;if(s[end]===')'&&!--depth)break;}const args=s.slice(start+marker.length,end);s=s.slice(0,start)+make+'({'+args.replace(/\b(\w+)=(?!=)/g,'$1:')+'})'+s.slice(end+1);}
  }
  return s.replace(/\bint\(/g,'Math.trunc(').replace(/\band\b/g,'&&').replace(/\bor\b/g,'||').replace(/\bnot\b/g,'!').replace(/\bna\b(?!\s*\()/g,'null');
 }
 function translate(name){const input=body(name);let code='',blocks=[];for(let i=0;i<input.length;i++){
  let s=input[i].trim(),indent=input[i].match(/^\s*/)[0].length;while(blocks.length&&indent<=blocks.at(-1)){code+='}\n';blocks.pop();}
  if(s.startsWith('if ')){code+='if('+expr(s.slice(3))+'){\n';blocks.push(indent);continue;}
  if(s.startsWith('else if ')){code+='else if('+expr(s.slice(8))+'){\n';blocks.push(indent);continue;}
  if(s==='else'){code+='else {\n';blocks.push(indent);continue;}
  if(s.startsWith('while ')){code+='while('+expr(s.slice(6))+'){\n';blocks.push(indent);continue;}
  const loop=s.match(/^for (\w+) = (.+) to (.+)$/);if(loop){code+=`for(let ${loop[1]}=${expr(loop[2])};${loop[1]}<=${expr(loop[3])};${loop[1]}++){\n`;blocks.push(indent);continue;}
  s=s.replace(/^(?:array<ClockCandle>|ClockCandle|SmtBars|CrtKey|bool|int|float|string) (\w+) = /,'let $1 = ').replace(/^(\[[^\]]+\]) = /,'let $1 = ').replace(/:=/g,'=');code+=(i===input.length-1?'return ':'')+expr(s)+';\n';
 }while(blocks.length){code+='}\n';blocks.pop();}return code;}
 function parts(at,tz){if(na(at))return {};return Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(at).filter(p=>p.type!=='literal').map(p=>[p.type,+p.value]));}
 function timestamp(tz,y,m,d,h,min){if([y,m,d,h,min].some(na))return null;const target=Date.UTC(y,m-1,d,h,min);let at=target;for(let i=0;i<4;i++){const p=parts(at,tz),asUTC=Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second);at+=target-asUTC;}return at;}
 const dayofweek=Object.assign((at,tz)=>{const p=parts(at,tz);return na(p.year)?null:new Date(Date.UTC(p.year,p.month-1,p.day)).getUTCDay()+1;},{sunday:1,friday:6,saturday:7});
 const seconds=tf=>tf==='1D'?86400:tf==='1W'?604800:+tf*60;
 const makeSmt=(args={})=>({first:null,firstEnd:null,second:null,secondEnd:null,firstHigh:null,firstLow:null,secondHigh:null,secondLow:null,...args});
 const env={na,array,candle,makeSmt,math:Math,CT:'America/Chicago',timestamp,year:(at,tz)=>parts(at,tz).year,month:(at,tz)=>parts(at,tz).month,dayofmonth:(at,tz)=>parts(at,tz).day,hour:(at,tz)=>parts(at,tz).hour,dayofweek,timeframe:{in_seconds:seconds}};
 function compile(name,params,extra={}){const scope={...env,...extra};return Function(...Object.keys(scope),...params,translate(name)).bind(null,...Object.values(scope));}
 // Calendar oracle for Pine's time()/time_close() API. This does not emulate
 // TradingView's implementation; the native chart check must verify its clock.
 function oracle(at,tf){if(na(at))return [null,null];const tz=env.CT,p=parts(at,tz);let start=timestamp(tz,p.year,p.month,p.day,17,0);if(at<start)start=timestamp(tz,p.year,p.month,p.day-1,17,0);const q=parts(start,tz),end=timestamp(tz,q.year,q.month,q.day+1,16,0);if(at>=end||[6,7].includes(dayofweek(start,tz)))return [null,null];const span=seconds(tf)*1000,bucket=start+Math.floor((at-start)/span)*span;return [bucket,Math.min(bucket+span,end)];}
 let session;
 if(source.includes('const string CLOCK_SESSION')){
  let currentAt;
  const api=(which)=>(tf,session,tz)=>{if(session!=='1700-1600:23456'||tz!==env.CT)throw Error('Unexpected clock API contract');return oracle(currentAt,tf)[which];};
  const raw=compile('f_sessionTimes',['sourceTf'],{CLOCK_SESSION:'1700-1600:23456',time:api(0),time_close:api(1)});
  session=(at,tf)=>{currentAt=at;return raw(tf);};
 }else session=compile('f_sessionTimes',['at','sourceTf']);
 const ingest=compile('f_ingestAligned',['state','part','start','finish','strict'],{f_sessionTimes:session});
 const bar=compile('f_tapeBar',['bars','back']);
 const pivots=compile('f_tapePivots',['bars'],{f_tapeBar:bar});
 const makeKey=require('./pine-crt-key-harness.cjs').createKeyHarness(source).makeKey;
 const push=compile('f_pushTapeKey',['zones','kind','direction','hi','lo','left','knownAt','sourceTf'],{makeKey});
 const zones=compile('f_tapeZoneKeys',['zones','bars','sourceTf'],{f_tapeBar:bar,f_pushTapeKey:push});
 return {compile,body,translate,session,candle,pivots,zones,parts,timestamp,array,state:()=>({bars:[],t:null,e:null,o:null,h:null,l:null,c:null,seq:-1,lastHour:null,coveredEnd:null,formingStart:null,complete:false,changed:false}),feed:(state,part,tf)=>ingest(state,part,...session(part.t,tf),true),nativeFeed:(state,part)=>ingest(state,part,part.t,part.e,false)};
}
module.exports={createClockHarness};
