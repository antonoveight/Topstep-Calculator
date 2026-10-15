/* Quiet Pond — approved illustrated background with a resolution-independent Canvas layer. */
let anglerState = {
    stepCount:0, isRisk1r:false, isRisk2r:false, isRiskTp:false,
    isLoopRunning:false, audioEnabled:false, audioCtx:null,
    motionPaused:false, reducedMotion:false, visible:false, rafId:null,
    time:0, lastFrame:0, castProgress:0, catchProgress:0,
    ripples:[], bobber:{x:650,y:412}, fish:{state:'idle'},
    geometry:null, catchOrigin:{x:630,y:435}, catchPose:null, snapshot:null, phase:0, stage:0, phaseTime:99, transitionSerial:0, lastEffect:null,
    rodBend:0, reelAmount:0, world:PondLife.create(), frameCount:0,
    timeMode:'auto', clock:null, clockTimer:null, lighting:{...PondClock.palettes.afternoon}, lightingTarget:{...PondClock.palettes.afternoon}
};

function initRusticAngler() {
    const canvas=document.getElementById('rusticAnglerCanvas');
    if(!canvas) return;
    if(anglerState.isLoopRunning) { restorePondPreferences(); return; }
    anglerState.isLoopRunning=true;
    try {anglerState.timeMode=PondClock.normalizeMode(localStorage.getItem('topstep_angler_time_mode'));} catch (_) {}
    updatePondClock(new Date(),true);
    try { anglerState.motionPaused=localStorage.getItem('topstep_angler_motion_paused')==='true'; } catch (_) {}
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    anglerState.reducedMotion=media.matches;
    media.addEventListener('change',e=>{anglerState.reducedMotion=e.matches; syncAnglerMotion();});
    const stage=document.getElementById('rusticCanvasContainer');
    const resize=()=>{
        const width=stage.getBoundingClientRect().width;
        if(width>0) {
            const ratio=Math.min(window.devicePixelRatio || 1,2);
            canvas.width=Math.round(width*ratio);
            canvas.height=Math.round(stage.getBoundingClientRect().height*ratio);
        }
        syncAnglerMotion();
    };
    new ResizeObserver(resize).observe(stage);
    new ResizeObserver(()=>{
        document.querySelector('.finpoint-workspace').style.setProperty('--pond-sticky-height',document.getElementById('rusticAnglerCard').getBoundingClientRect().height+'px');
    }).observe(document.getElementById('rusticAnglerCard'));
    new IntersectionObserver(entries=>{
        anglerState.visible=entries[0].isIntersecting;
        syncAnglerMotion();
    },{threshold:0}).observe(stage);
    document.addEventListener('visibilitychange',syncAnglerMotion);
    canvas.addEventListener('pointerup',event=>{
        const rect=canvas.getBoundingClientRect();
        const wide=document.getElementById('rusticAnglerCard').dataset.fullscreen==='true'||document.getElementById('rusticAnglerCard').dataset.studio==='true';
        const scale=wide?Math.max(rect.width/1000,rect.height/750):rect.width/1000;
        const x=(event.clientX-rect.left-(rect.width-1000*scale)/2)/scale;
        const y=(event.clientY-rect.top-(rect.height-750*scale)/2)/scale;
        if(PondLife.contains([x,y])) {
            anglerState.ripples.push({x,y,born:anglerState.time});
            anglerState.ripples=anglerState.ripples.slice(-8);
            playAnglerSound('plop');
            renderQuietPond();
        }
    });
    const image=document.getElementById('quietPondBackground');
    const showImageError=()=>stage.classList.add('pond-image-error');
    image.addEventListener('error',showImageError);
    if(image.complete && !image.naturalWidth) showImageError();
    try {
        if(localStorage.getItem('topstep_angler_collapsed')==='true') {
            stage.style.display='none';
            document.getElementById('btnToggleAnglerCollapse').setAttribute('aria-expanded','false');
            document.getElementById('btnToggleAnglerCollapse').setAttribute('aria-label','Mở rộng hồ câu');
        }
    } catch (_) {}
    resize();
    updateAnglerState(anglerState.stepCount,anglerState.isRisk1r,anglerState.isRisk2r,anglerState.isRiskTp,{restore:true});
}

function syncAnglerMotion() {
    const stage=document.getElementById('rusticCanvasContainer');
    if(!stage || !anglerState.isLoopRunning) return;
    const animate=anglerState.visible && !document.hidden && stage.style.display!=='none' &&
        document.getElementById('view-checklist').style.display!=='none' && !anglerState.motionPaused && !anglerState.reducedMotion;
    const button=document.getElementById('btnToggleAnglerMotion');
    const paused=anglerState.motionPaused || anglerState.reducedMotion;
    schedulePondClock();
    button.setAttribute('aria-pressed',String(paused));
    button.setAttribute('aria-label',anglerState.reducedMotion ? 'Chuyển động giảm theo cài đặt hệ thống' : (paused ? 'Tiếp tục chuyển động' : 'Tạm dừng chuyển động'));
    button.title=button.getAttribute('aria-label');
    button.disabled=anglerState.reducedMotion;
    document.getElementById('anglerPauseGlyph').style.display=paused?'none':'block';
    document.getElementById('anglerPlayGlyph').style.display=paused?'block':'none';
    if(!animate && anglerState.rafId!==null) {
        cancelAnimationFrame(anglerState.rafId); anglerState.rafId=null; anglerState.lastFrame=0;
    }
    if(paused) {
        anglerState.lighting={...anglerState.lightingTarget};
        anglerState.castProgress=anglerState.stage>0?1:0;
        anglerState.catchProgress=anglerState.stage===7?1:0;
    }
    renderQuietPond();
    if(animate && anglerState.rafId===null) anglerState.rafId=requestAnimationFrame(quietPondLoop);
}

function quietPondLoop(timestamp) {
    if(anglerState.lastFrame && timestamp-anglerState.lastFrame<1000/30-1) {
        anglerState.rafId=requestAnimationFrame(quietPondLoop);return;
    }
    const dt=anglerState.lastFrame ? Math.min((timestamp-anglerState.lastFrame)/1000,.05) : 0;
    anglerState.lastFrame=timestamp;
    anglerState.time+=dt;
    anglerState.frameCount++;
    PondLife.step(anglerState.world,dt,innerWidth<600);
    for(const key of Object.keys(anglerState.lighting)) {
        anglerState.lighting[key]+=(anglerState.lightingTarget[key]-anglerState.lighting[key])*Math.min(1,dt*1.4);
    }
    anglerState.phaseTime+=dt;
    anglerState.rodBend+=(getPondBend()-anglerState.rodBend)*Math.min(1,dt*5);
    anglerState.reelAmount+=((anglerState.stage>=6?1:0)-anglerState.reelAmount)*Math.min(1,dt*2);
    anglerState.castProgress=Math.min(1,anglerState.castProgress+dt*1.25);
    anglerState.catchProgress=anglerState.stage===7?Math.min(1,anglerState.catchProgress+dt/PondCatch.duration):0;
    anglerState.ripples=anglerState.ripples.filter(r=>anglerState.time-r.born<3);
    renderQuietPond();
    anglerState.rafId=requestAnimationFrame(quietPondLoop);
}

function toggleAnglerMotion() {
    anglerState.motionPaused=!anglerState.motionPaused;
    try {localStorage.setItem('topstep_angler_motion_paused',String(anglerState.motionPaused));} catch (_) {}
    syncAnglerMotion();
}

function toggleAnglerCardCollapse() {
    const stage=document.getElementById('rusticCanvasContainer');
    const expanded=stage.style.display==='none';
    stage.style.display=expanded?'block':'none';
    const button=document.getElementById('btnToggleAnglerCollapse');
    button.setAttribute('aria-expanded',String(expanded));
    button.setAttribute('aria-label',expanded?'Thu gọn hồ câu':'Mở rộng hồ câu');
    button.title=button.getAttribute('aria-label');
    try {localStorage.setItem('topstep_angler_collapsed',String(!expanded));} catch (_) {}
    syncAnglerMotion();
}

function toggleAnglerAudio() {
    anglerState.audioEnabled=!anglerState.audioEnabled;
    const button=document.getElementById('btnToggleAnglerAudio');
    button.setAttribute('aria-pressed',String(anglerState.audioEnabled));
    button.setAttribute('aria-label',anglerState.audioEnabled?'Tắt âm thanh':'Bật âm thanh');
    button.title=button.getAttribute('aria-label');
    document.getElementById('anglerMuteSlash').style.display=anglerState.audioEnabled?'none':'block';
    if(anglerState.audioEnabled) playAnglerSound('plop');
}

function playAnglerSound(type) {
    if(!anglerState.audioEnabled) return;
    try {
        const AudioCtx=window.AudioContext || window.webkitAudioContext;
        if(!AudioCtx) return;
        const ctx=anglerState.audioCtx ||= new AudioCtx();
        if(ctx.state==='suspended') ctx.resume();
        const notes=type==='catch'?[523,659,784]:type==='strike'?[330,440]:[480];
        notes.forEach((frequency,i)=>{
            const start=ctx.currentTime+i*.1, osc=ctx.createOscillator(), gain=ctx.createGain();
            osc.type='sine';osc.frequency.setValueAtTime(frequency,start);
            if(type==='plop') osc.frequency.exponentialRampToValueAtTime(150,start+.16);
            gain.gain.setValueAtTime(.045,start);gain.gain.exponentialRampToValueAtTime(.001,start+.3);
            osc.connect(gain);gain.connect(ctx.destination);osc.start(start);osc.stop(start+.32);
            osc.onended=()=>{osc.disconnect();gain.disconnect();};
        });
    } catch (err) {console.debug('Pond audio unavailable:',err.message);}
}

function triggerCastStep(stepNum) {
    const checkbox=document.getElementById('chk-s'+activeChecklistSetup+'-'+stepNum);
    if(checkbox) {checkbox.checked=true;onChecklistChange();}
}

function readPondChecklist() {
    const steps=[1,2,3,4].map(i=>document.getElementById('chk-s'+activeChecklistSetup+'-'+i)?.checked===true);
    const risk=['1r','2r','tp'].map(id=>document.getElementById('chk-risk-'+id)?.checked===true);
    return PondLogic.derive(steps,risk,activeChecklistSetup);
}

function handleCastReelButtonClick() {
    if(window.PondLive?.shouldRest()){PondLive.noteRest();return;}
    if(window.PondExecution?.current()){PondExecution.newRound();return;}
    const snapshot=readPondChecklist();
    if(snapshot.stage<4) { triggerCastStep(snapshot.phase+1); }
    else if(snapshot.riskPhase<3) {
        document.getElementById('chk-risk-'+['1r','2r','tp'][snapshot.riskPhase]).checked=true;
        onChecklistChange();
    } else resetChecklist();
}

function getPondBend() {
    const result=window.PondExecution?.current();
    return result&&result.outcome!=='tp' ? .04 : [0,0,.08,.28,1,.65,.35,.2][anglerState.stage];
}

function updateAnglerState(_count,_risk1,_risk2,_tp,options={}) {
    const next=readPondChecklist(), prev=anglerState.snapshot;
    window.PondExecution?.onChecklist(next,prev,options);
    const restored=options.restore || !prev || prev.setup!==next.setup;
    const advance=!restored && next.stage>prev.stage;
    const changed=!prev || prev.setup!==next.setup || prev.stage!==next.stage;
    Object.assign(anglerState,{snapshot:next,phase:next.phase,stage:next.stage,stepCount:next.checked,
        isRisk1r:next.risk[0],isRisk2r:next.risk[1],isRiskTp:next.risk[2]});
    anglerState.fish.state=next.fishState;
    if(changed) {
        anglerState.phaseTime=advance?0:99;
        anglerState.castProgress=advance && prev.stage===0 && next.stage<4?0:(next.stage>0?1:0);
        anglerState.catchProgress=advance && next.stage===7?0:(next.stage===7?1:0);
        if(advance && next.stage===7) {
            anglerState.catchOrigin={x:anglerState.bobber.x,y:anglerState.bobber.y+24};
            if(!prev || prev.stage===0) anglerState.catchOrigin={x:630,y:435};
        }
        if(restored || !advance) {
            anglerState.rodBend=getPondBend();anglerState.reelAmount=next.stage>=6?1:0;
            anglerState.ripples=[];
        }
    }
    anglerState.lastEffect=null;
    if(advance) {
        anglerState.lastEffect=next.effect;anglerState.transitionSerial++;
        if(next.phase>0) anglerState.ripples.push({x:650,y:412,born:anglerState.time});
        playAnglerSound(next.stage===7?'catch':next.stage===4?'strike':'plop');
    }
    document.getElementById('anglerStatusText').textContent=next.status;
    document.getElementById('anglerStageText').textContent=next.setupName+' · '+(next.stage>=5?'Quản lý lệnh':next.checked+'/4 điều kiện');
    document.getElementById('anglerCastBtnText').textContent=next.action;
    const actionButton=document.getElementById('anglerCastBtnText').closest('button');
    const mutation=next.stage===7?'Bắt đầu lượt mới và xóa toàn bộ dấu tích checklist':
        'Bấm để đánh dấu: '+(next.stage<4?next.nextLabel:['Quản lý +1R','Dời SL về BE','Hoàn tất TP'][next.riskPhase]);
    actionButton.title=mutation;
    actionButton.setAttribute('aria-label',next.action+'. '+mutation);
    document.getElementById('anglerQuoteText').textContent=next.pending
        ? 'Đang chờ: '+next.nextLabel+'. Các dấu tích của bạn vẫn được giữ.'
        : next.stage===7?'Một lượt câu trọn vẹn. Nghỉ một nhịp trước lượt tiếp theo.'
        : next.stage>=4?'Giữ kế hoạch. Để xác suất làm phần việc còn lại.'
        : next.phase===0?'Kiên nhẫn cũng là một vị thế.':'Bước tiếp theo: '+next.nextLabel+'.';
    document.getElementById('anglerStatusDot').style.background=next.phase===3?'#d4ac6f':'#45c3b4';
    document.getElementById('rusticAnglerCanvas').setAttribute('aria-label',next.status);
    if(anglerState.motionPaused || anglerState.reducedMotion) {
        anglerState.castProgress=next.stage>0?1:0;anglerState.catchProgress=next.stage===7?1:0;
        anglerState.rodBend=getPondBend();anglerState.reelAmount=next.stage>=6?1:0;
    }
    window.PondExecution?.refresh();
    renderQuietPond();
}

function renderQuietPond() {
    const canvas=document.getElementById('rusticAnglerCanvas');
    if(!canvas || !canvas.width) return;
    const ctx=canvas.getContext('2d');
    if(!ctx) return;
    const w=1000,h=750,t=anglerState.time;
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);
    if(document.getElementById('rusticAnglerCard').dataset.fullscreen==='true'||document.getElementById('rusticAnglerCard').dataset.studio==='true') {
        const scale=Math.max(canvas.width/w,canvas.height/h);
        ctx.setTransform(scale,0,0,scale,(canvas.width-w*scale)/2,(canvas.height-h*scale)/2);
    } else ctx.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);
    ctx.clearRect(0,0,w,h);
    const outcome=window.PondExecution?.current(),ended=outcome&&outcome.outcome!=='tp';
    if(ended)anglerState.fish.state=PondExecution.age()<2?'departing':'idle';
    const active=anglerState.stage>0&&(!ended||PondExecution.age()<1.4);
    const cast=(1-Math.pow(1-anglerState.castProgress,3))*(ended?Math.max(0,1-PondExecution.age()/1.4):1);
    const caught=anglerState.stage===7;
    const catchPose=caught?PondCatch.sample(anglerState.catchProgress,anglerState.catchOrigin):null;
    anglerState.catchPose=catchPose;
    const tension=anglerState.rodBend;
    // Anchors are aligned to the hands and perspective in quiet-pond.png (1448 × 1086).
    const hand={x:303,y:443};
    const struggle=anglerState.stage===4?Math.sin(t*4)*2.5:anglerState.stage===5?Math.sin(t*2.3):0;
    const idleSway=Math.sin(t*1.1)*1.5;
    const tip=catchPose?catchPose.tip:{x:active?477+tension*8+struggle:460+idleSway*.4,y:active?296+tension*31:321+idleSway};
    const bobber=catchPose?catchPose.float:{x:hand.x+(650-hand.x)*cast-anglerState.reelAmount*22,
        y:hand.y+(412-hand.y)*cast-Math.sin(cast*Math.PI)*94+Math.sin(t*1.8)*1.6};
    if(anglerState.stage===3) {
        const amplitude=anglerState.snapshot.effect==='settle'?2:8;
        bobber.y+=Math.sin(anglerState.phaseTime*8)*amplitude*Math.exp(-anglerState.phaseTime*1.2);
    }
    if(anglerState.stage===4) {bobber.x+=Math.sin(t*3.3)*5;bobber.y+=Math.sin(t*4)*2;}
    anglerState.bobber=bobber;
    anglerState.geometry={hand,tip,bobber,catchPose};

    const grade=anglerState.lighting;
    const image=document.getElementById('quietPondBackground');
    const filter=`brightness(${grade.brightness.toFixed(3)}) saturate(${grade.saturation.toFixed(3)}) sepia(${grade.sepia.toFixed(3)})`;
    if(image.style.filter!==filter) image.style.filter=filter;
    drawPondWater(ctx,t,filter);
    if(grade.night>.001) {ctx.fillStyle=`rgba(8,22,57,${grade.night*.24})`;ctx.fillRect(0,0,w,h);}
    ctx.save();tracePondWater(ctx);ctx.clip();
    const limit=innerWidth<600?3:5;
    anglerState.world.fish.slice(0,limit).forEach(f=>{
        const p=PondLife.pose(f,anglerState.world.time);
        drawPondFish(ctx,p.x,p.y,p.size,p.angle,p.opacity,false,p.tail);
    });
    drawPondTargetFish(ctx,bobber,t,caught);
    const ripple=(x,y,radius,opacity)=>{
        ctx.strokeStyle=`rgba(220,243,218,${opacity})`;ctx.lineWidth=1;
        ctx.beginPath();ctx.ellipse(x,y,radius,radius*.3,-.12,0,Math.PI*2);ctx.stroke();
    };
    if(active && cast>.9 && !caught) {
        for(let i=0;i<3;i++) {
            const phase=(t*.35+i/3)%1;
            ripple(bobber.x,bobber.y+6,7+phase*42,(1-phase)*.3);
        }
    }
    anglerState.ripples.forEach(r=>{const age=t-r.born;ripple(r.x,r.y,5+age*25,Math.max(0,1-age/3)*.35);});
    if(anglerState.phaseTime<2 && ['sweep','breakout','bite','hook'].includes(anglerState.snapshot?.effect)) {
        const age=anglerState.phaseTime;ripple(bobber.x,bobber.y+4,8+age*32,Math.max(0,1-age/2)*.45);
    }
    ctx.restore();

    // One continuous tapered rod and one line; every endpoint shares the same geometry.
    const rodPath=()=>{
        const dx=tip.x-hand.x,dy=tip.y-hand.y;
        ctx.beginPath();ctx.moveTo(hand.x,hand.y);
        ctx.bezierCurveTo(hand.x+dx*.33,hand.y+dy*.48-9,hand.x+dx*.78+tension*8,hand.y+dy*.87-14,tip.x,tip.y);
    };
    ctx.lineCap='round';
    rodPath();ctx.strokeStyle='rgba(27,42,30,.5)';ctx.lineWidth=4;ctx.stroke();
    rodPath();ctx.strokeStyle='#996034';ctx.lineWidth=2.5;ctx.stroke();
    rodPath();ctx.strokeStyle='#e6b76c';ctx.lineWidth=.75;ctx.stroke();
    ctx.beginPath();ctx.moveTo(hand.x-7,hand.y+9);ctx.lineTo(hand.x+9,hand.y-13);
    ctx.strokeStyle='#422e22';ctx.lineWidth=4.6;ctx.stroke();
    if(active) {
        ctx.beginPath();ctx.moveTo(tip.x,tip.y);
        const sag=catchPose && catchPose.progress<.12?0:(tension?6:31);
        ctx.quadraticCurveTo((tip.x+bobber.x)/2,(tip.y+bobber.y)/2+sag,bobber.x,bobber.y-9);
        ctx.strokeStyle='rgba(246,239,214,.72)';ctx.lineWidth=.8;ctx.stroke();
        if(catchPose?.attached) {
            ctx.beginPath();ctx.moveTo(bobber.x,bobber.y+6);ctx.lineTo(catchPose.mouth.x,catchPose.mouth.y);
            ctx.strokeStyle='rgba(239,239,213,.8)';ctx.lineWidth=.85;ctx.stroke();
        }
        ctx.save();ctx.translate(bobber.x,bobber.y);
        ctx.fillStyle='rgba(14,51,46,.19)';ctx.beginPath();ctx.ellipse(3,9,6,1.9,0,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#ecc48c';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-11);ctx.lineTo(0,9);ctx.stroke();
        ctx.fillStyle='#e67a54';ctx.beginPath();ctx.ellipse(0,-2,3.6,5.3,0,Math.PI,Math.PI*2);ctx.fill();
        ctx.fillStyle='#f5e7bf';ctx.beginPath();ctx.ellipse(0,-2,3.6,5.3,0,0,Math.PI);ctx.fill();
        ctx.restore();
    }
    if(catchPose) drawPondLanding(ctx,catchPose,t,filter);
    drawPondReeds(ctx,t);
    PondAmbient.draw(ctx,t,image,filter,grade.night);
    drawPondAtmosphere(ctx,t);
}

function drawPondFish(ctx,x,y,size,angle,opacity,golden,tail=0) {
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha=opacity;
    const fill=ctx.createLinearGradient(0,-size*.25,0,size*.25);
    fill.addColorStop(0,golden?'#edce7f':'#54715c');fill.addColorStop(1,golden?'#a57b37':'#173d35');
    ctx.fillStyle=fill;ctx.beginPath();ctx.moveTo(size*.55,0);
    ctx.bezierCurveTo(size*.27,-size*.36,-size*.3,-size*.26,-size*.5,0);
    ctx.bezierCurveTo(-size*.3,size*.25,size*.26,size*.29,size*.55,0);ctx.fill();
    ctx.beginPath();ctx.moveTo(-size*.45,0);ctx.lineTo(-size*.78,-size*.22+tail*size*.11);
    ctx.quadraticCurveTo(-size*.64,tail*size*.1,-size*.78,size*.22+tail*size*.11);ctx.closePath();ctx.fill();
    ctx.strokeStyle=golden?'rgba(255,238,172,.3)':'rgba(151,179,129,.25)';ctx.lineWidth=.8;
    ctx.beginPath();ctx.moveTo(size*.35,-size*.04);ctx.quadraticCurveTo(-size*.1,-size*.14,-size*.44,tail*size*.05);ctx.stroke();
    if(golden) {ctx.fillStyle='#233a2d';ctx.beginPath();ctx.arc(size*.35,-size*.04,1.2,0,Math.PI*2);ctx.fill();}
    ctx.restore();
}

function tracePondWater(ctx) {
    ctx.beginPath();PondLife.water.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();
}

function drawPondWater(ctx,t,filter) {
    const image=document.getElementById('quietPondBackground');
    ctx.save();tracePondWater(ctx);ctx.clip();
    // Move only water pixels. The shore, dock and fisherman stay anchored.
    if(image.complete && image.naturalWidth) {
        ctx.filter=filter;
        for(let y=200;y<645;y+=10) {
            const shift=Math.sin(y*.033+t*.7)*2+Math.sin(y*.071-t*.45)*.85;
            ctx.drawImage(image,0,y/750*image.naturalHeight,image.naturalWidth,10.5/750*image.naturalHeight,shift,y,1000,10.5);
        }
    }
    ctx.filter='none';
    for(let i=0;i<28;i++) {
        const x=330+(i*89)%630+Math.sin(t*.35+i)*12, y=260+(i*43)%350;
        const alpha=.035+Math.sin(t*.9+i*.8)**2*.09;
        ctx.strokeStyle=`rgba(242,238,200,${alpha})`;ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(x-7,y);ctx.quadraticCurveTo(x,y-1.8,x+10+Math.sin(t+i)*3,y);ctx.stroke();
    }
    for(let i=0;i<5;i++) {
        const phase=(t*.09+i*.21)%1,x=420+i*99,y=340+((i*57)%155)+phase*35;
        ctx.strokeStyle=`rgba(184,220,192,${Math.sin(phase*Math.PI)*.085})`;ctx.lineWidth=1;
        ctx.beginPath();ctx.ellipse(x,y,14+phase*24,2+phase*4,-.1,0,Math.PI*1.4);ctx.stroke();
    }
    ctx.restore();
}

function drawPondTargetFish(ctx,bobber,t,caught) {
    if(anglerState.stage<2 || caught) return;
    const outcome=window.PondExecution?.current();
    if(outcome&&outcome.outcome!=='tp') {
        const age=PondExecution.age();
        if(age<2&&outcome.outcome!=='skip')drawPondFish(ctx,650+age*80,440+age*24,31,.25,(1-age/2)*.35,false,Math.sin(t*4));
        return;
    }
    const stage=anglerState.stage, effect=anglerState.snapshot?.effect, age=anglerState.phaseTime;
    const arrival=1-Math.exp(-age*.8);
    let x=bobber.x+16+(1-arrival)*115+Math.sin(t*.8)*10, y=bobber.y+20+Math.cos(t*.7)*6;
    if(effect==='sweep') {x=bobber.x+85+Math.sin(t*1.1)*25;y=bobber.y+45+Math.sin(t)*10;}
    if(effect==='pullback') {x+=Math.sin(age*.8)*20*(1-arrival);y+=35*(1-arrival);}
    if(effect==='breakout') {x+=Math.sin(age*2)*50*Math.exp(-age*.8);}
    if(stage>=3) {
        const returnDistance=stage===3 && effect==='return'?(1-arrival)*85:0;
        x=bobber.x+8+returnDistance+Math.sin(t*2.2)*(stage===4?8:3);y=bobber.y+17+Math.cos(t*1.7)*3;
        if(stage===3&&anglerState.snapshot.setup===2){x+=30*(1-arrival);y+=Math.sin(age*1.8)*12*(1-arrival);}
        if(stage===3&&anglerState.snapshot.setup===4){x+=25*(1-arrival);y+=Math.sin(age*2.1)*3*(1-arrival);}
    }
    const tail=Math.sin(t*(stage===4?10:4));
    drawPondFish(ctx,x,y,31,Math.atan2(bobber.y-y,bobber.x-x),stage>=4?.48:.33,false,tail);
}

function drawPondReeds(ctx,t) {
    ctx.save();ctx.lineCap='round';
    [[910,644,52],[930,667,68],[895,658,43],[56,438,40]].forEach(([x,y,height],i)=>{
        const sway=Math.sin(t*.7+i)*3.5;
        ctx.strokeStyle=i===3?'rgba(142,163,87,.38)':'rgba(166,177,111,.48)';ctx.lineWidth=1.8;
        ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x-11+sway*.4,y-height*.6,x-14+sway,y-height);ctx.stroke();
        ctx.strokeStyle='rgba(224,206,143,.23)';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(x,y-9);ctx.quadraticCurveTo(x+8+sway,y-height*.55,x+15+sway,y-height*.65);ctx.stroke();
    });
    ctx.restore();
}

function readPondSchedule() {
    return PondSchedule.windows;
}

function restorePondPreferences() {
    try {
        anglerState.timeMode=PondClock.normalizeMode(localStorage.getItem('topstep_angler_time_mode'));
        anglerState.motionPaused=localStorage.getItem('topstep_angler_motion_paused')==='true';
        const collapsed=localStorage.getItem('topstep_angler_collapsed')==='true';
        document.getElementById('rusticCanvasContainer').style.display=collapsed?'none':'block';
        const button=document.getElementById('btnToggleAnglerCollapse');
        button.setAttribute('aria-expanded',String(!collapsed));
        button.setAttribute('aria-label',collapsed?'Mở rộng hồ câu':'Thu gọn hồ câu');
        button.title=button.getAttribute('aria-label');
    } catch (_) {}
    updatePondClock(new Date(),true);
    syncAnglerMotion();
}

function updatePondClock(now=new Date(),instant=false) {
    const clock=PondClock.context(now,anglerState.timeMode,readPondSchedule());
    anglerState.clock=clock;anglerState.lightingTarget={...clock.palette};
    if(instant || anglerState.motionPaused || anglerState.reducedMotion) anglerState.lighting={...clock.palette};
    document.getElementById('pondTimeMode').value=clock.mode;
    const period=document.getElementById('pondPeriodText');
    period.textContent=clock.label+(clock.preview?' · Xem thử':'');
    const time=document.getElementById('pondLocalTime');
    time.textContent=clock.clockText+' GMT+7';time.dateTime=now.toISOString();
    const activity=document.getElementById('pondActivityBadge');
    activity.textContent='Lịch dự án · '+clock.activity.label;
    activity.dataset.active=String(clock.activity.active);
    activity.title='Theo giờ thực ở Việt Nam; chọn ánh sáng xem thử không đổi lịch hoạt động.';
    for(let setup=1;setup<=4;setup++) {
        const label=document.querySelector('#checklist-setup-'+setup+' > div:first-child > span:first-child');
        if(label)label.textContent='Theo playbook: '+PondSchedule.describeSetup(setup,now)+' (GMT+7)';
    }
    document.querySelectorAll('[data-pond-schedule]').forEach((card,i)=>{
        const window=PondSchedule.effective(now)[i],heading=card.querySelector('div > strong');
        if(window&&heading)heading.textContent=window.label+' · '+PondSchedule.format(window.start)+'–'+PondSchedule.format(window.end);
    });
    document.dispatchEvent(new Event('pond-clock-updated'));
}

function schedulePondClock() {
    clearTimeout(anglerState.clockTimer);anglerState.clockTimer=null;
    updatePondClock();
    if(anglerState.visible && !document.hidden && document.getElementById('rusticCanvasContainer').style.display!=='none' && document.getElementById('view-checklist').style.display!=='none') {
        anglerState.clockTimer=setTimeout(()=>{schedulePondClock();renderQuietPond();},60000-Date.now()%60000+20);
    }
}

function setPondTimeMode(mode) {
    anglerState.timeMode=PondClock.normalizeMode(mode);
    try {localStorage.setItem('topstep_angler_time_mode',anglerState.timeMode);} catch (_) {}
    updatePondClock();renderQuietPond();
}

function drawPondAtmosphere(ctx,t) {
    const {night,mist}=anglerState.lighting;
    ctx.save();
    if(mist>.001) {
        tracePondWater(ctx);ctx.clip();
        for(let i=0;i<3;i++) {
            const x=480+i*140+Math.sin(t*.09+i)*35,y=340+i*36;
            const fog=ctx.createRadialGradient(x,y,0,x,y,150);
            fog.addColorStop(0,`rgba(216,234,224,${mist*.65})`);fog.addColorStop(1,'rgba(216,234,224,0)');
            ctx.fillStyle=fog;ctx.fillRect(x-150,y-150,300,300);
        }
    }
    ctx.restore();
    if(night<.001) return;
    ctx.save();
    [[137,437,48],[466,122,42]].forEach(([x,y,r])=>{
        const pulse=.95+Math.sin(t*1.3+x)*.05;
        const glow=ctx.createRadialGradient(x,y,1,x,y,r);
        glow.addColorStop(0,`rgba(255,211,120,${night*.82*pulse})`);
        glow.addColorStop(.18,`rgba(246,173,72,${night*.34})`);glow.addColorStop(1,'rgba(246,173,72,0)');
        ctx.fillStyle=glow;ctx.fillRect(x-r,y-r,r*2,r*2);
    });
    for(let i=0;i<7;i++) {
        const x=150+(i*137)%720+Math.sin(t*.23+i)*11, y=160+(i*83)%380+Math.cos(t*.19+i)*8;
        const alpha=(.2+Math.sin(t*.8+i*1.7)**2*.65)*night;
        const glow=ctx.createRadialGradient(x,y,0,x,y,5);
        glow.addColorStop(0,`rgba(241,230,146,${alpha})`);glow.addColorStop(1,'rgba(241,230,146,0)');
        ctx.fillStyle=glow;ctx.fillRect(x-5,y-5,10,10);
    }
    ctx.restore();
}

function drawPondLanding(ctx,pose,t,filter) {
    const {fish,progress:p}=pose;
    const swing=pose.attached?Math.sin(t*12)*.12*(1-p):0;
    const angle=pose.angle+swing;
    const drawX=pose.attached?pose.mouth.x-Math.cos(angle)*20.9:fish.x;
    const drawY=pose.attached?pose.mouth.y-Math.sin(angle)*20.9:fish.y;
    drawPondFish(ctx,drawX,drawY,38,angle,.98,true,Math.sin(t*16)*(1-p));
    // Repaint the existing basket's woven front over the fish as it drops inside.
    if(p>.86) {
        const image=document.getElementById('quietPondBackground');
        if(image.complete && image.naturalWidth) {
            ctx.save();ctx.beginPath();ctx.moveTo(106,493);ctx.lineTo(158,490);ctx.lineTo(158,529);ctx.lineTo(106,529);ctx.closePath();ctx.clip();
            ctx.filter=filter;
            ctx.drawImage(image,0,0,image.naturalWidth,image.naturalHeight,0,0,1000,750);
            ctx.filter='none';
            ctx.fillStyle=`rgba(8,22,57,${anglerState.lighting.night*.24})`;ctx.fillRect(106,490,52,40);
            ctx.restore();
        }
    }
    const splashDuration=.28;
    if(p*PondCatch.duration<splashDuration) {
        const age=p*PondCatch.duration/splashDuration;
        ctx.save();tracePondWater(ctx);ctx.clip();
        for(let i=0;i<6;i++) {
            const theta=i/6*Math.PI*2,spread=8+age*48;
            const x=anglerState.catchOrigin.x+Math.cos(theta)*spread;
            const y=anglerState.catchOrigin.y-18+Math.sin(theta)*spread*.3-Math.sin(age*Math.PI)*44;
            ctx.fillStyle=`rgba(221,244,225,${(1-age)*.6})`;ctx.beginPath();ctx.ellipse(x,y,1.4,3,theta,0,Math.PI*2);ctx.fill();
        }
        ctx.restore();
    }
    const label='Full TP · '+pose.label;
    if(document.getElementById('anglerStatusText').textContent!==label) document.getElementById('anglerStatusText').textContent=label;
    anglerState.fish.state=pose.deposited?'basket':'lifted';
}

function togglePondSize() {
    const card=document.getElementById('rusticAnglerCard');
    const expanded=card.dataset.expanded!=='true';
    card.dataset.expanded=String(expanded);
    document.querySelector('.finpoint-workspace').dataset.pondExpanded=String(expanded);
    const button=document.getElementById('btnPondSize');
    button.setAttribute('aria-pressed',String(expanded));
    button.setAttribute('aria-label',expanded?'Thu nhỏ để quan sát khi tick':'Phóng to hồ câu');
    button.title=button.getAttribute('aria-label');
}
