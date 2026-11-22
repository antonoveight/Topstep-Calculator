// Personal research hypothesis only. Supplied HTF context, references, zones and
// gates are annotations; this is not a Romeo Model 1 detector or a trade simulator.
const finite=Number.isFinite;
function validateCase(c){
 const x=c?.context;
 if(typeof c?.id!=='string'||!c.id.trim()||!x||typeof x.id!=='string'||!x.id.trim()||![1,-1].includes(x.dir)||!['H1','H2','H4','D1'].includes(x.sourceTf)||typeof x.ltf!=='string'||!x.ltf.trim()||![x.tsAt,x.confirmedAt,x.windowEnd,x.inv,x.target,x.tick].every(finite)||x.tsAt>x.confirmedAt||x.windowEnd<=x.confirmedAt||x.tick<=0||(x.dir===1?x.target<=x.inv:x.target>=x.inv))throw Error('Invalid supplied HTF context');
 if(!x.gates||!['bias','key','wave'].every(k=>typeof x.gates[k]==='boolean'))throw Error(c.id+': supply bias/key/wave gates explicitly');
 if(!Array.isArray(c.references)||!Array.isArray(c.bars)||!c.bars.length||c.bars.length>20000)throw Error(c.id+': invalid reference/bar collection');
 const ids=new Set();
 for(const r of c.references){if(typeof r.id!=='string'||!r.id.trim()||ids.has(r.id)||!['high','low'].includes(r.side)||![r.price,r.formedAt,r.knownAt].every(finite)||r.knownAt<r.formedAt||typeof r.availableAtTs!=='boolean'||typeof r.tf!=='string'||!r.tf.trim())throw Error(c.id+': invalid reference');ids.add(r.id);}
 if(c.zone&&(![c.zone.low,c.zone.high,c.zone.knownAt].every(finite)||c.zone.low>c.zone.high||c.zone.source!=='manual-annotation'))throw Error(c.id+': invalid manually supplied zone');
 let priorEnd=-Infinity;
 for(const b of c.bars){if(![b.start,b.end,b.o,b.h,b.l,b.c].every(finite)||b.end<=b.start||b.start<priorEnd||b.h<Math.max(b.o,b.l,b.c)||b.l>Math.min(b.o,b.h,b.c)||typeof b.closed!=='boolean')throw Error(c.id+': invalid/overlapping OHLC');priorEnd=b.end;}
 for(const [t,g] of Object.entries(c.gatesByStart||{}))if(!c.bars.some(b=>b.start===+t)||Object.entries(g).some(([k,v])=>!['bias','key','wave'].includes(k)||typeof v!=='boolean'))throw Error(c.id+': invalid gate override');
 return c;
}
function selectReference(c){
 const x=c.context,side=x.dir===1?'high':'low';
 // Reference identity is frozen at the TS event, never chosen from later pivots.
 return c.references.filter(r=>r.tf===x.ltf&&r.side===side&&r.availableAtTs&&r.knownAt<=x.tsAt)
  .sort((a,b)=>b.formedAt-a.formedAt||b.knownAt-a.knownAt||a.id.localeCompare(b.id))[0]||null;
}
function runCase(input){
 const c=validateCase(input),x=c.context,ref=selectReference(c),trace=[],signals=[];
 let terminal=null,leg=null,zone=null,previous=null,expected=x.confirmedAt;
 const up=x.dir===1;
 for(const b of c.bars){
  let status='WAIT_LEG',hit=false;
  if(!b.closed)status='WAIT_CLOSE';
  else if(b.end<=x.confirmedAt){status='WAIT_HTF';previous=b;}
  else if(terminal)status=terminal;
  else if(b.start<x.confirmedAt){status=terminal='CONTEXT_OVERLAP';}
  else if(b.start>=x.windowEnd||b.end>x.windowEnd){status=terminal='ENTRY_EXPIRED';}
  else if(b.start!==expected){status=terminal='DATA_GAP';}
  else{
   expected=b.end;
   const stop=up?b.l<=x.inv:b.h>=x.inv,target=up?b.h>=x.target:b.l<=x.target;
   if(stop||target)status=terminal=stop&&target?'AMB':stop?'INV':'TARGET_TAKEN';
   else if(!ref)status=terminal='NO_REFERENCE';
   else if(up?ref.price<=x.inv||ref.price>=x.target:ref.price>=x.inv||ref.price<=x.target)status=terminal='REFERENCE_NO_PATH';
   else if(!leg){
    const before=previous?.end===b.start?previous.c:b.o;
    const crossed=up?before<=ref.price&&b.l<=ref.price&&b.c>=ref.price+x.tick:before>=ref.price&&b.h>=ref.price&&b.c<=ref.price-x.tick;
    if(crossed){leg={barStart:b.start,knownAt:b.end,reference:ref.price,extreme:up?b.h:b.l};status='LEG_CONFIRMED';}
    else status='WAIT_LEG';
   }else{
    // A zone becomes usable only on bars opening after its published timestamp.
    if(!zone){
     if(!c.zone||c.zone.knownAt>b.start)status='WAIT_ZONE';
     else{
      const inside=up?c.zone.low>x.inv&&c.zone.high<leg.extreme:c.zone.high<x.inv&&c.zone.low>leg.extreme;
      if(c.zone.knownAt<leg.knownAt||!inside)status=terminal='INVALID_ZONE';
      else zone={...c.zone};
     }
    }
    if(zone&&!terminal){
     const lost=up?b.c<=zone.low:b.c>=zone.high,touch=b.l<=zone.high&&b.h>=zone.low;
     const reaction=touch&&(up?b.c>zone.high:b.c<zone.low),g={...x.gates,...c.gatesByStart?.[b.start]};
     if(lost)status=terminal='ZONE_LOST';
     else if(!reaction)status=touch?'WAIT_REACTION':'WAIT_ZONE_TOUCH';
     else if(!g.bias)status='BIAS_BLOCKED';
     else if(!g.key)status='KEY_BLOCKED';
     else if(!g.wave)status='WAVE_BLOCKED';
     else{hit=true;status='SIGNAL';terminal='USED';signals.push({barStart:b.start,knownAt:b.end,dir:x.dir,sourceTf:x.sourceTf,referenceId:ref.id,legKnownAt:leg.knownAt,zoneKnownAt:zone.knownAt,referenceClose:b.c,inv:x.inv,target:x.target});}
    }
   }
   previous=b;
  }
  trace.push({barStart:b.start,knownAt:b.closed?b.end:null,status,signal:hit,legKnownAt:leg?.knownAt??null});
 }
 return {id:c.id,sourceTf:x.sourceTf,dir:x.dir,reference:ref?{...ref}:null,leg,zone,signals,trace};
}
module.exports={validateCase,selectReference,runCase};
