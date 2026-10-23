# SỔ TAY GIAO DỊCH THỰC CHIẾN (TRADING PLAYBOOK) — PHIÊN BẢN 3.0
### Hệ Thống: Độc Chiêu CRT Fractal (C1 – C4) & FRVP Chuẩn Hóa
**Thị Trường:** Futures CME / NYMEX (Tập trung tối đa **MGC** và **MNQ**, dự phòng **MES**, **MCLZ26**)  
**Tài Khoản:** Topstep® 50K DLL Express (Daily Loss Limit: -$1,000)  
**Tác Giả:** Trader Giản Hạ Thủy (Đinh Sửu 1997)  
**Tôn Chỉ:** "Không sợ người luyện 10.000 cú đá, chỉ sợ người luyện 1 cú đá 10.000 lần." — Triệt tiêu 100% vùng xám cảm tính.

---

## MỤC LỤC
1. [Triết Lý Cốt Lõi & Tâm Lý Học Quản Trị Vốn](#1-triết-lý-cốt-lõi--tâm-lý-học-quản-trị-vốn)
2. [Khái Niệm "Thời Gian Làm Việc" & Chuỗi Khung Thời Gian H1 – M5/M3](#2-khái-niệm-thời-gian-làm-việc--chuỗi-khung-thời-gian-h1--m5m3)
3. [Bản Đồ Thanh Khoản HTF Bất Khả Xâm Phạm](#3-bản-đồ-thanh-khoản-htf-bất-khả-xâm-phạm)
4. [Cốt Lõi Phương Pháp: Chuỗi Nến Fractal C1 – C2 – C3 – C4](#4-cốt-lõi-phương-pháp-chuỗi-nến-fractal-c1--c2--c3--c4)
5. [Chuẩn Hóa Kéo FRVP & Phân Tích 3 Vị Trí POC](#5-chuẩn-hóa-kéo-frvp--phân-tích-3-vị-trí-poc)
6. [Chiêu Thức Chủ Lực (CRT Reversal) vs Tiếp Diễn (CRT Continuation) vs Sideway](#6-chiêu-thức-chủ-lực-crt-reversal-vs-tiếp-diễn-crt-continuation-vs-sideway)
7. [Quản Trị Lệnh Thực Chiến (Xóa Bỏ Bẫy Dời SL Về BE)](#7-quản-trị-lệnh-thực-chiến-xóa-bỏ-bẫy-dời-sl-về-be)
8. [Checklist Cơ Học 4 Bước Trước Khi Bấm Lệnh](#8-checklist-cơ-học-4-bước-trước-khi-bấm-lệnh)
9. [Bảng Thông Số Hợp Đồng & Quy Mô Vị Thế (Position Sizer)](#9-bảng-thông-số-hợp-đồng--quy-mô-vị-thế-position-sizer)

---

## 1. Triết Lý Cốt Lõi & Tâm Lý Học Quản Trị Vốn

### 1.1. Giải Mã Sự Thật Về "Mất Kỷ Luật & Nhồi Vol"
- **Sự thật khách quan:** Mất kỷ luật hay nhồi vol không phải là nguyên nhân gốc rễ, nó là **hệ quả của một hệ thống có lỗi cấu trúc ngầm**:
  - Điểm neo FRVP cảm tính $\rightarrow$ do dự khi bấm lệnh.
  - Quy tắc dời SL về Hòa Vốn (BE) máy móc $\rightarrow$ lệnh bị quét BE oan uổng rồi chạy tới TP $\rightarrow$ ức chế thần kinh (*tilt*) $\rightarrow$ nhồi vol trả thù.
  - Rủi ro trên mỗi lệnh quá sát giới hạn Daily Loss Limit (DLL).
- **Nguyên tắc vàng:** Khi hệ thống được **cơ học hóa 100% (Rule-Based)**, không còn vùng xám tự vấn, sự dao động sẽ biến mất.

### 1.2. Phân Tầng Rủi Ro (Tiered Risk Model)
- **Giai đoạn Vòng 1 (Combine / Step 1):**  
  - $1\text{R} = \mathbf{\$200}$ (Chấp nhận rủi ro cao để tích lũy lợi nhuận nhanh, pass quỹ trong 3 – 5 ngày).  
  - Giới hạn ngày: Thua 2 lệnh liên tiếp ($-400$) $\rightarrow$ **DỪNG TRADE NGAY LẬP TỨC**. Vẫn giữ khoảng cách an toàn rất xa ngưỡng -$1,000 DLL.
- **Giai đoạn Tài Khoản Cấp Vốn (XFA - Funded Phase):**  
  - Bắt buộc hạ rủi ro xuống: $1\text{R} = \mathbf{\$80 - \$100}$ (Tương đương 8% – 10% DLL).  
  - Cho phép tài khoản chịu được chuỗi drawdown 4 – 5 lệnh mà tâm lý vẫn hoàn toàn vững vàng để bảo toàn quỹ và rút tiền.

---

## 2. Khái Niệm "Thời Gian Làm Việc" & Chuỗi Khung Thời Gian H1 – M5/M3

### 2.1. Chuỗi Khung Thời Gian Chuẩn Hóa
| Tầng Phân Tích | Khung Thời Gian | Nhiệm Vụ Duy Nhất |
| :--- | :---: | :--- |
| **HTF (Khung Lớn)** | **H1 (1 Giờ)** | **Bản Đồ Chiến Lược:** Xác định nến mốc C1, cản thanh khoản HTF, quan sát nến C2 thò râu quét bẫy. |
| **LTF (Khung Thực Thi)** | **M5 / M3** | **Bắn Tỉa Chính Xác:** Kéo FRVP trong phạm vi nến H1, quan sát nến M5 đục qua POC, tối ưu điểm vào và Stop Loss. |

> [!IMPORTANT]
> Tuyệt đối không dùng khung M15/M1 để tránh nhiễu giật râu bão táp. Khung H1 mang lại độ uy tín cao nhất; khung M5 cho đủ 5 phút tĩnh tâm để hít thở, tính lot và kéo volume profile.

### 2.2. Khái Niệm "Thời Gian Làm Việc" (Trading Office Hours)
Mỗi ngày làm việc được phân bổ theo 3 ca khớp hoàn toàn với nhịp đóng/mở nến H1 của thế giới:
1. **Ca Sáng (07:45 – 10:00 VN):** Quản lý đúng **2 cây nến H1** (08:00 và 09:00 — Tokyo & Shanghai mở cửa). Ưu tiên MGC, MNQ.
2. **Ca Chiều (14:00 – 16:00 VN):** Quản lý đúng **2 cây nến H1** (14:00 và 15:00 — London mở cửa). Ưu tiên MGC.
3. **Ca Tối (20:15 – 22:30 VN):** Quản lý đúng **2 cây nến H1** (20:00/20:30 và 21:00 — New York US Open). Ưu tiên MNQ, MGC, MCLZ26.

### 2.3. Quy Tắc Ngồi Máy "Check-in Theo Chu Kỳ" (Anti-Screen Fatigue)
- **Không dán mắt liên tục 6.5 tiếng:** Dán mắt liên tục làm cạn kiệt dopamine và gây say chart.
- **Quy tắc 20 phút đầu giờ:** Chỉ tập trung cao độ vào **15 – 20 phút đầu của mỗi cây nến H1** (Thời điểm nến H1 thò râu quét bẫy C2).
- Nếu sau phút thứ 25 nến H1 không có hành vi sweep cản $\rightarrow$ **Rời khỏi màn hình**, đi uống nước, giải lao đến đầu tiếng sau.
- **"Cash is a position":** Ca làm việc không xuất hiện setup $\rightarrow$ Gấp máy tính, kết thúc ca với 0 lệnh. Bảo toàn 100% vốn là một chiến thắng vẻ vang!

---

## 3. Bản Đồ Thanh Khoản HTF Bất Khả Xâm Phạm

Mô hình CRT Fractal **CHỈ CÓ HIỆU LỰC** khi nến H2 thò râu quét vào 1 trong các mốc thanh khoản định chế sau:

```
[VÙNG BÁN ĐẮT / PREMIUM]  ─── PDH (Đỉnh ngày hôm trước) / ONH (Đỉnh đêm)
                          ─── HTF FVG / Bearish Order Block (1H / 4H)
                                ▲ Râu nến C2 quét qua rồi rút chân đóng nến trong
──────────────────────────┼───────────────────────────────────────────────
                          ▼ Râu nến C2 quét qua rồi rút chân đóng nến trong
[VÙNG MUA RẺ / DISCOUNT] ─── HTF FVG / Bullish Order Block (1H / 4H)
                          ─── PDL (Đáy ngày hôm trước) / ONL (Đáy đêm)
```

1. **PDH / PDL (Previous Day High / Low):** Mốc chứa cụm Stop Loss lớn nhất của thị trường.
2. **ONH / ONL (Overnight High / Low) hoặc Asian High / Low:** Thanh khoản phiên Á/Đêm thường bị quét sạch vào đầu phiên Âu (14:00) hoặc đầu phiên Mỹ (20:30).
3. **HTF FVG / Order Block (1H / 4H):** Vùng mất cân bằng giá khung lớn. Râu nến H1 thọc sâu vào chạm mốc 50% FVG (Consequent Encroachment) rồi bật ngược lại.
4. **Daily Open (06:00 VN) & Session Open (08:00, 14:00, 20:30):** Ngưỡng phân chia xu hướng phiên.

> [!CAUTION]
> Bất kỳ cú sweep nào diễn ra lơ lửng ở giữa chart mà không chạm vào 4 mốc trên đều là **Nhiễu ngẫu nhiên $\rightarrow$ TUYỆT ĐỐI BỎ QUA**.

---

## 4. Cốt Lõi Phương Pháp: Chuỗi Nến Fractal C1 – C2 – C3 – C4

```text
       [MÔ HÌNH BULLISH CRT REVERSAL (ĐẢO CHIỀU TĂNG)]

          ─── CRH (Candle Range High) ───
           ┌───┐                 ┌───┐     ▲ C4: Tiếp diễn về TP (CRH)
           │   │  ┌───┐          │   │     │
           │C1 │  │C2 │          │C3 │     │
           │   │  │   │          │   │ ◄───┘
           └───┘  └───┘          │   │ (C3 mở ra, nến M5 đục qua POC)
                  ──┬──          └───┘
          ──────────┼───────────────────── CRL (Candle Range Low)
                    ▼ (Râu C2 quét thanh khoản nhưng ĐÓNG THÂN TRONG BIÊN)
```

1. **C1 (Benchmark Candle):** Cây nến H1 trước đó. Xác lập biên trên **CRH** và biên dưới **CRL**.
2. **C2 (Manipulation / Sweep Candle):** Cây nến H1 hiện tại thò râu đâm thủng đỉnh/đáy C1 hoặc mốc HTF.  
   - **ĐIỀU KIỆN TIÊN QUYẾT BẮT BUỘC:** Thân nến C2 **PHẢI ĐÓNG CỬA NGƯỢC VÀO TRONG BIÊN CỦA C1**.
   - *Nếu thân C2 đóng ra ngoài:* Bị tính là Breakout thật $\rightarrow$ **HỦY BỎ SETUP ĐẢO CHIỀU**.
3. **C3 (Expansion / Trigger Candle):** Cây nến H1 phát động con sóng đẩy ngược chiều (Change in State of Delivery - CISD).  
   - Ngay khi C3 vừa mở ra $\rightarrow$ Switch xuống khung **M5/M3** tìm cò súng FRVP POC.
4. **C4 (Continuation / Delivery):** Cây nến tiếp diễn quán tính phi thẳng về mục tiêu biên đối diện của C1.

---

## 5. Chuẩn Hóa Kéo FRVP & Phân Tích 3 Vị Trí POC

### 5.1. Quy Tắc Kéo FRVP Cố Định (Fixed Anchor Rule)
Không kéo tù mù hay xê dịch tùy ý. Điểm neo cố định 100%:
- **Điểm bắt đầu kéo (Anchor Start):** Đặt tại **Giá Mở Cửa của nến H1 (Open H1)**.
- **Điểm kết thúc kéo (Anchor End):** Đặt tại **Đỉnh/Đáy râu quét cao nhất/thấp nhất của nến C2 trên chart M5/M3**.

```
[VỊ TRÍ A: POC CỰC TRỊ]          [VỊ TRÍ B: POC Ở GIỮA]           [VỊ TRÍ C: POC SÁT OPEN H1]
   ─── Râu Sweep High ───           ─── Râu Sweep High ───           ─── Râu Sweep High ───
   ███ POC (Kẹp volume đỉnh)                                         
   ──────────────────────           ███ POC (Equilibrium 50%)        
                                    ──────────────────────           
                                                                     ███ POC (Cản dày xuất phát)
   ─── Open H1 ──────────           ─── Open H1 ──────────           ─── Open H1 ──────────
   ⭐ SETUP A+ (VÀO NGAY)            ⚡ SETUP CHUẨN (ĐO R:R)          🛑 HẠNG C (SKIP / BỎ KÈO)
```

### 5.2. Phân Tích 3 Kịch Bản Vị Trí POC

#### Kịch Bản A: POC Nằm Ở Cực Trị (Top 25% Biên Độ Sweep) ➔ *Setup A+ (Kim Cương)*
- **Ý nghĩa:** Khối lượng kẹp hàng (Trapped Volume) tập trung 100% tại chóp nến. Phe quét râu bị hấp thụ hoàn toàn.
- **Trigger:** Nến M5 đóng cửa xuyên thủng qua POC cực trị này.
- **Entry:** Bấm lệnh Market ngay khi nến M5 đóng, hoặc đặt Limit tại POC.
- **Stop Loss:** Sau chóp râu C2 (SL siêu ngắn, chỉ 12 – 18 ticks MNQ).
- **R:R:** Đạt cực cao, từ **1:3 đến 1:5**.

#### Kịch Bản B: POC Nằm Ở Giữa Range (40% – 60% Biên Độ) ➔ *Setup Chuẩn*
- **Ý nghĩa:** Vùng cân bằng khối lượng (Equilibrium) nằm ở giữa cây nến H1.
- **Trigger:** Nến M5 đóng cửa thân nến xuyên thủng qua POC giữa.
- **Entry:** Đặt **Limit Order tại POC** đón nhịp retest nhẹ.
- **⚠️ ĐIỀU KIỆN SỐNG CÒN:** Đo khoảng cách từ POC đến Target (Biên đối diện C1).  
  - Nếu **$\ge 1:2\text{R}$** $\rightarrow$ **VÀO LỆNH**.  
  - Nếu **$< 1:2\text{R}$** $\rightarrow$ **HỦY BỎ (SKIP TRADE)**.

#### Kịch Bản C: POC Nằm Sát Giá Open H1 (Bottom 25% Biên Độ) ➔ *Hạng C (CẢNH BÁO)*
- **Ý nghĩa:** Bức tường volume cản nằm ngay vạch xuất phát. Giá rơi về rất dễ bị dội ngược lại (Rejection). Nếu đợi đục qua thì R:R bị bóp nghẹt.
- **Quy tắc cứng:** **BỎ QUA, TUYỆT ĐỐI KHÔNG VÀO LỆNH**.

---

## 6. Chiêu Thức Chủ Lực (CRT Reversal) vs Tiếp Diễn (CRT Continuation) vs Sideway

### 6.1. Chiêu Thức Chủ Lực (80% Số Lệnh): CRT Reversal
- Bản năng sát thủ: Chờ H1 quét cản HTF, C2 đóng thân trong C1, nến M5 đục qua POC $\rightarrow$ Bắn đảo chiều về biên đối diện.

### 6.2. Chiêu Thức Phụ (20% Số Lệnh): CRT Continuation (Khi Thị Trường Xu Hướng Mạnh)
- **Định nghĩa đúng:** Tuyệt đối không mua đuổi khi nến đang xanh dựng đứng. CRT Continuation **thực chất vẫn là một cú sweep nhịp hồi**:
  1. Xu hướng H4/Daily tăng mạnh rõ ràng.
  2. Nến H1 hiện tại không quét đỉnh, mà **thò râu xuống dưới quét thanh khoản đáy nhịp hồi (Retracement Sweep)** hoặc hồi về 50% Equilibrium của nến C1.
  3. Kéo FRVP nến C1 tăng trước đó $\rightarrow$ Giá chạm **POC / VAH của C1** và nến M5 rút chân xác nhận.
  4. Mở lệnh BUY thuận trend, SL dưới đáy nhịp hồi C2. Target lên đỉnh cao mới.

### 6.3. Thị Trường Sideway (Inside Bar Trên H1)
- Cây nến H1 nằm gọn gàng bên trong nến H1 trước, không chạm bất kỳ cản nào $\rightarrow$ **KHOANH TAY ĐỨNG NGOÀI, 0 LỆNH**.

---

## 7. Quản Trị Lệnh Thực Chiến (Xóa Bỏ Bẫy Dời SL Về BE)

### 7.1. Bãi Bỏ Quy Tắc Dời SL Cơ Học Cũ
> [!CAUTION]
> **BÃI BỎ TRIỆT ĐỂ:** Quy tắc dời SL về -0.5R ở +1R và dời về BE ở +2R.  
> *Lý do:* Futures (MNQ/MGC) luôn có nhịp retest cấu trúc tự nhiên trước khi bùng nổ đến +3R. Dời BE máy móc sẽ bị quét oan uổng, tạo cảm xúc tiếc nuối tột cùng $\rightarrow$ nguồn cơn trực tiếp dẫn đến hành vi nhồi vol.

### 7.2. Quy Tắc Quản Trị Lệnh Thực Tế Mới
1. **Cho lệnh không gian thở tự nhiên:** Sau khi vào lệnh, giữ nguyên Stop Loss ban đầu (sau chóp râu C2).
2. **Chỉ dời Stop Loss theo Cấu Trúc Swing Mới (Structure-Based Trailing):**  
   - Chỉ dời SL khi trên khung **M5 hình thành một Đáy Mới Cao Hơn (Higher Low)** hoặc **Đỉnh Mới Thấp Hơn (Lower High)** rõ ràng có nến xác nhận. Dời SL núp sau đáy/đỉnh cấu trúc mới này.
3. **Triết lý All-or-Nothing:** Nếu không có cấu trúc mới bảo vệ, chấp nhận để lệnh tự động chạm **Full TP ($+2\text{R}$ hoặc $+3\text{R}$)** hoặc dính **$-1\text{R}$**. Không can thiệp tay, không chốt non, không dời BE sớm.

---

## 8. Checklist Cơ Học 4 Bước Trước Khi Bấm Lệnh

| Bước | Hạng Mục Kiểm Tra | Điều Kiện Đạt | Nếu Không Đạt ➔ HÀNH ĐỘNG |
| :---: | :--- | :---: | :---: |
| **1** | **Bản Đồ HTF** | C2 quét vào **PDH/PDL, ONH/ONL hoặc FVG 1H**? | **BỎ QUA** (Quét linh tinh không đánh). |
| **2** | **Thân Nến C2** | Thân nến C2 **đóng cửa rút ngược vào trong C1**? | **BỎ QUA** (Đóng ngoài là Breakout thật). |
| **3** | **Vị Trí POC** | POC (Open H1 ➔ Râu C2) nằm ở **Cực trị** hoặc **Ở giữa**? | Nếu **Sát Open H1** ➔ **BỎ QUA**. |
| **4** | **Trigger & R:R** | Nến M5 đã **đóng qua POC** và R:R đo được **$\ge 1:2$**? | **BỎ QUA** (Không đủ R:R tuyệt đối không vào). |

---

## 9. Bảng Thông Số Hợp Đồng & Quy Mô Vị Thế (Position Sizer)

| Sản Phẩm | Bước Giá (Tick) | Giá Trị 1 Tick | Giá Trị 1 Point | Stop Loss Trung Bình (M5) | Số Lot Cho Risk $200 (Vòng 1) | Số Lot Cho Risk $100 (XFA) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **MGC** (Micro Gold) | **0.10 pt** | **$1.00** | $10.00 | **2.5 pt** (25 ticks = $25/lot) | **8 lot** ($200) | **4 lot** ($100) |
| **MNQ** (Micro Nasdaq) | **0.25 pt** | **$0.50** | $2.00 | **25.0 pt** (100 ticks = $50/lot)| **4 lot** ($200) | **2 lot** ($100) |
| **MES** (Micro S&P 500) | **0.25 pt** | **$1.25** | $5.00 | **6.0 pt** (24 ticks = $30/lot) | **6 lot** ($180) | **3 lot** ($90) |
| **MCLZ26** (Micro Dầu Thô) | **0.01 pt** | **$1.00** | $100.00 | **0.35 pt** (35 ticks = $35/lot)| **5 lot** ($175) | **2 – 3 lot** ($70 – $105) |

---
*Tài liệu này là bộ quy tắc sống còn duy nhất. Mọi lệnh giao dịch vi phạm checklist đều bị coi là hành vi phá hoại tài khoản.*
