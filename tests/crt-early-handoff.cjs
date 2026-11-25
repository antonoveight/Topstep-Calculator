// Execute the actual Main handoff statements; no request.security emulation.
const assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const begin=source.indexOf('if barstate.isconfirmed and focusAvailable and na(crtState.confirmIndex) and earlyState.root');
const remaining=source.slice(begin).split(/\r?\n/);let stop=1;
while(stop<remaining.length&&(!remaining[stop].trim()||/^\s/.test(remaining[stop])))stop++;
const end=begin+remaining.slice(0,stop).join('\n').length;
assert.ok(begin>=0&&end>begin);
const lines=source.slice(begin,end).trimEnd().split(/\r?\n/);
const js=x=>x.replace(/\band\b/g,'&&').replace(/\bor\b/g,'||').replace(/\bnot\b/g,'!').replace(/:=/g,'=');
const code='if('+js(lines[0].slice(3))+'){\n'+lines.slice(1).map(js).join('\n')+'}\nreturn crtState;';
const run=Function('barstate','focusAvailable','na','crtState','earlyState','sAT','sDir','sBT','htf','modelKey','sConfirmed','sInv','map','channelStates',code);
function evaluate(extra={},old={confirmIndex:null},available=true,evidence={}){
 const raw={sourceRoot:90,sourceC2:100,sourceEnd:110,confirmIndex:4,confirmTime:101,localExtreme:111,p1Ref:110,p1At:92,mpsRef:102,mpsRefAt:95,p3At:100,mpsAt:104,gapAt:105,gapLow:100,gapHigh:103,legExtreme:96,branchMask:1,everSent:true,lastClosedAt:108,...evidence};
 const channel={...raw,copy:()=>({...raw})};
 const seed={root:90,dir:-1,bucket:100,emitted:true,blocked:false,channel,...extra},records=new Map();
 return {out:run({isconfirmed:true},available,x=>x==null,old,seed,90,-1,100,'60','parent',110,111,{put:(m,k,v)=>m.set(k,v)},records),old,records};
}
const silent=evaluate({emitted:false});assert.notEqual(silent.out,silent.old,'Known TS/MPS is inherited without an Early entry');
const got=evaluate();assert.notEqual(got.out,got.old);assert.equal(got.out.activatedAt,110);assert.equal(got.out.key,'60:parent');
for(const [k,v] of Object.entries({confirmTime:101,p1Ref:110,p1At:92,mpsRefAt:95,p3At:100,mpsAt:104,gapAt:105,legExtreme:96,branchMask:1}))assert.equal(got.out[k],v,'Preserve known Early evidence: '+k);
for(const changed of [{root:89},{dir:1},{bucket:99},{blocked:true},{channel:null},{channel:{confirmIndex:null}}]){const x=evaluate(changed);assert.equal(x.out,x.old);assert.equal(x.records.size,0);}
assert.equal(evaluate({},undefined,false).records.size,0,'Ended parent cannot inherit an Early TS');
assert.equal(evaluate({},{confirmIndex:7}).records.size,0,'Never replace already observed confirmed-channel evidence');
for(const evidence of [{sourceEnd:109},{sourceEnd:111},{localExtreme:112}])assert.equal(evaluate({},undefined,true,evidence).records.size,0,'Do not transfer a different source close or a stopped/replaced extreme');
console.log('PASS actual Early→confirmed handoff: matching C1/C2/direction only, no resurrection or overwrite, preserved TS/MPS/gap/leg timestamps and branch budget.');
