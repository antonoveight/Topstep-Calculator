# TFA v6 — hướng bối cảnh và tín hiệu LTF

Bản hiện hành tập trung dựng bối cảnh HTF và phát tam giác xác nhận. Bạn tự chọn giá entry, SL và Full TP theo chart; không mô phỏng lệnh hoặc PnL. Các test xác minh logic, không chứng minh xác suất thắng cao.

## Cấu hình khởi đầu

Preset nền đã qua kiểm tra **tương thích workflow**, không phải tối ưu lợi nhuận thị trường: xem [kết quả 20 tổ hợp và phạm vi kiểm tra](DAY-TRADING-DEFAULTS.md). Các mặc định LTF được khai báo tập trung trong code; chúng khớp cấu hình đang dùng nên không thay đổi hành vi so với bản trước.

HTF H1 hoặc H2 theo khung đọc cấu trúc; chart M5; Bias Auto D1 hoặc Long/Short do bạn xác định; LTF condition Auto; time filter Context only. Để quan sát tần suất: Signal display = History, giữ 100 tam giác. Cửa sổ 3 nến HTF chỉ giới hạn line, không xóa dấu ở chế độ History. Cụm bên phải mặc định cách 30 bar, thân 4 bar. Chữ chart Normal, dashboard Small.

## 23 setting

| Setting | Vai trò |
| --- | --- |
| HTF | H1/H2/H4/D1 dựng range/model từ nến đã đóng. |
| Models to observe | All chạy ba kênh LTF độc lập CRT/EGF/ISB; mỗi nhóm dùng model cũ nhất còn hiệu lực. Cụm HTF vẫn chỉ vẽ model ưu tiên chung. Chọn riêng một nhóm để đối chiếu. |
| Model timeout | Mặc định 8 nến HTF sau C2; 0 tắt, tối đa 48. Không reset tuổi do đổi bias/IRL hoặc resolve ISB. Hết hạn bỏ model khỏi cụm và kênh tín hiệu. |
| Bias TF | Khung bias >= HTF; mặc định D1. Auto chỉ là quy tắc sweep/close-through của script, không có dữ liệu FRVP cá nhân. |
| Bias | Auto / Long / Short / Neutral. EGF lấy hướng kịch bản từ bias, không lấy từ màu nến. CRT/ISB phải thuận bias để phát dấu. |
| LTF condition | Auto / CISD / MSS / FVG retest / OB retest. Đây là điều kiện phát tín hiệu, không phải lựa chọn giá khớp lệnh. |
| Signal timing | Mặc định Pullback: đợi hồi kiểm tra sau xác nhận. Confirmation close: cho phép dấu ở nến đóng phá C/M cho cách vào market. FVG/OB retest luôn đợi nến sau hình thành. |
| Signal cadence | Fresh reaction: cần pivot hồi mới và tiến triển cấu trúc để phát lại; One per model giữ một dấu/model. WAVE WAIT là gate chung giữa các kênh. |
| Time filter | Context only không chặn giờ; Web macros/working windows giới hạn giờ tín hiệu theo New York có DST. |
| Macro background | Bật/tắt nền macro. Không tạo bias. |
| QT clock context | Hiện đồng hồ quý trong dashboard, không quyết định hướng. |
| Model HTF candle cluster | Toàn bộ dãy HTF từ C1 model còn hiệu lực đến N* hiện tại, gồm các nến trung gian; không còn giới hạn bốn nến. |
| Cluster offset | Mặc định 30 bar; tăng nếu muốn thêm khoảng trống bên phải chữ. |
| Cluster body width | Mặc định 4 bar; số lẻ làm tròn xuống chẵn để râu đúng tâm. |
| Model range / ERL / CP | Các line cấu trúc và mục tiêu có điều kiện. Không ảnh hưởng logic tam giác khi tắt. |
| HTF internal liquidity / FVG | Hiện FVG, OB fallback và swing H/L HTF. Riêng box FVG neo C1 HTF khi mở LTF, chỉ xuất hiện sau close C3. |
| Compact panel | Bảng tổng quan model, bias, IRL nội bộ, thời gian và trạng thái. |
| Signal display | History (mặc định) giữ dấu quá khứ, Latest chỉ giữ dấu gần nhất. Không thay điều kiện nhận diện/alert. |
| Historical signals to keep | Mặc định 100, tối đa 200; 0 ẩn dấu. Ở Latest chỉ giữ 1 nếu số này >0. |
| Hide drawings without a recent signal | Ẩn hình khi model/tín hiệu quá cửa sổ gần nhất. Model HTF gần đây vẫn được xem là tín hiệu cấu trúc để hiện tổng quan trước tín hiệu LTF. |
| Drawing horizon / recency | Mặc định 3 nến HTF. Giới hạn phần chiếu về trước và tuổi hiển thị; không cắt bỏ điểm nguồn cũ của ERL. |
| Chart text size | Small/Normal/Large/Huge; mặc định Normal. Chữ nền trong suốt. |
| Dashboard text size | Small/Normal/Large; mặc định Small. |

Chart tiêu chuẩn phải <= HTF, độ dài chart TF chia hết HTF. Chỉ M1/M3/M5 nhỏ hơn HTF phát tín hiệu; các khung nhỏ hơn khác chỉ xem tổng quan.

## Những mục đã bỏ khỏi Inputs

Giới hạn pool/queue, pivot, độ xuyên tick, recovery và invalidation cơ học cố định trong code để tránh quá nhiều nút: pivot 2 trái/2 phải, sweep tối thiểu 1 tick, queue 12, recovery 1000 khoảng lịch HTF, close vượt INV để vô hiệu, timeout theo tuổi có setting riêng, mặc định 8 HTF. Window gần nhất là hiển thị, không phải tuổi hết hiệu lực model.

Bỏ nhập tay SSL/BSL/POC/BL/SL/CP và các mode POC/Line, gate R:R tại close tín hiệu, model phụ, C/M sơ bộ và plot TDO/TO khỏi giao diện. CRT tự dùng C1 range. Không ép min R:R từ close của tam giác vì bạn sẽ chọn giá entry thực tế; vẫn kiểm tra hướng mục tiêu và không phát dấu khi bar chạm INV tham chiếu hoặc CP đã bị lấy. Chỉ báo không biết SL thực tế của bạn.

OB/FVG **LTF** vẫn chỉ lọc nội bộ, không vẽ box/zone/nhãn entry. IRL HTF của EGF hiển thị riêng: FVG HTF hai hướng nếu tồn tại. Không vẽ line CISD/MSS hoặc chữ cạnh tam giác. Tam giác Tiny: xanh Buy dưới nến, đỏ Sell trên nến; xem loại xác nhận trong tooltip.

## Timeout và đọc IRL

Model timeout = 8 đếm nến HTF từ C2, không từ C1 hay số phút thực. Đây là quy tắc chờ cá nhân, không phải thời hạn cố định của ICT. Ví dụ H1: hết hạn tại close nến thứ 8 sau nến xác nhận; không gia hạn khi đổi bias, IRL, hoặc ISB mới resolve. Nhãn dưới cụm hiển thị tuổi/giới hạn; hết hạn thì FIFO chọn model còn hiệu lực tiếp theo, hoặc không vẽ nếu không còn model. Không xóa tam giác lịch sử đã phát.

IRL giữ đủ FVG, OB fallback và swing H/L HTF như logic đã có; không loại OB hoặc thanh khoản điểm. Riêng cách vẽ FVG khi mở LTF: gap Bull = Low C3 > High C1, Bear = High C3 < Low C1; box và CE line neo vào timestamp C1 **HTF**, không vào nến LTF hiện tại. Vùng chỉ được biết sau close C3 HTF. OB vẫn neo nến nguồn của OB; swing H/L neo cực trị thật. Hai hướng hiển thị nếu có, * chỉ reference đang dùng theo bias. FVG là một loại IRL, không thay thế mọi thành phần IRL khác. Box entry LTF vẫn được ẩn như trước.

## Đọc theo từng model

Cụm HTF không bị ẩn theo tuổi line khi model còn hiệu lực. Dãy lấy OHLC từ các bucket chart đã tải, ưu tiên dữ liệu chart khi trùng nến nguồn; chỉ dùng OHLC nguồn HTF làm fallback khi thiếu bucket tương ứng. N* cập nhật theo nến hiện tại, không nhân đôi nến. C1/C2/TS/BR/C3 đánh dấu nguồn; nến trung gian không thêm chữ. Dãy dài tự thu khoảng cách và thân trong vùng 420 bar chart. Script dành tối đa 450 cặp thân/râu để không vượt ngân sách đối tượng; vượt mức sẽ báo rõ và không vẽ một dãy bị cắt đầu. Không thể khôi phục nến trung gian chưa có trong dữ liệu chart đã tải; cần tải đủ lịch sử tới C1 để đối chiếu toàn bộ dãy.

| Model | Hướng và điều kiện |
| --- | --- |
| CRT/TS | C2 quét một phía C1 tối thiểu 1 tick, close lấy lại và nằm trong range; loại quét cả hai phía. Phía sweep/reclaim xác định hướng ứng viên, bias lọc; chờ một xác nhận C hoặc M trên LTF. Không gọi râu dài bất kỳ là TS. |
| Inside Bar | Mẹ giữ nguyên khi nén lồng nhau. Màu nến không xác định hướng. Chờ HTF sweep/reclaim quanh mother hoặc close phá mother; nhánh break còn chờ retest mother và xác nhận LTF. Phá giả vẫn có thể xảy ra. |
| EGF/OUT | EGF bao thân, OUT bao High–Low. Hình thái không tự ép Buy/Sell. Kịch bản theo bias; chọn IRL nội bộ phù hợp trong pool, chờ lần chạm thực sự và phản ứng LTF hướng tới ERL. Thiếu bias/IRL/đích thì chờ. |

Các vùng hợp lệ ở cả hai hướng có thể cùng tồn tại trong pool; script chọn vùng theo kịch bản bias hiện tại, không ép mỗi EGF có hai vùng. Không mặc định EGF sinh FVG. FVG là cấu trúc ba nến riêng; OB chỉ là candidate cơ học.

C/M chung vai trò xác nhận nhưng không chung phép đo: CISD close qua run-open đối hướng; MSS close qua pivot đã biết. MSS được cập nhật khi có pivot mới đã xác nhận và nguồn pivot nằm trong pha kích hoạt hiện hành. Khi đã xác nhận, mức chờ hồi được cố định cho lượt phản ứng đó, không chạy theo pivot/run mới. Auto cùng bar ưu tiên C; mode MSS ghi M đúng kể cả C cũng thỏa. Không thêm ngưỡng displacement chưa kiểm chứng.

Signal timing mặc định **Pullback**: nến đóng phá C/M chỉ ghi nhận xác nhận; cần một nến sau hồi chạm mức đã phá và đóng lại đúng phía (Buy trên mức, Sell dưới mức), hoặc retest FVG/OB hợp lệ theo nhánh. Auto CRT/TS yêu cầu có C/M trước rồi mới xét retest; FVG/OB phải hình thành từ nến xác nhận trở đi. EGF vẫn cần IRL và ISB breakout vẫn cần mother retest. Không có hồi hợp lệ thì không có tam giác. Chế độ **Confirmation close** giữ cách dùng market tại nến đóng xác nhận C/M; mode FVG/OB vẫn đợi retest. Tam giác luôn trên nến hoàn tất điều kiện, không vẽ lùi về nến nguồn hay cố tình đẩy sang nến kế tiếp. Tooltip phân biệt Confirm bar và Trigger bar (giờ mở nến NY). WAIT CONFIRM/WAIT RETEST cho biết giai đoạn chờ; đây chưa phải lệnh đã khớp.

Với EGF, MSS lấy pivot đã biết lúc chạm IRL; FVG/OB LTF cũ bị bỏ khi bắt đầu pha phản ứng. Không bắt buộc close ra ngoài toàn bộ vùng HTF: phải có điều kiện xác nhận LTF ở phía hợp lệ và mục tiêu đúng hướng. Râu xuyên vùng rồi reclaim không tự xóa IRL đang chọn. LTF đóng ngoài vùng tạm chặn dấu, có thể được xét lại sau reclaim khi context HTF còn hiệu lực; HTF close xuyên biên xa mới xóa vùng. Mọi mode chọn riêng vẫn qua gate IRL của EGF. Fresh reaction: sau một hit phải có pivot hồi đã xác nhận với nguồn sau nến tín hiệu (Buy pivot Low, Sell pivot High), Low cao hơn đáy nến hit và close vượt đỉnh nến hit đối với Buy; đối xứng với Sell. EGF còn phải rời rồi chạm lại IRL. Không mở lượt chỉ do một nến đổi màu. Lượt chờ chưa phát có thể được thay khi pivot hồi mới thuộc sau xác nhận cũ và run đối hướng mới xuất hiện sau xác nhận đó. Trong lượt mới, bỏ FVG/OB/C-M cũ, giữ run mới nếu hợp lệ; xác nhận tại nến hiện tại đã đóng, không backdate về nến pivot. Pullback tiếp tục đợi nến sau retest. One per model vẫn giữ everSent. Bộ lọc sóng dùng chung giữa CRT/EGF/ISB: sau một Buy, Buy ở nến sau cần một pivot Low đã xác nhận có timestamp nguồn sau nến Buy trước; Sell dùng pivot High tương ứng. Đổi model/revision hoặc đổi IRL không vượt qua gate này. Các hit cùng hướng cùng bar vẫn gộp một tam giác và giữ provenance; hit nối đuôi chưa có pivot mới nhận WAVE WAIT, không tiêu thụ state.sent. Lượt mới có thể được model/kênh khác phát trước, khi đó kênh theo sau trong cùng nhịp cũng bị chặn. Không dùng cooldown số nến cố định và không nhìn trước pivot.

## Nguồn các line

ERL+/ERL− bắt đầu tại swing đã xác nhận; RH/RL tại nến tạo high/low range; INV tại cực trị/biên vô hiệu; CP tại nến nguồn của mục tiêu. EQ 50% không có một cực trị nguồn nên dùng neo tổng quan hiện hành. Line có thể nối từ swing cũ tới phần chiếu hữu hạn hiện tại, không extend vô hạn.

Trên LTF, cache OHLC ghi lại timestamp nến con thật sự tạo high/low trong mỗi bucket HTF; line dùng timestamp đó. Nếu bucket đầu thiếu dữ liệu, tìm nến khớp trong lịch sử chart đã tải. Không tìm được nguồn thực thì không vẽ line đó; không ghim giả vào nến tín hiệu. Pivot được biết sau 2 nến xác nhận, không có tín hiệu sớm ở quá khứ chỉ vì line bắt đầu tại swing cũ.

Nhãn nằm bên phải line, gộp mức trùng giá/cùng nguồn, giãn các nhãn gần nhau; đường dẫn chấm chỉ lại giá thật nếu chữ bị dịch. Nền chữ trong suốt. Zoom quá nhỏ/cửa sổ hẹp hoặc scale tự kéo vẫn có thể gây chồng chữ vì Pine không có bounding box chữ theo pixel.

## Khi chưa có dấu

Kiểm tra HIST → chart M1/M3/M5 → bias rõ → model còn hiệu lực → có IRL/CP cần thiết → đã quan sát phản ứng → C/M hoặc retest hợp lệ → time filter → đã phát tín hiệu/CP đã bị lấy. Tắt bộ lọc hiển thị gần nhất chỉ để xem model cũ, không làm điều kiện dễ hơn.

Dashboard: BIAS? = EGF chưa có bias; COMP = ISB chưa resolve; IRL WAIT = chưa chạm; IRL = đang chờ điều kiện phản ứng; IRL X = đóng xuyên vùng trên LTF; CP − = thiếu đích; CP? = LTF đã thấy đích bị lấy; SIGNAL = đã phát dấu. HIST báo chưa tải đủ recovery window.

Sau khi cập nhật code, kiểm tra Signal display = History và Historical signals to keep = 100; instance cũ có thể còn lưu giới hạn cũ. Nếu còn offset 15/width 6, đặt lại 30/4 hoặc reset Inputs. Ghim cùng scale với symbol; tạo lại alert sau khi đổi source/input.

## Rà tần suất và lý do không có dấu

1. Dùng chart M5 và cùng HTF, bias, time filter, dữ liệu lịch sử cho mọi lần so sánh. Giữ Auto bias khi so toàn bộ lịch sử; Long/Short nhập tay áp dụng cho toàn bộ lịch sử đã tải, không phải nhật ký bias từng ngày.
2. Bật History, chọn 100–200 dấu, kéo chart về quá khứ để tải thêm dữ liệu. Giới hạn lịch sử của TradingView và recovery window vẫn áp dụng; không tạo tín hiệu từ dữ liệu chưa tải.
3. Rê chuột lên tam giác để xem model, C/M/F/O, thời gian New York, close/CP/INV tại thời điểm đó. Data Window có direction +1/-1, CP và INV riêng cho từng nhóm, cùng close tham chiếu của bar. Không dùng close tham chiếu như giá fill thực tế.
4. Dòng N của dashboard: C/E/I đếm các xác nhận theo từng nhóm trên tập chart/recovery đã tính, có thể lớn hơn số tam giác còn giữ. Nhiều nhóm cùng hướng/cùng bar được gộp một tam giác, tooltip ghi đủ nhóm, nên tổng C+E+I có thể lớn hơn số tam giác. DATA cho biết khoảng ngày của tập xem xét. Đổi dữ liệu chart có thể đổi số đếm.
5. WHY là lý do ở nến đã đóng gần nhất; dấu * nghĩa là bar hiện tại còn chạy. NO MODEL = chưa có model phù hợp bộ lọc; NO DIR = chưa có hướng; NO ERL = thiếu đích; BIAS/TIME = không qua bộ lọc; CP TAKEN/INV/PATH = không còn đường đi hợp lệ; IRL WAIT/IRL X/CONTEXT = thiếu phản ứng phù hợp; LTF WAIT = chưa có điều kiện LTF; USED = One per model đã có dấu; PULLBACK = đang chờ nhịp hồi mới; IRL RETEST = chờ lượt chạm IRL mới; SIGNAL = vừa phát. Rê chuột vào ô WHY để xem trạng thái cả ba kênh; chữ đang hiện thuộc model ưu tiên chung hoặc SIGNAL nếu bất kỳ kênh nào vừa phát.
6. Models to observe cho phép rà riêng từng nhóm. All dùng ba trạng thái tách biệt, không đòi cả CRT+EGF+ISB cùng xuất hiện và không để model một nhóm khóa nhóm khác. Mẫu chồng lấp được phân loại theo cấu trúc chính CRT/TS → ISB → EGF/OUT. Với cùng dữ liệu/bias/time/cadence, bộ đếm mỗi nhóm trong All phải tương ứng lần chạy riêng nhóm đó; tam giác hợp nhất cùng bar không cộng cơ học. Vẫn chưa xét mọi model cùng nhóm song song: mỗi nhóm giữ FIFO.

Độ chính xác cần đối chiếu bằng Replay với kế hoạch entry/SL/Full TP cụ thể. Chỉ báo chưa tính win rate hoặc PnL; một tam giác đúng điều kiện không tự chứng minh một giao dịch thắng. History không nới gate bias, time, IRL hoặc target/INV. Cadence là quy tắc phản ứng riêng, không phải thay đổi do bật History. INV của chỉ báo là mức vô hiệu cấu trúc theo close, không giả định râu chạm là SL của lệnh thực tế.

Xem [đặc tả và giới hạn kiểm tra](INDICATOR-AUTO-MODELS.md). Ảnh minh họa cũ trong lịch sử Git không phải ảnh runtime hoặc bố cục hiện hành.

## Sửa lượt chờ và tín hiệu cùng nhịp

Fresh reaction: sau một hit phải có pivot hồi đã xác nhận với nguồn sau nến tín hiệu (Buy pivot Low, Sell pivot High), Low cao hơn đáy nến hit và close vượt đỉnh nến hit đối với Buy; đối xứng với Sell. EGF còn phải rời rồi chạm lại IRL. Không mở lượt chỉ do một nến đổi màu. Lượt chờ chưa phát có thể được thay khi pivot hồi mới thuộc sau xác nhận cũ và run đối hướng mới xuất hiện sau xác nhận đó. Trong lượt mới, bỏ FVG/OB/C-M cũ, giữ run mới nếu hợp lệ; xác nhận tại nến hiện tại đã đóng, không backdate về nến pivot. Pullback tiếp tục đợi nến sau retest. One per model vẫn giữ everSent.

Bộ lọc sóng dùng chung giữa CRT/EGF/ISB: sau một Buy, Buy ở nến sau cần một pivot Low đã xác nhận có timestamp nguồn sau nến Buy trước; Sell dùng pivot High tương ứng. Đổi model/revision hoặc đổi IRL không vượt qua gate này. Các hit cùng hướng cùng bar vẫn gộp một tam giác và giữ provenance; hit nối đuôi chưa có pivot mới nhận WAVE WAIT, không tiêu thụ state.sent. Lượt mới có thể được model/kênh khác phát trước, khi đó kênh theo sau trong cùng nhịp cũng bị chặn. Không dùng cooldown số nến cố định và không nhìn trước pivot.
