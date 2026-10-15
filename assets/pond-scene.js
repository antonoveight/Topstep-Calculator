/* Aligned RGBA layers. One transform drives both the actor and the rod hand. */
const PondScene=(()=>{
    const files={base:'quiet-pond-clean-v2.png',actor:'fisherman-v2.png',foliage:'foliage-v2.png',lantern:'lantern-v2.png',post:'lantern-post-v2.png'};
    const images={},cache=new Map();
    let motion='balanced',performance='auto';
    try{motion=localStorage.getItem('topstep_pond_motion_level')==='gentle'?'gentle':'balanced';performance=localStorage.getItem('topstep_pond_performance')==='light'?'light':'auto';}catch{}
    function ready(){return Object.values(images).length===Object.keys(files).length&&Object.values(images).every(i=>i.complete&&i.naturalWidth>0);}
    function light(){return performance==='light'||innerWidth<600;}
    function gain(){return motion==='gentle'?.55:1;}
    function viewport(width,height,studio=false){
        const scale=Math.max(width/1000,height/750)*(studio?1.08:1);
        const x=studio?Math.min(0,Math.max(width-1000*scale,width/2-413*scale)):(width-1000*scale)/2;
        const y=studio?Math.min(0,Math.max(height-750*scale,height/2-405*scale)):(height-750*scale)/2;
        return {scale,x,y};
    }
    function reload(){
        try{motion=localStorage.getItem('topstep_pond_motion_level')==='gentle'?'gentle':'balanced';performance=localStorage.getItem('topstep_pond_performance')==='light'?'light':'auto';}catch{}
        const m=document.getElementById('pondMotionLevel'),p=document.getElementById('pondPerformance');if(m)m.value=motion;if(p)p.value=performance;
        if(typeof syncAnglerMotion==='function')syncAnglerMotion();
    }
    function pose(t,stage=0,rest=false,amount=1,action={}){
        const gain=amount,breath=Math.sin(t*1.35)*1.25*gain;
        // Infrequent weight shifts blend in and out rather than looping a large gesture.
        const cycle=t%31,shift=cycle>20&&cycle<27?Math.sin((cycle-20)/7*Math.PI):0;
        const angle=(rest?.014:stage>=4?-.014:shift*.012+Math.sin(t*.31)*.005)*gain+(rest?0:action.lean||0);
        const x=shift*.7*gain,y=breath*(stage>=4?.45:1)+(rest?0:action.bodyY||0),pivot={x:260,y:480};
        const transform=p=>({x:pivot.x+(p.x-pivot.x)*Math.cos(angle)-(p.y-pivot.y)*Math.sin(angle)+x,
            y:pivot.y+(p.x-pivot.x)*Math.sin(angle)+(p.y-pivot.y)*Math.cos(angle)+y});
        return {angle,x,y,pivot,hand:transform({x:303,y:443}),breath,shift};
    }
    function sprite(name,filter,crop){
        const key=name+':'+crop.join(','),cached=cache.get(key);
        if(cached?.filter===filter)return cached.canvas;
        const canvas=cached?.canvas||document.createElement('canvas');canvas.width=crop[2];canvas.height=crop[3];
        const ctx=canvas.getContext('2d');ctx.filter=filter;ctx.drawImage(images[name],...crop,0,0,crop[2],crop[3]);
        cache.set(key,{filter,canvas});return canvas;
    }
    function base(filter){return ready()?sprite('base',filter,[0,0,1448,1086]):null;}
    function drawActor(ctx,p,filter){
        if(!ready())return;
        ctx.save();ctx.translate(p.pivot.x+p.x,p.pivot.y+p.y);ctx.rotate(p.angle);ctx.translate(-p.pivot.x,-p.pivot.y);
        ctx.drawImage(sprite('actor',filter,[293,527,197,301]),220,362,91,139);ctx.restore();
    }
    function swing(ctx,img,dest,pivot,angle){ctx.save();ctx.translate(...pivot);ctx.rotate(angle);ctx.translate(-pivot[0],-pivot[1]);ctx.drawImage(img,...dest);ctx.restore();}
    function drawForeground(ctx,t,filter,night){
        if(!ready())return;
        const wind=(Math.sin(t*.48)+Math.sin(t*.17)*.5)*gain();
        swing(ctx,sprite('foliage',filter,[0,0,620,540]),[0,0,295,257],[0,257],wind*.011);
        swing(ctx,sprite('foliage',filter,[0,550,440,536]),[0,337,115,170],[0,507],wind*.036);
        swing(ctx,sprite('foliage',filter,[1000,640,448,446]),[780,500,220,250],[1000,750],-wind*.035);
        ctx.drawImage(sprite('post',filter,[393,167,548,934]),28,388,43,91);
        swing(ctx,sprite('lantern',filter,[399,64,447,1084]),[44,405,25,61],[55,405],wind*.033);
    }
    function load(){
        for(const [name,file] of Object.entries(files)){
            const img=new Image();img.onload=()=>{if(ready()&&typeof renderQuietPond==='function')renderQuietPond();};
            img.src='assets/pond/'+file;images[name]=img;
        }
        const bar=document.querySelector('.pond-timebar');
        bar.insertAdjacentHTML('afterend','<details class="pond-scene-settings"><summary>Chuyển động &amp; hiển thị</summary><div><label>Chuyển động<select id="pondMotionLevel"><option value="gentle">Nhẹ</option><option value="balanced">Vừa</option></select></label><label>Tải máy<select id="pondPerformance"><option value="auto">Tự động</option><option value="light">Nhẹ — khi đang live</option></select></label><a href="assets/pond/preview-v2.webm" target="_blank" rel="noopener">Xem đoạn mẫu 25 giây ↗</a></div></details>');
        document.getElementById('pondMotionLevel').value=motion;document.getElementById('pondPerformance').value=performance;
        document.getElementById('pondMotionLevel').onchange=e=>{motion=e.target.value;try{localStorage.setItem('topstep_pond_motion_level',motion);}catch{}renderQuietPond();};
        document.getElementById('pondPerformance').onchange=e=>{performance=e.target.value;try{localStorage.setItem('topstep_pond_performance',performance);}catch{}syncAnglerMotion();};
    }
    if(typeof window!=='undefined')window.addEventListener('load',load);
    return {ready,base,drawActor,drawForeground,pose,gain,light,viewport,reload,fps:()=>light()?24:30};
})();
if(typeof module!=='undefined')module.exports=PondScene;
