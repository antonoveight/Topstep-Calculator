> Lịch sử trước thay đổi 22/11/2026. Các quy tắc xác nhận LTF, key và thời gian tại đây đã được thay thế bằng [CRT thuần & thời gian](CRT-PURE-AND-TIME.md). Không dùng tài liệu này để cài đặt bản hiện tại.

# Early C2 — quy tắc nghiên cứu và bộ ca kiểm tra

Ngày 22/11/2026. Người dùng chọn **nghiên cứu, chốt quy tắc và ca kiểm tra trước**. Tài liệu này là giao thức cá nhân để kiểm chứng; chưa thêm Early C2, tam giác hay alert vào Pine/web. Chỉ báo vẫn là CRT Confirmed, entry C3. Fibo tự động đã gỡ theo yêu cầu; quy ước fibo thủ công giữ nguyên.

## 1. Kết luận từ nguồn và giới hạn

- Romeo phân biệt giao dịch trên hành trình tới key và phản ứng rời key. Đây là lý do để tách trạng thái “đang tới” khỏi “đã phản ứng”, không lấy một C/M xuất hiện giữa đường làm đủ điều kiện đảo chiều. [Bài gốc về key](https://t.me/s/officialRomeotpt?before=6292), tham chiếu Secrets 5.
- Một ví dụ bearish của tác giả đi theo trình tự nến mở → đi vào CRTH cũ → giảm. Ví dụ này hỗ trợ quan sát diễn biến trong nến, **chưa xác định đầy đủ** nến đó là C2 của range nào, threshold entry, SL hoặc điều kiện bắt buộc cho mọi sản phẩm. [Bài gốc](https://t.me/s/officialRomeotpt/6615).
- [What is turtle soup?](https://www.youtube.com/watch?v=U-gNCwbGtTI) và [Secrets 7: Candle 3](https://www.youtube.com/watch?v=h7NCST2wPw8) là hai video chính thức phù hợp để đối chiếu. Lượt này xác minh metadata/mô tả qua nguồn công khai; chưa lấy được toàn bộ lời giảng. Khung Terminology đã đối chiếu ở khoảng [08:01](https://www.youtube.com/watch?v=L87Iy51_ATM&t=481s) có hai sự kiện TS tại hai mức khác nhau; phải lưu cấp tham chiếu, không đồng nhất TS nhỏ với sweep biên HTF.

**Các quy tắc cơ học từ mục 2 trở đi là lựa chọn của dự án**, không gán thành công thức Early C2 đã được Romeo xác nhận. Chưa có bằng chứng ở đây về tỷ lệ thắng, lợi ích tăng thêm của SMT hoặc khả năng nhận diện trước “KOD cuối cùng”. Không gọi mọi MSS/CISD là Model 1/True MSS.

## 2. Early C2 được hiểu thế nào

**C1:** nến HTF liền trước, đã đóng; range High/Low gồm râu. **C2:** nến HTF đang diễn ra ngay sau C1. **Early:** quan sát trong C2 sau khi các bằng chứng LTF đã đóng, trong khi kết quả đóng C2 chưa biết.

Ví dụ Sell: C2 đã vượt **High C1** thật sự, sau đó LTF đóng trở lại trong C1 và rời key kháng cự. C/M LTF có thể hỗ trợ phản ứng này, nhưng chưa thể khẳng định C2 sẽ đóng trong C1. Một MSS ở dưới đỉnh nội bộ, khi C2 chưa vượt High C1, không đủ cho nhánh Early này. Buy đối xứng.

`EARLY_READY` chỉ có nghĩa các điều kiện nghiên cứu đang đủ ở thời điểm đó. C2 sau đó vẫn có thể tiếp tục mở rộng, quét hai đầu hoặc đóng ngoài range. Không đổi tên trạng thái lịch sử thành Confirmed khi nhìn lại.

## 3. Quy tắc chốt cho bản nghiên cứu đầu

1. **Khóa C1 và key trước sự kiện.** Key là FVG/OB/swing đúng hướng, timeframe >= HTF đang xét, có `sourceAt <= knownAt <= thời điểm mở C1` và biên riêng. Không lấy key LTF thay key HTF hoặc dùng metadata nguồn có thời điểm sau lúc được biết. Một pivot có nến nguồn cũ nhưng được biết trong C1/C2 không được bổ sung hồi tố. Bản Early đầu yêu cầu key cho cả thuận và ngược bias; chặt hơn nhánh Confirmed thuận bias hiện hành.
2. **Bias là bối cảnh.** Neutral/B0! ngừng đánh giá entry; ngược bias chỉ xét khi cho phép CT và có key phù hợp. Khi bias tạm chặn, bỏ xác nhận đang chờ và yêu cầu xác nhận lại khi bối cảnh hợp lệ. Không tự đảo D1 từ một sweep LTF.
3. **Sweep đúng biên HTF.** Sell xuyên High C1 tối thiểu một tick; Buy xuyên Low C1 tối thiểu một tick. Chạm hoặc thiếu tick không đủ. Tính cực trị tích lũy từ các nến LTF đã đóng được quan sát trong C2; dữ liệu tick/nến đang chạy chưa làm bằng chứng phát trạng thái Ready.
4. **Có phản ứng tại key và reclaim.** FVG/OB phải được chạm rồi LTF đóng rời toàn vùng theo hướng kỳ vọng; swing phải bị raid ít nhất một tick rồi reclaim. Đồng thời close LTF phải nằm hẳn trong C1. Key chưa tới thì chờ. Quy ước nghiên cứu bảo thủ: LTF close xuyên biên xa của key sẽ loại nhánh Early cho C2 này; không tự gọi đó là model CRT Confirmed bị INV.
5. **C/M được biết đúng lúc.** Cần một CISD hoặc MSS có nến LTF đóng xuyên mức theo hướng CRT. Mức nguồn và thời điểm được biết phải có trước hoặc tại open của nến xác nhận. Wick xuyên nhưng close chưa qua mức không đủ. Bản đầu tách reclaim và C/M thành hai nến LTF: C/M phải đến sau reclaim; đây là lựa chọn nghiên cứu để dễ kiểm chứng, chưa phải kết luận mọi xác nhận cùng nến đều sai.
6. **Pullback ở nến sau.** Giá hồi mức C/M rồi close giữ phía kỳ vọng. Không hồi thì bỏ nhánh Pullback, không chuyển ngầm thành market. FVG/OB có thể là nhánh retest bổ sung ở giai đoạn sau; chưa thay thế C/M trong bộ ca đầu. Nếu dùng ET thủ công, phải ghi neo và thời điểm biết neo trước entry, không kéo lại theo cực trị C2 hoàn chỉnh sau này.
7. **Xác nhận bị phủ nhận thì bỏ pending.** Trước entry, close không giữ đúng phía mức C/M (kể cả đóng ngay mức trong giao thức Early này) hủy xác nhận chờ; chờ C/M mới. Mất reclaim/key reaction cũng bỏ pending. Giữ sự kiện Ready đã quan sát trong lịch sử, nhưng không giữ cờ Ready hiện tại khi điều kiện đã mất.
8. **Cực trị C2 mới trước entry:** tăng `attemptVersion`, xóa reclaim/C/M/retest cũ và đánh giá lại từ cực trị mới. Không dùng một xác nhận trước lần mở rộng đó để cho entry sau này. Lưu phiên bản cũ để audit, không xóa dấu vết của nó.
9. **Sau entry thủ công đã ghi nhận:** đóng băng entry/SL/TP tham chiếu của lượt đó. Cực trị mới không nới SL cũ. Nếu nến sau chạm mức đã khóa, ghi `SL_REFERENCE_TOUCHED`, `TP_REFERENCE_TOUCHED` hoặc `AMBIGUOUS`; không suy ra khớp lệnh thực tế hoặc trình tự chạm từ OHLC.
10. **Không còn đường tới TP:** target đã bị chạm trước entry thì loại nhánh Early của C2 đó. Double sweep thì `DOUBLE_SWEEP`, không xoay từ Sell sang Buy bằng cùng range. Mục tiêu cá nhân vẫn là biên đối diện C1; EQ là mốc quan sát.
11. **Hết C2 thì kết thúc Early.** C2 đóng trong C1, sweep một phía và còn đường target: đánh dấu `C2_CONFIRMED` rồi chuyển việc quan sát sang workflow C3. Close ngay biên/ngoài hoặc thiếu sweep thì `C2_REJECTED`; double sweep/target đã lấy thì mơ hồ theo baseline. Không dùng nến đầu C3 để điền một retest Early còn thiếu.
12. **Thiếu dữ liệu đóng C2:** không lấy close của nến LTF sau cửa sổ để giả làm close C2. Khi hiện thực cần đọc HTF close/time theo feed, xử lý gap phiên/DST riêng. Bản nghiên cứu ghi `EXPIRED` nếu sự kiện sau cửa sổ đến mà chưa có sự kiện kết thúc đúng C2.

## 4. Trạng thái và định danh

| Trạng thái | Ý nghĩa |
| --- | --- |
| WAIT_CLOSE / WAIT_RAID | Chưa có nến LTF đóng hoặc chưa sweep biên C1 |
| NO_PRIOR_KEY / BIAS | Thiếu key có trước hoặc bias đang chặn |
| WAIT_KEY_REACTION / WAIT_RECLAIM | Chưa chạm/phản ứng đủ hoặc chưa close trong C1 |
| WAIT_CM / WAIT_PULLBACK | Đã reclaim; chờ xác nhận rồi retest ở nến sau |
| EARLY_READY | Đủ giao thức nghiên cứu ở thời điểm hiện tại, C2 chưa đóng |
| CM_REVOKED / KEY_X | Mất pending confirmation hoặc key không giữ được theo quy ước Early |
| TARGET_TAKEN / DOUBLE_SWEEP | Ngừng nhánh Early cho C2 hiện tại |
| MANUAL_ENTRY_RECORDED | Entry do người quan sát cung cấp; không suy từ candle là đã fill |
| C2_CONFIRMED / C2_REJECTED / C2_AMBIGUOUS | Kết quả giá HTF khi C2 đóng, độc lập với kết quả lượt Early |

Định danh cha dự kiến: `symbol + HTF + open C1 + open C2`. Mỗi lần mở rộng có `attemptVersion`; reclaim/confirmation/retest lưu timestamp riêng. Khi qua C3, liên kết cùng parent, không đếm Ready hoặc mỗi alert thành một trade mới. Pine chưa biết vị thế thật, vì vậy chưa thể tự quản lý việc vào Early rồi vào thêm C3.

Lưu hai trục độc lập: **tính hợp lệ cuối của C2** và **diễn biến lượt Early đã quan sát**. Một lượt Early chạm SL tham chiếu rồi C2 vẫn đóng hợp lệ là tình huống phải giữ lại, không được xóa vì cuối cùng có CRT đẹp.

## 5. Ca kiểm tra có thể chạy

[Fixture JSON](../tests/fixtures/early-c2-research.json) có 35 tình huống, chạy đối xứng Buy/Sell thành **70 lượt**. Mốc thời gian là phút giả định, không phải phiên MGC/XAUUSD thực tế. `openAt/closeAt` là thời gian, `open/close` là giá; không dùng lẫn nhau. Base Sell: C1 100–110; C2 sweep lên 111; LTF reclaim tại 70, C/M tại 75, retest tại 80, HTF chỉ đóng tại 120.

Nhóm ca: MSS/CISD thay thế nhau; FVG/OB/swing key; key thiếu/sai hướng/biết muộn/chưa chạm; bias neutral và CT bật/tắt; chạm/thiếu tick; nến đang chạy; pivot biết muộn; wick break không close; thiếu C/M; giá chạy không hồi; retest sai phía; target bị lấy; double sweep; cực trị mới; key close-through; Early Ready rồi C2 close ngoài/ngay biên; chỉ retest lúc C2 đóng hoặc sang C3; SL tham chiếu khóa sau entry; C/M mất hiệu lực, bias pause và mất reclaim sau Ready.

Chạy `node tests/early-c2-research.cjs --write`. Bộ kiểm tra còn đối chiếu **354 prefix**: thêm dữ liệu tương lai không sửa lịch sử đã quan sát. Kết quả lưu ở `output/early-c2-research/results.json` (không commit). Kết quả HTF cuối dùng chính thân `f_patterns` từ Pine hiện tại để đối chiếu việc bàn giao C3.

Mô hình tham chiếu trong `tests/helpers/early-c2-research-spec.cjs` **không được app/Pine import**. Nó nhận shift/key có sẵn; chưa tự tìm pivot/CISD, không mô phỏng request.security, tick realtime, broker fills, spread/slippage hoặc lợi nhuận. Không gọi 70 ca đạt là 70 lệnh thắng. Khi hiện thực phải giữ gate thời gian/chống trùng hiện có; bộ này chỉ xét giao thức giá với giờ ở chế độ Context only, không thay bộ kiểm tra macro/DST của baseline.

## 6. Điều kiện trước khi chuyển thành tính năng

- Thu thập ví dụ thật cùng feed HTF/LTF, có ghi nhận trước C2 đóng; có cả hợp lệ và thất bại. Không tối ưu bằng hình C2 đã hoàn tất.
- Đối chiếu lời giảng/chart gốc đủ để kiểm tra các lựa chọn còn nghiêm ngặt: key trước C1, tách nến reclaim/C/M, cách lấy MSS và việc loại key trên LTF.
- Nếu triển khai, bắt đầu bằng **chế độ quan sát mặc định tắt**, namespace riêng, không dùng chung tam giác/alert C3. Nêu rõ `C2?` thay vì Confirmed.
- Early ET/FVG/OB retest, Model 1/KOD/SMT và tự quản lý lệnh chưa nằm trong phạm vi hiện tại. Quyết định viết code indicator là bước sau bộ nghiên cứu này.
