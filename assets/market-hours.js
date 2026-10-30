/**
 * Topstep Cockpit - Forex & Futures Market Hours Converter Widget
 * Visualizes 24-Hour Global Trading Sessions (Sydney, Tokyo, London, New York)
 * with real-time needle, live city clocks, volume curve, and session overlaps.
 * Inspired by BabyPips Forex Market Hours Converter & tailored for Topstep Desk.
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

    // Main MarketHours Controller
    const MarketHours = {
        selectedTimezone: 'Asia/Bangkok',
        is24Hour: true,
        isLive: true,
        scrubMinuteOfDay: 0, // 0 - 1439
        timerId: null,
        isDragging: false,

        init() {
            if (typeof localStorage !== 'undefined') {
                const savedTz = localStorage.getItem('topstep_market_hours_tz');
                if (savedTz) this.selectedTimezone = savedTz;
                const saved24 = localStorage.getItem('topstep_market_hours_24h');
                if (saved24 !== null) this.is24Hour = saved24 === 'true';
            }

            this.syncLiveTime();
            this.render();

            if (this.timerId) clearInterval(this.timerId);
            this.timerId = setInterval(() => {
                if (this.isLive) {
                    this.syncLiveTime();
                    this.renderNeedleAndClocks();
                }
            }, 1000);

            this.bindEvents();
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
                // Continuous in single day
                intervals.push({ start: startInTarget, end: endInTarget });
            } else {
                // Wraps across midnight!
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

        // Check if session is open at a given minute of the day
        isSessionOpenAt(session, minuteOfDay, refDate = new Date()) {
            const { intervals } = this.calculateSessionIntervalsInTarget(session, refDate);
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

        // Main Render Function
        render() {
            this.renderHeader();
            this.renderTimelineHeader();
            this.renderSessionRows();
            this.renderVolumeChart();
            this.renderNeedleAndClocks();
        },

        renderHeader() {
            const toggle = document.getElementById('marketHours24Toggle');
            if (toggle) toggle.checked = this.is24Hour;
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

        // Render Session Rows (Sydney, Tokyo, London, New York)
        renderSessionRows() {
            const leftCol = document.getElementById('marketHoursSessionLeftCol');
            const rightLanes = document.getElementById('marketHoursSessionLanes');
            if (!leftCol || !rightLanes) return;

            const now = new Date();
            let leftHtml = '';
            let rightHtml = '';

            SESSIONS.forEach(session => {
                const { intervals, startMin, endMin } = this.calculateSessionIntervalsInTarget(session, now);
                const localDate = new Date();
                const localParts = this.getTimeParts(localDate, session.timeZone);
                const abbr = getTimezoneAbbr(session.timeZone, localDate);
                const localTimeStr = this.formatMinute(localParts.hour * 60 + localParts.minute);
                const flagSvg = SVG_FLAGS[session.id] || '🌐';

                // Left Info Column
                leftHtml += `
                    <div style="display: flex; align-items: center; gap: 10px; height: 64px; padding-right: 14px; border-bottom: 1px solid var(--border-inner);">
                        ${flagSvg}
                        <div>
                            <span style="font-size: 13.5px; font-weight: 800; color: var(--text-primary); display: block; line-height: 1.2;">${session.name}</span>
                            <span class="session-local-time-${session.id} tabular-nums" style="font-size: 11px; font-weight: 700; color: var(--color-primary);">${localTimeStr}</span>
                            <span style="font-size: 9.5px; color: var(--text-muted); display: block;">${localParts.weekday} ${localParts.month}. ${localParts.day} · ${abbr}</span>
                        </div>
                    </div>
                `;

                // Right Track Lane with bars
                let barsHtml = '';
                intervals.forEach((inv) => {
                    const leftPct = (inv.start / 1440) * 100;
                    const widthPct = ((inv.end - inv.start) / 1440) * 100;
                    barsHtml += `
                        <div class="session-bar-${session.id}" style="position: absolute; left: ${leftPct.toFixed(3)}%; width: ${widthPct.toFixed(3)}%; top: 7px; bottom: 7px; background: ${session.color}; border-radius: 6px; box-shadow: 0 2px 8px ${session.bgLight}; transition: transform 0.15s ease;" title="${session.name} Session (${this.formatMinute(inv.start)} - ${this.formatMinute(inv.end)})"></div>
                    `;
                });

                rightHtml += `
                    <div style="position: relative; height: 64px; display: flex; align-items: center; background: rgba(0,0,0,0.03); border-radius: 6px; border: 1px dashed var(--border-inner); margin-bottom: 0; overflow: hidden;" data-session-id="${session.id}">
                        <!-- Session Status Floating Badge -->
                        <div class="session-badge-${session.id}" style="position: absolute; left: 8px; top: 3px; z-index: 10; font-size: 9.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em;">
                            <!-- Updated dynamically -->
                        </div>
                        ${barsHtml}
                    </div>
                `;
            });

            leftCol.innerHTML = leftHtml;
            rightLanes.innerHTML = rightHtml;
        },

        // Render Trading Volume Wave Chart (SVG Area Spline)
        renderVolumeChart() {
            const svgContainer = document.getElementById('marketHoursVolumeSvgContainer');
            if (!svgContainer) return;

            // Generate 24 points for the spline
            const points = [];
            const w = 1000;
            const h = 70;

            for (let i = 0; i <= 24; i++) {
                const minute = (i % 24) * 60;
                const v = this.getVolumeContextAt(minute, new Date());
                const x = (i / 24) * w;
                // Higher score -> higher curve (lower Y in SVG)
                const y = h - (v.score / 100) * (h - 14) - 6;
                points.push({ x, y });
            }

            // Create smooth SVG cubic path
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
                        <linearGradient id="volGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.25" />
                            <stop offset="35%" stop-color="#9333EA" stop-opacity="0.35" />
                            <stop offset="65%" stop-color="#0284C7" stop-opacity="0.45" />
                            <stop offset="85%" stop-color="#22C55E" stop-opacity="0.55" />
                            <stop offset="100%" stop-color="#3B82F6" stop-opacity="0.25" />
                        </linearGradient>
                        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="#3B82F6" />
                            <stop offset="35%" stop-color="#A855F7" />
                            <stop offset="65%" stop-color="#38BDF8" />
                            <stop offset="85%" stop-color="#22C55E" />
                            <stop offset="100%" stop-color="#3B82F6" />
                        </linearGradient>
                    </defs>
                    <path d="${areaD}" fill="url(#volGrad)" />
                    <path d="${pathD}" fill="none" stroke="url(#lineGrad)" stroke-width="2.5" />
                </svg>
            `;
        },

        // Update Needle, Analog Clock Pin, Traffic Light & Live Clocks
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
                        <!-- Hour hand -->
                        <line x1="12" y1="12" x2="12" y2="7" stroke="#6B21A8" stroke-width="2" stroke-linecap="round" transform="rotate(${hourAngle} 12 12)" />
                        <!-- Minute hand -->
                        <line x1="12" y1="12" x2="12" y2="4.5" stroke="#9333EA" stroke-width="1.4" stroke-linecap="round" transform="rotate(${minAngle} 12 12)" />
                        <circle cx="12" cy="12" r="1.5" fill="#6B21A8" />
                    </svg>
                `;
            }

            // 3. Update Each Session's OPEN/CLOSED Status Badge & Local Clocks
            SESSIONS.forEach(session => {
                const isOpen = this.isSessionOpenAt(session, min, now);
                const badgeEl = document.querySelector(`.session-badge-${session.id}`);
                if (badgeEl) {
                    if (isOpen) {
                        badgeEl.innerHTML = `<span style="color: ${session.color}; background: ${session.bgLight}; padding: 2px 8px; border-radius: 4px; border: 1px solid ${session.borderActive};">● ${session.name} SESSION OPEN</span>`;
                    } else {
                        badgeEl.innerHTML = `<span style="color: var(--text-muted); background: var(--bg-card); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border-inner);">○ ${session.name} SESSION CLOSED</span>`;
                    }
                }

                // Update live clock
                const localClockEl = document.querySelector(`.session-local-time-${session.id}`);
                if (localClockEl) {
                    const localParts = this.getTimeParts(now, session.timeZone);
                    localClockEl.innerText = this.formatMinute(localParts.hour * 60 + localParts.minute);
                }
            });

            // 4. Update Volume Level & Traffic Light
            const vol = this.getVolumeContextAt(min, now);
            const volStatusText = document.getElementById('marketHoursVolStatusText');
            const volBadge = document.getElementById('marketHoursVolBadge');
            const volDesc = document.getElementById('marketHoursVolDesc');

            if (volStatusText) {
                volStatusText.innerText = `Trading Volume is usually ${vol.level.toLowerCase()} at this time of day.`;
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
                lampGreen.style.boxShadow = vol.level === 'HIGH' ? '0 0 10px #22C55E' : 'none';

                lampYellow.style.opacity = vol.level === 'MEDIUM' ? '1' : '0.2';
                lampYellow.style.boxShadow = vol.level === 'MEDIUM' ? '0 0 10px #EAB308' : 'none';

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
