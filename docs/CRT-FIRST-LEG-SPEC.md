# CRT: key HTF, TS và ba nhánh entry

Cập nhật thực thi 25/11/2026. Đây là đặc tả hiện hành của Pine. Bản MPS chung/R1 nhập tay trước đây nằm trong [bản lưu](archive/CRT-FIRST-LEG-SPEC-before-key-reactions-2026-11-25.md). Không áp dụng các điều kiện cũ đồng thời với bản này.

## Kết luận từ nguồn gốc

Romeo mô tả key là nơi kỳ vọng giá bật lại và nhấn mạnh quan sát LTF khi giá thực sự tới key HTF; một CRT đẹp trước khi tới key vẫn có thể thất bại. Phân biệt giao dịch tiến đến key với phản ứng rời key. [Key level, 05:52–09:55 và 12:00–17:05](https://www.youtube.com/watch?v=p8UYOgVn1-g&t=352s).

Trong ví dụ gốc, previous high và giá mở của down-close candle được dùng làm tham chiếu hỗ trợ; up-close candle có vai trò kháng cự khi xét order flow. Điều này không cho phép coi mọi open/close là key. [SMT, 16:55–18:42](https://www.youtube.com/watch?v=3IWgc52Dqsg&t=1015s).

SMT so sánh các thị trường liên hệ: một bên lấy high/low, bên kia không lấy mốc tương ứng. Tác giả yêu cầu xác nhận giá; Model 1 là xác nhận đầu, cấu trúc dịch chuyển hỗ trợ kỳ vọng mở rộng. SMT cũng có ứng dụng liên quan FVG. [SMT, 02:09–03:41, 13:11–13:42 và 27:31–31:59](https://www.youtube.com/watch?v=3IWgc52Dqsg&t=129s).

Chọn cây nến HTF đang giao dịch trước khi tìm entry là trình tự trong [Candle anatomy, 04:57–09:30](https://www.youtube.com/watch?v=n2GF8kCpgVg&t=297s). Video giới thiệu H4/D/W; H1/H2 là lựa chọn cá nhân của hệ thống này, không gán thành khuyến nghị nguyên bản. [Metadata, phạm vi đã đọc và hash bản chép lời](research/crt-key-level-review-2026-11-25.json).

## Bộ key được mã hóa

Các công thức dưới đây là quy ước cơ học cá nhân để kiểm tra được, không phải toàn bộ quy tắc discretionary của Romeo.

| Loại | Nhận diện và nguồn | Phản ứng hợp lệ |
| --- | --- | --- |
| SWH/SWL | Pivot HTF 2 trái/2 phải; chỉ biết sau khi đủ nến phải. Giá high/low gồm râu. | Quét qua ít nhất một tick rồi close trở lại phía đúng. |
| FVG | Gap râu của ba nến HTF đã đóng: bullish low C > high A, bearish high C < low A. Neo từ nến A; chỉ biết tại close C. | Chạm vùng rồi close trở lại ngoài mép gần theo hướng phản ứng. Không bắt quét xuyên cả gap. |
| OB | Nến ngược hướng gần nhất trong tối đa 5 nến trước close displacement. Close đầu tiên vượt toàn bộ râu OB và high/low nến trước. Vùng dùng full high–low. | Chạm vùng HTF và close trở lại ngoài vùng. Đây là key bối cảnh; không phải OB LTF dùng chọn entry. |
| OPEN/CLOSE | Giá mở/đóng của chính nến ngược hướng đủ điều kiện displacement trên. Không lấy tất cả open/close đại trà. | Chạm line và close giữ phía phản ứng. |
| SMT | Cặp mã do người dùng chọn; hai nến HTF đã hoàn tất phải trùng cả giờ mở và đóng giữa hai feed. Direct/Inverse được chọn rõ. | Chỉ bổ trợ trong tooltip/data window; không thay thế key giá hoặc tự phát entry. |

FVG/OB/open-close bị loại khi có close HTF vượt mép xa ngược hướng, hoặc quá 48 nến nguồn; râu chạm không tự xóa vùng. Swing bị loại khi đã bị lấy. Pool vùng tối đa 40; snapshot giữ hai mức gần nhất mỗi loại/hướng. Key của attempt phải được biết **không muộn hơn lúc C2 mở**, bao gồm key vừa xác nhận khi C1 đóng. Không bắt mọi key phải tồn tại từ trước C1 mở.

Main lấy key cùng HTF và từ Bias TF. Larger có bộ riêng. Early lấy bộ key cùng HTF từ C1 đã hoàn tất. SMT hiện chỉ xét raid range của hai nến liền kề, không dò đầy đủ SMT giữa mọi swing/FVG và không tự chọn mã tương quan. Cặp khác session hoặc thiếu dữ liệu không được xác nhận SMT.

## Ba nhánh song song

| Nhánh | Điều kiện tam giác trên nến entry đã đóng |
| --- | --- |
| TS_CLOSE | Nến LTF quét một đầu range nến trước, không quét cả hai đầu, close ngược màu và trở lại bên trong range. Tam giác đặt tại chính nến sweep/reclaim. Không chờ MPS/retest. Đây là quy tắc người dùng chốt cho #1, chưa phải bộ nhận diện Model 1 nguyên bản đầy đủ. |
| TS_FVG | Sau TS, hình thành gap ba nến LTF. Chỉ nến sau lúc gap đã biết mới được retest; cần chạm vùng và close phản ứng ra ngoài mép gần. Có thể trước MPS. Vùng không vẽ lên chart. |
| MPS_OTE | Sau TS, close vượt pivot cấu trúc LTF đã xác nhận trước TS và thuộc thời gian C1 trở đi. Sau MPS, theo dõi endpoint toàn bộ leg đầu từ râu TS. Entry là nến phản ứng vùng hồi 50–80% đã biết trước nến đó; không cần TS thứ hai. Không vẽ fibo. |

MPS trong mã là proxy dùng pivot 2/2 gần nhất có trước TS, không nhận diện hoàn chỉnh mọi P1/P2/P3 discretionary hay một engine cấu trúc M15 riêng. Main/Larger cùng thực thi trên khung chart M1/M3/M5. Vì vậy chưa khẳng định tái tạo mọi dấu trong bảy ảnh mẫu.

OTE không dùng riêng râu nến kích hoạt MPS. Endpoint cập nhật từ các nến đóng sau đó, rồi đóng băng khi nhánh OTE đã dùng. Nến vừa tạo endpoint mới không được đồng thời dùng vùng tính lại để phát OTE vì OHLC không biết thứ tự intrabar. Mỗi nhịp giữ tối đa 36 nến LTF kể từ TS; mất cực trị TS hoặc hết thời gian này thì bỏ nhịp chờ, không nhất thiết hủy CRT HTF.

Mỗi attempt có tối đa một entry cho mỗi nhánh trong một nhịp TS. Hai nhánh đủ điều kiện cùng nến gộp vào một tam giác và giữ lý do trong tooltip. One per model giới hạn cả attempt còn một lần. Fresh reaction không dùng khóa hướng chung giữa các setup; state có token HTF/C1/attempt/hướng và giữ khi đổi focus.

## Vòng đời và Early C2

C1/C2 vẫn là cặp HTF liền kề, C2 sweep/reclaim một phía và đóng trong C1. TGT là đầu đối diện C1, INV là cực trị râu TS. Chạm INV/TGT kết thúc attempt; cùng nến chạm cả hai là AMB, không suy đoán thứ tự. CRT đã đạt TGT không được hồi sinh cho continuation khác. Setup mới cần C1/C2/token mới.

Một CRT còn hiệu lực không tự hết hạn chỉ vì C3 đóng. Nhánh Confirmed được tiếp tục tìm TS mới trong context còn sống; không bỏ các barrier. Chỉ original C3 có thể thay raid một lần trên cùng C1 theo bộ key đã đóng băng, như cơ chế trước; không ghép một raid xa vào C1 cũ.

Early C2 vẫn thử nghiệm: một nến LTF đã đóng quét/reclaim range C1 HTF tại key có trước C2, close ngược màu, trước C2 đóng. Chỉ một dấu E mỗi C2. Nó tiếp tục thu thập MPS/gap/leg từ nến đóng mà không phát thêm Early alert. Khi chính C1/C2/hướng đó trở thành CRT xác nhận và chưa INV/TGT, kênh Main nhận lại bằng chứng đã biết để theo dõi nhánh hồi, không đòi TS thứ hai. Không chuyển dấu E thành tín hiệu HTF xác nhận trong quá khứ. Hiện chưa có Early riêng của Larger.

## Nhãn và kiểm chứng

CRTH/CRTL gồm râu; EQ/EQ* là midpoint và đã chạm midpoint, không phải TP; TGT là đầu range mục tiêu; INV là cực trị vô hiệu; KEY FVG/OB/SWH/SWL/OPEN/CLOSE kèm khung nguồn. Bỏ phân loại IRL/ERL khỏi phần vẽ, tính toán tham chiếu và gating. Một số slot snapshot cũ còn để trống nhằm giữ tương thích OHLC/cụm HTF; chúng không còn mang logic giao dịch.

Giữ hai cụm HTF, tên khung phía trên và countdown nến live phía dưới. Tam giác Buy xanh dưới nến, Sell đỏ trên nến, size 4 như lựa chọn trước. Không đổi web/checklist của ứng dụng trong lần sửa indicator này; web còn một số mô tả phiên bản trước cần migration riêng.

Chạy node tools/sync-indicator.cjs và node tools/check-crt.cjs. Bộ hiện hành thay các fixture universal-MPS/R1 nhập tay bằng kiểm tra thân hàm Pine cho ba nhánh/key/SMT/Early/handoff, đồng thời giữ lifecycle, bias và layout. Các study R1/MPS cũ mô tả schema 2/3, không phải nghiệm thu schema 4. CSV mới đánh dấu schema 4; auditor TS-only cũ phải từ chối, không dùng nó để kết luận replay đã qua.

Giới hạn mặc định vẫn 600 nến chart và 600 nến mỗi nguồn. Đây là phạm vi tải, không phải chứng nhận độ ổn định mọi cặp khung/feed. Kiểm tra tổng hợp và biên dịch không thay thế đối chiếu OHLC thị trường, reload, Replay hoặc hiệu suất giao dịch.

Nghiệm thu 25/11/2026: 20 suite hiện hành qua; exact source biên dịch Pine không lỗi/cảnh báo. Brave XAUUSD M5 đã hiện tam giác và MPS với H1/H4 và H2/H4, 600 chart bar; chưa thấy cảnh báo runtime trong lần quan sát. [Hash nguồn, phạm vi kiểm tra và hạn chế](research/crt-key-reactions-validation-2026-11-25.json). Đây là smoke test, không phải Replay hoặc xác nhận mọi dấu trong ảnh mẫu.
