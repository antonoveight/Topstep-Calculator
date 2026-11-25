# CRT: key HTF, TS và ba nhánh entry

Cập nhật thực thi 25/11/2026. Đây là đặc tả hiện hành của Pine. Bản MPS chung/R1 nhập tay trước đây nằm trong [bản lưu](archive/CRT-FIRST-LEG-SPEC-before-key-reactions-2026-11-25.md). Không áp dụng các điều kiện cũ đồng thời với bản này.

Cập nhật hạn mức chạy: mặc định hiện là Light (24 nến mỗi nguồn) và Calculated bars 150 trên chart; Full giữ nguồn 600. Các đoạn mô tả cửa sổ 600 bên dưới là giới hạn Full, không phải dữ liệu được bảo đảm trong Light. Snapshot model đã gộp và bỏ trường legacy luôn rỗng, không thay công thức entry. Xem [hướng dẫn cài đặt](INDICATOR-SETTINGS.md) và [kết quả full compiler + native runtime](research/crt-compile-runtime-validation-2026-11-25.json).

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

FVG/OB/open-close bị loại khi có close HTF vượt mép xa ngược hướng, hoặc quá 48 nến nguồn; râu chạm không tự xóa vùng. Swing bị loại khi đã bị lấy. Pool vùng tối đa 40; snapshot giữ hai mức gần nhất mỗi loại/hướng. Key bối cảnh của attempt phải được biết **không muộn hơn lúc C2 mở**, bao gồm key vừa xác nhận khi C1 đóng. Không bắt mọi key phải tồn tại từ trước C1 mở.

Key bối cảnh Main lấy cùng HTF và từ Bias TF; Larger có bộ riêng; Early lấy key cùng HTF từ C1 đã hoàn tất. Ngoài bối cảnh này, mỗi TS/P3 có bộ kiểm tra vị trí trực tiếp riêng bên dưới. SMT hiện chỉ xét raid range của hai nến liền kề, không dò đầy đủ SMT giữa mọi swing/FVG và không tự chọn mã tương quan. Cặp khác session hoặc thiếu dữ liệu không được xác nhận SMT.

## Ba nhánh song song

| Nhánh | Điều kiện tam giác trên nến entry đã đóng |
| --- | --- |
| TS_CLOSE | Khi có cặp P1→P2 đã xác nhận trước raid, dùng biên P1 để nhận sweep/reclaim và close ngược màu. Nến này được phép engulf cả nến liền trước; nến liền trước không tự là toàn bộ range CRT. Nếu chưa có cặp cấu trúc hợp lệ, giữ detector TS hai nến như fallback, không suy ra MPS từ fallback đó. Tam giác đặt tại chính nến sweep/reclaim đã đóng, không chờ MPS/retest. Chưa phải bộ nhận diện Model 1 nguyên bản đầy đủ. |
| TS_FVG | Sau TS, hình thành gap ba nến LTF. Chỉ nến sau lúc gap đã biết mới được retest; cần chạm vùng và close phản ứng ra ngoài mép gần. Có thể trước MPS. Vùng không vẽ lên chart. |
| MPS_OTE | Sau TS, close vượt pivot cấu trúc LTF đã xác nhận trước TS và thuộc thời gian C1 trở đi. Sau MPS, theo dõi endpoint toàn bộ leg đầu từ râu TS. Entry là nến phản ứng vùng hồi 50–80% đã biết trước nến đó; không cần TS thứ hai. Không vẽ fibo. |

MPS chỉ được xác nhận khi TS/P3 trực tiếp phản ứng tại key HTF hợp lệ, không chỉ vì CRT cha từng ở key. MPS dùng cặp pivot 2/2 có thứ tự trước raid: Sell là high P1 rồi low P2; Buy đối xứng. Cặp được ghi nhận khi quét P1; trước lần reclaim đầu có thể chuyển sang cặp mới đã hoàn tất. Sau reclaim đầu, giữ P1/P2 qua các nhịp quét lại cùng sóng: thay cực trị TS khi reclaim lại, không đổi P2 sang pivot nội bộ hoặc đáy/đỉnh vừa tạo sau TS. Close đầu tiên vượt P2 mới xác nhận MPS. Vẫn là quy ước cơ học, chưa nhận diện hoàn chỉnh mọi cấu trúc discretionary hay một engine M15 riêng. Main/Larger thực thi trên chart M1/M3/M5/M15. Structure timeframe = Chart giữ cách chọn swing trên chart; M15 dùng nguồn swing và close M15 độc lập khi chart nhỏ hơn M15. Chưa khẳng định tái tạo mọi dấu trong bảy ảnh.

OTE không dùng riêng râu nến kích hoạt MPS. Endpoint cập nhật từ các nến đóng sau đó, rồi đóng băng khi nhánh OTE đã dùng. Nến vừa tạo endpoint mới không được đồng thời dùng vùng tính lại để phát OTE vì OHLC không biết thứ tự intrabar. Nhịp chờ giữ tối đa 36 nến LTF từ raid và từ TS. Trước MPS, quét thêm cực trị TS có thể tạo attempt reclaim mới trên cùng P1/P2; sau MPS, mất cực trị TS thì bỏ cặp. Một close mở rộng xa khỏi P1 quá một khoảng |P1−P2| cũng giải phóng cặp cũ, tránh giữ sóng từ nhiều giờ trước rồi bỏ qua sóng mới. Ngưỡng một range này là quy ước triển khai cá nhân, không gán cho Romeo; nó không tự hủy CRT HTF hoặc thay INV/TGT của context.

Mỗi attempt có tối đa một entry cho mỗi nhánh trong một nhịp TS. Hai nhánh đủ điều kiện cùng nến gộp vào một tam giác và giữ lý do trong tooltip. One per model giới hạn cả attempt còn một lần. Fresh reaction không dùng khóa hướng chung giữa các setup; state có token HTF/C1/attempt/hướng và giữ khi đổi focus.

## Vòng đời và Early C2

C1/C2 vẫn là cặp HTF liền kề, C2 sweep/reclaim một phía và đóng trong C1. TGT là đầu đối diện C1, INV là cực trị râu TS. Chạm INV/TGT kết thúc attempt; cùng nến chạm cả hai là AMB, không suy đoán thứ tự. CRT đã đạt TGT không được hồi sinh cho continuation khác. Setup mới cần C1/C2/token mới.

Một CRT còn hiệu lực không tự hết hạn chỉ vì C3 đóng. Nhánh Confirmed được tiếp tục tìm TS mới trong context còn sống; không bỏ các barrier. Chỉ original C3 có thể thay raid một lần trên cùng C1 theo bộ key đã đóng băng, như cơ chế trước; không ghép một raid xa vào C1 cũ.

Early C2 vẫn thử nghiệm và chỉ điều khiển quyền phát E: một nến LTF đã đóng quét/reclaim range C1 HTF tại key có trước C2, close ngược màu, trước C2 đóng. Tối đa một dấu E mỗi C2. Quan sát TS/MPS/gap/leg luôn chạy trên Main và Larger, kể cả tắt E hoặc chọn FVG / OTE; Larger hiện chỉ quan sát C2, không thêm E riêng. C2 đóng không tự xóa bằng chứng. Khi đúng C1/C2/hướng, thời điểm kết thúc C2 và cực trị vô hiệu khớp setup xác nhận, Main/Larger nhận bằng chứng còn hiệu lực mà không yêu cầu đã phát entry. Không chuyển E thành tín hiệu xác nhận trong quá khứ. Nếu nhịp provisional mất cực trị trước khi C2 kết thúc, giữ nguyên lịch sử lệnh cũ nhưng có thể quan sát raid mới; không phát E thứ hai. Chạm đích CRT hoặc quét cả hai đầu vẫn kết thúc cửa sổ đó.

## Nhãn và kiểm chứng

CRTH/CRTL gồm râu; EQ/EQ* là midpoint và đã chạm midpoint, không phải TP; TGT là đầu range mục tiêu; INV là cực trị vô hiệu; KEY FVG/OB/SWH/SWL/OPEN/CLOSE kèm khung nguồn. Bỏ phân loại IRL/ERL khỏi phần vẽ, tính toán tham chiếu và gating. Một số slot snapshot cũ còn để trống nhằm giữ tương thích OHLC/cụm HTF; chúng không còn mang logic giao dịch.

Giữ hai cụm HTF, tên khung phía trên và countdown nến live phía dưới. Tam giác Buy xanh dưới nến, Sell đỏ trên nến, size 4 như lựa chọn trước. Không đổi web/checklist của ứng dụng trong lần sửa indicator này; web còn một số mô tả phiên bản trước cần migration riêng.

Chạy node tools/sync-indicator.cjs và node tools/check-crt.cjs. Bộ hiện hành thay các fixture universal-MPS/R1 nhập tay bằng kiểm tra thân hàm Pine cho ba nhánh/key/SMT/Early/handoff, đồng thời giữ lifecycle, bias và layout. Các study R1/MPS cũ mô tả schema 2/3, không phải nghiệm thu schema 4. CSV mới đánh dấu schema 4; auditor TS-only cũ phải từ chối, không dùng nó để kết luận replay đã qua.

Giới hạn mặc định vẫn 600 nến chart và 600 nến mỗi nguồn. Đây là phạm vi tải, không phải chứng nhận độ ổn định mọi cặp khung/feed. Kiểm tra tổng hợp và biên dịch không thay thế đối chiếu OHLC thị trường, reload, Replay hoặc hiệu suất giao dịch.

Nghiệm thu 25/11/2026: 20 suite hiện hành qua; exact source biên dịch Pine không lỗi/cảnh báo. Brave XAUUSD M5 đã hiện tam giác và MPS với H1/H4 và H2/H4, 600 chart bar; chưa thấy cảnh báo runtime trong lần quan sát. [Hash nguồn, phạm vi kiểm tra và hạn chế](research/crt-key-reactions-validation-2026-11-25.json). Đây là smoke test, không phải Replay hoặc xác nhận mọi dấu trong ảnh mẫu.

### Hiển thị MPS theo ảnh mẫu · 25/11/2026

MPS dùng đoạn ngang màu cam tại giá P2, nối từ nến pivot nguồn tới nến close xác nhận phá mức. Chữ +MPS (xanh) hoặc -MPS (đỏ) ở giữa đoạn, có khoảng ngắt đường, không nền hộp và không đẩy nhãn theo ATR. Hai HTF cùng xác nhận một giá/hướng trên cùng nến được gộp và ghi đủ nguồn trong tooltip. History/Latest xóa cả nhãn và hai đoạn đường tương ứng; đường không extend quá nến xác nhận.

Sau phản hồi về sóng, đã sửa cả nhận diện P1/P2 như phần trên, không chỉ dời hình. Chữ MPS hiện tự đổi 8–12 point theo số nến thực tế đang hiển thị khi zoom/scroll ngang; khoảng ngắt đường cũng được cập nhật. Cách này chỉ ảnh hưởng hiển thị, không tham gia entry/bias hay chọn P2. Pine không có tỷ lệ pixel/zoom dọc để scale chữ chính xác theo mọi thao tác kéo trục giá. [Cơ chế visible timestamps](https://www.tradingview.com/pine-script-docs/concepts/time/#visible-bar-times) làm script tính lại khi vùng nhìn thay đổi; [label size](https://www.tradingview.com/pine-script-docs/visuals/text-and-shapes/) cho phép cỡ chữ số nguyên. Đây là thay thế cho Chart text size riêng đối với nhãn MPS.

Các dòng giờ/trace từng xuất hiện bên trái chart là bảng chẩn đoán tạm, không phải chức năng của bản phát hành. Đã gỡ khỏi bản đang chạy; kiểm tra nguồn cũng chặn các tên bảng debug này. Đối chiếu native XAUUSD/OANDA M5: P2 3653.235 tại 08:05 ngày 24/11/2026 (UTC+7), close phá 09:05 (bar mở 09:00), source H4. Không dùng low 09:00 làm P2 cho nhịp TS đó. Ca tổng hợp có Buy/Sell đối xứng, parent cũ 06:30, quét lại, pivot nội bộ và prefix bất biến; không coi đây là backtest đầy đủ hoặc chứng nhận lợi nhuận.

[Bằng chứng và phạm vi nghiệm thu bản sửa sóng MPS](research/crt-mps-wave-fix-2026-11-25.json): 22 suite qua, compiler exact source không lỗi/cảnh báo; bảng chẩn đoán đã gỡ và chỉ thay instance TFA trên chart, giữ chỉ báo Daye Quarterly Theory của người dùng.

### Vị trí TS/P3 tại key HTF và nguồn dấu lịch sử · 25/11/2026

Bộ lọc trước đây chỉ yêu cầu giá còn giữ phía phản ứng của key bối cảnh CRT. Điều đó có thể cho phép TS hoặc MPS mới ở rất xa key. Quy tắc mới yêu cầu **cực trị P3 của chính nhịp LTF** phản ứng tại key HTF; bối cảnh cũ không thay thế bằng chứng này. Đây là cách mã hóa yêu cầu vị trí của người dùng và tài liệu key đã dẫn, không phải cam kết mọi phản ứng tại key đều thành công.

- Nguồn key là nến H1, HTF chính, Larger HTF và Bias TF **đã hoàn tất**, theo thứ tự đó khi trùng phản ứng. Không tìm key LTF. Loại key vẫn theo Key types; SMT không tự thay một mức giá. H1 được bổ sung để nhận ra key H1 bên trong bức tranh H2/H4.
- Key phải được biết không muộn hơn lúc nhịp raid đầu mở; Early dùng mốc C2 mở. Không mượn key mới hình thành sau raid. Key swing cần quét rồi reclaim; FVG/OB/open-close cần chạm và close ra phía phản ứng, theo đúng bảng phía trên.
- Với raid nhiều nến, ghi lại high/low của **nến tạo cực trị**, không dùng toàn bộ khoảng high–low của cả sóng để giả lập chạm key. Bằng chứng tiếp xúc được giữ từ nến cực trị tới reclaim, kể cả khi key bị loại khỏi pool vì chính cú quét đó. Cực trị mới thay bằng chứng cũ; không mượn lần chạm trước nếu cực trị mới ở xa.
- Sau reclaim, close hoàn tất của đúng HTF nguồn xuyên mép xa ngược hướng làm mất bằng chứng và khóa nhánh hồi của nhịp đó. Việc sau đó đóng trở lại không khôi phục bằng chứng đã mất; cần TS/P3 mới hợp lệ. INV/TGT của CRT cha và giới hạn nhịp vẫn áp dụng độc lập.
- Mặc định mọi nhánh TS/FVG/OTE cần local key. Tắt Require prior HTF key reaction chỉ để chẩn đoán TS/FVG cùng bias; MPS/OTE luôn cần local key. Nhánh ngược bias còn phải có cả key bối cảnh trước C2 và local key mới.
- MPS không bắt buộc để phát TS close/FVG. MPS đủ điều kiện mới mở nhánh OTE; không thêm một bộ chặn MPS chung làm mất cả tín hiệu TS.

Ảnh ETHUSD: tooltip Buy chỉ rõ **HTF H2**, C1 24/11 13:00 NY, xác nhận 17:00 NY, signal close 17:55 NY; tương ứng 25/11 01:00, 05:00 và 05:55 UTC+7. Đây là Buy H2 lịch sử, không phải Buy H4 và không phải hướng Sell của setup đang ở panel sau đó. Không đổi màu/xóa ngược dấu cũ để khớp setup mới. Tuy nhiên OB/H2 1645.23–1667.94 trong tooltip không tự chứng minh một TS Buy quanh 1684 đã phản ứng tại key: bộ lọc mới loại trường hợp chỉ có OB xa đó. Chưa có OHLC đầy đủ để kết luận không có một key khác đủ điều kiện trên đúng nến này.

Tooltip hiện ghi hướng/HTF nguồn, C1 và giờ signal UTC+7, key của chính P3, thời điểm key đã biết và reclaim; panel luôn là context hiện tại. Không thêm chữ hay bảng trace lên chart. Kiểm tra bổ sung nằm ở tests/crt-local-key.cjs, dùng dữ liệu cấu tạo có giá tham chiếu ảnh và prefix bất biến; không gọi là backtest ETH/XAU.

[Nghiệm thu bộ lọc vị trí key](research/crt-local-key-validation-2026-11-25.json): 23 suite qua; exact-source Pine không lỗi/cảnh báo. Brave đã kiểm tra XAUUSD và ETHUSD H2/M5, giữ cài đặt TS close; Buy ETH gần 05:50 được lọc, MPS sóng mẫu XAU giữ được phản ứng CLOSE/H1 3672.325. Đây là quan sát native, chưa phải Bar Replay hoặc đánh giá lợi nhuận.

### Thứ tự P1 → P2 → P3 trong Early C2 · 25/11/2026

Early C2 trước đây so cực trị tích lũy của cả C2 với P1 nhưng không kiểm tra thời điểm cực trị so với P2. Một ca dựng bằng thân hàm thực tế đã cho thấy đỉnh có trước P2 vẫn được dùng để khởi tạo MPS về sau. Đây là lỗi kiểm tra cấu trúc, không phải bằng chứng rằng một dấu cụ thể trên XAUUSD đã sai hoặc gây SL trên MGCG27.

Early hiện lưu thời gian nến tạo high/low thực tế. Chỉ khởi tạo cấu trúc MPS khi P1 có trước P2, P2 có trước P3 và P3 không muộn hơn nến TS xác nhận. Sell phải quét trên P1 ít nhất một tick; Buy đối xứng. Dùng cả râu. P2/P3 cùng một nến không được suy đoán thứ tự intrabar. Nếu giá thực sự chạm lại cùng cực trị sau P2, ghi nhận lần chạm mới cùng high/low của đúng nến đó.

Cổng MPS chung cũng kiểm tra lại thứ tự và giá quét trước khi phát, bao gồm bằng chứng Main nhận từ Early. Handoff giữ nguyên mốc P1/P2/P3; không dời cực trị về nến reclaim để hợp thức hóa thứ tự. Cấu trúc Early không hợp lệ thì không truyền P2 cho MPS/OTE. TS-close Early vẫn có thể phát độc lập khi đủ điều kiện CRT/key; không thêm MPS thành điều kiện bắt buộc cho TS/FVG.

Tooltip MPS bổ sung giá/thời gian P1 và P3, cạnh thông tin P2 nguồn đã có. Các mốc này là cấu trúc LTF trong context HTF được ghi trên nhãn, không phải yêu cầu mọi đỉnh/đáy HTF đều bị vượt. Không thêm chữ hoặc bảng trace lên chart, không đổi setting mặc định.

Kiểm tra: tests/early-mps-chronology.cjs chạy Buy/Sell đối xứng, ca sai trên bản trước sửa, P3 hợp lệ/cùng nến/quét lại bằng giá, xác nhận ngay hoặc về sau, cổng chung/handoff, reset C2 và 66 prefix bất biến. Đây là dữ liệu dựng với pivot nguồn cung cấp rõ, không emulation ta.pivots/request.security hoặc market Replay.

[Bản nghiệm thu](research/crt-early-mps-chronology-2026-11-25.json): 24 suite qua, exact-source Pine biên dịch không lỗi/cảnh báo. Instance Brave chưa cập nhật trong lượt sửa này vì người dùng đang thao tác trang khác; host guard đã dừng nhập liệu.

### Tích hợp chuỗi CRT xuyên khung · 25/11/2026

Năm bước trong báo cáo completeness được triển khai theo các quy ước cơ học dưới đây; chúng không được gán thành một thuật toán nguyên bản hoàn chỉnh của Romeo. Phần nguồn đã xác minh vẫn là key → TS → close MPS → hồi leg đầu/OTE, với liên hệ C1/C2/C3 theo ngữ cảnh, không có bảng ghép khung cố định.

1. Quan sát tách khỏi entry. P1/P2 được ghi khi raid bắt đầu, không đổi P1 sang chính P3 vừa thành pivot trong lúc chờ reclaim. Bằng chứng C2 được giữ kể cả không phát E; ngân sách entry chỉ tiêu thụ khi thực sự phát. Main và Larger có observer riêng. Khoảng dữ liệu đầu bị thiếu không được dựng lại một C2 đầy đủ.
2. Mỗi channel ghi C1 nguồn, giờ mở/đóng C2 và cực trị P3 thực tế. Handoff phải khớp nguồn, hướng, close C2 và INV. Tooltip phân biệt FROM C2, LOCAL C3, LOCAL TRACK; các TS mới trong C3/C4+ không bị gọi nhầm là TS đã tạo C2. Không tự hết hiệu lực chỉ vì C3 đóng; vẫn có barrier và ngân sách riêng.
3. Bias cấu trúc vẫn là hướng tham chiếu. CRT cha còn hiệu lực và key chưa bị close HTF phá mới là bối cảnh đủ điều kiện: Main ưu tiên Larger, rồi CRT trên Bias TF; Larger tham chiếu CRT Bias TF nếu cao hơn. FLOW là theo bias chưa xác minh được continuation lồng; CONT cần CRT cha đồng hướng, child xác nhận sau parent và local key. KEY REV/HTF KEY REV hoặc COUNTER SWING cần key bối cảnh và local reaction, đồng thời quyền CRT reversal. B0 vẫn chặn entry. Không biến mọi bất đồng khung thành một lệnh ngược hướng hoặc tự sửa bias tổng.
4. Khi một TS đóng, đóng băng key HTF ngược hướng gần nhất đang nằm phía trước và trước TGT range, trong các nguồn H1/main/larger/bias đã hoàn tất. Key phải đã biết lúc TS; theo Key types. Khi giá tới mức này, ghi KEY DELIVERED và dừng entry hồi của leg đó. MPS quan sát vẫn có thể được xác nhận trên cùng nến; không coi chạm key là chắc chắn đảo chiều. Muốn giao dịch tiếp cần phản ứng TS/key mới, không hồi sinh MPS cũ. C1 range target và INV vẫn riêng, không bị thay bằng key trung gian. Ngưỡng và chính sách dừng này là quy ước triển khai cá nhân, cần kiểm chứng tiếp.
5. Structure timeframe chỉ thêm một input, mặc định Chart. Chọn M15 trên M1/M3/M5 để dùng pivot M15 đã xác nhận trước nến entry, và chỉ close M15 mới xác nhận MPS. Nguồn dùng lookahead_off, cache chỉ nhận khi source end <= chart close, không lặp close cũ; các cập nhật source realtime chưa đóng bị bỏ qua. TS/FVG/OTE thực thi trên khung chart. M15 mở trực tiếp cũng được hỗ trợ. MPS dùng M15 không được đánh dấu sớm bằng close M5. Chưa phải một engine entry M5 tự động chạy khi đang mở chart M15.

Các điều kiện khác vẫn hữu hạn: pivot 2/2, chờ 36 nến chart, pool key và 600 nến nguồn. Chưa có danh mục PDL/PDH/WCP/weekly close độc lập; giá trùng một key cơ học không đồng nghĩa đã phân loại đúng mức thủ công. Không thêm POC/FRVP hoặc bộ giờ ICT. Các alert là snapshot; cần tạo lại nếu muốn dùng phiên bản mới.

Kiểm tra bổ sung: tests/crt-fractal-workflow.cjs dùng thân hàm nguồn cho Buy/Sell đối xứng, C2 không E vẫn giữ MPS tới close, nguồn sai bị loại, vai trò bias/parent, key trung gian và TS mới sau delivery, source close M15/cache, 24 prefix bất biến. Cộng với bộ trước là 25 suite; đây không phải market Replay hoặc chứng nhận lợi nhuận.

[Nghiệm thu tích hợp 5 bước](research/crt-five-step-validation-2026-11-25.json): exact-source Pine không lỗi/cảnh báo; chạy thử native nguồn M15 trên M5 và M15 trực tiếp. Bản cuối đã thay riêng TFA trên Brave, giữ Daye Quarterly Theory; chart H2/M5, Structure M15, TS close đã hiện KEY DELIVERED. Đây là smoke test; không chứng minh mọi ví dụ hoặc mọi tín hiệu thị trường đều đúng.

## Quy tắc hiện hành sau rà soát nhiều thị trường — 25/11/2026

Phần này thay thế chính sách KEY DELIVERED và chuẩn counter ở đợt 5 bước phía trên. Đây là quy ước mã hóa cá nhân, không gán là công thức nguyên văn của Romeo.

1. Key ngược hướng gần nhất được đóng băng khi TS đóng là cản quan sát, không phải target CRT hoặc điều kiện kết thúc leg. Chỉ xét chạm ở nến sau TS close, lưu thời điểm chạm trong tooltip WHY/entry. Không xóa MPS/P1/P2, không khóa entry hồi và không cấp lại ngân sách nhánh chỉ vì chạm cản này. INV/TGT thực, mất key, mất nguồn, hết thời gian chờ 36 nến và ngân sách TS/FVG/OTE vẫn có hiệu lực.
2. Counter bias hoặc qualified parent vẫn cần key bối cảnh có trước C2 và key phản ứng ở P3. Bổ sung thứ tự P1 < P2 < P3 <= TS confirm, quét giá P1 tối thiểu một tick và close reclaim P1. TS chỉ từ hai nến liền kề thiếu cặp swing không đủ counter. Áp dụng cả direct Early, nhánh theo dõi Early, main và higher. Flow cùng hướng vẫn cho TS close độc lập; MPS bắt buộc cho OTE, không bắt buộc cho mọi TS/FVG.
3. Key kind 6 là midpoint râu của tuần đã đóng: lower = (low + min(open, close))/2, dir Buy; upper = (high + max(open, close))/2, dir Sell. Râu phải dài hơn một tick. knownAt là weekly close, anchor là weekly open; request W1 dùng snapshot [1] + lookahead_on. Không dùng high/low/close tuần đang chạy. Key tuần được ghép vào model references và execution snapshots sau offset của nguồn local, tránh chậm thêm một nến hoặc lùi hai tuần. Key bối cảnh ghi beforeTime đúng đầu C2. Một key chỉ usable nếu knownAt <= thời điểm trước raid.
4. Kind 6 là mức phản ứng, không phải thanh khoản ngoài range: chạm midpoint và close reclaim mức. Kiểm tra giữ reclaim bằng H1 close đã hoàn tất sau phản ứng; local proof bị mất sẽ latch như các key khác. Danh mục giữ hai mức của tuần đóng gần nhất, không hồi sinh mức tuần xa hoặc dùng SMT thay price key. All bật kind 6; Weekly wick chỉ giữ kind 6; các lựa chọn lọc cũ không tự bật nó.
5. Nhãn key ngắn WW-L50/W1 và WW-H50/W1. Chi tiết loại/giá/knownAt/touchAt của cản nằm trong tooltip, không thêm bảng hoặc chữ dài phủ chart. Màu/size/anchor tam giác giữ nguyên. Không đổi bias thành đối hướng theo một nến live, không chọn công thức riêng cho XAUUSD.

Kiểm tra: tests/crt-weekly-and-counter.cjs chạy thân hàm nguồn cho công thức wick, candle màu ngược, không râu/không close, key tương lai, counter có/không swing, counter parent, Early có cấu trúc, cản trên nến TS và OTE sau cản; 24 immutable prefixes đối xứng. tests/crt-cross-market-audit.cjs bảo vệ hành vi chẩn đoán nhiều nhánh. Chưa phải dữ liệu thị trường hoặc chứng minh độ chính xác setup trong ảnh.
