/* Four visual narratives follow confirmed checklist steps, never market guesses. */
const PondBehavior=(()=>{
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
        } else {
            const effort=stage===4?9:stage===5?4:1.8;
            x+=Math.sin(t*(stage===4?2.6:1.4))*effort;y+=Math.cos(t*1.7)*effort*.3;tail=Math.sin(t*(stage===4?10:stage===5?6:3.5));behavior=['hooked','risk-reduced','protected'][stage-4];
        }
        return {x,y,tail,behavior,angle:Math.atan2(bobber.y-y,bobber.x-x),opacity:stage>=4?.56:.39};
    }
    return {target};
})();
if(typeof module!=='undefined')module.exports=PondBehavior;
