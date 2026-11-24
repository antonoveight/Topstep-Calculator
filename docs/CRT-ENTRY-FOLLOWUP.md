# Nghiên cứu entry bổ sung · 22/11/2026

## Bổ sung 24/11/2026 · MPS theo video mới nhất

**S07 — [CRTology ep.5: MPS](https://www.youtube.com/watch?v=Q-mne0H4lRY)**, kênh Romeotpt, dài khoảng 12 phút, đăng **23/11/2026 lúc 20:47 giờ Việt Nam**. Video đứng đầu tab Videos tại lần kiểm tra 24/11; channel ID khớp danh mục đã xác minh. [Telegram chính thức /7057](https://t.me/officialRomeotpt/7057) dẫn đúng video, /7058 thông báo tập 5 đã lên.

Đã đọc toàn bộ **91 đoạn phụ đề tiếng Anh tự động do giao diện YouTube cung cấp**, từ 00:00 đến cue cuối 11:55, và đối chiếu sáu sheet storyboard gốc. Chưa nghe toàn bộ audio hoặc xem phát liên tục; không coi ảnh player bị đứng ở slide mở đầu là khung hình đúng thời điểm seek. ASR có chỗ chép OTE thành “OT” và MPS thành “NPS”; không dùng lỗi nhận dạng đó làm thuật ngữ mới. Nguồn, mốc và hash bằng chứng: [romeotpt-mps-sources.json](research/romeotpt-mps-sources.json). Transcript và ảnh đầy đủ chỉ lưu trong output cục bộ.

### Nội dung gốc và mốc xem lại

| Mốc video | Điểm được Romeo trình bày |
| --- | --- |
| [00:40–01:52](https://www.youtube.com/watch?v=Q-mne0H4lRY&t=40) | MPS = **Market Profile Shift**; tác giả đề xuất dùng thay nhãn structure shift/BOS thông thường. Đây là cách đặt tên và quan điểm của tác giả. |
| [02:35–03:16](https://www.youtube.com/watch?v=Q-mne0H4lRY&t=155) | Sell: đỉnh P1 → đáy P2 → đỉnh cao hơn P3 → đóng dưới P2. Buy: đáy P1 → đỉnh P2 → đáy thấp hơn P3 → đóng trên P2. |
| [03:43–05:03](https://www.youtube.com/watch?v=Q-mne0H4lRY&t=223) | P3 ở **key level**, có bối cảnh thời gian. Mốc P2 là swing trực tiếp trước nhịp TS; không lấy một đỉnh/đáy khác chỉ vì nổi bật hơn. SMT được nói là thường xuất hiện, không phải luôn có. |
| [05:12–06:59](https://www.youtube.com/watch?v=Q-mne0H4lRY&t=312) | Một nến đóng qua P2 kích hoạt MPS. “Profile” được giải thích qua cách giá phản ứng với high/low: từ chối một phía và phá phía còn lại. |
| [08:12–09:25](https://www.youtube.com/watch?v=Q-mne0H4lRY&t=492) | Sau MPS Buy, tác giả chờ diễn biến lắc rồi hồi giảm sâu/OTE trước nhịp tăng tiếp. Xác nhận hướng chưa phải toàn bộ entry. |
| [09:31–10:55](https://www.youtube.com/watch?v=Q-mne0H4lRY&t=571) | Ví dụ Sell đối xứng: nhịp kích hoạt là leg 1 → hồi tăng sâu → leg 2. Ví dụ nối C1 với nến trước TS, C2 với TS, C3 với OTE. |

**Cách đọc ngắn trên chart:** `P1 → P2 → P3 tại key → Close qua P2 → hồi → tiếp diễn`. Các số P1/P2/P3 ở sơ đồ là điểm giá, không tự đồng nhất với ba nến HTF C1/C2/C3. P2 cần gắn với nhịp đã dẫn giá đi quét P1; “pivot gần nhất” chỉ là một cách tìm ứng viên, chưa chứng minh đúng quan hệ này.

### Hệ quả cho hệ thống cá nhân

Đây là phần **phân tích đối chiếu của dự án**, không phải lời hứa xác suất hay quy tắc mã hóa đã được tác giả duyệt:

- **TS → MPS → hồi entry** là ba việc khác nhau. TS tại key tạo bối cảnh; close qua đúng P2 xác nhận chuyển hướng theo mô hình; vùng hồi và trigger quyết định thực thi. Không buộc phải có thêm TS hai nến LTF mới chỉ để gọi là MPS.
- Key level áp dụng cho **cả Buy và Sell**, kể cả khi cùng bias. Việc chỉ yêu cầu key cho CRT ngược bias của code hiện tại chưa đáp ứng mô tả MPS.
- Bài này không trình bày phép tính volume/TPO/POC. Với FRVP cá nhân, không diễn giải MPS thành “POC dịch chuyển”; vai trò key FRVP cũng cần được đặc tả riêng, không mặc định mọi POC đều đạt tiêu chuẩn của tác giả.
- MPS trên khung thực thi không tự chứng minh D1 đã đảo bias hoặc mọi HTF đồng pha. Video nhắc thời gian nhưng chưa đưa ma trận HTF/LTF và khung giờ đủ rõ để mã hóa. Không tự thêm bộ lọc giờ hay bắt buộc SMT.
- Phát biểu về market maker điều khiển thị trường ở 07:09–08:12 được ghi nhận là quan điểm của người giảng; không dùng làm bằng chứng độc lập về cơ chế thị trường hay hiệu suất mô hình.

### Đối chiếu với R1 đang chạy

| Thành phần | R1 hiện tại | Khoảng cách với MPS trong tập 5 |
| --- | --- | --- |
| Mốc xác nhận | Pivot LTF 2 trái/2 phải gần nhất, đã biết và chưa bị lấy tại giờ mở bar raid | Cần chứng minh đó chính là P2 trực tiếp dẫn đến TS, không chỉ gần nhất theo thời gian. |
| Key | Bắt buộc khi xin phép ngược bias; cùng bias có thể qua mà không có key | MPS yêu cầu P3 tại key cho cả hai hướng/bối cảnh bias. |
| Xác nhận | Close vượt reference ít nhất một tick; first leg chỉ được hình thành trong C3 | Tác giả nói một close qua P2; chưa nêu tick buffer hoặc quy tắc tổng quát chỉ được kích hoạt trong C3. |
| Nhịp hồi | Vùng nhập tay sau leg; bị giới hạn bởi INV và wick nến xác nhận | “Hồi sâu/OTE” của tác giả chưa được chứng minh tương đương vùng này. Wick một nến không tự đại diện toàn bộ leg. |
| Thời gian/SMT | Không có bộ lọc MPS time/SMT đã xác minh | Cần nghiên cứu tiếp thời điểm; không chuyển “thường có SMT” thành điều kiện bắt buộc. |
| Entry và vòng đời | Một R1/attempt, đóng entry hết C3, gate wave/bias và quy tắc hủy riêng | Đây vẫn là quy ước cá nhân, chưa được tập 5 xác nhận đầy đủ. |

**Kết luận:** R1 là prototype xác nhận nhịp đầu, **chưa phải bộ nhận diện MPS gốc**. Không đổi nhãn R1 thành MPS hoặc mặc định bật trong lần nghiên cứu này. Nguồn mới làm rõ vai trò của P2/key/close, nhưng chưa giải quyết chính xác OTE, giá entry, SL/buffer và vòng đời. Các thuật ngữ cũ không tự quay lại code vì cách gọi mới này.

### Các việc nghiên cứu tiếp và ca đối chiếu

1. Đánh dấu P1/P2/P3 và key **trước** nến xác nhận trong ví dụ gốc; kiểm tra cả ca P2 trực tiếp nằm thấp hơn một đỉnh cũ và bản Sell đối xứng. Ghi lúc pivot thực sự được biết; không vẽ lùi tín hiệu về bar swing.
2. Tách ca chỉ râu qua P2, close đúng P2, close vượt, nhiều lần xuyên và P3 không chạm key. Trường hợp đúng bằng mốc/tolerance còn phải chốt cho code; không gán ngưỡng cá nhân thành nguồn gốc.
3. Theo dõi leg kích hoạt khi C2 đang chạy so với khi C3 bắt đầu. Ví dụ C3 là OTE không đủ chứng minh toàn bộ first leg bắt buộc khởi đầu sau C2 đóng. Không dùng OHLC cuối C2 để hợp thức hóa tín hiệu Early.
4. Đối chiếu hồi nông/hồi sâu/chạy thẳng/target trước hồi; xác định đầu neo và trigger từ bài OTE riêng. Chưa áp dụng phần trăm fibo cá nhân vào MPS.
5. Lưu key, timeframe, thời điểm, reference và lý do loại cho cả tín hiệu có/không có; sau khi chốt đặc tả mới làm nhánh thử nghiệm riêng và so với baseline. Chưa có kết quả thị trường để khẳng định độ chính xác hoặc chọn setting.

Phạm vi lần bổ sung này chỉ là tài liệu nghiên cứu. Pine, setting, chart và các quy tắc R1/Pullback hiện hành không đổi. Các mục ngày 22/11 phía dưới giữ lại để theo dõi tiến trình; phần MPS cập nhật những chỗ trước đây chưa biết cách chọn mốc xác nhận.

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

Người dùng đã chọn bước **đặc tả và kiểm tra ngoài chart trước**: [R1 xác nhận nhịp đầu và vùng hồi khai báo](CRT-FIRST-LEG-SPEC.md). Đã có module giả thuyết cá nhân và 64 ca tổng hợp; sau yêu cầu tiếp theo, Pine đã có lựa chọn R1 thử nghiệm với vùng hồi khai báo, mặc định tắt. Xem phần sử dụng trong đặc tả R1. R1 chưa tự tìm vùng OTE hoặc gán thành Model 1; các giới hạn nguồn ở trên vẫn còn hiệu lực.
