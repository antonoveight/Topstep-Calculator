/* Pure checklist interpretation, shared by the scene and exhaustive state tests. */
const PondLogic = (() => {
    const legacyNames={1:'CRT · FRVP (cũ)',2:'Trend (cũ)',3:'AMD (cũ)',4:'Break (cũ)'};
    const schema='htf-v1';
    const steps=['Xác nhận cấu trúc HTF','Chốt kịch bản HTF','Xác nhận entry LTF','Đã vào lệnh theo kế hoạch'];
    const config=(name,visual,effect)=>({name,visual,steps,effect,status:['Đang quan sát HTF','Đã xác nhận cấu trúc HTF','Đã chọn kịch bản HTF','Đã xác nhận entry LTF','Đã ghi nhận vào lệnh'],actions:['Đánh dấu HTF','Chốt kịch bản','Chờ entry LTF','Ghi nhận vào lệnh']});
    const setups={5:config('CRT · HTF',1,['cast','approach','bite','hook']),6:config('Engulfing / Outside · HTF',2,['cast','pullback','bite','hook']),7:config('Inside Bar · HTF',4,['cast','breakout','settle','hook'])};
    function name(id){return setups[id]?.name||(legacyNames[id]||'Chưa phân loại');}
    function visual(id){return setups[id]?.visual||Number(id)||1;}
    function derive(steps,risk,setup=5) {
        setup=Object.hasOwn(setups,setup)?Number(setup):5;
        steps=Array.from({length:4},(_,i)=>steps?.[i]===true);
        risk=Array.from({length:3},(_,i)=>risk?.[i]===true);
        let phase=0,riskPhase=0;
        while(phase<4 && steps[phase]) phase++;
        // Management records are independent of entry checks and of one another.
        riskPhase=risk[2]?3:risk[1]?2:risk[0]?1:0;
        const checked=steps.filter(Boolean).length;
        const pending=!riskPhase && checked>phase;
        const stage=riskPhase?4+riskPhase:phase, config=setups[setup];
        const status=stage<5?config.status[phase]:['Đang giữ SL theo kế hoạch','Đã ghi nhận trailing cấu trúc','Đã ghi nhận Full TP'][riskPhase-1];
        const management=['Theo dõi lệnh','Ghi nhận trailing cấu trúc','Ghi nhận Full TP','Bắt đầu lượt mới'];
        const action=stage<4?config.actions[phase]:management[riskPhase];
        return {setup,steps,risk,phase,riskPhase,stage,checked,pending,status,action,
            fishState:['idle','idle','approaching','nibbling','hooked','tiring','settled','lifted'][stage],
            effect:stage===0?'idle':stage<=4?config.effect[phase-1]:['ease','protect','catch'][riskPhase-1],
            nextLabel:stage<4?config.steps[phase]:management[riskPhase],
            setupName:config.name};
    }
    return {derive,setups,schema,name,visual};
})();
if(typeof module!=='undefined' && module.exports) module.exports=PondLogic;
