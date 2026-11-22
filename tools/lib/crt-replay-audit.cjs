// Inspect exported evidence. This does not emulate Pine, fills, bias or HTF selection.
const C={schema:'TFA audit schema',end:'TFA audit bar close ms',htf:'TFA audit HTF seconds',ltf:'TFA audit LTF seconds',pullback:'TFA audit Pullback',tick:'TFA audit tick',model:'TFA audit model id',ts:'TFA audit TS open ms',confirmed:'TFA audit HTF confirmed ms',start:'TFA audit C3 open ms',finish:'TFA audit C3 close ms',age:'TFA audit model age',level:'TFA audit reclaim level',extreme:'TFA audit TS extreme',dir:'CRT direction +1/-1',target:'CRT target at signal',inv:'CRT invalidation at signal',reference:'Signal reference close (not fill)'};
function parseCsv(text){
 text=text.replace(/^\uFEFF/,'');
 const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else if(quoted||cell==='')quoted=!quoted;else throw Error('Invalid CSV quote');}
  else if(!quoted&&(c===','||c==='\n'||c==='\r')){row.push(cell);cell='';if(c!==','){if(c==='\r'&&text[i+1]==='\n')i++;if(row.some(x=>x!==''))rows.push(row);row=[];}}
  else cell+=c;
 }
 if(quoted)throw Error('Unclosed CSV quote');if(cell!==''||row.length){row.push(cell);if(row.some(x=>x!==''))rows.push(row);}
 if(rows.length<2)throw Error('CSV has no data rows');
 const headers=rows.shift().map(x=>x.replace(/^\uFEFF/,'').trim());
 if(new Set(headers).size!==headers.length)throw Error('Duplicate CSV headers: export only one TFA instance');
 for(const [i,r] of rows.entries())if(r.length!==headers.length)throw Error(`CSV row ${i+2}: column count mismatch`);
 return {headers,rows};
}
function timestamp(value){
 if(/^\d+(?:\.\d+)?$/.test(value)){const n=Number(value);return n<1e11?n*1000:n;}
 if(!/(?:Z|[+-]\d{2}:\d{2})$/i.test(value))throw Error('Use Unix time or ISO timestamps with an explicit UTC offset');
 const n=Date.parse(value);if(!Number.isFinite(n))throw Error('Invalid timestamp');return n;
}
function load(text){
 const {headers,rows}=parseCsv(text),indexes={};
 for(const [name,title] of Object.entries({...C,time:'time',open:'open',high:'high',low:'low',close:'close'})){
  const hits=headers.flatMap((h,i)=>h.toLowerCase()===title.toLowerCase()||(name in C&&h.endsWith(': '+title))?[i]:[]);
  if(hits.length!==1)throw Error(`Expected one column: ${title}; found ${hits.length}`);indexes[name]=hits[0];
 }
 const numeric=(v,key,line)=>{if(v.trim()===''||/^(?:na|nan|n\/a)$/i.test(v.trim()))return null;const n=Number(v);if(!Number.isFinite(n))throw Error(`Row ${line}: invalid ${key}`);return n;};
 return rows.map((r,i)=>{
  const b={time:timestamp(r[indexes.time]),line:i+2};
  if(!Number.isSafeInteger(b.time)||b.time<=0)throw Error(`Row ${i+2}: invalid timestamp`);
  for(const key of Object.keys(indexes))if(key!=='time')b[key]=numeric(r[indexes[key]],key,i+2);
  if(i&&b.time<=timestamp(rows[i-1][indexes.time]))throw Error(`Row ${i+2}: duplicate or unordered time`);
  if(b.schema!==1)throw Error(`Row ${i+2}: unsupported/missing audit schema`);
  if(![b.open,b.high,b.low,b.close].every(Number.isFinite)||b.high<Math.max(b.open,b.close,b.low)||b.low>Math.min(b.open,b.close,b.high))throw Error(`Row ${i+2}: invalid OHLC`);
  if(b.end!==null&&(!Number.isSafeInteger(b.end)||b.end<=b.time))throw Error(`Row ${i+2}: invalid bar close timestamp`);
  if(![60,180,300].includes(b.ltf)||!Number.isFinite(b.htf)||b.htf<=b.ltf||b.htf%b.ltf!==0||b.tick<=0||![0,1].includes(b.pullback))throw Error(`Row ${i+2}: invalid or unsupported audit settings`);
  return b;
 });
}
const almost=(a,b)=>Math.abs(a-b)<=Math.max(1,Math.abs(a),Math.abs(b))*1e-10;
function audit(text){
 const rows=load(text),at=new Map(rows.map((b,i)=>[b.time,i])),issues=[],incomplete=[],signals=[],closed=rows.filter(b=>b.end!==null);
 const issue=(b,rule)=>issues.push({time:b.time,line:b.line,rule});
 const missing=(b,rule)=>incomplete.push({time:b.time,line:b.line,rule});
 for(const b of rows){
  if([b.htf,b.ltf,b.pullback,b.tick].some((v,i)=>v!==[rows[0].htf,rows[0].ltf,rows[0].pullback,rows[0].tick][i]))throw Error('Settings changed within one CSV');
  if(b.dir===null)continue;
  if(![1,-1].includes(b.dir)){issue(b,'direction_must_be_buy_or_sell');continue;}
  const up=b.dir===1;signals.push({time:b.time,closeTime:b.end,dir:b.dir,model:b.model,confirmation:b.ts});
  if(b.end===null){issue(b,'signal_on_unclosed_bar');continue;}
  if(!['model','ts','confirmed','start','finish','age','level','extreme','target','inv','reference'].every(k=>Number.isFinite(b[k]))){issue(b,'signal_metadata_missing');continue;}
  if(!['model','ts','confirmed','start','finish','age'].every(k=>Number.isSafeInteger(b[k])))issue(b,'invalid_metadata_timestamp_or_age');
  if(b.age!==0||b.start>b.time||b.time>=b.finish||b.end>b.finish||b.confirmed>b.start||b.ts<b.start)issue(b,'outside_confirmed_c3');
  if(!almost(b.reference,b.close))issue(b,'signal_reference_not_bar_close');
  if(up?b.low<=b.inv||b.high>=b.target:b.high>=b.inv||b.low<=b.target)issue(b,'signal_after_htf_barrier_touch');
  if(!(up?b.inv<b.close&&b.close<b.target:b.target<b.close&&b.close<b.inv))issue(b,'invalid_risk_target_path');
  const ti=at.get(b.ts),si=at.get(b.start);
  if(ti===undefined||ti===0){missing(b,'confirmation_or_local_c1_outside_export');continue;}
  const ts=rows[ti],c1=rows[ti-1];
  if(ts.end===null||ts.end>b.end||ts.time>b.time||c1.time<b.start||c1.time<b.confirmed||c1.end!==ts.time)issue(b,'local_candles_not_causal_or_not_in_c3');
  const sweptLow=ts.low<=c1.low-b.tick,sweptHigh=ts.high>=c1.high+b.tick;
  if(!(ts.close>c1.low&&ts.close<c1.high&&(up?sweptLow&&!sweptHigh:sweptHigh&&!sweptLow)))issue(b,'confirmation_not_one_sided_ts');
  if(!almost(b.level,up?c1.low:c1.high)||!almost(b.extreme,up?ts.low:ts.high))issue(b,'confirmation_anchor_mismatch');
  if(b.pullback===1){
   if(b.time<=ts.time||ts.end>b.time)issue(b,'retest_not_after_confirmation_close');
   if(!(b.low<=b.level+b.tick&&b.high>=b.level-b.tick&&(up?b.close>b.level&&b.low>b.extreme:b.close<b.level&&b.high<b.extreme)))issue(b,'invalid_retest');
   for(const pending of rows.slice(ti+1,at.get(b.time))){
    if(pending.end===null){missing(b,'unclosed_intermediate_bar');continue;}
    if(up?pending.close<=b.level||pending.low<=b.extreme:pending.close>=b.level||pending.high>=b.extreme){issue(b,'pending_was_revoked_before_signal');break;}
   }
  }else if(b.time!==ts.time)issue(b,'confirmation_close_signal_shifted');
  if(si===undefined){missing(b,'c3_start_outside_export');continue;}
  const segment=rows.slice(si,at.get(b.time)+1);
  if(segment.some((x,i)=>i&&segment[i-1].end!==x.time))missing(b,'ltf_gap_inside_c3_cannot_verify_full_path');
  if(segment.some(x=>up?x.low<=b.inv||x.high>=b.target:x.high>=b.inv||x.low<=b.target))issue(b,'htf_barrier_taken_earlier_in_c3');
 }
 if(!closed.length)incomplete.push({rule:'no_closed_bars'});
 if(!signals.length)incomplete.push({rule:'no_signal_evidence'});
 return {kind:'exported-evidence-audit',marketReplayVerified:false,status:issues.length?'issues':incomplete.length?'incomplete':'checks_passed',bars:rows.length,closedBars:closed.length,signals,issues,incomplete,rows};
}
function compare(a,b){
 // Compare only closed bars shared by both exports. Different history coverage is explicit.
 const map=new Map(b.rows.filter(x=>x.end!==null).map(x=>[x.time,x])),differences=[],incomparable=[];let common=0;
 for(const x of a.rows.filter(x=>x.end!==null)){
  const y=map.get(x.time);if(!y)continue;common++;
  if(['open','high','low','close','htf','ltf','tick','pullback','end'].some(k=>x[k]!==y[k])){incomparable.push({time:x.time,rule:'ohlc_settings_or_feed_changed'});continue;}
  const key=x.dir!==null||y.dir!==null?['dir','model','ts','confirmed','start','finish','age','level','extreme','target','inv','reference']:['dir'];
  if(key.some(k=>x[k]!==y[k]))differences.push({time:x.time,rule:'closed_bar_signal_changed'});
 }
 return {commonClosedBars:common,replayOnlyClosedBars:a.closedBars-common,reloadOnlyClosedBars:b.closedBars-common,differences,incomparable,status:!common?'incomplete':incomparable.length?'incomparable':differences.length?'differences':'matched_common_bars',scope:'Identical OHLC/settings on shared closed bars only; not a general no-repaint proof.'};
}
module.exports={C,parseCsv,timestamp,load,audit,compare};
