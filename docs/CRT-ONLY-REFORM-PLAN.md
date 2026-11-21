# Kế hoạch cải tổ hệ thống chỉ giữ CRT

Cập nhật 21/11/2026 theo quyết định của người dùng và [nghiên cứu nguồn Romeotpt](CRT-ROMEOTPT-RESEARCH.md). Chỉ có **CRT là phương pháp giao dịch**. IRL, ERL, key level và TS phục vụ vị trí, hướng đi và xác nhận của CRT; EGF/ISB không còn là phương pháp hay kênh phát tín hiệu độc lập trong bản dự kiến.

Tài liệu này thay thế kế hoạch ba phương pháp cho đợt cải tổ kế tiếp. Cập nhật triển khai: Pine đã chuyển sang [CRT V1](CRT-V1-SPEC.md), có bản lưu multi-model, bộ ca tổng hợp và kiểm tra biên dịch riêng. Web/checklist chưa chuyển đổi. Replay/forward chart là bước nghiệm thu tiếp theo; fibo tự động và Early C2 chưa thuộc V1.

## 1 Chuẩn hóa phạm vi trước khi viết lại

Tách ba lớp trong mọi đặc tả: nội dung nguồn Romeo đã xác minh; quy ước cá nhân đã chốt; điều kiện thuật toán cần kiểm chứng. Không gọi mọi lựa chọn cơ học trong code là CRT nguyên bản.

V1 tập trung **CRT Confirmed trong C3**. Giữ HTF tùy chỉnh H1/H2/H4/D1 và LTF entry theo lựa chọn hiện hành; không tự khóa lại H1/D1 hoặc thêm cặp timeframe bắt buộc từ ghi chú cộng đồng. Có thể quan sát W1 thủ công để đọc bối cảnh, chưa cần thêm timeframe vào setting.

Giữ thống nhất High/Low gồm cả râu. Bổ sung Open và thời gian mở/đóng của C1/C2/C3 trong dữ liệu/tooltip; giá Open không thay High/Low và không tự là lệnh entry.

## 2 Workflow CRT của bản đầu

1. Chọn HTF, range C1 đã đóng, bias tham khảo và key level có trước. Ghi rõ range dùng để gọi IRL/ERL và mục tiêu đang hướng tới.
2. Theo dõi C2: chạm chưa là sweep; sweep một biên rồi đóng trong C1 mới xác nhận nhánh V1. Quét hai biên hoặc close ngoài C1 không tự chọn hướng.
3. Sang C3, quan sát phản ứng và xác nhận LTF theo model entry đã chọn; fibo xác định vị trí chờ ET, không tự tạo lệnh.
4. Chọn một TP toàn bộ trước entry, theo dõi SL hoặc đóng tay; không tự thêm partial, BE hoặc trailing từ nhãn fibo.
5. Không có xác nhận/retest hoặc target đã bị lấy thì không đuổi. Một setup mới phải có lý do, mốc và dữ liệu riêng.

Đây là bản CRT ba nến cá nhân để kiểm chứng trước. Các range nhiều nến, continuation và KOD có thể thuộc cách đọc CRT rộng hơn; việc bỏ detector EGF/ISB không có nghĩa các hình thái nén/bao trùm không tồn tại trên chart. Chỉ không dùng chúng làm phương pháp độc lập.

## 3 Key level và bias

Hiển thị được vị trí giá **đang hướng tới key** hay **đã phản ứng rời key**, không chỉ trạng thái “có mẫu nến”. Key level phải được ghi nhận trước sự kiện dùng để giải thích entry, không bổ sung hồi tố. Các key do người dùng vẽ/FRVP chưa được code đọc tự động.

Giữ IRL/ERL, FVG, OB và swing theo đúng vai trò. Không buộc mỗi CRT phải tự tạo FVG; không ép đủ POC + FVG + OB + CISD + MSS đồng thời. Quy tắc key phải có trước C1 trong nhánh CRT counter-bias hiện tại là điều kiện chặt của dự án, không gán cho Romeo; giữ để đối chiếu V1 trước khi cân nhắc đổi.

Bias gồm bối cảnh khung lớn và hướng kịch bản CRT đang xét. Không mặc định CRT đảo chiều phải bị chặn chỉ vì ngược bias D1, cũng không tự đảo D1 theo một sweep M5. Giữ ngoại lệ counter-bias tại key đã có trước, có xác nhận LTF; kiểm tra lại các trường hợp mâu thuẫn với guard intraday đang có. Không sửa hard gate cho đến khi có bảng ca kiểm thử thuận/ngược bias và ví dụ chart.

## 4 Xác nhận LTF và Early C2

MSS/CISD hiện có thể giữ làm baseline kỹ thuật, nhưng phải ghi đúng mức nguồn, thời điểm được biết và nến đóng xác nhận. TS nhỏ trong range không tự là TS HTF. Thêm bộ ca fake shift: phá swing nhỏ trên đường tới key, shift trước khi key được chạm, shift khi target đã bị lấy và shift bị phủ nhận ngay sau đó.

**Model 1, True MSS, fake MSS, breaker, KOD, OTE và SMT** cần đối chiếu bài gốc bằng lời giảng cùng chart. Chưa tự đổi tên logic CISD/MSS/OB hiện tại sang các tên đó. Không đưa hết thuật ngữ nâng cao vào cùng bản đơn giản.

Early C2 là nhánh quan sát/nghiên cứu tách riêng, tắt trong tín hiệu mặc định. Ghi key có trước → sweep thật của biên C1 → LTF reclaim đã đóng → xác nhận → hồi ET/phản ứng. High/Low C2 đang chạy chỉ là cực trị tạm; nếu vào lệnh thủ công thì đóng băng risk/SL tại entry, không nới theo đỉnh/đáy mới. Không dùng C2 đã hoàn tất ở tương lai để vẽ một entry sớm trong lịch sử.

## 5 Target và fibo

Giữ hai mức phân tích **EQ C1** và **biên đối diện C1**. Nguồn Romeo có nhắc mục tiêu 50% nên không ghi “CRT chỉ TP biên đối diện”. Nhưng người dùng hiện chọn TP toàn bộ, chưa yêu cầu đổi target sang EQ hoặc chốt một phần.

Fibo cá nhân giữ 0=SL cực trị C2, 0.1=ET2, 0.2=ET1, 0.4=break, 0.6=BE, 0.8=TL, 1=TP. Sell neo Low C1 đến High C2; Buy đối xứng. Hiển thị phải kiểm tra 0 đúng SL và 1 đúng TP, không suy từ thao tác kéo của từng nền tảng. EQ C1, CE FVG, fibo0.5 và nhãn BE0.6 là các khái niệm khác nhau.

Khi làm fibo tự động ở giai đoạn sau: chỉ neo các cực trị đã biết, ghi model ID, giữ đúng timestamp và có chính sách khóa neo sau entry. Không tạo lệnh chỉ vì chạm ET; hai ET không mặc định hai vị thế. R:R có thể hiển thị theo entry/ET, SL và TP thực tế; không tự bật lại min R:R theo close tam giác từ thông điệp 1:3 chưa đủ bối cảnh.

## 6 Thời gian và vòng đời

Giữ timezone/session cùng nến nguồn của broker; đối chiếu H1/D1 Topstep–TradingView như bối cảnh người dùng đang dùng. H2/H4 vẫn cho chọn, nhưng phải kiểm tra cách chia bucket trước khi đối chiếu range. Không áp giờ 159/2610/1248 từ đoạn chữ thiếu timezone cho mọi sản phẩm; MGC không tự thuộc bộ giờ index futures.

Macro/QT giữ làm bối cảnh tùy chọn, không làm phương pháp mới và không tự tạo hướng. Những tính năng không phục vụ workflow CRT chính nên thu gọn hoặc ẩn mặc định sau khi kiểm tra ảnh hưởng.

Vòng đời cần tách: ứng viên C2; CRT Confirmed; chờ phản ứng C3; chờ xác nhận LTF; chờ ET/retest; có tín hiệu; đã chạm EQ; đã đạt TP được chọn; INV; hết cửa sổ entry; timeout lưu trữ; mơ hồ hai biên. Không coi hết hạn là thua hay chạm EQ là TP toàn bộ. Timeout 8 nến hiện hành là giới hạn cá nhân, không phải định nghĩa tác giả. Không đổi thành “hết C3 là SL” nếu chưa có quy tắc được thống nhất.

## 7 Thu gọn chỉ báo và web

| Hạng mục | Cải tổ dự kiến |
| --- | --- |
| Registry | Chỉ giữ lifecycle CRT; bỏ tạo/xử lý EGF/ISB như model độc lập. Lưu bản hiện hành để so sánh trước khi xóa nhánh. |
| Kênh LTF | Một kênh CRT; bỏ competition và bộ đếm E/I, giữ close-bar, target, INV, time và chống trùng đã kiểm chứng. |
| Bias | Tách bias tham khảo với hướng CRT; kiểm tra CT/guard trước khi chỉnh điều kiện chặn. |
| Reference pools | Giữ FVG/OB/swing cần cho key/IRL/ERL và CT; bỏ phần chỉ dùng cho EGF. Phân biệt OB HTF với OB entry LTF. |
| Settings | Bỏ Models to observe; gom HTF/Bias, CRT, Entry, Time, Display. Không thêm hàng loạt toggle cho thuật ngữ chưa kiểm chứng. |
| Snapshot | Bỏ field EGF/ISB và context ranking; kiểm tra lại budget tuple, UDT, offset, memory và sync chibao.txt. Không chỉ xóa UI mà để logic cũ phát tín hiệu ngầm. |
| Cụm HTF | C1–C2 nguồn và FOLLOW C3/nến sau tách nhau, giữ high/low/open/close thực và line không chồng caption. |
| Dashboard | HTF, hướng CRT, bias tham khảo, key/target và trạng thái chờ; chữ viết tắt, tooltip rõ nguồn. |
| Tam giác/alert | Buy xanh dưới nến, Sell đỏ trên nến; tại nến đủ điều kiện, không vẽ lùi. Alert CRT riêng, Early không lẫn Confirmed. |
| Web/checklist | Bối cảnh → C1 → C2/TS → entry → quản lý. EGF/ISB đưa sang lịch sử, không còn lựa chọn phương pháp mới. |
| Nhật ký | Một model ID, Confirmed/Early, thuận/ngược bias, key, xác nhận, ET, target, outcome và tuân thủ. Không nhân bản một lệnh vì có nhiều tên mẫu. |
| Ảnh | Chỉ ưu tiên ví dụ CRT, đúng râu; ảnh EGF/ISB cũ gắn lịch sử, không xóa tài sản thiết kế người dùng. |

## 8 Thứ tự triển khai và nghiệm thu

**Bước 1 — Đặc tả:** chốt CRT V1, phân loại nguồn, glossary và bộ ví dụ dương/âm. Các điều kiện chưa đủ nguồn nằm ở backlog; không ngăn việc làm gọn baseline ba nến đã có.

**Bước 2 — Pine CRT-only:** lưu version hiện hành, gỡ hai detector/kênh độc lập, giữ reference pools cần thiết. So sánh tín hiệu CRT trước/sau khi chưa đổi định nghĩa, tránh vô tình mất các line hoặc alert.

**Bước 3 — Vị trí và lifecycle:** bổ sung trạng thái key/EQ/TP/entry window, kiểm tra bias/CT và fake shift theo đặc tả. Không nâng tần suất làm mục tiêu.

**Bước 4 — Fibo và hiển thị:** thêm overlay CRT khi dữ liệu neo đã nghiệm thu; không gộp triển khai Early C2. Test wick anchors, hướng Buy/Sell, timestamp, zoom/pan và không chồng chữ.

**Bước 5 — Web và tài liệu:** checklist, thuật ngữ, nhật ký, hình và tham chiếu đồng bộ. Source hiện hành, kế hoạch và tài liệu lịch sử phải được phân biệt.

**Bước 6 — Replay/forward:** cùng sản phẩm/session và hai nguồn chart thực tế; chốt cấu hình trước khi đánh giá. Phân nhóm C3/CT/Early, có/không key, chạm EQ/đạt full TP, fill/không fill và lỗi tuân thủ. Biên dịch và fixture không thay thế kiểm định thị trường.

Bộ ca bắt buộc: C1 đầy đủ; High/Low đúng râu; chạm khác sweep; double sweep; C2 close ngoài/đúng biên; key biết muộn; LTF signal trước xác nhận; pivot biết muộn; fake shift; target/EQ đã bị lấy trước entry; không hồi ET; giá chạy nhanh; nhiều range chồng nhau; CT thiếu key; thay bias; cuối phiên/ngày; DST/bucket H4 khác nhau; timeout không phải trade loss; cùng nến chạm nhiều mức cần dữ liệu intrabar hoặc kết quả mơ hồ, không chọn kết quả có lợi.

## 9 Backlog nghiên cứu không đưa vào V1

- Quy tắc chọn range nhiều nến so với C1 liền trước và điều kiện chuyển range.
- Công thức Model 1, True MSS/fake MSS và KOD từ ví dụ gốc.
- OTE trong C3 so với ET1/ET2 cá nhân và mốc Open C3.
- Bộ giờ và timeframe alignment theo từng sản phẩm/session.
- SMT có giá trị bổ sung hay chỉ tăng điều kiện, trên dữ liệu sản phẩm người dùng thực sự trade.

Mỗi mục chỉ thành code khi có nguồn cụ thể, định nghĩa quan sát được trước kết quả, ít nhất một ví dụ hợp lệ và một ví dụ bị loại, cùng tiêu chí kiểm thử.
