# TFA v6 — model HTF tự nhận diện, hiệu lực và entry LTF

Nguồn hiện hành: `indicators/funded-angler-v6.pine`, đồng bộ sang `chibao.txt` bằng `node tools/sync-indicator.cjs`. Bản v5 giữ nguyên để đối chiếu; đây là thay đổi chỉ báo, không tự tick checklist web hoặc ghi PnL.

[Hướng dẫn toàn bộ setting và cấu hình khởi đầu](INDICATOR-SETTINGS.md). Chữ chart mặc định Normal (trước đây Tiny), dashboard Small (trước đây Tiny), có tùy chọn kích thước riêng trong Display. Inputs có tooltip tiếng Việt để tra trực tiếp.

## 1. Neo hình vẽ vào biểu đồ

- `overlay=true, scale=scale.none`: dùng thang giá chart hiện có, không tạo một trục giá mới.
- Range, ERL, CP và vùng IRL dùng **chỉ số nến thực + giá OHLC thực**, `xloc.bar_index`, `extend.none` và `force_overlay=true`. Trên HTF, tìm đúng nến nguồn bằng timestamp; trên LTF, bắt đầu tại nến xác nhận điều kiện, không kéo ngược về trước tín hiệu. Không quy đổi giá sang pixel/phần trăm màn hình.
- Đường/vùng chỉ kéo tối đa số nến HTF đã chọn (mặc định 3), đồng thời kết thúc trước cụm HTF bên phải. Nhãn nằm bên phải điểm kết thúc, cách 1 bar, trong khoảng dành riêng trước cụm HTF. Khoảng này tăng theo cỡ chữ, tính theo bar chart; khi zoom ngang quá nhỏ vẫn có thể cần tăng offset/giãn chart để đủ chỗ theo pixel. Neo quá giới hạn lịch sử tọa độ của Pine được ẩn thay vì dịch sai sang nến khác.
- Các reference trùng giá (chênh dưới nửa tick) gộp một line và nhãn, ví dụ `RH / INV` hoặc `CP / ERL-`; không dịch mức giá để né chữ. Khi trùng mức, màu ưu tiên SL → INV → CPe → CP → các mức context. Tên model nằm ở panel/cụm HTF thay vì lặp trước RH.
- Cụm HTF bên phải là hình chiếu có chủ đích: X theo `bar_index + offset` (độ rộng tính bằng số bar), Y là OHLC thực của model được chọn. Zoom ngang thay đổi độ rộng giống nến chart, zoom dọc thay đổi theo thang giá chung.
- Sau khi thay code, **xóa instance cũ rồi thêm lại**. Pine không ghi đè toàn bộ cấu hình scale mà người dùng đã lưu. Nếu vẫn tách thang giá, dùng menu của chỉ báo → **Pin to scale → cùng scale với symbol**, không tạo scale mới. Kiểm tra cả trục giá và tùy chọn autoscale của chart.

TradingView mô tả `scale.none` với overlay là dùng scale chart hiện có; `scale.left/right` tạo scale riêng. Các thuộc tính khai báo có thể cần thêm lại script mới có hiệu lực: [visual scale](https://www.tradingview.com/pine-script-docs/visuals/overview/), [declaration settings](https://www.tradingview.com/pine-script-docs/language/declaration-statements/).

Nếu indicator đang được ghim vào **No Scale** trong giao diện TradingView, code không tự thay được lựa chọn đó. Chọn cùng scale với symbol theo [hướng dẫn indicator di chuyển tách khỏi giá](https://www.tradingview.com/support/solutions/43000775579-indicator-moves-separately-or-is-not-attached-to-the-price/).

## 2. Cùng engine trên HTF và LTF

Chỉ chọn **HTF H1/H2/H4/D1**, không chọn phương pháp. Chart nến tiêu chuẩn được phép bằng HTF hoặc nhỏ hơn và độ dài chart TF phải chia hết HTF; M1/M3/M5 nhỏ hơn HTF mới phát tín hiệu entry.

Engine registry chạy **trong chính HTF đã chọn**. Nó không dùng pivot, high/low hoặc số bar của chart LTF để tạo/hủy model HTF. Trên chart HTF dùng kết quả hiện tại khi nến đã đóng, kết quả trước khi nến còn chạy. Trên LTF dùng snapshot scalar của HTF đã đóng, offset từng trường một bar và `lookahead_on`. Không dùng `barstate.isconfirmed` bên trong request để giả lập xác nhận HTF.

Với cùng symbol, session và lịch sử đã tải, snapshot sau khi H1 đóng là snapshot được LTF đọc từ đầu H1 tiếp theo. Alert LTF vẫn chờ bar LTF đóng. Không phải model khác chỉ vì chuyển khung. Nến live chỉ đi vào preview, không đi vào registry.

## 3. Tự nhận diện và ưu tiên

| Model | Nhận diện trên nến HTF đã đóng | Hướng / hiệu lực |
| --- | --- | --- |
| CRT/TS | C2 quét một mức C1 hoặc SSL/BSL tay, reclaim mức và đóng trong C1; loại quét hai biên C1 | Hướng từ TS; INV tại cực trị sweep; CP tại biên đối diện C1. |
| EGF | Hai nến khác màu, C2 bao trùm thân C1, ít nhất một biên thân mở rộng | Hướng hình thái theo nến bao trùm; bias vẫn được xét riêng. Range là union C1–C2. |
| OUT | C2 bao trùm High–Low C1 | Đóng ngoài C1 có hướng theo phía đóng. Nếu chỉ bao trùm nhưng đóng trong range thì giữ neutral, chờ TS hoặc break của range model. |
| ISB | C2 nằm trong High–Low C1, ít nhất một biên hẹp hơn | Neutral khi còn nén. Giữ mother đầu tiên trong nested compression; chỉ có hướng sau TS quanh mother hoặc close phá mother. |

Một cặp nến có thể mang nhiều cờ. Không tạo hai bản ghi trùng cặp. Ưu tiên hình thái trong cùng cặp: **CRT/TS → Inside compression → EGF/OUT**. Ví dụ Inside + body engulf vẫn là nén trong mother, có nhãn phụ `/E`; không vội coi là breakout. Đây là quy tắc triển khai rõ ràng, không phải xếp hạng tỷ lệ thắng.

Model khác cặp được đưa vào hàng đợi theo thời gian xác nhận. **Model còn hiệu lực xuất hiện trước đứng #1**, dù model mới hơn thuận bias hơn. #1 được vẽ rõ; hai model mới hơn #2/#3 hiện mờ nếu bật. Phần còn lại vẫn ở registry chờ, số lượng hiện cạnh tag trong panel. Khi #1 kết thúc, model cũ nhất còn sống tiếp theo được đẩy lên; không chọn lại theo nến mới nhất.

Mặc định không tự hết hạn sau 3 bar. Có thể đặt `Model expiry > 0`. Model kết thúc khi:

1. HTF đã đóng xác nhận INV theo **Close** mặc định, hoặc theo Wick nếu chủ động đổi.
2. Một bar HTF sau thời điểm tạo model chạm CP đã xác lập.
3. Hết hạn nếu đã bật expiry.
4. Model neutral quét cả hai phía rồi đóng trở lại range, không có hướng rõ.

Nếu cùng bar thỏa INV và CP, ghi mơ hồ về thứ tự; không tính thắng/thua. LTF có thể thấy mức bị chạm trước HTF đóng: chặn E sau CP touch ở LTF, nhưng không tự thay registry HTF trước xác nhận. `CP?` là trạng thái chờ xét trên HTF, không phải Full TP thật.

INV dùng điều kiện vượt mức (`<`/`>`), không hủy model chỉ vì bằng đúng mức. Đây là hiệu lực cấu trúc, không phải mô phỏng SL của một lệnh.

## 4. IRL và ERL tự tìm

- **ERL+ / ERL−:** pivot HTF đã xác nhận, còn chưa bị giá lấy, nằm ngoài range model. Chọn mức gần nhất ở mỗi phía. Pivot mặc định cần 2 bar trái/2 phải; chỉ biết tại bar xác nhận, không có tín hiệu tại quá khứ.
- **CP của EGF/OUT hoặc ISB breakout:** mức ERL thật theo hướng kịch bản, không tự phóng measured move. Nếu chưa có mức phù hợp thì để trống và không phát E cần R:R.
- **IRL/FVG:** tìm gap ba nến HTF còn chưa lấp hết, nằm trong range và phù hợp hướng model. Ưu tiên FVG; nếu không có và đã bật, tìm OB candidate cơ học.
- **OB?** là vùng open–wick của nến đối hướng trước một close vượt High/Low nến đó. Nhãn có `?` vì đây là định nghĩa candidate hẹp, không khẳng định mọi vùng đó là OB chất lượng theo cách đọc cá nhân.
- Zone đã chọn được giữ tới khi full fill; khi đổi sang zone khác, LTF phải ghi nhận chạm lại zone mới. Không mang trạng thái “đã chạm IRL” từ zone cũ sang zone mới.
- Không có FVG/OB hợp lệ thì hiện `-`, không dùng EQ để lấp chỗ trống. EQ, POC và IRL không đồng nghĩa. POC vẫn nhập từ FRVP thực tế nếu chọn entry POC.

CP được giữ sau khi xác lập; ERL context có thể cập nhật khi swing bị lấy hoặc có pivot mới xác nhận. Chạm reference không xác nhận lệnh thật đã khớp.

## 5. Bias riêng

Mặc định **Auto**, khung tham chiếu D1, có thể chọn khung khác >= HTF:

- Sweep Low một phía rồi đóng trong range trước → bias Long.
- Sweep High một phía rồi đóng trong range trước → bias Short.
- Close vượt High/Low range trước → bias theo phía close.
- Outside quét hai phía và đóng trong range trước → neutral.
- Nếu chưa có sự kiện mới, giữ bias tối đa số bar tham chiếu đã chọn (mặc định 3), rồi neutral.

Đây là bias cấu trúc theo dữ liệu đã đóng, không suy ra từ màu nến đang chạy hoặc giờ QT. Bias không tự đảo hướng model, không làm model mới chen lên trước model cũ. Mặc định E cần bias cùng hướng; neutral/counter-bias vẫn vẽ bức tranh HTF nhưng không phát E. Có thể tắt filter hoặc dùng override Long/Short/Neutral một cách chủ động.

## 6. Tín hiệu LTF theo model

`Auto` là mặc định; không bắt buộc thêm line hoặc POC tay để script hoạt động.

| Model #1 | Điều kiện Auto LTF |
| --- | --- |
| CRT/TS, hoặc model đã resolve bằng TS | CISD **hoặc** MSS sau xác nhận HTF. |
| EGF/OUT có hướng | Đã chạm IRL HTF hiện hành và đóng trở lại phía hướng tới ERL/CP; sau đó có một xác nhận C hoặc M, hoặc retest FVG/OB LTF hình thành trong pha phản ứng. Không đánh dấu nhịp hồi vào IRL như entry ngược hướng. |
| ISB breakout | Đã retest biên mother bị phá; có CISD/MSS hoặc retest FVG LTF. |
| ISB/OUT chưa có hướng | Quan sát, không entry. |

CISD là biến thể close qua open đầu chuỗi nến đối hướng; MSS là close qua pivot đã được xác nhận và biết khi kích hoạt theo model. Trong hệ thống này chúng chung vai trò xác nhận đổi hướng, nhưng dùng hai hình thái/mức khác nhau; không bắt buộc đồng thời. FVG LTF phải hình thành sau kích hoạt; retest ở bar sau khi gap đã biết. OB LTF là candidate sau CISD cơ học. Các điều kiện cụ thể cần người dùng kiểm chứng với cách đọc cá nhân.

E cần bar đóng, CP/SL hợp lệ và R:R tối thiểu theo giá close tham chiếu (mặc định 2), bias phù hợp nếu bật, time gate nếu bật. Không phát E trên bar đã chạm SL tham chiếu hoặc sau khi LTF đã thấy CP bị chạm. Một E cho mỗi model/revision, kể cả nếu primary được đọc lại. Script không gửi lệnh, ghi fill, PnL, partial exit hoặc BE tự động.

Các lựa chọn entry riêng CISD/MSS/FVG/OB/POC/BL vẫn có thể ghi đè Auto. Override CP/SL chỉ ảnh hưởng kế hoạch E, không sửa định nghĩa hiệu lực của model HTF trong registry. Khi có override, vẽ riêng `CPe`/`SL`; `CP`/`INV` vẫn là reference cấu trúc của model.

## 7. Cụm nến và nhãn

Cụm nến dùng **C1/C2 của model #1**, không phải luôn hai nến HTF gần nhất. CRT/EGF giữ C3 đầu tiên sau khi model hình thành. Model đang nén/neutral để C3 trống tới khi resolve; khi resolve thì dùng chính nến TS/BR làm nến thứ ba. `N*` là nến HTF hiện tại còn chạy, có thể hiện thêm ở bên phải; màu/thân/râu đều dùng giá thật. Countdown đổi khi có tick.

OHLC live được gom từ nến chart đang mở theo `time(HTF)`: open của bar đầu, high lớn nhất, low nhỏ nhất và close mới nhất. Chỉ hiển thị preview nếu có dữ liệu từ đúng đầu bucket HTF, tránh vẽ một nến thiếu đầu lịch sử như nến đầy đủ. Cache các bucket đã hoàn tất được đối chiếu theo timestamp để vẽ C1/C2/C3; khi không có cache đầy đủ, dùng OHLC HTF đã xác nhận. Tooltip caption ghi timestamp, O/H/L/C và nguồn dữ liệu để đối chiếu trực tiếp.

Nhãn chart: `CRT`, `TS`, `EGF`, `OUT`, `ISB`, `BR`, `RH/RL`, `EQ`, `ERL+/−`, `CP`, `INV`, `FVG`, `OB?`. LTF: tam giác **Tiny** xanh hướng lên nằm dưới nến Buy, đỏ hướng xuống nằm trên nến Sell; dùng trực tiếp `yloc.belowbar/abovebar`, không offset bằng ATR/giá. Chữ rời `BUY C`, `SELL M`… ghi hướng entry và xác nhận C/M/F/O/BL/P. `C`, `M` là xác nhận tham khảo theo hướng model HTF, mặc định tắt; khi bật ghi rõ `B C`, `S M`, chọn một loại duy nhất; nếu cùng nến ưu tiên C trừ khi chọn riêng MSS. Nhãn viết tắt B/S là xác nhận sơ bộ chưa qua đầy đủ gate entry; nến hồi xanh không tự biến xác nhận của model giảm thành Buy. Phía Buy luôn dưới nến, phía Sell luôn trên nến, không phụ thuộc màu thân nến. Nếu cùng nến đủ entry, chỉ vẽ entry. Tooltip phân biệt confirmation với entry. Chữ theo màu foreground chart để đọc được trên nền sáng/tối; dấu và chữ được xóa cùng nhau theo giới hạn lịch sử. Nhãn ngắn không có nghĩa đã vào lệnh thật.

Râu nến HTF dùng line solid mảnh **1 px**, cùng một màu foreground của chart giảm nhẹ độ đậm cho cả nến tăng/giảm. Độ rộng thân lẻ được làm tròn xuống số chẵn để trục râu ở đúng giữa thân. Thân và râu giữ nguyên OHLC, không thay đổi phép tổng hợp nến.

Trong **5. Display → Signal history: latest marks (0 = hide)**, chọn số dấu gần nhất cần giữ: mặc định **1**, tối đa 100; 0 ẩn toàn bộ dấu tín hiệu lịch sử. Dấu cũ nhất được xóa trước. `Buy / Sell triangles` mặc định bật, dấu C/M và model phụ mặc định tắt.

Khi bật C/M, chỉ giữ **một line CISD hoặc MSS** cho lượt xác nhận hiện hành, giữ nguyên giá tại xác nhận, bắt đầu tại `bar_index` nến xác nhận và kéo tối đa horizon. Chọn loại đủ điều kiện bối cảnh xuất hiện trước; cùng nến ưu tiên CISD, trừ khi chọn riêng MSS. Chúng không phụ thuộc checkbox hiển thị range HTF; tuổi line tính từ bucket xác nhận, reset khi model/revision đổi. Không vẽ đồng thời cả hai mức C và M. Khi entry đủ gate dùng C hoặc M, chỉ giữ mức khớp loại entry đó. Bật/tắt C/M không thay logic E hoặc alert và không quyết định có được hiện mức HTF hay không.

Nhãn giá được giãn theo thứ tự giá với khoảng cách dựa dải giá các nến đang nhìn/cỡ chữ. Nếu chữ dịch khỏi mức giá, đường dẫn chấm nối về giá thật; các đường ngang và giá cấu trúc không dịch. Nhãn chữ có nền trong suốt, không có mảng trắng phía sau; chữ IRL chuyển từ trong box sang cột nhãn. Không thể khẳng định không chồng lấn ở mọi mức zoom/scale vì Pine không cung cấp kích thước chữ hay thang giá pixel. Cần kiểm chứng trực tiếp bản này trên chart; các test Node chỉ kiểm tra công thức sắp xếp/neo/mức hữu hạn.

`Hide drawings without a recent signal` mặc định bật. `Drawing horizon / recency (HTF bars)` mặc định **3**, có thể chọn 2 hoặc giá trị khác từ 1–12. Dấu LTF quá tuổi này bị xóa. Model HTF mới xác nhận hoặc mới resolve trong cửa sổ này được coi là tín hiệu cấu trúc gần nhất trên cả HTF/LTF. Trên LTF chưa có C/M/E, các mức RH/RL/EQ/INV/CP/ERL và IRL lấy điểm bắt đầu tại nến LTF đầu tiên nhận model; nếu có dấu C/M/E của model hiện hành, dùng nến tín hiệu đó. Nhờ vậy tắt C/M không làm mất tổng quan HTF trước entry. Không có model/tín hiệu tương ứng còn gần thì không vẽ phần đó; không dựng ERL khi chưa có swing hợp lệ. Tuổi LTF tính theo bucket HTF thực đã đi qua, không theo số giờ nghỉ cuối tuần.

Các setting này chỉ giới hạn hiển thị, không đổi tính toán, cảnh báo hoặc thứ tự model còn hiệu lực. Model cũ còn hiệu lực vẫn được ưu tiên trong registry, nhưng hình có thể bị ẩn do quá cửa sổ gần nhất. `Model expiry` là setting riêng về hiệu lực; mặc định vẫn không tự hết hạn. Tắt chế độ gần nhất để xem lại hình cũ, tăng số dấu lịch sử nếu cần.

Thời gian giữ cùng 10 macro và các quý Daye intraday của web. Panel dùng giờ hiện tại khi realtime; gate E dùng đúng timestamp bar entry đóng, khoảng cuối loại trừ. QT/TO không tự tạo bias hoặc model. Giá TO chỉ lấy nếu có bar mở đúng mốc, không tự bù dữ liệu.

## 8. Giới hạn phục hồi và kiểm tra

Registry được khôi phục trong cửa sổ thời gian xác định bởi `last_bar_time − scanDepth × độ dài HTF`, mặc định 1000 khoảng lịch HTF; đây không phải chính xác 1000 nến giao dịch khi có cuối tuần/nghỉ. Cả hai chart phải tải đủ lịch sử bao phủ cửa sổ này; `HIST` báo thiếu. Reference pool cũng bị giới hạn cùng cửa sổ. Model ra ngoài cửa sổ sẽ không được giữ khi phục hồi. Không thể hứa phục hồi model từ lịch sử chưa tải.

Tối đa 12 model mặc định, 16 nếu tăng; 80 swing và 60 zone. Khi hàng đợi đầy, **bỏ model mới**, không xóa model cũ còn hiệu lực; panel có dấu `+` để báo đã có bỏ qua. Model thứ 4 trở đi chưa được vẽ riêng, vẫn được xét khi model trước kết thúc.

Kiểm tra Node thực thi các công thức lấy từ Pine và một acceptance specification độc lập cho hàng đợi, hiệu lực, nested mother, merge, IRL/ERL, projection HTF/LTF. **Đây không phải Pine interpreter hoặc kiểm thử tương tác TradingView.**

Bản hiện tại với line CISD/MSS riêng, sắp xếp nhãn, tam giác Tiny và râu HTF 1 px đã qua kiểm tra Node: mức xác nhận được chụp cố định, điểm bắt đầu/horizon riêng, khoảng cách nhãn, ánh xạ Buy/Sell sang belowbar/abovebar và tâm râu khi độ rộng yêu cầu là chẵn/lẻ. Pine Editor tạm đã nhận đúng source mới và trả `success: true` từ chẩn đoán `translate_light`; các lần dán thất bại trước đó không được tính là kiểm tra cú pháp. Chưa kiểm chứng hình thực tế của bản này trên chart.

Riêng bản sửa mới nhất để mức HTF hiện trước C/M/E đã qua các fixture: có model gần nhưng chưa có dấu, có dấu gần thay neo, không có model và model quá tuổi. Lần thử editor cho thay đổi này không nhận thao tác dán nên chưa có chẩn đoán cú pháp mới; kết quả `success: true` trên là của phiên bản trước khi đổi điều kiện hiển thị reference.

Đã mở Pine Editor công khai trong phiên trình duyệt tạm, dán đúng source TFA v6 và nhận chẩn đoán editor `success: true` từ `translate_light` (dữ liệu variables/functions/types/scopes). Đây là kết quả chẩn đoán cú pháp/editor, **không phải xác nhận script đã chạy trên chart**. `Add to chart` yêu cầu đăng nhập; không đăng nhập, lưu/phát hành hoặc đặt lệnh. Cần tiếp tục Add to chart và Bar Replay trong tài khoản của người dùng, kiểm tra trực tiếp zoom/pan/scale sau khi thêm lại indicator. Chưa xác nhận lợi thế thống kê.

Thứ tự kiểm tra thực tế: thêm mới trên H1/HTF H1 → xác nhận #1/IRL/ERL → chuyển M5 cùng symbol/HTF → đối chiếu timestamps C1/C2/C3 và model #1 → replay overlap/INV/CP → kiểm tra C/M/E → thử zoom/pan và scale. Chỉ tạo lại alert sau khi cập nhật code/input; alert cũ giữ snapshot cũ.

Nguồn kỹ thuật: [HTF requests](https://www.tradingview.com/pine-script-docs/concepts/other-timeframes-and-data/), [bar states](https://www.tradingview.com/pine-script-docs/concepts/bar-states/), [objects](https://www.tradingview.com/pine-script-docs/language/objects/). Các quy tắc chọn model/bias ở đây là đặc tả triển khai cá nhân, không phải cam kết xác suất hoặc một bộ luật duy nhất của ICT.

Nhãn tín hiệu dùng ASCII để giảm phụ thuộc ký tự/font: entry `BUY C`/`SELL M`, xác nhận sơ bộ `B C`/`S M`. Mọi tam giác cùng quy tắc Buy xanh (lime), Sell đỏ, cỡ Tiny; loại tín hiệu phân biệt qua nội dung chữ và tooltip, không dùng màu cam/teal cho C/M. Nguồn giữ UTF-8 để tooltip tiếng Việt có đầy đủ dấu. Chưa xác nhận lỗi font trên chart thực tế; kiểm tra mã hóa không thấy ký tự thay thế hoặc ký tự zero-width.

## EGF: pha hồi IRL và pha đi tới ERL

Kiểm tra cho bản sửa này: Node thực thi các công thức điều kiện theo fixture EGF tăng/giảm, chưa chạm/đang trong/vượt IRL, mục tiêu sai phía/thiếu mục tiêu, override không bỏ qua pha phản ứng, chọn một C/M và tag đúng mode. Đã thử Pine Editor tạm nhưng editor không nhận thao tác dán ở lần này; chưa có chẩn đoán cú pháp mới hoặc kiểm chứng chart/Replay cho thay đổi pha EGF. Các kết quả editor `success: true` nêu ở trên thuộc bản trước.

EGF/OUT có hướng (không phải nhánh resolve bằng TS) chỉ tìm entry cùng hướng kịch bản sau phản ứng IRL:

| Kịch bản | Điều kiện trước xác nhận/entry | Hướng và đích |
| --- | --- | --- |
| EGF tăng | Có bar LTF thật sự chạm vùng IRL được chọn, sau đó close trên biên trên IRL; CP cao hơn giá và vùng IRL | Buy tới ERL+/CP |
| EGF giảm | Có bar LTF thật sự chạm IRL, sau đó close dưới biên dưới IRL; CP thấp hơn giá và vùng IRL | Sell tới ERL-/CP |

Giá mới đi về phía IRL chưa phải entry. Giá đã ở xa IRL nhưng chưa quan sát được lần chạm sau kích hoạt model cũng không được suy ra là đã phản ứng. Nến chạm và đóng trở lại đúng phía trong cùng bar có thể hợp lệ; đây là dữ liệu OHLC đóng nến, không xác định thứ tự tick nội bộ. Không ép đảo hướng chỉ vì giá đang hồi hoặc bias ngược; bias vẫn là gate riêng. Thiếu IRL hoặc CP hợp lệ thì chờ.

Nếu đã chạm rồi đóng vượt biên xa của vùng (Buy: dưới đáy IRL; Sell: trên đỉnh IRL), khóa lượt phản ứng IRL đó trên LTF. Chỉ reset khi vùng được chọn/model thay đổi. Đây là khóa entry LTF, không tự hủy registry HTF trước khi HTF đóng. Nếu ERL/CP đã bị lấy, không phát xác nhận mới để đuổi giá.

MSS lấy lại pivot LTF đã biết tại lần chạm IRL. FVG/OB LTF cũ trước pha chạm được bỏ; FVG mới cần ba nến từ pha chạm trở đi và retest ở bar sau. Các mode CISD/MSS/FVG/OB/POC/Line chọn riêng vẫn phải qua điều kiện phản ứng IRL của EGF; chúng không cho phép bỏ qua pha này. Một E cho model/revision vẫn giữ nguyên, không tự tạo thêm lệnh khi đổi vùng. Panel S: IRL WAIT = chưa chạm; IRL = chờ đóng ra đúng phía; IRL X = vùng bị đóng xuyên trên LTF.

CISD/MSS chung vai trò xác nhận trong quy trình, nhưng không đổi công thức thành cùng một phép đo: C là close vượt run-open đối hướng; M là close vượt pivot đã xác nhận. Chỉ một xác nhận sơ bộ cho mỗi lượt; nếu cả hai cùng bar thì ưu tiên C, trừ mode MSS. Nếu entry C/M đủ gate xuất hiện sau xác nhận sơ bộ, line hiện hành chuyển sang loại của entry và xóa loại còn lại. Confirmation chưa qua gate bias/R:R/time không phải lệnh thật. Không thêm ngưỡng displacement chưa được đặc tả/backtest.
