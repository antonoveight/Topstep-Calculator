/* Presentation only: the existing account store, ledger and pond own all state. */
const DeskUI=(()=>{
    const $=id=>document.getElementById(id);
    const titles={dashboard:'Tổng quan tài khoản',checklist:'Bàn giao dịch', 'market-hours':'Phiên & tin tức',calendar:'Lịch kinh tế'};
    const icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M16 3v11a5 5 0 0 1-10 0v-3l3 3M13 3h6M16 3V1"/></svg>';
    let mounted=false;
    function navigate(section){
        navigateToDashboardSection(section==='journal'?'journal-section':'calculator-section');
        requestAnimationFrame(()=>{selectNav(section);$('headerMainTitle').textContent=section==='journal'?'Nhật ký giao dịch':'Quản trị rủi ro';});
    }
    function selectNav(name){
        document.querySelectorAll('[data-desk-nav]').forEach(el=>{
            const active=el.dataset.deskNav===(name==='calendar'&&el.closest('.finpoint-sidebar')?'market-hours':name);el.classList.toggle('active',active);
            if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');
        });
    }
    function refreshView(){
        if(!mounted)return;
        const view=document.querySelector('.finpoint-workspace').dataset.view||'dashboard';
        $('headerMainTitle').textContent=titles[view]||titles.dashboard;
        $('headerBreadcrumbCurrent').textContent='TRADING DESK';
        selectNav(view);
    }
    function settings(){if(!$('deskSettings').open)$('deskSettings').showModal();}
    function mountHeader(){
        const header=document.querySelector('.workspace-header'),oldActions=$('accountDropdown').parentElement;
        const title=header.firstElementChild;title.classList.add('desk-header-title');
        const breadcrumb=$('headerBreadcrumbCurrent').parentElement;
        breadcrumb.firstElementChild.textContent='THE FUNDED ANGLER';
        const quick=$('topBtnDashboard').parentElement;quick.classList.add('desk-mobile-nav');
        for(const [id,label] of [['topBtnDashboard','Tổng quan'],['topBtnChecklist','Thực chiến'],['topBtnMarketHours','Phiên giờ'],['topBtnCalendar','Lịch tin']])$(id).textContent=label;
        for(const [id,key] of [['topBtnDashboard','dashboard'],['topBtnChecklist','checklist'],['topBtnMarketHours','market-hours'],['topBtnCalendar','calendar']])$(id).dataset.deskNav=key;
        for(const [label,key,fn] of [['Nhật ký','journal',()=>navigate('journal')],['Rủi ro','risk',()=>navigate('risk')],['Cài đặt','settings',settings]]){
            const b=document.createElement('button');b.type='button';b.textContent=label;b.className='b-badge b-badge-dim';b.dataset.deskNav=key;b.onclick=fn;quick.append(b);
        }
        const dialog=document.createElement('dialog');dialog.id='deskSettings';dialog.className='desk-settings';
        dialog.innerHTML='<div class="desk-panel-head"><div><span class="desk-eyebrow">WORKSPACE</span><h2>Cài đặt bàn giao dịch</h2></div><button type="button" class="b-btn-secondary" data-close-settings aria-label="Đóng cài đặt">Đóng</button></div><section><h3>Tài khoản</h3><p>Quản lý tài khoản, vòng giao dịch và các gói Topstep.</p><div id="deskAccountActions" class="desk-settings-actions"></div></section><section><h3>Giao diện & thông báo</h3><div id="deskPreferences" class="desk-settings-actions"></div></section><section><h3>Dữ liệu cá nhân</h3><p>Sao lưu trước khi đổi máy hoặc thay dữ liệu trình duyệt.</p><div class="desk-settings-actions"><button type="button" class="b-btn-secondary" onclick="exportFullBackupJSON()">Tải bản sao lưu JSON</button><button type="button" class="b-btn-secondary" id="deskImportBackup">Khôi phục từ JSON</button></div></section>';
        document.body.append(dialog);dialog.querySelector('[data-close-settings]').onclick=()=>dialog.close();
        dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
        $('deskImportBackup').onclick=()=>$('importBackupFile').click();
        const accountActions=$('deskAccountActions'),preferences=$('deskPreferences');
        accountActions.addEventListener('click',e=>{if(e.target.closest('button,a'))dialog.close();},true);
        [...oldActions.children].forEach(el=>{
            if(el===quick||el===$('headerNewsRadar')||el===$('accountDropdown')||el.contains($('headerTradeDatePill')))return;
            (el.classList.contains('theme-switch-container')||el.id==='btnTogglePushNotif'?preferences:accountActions).append(el);
        });
        const tools=document.createElement('div');tools.className='desk-header-tools';
        tools.append($('accountDropdown'),$('headerTradeDatePill').parentElement,$('headerNewsRadar'));
        const manage=document.createElement('button');manage.type='button';manage.className='b-btn-secondary desk-manage';manage.textContent='Cài đặt';manage.onclick=settings;tools.append(manage);
        oldActions.remove();header.append(tools,quick);
        const date=$('headerTradeDatePill').parentElement;date.tabIndex=0;date.setAttribute('role','button');date.setAttribute('aria-label','Chọn ngày trong nhật ký');date.onclick=()=>{navigate('journal');setTimeout(()=>$('inputDate').focus({preventScroll:true}),150);};date.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();date.click();}};
        const theme=preferences.querySelector('.theme-switch-container');theme.tabIndex=0;theme.setAttribute('role','button');theme.setAttribute('aria-label','Chuyển giao diện sáng hoặc tối');theme.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();theme.click();}};
    }
    function mountNav(){
        const sidebar=document.querySelector('.finpoint-sidebar'),brand=sidebar.querySelector('.sidebar-brand-text');
        brand.innerHTML='<span class="desk-brand-name">The Funded<br>Angler<span class="desk-brand-dot">.</span></span><span class="desk-brand-caption">PERSONAL TRADING DESK</span>';
        const mark=brand.previousElementSibling;mark.className='desk-brand-mark';mark.innerHTML=icon;
        sidebar.querySelector('.sidebar-section-title').textContent='KHÔNG GIAN LÀM VIỆC';
        const nav=sidebar.querySelector('nav'),items=[
            [$('nav-dashboard'),'dashboard','Tổng quan'],[$('nav-checklist'),'checklist','Thực chiến'],
            [nav.querySelector('[onclick*="journal-section"]'),'journal','Nhật ký'],
            [nav.querySelector('[onclick*="calculator-section"]'),'risk','Quản trị rủi ro'],
            [$('nav-market-hours'),'market-hours','Phiên & tin tức']
        ];
        const pricing=nav.querySelector('[onclick*="openPricingModal"]');pricing.className='b-btn-secondary';pricing.textContent='Bảng gói Topstep';$('deskAccountActions').append(pricing);
        const money=nav.querySelector('[onclick*="chart-section"]');money.remove();
        items.forEach(([el,key,label])=>{
            el.classList.add('desk-nav-item');el.dataset.deskNav=key;el.setAttribute('role','button');el.tabIndex=0;
            el.querySelector('.sidebar-link-text').textContent=label;el.title=label;
            if(['journal','risk'].includes(key))el.onclick=()=>navigate(key);
            el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();}};nav.append(el);
        });
        const button=document.createElement('button');button.type='button';button.className='sidebar-link desk-nav-item';button.dataset.deskNav='settings';button.title='Cài đặt';button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/></svg><span class="sidebar-link-text">Cài đặt</span>';button.onclick=settings;nav.append(button);
        sidebar.querySelector('.sidebar-promo-card').innerHTML='<div class="desk-sidebar-note"><span class="desk-eyebrow">THE PROCESS COMES FIRST</span><p>Đúng phương pháp.<br>Đủ kiên nhẫn.</p><a href="https://www.topstep.com" target="_blank" rel="noopener noreferrer">Mở Topstep ↗</a></div>';
    }
    function mountDashboard(){
        const dash=$('view-dashboard'),kpis=dash.querySelector('.b-stat-card').parentElement;kpis.className='desk-kpis';
        const balance=$('finpointCardBalance'),account=$('displayAccountTitle'),number=$('finpointCardNumber');
        const accountPanel=balance.closest('.b-card'),actions=[...accountPanel.querySelectorAll('.b-btn-action-col')];
        const targetLabel=$('finpointCardTargetLabel'),target=$('finpointNextPayAmount');
        const retained=[account,number,targetLabel,target,...actions].filter(Boolean);
        const metadata=[...accountPanel.querySelectorAll('[id]')].filter(el=>!retained.some(root=>root===el||root.contains(el))&&el!==balance);
        const newCard=(label,id,sub)=>{const el=document.createElement('div');el.className='b-stat-card';el.innerHTML=`<span class="desk-metric-label">${label}</span><div id="${id}" class="desk-metric-value tabular-nums">—</div><span class="desk-metric-sub">${sub}</span>`;return el;};
        const balanceCard=newCard('Số dư tài khoản','deskBalanceSlot','Theo nhật ký đã ghi nhận');
        balanceCard.querySelector('#deskBalanceSlot').replaceWith(balance);kpis.prepend(balanceCard);
        const buffer=newCard('Đệm tới MLL','deskBufferValue','Khoảng cách đến ngưỡng giới hạn');kpis.insertBefore(buffer,kpis.children[2]);
        const mllCard=$('trackerCurrentMll').closest('.b-stat-card');
        accountPanel.classList.add('desk-account-panel');
        accountPanel.replaceChildren();accountPanel.insertAdjacentHTML('beforeend','<div class="desk-panel-head"><div><span class="desk-eyebrow">ACCOUNT OVERVIEW</span><h2>Trạng thái tài khoản</h2></div><span class="desk-account-platform">TOPSTEP</span></div><div id="deskAccountName" class="desk-account-name"></div><div id="deskAccountTarget" class="desk-account-target"></div><div id="deskAccountButtons" class="desk-account-buttons"></div>');
        $('deskAccountName').append(account);number.hidden=true;accountPanel.append(number);
        const meta=document.createElement('div');meta.className='desk-account-meta';meta.append(...metadata);accountPanel.append(meta);
        if(targetLabel&&target)$('deskAccountTarget').append(targetLabel,target);
        $('deskAccountButtons').append(...actions);accountPanel.append(mllCard);mllCard.classList.add('desk-mll-detail');
        // Four primary metrics. The second metric is the existing cumulative PnL.
        const strip=$('smartBannerTitle').parentElement.parentElement.parentElement;strip.classList.add('desk-risk-strip');
        $('chart-section').parentElement.classList.add('desk-main-column');
        const grid=$('chart-section').parentElement.parentElement;grid.classList.add('desk-dashboard-grid');accountPanel.parentElement.classList.add('desk-side-column');
        const goals=$('finpointGoal2Text').closest('.b-card');if(goals){goals.classList.add('desk-goals');goals.firstElementChild.firstElementChild.textContent='Tiến độ & mục tiêu';}
        const chartTitle=$('moneyFlowAccountTag').previousElementSibling;chartTitle.textContent='Hiệu suất theo phiên';
        const chart=$('chart-section');chart.insertAdjacentHTML('afterbegin','<span class="desk-eyebrow desk-chart-eyebrow">PERFORMANCE</span>');
        const calculator=$('calculator-section');calculator.classList.add('desk-calculator');
        grid.after(calculator);const fields=$('calcSymbol').parentElement.parentElement;fields.classList.add('desk-calculator-fields');
        const results=$('calcMicroLots').parentElement.parentElement;results.classList.add('desk-size-results');
        const limits=$('accountLimits');if(limits)calculator.append(limits);
        // Keep the complete journal reachable on the overview, with its original IDs and handlers.
        $('journal-section').classList.add('desk-journal');
        const oldJump=accountPanel.parentElement.querySelector('.b-card[style*="linear-gradient"]');if(oldJump)oldJump.classList.add('desk-old-jump');
        const kpiLabels=['Số dư tài khoản','PnL lũy kế','Đệm tới MLL',null];
        [...kpis.children].forEach((el,i)=>{el.classList.add('desk-metric');const title=el.firstElementChild;if(i===1)title.firstElementChild.textContent=kpiLabels[i];});
        const hero=document.createElement('div');hero.className='desk-overview-heading';hero.innerHTML='<div><span class="desk-eyebrow">ACCOUNT PERFORMANCE · USD</span><h2>Hiệu suất & quản trị vốn</h2><p>Số liệu tài khoản từ nhật ký giao dịch của bạn.</p></div><button type="button" class="b-btn-primary" onclick="DeskUI.navigate(\'journal\')">+ Ghi nhật ký</button>';kpis.before(hero);
        const source=$('todayMllBufferVal');const sync=()=>{const text=source.textContent;if($('deskBufferValue').textContent!==text)$('deskBufferValue').textContent=text;};
        new MutationObserver(sync).observe(source,{childList:true,characterData:true,subtree:true});sync();
    }
    function mountChecklist(){
        const bias=$('morningBiasCard');
        if(bias){const details=document.createElement('details');details.className='desk-bias-guide';details.innerHTML='<summary>Hướng dẫn xác định bias</summary>';const label=bias.firstElementChild;const guide=label.nextElementSibling;if(guide){guide.before(details);details.append(guide);}}
        const subtitle=document.querySelector('#view-checklist > .b-card');if(subtitle)subtitle.classList.add('desk-execution-intro');
        document.querySelectorAll('.checklist-knowledge > .b-card').forEach(card=>card.classList.add('desk-knowledge-card'));
    }
    function mountMarket(){
        const title=document.querySelector('#marketHoursCard h3');if(title)title.textContent='Các phiên giao dịch';
        for(const [id,label] of [['tabBtnMarketHours','Phiên giao dịch'],['tabBtnEconCalendar','Lịch kinh tế'],['tabBtnAllCalendar','Toàn cảnh']])$(id).textContent=label;
        const track=$('marketHoursInteractiveTrack').parentElement;track.classList.add('desk-timeline');
        const scroll=document.createElement('div');scroll.className='desk-timeline-scroll';scroll.tabIndex=0;scroll.setAttribute('role','region');scroll.setAttribute('aria-label','Dòng thời gian phiên giao dịch. Cuộn ngang để xem trên màn hình nhỏ.');
        track.before(scroll);scroll.append(track);
    }
    function mount(){
        document.documentElement.classList.add('desk-ui');mountHeader();mountNav();mountDashboard();mountChecklist();mountMarket();
        const foot=document.querySelector('footer');if(foot)foot.textContent='The Funded Angler · Personal Trading Desk';
        mounted=true;refreshView();
        new MutationObserver(refreshView).observe(document.querySelector('.finpoint-workspace'),{attributes:true,attributeFilter:['data-view']});
    }
    window.addEventListener('load',mount);
    return {navigate,settings};
})();
