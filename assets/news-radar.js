/**
 * Topstep Cockpit - News Radar & Economic Calendar Engine
 * Manages high-impact economic news alerts, countdowns, desktop push notifications,
 * and portfolio-specific impact tracking for MGC, MNQ, MES, and MCL.
 */
(function(root) {
    'use strict';

    // Timezone helper: US Eastern (ET) to Vietnam (ICT = GMT+7)
    function getUsDstContext(date = new Date()) {
        try {
            const fmt = new Intl.DateTimeFormat('en-US', {
                timeZone: 'America/New_York',
                timeZoneName: 'shortOffset'
            });
            const parts = fmt.formatToParts(date);
            const tzPart = parts.find(p => p.type === 'timeZoneName');
            const isDst = tzPart && (tzPart.value === 'GMT-4' || tzPart.value === 'EDT');
            return {
                isDst: Boolean(isDst),
                etOffset: isDst ? -4 : -5,
                vnDiffHours: isDst ? 11 : 12 // When ET is 08:30 AM -> VN is 19:30 (DST) or 20:30 (Standard)
            };
        } catch (e) {
            // Fallback assumption: US DST runs March to November
            const m = date.getMonth();
            const isDst = m >= 2 && m <= 10;
            return { isDst, etOffset: isDst ? -4 : -5, vnDiffHours: isDst ? 11 : 12 };
        }
    }

    // Sound alert generator using Web Audio API
    function playAlertChime(type = 'caution') {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const now = ctx.currentTime;
            
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'danger') {
                // Urgent double ping
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(587.33, now); // D5
                osc.frequency.setValueAtTime(880, now + 0.15); // A5
                gain.gain.setValueAtTime(0.18, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
                osc.start(now);
                osc.stop(now + 0.45);
            } else {
                // Gentle chime
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
            }
        } catch (err) {
            console.warn('[NewsRadar] Audio chime not allowed or supported', err);
        }
    }

    // Weekly Recurring Schedule Generator for the 4 Assets
    function generateWeeklyEvents(referenceDate = new Date()) {
        const events = [];
        const dst = getUsDstContext(referenceDate);

        // Find Monday of the current week (local time)
        const d = new Date(referenceDate);
        const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday
        const mondayOffset = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
        
        const monday = new Date(d);
        monday.setDate(d.getDate() + mondayOffset);
        monday.setHours(0, 0, 0, 0);

        // Helper to construct Date given day offset from Monday (0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri) and ET time
        function makeEventDate(dayOffset, etHour, etMinute) {
            const target = new Date(monday);
            target.setDate(monday.getDate() + dayOffset);
            // Convert ET hour/minute to VN local hour/minute
            // VN = ET + dst.vnDiffHours
            const vnTotalMinutes = (etHour * 60 + etMinute) + (dst.vnDiffHours * 60);
            const vnDayShift = Math.floor(vnTotalMinutes / 1440);
            const vnMinuteOfDay = vnTotalMinutes % 1440;
            const finalDate = new Date(target);
            finalDate.setDate(target.getDate() + vnDayShift);
            finalDate.setHours(Math.floor(vnMinuteOfDay / 60), vnMinuteOfDay % 60, 0, 0);
            return finalDate;
        }

        // 1. Tuesday (dayOffset 1)
        // 16:30 ET: API Weekly Crude Oil Stock
        events.push({
            id: 'api_crude_weekly',
            name: 'API Weekly Crude Oil Stock Report',
            vietnameseName: 'Báo Cáo Tồn Kho Dầu API (Tư Nhân)',
            time: makeEventDate(1, 16, 30),
            etTime: '16:30 ET',
            impactLevel: 'MEDIUM',
            symbols: ['MCL', 'MCLZ26'],
            category: 'oil',
            desc: 'Dữ liệu sơ bộ nguồn cung dầu thô Mỹ từ Viện Dầu khí Hoa Kỳ.'
        });

        // 2. Wednesday (dayOffset 2)
        // 10:30 ET: EIA Crude Oil Inventories - TOP IMPACT FOR MCL!
        events.push({
            id: 'eia_crude_weekly',
            name: 'EIA Crude Oil Inventories',
            vietnameseName: 'Báo Cáo Tồn Kho Dầu Thô EIA (Chính Phủ)',
            time: makeEventDate(2, 10, 30),
            etTime: '10:30 ET',
            impactLevel: 'HIGH',
            symbols: ['MCL', 'MCLZ26'],
            category: 'oil',
            topstepWarning: 'Cực kỳ nguy hiểm! Nến dầu có thể giật 1.00 - 2.00 pt trong vài giây. Bắt buộc né trước & sau 15 phút.',
            desc: 'Báo cáo chính thức của Cơ quan Thông tin Năng lượng Hoa Kỳ về trữ lượng dầu thương mại.'
        });

        // 3. Thursday (dayOffset 3)
        // 08:30 ET: US Initial Jobless Claims
        events.push({
            id: 'us_jobless_claims_weekly',
            name: 'US Initial Jobless Claims',
            vietnameseName: 'Số Đơn Xin Trợ Cấp Thất Nghiệp Lần Đầu',
            time: makeEventDate(3, 8, 30),
            etTime: '08:30 ET',
            impactLevel: 'HIGH',
            symbols: ['MGC', 'MNQ', 'MES'],
            category: 'labor',
            desc: 'Thước đo sức khỏe thị trường lao động Mỹ công bố định kỳ thứ 5 hàng tuần.'
        });

        // 4. Thursday (dayOffset 3)
        // 10:30 ET: EIA Natural Gas Storage
        events.push({
            id: 'eia_natgas_weekly',
            name: 'EIA Natural Gas Storage',
            vietnameseName: 'Báo Cáo Trữ Lượng Khí Đốt Tự Nhiên EIA',
            time: makeEventDate(3, 10, 30),
            etTime: '10:30 ET',
            impactLevel: 'MEDIUM',
            symbols: ['MCL'],
            category: 'oil',
            desc: 'Tác động gián tiếp đến nhóm năng lượng và dầu thô.'
        });

        // 5. Friday (dayOffset 4)
        // 08:30 ET: Check if this Friday is the first Friday of the month (NFP)
        const fridayDate = makeEventDate(4, 8, 30);
        const dayOfMonth = fridayDate.getDate();
        if (dayOfMonth <= 7) {
            // First Friday of Month = Non-Farm Payrolls (NFP)
            events.push({
                id: 'us_nfp_monthly',
                name: 'US Non-Farm Payrolls & Unemployment Rate (NFP)',
                vietnameseName: 'Bảng Lương Phi Nông Nghiệp & Tỷ Lệ Thất Nghiệp (NFP)',
                time: fridayDate,
                etTime: '08:30 ET',
                impactLevel: 'HIGH',
                symbols: ['MGC', 'MNQ', 'MES', 'MCL', 'MCLZ26'],
                category: 'macro',
                topstepWarning: 'Siêu tin bão đỏ! Biến động cực mạnh trên cả 4 mã MGC, MNQ, MES, MCL. Cấm giao dịch ±15 phút.',
                desc: 'Báo cáo việc làm quan trọng nhất tháng, quyết định xu hướng lãi suất của Fed.'
            });
        }

        // 6. Check for Middle of Month CPI / PPI (usually week 2)
        // If current week contains 10th to 16th
        if (dayOfMonth >= 8 && dayOfMonth <= 15 && dayOfWeek <= 5) {
            // Tuesday or Wednesday CPI
            events.push({
                id: 'us_cpi_monthly',
                name: 'US Consumer Price Index (CPI)',
                vietnameseName: 'Chỉ Số Giá Tiêu Dùng Lạm Phát (CPI Hoa Kỳ)',
                time: makeEventDate(2, 8, 30), // Wednesday 08:30 ET
                etTime: '08:30 ET',
                impactLevel: 'HIGH',
                symbols: ['MGC', 'MNQ', 'MES', 'MCL', 'MCLZ26'],
                category: 'inflation',
                topstepWarning: 'Tin tức lạm phát quan trọng nhất. Vàng (MGC) và Chỉ số (MNQ, MES) biến động hàng trăm tick ngay lập tức.',
                desc: 'Đo lường mức độ lạm phát cốt lõi của nền kinh tế Mỹ.'
            });

            // Thursday PPI
            events.push({
                id: 'us_ppi_monthly',
                name: 'US Producer Price Index (PPI)',
                vietnameseName: 'Chỉ Số Giá Sản Xuất (PPI Hoa Kỳ)',
                time: makeEventDate(3, 8, 30), // Thursday 08:30 ET
                etTime: '08:30 ET',
                impactLevel: 'HIGH',
                symbols: ['MGC', 'MNQ', 'MES'],
                category: 'inflation',
                desc: 'Đo lường biến động giá bán buôn của các nhà sản xuất Mỹ.'
            });
        }

        // 7. Friday 10:00 ET: Michigan Consumer Sentiment / Retail
        events.push({
            id: 'us_sentiment_monthly',
            name: 'UoM Consumer Sentiment & Inflation Expectations',
            vietnameseName: 'Tâm Lý Người Tiêu Dùng Đại Học Michigan',
            time: makeEventDate(4, 10, 0),
            etTime: '10:00 ET',
            impactLevel: 'MEDIUM',
            symbols: ['MNQ', 'MES', 'MGC'],
            category: 'macro',
            desc: 'Khảo sát kỳ vọng lạm phát và niềm tin tiêu dùng của hộ gia đình Mỹ.'
        });

        // 8. 13:00 ET Friday: Baker Hughes US Oil Rig Count
        events.push({
            id: 'baker_hughes_rigs',
            name: 'Baker Hughes US Oil Rig Count',
            vietnameseName: 'Số Lượng Giàn Khoan Dầu Hoạt Động Baker Hughes',
            time: makeEventDate(4, 13, 0),
            etTime: '13:00 ET',
            impactLevel: 'MEDIUM',
            symbols: ['MCL', 'MCLZ26'],
            category: 'oil',
            desc: 'Đo lường số lượng giàn khoan khai thác dầu đang hoạt động tại Mỹ.'
        });

        // Include any user-added custom news from localStorage
        try {
            if (typeof localStorage !== 'undefined') {
                const custom = JSON.parse(localStorage.getItem('topstep_custom_news_events') || '[]');
                if (Array.isArray(custom)) {
                    custom.forEach(c => {
                        if (c && c.time) {
                            events.push({
                                ...c,
                                time: new Date(c.time),
                                isCustom: true
                            });
                        }
                    });
                }
            }
        } catch (e) {
            console.warn('[NewsRadar] Custom news load error', e);
        }

        // Sort events chronologically
        events.sort((a, b) => a.time.getTime() - b.time.getTime());
        return events;
    }

    // Helper: format remaining time
    function formatCountdown(ms) {
        if (ms <= 0) return '00:00';
        const totalSec = Math.floor(ms / 1000);
        const hours = Math.floor(totalSec / 3600);
        const minutes = Math.floor((totalSec % 3600) / 60);
        const seconds = totalSec % 60;
        if (hours > 0) {
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // Main NewsRadar Controller Object
    const NewsRadar = {
        weeklyEvents: [],
        lastStatus: 'SAFE',
        pushEnabled: false,
        soundEnabled: true,
        updateIntervalId: null,
        notifiedKeys: new Set(),

        init() {
            if (typeof localStorage !== 'undefined') {
                this.pushEnabled = localStorage.getItem('topstep_push_notifications_enabled') === 'true';
                this.soundEnabled = localStorage.getItem('topstep_sound_alerts_enabled') !== 'false';
            }
            this.refreshEvents();
            this.updateStatus();
            
            // Start 1-second radar ticker
            if (this.updateIntervalId) clearInterval(this.updateIntervalId);
            this.updateIntervalId = setInterval(() => {
                this.updateStatus();
            }, 1000);

            // Re-render UI listeners
            this.renderNotificationToggle();
            this.renderEventList();
        },

        refreshEvents() {
            this.weeklyEvents = generateWeeklyEvents(new Date());
        },

        // Request Desktop Browser Notification permission
        async requestPushPermission() {
            if (!('Notification' in window)) {
                alert('Trình duyệt của bạn không hỗ trợ Web Notification.');
                return false;
            }
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    this.pushEnabled = true;
                    localStorage.setItem('topstep_push_notifications_enabled', 'true');
                    this.renderNotificationToggle();
                    
                    // Send an immediate test confirmation notification
                    new Notification('✅ Radar Né Tin Topstep Đã Kích Hoạt!', {
                        body: 'Bạn sẽ nhận thông báo đẩy trước 15 phút & 5 phút khi có tin đỏ cho MGC, MNQ, MES, MCL.',
                        icon: 'phamngocanhthong-topstep.png'
                    });
                    playAlertChime('caution');
                    return true;
                } else if (permission === 'denied') {
                    alert('Bạn đã chặn thông báo đẩy trên trình duyệt. Vui lòng bấm vào icon ổ khóa trên thanh địa chỉ URL để cho phép lại.');
                    this.pushEnabled = false;
                    localStorage.setItem('topstep_push_notifications_enabled', 'false');
                    this.renderNotificationToggle();
                    return false;
                }
            } catch (err) {
                console.error('[NewsRadar] Push permission request failed', err);
            }
            return false;
        },

        togglePushNotifications() {
            if (this.pushEnabled) {
                this.pushEnabled = false;
                localStorage.setItem('topstep_push_notifications_enabled', 'false');
                this.renderNotificationToggle();
            } else {
                this.requestPushPermission();
            }
        },

        toggleSoundAlerts() {
            this.soundEnabled = !this.soundEnabled;
            localStorage.setItem('topstep_sound_alerts_enabled', this.soundEnabled ? 'true' : 'false');
            this.renderNotificationToggle();
            if (this.soundEnabled) playAlertChime('caution');
        },

        testNotification() {
            if (this.pushEnabled && 'Notification' in window && Notification.permission === 'granted') {
                new Notification('🧪 Kiểm Tra Cảnh Báo Tin Tức (Demo)', {
                    body: '⚠️ Tin đỏ sắp ra mắt: Báo cáo tồn kho dầu thô EIA sau 15 phút. Khuyến nghị: Chuẩn bị siết BE hoặc đóng vị thế MCL.',
                    icon: 'phamngocanhthong-topstep.png'
                });
            } else {
                alert('Vui lòng cấp quyền thông báo trước để nhận thử nghiệm thông báo đẩy trên màn hình.');
                this.requestPushPermission();
            }
            if (this.soundEnabled) playAlertChime('danger');
        },

        // Core evaluation running every second
        updateStatus() {
            const now = new Date();
            const nowMs = now.getTime();

            // Find current active news or nearest upcoming news
            let activeEvent = null;
            let nearestUpcoming = null;
            let smallestFutureDiff = Infinity;

            for (const ev of this.weeklyEvents) {
                const evMs = ev.time.getTime();
                const diff = evMs - nowMs; // positive if in future, negative if in past

                // Inside the DANGER ZONE: 15 minutes before to 10 minutes after event
                if (diff <= 15 * 60 * 1000 && diff >= -10 * 60 * 1000) {
                    if (!activeEvent || ev.impactLevel === 'HIGH') {
                        activeEvent = { ...ev, diff };
                    }
                }

                // Check for nearest future event
                if (diff > 0 && diff < smallestFutureDiff) {
                    smallestFutureDiff = diff;
                    nearestUpcoming = { ...ev, diff };
                }

                // Trigger 15-minute Push Notification
                // Window: 14m00s to 15m00s (840s to 900s)
                if (diff > 14 * 60 * 1000 && diff <= 15 * 60 * 1000) {
                    const notifKey = `notif_15m_${ev.id}_${ev.time.toDateString()}`;
                    if (!this.notifiedKeys.has(notifKey)) {
                        this.notifiedKeys.add(notifKey);
                        this.firePushNotification(ev, 15);
                    }
                }

                // Trigger 5-minute Push Notification (URGENT)
                // Window: 4m00s to 5m00s (240s to 300s)
                if (diff > 4 * 60 * 1000 && diff <= 5 * 60 * 1000) {
                    const notifKey = `notif_5m_${ev.id}_${ev.time.toDateString()}`;
                    if (!this.notifiedKeys.has(notifKey)) {
                        this.notifiedKeys.add(notifKey);
                        this.firePushNotification(ev, 5);
                    }
                }
            }

            // Determine Overall Market State
            let state = 'SAFE';
            let targetEvent = null;

            if (activeEvent) {
                state = 'DANGER';
                targetEvent = activeEvent;
            } else if (nearestUpcoming && nearestUpcoming.diff <= 30 * 60 * 1000) {
                state = 'CAUTION';
                targetEvent = nearestUpcoming;
            } else if (nearestUpcoming) {
                state = 'SAFE';
                targetEvent = nearestUpcoming;
            }

            this.lastStatus = state;
            this.renderHeaderRadar(state, targetEvent);
            this.renderChecklistBanner(state, targetEvent);
        },

        // Fire Desktop Push Notification
        firePushNotification(event, minutesBefore) {
            if (!this.pushEnabled || !('Notification' in window) || Notification.permission !== 'granted') return;

            const isHigh = event.impactLevel === 'HIGH';
            const icon = 'phamngocanhthong-topstep.png';
            const symbolsStr = event.symbols.join(', ');

            if (minutesBefore === 15) {
                new Notification(`⚠️ CẢNH BÁO TIN ĐỎ (Sau 15 phút): ${event.vietnameseName || event.name}`, {
                    body: `Tác động: ${symbolsStr}. Khuyến nghị Topstep: Không mở lệnh mới, siết SL về BE hoặc chủ động đóng vị thế.`,
                    icon
                });
                if (this.soundEnabled) playAlertChime('caution');
            } else if (minutesBefore === 5) {
                new Notification(`⛔ VÙNG CẤM TIN TỨC (Sau 5 phút): ${event.vietnameseName || event.name}`, {
                    body: `KHÔNG VÀO LỆNH! Thị trường sắp giật mạnh trên ${symbolsStr}. Tuân thủ kỷ luật bảo toàn quỹ!`,
                    icon
                });
                if (this.soundEnabled) playAlertChime('danger');
            }
        },

        // Update the Sticky Header Radar Pill
        renderHeaderRadar(state, event) {
            const pill = document.getElementById('headerNewsRadar');
            const dot = document.getElementById('newsRadarDot');
            const statusEl = document.getElementById('newsRadarStatus');
            const countdownEl = document.getElementById('newsRadarCountdown');
            if (!pill || !dot || !statusEl) return;

            if (state === 'DANGER' && event) {
                pill.style.borderColor = 'rgba(239, 68, 68, 0.6)';
                pill.style.background = 'rgba(239, 68, 68, 0.12)';
                dot.style.background = 'var(--color-red)';
                dot.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.9)';
                statusEl.style.color = 'var(--color-red)';
                statusEl.innerText = `⛔ NÉ TIN: ${event.vietnameseName || event.name}`;
                if (countdownEl) {
                    const remain = event.diff > 0 ? `sau ${formatCountdown(event.diff)}` : 'Đang diễn ra';
                    countdownEl.innerText = `[${remain}]`;
                    countdownEl.style.color = 'var(--color-red)';
                }
            } else if (state === 'CAUTION' && event) {
                pill.style.borderColor = 'rgba(245, 158, 11, 0.6)';
                pill.style.background = 'rgba(245, 158, 11, 0.08)';
                dot.style.background = '#F59E0B';
                dot.style.boxShadow = '0 0 8px rgba(245, 158, 11, 0.8)';
                statusEl.style.color = '#F59E0B';
                statusEl.innerText = `⚠️ SẮP CÓ TIN: ${event.vietnameseName || event.name}`;
                if (countdownEl) {
                    countdownEl.innerText = `[sau ${formatCountdown(event.diff)}]`;
                    countdownEl.style.color = '#F59E0B';
                }
            } else {
                pill.style.borderColor = 'var(--border-card)';
                pill.style.background = 'var(--bg-card)';
                dot.style.background = 'var(--color-green)';
                dot.style.boxShadow = '0 0 8px rgba(16, 185, 129, 0.6)';
                statusEl.style.color = 'var(--color-green)';
                statusEl.innerText = 'SAFE: An toàn';
                if (countdownEl) {
                    countdownEl.innerText = event ? `[Kế tiếp: ${formatCountdown(event.diff)}]` : '';
                    countdownEl.style.color = 'var(--text-muted)';
                }
            }
        },

        // Update dynamic banner inside Checklist View
        renderChecklistBanner(state, event) {
            const container = document.getElementById('checklistNewsBanner');
            if (!container) return;

            if (state === 'DANGER' && event) {
                container.style.display = 'flex';
                container.className = 'b-card';
                container.style.padding = '12px 18px';
                container.style.background = 'rgba(239, 68, 68, 0.12)';
                container.style.border = '1px solid rgba(239, 68, 68, 0.4)';
                container.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; flex-wrap: wrap; gap: 10px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 20px;">⛔</span>
                            <div>
                                <div style="font-size: 13px; font-weight: 800; color: var(--color-red); letter-spacing: -0.01em;">
                                    VÙNG CẤM TIN TỨC: ${event.vietnameseName || event.name} (${event.symbols.join(', ')})
                                </div>
                                <div style="font-size: 11.5px; color: var(--text-primary); margin-top: 2px;">
                                    ${event.topstepWarning || 'Đang trong thời gian công bố tin tức đỏ. Topstep khuyến nghị tuyệt đối không mở lệnh mới để bảo vệ tài khoản.'}
                                </div>
                            </div>
                        </div>
                        <button type="button" onclick="switchAppView('calendar')" class="b-btn-secondary" style="font-size: 11px; height: 30px; padding: 0 10px; border-color: rgba(239,68,68,0.4); color: var(--color-red);">
                            Xem Lịch Tin Chi Tiết →
                        </button>
                    </div>
                `;
            } else if (state === 'CAUTION' && event) {
                container.style.display = 'flex';
                container.className = 'b-card';
                container.style.padding = '12px 18px';
                container.style.background = 'rgba(245, 158, 11, 0.1)';
                container.style.border = '1px solid rgba(245, 158, 11, 0.35)';
                container.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; flex-wrap: wrap; gap: 10px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 18px;">⚠️</span>
                            <div>
                                <div style="font-size: 13px; font-weight: 700; color: #F59E0B;">
                                    LƯU Ý: Sắp có tin ${event.vietnameseName || event.name} sau ${formatCountdown(event.diff)} (${event.symbols.join(', ')})
                                </div>
                                <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">
                                    Chuẩn bị siết Stop Loss về hòa vốn (BE) hoặc cân nhắc đóng lệnh trước giờ công bố tin.
                                </div>
                            </div>
                        </div>
                        <button type="button" onclick="switchAppView('calendar')" class="b-btn-secondary" style="font-size: 11px; height: 30px; padding: 0 10px; border-color: rgba(245,158,11,0.3); color: #F59E0B;">
                            Xem Lịch Chi Tiết
                        </button>
                    </div>
                `;
            } else {
                container.style.display = 'none';
            }
        },

        // Render toggle buttons in Header and Calendar View
        renderNotificationToggle() {
            const btn = document.getElementById('btnTogglePushNotif');
            const icon = document.getElementById('notifIcon');
            const text = document.getElementById('notifStatusText');
            if (btn && icon && text) {
                if (this.pushEnabled) {
                    btn.className = 'b-btn-secondary';
                    btn.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                    btn.style.color = 'var(--color-green)';
                    icon.innerText = '🔔';
                    text.innerText = 'Cảnh Báo Đẩy: BẬT';
                } else {
                    btn.className = 'b-btn-secondary';
                    btn.style.borderColor = 'var(--border-card)';
                    btn.style.color = 'var(--text-muted)';
                    icon.innerText = '🔕';
                    text.innerText = 'Bật Cảnh Báo Đẩy';
                }
            }

            const cardBtn = document.getElementById('calCardBtnToggleNotif');
            if (cardBtn) {
                cardBtn.className = this.pushEnabled ? 'b-btn-primary' : 'b-btn-secondary';
                cardBtn.innerHTML = this.pushEnabled ? '✅ Thông Báo Đẩy Đã BẬT' : '🔔 Bật Thông Báo Đẩy Desktop';
            }

            const soundBtn = document.getElementById('calCardBtnToggleSound');
            if (soundBtn) {
                soundBtn.className = this.soundEnabled ? 'b-btn-primary' : 'b-btn-secondary';
                soundBtn.innerHTML = this.soundEnabled ? '🔊 Chuông Báo: BẬT' : '🔇 Chuông Báo: TẮT';
            }
        },

        // Render events list in Calendar View
        renderEventList() {
            const container = document.getElementById('calendarEventsList');
            if (!container) return;

            const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
            const todayStr = new Date().toDateString();

            if (this.weeklyEvents.length === 0) {
                container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">Không có sự kiện tin tức trong tuần này.</div>';
                return;
            }

            // Group by Date
            const grouped = {};
            this.weeklyEvents.forEach(ev => {
                const dateKey = ev.time.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' });
                if (!grouped[dateKey]) grouped[dateKey] = [];
                grouped[dateKey].push(ev);
            });

            let html = '';
            for (const [dateStr, list] of Object.entries(grouped)) {
                const isToday = list.some(e => e.time.toDateString() === todayStr);
                html += `
                    <div style="background: var(--bg-card); border: 1px solid ${isToday ? 'var(--color-primary)' : 'var(--border-card)'}; border-radius: 12px; padding: 16px; margin-bottom: 14px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--border-inner); padding-bottom: 8px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 13.5px; font-weight: 800; color: ${isToday ? 'var(--color-primary)' : 'var(--text-primary)'}; text-transform: capitalize;">
                                    ${dateStr}
                                </span>
                                ${isToday ? '<span class="b-badge b-badge-blue" style="font-size: 10px;">HÔM NAY</span>' : ''}
                            </div>
                            <span style="font-size: 11px; color: var(--text-muted);">${list.length} sự kiện</span>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                `;

                list.forEach(ev => {
                    const timeVN = ev.time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
                    const isHigh = ev.impactLevel === 'HIGH';
                    const badgeClass = isHigh ? 'b-badge b-badge-red' : 'b-badge b-badge-blue';
                    const badgeLabel = isHigh ? 'ĐỎ · CAO' : 'CAM · VỪA';

                    // Badges for affected symbols
                    const symbolsBadges = ev.symbols.map(s => {
                        let colorStyle = 'background: rgba(37,99,235,0.12); color: var(--color-primary);';
                        if (s === 'MCL' || s === 'MCLZ26') colorStyle = 'background: rgba(245,158,11,0.15); color: #F59E0B;';
                        if (s === 'MGC') colorStyle = 'background: rgba(234,179,8,0.15); color: #EAB308;';
                        return `<span style="font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; ${colorStyle}">${s}</span>`;
                    }).join(' ');

                    html += `
                        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-card-inner); border: 1px solid var(--border-inner); border-radius: 8px; padding: 10px 14px; flex-wrap: wrap; gap: 8px;">
                            <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 250px;">
                                <div style="font-family: monospace; font-size: 13px; font-weight: 800; color: var(--text-primary); min-width: 55px;">
                                    ${timeVN}
                                </div>
                                <span class="${badgeClass}" style="font-size: 10px; padding: 3px 8px;">${badgeLabel}</span>
                                <div>
                                    <div style="font-size: 12.5px; font-weight: 700; color: var(--text-primary);">
                                        ${ev.vietnameseName || ev.name}
                                    </div>
                                    <div style="font-size: 11px; color: var(--text-muted); margin-top: 1px;">
                                        ${ev.name} · Giờ Mỹ: ${ev.etTime}
                                    </div>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="display: flex; gap: 4px;">
                                    ${symbolsBadges}
                                </div>
                            </div>
                        </div>
                    `;
                });

                html += `
                        </div>
                    </div>
                `;
            }

            container.innerHTML = html;
        },

        renderTradingViewWidget() {
            if (typeof document === 'undefined') return;
            const container = document.getElementById('tvCalendarWidgetContainer');
            if (!container) return;
            if (container.querySelector('script')) return;

            try {
                const widgetScript = document.createElement('script');
                widgetScript.type = 'text/javascript';
                widgetScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
                widgetScript.async = true;
                widgetScript.innerHTML = JSON.stringify({
                    colorTheme: document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark',
                    isTransparent: false,
                    width: '100%',
                    height: '600',
                    locale: 'vi_VN',
                    importanceFilter: '0,1',
                    countryFilter: 'us'
                });
                container.appendChild(widgetScript);
            } catch (err) {
                console.warn('[NewsRadar] TradingView widget embed skipped', err);
            }
        },

        // Triggered when user opens the Calendar View tab
        onCalendarViewOpen() {
            this.renderNotificationToggle();
            this.renderEventList();
            this.renderTradingViewWidget();
        },

        // Add custom event by user
        addCustomEvent(name, dateStr, timeStr, impactLevel, symbols) {
            try {
                const combined = new Date(`${dateStr}T${timeStr}:00`);
                if (isNaN(combined.getTime())) {
                    alert('Thời gian không hợp lệ.');
                    return;
                }
                const custom = JSON.parse(localStorage.getItem('topstep_custom_news_events') || '[]');
                custom.push({
                    id: 'custom_' + Date.now(),
                    name: name,
                    vietnameseName: name,
                    time: combined.toISOString(),
                    etTime: 'Custom',
                    impactLevel: impactLevel || 'HIGH',
                    symbols: symbols && symbols.length > 0 ? symbols : ['MGC', 'MNQ', 'MES', 'MCL'],
                    desc: 'Sự kiện do trader tự thêm.'
                });
                localStorage.setItem('topstep_custom_news_events', JSON.stringify(custom));
                this.refreshEvents();
                this.renderEventList();
                this.updateStatus();
                alert('Đã thêm sự kiện tin tức thành công!');
            } catch (err) {
                alert('Lỗi thêm sự kiện: ' + err.message);
            }
        }
    };

    // Global Exposure
    root.NewsRadar = NewsRadar;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = NewsRadar;
    }

    // Auto initialize when window loads
    if (typeof window !== 'undefined') {
        window.addEventListener('DOMContentLoaded', () => {
            NewsRadar.init();
        });
    }

})(typeof window !== 'undefined' ? window : globalThis);
