# Rà soát CRT thuần · 22/11/2026

Quy tắc hiện hành: [CRT thuần & thời gian](CRT-PURE-AND-TIME.md).

Đã thực hiện: bỏ các bộ xác nhận và lớp giờ cũ trong chỉ báo/web/AI/checklist; CRT HTF có C2 đóng; TS LTF và retest trong cửa sổ sau xác nhận; IRL/ERL theo swing HTF; key ngược bias có trước C1; TG/INV/AMB và TRACK/WATCH; nhóm C1–raid và FOLLOW; giờ nến từ feed; đồng hồ C3 web nhập từ chart; migration giữ snapshot, nhật ký và cá cũ.

Kiểm tra hiện hành: 16 nhóm trong node tools/check-crt.cjs và 13 nhóm trình duyệt trong node tools/check-crt-web.cjs. Có fixture đối xứng, thân hàm Pine thực tế được chuyển đổi giới hạn sang JS, kiểm tra DST và giữ dữ liệu tài chính. Đây không phải backtest lợi nhuận. Kết quả biên dịch và giới hạn Replay được ghi ở báo cáo bàn giao.

Đã chuẩn bị bước nghiệm thu: [quy trình Replay CRT thuần](CRT-PURE-REPLAY.md), cột Data Window/CSV và công cụ đối chiếu dữ liệu xuất trước/sau reload. Kiểm tra parser, biên thời gian, ca đối xứng, dữ liệu thiếu và khác OHLC bằng fixture tổng hợp đã có; không tính chúng là Replay thị trường.

Đã bổ sung Early C2 thử nghiệm, bật sẵn theo yêu cầu, key swing cùng HTF có trước C1, raid/reclaim → TS/retest LTF đã đóng, tối đa một E mỗi C2, khóa tham chiếu SL/TP. Có 74 trace đối xứng từ thân hàm Pine và kiểm tra chạy chart trong Brave. Chi tiết: [Early C2](EARLY-C2-EXPERIMENT.md).

Chưa làm: Replay thị trường đầy đủ của cả hai nhánh; kết nối feed/model giữa web và Pine. Tài khoản Basic trong Brave đã đăng nhập vẫn chặn Replay intraday khi chọn nến. Quan sát runtime không thay nghiệm thu Replay hoặc đánh giá hiệu suất.

Đã sửa vòng đời setup: chạm INV/TP trên nến LTF đã đóng kết thúc focus ngay, hết C3 đóng entry nhưng giữ TRACK; INV chuyển WATCH, chỉ C3 gốc sweep/key/reclaim hợp lệ mới cấp attempt thay thế; LAST là lịch sử. Bỏ Context timeout. [Chi tiết và ca kiểm tra](CRT-SETUP-LIFECYCLE.md).

Đã thêm cụm HTF lớn hơn chỉ để quan sát, Auto H1/H2 → H4, H4 → D1, D1 → W1. Confirmed OHLC dùng offset lịch sử; live OHLC tổng hợp từ chart. LAST dùng cùng màu cho thân/viền/râu, giữ độ mờ. Caption và tiêu đề chia hàng; khoảng cách giữa hai khung dùng cùng cơ sở như khoảng chart–cụm chính.

Biên dịch nguồn canonical trên TradingView thành công, không lỗi/cảnh báo. Đã so khớp đầy đủ nội dung Pine Editor Brave với chibao.txt rồi bấm Update on chart. BTCUSD M5/H1 hiện TRACK; kiểm tra thực tế cả cụm H4 và LAST/TG, không có thông báo lỗi runtime. Đã tăng khoảng trống phải và thu thang giá để xem trọn cụm. Đây là kiểm tra một chart, không chứng minh mọi feed/zoom hay hiệu suất tín hiệu.

Sửa regression chọn C1: bỏ tái xác nhận từ raid xa và tái xác nhận dây chuyền; chỉ C3 liền sau cặp gốc được thay raid một lần. Chọn setup entry-open trước, rồi C1 gần nhất còn hợp lệ; không để parent cũ chiếm focus hay dùng parent INV làm fallback. Có 18 ca parent và kiểm tra hàm ưu tiên C1 lấy từ source Pine. Các ghi nhận chart ở trên là lần kiểm tra trước bản sửa này.

Nghiệm thu bản sửa C1 trên cùng BTCUSD M5/H1 trong Brave: nguồn khớp canonical; Update on chart thành công, không có cảnh báo runtime. Cụm cũ Buy/R xa đã chuyển sang cặp Sell C1/C2 liền nhau. Tooltip C1 mở 21/11 08:00 NY, đóng 09:00 NY; attempt xác nhận lúc 10:00 NY. 16 suite CRT và kiểm tra web clock đạt; TradingView biên dịch exact source không lỗi/cảnh báo. Chưa có Replay thị trường.

Nâng cấp giao diện/chẩn đoán tiếp theo: tên H1/H4 phía trên, hai countdown riêng dưới nến live, bỏ các nhãn giải thích cụm. 17 suite CRT đạt; biên dịch TradingView không lỗi/cảnh báo. Runtime tooltip WHY trên setup Sell nêu trên ghi 12 nến M5 C3, 2 mẫu TS, 0 retest, 0 signal, WAIT RETEST. H4 vẫn là display-only. Xem [báo cáo chẩn đoán](CRT-SIGNAL-DIAGNOSTICS.md); chưa đổi điều kiện entry để tăng số dấu.
