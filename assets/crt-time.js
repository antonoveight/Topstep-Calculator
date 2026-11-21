/* CRT candle clock: manual feed timestamps, never an inferred model or entry. */
(function(root){
 'use strict';
 const T=root.MarketTime||(typeof module!=='undefined'?require('./market-time.js'):null);
 const KEY='tfa_crt_c3_clock_v1';
 function parse(value,zone){
  const m=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value||'');
  if(!m)return null;
  const p={year:+m[1],month:+m[2],day:+m[3],hour:+m[4],minute:+m[5]};
  const d=T.wall(p,zone);
  if(d){const actual=T.parts(d,zone);if(!Object.keys(p).every(k=>actual[k]===p[k]))return null;}
  // Fall-back duplicated civil minutes require an explicit UTC timestamp instead.
  if(d&&[-3600000,3600000].some(delta=>{const q=T.parts(+d+delta,zone);return Object.keys(p).every(k=>q[k]===p[k]);}))return null;
  return d;
 }
 function state(open,close,now=new Date()){
  if(!open||!close||!Number.isFinite(+open)||!Number.isFinite(+close)||+close<=+open)return {phase:'UNSET',remaining:null};
  return {phase:+now<+open?'WAIT C3':+now<+close?'C3 OPEN':'C3 CLOSED',remaining:Math.max(0,Math.ceil((+close-+now)/1000))};
 }
 function mount(){
  const host=document.getElementById('crtTimeContext');if(!host)return;
  host.innerHTML=`<div class="b-card" style="margin-top:16px;padding:18px;font-size:14px;line-height:1.6">
   <strong style="font-size:18px">CRT · Candle time</strong>
   <p>C1 tạo range · C2 đóng xác nhận TS · C3 chờ retest. Hết C3 thì dừng tìm entry; timeout chỉ giới hạn bối cảnh.</p>
   <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:end">
    <label>Múi giờ chart <select id="crtClockZone" class="b-input"><option value="America/New_York">New York (DST)</option><option value="Asia/Ho_Chi_Minh">Việt Nam</option><option value="UTC">UTC</option></select></label>
    <label>C3 mở · từ chart <input id="crtC3Open" class="b-input" type="datetime-local"></label>
    <label>C3 đóng · từ chart <input id="crtC3Close" class="b-input" type="datetime-local"></label>
    <button type="button" class="b-btn-secondary" id="crtClockClear">Xóa mốc</button>
   </div>
   <p id="crtClockState" role="status" aria-live="polite"></p><p id="crtClockNow" class="tabular-nums"></p>
   <small>Nhập đúng giờ mở/đóng C3 từ feed đang dùng. Đồng hồ web là ghi chú thủ công, chưa nhận model từ TradingView. Giờ không tự tạo tín hiệu.</small>
   <details style="margin-top:12px"><summary>Giờ tham khảo Romeotpt</summary>
    <p>Romeotpt nêu Forex: 1–5–9; index futures: 2–6–10; crypto: 1–2–4–8. Bài đăng ngắn chưa chỉ rõ múi giờ và cách áp dụng; chưa dùng làm lịch giao dịch hay bộ lọc tín hiệu. MGC là vàng futures, không tự áp lịch index futures.</p>
    <p>Một bài khác nêu 00:00, 03:00, 08:15, 09:30, 13:30 để quan sát lại sau khi lỡ nhịp; cũng chưa đủ thông tin để quy đổi thành lịch tự động.</p>
    <a href="https://t.me/officialRomeotpt/6264" target="_blank" rel="noopener">Nguồn chuỗi giờ</a> · <a href="https://t.me/s/officialRomeotpt?after=6276" target="_blank" rel="noopener">Nguồn mốc quan sát</a>
   </details></div>`;
  const zone=document.getElementById('crtClockZone'),a=document.getElementById('crtC3Open'),b=document.getElementById('crtC3Close');
  try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved&&['America/New_York','Asia/Ho_Chi_Minh','UTC'].includes(saved.zone)){zone.value=saved.zone;a.value=saved.open||'';b.value=saved.close||'';}}catch{}
  function update(){
   const now=new Date(),start=parse(a.value,zone.value),end=parse(b.value,zone.value),s=state(start,end,now);
   const message=s.phase==='UNSET'?'Chưa có mốc C3 hợp lệ.':s.phase==='WAIT C3'?'Chưa tới C3.':s.phase==='C3 CLOSED'?'C3 đã đóng · hết thời hạn tìm entry.':`C3 đang mở · còn ${Math.floor(s.remaining/60)}:${String(s.remaining%60).padStart(2,'0')}`;
   const status=document.getElementById('crtClockState');if(status.textContent!==message)status.textContent=message;
   document.getElementById('crtClockNow').textContent=['America/New_York','Asia/Ho_Chi_Minh'].map(z=>new Intl.DateTimeFormat('en-GB',{timeZone:z,hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(now)+(z===T.NY?' NY':' VN')).join(' · ');
  }
  for(const el of [zone,a,b])el.onchange=()=>{try{localStorage.setItem(KEY,JSON.stringify({zone:zone.value,open:a.value,close:b.value}));}catch{}update();};
  document.getElementById('crtClockClear').onclick=()=>{a.value=b.value='';a.onchange();};
  update();setInterval(update,1000);
 }
 root.CrtTime={parse,state};
 if(typeof module!=='undefined')module.exports=root.CrtTime;
 if(typeof window!=='undefined')window.addEventListener('DOMContentLoaded',mount);
})(typeof window!=='undefined'?window:globalThis);
