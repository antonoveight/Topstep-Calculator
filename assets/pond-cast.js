/* One forward cast: load behind the shoulder, accelerate, release a trailing line. */
const PondCast=(()=>{
    const duration=1.4;
    const smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
    const mix=(a,b,t)=>a+(b-a)*t;
    function sample(progress,hand,restTip,anchor={x:650,y:412},setup=1,gain=1){
        const p=Math.max(0,Math.min(1,progress));
        const width=[0,1,.88,1.12,1.05][setup]||1;
        const swing=.65+.35*gain;
        const keys=[{p:0,x:157,y:-118},{p:.28,x:-82*width*swing,y:-118-49*swing},{p:.44,x:-28*swing,y:-118-93*swing},
            {p:.65,x:157+(205*width-157)*swing,y:-118+11*swing},{p:1,x:restTip.x-hand.x,y:restTip.y-hand.y}];
        function tipAt(t){
            let i=keys.findIndex(k=>k.p>=t);if(i<1)i=1;
            const a=keys[i-1],b=keys[i],f=smooth((t-a.p)/(b.p-a.p));
            return {x:hand.x+mix(a.x,b.x,f),y:hand.y+mix(a.y,b.y,f)};
        }
        const tip=tipAt(p),release=tipAt(.36),flight=smooth((p-.44)/.56);
        const trailing=tipAt(Math.max(0,p-.08));
        const bobber=p<.44?{x:trailing.x+12,y:trailing.y+44}:
            {x:mix(release.x+12,anchor.x,flight),y:mix(release.y+44,anchor.y,flight)-Math.sin(flight*Math.PI)*88};
        const line={x:(tip.x+bobber.x)/2-Math.sin(p*Math.PI*2)*38,
            y:(tip.y+bobber.y)/2+(p<.44?36:36*(1-flight)+26*flight+Math.sin(flight*Math.PI)*52)};
        return {tip,bobber,line,lean:-Math.sin(p*Math.PI*2)*.022*gain,
            phase:p<.28?'backswing':p<.44?'load':p<1?'release':'landed',landed:p===1};
    }
    return {sample,duration};
})();
if(typeof module!=='undefined')module.exports=PondCast;
