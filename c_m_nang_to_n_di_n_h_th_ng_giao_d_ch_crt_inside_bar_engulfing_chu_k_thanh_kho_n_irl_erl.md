# CẨM NANG TOÀN DIỆN: HỆ THỐNG GIAO DỊCH CRT (INSIDE BAR & ENGULFING) VÀ CHU KỲ THANH KHOẢN IRL $\longleftrightarrow$ ERL

> Hiệu đính 16/11/2026: đây là cẩm nang tham khảo. Các quy tắc EGF/FVG và IRL được làm rõ tại [EGF khi không có FVG](docs/EGF-INTERNAL-REFERENCES.md); đoạn Pine minh họa phía dưới là mã cũ, không dùng làm chỉ báo hiện hành.

---

## PHẦN 1: NỀN TẢNG THANH KHOẢN (IRL & ERL FRAMEWORK)

Trong hệ thống **ICT (Inner Circle Trader)** và **CRT (Candle Range Theory)**, IRL/ERL là khung tổ chức kịch bản giá bên trong/bên ngoài một range đã chọn; không phải quy luật buộc mọi chuyển động phải tuần hoàn.

### 1.1. Định nghĩa cốt lõi
* **ERL (External Range Liquidity – Thanh khoản ngoài biên):**
  * **Cấu tạo:** Là các đỉnh/đáy cấu trúc rõ ràng bên ngoài biên độ giá hiện tại (Swing High/Low, Old High/Low, Daily/H4 High-Low).
  * **Thành phần:** Gồm **BSL (Buy-side Liquidity)** trên đỉnh cũ và **SSL (Sell-side Liquidity)** dưới đáy cũ (nơi tập trung Stop Loss và lệnh Breakout).
  * **Vai trò:** Là **Mục tiêu thanh lý (Target)** cuối cùng của dòng tiền thông minh.
* **IRL (Internal Range Liquidity – Thanh khoản trong biên):**
  * **Cấu tạo:** IRL được xét tương đối với range và timeframe: gồm thanh khoản tại đỉnh/đáy nội bộ hoặc mất cân bằng như **FVG**. **OB** được ghi riêng là vùng phản ứng. **EQ** là 50% range; **CE** là trung điểm FVG đang xét. EQ/CE không tự tạo thành một vùng thanh khoản mới.
  * **Vai trò:** Là **Điểm tựa / Bệ phóng (Springboard)** để giá tái cân bằng và nạp nhiên liệu cho nhịp đẩy kế tiếp.

### 1.2. Chu kỳ chuyển động tuần hoàn: $\text{ERL} \longleftrightarrow \text{IRL}$

```text
               [ ERL: Swing High / Old High (BSL) ]
                               ▲             │
                      (Pha 2:  │             │ (Pha 1:
                      Expansion)             │  Retracement)
                               │             ▼
                 [ Internal reference: FVG / internal stops ]
                               ▲             │
                      (Pha 1:  │             │ (Pha 2:
                      Retracement)           │  Expansion)
                               │             ▼
               [ ERL: Swing Low / Old Low (SSL) ]
```

* **Nguyên tắc vàng (ChartTactix Framework):** *"Nếu giá đã phản ứng từ một IRL nhưng chưa quét ERL tương ứng, chúng ta tiếp tục kỳ vọng giá di chuyển về phía ERL đó, ngay cả sau khi đã có một pha quét đỉnh/đáy ngắn hạn (Daily High-Low Sweep)."*
* Nhịp quét nội bộ không tự đổi mục tiêu; nhưng target vẫn có điều kiện và phải đánh giá lại khi cấu trúc/mức vô hiệu thay đổi.

---

## PHẦN 2: SO SÁNH HAI MÔ HÌNH NẾN CỐT LÕI (ENGULFING VS INSIDE BAR)

| Tiêu chí | Engulfing / Outside Bar (Bao trùm) | Inside Bar (Nến mẹ bồng con) |
| :--- | :--- | :--- |
| **Hình thái** | Engulfing: thân nến sau bao trùm thân nến trước. Outside: High cao hơn và Low thấp hơn nến trước. Ghi rõ hình thái đang xét. | Nến sau (Inside Bar) nằm gọn hoàn toàn trong High – Low của nến trước (Mother Bar). |
| **Trạng thái thị trường** | **Expansion** (Mở rộng biên độ, chủ động quét thanh khoản). | **Contraction / Consolidation** (Thu hẹp biên độ, nén lò xo, tích lũy lệnh). |
| **Cấu trúc thanh khoản** | EGF thân và Outside High–Low là hai hình thái khác nhau. Có thể đi kèm quét mức tham chiếu, nhưng không mặc định tạo FVG. FVG cần ba nến riêng đã xác nhận. | Nến mẹ (`Mor-H/L`) là **ERL** của Dealing Range; Nến con (`Isb-H/L`) là **IRL** nội bộ. |
| **Chu trình hành vi giá** | Kịch bản có điều kiện: phản ứng tại FVG/OB hoặc quét-reclaim thanh khoản nội bộ, có xác nhận hướng rồi mới kỳ vọng ERL. Không có reference rõ ràng thì chờ. | $\text{Tích lũy nén} \longrightarrow \text{Quét IRL nội bộ} \longrightarrow \text{Bắn phá ERL}$. |
| **Tốc độ & Xác nhận** | Di chuyển nhanh, dứt khoát bằng nến thân dài (Displacement). | Di chuyển chậm hơn, cần quan sát bẫy râu ở nến thứ 3 và xác nhận CISD trên LTF. |

---

## PHẦN 3: MA TRẬN LOGIC PHÂN NHÁNH INSIDE BAR (MOTHER BAR – INSIDE BAR)

Xét cặp nến HTF gồm **Mother Bar (`Mor`)** đứng trước và **Inside Bar (`Isb`)** đứng sau:
$$\text{Mor-L} < \text{Isb-L} < \text{Isb-H} < \text{Mor-H}$$

### 3.1. Cơ chế kích hoạt ở cây nến thứ 3
* **Để giá đi LÊN ($\uparrow$):**
  * **Kịch bản Sweep (Đảo chiều / Lấy đà):** Giá thò râu quét qua đáy (`Sweep Mor-L` hoặc `Sweep Isb-L`) để gom thanh khoản Sell-side, sau đó rút chân đóng nến ngược vào trong.
  * **Kịch bản Breakout (Tiếp diễn):** Giá có xung lực mạnh, thân nến đóng vượt dứt khoát qua đỉnh (`Break Mor-H` hoặc `Break Isb-H`).
* **Để giá đi XUỐNG ($\downarrow$):**
  * **Kịch bản Sweep (Đảo chiều / Lấy đà):** Giá thò râu quét qua đỉnh (`Sweep Mor-H` hoặc `Sweep Isb-H`) để kích hoạt bẫy Buy-side, sau đó rút chân đóng nến ngược vào trong.
  * **Kịch bản Breakout (Tiếp diễn):** Giá có xung lực mạnh, thân nến đóng thủng dứt khoát qua đáy (`Break Mor-L` hoặc `Break Isb-L`).

### 3.2. Bảng trọng số xác suất theo Bias HTF
1. **Thuận Bias (`Bias ↑` + `Mor ↑` hoặc `Bias ↓` + `Mor ↓`):** Nến mẹ đang có đà mạnh. Giá thường chỉ cần `Sweep Isb` (quét IRL nội bộ) hoặc `Break Mor` trực tiếp để tiếp diễn xu hướng.
2. **Nghịch Bias (`Bias ↑` + `Mor ↓` hoặc `Bias ↓` + `Mor ↑`):** Nến mẹ đóng vai trò là nhịp hồi (Retracement). Tín hiệu tối ưu nhất là đợi cây nến thứ 3 thực hiện cú **Sweep qua cực trị của nến mẹ** (`Sweep Mor-L` khi Bias tăng, `Sweep Mor-H` khi Bias giảm) để tạo mô hình Turtle Soup đảo chiều kết thúc nhịp hồi.

---

## PHẦN 4: CÁC BIẾN THỂ ĐẶC BIỆT & VỊ TRÍ TRONG CẤU TRÚC LỚN

### 4.1. Vị trí xuất hiện của Inside Bar tương quan với IRL/ERL cấu trúc
1. **Xuất hiện TRƯỚC KHI chạm IRL (Trên đường hồi phục):** Inside Bar là trạm dừng tiếp nhiên liệu (Pre-mitigation Pause). Giá thường quét nhẹ một đầu nến con rồi bứt phá phóng thẳng vào vùng FVG (IRL) của cấu trúc lớn.
2. **Xuất hiện NGAY TẠI IRL (Nằm lọt trong FVG lớn):** Smart Money hấp thụ lệnh âm thầm thay vì đảo chiều ngay như Engulfing. Cây nến thứ 3 thường thò râu nhúng sâu hơn vào FVG (quét `Isb-H/L`), sau đó rút chân kích hoạt chu trình xả/đẩy thẳng về **ERL của cấu trúc lớn**.
3. **Xuất hiện SAU KHI đã phản ứng từ IRL (Đang trên đường về ERL):** Là pha tái phân phối (Re-distribution). Không mặc định đảo chiều chỉ vì Inside Bar; phải đánh giá lại nếu cấu trúc hoặc mức vô hiệu bị phá.

### 4.2. Sự đan xen giữa Inside Bar và Engulfing
* **Inside Bar $\longrightarrow$ Engulfing (Mô hình Hikkake / Turtle Soup kép):** Cây nến thứ 3 thò râu phá vỡ biên nến con để bẫy phe Breakout, sau đó giật ngược chiều nuốt trọn cả nến con (và có thể nuốt cả nến mẹ). Đây là vị trí theo dõi đảo chiều, cần xác nhận; chưa có kiểm định để xếp hạng xác suất.
* **Engulfing $\longrightarrow$ Inside Bar:** Cây Engulfing vừa tiêu tốn nhiều năng lượng để mở rộng biên độ nên thị trường cần nghỉ ngơi. Lúc này, **cây Engulfing trở thành Mother Bar mới**. Chia đôi cây Engulfing làm mốc cân bằng $50\%$; nếu các nến con giữ vững trên/dưới mốc $50\%$ này, xu hướng của cây Engulfing sẽ tiếp diễn.

### 4.3. Nhiều nến Inside Bar lồng nhau (Nested Inside Bars / Coiling)
* Khi có 2, 3 hoặc nhiều nến con liên tiếp nằm gọn trong cây nến mẹ ban đầu, thị trường đang nén lò xo cực đại và tích tụ thanh khoản dừng lỗ khổng lồ ở cả hai đầu `Mor-H` và `Mor-L`.
* **Quy tắc:** Giữ nguyên `Mor-H` và `Mor-L` của cây mẹ đầu tiên làm ranh giới ERL; bỏ qua giao dịch bên trong vùng nén. Chờ một cú quét râu qua biên nến mẹ kèm xác nhận LTF hoặc một pha đóng nến bứt phá dứt khoát để ăn trọn sóng Expansion lớn.

---

## PHẦN 5: WORKFLOW THỰC CHIẾN HTF $\longrightarrow$ LTF & QUẢN TRỊ R:R

### 5.1. Phân biệt Sweep thật và Breakout thật trên HTF
* **Kịch bản SWEEP (Đảo chiều / Turtle Soup):**
  * **HTF:** Thân nến đóng ngược vào trong biên nến trước, chỉ để lại râu nến (Wick) thò ra ngoài hấp thụ thanh khoản.
  * **LTF (M15/M5/M1):** Giá vượt biên HTF nhưng không giữ được cấu trúc, lập tức đảo chiều mạnh tạo **CISD / MSS** kèm theo **FVG hoặc OB** mới.
* **Kịch bản BREAKOUT THẬT (Tiếp diễn):**
  * **HTF:** Thân nến đóng dứt khoát hoàn toàn bên ngoài mốc High/Low của nến mẹ, đi kèm khối lượng lớn.
  * **LTF (M15/M5/M1):** Giá phá vỡ biên tạo chuỗi đỉnh/đáy mới, không quay đầu vào Range cũ mà hồi nhẹ retest lại **Breakout FVG / Breaker Block** ngay tại biên vừa phá.

### 5.2. Ma trận thiết lập Entry, Stop Loss (SL), Take Profit (TP) & R:R

| Thông số | Kịch bản SWEEP (Đảo chiều) | Kịch bản BREAKOUT (Tiếp diễn) |
| :--- | :--- | :--- |
| **Điểm Entry (LTF)** | Limit tại **FVG / OB** hình thành ngay sau nhịp CISD đảo chiều. | Limit tại **Breakout FVG / Breaker Block** khi giá retest biên vừa phá. |
| **Stop Loss (SL)** | Vượt qua đỉnh/đáy của râu quét LTF (hoặc neo tại mức Fibo mở rộng **`-0.27` đến `-0.5`** ngoài biên Range). | Đặt sau Swing Point gần nhất của LTF hoặc thụt vào trong biên Inside Bar (`Isb-H/L`). |
| **Take Profit 1 (TP1)** | **Midpoint (50% Range)** của cây Mother Bar (Chốt 50% khối lượng & dời SL về hòa vốn - BE). | Đỉnh/đáy cấu trúc Swing HTF kế tiếp. |
| **Take Profit 2 (TP2)** | **ERL đối diện** của cây Mother Bar (`Mor-H` hoặc `Mor-L`) hoặc ERL của cấu trúc lớn. | **Measured Move** (Đo bằng $100\%$ chiều cao của Mother Bar phóng ra ngoài điểm phá vỡ). |
| **Tỷ lệ R:R kỳ vọng** | **1:3 đến 1:5+** (Nhờ bóp nhỏ SL trên LTF và ăn trọn biên độ HTF). | **1:1.5 đến 1:2.5** (Tỷ lệ thắng cao khi đánh thuận Bias HTF). |

---

## PHẦN 6: MÃ NGUỒN CHỈ BÁO TỰ ĐỘNG TRADINGVIEW (PINE SCRIPT V5)

Chỉ báo **CRT Dual Engine** tích hợp tự động nhận diện cả hai mô hình Inside Bar và Engulfing, vẽ FVG (IRL), đánh dấu ERL cấu trúc và phát cảnh báo (Alerts) theo thời gian thực.

```pinescript
//@version=5
indicator("CRT Dual Engine: Inside Bar & Engulfing (IRL-ERL)", overlay=true, max_boxes_count=500, max_labels_count=500, max_lines_count=500)

// ==================== INPUTS ====================
grp_isb       = "Cấu hình Inside Bar"
showISB       = input.bool(true, "Bật Inside Bar Engine", group=grp_isb)
showISBMid    = input.bool(true, "Hiện Midpoint 50% nến Mẹ", group=grp_isb)

grp_egf       = "Cấu hình Engulfing / Outside Bar"
showEGF       = input.bool(true, "Bật Engulfing Engine", group=grp_egf)
showFVG       = input.bool(true, "Tự động vẽ FVG (IRL) sau Egf", group=grp_egf)

grp_erl       = "Cấu hình Thanh khoản cấu trúc ERL"
swingLength   = input.int(10, "Độ dài Swing High/Low", group=grp_erl)

// ==================== 1. TRACK ERL (SWING POINTS) ====================
pLow  = ta.pivotlow(low, swingLength, swingLength)
pHigh = ta.pivothigh(high, swingLength, swingLength)

var float erlSellside = na
var float erlBuyside  = na

if not na(pLow)
    erlSellside := pLow
if not na(pHigh)
    erlBuyside  := pHigh

plot(erlBuyside, "Buy-side ERL", color=color.new(color.green, 40), linewidth=1, style=plot.style_linebr, offset=-swingLength)
plot(erlSellside, "Sell-side ERL", color=color.new(color.red, 40), linewidth=1, style=plot.style_linebr, offset=-swingLength)

// ==================== 2. INSIDE BAR ENGINE ====================
isInsideBar = high[1] <= high[2] and low[1] >= low[2]
mor_H   = high[2]
mor_L   = low[2]
mor_Mid = (mor_H + mor_L) / 2
isb_H   = high[1]
isb_L   = low[1]
morBull = close[2] > open[2]

// Nhận diện hành vi kích hoạt nến hiện tại
sweep_Mor_L = isInsideBar[1] and low < mor_L and close > mor_L
sweep_Isb_L = isInsideBar[1] and low < isb_L and low >= mor_L and close > isb_L

sweep_Mor_H = isInsideBar[1] and high > mor_H and close < mor_H
sweep_Isb_H = isInsideBar[1] and high > isb_H and high <= mor_H and close < isb_H

break_Mor_H = isInsideBar[1] and close > mor_H
break_Mor_L = isInsideBar[1] and close < mor_L

if showISB and isInsideBar
    bColor = morBull ? color.new(color.teal, 88) : color.new(color.orange, 88)
    lColor = morBull ? color.teal : color.orange
    box.new(left=bar_index[2], top=mor_H, right=bar_index, bottom=mor_L,
            border_color=lColor, border_width=1, bgcolor=bColor)
    if showISBMid
        line.new(x1=bar_index[2], y1=mor_Mid, x2=bar_index, y2=mor_Mid,
                 color=color.gray, style=line.style_dotted)

if showISB and isInsideBar[1]
    if sweep_Mor_L
        label.new(bar_index, low, "ISB: Sweep Mor-L\nTarget: ERL ↑", style=label.style_label_up, color=color.green, textcolor=color.white)
    else if sweep_Isb_L
        label.new(bar_index, low, "ISB: Sweep Isb-L\nTarget: Mor-H ↑", style=label.style_label_up, color=color.teal, textcolor=color.white)

    if sweep_Mor_H
        label.new(bar_index, high, "ISB: Sweep Mor-H\nTarget: ERL ↓", style=label.style_label_down, color=color.red, textcolor=color.white)
    else if sweep_Isb_H
        label.new(bar_index, high, "ISB: Sweep Isb-H\nTarget: Mor-L ↓", style=label.style_label_down, color=color.maroon, textcolor=color.white)

    if break_Mor_H
        label.new(bar_index, high, "ISB: Break Mor-H (Exp ↑)", style=label.style_label_lower_left, color=color.blue, textcolor=color.white)
    if break_Mor_L
        label.new(bar_index, low, "ISB: Break Mor-L (Exp ↓)", style=label.style_label_upper_left, color=color.purple, textcolor=color.white)

// ==================== 3. ENGULFING / OUTSIDE BAR ENGINE ====================
isOutsideBar = high[1] > high[2] and low[1] < low[2]
isBullEgf    = isOutsideBar and close[1] > open[1]
isBearEgf    = isOutsideBar and close[1] < open[1]

if showEGF and isOutsideBar
    egfColor  = isBullEgf ? color.new(color.green, 90) : color.new(color.red, 90)
    egfBorder = isBullEgf ? color.green : color.red
    box.new(left=bar_index[1], top=high[1], right=bar_index + 3, bottom=low[1],
            border_color=egfBorder, border_width=1, bgcolor=egfColor)

    if isBullEgf
        label.new(bar_index[1], high[1], "EGF Bullish\n(ERL Swept ↓)", style=label.style_label_down, color=color.green, textcolor=color.white, size=size.small)
    if isBearEgf
        label.new(bar_index[1], low[1], "EGF Bearish\n(ERL Swept ↑)", style=label.style_label_up, color=color.red, textcolor=color.white, size=size.small)

// Phát hiện và vẽ FVG (IRL) do nhịp Engulfing tạo ra
bullishFVG = showFVG and (low[0] > high[2]) and isBullEgf[1]
bearishFVG = showFVG and (high[0] < low[2]) and isBearEgf[1]

if bullishFVG
    box.new(left=bar_index[1], top=low[0], right=bar_index + 5, bottom=high[2],
            border_color=color.green, bgcolor=color.new(color.green, 80))
    label.new(bar_index, (low[0] + high[2])/2, "IRL (Bull FVG)\nChờ Retest -> ERL ↑",
              style=label.style_label_left, color=color.green, textcolor=color.white, size=size.tiny)

if bearishFVG
    box.new(left=bar_index[1], top=low[2], right=bar_index + 5, bottom=high[0],
            border_color=color.red, bgcolor=color.new(color.red, 80))
    label.new(bar_index, (low[2] + high[0])/2, "IRL (Bear FVG)\nChờ Retest -> ERL ↓",
              style=label.style_label_left, color=color.red, textcolor=color.white, size=size.tiny)

// ==================== 4. ALERTS DEFINITIONS ====================
alertcondition(sweep_Mor_L or sweep_Isb_L, title="Alert ISB Sweep Long", message="Inside Bar Sweep Đáy -> Kỳ vọng tăng lên ERL/Mor-H!")
alertcondition(sweep_Mor_H or sweep_Isb_H, title="Alert ISB Sweep Short", message="Inside Bar Sweep Đỉnh -> Kỳ vọng giảm về ERL/Mor-L!")
alertcondition(break_Mor_H or break_Mor_L, title="Alert ISB Breakout", message="Inside Bar Phá vỡ biên -> Tiếp diễn đà Expansion!")
alertcondition(isOutsideBar, title="Alert Engulfing Created", message="Xuất hiện nến Engulfing/Outside Bar HTF -> Chờ phản ứng tại IRL (FVG)!")
alertcondition(bullishFVG or bearishFVG, title="Alert IRL FVG Formed", message="Đã hình thành vùng IRL (FVG) sau Engulfing -> Chuẩn bị canh Entry!")
```
