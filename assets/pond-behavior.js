/* Four visual narratives follow confirmed checklist steps, never market guesses. */
const PondBehavior=(()=>{
    const smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
    function motion(snapshot,t,age,gain=1,from=null){
        const stage=snapshot?.stage||0;
        const m={tipX:0,tipY:0,bobberX:0,bobberY:0,dip:0,floatAngle:0,lean:0,bodyY:0,curve:0,lineSag:26,wake:0,nibble:0,pump:0};
        if(stage===3){
            // Two tentative taps, followed by a long pause. No hook-set or retrieve yet.
            const cycle=t%5.6;
            const tap=Math.exp(-(((cycle-.7)/.19)**2))+.65*Math.exp(-(((cycle-1.3)/.22)**2));
            m.nibble=tap;m.bobberY=tap*3.4;m.dip=tap*3;m.floatAngle=Math.sin(t*2)*tap*.12;
            m.tipY=Math.sin(t*.8)*.6;
        }else if(stage===4){
            // A single short hook-set, then a fish running against a loaded rod.
            const strike=age<.6?Math.sin(smooth(age/.6)*Math.PI):0;
            const run=Math.sin(t*1.8),surge=.5+.5*Math.sin(t*3.6-.5);
            m.tipX=-12+run*9;m.tipY=-30-strike*60+surge*11;
            m.bobberX=run*24;m.bobberY=4+surge*5;m.dip=5+surge*4;
            m.floatAngle=run*.38;m.lean=-.028-strike*.026;m.bodyY=-strike*2;
            m.curve=26+surge*15;m.lineSag=1;m.wake=.45+surge*.55;
        }else if(stage===5){
            // Lift under load; lower the rod while taking up line. Fish stays in the water.
            const cycle=(t%4.8)/4.8;
            const lift=cycle<.43?smooth(cycle/.43):1-smooth((cycle-.43)/.57);
            m.pump=lift;m.tipX=-8-lift*12;m.tipY=5-lift*48;
            m.bobberX=-58*(1-Math.exp(-Math.max(0,age)/7))-lift*7;
            m.bobberY=2+Math.sin(t*1.4)*1.1;m.dip=1.5;
            m.floatAngle=-.1+Math.sin(t*1.2)*.045;m.lean=-.009-lift*.016;m.bodyY=-lift*1.4;
            m.curve=9+lift*13;m.lineSag=4;m.wake=.18;
        }else if(stage===6){m.dip=.5;m.lineSag=3;m.curve=7;}
        for(const name of ['tipX','tipY','bobberX','bobberY','dip','floatAngle','lean','bodyY','curve'])m[name]*=gain;
        if(from){
            const mix=smooth(age/(stage===4?.24:.8));
            for(const name of Object.keys(m))if(Number.isFinite(from[name]))m[name]=from[name]+(m[name]-from[name])*mix;
        }
        return m;
    }
    function target(snapshot,bobber,t,age){
        if(!snapshot||snapshot.stage<2||snapshot.stage>=7)return null;
        const stage=snapshot.stage,setup=snapshot.setup,approach=Math.exp(-age*.65);
        let x=bobber.x+12,y=bobber.y+19,tail=Math.sin(t*4),behavior='waiting';
        if(stage===2){
            if(setup===1){x+=70+Math.sin(t*.45)*24;y+=Math.cos(t*.6)*12-20;behavior='sweep-watch';}
            if(setup===2){x+=24+100*approach+Math.sin(t*.5)*9;y+=24*approach;behavior='pullback';}
            if(setup===3){x+=92+Math.sin(t*.7)*40;y+=35+Math.cos(t*.55)*17;behavior='false-sweep';}
            if(setup===4){x+=55+Math.sin(age*2.5)*60*Math.exp(-age*.7);y+=Math.sin(t*.4)*6;behavior='breakout';}
        } else if(stage===3){
            if(setup===1){x+=Math.sin(t*1.3)*5;y+=Math.cos(t*1.1)*3;behavior='poc-confirmed';}
            if(setup===2){x+=35*approach;y+=Math.sin(age*1.5)*14*approach;behavior='local-structure';}
            if(setup===3){x+=85*approach+Math.sin(t*.65)*9;y+=Math.cos(t*.5)*4;behavior='retest-poc-a';}
            if(setup===4){x+=28*approach+Math.sin(t)*2;y+=Math.sin(t*.8)*2;behavior='retest-holds';}
            // Swim past the bait and turn back, rather than pulling as a hooked fish would.
            x+=Math.sin(t*.85)*11;y+=9+Math.cos(t*.85)*5;tail=Math.sin(t*3)*.45;
        } else {
            const effort=stage===4?18:stage===5?3:1.8;
            x+=Math.sin(t*(stage===4?2.6:1.2))*effort;
            y+=(stage===4?15:5)+Math.cos(t*1.7)*effort*.35;
            tail=Math.sin(t*(stage===4?11:stage===5?4:3.5))*(stage===4?1:stage===5?.45:.3);
            behavior=['hooked','risk-reduced','protected'][stage-4];
        }
        return {x,y,tail,behavior,angle:Math.atan2(bobber.y-y,bobber.x-x),opacity:stage>=4?.56:.39};
    }
    return {target,motion};
})();
if(typeof module!=='undefined')module.exports=PondBehavior;
