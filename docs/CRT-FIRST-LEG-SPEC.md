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

FVG/OB/open-close bị loại khi có close HTF vượt mép xa ngược hướng, hoặc quá 48 nến nguồn; râu chạm không tự xóa vùng. Swing bị loại khi đã bị lấy. Pool vùng tối đa 40; snapshot giữ hai mức gần nhất mỗi loại/hướng. Key bối cảnh của attempt phải được biết **không muộn hơn lúc C2 mở**, bao gồm key vừa xác nhận khi C1 đóng. Không bắt mọi key phải tồn tại từ trước C1 mở.

Key bối cảnh Main lấy cùng HTF và từ Bias TF; Larger có bộ riêng; Early lấy key cùng HTF từ C1 đã hoàn tất. Ngoài bối cảnh này, mỗi TS/P3 có bộ kiểm tra vị trí trực tiếp riêng bên dưới. SMT hiện chỉ xét raid range của hai nến liền kề, không dò đầy đủ SMT giữa mọi swing/FVG và không tự chọn mã tương quan. Cặp khác session hoặc thiếu dữ liệu không được xác nhận SMT.

## Ba nhánh song song

| Nhánh | Điều kiện tam giác trên nến entry đã đóng |
| --- | --- |
| TS_CLOSE | Khi có cặp P1→P2 đã xác nhận trước raid, dùng biên P1 để nhận sweep/reclaim và close ngược màu. Nến này được phép engulf cả nến liền trước; nến liền trước không tự là toàn bộ range CRT. Nếu chưa có cặp cấu trúc hợp lệ, giữ detector TS hai nến như fallback, không suy ra MPS từ fallback đó. Tam giác đặt tại chính nến sweep/reclaim đã đóng, không chờ MPS/retest. Chưa phải bộ nhận diện Model 1 nguyên bản đầy đủ. |
| TS_FVG | Sau TS, hình thành gap ba nến LTF. Chỉ nến sau lúc gap đã biết mới được retest; cần chạm vùng và close phản ứng ra ngoài mép gần. Có thể trước MPS. Vùng không vẽ lên chart. |
| MPS_OTE | Sau TS, close vượt pivot cấu trúc LTF đã xác nhận trước TS và thuộc thời gian C1 trở đi. Sau MPS, theo dõi endpoint toàn bộ leg đầu từ râu TS. Entry là nến phản ứng vùng hồi 50–80% đã biết trước nến đó; không cần TS thứ hai. Không vẽ fibo. |

MPS chỉ được xác nhận khi TS/P3 trực tiếp phản ứng tại key HTF hợp lệ, không chỉ vì CRT cha từng ở key. MPS dùng cặp pivot 2/2 có thứ tự trước raid: Sell là high P1 rồi low P2; Buy đối xứng. Cặp được ghi nhận khi quét P1; trước lần reclaim đầu có thể chuyển sang cặp mới đã hoàn tất. Sau reclaim đầu, giữ P1/P2 qua các nhịp quét lại cùng sóng: thay cực trị TS khi reclaim lại, không đổi P2 sang pivot nội bộ hoặc đáy/đỉnh vừa tạo sau TS. Close đầu tiên vượt P2 mới xác nhận MPS. Vẫn là quy ước cơ học, chưa nhận diện hoàn chỉnh mọi cấu trúc discretionary hay một engine M15 riêng. Main/Larger thực thi trên chart M1/M3/M5; chưa khẳng định tái tạo mọi dấu trong bảy ảnh.

OTE không dùng riêng râu nến kích hoạt MPS. Endpoint cập nhật từ các nến đóng sau đó, rồi đóng băng khi nhánh OTE đã dùng. Nến vừa tạo endpoint mới không được đồng thời dùng vùng tính lại để phát OTE vì OHLC không biết thứ tự intrabar. Nhịp chờ giữ tối đa 36 nến LTF từ raid và từ TS. Trước MPS, quét thêm cực trị TS có thể tạo attempt reclaim mới trên cùng P1/P2; sau MPS, mất cực trị TS thì bỏ cặp. Một close mở rộng xa khỏi P1 quá một khoảng |P1−P2| cũng giải phóng cặp cũ, tránh giữ sóng từ nhiều giờ trước rồi bỏ qua sóng mới. Ngưỡng một range này là quy ước triển khai cá nhân, không gán cho Romeo; nó không tự hủy CRT HTF hoặc thay INV/TGT của context.

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
