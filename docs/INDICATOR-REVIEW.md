# Rà soát CRT Pro v4 và bản chuẩn hóa TFA v5

## Kết quả kiểm tra TS trên web

Trước đợt này, web đã mô tả sweep và đóng trở lại range nhưng chưa gọi rõ **TS (Turtle Soup)** hoặc tách vai trò của TS với CISD/MSS. Đã bổ sung TS vào hướng dẫn CRT, bước xác nhận HTF, trạng thái hồ câu và prompt AI.

**Quy ước cá nhân được triển khai:** C2 HTF quét một biên/mức thanh khoản đã xác định, sau đó lấy lại mức (reclaim) và đóng trở lại trong range C1. TS HTF là điều kiện của nhánh CRT; CISD/MSS là những lựa chọn xác nhận entry riêng trên LTF. Không có phép cộng “TS + CISD = xác suất cao” được chứng minh trong dự án.

Bản Pine mặc định dùng biên C1 làm reference cơ học của TS. Có thể chọn **Marked HTF levels**, nhập SSL/BSL thực tế trên chart; thiếu mức thì không tự dựng. C2 phải reclaim chính mức đó và đóng trong C1. Vùng HTF POI là tham chiếu nhập thêm, không đồng nghĩa SSL/BSL. Không tự suy ra PDH/PDL/ONH/ONL hoặc một mức HTF tùy ý là cùng biên C1. TS được nhận diện ở cấp HTF và cần đọc đúng vị trí.

Đây là biến thể CRT/sweep–reclaim của người dùng, không đồng nhất với bộ Turtle Soup nguyên gốc theo cực trị 20 ngày. Không giữ cách đặt tên TBS/TWS và xếp hạng xác suất của code cũ.

## Tệp

- `indicators/archive/crt-pro-v4-original.pine`: nguyên bản `chibao.txt` người dùng cung cấp, giữ để đối chiếu.
- `indicators/funded-angler-v5.pine`: bản chuẩn hóa TFA v5, ngôn ngữ **Pine v6**.
- `chibao.txt`: bản sao của nguồn chuẩn hóa, để tiếp tục dùng đường dẫn quen thuộc.
- `tests/indicator-contract.cjs`: kiểm tra đặc tả, bộ ví dụ tham chiếu và sự nhất quán với web. Không phải trình biên dịch hoặc engine Pine.

## Giữ, sửa, bỏ

| Phần trong code cũ | Quyết định và lý do |
| --- | --- |
| Cụm ba nến HTF, countdown | Giữ ý tưởng hiển thị; C1/C2 đã đóng, nến hiện tại ghi “forming”. Giá forming chỉ dùng cho preview. Countdown cập nhật khi có tick, không phải đồng hồ chạy độc lập. |
| CRTH/CRTL và midpoint | Giữ thành R-UB/R-LB và EQ. Không gọi một biên là TP cố định; mục tiêu phụ thuộc kịch bản. EQ không tự là entry/POC/TP1. |
| Input và nhóm cài đặt | Dùng tham số `group=` có tên rõ ràng; không dùng đối số chuỗi vị trí để giả làm group hoặc lặp tooltip. |
| Auto HTF 5m → 4H | Bỏ ép cặp. Chọn H1/H2/H4/D1 bằng tay; chạy trên chart nến thời gian nhỏ hơn HTF, M1/M3/M5 cho entry. Xem nến HTF qua cụm mini hoặc chart HTF riêng; các chart nhỏ hơn HTF nhưng ngoài M1/M3/M5 chỉ có context. |
| Bộ giờ 159/2610 | Bỏ khỏi điều kiện bắt buộc; chưa được xác lập trong hệ thống mới. Không suy ra bias hoặc chất lượng từ giờ mở C1. |
| `n2bullTBS = n2c < n1l`, `n2bearTBS = n2c > n1h` | Bỏ: đây là đóng ngoài biên, xung đột TS reclaim của hệ thống. Không giữ nhãn “high probability”. |
| TWS chỉ chấp nhận đóng trong thân C1 | Đổi thành đóng trong range High–Low C1; màu C2 không quyết định hướng TS. |
| Một nến engulf LTF được gọi CISD/SMS | Thay bằng biến thể CISD có reference open của chuỗi nến đối hướng; MSS tách riêng với pivot đã xác nhận. Hai điều kiện không đồng nghĩa. |
| TP1 midpoint / TP2 complete | Bỏ. Chỉ một target reference, không giả định giao dịch thật, chốt một phần, SL hay TP đã khớp. |
| OB/FVG cố định tại bar HTF [3]/[4] | Bỏ giả định vị trí cứng. FVG LTF cần ba nến sau khi kịch bản được arm. OB được ghi là candidate theo quy tắc cơ học sau CISD, không tuyên bố nhận diện mọi OB của ICT. |
| Bias từ nến D đang chạy | Bỏ tự suy diễn. Bias/kịch bản do người dùng chọn; mặc định Observe không cho entry. |
| `lookahead_off` với dữ liệu HTF [1]/[2] và clock forming | Sửa dữ liệu xác nhận bằng tuple offset + `lookahead_on`; không để đồng hồ/nến forming quyết định setup. Nến HTF xác nhận được xử lý tại close của bar chart đầu tiên trong HTF mới. |
| Label đặt lùi ở cực trị trước khi biết TS | Sự kiện TS/entry đặt tại bar xác nhận, không giả vờ đã biết ở đáy/đỉnh trước đó. Đường range có thể bắt đầu từ thời gian nến tham chiếu, chỉ được tạo sau khi biết dữ liệu. |
| `table.new` mỗi tick cuối, xóa/vẽ lại cluster | Một table và ba bộ body/wick được tạo rồi cập nhật; notes/lines có giới hạn và cleanup. |
| Alert từ điều kiện liên tục, thiếu xác nhận | Dùng sự kiện tại bar đóng; một entry-condition event cho mỗi kịch bản. Alert cấu trúc và TS không đồng nghĩa entry. |

## Quy tắc cơ học của bản ứng viên

### HTF và TS

- `minSweepTicks` mặc định 1 tick; có thể cấu hình. Chỉ chạm biên không tính là quét.
- TS Long mặc định: C2 Low ≤ C1 Low − khoảng quét, không quét High, và C1 Low < C2 Close < C1 High. Short đối xứng. Khi chọn SSL/BSL tay, thay mức quét bằng reference đã nhập và bắt buộc reclaim reference đó, đồng thời đóng trong C1. Close đúng biên hoặc đúng reference chưa tính reclaim trong bản này.
- Quét cả hai biên: đánh dấu mơ hồ, không tự chọn hướng CRT.
- Engulfing thân: hai nến khác màu, C2 bao trùm thân C1, ít nhất một biên thân mở rộng. Outside: High cao hơn và Low thấp hơn C1. Một mẫu có thể chứa mẫu còn lại.
- Inside: High ≤ High mẹ và Low ≥ Low mẹ, ít nhất một biên hẹp hơn. Giữ mẹ khi còn nén. Khi đóng phá biên hoặc TS quanh mẹ, tạo kịch bản theo sự kiện, không đồng nhất breakout với chắc chắn tiếp diễn.
- Mặc định yêu cầu vùng HTF POI nhập tay hợp lệ và range C2 giao vùng đó. Đây là phép kiểm tra giao vùng đơn giản; không tự đánh giá chất lượng POI. Có thể tắt một cách chủ động.
- Kịch bản đã arm không bị cặp HTF mới ghi đè. Pending hết hạn sau số HTF bar cấu hình (mặc định 3). Sau khi có entry-condition event, theo dõi tới khi target/invalidation reference bị chạm; đây không phải trạng thái vị thế thật.

### LTF: chọn một điều kiện

| Lựa chọn | Quy tắc triển khai |
| --- | --- |
| CISD | Sau khi arm, theo dõi chuỗi nến đối hướng; reference là open đầu chuỗi. Long cần close vượt lên reference sau khi close trước còn dưới/bằng; Short đối xứng. Đây là biến thể xác định rõ để kiểm chứng, không gọi cú engulf một nến là CISD phổ quát. |
| MSS | Đóng vượt pivot gần nhất đã được xác nhận và biết tại thời điểm arm. Pivot length mặc định 2 trái/2 phải, có độ trễ. Reference được giữ trong kịch bản, không vẽ tín hiệu về thời điểm pivot hình thành. |
| FVG retest | Gap ba nến LTF sau thời điểm arm; giữ gap đầu tiên tới khi vô hiệu, retest ở bar sau hình thành và close về phía thuận kịch bản. Không bắt buộc CISD nếu người dùng chọn FVG làm điều kiện. |
| OB retest | Candidate là open–wick của nến đối hướng cuối trước CISD cơ học; phải retest ở bar sau. Đây là quy tắc OB hẹp của bản ứng viên, chưa phải toàn bộ cách đọc OB cá nhân. |
| POC close | Người dùng nhập POC từ FRVP trên chart; nến LTF đóng cắt mức theo hướng kịch bản. Không tính POC bằng volume proxy hoặc EQ. |
| Line close / touch / retest | BL nhập tay; close cắt mức, hoặc chạm trong tolerance và đóng giữ phía thuận, hoặc retest ở một bar sau cú đóng break. Có thể ghi thêm điều kiện trên web. |

Mỗi entry-condition event cần: cấu trúc/kịch bản HTF đang active, bias tay phù hợp, chart M1/M3/M5 nhỏ hơn HTF, bar đã đóng, một target có lợi, SL hợp lệ và R:R tối thiểu đã chọn. Phép đo lấy close của bar xác nhận làm **giá tham chiếu**, không phải giá limit được khớp hoặc kết quả giao dịch. SL tay không tự chứng minh phù hợp cấu trúc; người dùng vẫn phải kiểm tra.

Sweep/reclaim LTF bổ sung là tùy chọn chỉ để xem, không thay TS HTF và không bắt buộc ghép thêm với mọi entry. Reference của biến thể này là range N nến LTF trước, mặc định 5; không phải Turtle Soup 20 ngày.

Chạm cả target và invalidation trong cùng bar: ghi không xác định thứ tự từ OHLC; không tính thắng/thua. Chạm riêng một reference cũng chỉ là chạm mức, không phải fill trên tài khoản thật. Script không có PnL, auto-BE, partial exit, gửi lệnh hoặc kết nối tài khoản.

## Thời gian đồng bộ với web

- Dùng `America/New_York` và `Asia/Ho_Chi_Minh`, không dùng UTC−5 cố định hoặc gọi mọi thời điểm là EST.
- 10 macros theo cấu hình web: AS1 18:50–19:10, AS2 19:50–20:10, LM1 02:33–03:00, LM2 04:03–04:30, AM1 08:50–09:10, AM2 09:50–10:10, AM3 10:50–11:10, LNC 11:50–12:10, PM 13:10–13:40, CLS 15:15–15:45, đều giờ NY. Đồng bộ cấu hình hiện có, không tuyên bố đây là danh sách chính thức đầy đủ.
- Mặc định **Context only**: không lọc entry theo giờ. Nếu chọn Web macros, kiểm tra thời điểm **bar entry đóng**, khoảng đầu bao gồm/cuối loại trừ. Bar đóng đúng cuối cửa sổ nằm ngoài filter. Không phải đợi hết macro mới tìm entry.
- Các dòng thời gian trong panel chỉ báo ghi rõ **bar close**: dùng timestamp đóng của bar đang xét để review điều kiện. Khi bar còn chạy, đó là giờ đóng dự kiến, không phải đồng hồ hiện tại của web và không phải tín hiệu đã xác nhận. Countdown cụm HTF dùng thời gian thực khi có tick.
- Web working windows: 07:45–10:00, 14:00–16:00 VN; Mỹ 20:15–22:30 mùa hè hoặc 21:15–23:30 mùa đông. Không coi đây là giờ sở giao dịch; không tích hợp lịch nghỉ lễ hoặc tin tức.
- QT theo quy ước intraday Daye: neo 18:00 NY, bốn quý 6h, mỗi phiên bốn quý 90m, mỗi 90m bốn micro 22,5m. Không suy ra AMD/bias từ số quý.
- TDO là 00:00 NY của chu kỳ; sau 18:00 thì là midnight sắp tới. Session True Open: 19:30 / 01:30 / 07:30 / 13:30 NY. Giá TO chỉ lấy khi chart có bar mở đúng timestamp; nếu thiếu thì để trống, không lấy một bar sau để bù. Không dùng giá forming hoặc True Open để ép bias.

## Cách dùng và kiểm tra tiếp

1. Mở `chibao.txt` hoặc `.pine`, dán vào Pine Editor, Save và Add to chart. Đây là bản ứng viên **chưa được biên dịch trong TradingView** tại workspace này.
2. Chọn chart M5/M3/M1, HTF, cấu trúc chính, bias và một entry. Điền vùng POI và một target/SL tham chiếu; điền BL/POC khi chọn loại tương ứng. Mặc định Observe + thiếu reference sẽ không có entry.
3. Dùng Bar Replay kiểm tra CRT Long/Short, close đúng biên, quét hai phía, Outside + Engulfing chồng lấp, nhiều Inside lồng nhau, retest muộn, invalidation/target cùng bar và hết hạn.
4. Kiểm tra chuyển giờ Mỹ tháng 3/tháng 11, phiên qua midnight, H1/H2/H4/D1 và chart M1/M3/M5. So sánh dữ liệu sau reload với thời gian thực; nến forming chỉ là preview.
5. Tạo alert mới sau khi đổi code/input; chọn **Once Per Bar Close**. TradingView giữ snapshot script/input của alert đã tạo; đổi indicator trên chart không tự cập nhật alert cũ.

## Kiểm chứng đã thực hiện và giới hạn

Đã đọc toàn bộ 953 dòng code cũ và rà logic mới. Test Node kiểm tra đặc tả TS/entry/đối xứng Long–Short, parity 10 macro/QT với web, dữ liệu HTF offset, đồng bộ nguồn và delimiters. Test browser kiểm tra nội dung TS/prompt, checklist và dữ liệu cũ. Các test này **không thực thi Pine**, không thay Pine Editor hoặc backtest, không xác nhận lợi thế thống kê.

Nguồn kỹ thuật: [HTF confirmed data](https://www.tradingview.com/pine-script-docs/faq/other-data-and-timeframes/), [time zones/DST](https://www.tradingview.com/pine-script-docs/concepts/time/), [alerts](https://www.tradingview.com/pine-script-docs/concepts/alerts/), [Pine v6 migration](https://www.tradingview.com/pine-script-docs/migration-guides/to-pine-version-6/). Các định nghĩa entry cụ thể ở trên là lựa chọn triển khai có ghi rõ phạm vi; không gán cho tác giả ICT như một bộ quy tắc duy nhất.
