// ==UserScript==
// @name         TopstepX to Cockpit Sync (1-Click Sync)
// @namespace    https://topstep.cockpit/
// @version      1.0
// @description  Tự động đồng bộ số dư, PnL ngày và lệnh từ TopstepX sang Cockpit cá nhân
// @author       Topstep Cockpit
// @match        https://trade.topstepx.com/*
// @match        https://*.topstepx.com/*
// @grant        GM_openInTab
// @grant        GM_setClipboard
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // Đường dẫn file Cockpit của bạn trên máy tính
    const COCKPIT_URL = 'file:///c:/Users/Acer/Downloads/topstep/index.html';

    // 1. Tạo nút nổi Floating Button trên giao diện TopstepX
    function injectFloatingButton() {
        if (document.getElementById('ts-cockpit-sync-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'ts-cockpit-sync-btn';
        btn.innerHTML = `
            <span style="font-size: 15px;">⚡</span>
            <span style="font-weight: 700;">Đồng Bộ Cockpit</span>
        `;
        btn.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 999999;
            background: linear-gradient(135deg, #1E40AF 0%, #2563EB 100%);
            color: #FFFFFF;
            border: 1px solid rgba(255, 255, 255, 0.25);
            border-radius: 30px;
            padding: 10px 18px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            box-shadow: 0 8px 24px rgba(37, 99, 235, 0.45);
            transition: all 0.2s ease;
        `;

        btn.onmouseover = () => {
            btn.style.transform = 'translateY(-2px) scale(1.02)';
            btn.style.boxShadow = '0 12px 28px rgba(37, 99, 235, 0.55)';
        };
        btn.onmouseout = () => {
            btn.style.transform = 'translateY(0) scale(1)';
            btn.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.45)';
        };

        btn.onclick = openSyncModal;
        document.body.appendChild(btn);
    }

    // 2. Tự động cào dữ liệu từ màn hình TopstepX
    function scrapeTopstepXData() {
        // Lấy ngày hiện tại chuẩn YYYY-MM-DD
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        let scrapedPnl = 0;
        let scrapedSymbol = 'MGC';
        let scrapedAccount = '';

        // Tìm PnL trên thanh tiêu đề TopstepX (chứa Daily PnL hoặc P&L)
        try {
            const allElements = Array.from(document.querySelectorAll('*'));
            for (const el of allElements) {
                const text = el.textContent || '';
                // Nhận diện text dạng Daily P&L hoặc Today's P&L
                if ((text.includes("Daily P&L") || text.includes("Today's P&L") || text.includes("Realized P&L")) && text.includes("$")) {
                    const match = text.match(/([+-]?\$[\d,]+(?:\.\d+)?)/);
                    if (match) {
                        const val = parseFloat(match[1].replace(/[$,]/g, ''));
                        if (!isNaN(val)) {
                            scrapedPnl = val;
                            break;
                        }
                    }
                }
            }

            // Nhận diện mã sản phẩm từ chart hoặc menu TopstepX (ví dụ: MGC, MNQ, MES, GC, NQ, ES)
            for (const el of allElements) {
                const text = (el.textContent || '').trim();
                const m = text.match(/\b(MGC|GC|MNQ|NQ|MES|ES|MCL|CL|MYM|YM|M2K|RTY|MBT|BTC)\b/);
                if (m) {
                    scrapedSymbol = m[1];
                    break;
                }
            }

            // Nhận diện mã tài khoản (VD: TS-50K hoặc các chuỗi số tài khoản)
            for (const el of allElements) {
                const text = (el.textContent || '').trim();
                if (text.includes("TS-") || text.includes("50K") || text.includes("100K") || text.includes("150K")) {
                    const m = text.match(/TS-[\w-]+/);
                    if (m) {
                        scrapedAccount = m[0];
                        break;
                    }
                }
            }
        } catch (e) {
            console.warn('Lỗi tự động đọc TopstepX:', e);
        }

        return {
            date: todayStr,
            pnl: scrapedPnl,
            symbol: scrapedSymbol,
            account: scrapedAccount
        };
    }

    // 3. Hiển thị hộp thoại xác nhận trước khi bắn sang Cockpit
    function openSyncModal() {
        const existing = document.getElementById('ts-cockpit-modal');
        if (existing) existing.remove();

        const data = scrapeTopstepXData();

        const modal = document.createElement('div');
        modal.id = 'ts-cockpit-modal';
        modal.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 1000000;
            background: rgba(11, 15, 23, 0.75);
            backdrop-filter: blur(6px);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        modal.innerHTML = `
            <div style="background: #111827; border: 1px solid #1F2937; border-radius: 16px; width: 380px; padding: 22px; color: #F9FAFB; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #1F2937; padding-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 16px;">⚡</span>
                        <strong style="font-size: 15px;">Đồng Bộ Về Cockpit</strong>
                    </div>
                    <button id="ts-close-modal-btn" style="background: none; border: none; color: #94A3B8; font-size: 18px; cursor: pointer;">&times;</button>
                </div>

                <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 18px;">
                    <div>
                        <label style="font-size: 11px; font-weight: 600; color: #94A3B8; display: block; margin-bottom: 4px;">Ngày Giao Dịch (EOD)</label>
                        <input id="sync-input-date" type="date" value="${data.date}" style="width: 100%; background: #1A2234; border: 1px solid #1F2937; border-radius: 8px; padding: 8px 12px; color: #F9FAFB; font-size: 13px; outline: none;">
                    </div>
                    <div>
                        <label style="font-size: 11px; font-weight: 600; color: #94A3B8; display: block; margin-bottom: 4px;">Sản Phẩm Trade</label>
                        <select id="sync-input-symbol" style="width: 100%; background: #1A2234; border: 1px solid #1F2937; border-radius: 8px; padding: 8px 12px; color: #F9FAFB; font-size: 13px; outline: none;">
                            <option value="MGC" ${data.symbol === 'MGC' ? 'selected' : ''}>MGC (Micro Gold)</option>
                            <option value="GC" ${data.symbol === 'GC' ? 'selected' : ''}>GC (Gold Standard)</option>
                            <option value="MNQ" ${data.symbol === 'MNQ' ? 'selected' : ''}>MNQ (Micro Nasdaq)</option>
                            <option value="NQ" ${data.symbol === 'NQ' ? 'selected' : ''}>NQ (E-mini Nasdaq)</option>
                            <option value="MES" ${data.symbol === 'MES' ? 'selected' : ''}>MES (Micro S&P 500)</option>
                            <option value="ES" ${data.symbol === 'ES' ? 'selected' : ''}>ES (E-mini S&P 500)</option>
                            <option value="MCL" ${data.symbol === 'MCL' ? 'selected' : ''}>MCL (Micro Crude Oil)</option>
                            <option value="CL" ${data.symbol === 'CL' ? 'selected' : ''}>CL (Crude Oil)</option>
                            <option value="MYM" ${data.symbol === 'MYM' ? 'selected' : ''}>MYM (Micro Dow Jones)</option>
                            <option value="YM" ${data.symbol === 'YM' ? 'selected' : ''}>YM (E-mini Dow Jones)</option>
                            <option value="M2K" ${data.symbol === 'M2K' ? 'selected' : ''}>M2K (Micro Russell)</option>
                            <option value="RTY" ${data.symbol === 'RTY' ? 'selected' : ''}>RTY (E-mini Russell)</option>
                            <option value="MBT" ${data.symbol === 'MBT' ? 'selected' : ''}>MBT (Micro Bitcoin)</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size: 11px; font-weight: 600; color: #94A3B8; display: block; margin-bottom: 4px;">Lãi / Lỗ Chốt Phiên ($ USD)</label>
                        <input id="sync-input-pnl" type="number" step="0.01" value="${data.pnl || 350}" style="width: 100%; background: #1A2234; border: 1px solid #1F2937; border-radius: 8px; padding: 8px 12px; color: #10B981; font-weight: 800; font-size: 16px; outline: none;">
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 8px;">
                    <button id="ts-cancel-btn" style="background: #1A2234; border: 1px solid #1F2937; border-radius: 8px; padding: 8px 14px; color: #F9FAFB; font-size: 12px; cursor: pointer;">Hủy</button>
                    <button id="ts-submit-sync-btn" style="background: #2563EB; border: none; border-radius: 8px; padding: 8px 16px; color: #FFFFFF; font-weight: 700; font-size: 12.5px; cursor: pointer;">Xác Nhận & Bắn Sang Cockpit ↗</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('ts-close-modal-btn').onclick = () => modal.remove();
        document.getElementById('ts-cancel-btn').onclick = () => modal.remove();

        document.getElementById('ts-submit-sync-btn').onclick = () => {
            const date = document.getElementById('sync-input-date').value;
            const symbol = document.getElementById('sync-input-symbol').value;
            const pnl = parseFloat(document.getElementById('sync-input-pnl').value) || 0;

            const payload = {
                date: date,
                symbol: symbol,
                pnl: pnl,
                account: data.account,
                timestamp: Date.now()
            };

            const jsonStr = JSON.stringify(payload);
            const base64 = btoa(encodeURIComponent(jsonStr));
            const targetUrl = `${COCKPIT_URL}#topstepx=${base64}`;

            // Mở hoặc chuyển tab sang Cockpit
            window.open(targetUrl, '_blank');
            modal.remove();
        };
    }

    // Tự động chèn nút khi trang TopstepX tải xong
    setInterval(injectFloatingButton, 2000);

})();
