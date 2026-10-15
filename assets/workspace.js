/* Compact journal, account limits and recovery UI; runs directly from file://. */
function validateJournalMetadata(e) {
    if(e.kind!==undefined&&!['trade','eod'].includes(e.kind)) throw new Error('Loại bản ghi không hợp lệ.');
    if(e.closed!==undefined&&typeof e.closed!=='boolean') throw new Error('Trạng thái EOD không hợp lệ.');
    if(e.riskUsd!==undefined&&(!Number.isFinite(e.riskUsd)||e.riskUsd<0)) throw new Error('Risk của lệnh không hợp lệ.');
    if(e.setup!==undefined&&!['','1','2','3','4'].includes(String(e.setup))) throw new Error('Setup không hợp lệ.');
    if(e.compliant!==undefined&&![true,false,null].includes(e.compliant)) throw new Error('Trạng thái tuân thủ không hợp lệ.');
    if(e.note!==undefined&&(typeof e.note!=='string'||e.note.length>4000)) throw new Error('Ghi chú quá dài hoặc sai định dạng.');
    if(e.chartUrl && !safeChartUrl(e.chartUrl)) throw new Error('Liên kết chart phải dùng http hoặc https.');
    if(e.revisions!==undefined&&(!Array.isArray(e.revisions)||e.revisions.length>30)) throw new Error('Lịch sử chỉnh sửa không hợp lệ.');
}
function safeChartUrl(value) {
    try {const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.href:'';}catch{return '';}
}
function validateAccountMetadata(acc) {
    if(acc.dllEnabled!==undefined&&typeof acc.dllEnabled!=='boolean')throw new Error('Thiết lập DLL không hợp lệ.');
    if(acc.confirmedMiniLimit!==undefined&&(!Number.isInteger(acc.confirmedMiniLimit)||acc.confirmedMiniLimit<0||acc.confirmedMiniLimit>TradingRules.accounts[acc.size].maxMicros/10))throw new Error('Giới hạn hợp đồng không hợp lệ.');
    if(acc.limitSession!==undefined&&acc.limitSession!==''&&!isValidTradeDate(acc.limitSession))throw new Error('Ngày áp dụng giới hạn không hợp lệ.');
    if(acc.sessionPlans!==undefined) {
        if(!acc.sessionPlans||typeof acc.sessionPlans!=='object'||Array.isArray(acc.sessionPlans))throw new Error('Kế hoạch phiên không hợp lệ.');
        for(const [stage,plans] of Object.entries(acc.sessionPlans)) {
            if(!['combine','xfa'].includes(stage)||!plans||typeof plans!=='object'||Array.isArray(plans))throw new Error('Vòng kế hoạch không hợp lệ.');
            for(const [date,p] of Object.entries(plans)) {
                if(!isValidTradeDate(date)||!p||!Number.isFinite(p.risk)||p.risk<0||!Number.isFinite(p.daily)||p.daily<0||
                    (p.daily>0&&p.risk>p.daily)||!['','1','2','3','4'].includes(p.setup)||typeof p.note!=='string'||p.note.length>2000)
                    throw new Error('Kế hoạch phiên chứa dữ liệu không hợp lệ.');
            }
        }
    }
}
(function() {
    const $=id=>document.getElementById(id), esc=escapeHtml, money=n=>'$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
    let editing=null;
    const coreRender=renderTrackerTable, coreLoad=loadActiveAccountState, coreRisk=calculateTradeRisk, coreDelete=deleteEntry;
    const setupOptions='<option value="">Chưa phân loại</option><option value="1">CRT · FRVP</option><option value="2">Trend</option><option value="3">AMD</option><option value="4">Break</option>';
    function context() {const a=getActiveAccount();return a.id+'|'+a.stage;}
    function field(id,label,type='text',extra='') {return `<label>${label}<input id="${id}" type="${type}" ${extra}></label>`;}
    function dialog(title,content) {
        const d=$('workspaceDialog');
        d.innerHTML=`<div class="ws-actions" style="justify-content:space-between"><h2>${esc(title)}</h2><button type="button" class="b-btn-secondary" onclick="this.closest('dialog').close()">Đóng</button></div>${content}`;
        if(!d.open)d.showModal();
    }
    function mount() {
        $('calculator-section').insertAdjacentHTML('beforeend',`<details id="accountLimits" class="ws-limits" style="margin-top:16px"><summary>Giới hạn tài khoản</summary><p class="ws-muted">Quy tắc kiểm tra ngày ${TradingRules.policy.checkedOn}. Phí hiển thị là tham khảo; xác nhận giá và quyền lợi tại tài khoản Topstep. Tùy chọn dưới đây chỉ ghi nhận thiết lập để tính toán trong cockpit.</p>
          <div class="ws-grid"><label>DLL đã bật trên Topstep?<select id="accountDll"><option value="yes">Có</option><option value="no">Không</option></select></label>${field('confirmedMiniLimit','XFA: số mini tối đa từ TopstepX','number','min="0" step="1"')}${field('limitSession','Áp dụng cho phiên','date')}</div>
          <p class="ws-muted">XFA: nhập giới hạn tại Risk Settings cho đúng phiên; để trống sẽ hiển thị 0 hợp đồng. Không tự tăng giới hạn giữa phiên. MBT dùng giới hạn sản phẩm riêng theo mini-equivalent.</p>
          <button class="b-btn-secondary" type="button" id="saveAccountLimits">Lưu giới hạn</button><p class="ws-muted">Nguồn: ${TradingRules.policy.sources.map(([name,url])=>`<a href="${url}" target="_blank" rel="noopener noreferrer">${name}</a>`).join(' · ')}</p></details>`);
        $('journal-section').firstElementChild.lastElementChild.insertAdjacentHTML('afterbegin','<button class="b-btn-secondary" type="button" id="showRecovery">Khôi phục</button>');
        $('tradeForm').insertAdjacentHTML('beforeend',`<details id="journalOptions" class="ws-options"><summary>Ghi chú &amp; tùy chọn</summary><div class="ws-fields">
          <label>Loại bản ghi<select id="entryKind"><option value="eod">Tổng kết EOD (không tính như một lệnh)</option><option value="trade">Một lệnh giao dịch</option></select></label>
          <label>Setup<select id="entrySetup">${setupOptions}</select></label>${field('entryRisk','Risk ban đầu ($), dùng tính R','number','min="0" step="0.01"')}
          <label>Tuân thủ kế hoạch<select id="entryCompliance"><option value="">Chưa đánh giá</option><option value="yes">Có</option><option value="no">Không</option></select></label>
          <label>Trạng thái EOD<select id="entryClosed"><option value="yes">Đã chốt phiên</option><option value="no">Tạm tính / chưa chốt</option></select></label>${field('entryChart','Liên kết chart (http/https)','url','maxlength="2000" placeholder="https://…"')}
          <label class="ws-wide">Ghi chú<textarea id="entryNote" maxlength="4000" rows="2" placeholder="Lý do vào, thoát lệnh và bài học…"></textarea></label>
        </div></details><div class="ws-edit-status"><span id="editEntryStatus" class="ws-muted"></span><button type="button" class="b-btn-secondary" id="cancelEntryEdit" hidden>Hủy sửa</button></div>`);
        $('view-dashboard').insertAdjacentHTML('beforeend',`<details class="ws-card" id="setupAnalytics"><summary>Thống kê theo setup</summary><p class="ws-muted">Chỉ tính bản ghi “Một lệnh giao dịch”. Tổng kết EOD và dữ liệu cũ không được quy đổi thành số lệnh. R = PnL / risk ban đầu; tuân thủ chỉ tính các lệnh đã đánh giá.</p><div class="ws-grid">${field('statsFrom','Từ ngày','date')}${field('statsTo','Đến ngày','date')}</div><div id="statsResults" class="ws-table-scroll"></div></details>`);
        document.body.insertAdjacentHTML('beforeend','<dialog id="workspaceDialog" class="ws-dialog"></dialog>');
        $('showRecovery').onclick=showRecovery;
        $('saveAccountLimits').onclick=saveLimits;
        $('cancelEntryEdit').onclick=resetEditor;
        $('trackerTableBody').closest('table').classList.add('ws-journal-table');
        $('trackerTableBody').closest('table').querySelector('th:last-child').textContent='Thao tác';
        $('statsFrom').onchange=renderStats;$('statsTo').onchange=renderStats;
        $('calcActualRisk').parentElement.insertAdjacentHTML('beforeend','<p id="riskConstraint" class="ws-muted" role="status"></p>');
    }
    function resetEditor() {
        editing=null;
        $('journalOptions').open=false;
        for(const id of ['entryNote','entryChart','entryRisk','entrySetup','entryCompliance']) $(id).value='';
        $('entryClosed').value='yes';$('entryKind').value='eod';
        $('editEntryStatus').textContent='';$('cancelEntryEdit').hidden=true;
        $('tradeForm').querySelector('[type="submit"]').textContent='+ Lưu phiên';
    }
    window.editJournalEntry=function(index) {
        const acc=getActiveAccount(),entry=getActiveJournal(acc)[index];if(!entry)return;
        editing={context:context(),index,original:JSON.stringify(entry)};
        $('inputDate').value=entry.date;$('inputSymbol').value=entry.symbol||'MGC';$('inputPnl').value=entry.pnl;
        $('entryKind').value=entry.kind||'eod';$('entrySetup').value=entry.setup||'';$('entryRisk').value=entry.riskUsd||'';
        $('entryCompliance').value=entry.compliant===true?'yes':entry.compliant===false?'no':'';
        $('entryClosed').value=entry.closed===false?'no':'yes';$('entryNote').value=entry.note||'';$('entryChart').value=entry.chartUrl||'';
        $('journalOptions').open=!!(entry.note||entry.chartUrl||entry.setup||entry.riskUsd||entry.kind==='trade'||entry.closed===false||typeof entry.compliant==='boolean');
        $('editEntryStatus').textContent=`Đang sửa ${entry.date} · ${entry.symbol||'MGC'}`;$('cancelEntryEdit').hidden=false;
        $('tradeForm').querySelector('[type="submit"]').textContent='Lưu chỉnh sửa';
        $('tradeForm').scrollIntoView({behavior:'smooth',block:'center'});$('inputPnl').focus({preventScroll:true});
    };
    window.addJournalEntry=function(event) {
        event.preventDefault();
        const acc=getActiveAccount(),entries=getActiveJournal(acc),date=$('inputDate').value,pnl=Number($('inputPnl').value);
        if(acc.status==='archived'){alert('Hãy kích hoạt tài khoản trước khi sửa nhật ký.');return;}
        if(!isValidTradeDate(date)||!$('inputPnl').value.trim()||!Number.isFinite(pnl)){alert('Nhập ngày và PnL hợp lệ.');return;}
        if(editing&&(editing.context!==context()||JSON.stringify(entries[editing.index])!==editing.original)){alert('Bản ghi đã thay đổi. Hãy mở lại để sửa.');resetEditor();return;}
        const old=editing?entries[editing.index]:null,kind=$('entryKind').value;
        const sameDay=entries.filter((e,i)=>e.date===date&&(!editing||i!==editing.index));
        if(sameDay.some(e=>(e.kind||'eod')!==kind)){alert('Không trộn tổng kết EOD với từng lệnh trong cùng ngày. Hãy sửa hoặc xóa tổng kết trước để tránh cộng trùng PnL.');return;}
        if(!editing&&sameDay.length&&kind==='eod'&&!confirm('Ngày này đã có tổng kết. Thêm bản ghi sẽ cộng thêm PnL. Bạn đã kiểm tra không trùng dữ liệu?'))return;
        const entry={...(old||{}),id:old?.id||crypto.randomUUID(),date,symbol:$('inputSymbol').value,pnl,
            contracts:old?.contracts||1,trades:1,kind,setup:$('entrySetup').value,riskUsd:Number($('entryRisk').value)||0,
            compliant:$('entryCompliance').value===''?null:$('entryCompliance').value==='yes',closed:$('entryClosed').value==='yes',
            note:$('entryNote').value.trim(),chartUrl:$('entryChart').value.trim(),updatedAt:new Date().toISOString()};
        try {validateJournalMetadata(entry);} catch(err){alert(err.message);return;}
        if(old) {
            const {revisions,...previous}=old;
            entry.revisions=[...(revisions||[]),{at:entry.updatedAt,previous}].slice(-30);
            entries[editing.index]=entry;
        } else entries.push(entry);
        entries.sort((a,b)=>a.date.localeCompare(b.date));
        window.accountSaveReason=old?'Sửa nhật ký':'Thêm nhật ký';
        try {saveAccounts();resetEditor();$('inputPnl').value='';$('inputDate').value=getActiveTopstepTradeDate();renderTrackerTable();}
        finally {window.accountSaveReason='';}
    };
    window.deleteEntry=function(index) {
        const entry=getActiveJournal(getActiveAccount())[index];if(!entry)return;
        if(!confirm(`Xóa bản ghi ${entry.date}, PnL ${money(entry.pnl)}? Có thể khôi phục từ lịch sử dữ liệu.`))return;
        window.accountSaveReason='Xóa bản ghi nhật ký';
        try {coreDelete(index);resetEditor();} finally {window.accountSaveReason='';}
    };
    window.showJournalDetails=function(index) {
        const e=getActiveJournal(getActiveAccount())[index];if(!e)return;
        const url=safeChartUrl(e.chartUrl),day=getAccountLedger(getActiveAccount()).rows[e.date];
        dialog('Chi tiết nhật ký',`<p>${esc(e.date)} · ${esc(e.symbol)} · ${money(e.pnl)}</p><p class="ws-muted">Số dư: ${money(day.balance)} · MLL: ${money(day.mll)} · Đệm: ${money(day.buffer)}</p><p class="ws-note">${esc(e.note||'Chưa có ghi chú.')}</p>${url?`<p><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Mở chart đã lưu ↗</a></p>`:''}<h3>Lịch sử chỉnh sửa (tối đa 30 lần gần nhất)</h3>${(e.revisions||[]).length?(e.revisions||[]).slice().reverse().map(r=>`<details><summary>${esc(r.at)}</summary><pre>${esc(JSON.stringify(r.previous,null,2))}</pre></details>`).join(''):'<p class="ws-muted">Chưa có chỉnh sửa.</p>'}<div class="ws-actions"><button type="button" class="b-btn-danger" onclick="deleteEntry(${index});this.closest('dialog').close()">Xóa bản ghi</button></div>`);
    };
    function enhanceRows() {
        const entries=getActiveJournal(getActiveAccount());
        [...$('trackerTableBody').children].forEach((row,i)=>{
            if(!entries[i]||row.cells.length<9)return;
            const e=entries[i],cell=row.cells[8];
            cell.querySelector('.b-btn-danger')?.remove();
            cell.insertAdjacentHTML('afterbegin',`<button type="button" class="b-btn-secondary" onclick="editJournalEntry(${i})">Sửa</button> <button type="button" class="b-btn-secondary" title="Chi tiết nhật ký" aria-label="Chi tiết nhật ký" onclick="showJournalDetails(${i})">⋯</button> `);
            if(e.kind==='trade'||e.closed===false||e.setup) row.cells[0].insertAdjacentHTML('beforeend',`<div class="ws-muted">${e.kind==='trade'?'Lệnh':'Tổng kết EOD'} · ${e.closed===false?'Tạm tính':'Đã chốt'}${e.setup?' · Setup '+esc(e.setup):''}</div>`);
        });
    }
    function loadLimits() {
        if(!$('accountLimits'))return;
        const acc=getActiveAccount();
        $('accountDll').value=acc.dllEnabled===false?'no':'yes';
        $('confirmedMiniLimit').value=acc.confirmedMiniLimit??'';$('limitSession').value=acc.limitSession||'';
        $('confirmedMiniLimit').disabled=acc.stage!=='xfa';$('limitSession').disabled=acc.stage!=='xfa';
    }
    function saveLimits() {
        const acc=getActiveAccount(),value=Number($('confirmedMiniLimit').value),date=$('limitSession').value,max=accountData[acc.size].maxMicros/10;
        if(acc.stage==='xfa'&&(!Number.isInteger(value)||value<0||value>max||!isValidTradeDate(date))){alert(`Nhập giới hạn 0–${max} mini và ngày áp dụng từ TopstepX.`);return;}
        acc.dllEnabled=$('accountDll').value==='yes';
        if(acc.stage==='xfa'){acc.confirmedMiniLimit=value;acc.limitSession=date;}
        saveAccounts();renderTrackerTable();calculateTradeRisk();showSyncToast('Đã lưu giới hạn dùng trong cockpit.');
    }
    function sessionBudget(acc,date) {
        const book=TradingRules.ledger(acc,date),pnl=book.daily[date]||0,data=getAccountRules(acc);
        const dll=acc.dllEnabled===false?Infinity:Math.max(0,data.dllVal+pnl);
        const buffer=Math.max(0,book.balance-book.mll-.01);
        return {book,pnl,dll,buffer,available:acc.status==='archived'||book.breached?0:Math.min(buffer,dll)};
    }
    window.calculateTradeRisk=function() {
        // Preserve the base renderer, then constrain the result using the recorded risk budget.
        coreRisk();if(!$('riskConstraint'))return;
        const acc=getActiveAccount(),date=getActiveTopstepTradeDate(),b=sessionBudget(acc,date);
        const spec=symbolSpecs[$('calcSymbol').value]||symbolSpecs.MGC;
        const requested=Number($('stopLossInput').value),distance=Number($('ticksInput').value);
        const ticks=Math.ceil(slInputMode==='points'?distance/spec.tickSize:distance);
        const budget=Math.max(0,Math.min(requested||0,b.available));
        const verified=acc.stage!=='xfa'||acc.limitSession===date&&Number.isInteger(acc.confirmedMiniLimit);
        const miniCap=Math.max(0,acc.stage==='xfa'?(verified?Math.min(accountData[acc.size].maxMicros/10,acc.confirmedMiniLimit):0):accountData[acc.size].maxMicros/10);
        const bitcoin=['MBT','BTC'].includes($('calcSymbol').value);
        const microCap=bitcoin?miniCap:miniCap*10;
        const risk=ticks*spec.microTickVal;
        const micro=Number.isFinite(risk)&&risk>0?Math.max(0,Math.min(Math.floor(budget/risk),microCap)):0;
        const mini=Number.isFinite(risk)&&risk>0?Math.max(0,Math.min(Math.floor(budget/(ticks*spec.miniTickVal)),bitcoin?Math.floor(miniCap/(spec.miniTickVal/spec.microTickVal)):miniCap)):0;
        $('calcMicroLots').innerText=`${micro} Micros`;$('calcMiniLots').innerText=`${mini} Mini`;
        $('calcActualRisk').innerText=money(micro*(Number.isFinite(risk)?risk:0));
        $('riskConstraint').textContent=verified?`Phiên ${date}: ngân sách tính ${money(budget)}; giới hạn ${microCap} micro${bitcoin?' (MBT có trọng số riêng)':' / '+miniCap+' mini'}. Chưa trừ phí và trượt giá.`:'Chưa xác nhận giới hạn XFA cho phiên này. Nhập giới hạn từ TopstepX trong mục Giới hạn tài khoản ngay bên dưới.';
    };
    function renderStats() {
        if(!$('statsResults'))return;
        const from=$('statsFrom').value,to=$('statsTo').value;
        if(from&&to&&from>to){$('statsResults').textContent='Ngày bắt đầu phải trước ngày kết thúc.';return;}
        const all=getActiveJournal(getActiveAccount()).filter(e=>(!from||e.date>=from)&&(!to||e.date<=to));
        const trades=all.filter(e=>e.kind==='trade'),groups=new Map();
        trades.forEach(e=>{const key=e.setup?(PondLogic.setups[e.setup]?.name||'Setup '+e.setup):'Chưa phân loại';if(!groups.has(key))groups.set(key,[]);groups.get(key).push(e);});
        if(!trades.length){$('statsResults').innerHTML='<p class="ws-muted">Chưa có bản ghi từng lệnh trong khoảng ngày này.</p>';return;}
        const rows=[...groups].map(([setup,list])=>{
            const withRisk=list.filter(e=>Number.isFinite(e.riskUsd)&&e.riskUsd>0),rated=list.filter(e=>typeof e.compliant==='boolean');
            return `<tr><td>${esc(setup)}</td><td>${list.length}</td><td>${money(list.reduce((n,e)=>n+e.pnl,0))}</td><td>${(list.filter(e=>e.pnl>0).length/list.length*100).toFixed(1)}%</td><td>${withRisk.length?withRisk.reduce((n,e)=>n+e.pnl/e.riskUsd,0).toFixed(2)+'R ('+withRisk.length+'/'+list.length+' lệnh)':'Chưa đủ risk'}</td><td>${rated.length?(rated.filter(e=>e.compliant).length/rated.length*100).toFixed(1)+'% ('+rated.length+' đã đánh giá)':'Chưa đánh giá'}</td></tr>`;
        });
        $('statsResults').innerHTML='<table class="b-table"><thead><tr><th>Setup</th><th>Lệnh</th><th>PnL</th><th>Thắng</th><th>Tổng R đã biết</th><th>Tuân thủ</th></tr></thead><tbody>'+rows.join('')+'</tbody></table><p class="ws-muted">'+(all.length-trades.length)+' bản tổng kết EOD được loại khỏi thống kê từng lệnh.</p>';
    }
    function showRecovery() {
        let records;try {records=AccountStore.history();}catch(err){alert(err.message);return;}
        dialog('Khôi phục dữ liệu',`<p class="ws-muted">Giữ tối đa 12 mốc gần nhất; khi gần đầy bộ nhớ, ưu tiên mốc mới nhất. Khôi phục thay thế toàn bộ tài khoản và nhật ký. Vẫn nên xuất JSON để lưu ngoài trình duyệt.</p>${records.length?records.map((r,i)=>`<div class="ws-actions"><span>${esc(new Date(r.at).toLocaleString('vi-VN'))} · ${esc(r.reason)}</span><button type="button" class="b-btn-secondary" data-restore="${i}">Khôi phục</button><button type="button" class="b-btn-secondary" data-download="${i}">Tải JSON</button></div>`).join(''):'<p>Chưa có mốc khôi phục.</p>'}`);
        $('workspaceDialog').querySelectorAll('[data-restore]').forEach(button=>button.onclick=()=>{
            const record=records[Number(button.dataset.restore)];
            try {
                const restored=normalizeAccounts(JSON.parse(record.raw));
                if(!confirm('Khôi phục toàn bộ dữ liệu về '+new Date(record.at).toLocaleString('vi-VN')+'? Dữ liệu hiện tại sẽ được giữ thành mốc khôi phục mới.'))return;
                accountsList=restored;activeAccountId=restored.some(a=>a.id===record.active)?record.active:restored[0].id;accountStorageInvalid=false;
                window.accountSaveReason='Khôi phục mốc dữ liệu';saveAccounts();window.accountSaveReason='';
                $('workspaceDialog').close();loadActiveAccountState();
            } catch(err){alert('Không thể khôi phục: '+err.message);}
        });
        $('workspaceDialog').querySelectorAll('[data-download]').forEach(button=>button.onclick=()=>{
            const record=records[Number(button.dataset.download)],blob=new Blob([JSON.stringify({version:'v3',accountsList:JSON.parse(record.raw),activeAccountId:record.active})],{type:'application/json'});
            const link=document.createElement('a'),url=URL.createObjectURL(blob);link.href=url;link.download='topstep_recovery_'+record.at.replace(/[:.]/g,'-')+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
        });
    }
    function reconcileStatus() {
        const acc=getActiveAccount(),book=getAccountLedger(acc),date=$('inputDate').value||getActiveTopstepTradeDate();
        const b=sessionBudget(acc,date),pending=Object.values(book.closed).some(v=>!v);
        $('journalSectionSubtitle').textContent='Nhập ngày, sản phẩm và lãi/lỗ cuối phiên rồi bấm Lưu phiên.';
        $('trackerMaxContractsBadge').textContent=acc.stage==='xfa'?
            (acc.limitSession===date?`${acc.confirmedMiniLimit} mini · phiên ${date}`:'XFA · cần xác nhận giới hạn phiên'):getAccountRules(acc).contracts;
        // The old overview remains a summary, with the same budget used by the calculator.
        $('todayMaxLossBudget').textContent=money(b.available);
        $('todayLossBudgetSubtext').textContent=acc.dllEnabled===false?'DLL chưa bật · giới hạn bởi đệm MLL':'Giới hạn bởi đệm MLL và DLL';
        if(pending) {
            if(acc.stage==='combine'&&!book.breached) {$('trackerConsistencyBadge').textContent='CÓ PHIÊN TẠM TÍNH · CHỜ CHỐT EOD';$('trackerConsistencyBadge').className='b-badge b-badge-gold';}
            $('targetDynamicDesc').textContent='Nhật ký có phiên chưa chốt. PnL đang tạm tính; hãy kiểm tra và chốt EOD trước khi đánh giá hoàn thành.';
            $('suggestionStatusTag').textContent='Chờ chốt EOD';
        }
        if(acc.stage==='xfa'&&acc.xfaPath==='consistency_payout'&&!pending) {
            const status=getPayoutStatus(acc);
            $('targetDynamicDesc').textContent=`Chu kỳ Consistency: ${status.progress}. PnL chu kỳ ${money(status.profit)}. Chỉ tính phiên đã chốt.`;
            $('suggestionStatusTag').textContent=status.eligible?'Đủ điều kiện chu kỳ':'Theo dõi chu kỳ Consistency';
        }
    }
    window.renderTrackerTable=function() {coreRender();if($('journalOptions')){enhanceRows();reconcileStatus();renderStats();calculateTradeRisk();}};
    window.loadActiveAccountState=function() {coreLoad();if($('journalOptions')){resetEditor();loadLimits();renderStats();calculateTradeRisk();}};
    const previous=window.onload;
    window.onload=function(event) {mount();if(previous)previous.call(window,event);if(accountStorageInvalid)return;loadLimits();renderTrackerTable();};
})();
