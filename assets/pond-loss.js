/* Losses never enter the creel. A restored result stays settled without replay. */
const PondLoss=(()=>{
    const clamp=n=>Math.max(0,Math.min(1,n));
    const mix=(a,b,p)=>a+(b-a)*p;
    function sample(kind,age,hand,origin){
        const a=Math.max(0,age),broken=a>=.3,full=kind==='sl';
        const pull=Math.sin(clamp(a/.3)*Math.PI/2);
        const loaded={x:mix(477,405,pull),y:mix(296,208,pull)};
        const settle=clamp((a-.3)/.7);
        const tip=full&&broken?{x:mix(hand.x+(loaded.x-hand.x)*.56,hand.x+92,settle),y:mix(hand.y+(loaded.y-hand.y)*.56,hand.y-38,settle)}:full?loaded:{x:mix(loaded.x,460,settle),y:mix(loaded.y,515,settle)};
        const fall=clamp((a-.3)/.95);
        const fish={x:origin.x+Math.sin(fall*Math.PI)*25+clamp((a-1.25)/1.4)*100,y:origin.y-145*pull+145*fall*fall};
        if(full)fish.y=origin.y;
        if(a>=1.25)fish.y=origin.y+clamp((a-1.25)/1.4)*22;
        const end={x:mix(loaded.x,365,settle),y:mix(loaded.y,525,settle)};
        const start={x:mix(tip.x+8,286,settle),y:mix(tip.y-12,513,settle)};
        return {kind,age:a,broken,tip,fish,detached:{start,end},opacity:1-clamp((a-1.25)/1.2),airborne:!full&&a>.06&&a<1.22};
    }
    function draw(ctx,p,profile){
        const {tip,fish,age:a}=p;
        ctx.save();ctx.lineCap='round';
        ctx.strokeStyle='rgba(245,237,212,.75)';ctx.lineWidth=.85;
        ctx.beginPath();ctx.moveTo(tip.x,tip.y);
        if(!p.broken){ctx.lineTo(fish.x,fish.y);ctx.stroke();}
        else{
            // Separate, recoiling ends leave a visible gap after the snap.
            ctx.quadraticCurveTo(tip.x+24,tip.y+22,tip.x+12,tip.y+55);ctx.stroke();
            if(a<1.25&&p.kind!=='sl'){
                ctx.beginPath();ctx.moveTo(fish.x,fish.y-16);ctx.quadraticCurveTo(fish.x-12,fish.y-42,fish.x+9,fish.y-63);ctx.stroke();
            }
            if(p.kind==='sl'){
                const {start,end}=p.detached;
                for(const [color,width] of [['#422e22',3],['#ce9b58',1]]){
                    ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(start.x,start.y);ctx.lineTo(end.x,end.y);ctx.stroke();
                }
                ctx.strokeStyle='#ead1a0';ctx.lineWidth=1;
                for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(tip.x-2+i*2,tip.y+3);ctx.lineTo(tip.x-5+i*3,tip.y-6-i);ctx.stroke();}
            }
        }
        if(p.opacity>0){
            if(p.airborne)PondFish.draw(ctx,fish.x,fish.y,profile,-Math.PI/2+Math.sin(a*18)*.18,p.opacity,Math.sin(a*25));
            else PondFish.drawShadow(ctx,fish.x,fish.y,0,PondFish.shadow.opacity*p.opacity,Math.sin(a*14));
            const splash=clamp((a-1.15)/.65);
            if(splash>0&&splash<1){ctx.strokeStyle=`rgba(220,240,220,${(1-splash)*.65})`;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(fish.x,fish.y,8+splash*44,3+splash*12,0,0,Math.PI*2);ctx.stroke();}
        }
        ctx.restore();
    }
    return {sample,draw};
})();
if(typeof module!=='undefined')module.exports=PondLoss;
