# Early C2 · bản thử quan sát

Ngày 22/11/2026: người dùng cho phép bật Early C2 để quan sát thực tế và phản hồi, thay phạm vi trước đây chỉ nghiên cứu. Input **Early C2 · experimental** mặc định bật; có thể tắt để chỉ xem tín hiệu C3. Chỉ báo có 21 input.

Đây là quy ước cá nhân của công cụ, không tuyên bố một thuật toán đã được Romeotpt xác nhận, không phải kết quả backtest và không tự đặt lệnh.

## Phân biệt hai nhánh

| Nhánh | Điều kiện thời gian | Dấu |
| --- | --- | --- |
| Confirmed | C2 HTF đã đóng hợp lệ; TS/retest LTF trong C3 | Tam giác Buy xanh dưới nến, Sell đỏ trên nến |
| Early C2 | C2 HTF đang chạy; bằng chứng từ các nến LTF đã đóng trước khi C2 đóng | **E** xanh dưới nến, **E** đỏ trên nến |

Early không dùng giá đóng cuối cùng của C2 để vẽ một dấu trong quá khứ. Khi C2 kết thúc, dấu E cũ không bị đổi tên thành tín hiệu Confirmed hoặc bị xóa vì C2 thất bại. Tắt input sẽ tính lại bản không Early; không coi đó là lỗi repaint. Hai cấu hình không nên so dấu như cùng một hệ thống vì khóa sóng được chia sẻ.

## Quy tắc đang chạy

1. C1 là nến HTF đã đóng ngay trước C2. Toàn bộ OHLC gồm râu; giờ nến theo feed. Chỉ đánh giá M1/M3/M5 chia hết HTF.
2. Phải có dữ liệu từ đầu C2 và liên tục giữa các nến đã đóng; bắt đầu tải giữa C2 hoặc thiếu nến trong cửa sổ thì `E DATA`. C1 và bản đồ key chỉ lấy từ nến HTF trước đã đóng, không đọc OHLC cuối cùng của C2.
3. C2 phải raid đúng một biên C1 ít nhất một tick, rồi LTF đóng hẳn trong C1. Double sweep hoặc target C1 đã bị lấy chặn cả cửa sổ Early đó.
4. Cần key swing **cùng HTF model**, đã biết trước lúc C1 mở và còn trong pool cuối C1; C2 phải raid/reclaim key. Bản thử chưa tìm thêm key trên Bias TF lớn hơn. Không dùng các bộ lọc đã gỡ.
5. Bias vẫn Auto/Long/Short/Neutral như cấu hình. B0/B0! chặn. Ngược bias cần bật ngoại lệ CT và vẫn phải đủ key, raid/reclaim, TS LTF. Không đổi bias tổng thể theo E.
6. Sau nến reclaim HTF range/key đã đóng, bắt đầu một attempt mới. Hai nến TS LTF phải mở từ thời điểm này trở đi. Chỉ TS cùng hướng, một phía và đóng hẳn trong nến nguồn mới xác nhận.
7. Pullback mặc định: nến sau TS mới retest biên được thu hồi, đóng đúng phía và giữ cực trị TS LTF. Confirmation close là tùy chọn phát E tại close TS LTF; không bỏ điều kiện raid/reclaim trước đó.
8. Cực trị C2 mở rộng trước E hoặc mất reclaim: xóa pending, chờ reclaim và TS/retest mới. Bias tạm chặn cũng xóa pending. Close xuyên key sau khi đã chọn sẽ khóa nhánh đó trong C2.
9. **Tối đa một E mỗi C2.** Chia sẻ khóa sóng với nhánh C3. Nếu hai nhánh đủ cùng nến, ưu tiên Confirmed C3; Early không phát cùng nến đó.
10. Khi phát E, đóng băng SL tham chiếu ở cực trị C2 đã biết và TP ở biên đối diện C1. Cực trị sau E không nới SL cũ. Các trạng thái `E SL REF`, `E TP REF`, `E AMB` chỉ ghi chạm tham chiếu bằng OHLC, không suy ra khớp lệnh, PnL hay thứ tự intrabar.
11. Early chỉ phát khi close LTF **trước** giờ đóng C2. Nến LTF cuối C2 đóng cùng HTF không được gọi là entry sớm. Pending không chuyển sang C3 hay C2 mới.

Dashboard EARLY hiển thị trạng thái hiện tại và tổng E trên dữ liệu được tải. Tooltip E ghi C1/C2, attempt, giờ reclaim, TS, giờ phát dấu và SL/TP tham chiếu cố định. Các cụm/line HTF hiện có vẫn mô tả model Confirmed được chọn; không tự chuyển sang range Early khác. Dùng tooltip E để đối chiếu đúng range Early.

## Kiểm chứng và giới hạn

- `node tools/check-crt.cjs`: 13 nhóm, gồm 74 trace Buy/Sell Early đối xứng từ thân hàm Pine; kiểm tra nến đóng, key có trước, biên thời gian, thiếu nến, reset, khóa SL, ưu tiên C3 và không điền dấu hồi tố khi nối thêm dữ liệu tổng hợp.
- Biên dịch bằng TradingView riêng; nạp kiểm tra runtime trong Brave đã đăng nhập. Chart quan sát ban đầu là CRYPTO:BTCUSD, M5, HTF H1, Bias D1. Quan sát được hàng EARLY và số đếm E; chưa đối chiếu từng dấu lịch sử nên không suy ra chất lượng tín hiệu.
- Đã thử Bar Replay intraday trong Brave: tài khoản Basic hiện lên yêu cầu nâng cấp khi chọn nến. Không mua/nâng cấp hoặc dùng tính năng bị chặn. Vì vậy chưa thực hiện Replay M5 trên tài khoản này.
- Lưu thêm script trong tài khoản cũng bị gói Basic chặn vì đã đủ hạn mức một script. Bản thử được nạp vào draft/chart hiện tại, chưa lưu thành script cloud riêng và không ghi đè script khác. Mã local/Git là bản giữ chính; nếu tải lại tab cần kiểm tra hoặc nạp lại.
- Chưa xác nhận không repaint bằng market Replay/tick replay, chưa có kết quả lợi nhuận hay tỷ lệ thắng. Đổi độ sâu lịch sử/feed/settings có thể thay context và khóa sóng; phải ghi lại khi phản hồi.

## CSV và phản hồi

Early có cột export riêng: enabled, direction, locked SL/TP, TS open, C2 open/close. Không trộn Early vào `CRT direction` hoặc các cột bằng chứng C3.

Công cụ audit CSV hiện chỉ kiểm tra chi tiết nhánh Confirmed. Khi có sự kiện Early, báo cáo ghi riêng và đánh dấu thiếu kiểm chứng Early; so reload có thể phát hiện E thay đổi trên các nến đã đóng chung. Bật/tắt Early giữa hai bản được coi là đổi cấu hình, không tự kết luận repaint. Xem [hướng dẫn CSV](CRT-PURE-REPLAY.md).

Khi phản hồi một dấu E, ghi mã/feed, HTF/LTF, Bias, Signal timing, thời gian theo NY hoặc VN và ảnh trước/sau. Đối chiếu ba thời điểm: reclaim đã đóng → TS LTF đã đóng → nến phát E. Một E thất bại sau đó không tự chứng minh dấu sớm sai logic; cần xem dữ kiện đã có tại lúc phát.

Vòng đời setup hiện hành: [INV / TG / EXP và tìm model mới](CRT-SETUP-LIFECYCLE.md).
