# Bias cấu trúc và thời điểm tam giác

Cập nhật 14/11/2026 sau ảnh USTECH100/US Tech 100 CFD StoneX, chart M5, HTF lần lượt H1/H4, Bias D1. Không suy diễn dữ liệu này là XAUUSD và không lấy giá xấp xỉ trên ảnh để dựng OHLC giả làm dữ liệu thị trường.

## Quan sát và giới hạn kết luận

Cả hai ảnh M5 đều hiện B+/1D; ảnh D có nến cuối giảm mạnh. Màu một nến D không tự xác định toàn bộ bias. Ảnh không đủ cho biết chính xác bar D đã đóng chưa, nội dung tooltip từng tam giác, hoặc broker timestamp ở mỗi lần chụp. Vì vậy chưa kết luận được từng Buy trong ảnh bắt buộc phải là Sell.

Tam giác được tạo bằng `label.new(bar_index, … yloc.belowbar/abovebar)` ở **nến chart hiện tại đã đóng**. Không có offset lùi sang nến pivot. Buy ở trước một nhịp giảm tiếp theo có thể là một phản ứng LTF thất bại hoặc bias không phù hợp; không tự chứng minh lỗi tọa độ. Pullback cũng không đợi biết trước đáy cuối của cả nhịp sóng. Không dời tam giác sang bar tương lai để ảnh nhìn đẹp hơn.

Tooltip hiện phân biệt Confirm bar/Trigger bar (giờ mở nến) và Signal CLOSE (giờ đóng nến chart), kèm bias tại hit. Dấu dưới nến Buy là ký hiệu của nến thỏa điều kiện, không phải giá khớp lệnh. Data Window giữ close tham chiếu và direction của từng nhóm.

## Thay đổi bias

Trước đây Auto dựa trên một lần sweep/reclaim hoặc close vượt nến trước, giữ tối đa ba bar Bias TF. Nó có thể giữ một hướng hồi ngắn và bị hiểu nhầm là xu hướng D tổng thể.

Auto mới dùng cấu trúc trên Bias TF:

- Swing High/Low chỉ được đưa vào state khi pivot 2 trái/2 phải đã xác nhận.
- Close vượt swing High xác nhận hướng Buy, close thủng swing Low xác nhận Sell. Khi hướng đã có, giữ tới sự kiện cấu trúc đối diện; không tự hết hạn sau ba ngày.
- Buy bảo vệ bằng swing Low; Sell bảo vệ bằng swing High. Pivot hồi mới đã xác nhận chỉ siết mức bảo vệ theo hướng cấu trúc. Một nến hồi xanh/đỏ hoặc râu quét đơn lẻ không tự đổi hướng.
- Chưa biết swing/cấu trúc thì Neutral, không đoán hướng từ màu nến.

Snapshot bias có sáu scalar, tất cả offset riêng khi đọc từ khung lớn: direction, age, swing High/Low và guard High/Low. Snapshot model 111 trường + hai request bias mỗi request 6 trường = 123; thêm một object archive thành 124, dưới giới hạn tuple 127. Các thay đổi HTF của EGF vẫn chỉ theo bias cấu trúc đã đóng; nhãn bias H1/H4 không được lấy từ màu nến model.

## Chặn rủi ro trong ngày bằng close chart

Đợi D đóng có thể quá chậm để dừng Buy trong một nhịp giảm mạnh trong ngày. Vì vậy có lớp **veto**, không phải bias D đang chạy:

- Guard Buy = mức cao hơn giữa Low nến Bias TF đã đóng gần nhất và protected swing Low. Guard Sell = mức thấp hơn giữa High nến Bias TF đã đóng gần nhất và protected swing High.
- Nếu close chart xuyên guard ngược hướng thì Auto trở thành **B0!**, không cho phát tín hiệu mới theo bias cũ. Không tự đảo Sell/Buy dựa trên nến D chưa đóng.
- Chỉ dùng nến chart đã đóng; khi bar đang chạy giữ close bar trước nên không bật/tắt veto từng tick. Khi giá reclaim guard có thể bỏ veto; sau đó vẫn phải qua điều kiện model/entry hiện hành, không tự tạo lệnh.
- Long/Short/Neutral nhập tay vẫn là override rõ ràng của người dùng.

Data Window bổ sung `Bias confirmed structure`, `Bias effective`, `Bias guard high/low`. Hover ô B xem hướng cấu trúc, guard và lý do pause. WHY vẫn là lý do của nến đóng gần nhất, không phải nến quá khứ dưới con trỏ.

## Mở chart D khi HTF cài H1/H4

Bản cũ báo runtime error vì chart > HTF. Bản hiện hành mở tự chọn HTF/Bias TF, mặc định H1/D1. Chart cao hơn input HTF dùng chart timeframe làm VIEW; ví dụ chart D + input H4 → VIEW D, về M5 tự dùng lại H4. Bias TF phải >= timeframe hiệu lực và chart TF phải chia hết HTF hiệu lực. Không dùng request khung thấp để giả một model H4 trên chart D và không phát entry trên VIEW. Bias TF phải >= timeframe hiệu lực; chart phải tiêu chuẩn và chia hết timeframe hiệu lực.

## Kiểm tra

Pine Editor tạm ngày 14/11/2026 đã nhận đúng toàn bộ source cuối: exactSource=true, success=true, errors=null. Đây là chẩn đoán biên dịch, chưa phải đã chạy chart/Replay trên feed StoneX.

`node tests/bias-context.cjs` thực thi thân bias state machine trích từ source với pivot đã xác nhận: giữ Sell qua hồi xanh, bảo vệ theo lower high/higher low, đối xứng Buy/Sell, đổi hướng bằng close, không tự expire theo tuổi, veto Buy/Sell, không flicker intrabar, sáu snapshot offset và D overview. Contract tiếp tục kiểm tra tam giác ở current bar và tooltip close time. `indicator-contract`, `signal-density-audit` và `day-trading-settings` kiểm tra các phần còn lại.

Đây chưa phải replay feed StoneX hoặc thống kê hiệu quả. Harness không mô phỏng request.security, ta.pivot, rollback/drawing TradingView. Cần đối chiếu chart sau cập nhật source và tạo lại alerts.

Tài liệu kỹ thuật: [TradingView — Repainting](https://www.tradingview.com/pine-script-docs/concepts/repainting/) và [Other timeframes and data](https://www.tradingview.com/pine-script-docs/concepts/other-timeframes-and-data/) giải thích dữ liệu khung lớn đang chạy so với snapshot đã xác nhận. Các nguồn này không chứng minh quy tắc bias cá nhân có xác suất thắng cao.
