# TFA v6 — hướng bối cảnh và tín hiệu LTF

Bản hiện hành tập trung dựng bối cảnh HTF và phát tam giác xác nhận. Bạn tự chọn giá entry, SL và Full TP theo chart; không mô phỏng lệnh hoặc PnL. Các test xác minh logic, không chứng minh xác suất thắng cao.

## Cấu hình khởi đầu

HTF H1 hoặc H2 theo khung đọc cấu trúc; chart M5; Bias Auto D1 hoặc Long/Short do bạn xác định; Signal confirmation Auto; time filter Context only. Giữ 1 dấu gần nhất, cửa sổ 3 nến HTF. Cụm bên phải mặc định cách 30 bar, thân 4 bar. Chữ chart Normal, dashboard Small.

## 17 setting còn lại

| Setting | Vai trò |
| --- | --- |
| HTF | H1/H2/H4/D1 dựng range/model từ nến đã đóng. |
| Bias TF | Khung bias >= HTF; mặc định D1. Auto chỉ là quy tắc sweep/close-through của script, không có dữ liệu FRVP cá nhân. |
| Bias | Auto / Long / Short / Neutral. EGF lấy hướng kịch bản từ bias, không lấy từ màu nến. CRT/ISB phải thuận bias để phát dấu. |
| LTF condition | Auto / CISD / MSS / FVG retest / OB retest. Đây là điều kiện phát tín hiệu, không phải lựa chọn giá khớp lệnh. |
| Time filter | Context only không chặn giờ; Web macros/working windows giới hạn giờ tín hiệu theo New York có DST. |
| Macro background | Bật/tắt nền macro. Không tạo bias. |
| QT clock context | Hiện đồng hồ quý trong dashboard, không quyết định hướng. |
| Model HTF candle cluster | Bật/tắt cụm nến model bên phải. |
| Cluster offset | Mặc định 30 bar; tăng nếu muốn thêm khoảng trống bên phải chữ. |
| Cluster body width | Mặc định 4 bar; số lẻ làm tròn xuống chẵn để râu đúng tâm. |
| Model range / ERL / CP | Các line cấu trúc và mục tiêu có điều kiện. Không ảnh hưởng logic tam giác khi tắt. |
| Compact panel | Bảng tổng quan model, bias, IRL nội bộ, thời gian và trạng thái. |
| Signal history | Mặc định 1 tam giác gần nhất, 0 ẩn, tối đa 100. Không sửa alert hay logic nhận diện. |
| Hide drawings without a recent signal | Ẩn hình khi model/tín hiệu quá cửa sổ gần nhất. Model HTF gần đây vẫn được xem là tín hiệu cấu trúc để hiện tổng quan trước tín hiệu LTF. |
| Drawing horizon / recency | Mặc định 3 nến HTF. Giới hạn phần chiếu về trước và tuổi hiển thị; không cắt bỏ điểm nguồn cũ của ERL. |
| Chart text size | Small/Normal/Large/Huge; mặc định Normal. Chữ nền trong suốt. |
| Dashboard text size | Small/Normal/Large; mặc định Small. |

Chart tiêu chuẩn phải <= HTF, độ dài chart TF chia hết HTF. Chỉ M1/M3/M5 nhỏ hơn HTF phát tín hiệu; các khung nhỏ hơn khác chỉ xem tổng quan.

## Những mục đã bỏ khỏi Inputs

Giới hạn pool/queue, pivot, độ xuyên tick, recovery, expiry và invalidation cơ học cố định trong code để tránh quá nhiều nút: pivot 2 trái/2 phải, sweep tối thiểu 1 tick, queue 12, recovery 1000 khoảng lịch HTF, close vượt INV để vô hiệu, không tự hết hạn do tuổi. Window gần nhất là hiển thị, không phải tuổi hết hiệu lực model.

Bỏ nhập tay SSL/BSL/POC/BL/SL/CP và các mode POC/Line, gate R:R tại close tín hiệu, model phụ, C/M sơ bộ và plot TDO/TO khỏi giao diện. CRT tự dùng C1 range. Không ép min R:R từ close của tam giác vì bạn sẽ chọn giá entry thực tế; vẫn kiểm tra hướng mục tiêu và không phát dấu khi bar chạm INV tham chiếu hoặc CP đã bị lấy. Chỉ báo không biết SL thực tế của bạn.

OB/FVG vẫn được tính làm bộ lọc nội bộ nhưng **không vẽ box/zone/nhãn**. Không vẽ line CISD/MSS hoặc chữ cạnh tam giác. Tam giác Tiny: xanh Buy dưới nến, đỏ Sell trên nến; xem loại xác nhận trong tooltip.

## Đọc theo từng model

| Model | Hướng và điều kiện |
| --- | --- |
| CRT/TS | C2 quét một phía C1 tối thiểu 1 tick, close lấy lại và nằm trong range; loại quét cả hai phía. Phía sweep/reclaim xác định hướng ứng viên, bias lọc; chờ một xác nhận C hoặc M trên LTF. Không gọi râu dài bất kỳ là TS. |
| Inside Bar | Mẹ giữ nguyên khi nén lồng nhau. Màu nến không xác định hướng. Chờ HTF sweep/reclaim quanh mother hoặc close phá mother; nhánh break còn chờ retest mother và xác nhận LTF. Phá giả vẫn có thể xảy ra. |
| EGF/OUT | EGF bao thân, OUT bao High–Low. Hình thái không tự ép Buy/Sell. Kịch bản theo bias; chọn IRL nội bộ phù hợp trong pool, chờ lần chạm thực sự và phản ứng LTF hướng tới ERL. Thiếu bias/IRL/đích thì chờ. |

Các vùng hợp lệ ở cả hai hướng có thể cùng tồn tại trong pool; script chọn vùng theo kịch bản bias hiện tại, không ép mỗi EGF có hai vùng. Không mặc định EGF sinh FVG. FVG là cấu trúc ba nến riêng; OB chỉ là candidate cơ học.

C/M chung vai trò xác nhận nhưng không chung phép đo: CISD close qua run-open đối hướng; MSS close qua pivot đã biết. Auto chọn loại đang thỏa, cùng bar ưu tiên C; mode MSS ghi M đúng kể cả C cũng thỏa. Không thêm ngưỡng displacement chưa kiểm chứng.

Với EGF, MSS lấy pivot đã biết lúc chạm IRL; FVG/OB LTF cũ bị bỏ khi bắt đầu pha phản ứng. Không bắt buộc close ra ngoài toàn bộ vùng HTF: phải có điều kiện xác nhận LTF ở phía hợp lệ, mục tiêu đúng hướng và IRL chưa bị đóng xuyên biên xa. Mọi mode chọn riêng vẫn qua gate IRL của EGF. Một tín hiệu cho mỗi model/revision.

## Nguồn các line

ERL+/ERL− bắt đầu tại swing đã xác nhận; RH/RL tại nến tạo high/low range; INV tại cực trị/biên vô hiệu; CP tại nến nguồn của mục tiêu. EQ 50% không có một cực trị nguồn nên dùng neo tổng quan hiện hành. Line có thể nối từ swing cũ tới phần chiếu hữu hạn hiện tại, không extend vô hạn.

Trên LTF, cache OHLC ghi lại timestamp nến con thật sự tạo high/low trong mỗi bucket HTF; line dùng timestamp đó. Nếu bucket đầu thiếu dữ liệu, tìm nến khớp trong lịch sử chart đã tải. Không tìm được nguồn thực thì không vẽ line đó; không ghim giả vào nến tín hiệu. Pivot được biết sau 2 nến xác nhận, không có tín hiệu sớm ở quá khứ chỉ vì line bắt đầu tại swing cũ.

Nhãn nằm bên phải line, gộp mức trùng giá/cùng nguồn, giãn các nhãn gần nhau; đường dẫn chấm chỉ lại giá thật nếu chữ bị dịch. Nền chữ trong suốt. Zoom quá nhỏ/cửa sổ hẹp hoặc scale tự kéo vẫn có thể gây chồng chữ vì Pine không có bounding box chữ theo pixel.

## Khi chưa có dấu

Kiểm tra HIST → chart M1/M3/M5 → bias rõ → model còn hiệu lực → có IRL/CP cần thiết → đã quan sát phản ứng → C/M hoặc retest hợp lệ → time filter → đã phát tín hiệu/CP đã bị lấy. Tắt bộ lọc hiển thị gần nhất chỉ để xem model cũ, không làm điều kiện dễ hơn.

Dashboard: BIAS? = EGF chưa có bias; COMP = ISB chưa resolve; IRL WAIT = chưa chạm; IRL = đang chờ điều kiện phản ứng; IRL X = đóng xuyên vùng trên LTF; CP − = thiếu đích; CP? = LTF đã thấy đích bị lấy; SIGNAL = đã phát dấu. HIST báo chưa tải đủ recovery window.

Sau khi cập nhật code, setting đã lưu của instance cũ có thể vẫn giữ offset 15/width 6: đặt lại 30/4 hoặc reset Inputs. Ghim cùng scale với symbol; tạo lại alert sau khi đổi source/input.

Xem [đặc tả và giới hạn kiểm tra](INDICATOR-AUTO-MODELS.md). Ảnh minh họa cũ trong lịch sử Git không phải ảnh runtime hoặc bố cục hiện hành.
