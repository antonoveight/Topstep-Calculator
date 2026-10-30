/**
 * Topstep Cockpit - Forex & Futures Market Hours Converter Widget
 * Visualizes 24-Hour Global Trading Sessions (Sydney, Tokyo, London, New York)
 * and 8 ICT Algorithmic Windows (Macros) with real-time needle, live clocks,
 * volume curve, session overlaps, timezone conversion, and Desktop Push Notifications.
 * Inspired by BabyPips Forex Market Hours Converter & ICT Algorithmic Trading.
 */
(function(root) {
    'use strict';

    // High quality vector SVG circular flags (works 100% on all OS without emoji font bugs)
    const SVG_FLAGS = {
        sydney: `<svg viewBox="0 0 32 32" width="26" height="26" style="border-radius: 50%; box-shadow: 0 1px 4px rgba(0,0,0,0.3); flex-shrink: 0;"><rect width="32" height="32" fill="#00247D"/><path d="M0,0 L16,10 M16,0 L0,10" stroke="#FFFFFF" stroke-width="2"/><path d="M0,0 L16,10 M16,0 L0,10" stroke="#CC142B" stroke-width="1"/><path d="M8,0 V10 M0,5 H16" stroke="#FFFFFF" stroke-width="3"/><path d="M8,0 V10 M0,5 H16" stroke="#CC142B" stroke-width="1.8"/><circle cx="8" cy="22" r="2.5" fill="#FFFFFF"/><circle cx="24" cy="8" r="1.5" fill="#FFFFFF"/><circle cx="26" cy="14" r="1.2" fill="#FFFFFF"/><circle cx="24" cy="22" r="1.5" fill="#FFFFFF"/><circle cx="20" cy="18" r="1.2" fill="#FFFFFF"/><circle cx="22" cy="25" r="1" fill="#FFFFFF"/></svg>`,
        tokyo: `<svg viewBox="0 0 32 32" width="26" height="26" style="border-radius: 50%; box-shadow: 0 1px 4px rgba(0,0,0,0.3); flex-shrink: 0;"><rect width="32" height="32" fill="#FFFFFF"/><circle cx="16" cy="16" r="9" fill="#BC002D"/></svg>`,
        london: `<svg viewBox="0 0 32 32" width="26" height="26" style="border-radius: 50%; box-shadow: 0 1px 4px rgba(0,0,0,0.3); flex-shrink: 0;"><rect width="32" height="32" fill="#012169"/><path d="M0,0 L32,32 M32,0 L0,32" stroke="#FFFFFF" stroke-width="4"/><path d="M0,0 L32,32 M32,0 L0,32" stroke="#C8102E" stroke-width="2.2"/><path d="M16,0 V32 M0,16 H32" stroke="#FFFFFF" stroke-width="6"/><path d="M16,0 V32 M0,16 H32" stroke="#C8102E" stroke-width="3.6"/></svg>`,
        newyork: `<svg viewBox="0 0 32 32" width="26" height="26" style="border-radius: 50%; box-shadow: 0 1px 4px rgba(0,0,0,0.3); flex-shrink: 0;"><defs><clipPath id="usRound"><circle cx="16" cy="16" r="16"/></clipPath></defs><g clip-path="url(#usRound)"><rect width="32" height="32" fill="#B22234"/><path d="M0,4.5 H32 M0,9.5 H32 M0,14.5 H32 M0,19.5 H32 M0,24.5 H32 M0,29.5 H32" stroke="#FFFFFF" stroke-width="2.5"/><rect width="14" height="15" fill="#3C3B6E"/><circle cx="4" cy="4" r="1" fill="#FFFFFF"/><circle cx="10" cy="4" r="1" fill="#FFFFFF"/><circle cx="7" cy="7.5" r="1" fill="#FFFFFF"/><circle cx="4" cy="11" r="1" fill="#FFFFFF"/><circle cx="10" cy="11" r="1" fill="#FFFFFF"/></g></svg>`
    };

    // Four Core Forex / Global Sessions defined by local time
    const SESSIONS = [
        {
            id: 'sydney',
            name: 'Sydney',
            country: 'Australia',
            timeZone: 'Australia/Sydney',
            startLocalHour: 7,
            startLocalMin: 0,
            endLocalHour: 16,
            endLocalMin: 0,
            color: '#2563EB',      // Blue
            bgLight: 'rgba(37, 99, 235, 0.18)',
            borderActive: '#3B82F6',
            description: 'Phiên Úc - Mở đầu ngày giao dịch Thái Bình Dương'
        },
        {
            id: 'tokyo',
            name: 'Tokyo',
            country: 'Japan',
            timeZone: 'Asia/Tokyo',
            startLocalHour: 9,
            startLocalMin: 0,
            endLocalHour: 18,
            endLocalMin: 0,
            color: '#9333EA',      // Purple
            bgLight: 'rgba(147, 51, 234, 0.18)',
            borderActive: '#A855F7',
            description: 'Phiên Á - Biên độ ổn định, tích lũy tạo biên Asian High / Low'
        },
        {
            id: 'london',
            name: 'London',
            country: 'United Kingdom',
            timeZone: 'Europe/London',
            startLocalHour: 8,
            startLocalMin: 0,
            endLocalHour: 17,
            endLocalMin: 0,
            color: '#0284C7',      // Sky Blue
            bgLight: 'rgba(2, 132, 199, 0.18)',
            borderActive: '#38BDF8',
            description: 'Phiên Âu - Khối lượng lớn, phát động xu hướng & quét râu CRT'
        },
        {
            id: 'newyork',
            name: 'New York',
            country: 'United States',
            timeZone: 'America/New_York',
            startLocalHour: 8,
            startLocalMin: 0,
            endLocalHour: 17,
            endLocalMin: 0,
            color: '#16A34A',      // Green
            bgLight: 'rgba(22, 163, 74, 0.18)',
            borderActive: '#22C55E',
            description: 'Phiên Mỹ - Trọng tâm Topstep Futures (MNQ, MES, MGC, MCL)'
        }
    ];

    // 8 ICT Algorithmic Windows (Macros) defined in New York local time (America/New_York)
    const ICT_MACROS = [
        {
            id: 'london_1',
            code: 'LM1',
            name: 'London Macro 1',
            nameVn: 'London Macro',
            startHour: 2,
            startMin: 33,
            endHour: 3,
            endMin: 0,
            nyStartStr: '02:33 AM',
            nyEndStr: '03:00 sáng',
            tip: 'ICT London Open Macro (02:33 - 03:00 NY) - Săn thanh khoản đỉnh/đáy phiên Á, phát động sóng Judast Swing / C2 Manipulation.'
        },
        {
            id: 'london_2',
            code: 'LM2',
            name: 'London Macro 2',
            nameVn: 'London Macro 2',
            startHour: 4,
            startMin: 3,
            endHour: 4,
            endMin: 30,
            nyStartStr: '04:03 sáng',
            nyEndStr: '04:30 sáng',
            tip: 'ICT London Continuation Macro (04:03 - 04:30 NY) - Xác nhận tiếp diễn xu hướng London hoặc thiết lập High/Low of the Day.'
        },
        {
            id: 'ny_am_1',
            code: 'AM1',
            name: 'NY AM Macro 1',
            nameVn: 'NY AM Macro',
            startHour: 8,
            startMin: 50,
            endHour: 9,
            endMin: 10,
            nyStartStr: '08:50 sáng',
            nyEndStr: '09:10 sáng',
            tip: 'ICT Pre-Market Macro (08:50 - 09:10 NY) - Tái cân bằng trước giờ mở cửa chứng khoán Mỹ 09:30, hút về Fair Value Gap (FVG).'
        },
        {
            id: 'ny_am_2',
            code: 'AM2',
            name: 'NY Macro AM 2 (Silver Bullet)',
            nameVn: 'NY Macro AM 2',
            startHour: 9,
            startMin: 50,
            endHour: 10,
            endMin: 10,
            nyStartStr: '09:50 sáng',
            nyEndStr: '10:10 sáng',
            tip: 'ICT AM Silver Bullet Window (09:50 - 10:10 NY) - Cửa sổ thuật toán vào lệnh chuẩn mực xác suất cao nhất phiên sáng New York.'
        },
        {
            id: 'ny_am_3',
            code: 'AM3',
            name: 'NY AM Macro 3',
            nameVn: 'NY AM Macro 3',
            startHour: 10,
            startMin: 50,
            endHour: 11,
            endMin: 10,
            nyStartStr: '10:50 sáng',
            nyEndStr: '11:10 sáng',
            tip: 'ICT Morning Completion (10:50 - 11:10 NY) - Quét thanh khoản đỉnh/đáy buổi sáng trước thềm bữa trưa phố Wall.'
        },
        {
            id: 'ny_lunch',
            code: 'LNC',
            name: 'NY Lunch Macro',
            nameVn: 'Macro bữa trưa NY',
            startHour: 11,
            startMin: 50,
            endHour: 12,
            endMin: 10,
            nyStartStr: '11:50 sáng',
            nyEndStr: '12:10 trưa',
            tip: 'ICT Lunch Hour Macro (11:50 - 12:10 NY) - Giai đoạn nghỉ trưa thanh khoản mỏng, hay tạo bẫy consolidation đi ngang.'
        },
        {
            id: 'ny_pm',
            code: 'PM',
            name: 'NY PM Macro (Silver Bullet PM)',
            nameVn: 'NY PM Macro',
            startHour: 13,
            startMin: 10,
            endHour: 13,
            endMin: 40,
            nyStartStr: '13:10 chiều',
            nyEndStr: '01:40 chiều',
            tip: 'ICT PM Silver Bullet Window (13:10 - 13:40 NY) - Săn quét thanh khoản và tiếp diễn xu hướng buổi chiều New York.'
        },
        {
            id: 'ny_close',
            code: 'CLS',
            name: 'NY Closing Macro',
            nameVn: 'Macro giờ cuối NY',
            startHour: 15,
            startMin: 15,
            endHour: 15,
            endMin: 45,
            nyStartStr: '03:15 chiều',
            nyEndStr: '03:45 CH',
            tip: 'ICT Cash Close Macro (15:15 - 15:45 NY) - Đóng vị thế cuối ngày của các quỹ và ngân hàng trước 16:00 Equities Close.'
        }
    ];

    // Helper: get accurate UTC offset in minutes for any timezone on any specific date
    function getTimezoneOffsetMinutes(timeZone, date = new Date()) {
        try {
            const fmt = new Intl.DateTimeFormat('en-US', {
                timeZone,
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hourCycle: 'h23'
            });
            const parts = fmt.formatToParts(date);
            const p = {};
            parts.forEach(part => { p[part.type] = parseInt(part.value, 10); });
            const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
            return Math.round((asUtc - date.getTime()) / 60000);
        } catch (e) {
            return 0;
        }
    }

    // Helper: get short timezone name e.g. "EDT", "EST", "JST", "AEDT", "GMT"
    function getTimezoneAbbr(timeZone, date = new Date()) {
        try {
            const fmt = new Intl.DateTimeFormat('en-US', {
                timeZone,
                timeZoneName: 'short'
            });
            const parts = fmt.formatToParts(date);
            const part = parts.find(p => p.type === 'timeZoneName');
            return part ? part.value : '';
        } catch (e) {
            return '';
        }
    }

    // Sound alert generator using Web Audio API
    function playAlertChime(type = 'caution') {
        try {
            if (typeof window === 'undefined') return;
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
            console.warn('[MarketHours] Audio chime not allowed or supported', err);
        }
    }

    // Main MarketHours Controller
    const MarketHours = {
        selectedTimezone: 'Asia/Bangkok',
        is24Hour: true,
        isLive: true,
        showIctMacros: true,
        ictTableOpen: true,
        pushEnabled: false,
        soundEnabled: true,
        notifiedKeys: new Set(),
        scrubMinuteOfDay: 0, // 0 - 1439
        timerId: null,
        isDragging: false,

        init() {
            if (typeof localStorage !== 'undefined') {
                const savedTz = localStorage.getItem('topstep_market_hours_tz');
                if (savedTz) this.selectedTimezone = savedTz;
                const saved24 = localStorage.getItem('topstep_market_hours_24h');
                if (saved24 !== null) this.is24Hour = saved24 === 'true';
                const savedIct = localStorage.getItem('topstep_market_hours_ict');
                if (savedIct !== null) this.showIctMacros = savedIct === 'true';
                const savedTable = localStorage.getItem('topstep_market_hours_ict_tbl');
                if (savedTable !== null) this.ictTableOpen = savedTable === 'true';
                this.pushEnabled = localStorage.getItem('topstep_market_hours_push_enabled') === 'true';
                this.soundEnabled = localStorage.getItem('topstep_market_hours_sound_enabled') !== 'false';
            }

            this.syncLiveTime();
            this.render();

            if (this.timerId) clearInterval(this.timerId);
            this.timerId = setInterval(() => {
                if (this.isLive) {
                    this.syncLiveTime();
                    this.renderNeedleAndClocks();
                    this.checkMacroNotifications();
                }
            }, 1000);

            this.bindEvents();
            this.renderNotificationToggle();
        },

        syncLiveTime() {
            const now = new Date();
            const tzParts = this.getTimeParts(now, this.selectedTimezone);
            this.scrubMinuteOfDay = tzParts.hour * 60 + tzParts.minute + tzParts.second / 60;
        },

        getTimeParts(date, timeZone) {
            try {
                const fmt = new Intl.DateTimeFormat('en-US', {
                    timeZone,
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    hourCycle: 'h23'
                });
                const parts = {};
                fmt.formatToParts(date).forEach(p => { parts[p.type] = p.value; });
                return {
                    hour: parseInt(parts.hour, 10),
                    minute: parseInt(parts.minute, 10),
                    second: parseInt(parts.second, 10),
                    weekday: parts.weekday,
                    day: parts.day,
                    month: parts.month
                };
            } catch (e) {
                return { hour: date.getHours(), minute: date.getMinutes(), second: date.getSeconds(), weekday: 'Fri', day: '30', month: 'Oct' };
            }
        },

        // Request Push Notification Permission
        async requestPushPermission() {
            if (typeof window === 'undefined' || !('Notification' in window)) {
                alert('Trình duyệt của bạn không hỗ trợ Web Notification.');
                return false;
            }
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    this.pushEnabled = true;
                    try { localStorage.setItem('topstep_market_hours_push_enabled', 'true'); } catch (err) {}
                    this.renderNotificationToggle();
                    
                    new Notification('⚡ Cảnh Báo ICT Macros Đã Kích Hoạt!', {
                        body: 'Bạn sẽ nhận thông báo đẩy trước 5 phút và khi mở cửa mỗi khung giờ ICT Macro (Silver Bullet AM/PM, London, New York).',
                        icon: 'phamngocanhthong-topstep.png'
                    });
                    if (this.soundEnabled) playAlertChime('caution');
                    return true;
                } else if (permission === 'denied') {
                    alert('Bạn đã chặn thông báo đẩy. Vui lòng bấm vào icon ổ khóa trên thanh địa chỉ URL để cho phép lại.');
                    this.pushEnabled = false;
                    try { localStorage.setItem('topstep_market_hours_push_enabled', 'false'); } catch (err) {}
                    this.renderNotificationToggle();
                    return false;
                }
            } catch (err) {
                console.error('[MarketHours] Push permission request failed', err);
            }
            return false;
        },

        togglePushNotifications(event) {
            if (event && event.stopPropagation) event.stopPropagation();
            if (this.pushEnabled) {
                this.pushEnabled = false;
                try { localStorage.setItem('topstep_market_hours_push_enabled', 'false'); } catch (err) {}
                this.renderNotificationToggle();
            } else {
                this.requestPushPermission();
            }
        },

        toggleSoundAlerts(event) {
            if (event && event.stopPropagation) event.stopPropagation();
            this.soundEnabled = !this.soundEnabled;
            try { localStorage.setItem('topstep_market_hours_sound_enabled', String(this.soundEnabled)); } catch (err) {}
            this.renderNotificationToggle();
            if (this.soundEnabled) playAlertChime('caution');
        },

        testNotification(event) {
            if (event && event.stopPropagation) event.stopPropagation();
            if (this.pushEnabled && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                new Notification('🧪 Kiểm Tra Cảnh Báo ICT Macro (Demo)', {
                    body: '⚡ Cửa sổ thuật toán ICT Silver Bullet AM (09:50 - 10:10 NY / 20:50 - 21:10 VN) đang kích hoạt! Săn thanh khoản và vào lệnh chuẩn FVG.',
                    icon: 'phamngocanhthong-topstep.png'
                });
            } else {
                alert('Vui lòng cấp quyền thông báo trước để nhận thử nghiệm thông báo đẩy ICT Macros.');
                this.requestPushPermission();
            }
            if (this.soundEnabled) playAlertChime('danger');
        },

        renderNotificationToggle() {
            const notifBtn = document.getElementById('marketHoursBtnToggleNotif');
            if (notifBtn) {
                notifBtn.className = this.pushEnabled ? 'b-btn-primary' : 'b-btn-secondary';
                notifBtn.innerHTML = this.pushEnabled ? '✅ Thông Báo ICT: BẬT' : '🔔 Bật Thông Báo ICT';
            }
            const soundBtn = document.getElementById('marketHoursBtnToggleSound');
            if (soundBtn) {
                soundBtn.className = this.soundEnabled ? 'b-btn-primary' : 'b-btn-secondary';
                soundBtn.innerHTML = this.soundEnabled ? '🔊 Chuông: BẬT' : '🔇 Chuông: TẮT';
            }
        },

        // Trigger Real Desktop Push Notification
        firePushNotification(macro, minutesBefore) {
            if (!this.pushEnabled || typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return;

            const icon = 'phamngocanhthong-topstep.png';
            const now = new Date();
            const { startMin, endMin } = this.calculateMacroIntervalsInTarget(macro, now);
            const targetTimeStr = `${this.formatMinute(startMin)} – ${this.formatMinute(endMin)}`;

            if (minutesBefore === 5) {
                new Notification(`⏳ SẮP VÀO ICT MACRO (Sau 5 phút): ${macro.nameVn} [${macro.code}]`, {
                    body: `Khung giờ: ${targetTimeStr} (${macro.nyStartStr} - ${macro.nyEndStr} NY). ${macro.tip}`,
                    icon
                });
                if (this.soundEnabled) playAlertChime('caution');
            } else if (minutesBefore === 0) {
                new Notification(`🔥 ICT MACRO ĐANG MỞ CỬA: ${macro.nameVn} [${macro.code}]`, {
                    body: `Cửa sổ thuật toán (${targetTimeStr}) đang kích hoạt! Săn quét thanh khoản & chuẩn bị setup FVG.`,
                    icon
                });
                if (this.soundEnabled) playAlertChime('danger');
            }
        },

        // Evaluate and trigger push notifications for macros every second
        checkMacroNotifications(now = new Date()) {
            if (!this.pushEnabled) return;

            const nowParts = this.getTimeParts(now, this.selectedTimezone);
            const currentMin = nowParts.hour * 60 + nowParts.minute + nowParts.second / 60;
            const dateStr = now.toDateString();

            ICT_MACROS.forEach(macro => {
                const { startMin } = this.calculateMacroIntervalsInTarget(macro, now);
                let diff = startMin - currentMin;
                if (diff < -720) diff += 1440;
                if (diff > 720) diff -= 1440;

                // 5-Minute Warning: diff between 4 and 5 minutes
                if (diff > 4.0 && diff <= 5.05) {
                    const key = `notif_macro_5m_${macro.id}_${dateStr}`;
                    if (!this.notifiedKeys.has(key)) {
                        this.notifiedKeys.add(key);
                        this.firePushNotification(macro, 5);
                    }
                }

                // Open Warning (0 minute / Active now!)
                if (currentMin >= startMin && currentMin < startMin + 1.0) {
                    const key = `notif_macro_open_${macro.id}_${dateStr}`;
                    if (!this.notifiedKeys.has(key)) {
                        this.notifiedKeys.add(key);
                        this.firePushNotification(macro, 0);
                    }
                }
            });
        },

        // Convert a session's local start/end times into minutes (0 to 1439) in the selected target timezone
        calculateSessionIntervalsInTarget(session, refDate = new Date()) {
            const sessionOffset = getTimezoneOffsetMinutes(session.timeZone, refDate);
            const targetOffset = getTimezoneOffsetMinutes(this.selectedTimezone, refDate);
            const diffMinutes = targetOffset - sessionOffset;

            const startLocalMin = session.startLocalHour * 60 + session.startLocalMin;
            const endLocalMin = session.endLocalHour * 60 + session.endLocalMin;

            // Shift into target timezone
            let startInTarget = (startLocalMin + diffMinutes) % 1440;
            if (startInTarget < 0) startInTarget += 1440;

            let endInTarget = (endLocalMin + diffMinutes) % 1440;
            if (endInTarget < 0) endInTarget += 1440;

            const intervals = [];
            if (startInTarget < endInTarget) {
                intervals.push({ start: startInTarget, end: endInTarget });
            } else {
                // Wraps across midnight
                intervals.push({ start: startInTarget, end: 1440 });
                intervals.push({ start: 0, end: endInTarget });
            }

            return {
                startMin: startInTarget,
                endMin: endInTarget,
                durationMin: (endLocalMin - startLocalMin + 1440) % 1440 || (9 * 60),
                intervals
            };
        },

        // Convert an ICT Macro's NY local times into target timezone minutes (0 to 1439)
        calculateMacroIntervalsInTarget(macro, refDate = new Date()) {
            const nyOffset = getTimezoneOffsetMinutes('America/New_York', refDate);
            const targetOffset = getTimezoneOffsetMinutes(this.selectedTimezone, refDate);
            const diffMinutes = targetOffset - nyOffset;

            const startLocalMin = macro.startHour * 60 + macro.startMin;
            const endLocalMin = macro.endHour * 60 + macro.endMin;

            let startInTarget = (startLocalMin + diffMinutes) % 1440;
            if (startInTarget < 0) startInTarget += 1440;

            let endInTarget = (endLocalMin + diffMinutes) % 1440;
            if (endInTarget < 0) endInTarget += 1440;

            const intervals = [];
            if (startInTarget < endInTarget) {
                intervals.push({ start: startInTarget, end: endInTarget });
            } else {
                // Wraps across midnight
                intervals.push({ start: startInTarget, end: 1440 });
                intervals.push({ start: 0, end: endInTarget });
            }

            return {
                startMin: startInTarget,
                endMin: endInTarget,
                durationMin: (endLocalMin - startLocalMin + 1440) % 1440,
                intervals
            };
        },

        // Check if session is open at a given minute of the day
        isSessionOpenAt(session, minuteOfDay, refDate = new Date()) {
            const { intervals } = this.calculateSessionIntervalsInTarget(session, refDate);
            return intervals.some(inv => minuteOfDay >= inv.start && minuteOfDay < inv.end);
        },

        // Check if ICT Macro is active at a given minute of the day
        isMacroActiveAt(macro, minuteOfDay, refDate = new Date()) {
            const { intervals } = this.calculateMacroIntervalsInTarget(macro, refDate);
            return intervals.some(inv => minuteOfDay >= inv.start && minuteOfDay < inv.end);
        },

        // Calculate trading volume & liquidity score (0 to 100) at a given minute of day in target timezone
        getVolumeContextAt(minuteOfDay, refDate = new Date()) {
            let activeSessions = 0;
            const openMap = {};

            SESSIONS.forEach(s => {
                const isOpen = this.isSessionOpenAt(s, minuteOfDay, refDate);
                openMap[s.id] = isOpen;
                if (isOpen) activeSessions++;
            });

            // Specific Overlap logic
            const isLondonNyOverlap = openMap['london'] && openMap['newyork'];
            const isTokyoLondonOverlap = openMap['tokyo'] && openMap['london'];

            let level = 'LOW';
            let label = 'Thấp (Low)';
            let score = 25;
            let badgeClass = 'b-badge b-badge-dim';
            let desc = 'Thị trường thanh khoản thấp, biên độ thu hẹp. Nên kiên nhẫn quan sát.';

            if (isLondonNyOverlap) {
                level = 'HIGH';
                label = 'Cao Điểm (Peak Volume)';
                score = 95;
                badgeClass = 'b-badge b-badge-green';
                desc = '🔥 Giai đoạn TRÙNG PHIÊN LONDON & NEW YORK! Khối lượng lớn nhất trong ngày. Biến động cực mạnh trên MGC, MNQ, MES, MCL.';
            } else if (openMap['newyork']) {
                level = 'HIGH';
                label = 'Cao (High)';
                score = 80;
                badgeClass = 'b-badge b-badge-green';
                desc = '⚡ Phiên Mỹ (New York) đang mở cửa. Dòng tiền phố Wall hoạt động sôi nổi.';
            } else if (isTokyoLondonOverlap) {
                level = 'HIGH';
                label = 'Khá Cao (High)';
                score = 75;
                badgeClass = 'b-badge b-badge-green';
                desc = '⚡ Giao thoa cuối phiên Á & đầu phiên London. Thường xuất hiện cú quét râu Manipulation (C2).';
            } else if (openMap['london']) {
                level = 'HIGH';
                label = 'Cao (High)';
                score = 70;
                badgeClass = 'b-badge b-badge-green';
                desc = '🚀 Phiên London đang mở cửa. Bắt đầu phiên Âu thanh khoản dồi dào.';
            } else if (openMap['tokyo']) {
                level = 'MEDIUM';
                label = 'Trung Bình (Medium)';
                score = 45;
                badgeClass = 'b-badge b-badge-blue';
                desc = 'Phiên Tokyo (Châu Á) hoạt động. Thích hợp quan sát tạo biên Asian High / Low.';
            } else if (openMap['sydney']) {
                level = 'LOW';
                label = 'Thấp (Low)';
                score = 30;
                badgeClass = 'b-badge b-badge-dim';
                desc = 'Phiên Sydney đầu ngày. Khối lượng mỏng, spread có thể giãn nhẹ.';
            }

            return {
                level,
                label,
                score,
                badgeClass,
                desc,
                activeSessions,
                openMap
            };
        },

        // Format minute to HH:MM (24h or 12h)
        formatMinute(min, force24 = false) {
            const h24 = Math.floor(min / 60) % 24;
            const m = Math.floor(min % 60);
            const mStr = String(m).padStart(2, '0');

            if (force24 || this.is24Hour) {
                return `${String(h24).padStart(2, '0')}:${mStr}`;
            }

            const h12 = h24 % 12 || 12;
            const ampm = h24 < 12 ? 'AM' : 'PM';
            return `${h12}:${mStr} ${ampm}`;
        },

        // Event Listeners
        bindEvents() {
            const tzSelect = document.getElementById('marketHoursTzSelect');
            if (tzSelect) {
                tzSelect.value = this.selectedTimezone;
                tzSelect.onchange = (e) => {
                    this.selectedTimezone = e.target.value;
                    try { localStorage.setItem('topstep_market_hours_tz', this.selectedTimezone); } catch (err) {}
                    this.syncLiveTime();
                    this.render();
                };
            }

            const toggle24 = document.getElementById('marketHours24Toggle');
            if (toggle24) {
                toggle24.checked = this.is24Hour;
                toggle24.onchange = (e) => {
                    this.is24Hour = e.target.checked;
                    try { localStorage.setItem('topstep_market_hours_24h', String(this.is24Hour)); } catch (err) {}
                    this.render();
                };
            }

            // ICT Macros Toggle switch
            const toggleIct = document.getElementById('marketHoursIctToggle');
            if (toggleIct) {
                toggleIct.checked = this.showIctMacros;
                toggleIct.onchange = (e) => {
                    this.showIctMacros = e.target.checked;
                    try { localStorage.setItem('topstep_market_hours_ict', String(this.showIctMacros)); } catch (err) {}
                    this.render();
                };
            }

            // Timeline Scrubbing on the exact track area
            const trackArea = document.getElementById('marketHoursInteractiveTrack');
            if (trackArea) {
                const handleScrub = (clientX) => {
                    const rect = trackArea.getBoundingClientRect();
                    if (rect.width <= 0) return;
                    let ratio = (clientX - rect.left) / rect.width;
                    ratio = Math.max(0, Math.min(1, ratio));
                    this.scrubMinuteOfDay = ratio * 1440;
                    this.isLive = false;
                    this.renderNeedleAndClocks();
                };

                trackArea.onmousedown = (e) => {
                    this.isDragging = true;
                    handleScrub(e.clientX);
                };

                window.addEventListener('mousemove', (e) => {
                    if (this.isDragging) handleScrub(e.clientX);
                });

                window.addEventListener('mouseup', () => {
                    this.isDragging = false;
                });

                // Touch support
                trackArea.ontouchstart = (e) => {
                    if (e.touches && e.touches[0]) {
                        this.isDragging = true;
                        handleScrub(e.touches[0].clientX);
                    }
                };

                trackArea.ontouchmove = (e) => {
                    if (this.isDragging && e.touches && e.touches[0]) {
                        handleScrub(e.touches[0].clientX);
                    }
                };

                trackArea.ontouchend = () => {
                    this.isDragging = false;
                };
            }

            const resetBtn = document.getElementById('marketHoursResetLiveBtn');
            if (resetBtn) {
                resetBtn.onclick = () => {
                    this.isLive = true;
                    this.syncLiveTime();
                    this.renderNeedleAndClocks();
                };
            }
        },

        // Toggle ICT Detail Table Collapsible
        toggleIctTable() {
            this.ictTableOpen = !this.ictTableOpen;
            try { localStorage.setItem('topstep_market_hours_ict_tbl', String(this.ictTableOpen)); } catch (err) {}
            const tblContainer = document.getElementById('marketHoursIctTableContainer');
            const toggleArrow = document.getElementById('ictTableToggleArrow');
            if (tblContainer) {
                tblContainer.style.display = this.ictTableOpen ? 'block' : 'none';
            }
            if (toggleArrow) {
                toggleArrow.innerText = this.ictTableOpen ? '▲ Thu gọn' : '▼ Mở rộng chi tiết';
            }
        },

        // Main Render Function
        render() {
            this.renderHeader();
            this.renderTimelineHeader();
            this.renderSessionRows();
            this.renderVolumeChart();
            this.renderIctDetailTable();
            this.renderNeedleAndClocks();
            this.renderNotificationToggle();
        },

        renderHeader() {
            const toggle = document.getElementById('marketHours24Toggle');
            if (toggle) toggle.checked = this.is24Hour;
            const toggleIct = document.getElementById('marketHoursIctToggle');
            if (toggleIct) toggleIct.checked = this.showIctMacros;
            const select = document.getElementById('marketHoursTzSelect');
            if (select) select.value = this.selectedTimezone;
        },

        // Render 1 to 24 timeline with Sun & Moon icons
        renderTimelineHeader() {
            const container = document.getElementById('marketHoursTimelineScale');
            if (!container) return;

            let html = `
                <div style="position: relative; width: 100%; height: 38px; display: flex; align-items: flex-end; user-select: none;">
                    <!-- Sun & Moon Icons -->
                    <div style="position: absolute; left: ${(6 / 24) * 100}%; top: 0; transform: translateX(-50%); font-size: 13px;" title="Bình minh / Ban ngày (06:00)">☀️</div>
                    <div style="position: absolute; left: ${(17.5 / 24) * 100}%; top: 0; transform: translateX(-50%); font-size: 13px;" title="Hoàng hôn / Ban đêm (17:30)">💤</div>
                    <div style="position: absolute; left: ${(23.5 / 24) * 100}%; top: 0; transform: translateX(-50%); font-size: 13px;" title="Đêm khuya (24:00)">🌙</div>

                    <!-- Hour Ticks & Numbers (1 to 24) -->
                    <div style="width: 100%; display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: var(--text-muted); font-family: monospace; padding: 0;">
                        <span style="opacity: 0.5;">•</span>
            `;

            for (let h = 1; h <= 24; h++) {
                const displayH = this.is24Hour ? h : (h % 12 || 12);
                html += `<span style="flex: 1; text-align: center;">${displayH}</span>`;
            }

            html += `
                    </div>
                </div>
            `;
            container.innerHTML = html;
        },

        // Render Session Rows (Sydney, Tokyo, London, New York) + ICT Macros Lane
        // ZERO TEXT OVERLAP ARCHITECTURE:
        // - All status badges live in the left column next to city names.
        // - Timeline tracks contain ONLY pure, uncluttered colored bars and pills.
        renderSessionRows() {
            const leftCol = document.getElementById('marketHoursSessionLeftCol');
            const rightLanes = document.getElementById('marketHoursSessionLanes');
            if (!leftCol || !rightLanes) return;

            const now = new Date();
            let leftHtml = '';
            let rightHtml = '';

            // 1. Render 4 Core Sessions
            SESSIONS.forEach(session => {
                const { intervals } = this.calculateSessionIntervalsInTarget(session, now);
                const localDate = new Date();
                const localParts = this.getTimeParts(localDate, session.timeZone);
                const abbr = getTimezoneAbbr(session.timeZone, localDate);
                const localTimeStr = this.formatMinute(localParts.hour * 60 + localParts.minute);
                const flagSvg = SVG_FLAGS[session.id] || '🌐';

                // Left Info Column: Name, Live Clock, Timezone & Dedicated Theme-Adaptive Status Badge
                leftHtml += `
                    <div style="display: flex; align-items: center; gap: 10px; height: 50px; padding-right: 14px; border-bottom: 1px solid var(--border-inner);">
                        ${flagSvg}
                        <div style="flex: 1; min-width: 0;">
                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px;">
                                <span style="font-size: 12.5px; font-weight: 800; color: var(--text-primary); line-height: 1.2;">${session.name}</span>
                                <span id="sessionStatusBadgeLeft-${session.id}" class="b-badge b-badge-dim" style="font-size: 8.5px; padding: 1px 5px;">○ CLOSED</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                                <span class="session-local-time-${session.id} tabular-nums" style="font-size: 11px; font-weight: 700; color: var(--color-primary);">${localTimeStr}</span>
                                <span style="font-size: 9px; color: var(--text-muted);">${abbr}</span>
                            </div>
                        </div>
                    </div>
                `;

                // Right Track Lane: Pure unobstructed session bars (Zero text badges inside track!)
                let barsHtml = '';
                intervals.forEach((inv) => {
                    const leftPct = (inv.start / 1440) * 100;
                    const widthPct = ((inv.end - inv.start) / 1440) * 100;
                    barsHtml += `
                        <div class="session-bar-${session.id}" style="position: absolute; left: ${leftPct.toFixed(3)}%; width: ${widthPct.toFixed(3)}%; top: 9px; height: 32px; background: ${session.color}; border-radius: 6px; box-shadow: 0 2px 8px ${session.bgLight}; transition: transform 0.15s ease;" title="${session.name} Session (${this.formatMinute(inv.start)} - ${this.formatMinute(inv.end)})"></div>
                    `;
                });

                rightHtml += `
                    <div style="position: relative; height: 50px; background: rgba(0,0,0,0.02); border-radius: 6px; border: 1px dashed var(--border-inner); margin-bottom: 0; overflow: hidden;" data-session-id="${session.id}">
                        ${barsHtml}
                    </div>
                `;
            });

            // 2. Render 5th Lane: ICT Macros (Pure Pills, Zero Overlapping Text)
            if (this.showIctMacros) {
                // Left Column ICT Summary Block
                leftHtml += `
                    <div id="marketHoursIctLeftCard" style="display: flex; align-items: center; gap: 9px; height: 50px; padding-right: 14px; border-bottom: 1px solid var(--border-inner); background: rgba(245, 158, 11, 0.06); border-left: 3px solid #D97706; padding-left: 6px; border-radius: 4px; margin-top: 2px;">
                        <div style="width: 24px; height: 24px; border-radius: 50%; background: #D97706; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #FFFFFF; font-weight: 900; box-shadow: 0 0 6px rgba(217, 119, 6, 0.4); flex-shrink: 0;">⚡</div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px;">
                                <span style="font-size: 12px; font-weight: 800; color: #D97706; line-height: 1.1;">ICT Macros</span>
                                <span id="marketHoursIctLeftBadge" class="b-badge b-badge-dim" style="font-size: 8.5px; padding: 1px 5px;">8 Cửa Sổ</span>
                            </div>
                            <div id="marketHoursIctLeftSummary" class="tabular-nums" style="font-size: 9.5px; font-weight: 700; color: var(--text-muted); white-space: nowrap; text-overflow: ellipsis; overflow: hidden; margin-top: 2px;">
                                8 Khung Thuật Toán
                            </div>
                        </div>
                    </div>
                `;

                // Right Track Lane: Pure Macro Pills ONLY (Immune to timezone shifts!)
                let macroPillsHtml = '';

                ICT_MACROS.forEach(macro => {
                    const { intervals, startMin, endMin } = this.calculateMacroIntervalsInTarget(macro, now);
                    const targetTimeRangeStr = `${this.formatMinute(startMin)} – ${this.formatMinute(endMin)}`;
                    const nyTimeStr = `${macro.nyStartStr} – ${macro.nyEndStr} NY`;

                    intervals.forEach(inv => {
                        const leftPct = (inv.start / 1440) * 100;
                        const widthPct = Math.max(1.2, ((inv.end - inv.start) / 1440) * 100);

                        macroPillsHtml += `
                            <div class="ict-macro-pill ict-macro-${macro.id}"
                                 data-macro-id="${macro.id}"
                                 data-macro-name="${macro.nameVn}"
                                 data-target-time="${targetTimeRangeStr}"
                                 data-ny-time="${nyTimeStr}"
                                 style="position: absolute; left: ${leftPct.toFixed(3)}%; width: ${widthPct.toFixed(3)}%; top: 10px; height: 30px; background: linear-gradient(180deg, #F59E0B 0%, #D97706 100%); border-radius: 4px; border: 1px solid #B45309; box-shadow: 0 1px 4px rgba(217, 119, 6, 0.4); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s ease; z-index: 15; min-width: 14px;"
                                 title="⚡ ${macro.nameVn} (${macro.code})\n🕒 Giờ quy đổi: ${targetTimeRangeStr}\n🇺🇸 Giờ New York: ${nyTimeStr}\n💡 ${macro.tip}">
                                <span style="font-size: 8.5px; font-weight: 900; color: #FFFFFF; text-shadow: 0 1px 2px rgba(0,0,0,0.8); pointer-events: none; line-height: 1;">${macro.code}</span>
                            </div>
                        `;
                    });
                });

                rightHtml += `
                    <div id="marketHoursIctTrackLane" style="position: relative; height: 50px; background: rgba(245, 158, 11, 0.04); border-radius: 6px; border: 1px dashed rgba(245, 158, 11, 0.35); margin-top: 2px; overflow: hidden;">
                        ${macroPillsHtml}
                    </div>
                `;
            }

            leftCol.innerHTML = leftHtml;
            rightLanes.innerHTML = rightHtml;
        },

        // Render Trading Volume Wave Chart (Simplified, high-contrast, theme-adaptive)
        renderVolumeChart() {
            const svgContainer = document.getElementById('marketHoursVolumeSvgContainer');
            if (!svgContainer) return;

            const w = 1000;
            const h = 76;
            const points = [];
            const colorStops = [];
            const areaStops = [];

            // 25 sample points (0 to 24 hours)
            for (let i = 0; i <= 24; i++) {
                const minute = (i % 24) * 60;
                const v = this.getVolumeContextAt(minute, new Date());
                const x = (i / 24) * w;
                const pct = ((i / 24) * 100).toFixed(1);

                // Clean height mapping:
                // LOW (Red): y = 62 (height 14px)
                // MEDIUM (Yellow/Amber): y = 40 (height 36px)
                // HIGH (Green): y = 18 (height 58px)
                // PEAK OVERLAP (Green): y = 8 (height 68px)
                let y = 62;
                let color = '#EF4444'; // Red
                let areaColor = 'rgba(239, 68, 68, 0.20)';

                if (v.level === 'HIGH') {
                    color = '#10B981'; // Green
                    areaColor = 'rgba(16, 185, 129, 0.25)';
                    if (v.score >= 90) {
                        y = 8;
                    } else {
                        y = 18;
                    }
                } else if (v.level === 'MEDIUM') {
                    color = '#F59E0B'; // Amber
                    areaColor = 'rgba(245, 158, 11, 0.20)';
                    y = 40;
                } else {
                    color = '#EF4444'; // Red
                    areaColor = 'rgba(239, 68, 68, 0.20)';
                    y = 62;
                }

                points.push({ x, y });
                colorStops.push(`<stop offset="${pct}%" stop-color="${color}" />`);
                areaStops.push(`<stop offset="${pct}%" stop-color="${areaColor}" />`);
            }

            // Create smooth cubic Bezier spline
            let pathD = `M 0,${points[0].y} `;
            for (let i = 0; i < points.length - 1; i++) {
                const p0 = points[i];
                const p1 = points[i + 1];
                const cp1x = p0.x + (p1.x - p0.x) / 2;
                const cp1y = p0.y;
                const cp2x = p0.x + (p1.x - p0.x) / 2;
                const cp2y = p1.y;
                pathD += `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y} `;
            }

            const areaD = `${pathD} L ${w},${h} L 0,${h} Z`;

            svgContainer.innerHTML = `
                <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="width: 100%; height: 100%; display: block;">
                    <defs>
                        <linearGradient id="volLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            ${colorStops.join('\n                            ')}
                        </linearGradient>
                        <linearGradient id="volAreaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            ${areaStops.join('\n                            ')}
                        </linearGradient>
                    </defs>

                    <!-- Subtle Horizontal Reference Guidelines (Theme Adaptive) -->
                    <line x1="0" y1="18" x2="${w}" y2="18" stroke="var(--border-inner)" stroke-dasharray="4 4" stroke-width="1" opacity="0.6" />
                    <line x1="0" y1="40" x2="${w}" y2="40" stroke="var(--border-inner)" stroke-dasharray="4 4" stroke-width="1" opacity="0.6" />
                    <line x1="0" y1="62" x2="${w}" y2="62" stroke="var(--border-inner)" stroke-dasharray="4 4" stroke-width="1" opacity="0.6" />

                    <!-- Filled Area with subtle opacity -->
                    <path d="${areaD}" fill="url(#volAreaGrad)" />

                    <!-- Clean Bold Wave Curve -->
                    <path d="${pathD}" fill="none" stroke="url(#volLineGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            `;
        },

        // Render Detailed ICT Macros Table (Clean, theme-adaptive, 100% overlap-free)
        renderIctDetailTable() {
            const tableCard = document.getElementById('marketHoursIctTableSection');
            if (!tableCard) return;

            if (!this.showIctMacros) {
                tableCard.style.display = 'none';
                return;
            }
            tableCard.style.display = 'block';

            const container = document.getElementById('marketHoursIctTableContainer');
            if (!container) return;

            const now = new Date();
            const tzName = this.selectedTimezone.replace('_', ' ');

            let rowsHtml = '';
            ICT_MACROS.forEach(macro => {
                const { startMin, endMin } = this.calculateMacroIntervalsInTarget(macro, now);
                const convertedRange = `${this.formatMinute(startMin)} – ${this.formatMinute(endMin)}`;

                rowsHtml += `
                    <tr id="ictTableRow-${macro.id}" style="border-bottom: 1px solid var(--border-inner); transition: background 0.15s;">
                        <td style="padding: 10px 12px; vertical-align: middle;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span class="b-badge" style="background: rgba(245,158,11,0.18); color: #D97706; border: 1px solid rgba(245,158,11,0.4); font-size: 10px; font-weight: 800; padding: 2px 6px;">${macro.code}</span>
                                <div>
                                    <span style="font-size: 12.5px; font-weight: 800; color: var(--text-primary); display: block;">${macro.nameVn}</span>
                                    <div id="ictRowStatus-${macro.id}" style="font-size: 10.5px; margin-top: 2px;">
                                        <span class="b-badge b-badge-dim" style="font-size: 9px; padding: 1px 6px;">🔴 Đã đóng cửa</span>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td style="padding: 10px 12px; font-size: 12px; font-weight: 700; color: var(--text-primary); vertical-align: middle; white-space: nowrap;">
                            ${macro.nyStartStr}
                        </td>
                        <td style="padding: 10px 12px; font-size: 12px; font-weight: 700; color: var(--text-primary); vertical-align: middle; white-space: nowrap;">
                            ${macro.nyEndStr}
                        </td>
                        <td style="padding: 10px 12px; font-size: 12.5px; font-weight: 800; color: #D97706; vertical-align: middle; white-space: nowrap;">
                            ${convertedRange}
                        </td>
                        <td style="padding: 10px 12px; font-size: 11px; color: var(--text-muted); line-height: 1.35; vertical-align: middle;">
                            ${macro.tip}
                        </td>
                    </tr>
                `;
            });

            container.innerHTML = `
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12px;">
                    <thead>
                        <tr style="border-bottom: 1.5px solid var(--border-inner); background: var(--bg-card-inner); color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em;">
                            <th style="padding: 8px 12px; font-weight: 800;">Phiên họp</th>
                            <th style="padding: 8px 12px; font-weight: 800; white-space: nowrap;">Giờ mở cửa (NY)</th>
                            <th style="padding: 8px 12px; font-weight: 800; white-space: nowrap;">Giờ đóng cửa (NY)</th>
                            <th style="padding: 8px 12px; font-weight: 800; white-space: nowrap; color: #D97706;">Quy đổi (${tzName})</th>
                            <th style="padding: 8px 12px; font-weight: 800;">Đặc tính thuật toán ICT</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            `;
        },

        // Update Needle, Analog Clock Pin, Traffic Light, Live Clocks & ICT Macro Status
        renderNeedleAndClocks() {
            const min = this.scrubMinuteOfDay;
            const pct = (min / 1440) * 100;
            const now = new Date();

            // 1. Move Vertical Needle Line
            const needle = document.getElementById('marketHoursNeedle');
            if (needle) {
                needle.style.left = `${pct.toFixed(3)}%`;
            }

            // 2. Update Top Needle Pin (Clock hands & digital time)
            const pinTime = document.getElementById('marketHoursPinTime');
            const pinDay = document.getElementById('marketHoursPinDay');
            const pinClock = document.getElementById('marketHoursPinClockSvg');

            const h = Math.floor(min / 60) % 24;
            const m = Math.floor(min % 60);

            if (pinTime) pinTime.innerText = this.formatMinute(min);
            if (pinDay) {
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                pinDay.innerText = days[now.getDay()];
            }

            // Analog clock hands in SVG
            if (pinClock) {
                const hourAngle = (h % 12) * 30 + m * 0.5;
                const minAngle = m * 6;
                pinClock.innerHTML = `
                    <svg viewBox="0 0 24 24" width="22" height="22" style="display: block;">
                        <circle cx="12" cy="12" r="10" fill="#FFFFFF" stroke="#6B21A8" stroke-width="1.8" />
                        <line x1="12" y1="12" x2="12" y2="7" stroke="#6B21A8" stroke-width="2" stroke-linecap="round" transform="rotate(${hourAngle} 12 12)" />
                        <line x1="12" y1="12" x2="12" y2="4.5" stroke="#9333EA" stroke-width="1.4" stroke-linecap="round" transform="rotate(${minAngle} 12 12)" />
                        <circle cx="12" cy="12" r="1.5" fill="#6B21A8" />
                    </svg>
                `;
            }

            // 3. Update Each Session's Status Badge in Left Info Column & Local Clocks
            SESSIONS.forEach(session => {
                const isOpen = this.isSessionOpenAt(session, min, now);
                const badgeEl = document.getElementById(`sessionStatusBadgeLeft-${session.id}`);
                if (badgeEl) {
                    if (isOpen) {
                        badgeEl.className = 'b-badge b-badge-green';
                        badgeEl.innerHTML = '● OPEN';
                    } else {
                        badgeEl.className = 'b-badge b-badge-dim';
                        badgeEl.innerHTML = '○ CLOSED';
                    }
                }

                // Update live clock
                const localClockEl = document.querySelector(`.session-local-time-${session.id}`);
                if (localClockEl) {
                    const localParts = this.getTimeParts(now, session.timeZone);
                    localClockEl.innerText = this.formatMinute(localParts.hour * 60 + localParts.minute);
                }
            });

            // 4. Update ICT Macros: Active status detection, pill glowing & countdown
            if (this.showIctMacros) {
                let activeMacro = null;
                let nextUpcomingMacro = null;
                let minUpcomingDiff = Infinity;

                ICT_MACROS.forEach(macro => {
                    const isActive = this.isMacroActiveAt(macro, min, now);
                    const { startMin, endMin } = this.calculateMacroIntervalsInTarget(macro, now);

                    if (isActive) {
                        activeMacro = { macro, startMin, endMin };
                    }

                    let diffToStart = startMin - min;
                    if (diffToStart < 0) diffToStart += 1440;
                    if (diffToStart > 0 && diffToStart < minUpcomingDiff) {
                        minUpcomingDiff = diffToStart;
                        nextUpcomingMacro = { macro, startMin, endMin, diffMinutes: Math.round(diffToStart) };
                    }

                    // Update pill glow on timeline
                    const pills = document.querySelectorAll(`.ict-macro-${macro.id}`);
                    pills.forEach(p => {
                        if (isActive) {
                            p.style.boxShadow = '0 0 14px #D97706, 0 0 4px #FFFFFF';
                            p.style.borderColor = '#FFFFFF';
                            p.style.transform = 'scaleY(1.15)';
                            p.style.zIndex = '25';
                        } else {
                            p.style.boxShadow = '0 1px 4px rgba(217, 119, 6, 0.4)';
                            p.style.borderColor = '#B45309';
                            p.style.transform = 'none';
                            p.style.zIndex = '15';
                        }
                    });

                    // Update detail table row
                    const rowEl = document.getElementById(`ictTableRow-${macro.id}`);
                    const rowStatus = document.getElementById(`ictRowStatus-${macro.id}`);
                    if (rowStatus) {
                        if (isActive) {
                            rowStatus.innerHTML = '<span class="b-badge b-badge-green" style="font-size: 9px; padding: 1px 6px;">● ĐANG MỞ CỬA</span>';
                            if (rowEl) rowEl.style.background = 'rgba(245, 158, 11, 0.12)';
                        } else if (diffToStart <= 60 && diffToStart > 0) {
                            rowStatus.innerHTML = `<span class="b-badge" style="background: rgba(245,158,11,0.15); color: #D97706; border: 1px solid rgba(245,158,11,0.3); font-size: 9px; padding: 1px 6px;">⏳ Sắp mở (${Math.round(diffToStart)}p)</span>`;
                            if (rowEl) rowEl.style.background = 'rgba(245, 158, 11, 0.04)';
                        } else {
                            rowStatus.innerHTML = '<span class="b-badge b-badge-dim" style="font-size: 9px; padding: 1px 6px;">🔴 Đã đóng cửa</span>';
                            if (rowEl) rowEl.style.background = 'transparent';
                        }
                    }
                });

                // Update left column ICT summary
                const leftSummary = document.getElementById('marketHoursIctLeftSummary');
                const leftBadge = document.getElementById('marketHoursIctLeftBadge');

                if (leftSummary && leftBadge) {
                    if (activeMacro) {
                        leftBadge.className = 'b-badge b-badge-green';
                        leftBadge.innerText = `● ACTIVE: ${activeMacro.macro.code}`;
                        leftSummary.innerHTML = `<span style="color: #D97706; font-weight: 800;">🔥 ${activeMacro.macro.nameVn}</span>`;
                    } else if (nextUpcomingMacro) {
                        leftBadge.className = 'b-badge b-badge-dim';
                        leftBadge.innerText = `⏳ Tiếp: ${nextUpcomingMacro.macro.code}`;
                        leftSummary.innerHTML = `<span>sau ${nextUpcomingMacro.diffMinutes} phút</span>`;
                    } else {
                        leftBadge.className = 'b-badge b-badge-dim';
                        leftBadge.innerText = '8 Cửa Sổ';
                        leftSummary.innerHTML = '<span>8 Khung Thuật Toán</span>';
                    }
                }
            }

            // 5. Update Volume Level & Traffic Light
            const vol = this.getVolumeContextAt(min, now);
            const volStatusText = document.getElementById('marketHoursVolStatusText');
            const volBadge = document.getElementById('marketHoursVolBadge');
            const volDesc = document.getElementById('marketHoursVolDesc');

            if (volStatusText) {
                volStatusText.innerText = `Khối lượng giao dịch dự kiến: ${vol.label.toLowerCase()}`;
            }
            if (volBadge) {
                volBadge.className = vol.badgeClass;
                volBadge.innerText = `● ${vol.label}`;
            }
            if (volDesc) {
                volDesc.innerText = vol.desc;
            }

            // Traffic Light Lamps (Green, Yellow, Red)
            const lampGreen = document.getElementById('trafficLightLampGreen');
            const lampYellow = document.getElementById('trafficLightLampYellow');
            const lampRed = document.getElementById('trafficLightLampRed');

            if (lampGreen && lampYellow && lampRed) {
                lampGreen.style.opacity = vol.level === 'HIGH' ? '1' : '0.2';
                lampGreen.style.boxShadow = vol.level === 'HIGH' ? '0 0 10px #10B981' : 'none';

                lampYellow.style.opacity = vol.level === 'MEDIUM' ? '1' : '0.2';
                lampYellow.style.boxShadow = vol.level === 'MEDIUM' ? '0 0 10px #F59E0B' : 'none';

                lampRed.style.opacity = vol.level === 'LOW' ? '1' : '0.2';
                lampRed.style.boxShadow = vol.level === 'LOW' ? '0 0 10px #EF4444' : 'none';
            }

            // Live / Scrub indicator button
            const liveIndicator = document.getElementById('marketHoursResetLiveBtn');
            if (liveIndicator) {
                if (this.isLive) {
                    liveIndicator.style.display = 'none';
                } else {
                    liveIndicator.style.display = 'inline-flex';
                }
            }
        }
    };

    // Global Exposure
    root.MarketHours = MarketHours;
    root.toggleIctPushNotifications = (e) => MarketHours.togglePushNotifications(e);
    root.toggleIctSoundAlerts = (e) => MarketHours.toggleSoundAlerts(e);
    root.testIctNotification = (e) => MarketHours.testNotification(e);

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = MarketHours;
    }

    // Auto-init on DOMContentLoaded if element exists
    if (typeof window !== 'undefined') {
        window.addEventListener('DOMContentLoaded', () => {
            if (document.getElementById('marketHoursCard')) {
                MarketHours.init();
            }
        });
    }

})(typeof window !== 'undefined' ? window : globalThis);
