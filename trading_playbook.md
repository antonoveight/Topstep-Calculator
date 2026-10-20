# SỔ TAY GIAO DỊCH THỰC CHIẾN (TRADING PLAYBOOK)
### Phương Pháp: FRVP (Fixed Range Volume Profile) & SMC / CRT / AMD
**Thị Trường (Danh Mục Chính):** Futures CME / NYMEX — Chỉ giao dịch 4 sản phẩm Micro:
1. **MGC** (Micro Gold)
2. **MNQ** (Micro E-mini Nasdaq-100)
3. **MES** (Micro E-mini S&P 500)
4. **MCLZ26** (Micro WTI Crude Oil - Dec 2026)  
**Tài Khoản:** Topstep® 50K DLL Express (Quy tắc DLL: -$1,000 | Mục tiêu ngày thắng: ≥ +$150)  
**Tác Giả:** Trader Giản Hạ Thủy (Đinh Sửu 1997)  
**Phiên Bản:** 2.0 (Chuẩn Hóa Danh Mục & Kỷ Luật Xác Suất)

---

## MỤC LỤC
1. [Triết Lý Cốt Lõi & Mô Hình Xác Suất](#1-triết-lý-cốt-lõi--mô-hình-xác-suất)
2. [Cấu Hình Chỉ Báo FRVP Chuẩn Cho 4 Sản Phẩm](#2-cấu-hình-chỉ-báo-frvp-chuẩn-cho-4-sản-phẩm)
3. [Phân Tích 3 Vị Trí Của POC Trong Range Anchor](#3-phân-tích-3-vị-trí-của-poc-trong-range-anchor)
4. [Chi Tiết 4 Setup Thực Chiến](#4-chi-tiết-4-setup-thực-chiến)
   - [Setup 1: CRT - FRVP (Candle Range Sweep & POC Break)](#setup-1-crt---frvp)
   - [Setup 2: Trend (Pullback POC & Confirmation Đáy Mới)](#setup-2-trend)
   - [Setup 3: AMD (Accumulation - Manipulation - Distribution)](#setup-3-amd)
   - [Setup 4: Break (Phá Vỡ Range Sideway & Retest)](#setup-4-break)
5. [Quy Tắc Quản Trị Lệnh Real-time (Execution Rules)](#5-quy-tắc-quản-trị-lệnh-real-time)
6. [Quản Trị Vốn & Bảng Thông Số Hợp Đồng (MGC, MNQ, MES, MCLZ26)](#6-quản-trị-vốn--bảng-thông-số-hợp-đồng)
7. [Bản Đồ Thanh Khoản & Khung Giờ Săn Mồi](#7-bản-đồ-thanh-khoản--khung-giờ-săn-mồi)

---

## 1. Triết Lý Cốt Lõi & Mô Hình Xác Suất

### 1.1. Bản Chất Của Lợi Thế (Edge)
- Thị trường là quá trình đấu giá (Auction Market Process). Giá di chuyển từ vùng cân bằng này sang vùng cân bằng khác nhằm tìm kiếm thanh khoản.
- Không dự đoán hướng đi tương lai. Chỉ quan sát **phản ứng của dòng tiền lớn tại các vùng khối lượng trọng yếu (POC - Point of Control)** và đi theo dấu chân của họ.

### 1.2. Triết Lý Chốt Lời Xác Suất (All-or-Nothing / Rule-Based)
- **Tuyệt đối không chốt lời từng phần (No Partial TP):** Chốt non làm suy giảm kỳ vọng toán học (Mathematical Expectancy) dài hạn của hệ thống.
- **4 Kịch bản kết quả cố định cho mọi lệnh:**
  1. **Thắng đủ (Full TP):** $+2\text{R}$ hoặc $+3\text{R}$ (Target chạm trọn vẹn).
  2. **Hòa vốn (BE):** $0\text{R}$ (Khi giá đã chạy được $+2\text{R}$ rồi quay đầu).
  3. **Thua giảm thiểu:** $-0.5\text{R}$ (Khi giá đã chạy được $+1\text{R}$ rồi quay đầu cắn SL).
  4. **Thua tối đa:** $-1\text{R}$ (Lệnh bị quét SL ban đầu ngay sau khi vào).
- Với cơ chế này, hệ thống chỉ cần đạt **Winrate 35% – 40%** là tài khoản tăng trưởng bền vững.

---

## 2. Cấu Hình Chỉ Báo FRVP Chuẩn Cho 4 Sản Phẩm

Cài đặt trên nền tảng TradingView / TopstepX:

| Thông Số Cài Đặt | Vàng (MGC) | Nasdaq (MNQ) | S&P 500 (MES) | Dầu Thô (MCLZ26) | Ghi Chú Kỹ Thuật |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Row Layout** | Number of Rows | Number of Rows | Number of Rows | Number of Rows | Chuẩn hóa theo chiều dọc |
| **Row Size** | **70 – 100** | **120 – 150** | **80 – 100** | **60 – 80** | NQ biên độ rộng cần row dày; Dầu bước giá 0.01 cần row vừa phải để profile mịn. |
| **Value Area Volume** | **70%** | **70%** | **70%** | **70%** | Chuẩn thống kê 1 độ lệch chuẩn Gaussian |
| **POC Line** | Bật (Đỏ / Xanh, 2px) | Bật (Đỏ / Xanh, 2px) | Bật (Đỏ / Xanh, 2px) | Bật (Đỏ / Xanh, 2px) | Bật **Extend Right** để theo dõi điểm va đập giá. |
| **VAH / VAL Line** | Tắt / Nét đứt mờ | Tắt / Nét đứt mờ | Tắt / Nét đứt mờ | Tắt / Nét đứt mờ | Giảm rác mắt, tập trung 100% vào đường POC. |
| **Volume Bar Opacity** | **30% – 40%** | **30% – 40%** | **30% – 40%** | **30% – 40%** | Làm mờ volume để thấy rõ cấu trúc nến & râu sweep. |

---

## 3. Phân Tích 3 Vị Trí Của POC Trong Range Anchor

Khi kéo FRVP từ **Open Anchor** đến **cây nến trước nến Sweep (hoặc qua nến Sweep)**, vị trí POC quyết định chất lượng lệnh:

```
[VỊ TRÍ 1: POC Ở CỰC TRỊ]        [VỊ TRÍ 2: POC Ở GIỮA (EQUILIBRIUM)]     [VỊ TRÍ 3: POC SÁT TARGET]
       ─── Sweep High ───                 ─── Sweep High ───                 ─── Target High ───
       ███ POC (Khối lượng lớn)                                              ███ POC (Cản dày)
       ──────────────────                 ███ POC (Cân bằng)                 ──────────────────
                                          ──────────────────                 
       ─── Open Anchor ───                ─── Open Anchor ───                ─── Entry (Break) ──
```

### 1. POC ở Cực Trị (Upper/Lower Extreme) – *Setup A+ (Xác Suất Cao Nhất)*
- **Bản chất:** Khối lượng giao dịch lớn nhất tập trung ngay tại vùng đỉnh/đáy trước khi bị quét râu. Đây là hành vi hấp thụ thanh khoản hoặc phân phối đỉnh/đáy của Smart Money.
- **Kịch bản:** Khi nến sweep xong và giá **đóng cửa thân nến đục thủng qua POC cực trị này** $\rightarrow$ Kích hoạt Entry ngay lập tức. Lực xả/đẩy sẽ rất mạnh do phe đối diện bị kẹp hàng.

### 2. POC ở Giữa Range (Equilibrium - 50%) – *Setup Chuẩn*
- **Bản chất:** Vùng giá trị tích lũy công bằng suốt phiên, sau đó một đầu bị quét râu (liquidity sweep).
- **Kịch bản:** Giá sweep xong quay ngược lại và đục thủng POC ở giữa. POC lúc này đóng vai trò như chiếc **bàn đạp (Fulcrum)** đưa giá hướng thẳng về **Biên đối diện của Range (CRTH / CRTL)**.

### 3. POC nằm ở Phía Đối Diện (Sát Target của bạn) – *Cảnh Báo / Bỏ Qua (Skip)*
- **Bản chất:** Bức tường thanh khoản dày nằm ngay cản trước mặt điểm chốt lời.
- **Kịch bản:** Giá sẽ bị khối volume này chặn lại, đi sideway hoặc đảo chiều trước khi tới full TP.
- **Quy tắc:** Nếu khoảng cách từ Entry đến POC cản này không đủ tỷ lệ $1.5\text{R}$ hoặc $2\text{R}$ $\rightarrow$ **Bỏ qua (Skip trade)**.

---

## 4. Chi Tiết 4 Setup Thực Chiến

---

### SETUP 1: CRT - FRVP (Candle Range Sweep & POC Break)
- **Ý Tưởng:** Quét thanh khoản đỉnh/đáy của Range nến và xác nhận bằng việc giá phá vỡ vùng volume lớn nhất (POC).
- **Quy Trình Từng Bước:**
  1. Xác định Open Anchor và kéo FRVP đến cây nến trước nến Sweep (hoặc qua nến Sweep).
  2. Xác định vị trí POC: Ưu tiên POC ở Cực Trị hoặc Giữa hộp; cảnh báo nếu POC nằm sát Target.
  3. **Điểm Kích Hoạt (Trigger):** Thân nến **đóng cửa dứt khoát qua POC** (Candle Close, tuyệt đối không vào lệnh khi chỉ có râu nến thò qua).
  4. **Stop Loss:** Đặt sau Range High/Low của FRVP (ngoài râu nến sweep).
  5. **Take Profit:** Đặt theo tỷ lệ $1:2$ hoặc $1:3$, hoặc tại biên đối diện (CRTH / CRTL).

---

### SETUP 2: TREND (Pullback POC & Confirmation Đáy Mới)
- **Ý Tưởng:** Đánh thuận xu hướng khi giá hồi sâu về vùng giá trị, tối ưu R:R bằng cách chờ tạo cấu trúc xác nhận.
- **Quy Trình Từng Bước:**
  1. Xác định con sóng đẩy xu hướng rõ ràng: Đánh dấu High và Low của con sóng.
  2. Kéo FRVP toàn bộ con sóng từ High đến Low (hoặc Low đến High) $\rightarrow$ Xác định đường POC con sóng.
  3. Giá hồi sâu về chạm POC $\rightarrow$ **TUYỆT ĐỐI KHÔNG ĐẶT LIMIT ORDER MÙ.**
  4. **Điểm Kích Hoạt (Trigger):** Quan sát hành động giá tại POC. Chờ giá từ chối và **tạo ra một Đáy Mới Cục Bộ (Local Low / Higher Low)** hoặc nến đảo chiều pinbar/engulfing.
  5. **Vào Lệnh & Cắt Lỗ:** Vào lệnh ngay khi đáy mới hoàn thành. **SL đặt ngay dưới Đáy Mới Cục Bộ này** (khoảng cách SL rất ngắn).
  6. **Take Profit:** Hướng lên Đỉnh Sóng Cũ (Range High). Do SL ngắn, tỷ lệ **R:R tự động đạt 1:2 đến 1:3 tuyệt đẹp**.

---

### SETUP 3: AMD (Accumulation - Manipulation - Distribution)
- **Ý Tưởng:** Đánh theo chu kỳ bẫy giá kinh điển của thị trường.
- **Quy Trình Từng Bước:**
  1. **Phase A (Tích lũy):** Kéo FRVP trên toàn bộ vùng tích lũy A $\rightarrow$ Xác định đường `POC-A`.
  2. **Phase M (Thao túng/Bẫy giá):** Giá phá vỡ giả (Judas Swing) quét râu ra ngoài biên Range A để bẫy retail trader.
  3. **Phase D (Phân phối thật):** Giá quay ngược trở lại vào trong Range A và xuyên qua `POC-A`.
  4. **Điểm Kích Hoạt (Trigger):** Chờ giá hồi về retest lại đúng `POC-A`. **ĐỨNG NGOÀI CHỜ NẾN PHẢN ỨNG TỪ CHỐI (Rejection)** tại POC $\rightarrow$ Vào lệnh theo hướng Phase D.
  5. **Stop Loss:** Đặt ngoài đỉnh/đáy của Phase M.
  6. **Take Profit:** $1:2$ đến $1:3$ (hoặc biên thanh khoản đối diện).

---

### SETUP 4: BREAK (Phá Vỡ Range Sideway & Retest)
- **Ý Tưởng:** Đón sóng bùng nổ sau giai đoạn nén biên độ (Sideway).
- **Quy Trình Từng Bước:**
  1. Kéo FRVP trên toàn bộ vùng Range Sideway $\rightarrow$ Xác định POC và 2 biên VAH / VAL.
  2. Giá có một cây nến phá vỡ (Breakout) dứt khoát ra khỏi hộp Sideway.
  3. **Chờ Retest:** Chờ giá hồi về test lại POC (khi hồi sâu) hoặc test lại biên VAH/VAL (khi lực đẩy mạnh).
  4. **Điểm Kích Hoạt (Trigger):** Chờ nến từ chối (Rejection) xác nhận vùng test giữ được giá $\rightarrow$ Vào lệnh thuận chiều Breakout.
  5. **Stop Loss:** Đặt sau Local High/Low của nhịp retest.
  6. **Take Profit:** $1:2$ đến $1:3$.

---

## 5. Quy Tắc Quản Trị Lệnh Real-Time (Execution Rules)

```
[Entry] ───► [Giá chạy +1R] ───► [Dời SL về -0.5R] (Giảm 50% rủi ro)
                  │
                  ▼
             [Giá chạy +2R] ───► [Dời SL về BE (0R)] (Loại bỏ rủi ro)
                  │
                  ▼
             [Giá chạm +3R] ───► [FULL TAKE PROFIT] (+3R)
```

1. **Khi giá di chuyển được $+1\text{R}$:**
   - Lập tức dời Stop Loss từ mốc ban đầu ($-1\text{R}$) lên mốc **$-0.5\text{R}$**.
   - Mục đích: Cắt giảm ngay 50% mức lỗ nếu thị trường bất ngờ quay đầu quét ngược.
2. **Khi giá di chuyển được $+2\text{R}$:**
   - Lập tức dời Stop Loss về mốc **Hòa Vốn (Break-Even - BE / 0R)**.
   - Mục đích: Đảm bảo đây là một lệnh "miễn phí rủi ro" (Risk-Free Trade).
3. **Chốt lời:**
   - Để lệnh tự động chạm **Full TP ($+2\text{R}$ hoặc $+3\text{R}$)** hoặc quay về cắn BE.
   - Không chốt non, không dời TP ra xa hơn khi giá chưa tới, tôn trọng xác suất thống kê.

---

## 6. Quản Trị Vốn & Bảng Thông Số Hợp Đồng (MGC, MNQ, MES, MCLZ26)

- **Tài khoản:** 50K DLL EXPRESS (Khóa ngày nếu lỗ $-1,000$).
- **Quy mô 1R chuẩn:** **$150 – $200 USD / lệnh**.
  - 1 lệnh thua tối đa: $-150$ đến $-200$.
  - 1 lệnh thắng $2\text{R}$: $+300$ đến $+400$ $\rightarrow$ **Đạt chuẩn chỉ tiêu ngày thắng của Topstep (≥ +$150) ngay lập tức!**
- **Quy tắc dừng phiên:**
  - Nếu đạt $+2\text{R}$ hoặc $+3\text{R}$ (lãi $\ge +\$300$) $\rightarrow$ **DỪNG TRADE NGAY HÔM ĐÓ.** Bảo toàn 1 ngày thắng hợp lệ để tích lũy 5 ngày rút tiền.
  - Nếu thua 2 lệnh liên tiếp ($-1\text{R}$ và $-1\text{R}$ = $-300$ to $-400$) $\rightarrow$ **DỪNG TRADE HÔM ĐÓ.** Giữ khoảng cách xa ngưỡng $-1,000$ DLL của Topstep.

### Bảng Thông Số Hợp Đồng Chi Tiết (Position Sizer Reference)

| Sản Phẩm | Tên Đầy Đủ | Sàn | Bước Giá (Tick Size) | Giá Trị 1 Tick (Micro) | Giá Trị 1 Point | Stop Loss Chuẩn (Gợi ý) | Rủi Ro / 1 Hợp Đồng |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **MGC** | Micro Gold | COMEX | **0.10 pt** | **$1.00** | $10.00 | **2.0 pt** (20 ticks) | **$20.00** |
| **MNQ** | Micro E-mini Nasdaq-100 | CME | **0.25 pt** | **$0.50** | $2.00 | **20.0 pt** (80 ticks) | **$40.00** |
| **MES** | Micro E-mini S&P 500 | CME | **0.25 pt** | **$1.25** | $5.00 | **5.0 pt** (20 ticks) | **$25.00** |
| **MCLZ26** | Micro WTI Crude Oil (Dec 26) | NYMEX | **0.01 pt** ($0.01) | **$1.00** | $100.00 | **0.30 pt** (30 ticks) | **$30.00** |

*Ví dụ tính số lot cho rủi ro $150 (1R):*
- **MGC** (SL 2.0 pt = 20 ticks = $20/lot) $\rightarrow$ Đi **7 lot** ($140 rủi ro).
- **MNQ** (SL 20.0 pt = 80 ticks = $40/lot) $\rightarrow$ Đi **3 lot** ($120 rủi ro) hoặc **4 lot** ($160 rủi ro).
- **MES** (SL 5.0 pt = 20 ticks = $25/lot) $\rightarrow$ Đi **6 lot** ($150 rủi ro).
- **MCLZ26** (SL 0.30 pt = 30 ticks = $30/lot) $\rightarrow$ Đi **5 lot** ($150 rủi ro).

---

## 7. Bản Đồ Thanh Khoản & Khung Giờ Săn Mồi (GMT+7)

| Khung Giờ | Trạng Thái | Sản Phẩm Ưu Tiên | Trọng Tâm Giao Dịch & Setup |
| :--- | :--- | :--- | :--- |
| **07:45 – 10:00 (Sáng)** | 🟢 **SĂN LỆNH** | **MGC, MNQ** | **Dòng tiền Á (Tokyo & Shanghai SGE)**: MGC & MNQ chạy mượt, tôn trọng kỹ thuật.<br>• Canh **Setup 1 (CRT)** quét râu đêm (ONH/ONL) hoặc **Setup 2 (Trend)** hồi POC sóng sáng. |
| **10:30 – 13:30 (Trưa)** | 🛑 **NGỒI YÊN** | — | **Vùng chết (Deadzone)**: Cạn volume, thị trường ngủ đông. Tắt màn hình, tuyệt đối không cố tìm lệnh. |
| **14:00 – 16:00 (Chiều)** | 🟡 **ƯU TIÊN MGC** | **MGC** | **London mở cửa (Vàng vật chất)**: MGC bùng nổ nhịp quét râu phiên Á. Canh **Setup 1 (CRT)** hoặc **Setup 3 (AMD)**.<br>• *Lưu ý:* MNQ biên hẹp, dễ bẫy $\rightarrow$ Khuyên đứng ngoài với MNQ. |
| **16:30 – 19:30 (Chiều)** | 🛑 **NGHỈ NGƠI** | — | **Giữa phiên Âu & Mỹ**: Volume chững lại chờ tin. Tắt chart, ăn tối, nghỉ ngơi tái tạo năng lượng. |
| **20:15 – 22:30 (Tối)\*** | 🔥 **GIỜ VÀNG MỸ** | **MGC, MNQ, MES, MCLZ26** | **US Open (80% Volume ngày & Pit Dầu)**: Biến động cực mạnh cả 4 mã, sóng dứt khoát nhanh tới TP.<br>• Canh **Setup 4 (Break)**, **Setup 1 (CRT)** hoặc **Setup 2 (Trend)**. |
| **Sau 22:30 (Đêm)** | 🛑 **ĐÓNG MÁY** | — | Hết sóng chính, tắt chart đi ngủ để bảo toàn vốn và kỷ luật. |

> [!NOTE]
> **(\*) Lưu ý chu kỳ giờ Mùa Đông (từ tháng 11 đến tháng 3):** Khung Giờ Vàng Mỹ sẽ lùi lại 1 tiếng: **21:15 – 23:30** (NYSE mở cửa lúc 21:30 VN thay vì 20:30 VN).
