# CRT-only web — kiểm tra 21/11/2026

## Phạm vi đã thực hiện

Web/checklist, Studio, hướng dẫn và AI Chart Lens đã chuyển sang CRT V1. Lượt mới chỉ có CRT; C1/key → C2/TS confirmed → C/M LTF trong C3 → Pullback/entry. Giữ fibo cá nhân trong mục thu gọn; chưa tự vẽ fibo hoặc kiểm tra giá ET. Các ô quản trị ghi +1R/+2R/Full TP thủ công, không tự dời BE/trailing.

Pine không thay đổi trong bước này. Ảnh kiểm tra của phiên TradingView tạm cho thấy trang đăng nhập khi thêm script lên chart. Không đăng nhập hoặc dùng phiên tài khoản riêng; **chưa có nghiệm thu Replay/Pine runtime**. Việc đồng bộ web được thực hiện độc lập theo đặc tả V1 đã thống nhất.

## Dữ liệu được giữ

- Schema mới `crt-v1`; state/active cũ giữ nguyên trong `__legacy`, kể cả snapshot lồng. Không dùng ô xác nhận cũ để khẳng định điều kiện C2/C3 mới.
- Outcome cũ còn trong current/history; namespace mới tách lượt CRT V1. Cá đã câu vẫn trong giỏ theo tài khoản, vòng và ngày.
- Buổi EGF/ISB cũ được lưu vào lịch sử khi bắt đầu buổi CRT mới; không đổi tên hoặc đổi kết quả.
- Sửa nhật ký cũ giữ mã phương pháp cũ; tạo bản ghi mới chỉ CRT hoặc Chưa phân loại. Import/export vẫn chấp nhận lịch sử.
- Checklist JSON hỏng giữ nguyên bản gốc. Checklist và Studio không sửa balance/PnL/payout.

## Đã kiểm tra

Chạy tập hợp kiểm tra bằng `node tools/check-crt-web.cjs`; dừng ngay nếu một nhóm thất bại.

- `tests/htf-framework.cjs`: migration htf-v1 và snapshot lồng, idempotent reload, giữ cá/outcome/session/finance, chặn chọn phương pháp cũ, context đổi làm mất xác nhận entry, nhật ký cũ sửa được, guard chặn bản ghi phương pháp cũ mới, JSON hỏng không bị ghi đè, 4 chiều rộng 1440/768/390/320.
- `tests/liquidity-guide.cjs`: hướng dẫn thu gọn, download Pine, mock prompt Gemini CRT/C3, thiếu dữ liệu trả NO_TRADE, render an toàn và không thay đổi tài khoản.
- `tests/pond-model.cjs`: 128 tổ hợp bước/risk, điều kiện theo thứ tự, quản trị độc lập và TP ưu tiên.
- Nhóm browser pond: outcome/giỏ cá, diễn hoạt không phát lại khi reload, manual close, fullscreen, controls, Studio, source Combine/XFA và riêng tư của bảng vận hành.
- `tests/review.cjs`: 14 kiểm tra tổng thể gồm journal, sizing, TopstepX, payout, backup/restore và dữ liệu hỏng; không có lỗi JavaScript.
- `tests/workspace.cjs`: sửa/lịch sử nhật ký, thống kê CRT, nhập gọn, recovery, quota rollback, xung đột tab và responsive.

Ảnh QA nằm tại `output/ui-review/crt-v1-web.png` và `crt-v1-mobile.png` (thư mục output không commit). External Gemini/CDN được cô lập trong test; không gọi API bằng key thật. `index.html` đồng bộ nguyên văn sang `topstep.html`, query phiên bản asset mới giúp URL GitHub Pages nhận runtime CRT V1.

## Giới hạn

Web không có feed chart nên không tự biết C2 đã đóng, còn C3 hay đã chạm target; checkbox là ghi nhận của người dùng. Các kiểm tra trên không chứng minh tần suất tín hiệu, xác suất thắng hoặc chất lượng entry. Replay cần thực hiện trong tài khoản TradingView có thể thêm chỉ báo lên chart.
