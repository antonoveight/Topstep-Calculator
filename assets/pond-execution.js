/* Outcomes are manual observations, independent of financial journal records. */
const PondExecution=(()=>{
    const storageKey='topstep_pond_outcomes_v1';
    const outcomes={tp:'Full TP',be:'Hòa vốn · BE',half:'Dừng lỗ · −0.5R',sl:'Dừng lỗ · −1R',skip:'Bỏ qua setup'};
    const fallbackSeeds=new Map();
    let data={current:{},history:[],reopened:{},fishSeeds:{}},invalid=false,started=-99,sceneKey='';
    try {
        const saved=JSON.parse(localStorage.getItem(storageKey)||'null');
        if(saved) {data=validate(saved);}
    }catch{invalid=true;}
    function validate(value){
        const valid=r=>r&&typeof r.id==='string'&&typeof r.account==='string'&&['combine','xfa'].includes(r.stage)&&[1,2,3,4].includes(r.setup)&&Object.hasOwn(outcomes,r.outcome)&&['yes','no','unrated'].includes(r.rating)&&Number.isFinite(Date.parse(r.at));
        if(!value||!value.current||Array.isArray(value.current)||!Array.isArray(value.history)||value.history.length>300||!Object.values(value.current).every(valid)||!value.history.every(valid))throw new Error('Dữ liệu kết quả hồ câu không hợp lệ.');
        if(value.reopened&&(!Object.values(value.reopened).every(id=>typeof id==='string')||Array.isArray(value.reopened)))throw new Error('Lượt đang sửa không hợp lệ.');
        if(value.fishSeeds&&(!value.fishSeeds||Array.isArray(value.fishSeeds)||typeof value.fishSeeds!=='object'||!Object.values(value.fishSeeds).every(n=>Number.isInteger(n)&&n>=0&&n<=4294967295)))throw new Error('Invalid fish seeds');
        return {...value,reopened:value.reopened||{},fishSeeds:value.fishSeeds||{}};
    }
    function reload(){fallbackSeeds.clear();try{data=validate(JSON.parse(localStorage.getItem(storageKey)||'{"current":{},"history":[]}'));invalid=false;started=-99;}catch{invalid=true;}}
    function key(setup=activeChecklistSetup){const a=getActiveAccount();return JSON.stringify([a.id,a.stage,Number(setup)]);}
    function fishSeed(){
        const k=key();
        if(Number.isInteger(data.fishSeeds[k]))return data.fishSeeds[k];
        if(fallbackSeeds.has(k))return fallbackSeeds.get(k);
        const seed=crypto.getRandomValues(new Uint32Array(1))[0];fallbackSeeds.set(k,seed);
        const draft=structuredClone(data);draft.fishSeeds[k]=seed;save(draft);
        return seed;
    }
    function current(){
        const stored=data.current[key()];
        if(stored&&Object.hasOwn(outcomes,stored.outcome))return stored;
        return document.getElementById('chk-risk-tp')?.checked?{outcome:'tp',rating:'unrated'}:null;
    }
    function save(next) {
        if(invalid){alert('Dữ liệu kết quả hồ câu cần khôi phục; bản gốc được giữ nguyên.');return false;}
        try{localStorage.setItem(storageKey,JSON.stringify(next));data=next;return true;}
        catch{alert('Chưa lưu được kết quả hồ câu. Dữ liệu trước đó được giữ nguyên.');return false;}
    }
    function notify(record,type='pond-outcome'){document.dispatchEvent(new CustomEvent(type,{detail:record}));}
    function finish(outcome) {
        if(!Object.hasOwn(outcomes,outcome)||data.current[key()])return false;
        const a=getActiveAccount(),record={id:data.reopened[key()]||crypto.randomUUID(),account:a.id,stage:a.stage,setup:activeChecklistSetup,
            outcome,fishSeed:fishSeed(),rating:'unrated',at:new Date().toISOString()};
        const next=structuredClone(data);next.current[key()]=record;delete next.reopened[key()];
        const old=next.history.findIndex(r=>r.id===record.id);if(old>=0)next.history[old]=record;else next.history.push(record);next.history=next.history.slice(-300);
        if(!save(next))return false;
        started=anglerState.time;sceneKey=key();notify(record);return true;
    }
    function onChecklist(next,prev,options) {
        if(sceneKey!==key()||options.restore){sceneKey=key();started=-99;}
        if(next.risk[2]&&!options.restore&&(!prev||prev.setup!==next.setup||!prev.risk[2]))finish('tp');
        // Unchecking TP explicitly reopens the same checklist, but keeps the observation in history.
        if(!next.risk[2]&&data.current[key()]?.outcome==='tp') {
            const draft=structuredClone(data);draft.reopened[key()]=draft.current[key()].id;delete draft.current[key()];save(draft);
        }
    }
    function age(){return sceneKey===key()?Math.max(0,anglerState.time-started):99;}
    function refresh() {
        const record=current(),select=document.getElementById('pondOutcomeRating'),status=document.getElementById('pondOutcomeStatus');
        if(select){select.disabled=!record?.id;select.value=record?.rating||'unrated';}
        if(status)status.textContent=record?outcomes[record.outcome]+' · đánh giá quy trình riêng với kết quả lệnh':'Chỉ ghi nhận sau khi bạn xác nhận trên chart. Không tự tính hoặc gửi lệnh.';
        document.querySelectorAll('[data-pond-outcome]').forEach(b=>{b.disabled=!!record;});
        [...[1,2,3,4].map(i=>document.getElementById('chk-s'+activeChecklistSetup+'-'+i)),...['1r','2r','tp'].map(id=>document.getElementById('chk-risk-'+id))].forEach(input=>{if(input)input.disabled=!!record&&record.outcome!=='tp';});
        if(record){
            document.getElementById('anglerCastBtnText').textContent='Bắt đầu lượt mới';
            const button=document.getElementById('btnAnglerCastReel');button.title='Bắt đầu lượt mới cho setup hiện tại';button.setAttribute('aria-label','Bắt đầu lượt mới cho setup hiện tại');
            if(record.outcome!=='tp') {
                document.getElementById('anglerStatusText').textContent=outcomes[record.outcome];
                document.getElementById('anglerQuoteText').textContent='Đánh giá theo quy trình bạn đã chọn. Không cần gỡ lại kết quả.';
                document.getElementById('rusticAnglerCanvas').setAttribute('aria-label',outcomes[record.outcome]);
            }
        }
        document.dispatchEvent(new Event('pond-execution-state'));
    }
    function choose(outcome) {
        if(current())return;
        if(outcome==='tp'){document.getElementById('chk-risk-tp').checked=true;onChecklistChange();return;}
        if(finish(outcome)){refresh();renderQuietPond();}
    }
    function newRound() {
        const draft=structuredClone(data);delete draft.current[key()];delete draft.reopened[key()];delete draft.fishSeeds[key()];if(!save(draft))return;fallbackSeeds.delete(key());
        for(let i=1;i<=4;i++)document.getElementById('chk-s'+activeChecklistSetup+'-'+i).checked=false;
        ['1r','2r','tp'].forEach(id=>document.getElementById('chk-risk-'+id).checked=false);
        onChecklistChange();
    }
    function clearCurrent() {const draft=structuredClone(data);draft.current={};draft.reopened={};draft.fishSeeds={};const saved=save(draft);if(saved)fallbackSeeds.clear();return saved;}
    function mount() {
        document.getElementById('rusticAnglerCard').insertAdjacentHTML('beforeend',`<details class="pond-execution"><summary>Kết thúc lượt &amp; đánh giá</summary><div class="pond-outcome-buttons">${Object.entries(outcomes).map(([value,label])=>`<button type="button" class="b-btn-secondary" data-pond-outcome="${value}">${label}</button>`).join('')}</div><label class="pond-rating">Tuân thủ điều kiện đã chọn?<select id="pondOutcomeRating"><option value="unrated">Chưa đánh giá</option><option value="yes">Có</option><option value="no">Có thay đổi / chưa đúng</option></select></label><p id="pondOutcomeStatus" class="ws-muted"></p></details>`);
        document.querySelectorAll('[data-pond-outcome]').forEach(b=>b.onclick=()=>choose(b.dataset.pondOutcome));
        document.getElementById('pondOutcomeRating').onchange=e=>{
            const record=current();if(!record?.id)return;
            const draft=structuredClone(data),rating=e.target.value;
            if(!['yes','no','unrated'].includes(rating))return;
            draft.current[key()].rating=rating;const item=draft.history.find(r=>r.id===record.id);if(item)item.rating=rating;
            if(save(draft))notify({...record,rating},'pond-outcome-rated');
            refresh();
        };
        refresh();
    }
    const reset=resetChecklist;
    window.resetChecklist=function(){if(clearCurrent())reset();};
    window.addEventListener('load',mount);
    return {current,fishSeed,onChecklist,refresh,choose,newRound,age,history:()=>structuredClone(data.history),labels:outcomes,validate,reload};
})();
window.PondExecution=PondExecution;
