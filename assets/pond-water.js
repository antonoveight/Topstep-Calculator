/* Two wave scales, moving reflections and local surface disturbances. */
const PondWater=(()=>{
    function wave(y,t,gain=1){const depth=Math.max(.2,Math.min(1,(y-160)/470));return {
        x:(Math.sin(y*.025-t*.65)*1.7+Math.sin(y*.066+t*.9)*.65)*gain*depth,
        y:Math.sin(y*.035-t*.52)*.85*gain*depth};}
    function draw(ctx,source,t,gain,light){
        ctx.save();ctx.beginPath();PondLife.water.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip();
        const band=light?14:7;
        if(source?.width||source?.naturalWidth){
            const width=source.naturalWidth||source.width,height=source.naturalHeight||source.height;
            for(let y=195;y<650;y+=band){const p=wave(y,t,gain);
                ctx.drawImage(source,0,(y+p.y)/750*height,width,(band+1.2)/750*height,p.x,y,1000,band+1.2);
            }
        }
        // Broad, low contrast currents; they move independently of the fine reflections.
        for(let i=0;i<(light?3:6);i++){
            const x=400+i*86+Math.sin(t*.12+i)*38,y=285+i*42+Math.cos(t*.18+i)*9;
            const glow=ctx.createRadialGradient(x,y,1,x,y,95);
            glow.addColorStop(0,`rgba(202,230,178,${(.025+Math.sin(t*.4+i)**2*.025)*gain})`);glow.addColorStop(1,'rgba(202,230,178,0)');
            ctx.fillStyle=glow;ctx.save();ctx.translate(x,y);ctx.scale(1,.22);ctx.translate(-x,-y);ctx.fillRect(x-100,y-100,200,200);ctx.restore();
        }
        for(let i=0;i<(light?12:24);i++){
            const x=345+(i*89)%610+Math.sin(t*.32+i)*15,y=265+(i*43)%350;
            ctx.strokeStyle=`rgba(242,238,200,${(.045+Math.sin(t*.75+i*.8)**2*.09)*gain})`;ctx.lineWidth=.9;
            ctx.beginPath();ctx.moveTo(x-10,y);ctx.quadraticCurveTo(x,y-2,x+14+Math.sin(t+i)*4,y);ctx.stroke();
        }
        for(let i=0;i<3;i++){
            const cycle=(t+i*8)%29;if(cycle>3.8)continue;
            const x=440+i*155,y=350+i*57,fade=Math.sin(cycle/3.8*Math.PI)*.13*gain;
            ctx.strokeStyle=`rgba(218,238,211,${fade})`;ctx.lineWidth=.9;ctx.beginPath();ctx.ellipse(x,y,6+cycle*11,1.5+cycle*2.6,-.1,0,Math.PI*2);ctx.stroke();
        }
        ctx.restore();
    }
    return {wave,draw};
})();
if(typeof module!=='undefined')module.exports=PondWater;
