# Rà soát CRT thuần · 22/11/2026

Quy tắc hiện hành: [CRT thuần & thời gian](CRT-PURE-AND-TIME.md).

Đã thực hiện: bỏ các bộ xác nhận và lớp giờ cũ trong chỉ báo/web/AI/checklist; CRT HTF có C2 đóng; TS LTF và retest trong C3; IRL/ERL theo swing HTF; key ngược bias có trước C1; timeout/TG/INV/AMB; nhóm C1–C2 và FOLLOW; giờ nến từ feed; đồng hồ C3 web nhập từ chart; migration giữ snapshot, nhật ký và cá cũ.

Kiểm tra hiện hành: 13 nhóm trong node tools/check-crt.cjs và 13 nhóm trình duyệt trong node tools/check-crt-web.cjs. Có fixture đối xứng, thân hàm Pine thực tế được chuyển đổi giới hạn sang JS, kiểm tra DST và giữ dữ liệu tài chính. Đây không phải backtest lợi nhuận. Kết quả biên dịch và giới hạn Replay được ghi ở báo cáo bàn giao.

Đã chuẩn bị bước nghiệm thu: [quy trình Replay CRT thuần](CRT-PURE-REPLAY.md), cột Data Window/CSV và công cụ đối chiếu dữ liệu xuất trước/sau reload. Kiểm tra parser, biên thời gian, ca đối xứng, dữ liệu thiếu và khác OHLC bằng fixture tổng hợp đã có; không tính chúng là Replay thị trường.

Đã bổ sung Early C2 thử nghiệm, bật sẵn theo yêu cầu, key swing cùng HTF có trước C1, raid/reclaim → TS/retest LTF đã đóng, tối đa một E mỗi C2, khóa tham chiếu SL/TP. Có 74 trace đối xứng từ thân hàm Pine và kiểm tra chạy chart trong Brave. Chi tiết: [Early C2](EARLY-C2-EXPERIMENT.md).

Chưa làm: Replay thị trường đầy đủ của cả hai nhánh; kết nối feed/model giữa web và Pine. Tài khoản Basic trong Brave đã đăng nhập vẫn chặn Replay intraday khi chọn nến. Quan sát runtime không thay nghiệm thu Replay hoặc đánh giá hiệu suất.
