# SỔ TAY GIAO DỊCH THỰC CHIẾN (TRADING PLAYBOOK)
### Phương Pháp: FRVP (Fixed Range Volume Profile) & SMC / CRT / AMD
**Thị Trường:** Futures CME (Gold - MGC/GC & Nasdaq - MNQ/NQ)  
**Tài Khoản:** Topstep® 50K DLL Express (Quy tắc DLL: -$1,000 | Mục tiêu ngày thắng: ≥ +$150)  
**Tác Giả:** Trader Giản Hạ Thủy (Đinh Sửu 1997)  
**Phiên Bản:** 1.0 (Chuẩn Hóa Kỷ Luật & Xác Suất)

---

## MỤC LỤC
1. [Triết Lý Cốt Lõi & Mô Hình Xác Suất](#1-triết-lý-cốt-lõi--mô-hình-xác-suất)
2. [Cấu Hình Chỉ Báo FRVP Chuẩn Cho Gold & NQ](#2-cấu-hình-chỉ-báo-frvp-chuẩn-cho-gold--nq)
3. [Phân Tích 3 Vị Trí Của POC Trong Range Anchor](#3-phân-tích-3-vị-trí-của-poc-trong-range-anchor)
4. [Chi Tiết 4 Setup Thực Chiến](#4-chi-tiết-4-setup-thực-chiến)
   - [Setup 1: CRT - FRVP (Candle Range Sweep & POC Break)](#setup-1-crt---frvp)
   - [Setup 2: AMD (Accumulation - Manipulation - Distribution)](#setup-2-amd)
   - [Setup 3: Trend (Pullback POC & Confirmation Đáy Mới)](#setup-3-trend)
   - [Setup 4: Break (Phá Vỡ Range Sideway & Retest)](#setup-4-break)
5. [Quy Tắc Quản Trị Lệnh Real-time (Execution Rules)](#5-quy-tắc-quản-trị-lệnh-real-time)
6. [Quản Trị Vốn & Kỷ Luật Topstep 50K](#6-quản-trị-vốn--kỷ-luật-topstep-50k)

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

## 2. Cấu Hình Chỉ Báo FRVP Chuẩn Cho Gold & NQ

Cài đặt trên nền tảng TradingView / TopstepX:

| Thông Số Cài Đặt | Vàng (GC / MGC) | Nasdaq (NQ / MNQ) | Mục Đích Thực Chiến |
| :--- | :--- | :--- | :--- |
| **Row Layout** | Number of Rows | Number of Rows | Chuẩn hóa theo chiều dọc |
| **Row Size** | **70 – 100** | **120 – 150** | NQ biên độ điểm rộng (hàng trăm pt), cần row dày để cụm volume mịn và rõ nét. |
| **Value Area Volume** | **70%** | **70%** | Chuẩn thống kê 1 độ lệch chuẩn Gaussian |
| **POC Line** | Bật (Đỏ hoặc Xanh Coban, dày 2px) | Bật (Đỏ hoặc Xanh Coban, dày 2px) | Bật tùy chọn **Extend Right** để theo dõi điểm va đập giá trong tương lai. |
| **VAH / VAL Line** | Tắt (hoặc để nét đứt mờ) | Tắt (hoặc để nét đứt mờ) | Giảm rác mắt, tập trung 100% sự chú ý vào đường POC. |
| **Volume Bar Opacity** | **30% – 40%** | **30% – 40%** | Làm mờ cột volume để không che mất nến và cấu trúc râu nến. |

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

### SETUP 2: AMD (Accumulation - Manipulation - Distribution)
- **Ý Tưởng:** Đánh theo chu kỳ bẫy giá kinh điển của thị trường.
- **Quy Trình Từng Bước:**
  1. **Phase A (Tích lũy):** Kéo FRVP trên toàn bộ vùng tích lũy A $\rightarrow$ Xác định đường `POC-A`.
  2. **Phase M (Thao túng/Bẫy giá):** Giá phá vỡ giả (Judas Swing) quét râu ra ngoài biên Range A để bẫy retail trader.
  3. **Phase D (Phân phối thật):** Giá quay ngược trở lại vào trong Range A và xuyên qua `POC-A`.
  4. **Điểm Kích Hoạt (Trigger):** Chờ giá hồi về retest lại đúng `POC-A`. **ĐỨNG NGOÀI CHỜ NẾN PHẢN ỨNG TỪ CHỐI (Rejection)** tại POC $\rightarrow$ Vào lệnh theo hướng Phase D.
  5. **Stop Loss:** Đặt ngoài đỉnh/đáy của Phase M.
  6. **Take Profit:** $1:2$ đến $1:3$ (hoặc biên thanh khoản đối diện).

---

### SETUP 3: TREND (Pullback POC & Confirmation Đáy Mới)
- **Ý Tưởng:** Đánh thuận xu hướng khi giá hồi sâu về vùng giá trị, tối ưu R:R bằng cách chờ tạo cấu trúc xác nhận.
- **Quy Trình Từng Bước:**
  1. Xác định con sóng đẩy xu hướng rõ ràng: Đánh dấu High và Low của con sóng.
  2. Kéo FRVP toàn bộ con sóng từ High đến Low (hoặc Low đến High) $\rightarrow$ Xác định đường POC con sóng.
  3. Giá hồi sâu về chạm POC $\rightarrow$ **TUYỆT ĐỐI KHÔNG ĐẶT LIMIT ORDER MÙ.**
  4. **Điểm Kích Hoạt (Trigger):** Quan sát hành động giá tại POC. Chờ giá từ chối và **tạo ra một Đáy Mới Cục Bộ (Local Low / Higher Low)** hoặc nến đảo chiều pinbar/engulfing.
  5. **Vào Lệnh & Cắt Lỗ:** Vào lệnh ngay khi đáy mới hoàn thành. **SL đặt ngay dưới Đáy Mới Cục Bộ này** (khoảng cách SL rất ngắn).
  6. **Take Profit:** Hướng lên Đỉnh Sóng Cũ (Range High). Do SL ngắn, tỷ lệ **R:R tự động đạt 1:2 đến 1:3 tuyệt đẹp**.

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

## 6. Quản Trị Vốn & Kỷ Luật Topstep 50K

- **Tài khoản:** 50K DLL EXPRESS (Khóa ngày nếu lỗ $-1,000$).
- **Quy mô 1R chuẩn:** **$150 – $200 USD / lệnh**.
  - 1 lệnh thua tối đa: $-150$ đến $-200$.
  - 1 lệnh thắng $2\text{R}$: $+300$ đến $+400$ $\rightarrow$ **Đạt chuẩn chỉ tiêu ngày thắng của Topstep (≥ +$150) ngay lập tức!**
- **Quy tắc dừng phiên:**
  - Nếu đạt $+2\text{R}$ hoặc $+3\text{R}$ (lãi $\ge +\$300$) $\rightarrow$ **DỪNG TRADE NGAY HÔM ĐÓ.** Bảo toàn 1 ngày thắng hợp lệ để tích lũy 5 ngày rút tiền.
  - Nếu thua 2 lệnh liên tiếp ($-1\text{R}$ và $-1\text{R}$ = $-300$ to $-400$) $\rightarrow$ **DỪNG TRADE HÔM ĐÓ.** Giữ khoảng cách xa ngưỡng $-1,000$ DLL của Topstep.
