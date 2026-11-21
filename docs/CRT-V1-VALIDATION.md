# CRT V1 — ghi nhận kiểm tra 21/11/2026

## Đã thực hiện

- Lưu nguyên bản multi-model trước cải tổ; giữ test baseline với tiền tố `legacy-`.
- Chỉ giữ detector và lifecycle CRT; gỡ EGF/ISB cùng kênh và bộ đếm riêng.
- Tách entry C3 khỏi thời gian quan sát context. C4 không thể khớp một retest chờ từ C3. Context cũ không chặn cặp mới đang mở C3.
- Giữ key FVG/OB/swing HTF, bias/guard và ngoại lệ CRT counter-bias có trước C1; giữ entry OB/FVG nội bộ.
- Chặn entry sau khi target hoặc cực trị SL C2 bị chạm; theo dõi EQ riêng, không kết thúc model ở EQ.
- Giảm snapshot từ 114 xuống 61 field; tổng tuple request từ 127 xuống 74, bao gồm bias bundle và bias snapshot.
- Nếu tắt timeout và đầy 12 slot, bối cảnh cũ nhất chuyển sang LAST với mã CAP để nhường CRT mới còn đường target; CAP không phải thua lệnh.
- Đồng bộ `chibao.txt`, hướng dẫn setting, tooltip và cảnh báo CRT. Alerts HTF/TS chỉ cho model mới đang tuổi 0; quay lại context cũ không báo TS mới.

## Bộ ca tổng hợp

Lệnh: `node tools/check-crt.cjs` — 11 nhóm kiểm tra.

- 11 ca sweep được đặt tên và 3.000 ca đối xứng Buy/Sell: chạm, thiếu tick, boundary close, outside close, double sweep và hình thái engulfing không có TS.
- Hàm lifecycle Pine thực tế: target, close invalid, hai biên mơ hồ, timeout, history và thứ tự ưu tiên lý do.
- Thân hàm channel Pine: C3/C4, closed-bar, pre-activation, target/SL sticky, CT key causality, OB/FVG, Pullback sau xác nhận và chống trùng nhịp.
- Đối chiếu CRT cũ/mới trên cùng tape Buy/Sell và hai chế độ thời điểm; những thay đổi chủ đích được kiểm tra riêng. Đây không phải đối chiếu toàn bộ lịch sử thị trường.
- 20 tổ hợp mode/timing/cadence trên 10 ca workflow đối xứng; 800 ca bị chặn bởi close/bias/time/wave. Auto/Pullback/Fresh reaction khớp 10/10 ca đã định nghĩa; con số này **không phải win rate**.
- 12 tổ hợp nhóm nến CRT, nguồn/FOLLOW tách biệt, OHLC live, archive độc lập và cleanup.
- Snapshot/sync, marker màu/vị trí, macro đủ 1.440 phút, DST và QT.

## Biên dịch và giới hạn

Source cuối được gửi nguyên văn vào Pine Editor tạm; request `translate_light` trả `ourCode=true`, `exactSource=true`, `success=true`, `errors=null`, không có warning. Không đăng nhập, lưu, phát hành script hoặc đặt lệnh.

Trình kiểm tra Node không mô phỏng Pine realtime rollback, request.security, pivot discovery hoặc cơ chế vẽ. Không có kết quả Replay/forward, tần suất trên MGC/XAUUSD, lợi nhuận hay drawdown được xác minh trong đợt này. Pine Editor yêu cầu đăng nhập để thêm lên chart ở phiên tạm; biên dịch thành công không được ghi nhận thành nghiệm thu chart.

## Checklist nghiệm thu tiếp theo trên chart

1. Dùng bản CRT V1 mới và tạo lại alerts cũ để tránh snapshot cấu hình multi-model.
2. Replay H1/M5, rồi các HTF khác nếu sử dụng: dừng trước close C2, sau close C2, cuối C3 và đầu C4. Không được thấy entry từ tương lai hoặc sau C3.
3. Kiểm tra một CRT thuận bias, một CT tại key có trước, một double sweep, một setup target đã bị lấy và một setup timeout nhưng chưa vô hiệu.
4. Đối chiếu wick OHLC của nguồn/FOLLOW với feed, zoom/di chuyển chart để kiểm tra line, caption và cột nhãn; kiểm tra gap phiên/cuối tuần.
5. Ghi WHY/ID của tín hiệu thiếu/thừa. Chưa nới điều kiện hoặc tối ưu hiệu suất trước khi đối chiếu các ví dụ này.

Web/checklist và fibo tự động chưa chuyển trong đợt này. Early C2, Model 1/KOD/SMT tiếp tục nằm ở nghiên cứu, không trộn vào Confirmed V1.
