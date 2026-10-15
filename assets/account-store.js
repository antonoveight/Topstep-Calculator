/* Reversible local writes. Recovery records never contain API keys. */
(function(root) {
    const key='topstep_multi_accounts_v3', activeKey='topstep_active_acc_id_v3', historyKey='topstep_recovery_v1';
    let expected=localStorage.getItem(key);
    function history() {
        try {const data=JSON.parse(localStorage.getItem(historyKey)||'[]');return Array.isArray(data)?data:[];}
        catch {throw new Error('Lịch sử khôi phục bị hỏng. Hãy xuất dữ liệu trước khi tiếp tục.');}
    }
    function commit(accounts,active,reason='Cập nhật tài khoản') {
        const before=localStorage.getItem(key), oldActive=localStorage.getItem(activeKey), next=JSON.stringify(accounts);
        if(before!==expected) throw new Error('Dữ liệu đã đổi ở tab khác. Hãy tải lại trang trước khi lưu.');
        if(before!==next && before!==null) {
            const records=history();
            records.unshift({id:crypto.randomUUID(),at:new Date().toISOString(),reason,raw:before,active:oldActive});
            // Keep at least the newest recovery point; refuse a write if even that cannot fit.
            let kept=records.slice(0,12);
            while(true) {
                try {localStorage.setItem(historyKey,JSON.stringify(kept));break;}
                catch(err) {if(kept.length<=1) throw err;kept.pop();}
            }
        }
        try {
            localStorage.setItem(key,next);
            localStorage.setItem(activeKey,active);
            expected=next;
        } catch(err) {
            if(before===null) localStorage.removeItem(key);else localStorage.setItem(key,before);
            if(oldActive===null) localStorage.removeItem(activeKey);else localStorage.setItem(activeKey,oldActive);
            throw err;
        }
    }
    root.AccountStore={commit,history,key};
})(window);
