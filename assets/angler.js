/* Quiet Pond — approved illustrated background with a resolution-independent Canvas layer. */
let anglerState = {
    stepCount:0, isRisk1r:false, isRisk2r:false, isRiskTp:false,
    isLoopRunning:false, audioEnabled:false, audioCtx:null,
    motionPaused:false, motionMode:'system', reducedMotion:false, visible:false, rafId:null,
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
    restoreAnglerMotionPreference();
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    anglerState.reducedMotion=media.matches;
    media.addEventListener('change',e=>{anglerState.reducedMotion=e.matches; syncAnglerMotion();});
    const stage=document.getElementById('rusticCanvasContainer');
    const resize=()=>{
        const width=stage.getBoundingClientRect().width;
        if(width>0) {
            const ratio=Math.min(window.devicePixelRatio || 1,PondScene.light()?1.25:2);
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
        const view=wide?PondScene.viewport(rect.width,rect.height,document.getElementById('rusticAnglerCard').dataset.studio==='true'):{scale:rect.width/1000,x:0,y:0};
        const x=(event.clientX-rect.left-view.x)/view.scale;
        const y=(event.clientY-rect.top-view.y)/view.scale;
        if(PondLife.contains([x,y])) {
            anglerState.ripples.push({x,y,born:anglerState.time});
            anglerState.ripples=anglerState.ripples.slice(-8);
            playAnglerSound('plop');
            renderQuietPond();
        }
    });
    const image=document.getElementById('quietPondBackground');
    const showImageError=()=>{if(!PondScene.ready())stage.classList.add('pond-image-error');};
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

function restoreAnglerMotionPreference() {
    try {
        const value=localStorage.getItem('topstep_angler_motion_paused');
        anglerState.motionMode=value==='true'?'off':value==='false'?'on':'system';
        anglerState.motionPaused=anglerState.motionMode==='off';
    }catch (_) {}
}

function isAnglerMotionPaused() {
    return anglerState.motionPaused||(anglerState.motionMode!=='on'&&anglerState.reducedMotion);
}

function syncAnglerMotion() {
    const stage=document.getElementById('rusticCanvasContainer');
    if(!stage || !anglerState.isLoopRunning) return;
    const bounds=stage.getBoundingClientRect(),ratio=Math.min(window.devicePixelRatio||1,PondScene.light()?1.25:2);
    if(bounds.width>0&&bounds.height>0){
        const canvas=document.getElementById('rusticAnglerCanvas'),width=Math.round(bounds.width*ratio),height=Math.round(bounds.height*ratio);
        if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
    }
    const animate=anglerState.visible && !document.hidden && stage.style.display!=='none' &&
        document.getElementById('view-checklist').style.display!=='none' && !isAnglerMotionPaused();
    const button=document.getElementById('btnToggleAnglerMotion');
    const paused=isAnglerMotionPaused();
    schedulePondClock();
    button.setAttribute('aria-pressed',String(paused));
    button.setAttribute('aria-label',paused&&anglerState.motionMode==='system'&&anglerState.reducedMotion ? 'Bật chuyển động cho hồ (hệ thống đang giảm chuyển động)' : (paused ? 'Tiếp tục chuyển động' : 'Tạm dừng chuyển động'));
    button.title=button.getAttribute('aria-label');
    button.disabled=false;
    const mode=document.getElementById('pondMotionMode');if(mode)mode.value=anglerState.motionMode;
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
    if(anglerState.lastFrame && timestamp-anglerState.lastFrame<1000/PondScene.fps()-1) {
        anglerState.rafId=requestAnimationFrame(quietPondLoop);return;
    }
    const dt=anglerState.lastFrame ? Math.min((timestamp-anglerState.lastFrame)/1000,.05) : 0;
    anglerState.lastFrame=timestamp;
    anglerState.time+=dt;
    anglerState.frameCount++;
    PondLife.step(anglerState.world,dt,PondScene.light());
    for(const key of Object.keys(anglerState.lighting)) {
        anglerState.lighting[key]+=(anglerState.lightingTarget[key]-anglerState.lighting[key])*Math.min(1,dt*1.4);
    }
    anglerState.phaseTime+=dt;
    anglerState.rodBend+=(getPondBend()-anglerState.rodBend)*Math.min(1,dt*5);
    anglerState.reelAmount+=((anglerState.stage>=6?1:0)-anglerState.reelAmount)*Math.min(1,dt*2);
    const beforeCast=anglerState.castProgress;
    anglerState.castProgress=Math.min(1,anglerState.castProgress+dt/PondCast.duration);
    if(beforeCast<1&&anglerState.castProgress===1&&anglerState.stage>0&&anglerState.stage<4){
        const anchor=PondBehavior.anchor(anglerState.snapshot?.setup);
        anglerState.ripples.push({...anchor,born:anglerState.time});
    }
    anglerState.catchProgress=anglerState.stage===7?Math.min(1,anglerState.catchProgress+dt/PondCatch.duration):0;
    anglerState.ripples=anglerState.ripples.filter(r=>anglerState.time-r.born<3);
    renderQuietPond();
    anglerState.rafId=requestAnimationFrame(quietPondLoop);
}

function toggleAnglerMotion() {
    setAnglerMotionMode(isAnglerMotionPaused()?'on':'off');
}

function setAnglerMotionMode(mode) {
    if(!['system','on','off'].includes(mode))return;
    anglerState.motionMode=mode;anglerState.motionPaused=mode==='off';
    try {localStorage.setItem('topstep_angler_motion_paused',mode==='system'?'system':String(mode==='off'));} catch (_) {}
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
    return result&&!PondExecution.isCatch(result) ? .04 : [0,0,.08,.28,1,.65,.35,.2][anglerState.stage];
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
        anglerState.motionFrom=restored||!advance?null:anglerState.geometry?.motion;
        anglerState.phaseTime=advance?0:99;
        anglerState.castProgress=advance && prev.stage===0 && next.stage<4?0:(next.stage>0?1:0);
        anglerState.catchProgress=advance && next.stage===7?0:(next.stage===7?1:0);
        if(advance && next.stage===7) {
            anglerState.catchOrigin={x:anglerState.bobber.x,y:anglerState.bobber.y+24};
            if(!prev || prev.stage===0 || anglerState.geometry?.castPose){
                const anchor=PondBehavior.anchor(next.setup);
                anglerState.catchOrigin={x:anchor.x,y:anchor.y+24};
            }
        }
        if(restored || !advance) {
            anglerState.rodBend=getPondBend();anglerState.reelAmount=next.stage>=6?1:0;
            anglerState.ripples=[];
        }
    }
    anglerState.lastEffect=null;
    if(advance) {
        anglerState.lastEffect=next.effect;anglerState.transitionSerial++;
        if(next.phase>0&&!(prev.stage===0&&next.stage<4)) anglerState.ripples.push({...PondBehavior.anchor(next.setup),born:anglerState.time});
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
    if(isAnglerMotionPaused()) {
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
        const view=PondScene.viewport(canvas.width,canvas.height,document.getElementById('rusticAnglerCard').dataset.studio==='true');
        ctx.setTransform(view.scale,0,0,view.scale,view.x,view.y);
    } else ctx.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);
    ctx.clearRect(0,0,w,h);
    const grade=anglerState.lighting;
    const image=document.getElementById('quietPondBackground');
    const filter=`brightness(${grade.brightness.toFixed(2)}) saturate(${grade.saturation.toFixed(2)}) sepia(${grade.sepia.toFixed(2)})`;
    const sceneBase=PondScene.base(filter),layered=!!sceneBase;
    canvas.dataset.layered=String(layered);
    if(layered)document.getElementById('rusticCanvasContainer').classList.remove('pond-image-error');
    if(image.style.filter!==filter)image.style.filter=filter;
    if(layered)ctx.drawImage(sceneBase,0,0,w,h);
    const outcome=window.PondExecution?.current(),manual=outcome?.outcome==='manual',ended=outcome&&!PondExecution.isCatch(outcome);
    const loss=outcome&&['half','sl'].includes(outcome.outcome);
    const lossAge=loss?(isAnglerMotionPaused()?99:PondExecution.age()):0;
    if(manual)anglerState.catchProgress=isAnglerMotionPaused()?1:Math.min(1,PondExecution.age()/PondCatch.duration);
    if(ended)anglerState.fish.state=PondExecution.age()<2?'departing':'idle';
    const parked=ended&&PondExecution.age()>=1.4||(anglerState.stage===7||manual)&&anglerState.catchProgress>=1;
    const active=anglerState.stage>0&&(!ended||PondExecution.age()<1.4)&&!parked;
    const cast=(1-Math.pow(1-anglerState.castProgress,3))*(ended?Math.max(0,1-PondExecution.age()/1.4):1);
    const caught=anglerState.stage===7||manual;
    const fishProfile=PondFish.profile(window.PondExecution?.fishSeed()??1,manual?outcome.catchStage:anglerState.stage);
    anglerState.fishProfile=fishProfile;
    const catchPath=caught?PondCatch.sample(anglerState.catchProgress,anglerState.catchOrigin,0):null;
    const exposed=catchPath?PondFish.reveal(catchPath.progress,anglerState.catchOrigin.y,catchPath.fish.y):0;
    const hiddenMouth=PondFish.shadow.size*PondFish.shadow.mouth;
    const mouthOffset=hiddenMouth+(fishProfile.size*fishProfile.mouth-hiddenMouth)*exposed;
    const catchPose=caught?PondCatch.sample(anglerState.catchProgress,anglerState.catchOrigin,mouthOffset):null;
    anglerState.catchPose=catchPose;
    const tension=anglerState.rodBend;
    const motion=active&&!caught?PondBehavior.motion(anglerState.snapshot,t,anglerState.phaseTime,PondScene.gain(),anglerState.motionFrom):PondBehavior.motion(null,t,99);
    const casting=active&&!ended&&!caught&&anglerState.castProgress<1;
    const anchor=PondBehavior.anchor(anglerState.snapshot?.setup);
    const action={...motion,lean:motion.lean+(casting?-Math.sin(anglerState.castProgress*Math.PI*2)*.022*PondScene.gain():0)};
    // Anchors are aligned to the hands and perspective in quiet-pond.png (1448 × 1086).
    const actor=PondScene.pose(t,anglerState.stage,parked,PondScene.gain(),action);
    const hand=layered?actor.hand:{x:303,y:439};
    const idleSway=Math.sin(t*1.1)*1.8*PondScene.gain();
    const tip=parked?{x:460,y:515}:catchPose?catchPose.tip:{x:active?477+tension*8+motion.tipX:460+idleSway*.4,y:active?296+tension*31+motion.tipY:321+idleSway};
    const castPose=casting?PondCast.sample(anglerState.castProgress,hand,tip,anchor,anglerState.snapshot.setup,PondScene.gain()):null;
    const lossPose=loss?PondLoss.sample(outcome.outcome,lossAge,hand,{x:anchor.x,y:anchor.y+24}):null;
    if(lossPose)Object.assign(tip,lossPose.tip);
    anglerState.lossPose=lossPose;
    if(castPose)Object.assign(tip,castPose.tip);
    const bobber=castPose?{...castPose.bobber}:catchPose?catchPose.float:{x:hand.x+(anchor.x-hand.x)*cast-anglerState.reelAmount*22,
        y:hand.y+(anchor.y-hand.y)*cast-Math.sin(cast*Math.PI)*94+Math.sin(t*1.8)*1.6};
    if(!caught){bobber.x+=motion.bobberX;bobber.y+=motion.bobberY;}
    anglerState.bobber=bobber;
    anglerState.geometry={hand,tip,bobber,catchPose,castPose,motion};

    drawPondWater(ctx,t,filter);
    if(grade.night>.001) {ctx.fillStyle=`rgba(8,22,57,${grade.night*.24})`;ctx.fillRect(0,0,w,h);}
    ctx.save();tracePondWater(ctx);ctx.clip();
    const limit=PondScene.light()?3:5;
    anglerState.world.fish.slice(0,limit).forEach(f=>{
        const p=PondLife.pose(f,anglerState.world.time);
        ctx.save();ctx.translate(p.x+3,p.y+5);ctx.rotate(p.angle);ctx.fillStyle=`rgba(6,34,30,${p.opacity*.3})`;
        ctx.beginPath();ctx.ellipse(0,0,p.size*.6,p.size*.17,0,0,Math.PI*2);ctx.fill();ctx.restore();
        drawPondFish(ctx,p.x,p.y,p.size,p.angle,p.opacity,false,p.tail);
        if(p.surface>.72&&p.opacity>.12){
            ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.strokeStyle=`rgba(210,234,209,${p.opacity*.32})`;ctx.lineWidth=.8;
            for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(-p.size*.6,side*4);ctx.quadraticCurveTo(-p.size,side*8,-p.size*1.2,side*7);ctx.stroke();}ctx.restore();
        }
    });
    drawPondTargetFish(ctx,bobber,t,caught||casting||loss);
    const ripple=(x,y,radius,opacity)=>{
        ctx.strokeStyle=`rgba(220,243,218,${opacity})`;ctx.lineWidth=1;
        ctx.beginPath();ctx.ellipse(x,y,radius,radius*.3,-.12,0,Math.PI*2);ctx.stroke();
    };
    if(active && cast>.9 && !caught && !casting) {
        for(let i=0;i<3;i++) {
            const phase=(t*(anglerState.stage===4?.85:.3)+i/3)%1;
            const spread=anglerState.stage===3?10:anglerState.stage===4?45:anglerState.stage===5?24:42;
            const strength=anglerState.stage===3?.07+motion.nibble*.2:anglerState.stage===4?.42:anglerState.stage===5?.19:.3;
            ripple(bobber.x,bobber.y+6,4+phase*spread,(1-phase)*strength);
        }
        if(motion.wake>0){
            ctx.strokeStyle=`rgba(221,241,219,${motion.wake*.33})`;ctx.lineWidth=.9;
            for(const side of [-1,1]){
                ctx.beginPath();ctx.moveTo(bobber.x-3,bobber.y+side*3);
                ctx.quadraticCurveTo(bobber.x+13,bobber.y+side*7,bobber.x+30,bobber.y+side*10);ctx.stroke();
            }
        }
    }
    anglerState.ripples.forEach(r=>{const age=t-r.born;ripple(r.x,r.y,5+age*25,Math.max(0,1-age/3)*.35);});
    if(anglerState.phaseTime<2 && ['sweep','breakout','bite','hook'].includes(anglerState.snapshot?.effect)) {
        const age=anglerState.phaseTime;ripple(bobber.x,bobber.y+4,8+age*32,Math.max(0,1-age/2)*.45);
    }
    ctx.restore();

    PondFish.drawBasket(ctx,false,grade.night);
    const castBehind=castPose&&anglerState.castProgress<.44;
    if(layered&&!castBehind)PondScene.drawActor(ctx,actor,filter);

    // One continuous tapered rod and one line; every endpoint shares the same geometry.
    const rodPath=()=>{
        const dx=tip.x-hand.x,dy=tip.y-hand.y;
        ctx.beginPath();ctx.moveTo(hand.x,hand.y);
        ctx.bezierCurveTo(hand.x+dx*.33,hand.y+dy*.48-9,hand.x+dx*.78+tension*8+motion.curve,hand.y+dy*.87-14+motion.curve*.35,tip.x,tip.y);
    };
    ctx.lineCap='round';
    rodPath();ctx.strokeStyle='rgba(27,42,30,.5)';ctx.lineWidth=4;ctx.stroke();
    rodPath();ctx.strokeStyle='#996034';ctx.lineWidth=2.5;ctx.stroke();
    rodPath();ctx.strokeStyle='#e6b76c';ctx.lineWidth=.75;ctx.stroke();
    const rodAngle=Math.atan2(tip.y-hand.y,tip.x-hand.x),ux=Math.cos(rodAngle),uy=Math.sin(rodAngle);
    ctx.beginPath();ctx.moveTo(hand.x-ux*18,hand.y-uy*18);ctx.lineTo(hand.x+ux*10,hand.y+uy*10);
    ctx.strokeStyle='#422e22';ctx.lineWidth=4.6;ctx.stroke();
    ctx.save();ctx.translate(hand.x-ux*9-uy*4,hand.y-uy*9+ux*4);
    ctx.fillStyle='#63513b';ctx.strokeStyle='#c4a370';ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(0,0,4,3,rodAngle,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();
    if(layered){
        if(castBehind)PondScene.drawActor(ctx,actor,filter);
        PondScene.drawGrip(ctx,actor,filter);
    }
    if(active&&!loss) {
        ctx.beginPath();ctx.moveTo(tip.x,tip.y);
        const sag=catchPose?(catchPose.progress<.12?0:6):motion.lineSag;
        ctx.quadraticCurveTo(castPose?castPose.line.x:(tip.x+bobber.x)/2,castPose?castPose.line.y:(tip.y+bobber.y)/2+sag,bobber.x,bobber.y-9);
        ctx.strokeStyle='rgba(246,239,214,.72)';ctx.lineWidth=.8;ctx.stroke();
        if(catchPose?.attached) {
            ctx.beginPath();ctx.moveTo(bobber.x,bobber.y+6);ctx.lineTo(catchPose.mouth.x,catchPose.mouth.y);
            ctx.strokeStyle='rgba(239,239,213,.8)';ctx.lineWidth=.85;ctx.stroke();
        }
        ctx.save();ctx.translate(bobber.x,bobber.y+motion.dip);ctx.rotate(motion.floatAngle);
        ctx.globalAlpha=1-motion.dip*.045;
        ctx.fillStyle='rgba(14,51,46,.19)';ctx.beginPath();ctx.ellipse(3,9,6,1.9,0,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#ecc48c';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-11);ctx.lineTo(0,9);ctx.stroke();
        ctx.fillStyle='#e67a54';ctx.beginPath();ctx.ellipse(0,-2,3.6,5.3,0,Math.PI,Math.PI*2);ctx.fill();
        ctx.fillStyle='#f5e7bf';ctx.beginPath();ctx.ellipse(0,-2,3.6,5.3,0,0,Math.PI);ctx.fill();
        ctx.restore();
    }
    const creel=window.PondExecution?.creel()||[];
    canvas.dataset.creelCount=String(creel.length);
    PondFish.drawCreel(ctx,creel,catchPose&&!catchPose.deposited?outcome?.id:null);
    if(catchPose) drawPondLanding(ctx,catchPose,t,filter);
    if(lossPose){
        PondLoss.draw(ctx,lossPose,PondFish.profile(outcome.fishSeed??1,outcome.catchStage??4));
        const label=lossPose.kind==='sl'?(lossPose.broken?'Gãy ngọn cần · Lượt câu kết thúc':'Cần đang chịu lực'):
            !lossPose.broken?'Giật cá · Cước đang căng':lossPose.age<1.8?'Đứt cước · Cá thoát về hồ':'Cá đã thoát · Lượt câu kết thúc';
        const status=document.getElementById('anglerStatusText');if(status.textContent!==label)status.textContent=label;
    }
    PondFish.drawBasket(ctx,true,grade.night);
    if(!layered)drawPondReeds(ctx,t);
    PondScene.drawForeground(ctx,t,filter,grade.night);
    PondAmbient.draw(ctx,t,image,filter,grade.night,layered);
    drawPondAtmosphere(ctx,t);
    window.PondPublic?.refresh();
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
    const original=document.getElementById('quietPondBackground'),source=PondScene.base(filter)||original;
    ctx.save();ctx.filter=source===original?filter:'none';
    if(source.complete===false||source instanceof HTMLImageElement&&!source.naturalWidth){ctx.restore();return;}
    PondWater.draw(ctx,source,t,PondScene.gain(),PondScene.light());
    ctx.restore();
}

function drawPondTargetFish(ctx,bobber,t,caught) {
    if(anglerState.stage<2 || caught) return;
    const outcome=window.PondExecution?.current();
    if(outcome&&!PondExecution.isCatch(outcome)) {
        const age=PondExecution.age();
        if(age<2&&outcome.outcome!=='skip')PondFish.drawShadow(ctx,650+age*80,440+age*24,.25,(1-age/2)*PondFish.shadow.opacity,Math.sin(t*4));
        return;
    }
    const fish=PondBehavior.target(anglerState.snapshot,bobber,t,anglerState.phaseTime);
    if(fish){
        const profile=PondFish.shadow;
        if(anglerState.stage>=4){
            const mouth={x:fish.x+Math.cos(fish.angle)*profile.size*profile.mouth,y:fish.y+Math.sin(fish.angle)*profile.size*profile.mouth};
            ctx.strokeStyle='rgba(224,240,215,.32)';ctx.lineWidth=.65;
            ctx.beginPath();ctx.moveTo(bobber.x,bobber.y+8);ctx.lineTo(mouth.x,mouth.y);ctx.stroke();
        }
        PondFish.drawShadow(ctx,fish.x,fish.y,fish.angle,profile.opacity,fish.tail);
    }

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
        restoreAnglerMotionPreference();
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
    if(instant || isAnglerMotionPaused()) anglerState.lighting={...clock.palette};
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
    [[57,437,48],[466,122,42]].forEach(([x,y,r])=>{
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
    const profile=anglerState.fishProfile,offset=profile.size*profile.mouth;
    const drawX=pose.attached?pose.mouth.x-Math.cos(angle)*offset:fish.x;
    const drawY=pose.attached?pose.mouth.y-Math.sin(angle)*offset:fish.y;
    ctx.save();
    if(p>.9){
        const b=PondFish.basket;
        ctx.beginPath();ctx.ellipse(b.x,b.y,b.rx-3,b.ry-3,0,0,Math.PI*2);ctx.clip();
    }
    const reveal=PondFish.reveal(p,anglerState.catchOrigin.y,fish.y);
    if(!pose.deposited&&reveal<1){
        const offset=PondFish.shadow.size*PondFish.shadow.mouth;
        PondFish.drawShadow(ctx,pose.mouth.x-Math.cos(angle)*offset,pose.mouth.y-Math.sin(angle)*offset,angle,PondFish.shadow.opacity*(1-reveal),Math.sin(t*16));
    }
    if(!pose.deposited&&reveal>0){
        ctx.save();
        if(p<.065){ctx.beginPath();ctx.rect(0,0,1000,Math.max(0,anglerState.catchOrigin.y-18));ctx.clip();}
        PondFish.draw(ctx,drawX,drawY,{...profile,size:profile.size*(1-.3*Math.max(0,Math.min(1,(p-.81)/.13)))},angle,.98*reveal,Math.sin(t*16)*(1-p));
        ctx.restore();
    }
    ctx.restore();
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
    const label=(window.PondExecution?.current()?.outcome==='manual'?'Đóng thủ công':'Full TP')+' · '+pose.label;
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
