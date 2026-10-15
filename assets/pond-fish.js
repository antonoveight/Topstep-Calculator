/* The reward stays hidden under water; its identity is revealed only on landing. */
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
    const shadow=Object.freeze({size:34,mouth:.55,opacity:.24});
    function drawShadow(ctx,x,y,angle,opacity=shadow.opacity,tail=0){
        const s=shadow.size;
        ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha=Math.min(shadow.opacity,Math.max(0,opacity));
        ctx.filter='blur(1.6px)';
        ctx.fillStyle='#173f3d';ctx.beginPath();ctx.ellipse(0,0,s*.53,s*.19,0,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.moveTo(-s*.4,0);ctx.lineTo(-s*.77,-s*.19+tail*s*.06);
        ctx.quadraticCurveTo(-s*.65,tail*s*.05,-s*.77,s*.19+tail*s*.06);ctx.closePath();ctx.fill();
        ctx.restore();
    }
    function reveal(progress,originY,fishY){
        if(progress>=.065)return 1; // After breaching, stays visible all the way into the creel.
        const rise=Math.max(0,Math.min(1,(originY-fishY-24)/90));
        return rise*rise*(3-2*rise);
    }
    function draw(ctx,x,y,fish,angle,opacity,tail=0){
        const s=fish.size;
        ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(s,s);ctx.globalAlpha=opacity;
        const fill=ctx.createLinearGradient(0,-.32,0,.32);fill.addColorStop(0,'#263b35');fill.addColorStop(.2,fish.colors[1]);fill.addColorStop(.42,fish.colors[0]);fill.addColorStop(.68,fish.colors[1]);fill.addColorStop(.9,fish.colors[0]);fill.addColorStop(1,'#e3d5b4');
        ctx.fillStyle=fill;ctx.strokeStyle=fish.colors[1];ctx.lineWidth=.012;
        ctx.beginPath();ctx.moveTo(-.42,0);ctx.lineTo(-.8,-.26+tail*.08);ctx.quadraticCurveTo(-.66,tail*.1,-.8,.26+tail*.08);ctx.closePath();ctx.fill();ctx.stroke();
        // Fin rays curve with the tail, with translucent edges instead of a flat triangle.
        ctx.strokeStyle='rgba(246,229,190,.45)';ctx.lineWidth=.008;
        for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(-.46,0);ctx.quadraticCurveTo(-.62,i*.045,-.77,i*.105+tail*.08);ctx.stroke();}
        ctx.save();ctx.scale(1,fish.depth);
        ctx.beginPath();ctx.moveTo(.55,0);ctx.bezierCurveTo(.25,-.37,-.28,-.31,-.5,0);ctx.bezierCurveTo(-.28,.31,.28,.33,.55,0);ctx.fill();ctx.stroke();
        ctx.save();ctx.clip();
        if(fish.tier===3){
            ctx.fillStyle=fish.pattern===1?'#d06435':'#fff4d7';ctx.globalAlpha*=.55;
            for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(-.23+i*.24,(i%2?1:-1)*.09,.1,.16,i*.6,0,Math.PI*2);ctx.fill();}
        }
        // Offset rows of scales follow the volume, fading toward the belly.
        ctx.strokeStyle='rgba(30,47,38,.25)';ctx.lineWidth=.006;
        for(let row=-2;row<=2;row++)for(let i=0;i<8;i++){
            ctx.beginPath();ctx.arc(-.39+i*.098+(row%2)*.045,row*.074,.053,-1.05,1.05);ctx.stroke();
        }
        const sheen=ctx.createRadialGradient(.03,-.095,.01,-.03,-.02,.43);
        sheen.addColorStop(0,'rgba(255,255,228,.6)');sheen.addColorStop(.4,'rgba(255,250,215,.12)');sheen.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle=sheen;ctx.fillRect(-.55,-.4,1.15,.8);
        const underside=ctx.createLinearGradient(0,.04,0,.3);underside.addColorStop(0,'rgba(13,35,30,0)');underside.addColorStop(1,'rgba(13,35,30,.4)');
        ctx.fillStyle=underside;ctx.fillRect(-.55,.04,1.15,.3);
        ctx.restore();
        ctx.fillStyle=fish.colors[1];ctx.beginPath();ctx.moveTo(-.2,-.22);ctx.lineTo(-.12,-.4);ctx.quadraticCurveTo(.08,-.34,.19,-.23);ctx.fill();
        ctx.globalAlpha*=.8;ctx.beginPath();ctx.moveTo(.1,.02);ctx.quadraticCurveTo(-.04,.36,-.2,.19);ctx.quadraticCurveTo(-.03,.13,.1,.02);ctx.fill();
        ctx.strokeStyle='rgba(248,228,183,.4)';ctx.lineWidth=.009;
        for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(.08,.05);ctx.lineTo(-.17+i*.05,.2+i*.015);ctx.stroke();}
        ctx.globalAlpha=opacity;
        ctx.strokeStyle='rgba(38,54,45,.45)';ctx.lineWidth=.016;ctx.beginPath();ctx.arc(.28,0,.15,-1.2,1.2);ctx.stroke();
        ctx.fillStyle='#d6b875';ctx.beginPath();ctx.arc(.37,-.055,.049,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#162a23';ctx.beginPath();ctx.arc(.37,-.055,.032,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#fff9df';ctx.beginPath();ctx.arc(.38,-.065,.011,0,Math.PI*2);ctx.fill();
        ctx.restore();ctx.restore();
    }
    // Narrow, deep fishing creel. The lamp occupies x28..71, outside its footprint.
    const basket={x:134,y:493,rx:58,ry:24};
    function basketWall(ctx){
        ctx.beginPath();ctx.moveTo(76,493);ctx.bezierCurveTo(80,520,83,543,96,548);
        ctx.quadraticCurveTo(134,560,172,548);ctx.bezierCurveTo(185,543,188,520,192,493);
        ctx.ellipse(134,493,58,24,0,0,Math.PI);ctx.closePath();
    }
    function drawBasket(ctx,front=false,night=0){
        ctx.save();
        if(!front){
            ctx.fillStyle='rgba(24,20,12,.3)';ctx.beginPath();ctx.ellipse(137,552,59,11,-.08,0,Math.PI*2);ctx.fill();
            // Carry handle behind the opening: braided, with two attachment loops.
            ctx.strokeStyle='#503a24';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(88,491);ctx.bezierCurveTo(87,438,181,438,180,491);ctx.stroke();
            ctx.strokeStyle='#b79a69';ctx.lineWidth=2.2;ctx.stroke();
            ctx.fillStyle='#4b3523';ctx.beginPath();ctx.ellipse(134,493,58,24,0,0,Math.PI*2);ctx.fill();
            const inside=ctx.createRadialGradient(130,490,1,134,493,58);inside.addColorStop(0,'#715d3c');inside.addColorStop(.7,'#493b27');inside.addColorStop(1,'#211e17');
            ctx.fillStyle=inside;ctx.beginPath();ctx.ellipse(134,493,54,20,0,0,Math.PI*2);ctx.fill();
            ctx.strokeStyle='#8e7049';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(134,493,58,24,0,Math.PI,Math.PI*2);ctx.stroke();
            ctx.strokeStyle='#c1a477';ctx.lineWidth=1.3;ctx.stroke();
        }else{
            basketWall(ctx);
            const wall=ctx.createLinearGradient(76,510,192,545);wall.addColorStop(0,'#705638');wall.addColorStop(.3,'#b59764');wall.addColorStop(.58,'#a18453');wall.addColorStop(1,'#57422b');
            ctx.fillStyle=wall;ctx.fill();ctx.save();ctx.clip();
            ctx.lineWidth=1.15;
            for(let x=71;x<200;x+=4){ctx.strokeStyle=(x%3)?'rgba(38,27,15,.4)':'rgba(231,207,150,.3)';ctx.beginPath();ctx.moveTo(x,492);ctx.quadraticCurveTo(x+(134-x)*.08,527,x+(134-x)*.16,557);ctx.stroke();}
            for(let y=499;y<563;y+=3.6){ctx.strokeStyle='rgba(42,29,16,.4)';ctx.beginPath();ctx.ellipse(134,y,59,13,0,0,Math.PI);ctx.stroke();}
            const shade=ctx.createLinearGradient(0,512,0,553);shade.addColorStop(0,'rgba(24,19,12,.35)');shade.addColorStop(.2,'rgba(24,19,12,0)');shade.addColorStop(1,'rgba(24,19,12,.25)');ctx.fillStyle=shade;ctx.fillRect(75,511,120,48);
            ctx.restore();
            ctx.strokeStyle='#513b24';ctx.lineWidth=6;ctx.beginPath();ctx.ellipse(134,493,58,24,0,0,Math.PI);ctx.stroke();
            ctx.strokeStyle='#bfa174';ctx.lineWidth=3;ctx.stroke();
            ctx.strokeStyle='rgba(239,216,166,.6)';ctx.lineWidth=.8;ctx.stroke();
        }
        if(night>0){ctx.globalAlpha=night*.25;ctx.fillStyle='#081639';if(front)basketWall(ctx);else{ctx.beginPath();ctx.ellipse(134,493,58,24,0,0,Math.PI*2);}ctx.fill();}
        ctx.restore();
    }
    return {profile,draw,shadow,drawShadow,reveal,basket,drawBasket};
})();
if(typeof module!=='undefined')module.exports=PondFish;
