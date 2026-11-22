# Nghiên cứu entry bổ sung · 22/11/2026

## Bằng chứng mới từ nguồn gốc

**S04 — [Bài X ngày 08/09/2025 UTC](https://x.com/Romeotpt/status/1965071465973535023):** Romeo trình bày một biến thể thận trọng: TS tại biên CRT → nhịp mở rộng đầu xác nhận cấu trúc (tác giả gọi True MSS) → hồi OTE để thực thi → nhịp mở rộng tiếp theo hướng về biên CRT. Đây là một biến thể được tác giả nêu, không phải bằng chứng mọi entry CRT đều phải cùng công thức.

**S05 — [Bài trả lời ngày 12/05/2024 UTC](https://x.com/Romeotpt/status/1789709341857034487):** tác giả đề cập phối hợp nến H4/H1 với Model 1 ở M15–M5 trong một bối cảnh phiên cụ thể. Chưa đủ để cố định một ma trận HTF/LTF áp cho mọi sản phẩm, mọi phiên.

Cả hai được tìm qua mirror rồi **xác minh lại từ public syndication của X**, không dùng bản chép mirror làm bằng chứng cuối. Response trả đúng id_str và user.screen_name=Romeotpt; đã kiểm tra ngày và nội dung gốc. Danh mục có hash nội dung tại [source-review](research/romeotpt-entry-followup-sources.json). Dữ liệu response đầy đủ ở output local, không đưa bản sao tweet vào repo.

**S06 — [Kênh Telegram chính thức quanh bài 6180](https://t.me/s/officialRomeotpt?before=6198):** tác giả hướng người học dành thời gian cho Model 1 và OTE. Nguồn này xác nhận hai chủ đề cần học; nó không cung cấp các ngưỡng giá để mã hóa chúng. Giới hạn truy cập phụ đề và ảnh minh họa đã ghi tại [nghiên cứu trước](CRT-ENTRY-ROMEOTPT.md).

## Điểm cần sửa trong cách hiểu hệ thống

“CRT thuần” của dự án là **phiên bản cá nhân đã rút gọn**. Người dùng đã chọn bỏ các bộ MSS/CISD, FVG/OB và fibo khỏi code. Không được từ lựa chọn đó suy ra tài liệu gốc của Romeo không dùng True MSS hay OTE. Cũng không tự đưa các thuật ngữ đã bỏ trở lại dưới tên mới.

| Thành phần | Đã xác minh được | Còn thiếu để tự động hóa |
| --- | --- | --- |
| HTF TS | Nguồn gốc phân biệt biên/range, TS và entry; dự án đã có cặp C1/C2 riêng | Các biến thể range nhiều nến, chấp nhận close biên và cách ưu tiên nguồn trong mọi tình huống |
| Nhịp xác nhận sau TS | S04 có bước mở rộng/xác nhận cấu trúc trước khi hồi entry | Chính xác swing/level nào, biết từ lúc nào; close qua body hay wick; có được nhiều nến xác nhận hay không |
| Model 1 | Có bài giảng riêng, S05 nêu cấp HTF/LTF và bối cảnh sử dụng | Công thức đầy đủ từ lời giảng và ví dụ dương/âm gốc; không lấy thuật toán của cộng đồng làm định nghĩa tác giả |
| Nhịp hồi | S04 nêu OTE sau nhịp mở rộng đầu | Hai đầu neo, vùng giá, sâu bao nhiêu là quá sâu, tối thiểu phải hồi bao nhiêu, khi giá không hồi đủ thì xử lý thế nào |
| Thời điểm entry | TS và entry không đồng nghĩa; cần chỉ rõ model thực thi | Loại khớp, nến trigger, SL/buffer, giờ/phiên/feed và điều kiện hủy cụ thể |
| Target | Biên CRT và EQ là các mốc phân tích đã được tách trong dự án | Không tự đổi TP cá nhân thành mục tiêu đo độ dài nhịp từ một bài minh họa |

Khác biệt thực tế: công cụ hiện yêu cầu **một TS LTF mới rồi retest đúng biên nến nguồn LTF**. Chuỗi đó hẹp hơn framework S04 và chưa được xác minh là tương đương Model 1. Một nhịp xác nhận có ý nghĩa cấu trúc cũng chưa chắc tạo ra TS đúng hai nến liền nhau. Đây là lý do cần nghiên cứu bộ xác nhận; chưa phải bằng chứng nên nới điều kiện để có nhiều dấu.

## Đối chiếu hai timing hiện có

Đã bổ sung tools/study-crt-entry.cjs. Công cụ chạy lại thân hàm f_stepChannel của Pine qua adapter JS giới hạn đang có, cấp hai state riêng cho Pullback và Confirmation close. Không thay source Pine hoặc setting trên Brave; không tự nhận diện HTF, suy bias/pivot từ thị trường hay mô phỏng khớp lệnh.

Ma trận [22 fixture Buy/Sell đối xứng](research/crt-entry-study-fixtures.json) bao gồm: TS và retest hợp lệ; chạy thẳng không hồi; target trước retest; chạm đúng cực trị TS; retest sau C3; bias trung tính; ngược bias thiếu key; khóa nhịp; cặp nguồn chưa nằm hoàn toàn sau xác nhận HTF; double sweep; nến chưa đóng.

| Kết quả trên ma trận thiết kế này | Số ca |
| --- | ---: |
| Cả hai timing có sự kiện, khác thời điểm | 2 |
| Chỉ Confirmation close có sự kiện | 8 |
| Cả hai không có sự kiện | 12 |

Các số trên là kết quả **fixture cố ý thiết kế**, không phải tần suất thị trường, số cơ hội bị bỏ lỡ, tỷ lệ thắng hay bằng chứng Confirmation close tốt hơn. Những ca Confirmation close phát trước khi target/SL bị chạm về sau chỉ xác minh thứ tự thời gian; không chứng minh đó là một lệnh tốt. Không đánh giá hướng đi sau entry hay PnL.

Giả định adapter được ghi trong report: Fresh reaction, bias cùng hướng context nếu case không chỉ định khác, nến đóng và LTF hợp lệ, wave được phép trừ ca có override; sweep/tolerance 0.01 đơn vị tổng hợp. Không lấy giá trị đó làm tick size của BTC/XAU/MGC. Bias, pivot và vòng đời registry HTF không được tái dựng từ dữ liệu giá; chỉ cấp context/tuổi và gate để nghiên cứu riêng channel.

Kết luận có thể dùng ngay: nới riêng bước đợi hồi không sửa được các trường hợp bị chặn bởi bias/key, cửa sổ C3, nguồn chưa xác nhận, double sweep hoặc khóa nhịp. TS có rồi mà thiếu retest là một lớp nguyên nhân riêng; không gom tất cả tín hiệu thiếu thành “Pullback quá chặt”.

Chạy lại:

```powershell
node tools/study-crt-entry.cjs
node tests/crt-entry-study.cjs
```

Báo cáo mặc định output/crt-entry-study/report.json có hash source/fixture, trace từng nến, status và timestamp sự kiện của hai timing; đánh dấu marketData=false, pineRuntime=false, profitabilityEvaluated=false. Mốc t trong fixture là số thứ tự tổng hợp, không phải thời gian sàn. CLI trả 0 khi chạy được nghiên cứu, không phải xác nhận chỉ báo đã qua nghiệm thu thị trường. Không nhập CSV thật vào công cụ này.

## Các câu hỏi phải chốt trước bước entry mới

1. TS đang nói đến cấp nào: raid HTF, phản ứng tại key hay mẫu LTF? Chỉ rõ reference đã biết trước, không dùng một TS ở cấp khác thay cho sự kiện còn thiếu.
2. Nếu thử nhánh “xác nhận nhịp đầu”, level được chọn phải cố định trước trigger. Không dùng pivot cần nến tương lai rồi đánh dấu lùi về quá khứ. Đây mới là điều kiện thực thi đề xuất, chưa gán thành định nghĩa của Romeo.
3. Nếu thử nhánh hồi sau nhịp đầu, phải xác định vùng hồi và điều kiện hủy trước khi biết TP. Không mặc định vùng đó bằng biên nến của bộ TS/retest hiện tại hoặc bằng fibo ET cá nhân.
4. Không hồi đủ, chạy thẳng hoặc target đã bị lấy phải có trạng thái bỏ qua rõ ràng; không thêm dấu vào quá khứ từ kết quả đẹp.
5. Giữ riêng H1/H4 và Early/Confirmed khi thu mẫu. So sánh trước/sau reload trên cùng nến đã đóng, feed, phạm vi dữ liệu và phiên bản mã. Ghi cả trường hợp không có dấu.

**Quyết định hiện tại:** tiếp tục dùng hai nhánh và Pullback mặc định để quan sát. Chưa triển khai Model 1/OTE/True MSS, chưa đổi bộ lọc hoặc mức TP/SL. Nghiên cứu tiếp cần lấy ví dụ xác nhận nhịp đầu và nhịp hồi từ bài giảng gốc có lời giải đủ rõ, cùng ít nhất một ca bị loại. Chỉ sau đó mới đặc tả một nhánh thử tách biệt để đối chiếu; không thay baseline vì vài nhịp đã đi tới target.

Người dùng đã chọn bước **đặc tả và kiểm tra ngoài chart trước**: [R1 xác nhận nhịp đầu và vùng hồi khai báo](CRT-FIRST-LEG-SPEC.md). Đã có module giả thuyết cá nhân và 64 ca tổng hợp, chưa tích hợp Pine. R1 chưa tự tìm vùng OTE hoặc gán thành Model 1; các giới hạn nguồn ở trên vẫn còn hiệu lực.
