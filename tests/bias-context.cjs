// Execute actual structural bias source with explicitly confirmed pivot inputs.
// Not a TradingView request.security/ta.pivot/runtime emulator.
const fs=require('fs'),assert=require('node:assert/strict');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const h=require('./helpers/pine-cluster-harness.cjs').createClusterHarness(source);
const fresh=()=>({direction:0,age:0,swingHigh:null,swingLow:null,protectedHigh:null,protectedLow:null});
const state=fresh();
h.biasStep(state,110,100,99,101);assert.equal(state.direction,-1);
h.biasStep(state,108,null,104,99);assert.equal(state.direction,-1,'A green daily retracement cannot flip a confirmed bearish structure');
assert.equal(state.protectedHigh,108,'Confirmed lower high tightens bearish protection');
for(let i=0;i<8;i++)h.biasStep(state,null,null,105,104);
assert.equal(state.direction,-1,'Structure does not expire merely after three daily bars');
h.biasStep(state,null,null,109,105);assert.equal(state.direction,1,'Confirmed close above protection can change structure');
h.biasStep(state,null,103,110,109);assert.equal(state.protectedLow,103);
h.biasStep(state,null,null,102,110);assert.equal(state.direction,-1);
const unknown=fresh();h.biasStep(unknown,null,null,90,110);assert.equal(unknown.direction,0,'Candle color/size without known structure is not a bias');
const tape=[[110,100,99,101],[108,null,104,99],[null,97,101,104],[null,null,109,101],[112,103,110,109]];
const a=fresh(),b=fresh();for(const [ph,pl,c,prior] of tape){h.biasStep(a,ph,pl,c,prior);h.biasStep(b,pl==null?null:200-pl,ph==null?null:200-ph,200-c,200-prior);assert.ok(a.direction===-b.direction,'Structural bias is directionally symmetric');}
function expression(name,ctx){
 const expr=source.match(new RegExp('^\\s*(?:bool|float|int|string) '+name+' = (.+)$','m'))[1].replace(/close\[1\]/g,'previous.close').replace(/\band\b/g,'&&').replace(/\bor\b/g,'||').replace(/\bnot\b/g,'!');
 return Function(...Object.keys(ctx),'return '+expr)(...Object.values(ctx));
}
const base={biasMode:'Auto',chartSeconds:300,timeframe:{in_seconds:()=>86400},biasTf:'1D',structureBias:1,autoGuardHigh:110,autoGuardLow:100,biasCheckClose:99,na:x=>x==null};
assert.equal(expression('biasPaused',base),true,'Closed LTF breach pauses old Buy bias without inventing daily Sell');
assert.equal(expression('biasDir',{biasPaused:true,structureBias:1}),0);
assert.equal(expression('biasPaused',{...base,structureBias:-1,biasCheckClose:111}),true);
assert.equal(expression('biasPaused',{...base,structureBias:-1,biasCheckClose:105}),false);
assert.equal(expression('biasPaused',{...base,biasMode:'Long'}),false,'Manual bias remains explicit user control');
assert.equal(expression('biasCheckClose',{barstate:{isconfirmed:false},close:90,previous:{close:105}}),105,'Intrabar price cannot make the closed-bar veto flicker');
assert.equal(expression('biasCheckClose',{barstate:{isconfirmed:true},close:99,previous:{close:105}}),99);
for(const field of ['direction','age','swingHigh','swingLow','guardHigh','guardLow'])assert.ok(source.includes(`previous ? ${field}[1] : ${field}`),'All six bias snapshot fields must be individually confirmed');
assert.match(source,/label.new\(bar_index, na, markerGlyph, xloc=xloc.bar_index, yloc=markerLocation/,'Triangles use current condition bar, never a pivot offset');
assert.match(source,/Signal CLOSE/,'Tooltip distinguishes signal-close time from candle-open time');
const tf={in_seconds:x=>x==='60'?3600:86400,period:'1D'};
const overviewMode=expression('overviewMode',{timeframe:tf,htfInput:'60'});
assert.equal(overviewMode,true);assert.equal(expression('htf',{overviewMode,htfInput:'60',timeframe:tf}),'1D','Opening D uses D overview of the selected H1 context');
console.log('PASS structural bias, protection trail, persistence, symmetric reversals, closed-bar veto, six confirmed snapshot fields, marker anchoring and D overview. No market/Replay result claimed.');
