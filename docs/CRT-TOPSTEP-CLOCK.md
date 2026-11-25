# Đồng hồ H2/H4 cho XAUUSD và US Tech 100

Cập nhật 25/11/2026. Mục tiêu: dùng chart CFD M5 để tham khảo khi giao dịch MGC/MNQ trên TopstepX, với H1 là khung chính; khi đổi anchor C1 sang H2 thì engine và cụm H2 bên phải phải cùng đọc nến đã ghép.

## Cách dùng

- Chart `OANDA:XAUUSD` hoặc `STONEXTRADING:USTECH100CFD`, M5; HTF H1, Bias D1, Larger H4 để bắt đầu.
- `H2 / H4 clock = TopstepX`: nhóm H1 theo phiên bắt đầu 17:00 `America/Chicago`, nghỉ 16:00–17:00. IANA timezone tự xử lý DST.
- Chọn HTF H2: C1/C2, cực trị INV/TGT, key H2, Early C2, nguồn SMT của nhánh đó và cụm H2 đều theo cùng đồng hồ. Cụm H4 phụ cũng dùng đồng hồ này.
- `Native`: trở lại nến H2/H4 của feed chart. H1/D1 luôn native; các mã ngoài hai feed đã nêu cũng native, tránh áp giờ CME lên crypto hoặc thị trường khác. Không nhận diện bằng chuỗi `US100`/`NAS` mơ hồ và không đổi clock theo mã SMT peer.
- Tooltip dòng TF ghi nguồn giá và chế độ giờ; không thêm một bảng chữ mới lên chart. Sau đổi phiên bản, kiểm tra Inputs và tạo lại alert nếu cần.

Ở ngày 25/11/2026, ảnh cung cấp lúc khoảng 17:13 UTC+7 khớp H2 16:00–18:00 và H4 14:00–18:00. Đây là đối chiếu giờ trong ảnh, chưa phải kiểm chứng OHLC futures. Mùa DST, các mốc UTC+7 dịch một giờ; không cộng cố định 12 hoặc 13 giờ trong mã.

## Giới hạn dữ liệu

Nến vẫn là **giá feed chart được nhóm lại**: OANDA XAUUSD khi tham khảo MGC, hoặc StoneX US Tech 100 CFD khi tham khảo MNQ. Không tải dữ liệu futures có phí và không quy đổi CFD thành futures. Cùng mốc giờ không bảo đảm cùng wick, close, TS hay kết quả CRT. Dùng TopstepX làm nơi xác nhận mức giá, setup và khớp lệnh thực tế.

Chỉ mô phỏng lịch phiên thường. Không có lịch nghỉ lễ/đóng sớm CME: trong các ngày này phải đối chiếu TopstepX trực tiếp. Phiên cuối H4 thường chỉ có ba giờ (13:00–16:00 CT), không kéo nến qua giờ nghỉ. D1 giữ nguyên feed, không tuyên bố đã đồng bộ settlement hoặc mọi phiên D1 futures.

## Quy tắc thực thi

1. Engine chỉ nhận các H1 đã đóng, ghép đủ khoảng của H2/H4 mới xử lý model. Open lấy đầu tiên, High/Low gồm toàn bộ râu, Close lấy cuối cùng. MGC và MNQ đều có phiên thường 17:00–16:00 CT theo thông số CME; đây là clock mục tiêu, không phải giờ native của CFD.
2. Bỏ bucket đầu thiếu phần mở; thiếu H1 trong phiên thì không tạo nến hoàn chỉnh hoặc nối hai nến xa nhau thành C1/C2. Khoảng nghỉ thường và cuối tuần được phân biệt với thiếu dữ liệu trong phiên.
3. Key và bối cảnh trước C2 được cố định theo cùng mốc nguồn. Không lấy hình dạng cuối cùng của H2/H4 đang chạy để xác nhận setup trong quá khứ.
4. Nến live dùng riêng để hiển thị. Trên M5 ghép từ nến chart; khi đang xem chart native H2/H4 có biên khác, preview lấy H1 bằng `lookahead_off`. Early chỉ lấy thành viên C1 đã đóng, không lấy OHLC live tương lai.
5. Chart chính được nhận diện bằng `timeframe.main_period`; nguồn SMT giữ nhận diện chart bằng `syminfo.main_tickerid`, tránh đổi nhầm HTF khi request chuyển sang H1.
6. View HTF cũng dùng snapshot đã đóng như LTF; cập nhật khi có dữ liệu nguồn kế tiếp. Đồng hồ đếm ngược bám lịch đóng bucket, không lấy giờ đóng native H2/H4 của OANDA.

## Nghiệm thu

Bộ `crt-session-clock.cjs` thực thi thân hàm giờ/feed/key trên dữ liệu dựng: giờ mùa đông/mùa hè, DST, qua tháng/năm, cuối tuần, giờ nghỉ, phiên cuối ba giờ, thiếu H1, C1/C2 Buy/Sell, wick OHLC và tương đương key native. `crt-entry-call-equivalence.cjs` đối chiếu 4.224 bước Early trước/sau gộp call site; đây không phải backtest tỷ lệ thắng.

Full compiler và runtime trong Brave phải có báo cáo riêng gắn hash. Không dùng kết quả `translate_light`, kết quả của hash cũ hoặc các ca offline thay cho hai bước này.

[Báo cáo nghiệm thu bản đồng hồ](research/crt-topstep-clock-validation-2026-11-25.json): 33 suite đạt; full compiler không lỗi, còn một cảnh báo CW10003 ở vòng gọi Early C2. Đã kiểm tra trong cửa sổ Brave riêng: H1/M5, H2/M5 ở cả Native và TopstepX, chart H2 trực tiếp và tổng quan D1. H2/H4 TopstepX đóng lúc 00:00/02:00 UTC+7 trong lần quan sát 22:32; Native đóng lúc 23:00/01:00. Đây là kiểm tra chạy và đồng hồ, không phải đánh giá tỷ lệ thắng hoặc chứng minh mọi tín hiệu đúng.

Phần vẽ đã thu gọn còn CRTH, CRTL, EQ, INV và key; TGT gộp vào đầu đối diện C1 để không vẽ trùng giá. Cặp C1–C2 được giữ riêng với diễn biến phía sau; nến LAST giữ cùng màu wick/body và độ mờ. Vị trí bắt đầu line dùng thời điểm wick trong cache chart; khi nguồn cũ nằm ngoài cache, dùng thời điểm mở nến HTF. Tên cụm và đồng hồ giữ ngắn; hover tên cụm xem giờ nguồn và OHLC. Các input được ẩn khỏi status line nhưng vẫn có đủ trong Inputs.

Các export model bỏ trường trùng đã được đối chiếu 1.801 trường hợp; cách gọi Early trước/sau tối ưu được đối chiếu 4.224 bước. Mặc định vẫn Light/150 chart bars; tăng lịch sử có thể vượt hạn mức tài khoản. Cấu hình Full chưa được nghiệm thu lại trên chart trong đợt này.

### Bổ sung US Tech 100 CFD / MNQ

Bản đầu chỉ bật clock cho OANDA:XAUUSD. Vì vậy dù Inputs chọn TopstepX, StoneX vẫn đi vào nhánh Native. Đã bổ sung chính xác `STONEXTRADING:USTECH100CFD` vào điều kiện dùng chung cho engine, keys, Early, SMT và hai cụm; tooltip TF cũng đọc cùng điều kiện này. Không thay công thức entry.

Đối chiếu ngày 25/11/2026: chart MNQZ26 trên TopstepX lúc 22:56 UTC+7 còn khoảng 1 giờ 3 phút cho H2 (đóng 00:00), còn CFD bản cũ chỉ khoảng 3 phút (đóng 23:00). Sau sửa, trên StoneX M5 với anchor H2, lúc 23:00 cụm H2 còn khoảng 59 phút và H4 còn 2 giờ 59 phút; tooltip H2 ghi rõ nguồn 22:00–00:00. Chuyển Native trên cùng mã sau 23:00 cho H2 đóng 01:00 và H4 đóng 03:00. Hai chế độ thực sự ghép khoảng OHLC khác nhau, không chỉ đổi chữ countdown.

[Báo cáo bổ sung StoneX](research/crt-stonex-clock-validation-2026-11-25.json) ghi hash riêng. Test chính sách gồm 48 tổ hợp mã/clock/timeframe để giữ nguyên XAUUSD, H1/D1 và các mã không hỗ trợ. Chưa chứng minh OHLC hoặc mọi setup của CFD trùng MNQ futures.

Nguồn: [giờ Micro Gold — CME](https://www.cmegroup.com/markets/metals/precious/e-micro-gold), [Micro E-mini Nasdaq-100 — thông số CME](https://www.cmegroup.com/trading/equity-index/files/cme-micro-e-mini-futures-fact-card.pdf), [định danh feed StoneX trên TradingView](https://www.tradingview.com/symbols/STONEXTRADING-USTECH100CFD/), [timezone/DST — TradingView](https://www.tradingview.com/pine-script-docs/concepts/time/), [ngữ cảnh timeframe và ticker — TradingView](https://www.tradingview.com/pine-script-docs/concepts/chart-information/), [gộp request và chi phí xử lý — TradingView](https://www.tradingview.com/pine-script-docs/writing/profiling-and-optimization/).
