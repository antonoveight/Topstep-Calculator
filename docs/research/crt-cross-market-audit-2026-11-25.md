# Rà soát tín hiệu ngược nhịp và thiếu entry — 25/11/2026

Ghi chú phiên bản: các phát hiện bên dưới mô tả nguồn trước đợt sửa này (HEAD 318b1a6). Sau khi được duyệt, đã thay bộ chặn delivery bằng quan sát, siết cấu trúc counter và bổ sung key tuần đã đóng. Quy tắc hiện hành nằm trong `../CRT-FIRST-LEG-SPEC.md` và `../INDICATOR-SETTINGS.md`; ca kiểm tra đã được cập nhật để bảo vệ hành vi mới.

Phạm vi: bốn ảnh XAUUSD/OANDA, EURUSD/FOREXCOM và USTECH/StoneX; mã nguồn hiện tại; ca OHLC được dựng để chạy trực tiếp thân hàm Pine qua harness. Đây chưa phải kiểm định tần suất, lợi nhuận hoặc tỷ lệ thắng trên dữ liệu ba thị trường.

## Kết quả có thể xác nhận từ nguồn và kiểm tra

1. **Bias D1 không phải bộ chặn tuyệt đối.** `CRT reversal at prior HTF key` mặc định bật. Khi setup CRT ngược bias có key bối cảnh trước C2 và TS/P3 phản ứng tại key HTF hợp lệ, entry vẫn được cho phép. Ca kiểm tra đối xứng Buy/Sell phát TS_CLOSE và MPS_OTE ngược bias; tắt tùy chọn này thì cả hai bị chặn. Các dấu Buy trên một đoạn giảm vì thế chưa chứng minh lỗi đảo màu hoặc đảo hướng. Cần tooltip lịch sử để xác nhận nguồn, loại nhánh và key của từng dấu.

2. **Điều kiện TS close rộng hơn chuỗi MPS.** Khi chưa có cặp pivot P1/P2 theo thứ tự, nguồn vẫn cho phép TS từ hai nến liền kề: quét một phía, đóng lại trong range nến trước và có màu phản ứng. Nếu có key hợp lệ, TS_CLOSE có thể phát mà không có MPS. Chọn Structure M15 không biến TS close thành xác nhận M15: nó đổi pivot/cross dùng cho MPS; TS/FVG/OTE vẫn thực thi trên chart. Ca kiểm tra không có pivot và ca không có close M15 đều tái hiện TS_CLOSE, không MPS.

3. **All branches không đồng nghĩa một dấu cho một nhịp.** TS, FVG và OTE có ngân sách riêng. Fresh reaction có thể bắt đầu thêm một nhịp TS; main, higher và Early có các nguồn/trạng thái riêng. Ca cùng một leg phát TS_CLOSE rồi MPS_OTE; TS close chỉ phát một. Điều này không phải bằng chứng từng dấu trùng trong ảnh có cùng nguồn, nhưng giải thích vì sao đổi sang All có thể tăng mật độ. Không có cơ chế gộp mọi model/khung thành một sóng chung.

4. **KEY DELIVERED mạnh hơn “CRT đã TP”.** Khi TS đóng, nguồn chọn key HTF ngược hướng gần nhất giữa giá đóng và target CRT; khoảng cách tối thiểu chỉ hơn một tick. High/low của chính nến TS cũng được xét để chạm key. Ca kiểm tra cho thấy TS có thể bị chặn ngay trên nến đó bởi một cản gần, dù target CRT chưa chạm. Sau delivery, các bằng chứng leg cũ được xóa ở những nến kế tiếp; muốn phát lại cần TS mới. Đây là quy ước triển khai cá nhân, không phải kết luận rằng cứ chạm một key bất kỳ là tác giả coi setup hoàn tất. OHLC không xác định được thứ tự di chuyển trong nến TS; không thể mặc định cản đó bị chạm sau entry.

5. **Chưa nhận diện key 50% weekly wick.** Danh sách hiện tại gồm swing, FVG, OB và open/close của nến được chọn bởi điều kiện displacement trên H1/main/larger/bias. Không có nguồn W1 và kiểu key midpoint râu tuần riêng. Mức trùng với một key khác có thể được nhận diện tình cờ, không phải vì hiểu đúng 50% weekly wick. Ảnh 4 hiển thị REF `-`, WHY `KEY DELIVERED`; chưa đủ để kết luận chỉ thiếu key tuần là nguyên nhân duy nhất không có tam giác.

6. **Không có nhánh riêng đảo hướng cho EURUSD hoặc USTECH.** Phần thực thi dùng cùng công thức theo ticker chart. Sweep theo mintick, pivot 2/2, thời gian chờ theo số nến và các vùng key không chuẩn hóa theo biến động. Sự khác biệt hiệu quả giữa thị trường là giả thuyết cần kiểm định, không thể xếp hạng từ các ảnh. Bias Auto là hướng cấu trúc khung tham chiếu đã xác nhận, không phải dự báo chắc chắn hướng của mỗi leg trong ngày.

## Đọc bốn ảnh hiện tại

| Ảnh | Điều quan sát được | Chưa thể kết luận |
| --- | --- | --- |
| 1, 4 — XAU H2/M5 | Model Buy, B- D1, REF trống, KEY DELIVERED; bounce từ vùng đáy | Key cản nào đã bị chạm, TS nào khởi tạo leg, key tuần có tồn tại trước entry hay không |
| 2 — EUR H1/M5 | Buy lịch sử trong đoạn giảm; model hiện tại là Sell và có INV | Buy trước đó thuộc main/higher, Early/TS/FVG/OTE, flow hay counter; panel hiện tại không mô tả toàn bộ dấu lịch sử |
| 3 — USTECH H1/M5 | Nhiều dấu E Buy và vài tam giác Buy trong đoạn giảm | Tất cả là cùng setup hay nhiều C1/C2; mức độ dư tín hiệu cần đếm theo source/attempt/branch |

Không tìm thấy cửa sổ Brave trong phiên công cụ của lần rà soát này, nên chưa đọc được tooltip trực tiếp. Các ảnh không cung cấp OHLC/timestamp chi tiết đủ để chạy lại từng entry. Không tuyên bố đã Replay hoặc đã chứng minh “cặp khác bị đảo hướng”.

## Thứ tự điều chỉnh đề xuất

1. **Ghi rõ nguyên nhân entry/bị chặn** trong tooltip hoặc bộ xuất kiểm tra: nguồn CRT, FLOW/KEY REV/COUNTER SWING, TS/FVG/OTE/Early, key phản ứng, key cản và thời điểm delivery. Không thêm nhãn dài lên chart. Cần truy ra cản cụ thể ở ảnh 4 trước khi nới bộ lọc.
2. **Tách chuẩn flow và counter.** Giữ khả năng CRT đảo chiều tại key; không giải quyết bằng việc cấm mọi lệnh ngược D1 hoặc đổi Buy thành Sell. Đối chiếu counter dùng adjacent-candle TS với counter có chuỗi P1/P2/P3 rõ và bằng chứng key; đề xuất chuẩn counter chặt hơn phải được kiểm tra riêng, không ép mọi TS phải qua MPS.
3. **Rà soát delivery theo vai trò.** Phân biệt cản quan sát trung gian với target kết thúc leg. Tránh để mọi open/close/OB gần nhất tự động hủy toàn bộ cơ hội hồi; đồng thời không cho tái sử dụng vô hạn một leg đã hoàn thành. Cần chốt quy tắc trước khi thay nguồn.
4. **Thêm key tuần có định nghĩa nhân quả.** Cần phân biệt râu dưới/râu trên, tuần đã đóng/tuần đang chạy. Với tuần đã đóng: lower midpoint = `(low + min(open, close))/2`; upper midpoint = `(high + max(open, close))/2`. Với tuần đang chạy, body/extreme còn đổi nên không được lấy giá cuối tuần tương lai để đánh giá entry quá khứ. Tính trên cùng feed, không chuyển nguyên giá từ Micro Gold futures sang XAUUSD spot.
5. **Đối chiếu cùng một cấu hình trên nhiều thị trường.** Khởi đầu TS close, cùng HTF/Structure/cadence, tách Early và counter trong thống kê; sau đó thêm FVG rồi OTE. Đo số setup, dấu/attempt, số counter, lý do không phát, thời gian tới INV/TGT và tính bất biến khi tải lại. Chưa có quy tắc khớp lệnh/chi phí nên không xếp hạng lợi nhuận.

## Bằng chứng và giới hạn

- `tests/crt-cross-market-audit.cjs`: ca thực thi nguồn đối xứng cho counter, các nhánh, TS không MPS, thiếu key và delivery ngay trên TS. Đây là các ví dụ tái hiện chính sách hiện tại, không phải chứng nhận chính sách đó giao dịch tốt.
- `node tools/check-crt.cjs`: 25 suite hiện có vượt qua. Rà soát này chưa sửa Pine hoặc setting mặc định.
- Nguồn tác giả đã lưu trong nghiên cứu: [MPS](https://www.youtube.com/watch?v=Q-mne0H4lRY), [Key level](https://www.youtube.com/watch?v=p8UYOgVn1-g). Lần mở lại web này không lấy được nội dung video đầy đủ; không có diễn giải mới nào ở trên được gán là quy tắc nguyên văn của tác giả.
- [TradingView — Repainting](https://www.tradingview.com/pine-script-docs/concepts/repainting/): nến đang chạy có high/low/close thay đổi. Mức tuần live cần chính sách riêng để kết quả lịch sử không dùng thông tin tương lai.
