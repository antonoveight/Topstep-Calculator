# TFA v6 — context HTF và direction signals

Nguồn: indicators/funded-angler-v6.pine; đồng bộ sang chibao.txt bằng node tools/sync-indicator.cjs. [Hướng dẫn 25 setting và kiểm tra lịch sử](INDICATOR-SETTINGS.md). Bản này thay thế các mô tả trước về EGF ép hướng theo màu nến, box OB/FVG, C/M sơ bộ và R:R tại close tín hiệu.

## 1. Những điều được giữ và được sửa

CRT/TS dùng sweep một phía rồi close reclaim trong C1; không suy ra TS từ râu dài. Inside Bar giữ mẹ đầu tiên khi nén, chưa sweep/break thì không có hướng; close breakout không bảo đảm tiếp diễn. EGF xét thân, OUT xét High–Low; không đồng nhất hai mẫu hoặc giả định có FVG từ hai nến.

Nguồn đối chiếu: [TradingView Inside Bar](https://www.tradingview.com/support/solutions/43000591665-inside-bar-strategy/), [TradingView Engulfing](https://www.tradingview.com/support/solutions/43000583769-bearish-engulfing-recognizing-sellers-taking-over-at-an-uptrend-s-peak/), [Fidelity — xác nhận chart pattern](https://www.fidelity.com/bin-public/060_www_fidelity_com/documents/learning-center/Transcript_Chart-patterns_v2.pdf). Các nguồn củng cố việc phân biệt hình thái, bối cảnh và xác nhận; không chứng minh bộ quy tắc riêng có xác suất thắng cao.

TS trong code là quy ước cá nhân sweep/reclaim C1, không phải toàn bộ quy tắc Turtle Soup gốc. Tài liệu gốc của người dùng có các khẳng định tuyệt đối về ERL/FVG và phần partial/BE không áp dụng vào hệ thống hiện hành.

## 2. Registry và bias

Registry chạy hoàn toàn trong HTF. Mỗi cặp chỉ một model compound: CRT/TS → ISB → EGF/OUT. Model cũ còn hiệu lực được ưu tiên FIFO; đầy 12 thì bỏ model mới, không đẩy model cũ ra. Models to observe = All xuất thêm ba context CRT/EGF/ISB từ model cũ nhất của từng nhóm, xử lý qua ba trạng thái LTF riêng. Bộ lọc một nhóm chỉ bật context nhóm đó. Cụm HTF vẫn dùng model ưu tiên FIFO chung; nó không khóa hai kênh tín hiệu còn lại. Chưa phát đồng thời từ mọi model trong cùng nhóm. Reference pool 80 swing, 60 zone. Recovery 1000 khoảng lịch HTF, không hứa phục hồi lịch sử chart chưa tải; HIST báo thiếu.

CRT có hướng theo sweep. ISB neutral tới HTF resolve: sweep/reclaim một phía hoặc close vượt mother; loại quét cả hai rồi back-in. EGF/OUT có hướng **kịch bản theo bias**, không theo close màu xanh/đỏ; bias neutral thì quan sát, không phát dấu. Hình thái EGF gốc và OHLC C1/C2 vẫn giữ nguyên.

Auto bias dùng close phá swing đã xác nhận trên Bias TF và protected swing theo hướng cấu trúc; không đổi hướng chỉ vì một nến quét hoặc đổi màu, không expire sau ba bar. Snapshot Bias TF chỉ dùng dữ liệu đã đóng. Veto theo close chart xuyên guard ngược hướng sẽ hiện B0!, tạm dừng tín hiệu mà không tự coi D đang chạy đã đảo bias. Manual Long/Short/Neutral vẫn là override. Xem [bias và thời điểm tín hiệu](BIAS-AND-SIGNAL-TIMING.md).

Khi bias đổi, EGF giữ range/C1/C2, reset hướng kịch bản, CP/IRL và revision; không tái dùng trạng thái chạm vùng cũ. Pool có thể chứa IRL hai hướng, nhưng chỉ chọn vùng phù hợp với kịch bản hiện hành; không tạo vùng còn thiếu. Default invalidation là HTF close vượt INV, kết thúc khi bar sau chạm CP, hết timeout hoặc ra ngoài recovery. Timeout mặc định 8 HTF từ bornIndex/C2, 0 tắt; không reset do bias/IRL/resolve. Đây là vòng đời model, không mô phỏng SL/TP của giao dịch thật.

## 3. IRL/ERL và phản ứng

ERL là pivot HTF đã xác nhận, chưa bị lấy, ngoài range; chọn mức gần nhất mỗi phía. CP của EGF/ISB breakout lấy ERL thật, không measured move tự tạo. CP của CRT/TS là biên đối diện của range quét. CP được giữ cho revision; context ERL có thể đổi khi swing bị lấy hoặc có swing mới.

IRL giữ đủ FVG, OB fallback và swing H/L HTF như logic đã có; không loại OB hoặc thanh khoản điểm. Riêng cách vẽ FVG khi mở LTF: gap Bull = Low C3 > High C1, Bear = High C3 < Low C1; box và CE line neo vào timestamp C1 **HTF**, không vào nến LTF hiện tại. Vùng chỉ được biết sau close C3 HTF. OB vẫn neo nến nguồn của OB; swing H/L neo cực trị thật. Hai hướng hiển thị nếu có, * chỉ reference đang dùng theo bias. FVG là một loại IRL, không thay thế mọi thành phần IRL khác. Box entry LTF vẫn được ẩn như trước.

EGF: nhận bias → chọn IRL/ERL → chờ bar LTF thực sự chạm IRL → xác nhận LTF về phía ERL. Nhịp hồi vào IRL không tự tạo tín hiệu ngược bias. Không ép close ra khỏi toàn bộ vùng để được xét; vẫn phải có C/M hoặc retest hợp lệ. Nếu đã chạm rồi LTF close qua biên xa (Buy dưới đáy vùng, Sell trên đỉnh vùng), tạm chặn phản ứng. LTF reclaim có thể hợp lệ trở lại nếu snapshot HTF vẫn giữ vùng; không nhìn trước kết quả HTF close và không tự xác nhận TS HTF khi HTF còn chạy. Nếu CP đã bị lấy thì không đuổi giá. Thiếu bias/vùng/đích thì chờ.

ISB breakout cần retest mother rồi xác nhận LTF. CRT/TS cần xác nhận sau HTF close. C/M là hai hình thái chung vai trò, không hai điều kiện bắt buộc đồng thời. CISD dùng run-open; MSS seed từ pivot đã biết khi kích hoạt, riêng EGF seed lại lúc chạm IRL. Sau đó MSS cập nhật theo pivot mới đã xác nhận có timestamp nguồn từ pha hiện hành trở đi; pivot không tồn tại trước xác nhận và không backdate tín hiệu. Điều này tránh mức cũ đã bị phá làm nhánh MSS bị đứng. FVG/OB retest vẫn tính nội bộ; FVG mới phải hình thành sau pha kích hoạt/chạm và retest ở bar sau. Fresh reaction cho phép một E mỗi phản ứng hợp lệ; One per model giữ giới hạn một E/revision. State CRT/EGF/ISB không chia sẻ sent/IRL/MSS/FVG/OB. CP taken là cờ sticky theo revision, không reset chỉ vì có pullback mới. Người dùng tự chọn entry, không min R:R theo close tam giác và không có partial/BE tự động.

History mặc định giữ 100 tam giác, tối đa 200, tách hoàn toàn việc xóa theo tuổi của line. Latest vẫn chỉ giữ 1 và áp recency nếu bật. Hiding/retaining marks không sửa gate tín hiệu. Dashboard N đếm theo root CRT/EGF/ISB trên dữ liệu được tính; WHY giữ lý do nến đã đóng (* nếu bar hiện tại còn chạy); DATA là khoảng ngày. Tooltip/Data Window ghi các reference tại bar phát tín hiệu, không suy ra fill hoặc win rate.

## 4. Drawing và source timestamps

Snapshot trả 111 scalar cùng một ModelArchive bất biến chứa OHLC nguồn/lý do kết thúc; từng trường được offset riêng trên LTF, gồm thời gian nguồn RH/RL/INV/CP/ERL. Không dùng barstate.isconfirmed bên trong request để giả xác nhận HTF. Preview live tách biệt, gom OHLC thật từ chart; không trình bày bucket đầu thiếu dữ liệu như nến đầy đủ.

Line xloc.bar_time bắt đầu từ nến nguồn; trên LTF map HTF high/low về timestamp nến con tạo cực trị trong cache 1000 bucket đầy đủ. Nếu cache không có, tìm trong tối đa 5000 bar chart đã tải. Không tìm được nguồn thì ẩn line tương ứng, không gắn giả vào nến tín hiệu. EQ dùng neo tổng quan vì không có nến cực trị riêng. Line được vẽ hiện tại nối lại nguồn cũ không có nghĩa tín hiệu đã biết ở thời điểm swing; pivot vẫn phải chờ xác nhận.

Điểm kết thúc dùng horizon từ neo tổng quan/tín hiệu hiện hành, cắt trước cột nhãn và cụm HTF; không giới hạn chiều dài tính từ swing cũ vì như vậy ERL cũ sẽ biến mất. Không extend.right. Timestamps vượt phần tương lai có thể vẽ dùng bước chart TF để chiếu vài bar; lịch nghỉ/session gap có thể làm phần chiếu ngắn hơn bố cục bar-index.

Nhãn chữ trong suốt, gộp đúng mức/cùng nguồn và giãn theo dải giá nhìn thấy. Không dịch giá thật để né chữ; có leader khi nhãn dời. Cụm bên phải offset 30, thân 4, râu solid 1 px và đúng tâm; dùng OHLC nguồn thực. Chỉ tam giác glyph cố định 6pt, Buy xanh dưới nến/Sell đỏ trên nến, không chữ hoặc line C/M cạnh bar. Các hit cùng hướng/cùng bar gộp một hình với tooltip chứa từng context; counter tăng theo hit của từng kênh. Dashboard vẫn hiển thị trạng thái nội bộ.

Không thể hứa không chồng chữ ở mọi zoom/scale/cửa sổ vì Pine không cung cấp bounding box pixel. overlay + scale.none + force_overlay giữ cùng pane giá; instance phải ghim cùng scale symbol: [TradingView scale](https://www.tradingview.com/support/solutions/43000775579-indicator-moves-separately-or-is-not-attached-to-the-price/).

Signal timing mặc định Pullback tách xác nhận khỏi điều kiện hồi: đóng phá C/M cố định mức chờ, nến sau phải hồi chạm và đóng đúng phía hoặc retest vùng hợp lệ của nhánh. Auto CRT/TS cần C/M trước retest. Confirmation close cho cách market vẫn là lựa chọn riêng. FVG/OB không bao giờ phát retest tại chính nến tạo vùng. Tooltip ghi Confirm bar/Trigger bar; tam giác đặt tại trigger thực sự, không backdate. Fixture tuần tự kiểm tra cả ba nhóm, Buy/Sell, mức MSS cố định dù scanner nhận pivot mới, FVG/OB hình thành rồi retest, cùng các gate bias/time/CP.

Snapshot hiện có 111 scalar, gồm 14 trường bản đồ FVG/OB, swing nội bộ và neo nguồn. Mọi trường offset riêng. Harness kiểm tra FVG ưu tiên, OB/swing fallback được giữ, neo C1 HTF tách biệt thời điểm xác nhận C3.

Ngày 13/11/2026, toàn bộ bản source có timeout và bản đồ IRL đã qua Pine Editor tạm: exactSource=true, success=true, errors=null. Đây là chẩn đoán editor; chưa kiểm tra runtime/Replay trên chart.

## 5. Lượt phản ứng và bộ lọc sóng

Fresh reaction: sau một hit phải có pivot hồi đã xác nhận với nguồn sau nến tín hiệu (Buy pivot Low, Sell pivot High), Low cao hơn đáy nến hit và close vượt đỉnh nến hit đối với Buy; đối xứng với Sell. EGF còn phải rời rồi chạm lại IRL. Không mở lượt chỉ do một nến đổi màu. Lượt chờ chưa phát có thể được thay khi pivot hồi mới thuộc sau xác nhận cũ và run đối hướng mới xuất hiện sau xác nhận đó. Trong lượt mới, bỏ FVG/OB/C-M cũ, giữ run mới nếu hợp lệ; xác nhận tại nến hiện tại đã đóng, không backdate về nến pivot. Pullback tiếp tục đợi nến sau retest. One per model vẫn giữ everSent.

Bộ lọc sóng dùng chung giữa CRT/EGF/ISB: sau một Buy, Buy ở nến sau cần một pivot Low đã xác nhận có timestamp nguồn sau nến Buy trước; Sell dùng pivot High tương ứng. Đổi model/revision hoặc đổi IRL không vượt qua gate này. Các hit cùng hướng cùng bar vẫn gộp một tam giác và giữ provenance; hit nối đuôi chưa có pivot mới nhận WAVE WAIT, không tiêu thụ state.sent. Lượt mới có thể được model/kênh khác phát trước, khi đó kênh theo sau trong cùng nhịp cũng bị chặn. Không dùng cooldown số nến cố định và không nhìn trước pivot.

## 6. Kiểm tra và giới hạn

Cụm bên phải chia MODEL và FOLLOW theo timestamp. MODEL EGF/ISB giữ hai nến nguồn; CRT thêm C3 đã đóng. FOLLOW bắt đầu sau nguồn, giữ 2–12 nến cuối (mặc định 6) và báo số bị lược. LAST mặc định tắt, dùng ModelArchive có 21 trường primitive sao chép lúc model kết thúc, không giữ tham chiếu model đang thay đổi và không nhập vào signal contexts. Ưu tiên model đang focus khi có nhiều retirement cùng bar; archive tôn trọng Models to observe. Mọi đường retire (giá/timeout/recovery, ISB hai phía, resolve đã đi qua đích, CRT ambiguous lúc hình thành) đều lưu lý do và thời điểm cuối. Tối đa 18 body/wick/caption; resize/tắt cụm xóa object thừa. Xem [hướng dẫn nhóm](HTF-GROUPS-PROPOSAL.md).

Harness riêng thực thi thân đoạn ghép dãy từ source (không mô phỏng Pine runtime/drawing): 8/40/200/449 nến lịch sử và live; khoảng cách mẹ–ISB; loại trùng timestamp, ưu tiên OHLC chart, cập nhật live, bỏ bucket chưa đủ, đổi model và tắt cụm. Kiểm tra công thức nén/midpoint râu, số nến tăng không rơi lại vào đường vẽ bốn slot.

Ngày 13/11/2026, toàn bộ source sau sửa cụm liên tục cũng đã qua Pine Editor tạm: exactSource=true, success=true, errors=null. Chưa chạy chart/Replay vì Add to chart yêu cầu đăng nhập.

Node kiểm tra các công thức lấy từ source và acceptance specification độc lập: 3000 TS symmetry, nested mother, sweep/break/false-break, compound/FIFO/expiry/capacity, EGF theo bias kể cả ngược màu nến, thay bias giữ parent, hai phía IRL/ERL, 97 offset, neo nguồn, layout, live OHLC, 1440 macro phút và DST/QT. Đây không phải Pine interpreter hay thống kê lợi thế giao dịch.

History/diagnostics có fixture History/Latest/0/200 marks, lọc root model, ba nhánh độc lập và các gate chặn. Harness giới hạn thực thi thân hàm channel từ source trên chuỗi OHLC giả lập: Buy/Sell, hai chu kỳ mới so với One per model, CRT bị khóa không chặn hai nhánh còn lại, first-touch CISD, excursion/reclaim, không lặp continuation, không phát sau CP taken hoặc khi bar chưa đóng/ngược bias/ngoài giờ. Các fixture đều đạt. Harness không mô phỏng request.security, cách tính pivot của TradingView, rollback hoặc drawing APIs.

Ngày 13/11/2026, Pine Editor tạm nhận đúng toàn bộ source hiện hành: đối chiếu payload multipart với file cho exactSource=true, chẩn đoán translate_light trả success=true, không có errors. Đây là chẩn đoán editor, **không phải xác nhận đã thực thi trên chart/Replay**. Add to chart yêu cầu đăng nhập; phiên tạm không đăng nhập/lưu/publish/đặt lệnh. Không dùng kết quả này để suy ra win rate hoặc khẳng định tần suất thị trường tăng đúng ba lần.

Checklist nghiệm thu chart: cùng symbol/session trên H1 và M5 → đối chiếu parent/mother/ERL → kiểm tra timestamp nguồn và OHLC cluster → EGF ngược màu nhưng đúng bias → IRL chưa chạm/đã chạm/phá/CP đã lấy → CRT quét một/hai biên → ISB nén/TS/break/retest → zoom/pan/scale → alert sau khi tạo lại từ source/input mới. Chưa có xác nhận xác suất thắng cao.

## Audit tần suất và xác nhận

Xem [báo cáo workflow](SIGNAL-WORKFLOW-AUDIT.md). Các chỗ nghẽn được sửa: chỉ một model vào LTF, khóa một E cả model, wick mitigation bị coi như phá vùng, LTF excursion khóa vùng vĩnh viễn, và wick chạm INV bị coi như SL thực tế. Không nhắm tới một tỷ lệ tăng cố định; chưa có thống kê thị trường cho khẳng định gấp ba hoặc tăng win rate. Các gate bias/target/time/HTF closed vẫn giữ.

Kiểm tra nhóm/ảnh lưu: `node tests/htf-cluster-groups.cjs` thực thi thân split/archive trích từ source, 36 tổ hợp loại model/số nến/giới hạn đuôi, metadata kết thúc và copy độc lập. Snapshot thêm object được offset như scalar; tổng tuple request = 112 + 6 + 6 = 124 < 127. Chưa có xác nhận chart/Replay.
