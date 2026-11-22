# Cài đặt chỉ báo CRT thuần

Cập nhật tích hợp 22/11/2026: R1 đã có trong Pine dưới lựa chọn **Signal timing → R1 first leg · experimental**, mặc định vẫn Pullback. Vùng hồi còn khai báo thủ công, độc lập cho Main/Larger HTF. Xem [hướng dẫn R1](CRT-FIRST-LEG-SPEC.md#sử-dụng-r1-trong-chỉ-báo).

Thay đổi 22/11/2026: chỉ giữ CRT, Turtle Soup, IRL/ERL theo swing HTF; entry TS LTF đã đóng và retest trong C3.

Đọc đầy đủ tại [CRT thuần & thời gian](CRT-PURE-AND-TIME.md). Bản tài liệu trước thay đổi được lưu trong thư mục archive, không còn là cấu hình hiện hành.

Mặc định: H1 / M5, Bias TF D1, Auto bias, Pullback, Fresh reaction, History 100. Có 30 input, gồm 6 ô vùng/thời gian R1 chỉ dùng khi chọn chế độ thử nghiệm. Hết C3 đóng cửa sổ entry, range vẫn được theo dõi; INV kết thúc attempt, chỉ C3 gốc sweep/key/reclaim hợp lệ mới được thay raid trên cùng C1. Bật LAST để xem lịch sử. Counter-bias cần sweep/reclaim key swing HTF đã được biết trước C1.

Time panel dùng giờ đóng nến HTF từ feed, hiển thị New York có DST. Web có đồng hồ C3 nhập mốc từ chart, không tự nhận giá hay model từ Pine. Không có bộ lọc giờ thay xác nhận giá.

Kiểm tra bằng node tools/check-crt.cjs và node tools/check-crt-web.cjs. Chưa có Replay thị trường cho bộ xác nhận mới.

Early C2 thử nghiệm đã bật mặc định theo yêu cầu mới: [quy tắc, dấu E và cách tắt](EARLY-C2-EXPERIMENT.md). Các mô tả C3 ở trên là nhánh Confirmed.

Vòng đời setup hiện hành: [Range C1, attempt, INV/TG và xác nhận lại](CRT-SETUP-LIFECYCLE.md).

Cụm HTF lớn hơn bật sẵn: Auto H1/H2 → H4, H4 → D1, D1 → W1; tín hiệu chạy bằng engine riêng khi Larger HTF signals bật và khung không vượt Bias TF. Tắt hình không tắt engine. LAST dùng cùng màu thân/râu, giữ độ mờ. Xem hướng dẫn vòng đời để hiểu hai cụm.

Các cụm chỉ ghi tên timeframe phía trên và đếm ngược dưới nến live; bỏ nhãn giải thích. Hover WHY trên dashboard để xem số nến/TS/retest của đúng attempt. Xem [phân tích trường hợp không có Sell và cách đọc chẩn đoán](CRT-SIGNAL-DIAGNOSTICS.md).

Cập nhật hai nhánh Confirmed: [H1/H4 độc lập, nguồn tam giác và giới hạn khung](CRT-DUAL-HTF.md). Đối chiếu entry sau TS từ [nguồn Romeotpt](CRT-ENTRY-ROMEOTPT.md); Pullback trong code vẫn là quy ước cá nhân.
