# Preset nền day trading và phạm vi kiểm tra

Ngày 14/11/2026. Mục tiêu: phù hợp workflow cá nhân đã chốt (HTF model → LTF xác nhận → Pullback → một tín hiệu cho một nhịp cấu trúc), không tối đa số tam giác. Chưa xác định bộ setting có lợi nhuận/drawdown tốt nhất trên XAUUSD.

## Kiểm tra đã chạy

`node tests/day-trading-settings.cjs --write` thực thi thân evaluator Pine qua harness giới hạn trên các fixture Buy/Sell:

- 5 LTF condition × 2 timing × 2 cadence = **20 tổ hợp**.
- Các tình huống gồm xác nhận CISD, MSS, FVG retest, OB retest và lượt phản ứng mới sau pivot đã xác nhận.
- **800 kiểm tra chặn**: bar chưa đóng, bias ngược, ngoài time gate và chưa được phép mở sóng mới. Tất cả đều chặn đúng.
- Bộ Auto / Pullback / Fresh reaction khớp 10/10 ca workflow do người dùng yêu cầu. One per model bỏ lượt cấu trúc mới trong 2 ca; mode đơn CISD/MSS/FVG/OB bỏ những loại xác nhận còn lại. Confirmation close có quy ước thời điểm khác Pullback, không bị xem là lỗi hoặc kém lợi nhuận.

**10/10 là độ khớp các hợp đồng logic được chọn trước, không phải win rate, xác suất thắng hay độ ổn định thống kê trên thị trường.** Các ca được thiết kế để kiểm tra workflow Pullback/đa loại xác nhận; kết quả không phải xếp hạng khách quan cho mọi phong cách giao dịch. Các bộ khác vẫn có thể phù hợp với cách market hoặc chỉ theo một loại xác nhận.

Đã chạy thêm `node tests/indicator-contract.cjs` và `node tests/signal-density-audit.cjs` để kiểm tra snapshot HTF, IRL/OB/swing, lifetime, thời gian/DST/QT, vị trí và các giới hạn phát lại.

Pine Editor tạm ngày 14/11/2026 nhận đúng toàn bộ source sau gom preset: exactSource=true, success=true, errors=null. Đây là kiểm tra biên dịch, chưa phải chart execution/Replay. Báo cáo JSON tái tạo bằng lệnh trên nằm tại `output/settings-review/workflow-matrix.json` (thư mục output không commit).

## Mặc định trong code

| Setting | Giá trị | Căn cứ |
| --- | --- | --- |
| LTF condition | Auto | Giữ đủ các nhánh xác nhận trong workflow |
| Signal timing | Pullback | Theo lựa chọn hiện tại của người dùng; đợi nến retest sau xác nhận |
| Signal cadence | Fresh reaction | Cho phép lượt cấu trúc mới và giữ gate chống trùng sóng |
| HTF | H1 | Giữ baseline hiện tại; chưa so sánh bằng dữ liệu thị trường |
| Chart LTF | M5 | Người dùng chọn trên chart; script không thể tự đổi timeframe chart |
| Models | All | Giữ ba nhóm CRT/EGF/ISB đang dùng |
| Bias TF / mode | D1 / Auto | Giữ baseline; chưa kết luận D1 hơn H4 cho day trading |
| Model timeout | 8 HTF | Giữ giới hạn chờ đã thống nhất; chưa tối ưu số 8 trên XAUUSD |
| Time filter | Context only | Giữ nguyên vì chưa có dữ liệu so sánh macro/working windows |

Ba setting LTF phù hợp đã là giá trị mặc định trước lượt kiểm tra. Bản này gom chúng thành `DEFAULT_ENTRY_MODE`, `DEFAULT_SIGNAL_TIMING`, `DEFAULT_SIGNAL_CADENCE` và kiểm tra Inputs thực sự dùng các giá trị đó. Không thay thuật toán hoặc chuyển các tham số chưa được so sánh sang giá trị suy đoán. OB, swing H/L và cách neo FVG HTF trên LTF được giữ nguyên.

Khi đã chỉnh Inputs trên TradingView, cập nhật source có thể giữ các giá trị đã lưu của instance. Dùng **Reset settings** để nhận đầy đủ mặc định rồi kiểm tra lại chart M5; tạo lại alert nếu muốn alert dùng cấu hình mới.

## Để chọn bộ tốt nhất trên thị trường

Repository chưa có OHLC XAUUSD cho giai đoạn cần xét và chưa có chiến lược khớp lệnh. Muốn xếp hạng lợi nhuận/drawdown cần cùng feed giá/timezone, quy tắc entry (close xác nhận, nến sau hay limit hồi), SL, full TP, chi phí spread/slippage và quy tắc đóng cuối ngày. Chỉ báo hiện để người dùng tự chọn entry, SL, TP; không tự giả định các quyết định này.

Sau khi có các dữ liệu đó mới so sánh HTF/bias/timeout/time windows trên mẫu huấn luyện và giai đoạn kiểm tra độc lập, tránh chọn bộ thắng riêng vài ngày đã xem. Cần kiểm tra sensitivity các giá trị lân cận và forward test. Pine harness không mô phỏng request.security, pivot/rollback/drawing của TradingView.

Tham chiếu: [TradingView — Strategies](https://www.tradingview.com/pine-script-docs/concepts/strategies/) giải thích mô phỏng lệnh, báo cáo chiến lược và các giả định khớp lệnh; kiểm tra indicator không tạo ra báo cáo lợi nhuận tương đương.
