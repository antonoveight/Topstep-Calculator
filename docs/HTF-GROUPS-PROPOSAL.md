# HTF tùy chọn, vòng đời model và tách cụm

Cập nhật 14/11/2026. HTF/Bias TF mở tự chọn, mặc định H1/D1 để đối chiếu ban đầu; không tự khẳng định mọi feed có OHLC/session giống hệt nhau. Chỉ báo là công cụ tham khảo cấu trúc, không thay quyết định trên Topstep.

## Đã sửa trong code

- Inputs HTF và Bias TF đã mở tự chọn timeframe, không giới hạn H1/D1. Mặc định vẫn H1/D1. Khi chart cao hơn HTF input sẽ dùng chart timeframe làm VIEW; Bias TF phải >= timeframe hiệu lực. LTF M1/M3/M5 vẫn dùng tìm tín hiệu.
- Dấu Buy/Sell dùng tam giác native size=4, xấp xỉ nửa Tiny; Buy xanh dưới nến, Sell đỏ trên nến. Kích thước cố định theo lựa chọn mới, không dùng linefill theo chiều rộng nến.
- Kiểm tra giá chạm CP/close xuyên INV của model **trước** khi EGF đổi bias và reset target. Đổi bias cùng nến không làm mất sự kiện chạm target cũ.
- Nếu CRT chạm luôn biên đối diện ở nến hình thành, hoặc ISB chạm CP ngay nến resolve, không mở model cho một đường đi giá đã đi qua. Gắn **AMB**, không gán TG/TP vì OHLC không biết thứ tự nội nến.
- Hover ô #1 của dashboard xem lý do model kết thúc gần nhất; khi không còn model, ô S thể hiện trạng thái kết thúc tương ứng.

## Các điều kiện kết thúc hiện hành

| Mã | Điều kiện | Ý nghĩa |
| --- | --- | --- |
| TG | Sau nến xác nhận model, High >= CP cho Buy hoặc Low <= CP cho Sell | Chạm target tham chiếu của model; không suy ra lệnh thật đã TP |
| INV | Nến HTF đóng xuyên INV theo hướng bất lợi | Vô hiệu cấu trúc; chỉ râu xuyên nhưng close reclaim chưa đủ theo mode Close |
| TO | Tuổi model tới giới hạn HTF đã đặt, mặc định 8 | Hết thời gian theo dõi để phát tín hiệu, dù giá chưa tới target/INV |
| AMB | Cùng bar chạm target và close vô hiệu; ISB quét hai phía rồi back-in; hoặc nến hình thành/resolve đã chạm luôn đích đối diện | Không suy diễn thứ tự nội nến hay gán kết quả thắng |
| HIST | Nguồn model ra ngoài recovery window | Hết phạm vi dữ liệu được phục hồi; phân biệt với TO |

CRT/TS lấy mục tiêu là biên đối diện range; EGF/ISB breakout dùng ERL hợp lệ. Khi chưa có CP thì không có kết luận đạt target và không có entry thiếu đường đi. Hỏng một IRL chỉ bỏ vùng đó để tìm reference khác; chưa tự hủy model. Bias đổi cập nhật kịch bản EGF nếu model cũ chưa kết thúc; không gia hạn timeout.

## Bố cục đã triển khai

Cụm đầu chỉ hiển thị tên mẫu (ví dụ EGF, CRT/TS, ISB/BR), không có tiền tố MODEL. Cột chú giải có vùng đệm rộng theo cỡ chữ trước nến đầu; áp dụng cả khi chỉ bật IRL và tắt các mức range/ERL.

Mặc định **hai nhóm nến của cùng một model** với khoảng trống rõ ràng:

`[ MODEL GỐC: C1 C2 (C3) ]     [ DIỄN BIẾN: nến tiếp theo … N* ]`

1. **Model gốc:** EGF/ISB giữ hai nến nguồn. CRT hiển thị C1/C2 và C3 khi C3 đã đóng; C1/C2 hiện là điều kiện phát hiện sweep/reclaim trong engine, C3 là phần quan sát tiếp theo, không tạo giả hay backdate để ép có đủ ba nến. Nến TS/BR resolve của ISB được đánh dấu đúng timestamp, kể cả có nhiều nến nén ở giữa.
2. **Diễn biến sau model:** bắt đầu ngay sau nến cuối của nhóm 1, không lặp nến giữa hai nhóm. Có N* cập nhật live. Mặc định hiển thị 6 nến gần nhất, điều chỉnh 2–12 bằng Follow candles to show; khi dài hơn có dấu `…` và tổng số nến, không co cả model gốc thành các nét nhỏ. Dữ liệu theo dõi và tuổi model vẫn tính đủ, việc rút gọn chỉ là hiển thị.
3. **Nhóm lịch sử tùy chọn:** giữ model vừa kết thúc gần nhất, màu dịu và mã TG/INV/TO/AMB. Bật Last ended model cluster để xem bản tham chiếu nến nguồn này, không phát lại tín hiệu và không tự phục hồi hiệu lực do còn được vẽ. Mặc định tắt nhóm 3 để màn hình gọn.

Timeout hiện là **hết hiệu lực theo thời gian**, không đơn thuần ẩn hình. Model có thể còn hợp lệ về giá nhưng đã TO. Giữ một bản tham chiếu sau TO giải quyết việc mất hình để xem lại mà không âm thầm kéo dài thời gian vào lệnh. Nếu cần tiếp tục theo dõi xem sau TO giá tới CP hay INV, nên lưu đó là kết quả quan sát sau timeout, tách khỏi kết quả trong cửa sổ hoạt động.

Phần tách nhóm đã triển khai. Hai setting mới: Follow candles to show = 6 và Last ended model cluster = false. Nếu không còn model hoạt động, bật nhóm LAST vẫn xem được model đã kết thúc gần nhất thuộc nhóm đang lọc. Archive chỉ giữ một model, không phải thư viện mọi model quá khứ. Khi cùng bar có nhiều model kết thúc, ưu tiên model vừa focus. N* đang hình thành; N đã đóng.

## Kiểm tra

Bản tách nhóm ngày 14/11/2026 đã qua `htf-cluster-groups`, `indicator-contract`, `signal-density-audit` và ma trận `day-trading-settings`. Pine Editor nhận đúng source cuối với archive đã offset (exactSource=true, success=true, errors=null). Chưa kiểm tra runtime/Replay; bộ evaluator LTF và wave gate được đối chiếu giữ nguyên so với bản trước.

Pine Editor tạm ngày 14/11/2026 nhận đúng toàn bộ source cuối: exactSource=true, success=true, errors=null. Chưa kiểm tra runtime/Replay hoặc kích thước glyph trên chart thật.

Contract kiểm tra 6 mã trạng thái (kể cả 0=WAIT), target-before-bias-revision, chạm target cùng lúc bias đổi ở cả Buy/Sell, Inputs HTF/Bias TF tùy chọn, tam giác native xấp xỉ nửa Tiny và anchor nến hiện tại. Các bộ bias, signal density và 20 tổ hợp workflow tiếp tục được chạy. Chưa xác minh kích thước thực trên chart/Replay.

Tham khảo kích thước label nguyên và Tiny: [TradingView — Text formatting](https://www.tradingview.com/pine-script-docs/visuals/text-and-shapes/#text-formatting).
