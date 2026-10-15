/* Local scene composition and discipline notes; never places orders or broadcasts. */
const PondLive=(()=>{
    const $=id=>document.getElementById(id),esc=escapeHtml,storageKey='topstep_pond_sessions_v1';
    let store={active:{},history:[]},invalid=false,placeholder=null,stream=null,lastEnded=null;
    try{const s=JSON.parse(localStorage.getItem(storageKey)||'null');if(s)store=validate(s);}catch{invalid=true;}
    function validate(value){
        const valid=s=>s&&typeof s.id==='string'&&typeof s.accountKey==='string'&&['MGC','MNQ'].includes(s.symbol)&&[1,2,3,4].includes(s.setup)&&['morning','afternoon','us'].includes(s.window)&&Number.isFinite(Date.parse(s.startedAt))&&Array.isArray(s.rounds)&&s.rounds.every(r=>typeof r==='string')&&Array.isArray(s.changes)&&s.changes.every(c=>c&&typeof c.reason==='string'&&c.reason.length<=300)&&['yes','no','unrated'].includes(s.assessment)&&(!s.outcomes||Array.isArray(s.outcomes)&&s.outcomes.every(r=>Object.hasOwn(PondExecution.labels,r.outcome)));
        if(!value||!value.active||Array.isArray(value.active)||!Array.isArray(value.history)||value.history.length>30||!Object.values(value.active).every(valid)||!value.history.every(valid))throw new Error('Dữ liệu buổi theo dõi không hợp lệ.');
        return value;
    }
    function reload(){try{store=validate(JSON.parse(localStorage.getItem(storageKey)||'{"active":{},"history":[]}'));invalid=false;lastEnded=null;}catch{invalid=true;}}
    function key(){const a=getActiveAccount();return JSON.stringify([a.id,a.stage]);}
    function active(){return store.active[key()]||null;}
    function status(text){if($('pondStudioNotice'))$('pondStudioNotice').textContent=text;}
    function save(next){
        if(invalid){status('Dữ liệu buổi theo dõi bị hỏng; bản gốc được giữ nguyên.');return false;}
        try{localStorage.setItem(storageKey,JSON.stringify(next));store=next;return true;}catch{status('Chưa lưu được buổi theo dõi. Dữ liệu trước đó được giữ nguyên.');return false;}
    }
    function results(s=active()){return s?(s.outcomes||PondExecution.history().filter(r=>(s.rounds||[]).includes(r.id))):[];}
    function shouldRest(){
        const s=active();if(!s||s.continueReason)return false;
        const rounds=results(s).filter(r=>r.outcome!=='skip'),last=rounds.slice(-2);
        return rounds.some(r=>r.outcome==='tp')||last.length===2&&last.every(r=>r.outcome==='sl');
    }
    function summary(s){
        const rounds=results(s),rated=rounds.filter(r=>r.rating!=='unrated');
        const label=s?.assessment==='yes'?'Tự đánh giá: Đúng quy trình':s?.assessment==='no'?'Tự đánh giá: Có thay đổi / chưa đúng':'Chưa tự đánh giá quy trình';
        const count=s?.rounds?.length||0,missing=count-rounds.length;
        return {rounds,rated,label,text:count?`${count} lượt · ${rated.length} đã đánh giá${missing>0?' · '+missing+' chi tiết không còn trong cache':''}`:'Không có lệnh cũng là một buổi hợp lệ'};
    }
    function refresh(){
        if(!$('pondStudio'))return;
        const s=active(),session=s||(lastEnded?.accountKey===key()?lastEnded:null),info=summary(session),rest=shouldRest(),clock=PondClock.context(),w=s?PondSchedule.selected(s.window):null,result=PondExecution.current();
        $('pondLiveCaption').textContent=session?`${session.symbol} · ${PondLogic.setups[session.setup]?.name||'Setup'} · ${rest?'Đã nghỉ':s?result?PondExecution.labels[result.outcome]:anglerState.snapshot?.status||'Đang chờ':'Đã kết thúc'}`:'Hồ câu · chờ đúng điều kiện';
        $('pondLiveSubcaption').textContent=s?`${PondSchedule.format(w.start)}–${PondSchedule.format(w.end)} GMT+7 · ${PondClock.contains(clock.total,w.start,w.end)?'Trong khung đã chọn':'Ngoài khung đã chọn · quan sát'}`:info.text;
        $('pondLivePrinciple').textContent=rest?'Đủ điều kiện nghỉ. Thu cần và bảo toàn quy trình.':result?'Kết quả lệnh và mức tuân thủ được đánh giá riêng.':'Chờ đúng setup. Không có lệnh vẫn là một buổi hợp lệ.';
        $('pondStudioStart').hidden=!!s;$('pondStudioRunning').hidden=!s;
        $('pondStudioSessionInfo').textContent=s?`${s.symbol} · ${PondLogic.setups[s.setup]?.name} · ${info.text} · ${s.changes.length} thay đổi có ghi lý do`:session?info.label+' · '+info.text:'Chưa bắt đầu buổi theo dõi.';
        $('pondStudioContinue').hidden=!rest;$('btnAnglerCastReel').disabled=rest;
        if(rest){$('anglerCastBtnText').textContent='Đã nghỉ';$('btnAnglerCastReel').setAttribute('aria-label','Đã nghỉ theo điều kiện đã chọn');}
        else if($('anglerCastBtnText').textContent==='Đã nghỉ'){$('anglerCastBtnText').textContent=result?'Bắt đầu lượt mới':readPondChecklist().action;$('btnAnglerCastReel').setAttribute('aria-label',$('anglerCastBtnText').textContent);}
        document.querySelectorAll('[data-studio-outcome]').forEach(b=>{b.disabled=!!result;});
        $('studioRoundRating').disabled=!result?.id;
        $('studioChangeSetup').value=String(s?.setup||activeChecklistSetup);
        if($('btnPondStudio')){$('btnPondStudio').setAttribute('aria-pressed',String(!!s));$('btnPondStudio').title=s?'Mở lại buổi đang theo dõi':'Mở studio livestream';}
        for(const w of PondSchedule.effective().filter(w=>w.active)){
            const option=[...$('studioWindow').options].find(o=>o.value===w.id);
            if(option)option.textContent=w.label+' '+PondSchedule.format(w.start)+'–'+PondSchedule.format(w.end);
        }
        $('pondSessionHistory').innerHTML=store.history.filter(r=>r.accountKey===key()).slice(-5).reverse().map(s=>`<details><summary>${esc(new Date(s.startedAt).toLocaleString('vi-VN'))} · ${esc(s.symbol)} · ${esc(summary(s).label)}</summary><p>${esc(summary(s).text)}</p>${s.changes.map(c=>`<p class="ws-muted">${esc(c.reason)}</p>`).join('')}</details>`).join('')||'<p class="ws-muted">Chưa có buổi đã kết thúc.</p>';
    }
    function noteRest(){status('Đã chạm điều kiện nghỉ trong playbook. Kết thúc buổi hoặc ghi rõ lý do thay đổi.');refresh();}
    function stopCapture(){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}if($('pondChartVideo')){$('pondChartVideo').srcObject=null;$('pondChartVideo').hidden=true;$('pondChartPlaceholder').hidden=false;}}
    async function capture(){
        if(!navigator.mediaDevices?.getDisplayMedia){status('Trình duyệt chưa hỗ trợ chọn cửa sổ. Có thể ghép nguồn Topstep riêng trong phần mềm live.');return;}
        try{
            const candidate=await navigator.mediaDevices.getDisplayMedia({video:true,audio:false});
            if(!$('pondStudio').open){candidate.getTracks().forEach(t=>t.stop());return;}
            stopCapture();stream=candidate;$('pondChartVideo').srcObject=stream;$('pondChartVideo').hidden=false;$('pondChartPlaceholder').hidden=true;
            stream.getVideoTracks()[0].addEventListener('ended',stopCapture,{once:true});await $('pondChartVideo').play();status('Đã chọn nguồn. Kiểm tra thông tin cá nhân trước khi phát sóng.');
        }catch(err){stopCapture();status(['NotAllowedError','AbortError'].includes(err.name)?'Chưa chia sẻ cửa sổ; cảnh hồ vẫn hoạt động.':'Không mở được nguồn chart. Hãy thử chọn lại cửa sổ.');}
    }
    async function open(){
        if($('pondStudio').open)return;
        if($('rusticAnglerCard').dataset.fullscreen==='true')await exitPondFullscreen();
        placeholder=document.createComment('pond studio return');$('rusticAnglerCard').before(placeholder);$('pondLiveScene').append($('rusticAnglerCard'));
        $('rusticAnglerCard').dataset.studio='true';$('pondStudio').showModal();$('rusticCanvasContainer').style.display='block';
        $('studioSetup').value=String(active()?.setup||activeChecklistSetup);$('studioSymbol').value=active()?.symbol||'MGC';
        $('studioWindow').value=active()?.window||PondSchedule.effective().find(w=>w.active&&PondClock.contains(PondClock.context().total,w.start,w.end))?.id||'morning';
        refresh();hint();syncAnglerMotion();
    }
    function close(){stopCapture();delete $('rusticAnglerCard').dataset.studio;if(placeholder){placeholder.replaceWith($('rusticAnglerCard'));placeholder=null;}$('pondStudio').close();restorePondPreferences();$('btnPondStudio').focus({preventScroll:true});}
    function start(e){
        e.preventDefault();if(active()||!$('studioCommit').checked)return;
        const symbol=$('studioSymbol').value,setup=Number($('studioSetup').value),window=$('studioWindow').value;
        if(!['MGC','MNQ'].includes(symbol)||![1,2,3,4].includes(setup)||!PondSchedule.windows.some(w=>w.id===window&&w.active))return;
        const next=structuredClone(store);next.active[key()]={id:crypto.randomUUID(),accountKey:key(),symbol,setup,window,startedAt:new Date().toISOString(),rounds:[],changes:[],assessment:'unrated'};
        if(!save(next))return;
        lastEnded=null;baseSwitch(setup);PondExecution.newRound();refresh();status('Buổi theo dõi đã bắt đầu. Studio không tự phát sóng hoặc đặt lệnh.');
    }
    function finish(){
        if(!active())return;
        const next=structuredClone(store),s={...next.active[key()],outcomes:results(),endedAt:new Date().toISOString(),assessment:$('studioAssessment').value};
        next.history.push(s);next.history=next.history.slice(-30);delete next.active[key()];if(!save(next))return;
        lastEnded=s;$('studioCommit').checked=false;$('studioAssessment').value='unrated';refresh();status(summary(s).label+' · '+summary(s).text);
    }
    function recordChange(reason,setup){
        if(!active()||!reason.trim())return false;
        const next=structuredClone(store),s=next.active[key()];s.changes.push({at:new Date().toISOString(),reason:reason.trim().slice(0,300),from:s.setup,to:setup||s.setup});
        if(setup)s.setup=setup;else s.continueReason=reason.trim().slice(0,300);
        if(!save(next))return false;refresh();return true;
    }
    function askChange(setup=null){$('pondChangeReason').value='';$('pondChangeDialog').dataset.setup=setup||'';$('pondChangeDialog').showModal();}
    const baseSwitch=switchChecklistSetup;
    window.switchChecklistSetup=function(setup){if(![1,2,3,4].includes(Number(setup)))return;if(!$('pondChangeDialog')||!checklistLoaded){baseSwitch(active()?.setup||Number(setup));return;}if(active()&&active().setup!==Number(setup)){askChange(Number(setup));return;}baseSwitch(Number(setup));};
    function hint(){const w=PondSchedule.selected($('studioWindow').value),fits=w.setups.includes(Number($('studioSetup').value))&&w.symbols.includes($('studioSymbol').value);$('pondWindowHint').textContent=fits?'Khớp khung tham chiếu trong playbook.':'Lựa chọn khác khung tham chiếu trong playbook; kiểm tra lại trước khi xác nhận.';}
    function mount(){
        $('btnPondFullscreen').insertAdjacentHTML('afterend','<button type="button" id="btnPondStudio" class="pond-icon-button" title="Mở studio livestream" aria-label="Mở studio livestream"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M6 12h12"/><circle cx="12" cy="7" r="1.5"/></svg></button>');
        document.body.insertAdjacentHTML('beforeend',`<dialog id="pondStudio" class="pond-studio"><div class="pond-studio-layout">
          <div id="pondBroadcastFrame" class="pond-live-frame" data-order="pond-first"><div id="pondLiveScene" class="pond-live-scene"><div class="pond-live-caption"><strong id="pondLiveCaption"></strong><span id="pondLiveSubcaption"></span></div></div><div class="pond-chart-pane"><video id="pondChartVideo" muted playsinline hidden></video><div id="pondChartPlaceholder"><strong>CHART TOPSTEP</strong><span>Chọn cửa sổ để xem tại đây<br>hoặc ghép nguồn riêng khi live.</span></div></div><div id="pondLivePrinciple" class="pond-live-principle"></div></div>
          <aside class="pond-studio-operator"><div class="ws-actions" style="justify-content:space-between"><h2>Studio livestream</h2><button type="button" id="closePondStudio" class="b-btn-secondary">Đóng</button></div><p class="ws-muted">Khung dọc 9:16: hồ và chart mỗi phần một nửa. Bố cục xem trước không tự phát sóng, ghi hình hoặc đặt lệnh.</p>
          <div class="ws-actions"><button type="button" id="capturePondChart" class="b-btn-primary">Chọn chart Topstep</button><button type="button" id="stopPondCapture" class="b-btn-secondary">Ngừng chia sẻ</button><button type="button" id="swapPondPanes" class="b-btn-secondary">Đổi vị trí hai phần</button></div><label class="pond-studio-field">Hiển thị chart<select id="pondChartFit"><option value="contain">Xem toàn bộ nguồn</option><option value="cover">Lấp đầy khung (cắt viền)</option></select></label><p class="ws-muted">Chỉ chọn cửa sổ chart và kiểm tra thông tin cá nhân trước khi phát sóng. Khung xem trước là vùng dành cho người xem; các nút điều khiển nằm ngoài khung này.</p>
          <form id="pondStudioStart"><h3>Bắt đầu buổi theo dõi</h3><div class="pond-studio-fields"><label>Sản phẩm<select id="studioSymbol"><option>MGC</option><option>MNQ</option></select></label><label>Setup<select id="studioSetup">${Object.entries(PondLogic.setups).map(([v,s])=>`<option value="${v}">${esc(s.name)}</option>`).join('')}</select></label><label>Khung giờ<select id="studioWindow">${PondSchedule.effective().filter(w=>w.active).map(w=>`<option value="${w.id}">${esc(w.label)} ${PondSchedule.format(w.start)}–${PondSchedule.format(w.end)}</option>`).join('')}</select></label></div><p class="ws-muted" id="pondWindowHint"></p><label class="pond-commit"><input type="checkbox" id="studioCommit" required> Tôi chờ đủ điều kiện đã chọn; không có setup thì đứng ngoài. Nghỉ theo nguyên tắc trong playbook.</label><button class="b-btn-primary" type="submit">Bắt đầu buổi</button></form>
          <section id="pondStudioRunning" hidden><h3>Buổi đang theo dõi</h3><p id="pondStudioSessionInfo"></p><div class="pond-outcome-buttons">${Object.entries(PondExecution.labels).map(([v,l])=>`<button type="button" class="b-btn-secondary" data-studio-outcome="${v}">${l}</button>`).join('')}</div><label class="pond-studio-field">Đánh giá lượt vừa rồi<select id="studioRoundRating"><option value="unrated">Chưa đánh giá</option><option value="yes">Đúng quy trình</option><option value="no">Có thay đổi / chưa đúng</option></select></label><button type="button" class="b-btn-secondary" id="pondStudioContinue" hidden>Ghi lý do tiếp tục ngoài cam kết</button><label class="pond-studio-field">Tự đánh giá cuối buổi<select id="studioAssessment"><option value="unrated">Chưa đánh giá</option><option value="yes">Đúng quy trình</option><option value="no">Có thay đổi / chưa đúng</option></select></label><button type="button" id="endPondSession" class="b-btn-primary">Kết thúc buổi</button></section>
          <p id="pondStudioNotice" class="ws-status" role="status"></p><details><summary>Hướng dẫn lấy khung live</summary><p class="ws-muted">Trong phần mềm live, chọn nguồn cửa sổ trình duyệt và crop đúng khung dọc bên trái. Không lấy cả bảng điều khiển. Nếu chữ chart nhỏ, chọn cửa sổ chart hẹp hơn hoặc ghép nguồn riêng.</p></details><details><summary>Lịch sử và tổng kết</summary><p class="ws-muted">Giữ 30 buổi gần nhất. Kết quả lệnh không thay cho đánh giá kỷ luật.</p><div id="pondSessionHistory"></div><button type="button" id="exportPondSessions" class="b-btn-secondary">Tải nhật ký buổi JSON</button></details></aside></div></dialog>
          <dialog id="pondChangeDialog" class="ws-dialog"><form id="pondChangeForm"><h2>Ghi nhận thay đổi</h2><p class="ws-muted">Giữ lại lý do để đối chiếu với cam kết ban đầu.</p><label>Lý do<textarea id="pondChangeReason" required maxlength="300" rows="3" style="width:100%"></textarea></label><div class="ws-actions"><button class="b-btn-primary" type="submit">Ghi nhận thay đổi</button><button class="b-btn-secondary" type="button" id="cancelPondChange">Giữ nguyên</button></div></form></dialog>`);
        $('pondStudio').setAttribute('aria-label','Studio livestream hồ câu và chart');
        $('closePondStudio').title='Đóng studio, ngừng chia sẻ và giữ buổi để tiếp tục';
        $('pondStudioSessionInfo').insertAdjacentHTML('afterend',`<label class="pond-studio-field">Đổi setup (ghi lý do)<select id="studioChangeSetup">${Object.entries(PondLogic.setups).map(([v,s])=>`<option value="${v}">${esc(s.name)}</option>`).join('')}</select></label>`);
        $('studioChangeSetup').onchange=e=>{const setup=Number(e.target.value);e.target.value=String(active()?.setup||activeChecklistSetup);switchChecklistSetup(setup);};
        $('btnPondStudio').onclick=open;$('closePondStudio').onclick=close;$('pondStudio').addEventListener('cancel',e=>{e.preventDefault();close();});
        $('capturePondChart').onclick=capture;$('stopPondCapture').onclick=stopCapture;
        $('swapPondPanes').onclick=()=>{$('pondBroadcastFrame').dataset.order=$('pondBroadcastFrame').dataset.order==='pond-first'?'chart-first':'pond-first';};
        $('pondChartFit').onchange=e=>{$('pondChartVideo').style.objectFit=e.target.value;};$('pondStudioStart').onsubmit=start;$('endPondSession').onclick=finish;
        $('pondStudioContinue').onclick=()=>askChange();$('cancelPondChange').onclick=()=>{$('pondChangeDialog').close();};
        $('pondChangeForm').onsubmit=e=>{e.preventDefault();const setup=Number($('pondChangeDialog').dataset.setup)||null;if(recordChange($('pondChangeReason').value,setup)){$('pondChangeDialog').close();if(setup)baseSwitch(setup);}};
        document.querySelectorAll('[data-studio-outcome]').forEach(b=>b.onclick=()=>PondExecution.choose(b.dataset.studioOutcome));
        $('studioRoundRating').onchange=e=>{const input=$('pondOutcomeRating');input.value=e.target.value;input.dispatchEvent(new Event('change'));};
        ['studioWindow','studioSymbol','studioSetup'].forEach(id=>$(id).onchange=hint);
        $('exportPondSessions').onclick=()=>{const blob=new Blob([JSON.stringify({version:1,sessions:store.history,active:store.active,outcomes:PondExecution.history()},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='pond-session-notes.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
        hint();refresh();
    }
    document.addEventListener('pond-outcome',e=>{const s=active();if(!s||s.rounds.includes(e.detail.id))return;const next=structuredClone(store);next.active[key()].rounds.push(e.detail.id);if(save(next))refresh();});
    document.addEventListener('pond-outcome-rated',refresh);
    document.addEventListener('pond-execution-state',()=>{if($('studioRoundRating'))$('studioRoundRating').value=PondExecution.current()?.rating||'unrated';refresh();});
    document.addEventListener('pond-clock-updated',refresh);
    window.addEventListener('load',mount);window.addEventListener('pagehide',stopCapture);
    return {open,close,active,shouldRest,noteRest,summary,refresh,validate,reload};
})();
window.PondLive=PondLive;
