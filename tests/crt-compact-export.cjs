// Compare actual export expressions before/after removing redundant CRT fields.
const fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync(process.argv[2]||'indicators/funded-angler-v6.pine','utf8');
const original=fs.readFileSync('tests/fixtures/crt-view-before-clock.pinefragment','utf8');
function defaults(src,type){const lines=src.split(/\r?\n/),a=lines.indexOf('type '+type),out={};for(let i=a+1;i<lines.length&&/^\s/.test(lines[i]);i++){const m=lines[i].trim().match(/^\S+ (\w+) = (.+)$/);if(m)out[m[1]]=m[2]==='na'?null:JSON.parse(m[2]);}return out;}
function expression(src,name){const lines=src.split(/\r?\n/),a=lines.findIndex(l=>l.startsWith(name+'('));return lines[a+1].trim();}
function exportFn(src,name,type){const text=expression(src,name).replace(type+'.new(', 'create({').replace(/\b(\w+)=/g,'$1:').replace(/\)$/,'})');const run=Function('source','m','reason','endedAt','create','return '+text);return (m,reason=2,end=999)=>run(m,m,reason,end,args=>({...defaults(src,type),...args}));}
const before=exportFn(original,'f_exportModel','ModelView'),after=exportFn(source,'f_exportModel','ModelView'),oldArchive=exportFn(original,'f_archive','ModelArchive'),newArchive=exportFn(source,'f_archive','ModelArchive');
const derived={uid:'aT',aH:'hi',aL:'lo',resolvedAt:'confirmedAt',hiT:'aT',loT:'aT',invT:'bT',cpT:'aT'};
function reconstruct(value){const out={...value};for(const [old,next] of Object.entries(derived))out[old]=value[next];out.kind=value.aT==null?0:1;out.phase=out.kind;return out;}
let cases=0;
function check(m){assert.deepEqual(reconstruct(after(m)),before(m),'Every legacy model value remains equal');if(m.aT!=null){const a=oldArchive(m),b=newArchive(m);for(const [field,value] of Object.entries(b))assert.deepEqual(value,a[field],field+' survives compact archive');assert.equal(b.aT,a.uid);assert.equal(b.bEnd,a.confirmedAt);}cases++;}
check(defaults(source,'Model'));
const keys=require('./helpers/pine-crt-key-harness.cjs').createKeyHarness(source);
for(const dir of [1,-1])for(let i=0;i<300;i++){
 const aT=100+i*1000,bT=aT+100,end=bT+100,hi=110+i*.01,lo=hi-10,inv=dir===1?lo-2:hi+2;
 const key=keys.makeKey({kind:2,dir,lo:dir===1?lo-5:hi,hi:dir===1?lo:hi+5,knownAt:aT-100,beforeTime:bT,tf:'120'});
 const m={...defaults(source,'Model'),uid:aT,aT,aEnd:bT,flags:1,kind:1,phase:1,dir,hi,lo,aH:hi,aL:lo,aO:lo+4,aC:lo+6,bO:lo+5,bH:dir===1?hi-2:inv,bL:dir===1?inv:lo+2,bC:lo+5,bT,bEnd:end,confirmedAt:end,resolvedAt:end,hiT:aT,loT:aT,cpT:aT,invT:bT,inv,cp:dir===1?hi:lo,bornIndex:10,crtKey:key,rangeKeys:{levels:[key]}};
 check(m);m.cT=end;m.cEnd=end+100;m.cO=lo+5;m.cH=hi-1;m.cL=lo+1;m.cC=lo+5;check(m);
 m.phase=0;const bar={t:end,end:end+100,o:lo+5,h:dir===1?hi-3:hi+4,l:dir===1?lo-4:lo+3,c:lo+6};assert.equal(keys.renew(m,bar,11),true);check(m);
}
assert.equal(Object.keys(defaults(original,'ModelView')).length-Object.keys(defaults(source,'ModelView')).length,10);
assert.equal(Object.keys(defaults(original,'ModelArchive')).length-Object.keys(defaults(source,'ModelArchive')).length,5);
console.log(`PASS ${cases} actual export/reconstruction comparisons: empty, both CRT directions, C3 and actual renewal; all legacy values and archived OHLC preserved.`);
