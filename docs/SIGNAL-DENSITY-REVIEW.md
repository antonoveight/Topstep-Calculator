# Rà soát tín hiệu dồn và nhịp sóng thiếu tín hiệu

Ngày rà soát: 13/11/2026. Cấu hình người dùng xác nhận: XAUUSD, HTF H1, chart M5, Pullback, Fresh reaction; giai đoạn quan tâm 01/11/2026 đến nay.

Đã kiểm tra source và thực thi thân evaluator LTF trên OHLC giả lập. Chưa chạy source trên dữ liệu XAUUSD/Replay của giai đoạn trên; các con số dưới đây là ca tái hiện cơ chế, không phải thống kê thị trường hay đánh giá độ chính xác.

## Những gì đã tái hiện

| Hiện tượng | Cơ chế trong source | Kết quả fixture |
| --- | --- | --- |
| Nhiều dấu trong cùng một đoạn dao động | CRT/TS và ISB được mở lượt mới bằng `opposing and not priorOpposing` sau khi đã phát. Không đòi một swing mới đã xác nhận, một quãng tiến triển mới, hoặc nhận diện cùng sóng giữa ba kênh. | Một context CRT cố định có 6 hit trong 24 nến LTF. One per model có 1 hit trên cùng chuỗi. |
| Cấu trúc sau bị bỏ qua khi lượt chờ trước chưa có entry | `confirmIndex` chỉ được gán khi đang trống; `freshReaction` lại cần `state.sent`. FVG/OB đầu tiên cũng giữ tới khi vô hiệu hoặc reset lượt. Một mức chờ cũ chưa retest có thể giữ toàn bộ lượt ở cấu trúc trước. | Chuỗi có hai pha xác nhận: lượt đầu chưa retest, lượt sau có xác nhận và hồi riêng. Context giữ từ đầu có 0 hit; nếu xét pha sau riêng bằng cùng evaluator thì có 1 hit. |
| Đoạn đi một hướng rõ nhưng không có dấu | Pullback yêu cầu retest ở nến sau xác nhận; mạnh và đẹp bằng mắt không thay thế điều kiện này. | Chuỗi xác nhận rồi chạy thẳng: Pullback có 0 hit, Confirmation close có 1 hit tại nến đóng xác nhận. |
| Cùng hình thái LTF nhưng không phát | Các gate HTF/bias/IRL/target/time vẫn áp dụng. | Cùng chuỗi nhưng ngược bias, EGF không có IRL, hoặc không có model đều có 0 hit với lý do tương ứng. |

Các hit cùng hướng trong **cùng một nến** đã được hợp thành một tam giác. Cụm nhiều tam giác ở các nến cạnh nhau có thể đến từ lượt mới của cùng model, model/revision mới, hoặc CRT/EGF/ISB phát lệch nến. Hiện chưa có cơ chế nhận diện cùng một nhịp sóng để gộp giữa các kênh. Một cooldown đơn thuần chỉ làm thưa dấu; chưa giải quyết được cách định nghĩa lượt phản ứng.

## Các lý do khác cần phân biệt trên chart thật

- Mỗi nhóm chỉ xét model FIFO cũ nhất còn hiệu lực, không xét đồng thời mọi model cùng nhóm. Một model mới phù hợp với sóng đang nhìn có thể vẫn đang xếp hàng.
- Đỉnh/đáy pivot phải chờ hai nến bên phải để xác nhận. Chỉ báo không biết trước đỉnh/đáy đẹp khi chúng vừa hình thành.
- Bias, thiếu IRL/ERL, CP đã bị lấy, hoặc model timeout sau 8 H1 đều có thể chặn. Không tự biến một nhịp đảo chiều đẹp thành tín hiệu ngược bias.
- History mặc định giữ **100 tam giác cuối**, không phải toàn bộ giai đoạn đã tải. Dấu đầu giai đoạn 01/11 có thể từng phát rồi bị xóa vì giới hạn giữ. Các plot `CRT/EGF/ISB direction +1/-1` trong Data Window vẫn ghi hit tại nến lịch sử được tính, dù nhãn tam giác đã bị loại. Dashboard N đếm hit theo nhóm; không bằng số tam giác đang giữ.
- WHY trên dashboard là lý do của nến đóng gần nhất, không phải nến quá khứ đang đặt con trỏ. Không dùng nó để kết luận một tín hiệu lịch sử bị chặn vì lý do nào.

## Hướng chỉnh phù hợp để xem xét tiếp

1. Chuẩn hóa lượt phản ứng theo cấu trúc: sau một dấu, yêu cầu một swing/pullback mới có xác nhận thay vì chỉ một lần đổi màu nến. Gộp các hit cùng hướng/cùng nhịp giữa các kênh, nhưng vẫn ghi đủ provenance trong tooltip/diagnostics.
2. Cho phép kết thúc một lượt **đang chờ nhưng chưa phát** khi có cấu trúc mới đủ điều kiện; xây lại mức xác nhận/FVG/OB theo pha mới. Trong mỗi lượt, mức đã xác nhận vẫn cố định để tránh chạy theo giá.
3. Giữ phân biệt Pullback và Confirmation close. Không thêm tín hiệu vào đoạn chạy thẳng chỉ vì sau đó nhìn lại thấy đẹp; đó là thay đổi quy tắc vào lệnh.
4. Kiểm tra trên cùng feed XAUUSD, H1/M5, bias/time settings và dữ liệu 01–13/11 trước/sau chỉnh. Ghi rõ số hit, số cụm sóng, lý do không phát và số nhãn bị pruning; chưa suy ra win rate nếu chưa có entry/SL/TP thực tế.

Lượt rà soát này bổ sung fixture và báo cáo; thuật toán tín hiệu hiện hành chưa được điều chỉnh theo các đề xuất trên.

Chạy lại: `node tests/signal-density-audit.cjs` và `node tests/indicator-contract.cjs`. Harness không mô phỏng request.security, pivot/rollback hay drawing của Pine.
