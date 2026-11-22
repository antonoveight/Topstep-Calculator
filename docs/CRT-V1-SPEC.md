# Đặc tả CRT hiện hành

Thay đổi 22/11/2026: chỉ giữ CRT, Turtle Soup, IRL/ERL theo swing HTF; entry TS LTF đã đóng và retest trong C3.

Đọc đầy đủ tại [CRT thuần & thời gian](CRT-PURE-AND-TIME.md). Bản tài liệu trước thay đổi được lưu trong thư mục archive, không còn là cấu hình hiện hành.

Mặc định: H1 / M5, Bias TF D1, Auto bias, Pullback, Fresh reaction, History 100. Còn 21 input. Hết C3 là setup hết hạn (EXP), không giữ làm model active. Bật LAST để xem lịch sử. Counter-bias cần sweep/reclaim key swing HTF đã được biết trước C1.

Time panel dùng giờ đóng nến HTF từ feed, hiển thị New York có DST. Web có đồng hồ C3 nhập mốc từ chart, không tự nhận giá hay model từ Pine. Không có bộ lọc giờ thay xác nhận giá.

Kiểm tra bằng node tools/check-crt.cjs và node tools/check-crt-web.cjs. Chưa có Replay thị trường cho bộ xác nhận mới.

Early C2 thử nghiệm đã bật mặc định theo yêu cầu mới: [quy tắc, dấu E và cách tắt](EARLY-C2-EXPERIMENT.md). Các mô tả C3 ở trên là nhánh Confirmed.

Vòng đời setup hiện hành: [INV / TG / EXP và tìm model mới](CRT-SETUP-LIFECYCLE.md).
