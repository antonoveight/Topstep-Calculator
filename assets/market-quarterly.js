/* Time context from Daye's published cycle convention; no price or bias inference. */
const QuarterlyTheory=(()=>{
    const T=typeof MarketTime!=='undefined'?MarketTime:require('./market-time.js');
    const sessions=['Asia','London','NY AM','NY PM'];
    const format=min=>{const m=((min%1440)+1440)%1440,s=Math.round((m%1)*60);return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(Math.floor(m%60)).padStart(2,'0')}${s?':'+String(s).padStart(2,'0'):''}`;};
    function state(instant=new Date()){
        const p=T.parts(instant,T.NY),minute=p.hour*60+p.minute+p.second/60,elapsed=(minute-1080+1440)%1440;
        const dayQ=Math.floor(elapsed/360)+1,ninetyQ=Math.floor((elapsed%360)/90)+1,microQ=Math.floor((elapsed%90)/22.5)+1;
        const dayDate=p.hour>=18?p:T.addDay(p,-1),sessionStart=1080+(dayQ-1)*360,ninetyStart=sessionStart+(ninetyQ-1)*90,microStart=ninetyStart+(microQ-1)*22.5;
        return {day:{quarter:dayQ,session:sessions[dayQ-1],start:sessionStart,end:sessionStart+360},
            ninety:{quarter:ninetyQ,start:ninetyStart,end:ninetyStart+90},micro:{quarter:microQ,start:microStart,end:microStart+22.5},
            trueOpens:{day:T.atMinute(dayDate,1440,T.NY),session:T.atMinute(dayDate,sessionStart+90,T.NY),micro:T.atMinute(dayDate,ninetyStart+22.5,T.NY)}};
    }
    function segments(size,zone,refDate=new Date()){
        const items=[];
        for(let i=0;i<1440/size;i++){
            const start=(1080+i*size)%1440,q=i%4+1,dayQ=Math.floor(i*size/360)+1;
            const projection=T.projectNY(start,start+size,zone,refDate);
            items.push({key:size===360?String(q):`${dayQ}-${q}`,quarter:q,dayQuarter:dayQ,start,end:start+size,session:sessions[dayQ-1],...projection});
        }
        return items;
    }
    return {state,segments,format,sessions};
})();
const MarketQuarterly=(()=>{
    let enabled=false;
    const source='https://www.tradingview.com/script/n2aeO1GB-Daye-Quarterly-Theory-by-toodegrees/';
    function mount(controller){
        if(document.getElementById('marketHoursQuarterlyToggle'))return;
        try{enabled=localStorage.getItem('topstep_market_hours_quarterly')==='true';}catch{}
        const toggle=document.createElement('label');toggle.className='qt-toggle';toggle.innerHTML='<input id="marketHoursQuarterlyToggle" type="checkbox"> Quarterly Theory';
        document.getElementById('marketHoursIctToggle').closest('label').parentElement.after(toggle);
        const panel=document.createElement('section');panel.id='quarterlyContext';panel.className='qt-context';panel.hidden=!enabled;
        panel.innerHTML='<div class="qt-heading"><div><span class="desk-eyebrow">QUARTERLY THEORY · DAYE</span><h3>Ngữ cảnh chu kỳ thời gian</h3></div><span id="qtClockMode"></span></div><div class="qt-context-grid"><div><span>Quý trong ngày · 6 giờ</span><strong id="qtDayState"></strong><small id="qtDayRange"></small></div><div><span>Quý trong phiên · 90 phút</span><strong id="qtNinetyState"></strong><small id="qtNinetyRange"></small></div><div><span>Micro · 22,5 phút</span><strong id="qtMicroState"></strong><small id="qtMicroRange"></small></div></div><div id="qtTrueOpens" class="qt-true-opens"></div><details><summary>Cách đọc Quarterly Theory</summary><p>Mỗi chu kỳ chia bốn quý Q1–Q4. True Open là thời điểm bắt đầu Q2 của chu kỳ tương ứng. Quý thời gian không tự xác nhận tích lũy, quét hay phân phối trên giá; tiếp tục dùng bias, CRT, FRVP và điều kiện entry của bạn.</p><p>Hiển thị mốc giờ True Open; giá mở cửa cần đối chiếu trên chart. Các khối QT là quy ước thời gian, không phải lịch mở cửa sở giao dịch.</p><a href="'+source+'" target="_blank" rel="noopener noreferrer">Nguồn: Daye × toodegrees ↗</a></details>';
        document.getElementById('marketHoursInteractiveTrack').parentElement.after(panel);
        const input=document.getElementById('marketHoursQuarterlyToggle');input.checked=enabled;
        input.onchange=()=>{enabled=input.checked;try{localStorage.setItem('topstep_market_hours_quarterly',String(enabled));}catch{}panel.hidden=!enabled;controller.render();};
    }
    function rows(controller,now){
        if(!enabled)return {left:'',right:''};
        let left='',right='';
        for(const [size,label] of [[360,'QT · Ngày / 6h'],[90,'QT · Phiên / 90m']]){
            left+=`<div class="qt-row-label">${label}</div>`;
            let bars='';
            for(const item of QuarterlyTheory.segments(size,controller.selectedTimezone,now))for(const interval of item.intervals){
                const code=size===360?`Q${item.quarter} · ${item.session}`:`Q${item.quarter}`;
                const title=`${item.session} · Q${item.quarter} · ${QuarterlyTheory.format(item.start)}–${QuarterlyTheory.format(item.end)} New York`;
                bars+=`<span class="qt-segment qt-q${item.quarter}" data-qt-size="${size}" data-qt-key="${item.key}" data-qt-start="${interval.start}" data-qt-end="${interval.end}" title="${title}" style="left:${interval.start/14.4}%;width:${(interval.end-interval.start)/14.4}%">${code}</span>`;
            }
            for(const minute of size===360?[0]:[1170,90,450,810]){
                const projection=MarketTime.projectNY(minute,minute+1,controller.selectedTimezone,now),position=projection.startMin;
                if(position!==null)bars+=`<span class="qt-open-marker" data-qt-open="${size===360?'day':'session'}" style="left:${position/14.4}%" title="${size===360?'True Day Open':'True Session Open'} · ${QuarterlyTheory.format(minute)} New York">${size===360?'<small>TDO</small>':''}</span>`;
            }
            right+=`<div class="qt-track" data-qt-track="${size}">${bars}</div>`;
        }
        return {left,right};
    }
    function update(controller,now){
        if(!enabled)return;
        const instant=controller.isLive?now:MarketTime.selectedInstant(controller.scrubMinuteOfDay,controller.selectedTimezone,now);
        if(!instant)return;
        const state=QuarterlyTheory.state(instant),format=QuarterlyTheory.format;
        const set=(id,text)=>{const el=document.getElementById(id);if(el&&el.textContent!==text)el.textContent=text;};
        set('qtClockMode',controller.isLive?'Hiện tại':'Xem thử trên timeline');
        for(const [name,value] of [['Day',state.day],['Ninety',state.ninety],['Micro',state.micro]]){
            set('qt'+name+'State',`Q${value.quarter}${name==='Day'?' · '+value.session:''}`);
            set('qt'+name+'Range',`${format(value.start)}–${format(value.end)} NY`);
        }
        const fmt=new Intl.DateTimeFormat('vi-VN',{timeZone:controller.selectedTimezone,day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
        const opens=[['True Day Open',state.trueOpens.day],['True Session Open',state.trueOpens.session],['Micro True Open',state.trueOpens.micro]].map(([label,date])=>`${label}: ${date?fmt.format(date):'—'}`).join(' · ');
        set('qtTrueOpens',opens+' · '+controller.selectedTimezone);
        document.querySelectorAll('[data-qt-key]').forEach(el=>{
            const key=el.dataset.qtSize==='360'?String(state.day.quarter):`${state.day.quarter}-${state.ninety.quarter}`;
            const active=el.dataset.qtKey===key&&controller.scrubMinuteOfDay>=Number(el.dataset.qtStart)&&controller.scrubMinuteOfDay<Number(el.dataset.qtEnd);
            if(el.classList.contains('is-active')!==active)el.classList.toggle('is-active',active);
        });
    }
    return {mount,rows,update,get enabled(){return enabled;}};
})();
if(typeof window!=='undefined')window.MarketQuarterly=MarketQuarterly;
if(typeof module!=='undefined')module.exports=QuarterlyTheory;
