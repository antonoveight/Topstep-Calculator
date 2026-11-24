# Hệ thống CRT hiện hành

**Cập nhật thực thi 24/11/2026:** MPS before entry bật mặc định cho Main, Larger và Early C2. Có 31 setting khai báo và ô Calculated bars tích hợp của TradingView (mặc định 600); Pullback vẫn là timing mặc định. MPS là bước xác nhận trước entry, không phải tam giác vào lệnh. Xem [quy tắc MPS đang triển khai](CRT-FIRST-LEG-SPEC.md#mps-trước-entry--triển-khai-24112026).

Thay đổi 22/11/2026: chỉ giữ CRT, Turtle Soup, IRL/ERL theo swing HTF; entry TS LTF đã đóng và retest trong C3.

Đọc đầy đủ tại [CRT thuần & thời gian](CRT-PURE-AND-TIME.md). Bản tài liệu trước thay đổi được lưu trong thư mục archive, không còn là cấu hình hiện hành.

Mặc định: H1 / M5, Bias TF D1, Auto bias, Pullback, Fresh reaction, History 100. Có 31 input. Hết C3 đóng cửa sổ entry, range vẫn được theo dõi; INV kết thúc attempt, chỉ C3 gốc sweep/key/reclaim hợp lệ mới được thay raid trên cùng C1. Bật LAST để xem lịch sử. Counter-bias cần sweep/reclaim key swing HTF đã được biết trước C1.

Time panel dùng giờ đóng nến HTF từ feed, hiển thị New York có DST. Web có đồng hồ C3 nhập mốc từ chart, không tự nhận giá hay model từ Pine. Không có bộ lọc giờ thay xác nhận giá.

Kiểm tra bằng node tools/check-crt.cjs và node tools/check-crt-web.cjs. Chưa có Replay thị trường cho bộ xác nhận mới.

Early C2 thử nghiệm đã bật mặc định theo yêu cầu mới: [quy tắc, dấu E và cách tắt](EARLY-C2-EXPERIMENT.md). Các mô tả C3 ở trên là nhánh Confirmed.

Vòng đời setup hiện hành: [Range C1, attempt, INV/TG và xác nhận lại](CRT-SETUP-LIFECYCLE.md).

Cập nhật hai nhánh Confirmed: [H1/H4 độc lập, nguồn tam giác và giới hạn khung](CRT-DUAL-HTF.md). Đối chiếu entry sau TS từ [nguồn Romeotpt](CRT-ENTRY-ROMEOTPT.md); Pullback trong code vẫn là quy ước cá nhân.


R1 hiện có trong Pine dưới chế độ **Signal timing → R1 first leg · experimental**, mặc định tắt (Pullback). Có 31 input, gồm 6 ô vùng/thời gian thủ công, không đưa các giá trị này lên tiêu đề chart. Xem [hướng dẫn R1](CRT-FIRST-LEG-SPEC.md#sử-dụng-r1-trong-chỉ-báo). Early vẫn chạy TS/Pullback riêng khi R1 được chọn.
