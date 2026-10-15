/* Pure checklist interpretation, shared by the scene and exhaustive state tests. */
const PondLogic = (() => {
    const setups = {
        1:{name:'CRT · FRVP',steps:['Kéo FRVP Anchor','Kiểm tra vị trí POC','Break POC xác nhận','Vào lệnh & quản trị'],
            status:['Đang quan sát','Đã neo vùng giá','Đang quan sát POC','POC đã có xác nhận','Đã khớp lệnh theo kế hoạch'],
            actions:['Thả câu','Kiểm tra POC','Chờ nến xác nhận','Kiểm tra rủi ro'],effect:['cast','approach','bite','hook']},
        2:{name:'Trend',steps:['Sóng đẩy chủ','Phản ứng tại POC','Đáy mới tại POC','Vào lệnh & quản trị'],
            status:['Đang quan sát','Đã xác định sóng chủ','Đang chờ nhịp hồi','Đã có cấu trúc xác nhận','Đã vào lệnh thuận xu hướng'],
            actions:['Thả câu','Chờ hồi về POC','Chờ đáy mới','Kiểm tra rủi ro'],effect:['cast','pullback','bite','hook']},
        3:{name:'AMD',steps:['Phase A · Tích lũy','Phase M · Bẫy giá','Phase D · Phân phối','Kích hoạt lệnh'],
            status:['Đang quan sát','Đã khoanh vùng tích lũy','Đang quan sát nhịp quét','Đã trở lại vùng xác nhận','Đã kích hoạt lệnh AMD'],
            actions:['Thả câu','Theo dõi nhịp quét','Chờ phân phối','Kích hoạt lệnh'],effect:['cast','sweep','return','hook']},
        4:{name:'Break',steps:['Kéo FRVP hộp nén','Nến break thoát hộp','Nhịp retest giữ giá','Vào lệnh & quản trị'],
            status:['Đang quan sát','Đã khoanh vùng nén','Đã có nhịp phá vỡ','Retest đã giữ vùng giá','Đã vào lệnh sau retest'],
            actions:['Thả câu','Chờ nến break','Chờ retest','Kiểm tra rủi ro'],effect:['cast','breakout','settle','hook']}
    };
    function derive(steps,risk,setup=1) {
        setup=Object.hasOwn(setups,setup)?Number(setup):1;
        steps=Array.from({length:4},(_,i)=>steps?.[i]===true);
        risk=Array.from({length:3},(_,i)=>risk?.[i]===true);
        let phase=0,riskPhase=0;
        while(phase<4 && steps[phase]) phase++;
        // Management records are independent of entry checks and of one another.
        riskPhase=risk[2]?3:risk[1]?2:risk[0]?1:0;
        const checked=steps.filter(Boolean).length;
        const pending=!riskPhase && checked>phase;
        const stage=riskPhase?4+riskPhase:phase, config=setups[setup];
        const status=stage<5?config.status[phase]:['Đã giảm rủi ro · −0.5R','Đã bảo vệ hòa vốn','Full TP · Trọn kỷ luật'][riskPhase-1];
        const action=stage<4?config.actions[phase]:['Theo dõi +1R','Dời SL về BE','Hoàn tất TP','Bắt đầu lượt mới'][riskPhase];
        return {setup,steps,risk,phase,riskPhase,stage,checked,pending,status,action,
            fishState:['idle','idle','approaching','nibbling','hooked','tiring','settled','lifted'][stage],
            effect:stage===0?'idle':stage<=4?config.effect[phase-1]:['ease','protect','catch'][riskPhase-1],
            nextLabel:stage<4?config.steps[phase]:['Theo dõi +1R','Dời SL về BE','Hoàn tất TP','Bắt đầu lượt mới'][riskPhase],
            setupName:config.name};
    }
    return {derive,setups};
})();
if(typeof module!=='undefined' && module.exports) module.exports=PondLogic;
