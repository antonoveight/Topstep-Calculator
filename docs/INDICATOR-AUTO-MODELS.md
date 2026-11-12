# TFA v6 — context HTF và direction signals

Nguồn: indicators/funded-angler-v6.pine; đồng bộ sang chibao.txt bằng node tools/sync-indicator.cjs. [Hướng dẫn 19 setting và kiểm tra lịch sử](INDICATOR-SETTINGS.md). Bản này thay thế các mô tả trước về EGF ép hướng theo màu nến, box OB/FVG, C/M sơ bộ và R:R tại close tín hiệu.

## 1. Những điều được giữ và được sửa

CRT/TS dùng sweep một phía rồi close reclaim trong C1; không suy ra TS từ râu dài. Inside Bar giữ mẹ đầu tiên khi nén, chưa sweep/break thì không có hướng; close breakout không bảo đảm tiếp diễn. EGF xét thân, OUT xét High–Low; không đồng nhất hai mẫu hoặc giả định có FVG từ hai nến.

Nguồn đối chiếu: [TradingView Inside Bar](https://www.tradingview.com/support/solutions/43000591665-inside-bar-strategy/), [TradingView Engulfing](https://www.tradingview.com/support/solutions/43000583769-bearish-engulfing-recognizing-sellers-taking-over-at-an-uptrend-s-peak/), [Fidelity — xác nhận chart pattern](https://www.fidelity.com/bin-public/060_www_fidelity_com/documents/learning-center/Transcript_Chart-patterns_v2.pdf). Các nguồn củng cố việc phân biệt hình thái, bối cảnh và xác nhận; không chứng minh bộ quy tắc riêng có xác suất thắng cao.

TS trong code là quy ước cá nhân sweep/reclaim C1, không phải toàn bộ quy tắc Turtle Soup gốc. Tài liệu gốc của người dùng có các khẳng định tuyệt đối về ERL/FVG và phần partial/BE không áp dụng vào hệ thống hiện hành.

## 2. Registry và bias

Registry chạy hoàn toàn trong HTF. Mỗi cặp chỉ một model compound: CRT/TS → ISB → EGF/OUT. Model cũ còn hiệu lực được ưu tiên FIFO; đầy 12 thì bỏ model mới, không đẩy model cũ ra. Models to observe = All dùng model đầu tiên; bộ lọc CRT/EGF/ISB dùng model cũ nhất khớp nhóm. Không cần ba nhóm cùng xuất hiện, nhưng All không phát đồng thời từ toàn bộ queue. Reference pool 80 swing, 60 zone. Recovery 1000 khoảng lịch HTF, không hứa phục hồi lịch sử chart chưa tải; HIST báo thiếu.

CRT có hướng theo sweep. ISB neutral tới HTF resolve: sweep/reclaim một phía hoặc close vượt mother; loại quét cả hai rồi back-in. EGF/OUT có hướng **kịch bản theo bias**, không theo close màu xanh/đỏ; bias neutral thì quan sát, không phát dấu. Hình thái EGF gốc và OHLC C1/C2 vẫn giữ nguyên.

Auto bias dùng sweep/reclaim hoặc close-through trên khung tham chiếu; giữ tối đa 3 bar tham chiếu rồi neutral nếu chưa có sự kiện mới. Override Long/Short/Neutral là bối cảnh do người dùng chọn. Khung bias phải >= HTF. Trong engine, nếu bằng HTF dùng bias ở bar HTF đã đóng; nếu lớn hơn, lấy snapshot bias đã đóng bằng offset + lookahead_on. LTF cũng chỉ đọc snapshot model HTF đã đóng. Tại biên đóng khung bias lớn, cập nhật kịch bản có thể chậm tới lần snapshot HTF tiếp theo; bộ lọc không phát tín hiệu ngược bias mới trong lúc chờ.

Khi bias đổi, EGF giữ range/C1/C2, reset hướng kịch bản, CP/IRL và revision; không tái dùng trạng thái chạm vùng cũ. Pool có thể chứa IRL hai hướng, nhưng chỉ chọn vùng phù hợp với kịch bản hiện hành; không tạo vùng còn thiếu. Default invalidation là HTF close vượt INV, kết thúc khi bar sau chạm CP hoặc ra ngoài recovery. Đây là vòng đời model, không mô phỏng SL/TP của giao dịch thật.

## 3. IRL/ERL và phản ứng

ERL là pivot HTF đã xác nhận, chưa bị lấy, ngoài range; chọn mức gần nhất mỗi phía. CP của EGF/ISB breakout lấy ERL thật, không measured move tự tạo. CP của CRT/TS là biên đối diện của range quét. CP được giữ cho revision; context ERL có thể đổi khi swing bị lấy hoặc có swing mới.

IRL ưu tiên FVG chưa full fill trong range, đúng phía kịch bản; OB là fallback candidate hẹp. Không thay IRL thiếu bằng EQ/POC. FVG, OB, EQ/CE và FRVP POC không phải các khái niệm đồng nghĩa. Không render bất kỳ box hay nhãn OB/FVG nào.

EGF: nhận bias → chọn IRL/ERL → chờ bar LTF thực sự chạm IRL → xác nhận LTF về phía ERL. Nhịp hồi vào IRL không tự tạo tín hiệu ngược bias. Không ép close ra khỏi toàn bộ vùng để được xét; vẫn phải có C/M hoặc retest hợp lệ. Nếu đã chạm rồi LTF close qua biên xa (Buy dưới đáy vùng, Sell trên đỉnh vùng), khóa lượt vùng đó; không tự hủy model HTF trước khi HTF đóng. Nếu CP đã bị lấy thì không đuổi giá. Thiếu bias/vùng/đích thì chờ.

ISB breakout cần retest mother rồi xác nhận LTF. CRT/TS cần xác nhận sau HTF close. C/M là hai hình thái chung vai trò, không hai điều kiện bắt buộc đồng thời. CISD dùng run-open; MSS seed từ pivot đã biết khi kích hoạt, riêng EGF seed lại lúc chạm IRL. Sau đó MSS cập nhật theo pivot mới đã xác nhận có timestamp nguồn từ pha hiện hành trở đi; pivot không tồn tại trước xác nhận và không backdate tín hiệu. Điều này tránh mức cũ đã bị phá làm nhánh MSS bị đứng. FVG/OB retest vẫn tính nội bộ; FVG mới phải hình thành sau pha kích hoạt/chạm và retest ở bar sau. Giữ một E cho mỗi model/revision. Người dùng tự chọn entry, không min R:R theo close tam giác và không có partial/BE tự động.

History mặc định giữ 100 tam giác, tối đa 200, tách hoàn toàn việc xóa theo tuổi của line. Latest vẫn chỉ giữ 1 và áp recency nếu bật. Hiding/retaining marks không sửa gate tín hiệu. Dashboard N đếm theo root CRT/EGF/ISB trên dữ liệu được tính; WHY giữ lý do nến đã đóng (* nếu bar hiện tại còn chạy); DATA là khoảng ngày. Tooltip/Data Window ghi các reference tại bar phát tín hiệu, không suy ra fill hoặc win rate.

## 4. Drawing và source timestamps

Snapshot trả 58 scalar; từng trường được offset riêng trên LTF, gồm thời gian nguồn RH/RL/INV/CP/ERL. Không dùng barstate.isconfirmed bên trong request để giả xác nhận HTF. Preview live tách biệt, gom OHLC thật từ chart; không trình bày bucket đầu thiếu dữ liệu như nến đầy đủ.

Line xloc.bar_time bắt đầu từ nến nguồn; trên LTF map HTF high/low về timestamp nến con tạo cực trị trong cache 1000 bucket đầy đủ. Nếu cache không có, tìm trong tối đa 5000 bar chart đã tải. Không tìm được nguồn thì ẩn line tương ứng, không gắn giả vào nến tín hiệu. EQ dùng neo tổng quan vì không có nến cực trị riêng. Line được vẽ hiện tại nối lại nguồn cũ không có nghĩa tín hiệu đã biết ở thời điểm swing; pivot vẫn phải chờ xác nhận.

Điểm kết thúc dùng horizon từ neo tổng quan/tín hiệu hiện hành, cắt trước cột nhãn và cụm HTF; không giới hạn chiều dài tính từ swing cũ vì như vậy ERL cũ sẽ biến mất. Không extend.right. Timestamps vượt phần tương lai có thể vẽ dùng bước chart TF để chiếu vài bar; lịch nghỉ/session gap có thể làm phần chiếu ngắn hơn bố cục bar-index.

Nhãn chữ trong suốt, gộp đúng mức/cùng nguồn và giãn theo dải giá nhìn thấy. Không dịch giá thật để né chữ; có leader khi nhãn dời. Cụm bên phải offset 30, thân 4, râu solid 1 px và đúng tâm; dùng OHLC nguồn thực. Chỉ tam giác Tiny Buy xanh dưới nến/Sell đỏ trên nến, không chữ hoặc line C/M cạnh bar. Dashboard vẫn hiển thị trạng thái nội bộ.

Không thể hứa không chồng chữ ở mọi zoom/scale/cửa sổ vì Pine không cung cấp bounding box pixel. overlay + scale.none + force_overlay giữ cùng pane giá; instance phải ghim cùng scale symbol: [TradingView scale](https://www.tradingview.com/support/solutions/43000775579-indicator-moves-separately-or-is-not-attached-to-the-price/).

## 5. Kiểm tra và giới hạn

Node kiểm tra các công thức lấy từ source và acceptance specification độc lập: 3000 TS symmetry, nested mother, sweep/break/false-break, compound/FIFO/expiry/capacity, EGF theo bias kể cả ngược màu nến, thay bias giữ parent, hai phía IRL/ERL, 58 offset, neo nguồn, layout, live OHLC, 1440 macro phút và DST/QT. Đây không phải Pine interpreter hay thống kê lợi thế giao dịch.

Đợt History/diagnostics bổ sung fixture History/Latest/0/200 marks, bộ lọc root model, nhánh tín hiệu CRT/EGF/ISB/ISB-TS độc lập, các gate chặn, MSS mới đủ/chưa đủ xác nhận và timestamp nguồn trước/sau kích hoạt. Các fixture đều đạt. Một lần Pine Editor tạm trả success cho payload có tên TFA nhưng chưa đối chiếu nguyên vẹn source, nên không dùng kết quả đó để tuyên bố biên dịch đầy đủ; lần thử đối chiếu tiếp theo không nhận thao tác dán. Chưa xác nhận hoạt động chart/Replay của bản này.

Đã thử Pine Editor tạm bằng paste và nhập từng khối bàn phím. Paste không được editor nhận ổn định; lần nhập từng khối không hoàn tất vòng kiểm tra đúng toàn bộ source nên đã dừng. **Chưa có chẩn đoán cú pháp hoặc kiểm chứng chart/Replay cho bản refactor này.** Không dùng kết quả success của phiên bản cũ để khẳng định bản hiện hành đã chạy trên chart. Phiên tạm không đăng nhập/lưu/publish/đặt lệnh; Add to chart yêu cầu đăng nhập ở các lần trước.

Checklist nghiệm thu chart: cùng symbol/session trên H1 và M5 → đối chiếu parent/mother/ERL → kiểm tra timestamp nguồn và OHLC cluster → EGF ngược màu nhưng đúng bias → IRL chưa chạm/đã chạm/phá/CP đã lấy → CRT quét một/hai biên → ISB nén/TS/break/retest → zoom/pan/scale → alert sau khi tạo lại từ source/input mới. Chưa có xác nhận xác suất thắng cao.
