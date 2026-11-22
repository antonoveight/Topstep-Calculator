# Nghiệm thu Replay · CRT thuần

Ngày 22/11/2026. Người dùng đã cho phép bật [Early C2 thử nghiệm](EARLY-C2-EXPERIMENT.md) để quan sát; tài khoản Basic trong Brave đã kiểm tra và bị chặn Replay intraday. Quy trình dưới đây giữ cho lúc có CSV/quyền Replay, không tự coi đã hoàn tất. Đặc tả giao dịch hiện hành: [CRT thuần & thời gian](CRT-PURE-AND-TIME.md).

## Hiện đã làm được gì

Chỉ báo bổ sung các giá trị `TFA audit …` chỉ trong Data Window/CSV: giờ đóng nến, khung thời gian, tick, cách phát dấu, model ID, giờ TS, xác nhận HTF, biên thời gian C3, mức thu hồi và cực trị TS. Không thêm input, chữ trên chart, điều kiện entry, lệnh hay alert. Các giá trị tại tín hiệu lấy trực tiếp từ trạng thái đang phát tam giác.

Công cụ `tools/audit-crt-replay.cjs` đọc CSV để kiểm tra bằng chứng của các dấu đã xuất hiện: TS một phía, nguồn hai nến trong C3, retest sau xác nhận đóng, neo đúng râu, pending chưa bị phủ nhận và chưa chạm rào cản HTF trong đoạn dữ liệu có đủ. Có thể so hai lần xuất trước/sau tải lại chart tại **các nến đã đóng chung**.

Đây là kiểm tra dữ liệu xuất từ chỉ báo, **không chạy lại toàn bộ Pine hoặc tự chứng minh bias, model được chọn, tỷ lệ thắng hay không repaint trong mọi trường hợp**. Nó chưa phát hiện đầy đủ các tín hiệu bị bỏ sót: trường hợp đó cần Replay thủ công/đánh dấu chart. Thư mục hiện chưa có dữ liệu nến thực; chưa nghiệm thu thị trường.

## Cố định mẫu trước khi nhìn kết quả

Khởi đầu theo cấu hình hiện tại: H1/M5, Bias TF D1, Auto bias, Pullback, Fresh reaction. Ghi nguyên mã và feed, loại phiên hiển thị, ngày giờ NY/VN, tick size, cấu hình và phiên bản mã. Không ghép XAUUSD CFD với MGC futures thành một mẫu; không đổi nhà cung cấp giữa hai lần xuất.

Chọn trước một đoạn nhiều phiên liên tiếp có đủ lịch sử để bias/pivot khởi tạo. Sau đó rà hết các model CRT trong đoạn, gồm cả model không có tam giác. Mục tiêu đầu tiên là đúng logic và dễ giải thích; không chỉnh setting theo vài lệnh thắng đẹp. Chỉ chuyển sang đánh giá lợi nhuận sau khi đã có quy tắc khớp lệnh, chi phí và SL/TP cụ thể.

## Ma trận chart cần quan sát

| Tình huống | Kết quả cần thấy |
| --- | --- |
| C2 HTF mới đang sweep, chưa đóng | Chưa có entry của model đó. |
| C2 đóng một phía, reclaim thật | Bắt đầu quan sát C3; chưa đồng nghĩa có entry. |
| C2 quét cả hai phía hoặc đóng ngoài C1 | Không chọn hướng CRT Confirmed cho cặp đó. |
| TS LTF đã đóng trong C3 nhưng chưa hồi | WHY chờ retest, chưa có dấu Pullback. |
| Nến sau retest biên, đóng đúng phía, giữ cực trị | Dấu đúng nến retest đã đóng; Buy dưới, Sell trên. |
| Pending close lại/đúng biên hoặc wick chạm cực trị TS | Hủy pending; TS mới phải được xác nhận riêng. |
| Giá chạy thẳng không hồi | Không có dấu Pullback là hợp lệ; không coi là lỗi bỏ sót. |
| Target/cực trị SL HTF đã chạm | Không phát thêm entry cho model đó. |
| Cuối C3 và đầu C4 | Nến cuối C3 có thể hợp lệ; không mang pending sang C4. |
| Ngược bias tại key swing có trước C1 | Chỉ cho phép khi đủ key, phản ứng C2 và TS/retest LTF; B0/B0! vẫn chặn. |
| Nhiều model/sóng chồng nhau | Kiểm tra model ID và khóa sóng, tránh gán dấu cho range khác. |
| Tải lại với cùng feed, setting và lịch sử khởi tạo | Dấu trên các nến đã đóng chung cần khớp; khác biệt phải được giải thích. |

Với tín hiệu bị nghi là thiếu, ghi model ID, nến kỳ vọng và WHY tại **thời điểm đó**, kiểm tra cả đường tới target. Không dùng nến tương lai để kết luận lúc đó đã đủ điều kiện.

## Xuất và chạy đối chiếu

1. Nạp `chibao.txt` mới vào Pine Editor và Add to chart. Chỉ để **một** TFA instance trong chart xuất dữ liệu.
2. Trong Replay, đi từng nến qua đoạn đã chọn. Ghi ảnh trước/sau các sự kiện trong bảng. Không dùng dữ liệu đang chạy làm nến đã đóng.
3. Dùng **Export chart data**, định dạng thời gian **Unix**; cần có OHLC và các cột `TFA audit …`. Chức năng xuất phụ thuộc quyền/tính năng tài khoản TradingView hiện có. Tài liệu chính thức: [xuất dữ liệu chart](https://www.tradingview.com/support/solutions/43000537255-how-to-export-chart-data/), [xuất plot của chỉ báo](https://www.tradingview.com/pine-script-docs/faq/indicators/).
4. Lưu CSV trong `output/crt-replay/`. Đây là dữ liệu local đã được Git bỏ qua. Lưu riêng bản Replay và bản sau reload; không ghi đè hai bản lên nhau. Nếu giao diện không cho xuất tại Replay, giữ ảnh/biên bản và ghi rõ hạn chế; không gọi CSV lịch sử sau reload là bản Replay trước reload.
5. Giữ cùng feed, settings và phạm vi lịch sử khởi tạo. Chạy:

```powershell
node tools/audit-crt-replay.cjs output/crt-replay/replay.csv
node tools/audit-crt-replay.cjs output/crt-replay/replay.csv output/crt-replay/reload.csv
```

Báo cáo tại `output/crt-replay/audit.json`: hash từng CSV, hash mã local hiện tại, số nến/dấu, vi phạm và mục thiếu bằng chứng. Hash mã local không chứng minh CSV được xuất từ đúng mã; phải tự ghi phiên bản chỉ báo đang nạp.

Exit code 0: các kiểm tra có bằng chứng đã qua; 1: đầu vào lỗi hoặc có vi phạm/khác biệt; 2: thiếu bằng chứng, không có tín hiệu hoặc không có nến chung. Không có dấu không được tự đánh dấu là đã nghiệm thu entry. So reload có OHLC/settings khác sẽ báo `incomparable`, không kết luận repaint. Khi thiếu đầu C3 hoặc có khoảng trống LTF, công cụ ghi thiếu dữ liệu thay vì đoán đường giá.

## Điều kiện chuyển bước

Chỉ chốt sau khi đã có chart/CSV thực và các ca quan sát được giải thích. Ghi rõ ca chưa gặp hoặc chưa kiểm tra; không ép đủ số ca bằng dữ liệu tổng hợp rồi gọi là nghiệm thu thị trường.

Early C2 hiện là thử nghiệm riêng đã được người dùng cho phép bật. Cột Early có tên riêng; công cụ ghi các sự kiện này là chưa kiểm chứng bởi bộ audit Confirmed C3. So reload vẫn kiểm tra E thay đổi trên các nến chung và phân biệt đổi công tắc Early với khác biệt tín hiệu. Không coi Confirmation close của C3 là Early C2.

Vòng đời setup hiện hành: [Range C1, attempt, INV/TG và xác nhận lại](CRT-SETUP-LIFECYCLE.md).
