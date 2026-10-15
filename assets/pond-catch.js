/* Fast hook-set, short recoil, then controlled landing in the 1000 × 750 scene. */
const PondCatch=(()=>{
    const duration=3.2;
    const clamp=v=>Math.max(0,Math.min(1,v));
    const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
    const lerp=(a,b,t)=>a+(b-a)*t;
    function sample(progress,origin={x:630,y:435}) {
        const p=clamp(progress);
        const keys=[
            {p:0,fish:[origin.x,origin.y],tip:[485,327]},
            {p:.065,fish:[588,232],tip:[407,150]},
            {p:.12,fish:[566,242],tip:[428,181]},
            {p:.5,fish:[354,286],tip:[351,233]},
            {p:.8,fish:[134,431],tip:[151,352]},
            {p:.94,fish:[134,493],tip:[200,303]},
            {p:1,fish:[134,493],tip:[345,256]}
        ];
        let index=keys.findIndex(k=>k.p>=p);if(index<1)index=1;
        const a=keys[index-1],b=keys[index],local=clamp((p-a.p)/(b.p-a.p));
        // Rod leads the strike; the fish follows a fraction later as the line loads.
        // Ease-out starts with force, rather than slowly accelerating from rest.
        const fishEase=index===1?1-Math.pow(1-clamp((local-.07)/.93),3):smooth(local);
        const rodEase=index===1?1-Math.pow(1-local,4):smooth(local);
        const fish={x:lerp(a.fish[0],b.fish[0],fishEase),y:lerp(a.fish[1],b.fish[1],fishEase)};
        const tip={x:lerp(a.tip[0],b.tip[0],rodEase),y:lerp(a.tip[1],b.tip[1],rodEase)};
        const attached=p<.88, deposited=p>=.94;
        const angle=lerp(-Math.PI/2,0,smooth((p-.84)/.1));
        const mouth={x:fish.x+Math.cos(angle)*20.9,y:fish.y+Math.sin(angle)*20.9};
        const float=attached?{x:mouth.x,y:mouth.y-17}:{x:tip.x+12,y:tip.y+28};
        return {progress:p,fish,tip,mouth,float,angle,attached,deposited,
            phase:p<.12?'lift':p<.5?'reel':p<.94?'basket':'done',
            label:p<.12?'Giật cá khỏi mặt nước':p<.5?'Thu dây, đưa cá về bến':p<.94?'Đưa cá vào rổ':'Đã cất cá vào rổ'};
    }
    return {sample,duration};
})();
if(typeof module!=='undefined' && module.exports)module.exports=PondCatch;
