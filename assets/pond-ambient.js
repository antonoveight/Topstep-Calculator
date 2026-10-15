/* Low-frequency environmental movement, independent of checklist progress. */
const PondAmbient=(()=>{
    function pose(t) {
        return {breath:Math.sin(t*1.55)*.8,gust:Math.sin(t*.47)+Math.sin(t*.19)*.45,
            leaves:Array.from({length:5},(_,i)=>{
                const age=(t+i*9.7)%47,visible=age<17;
                return {visible,x:90+i*178+Math.sin(age*.42+i)*24,y:80+age*19+i*9,
                    angle:age*.5+i,alpha:visible?Math.min(1,age/2,(17-age)/3)*.6:0};
            }),insect:{x:705+Math.sin(t*.24)*85,y:292+Math.cos(t*.36)*30,visible:t%36>21}};
    }
    function draw(ctx,t,image,filter,night) {
        const p=pose(t);
        ctx.save();
        // A small torso-only breath. The rod hand is deliberately outside this mask.
        if(image.complete&&image.naturalWidth) {
            ctx.save();ctx.beginPath();ctx.moveTo(241,382);ctx.quadraticCurveTo(264,374,282,398);
            ctx.lineTo(290,426);ctx.lineTo(275,449);ctx.lineTo(235,441);ctx.closePath();ctx.clip();
            ctx.filter=filter;ctx.translate(0,p.breath);ctx.drawImage(image,0,0,1000,750);ctx.restore();
        }
        // Reeds share the breeze but differ in phase, so they do not move in unison.
        for(let i=0;i<15;i++) {
            const right=i>6,x=right?865+(i-7)*13:15+i*13,y=right?653+(i%3)*12:411+(i%4)*13;
            const height=25+(i*19)%56,sway=(p.gust+Math.sin(t*.65+i)*.6)*3;
            ctx.strokeStyle=night>.4?'rgba(133,158,119,.27)':'rgba(190,185,107,.48)';ctx.lineWidth=1.2;
            ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x-4+sway*.3,y-height*.6,x-12+sway,y-height);ctx.stroke();
        }
        for(const leaf of p.leaves) {
            if(!leaf.visible)continue;
            ctx.save();ctx.translate(leaf.x,leaf.y);ctx.rotate(leaf.angle);ctx.globalAlpha=leaf.alpha*(1-night*.5);
            ctx.fillStyle='#a5ac65';ctx.beginPath();ctx.ellipse(0,0,4,1.7,0,0,Math.PI*2);ctx.fill();ctx.restore();
        }
        // A passing dragonfly is ambient life, never a bite signal and never a sound.
        if(p.insect.visible&&night<.4) {
            const {x,y}=p.insect;ctx.strokeStyle='rgba(78,100,76,.5)';ctx.lineWidth=1;
            ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x+4,y);ctx.stroke();
            ctx.fillStyle='rgba(231,239,208,.38)';
            for(const side of [-1,1]){ctx.beginPath();ctx.ellipse(x,y+side*2,5,1.4,Math.sin(t*30)*.4,0,Math.PI*2);ctx.fill();}
        }
        ctx.restore();
    }
    return {pose,draw};
})();
if(typeof module!=='undefined')module.exports=PondAmbient;
