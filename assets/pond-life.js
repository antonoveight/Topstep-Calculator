/* Bounded ambient life. Bezier control points stay inside a convex open-water region. */
const PondLife=(()=>{
    const water=[[300,307],[490,240],[830,200],[980,250],[970,440],[835,490],[760,575],[590,640],[400,610],[390,470],[275,415]];
    const safe=[[460,330],[800,275],[900,350],[770,500],[500,550],[430,445]];
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
    function contains([x,y],polygon=water) {
        let inside=false;
        for(let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
            const [xi,yi]=polygon[i],[xj,yj]=polygon[j];
            if((yi>y)!==(yj>y) && x<(xj-xi)*(y-yi)/(yj-yi)+xi) inside=!inside;
        }
        return inside;
    }
    function point(random) {
        for(let i=0;i<100;i++) {
            const p=[465+random()*365,335+random()*150];
            if(contains(p,safe)) return p;
        }
        return [650,412];
    }
    function spawn(world,age=0) {
        const r=world.random;
        world.fish.push({points:[point(r),point(r),point(r),point(r)],age,life:19+r()*12,
            size:19+r()*15,depth:.2+r()*.22,seed:r()*Math.PI*2});
    }
    function create(random=Math.random) {
        const world={fish:[],time:0,nextSpawn:6,random};
        spawn(world,3);spawn(world,8);spawn(world,1);return world;
    }
    function step(world,dt,small=false) {
        dt=clamp(Number.isFinite(dt)?dt:0,0,.1);world.time+=dt;
        world.fish.forEach(f=>{f.age+=dt;});world.fish=world.fish.filter(f=>f.age<f.life);
        const limit=small?3:5;
        if(world.fish.length>limit)world.fish.length=limit;
        if(world.fish.length===0) spawn(world,1);
        if(world.time>=world.nextSpawn) {
            if(world.fish.length<limit) spawn(world);
            world.nextSpawn=world.time+5+world.random()*5;
        }
    }
    function pose(f,time) {
        const progress=clamp(f.age/f.life,0,1);
        const t=progress+Math.sin(progress*Math.PI*2)*.045+Math.sin(progress*Math.PI*4)*.018,u=1-t,[a,b,c,d]=f.points;
        const x=u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0];
        const y=u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1];
        const dx=3*u*u*(b[0]-a[0])+6*u*t*(c[0]-b[0])+3*t*t*(d[0]-c[0]);
        const dy=3*u*u*(b[1]-a[1])+6*u*t*(c[1]-b[1])+3*t*t*(d[1]-c[1]);
        const fade=clamp(f.age/2,0,1)*clamp((f.life-f.age)/2,0,1);
        const surface=.5+.5*Math.sin(f.age*.32+f.seed);
        return {x,y,angle:Math.atan2(dy,dx),surface,size:f.size*(.8+surface*.2),opacity:fade*f.depth*(.58+surface*.42),tail:Math.sin(time*(2.9+surface)+f.seed)};
    }
    return {water,safe,contains,create,step,pose};
})();
if(typeof module!=='undefined' && module.exports) module.exports=PondLife;
