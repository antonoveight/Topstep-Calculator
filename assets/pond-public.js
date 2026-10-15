/* Compact broadcast copy. Journal/account data and chart pixels remain independent. */
const PondPublic=(()=>{
    function copy(stage=0,record=null,rest=false,reeling=false,pending=false){
        const status=reeling?'Reeling in':rest?'Session paused':record?.outcome==='skip'?'Skipped':record?.outcome==='half'?'Line broke':record?.outcome==='sl'?'Rod broke':record?'Close logged':pending?'Checks pending':stage===0?'Watching':stage<4?'Waiting':'Managing';
        const action=rest?'Paused':record?'New round':pending?'Mark check':['Cast','Observe','Mark check','Log entry','Log +1R','Log BE','Log TP','New round'][stage]||'Observe';
        return {status,action};
    }
    let source='',wasWide=false,mounted=false;
    const $=id=>document.getElementById(id);
    function setText(node,text){if(node&&node.textContent!==text)node.textContent=text;}
    function setSource(value){source=['combine','xfa'].includes(value)?value:'';refresh();}
    function refresh(){
        if(!mounted)return;
        const card=$('rusticAnglerCard'),wide=card.dataset.fullscreen==='true'||card.dataset.studio==='true';
        const record=PondExecution.current(),rest=window.PondLive?.shouldRest()||false,snapshot=anglerState.snapshot;
        const reeling=PondExecution.isCatch(record)&&anglerState.catchProgress<1;
        const text=copy(snapshot?.stage||0,record,rest,reeling,snapshot?.pending);
        setText($('pondPublicState'),text.status);setText($('pondPublicAction'),text.action);
        setText($('pondPublicSource'),source==='combine'?'COMBINE · SIMULATED':source==='xfa'?'XFA · SIMULATED':'SOURCE NOT CONFIRMED');
        for(const id of ['pondSourceType','studioSourceType'])if($(id)&&$(id).value!==source)$(id).value=source;
        const button=$('btnAnglerCastReel'),manual=card.querySelector('.pond-manual-close button'),canvas=$('rusticAnglerCanvas');
        if(wide){
            const title=rest?'Session paused by my personal rules':record?'Start a new round in my journal':'Record my next checklist step; this does not place a trade';
            button.title=title;button.setAttribute('aria-label',text.action+'. '+title);
            if(manual){manual.title='Record a trade I already closed on the chart and reel in the illustrated fish';manual.setAttribute('aria-label','Log close and reel in the illustrated fish');}
            canvas.setAttribute('aria-label','Illustrated personal trading journal. '+text.status+'. Steps are manually logged.');
        }else if(wasWide){
            button.title=$('anglerCastBtnText').textContent;button.setAttribute('aria-label',button.title);
            if(manual){manual.title='Ghi nhận bạn đã đóng trên chart và thu cá theo mức R hiện tại';manual.setAttribute('aria-label','Đã đóng trên chart · Thu cá');}
            canvas.setAttribute('aria-label',$('anglerStatusText').textContent);
        }
        wasWide=wide;
    }
    function mount(){
        $('rusticCanvasContainer').insertAdjacentHTML('beforeend','<div class="pond-public-caption"><div><strong>PERSONAL TRADING JOURNAL</strong><span id="pondPublicSource">SOURCE NOT CONFIRMED</span></div><span id="pondPublicState" class="pond-public-state"></span></div><div class="pond-public-note">Manually logged · Not investment advice</div>');
        $('anglerCastBtnText').insertAdjacentHTML('afterend','<span class="pond-copy-public" id="pondPublicAction" aria-hidden="true"></span>');
        const manual=document.querySelector('.pond-manual-close button');
        manual.textContent='';manual.insertAdjacentHTML('beforeend','<span class="pond-copy-normal">Đóng lệnh thủ công · Thu cá</span><span class="pond-copy-public" aria-hidden="true">Log close · Reel in</span>');
        const options='<option value="">Chưa xác nhận nguồn chart</option><option value="combine">Trading Combine · Mô phỏng</option><option value="xfa">XFA · Mô phỏng</option>';
        const control=id=>'<label class="pond-source-setting">Loại tài khoản của nguồn chart<select id="'+id+'">'+options+'</select></label>';
        document.querySelector('.pond-scene-settings > div').insertAdjacentHTML('beforeend',control('pondSourceType'));
        $('pondChartFit').closest('label').insertAdjacentHTML('afterend',control('studioSourceType')+'<p class="ws-muted">Tự xác nhận đúng Combine hoặc XFA của nguồn đang phát. Khi đổi tài khoản trong cùng cửa sổ, cập nhật lựa chọn này. Hồ chỉ minh họa nhật ký cá nhân; không tự xác nhận khớp lệnh hay gửi lệnh.</p>');
        ['pondSourceType','studioSourceType'].forEach(id=>$(id).onchange=e=>setSource(e.target.value));
        mounted=true;
        new MutationObserver(refresh).observe($('rusticAnglerCard'),{attributes:true,attributeFilter:['data-fullscreen','data-studio']});
        ['pond-execution-state','pond-clock-updated','pond-outcome','pond-outcome-rated'].forEach(event=>document.addEventListener(event,refresh));
        document.addEventListener('pond-chart-source-changed',()=>setSource(''));
        refresh();
    }
    if(typeof window!=='undefined')window.addEventListener('load',mount);
    return {copy,refresh,setSource,source:()=>source};
})();
if(typeof window!=='undefined')window.PondPublic=PondPublic;
if(typeof module!=='undefined')module.exports=PondPublic;
