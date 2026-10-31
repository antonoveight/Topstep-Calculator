

const accountData = TradingRules.accounts;

        function escapeHtml(value) {
            return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
        }

        function isValidTradeDate(value) {
            return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
                Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
        }

        function normalizeAccounts(value) {
            if (!Array.isArray(value) || !value.length) throw new Error('Danh sách tài khoản trống hoặc sai định dạng.');
            const ids = new Set();
            const journal = entries => {
                if (!Array.isArray(entries)) throw new Error('Nhật ký phải là một danh sách.');
                return entries.map(e => {
                    if (!e || !isValidTradeDate(e.date) || typeof e.pnl !== 'number' || !Number.isFinite(e.pnl))
                        throw new Error('Nhật ký chứa ngày hoặc PnL không hợp lệ.');
                    if (e.symbol && !Object.hasOwn(symbolSpecs, e.symbol)) throw new Error('Mã sản phẩm không hợp lệ.');
                    validateJournalMetadata(e);
                    return {...e, symbol: e.symbol || 'MGC', contracts: Number.isInteger(e.contracts) && e.contracts > 0 ? e.contracts : 1,
                        trades: Number.isInteger(e.trades) && e.trades > 0 ? e.trades : 1};
                }).sort((a, b) => a.date.localeCompare(b.date));
            };
            return value.map(a => {
                if (a && a.pricingPath === 'no_act_fee') a = {...a, pricingPath:'no_activation'};
                if (!a || typeof a.id !== 'string' || !a.id.trim() || ids.has(a.id.trim().toLowerCase()) ||
                    !Object.hasOwn(accountData, a.size) || !['combine','xfa'].includes(a.stage) ||
                    !['standard','no_activation'].includes(a.pricingPath)) throw new Error('Thông tin tài khoản không hợp lệ hoặc trùng mã.');
                ids.add(a.id.trim().toLowerCase());
                validateAccountMetadata(a);
                const payouts = a.payoutHistory ?? [];
                if (!Array.isArray(payouts) || payouts.some(e => !e || !isValidTradeDate(e.date) || typeof e.amount !== 'number' || !Number.isFinite(e.amount) || e.amount < 125))
                    throw new Error('Lịch sử payout không hợp lệ.');
                return {...a, id:a.id.trim(), name:typeof a.name === 'string' ? a.name : a.id, size:String(a.size),
                    xfaPath: a.xfaPath === 'consistency_payout' ? 'consistency_payout' : 'standard_payout',
                    journalEntries:journal(a.journalEntries ?? []), xfaJournalEntries:journal(a.xfaJournalEntries ?? []),
                    payoutHistory:[...payouts].sort((a,b) => a.date.localeCompare(b.date))};
            });
        }

        function getAccountRules(acc) { return TradingRules.rules(acc); }
        function getAccountLedger(acc) { return TradingRules.ledger(acc); }
        function getPayoutStatus(acc, asOfDate = getActiveTopstepTradeDate()) { return TradingRules.payout(acc, asOfDate); }

        let accountsList;
        let accountStorageInvalid = false;
        try { accountsList = JSON.parse(localStorage.getItem('topstep_multi_accounts_v3') || 'null'); }
        catch (err) { accountStorageInvalid = true; console.error('Không đọc được dữ liệu tài khoản:', err); }


        if (!accountsList || !Array.isArray(accountsList) || accountsList.length === 0) {
            if (accountsList != null) accountStorageInvalid = true;
            let legacyJournal = [];
            try { legacyJournal = JSON.parse(localStorage.getItem('topstep_journal_entries') || '[]'); } catch (err) { console.error(err); }
            accountsList = [
                {
                    id: "TS-50K-001",
                    name: "Tài Khoản Mặc Định $50K",
                    size: "50",
                    pricingPath: "standard",
                    stage: "combine",
                    xfaPath: "standard_payout",
                    journalEntries: legacyJournal,
                    payoutHistory: []
                }
            ];
            if (!accountStorageInvalid) AccountStore.commit(accountsList, accountsList[0].id, 'Khởi tạo tài khoản');
        }

        let activeAccountId = localStorage.getItem('topstep_active_acc_id_v3') || accountsList[0].id;

        function getActiveAccount() {
            let acc = accountsList.find(a => a.id === activeAccountId);
            if (!acc) {
                activeAccountId = accountsList[0].id;
                acc = accountsList[0];
            }
            return acc;
        }

        function saveAccounts() {
            try {
                if (accountStorageInvalid) throw new Error('Dữ liệu lưu bị hỏng. Hãy khôi phục bản sao lưu JSON trước khi ghi tiếp.');
                normalizeAccounts(accountsList);
                AccountStore.commit(accountsList, activeAccountId, window.accountSaveReason || 'Cập nhật tài khoản');
            } catch (err) {
                try { accountsList = normalizeAccounts(JSON.parse(localStorage.getItem('topstep_multi_accounts_v3'))); } catch {}
                alert('Chưa lưu được thay đổi: ' + err.message + ' Dữ liệu đã lưu trước đó được giữ nguyên.');
                throw err;
            }
        }

        function renderAccountDropdown() {
            const dropdown = document.getElementById("accountDropdown");
            dropdown.innerHTML = "";

            const activeAccs = accountsList.filter(a => a.status !== 'archived');
            const archivedAccs = accountsList.filter(a => a.status === 'archived');

            if (activeAccs.length > 0) {
                const grpActive = document.createElement("optgroup");
                grpActive.label = "🟢 QUỸ ĐANG HOẠT ĐỘNG";
                activeAccs.forEach(acc => {
                    const opt = document.createElement("option");
                    opt.value = acc.id;
                    opt.selected = (acc.id === activeAccountId);
                    let stageTag = acc.stage === 'xfa' ? 'XFA' : 'Combine';
                    opt.innerText = `[${stageTag}] ${acc.id} - ${acc.name} (${acc.size}K)`;
                    grpActive.appendChild(opt);
                });
                dropdown.appendChild(grpActive);
            }

            if (archivedAccs.length > 0) {
                const grpArchived = document.createElement("optgroup");
                grpArchived.label = "📁 QUỸ ĐÃ ĐÓNG / LƯU TRỮ";
                archivedAccs.forEach(acc => {
                    const opt = document.createElement("option");
                    opt.value = acc.id;
                    opt.selected = (acc.id === activeAccountId);
                    let reasonTag = acc.closedReason === 'mll' ? 'Cháy MLL' : (acc.closedReason === 'passed' ? 'Đã Pass' : (acc.closedReason === 'dll' ? 'Dừng phiên DLL' : 'Đã đóng'));
                    opt.innerText = `[ĐÃ ĐÓNG - ${reasonTag}] ${acc.id} - ${acc.name} (${acc.size}K)`;
                    grpArchived.appendChild(opt);
                });
                dropdown.appendChild(grpArchived);
            }
        }

        function onAccountDropdownChange() {
            const dropdown = document.getElementById("accountDropdown");
            activeAccountId = dropdown.value;
            saveAccounts();
            loadActiveAccountState();
        }

        function loadActiveAccountState() {
            renderAccountDropdown();
            const acc = getActiveAccount();

            document.getElementById("displayAccountTitle").innerText = `${acc.id} (${acc.name})`;
            document.getElementById("trackerAccountIdTag").innerText = acc.id;

            document.getElementById("infoAccSizeTag").innerText = `Gói $${acc.size},000`;
            document.getElementById("infoPricingTag").innerText = acc.pricingPath === 'standard' ? 'Standard Path' : 'No Activation Fee';

            const stageBadge = document.getElementById("activeStageBadge");
            const btnToggle = document.getElementById("btnToggleStage");
            const archiveBanner = document.getElementById("archivedAccountBanner");
            const archiveTitle = document.getElementById("archivedBannerTitle");
            const archiveDesc = document.getElementById("archivedBannerDesc");

            if (acc.status === "archived") {
                let reasonText = acc.closedReason === 'mll' ? 'Vi Phạm MLL (Cháy tài khoản)' : (acc.closedReason === 'passed' ? 'Đã Đỗ Vòng Thi' : (acc.closedReason === 'dll' ? 'Vi Phạm DLL' : 'Đã Hủy/Bỏ Qua'));
                stageBadge.innerText = "ĐÃ ĐÓNG (LƯU TRỮ)";
                stageBadge.className = "b-badge b-badge-red";
                if (archiveBanner) {
                    archiveBanner.style.display = "flex";
                    if (archiveTitle) archiveTitle.innerText = `TÀI KHOẢN [${acc.id}] ĐÃ LƯU TRỮ · LÝ DO: ${reasonText.toUpperCase()}`;
                    if (archiveDesc) archiveDesc.innerText = `Đóng ngày: ${acc.closedDate || 'Gần đây'} · Dữ liệu ${(acc.journalEntries || []).length} phiên EOD được bảo lưu nguyên vẹn để thống kê.`;
                }
            } else {
                if (archiveBanner) archiveBanner.style.display = "none";
                if (acc.stage === "xfa") {
                    stageBadge.innerText = "Vòng XFA";
                    stageBadge.className = "px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold";
                } else {
                    stageBadge.innerText = "Vòng Combine";
                    stageBadge.className = "px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold";
                }
            }

            if (acc.stage === "xfa") {
                btnToggle.innerHTML = "<span>Nâng Về Combine</span>";
                btnToggle.className = "bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-1.5 px-3 rounded-xl transition-all shadow-md";
                document.getElementById("xfaPayoutSection").classList.remove("hidden");
            } else {
                btnToggle.innerHTML = "<span>Chuyển Sang XFA</span>";
                btnToggle.className = "bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-1.5 px-3 rounded-xl transition-all shadow-md";
                document.getElementById("xfaPayoutSection").classList.add("hidden");
            }

            calculateRules();
        }

        function getActiveJournal(acc) {
            if (acc.stage === "xfa") {
                if (!acc.xfaJournalEntries) acc.xfaJournalEntries = [];
                return acc.xfaJournalEntries;
            } else {
                if (!acc.journalEntries) acc.journalEntries = [];
                return acc.journalEntries;
            }
        }

        function toggleAccountStage() {
            const acc = getActiveAccount();
            acc.stage = (acc.stage === "xfa") ? "combine" : "xfa";
            saveAccounts();
            loadActiveAccountState();
        }


        function openPricingModal() {
            document.getElementById("pricingModal").classList.remove("hidden");
        }

        function closePricingModal() {
            document.getElementById("pricingModal").classList.add("hidden");
        }

        function applyPackageToCurrent(size) {
            const acc = getActiveAccount();
            if (!acc) return;
            const targetData = accountData[size];
            if (confirm(`Bạn có muốn chuyển tài khoản ${acc.id} sang Gói ${targetData.title} (${targetData.noActFee}) không?\n\n• Target: ${targetData.target}\n• Consistency: 55%\n• MLL: ${targetData.mll}\n• DLL: ${targetData.dll}\n• Max Contracts: ${targetData.contracts}`)) {
                acc.size = size;
                acc.pricingPath = "no_activation";
                saveAccounts();
                loadActiveAccountState();
                closePricingModal();
                alert(`Đã chuyển thành công tài khoản ${acc.id} sang Gói ${size}K (${targetData.noActFee})!`);
            }
        }

        function openAddAccountModalWithSize(size) {
            closePricingModal();
            openAddAccountModal();
            const sizeSelect = document.getElementById("newAccSize");
            if (sizeSelect) sizeSelect.value = size;
            const pricingSelect = document.getElementById("newAccPricing");
            if (pricingSelect) pricingSelect.value = "no_activation";
            const idInput = document.getElementById("newAccId");
            if (idInput) {
                const nextNum = accountsList.length + 1;
                idInput.value = `TS-${size}K-00${nextNum}`;
            }
        }

        function openAddAccountModal() {
            document.getElementById("newAccId").value = `TS-${document.getElementById("newAccSize").value}K-${String(accountsList.length + 1).padStart(3, '0')}`;
            document.getElementById("addAccountModal").classList.remove("hidden");
        }
        function closeAddAccountModal() {
            document.getElementById("addAccountModal").classList.add("hidden");
        }
        function submitNewAccount(e) {
            e.preventDefault();
            const id = document.getElementById("newAccId").value.trim();
            const name = document.getElementById("newAccName").value.trim();
            const size = document.getElementById("newAccSize").value;
            const stage = document.getElementById("newAccStage").value;
            const pricingPath = document.getElementById("newAccPricing").value;

            if (!id) { alert("Vui lòng nhập Mã Tài Khoản!"); return; }
            if (accountsList.some(a => a.id.toLowerCase() === id.toLowerCase())) {
                alert("Mã tài khoản này đã tồn tại!");
                return;
            }

            const newAcc = {
                id,
                name: name || `Tài khoản ${id}`,
                size,
                pricingPath,
                stage,
                xfaPath: "standard_payout",
                journalEntries: [],
                xfaJournalEntries: [],
                payoutHistory: []
            };

            accountsList.push(newAcc);
            activeAccountId = id;
            saveAccounts();
            closeAddAccountModal();
            loadActiveAccountState();
        }

        function onEditAccStatusChange() {
            const status = document.getElementById("editAccStatus").value;
            const block = document.getElementById("archiveReasonBlock");
            if (block) block.style.display = (status === "archived") ? "block" : "none";
        }

        function openEditAccountModal() {
            const acc = getActiveAccount();
            document.getElementById("editAccName").value = acc.name;
            document.getElementById("editAccSize").value = acc.size;
            document.getElementById("editAccPricing").value = acc.pricingPath;
            document.getElementById("editAccXfa").value = acc.xfaPath || "standard_payout";
            document.getElementById("editAccDoubleCap").checked = acc.payoutCapDoubled === true;

            const statusSelect = document.getElementById("editAccStatus");
            if (statusSelect) statusSelect.value = acc.status || "active";
            const reasonSelect = document.getElementById("editAccClosedReason");
            if (reasonSelect) reasonSelect.value = acc.closedReason || "mll";
            const dateInput = document.getElementById("editAccClosedDate");
            if (dateInput) dateInput.value = acc.closedDate || getActiveTopstepTradeDate();

            onEditAccStatusChange();
            document.getElementById("editAccountModal").classList.remove("hidden");
        }
        function closeEditAccountModal() {
            document.getElementById("editAccountModal").classList.add("hidden");
        }
        function submitEditAccount(e) {
            e.preventDefault();
            const acc = getActiveAccount();
            acc.name = document.getElementById("editAccName").value.trim();
            if (acc.size !== document.getElementById("editAccSize").value) { delete acc.confirmedMiniLimit; delete acc.limitSession; }
            acc.size = document.getElementById("editAccSize").value;
            acc.pricingPath = document.getElementById("editAccPricing").value;
            acc.xfaPath = document.getElementById("editAccXfa").value;
            acc.payoutCapDoubled = document.getElementById("editAccDoubleCap").checked;

            const status = document.getElementById("editAccStatus").value;
            acc.status = status;
            if (status === "archived") {
                acc.closedReason = document.getElementById("editAccClosedReason").value;
                acc.closedDate = document.getElementById("editAccClosedDate").value || getActiveTopstepTradeDate();
            } else {
                acc.closedReason = "";
                acc.closedDate = "";
            }

            saveAccounts();
            closeEditAccountModal();
            loadActiveAccountState();
        }

        function reactivateCurrentAccount() {
            const acc = getActiveAccount();
            acc.status = "active";
            acc.closedReason = "";
            acc.closedDate = "";
            saveAccounts();
            loadActiveAccountState();
        }

        function deleteCurrentAccount() {
            if (accountsList.length <= 1) {
                alert("Bạn phải giữ lại ít nhất 1 tài khoản!");
                return;
            }
            const acc = getActiveAccount();
            if (confirm(`Xóa tài khoản [${acc.id}]?`)) {
                accountsList = accountsList.filter(a => a.id !== acc.id);
                activeAccountId = accountsList[0].id;
                saveAccounts();
                closeEditAccountModal();
                loadActiveAccountState();
            }
        }


        function getPayoutCap(acc, data) {
            const base = acc.xfaPath === 'consistency_payout' ? data.xfaConCapVal : data.xfaStdCapVal;
            const val = base * (acc.payoutCapDoubled === true ? 2 : 1);
            return {val, label:'$' + val.toLocaleString('en-US') + (acc.payoutCapDoubled === true ? ' (DLL ưu đãi)' : '')};
        }

        function calculateRules() {
            const acc = getActiveAccount();
            const selectedAcc = acc.size;
            const pricingPath = acc.pricingPath;
            const xfaPath = acc.xfaPath || "standard_payout";

            const data = getAccountRules(acc);
            const capInfo = getPayoutCap(acc, data);

            if (pricingPath === "standard") {
                document.getElementById("monthlyFee").innerText = data.stdFee;
                document.getElementById("activationFeeNote").innerText = data.stdActivation;
                document.getElementById("activationFeeNote").className = "text-[10px] text-indigo-400 font-medium block mt-0.5";
            } else {
                document.getElementById("monthlyFee").innerText = data.noActFee;
                document.getElementById("activationFeeNote").innerText = data.noActActivation;
                document.getElementById("activationFeeNote").className = "text-[10px] text-emerald-400 font-medium block mt-0.5";
            }

            const combineCardEl = document.getElementById("combineRulesCard");
            const xfaCardEl = document.getElementById("xfaRulesCard");
            const xfaMllRuleTextEl = document.getElementById("xfaMllRuleText");
            if (xfaMllRuleTextEl) {
                xfaMllRuleTextEl.innerText = `MLL khóa tại $${data.initialBal.toLocaleString()}`;
            }

            if (acc.stage === "xfa") {
                if (combineCardEl) combineCardEl.classList.add("hidden");
                if (xfaCardEl) xfaCardEl.classList.remove("hidden");

                document.getElementById("card2Label").innerText = "Tổng Payout Đã Rút";
                document.getElementById("profitTarget").innerText = `${(acc.payoutHistory || []).reduce((sum, p) => sum + p.amount, 0).toLocaleString()}`;
                document.getElementById("profitTarget").className = "text-lg font-black text-purple-400";
                document.getElementById("card2Note").innerText = "Đã chuyển về ví";

                document.getElementById("mllLockInfo").innerText = `MLL khóa tại $${data.initialBal.toLocaleString()}`;
            } else {
                if (combineCardEl) combineCardEl.classList.remove("hidden");
                if (xfaCardEl) xfaCardEl.classList.add("hidden");

                document.getElementById("card2Label").innerText = "Mục Tiêu Target";
                document.getElementById("profitTarget").innerText = data.target;
                document.getElementById("profitTarget").className = "text-lg font-black text-emerald-400";
                document.getElementById("card2Note").innerText = "Combine Target";

                document.getElementById("mllLockInfo").innerText = data.mllLock;
            }

            document.getElementById("combineProfitTarget").innerText = data.target;
            document.getElementById("maxLoss").innerText = data.mll;
            document.getElementById("dailyLoss").innerText = data.dll;
            document.getElementById("maxContracts").innerText = data.contracts;
            document.getElementById("safeDailyProfit").innerText = data.safeProfit;
            document.getElementById("combineMllRule").innerText = data.combineMllText;

            if (xfaPath === "standard_payout") {
                document.getElementById("xfaPathTitle").innerText = "Standard Path Payout";
                document.getElementById("xfaPathDesc").innerText = "≥ 5 ngày thắng (lãi ≥ +$150 EOD). Rút ≤55% số dư lợi nhuận.";
                document.getElementById("xfaPayoutCap").innerText = capInfo.label;
            } else {
                document.getElementById("xfaPathTitle").innerText = "Consistency Path Payout";
                document.getElementById("xfaPathDesc").innerText = "≥ 3 ngày trade + Consistency ≤ 40% EOD. Rút ≤55% số dư lợi nhuận.";
                document.getElementById("xfaPayoutCap").innerText = capInfo.label;
            }

            document.getElementById("inputContracts").value = Math.floor(data.maxMicros / 10);

            calculateTradeRisk();
            renderTrackerTable();
        }

        /**
         * Calculates the active/next Topstep Trade Date based on real-time US Central market hours.
         * The session date rolls at 5 PM CT; the 3:10-5 PM break retains the completed EOD date.
         * Weekend: Sat & Sun markets closed -> Next trade date = Monday.
         */
        function getActiveTopstepTradeDate(now = new Date()) {
            try {
                let ctDateStr = now.toLocaleString("en-US", { timeZone: "America/Chicago" });
                let ctDate = new Date(ctDateStr);

                let year = ctDate.getFullYear();
                let month = ctDate.getMonth();
                let day = ctDate.getDate();
                let dayOfWeek = ctDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
                let hours = ctDate.getHours();
                let minutes = ctDate.getMinutes();

                let isAfterCutoff = hours >= 17;
                let tradeDate = new Date(year, month, day);

                if (dayOfWeek === 6) {
                    // Saturday -> Next trade date is Monday (+2 days)
                    tradeDate.setDate(day + 2);
                } else if (dayOfWeek === 0) {
                    // Sunday -> Next trade date is Monday (+1 day)
                    tradeDate.setDate(day + 1);
                } else if (dayOfWeek === 5 && isAfterCutoff) {
                    // Friday after the session boundary -> Monday
                    tradeDate.setDate(day + 3);
                } else if (isAfterCutoff) {
                    // Mon-Thu from 5 PM CT -> next day's session
                    tradeDate.setDate(day + 1);
                }

                let yyyy = tradeDate.getFullYear();
                let mm = String(tradeDate.getMonth() + 1).padStart(2, '0');
                let dd = String(tradeDate.getDate()).padStart(2, '0');
                return `${yyyy}-${mm}-${dd}`;
            } catch (e) {
                let yyyy = now.getFullYear();
                let mm = String(now.getMonth() + 1).padStart(2, '0');
                let dd = String(now.getDate()).padStart(2, '0');
                return `${yyyy}-${mm}-${dd}`;
            }
        }

        /**
         * Returns the next available trade date that has NOT been logged in the active account journal yet.
         */
        function getNextUnloggedTradeDate(acc) {
            let journalEntries = getActiveJournal(acc);
            let activeDate = getActiveTopstepTradeDate();

            if (!journalEntries || journalEntries.length === 0) {
                return activeDate;
            }

            let loggedDates = journalEntries.map(e => e.date).sort();
            let lastLoggedDateStr = loggedDates[loggedDates.length - 1];

            let baseDateStr = (lastLoggedDateStr >= activeDate) ? lastLoggedDateStr : activeDate;

            let parts = baseDateStr.split("-");
            let d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));

            // If baseDateStr is not logged yet, return it
            if (!journalEntries.some(e => e.date === baseDateStr)) {
                return baseDateStr;
            }

            // Otherwise, increment by 1 day until an unlogged weekday is found
            for (let i = 0; i < 30; i++) {
                d.setDate(d.getDate() + 1);
                let dayOfWeek = d.getDay();
                if (dayOfWeek === 6) d.setDate(d.getDate() + 2); // Sat -> Mon
                if (dayOfWeek === 0) d.setDate(d.getDate() + 1); // Sun -> Mon

                let yyyy = d.getFullYear();
                let mm = String(d.getMonth() + 1).padStart(2, '0');
                let dd = String(d.getDate()).padStart(2, '0');
                let candidateDate = `${yyyy}-${mm}-${dd}`;

                if (!journalEntries.some(e => e.date === candidateDate)) {
                    return candidateDate;
                }
            }
            return activeDate;
        }

        const symbolSpecs = {
            "MGC":    { name: "Micro Gold (MGC)", tickSize: 0.10, microTickVal: 1.00, miniTickVal: 10.00, unitName: "giá Vàng", defaultSlPts: 2.0, defaultTicks: 20 },
            "MNQ":    { name: "Micro Nasdaq (MNQ)", tickSize: 0.25, microTickVal: 0.50, miniTickVal: 5.00, unitName: "giá NQ", defaultSlPts: 20.0, defaultTicks: 80 },
            "MES":    { name: "Micro S&P 500 (MES)", tickSize: 0.25, microTickVal: 1.25, miniTickVal: 12.50, unitName: "giá ES", defaultSlPts: 5.0, defaultTicks: 20 },
            "MCLZ26": { name: "Micro Crude Oil (MCLZ26)", tickSize: 0.01, microTickVal: 1.00, miniTickVal: 10.00, unitName: "giá Dầu ($)", defaultSlPts: 0.30, defaultTicks: 30 },
            "MCL":    { name: "Micro Crude Oil (MCL)", tickSize: 0.01, microTickVal: 1.00, miniTickVal: 10.00, unitName: "giá Dầu ($)", defaultSlPts: 0.30, defaultTicks: 30 },

            // Legacy symbols retained for backward compatibility with historical journal records
            "GC":  { name: "Gold Full (GC)", tickSize: 0.10, microTickVal: 1.00, miniTickVal: 10.00, unitName: "giá Vàng", defaultSlPts: 2.0, defaultTicks: 20 },
            "NQ":  { name: "E-mini Nasdaq (NQ)", tickSize: 0.25, microTickVal: 0.50, miniTickVal: 5.00, unitName: "giá NQ", defaultSlPts: 20.0, defaultTicks: 80 },
            "ES":  { name: "E-mini S&P 500 (ES)", tickSize: 0.25, microTickVal: 1.25, miniTickVal: 12.50, unitName: "giá ES", defaultSlPts: 5.0, defaultTicks: 20 },
            "CL":  { name: "Crude Oil (CL)", tickSize: 0.01, microTickVal: 1.00, miniTickVal: 10.00, unitName: "giá Dầu ($)", defaultSlPts: 0.30, defaultTicks: 30 },
            "MYM": { name: "Micro Dow Jones (MYM)", tickSize: 1.00, microTickVal: 0.50, miniTickVal: 5.00, unitName: "giá YM", defaultSlPts: 30.0, defaultTicks: 30 },
            "YM":  { name: "E-mini Dow Jones (YM)", tickSize: 1.00, microTickVal: 0.50, miniTickVal: 5.00, unitName: "giá YM", defaultSlPts: 30.0, defaultTicks: 30 },
            "M2K": { name: "Micro Russell (M2K)", tickSize: 0.10, microTickVal: 0.50, miniTickVal: 5.00, unitName: "giá RTY", defaultSlPts: 3.0, defaultTicks: 30 },
            "RTY": { name: "E-mini Russell (RTY)", tickSize: 0.10, microTickVal: 0.50, miniTickVal: 5.00, unitName: "giá RTY", defaultSlPts: 3.0, defaultTicks: 30 },
            "MBT": { name: "Micro Bitcoin (MBT)", tickSize: 5.00, microTickVal: 0.50, miniTickVal: 25.00, unitName: "giá BTC ($)", defaultSlPts: 200.0, defaultTicks: 40 },
            "BTC": { name: "Bitcoin Futures (BTC)", tickSize: 5.00, microTickVal: 0.50, miniTickVal: 25.00, unitName: "giá BTC ($)", defaultSlPts: 200.0, defaultTicks: 40 }
        };

        let slInputMode = "ticks"; // "ticks" or "points"

        function formatDateVN(dateStr) {
            if (!dateStr) return "";
            let parts = dateStr.split("-");
            if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
            return dateStr;
        }

        function toggleSlUnitMode() {
            slInputMode = (slInputMode === "ticks") ? "points" : "ticks";
            const symbol = document.getElementById("calcSymbol") ? document.getElementById("calcSymbol").value : "MGC";
            const spec = symbolSpecs[symbol] || symbolSpecs["MGC"];
            const valInput = document.getElementById("ticksInput");

            if (slInputMode === "points") {
                document.getElementById("slDistanceLabel").innerText = `Khoảng SL (${spec.unitName}):`;
                document.getElementById("slUnitToggleText").innerText = "Nhập Theo Ticks";
                let currentTicks = parseFloat(valInput.value) || spec.defaultTicks;
                let currentPts = (currentTicks * spec.tickSize).toFixed(2);
                valInput.value = parseFloat(currentPts);
            } else {
                document.getElementById("slDistanceLabel").innerText = "Khoảng SL (Ticks):";
                document.getElementById("slUnitToggleText").innerText = "Nhập Theo Giá (Pts)";
                let currentPts = parseFloat(valInput.value) || spec.defaultSlPts;
                let currentTicks = Math.round(currentPts / spec.tickSize);
                valInput.value = currentTicks;
            }
            calculateTradeRisk();
        }

        function onCalcSymbolChange(syncEod = true) {
            const symbolSelect = document.getElementById("calcSymbol");
            if (!symbolSelect) return;
            const symbol = symbolSelect.value;
            const spec = symbolSpecs[symbol] || symbolSpecs["MGC"];

            if (syncEod) {
                const eodSymbolSelect = document.getElementById("inputSymbol");
                if (eodSymbolSelect) {
                    let matchingOpt = Array.from(eodSymbolSelect.options).find(o => o.value === symbol || o.value.startsWith(symbol) || symbol.startsWith(o.value));
                    if (matchingOpt) eodSymbolSelect.value = matchingOpt.value;
                }
            }

            const badgeEl = document.getElementById("calcSpecBadge");
            if (badgeEl) {
                badgeEl.innerText = `1 Tick ${symbol} = ${spec.tickSize} pt ($${spec.microTickVal.toFixed(2)}/micro)`;
            }

            if (slInputMode === "points") {
                document.getElementById("slDistanceLabel").innerText = `Khoảng SL (${spec.unitName}):`;
                document.getElementById("ticksInput").value = spec.defaultSlPts;
            } else {
                document.getElementById("slDistanceLabel").innerText = "Khoảng SL (Ticks):";
                document.getElementById("ticksInput").value = spec.defaultTicks;
            }
            calculateTradeRisk();
        }

        function onEodSymbolChange() {
            const eodSymbolSelect = document.getElementById("inputSymbol");
            if (!eodSymbolSelect) return;
            const eodVal = eodSymbolSelect.value;
            const calcSymbolSelect = document.getElementById("calcSymbol");
            if (calcSymbolSelect) {
                let matchingOpt = Array.from(calcSymbolSelect.options).find(o => o.value === eodVal || eodVal.startsWith(o.value) || o.value.startsWith(eodVal));
                if (matchingOpt) {
                    calcSymbolSelect.value = matchingOpt.value;
                    onCalcSymbolChange(false);
                }
            }
        }

        function calculateTradeRisk() {
            const acc = getActiveAccount();
            const data = getAccountRules(acc);

            const symbolSelect = document.getElementById("calcSymbol");
            const symbol = symbolSelect ? symbolSelect.value : "MGC";
            const spec = symbolSpecs[symbol] || symbolSpecs["MGC"];

            const stopLossUsd = parseFloat(document.getElementById("stopLossInput").value) || 0;
            const distanceVal = parseFloat(document.getElementById("ticksInput").value) || 0;

            if (!Number.isFinite(stopLossUsd) || !Number.isFinite(distanceVal) || stopLossUsd <= 0 || distanceVal <= 0) {
                document.getElementById('calcMicroLots').innerText = '0 Micros';
                document.getElementById('calcMiniLots').innerText = '0 Mini';
                document.getElementById('calcActualRisk').innerText = '$0.00';
                return;
            }

            let ticks = 0;
            if (slInputMode === "points") {
                ticks = distanceVal / spec.tickSize;
            } else {
                ticks = distanceVal;
            }

            if (ticks <= 0) return;

            ticks = Math.ceil(ticks);
            let riskPerMicroLot = ticks * spec.microTickVal;
            if (riskPerMicroLot <= 0) return;

            let microLots = Math.floor(stopLossUsd / riskPerMicroLot);

            if (microLots < 1) microLots = 0;
            if (microLots > data.maxMicros) microLots = data.maxMicros;

            let actualLossUsd = microLots * riskPerMicroLot;
            const microPerMini = spec.miniTickVal / spec.microTickVal;
            let miniLots = Math.min(Math.floor(stopLossUsd / (ticks * spec.miniTickVal)), Math.floor(data.maxMicros / microPerMini));

            document.getElementById("calcMicroLots").innerText = `${microLots} Micros`;
            document.getElementById("calcMiniLots").innerText = `${miniLots} Mini`;
            const actualRiskEl = document.getElementById("calcActualRisk");
            if (actualRiskEl) {
                actualRiskEl.innerText = `$${actualLossUsd.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
            }
        }

        function addJournalEntry(event) {
            event.preventDefault();
            const acc = getActiveAccount();
            const date = document.getElementById("inputDate").value;
            const symbol = document.getElementById("inputSymbol").value;
            const contracts = parseInt(document.getElementById("inputContracts").value) || 1;
            const trades = parseInt(document.getElementById("inputTrades").value) || 1;
            const pnl = Number(document.getElementById("inputPnl").value);
            if (!isValidTradeDate(date) || !Number.isFinite(pnl)) { alert("Ngày hoặc PnL không hợp lệ."); return; }

            let entries = getActiveJournal(acc);
            entries.push({ date, symbol, contracts, trades, pnl });
            entries.sort((a,b) => a.date.localeCompare(b.date));
            saveAccounts();

            // Auto update inputDate to current/next active Topstep trade date
            document.getElementById("inputDate").value = getActiveTopstepTradeDate();
            renderTrackerTable();
        }

        function deleteEntry(index) {
            const acc = getActiveAccount();
            let entries = getActiveJournal(acc);
            entries.splice(index, 1);
            saveAccounts();
            renderTrackerTable();
        }

        function clearTrackerData() {
            const acc = getActiveAccount();
            const stageTitle = acc.stage === 'xfa' ? 'Vòng XFA' : 'Vòng Combine';
            if (confirm(`Xóa toàn bộ nhật ký ${stageTitle} của tài khoản [${acc.id}]?`)) {
                if (acc.stage === 'xfa') {
                    acc.xfaJournalEntries = [];
                    acc.payoutHistory = [];
                } else {
                    acc.journalEntries = [];
                }
                saveAccounts();
                renderTrackerTable();
            }
        }

        function openPayoutModal(prefill) {
            const acc = getActiveAccount();
            const status = getPayoutStatus(acc);
            if (!status.eligible) { alert('Chưa đủ điều kiện ghi nhận payout: ' + status.progress); return; }
            document.getElementById('payoutDate').value = getActiveTopstepTradeDate();
            document.getElementById('payoutMaxHint').innerText = `Tối thiểu $125 · Tối đa $${status.maxAllowed}. Ghi nhận payout đã thực hiện trên Topstep.`;
            const input = document.getElementById('payoutAmount');
            input.min = 125;
            input.max = status.maxAllowed;
            input.value = Math.min(typeof prefill === 'number' ? prefill : status.maxAllowed, status.maxAllowed);
            document.getElementById('payoutModal').classList.remove('hidden');
        }
        function closePayoutModal() { document.getElementById('payoutModal').classList.add('hidden'); }
        function submitPayoutRequest(e) {
            e.preventDefault();
            const acc = getActiveAccount();
            const date = document.getElementById('payoutDate').value;
            const amount = Number(document.getElementById('payoutAmount').value);
            const status = getPayoutStatus(acc, date);
            const latestEntry = getActiveJournal(acc).map(e => e.date).sort().at(-1) || '';
            if (!isValidTradeDate(date) || date < latestEntry || date > getActiveTopstepTradeDate() || !status.eligible || !Number.isFinite(amount) || amount < 125 || amount > status.maxAllowed) {
                alert('Payout không hợp lệ. Kiểm tra ngày, điều kiện chu kỳ và hạn mức; hãy ghi nhận payout theo thứ tự thời gian.'); return;
            }
            (acc.payoutHistory ||= []).push({date, amount});
            saveAccounts();
            closePayoutModal();
            calculateRules();
        }

        function deletePayout(idx) {
            const acc = getActiveAccount();
            acc.payoutHistory.splice(idx, 1);
            saveAccounts();
            calculateRules();
        }

        function renderTrackerTable() {
            const tbody = document.getElementById("trackerTableBody");
            const acc = getActiveAccount();
            const data = getAccountRules(acc);
            const journalEntries = getActiveJournal(acc);
            const payoutHistory = acc.payoutHistory || [];
            const capInfo = getPayoutCap(acc, data);

            document.getElementById("trackerAccBadge").innerText = `Gói $${acc.size},000`;
            document.getElementById("trackerStageBadge").innerText = acc.stage === 'xfa' ? 'Vòng XFA' : 'Vòng Combine';

            if (acc.pricingPath === "standard") {
                document.getElementById("trackerFeeBadge").innerText = `Standard Path (${data.stdFee})`;
            } else {
                document.getElementById("trackerFeeBadge").innerText = `No Activation Fee Path (${data.noActFee})`;
            }

            if (acc.stage === "xfa") {
                if (acc.xfaPath === "standard_payout") {
                    document.getElementById("trackerXfaBadge").innerText = `Standard Payout (${capInfo.label}/đợt)`;
                } else {
                    document.getElementById("trackerXfaBadge").innerText = `Consistency Payout (${capInfo.label}/đợt)`;
                }
                document.getElementById("trackerFeeBadge").innerText = (acc.pricingPath === "standard")
                    ? "XFA Funded (Đã trả $149)"
                    : "XFA Funded (Miễn phí kích hoạt)";
            } else {
                document.getElementById("trackerXfaBadge").innerText = `Combine Pass Target: ${data.target}`;
            }
            document.getElementById("trackerMaxContractsBadge").innerText = data.contracts;

            const thCol8 = document.getElementById("thCol8");
            if (thCol8) {
                thCol8.innerText = (acc.stage === 'xfa') ? 'Ngày Thắng (≥+$150 EOD)' : 'Consistency (≤55%)';
            }
            const journalSubEl = document.getElementById("journalSectionSubtitle");
            if (journalSubEl) {
                journalSubEl.innerText = (acc.stage === 'xfa')
                    ? 'Ghi nhận kết quả chốt phiên EOD, tự động tính hạn mức rút tiền và đếm số ngày thắng (≥+$150)'
                    : 'Ghi nhận kết quả chốt phiên, tự động cập nhật Trailing MLL và tính nhất quán 55%';
            }

            tbody.innerHTML = "";

            if (journalEntries.length === 0) {
                tbody.innerHTML = `<tr><td colspan="11" class="p-4 text-center text-slate-500">Chưa có nhật ký EOD cho tài khoản [${escapeHtml(acc.id)}].</td></tr>`;
            }

            let dailyPnlMap = {};
            let totalPnl = 0;
            let currentBal = data.initialBal;
            let highestBal = data.initialBal;

            journalEntries.forEach((entry) => {
                totalPnl += entry.pnl;
                currentBal += entry.pnl;
                if (currentBal > highestBal) highestBal = currentBal;
                dailyPnlMap[entry.date] = (dailyPnlMap[entry.date] || 0) + entry.pnl;
            });

            let totalPayouts = payoutHistory.reduce((sum, p) => sum + p.amount, 0);
            let netAccountBal = currentBal - totalPayouts;

            let bestDayPnl = 0;
            Object.values(dailyPnlMap).forEach(dayPnl => {
                if (dayPnl > bestDayPnl) bestDayPnl = dayPnl;
            });

            let adjustedTarget = Math.max(data.targetVal, Math.ceil(bestDayPnl / data.consistencyRatio));
            let remainingPnlNeeded = Math.max(0, adjustedTarget - totalPnl);

            const ledger = getAccountLedger(acc);
            netAccountBal = ledger.balance;
            let trailingMll = ledger.mll;

            let runningBal = data.initialBal;
            let runningHighestBal = data.initialBal;

            journalEntries.forEach((entry, idx) => {
                runningBal += entry.pnl;
                if (runningBal > runningHighestBal) runningHighestBal = runningBal;

                const day = ledger.rows[entry.date];
                let rowMll = day.mll;
                let rowBuffer = day.buffer;
                let isDllBreach = acc.dllEnabled !== false && dailyPnlMap[entry.date] <= -data.dllVal;

                let dateTotalPnl = dailyPnlMap[entry.date] ?? entry.pnl;
                let dayConsistencyPct = totalPnl > 0 && dateTotalPnl > 0 ? ((dateTotalPnl / totalPnl) * 100).toFixed(1) : 0;

                let col8Cell = "";
                if (acc.stage === "xfa") {
                    if (acc.xfaPath === "standard_payout") {
                        if (dateTotalPnl >= 150) {
                            col8Cell = `<span class="b-badge b-badge-green" style="font-size: 11px; font-weight: 700;">Đạt (+$150+)</span>`;
                        } else if (dateTotalPnl > 0) {
                            col8Cell = `<span class="b-badge b-badge-dim" style="font-size: 11px; font-weight: 600;">Lãi (<$150)</span>`;
                        } else {
                            col8Cell = `<span class="b-badge b-badge-red" style="font-size: 11px; font-weight: 600;">Ngày Lỗ</span>`;
                        }
                    } else {
                        col8Cell = `<span class="b-badge ${parseFloat(dayConsistencyPct) > 40 ? 'b-badge-gold' : 'b-badge-dim'}" style="font-size: 11px; font-weight: 600;">${dayConsistencyPct}% (≤40%)</span>`;
                    }
                } else {
                    col8Cell = `<span class="b-badge ${parseFloat(dayConsistencyPct) > 55 ? 'b-badge-gold' : 'b-badge-dim'}" style="font-size: 11px; font-weight: 600;">${dayConsistencyPct}%</span>`;
                }

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td style="padding: 12px 16px; font-weight: 600; color: var(--text-primary);">${entry.date}</td>
                    <td style="padding: 12px 16px; text-align: center;">
                        <span class="b-badge b-badge-blue" style="font-weight: 700; font-size: 11px;">${entry.symbol || 'MGC'}</span>
                    </td>
                    <td style="padding: 12px 16px; text-align: right; font-weight: 800; font-size: 13.5px;" class="tabular-nums ${entry.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
                        ${entry.pnl >= 0 ? '+' : ''}${entry.pnl.toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </td>
                    <td style="padding: 12px 16px; text-align: right; font-weight: 700; color: var(--text-primary);" class="tabular-nums">
                        ${day.balance.toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </td>
                    <td style="padding: 12px 16px; text-align: right; font-weight: 700; color: var(--color-red);" class="tabular-nums">
                        ${rowMll.toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </td>
                    <td style="padding: 12px 16px; text-align: right; font-weight: 700; color: var(--color-gold);" class="tabular-nums">
                        ${rowBuffer.toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </td>
                    <td style="padding: 12px 16px; text-align: center;">
                        <span class="b-badge ${isDllBreach ? 'b-badge-red' : 'b-badge-green'}" style="font-size: 10.5px; font-weight: 700;">
                            ${acc.dllEnabled === false ? 'Không bật DLL' : isDllBreach ? 'Dừng phiên DLL' : 'Trong DLL'}
                        </span>
                    </td>
                    <td style="padding: 12px 16px; text-align: center;">
                        ${col8Cell}
                    </td>
                    <td style="padding: 12px 16px; text-align: center;">
                        <button type="button" onclick="deleteEntry(${idx})" class="b-btn-danger" style="padding: 4px 10px; font-size: 11.5px; border-radius: 8px;" title="Xóa phiên ${entry.date}">
                            ✕ Xóa
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            const payoutTbody = document.getElementById("payoutTableBody");
            if (payoutTbody) {
                payoutTbody.innerHTML = "";
                if (payoutHistory.length === 0) {
                    payoutTbody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-slate-500">Chưa có yêu cầu rút Payout nào.</td></tr>`;
                } else {
                    let runningPayoutBal = data.initialBal;
                    payoutHistory.forEach((p, idx) => {
                        runningPayoutBal = data.initialBal + journalEntries.filter(e => e.date <= p.date).reduce((sum,e)=>sum+e.pnl,0) - payoutHistory.slice(0,idx+1).reduce((sum,e)=>sum+e.amount,0);
                        let netPayoutReceived = p.amount * 0.9;
                        const tr = document.createElement("tr");
                        tr.innerHTML = `
                            <td style="padding: 12px 16px; font-weight: 500; color: var(--text-primary);">${p.date}</td>
                            <td style="padding: 12px 16px; text-align: right; font-weight: 700; color: var(--color-purple);" class="tabular-nums">${p.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                            <td style="padding: 12px 16px; text-align: right; font-weight: 800; color: var(--color-green);" class="tabular-nums">+${netPayoutReceived.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                            <td style="padding: 12px 16px; text-align: right; font-weight: 700; color: var(--text-primary);" class="tabular-nums">${runningPayoutBal.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                            <td style="padding: 12px 16px; text-align: right;">
                                <button type="button" onclick="deletePayout(${idx})" class="b-btn-danger" style="padding: 4px 10px; font-size: 11.5px; border-radius: 8px;" title="Xóa đợt rút này">
                                    ✕ Xóa
                                </button>
                            </td>
                        `;
                        payoutTbody.appendChild(tr);
                    });
                }
            }

            document.getElementById("trackerTotalPnl").innerText = `${totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
            document.getElementById("trackerTotalPnl").className = `text-base font-black ${totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;

            // Common MLL Buffer & Safe Loss Budget calculation
            let mllBuffer = Math.max(0, netAccountBal - trailingMll);
            let rawDllVal = data.dllVal;
            let safeDailyLossBudgetVal = Math.min(rawDllVal, Math.floor(mllBuffer * 0.5));
            if (safeDailyLossBudgetVal < 100) safeDailyLossBudgetVal = Math.min(rawDllVal, mllBuffer);

            let activeTradeDate = getActiveTopstepTradeDate();
            let currentDateInput = document.getElementById("inputDate").value || activeTradeDate;
            let evalDate = currentDateInput;
            let evalDateDisplay = formatDateVN(evalDate);

            let datePnlSoFar = dailyPnlMap[evalDate] || 0;
            let remainingLossBudgetToday = safeDailyLossBudgetVal;
            if (datePnlSoFar < 0) {
                remainingLossBudgetToday = Math.max(0, safeDailyLossBudgetVal - Math.abs(datePnlSoFar));
            }

            const maxLossBudgetEl = document.getElementById("todayMaxLossBudget");
            const maxLossSubtextEl = document.getElementById("todayLossBudgetSubtext");
            const mllBufferValEl = document.getElementById("todayMllBufferVal");
            const mllThresholdTextEl = document.getElementById("bannerMllThresholdText");

            if (acc.stage === "xfa") {
                let availableProfit = Math.max(0, netAccountBal - data.initialBal);
                let maxAllowedWithdrawal = Math.max(0, Math.min(capInfo.val, Math.floor(availableProfit * 50) / 100));
                let netTraderReceive = maxAllowedWithdrawal * 0.9;
                let balAfterWithdraw = netAccountBal - maxAllowedWithdrawal;
                let remainingBufferAfterWithdrawal = Math.max(0, balAfterWithdraw);
                let winningDaysCount = getPayoutStatus(acc).winningDays;
                let totalTradingDaysCount = getPayoutStatus(acc).tradingDays;
                let bestDayPct = acc.stage === 'xfa' ? getPayoutStatus(acc).bestPct : (totalPnl > 0 ? bestDayPnl / totalPnl : 0);

                // Card 2: Có Thể Rút Đợt Này
                document.getElementById("trackerKpi2Label").innerText = "Có Thể Rút Đợt Này";
                document.getElementById("trackerAdjustedTarget").innerText = "$" + maxAllowedWithdrawal.toLocaleString('en-US', {minimumFractionDigits: 2});
                document.getElementById("trackerAdjustedTarget").className = "tabular-nums text-base font-black text-purple-400";
                const kpi2SubEl = document.getElementById("trackerKpi2SubText");
                if (kpi2SubEl) {
                    kpi2SubEl.style.color = "var(--color-purple)";
                    kpi2SubEl.innerHTML = `<span>Tối đa 50% lãi · Trần ${capInfo.label} (90%: +$${netTraderReceive.toLocaleString('en-US', {minimumFractionDigits: 2})})</span>`;
                }

                // Card 3: Ngưỡng MLL Khóa Vốn
                document.getElementById("trackerKpi3Label").innerText = "Ngưỡng MLL Khóa Vốn";
                document.getElementById("trackerCurrentMll").innerText = "$" + trailingMll.toLocaleString('en-US', {minimumFractionDigits: 2});
                const kpi3SubEl = document.getElementById("trackerKpi3SubText");
                if (kpi3SubEl) {
                    kpi3SubEl.innerHTML = `<span>Đệm MLL khả dụng: +${mllBuffer.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>`;
                }

                // Card 4: Tiến Trình Rút Payout
                document.getElementById("trackerKpi4Label").innerText = "Tiến Trình Rút Payout";
                const badge = document.getElementById("trackerConsistencyBadge");
                if (acc.xfaPath === "standard_payout") {
                    if (getPayoutStatus(acc).eligible) {
                        badge.innerText = `ĐỦ ĐIỀU KIỆN RÚT PAYOUT! (${winningDaysCount}/5 ngày)`;
                        badge.className = "b-badge b-badge-green";
                    } else if (winningDaysCount >= 5 && maxAllowedWithdrawal < 125) {
                        badge.innerText = `ĐỦ 5 NGÀY - CẦN THÊM LÃI (≥$125)`;
                        badge.className = "b-badge b-badge-gold";
                    } else {
                        badge.innerText = `TIẾN TRÌNH: ${winningDaysCount}/5 NGÀY THẮNG (≥+$150)`;
                        badge.className = "b-badge b-badge-purple";
                    }
                    const kpi4SubEl = document.getElementById("trackerKpi4SubText");
                    if (kpi4SubEl) kpi4SubEl.innerText = "Standard Path: Cần ≥5 ngày EOD ≥+$150 · Không áp dụng 55%";
                } else {
                    if (getPayoutStatus(acc).eligible) {
                        badge.innerText = `ĐỦ ĐIỀU KIỆN RÚT! (3 ngày & ≤40%)`;
                        badge.className = "b-badge b-badge-green";
                    } else {
                        badge.innerText = `CHỜ ĐIỀU KIỆN (${totalTradingDaysCount}/3 ngày, ${(bestDayPct*100).toFixed(1)}%)`;
                        badge.className = "b-badge b-badge-gold";
                    }
                    const kpi4SubEl = document.getElementById("trackerKpi4SubText");
                    if (kpi4SubEl) kpi4SubEl.innerText = "Consistency Path: Cần ≥3 ngày trade + Consistency ≤40%";
                }

                // Smart Activity Banner for XFA: SESSION PLAN & DAILY RISK MANAGEMENT (TODAY)
                document.getElementById("smartBannerTitle").innerText = `KẾ HOẠCH PHIÊN & GIỚI HẠN RỦI RO HÔM NAY (${evalDateDisplay}):`;
                document.getElementById("smartBannerTitle").className = "text-xs font-black text-blue-400 uppercase tracking-wider";

                const todayTargetEl = document.getElementById("todayTargetPnl");
                const todayDescEl = document.getElementById("targetDynamicDesc");
                const statusTagEl = document.getElementById("suggestionStatusTag");
                const col1Label = document.getElementById("smartBannerValLabel");
                const todayTargetSubtext = document.getElementById("todayTargetSubtext");

                if (datePnlSoFar >= 150) {
                    statusTagEl.innerText = "Đã Đạt Ngày Thắng Hôm Nay";
                    statusTagEl.className = "b-badge b-badge-green";
                    todayDescEl.innerHTML = `<strong style="color: var(--color-green);">PHIÊN HÔM NAY ĐÃ ĐẠT TIÊU CHUẨN:</strong> Chốt lãi EOD <strong>+${datePnlSoFar.toLocaleString('en-US', {minimumFractionDigits: 2})}</strong> (≥ +$150) — đã ghi nhận thêm 1 ngày thắng (tiến trình: <strong>${winningDaysCount}/5 ngày</strong>). Nên DỪNG giao dịch để bảo toàn kết quả và bảo vệ đệm an toàn!`;
                    if (col1Label) col1Label.innerText = "LÃI ĐÃ ĐẠT PHIÊN HÔM NAY";
                    todayTargetEl.innerText = "+$" + datePnlSoFar.toLocaleString('en-US', {minimumFractionDigits: 2});
                    todayTargetEl.className = "text-xl font-black text-emerald-400";
                    if (todayTargetSubtext) {
                        todayTargetSubtext.innerText = "Đạt chuẩn ngày thắng (≥ +$150 EOD)";
                        todayTargetSubtext.style.color = "var(--color-green)";
                    }
                } else if (datePnlSoFar > 0) {
                    let needed = 150 - datePnlSoFar;
                    statusTagEl.innerText = "Đang Lãi (Cần Thêm Đến $150)";
                    statusTagEl.className = "b-badge b-badge-purple";
                    todayDescEl.innerHTML = `Phiên hôm nay (${evalDateDisplay}) đã có <strong>+${datePnlSoFar.toLocaleString('en-US', {minimumFractionDigits: 2})}</strong>. Cần chốt thêm tối thiểu <strong>+${needed.toLocaleString('en-US', {minimumFractionDigits: 2})}</strong> nữa để đạt mốc +$150 EOD và tính là 1 ngày thắng hợp lệ (hiện đạt ${winningDaysCount}/5 ngày).`;
                    if (col1Label) col1Label.innerText = "CẦN THÊM ĐỂ ĐẠT NGÀY THẮNG";
                    todayTargetEl.innerText = "+$" + needed.toLocaleString('en-US', {minimumFractionDigits: 2});
                    todayTargetEl.className = "text-xl font-black text-purple-400";
                    if (todayTargetSubtext) {
                        todayTargetSubtext.innerText = "Để đạt mốc tối thiểu +$150 EOD";
                        todayTargetSubtext.style.color = "var(--color-purple)";
                    }
                } else if (datePnlSoFar < 0) {
                    statusTagEl.innerText = "Đang Âm Phiên (Bảo Vệ DLL)";
                    statusTagEl.className = "b-badge b-badge-red";
                    todayDescEl.innerHTML = `Phiên hôm nay (${evalDateDisplay}) đang ghi nhận <strong>-${Math.abs(datePnlSoFar).toLocaleString('en-US', {minimumFractionDigits: 2})}</strong>. Ngân sách lỗ tối đa còn lại là <strong>-${remainingLossBudgetToday.toLocaleString('en-US', {minimumFractionDigits: 2})}</strong>. Tuyệt đối không để chạm Daily Loss Limit (-${rawDllVal.toLocaleString()})!`;
                    if (col1Label) col1Label.innerText = "MỤC TIÊU PHIÊN (NGÀY THẮNG)";
                    todayTargetEl.innerText = "+$150.00";
                    todayTargetEl.className = "text-xl font-black text-emerald-400";
                    if (todayTargetSubtext) {
                        todayTargetSubtext.innerText = "Tối thiểu +$150 EOD để tính ngày thắng";
                        todayTargetSubtext.style.color = "var(--color-green)";
                    }
                } else {
                    statusTagEl.innerText = "Mục Tiêu Phiên (+ $150)";
                    statusTagEl.className = "b-badge b-badge-blue";
                    todayDescEl.innerHTML = `Phiên mới (${evalDateDisplay}): Đặt mục tiêu chốt lãi tối thiểu <strong>+$150.00 EOD</strong> để ghi nhận 1 ngày thắng hợp lệ (tiến trình hiện tại: <strong>${winningDaysCount}/5 ngày</strong>). Ngân sách lỗ tối đa cho phép hôm nay là <strong>-${remainingLossBudgetToday.toLocaleString('en-US', {minimumFractionDigits: 2})}</strong> để bảo vệ đệm an toàn MLL.`;
                    if (col1Label) col1Label.innerText = "MỤC TIÊU PHIÊN (NGÀY THẮNG)";
                    todayTargetEl.innerText = "+$150.00";
                    todayTargetEl.className = "text-xl font-black text-emerald-400";
                    if (todayTargetSubtext) {
                        todayTargetSubtext.innerText = "Tối thiểu +$150 EOD để tính ngày thắng";
                        todayTargetSubtext.style.color = "var(--color-green)";
                    }
                }

                // Smart Banner Col 2: Daily Loss Budget
                const col2Label = document.getElementById("todayMaxLossBudgetLabel");
                if (col2Label) col2Label.innerText = "HẠN MỨC LỖ TỐI ĐA HÔM NAY";
                if (maxLossBudgetEl) {
                    maxLossBudgetEl.innerText = "-$" + remainingLossBudgetToday.toLocaleString('en-US', {minimumFractionDigits: 2});
                    maxLossBudgetEl.className = "text-xl font-black text-rose-500";
                }
                if (maxLossSubtextEl) {
                    if (mllBuffer < rawDllVal * 1.5) {
                        maxLossSubtextEl.innerText = `Đệm MLL mỏng (+${mllBuffer.toLocaleString('en-US', {minimumFractionDigits: 2})}) -> Khuyên cắt lỗ sớm!`;
                    } else {
                        maxLossSubtextEl.innerText = `Bảo vệ DLL (-${rawDllVal.toLocaleString()}) & Khóa tại vốn ${(data.initialBal/1000).toFixed(0)}K`;
                    }
                    maxLossSubtextEl.style.color = "var(--color-red)";
                }
                const col2Box = document.getElementById("smartBannerCol2Box");
                if (col2Box) col2Box.style.borderLeftColor = "var(--color-red)";

                // Smart Banner Col 3: Current MLL Buffer
                const col3Label = document.getElementById("todayMllBufferLabel");
                if (col3Label) col3Label.innerText = "ĐỆM AN TOÀN MLL HIỆN TẠI";
                if (mllBufferValEl) {
                    mllBufferValEl.innerText = "+$" + mllBuffer.toLocaleString('en-US', {minimumFractionDigits: 2});
                    mllBufferValEl.className = "text-xl font-black text-amber-400";
                }
                const col3Sub = document.getElementById("todayMllLimitSubtext");
                if (col3Sub) {
                    col3Sub.innerHTML = `Khóa thanh lý: <strong id="bannerMllThresholdText" style="color: var(--color-red);">${trailingMll.toLocaleString()}</strong>`;
                }

                // Dedicated Payout Hub Widgets Update
                const xfaHubStatusBadge = document.getElementById("xfaHubStatusBadge");
                if (xfaHubStatusBadge) {
                    xfaHubStatusBadge.innerText = (acc.xfaPath === "standard_payout")
                        ? "Standard Path · 90/10 Split (Không Áp Dụng 55%)"
                        : "Consistency Path · 90/10 Split";
                }

                const xfaHubCapBadge = document.getElementById("xfaHubCapBadge");
                if (xfaHubCapBadge) xfaHubCapBadge.innerText = `Trần ${capInfo.label}`;

                const xfaHubMaxWithdraw = document.getElementById("xfaHubMaxWithdraw");
                if (xfaHubMaxWithdraw) {
                    xfaHubMaxWithdraw.innerText = "$" + maxAllowedWithdrawal.toLocaleString('en-US', {minimumFractionDigits: 2});
                    xfaHubMaxWithdraw.style.color = maxAllowedWithdrawal > 0 ? "var(--color-purple)" : "var(--text-primary)";
                }

                const xfaHubMaxWithdrawNote = document.getElementById("xfaHubMaxWithdrawNote");
                if (xfaHubMaxWithdrawNote) {
                    xfaHubMaxWithdrawNote.innerText = `Tối đa 50% lãi ròng (Lũy kế: +${availableProfit.toLocaleString('en-US', {minimumFractionDigits: 2})})`;
                }

                const xfaHubNetPayout = document.getElementById("xfaHubNetPayout");
                if (xfaHubNetPayout) {
                    xfaHubNetPayout.innerText = "+$" + netTraderReceive.toLocaleString('en-US', {minimumFractionDigits: 2});
                }

                const payoutStatus = getPayoutStatus(acc);
                document.getElementById('xfaHubDaysBadge').innerText = payoutStatus.progress;
                document.getElementById('xfaHubDaysCount').innerText = payoutStatus.progress;
                document.getElementById('xfaHubMllThresholdBadge').innerText = 'Sau payout: MLL $0';
                document.getElementById('xfaHubRemainingBuffer').innerText = '$' + remainingBufferAfterWithdrawal.toLocaleString();
                document.getElementById('xfaHubBufferWarning').innerText = 'Đệm còn lại sau khi ghi nhận payout; MLL khóa tại $0.';
                document.getElementById('xfaHubCalloutDesc').innerText =
                    (payoutStatus.eligible ? 'Đủ điều kiện ghi nhận payout. ' : 'Chưa đủ điều kiện payout. ') +
                    payoutStatus.progress + ' · Ngày và Consistency được tính lại sau mỗi payout. Đây là nhật ký cá nhân; yêu cầu rút thực hiện trên Topstep.';
                const withdrawBtn = document.getElementById('btnQuickWithdraw');
                withdrawBtn.innerText = 'Ghi nhận payout';
                withdrawBtn.disabled = !payoutStatus.eligible;
                withdrawBtn.onclick = () => openPayoutModal();
            } else {
                // Combine Stage Mode
                document.getElementById("trackerKpi2Label").innerText = "Target Điều Chỉnh";
                document.getElementById("trackerAdjustedTarget").innerText = `${adjustedTarget.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
                document.getElementById("trackerAdjustedTarget").className = "tabular-nums text-base font-black text-emerald-400";
                const kpi2SubEl = document.getElementById("trackerKpi2SubText");
                if (kpi2SubEl) {
                    kpi2SubEl.style.color = "var(--color-primary)";
                    kpi2SubEl.innerHTML = `<span>Consistency Rule: Lãi ngày ≤ 55%</span>`;
                }

                document.getElementById("trackerKpi3Label").innerText = "Ngưỡng MLL EOD";
                document.getElementById("trackerCurrentMll").innerText = `${trailingMll.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
                const kpi3SubEl = document.getElementById("trackerKpi3SubText");
                if (kpi3SubEl) {
                    kpi3SubEl.innerHTML = `<span>Trailing EOD: Khóa tại $${data.initialBal.toLocaleString()}</span>`;
                }

                document.getElementById("trackerKpi4Label").innerText = "Trạng Thái Đỗ Combine";
                const kpi4SubEl = document.getElementById("trackerKpi4SubText");
                if (kpi4SubEl) kpi4SubEl.innerText = "Giám sát tự động sau mỗi phiên";

                document.getElementById("smartBannerTitle").innerText = `MỤC TIÊU PNL & GIỚI HẠN RỦI RO PHIÊN (${evalDateDisplay}):`;
                document.getElementById("smartBannerTitle").className = "text-xs font-black text-emerald-400 uppercase tracking-wider";

                const col1Label = document.getElementById("smartBannerValLabel");
                if (col1Label) col1Label.innerText = "LÃI TỐI ĐA NÊN CHỐT HÔM NAY";
                const todayTargetSubtext = document.getElementById("todayTargetSubtext");
                if (todayTargetSubtext) {
                    todayTargetSubtext.innerText = "Đảm bảo quy tắc Consistency ≤55%";
                    todayTargetSubtext.style.color = "var(--color-green)";
                }

                const col2Label = document.getElementById("todayMaxLossBudgetLabel");
                if (col2Label) col2Label.innerText = "HẠN MỨC LỖ TỐI ĐA HÔM NAY";
                const col2Box = document.getElementById("smartBannerCol2Box");
                if (col2Box) col2Box.style.borderLeftColor = "var(--color-red)";

                if (maxLossBudgetEl) {
                    maxLossBudgetEl.innerText = `-$${remainingLossBudgetToday.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
                    maxLossBudgetEl.className = "tabular-nums text-2xl font-black text-rose-500";
                    if (mllBuffer < rawDllVal * 1.5) {
                        maxLossSubtextEl.innerText = `Đệm MLL mỏng (${mllBuffer.toLocaleString('en-US', {minimumFractionDigits: 2})}) -> Khuyên cắt lỗ sớm!`;
                    } else {
                        maxLossSubtextEl.innerText = `Bảo vệ DLL (-${rawDllVal.toLocaleString()}) & Trailing MLL`;
                    }
                    maxLossSubtextEl.style.color = "var(--color-red)";
                }

                const col3Label = document.getElementById("todayMllBufferLabel");
                if (col3Label) col3Label.innerText = "ĐỆM AN TOÀN MLL HIỆN TẠI";
                if (mllBufferValEl) {
                    mllBufferValEl.innerText = `${mllBuffer.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
                    mllBufferValEl.className = "tabular-nums text-2xl font-black text-amber-400";
                }
                const col3Sub = document.getElementById("todayMllLimitSubtext");
                if (col3Sub) {
                    col3Sub.innerHTML = `Khóa thanh lý: <strong id="bannerMllThresholdText" style="color: var(--color-red);">${trailingMll.toLocaleString('en-US', {minimumFractionDigits: 2})}</strong>`;
                }

                let uniqueDates = Object.keys(dailyPnlMap);
                let uniqueDaysCount = uniqueDates.length;
                let maxSafeSingleDay = Math.floor(adjustedTarget * 0.535);

                const todayTargetEl = document.getElementById("todayTargetPnl");
                const todayDescEl = document.getElementById("targetDynamicDesc");
                const statusTagEl = document.getElementById("suggestionStatusTag");

                if (journalEntries.length === 0) {
                    let suggestedDay1 = Math.floor(data.targetVal * 0.53);
                    todayTargetEl.innerText = `+${suggestedDay1.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
                    todayTargetEl.className = "text-xl font-black text-emerald-400";
                    todayDescEl.innerText = `Gợi ý PnL Ngày 1 (< 55% Target ${data.target}) giúp hoàn thành Combine trong 2 ngày cân bằng.`;
                    statusTagEl.innerText = "Mức Lãi Ngày 1 Tối Ưu";
                    statusTagEl.className = "px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold";
                } else if (totalPnl >= adjustedTarget && uniqueDaysCount >= 2 && (bestDayPnl / totalPnl) <= data.consistencyRatio) {
                    todayTargetEl.innerText = `ĐÃ ĐẠT ĐỦ ĐIỀU KIỆN`;
                    todayTargetEl.className = "text-lg font-black text-emerald-400";
                    todayDescEl.innerText = `Đã tích lũy đủ ${totalPnl.toLocaleString('en-US', {minimumFractionDigits: 2})} và đỗ Combine an toàn sau ${uniqueDaysCount} ngày giao dịch!`;
                    statusTagEl.innerText = "Hoàn Thành Đỗ Combine";
                    statusTagEl.className = "px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold";
                } else if (totalPnl >= adjustedTarget && uniqueDaysCount < 2) {
                    todayTargetEl.innerText = `+$1.00 (Trade Nhỏ)`;
                    todayTargetEl.className = "text-xl font-black text-cyan-400";
                    todayDescEl.innerText = `Đã đủ PnL Target! Cần thêm 1 phiên giao dịch vị thế nhỏ (+1.00$) để tính đủ 2 ngày tối thiểu.`;
                    statusTagEl.innerText = "Cần Thêm 1 Ngày Trade";
                    statusTagEl.className = "px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold";
                } else {
                    let datePnlSoFar = dailyPnlMap[evalDate] || 0;
                    let priorPnl = totalPnl - datePnlSoFar;

                    if (datePnlSoFar > 0) {
                        let maxSafeDayTotal;
                        if (priorPnl > 0) {
                            maxSafeDayTotal = Math.max(datePnlSoFar, Math.min(maxSafeSingleDay, Math.floor(priorPnl * (data.consistencyRatio / (1-data.consistencyRatio)))));
                        } else {
                            maxSafeDayTotal = Math.max(datePnlSoFar, maxSafeSingleDay);
                        }
                        let remainingSafeRoomToday = Math.max(0, maxSafeDayTotal - datePnlSoFar);
                        let totalProjectedIfRoomUsed = totalPnl + remainingSafeRoomToday;
                        let nextSessionNeeded = Math.max(0, adjustedTarget - totalProjectedIfRoomUsed);

                        if (remainingSafeRoomToday <= 0) {
                            todayTargetEl.innerText = `+$0.00 (Đã Đạt Trần)`;
                            todayTargetEl.className = "text-lg font-black text-rose-400";
                            todayDescEl.innerText = `Phiên (${evalDateDisplay}) đã có +${datePnlSoFar.toLocaleString('en-US', {minimumFractionDigits: 2})}. Đã đạt trần an toàn hôm nay, nên DỪNG giao dịch để tránh Target Scaling!`;
                            statusTagEl.innerText = "Đã Đạt Trần An Toàn";
                            statusTagEl.className = "px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold";
                        } else {
                            todayTargetEl.innerText = `+${remainingSafeRoomToday.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
                            todayTargetEl.className = "text-xl font-black text-amber-400";
                            todayDescEl.innerText = `Phiên (${evalDateDisplay}) đã có +${datePnlSoFar.toLocaleString('en-US', {minimumFractionDigits: 2})}. Dư địa ăn thêm tối đa hôm nay: +${remainingSafeRoomToday.toLocaleString('en-US', {minimumFractionDigits: 2})} (tổng ngày ≤ +${maxSafeDayTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}). Phiên tới chốt +${nextSessionNeeded.toLocaleString('en-US', {minimumFractionDigits: 2})} là đỗ Combine!`;
                            statusTagEl.innerText = "Dư Địa Ăn Thêm Hôm Nay";
                            statusTagEl.className = "px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold";
                        }
                    } else {
                        let potentialTotal = totalPnl + remainingPnlNeeded;
                        let potentialBestDay = Math.max(bestDayPnl, remainingPnlNeeded);
                        let isSafeToFinishToday = (potentialBestDay / potentialTotal) <= data.consistencyRatio && (potentialBestDay / data.consistencyRatio <= adjustedTarget);

                        if (isSafeToFinishToday && uniqueDaysCount >= 1) {
                            todayTargetEl.innerText = `+${remainingPnlNeeded.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
                            todayTargetEl.className = "text-xl font-black text-emerald-400";
                            todayDescEl.innerText = `Phiên mới (${evalDateDisplay}): Chốt +${remainingPnlNeeded.toLocaleString('en-US', {minimumFractionDigits: 2})} là hoàn thành 100% Target đỗ Combine.`;
                            statusTagEl.innerText = "PnL Chốt Đỗ Combine";
                            statusTagEl.className = "px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold";
                        } else {
                            let hasLossDay = journalEntries.some(e => e.pnl < 0);
                            let safeTargetToday = Math.min(remainingPnlNeeded, maxSafeSingleDay);
                            let halfRemaining = Math.ceil(remainingPnlNeeded / 2);

                            if (remainingPnlNeeded > maxSafeSingleDay) {
                                safeTargetToday = halfRemaining;
                            }

                            todayTargetEl.innerText = `+${safeTargetToday.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
                            todayTargetEl.className = "text-xl font-black text-amber-400";

                            if (hasLossDay && remainingPnlNeeded > maxSafeSingleDay) {
                                let nextPart = (remainingPnlNeeded - safeTargetToday).toFixed(2);
                                todayDescEl.innerText = `Phiên mới (${evalDateDisplay}): Bù đắp ngày thua (${totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)} tích lũy, còn thiếu +${remainingPnlNeeded.toFixed(2)}). Phân bổ 2 phiên: hôm nay chốt +${safeTargetToday.toLocaleString('en-US', {minimumFractionDigits: 2})} & phiên sau +${parseFloat(nextPart).toLocaleString('en-US', {minimumFractionDigits: 2})} đỗ Combine an toàn!`;
                                statusTagEl.innerText = "Gợi Ý Phân Bổ 2 Phiên Bù Thua";
                                statusTagEl.className = "px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold";
                            } else {
                                todayDescEl.innerText = `Phiên mới (${evalDateDisplay}): Nên chốt tối đa +${safeTargetToday.toLocaleString('en-US', {minimumFractionDigits: 2})} bảo vệ Target ${adjustedTarget.toLocaleString()}.`;
                                statusTagEl.innerText = "Trần Lãi Phiên Mới";
                                statusTagEl.className = "px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold";
                            }
                        }
                    }
                }

                const badge = document.getElementById("trackerConsistencyBadge");
                let bestDayPct = acc.stage === 'xfa' ? getPayoutStatus(acc).bestPct : (totalPnl > 0 ? bestDayPnl / totalPnl : 0);

                if (ledger.breached) {
                    badge.innerText = "ĐÃ CHẠM MLL · KHÔNG ĐỦ ĐIỀU KIỆN";
                    badge.className = "b-badge b-badge-red";
                } else if (journalEntries.length === 0) {
                    badge.innerText = "CHỜ DỮ LIỆU";
                    badge.className = "inline-block mt-0.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[11px]";
                } else if (totalPnl >= adjustedTarget && bestDayPct <= data.consistencyRatio && uniqueDaysCount >= 2) {
                    badge.innerText = `ĐỦ ĐIỀU KIỆN CẤP VỐN! (${adjustedTarget.toLocaleString()})`;
                    badge.className = "inline-block mt-0.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[11px]";
                } else if (totalPnl >= adjustedTarget && bestDayPct <= data.consistencyRatio && uniqueDaysCount < 2) {
                    badge.innerText = `ĐẠT TARGET - CẦN NGÀY (${uniqueDaysCount}/2 ngày)`;
                    badge.className = "inline-block mt-0.5 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[11px]";
                } else if (bestDayPnl > data.targetVal * data.consistencyRatio) {
                    badge.innerText = `TARGET SCALE ${adjustedTarget.toLocaleString()} (Còn +${remainingPnlNeeded.toLocaleString()})`;
                    badge.className = "b-badge b-badge-purple";
                } else if (bestDayPct > data.consistencyRatio) {
                    badge.innerText = `CẦN +${remainingPnlNeeded.toLocaleString()} (Ngày cao ${(bestDayPct * 100).toFixed(1)}%)`;
                    badge.className = "inline-block mt-0.5 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[11px]";
                } else if (uniqueDaysCount < 2) {
                    badge.innerText = `ĐANG THI COMBINE (${uniqueDaysCount}/2 ngày tối thiểu)`;
                    badge.className = "inline-block mt-0.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[11px]";
                } else {
                    badge.innerText = `ĐANG THI COMBINE (Consistency ${(bestDayPct * 100).toFixed(1)}% ≤ 55%)`;
                    badge.className = "inline-block mt-0.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[11px]";
                }
            }

            updateFinpointComponents(acc, data, journalEntries, dailyPnlMap, totalPnl, netAccountBal, trailingMll, mllBuffer, capInfo);
        }


        /* ── FINPOINT DYNAMIC INTERACTIVE HELPERS ── */
        function updateFinpointComponents(acc, data, journalEntries, dailyPnlMap, totalPnl, netAccountBal, trailingMll, mllBuffer, capInfo) {
            // 1. Update Virtual Card Balance & Details
            const vcBalEl = document.getElementById("finpointCardBalance");
            if (vcBalEl) {
                vcBalEl.innerText = "$" + netAccountBal.toLocaleString('en-US', {minimumFractionDigits: 2});
            }
            const vcNumEl = document.getElementById("finpointCardNumber");
            if (vcNumEl) {
                vcNumEl.innerText = acc.id + " · 4829 ···· 9012";
            }

            const vcTargetLabel = document.getElementById("finpointCardTargetLabel");
            const vcNextPayAmount = document.getElementById("finpointNextPayAmount");
            const vcActionBtn = document.getElementById("finpointCardBtnAction1");
            const vcActionText = document.getElementById("finpointCardBtnAction1Text");
            const vcActionIcon = document.getElementById("finpointCardBtnAction1Icon");

            if (acc.stage === 'xfa') {
                let availableProfit = Math.max(0, netAccountBal - data.initialBal);
                let maxAllowedWithdrawal = Math.max(0, Math.min(capInfo.val, Math.floor(availableProfit * 50) / 100));
                if (vcTargetLabel) vcTargetLabel.innerText = "Có Thể Rút Đợt Này";
                if (vcNextPayAmount) vcNextPayAmount.innerText = "$" + maxAllowedWithdrawal.toLocaleString('en-US', {minimumFractionDigits: 2});
                if (vcActionBtn) {
                    vcActionBtn.onclick = () => openPayoutModal();
                    vcActionBtn.title = "Ghi nhận payout đã thực hiện";
                }
                if (vcActionText) vcActionText.innerText = "Rút Tiền";
                if (vcActionIcon) vcActionIcon.innerText = "↙";
            } else {
                if (vcTargetLabel) vcTargetLabel.innerText = "Mục Tiêu Profit Target";
                if (vcNextPayAmount) vcNextPayAmount.innerText = data.target;
                if (vcActionBtn) {
                    vcActionBtn.onclick = () => switchAppView('checklist');
                    vcActionBtn.title = "Kiểm tra Checklist 4 Setup trước khi vào lệnh";
                }
                if (vcActionText) vcActionText.innerText = "Checklist";
                if (vcActionIcon) vcActionIcon.innerText = "🎯";
            }

            // 2. Update Saving Goals Progress Bars (Separated Strictly by Stage)
            const stageBadge = document.getElementById("savingGoalsStageBadge");
            const goal1Title = document.getElementById("finpointGoal1Title");
            const goal1Bar = document.getElementById("finpointGoal1Bar");
            const goal1Text = document.getElementById("finpointGoal1Text");

            const goal2Title = document.getElementById("finpointGoal2Title");
            const goal2Bar = document.getElementById("finpointGoal2Bar");
            const goal2Text = document.getElementById("finpointGoal2Text");

            const goal3Title = document.getElementById("finpointGoal3Title");
            const goal3Bar = document.getElementById("finpointGoal3Bar");
            const goal3Text = document.getElementById("finpointGoal3Text");

            if (acc.stage === "xfa") {
                // ── XFA STAGE GOALS ──
                if (stageBadge) {
                    stageBadge.innerText = "Vòng Cấp Vốn XFA® · Điều Kiện Payout";
                    stageBadge.className = "b-badge b-badge-purple";
                }

                let winningDaysCount = getPayoutStatus(acc).winningDays;
                let availableProfit = Math.max(0, netAccountBal - data.initialBal);
                let maxAllowedWithdrawal = Math.max(0, Math.min(capInfo.val, Math.floor(availableProfit * 50) / 100));

                // Goal 1: Payout Days Requirement
                if (acc.xfaPath === "standard_payout") {
                    if (goal1Title) goal1Title.innerText = "5 Ngày Thắng (≥+$150 EOD)";
                    if (goal1Bar && goal1Text) {
                        let pct = Math.min(100, Math.round((winningDaysCount / 5) * 100));
                        goal1Bar.style.width = pct + "%";
                        goal1Bar.style.background = winningDaysCount >= 5 ? "var(--color-green)" : "var(--color-purple)";
                        goal1Text.innerText = winningDaysCount + "/5 Ngày (" + pct + "%)";
                        goal1Text.style.color = winningDaysCount >= 5 ? "var(--color-green)" : "var(--color-purple)";
                    }
                } else {
                    let totalTradingDaysCount = getPayoutStatus(acc).tradingDays;
                    if (goal1Title) goal1Title.innerText = "Điều Kiện Payout (≥3 Ngày Trade)";
                    if (goal1Bar && goal1Text) {
                        let pct = Math.min(100, Math.round((totalTradingDaysCount / 3) * 100));
                        goal1Bar.style.width = pct + "%";
                        goal1Bar.style.background = totalTradingDaysCount >= 3 ? "var(--color-green)" : "var(--color-purple)";
                        goal1Text.innerText = totalTradingDaysCount + "/3 Ngày (" + pct + "%)";
                        goal1Text.style.color = totalTradingDaysCount >= 3 ? "var(--color-green)" : "var(--color-purple)";
                    }
                }

                // Goal 2: Safe MLL Buffer vs $50K Initial
                if (goal2Title) goal2Title.innerText = `Đệm MLL Khóa Vốn (Khóa $${data.initialBal.toLocaleString()})`;
                if (goal2Bar && goal2Text) {
                    let safeMaxBuffer = data.mllVal * 1.5;
                    let bufPct = Math.min(100, Math.max(5, Math.round((mllBuffer / safeMaxBuffer) * 100)));
                    goal2Bar.style.width = bufPct + "%";
                    goal2Bar.style.background = mllBuffer < data.dllVal ? "var(--color-red)" : "var(--color-primary)";
                    goal2Text.innerText = "+$" + mllBuffer.toLocaleString('en-US', {maximumFractionDigits: 0}) + " (" + bufPct + "%)";
                }

                // Goal 3: Payout Target / Cap Progress
                if (goal3Title) goal3Title.innerText = `Hạn Mức Rút Đợt Này (Trần ${capInfo.label})`;
                if (goal3Bar && goal3Text) {
                    let targetPct = Math.min(100, Math.round((maxAllowedWithdrawal / capInfo.val) * 100));
                    goal3Bar.style.width = targetPct + "%";
                    goal3Bar.style.background = maxAllowedWithdrawal > 0 ? "var(--color-purple)" : "var(--border-active)";
                    goal3Text.innerText = "$" + maxAllowedWithdrawal.toLocaleString('en-US', {maximumFractionDigits: 0}) + " / " + capInfo.val.toLocaleString() + " (" + targetPct + "%)";
                    goal3Text.style.color = maxAllowedWithdrawal > 0 ? "var(--color-purple)" : "var(--text-muted)";
                }

            } else {
                // ── COMBINE STAGE GOALS (MỤC TIÊU THI COMBINE) ──
                if (stageBadge) {
                    stageBadge.innerText = "Vòng Combine® · Mục Tiêu Thi";
                    stageBadge.className = "b-badge b-badge-blue";
                }

                // Goal 1: Profit Target Progress (Combine Target)
                const scaledTarget = Math.max(data.targetVal, Math.ceil(Math.max(0,...Object.values(dailyPnlMap)) / data.consistencyRatio));
                if (goal1Title) goal1Title.innerText = `Mục Tiêu Điều Chỉnh ($${scaledTarget.toLocaleString()})`;
                if (goal1Bar && goal1Text) {
                    let curPnl = Math.max(0, totalPnl);
                    let targetPct = Math.min(100, Math.round((curPnl / scaledTarget) * 100));
                    goal1Bar.style.width = targetPct + "%";
                    goal1Bar.style.background = totalPnl >= scaledTarget ? "var(--color-green)" : "var(--color-primary)";

                    if (totalPnl >= scaledTarget) {
                        goal1Text.innerText = `ĐÃ ĐẠT TARGET (+${totalPnl.toLocaleString('en-US', {maximumFractionDigits: 0})})`;
                        goal1Text.style.color = "var(--color-green)";
                    } else if (totalPnl > 0) {
                        goal1Text.innerText = `+${totalPnl.toLocaleString('en-US', {maximumFractionDigits: 0})} / $${scaledTarget.toLocaleString()} (${targetPct}%)`;
                        goal1Text.style.color = "var(--color-green)";
                    } else {
                        goal1Text.innerText = `$0 / $${scaledTarget.toLocaleString()} (0%)`;
                        goal1Text.style.color = "var(--text-muted)";
                    }
                }

                // Goal 2: Safe Trailing MLL Buffer
                if (goal2Title) goal2Title.innerText = `Đệm An Toàn Trailing MLL (${data.mll})`;
                if (goal2Bar && goal2Text) {
                    let bufPct = Math.min(100, Math.max(5, Math.round((mllBuffer / data.mllVal) * 100)));
                    goal2Bar.style.width = bufPct + "%";
                    goal2Bar.style.background = mllBuffer < data.dllVal ? "var(--color-red)" : "var(--color-primary)";
                    goal2Text.innerText = "+$" + mllBuffer.toLocaleString('en-US', {maximumFractionDigits: 0}) + " (" + bufPct + "%)";
                }

                // Goal 3: Consistency Rule (Ngày Lớn Nhất ≤ 55%)
                if (goal3Title) goal3Title.innerText = "Tính Nhất Quán (Consistency ≤ 55%)";
                if (goal3Bar && goal3Text) {
                    let dayPnlValues = Object.values(dailyPnlMap);
                    let bestDayPnl = dayPnlValues.length > 0 ? Math.max(0, ...dayPnlValues) : 0;

                    if (journalEntries.length === 0 || totalPnl <= 0) {
                        goal3Bar.style.width = "0%";
                        goal3Bar.style.background = "var(--border-active)";
                        goal3Text.innerText = "Chưa có phiên lãi (≤55%)";
                        goal3Text.style.color = "var(--text-muted)";
                    } else {
                        let consistencyRatio = (bestDayPnl / totalPnl);
                        let consistencyPct = (consistencyRatio * 100).toFixed(1);
                        let isSafe = consistencyRatio <= data.consistencyRatio;

                        goal3Bar.style.width = Math.min(100, Math.max(10, Math.round(consistencyRatio * 100))) + "%";
                        goal3Bar.style.background = isSafe ? "var(--color-green)" : "var(--color-red)";

                        if (isSafe) {
                            goal3Text.innerText = `Ngày max: +${Math.round(bestDayPnl)} (${consistencyPct}% ≤ 55% ✓)`;
                            goal3Text.style.color = "var(--color-green)";
                        } else {
                            goal3Text.innerText = `Ngày max: +${Math.round(bestDayPnl)} (${consistencyPct}% > 55% ⚠)`;
                            goal3Text.style.color = "var(--color-red)";
                        }
                    }
                }
            }

            // 3. Render Money Flow Bar Chart
            renderFinpointMoneyFlowChart(dailyPnlMap, journalEntries, data);
        }

        function renderFinpointMoneyFlowChart(dailyPnlMap, journalEntries, data) {
            const chartContainer = document.getElementById("finpointChartBars");
            if (!chartContainer) return;

            const acc = getActiveAccount();
            const tagEl = document.getElementById("moneyFlowAccountTag");
            const statsEl = document.getElementById("moneyFlowStatsPill");

            if (tagEl) {
                tagEl.innerText = acc.id;
                tagEl.title = acc.name;
            }

            let entries = Object.entries(dailyPnlMap);
            let totalAccPnl = entries.reduce((sum, e) => sum + e[1], 0);
            let winCount = entries.filter(e => e[1] >= 0).length;
            let lossCount = entries.filter(e => e[1] < 0).length;

            if (statsEl) {
                statsEl.innerText = `${entries.length} phiên · Thắng ${winCount} / Thua ${lossCount} · PnL: ${totalAccPnl >= 0 ? '+' : ''}${totalAccPnl.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
                statsEl.className = totalAccPnl >= 0 ? "b-badge b-badge-green" : "b-badge b-badge-red";
            }

            if (entries.length === 0) {
                chartContainer.innerHTML = `
                    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); font-size: 12px; gap: 6px; text-align: center; padding: 20px;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                        <span>Chưa có dữ liệu phiên giao dịch nào cho quỹ <strong>[${escapeHtml(acc.id)}]</strong></span>
                        <span style="font-size: 11px; opacity: 0.75;">Nhập kết quả phiên EOD bên dưới để hiển thị biểu đồ Money Flow của quỹ này.</span>
                    </div>
                `;
                return;
            }

            // Real data from dailyPnlMap of THIS specific account
            let recentEntries = entries.slice(-14); // show up to last 14 sessions
            let maxPnl = Math.max(250, ...recentEntries.map(e => Math.abs(e[1])));

            chartContainer.innerHTML = recentEntries.map(([date, pnl]) => {
                let isWin = pnl >= 0;
                let heightPct = Math.max(14, Math.min(100, Math.round((Math.abs(pnl) / maxPnl) * 100)));
                let barColor = isWin ? "var(--color-green)" : "var(--color-red)";
                let barGlow = pnl >= 150 ? "box-shadow: 0 0 12px rgba(16, 185, 129, 0.45);" : "";
                let shortDate = date.split('-').slice(1).join('/');
                return `
                    <div class="finpoint-bar-col" title="[${escapeHtml(acc.id)}] Phiên ${date}: ${pnl >= 0 ? '+' : ''}${pnl.toLocaleString('en-US', {minimumFractionDigits: 2})}$" style="display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; flex: 1; min-width: 28px; cursor: pointer; position: relative;">
                        <div style="font-size: 10px; font-weight: 700; color: ${barColor}; margin-bottom: 4px;">${pnl >= 0 ? '+' : ''}${Math.round(pnl)}</div>
                        <div style="width: 22px; height: ${heightPct}%; background: ${barColor}; border-radius: 6px 6px 2px 2px; transition: height 0.3s ease; ${barGlow}"></div>
                        <div style="font-size: 10px; font-weight: 600; color: var(--text-muted); margin-top: 6px; white-space: nowrap;">${shortDate}</div>
                    </div>
                `;
            }).join('');
        }

        window.onload = function() {
            document.getElementById("inputDate").value = getActiveTopstepTradeDate();
            document.getElementById("inputDate").addEventListener("change", renderTrackerTable);
            loadActiveAccountState();
        };


        // Synchronize header trade date pill on load
        const origOnload = window.onload;
        window.onload = function() {
            if (origOnload) origOnload();
            const dateEl = document.getElementById("inputDate");
            const pill = document.getElementById("headerTradeDatePill");
            if (dateEl && pill && dateEl.value) pill.innerText = dateEl.value;
        };


        /* Theme Management (Behance Light / Dark Mode System) */
        function initTheme() {
            const savedTheme = localStorage.getItem('topstep_theme_mode') || 'dark';
            setTheme(savedTheme);
        }

        function setTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('topstep_theme_mode', theme);

            const darkInd = document.getElementById('themeDarkIndicator');
            const lightInd = document.getElementById('themeLightIndicator');

            if (darkInd && lightInd) {
                if (theme === 'light') {
                    lightInd.style.background = '#FFFFFF';
                    lightInd.style.color = '#11121E';
                    lightInd.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
                    darkInd.style.background = 'transparent';
                    darkInd.style.color = 'var(--text-muted)';
                    darkInd.style.boxShadow = 'none';
                } else {
                    darkInd.style.background = 'var(--color-primary)';
                    darkInd.style.color = '#FFFFFF';
                    darkInd.style.boxShadow = '0 2px 8px rgba(69, 120, 249, 0.35)';
                    lightInd.style.background = 'transparent';
                    lightInd.style.color = 'var(--text-muted)';
                    lightInd.style.boxShadow = 'none';
                }
            }
        }

        function toggleTheme() {
            const current = document.documentElement.getAttribute('data-theme') || 'dark';
            const next = current === 'dark' ? 'light' : 'dark';
            setTheme(next);
        }

        // Hook into window.onload
        const prevOnload = window.onload;
        /* ── VIEW SWITCHING (DASHBOARD vs CHECKLIST vs MARKET HOURS vs CALENDAR) ── */
        function switchAppView(viewName) {
            document.querySelector('.finpoint-workspace').dataset.view=viewName;
            const viewDash = document.getElementById('view-dashboard');
            const viewCheck = document.getElementById('view-checklist');
            const viewCal = document.getElementById('view-calendar');
            const navDash = document.getElementById('nav-dashboard');
            const navCheck = document.getElementById('nav-checklist');
            const navHours = document.getElementById('nav-market-hours');
            const navCal = document.getElementById('nav-calendar');
            const topDash = document.getElementById('topBtnDashboard');
            const topCheck = document.getElementById('topBtnChecklist');
            const topHours = document.getElementById('topBtnMarketHours');
            const topCal = document.getElementById('topBtnCalendar');
            const breadcrumbEl = document.getElementById('headerBreadcrumbCurrent');
            const headerTitleEl = document.getElementById('headerMainTitle');

            if (viewName === 'market-hours') {
                if (viewDash) viewDash.style.display = 'none';
                if (viewCheck) viewCheck.style.display = 'none';
                if (viewCal) viewCal.style.display = 'flex';
                if (navDash) navDash.classList.remove('active');
                if (navCheck) navCheck.classList.remove('active');
                if (navHours) navHours.classList.add('active');
                if (navCal) navCal.classList.remove('active');
                if (topDash) { topDash.className = 'b-badge b-badge-dim'; }
                if (topCheck) { topCheck.className = 'b-badge b-badge-dim'; }
                if (topHours) { topHours.className = 'b-badge b-badge-blue'; }
                if (topCal) { topCal.className = 'b-badge b-badge-dim'; }
                if (breadcrumbEl) breadcrumbEl.innerText = 'Phiên Thị Trường';
                if (headerTitleEl) headerTitleEl.innerText = 'Bộ Chuyển Đổi Múi Giờ & Phiên Giao Dịch Toàn Cầu';
                if (typeof window.switchCalendarSubtab === 'function') {
                    window.switchCalendarSubtab('hours');
                }
                if (window.MarketHours && typeof window.MarketHours.render === 'function') {
                    window.MarketHours.render();
                }
            } else if (viewName === 'checklist') {
                if (viewDash) viewDash.style.display = 'none';
                if (viewCheck) viewCheck.style.display = 'flex';
                if (viewCal) viewCal.style.display = 'none';
                if (navDash) navDash.classList.remove('active');
                if (navCheck) navCheck.classList.remove('active');
                if (navHours) navHours.classList.remove('active');
                if (navCal) navCal.classList.remove('active');
                if (topDash) { topDash.className = 'b-badge b-badge-dim'; }
                if (topCheck) { topCheck.className = 'b-badge b-badge-blue'; }
                if (topHours) { topHours.className = 'b-badge b-badge-dim'; }
                if (topCal) { topCal.className = 'b-badge b-badge-dim'; }
                if (breadcrumbEl) breadcrumbEl.innerText = 'Checklist Thực Chiến';
                if (headerTitleEl) headerTitleEl.innerText = 'Checklist Vào Lệnh Thực Chiến';
            } else if (viewName === 'calendar') {
                if (viewDash) viewDash.style.display = 'none';
                if (viewCheck) viewCheck.style.display = 'none';
                if (viewCal) viewCal.style.display = 'flex';
                if (navDash) navDash.classList.remove('active');
                if (navCheck) navCheck.classList.remove('active');
                if (navHours) navHours.classList.remove('active');
                if (navCal) navCal.classList.add('active');
                if (topDash) { topDash.className = 'b-badge b-badge-dim'; }
                if (topCheck) { topCheck.className = 'b-badge b-badge-dim'; }
                if (topHours) { topHours.className = 'b-badge b-badge-dim'; }
                if (topCal) { topCal.className = 'b-badge b-badge-blue'; }
                if (breadcrumbEl) breadcrumbEl.innerText = 'Lịch Kinh Tế';
                if (headerTitleEl) headerTitleEl.innerText = 'Lịch Kinh Tế & Radar Cảnh Báo Tin Tức';
                if (typeof window.switchCalendarSubtab === 'function') {
                    window.switchCalendarSubtab('calendar');
                }
                if (window.NewsRadar && typeof window.NewsRadar.onCalendarViewOpen === 'function') {
                    window.NewsRadar.onCalendarViewOpen();
                }
            } else {
                if (viewDash) viewDash.style.display = 'flex';
                if (viewCheck) viewCheck.style.display = 'none';
                if (viewCal) viewCal.style.display = 'none';
                if (navDash) navDash.classList.add('active');
                if (navCheck) navCheck.classList.remove('active');
                if (navHours) navHours.classList.remove('active');
                if (navCal) navCal.classList.remove('active');
                if (topDash) { topDash.className = 'b-badge b-badge-blue'; }
                if (topCheck) { topCheck.className = 'b-badge b-badge-dim'; }
                if (topHours) { topHours.className = 'b-badge b-badge-dim'; }
                if (topCal) { topCal.className = 'b-badge b-badge-dim'; }
                if (breadcrumbEl) breadcrumbEl.innerText = 'Dashboard';
                if (headerTitleEl) headerTitleEl.innerText = 'Welcome back, Trader!';
            }
            try {
                localStorage.setItem('topstep_active_app_view', viewName);
            } catch (e) {}
            if (typeof syncAnglerMotion === 'function') syncAnglerMotion();
        }

        function switchCalendarSubtab(tab) {
            const hoursCard = document.getElementById('marketHoursCard');
            const econSection = document.getElementById('calendarEconSection');
            const tabHours = document.getElementById('tabBtnMarketHours');
            const tabEcon = document.getElementById('tabBtnEconCalendar');
            const tabAll = document.getElementById('tabBtnAllCalendar');

            if (tab === 'hours') {
                if (hoursCard) hoursCard.style.display = 'block';
                if (econSection) econSection.style.display = 'none';
                if (tabHours) tabHours.className = 'b-btn-primary';
                if (tabEcon) tabEcon.className = 'b-btn-secondary';
                if (tabAll) tabAll.className = 'b-btn-secondary';
            } else if (tab === 'calendar') {
                if (hoursCard) hoursCard.style.display = 'none';
                if (econSection) econSection.style.display = 'flex';
                if (tabHours) tabHours.className = 'b-btn-secondary';
                if (tabEcon) tabEcon.className = 'b-btn-primary';
                if (tabAll) tabAll.className = 'b-btn-secondary';
            } else { // 'all'
                if (hoursCard) hoursCard.style.display = 'block';
                if (econSection) econSection.style.display = 'flex';
                if (tabHours) tabHours.className = 'b-btn-secondary';
                if (tabEcon) tabEcon.className = 'b-btn-secondary';
                if (tabAll) tabAll.className = 'b-btn-primary';
            }
            if (window.MarketHours && typeof window.MarketHours.render === 'function') {
                window.MarketHours.render();
            }
        }
        window.switchCalendarSubtab = switchCalendarSubtab;

        function togglePushNotifications(event) {
            if (event && event.stopPropagation) event.stopPropagation();
            if (window.NewsRadar && typeof window.NewsRadar.togglePushNotifications === 'function') {
                window.NewsRadar.togglePushNotifications();
            }
        }
        function toggleSoundAlerts(event) {
            if (event && event.stopPropagation) event.stopPropagation();
            if (window.NewsRadar && typeof window.NewsRadar.toggleSoundAlerts === 'function') {
                window.NewsRadar.toggleSoundAlerts();
            }
        }
        function testNewsNotification(event) {
            if (event && event.stopPropagation) event.stopPropagation();
            if (window.NewsRadar && typeof window.NewsRadar.testNotification === 'function') {
                window.NewsRadar.testNotification();
            }
        }
        function openAddCustomNewsModal() {
            const modal = document.getElementById('addCustomNewsModal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
            }
        }
        function closeAddCustomNewsModal() {
            const modal = document.getElementById('addCustomNewsModal');
            if (modal) {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            }
        }
        function submitCustomNews(e) {
            if (e) e.preventDefault();
            const nameEl = document.getElementById('customNewsName');
            const dateEl = document.getElementById('customNewsDate');
            const timeEl = document.getElementById('customNewsTime');
            const impactEl = document.getElementById('customNewsImpact');
            const symbols = Array.from(document.querySelectorAll('input[name="customNewsSymbol"]:checked')).map(el => el.value);

            if (!nameEl || !dateEl || !timeEl) return;
            const name = nameEl.value.trim();
            const dateStr = dateEl.value;
            const timeStr = timeEl.value;
            const impact = impactEl ? impactEl.value : 'HIGH';

            if (!name || !dateStr || !timeStr) {
                alert('Vui lòng điền đủ tên sự kiện, ngày và giờ.');
                return;
            }

            if (window.NewsRadar && typeof window.NewsRadar.addCustomEvent === 'function') {
                window.NewsRadar.addCustomEvent(name, dateStr, timeStr, impact, symbols);
            }
            closeAddCustomNewsModal();
            nameEl.value = '';
        }


        /* ── FINPOINT SIDEBAR TOGGLE & COLLAPSED CONTROLLER ── */
        function toggleSidebar() {
            const sidebar = document.querySelector('.finpoint-sidebar');
            if (!sidebar) return;
            const isCollapsed = sidebar.classList.toggle('collapsed');
            try {
                localStorage.setItem('topstep_sidebar_collapsed', isCollapsed ? 'true' : 'false');
            } catch (e) {}

            const toggleBtn = document.getElementById('sidebarToggleBtn');
            if (toggleBtn) {
                toggleBtn.title = isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu';
            }
            const headerBtn = document.getElementById('headerSidebarToggleBtn');
            if (headerBtn) {
                headerBtn.title = isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu';
            }
        }

        function initSidebarState() {
            try {
                if (localStorage.getItem('topstep_sidebar_collapsed') === 'true') {
                    const sidebar = document.querySelector('.finpoint-sidebar');
                    if (sidebar) sidebar.classList.add('collapsed');
                }
            } catch (e) {}
        }

        /* ── QUICK SEARCH & COMMAND PALETTE (CMD+K) ── */
        const QUICK_SEARCH_ITEMS = [
            // Views
            { id: 'view_dashboard', title: 'Dashboard Tổng Quan', desc: 'Xem PnL, tiến độ tài khoản, target & Trailing Drawdown', category: 'Điều Hướng', icon: '📊', action: () => switchAppView('dashboard') },
            { id: 'view_checklist', title: 'Checklist 4 Setup Vào Lệnh', desc: 'Kiểm tra kỷ luật, setup C1 Reversal, C2 Trend, quét đỉnh/đáy', category: 'Điều Hướng', icon: '✔', action: () => switchAppView('checklist') },
            { id: 'view_market_hours', title: 'Phiên Thị Trường & Giờ Giao Dịch', desc: 'Xem 24h Sydney, Tokyo, London, New York và 8 ICT Macros', category: 'Điều Hướng', icon: '🌐', action: () => switchAppView('market-hours') },
            { id: 'view_calendar', title: 'Lịch Kinh Tế Hoa Kỳ & Radar Tin', desc: 'Theo dõi tin đỏ EIA, CPI, FOMC, Jobless Claims', category: 'Điều Hướng', icon: '📅', action: () => switchAppView('calendar') },
            { id: 'sec_moneyflow', title: 'Money Flow Chart', desc: 'Biểu đồ dòng tiền và tăng trưởng tài khoản', category: 'Công Cụ', icon: '📈', action: () => navigateToDashboardSection('chart-section') },
            { id: 'sec_journal', title: 'Nhật Ký Giao Dịch EOD', desc: 'Ghi chép lịch sử vào lệnh, đánh giá cuối ngày', category: 'Công Cụ', icon: '📝', action: () => navigateToDashboardSection('journal-section') },
            { id: 'sec_calculator', title: 'Tính Size Hợp Đồng & R:R', desc: 'Máy tính lot size MNQ, MES, MGC, MCL theo rủi ro Topstep', category: 'Công Cụ', icon: '🧮', action: () => navigateToDashboardSection('calculator-section') },
            { id: 'modal_pricing', title: 'Bảng Gói Topstep® (50K, 100K, 150K)', desc: 'So sánh chỉ tiêu Target, Max Loss, Daily Loss và quy mô', category: 'Công Cụ', icon: '🏷️', action: () => openPricingModal() },
            
            // ICT Macros
            { id: 'macro_lm1', title: 'ICT Macro: London Open (02:33 - 03:00 NY)', desc: 'Săn thanh khoản đỉnh/đáy phiên Á, phát động sóng Judast Swing', category: 'ICT Macro', icon: '⚡', action: () => { switchAppView('market-hours'); if (window.MarketHours) MarketHours.highlightMacro('LM1'); } },
            { id: 'macro_lm2', title: 'ICT Macro: London Continuation (04:03 - 04:30 NY)', desc: 'Xác nhận tiếp diễn xu hướng London hoặc thiết lập High/Low of the Day', category: 'ICT Macro', icon: '⚡', action: () => { switchAppView('market-hours'); if (window.MarketHours) MarketHours.highlightMacro('LM2'); } },
            { id: 'macro_am1', title: 'ICT Macro: NY Pre-Market (08:50 - 09:10 NY)', desc: 'Tái cân bằng trước giờ mở cửa chứng khoán Mỹ 09:30, hút về Fair Value Gap', category: 'ICT Macro', icon: '⚡', action: () => { switchAppView('market-hours'); if (window.MarketHours) MarketHours.highlightMacro('AM1'); } },
            { id: 'macro_am2', title: 'ICT Macro: AM Silver Bullet (09:50 - 10:10 NY)', desc: 'Cửa sổ thuật toán vào lệnh chuẩn mực xác suất cao nhất phiên sáng New York', category: 'ICT Macro', icon: '⚡', action: () => { switchAppView('market-hours'); if (window.MarketHours) MarketHours.highlightMacro('AM2'); } },
            { id: 'macro_am3', title: 'ICT Macro: Morning Completion (10:50 - 11:10 NY)', desc: 'Quét thanh khoản đỉnh/đáy buổi sáng trước thềm bữa trưa phố Wall', category: 'ICT Macro', icon: '⚡', action: () => { switchAppView('market-hours'); if (window.MarketHours) MarketHours.highlightMacro('AM3'); } },
            { id: 'macro_lnc', title: 'ICT Macro: Lunch Hour (11:50 - 12:10 NY)', desc: 'Giai đoạn nghỉ trưa thanh khoản mỏng, hay tạo bẫy consolidation đi ngang', category: 'ICT Macro', icon: '⚡', action: () => { switchAppView('market-hours'); if (window.MarketHours) MarketHours.highlightMacro('LNC'); } },
            { id: 'macro_pm', title: 'ICT Macro: PM Silver Bullet (13:10 - 13:40 NY)', desc: 'Săn quét thanh khoản và tiếp diễn xu hướng buổi chiều New York', category: 'ICT Macro', icon: '⚡', action: () => { switchAppView('market-hours'); if (window.MarketHours) MarketHours.highlightMacro('PM'); } },
            { id: 'macro_cls', title: 'ICT Macro: Cash Close (15:15 - 15:45 NY)', desc: 'Đóng vị thế cuối ngày của các quỹ và ngân hàng trước 16:00 Equities Close', category: 'ICT Macro', icon: '⚡', action: () => { switchAppView('market-hours'); if (window.MarketHours) MarketHours.highlightMacro('CLS'); } },
            
            // Rules
            { id: 'rule_mll', title: 'Luật Topstep: Max Loss Limit (MLL)', desc: 'Giới hạn lỗ tối đa bám theo đỉnh vốn cao nhất (Trailing Drawdown)', category: 'Luật Topstep', icon: '🛡️', action: () => { switchAppView('dashboard'); navigateToDashboardSection('account-matrix-section'); } },
            { id: 'rule_dll', title: 'Luật Topstep: Daily Loss Limit (DLL)', desc: 'Giới hạn lỗ trong 1 ngày giao dịch - chạm DLL bị khóa tài khoản trong ngày', category: 'Luật Topstep', icon: '🛡️', action: () => { switchAppView('dashboard'); navigateToDashboardSection('account-matrix-section'); } },
            { id: 'rule_flatten', title: 'Luật Topstep: Đóng Lệnh Trước 15:10 CT', desc: 'Tuyệt đối không giữ lệnh qua đêm trên thị trường Futures CME', category: 'Luật Topstep', icon: '🛡️', action: () => switchAppView('checklist') },
            
            // Settings / Actions
            { id: 'act_theme', title: 'Đổi Giao Diện Sáng / Tối (Dark / Light)', desc: 'Chuyển đổi tông màu giao diện Fintech phù hợp điều kiện ánh sáng', category: 'Giao Diện', icon: '🌓', action: () => toggleTheme() },
            { id: 'act_notif_news', title: 'Bật / Tắt Cảnh Báo Đẩy Tin Tức', desc: 'Nhận thông báo đẩy trước 15p & 5p khi có tin đỏ MGC, MNQ, MES, MCL', category: 'Cài Đặt', icon: '🔔', action: () => togglePushNotifications() },
            { id: 'act_notif_ict', title: 'Bật / Tắt Cảnh Báo Đẩy ICT Macros', desc: 'Nhận thông báo đẩy trước 5p và khi mở cửa 8 cửa sổ thuật toán ICT', category: 'Cài Đặt', icon: '⚡', action: () => { if (window.MarketHours) MarketHours.togglePushNotifications(); } }
        ];

        let quickSearchQuery = '';
        let quickSearchSelectedIdx = 0;
        let quickSearchCategory = 'ALL';
        let filteredQuickSearchResults = [];

        function openQuickSearchModal() {
            const modal = document.getElementById('quickSearchModal');
            const input = document.getElementById('quickSearchInput');
            if (modal) modal.classList.remove('hidden');
            if (input) {
                input.value = '';
                quickSearchQuery = '';
                quickSearchSelectedIdx = 0;
                renderQuickSearchResults();
                setTimeout(() => input.focus(), 50);
            }
        }

        function closeQuickSearchModal() {
            const modal = document.getElementById('quickSearchModal');
            if (modal) modal.classList.add('hidden');
        }

        function filterQuickSearchCategory(cat) {
            quickSearchCategory = cat;
            quickSearchSelectedIdx = 0;
            const pills = document.querySelectorAll('.quick-cat-pill');
            pills.forEach(p => {
                const text = p.innerText.trim();
                const matches = (cat === 'ALL' && text === 'Tất cả') || (text.includes(cat) || (cat === 'ICT Macro' && text.includes('ICT')));
                p.className = matches ? 'b-badge b-badge-blue quick-cat-pill' : 'b-badge b-badge-dim quick-cat-pill';
            });
            renderQuickSearchResults();
        }

        function removeDiacritics(str) {
            return (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        }

        function handleQuickSearchInput(val) {
            quickSearchQuery = val || '';
            quickSearchSelectedIdx = 0;
            renderQuickSearchResults();
        }

        function handleQuickSearchKeydown(e) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (filteredQuickSearchResults.length > 0) {
                    quickSearchSelectedIdx = (quickSearchSelectedIdx + 1) % filteredQuickSearchResults.length;
                    renderQuickSearchResults(false);
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (filteredQuickSearchResults.length > 0) {
                    quickSearchSelectedIdx = (quickSearchSelectedIdx - 1 + filteredQuickSearchResults.length) % filteredQuickSearchResults.length;
                    renderQuickSearchResults(false);
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredQuickSearchResults.length > 0 && filteredQuickSearchResults[quickSearchSelectedIdx]) {
                    executeQuickSearchItem(filteredQuickSearchResults[quickSearchSelectedIdx]);
                }
            } else if (e.key === 'Escape') {
                closeQuickSearchModal();
            }
        }

        function renderQuickSearchResults(resetScroll = true) {
            const container = document.getElementById('quickSearchResults');
            if (!container) return;

            const q = removeDiacritics(quickSearchQuery.trim());

            filteredQuickSearchResults = QUICK_SEARCH_ITEMS.filter(item => {
                if (quickSearchCategory !== 'ALL' && item.category !== quickSearchCategory) return false;
                if (!q) return true;
                const matchTitle = removeDiacritics(item.title).includes(q);
                const matchDesc = removeDiacritics(item.desc).includes(q);
                const matchCat = removeDiacritics(item.category).includes(q);
                return matchTitle || matchDesc || matchCat;
            });

            if (filteredQuickSearchResults.length === 0) {
                container.innerHTML = `
                    <div style="padding: 28px 16px; text-align: center; color: var(--text-muted); font-size: 13px;">
                        🔍 Không tìm thấy kết quả phù hợp với "<strong>${quickSearchQuery}</strong>"
                    </div>
                `;
                return;
            }

            let html = '';
            filteredQuickSearchResults.forEach((item, idx) => {
                const isSelected = idx === quickSearchSelectedIdx;
                const activeStyle = isSelected 
                    ? 'background: var(--color-primary-light); border-color: var(--color-primary);' 
                    : 'background: transparent; border-color: transparent;';
                const titleColor = isSelected ? 'var(--color-primary)' : 'var(--text-primary)';

                html += `
                    <div onclick="executeQuickSearchItem(filteredQuickSearchResults[${idx}])" 
                         id="searchResultItem-${idx}"
                         style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; border-radius: 10px; cursor: pointer; transition: all 0.15s ease; border: 1px solid transparent; ${activeStyle}">
                        <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
                            <div style="width: 32px; height: 32px; border-radius: 8px; background: var(--bg-card); display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; border: 1px solid var(--border-inner);">
                                ${item.icon}
                            </div>
                            <div style="min-width: 0;">
                                <div style="font-size: 13px; font-weight: 700; color: ${titleColor}; line-height: 1.3;">
                                    ${item.title}
                                </div>
                                <div style="font-size: 11px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                    ${item.desc}
                                </div>
                            </div>
                        </div>
                        <span class="b-badge ${item.category === 'ICT Macro' ? 'b-badge-purple' : (item.category === 'Luật Topstep' ? 'b-badge-red' : 'b-badge-dim')}" style="font-size: 9.5px; flex-shrink: 0;">
                            ${item.category}
                        </span>
                    </div>
                `;
            });

            container.innerHTML = html;

            if (resetScroll) {
                container.scrollTop = 0;
            } else {
                const activeEl = document.getElementById(`searchResultItem-${quickSearchSelectedIdx}`);
                if (activeEl) {
                    activeEl.scrollIntoView({ block: 'nearest' });
                }
            }
        }

        function executeQuickSearchItem(item) {
            closeQuickSearchModal();
            if (item && typeof item.action === 'function') {
                setTimeout(() => item.action(), 50);
            }
        }

        // Global Keyboard Shortcut: Cmd+K / Ctrl+K / '/'
        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', function(e) {
                if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
                    e.preventDefault();
                    openQuickSearchModal();
                } else if (e.key === '/' && document.activeElement && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
                    e.preventDefault();
                    openQuickSearchModal();
                } else if (e.key === 'Escape') {
                    closeQuickSearchModal();
                }
            });
        }

        window.toggleSidebar = toggleSidebar;
        window.openQuickSearchModal = openQuickSearchModal;
        window.closeQuickSearchModal = closeQuickSearchModal;
        window.filterQuickSearchCategory = filterQuickSearchCategory;
        window.handleQuickSearchInput = handleQuickSearchInput;
        window.handleQuickSearchKeydown = handleQuickSearchKeydown;
        window.executeQuickSearchItem = executeQuickSearchItem;
        window.switchAppView = switchAppView;
        window.togglePushNotifications = togglePushNotifications;
        window.toggleSoundAlerts = toggleSoundAlerts;
        window.testNewsNotification = testNewsNotification;
        window.openAddCustomNewsModal = openAddCustomNewsModal;
        window.closeAddCustomNewsModal = closeAddCustomNewsModal;
        window.submitCustomNews = submitCustomNews;

        function navigateToDashboardSection(sectionId) {
            switchAppView('dashboard');
            setTimeout(() => {
                const el = document.getElementById(sectionId);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 60);
        }

        function initAppView() {
            try {
                const hash = window.location.hash;
                const saved = localStorage.getItem('topstep_active_app_view');
                if (hash === '#checklist' || saved === 'checklist') {
                    switchAppView('checklist');
                } else if (hash === '#calendar' || saved === 'calendar') {
                    switchAppView('calendar');
                } else {
                    switchAppView('dashboard');
                }
            } catch (e) {
                switchAppView('dashboard');
            }
        }

        window.onload = function() {
            try { accountsList = normalizeAccounts(accountsList); }
            catch (err) { accountStorageInvalid = true; alert('Dữ liệu tài khoản cần khôi phục: ' + err.message); return; }
            if (accountStorageInvalid) alert('Dữ liệu lưu bị hỏng; bản gốc được giữ nguyên. Hãy nhập bản sao lưu JSON trước khi ghi nhật ký.');
            if (prevOnload) prevOnload();
            initTheme();
            const dateEl = document.getElementById('inputDate');
            const pill = document.getElementById('headerTradeDatePill');
            if (dateEl && pill && dateEl.value) pill.innerText = dateEl.value;
            checkTopstepXSync();
            loadChecklistState();
            updateAiKeyStatus();
            initAppView();
        };

        if (typeof window !== 'undefined' && window.addEventListener) {
            window.addEventListener('hashchange', function() {
                checkTopstepXSync();
                if (window.location.hash === '#checklist') {
                    switchAppView('checklist');
                } else if (window.location.hash === '#dashboard') {
                    switchAppView('dashboard');
                }
            });
        }

        /* ── TOPSTEPX SYNC RECEIVER ── */
        function checkTopstepXSync() {
            try {
                const raw = new URLSearchParams(window.location.hash.slice(1)).get('topstepx');
                if (!raw) return;
                const payload = JSON.parse(decodeURIComponent(atob(raw.replace(/ /g, '+'))));
                if (!payload || !isValidTradeDate(payload.date) || typeof payload.pnl !== 'number' || !Number.isFinite(payload.pnl) ||
                    (payload.symbol && !Object.hasOwn(symbolSpecs, payload.symbol))) throw new Error('Ngày, PnL hoặc sản phẩm không hợp lệ.');
                const acc = payload.account ? accountsList.find(a => a.id.toLowerCase() === String(payload.account).toLowerCase()) : getActiveAccount();
                if (!acc) throw new Error('Không tìm thấy mã tài khoản ' + payload.account + '. Hãy tạo đúng mã tài khoản trước khi đồng bộ.');
                if (acc.status === 'archived') throw new Error('Tài khoản đã lưu trữ. Hãy kích hoạt lại trước khi đồng bộ.');
                const journal = getActiveJournal(acc);
                const old = journal.filter(e => e.date === payload.date);
                if (!confirm('Xem trước đồng bộ: ' + acc.id + ' · ' + payload.date + '\nHiện tại: ' + old.length + ' bản ghi, PnL $' + old.reduce((n,e)=>n+e.pnl,0).toFixed(2) + '\nTopstepX: 1 tổng kết EOD, PnL $' + payload.pnl.toFixed(2) + '\nToàn bộ bản ghi ngày này sẽ được thay thế. Tiếp tục?')) return;
                for (let i = journal.length-1; i >= 0; i--) if (journal[i].date === payload.date) journal.splice(i,1);
                journal.push({id:crypto.randomUUID(),date:payload.date, pnl:payload.pnl, symbol:payload.symbol || 'MGC', contracts:1, trades:1, kind:'eod', closed:true, source:'TopstepX', updatedAt:new Date().toISOString()});
                journal.sort((a,b) => a.date.localeCompare(b.date));
                activeAccountId = acc.id;
                saveAccounts();
                loadActiveAccountState();
                history.replaceState(null, document.title, window.location.pathname + window.location.search);
                showSyncToast('Đã lưu đồng bộ TopstepX: ' + acc.id + ' · ' + payload.date + ' · $' + payload.pnl.toFixed(2));
            } catch (err) {
                console.error('TopstepX sync:', err);
                alert('Không thể đồng bộ TopstepX: ' + err.message);
            }
        }

        function showSyncToast(message) {
            let toast = document.getElementById('finpointSyncToast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'finpointSyncToast';
                toast.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 9999; background: #2563EB; color: #FFFFFF; padding: 12px 20px; border-radius: 12px; font-weight: 600; font-size: 13px; box-shadow: 0 10px 25px rgba(37, 99, 235, 0.4); display: flex; align-items: center; gap: 10px; transition: all 0.3s ease; transform: translateY(20px); opacity: 0;';
                document.body.appendChild(toast);
            }
            toast.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;max-width:calc(100vw - 48px);background:#2563EB;color:#fff;padding:12px 20px;border-radius:12px;font-weight:600;font-size:13px;box-shadow:0 10px 25px #2563eb44;display:flex;transition:opacity .3s,transform .3s;';
            toast.setAttribute('role', 'status');
            toast.textContent = '⚡ ' + message;
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
            setTimeout(() => {
                toast.style.transform = 'translateY(20px)';
                toast.style.opacity = '0';
            }, 4500);
        }

        /* ── EXECUTION CHECKLIST LOGIC ── */
        let activeChecklistSetup = 1;
        let checklistRiskBySetup = {};
        let checklistLoaded = false;
        function rememberChecklistRisk() {
            checklistRiskBySetup[activeChecklistSetup]=['1r','2r','tp'].map(id=>document.getElementById('chk-risk-'+id).checked);
        }
        function applyChecklistRisk(setup) {
            const saved=checklistRiskBySetup[setup] || [];
            ['1r','2r','tp'].forEach((id,i)=>{document.getElementById('chk-risk-'+id).checked=saved[i]===true;});
        }

        function setDailyBias(bias) {
            try {
                localStorage.setItem('topstep_daily_bias', bias);
            } catch (e) {}
            updateDailyBiasUI(bias);
        }
        window.setDailyBias = setDailyBias;

        function updateDailyBiasUI(bias) {
            ['bullish', 'bearish', 'neutral'].forEach(b => {
                const btn = document.getElementById('bias-btn-' + b);
                if (btn) {
                    if (b === bias) {
                        btn.style.boxShadow = '0 0 0 1.5px currentColor';
                        btn.style.opacity = '1';
                        btn.style.fontWeight = '700';
                    } else {
                        btn.style.boxShadow = 'none';
                        btn.style.opacity = '0.55';
                        btn.style.fontWeight = '500';
                    }
                }
            });
        }
        window.updateDailyBiasUI = updateDailyBiasUI;

        function switchChecklistSetup(setupNum) {
            if (![1,2,3,4].includes(Number(setupNum))) return;
            if (checklistLoaded) rememberChecklistRisk();
            activeChecklistSetup = Number(setupNum);
            applyChecklistRisk(activeChecklistSetup);
            for (let i = 1; i <= 4; i++) {
                const tab = document.getElementById('tab-setup-' + i);
                const group = document.getElementById('checklist-setup-' + i);
                if (tab && group) {
                    if (i === setupNum) {
                        tab.style.background = 'var(--color-primary)';
                        tab.style.color = '#FFFFFF';
                        tab.style.fontWeight = '700';
                        group.style.display = 'flex';
                    } else {
                        tab.style.background = 'transparent';
                        tab.style.color = 'var(--text-muted)';
                        tab.style.fontWeight = '600';
                        group.style.display = 'none';
                    }
                }
            }
            try {
                localStorage.setItem('topstep_active_checklist_setup', setupNum);
            } catch (e) {}
            onChecklistChange({restore:true});
        }

        function onChecklistChange(options={}) {
            let totalSetupSteps = 4;
            let checkedSetupSteps = 0;
            for (let j = 1; j <= totalSetupSteps; j++) {
                const chk = document.getElementById('chk-s' + activeChecklistSetup + '-' + j);
                if (chk && chk.checked) checkedSetupSteps++;
            }

            const badge = document.getElementById('checklistStatusBadge');
            if (badge) {
                if (checkedSetupSteps === totalSetupSteps) {
                    badge.innerText = '✔ SẴN SÀNG VÀO LỆNH';
                    badge.className = 'b-badge b-badge-green';
                } else if (checkedSetupSteps > 0) {
                    badge.innerText = '⏳ Đang Kiểm Tra (' + checkedSetupSteps + '/' + totalSetupSteps + ')';
                    badge.className = 'b-badge b-badge-blue';
                } else {
                    badge.innerText = 'Chờ Kiểm Tra';
                    badge.className = 'b-badge b-badge-dim';
                }
            }

            const fill = document.getElementById('checklistProgressFill');
            if (fill) {
                const pct = Math.round((checkedSetupSteps / totalSetupSteps) * 100);
                fill.style.width = pct + '%';
                fill.style.background = pct === 100 ? 'var(--color-green)' : 'var(--color-primary)';
            }
            const progText = document.getElementById('checklistProgressText');
            if (progText) {
                progText.innerText = checkedSetupSteps + '/' + totalSetupSteps + ' Bước';
            }
                        // Connect with Rustic 3D Angler
            try {
                const r1 = document.getElementById('chk-risk-1r');
                const r2 = document.getElementById('chk-risk-2r');
                const rtp = document.getElementById('chk-risk-tp');
                if (typeof updateAnglerState === 'function') {
                    updateAnglerState(
                        checkedSetupSteps,
                        r1 ? r1.checked : false,
                        r2 ? r2.checked : false,
                        rtp ? rtp.checked : false,
                        options
                    );
                }
            } catch (e) {}

            saveChecklistState();
        }

        function resetChecklist() {
            const allCheckboxes = document.querySelectorAll('#checklist-section input[type="checkbox"]');
            allCheckboxes.forEach(cb => { cb.checked = false; });
            checklistRiskBySetup = {};
            onChecklistChange();
        }

        function saveChecklistState() {
            try {
                const state = {};
                const allCheckboxes = document.querySelectorAll('#checklist-section input[type="checkbox"]');
                allCheckboxes.forEach(cb => {
                    if (cb.id) state[cb.id] = cb.checked;
                });
                rememberChecklistRisk();
                state.__riskBySetup = checklistRiskBySetup;
                localStorage.setItem('topstep_checklist_state', JSON.stringify(state));
            } catch (e) {}
        }

        function loadChecklistState() {
            checklistLoaded=false;
            let saved={}, setup=1;
            try {
                const parsed=JSON.parse(localStorage.getItem('topstep_checklist_state') || '{}');
                if (parsed && typeof parsed==='object' && !Array.isArray(parsed)) saved=parsed;
                const candidate=Number(localStorage.getItem('topstep_active_checklist_setup') || 1);
                if ([1,2,3,4].includes(candidate)) setup=candidate;
            } catch (err) { console.debug('Checklist restore:',err.message); }
            checklistRiskBySetup={};
            for (let i=1;i<=4;i++) {
                const risk=saved.__riskBySetup?.[i];
                if (Array.isArray(risk)) checklistRiskBySetup[i]=[0,1,2].map(n=>risk[n]===true);
            }
            if (!saved.__riskBySetup) checklistRiskBySetup[setup]=['1r','2r','tp'].map(id=>saved['chk-risk-'+id]===true);
            document.querySelectorAll('#checklist-section input[type=checkbox]').forEach(cb=>{cb.checked=saved[cb.id]===true;});
            switchChecklistSetup(setup);
            try {
                const savedBias = localStorage.getItem('topstep_daily_bias') || 'neutral';
                updateDailyBiasUI(savedBias);
            } catch (e) {}
            checklistLoaded=true;
            if (typeof initRusticAngler==='function') setTimeout(initRusticAngler,60);
        }

        /* ── ALL-ACCOUNTS PERFORMANCE HUB & ARCHIVE LOGIC ── */
        function openAllAccountsModal() {
            renderAllAccountsHub();
            document.getElementById("allAccountsModal").classList.remove("hidden");
        }

        function closeAllAccountsModal() {
            document.getElementById("allAccountsModal").classList.add("hidden");
        }

        function renderAllAccountsHub() {
            const summaryContainer = document.getElementById("allAccountsSummaryStats");
            const tbody = document.getElementById("allAccountsTableBody");
            if (!summaryContainer || !tbody) return;

            const totalAccounts = accountsList.length;
            const activeCount = accountsList.filter(a => a.status !== 'archived').length;
            const archivedCount = accountsList.filter(a => a.status === 'archived').length;

            let allTimePnl = 0;
            let allTimeTrades = 0;
            let allTimeWins = 0;

            let allTimeFlat = 0;
            accountsList.forEach(a => {
                for (const journal of [a.journalEntries || [], a.xfaJournalEntries || []]) {
                    const days = {};
                    journal.forEach(e => { allTimePnl += e.pnl; days[e.date] = (days[e.date] || 0) + e.pnl; });
                    Object.values(days).forEach(pnl => { allTimeTrades++; if(pnl > 0) allTimeWins++; else if(pnl === 0) allTimeFlat++; });
                }
            });

            const winRate = allTimeTrades > 0 ? ((allTimeWins / allTimeTrades) * 100).toFixed(1) : 0;

            summaryContainer.innerHTML = `
                <div class="b-card-inner" style="padding: 10px 12px; text-align: center;">
                    <span style="font-size: 10.5px; color: var(--text-muted); display: block;">Tổng Số Quỹ</span>
                    <span class="tabular-nums" style="font-size: 18px; font-weight: 800; color: var(--text-primary);">${totalAccounts}</span>
                    <span style="font-size: 10px; color: var(--color-green);">${activeCount} Hoạt động · ${archivedCount} Đã đóng</span>
                </div>
                <div class="b-card-inner" style="padding: 10px 12px; text-align: center;">
                    <span style="font-size: 10.5px; color: var(--text-muted); display: block;">PnL Toàn Bộ Quỹ</span>
                    <span class="tabular-nums" style="font-size: 18px; font-weight: 800; color: ${allTimePnl >= 0 ? 'var(--color-green)' : 'var(--color-red)'};">${allTimePnl >= 0 ? '+' : ''}$${allTimePnl.toLocaleString('en-US', {minimumFractionDigits: 0})}</span>
                    <span style="font-size: 10px; color: var(--text-muted);">Lũy kế lịch sử</span>
                </div>
                <div class="b-card-inner" style="padding: 10px 12px; text-align: center;">
                    <span style="font-size: 10.5px; color: var(--text-muted); display: block;">Tổng Phiên Trade</span>
                    <span class="tabular-nums" style="font-size: 18px; font-weight: 800; color: var(--color-primary);">${allTimeTrades}</span>
                    <span style="font-size: 10px; color: var(--text-muted);">${allTimeWins} Thắng / ${allTimeTrades - allTimeWins - allTimeFlat} Thua / ${allTimeFlat} Hòa</span>
                </div>
                <div class="b-card-inner" style="padding: 10px 12px; text-align: center;">
                    <span style="font-size: 10.5px; color: var(--text-muted); display: block;">Tỷ Lệ Phiên Thắng</span>
                    <span class="tabular-nums" style="font-size: 18px; font-weight: 800; color: var(--color-green);">${winRate}%</span>
                    <span style="font-size: 10px; color: var(--text-muted);">Tất cả các đời quỹ</span>
                </div>
            `;

            tbody.innerHTML = "";
            accountsList.forEach(acc => {
                const journal = [...(acc.journalEntries || []), ...(acc.xfaJournalEntries || [])];
                const accPnl = journal.reduce((sum, e) => sum + e.pnl, 0);
                const isArchived = acc.status === 'archived';
                const isCurrent = acc.id === activeAccountId;

                let statusBadge = "";
                if (isArchived) {
                    let reasonTag = acc.closedReason === 'mll' ? 'Cháy MLL' : (acc.closedReason === 'passed' ? 'Đã Pass' : (acc.closedReason === 'dll' ? 'Dừng phiên DLL' : 'Đã đóng'));
                    statusBadge = `<span class="b-badge b-badge-red" style="font-size: 10px;">Đã Đóng (${reasonTag})</span>`;
                } else {
                    statusBadge = `<span class="b-badge b-badge-green" style="font-size: 10px;">Hoạt Động</span>`;
                }

                const tr = document.createElement("tr");
                tr.style.borderBottom = "1px solid var(--border-inner)";
                if (isCurrent) tr.style.background = "var(--color-primary-light)";

                tr.innerHTML = `
                    <td style="padding: 10px 12px;">
                        <strong style="color: var(--text-primary);">${escapeHtml(acc.id)}</strong>
                        <div style="font-size: 10.5px; color: var(--text-muted);">${escapeHtml(acc.name)}</div>
                    </td>
                    <td style="padding: 10px 12px; font-weight: 600;">$${acc.size}K</td>
                    <td style="padding: 10px 12px;">
                        <span class="b-badge ${acc.stage === 'xfa' ? 'b-badge-purple' : 'b-badge-blue'}" style="font-size: 10px;">
                            ${acc.stage === 'xfa' ? 'XFA' : 'Combine'}
                        </span>
                    </td>
                    <td style="padding: 10px 12px;">${statusBadge}</td>
                    <td style="padding: 10px 12px; text-align: right; font-weight: 700; color: ${accPnl >= 0 ? 'var(--color-green)' : 'var(--color-red)'};" class="tabular-nums">
                        ${accPnl >= 0 ? '+' : ''}$${accPnl.toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </td>
                    <td style="padding: 10px 12px; text-align: center; color: var(--text-muted);">${journal.length}</td>
                    <td style="padding: 10px 12px; text-align: center;">
                        <button type="button" data-account-id="${escapeHtml(acc.id)}" onclick="selectAccountFromHub(this.dataset.accountId)" class="b-btn-secondary" style="font-size: 10.5px; padding: 3px 8px;">
                            ${isCurrent ? 'Đang Xem' : 'Xem Quỹ'}
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        function selectAccountFromHub(accId) {
            activeAccountId = accId;
            saveAccounts();
            loadActiveAccountState();
            closeAllAccountsModal();
        }

        /* ── BACKUP & RESTORE DATA JSON ── */
        function exportTrackerCSV() {
            const acc = getActiveAccount();
            const ledger = getAccountLedger(acc);
            const total = Object.values(ledger.daily).reduce((sum,pnl) => sum+pnl, 0);
            const rows = [['Ngay_Giao_Dich','San_Pham_Chinh','Tong_So_Hop_Dong','Tong_So_Lenh','Tong_PnL_Cuoi_Ngay_USD','So_Du_Cuoi_Ngay_EOD','MLL_Trailing_EOD','Dem_MLL_Con_Lai','Kiem_Tra_DLL_Ngay','Ti_Le_Lai_Ngay_Consistency','Ghi_Chu_Journal']];
            Object.keys(ledger.daily).sort().forEach(date => {
                const entries = getActiveJournal(acc).filter(e => e.date === date);
                const day = ledger.rows[date], pnl = ledger.daily[date];
                rows.push([date,[...new Set(entries.map(e => e.symbol))].join('/'),entries.reduce((n,e)=>n+(e.contracts||1),0),entries.reduce((n,e)=>n+(e.trades||1),0),pnl.toFixed(2),day.balance.toFixed(2),day.mll.toFixed(2),day.buffer.toFixed(2),acc.dllEnabled === false ? 'KHONG BAT DLL' : pnl <= -getAccountRules(acc).dllVal ? 'DUNG PHIEN DLL' : 'TRONG DLL',total > 0 && pnl > 0 ? (pnl/total*100).toFixed(1)+'%' : '0%',entries.map(e=>e.note||'').join(' | ')]);
            });
            const cell = value => '"' + String(value).replace(/^[=+@-](?=\D)/, "'$&").replace(/"/g, '""') + '"';
            const blob = new Blob(['\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n')], {type:'text/csv;charset=utf-8'});
            const url = URL.createObjectURL(blob), link = document.createElement('a');
            link.href = url;
            link.download = `topstep_${acc.id.replace(/[^a-zA-Z0-9_-]/g,'_')}_${acc.stage}.csv`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }

        function exportFullBackupJSON() {
            try {
                const backupData = {
                    version: "v3",
                    exportDate: new Date().toISOString(),
                    accountsList: accountsList,
                    activeAccountId: activeAccountId,
                    preferences: Object.fromEntries(['topstep_theme_mode','topstep_active_app_view','topstep_active_checklist_setup','topstep_checklist_state','topstep_angler_collapsed','topstep_angler_motion_paused','topstep_angler_time_mode','topstep_pond_outcomes_v1','topstep_pond_sessions_v1','topstep_pond_motion_level','topstep_pond_performance'].map(key=>[key,localStorage.getItem(key)]))
                };
                const jsonStr = JSON.stringify(backupData, null, 2);
                const blob = new Blob([jsonStr], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `topstep_accounts_backup_${getActiveTopstepTradeDate()}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                alert("Đã tải về file sao lưu toàn bộ dữ liệu thành công! Hãy lưu giữ file này để tránh mất dữ liệu khi xóa cache trình duyệt.");
            } catch (err) {
                alert("Lỗi khi tạo file sao lưu: " + err.message);
            }
        }

        function importFullBackupJSON(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data && Array.isArray(data.accountsList) && data.accountsList.length > 0) {
                        if (confirm(`Khôi phục ${data.accountsList.length} tài khoản từ file sao lưu ngày ${data.exportDate || 'trước đó'}? Dữ liệu hiện tại sẽ được cập nhật.`)) {
                            const prefs = data.preferences || {};
                            if (typeof prefs.topstep_pond_outcomes_v1 === 'string') PondExecution.validate(JSON.parse(prefs.topstep_pond_outcomes_v1));
                            if (typeof prefs.topstep_pond_sessions_v1 === 'string') PondLive.validate(JSON.parse(prefs.topstep_pond_sessions_v1));
                            const validated = normalizeAccounts(data.accountsList);
                            const restoredId = validated.some(a => a.id === data.activeAccountId) ? data.activeAccountId : validated[0].id;
                            const preferenceKeys = ['topstep_theme_mode','topstep_active_app_view','topstep_active_checklist_setup','topstep_checklist_state','topstep_angler_collapsed','topstep_angler_motion_paused','topstep_angler_time_mode','topstep_pond_outcomes_v1','topstep_pond_sessions_v1','topstep_pond_motion_level','topstep_pond_performance'];
                            const priorPrefs = Object.fromEntries(preferenceKeys.map(key=>[key,localStorage.getItem(key)]));
                            const priorInvalid = accountStorageInvalid, priorActive = activeAccountId;
                            try {
                                for (const key of preferenceKeys) if (typeof prefs[key] === 'string') localStorage.setItem(key,prefs[key]);
                                accountStorageInvalid = false;
                                accountsList = validated;
                                activeAccountId = restoredId;
                                window.accountSaveReason = 'Nhập bản sao lưu JSON';
                                saveAccounts();
                            } catch (err) {
                                const changed = preferenceKeys.filter(key=>localStorage.getItem(key)!==priorPrefs[key]);
                                changed.forEach(key=>localStorage.removeItem(key));
                                changed.forEach(key=>{if(priorPrefs[key]!==null)localStorage.setItem(key,priorPrefs[key]);});
                                accountStorageInvalid = priorInvalid;activeAccountId = priorActive;
                                throw err;
                            } finally { window.accountSaveReason = ''; }
                            PondExecution.reload();PondLive.reload();PondScene.reload();
                            loadActiveAccountState();
                            loadChecklistState();
                            initTheme();
                            initAppView();
                            alert("Đã khôi phục thành công toàn bộ tài khoản và lịch sử giao dịch!");
                        }
                    } else {
                        alert("File sao lưu không đúng định dạng!");
                    }
                } catch (err) {
                    alert("Lỗi khi đọc file sao lưu: " + err.message);
                }
            };
            reader.readAsText(file);
        }


        /* ── AI CHART LENS & DRAWING VALIDATION ENGINE ── */
        let currentChartBase64 = null;
        let currentChartMimeType = "image/png";

        function updateAiKeyStatus() {
            const key = localStorage.getItem('topstep_gemini_api_key') || '';
            const savedModel = localStorage.getItem('topstep_gemini_model') || 'auto';
            const activeModel = localStorage.getItem('topstep_gemini_active_model') || '';

            const statusEl = document.getElementById('aiApiKeyStatus');
            const modelBadgeEl = document.getElementById('aiActiveModelBadge');
            const inputEl = document.getElementById('inputGeminiApiKey');
            const selectModelEl = document.getElementById('selectGeminiModel');

            if (inputEl) inputEl.value = key;
            if (selectModelEl) selectModelEl.value = savedModel;

            if (statusEl) {
                if (key.trim().length > 10) {
                    statusEl.innerText = "Đã có Key ✓";
                    statusEl.className = "b-badge b-badge-green";
                } else {
                    statusEl.innerText = "Chưa lưu Key";
                    statusEl.className = "b-badge b-badge-dim";
                }
            }

            if (modelBadgeEl) {
                if (activeModel) {
                    let clean = activeModel.replace(/^gemini-/, '').replace(/-latest$/, '').replace(/-preview.*$/, '');
                    if (clean.length > 10) clean = clean.substring(0, 10);
                    modelBadgeEl.innerText = clean.toUpperCase();
                    modelBadgeEl.title = activeModel;
                    modelBadgeEl.style.display = "inline-flex";
                } else if (key.trim().length > 10) {
                    modelBadgeEl.innerText = savedModel === 'auto' ? 'Auto' : savedModel.replace(/^gemini-/, '');
                    modelBadgeEl.style.display = "inline-flex";
                } else {
                    modelBadgeEl.style.display = "none";
                }
            }
        }

        function openAiSettingsModal() {
            updateAiKeyStatus();
            document.getElementById('aiSettingsModal').classList.remove('hidden');
        }

        function closeAiSettingsModal() {
            document.getElementById('aiSettingsModal').classList.add('hidden');
        }

        function saveGeminiApiKey() {
            const input = document.getElementById('inputGeminiApiKey');
            const selectModel = document.getElementById('selectGeminiModel');
            const key = input ? input.value.trim() : '';
            if (!key) {
                alert("Vui lòng nhập Gemini API Key!");
                return;
            }
            localStorage.setItem('topstep_gemini_api_key', key);
            if (selectModel) {
                localStorage.setItem('topstep_gemini_model', selectModel.value);
            }
            updateAiKeyStatus();
            closeAiSettingsModal();
            alert("Đã lưu cài đặt AI Gemini thành công!");
        }

        function clearGeminiApiKey() {
            if (confirm("Bạn có chắc muốn xóa Gemini API Key khỏi trình duyệt?")) {
                localStorage.removeItem('topstep_gemini_api_key');
                localStorage.removeItem('topstep_gemini_active_model');
                updateAiKeyStatus();
                closeAiSettingsModal();
            }
        }

        function onAiChartFileSelected(event) {
            const file = event.target.files[0];
            if (!file) return;
            loadAiImageFile(file);
        }

        function loadAiImageFile(file) {
            if (!file || !file.type.startsWith('image/')) {
                alert("Vui lòng chọn một file hình ảnh biểu đồ hợp lệ!");
                return;
            }
            currentChartMimeType = file.type;
            const reader = new FileReader();
            reader.onload = function(e) {
                const dataUrl = e.target.result;
                currentChartBase64 = dataUrl.split(',')[1];
                showAiImagePreview(dataUrl, file.name + " (" + (file.size / 1024).toFixed(0) + " KB)");
            };
            reader.readAsDataURL(file);
        }

        function showAiImagePreview(dataUrl, metaText) {
            const dropPrompt = document.getElementById('aiDropZonePrompt');
            const previewContainer = document.getElementById('aiPreviewContainer');
            const previewImg = document.getElementById('aiPreviewImg');
            const metaEl = document.getElementById('aiImgMeta');

            if (previewImg) previewImg.src = dataUrl;
            if (metaEl) metaEl.innerText = metaText || "Ảnh biểu đồ sẵn sàng";
            if (dropPrompt) dropPrompt.style.display = "none";
            if (previewContainer) previewContainer.style.display = "block";

            // Clear old result
            const resultBox = document.getElementById('aiAnalysisResultBox');
            if (resultBox) {
                resultBox.style.display = "none";
                resultBox.innerHTML = "";
            }
        }

        function clearAiChart(event) {
            if (event) event.stopPropagation();
            currentChartBase64 = null;
            const dropPrompt = document.getElementById('aiDropZonePrompt');
            const previewContainer = document.getElementById('aiPreviewContainer');
            const fileInput = document.getElementById('aiChartFileInput');
            const previewImg = document.getElementById('aiPreviewImg');

            if (fileInput) fileInput.value = "";
            if (previewImg) previewImg.src = "";
            if (dropPrompt) dropPrompt.style.display = "flex";
            if (previewContainer) previewContainer.style.display = "none";

            const resultBox = document.getElementById('aiAnalysisResultBox');
            if (resultBox) {
                resultBox.style.display = "none";
                resultBox.innerHTML = "";
            }
        }

        // Global Paste Listener for Clipboard Images
        if (typeof window !== 'undefined' && window.addEventListener) {
            window.addEventListener('paste', function(e) {
                const checklistView = document.getElementById('view-checklist');
                if (!checklistView || checklistView.style.display === 'none') return;

                const clipData = e.clipboardData || (e.originalEvent && e.originalEvent.clipboardData);
                if (!clipData || !clipData.items) return;
                const items = clipData.items;
                for (let i = 0; i < items.length; i++) {
                    if (items[i].kind === 'file' && items[i].type && items[i].type.startsWith('image/')) {
                        const blob = items[i].getAsFile();
                        loadAiImageFile(blob);
                        break;
                    }
                }
            });
        }

        async function runAiChartAnalysis() {
            if (!currentChartBase64) {
                alert("Vui lòng dán ảnh (Ctrl + V) hoặc tải lên ảnh chart có vẽ nến/FRVP của bạn trước!");
                return;
            }

            const apiKey = localStorage.getItem('topstep_gemini_api_key') || '';
            if (!apiKey) {
                openAiSettingsModal();
                alert("Bạn chưa nhập Gemini API Key. Hãy nhập mã Key miễn phí để AI phân tích hình ảnh biểu đồ!");
                return;
            }

            const indicator = document.getElementById('aiScanningIndicator');
            const resultBox = document.getElementById('aiAnalysisResultBox');
            const btnScan = document.getElementById('btnRunAiScan');

            if (indicator) indicator.style.display = "block";
            if (resultBox) resultBox.style.display = "none";
            if (btnScan) btnScan.disabled = true;

            const systemPrompt = `Bạn là Chuyên Gia Cố Vấn Trading Thực Chiến cho một Trader chuyên nghiệp thi quỹ Topstep (Futures Gold MGC và Nasdaq MNQ) theo phương pháp FRVP (Fixed Range Volume Profile) & SMC / CRT / AMD.

TRADER VỪA TẢI LÊN MỘT ẢNH BIỂU ĐỒ (CÓ THỂ LÀ ẢNH CHỤP 1 KHUNG THỜI GIAN HOẶC ĐA KHUNG THỜI GIAN 15M/1H + 1M/5M, VÀ CÓ THỂ ĐÃ KẺ VẼ HOẶC LÀ BIỂU ĐỒ SẠCH NGUYÊN BẢN CHƯA KẺ VẼ GÌ).

BẮT BUỘC FORMAT CÂU TRẢ LỜI NGẮN GỌN - DỨT KHOÁT - ĐỊNH HƯỚNG RÕ RÀNG HƯỚNG ĐI VÀ VIỆC CẦN LÀM:
1. HƯỚNG LỆNH (DIRECTION): Bắt buộc xác định rõ là "LONG" (Mua), "SHORT" (Bán), hoặc "NO_TRADE" (Đứng ngoài / Chưa đủ điều kiện).
2. VIỆC CẦN LÀM NGAY (SUMMARY DIRECTIVE): 1 câu mệnh lệnh ngắn gọn, dứt khoát nêu hành động chính xác trader cần thực hiện ngay lúc này (Ví dụ: "Chờ nến 1M đóng xanh qua POC 2664 rồi mở Long ngay, SL 2658" hoặc "Vào lệnh Short ngay khi nến hiện tại đóng cửa dưới 2680" hoặc "Đứng ngoài, giá đang nén trong range chưa có tín hiệu").
3. KẾ HOẠCH THỰC THI (LEVELS): Nêu rõ vùng Entry, mức SL (kèm số ticks), và mức TP (đạt chuẩn tỷ lệ 1:2 hoặc 1:3).

NGUYÊN TẮC XỬ LÝ 2 TÌNH HUỐNG (BẮT BUỘC TUÂN THỦ):

TÌNH HUỐNG 1: NẾU PHÁT HIỆN TRADER ĐÃ CÓ NÉT KẺ VẼ TRÊN BIỂU ĐỒ (có hộp Range, đường kẻ POC, mũi tên, sóng, hoặc thước đo SL/TP):
- Thẩm định chi tiết xem trader đã kẻ đúng hay sai quy tắc (Kéo FRVP đúng anchor chưa, có chọn đúng râu nến sweep không, nến đã đóng thân qua POC chưa, đặt SL/TP có đúng tỷ lệ 1:2/1:3 không).
- "status": "DUNG" (nếu vẽ chuẩn) hoặc "CHUA_DUNG" (nếu có lỗi).
- "statusText": "Nét vẽ chuẩn xác ✓" hoặc "Nét vẽ chưa chuẩn / Cần chỉnh ⚠".
- "feedback": 2-3 gạch đầu dòng ngắn gọn chỉ rõ nét nào kẻ đúng, nét nào kẻ sai hoặc chưa an toàn.

TÌNH HUỐNG 2: NẾU TRADER CHƯA KẺ VẼ GÌ (BIỂU ĐỒ SẠCH / CHART NGUYÊN BẢN / ẢNH CHỤP CÁC KHUNG THỜI GIAN SẠCH):
- TUYỆT ĐỐI KHÔNG ĐƯỢC TỪ CHỐI PHÂN TÍCH HOẶC NÓI RẰNG "DO CHƯA VẼ NÊN KHÔNG THỂ ĐÁNH GIÁ"!
- BẠN PHẢI TỰ ĐỘNG ĐÓNG VAI TRÒ CHUYÊN GIA TỰ PHÂN TÍCH TOÀN DIỆN TỪ ĐẦU CHO TRADER:
  + "status": "AI_TU_PHAN_TICH".
  + "statusText": "AI Tự Soi Kèo & Lên Kế Hoạch 🔍".
  + "feedback": Phân tích cấu trúc ngắn gọn:
    * HTF (15M/1H nếu có): Xu hướng chính, đỉnh đáy then chốt (ONH/ONL, PDH/PDL).
    * LTF (1M/5M): Trạng thái nén, sóng đẩy hay quét râu?
    * GỢI Ý KẺ VẼ: Kéo FRVP từ đâu đến đâu (Open Anchor), POC then chốt ở mức giá nào.

QUY TẮC 4 SETUP THỰC CHIẾN CỦA HỆ THỐNG:
1. Setup 1 (CRT - FRVP): Kéo FRVP từ Open Anchor đến nến trước nến Sweep (hoặc qua nến Sweep). POC phải ở Cực Trị (A+) hoặc Giữa (50%). Thân nến phải đóng cửa dứt khoát qua POC (không chấp nhận chỉ thò râu). Nếu POC nằm sát Target -> Bỏ lệnh.
2. Setup 2 (Trend): Đánh dấu High & Low con sóng đẩy -> Kéo FRVP cả sóng. Giá hồi về POC -> BẮT BUỘC phải chờ tạo Đáy mới cục bộ (Local Higher Low) giữ vững trên POC, tuyệt đối không limit mù.
3. Setup 3 (AMD): Vùng tích lũy Range A (có POC-A) -> Giá quét râu Manipulation (Judas Swing) thoát biên -> Chui ngược lại retest POC-A và bị từ chối (Rejection) mới vào lệnh.
4. Setup 4 (Break): Range Sideway tích lũy nén -> Nến thân lớn đóng cửa dứt khoát thoát hộp -> Retest POC hoặc VAH/VAL.

HÃY TRẢ LỜI ĐÚNG ĐỊNH DẠNG JSON SAU (KHÔNG DÙNG BACKTICKS HAY TEXT NÀO NGOÀI JSON NÀY):
{
  "direction": "LONG" | "SHORT" | "NO_TRADE",
  "directionText": "🟢 LONG (MUA)" | "🔴 SHORT (BÁN)" | "⚪ ĐỨNG NGOÀI (NO TRADE)" | "⏳ CHỜ TÍN HIỆU",
  "summaryDirective": "1 câu mệnh lệnh dứt khoát xác định việc cần làm ngay (Ví dụ: Chờ nến 1M đóng xanh qua POC 2664 rồi mở Long ngay, SL 2658)",
  "action": "VÀO LỆNH NGAY" | "CHỜ NẾN ĐÓNG CỬA" | "CANH PULLBACK POC" | "CHỜ QUÉT RÂU" | "ĐỨNG NGOÀI" | "BỎ KÈO (SKIP)",
  "actionColor": "green" | "blue" | "gold" | "red",
  "setupIdentified": "Setup 1: CRT - FRVP" | "Setup 2: Trend" | "Setup 3: AMD" | "Setup 4: Break" | "Chưa Đủ Điều Kiện / Đang Tích Lũy",
  "pocPosition": "Cực Trị (A+)" | "Cân Bằng 50%" | "Sát Target (Cản Cấm Vào)" | "Vùng POC Đề Xuất",
  "entryPlan": "Khoảng giá Entry cụ thể",
  "slPlan": "Giá SL (kèm số ticks / điểm)",
  "tpPlan": "Giá TP (đạt chuẩn 1:2 hoặc 1:3)",
  "slTpPlan": "SL đặt tại... TP kỳ vọng 1:2 / 1:3...",
  "drawingCheck": {
    "status": "DUNG" | "CHUA_DUNG" | "AI_TU_PHAN_TICH",
    "statusText": "Nét vẽ chuẩn xác ✓" | "Nét vẽ chưa chuẩn / Cần chỉnh ⚠" | "AI Tự Soi Kèo & Lên Kế Hoạch 🔍",
    "feedback": "Nhận xét ngắn gọn 2-3 gạch đầu dòng: Chỗ đúng/sai (nếu có vẽ) HOẶC gợi ý kẻ FRVP và cấu trúc HTF/LTF (nếu chart sạch)"
  },
  "disciplineAdvice": "1 câu nhắc nhở kỷ luật quản trị vốn Topstep (DLL, dời SL khi +1R / +2R)."
}`;

            try {
                const userSelectedModel = localStorage.getItem('topstep_gemini_model') || 'auto';
                const cachedActiveModel = localStorage.getItem('topstep_gemini_active_model');

                // Step 1: Auto-discover available models for this specific API key via ListModels
                let candidateModels = [];
                if (userSelectedModel !== 'auto') {
                    candidateModels.push(userSelectedModel);
                }
                if (cachedActiveModel && !candidateModels.includes(cachedActiveModel)) {
                    candidateModels.push(cachedActiveModel);
                }

                try {
                    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
                    if (listRes.ok) {
                        const listData = await listRes.json();
                        if (listData.models && Array.isArray(listData.models)) {
                            const supported = listData.models
                                .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"))
                                .map(m => m.name.replace(/^models\//, ''));

                            // High priority vision models
                            const preferredOrder = [
                                "gemini-2.5-flash",
                                "gemini-2.0-flash",
                                "gemini-2.0-flash-exp",
                                "gemini-1.5-flash-latest",
                                "gemini-1.5-flash-002",
                                "gemini-1.5-flash-001",
                                "gemini-1.5-flash",
                                "gemini-2.5-pro",
                                "gemini-1.5-pro-latest",
                                "gemini-1.5-pro"
                            ];
                            preferredOrder.forEach(p => {
                                if (supported.includes(p) && !candidateModels.includes(p)) {
                                    candidateModels.push(p);
                                }
                            });
                            // Add any other flash or content models
                            supported.forEach(s => {
                                if (!candidateModels.includes(s) && (s.includes('flash') || s.includes('gemini'))) {
                                    candidateModels.push(s);
                                }
                            });
                        }
                    }
                } catch (e) {
                    console.warn("Could not auto-list models, using fallback list:", e);
                }

                // If candidate list still empty, provide robust defaults
                const defaultFallbacks = [
                    "gemini-2.5-flash",
                    "gemini-2.0-flash",
                    "gemini-1.5-flash-latest",
                    "gemini-2.5-pro",
                    "gemini-1.5-flash",
                    "gemini-1.5-pro"
                ];
                defaultFallbacks.forEach(f => {
                    if (!candidateModels.includes(f)) candidateModels.push(f);
                });

                const payload = {
                    contents: [
                        {
                            parts: [
                                { text: systemPrompt },
                                {
                                    inline_data: {
                                        mime_type: currentChartMimeType,
                                        data: currentChartBase64
                                    }
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 1200
                    }
                };

                let lastError = null;
                let successfulData = null;
                let successfulModel = null;

                const scanTitleEl = document.getElementById('aiScanningTitle');

                // Try each candidate model sequentially until one succeeds
                for (let i = 0; i < candidateModels.length; i++) {
                    const modelName = candidateModels[i];
                    if (scanTitleEl) {
                        scanTitleEl.innerText = `AI đang đọc chart với model [${modelName}] (${i + 1}/${candidateModels.length})...`;
                    }

                    try {
                        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
                        const response = await fetch(endpoint, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload)
                        });

                        if (response.ok) {
                            successfulData = await response.json();
                            successfulModel = modelName;
                            break;
                        } else {
                            const errJson = await response.json().catch(() => ({}));
                            lastError = errJson.error ? errJson.error.message : (`HTTP ${response.status}`);
                            console.warn(`Model ${modelName} failed: ${lastError}. Trying next candidate...`);
                        }
                    } catch (netErr) {
                        lastError = netErr.message;
                        console.warn(`Network error calling ${modelName}: ${netErr.message}`);
                    }
                }

                if (!successfulData) {
                    throw new Error(`Không thể kết nối tới mô hình AI nào (Lỗi cuối: ${lastError}). Các model đã thử: ${candidateModels.slice(0, 4).join(', ')}.`);
                }

                // Remember the winning model for instant subsequent requests
                localStorage.setItem('topstep_gemini_active_model', successfulModel);
                updateAiKeyStatus();

                const rawText = successfulData.candidates?.[0]?.content?.parts?.[0]?.text || "";
                let parsedResult = null;
                try {
                    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        parsedResult = JSON.parse(jsonMatch[0]);
                    }
                } catch (e) {
                    console.error("JSON parse error:", e);
                }

                if (!parsedResult) {
                    parsedResult = {
                        drawingCheck: {
                            status: "CHUA_DUNG",
                            statusText: "Kết quả phân tích",
                            feedback: rawText
                        },
                        setupIdentified: "Phân Tích AI",
                        pocPosition: "Tham khảo biểu đồ",
                        action: "CÂN NHẮC KỸ",
                        actionColor: "gold",
                        slTpPlan: "Tuân thủ R:R 1:2",
                        disciplineAdvice: "Kỷ luật bảo vệ vốn."
                    };
                }

                renderAiAnalysisResult(parsedResult, successfulModel);
            } catch (err) {
                alert("Lỗi khi AI phân tích ảnh: " + err.message + "\n\nVui lòng kiểm tra lại API Key hoặc đổi mô hình trong Cài Đặt ⚙️.");
            } finally {
                if (indicator) indicator.style.display = "none";
                if (btnScan) btnScan.disabled = false;
            }
        }

        function renderAiAnalysisResult(res, usedModel) {
            const resultBox = document.getElementById('aiAnalysisResultBox');
            if (!resultBox) return;

            const drawing = res?.drawingCheck;
            const safeText = value => typeof value === 'string' ? escapeHtml(value) : '';
            res = Object.fromEntries(Object.entries(res || {}).map(([key,value]) => [key, safeText(value)]));
            // drawingCheck is structured; sanitize its leaf text separately below.
            res.drawingCheck = drawing && typeof drawing === 'object' ? Object.fromEntries(Object.entries(drawing).map(([key,value]) => [key,safeText(value)])) : {};
            usedModel = safeText(usedModel);
            // 1. Xác định Hướng Lệnh (LONG / SHORT / NO_TRADE)
            let dir = res.direction || "";
            if (!dir) {
                const combined = ((res.action || "") + " " + (res.summaryDirective || "") + " " + (res.slTpPlan || "")).toUpperCase();
                if (combined.includes("LONG") || combined.includes("MUA")) dir = "LONG";
                else if (combined.includes("SHORT") || combined.includes("BÁN") || combined.includes("BAN")) dir = "SHORT";
                else dir = "NO_TRADE";
            }

            let dirBadgeClass = "b-badge b-badge-dim";
            let dirBadgeText = res.directionText || "⚪ ĐỨNG NGOÀI (NO TRADE)";
            let dirBorderColor = "var(--border-inner)";
            let dirBg = "rgba(100, 116, 139, 0.08)";

            if (dir.toUpperCase().includes("LONG") || dir === "MUA") {
                dirBadgeClass = "b-badge b-badge-green";
                dirBadgeText = res.directionText || "🟢 LONG (MUA)";
                dirBorderColor = "var(--color-green)";
                dirBg = "rgba(16, 185, 129, 0.08)";
            } else if (dir.toUpperCase().includes("SHORT") || dir === "BAN") {
                dirBadgeClass = "b-badge b-badge-red";
                dirBadgeText = res.directionText || "🔴 SHORT (BÁN)";
                dirBorderColor = "var(--color-red)";
                dirBg = "rgba(239, 68, 68, 0.08)";
            } else if (dir.toUpperCase().includes("WAIT") || dir.toUpperCase().includes("CHO")) {
                dirBadgeClass = "b-badge b-badge-gold";
                dirBadgeText = res.directionText || "⏳ CHỜ TÍN HIỆU";
                dirBorderColor = "var(--color-gold)";
                dirBg = "rgba(245, 158, 11, 0.08)";
            }

            let actionBadgeClass = "b-badge b-badge-blue";
            if (res.actionColor === "green") actionBadgeClass = "b-badge b-badge-green";
            else if (res.actionColor === "red") actionBadgeClass = "b-badge b-badge-red";
            else if (res.actionColor === "gold") actionBadgeClass = "b-badge b-badge-gold";

            let drawingBadgeClass = "b-badge b-badge-green";
            let drawingTitle = "✍️ THẨM ĐỊNH NÉT VẼ CỦA BẠN:";
            const drawStatus = (res.drawingCheck && res.drawingCheck.status) ? res.drawingCheck.status : "CHUA_DUNG";
            const statusText = (res.drawingCheck && res.drawingCheck.statusText) ? res.drawingCheck.statusText : "Kết quả phân tích";
            const feedbackText = (res.drawingCheck && res.drawingCheck.feedback) ? res.drawingCheck.feedback : "";

            if (drawStatus === "CHUA_DUNG") {
                drawingBadgeClass = "b-badge b-badge-red";
            } else if (drawStatus === "AI_TU_PHAN_TICH" || drawStatus === "CHUA_VE") {
                drawingBadgeClass = "b-badge b-badge-blue";
                drawingTitle = "🤖 AI TỰ PHÂN TÍCH CẤU TRÚC &amp; GỢI Ý ĐIỂM KẺ:";
            }

            const directiveText = res.summaryDirective || res.action || "Theo dõi chặt chẽ phản ứng giá";
            const entryVal = res.entryPlan || (res.action ? res.action : "Chờ kích hoạt");
            const slVal = res.slPlan || (res.slTpPlan ? res.slTpPlan.split('.')[0] : "Sau râu nến");
            const tpVal = res.tpPlan || "R:R 1:2 hoặc 1:3";

            resultBox.innerHTML = `
                <!-- 1. Executive Direction & Action Directive Bar -->
                <div style="background: ${dirBg}; border: 1.5px solid ${dirBorderColor}; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span class="${dirBadgeClass}" style="font-size: 13px; font-weight: 800; padding: 4px 10px; letter-spacing: 0.5px;">${dirBadgeText}</span>
                            <span class="${actionBadgeClass}" style="font-size: 11px; font-weight: 700;">${res.action || 'THEO DÕI'}</span>
                        </div>
                        <div style="display: flex; gap: 6px; align-items: center;">
                            ${usedModel ? `<span class="b-badge b-badge-dim" style="font-size: 9.5px;">${usedModel.replace('gemini-', '')}</span>` : ''}
                            <span class="b-badge b-badge-blue" style="font-size: 11px; font-weight: 700;">${res.setupIdentified || 'Setup Phù Hợp'}</span>
                        </div>
                    </div>

                    <!-- VIỆC CẦN LÀM NGAY (DIRECTIVE) -->
                    <div style="background: var(--bg-card); border-radius: 6px; padding: 8px 10px; border: 1px solid var(--border-inner);">
                        <span style="font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 4px;">
                            ⚡ VIỆC CẦN LÀM NGAY:
                        </span>
                        <div style="font-size: 12.5px; font-weight: 700; color: var(--text-primary); margin-top: 3px; line-height: 1.4;">
                            👉 ${directiveText}
                        </div>
                    </div>
                </div>

                <!-- 2. Execution Levels: Entry - SL - TP -->
                <div class="grid grid-cols-3 gap-2" style="font-size: 11px;">
                    <div class="b-card-inner" style="padding: 8px 10px; text-align: center;">
                        <span style="color: var(--text-muted); font-size: 9.5px; display: block; font-weight: 700;">VÙNG ENTRY</span>
                        <strong style="color: var(--color-primary); font-size: 11.5px; display: block; margin-top: 2px;">${entryVal}</strong>
                    </div>
                    <div class="b-card-inner" style="padding: 8px 10px; text-align: center; border-left: 2px solid var(--color-red);">
                        <span style="color: var(--color-red); font-size: 9.5px; display: block; font-weight: 700;">CẮT LỖ (SL)</span>
                        <strong style="color: var(--text-primary); font-size: 11.5px; display: block; margin-top: 2px;">${slVal}</strong>
                    </div>
                    <div class="b-card-inner" style="padding: 8px 10px; text-align: center; border-left: 2px solid var(--color-green);">
                        <span style="color: var(--color-green); font-size: 9.5px; display: block; font-weight: 700;">CHỐT LỜI (TP)</span>
                        <strong style="color: var(--color-green); font-size: 11.5px; display: block; margin-top: 2px;">${tpVal}</strong>
                    </div>
                </div>

                <!-- 3. Thẩm Định Nét Vẽ Hoặc AI Tự Phân Tích Cấu Trúc -->
                <div class="b-card-inner" style="padding: 10px 12px; border: 1px solid var(--border-inner);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span style="font-size: 11px; font-weight: 700; color: var(--text-primary);">${drawingTitle}</span>
                        <span class="${drawingBadgeClass}" style="font-size: 10px;">${statusText}</span>
                    </div>
                    <p style="font-size: 11.5px; color: var(--text-slate); line-height: 1.5; margin: 0; white-space: pre-line;">
                        ${feedbackText}
                    </p>
                </div>

                <!-- 4. Đánh Giá POC & Bối Cảnh -->
                <div class="grid grid-cols-2 gap-2" style="font-size: 11px;">
                    <div class="b-card-inner" style="padding: 8px 10px;">
                        <span style="color: var(--text-muted); display: block; font-size: 10px;">VỊ TRÍ / VÙNG POC:</span>
                        <strong style="color: var(--color-primary); font-size: 12px;">${res.pocPosition || 'Đang xác định'}</strong>
                    </div>
                    <div class="b-card-inner" style="padding: 8px 10px;">
                        <span style="color: var(--text-muted); display: block; font-size: 10px;">KẾ HOẠCH R:R:</span>
                        <span style="color: var(--text-primary); font-weight: 600;">${res.slTpPlan || 'Tối thiểu 1:2'}</span>
                    </div>
                </div>

                <!-- 5. Lời Khuyên Kỷ Luật -->
                <div style="background: rgba(37, 99, 235, 0.08); border: 1px solid rgba(37, 99, 235, 0.25); border-radius: 8px; padding: 8px 12px; font-size: 11px; color: var(--text-slate);">
                    💡 <strong>Kỷ Luật Topstep:</strong> ${res.disciplineAdvice || 'Tuân thủ quy tắc quản trị DLL và dừng phiên khi đạt target.'}
                </div>
            `;

            resultBox.style.display = "flex";
        }

        let demoToggleCounter = 0;
        function testSampleAiScan() {
            demoToggleCounter++;
            if (demoToggleCounter % 2 === 1) {
                // Demo 1: Trader có kẻ vẽ và AI thẩm định (SHORT)
                const sampleData = {
                    direction: "SHORT",
                    directionText: "🔴 SHORT (BÁN)",
                    summaryDirective: "CHỜ NẾN 1M ĐÓNG CỬA DỨT KHOÁT DƯỚI POC 2664 RỒI MỞ LỆNH SHORT NGAY",
                    action: "CHỜ NẾN ĐÓNG CỬA",
                    actionColor: "gold",
                    setupIdentified: "Setup 1: CRT - FRVP",
                    pocPosition: "Cực Trị (A+)",
                    entryPlan: "2663.5 - 2664.0 (sau nến đóng)",
                    slPlan: "2667.0 (ngoài râu sweep -12 ticks)",
                    tpPlan: "2657.0 (Tỷ lệ 1:2 tại CRTL)",
                    slTpPlan: "SL 2667.0 (-12 ticks). TP 2657.0 (1:2 tại CRTL).",
                    drawingCheck: {
                        status: "CHUA_DUNG",
                        statusText: "Nét vẽ chưa chuẩn ⚠",
                        feedback: "• Bạn đã kẻ đúng hộp tích lũy Range.\n• LỖI: Điểm kéo FRVP lại lấy nhầm từ cây nến breakout thay vì Open Anchor.\n• Nến hiện tại mới chỉ quét râu qua POC chứ chưa đóng thân nến dứt khoát."
                    },
                    disciplineAdvice: "Kiên nhẫn chờ nến 1M đóng cửa xác nhận vượt POC. Khi giá chạy +1R dời SL về -0.5R, +2R dời SL về BE."
                };
                renderAiAnalysisResult(sampleData, "Demo Thẩm Định Vẽ");
            } else {
                // Demo 2: Chart sạch chưa vẽ, AI tự phân tích cấu trúc và gợi ý điểm kẻ (LONG)
                const sampleData = {
                    direction: "LONG",
                    directionText: "🟢 LONG (MUA)",
                    summaryDirective: "CANH MUA (LONG) TẠI POC 2664 KHI NẾN 1M TẠO ĐÁY LOCAL HIGHER LOW XÁC NHẬN",
                    action: "CANH PULLBACK POC",
                    actionColor: "blue",
                    setupIdentified: "Setup 2: Trend",
                    pocPosition: "Cân Bằng 50%",
                    entryPlan: "2664.0 - 2665.0 (vùng POC sóng đẩy)",
                    slPlan: "2661.0 (dưới Local Low -15 ticks)",
                    tpPlan: "2672.0 - 2680.0 (Tỷ lệ 1:2.5 về đỉnh cũ)",
                    slTpPlan: "SL 2661.0 (dưới Local Low). TP 2680.0 (1:2.5 tại đỉnh sóng).",
                    drawingCheck: {
                        status: "AI_TU_PHAN_TICH",
                        statusText: "AI Tự Soi Kèo & Lên Kế Hoạch 🔍",
                        feedback: "• Khung 15M: Xu hướng Tăng mạnh, sóng đẩy bứt phá từ 2650 lên 2680.\n• Khung 1M: Đang có nhịp hồi sâu (pullback) về vùng cân bằng giá trị.\n• GỢI Ý ĐIỂM KẺ: Kéo FRVP từ đáy 2650 lên đỉnh 2680, đường POC then chốt hội tụ tại 2664."
                    },
                    disciplineAdvice: "Tuyệt đối không đặt Limit order mù tại POC. Bắt buộc chờ nến 1M xác nhận tạo đáy mới giữ vững trên POC."
                };
                renderAiAnalysisResult(sampleData, "Demo AI Tự Soi Kèo");
            }
        }
