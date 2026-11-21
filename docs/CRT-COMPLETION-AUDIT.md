# Rà soát CRT thuần · 22/11/2026

Quy tắc hiện hành: [CRT thuần & thời gian](CRT-PURE-AND-TIME.md).

Đã thực hiện: bỏ các bộ xác nhận và lớp giờ cũ trong chỉ báo/web/AI/checklist; CRT HTF có C2 đóng; TS LTF và retest trong C3; IRL/ERL theo swing HTF; key ngược bias có trước C1; timeout/TG/INV/AMB; nhóm C1–C2 và FOLLOW; giờ nến từ feed; đồng hồ C3 web nhập từ chart; migration giữ snapshot, nhật ký và cá cũ.

Kiểm tra hiện hành: 11 nhóm trong node tools/check-crt.cjs và 13 nhóm trình duyệt trong node tools/check-crt-web.cjs. Có fixture đối xứng, thân hàm Pine thực tế được chuyển đổi giới hạn sang JS, kiểm tra DST và giữ dữ liệu tài chính. Đây không phải backtest lợi nhuận. Kết quả biên dịch và giới hạn Replay được ghi ở báo cáo bàn giao.

Chưa làm: Replay thị trường của bộ xác nhận TS mới; kết nối feed/model giữa web và Pine; Early C2. Replay bản trước chỉ được người dùng tạm chấp nhận, không xác nhận bản mới. Early C2 tiếp tục bị tắt; nghiên cứu cũ cần thiết kế lại theo phạm vi thuần CRT trước khi triển khai.
