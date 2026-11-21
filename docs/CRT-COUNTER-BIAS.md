> Lịch sử trước thay đổi 22/11/2026. Entry/key/time đã được thay bằng đặc tả CRT thuần trong [CRT thuần & thời gian](CRT-PURE-AND-TIME.md). Không dùng các bộ lọc cũ làm yêu cầu cho bản hiện hành.

# CRT ngược bias tại key level có trước

Cập nhật 14/11/2026. Nhánh CT là quy tắc riêng theo yêu cầu người dùng, không phải khẳng định mọi CRT tại IRL đều đảo chiều thành công.

## Điều kiện theo đúng thứ tự

1. Có FVG, OB hoặc swing thanh khoản HTF được **xác nhận không muộn hơn lúc C1 của CRT mở**. Lưu riêng nến nguồn, thời điểm được biết, khung nguồn và biên mức/vùng. Pivot sinh từ một nến cũ nhưng chỉ được xác nhận trong C1/C2 không được tính là key có trước.
2. C2 phải tạo CRT/TS theo quy tắc đang dùng và phản ứng tại key: Buy chạm vùng hỗ trợ cùng hướng rồi close trên đỉnh vùng; Sell chạm vùng kháng cự rồi close dưới đáy vùng. Với swing, Buy phải quét SSL ít nhất một tick rồi reclaim; Sell quét BSL rồi reclaim. Chỉ nằm phía trên/dưới một vùng mà chưa chạm không đủ.
3. CRT được xác nhận trên HTF. Metadata key được đóng băng lúc model hình thành, không lấy vùng mới xuất hiện sau đó để giải thích ngược. Một close HTF xuyên biên xa làm mất quyền dùng key CT, dù model vẫn có thể tồn tại theo INV/target riêng.
4. LTF có CISD hoặc MSS. Auto/Pullback đợi nến sau kiểm tra mức đã phá, hoặc FVG/OB hình thành từ xác nhận trở đi và retest sau đó. Chọn riêng FVG/OB cũng không được bỏ qua C/M trong nhánh CT. Nếu chủ động đổi Signal timing sang Confirmation close, cách phát theo close xác nhận vẫn theo lựa chọn đó.
5. Qua các gate giá còn giữ đúng phía key, target chưa bị lấy, INV, time, close bar và chống trùng sóng. Default Pullback/Fresh reaction không thay đổi.

Target CT giữ **biên đối diện range CRT**, không tự kéo sang target D1 hoặc tự tuyên bố bias D1 đã đổi. Nhánh này chỉ dành cho root CRT; ISB/EGF không được đi qua ngoại lệ kể cả ISB đã resolve bằng TS. B0 hoặc B0! vẫn chặn; chỉ xét CT khi bias hiệu lực đối diện rõ ràng. Bias tổng thể không bị cập nhật bởi việc phát CT. Manual Long/Short vẫn được coi là bối cảnh định hướng; tắt CRT reversal nếu muốn chặn tuyệt đối mọi tín hiệu ngược hướng đó.

## Nguồn key và giới hạn

- Pool HTF model: tối đa 60 vùng và 80 swing chưa bị dùng/hết recovery, như trước. Ưu tiên FVG → OB → swing, reference mới hơn trong mỗi loại. Match trước khi C2 dọn các mức vừa bị chạm, nhưng chỉ lấy reference đã được xác nhận trước C1.
- Nếu không có key phù hợp tại HTF model và Bias TF lớn hơn HTF, dùng snapshot đã đóng của Bias TF. Ví dụ H1 CRT có thể phản ứng tại D1 OB đã có trước. Bản đồ khung lớn giữ hai reference mới nhất cho mỗi loại/hướng (FVG, OB, swing), tối đa 12; không hứa liệt kê mọi key lịch sử.
- Theo dõi các key khung lớn đã bị tiêu thụ trên từng bar HTF model, để không dùng lại trong lúc snapshot Bias TF còn chưa sang nến tiếp. Tại chính C2, match trước rồi mới đánh dấu tiêu thụ. Key đã chọn vẫn là bằng chứng của phản ứng đó; không cần dựng lại nó trong pool sau sweep.
- Đây là key tự nhận diện từ dữ liệu chỉ báo. Không tự đọc đường vẽ thủ công của người dùng, FRVP POC, hoặc dữ liệu chart Topstep.

FVG/OB nằm trong range tham chiếu có thể là IRL; swing thanh khoản có thể là IRL/ERL tùy range đang xét. Nhánh CT gọi chung là **key**, không đổi tên tất cả thành IRL.

## Setting và quan sát

`CRT reversal at prior HTF key` mặc định **bật**. Tắt để về cách chỉ phát thuận bias.

- Tam giác vẫn giữ cỡ/màu hiện tại, không thêm chữ CT cạnh nến.
- Tooltip tín hiệu CT thêm CT, loại key, khung nguồn, biên giá và giờ xác nhận key so với C1.
- Data Window có `CRT counter-bias CT +1/-1`.
- Nếu model đang focus cũng là CRT đang xét, đường K/FVG, K/OB, K/SSL hoặc K/BSL cho biết key đang dùng. Vùng FVG giữ neo C1 nguồn; không kéo từ nến LTF tín hiệu.
- `NO KEY`: không có key có trước; `KEY X`: close LTF không giữ phía key; `CT CONFIRM`: chờ C/M; `CT SIGNAL`: nhánh đã phát (trong audit chi tiết). Dashboard WHY chính vẫn tổng hợp các kênh.

Trong mỗi nhóm vẫn chỉ có một context được xét. CRT chọn model cũ nhất đủ điều kiện thuận bias hoặc CT có key, để model ngược bias thiếu key không khóa một CRT đủ điều kiện phía sau. Nếu không có model đủ điều kiện thì giữ fallback để báo lý do chặn. Cụm chính vẫn là focus FIFO dùng để xem tổng quan, có thể khác model phát tín hiệu; tooltip ghi provenance của hit.

## Dữ liệu xác nhận và kiểm tra

Snapshot chính có 112 scalar + ModelArchive + CrtKey, tất cả offset riêng khi đọc HTF. Request bias trong engine trả sáu scalar đã xác nhận và một KeyMap đã offset; bias ngoài giữ sáu scalar. Tổng tuple = 114 + 7 + 6 = **127**, bằng giới hạn 127. CrtKey dùng các trường primitive, KeyMap giới hạn 12 level và không truyền cả pool ra chart. Object được copy trước khi gắn thời điểm C1; không sửa snapshot dùng chung.

`node tests/crt-counter-bias.cjs` thực thi thân key matching/map và LTF channel trích từ source: key cũ/mới, pivot xác nhận muộn, FVG/OB/swing, chạm/reclaim, higher-TF map/copy/consumption, CT Buy/Sell, chặn khi thiếu C/M/ret, target/INV/time/wave/neutral và không nới EGF/ISB. Các test contract, signal density, 20 tổ hợp workflow và nhóm HTF cũng được chạy.

Ngày 14/11/2026, mã nguồn cuối được gửi nguyên bản vào Pine Editor của TradingView: phản hồi biên dịch thành công, không có lỗi; còn cảnh báo shadow biến cục bộ. Phiên tạm không đăng nhập, lưu hay phát hành script.

Harness không mô phỏng request.security, ta.pivot/rollback/drawing hoặc thị trường thực. Chưa có Replay XAUUSD/US100 hay thống kê win rate của nhánh CT.
