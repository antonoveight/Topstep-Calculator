// RESEARCH REFERENCE MODEL ONLY. Not imported by Pine or the web application.
// Closed LTF events / key metadata / shifts are explicit inputs, not discovered here.
function replay(context,bars,confirmedPattern){
 const c=structuredClone(context),log=[],readyAt=[];
 let cumulativeHigh=-Infinity,cumulativeLow=Infinity,previousClose=c.c1.close;
 let reclaimAt=null,confirmation=null,ready=false,dead=null,entered=null,barrier=null,attempt=0,lastAt=-Infinity,observedBias=c.bias;
 const swept=()=>({low:cumulativeLow<=c.c1.low-c.tick,high:cumulativeHigh>=c.c1.high+c.tick});
 const target=c.direction===-1?c.c1.low:c.c1.high;
 const extreme=()=>c.direction===-1?cumulativeHigh:cumulativeLow;
 const snap=(at,status,closeStatus=null)=>log.push({at,status,attempt,reclaimAt,confirmedAt:confirmation?.at??null,earlyReady:ready,provisionalExtreme:Number.isFinite(extreme())?extreme():null,entry:entered?structuredClone(entered):null,entryBarrier:barrier,closeStatus});
 for(const b of bars){
  if(b.at<=lastAt)throw Error('Duplicate/out-of-order event');lastAt=b.at;
  if(!b.closed){snap(b.at,'WAIT_CLOSE');continue;}
  if(b.at<=c.c2.openAt){snap(b.at,'OUTSIDE_C2');continue;}
  if(b.at>c.c2.closeAt){ready=false;snap(b.at,'C2_ENDED','EXPIRED');continue;}
  if([-1,0,1].includes(b.bias))observedBias=b.bias;
  const oldExtreme=extreme();cumulativeHigh=Math.max(cumulativeHigh,b.high);cumulativeLow=Math.min(cumulativeLow,b.low);
  const raid=swept(),newExtreme=Number.isFinite(oldExtreme)&&(c.direction===-1?extreme()>oldExtreme:extreme()<oldExtreme);
  if(entered){
   const stop=c.direction===-1?b.high>=entered.sl:b.low<=entered.sl,tg=c.direction===-1?b.low<=entered.tp:b.high>=entered.tp;
   if(!barrier&&(stop||tg))barrier=stop&&tg?'AMBIGUOUS':stop?'SL_REFERENCE_TOUCHED':'TP_REFERENCE_TOUCHED';
  }
  if(b.at===c.c2.closeAt){
   ready=false;
   const direction=confirmedPattern(c.c1,{high:cumulativeHigh,low:cumulativeLow,close:b.close});
   const closeStatus=raid.low&&raid.high?'AMBIGUOUS':direction===c.direction?(c.direction===-1?cumulativeLow<=target:cumulativeHigh>=target)?'AMBIGUOUS':'CONFIRMED':'REJECTED';
   snap(b.at,'C2_'+closeStatus,closeStatus);previousClose=b.close;continue;
  }
  if(raid.low&&raid.high){dead='DOUBLE_SWEEP';ready=false;}
  const targetTaken=(raid.low||raid.high)&&(c.direction===-1?cumulativeLow<=target:cumulativeHigh>=target);
  if(targetTaken&&!dead){dead='TARGET_TAKEN';ready=false;}
  if(dead){snap(b.at,dead);previousClose=b.close;continue;}
  if(entered){snap(b.at,barrier||'MANUAL_ENTRY_RECORDED');previousClose=b.close;continue;}
  const key=c.key;
  if(!key||!Number.isFinite(key.knownAt)||!Number.isFinite(key.sourceAt)||key.sourceAt>key.knownAt||key.knownAt>c.c1.openAt||!Number.isFinite(key.timeframeMinutes)||key.timeframeMinutes<c.htfMinutes||key.direction!==c.direction){snap(b.at,'NO_PRIOR_KEY');previousClose=b.close;continue;}
  if(!observedBias||observedBias!==c.direction&&!c.allowCounter){ready=false;confirmation=null;reclaimAt=null;snap(b.at,'BIAS');previousClose=b.close;continue;}
  if(c.direction===-1?b.close>key.high:b.close<key.low){dead='KEY_X';ready=false;snap(b.at,dead);previousClose=b.close;continue;}
  const correctRaid=c.direction===-1?raid.high:raid.low;
  if(!correctRaid){snap(b.at,'WAIT_RAID');previousClose=b.close;continue;}
  // Before an observed entry, extension replaces the candidate's proof, never its past log.
  if(newExtreme){attempt++;reclaimAt=null;confirmation=null;ready=false;}
  const touched=cumulativeLow<=key.high&&cumulativeHigh>=key.low;
  const keyRaid=key.kind!=='swing'||(c.direction===-1?cumulativeHigh>=key.high+c.tick:cumulativeLow<=key.low-c.tick);
  const keyHeld=c.direction===-1?b.close<key.low:b.close>key.high;
  const backInside=b.close>c.c1.low&&b.close<c.c1.high;
  if(!touched||!keyRaid||!keyHeld){ready=false;confirmation=null;reclaimAt=null;snap(b.at,'WAIT_KEY_REACTION');previousClose=b.close;continue;}
  if(!backInside){ready=false;confirmation=null;reclaimAt=null;snap(b.at,'WAIT_RECLAIM');previousClose=b.close;continue;}
  if(reclaimAt==null){reclaimAt=b.at;snap(b.at,'WAIT_CM');previousClose=b.close;continue;}
  const shift=b.shift;
  const knownShift=shift&&['MSS','CISD'].includes(shift.kind)&&shift.sourceAt<=shift.knownAt&&shift.knownAt<=b.openAt&&b.at>reclaimAt;
  const crossed=knownShift&&(c.direction===-1?previousClose>=shift.level&&b.close<shift.level:previousClose<=shift.level&&b.close>shift.level);
  if(!confirmation&&crossed){confirmation={at:b.at,level:shift.level,kind:shift.kind};snap(b.at,'WAIT_PULLBACK');previousClose=b.close;continue;}
  if(confirmation){
   if(c.direction===-1?b.close>=confirmation.level:b.close<=confirmation.level){ready=false;confirmation=null;snap(b.at,'CM_REVOKED');previousClose=b.close;continue;}
   const retest=b.at>confirmation.at&&b.low<=confirmation.level+c.tick&&b.high>=confirmation.level-c.tick&&(c.direction===-1?b.close<confirmation.level:b.close>confirmation.level);
   if(retest&&!ready){ready=true;readyAt.push(b.at);}
  }
  let status=ready?'EARLY_READY':confirmation?'WAIT_PULLBACK':'WAIT_CM';
  // Manual-entry records are supplied observations, not inferred OHLC fills.
  if(b.manualEntry&&ready){
   const e=b.manualEntry,valid=e.at>=b.at&&e.at<c.c2.closeAt&&e.sl===extreme()&&e.tp===target&&(c.direction===-1?e.price<e.sl&&e.price>e.tp:e.price>e.sl&&e.price<e.tp);
   if(!valid)throw Error('Invalid manual entry observation');
   entered={...e,attempt};status='MANUAL_ENTRY_RECORDED';
  }
  snap(b.at,status);previousClose=b.close;
 }
 return {readyAt,log};
}
module.exports={replay};
