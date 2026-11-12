# CRT và bối cảnh thanh khoản — bản tích hợp

Tài liệu này chọn lọc từ cẩm nang CRT / Inside Bar / Engulfing / IRL–ERL do người dùng cung cấp. Đây là hướng dẫn đọc chart và ghi nhận thủ công, không phải bộ phát tín hiệu hoặc kết quả kiểm định chiến lược.

**Cấu trúc hệ thống hiện hành:** [HTF → kịch bản → entry LTF](TRADING-FRAMEWORK.md). Chỉ giữ CRT, Engulfing/Outside Bar và Inside Bar là nhóm cấu trúc HTF. Trend, AMD và Break trong các ghi chú cũ chỉ mô tả bối cảnh/hành vi; không còn là phương pháp độc lập.

## 1. Quy ước chung

Luôn xác định **range tham chiếu và khung thời gian** trước khi gọi một mức là nội bộ hoặc bên ngoài. Một mức nội bộ của H1 có thể nằm ngoài range M5.

| Đối tượng | Quy ước sử dụng |
| --- | --- |
| ERL / BSL / SSL | Thanh khoản bên ngoài range tham chiếu: phía trên đỉnh hoặc dưới đáy đã chọn. Là mục tiêu có điều kiện, không phải đích chắc chắn. |
| Thanh khoản nội bộ | Các đỉnh/đáy nhỏ nằm trong range tham chiếu, gồm biên Inside Bar khi xét trong Mother Bar. |
| FVG / OB | Vùng phản ứng hoặc tái cân bằng được đánh dấu riêng; không gộp mọi vùng thành cùng một loại IRL. |
| EQ | `(Range High + Range Low) / 2` của range đã chọn. |
| CE | Trung điểm của FVG hoặc vùng mất cân bằng đang xét. Không mặc định bằng EQ. |
| POC | Mức có khối lượng lớn nhất trong FRVP đã neo. Không suy ra POC từ trung điểm, FVG hoặc hình dạng nến. |
| Outside Bar | Nến có High vượt High và Low thấp hơn Low nến trước. |
| Engulfing | Mẫu bao trùm thân nến; phân biệt với Outside Bar bao trùm High–Low. |
| Inside Bar | Theo quy ước bản này: High không vượt và Low không thấp hơn biên mẹ, ít nhất một biên phải hẹp hơn. Hai nến có cùng cả High và Low không tính là nén mới. |

Chu kỳ IRL ↔ ERL là cách tổ chức kịch bản. FVG, OB, Inside Bar hoặc một cú sweep riêng lẻ không chứng minh hướng đi tiếp theo. Outside Bar không mặc định tạo FVG; FVG phải được xác nhận bằng cấu trúc ba nến riêng.

## 2. Quy trình sáu điểm

1. **Range:** chọn khung và hai biên; tránh thay range giữa lệnh để hợp thức hóa nhận định.
2. **Vị trí:** giá đang tiếp cận vùng phản ứng, ở giữa range hay gần mục tiêu?
3. **Sự kiện:** chạm, quét rồi đóng trở lại, hoặc đóng vượt biên? Ghi rõ khung nến xác nhận.
4. **Xác nhận:** dùng điều kiện của setup đã chọn, ví dụ C2 H1 đóng trở lại và M5/M3 đóng qua POC. Macro và Quarterly Theory chỉ bổ sung bối cảnh giờ.
5. **Thực thi:** ghi entry, điểm vô hiệu/SL, một mục tiêu Full TP và R:R trước khi tính khối lượng. Chưa đủ dữ liệu thì tiếp tục chờ.
6. **Quản trị:** SL theo điểm vô hiệu cấu trúc; chỉ trailing khi có swing M5 mới được xác nhận. Không tự dời BE theo +1R/+2R, không chốt một phần. Đóng tay cần ghi lý do thực tế; kết quả hồ câu không tự cập nhật PnL.

Phân biệt **đang vượt biên** với **đã đóng vượt biên**. Một nến đóng ngoài range làm mất điều kiện sweep đóng trở lại của setup đảo chiều đang xét; nó chưa tự chứng minh breakout sẽ thành công. Retest thất bại hoặc quay lại range cần đánh giá lại theo kế hoạch vô hiệu.

## 3. Ba cấu trúc HTF, cùng một luồng entry LTF

| Cấu trúc HTF | Bối cảnh | Xác nhận cần giữ | Bỏ qua / đánh giá lại |
| --- | --- | --- | --- |
| CRT / TS | C1/range và mức thanh khoản trên HTF đã chọn. | TS = C2 quét rồi lấy lại mức, đóng trở lại trong range; sau đó tìm điều kiện entry LTF đã chọn. | Chưa reclaim, C2 đóng ngoài range, quét hai biên mơ hồ hoặc điều kiện entry/vô hiệu chưa rõ. |
| Engulfing / Outside Bar | Nến bao trùm thân hoặc High–Low tại vị trí HTF được đánh dấu. | Phân biệt mẫu, nến đã đóng và kịch bản hướng tới mục tiêu; LTF xác nhận entry. | Chỉ dựa màu nến, mặc định đảo chiều hoặc giả định có FVG. |
| Inside Bar | Mother/Inside trên HTF; giữ biên mẹ ban đầu khi còn nén lồng nhau. | Kịch bản sweep trở lại hoặc đóng phá biên đã chọn; sau đó entry LTF phù hợp. | Còn nén, chưa có sự kiện/xác nhận hoặc retest thất bại. |

Inside Bar ở giữa vùng nhiễu vẫn là điều kiện chờ. Ba cấu trúc có thể chồng lấp; ghi cấu trúc chính và chú thích mẫu đi kèm, không mặc định ba tín hiệu độc lập. Sau khi range mẹ bị vô hiệu, xác lập lại range rõ ràng trước khi đọc chu kỳ mới.

## 4. Quản trị thống nhất với người dùng

- **Full TP:** chọn một mục tiêu trước lệnh. Midpoint có thể là mốc quan sát hoặc mục tiêu toàn bộ nếu được chọn trước; không mặc định là TP1 chốt 50%.
- **SL:** theo điểm vô hiệu của setup. Không tự dùng Fibo −0.27/−0.5 khi chưa có quy ước neo được kiểm chứng.
- **Đóng tay:** giữ chức năng ghi nhận. Nêu lý do như điều kiện vô hiệu xuất hiện hoặc lỗi thực thi; chưa có quy tắc định lượng được thống nhất thì không tự đánh giá là tuân thủ chỉ vì kết quả có lãi.
- R:R là phép đo từ entry, SL và target; không gán sẵn 1:3–1:5 cho tên mô hình. Không suy ra tỷ lệ thắng từ nến hoặc vị trí POC.
- Phần mềm không có feed OHLC/volume để xác nhận các sự kiện trên; checkbox và kết quả vẫn do người dùng ghi nhận.

## 5. Nội dung được lược bỏ

Không tích hợp quy tắc chốt một phần/BE tại TP1; cam kết xác suất hoặc R:R; tuyên bố mọi cú quét nhỏ đều không ảnh hưởng mục tiêu; tự động đổi bias theo Inside Bar; SL Fibo thiếu neo; và mã Pine chưa kiểm chứng.

Đoạn Pine trong cẩm nang gốc chưa phải indicator sẵn sàng dùng: nhánh Inside Bar dùng mẫu `isInsideBar[1]` với biên lấy từ cặp nến khác; nhánh FVG lùi thêm chỉ số Engulfing; chưa quản lý range mẹ lồng nhau, HTF độc lập hoặc xác nhận đóng nến. Pivot chỉ được biết sau số nến phải chờ; vẽ lùi không có nghĩa đã biết mức tại thời điểm quá khứ. Không đưa mã này vào runtime dự án.

Nếu phát triển indicator riêng sau này: thống nhất định nghĩa mẫu và timeframe; sửa chỉ số; kiểm tra đóng nến và độ trễ pivot; kiểm thử các mẫu giá đối xứng Long/Short, nested range, equal high/low và tải lại chart. Chưa biên dịch hoặc backtest Pine trong lần tích hợp này.

## 6. Nguồn và phạm vi

- Cẩm nang CRT / Inside Bar / Engulfing / IRL–ERL người dùng cung cấp và `trading_playbook.md` trong dự án. Bản này được ưu tiên khi các đoạn cũ xung đột về chốt một phần, BE máy móc hoặc quyền ghi nhận đóng tay.
- [TradingView — Engulfing](https://www.tradingview.com/support/solutions/43000583769-engulfing-bearish/): phân biệt bao trùm thân và toàn bộ range.
- [Pine execution model](https://www.tradingview.com/pine-script-docs/language/execution-model/), [repainting](https://www.tradingview.com/pine-script-docs/concepts/repainting/): xác nhận nến, tín hiệu đang chạy và thông tin vẽ vào quá khứ.

AI Chart Lens chỉ đọc những gì thấy trong ảnh. Thiếu giá, khung giờ, nến đã đóng hay FRVP thì phải ghi thiếu dữ liệu; không dựng POC, volume, tick size hoặc trạng thái tài khoản.
