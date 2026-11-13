# Lượt phản ứng và IRL FVG HTF

Ngày 13/11/2026, Pine Editor tạm đã nhận đúng toàn bộ source cuối: exactSource=true, success=true, errors=null. Đây là chẩn đoán biên dịch; Add to chart yêu cầu đăng nhập nên chưa kiểm tra runtime/Replay.

Cập nhật 13/11/2026. Cấu hình quan tâm: XAUUSD H1/M5, Pullback, Fresh reaction. Đây là kiểm tra logic trên fixture, chưa phải backtest XAUUSD giai đoạn 01–13/11.

1. Pending cũ được thay khi có pivot hồi mới đã xác nhận, nguồn sau xác nhận cũ và run đối hướng mới sau xác nhận đó. Lượt mới bỏ FVG/OB/confirmation cũ, giữ run mới nếu hợp lệ. Mức xác nhận vẫn cố định trong từng lượt. Nếu giá đã vượt mức khi pivot mới được biết, xác nhận tại close hiện tại rồi chờ retest ở nến sau; không backdate.
2. Sau hit, Fresh reaction cần pivot hồi xác nhận với nguồn sau hit và tiến triển: Buy có pivot Low cao hơn đáy nến hit, close vượt đỉnh nến hit; Sell đối xứng. EGF còn cần rời rồi trở lại IRL. Chỉ đổi màu nến không đủ. Gate sóng chung chặn Buy nối đuôi khi chưa có pivot Low mới với nguồn sau Buy trước; Sell dùng High. Đổi model/revision/IRL không vượt gate. Cùng-bar vẫn hợp provenance trong một tam giác. WAVE WAIT không tiêu thụ state.sent. Không dùng cooldown số nến cố định.
3. IRL chỉ là FVG **HTF**. Bull: Low C3 > High C1; Bear: High C3 < Low C1. Vùng phải nằm trong range model. Chỉ biết vùng khi C3 đóng; box/CE line neo từ C1 như FVG thông thường, tách riêng timestamp nguồn và phát hiện. Giữ hai hướng nếu có, * chỉ FVG đang chọn theo bias. Không dùng OB/swing H/L làm fallback. OB/FVG LTF vẫn tính nội bộ cho entry, không vẽ box entry.

| Ca kiểm tra | Kết quả sau sửa |
| --- | --- |
| 24 nến dao động nhỏ, một model, không pivot mới | 1 hit thay vì 6 ở bản trước |
| Lượt pending đầu không retest, sau có cấu trúc mới | Thay lượt sau pivot xác nhận, phát tại nến retest tiếp theo |
| Sau hit có pivot hồi mới và tiến triển đúng hướng | Được phép phát lại; One per model vẫn chỉ 1 |
| Hai context/model lệch bar trong cùng nhịp | Chặn hit nối đuôi; trạng thái bị chặn không bị tiêu thụ |
| Hai context thỏa cùng bar | Giữ gộp một tam giác và tooltip provenance |
| Không có FVG HTF, chỉ OB hoặc swing | Không tạo IRL giả |
| Buy/Sell đối xứng, bias/time/CP/INV và bar chưa đóng | Các gate tiếp tục đạt kiểm tra |

Chạy `node tests/signal-density-audit.cjs` và `node tests/indicator-contract.cjs`. Harness thực thi thân evaluator, công thức gate sóng và IRL trích từ Pine; pivot là đầu vào đã xác nhận với nguồn cách hai nến. Không mô phỏng request.security, pivot/rollback/drawing của TradingView. Cần chart/Replay để kiểm tra hành vi thị trường thực; chưa có thống kê win rate hoặc tần suất XAUUSD.

History giữ mặc định 100 tam giác; Data Window direction có thể vẫn ghi hit dù nhãn lịch sử đã bị pruning. WHY chỉ là lý do nến đóng gần nhất. FIFO mỗi nhóm, timeout 8 HTF, bias, FVG/ERL và Pullback không hồi vẫn có thể giải thích việc không có dấu.
