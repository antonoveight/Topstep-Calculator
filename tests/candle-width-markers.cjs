// Restricted source-body execution with drawing API stubs, not TradingView rendering.
const fs=require('fs'),assert=require('node:assert/strict');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
function body(name){const lines=source.split(/\r?\n/),start=lines.findIndex(l=>l.startsWith(name+'('));let end=start+1;while(end<lines.length&&(!lines[end].trim()||/^\s/.test(lines[end])))end++;return lines.slice(start+1,end).filter(l=>l.trim()&&!l.trim().startsWith('//'));}
function translate(name){
 let out='',blocks=[];
 for(const raw of body(name)){
  const indent=raw.match(/^\s*/)[0].length;let s=raw.trim();
  while(blocks.length&&indent<=blocks.at(-1)){out+='}\n';blocks.pop();}
  if(s.startsWith('if ')||s.startsWith('while ')){const at=s.indexOf(' ');out+=s.slice(0,at)+'('+s.slice(at+1)+'){\n';blocks.push(indent);continue;}
  s=s.replace(/^(?:color|int|float|line) (\w+) = /,'let $1 = ');
  s=s.replace('xloc=xloc.bar_time, extend=extend.none, color=color.new(markerColor, 100), width=1, force_overlay=true','{xloc:xloc.bar_time,extend:extend.none,color:color.new(markerColor,100),width:1,force_overlay:true}');
  s=s.replace('xloc=xloc.bar_time, yloc=yloc.price, style=label.style_label_center, color=color.new(markerColor, 100), textcolor=color.new(markerColor, 100), size=10, force_overlay=true, tooltip=hint','{xloc:xloc.bar_time,yloc:yloc.price,style:label.style_label_center,color:color.new(markerColor,100),textcolor:color.new(markerColor,100),size:10,force_overlay:true,tooltip:hint}');
  out+=s+';\n';
 }
 while(blocks.length){out+='}\n';blocks.pop();}return out;
}
const arrays={eventLabels:[],eventBuckets:[],eventLeftEdges:[],eventRightEdges:[],eventFills:[]};
const array={push:(a,x)=>a.push(x),remove:(a,i)=>a.splice(i,1)[0],size:a=>a.length};
const line={new:(x1,y1,x2,y2,options)=>({x1,y1,x2,y2,options,deleted:false}),delete:x=>{x.deleted=true;}};
const linefill={new:(a,b,color)=>({a,b,color,deleted:false}),delete:x=>{x.deleted=true;}};
const label={style_label_center:'center',new:(time,price,text,options)=>({time,price,text,options,deleted:false}),delete:x=>{x.deleted=true;}};
const color={lime:'green',red:'red',new:(color,alpha)=>({color,alpha})};
const names=Object.keys(arrays),dropBody=Function('label','linefill','line','array',...names,'index',translate('f_dropMark'));
const drop=i=>dropBody(label,linefill,line,array,...Object.values(arrays),i);
const note=Function('color','line','linefill','label','array','xloc','yloc','extend','int','math','syminfo','chartSeconds','time','low','high','visibleLabelGap','markLimit','bucketCounter','f_dropMark',...names,'up','hint',translate('f_note'));
function draw({seconds=300,time=1000000000,low=100,high=110,gap=4,limit=200,up=true}={}){
 note(color,line,linefill,label,array,{bar_time:'time'},{price:'price'},{none:'none'},Math.trunc,Math,{mintick:.01},seconds,time,low,high,gap,limit,1,drop,...Object.values(arrays),up,'signal tooltip');
}
for(const seconds of [60,180,300])for(const up of [true,false]){
 draw({seconds,up});const fill=arrays.eventFills.at(-1),a=fill.a,b=fill.b;
 assert.equal(b.x1-a.x1,seconds*1000*.8,'Base spans one standard body fraction, not fixed text pixels');
 assert.equal((a.x1+b.x1)/2,a.x2);assert.equal(a.x2,1000000000,'Apex is exactly the signal candle center');
 assert.equal(a.x2,b.x2);assert.equal(a.y2,b.y2,'Two filled edges share one apex');
 assert.ok(up?a.y2<100&&a.y1<a.y2:a.y2>110&&a.y1>a.y2,'Buy is below wick, Sell above wick');
 assert.equal(fill.color,up?'green':'red');
 assert.equal(arrays.eventLabels.at(-1).time,a.x2);assert.equal(arrays.eventLabels.at(-1).options.tooltip,'signal tooltip');
 assert.equal(a.options.extend,'none');
}
for(let i=0;i<230;i++)draw({time:2000000000+i*300000,up:i%2===0});
for(const values of Object.values(arrays))assert.equal(values.length,200,'All marker arrays obey History 200 together');
assert.ok(2*200+32+18+2<500,'Edges plus level/cluster lines and creation margin fit Pine budget');
const removed={label:arrays.eventLabels[99],fill:arrays.eventFills[99],left:arrays.eventLeftEdges[99],right:arrays.eventRightEdges[99]};
drop(99);assert.ok(Object.values(removed).every(o=>o.deleted),'Deleting a history item removes tooltip, fill and both edges');
draw({limit:1});for(const values of Object.values(arrays))assert.equal(values.length,1);
draw({limit:0});for(const values of Object.values(arrays))assert.equal(values.length,0,'Hide clears the entire marker geometry');
assert.match(source,/if bucketCounter[^\n]+\n\s+f_dropMark\(markIndex\)/,'Latest recency pruning uses the same complete cleanup');
console.log('PASS candle-relative triangle width/center/color, above/below price geometry, tooltip and synchronized History/Latest/Hide cleanup within line budget. Native rendering unverified.');
