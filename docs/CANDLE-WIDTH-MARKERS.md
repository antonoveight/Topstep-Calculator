# Tam giác theo chiều rộng nến LTF — bản cũ

Đã được thay thế theo lựa chọn ngày 14/11/2026: dùng tam giác native cố định size=4, xấp xỉ nửa Tiny. Phần dưới là ghi chú kỹ thuật của bản vẽ theo chiều rộng nến trước đó, không mô tả source hiện hành. Kiểm tra hiện tại: `node tests/half-tiny-markers.cjs`.

Cập nhật 14/11/2026. Thay glyph 6pt bằng hai cạnh hữu hạn và một linefill tạo tam giác đặc. Đáy rộng 80% một khoảng nến chart (`time ± 0.4 × chartSeconds`), tương ứng gần đúng thân nến chuẩn; đỉnh đặt đúng timestamp nến thỏa điều kiện, không lùi về pivot hoặc dời sang nến khác.

Chiều ngang co giãn theo trục thời gian khi zoom. Pine không cung cấp độ rộng thân nến theo pixel/cài đặt giao diện TradingView, nên đây là kích cỡ theo tọa độ nến, không cam kết khớp từng pixel với mọi theme, độ giãn bar hoặc khoảng nghỉ phiên. Chiều cao và khoảng cách tới râu lấy theo vùng giá hiển thị với ngưỡng tối thiểu theo tick; Buy nằm dưới Low, Sell nằm trên High. Màu lime/red và nội dung tooltip giữ nguyên. Tooltip dùng vùng tương tác trong suốt trên tam giác.

History vẫn tối đa 200 dấu: mỗi dấu có hai line, một linefill, một tooltip label. Khoảng 400 line marker + 32 line mức/chú giải + tối đa 18 râu cụm = 450, chừa chỗ tạo marker trước khi pruning dưới giới hạn 500. `f_dropMark` xóa đồng bộ fill, hai cạnh, tooltip và bucket trong cả History/Latest/Hide; không giữ đối tượng mồ côi. Không thay điều kiện entry, bias, timestamp tín hiệu hay bộ đếm.

Kiểm tra: `node tests/candle-width-markers.cjs` thực thi thân tạo/xóa marker trích từ Pine với drawing API giả lập. Bao gồm M1/M3/M5, hai hướng, tâm/rộng/độ cao, màu, tooltip, 230 lần tạo rồi giữ 200, xóa giữa danh sách, Latest=1 và Hide=0. `indicator-contract` tiếp tục đạt. Harness không xác minh renderer của TradingView; cần xem chart thực để đối chiếu kích cỡ hiển thị.

Pine Editor tạm ngày 14/11/2026 nhận đúng toàn bộ source: exactSource=true, success=true, errors=null. Phần evaluator tín hiệu/wave gate được đối chiếu giữ nguyên; thay đổi chỉ ở đối tượng hiển thị và quản lý xóa marker.

Tham khảo API: [TradingView — Lines and boxes](https://www.tradingview.com/pine-script-docs/visuals/lines-and-boxes/#filling-the-space-between-lines).
