/* A round keeps its identity; R changes its size and colour family, never frame timing. */
const PondFish=(()=>{
    const palettes=[
        [['#a9b7a2','#526c59'],['#a4bac5','#506a78'],['#b8ab86','#726346']],
        [['#a4c7bb','#367b6b'],['#c4ccd1','#527f94'],['#d6bc79','#947332']],
        [['#fff0b1','#d89735'],['#fff2db','#df7349'],['#c6e8ee','#679bc5'],['#f4d4de','#b96b91']]
    ];
    function profile(seed,stage){
        const tier=stage>=7?3:stage>=6?2:1;
        let hash=(seed^Math.imul(tier,2654435761))>>>0;hash=Math.imul(hash^(hash>>>16),2246822507)>>>0;
        const colors=palettes[tier-1][hash%palettes[tier-1].length];
        return {seed,tier,size:[0,32,47,64][tier]+(hash%5),colors,pattern:(hash>>>5)%3,depth:.9+((hash>>>8)%3)*.07,mouth:.55};
    }
    function draw(ctx,x,y,fish,angle,opacity,tail=0){
        const s=fish.size;
        ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(s,s);ctx.globalAlpha=opacity;
        const fill=ctx.createLinearGradient(0,-.3,0,.3);fill.addColorStop(0,fish.colors[0]);fill.addColorStop(1,fish.colors[1]);
        ctx.fillStyle=fill;ctx.strokeStyle=fish.colors[1];ctx.lineWidth=.012;
        ctx.beginPath();ctx.moveTo(-.42,0);ctx.lineTo(-.8,-.26+tail*.08);ctx.quadraticCurveTo(-.66,tail*.1,-.8,.26+tail*.08);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.save();ctx.scale(1,fish.depth);
        ctx.beginPath();ctx.moveTo(.55,0);ctx.bezierCurveTo(.25,-.37,-.28,-.31,-.5,0);ctx.bezierCurveTo(-.28,.31,.28,.33,.55,0);ctx.fill();ctx.stroke();
        ctx.save();ctx.clip();
        if(fish.tier===3){
            ctx.fillStyle=fish.pattern===1?'#ef794c':'#fff4d7';ctx.globalAlpha*=.75;
            for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(-.23+i*.24,(i%2?1:-1)*.09,.1,.16,i*.6,0,Math.PI*2);ctx.fill();}
        }
        ctx.strokeStyle='rgba(255,249,212,.35)';ctx.lineWidth=.009;
        for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(-.3+i*.12,0,.09,.19,0,-1.1,1.1);ctx.stroke();}
        ctx.restore();
        ctx.fillStyle=fish.colors[1];ctx.beginPath();ctx.moveTo(-.2,-.22);ctx.lineTo(-.12,-.4);ctx.quadraticCurveTo(.08,-.34,.19,-.23);ctx.fill();
        ctx.beginPath();ctx.moveTo(.03,.08);ctx.quadraticCurveTo(-.07,.4,-.23,.22);ctx.closePath();ctx.fill();
        ctx.strokeStyle='rgba(38,54,45,.45)';ctx.lineWidth=.016;ctx.beginPath();ctx.arc(.28,0,.15,-1.2,1.2);ctx.stroke();
        ctx.fillStyle='#20392e';ctx.beginPath();ctx.arc(.37,-.055,.035,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#fff9df';ctx.beginPath();ctx.arc(.38,-.065,.011,0,Math.PI*2);ctx.fill();
        ctx.restore();ctx.restore();
    }
    const basket={x:134,y:493,rx:78,ry:34};
    function drawBasket(ctx,front=false,night=0){
        ctx.save();
        if(!front){
            ctx.fillStyle='rgba(28,24,13,.24)';ctx.beginPath();ctx.ellipse(134,555,82,13,0,0,Math.PI*2);ctx.fill();
            const wall=ctx.createLinearGradient(56,490,212,560);wall.addColorStop(0,'#b08a52');wall.addColorStop(.5,'#d5b279');wall.addColorStop(1,'#7a5732');
            ctx.fillStyle=wall;ctx.beginPath();ctx.moveTo(56,493);ctx.bezierCurveTo(58,574,210,574,212,493);ctx.closePath();ctx.fill();
            ctx.save();ctx.clip();ctx.strokeStyle='rgba(77,47,24,.4)';ctx.lineWidth=1;
            for(let x=48;x<228;x+=7){ctx.beginPath();ctx.moveTo(x,495);ctx.lineTo(x+12,570);ctx.stroke();}
            for(let y=501;y<570;y+=5){ctx.beginPath();ctx.ellipse(134,y,78,13,0,0,Math.PI);ctx.stroke();}
            ctx.restore();
            ctx.fillStyle='#624a2e';ctx.beginPath();ctx.ellipse(134,493,78,34,0,0,Math.PI*2);ctx.fill();
            const inside=ctx.createRadialGradient(134,489,3,134,493,73);inside.addColorStop(0,'#b19566');inside.addColorStop(1,'#5b4329');
            ctx.fillStyle=inside;ctx.beginPath();ctx.ellipse(134,493,73,22,0,0,Math.PI*2);ctx.fill();
            ctx.strokeStyle='#dbb67b';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(134,493,78,34,0,Math.PI,Math.PI*2);ctx.stroke();
        }else{
            ctx.strokeStyle='#704e2c';ctx.lineWidth=6;ctx.beginPath();ctx.ellipse(134,493,78,34,0,0,Math.PI);ctx.stroke();
            ctx.strokeStyle='#dfbc82';ctx.lineWidth=3;ctx.stroke();
        }
        if(night>0){ctx.globalAlpha=night*.22;ctx.fillStyle='#081639';ctx.beginPath();ctx.ellipse(134,515,79,46,0,0,Math.PI*2);ctx.fill();}
        ctx.restore();
    }
    return {profile,draw,basket,drawBasket};
})();
if(typeof module!=='undefined')module.exports=PondFish;
