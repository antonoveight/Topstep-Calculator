# Bản lưu: fibo CRT tự động — đã gỡ 22/11/2026

> Tính năng đã gỡ theo yêu cầu người dùng. Chỉ báo hiện không có input/helper/line fibo tự động; dùng [quy ước thủ công](FIBO-CONVENTION.md). Nội dung dưới mô tả phiên bản đã bỏ, không dùng để setting bản hiện tại.

Người dùng tạm chấp nhận Replay của baseline CRT V1 để tiếp tục bước fibo. Đây là xác nhận của người dùng, không phải kết quả Replay độc lập do agent thực hiện. Bản bổ sung fibo được kiểm tra toán học, hàm vẽ giả lập và biên dịch riêng; vẫn cần quan sát hình thực tế khi dùng.

## Phạm vi

Thêm đúng một input **Display → CRT fibo (SL / ET / TP)**, mặc định bật. Chỉ vẽ fibo tham chiếu cho CRT đang hiển thị; giữ nguyên detector, bias, cửa sổ C3, điều kiện tam giác và alert. Không có entry ET tự động, không đặt lệnh, không tự dời SL/BE/trailing, không chốt một phần hoặc tự chia hai vị thế.

| Mức | Nhãn | Màu |
| --- | --- | --- |
| 0 | SL | Đỏ |
| 0.1 | ET2 | Xanh dương |
| 0.2 | ET1 | Xanh ngọc |
| 0.4 | break | Chữ/mức theo màu foreground của chart |
| 0.6 | BE | Foreground |
| 0.8 | TL | Foreground |
| 1 | TP | Foreground |

Không vẽ 0.5 hay 1.618. EQ C1 vẫn là mức riêng, không đổi thành BE hoặc mức fibo.

## Neo và thời điểm

- Sell: **SL = High C2, TP = Low C1**. Buy: **SL = Low C2, TP = High C1**. High/Low gồm cả râu, không lấy Open/Close thay cực trị.
- Công thức: `SL + r × (TP − SL)`. ET2 luôn gần SL hơn ET1, đối xứng cho Buy/Sell. Giá tỷ lệ không tự biến thành giá khớp lệnh.
- Chỉ dùng OHLC C1/C2 của snapshot HTF đã xác nhận. C2 đang chạy và OHLC live của cụm nến bên phải không sửa bộ neo.
- SL/TP nối từ đúng nến tạo cực trị. Các mức ở giữa bắt đầu từ timestamp C2 đóng, khi fibo được biết. Không có đủ timestamp râu nguồn trên chart thì ẩn cả bộ, không vẽ bộ neo giả.
- Neo cố định **theo model ID**; model mới được chọn có bộ fibo riêng. Chỉ báo không biết vị thế thực đang mở, nên việc đổi model không được hiểu là đổi SL/TP của lệnh đang giữ.

Ví dụ giá giả định:

| Hướng | SL | ET2 | ET1 | break | BE | TL | TP |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Sell | 115 | 113.5 | 112 | 109 | 106 | 103 | 100 |
| Buy | 95 | 96.5 | 98 | 101 | 104 | 107 | 110 |

## Hiển thị và tương tác

Có thể tắt Model range / ERL / CP và giữ fibo riêng. Khi bật cả hai, giá trùng nhau có vùng chiếu giao nhau được gộp line/nhãn, ví dụ `RL / TP` hoặc `EQ / break`; giữ điểm nguồn sớm nhất, không xóa mức gốc. Hai giá gần nhau nhưng khác nhau không bị làm tròn/gộp thành một.

Chữ nằm bên phải line, nền trong suốt; bố trí giữ khoảng cách theo cỡ chữ/khung nhìn và dùng đường dẫn khi dời nhãn. Line vẫn ở đúng giá. Fibo giữ cùng giới hạn chiếu, recency và khoảng đệm trước cụm HTF đang có. Không kéo hết chart; hết C3 không mở lại entry chỉ vì fibo vẫn còn trong context.

Tắt fibo sẽ xóa các nhãn/mức phụ, trả SL/TP về tên INV/CP khi Model range vẫn bật. Tắt fibo không đổi tín hiệu hoặc alert. Hover nhãn xem ratio, model ID, thời điểm C2 đóng và ý nghĩa tham chiếu. Nhãn SL cùng mức INV, nhưng kết thúc model INV vẫn theo HTF close-through; chạm SL trên LTF khóa entry theo quy tắc cũ.

## Kiểm tra

Bộ kiểm tra lúc tính năng còn tồn tại (`tests/indicator-fibo.cjs`, nay lưu dạng văn bản tại `tests/archive/indicator-fibo-source-2026-11-22.cjs.txt`) đã thực thi thân hàm Pine thực tế: bộ neo râu, 7 tỷ lệ, 1.000 trường hợp đối xứng, loại dữ liệu thiếu/sai/double sweep/target đã bị lấy, gộp mức cùng giá, giữ nguồn/tooltip, 17 slot vẽ, khoảng cách chữ và dọn hình khi tắt. Drawing API được giả lập, không đại diện pixel thật của TradingView.

`node tools/check-crt.cjs` chạy 12 nhóm, gồm hồi quy detector/key/bias/entry trước đây. Source được đồng bộ sang `chibao.txt` và biên dịch Pine riêng. Không dùng kết quả này để khẳng định hiệu suất thị trường hoặc xác nhận giá đã hồi ET.

Kết quả đợt này: 12 nhóm đạt; request biên dịch Pine dùng đúng source cuối (`exactSource=true`), `success=true`, `errors=null`, không có warning. Đối chiếu nguyên văn sáu hàm engine/channel/pattern/lifecycle/bias/snapshot với commit trước fibo cho kết quả không thay đổi. Chưa có kiểm tra pixel thật của lớp fibo mới trên chart đã đăng nhập.
