# Bộ ảnh minh họa ngày 17/11/2026

Hiệu chỉnh theo yêu cầu người dùng: các ảnh CRT và range/mother đã thay bằng bản có điểm neo đầu râu. Bổ sung hai ảnh nến riêng EGF và ISB bên dưới, thay thế ảnh đường giá tổng quát trong hướng dẫn fibo. Không thay logic Pine.

Dùng **imagegen built-in**. Đây là ảnh giả định để học quy trình, không phải dữ liệu thị trường hoặc screenshot chứng minh thuật toán đã chạy. Ảnh có thể sai lệch khoảng cách/chi tiết nhỏ do AI dựng; dùng mức số và công thức trong tài liệu để đo giá thực tế, không đo pixel trên ảnh. Bản cuối được lưu trong workspace; các bản nháp không đưa vào tài liệu.

## 1. CRT fibo và Early C2

Tệp: [crt-fibo-early-c2.png](images/crt-fibo-early-c2.png).

Prompt bàn giao:

> Create a Vietnamese educational infographic, wide 16:9, white background, navy headings and restrained red/teal candlesticks. Title CRT SELL · FIBO & EARLY C2. Two panels: confirmed HTF CRT Sell and provisional Early C2. Confirmed panel has C1 range, C2 wick above High C1 and close inside C1, C3 pullback then decline. Fibo 0 at High C2 is SL, 1 at Low C1 is TP, 0.1 ET2 blue above 0.2 ET1 teal, 0.4 break, 0.6 BE, 0.8 TL. Early panel is explicitly C2 đang chạy, with key HTF before event, true raid of High C1, LTF close reclaim, MSS or CISD, then ET reaction. Draw an actual swing low BEFORE the raid, extend its level to the later candle that breaks it; never label a new low without a left-hand reference as MSS. Show no-ET/no-chase, no widening SL after entry, LTF sweep is not automatically HTF sweep. No real prices, no profits, synthetic illustration.

Hiệu chỉnh đã thực hiện: inset LTF có swing nguồn trước MSS và mũi tên reclaim riêng; không dùng hình một nhịp giảm trơn để giả MSS.

## 2. Range chính và cụm kích hoạt

Tệp: [model-context-priority.png](images/model-context-priority.png).

Prompt bàn giao:

> Create a Vietnamese educational infographic titled EGF / ISB · RANGE CHÍNH & CỤM KÍCH HOẠT. Three independent panels: EGF followed by inside candles fully contained in its mother range; inside bar then an opposite-color engulfing that engulfs only the child while staying inside the original mother; false break above mother then close inside. Mother boundaries use HIGH-LOW including wicks, not body edges. Preserve mother when smaller patterns appear. Bottom workflow: key HTF before event → liquidity event → direction/bias → target still valid → LTF confirmation → entry plan. Newest is not automatically best; unresolved conflicting patterns mean wait. Synthetic candles, no win-rate ranking, white/navy professional layout, readable Vietnamese.

Hiệu chỉnh đã thực hiện: biên mother được căn lại với râu và nến con ở ví dụ giữa đổi sang đỏ để EGF xanh thể hiện cặp ngược màu.

## 3. Neo fibo EGF và ISB

Tệp: [fibo-egf-isb.png](images/fibo-egf-isb.png).

Prompt bàn giao:

> Create a Vietnamese synthetic diagram FIBO SELL · NEO THEO KỊCH BẢN, three cards. EGF reaction at HTF OB/FVG: 0 at reaction invalidation, 1 at chosen ERL. ISB false break: 0 at false-break extreme, 1 at opposite mother boundary. ISB breakout Sell: mother above, break below then retest, 0 at local breakout invalidation, 1 at external liquidity BELOW mother, never the opposite mother boundary against the trade. Blue ET2 0.1 is closer to SL than teal ET1 0.2. For each card place ET at y0 + r × (y1 − y0), keeping anchors unchanged; labels must not overlap. Preserve conditions: ET is a waiting location, no sweep means do not call 0 a sweep high, no automatic adding two entries. White background, navy titles, large Vietnamese text, price-path sketches only, no real prices or backtest claims.

Hiệu chỉnh đã thực hiện: ET kéo lại gần SL theo tỷ lệ; bản đồ giá thực tế luôn dùng `SL + r × (TP − SL)`, không dùng tỷ lệ pixel của sơ đồ AI.

## 4. Fibo EGF Sell và Buy — bản nến

Tệp: [fibo-egf-buy-sell.png](images/fibo-egf-buy-sell.png). Công cụ: imagegen built-in.

Prompt bàn giao:

> Create a Vietnamese educational candlestick infographic FIBO EGF · SELL & BUY. Two panels with visible upper/lower wicks, fictional prices, no OHLC tables. Every anchor circle is at an actual wick tip, never a body edge. Sell example: reaction High110 is SL0, ET2=109, ET1=108, prior ERL Low100 is TP1. Buy: reaction Low100 is SL0, ET2=101, ET1=102, prior ERL High110 is TP1. Fibo maps actual reaction invalidation to chosen ERL, not automatically two ends of the EGF candle. Show an HTF reaction zone and engulfing bodies. Wait for LTF confirmation, ET pullback and reaction. Hollow source circles at wick extremes; no wick extends beyond its own anchor. White/navy professional layout, no profit claims.

Hiệu chỉnh: bỏ bảng OHLC do AI tự thêm, giữ chart và chú giải neo bằng râu. Giá là ví dụ giả định, không phải dữ liệu giao dịch.

## 5. Fibo ISB false break và breakout — bản nến

Tệp: [fibo-isb-falsebreak-breakout.png](images/fibo-isb-falsebreak-breakout.png). Công cụ: imagegen built-in.

Prompt bàn giao:

> Create FIBO ISB · FALSE BREAK & BREAKOUT, two accurate synthetic candlestick panels. Sell false break: mother High108 Low100 includes both wicks; source body102..106 stays inside. Later wick sweeps110 and closes inside mother. SL0 at sweep wick110, ET2=109, ET1=108, TP1 at mother lower wick100. Buy breakout: mother High106 Low100 including wicks, close above106, later retest lower wick105 and close above106. SL0 at that local retest wick105, ET2=106, ET1=107, TP1 at prior ERL high wick115 outside mother. All High/Low anchors use hollow circles at wick tips. Target for breakout is outside range in breakout direction, not opposite mother boundary. Wait for LTF confirmation and ET reaction; ET levels do not automatically split orders. White/navy readable Vietnamese, fictional prices, no backtest claims.

Ảnh CRT được sửa riêng để C1 có râu trên/dưới rõ và Low C1 kết thúc đúng tại TP; ảnh range/mother đánh dấu cả sáu cực trị mother bằng vòng tròn. Không lấy mép thân thay cho High/Low.
