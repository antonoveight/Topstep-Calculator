# Xác nhận nhịp đầu và phản ứng vùng hồi · R1 ngoài chart

Ngày 22/11/2026. Người dùng chọn **đặc tả và kiểm tra ngoài chart trước**. Đây là giả thuyết thực thi cá nhân có thể chạy kiểm tra; không phải Model 1 nguyên bản đã xác minh. Mã Pine, các setting, hai nhánh H1/H4 và biểu đồ Brave giữ nguyên.

Nguồn gốc chỉ cung cấp framework TS → xác nhận nhịp đầu → hồi entry → nhịp tiếp theo. Các quyết định kỹ thuật bên dưới là đề xuất R1, không gán cho Romeo. Đối chiếu nguồn và điều còn thiếu tại [nghiên cứu bổ sung](CRT-ENTRY-FOLLOWUP.md).

## Phạm vi dữ liệu

- Context HTF đã xác nhận được cấp từ ngoài: ID, hướng, thời điểm TS, C2 đóng, thời điểm đóng cửa sổ C3, INV/target. R1 không tự dựng C1/C2 hoặc chứng minh TS HTF từ dãy giá.
- Bars LTF có giờ mở/đóng, OHLC và cờ đã đóng. High/Low bao gồm râu. Chỉ những bar hoàn chỉnh trong C3 mới có quyền tạo sự kiện. Nến kết thúc đúng cuối C3 vẫn được xét.
- Danh sách swing tham chiếu đã xác nhận, timeframe, thời điểm hình thành, thời điểm được biết và cờ còn khả dụng tại TS được cấp bằng annotation. R1 chưa tự tính pivot hoặc kiểm chứng annotation đó từ feed.
- Bias/key/wave cũng được cấp rõ bằng cờ, có thể thay đổi ở một bar đã chỉ định. Không tự suy bias từ màu nến hoặc bỏ gate để có nhiều dấu.

Swing xác nhận LTF trong R1 không thay thế key HTF của một CRT ngược bias. Gate key vẫn phải phản ánh quy tắc key đã biết trước C1 của hệ thống chính; module nghiên cứu không tự chứng minh điều đó từ giá.

Mốc thời gian trong fixture là số tổng hợp, không phải timestamp sàn. Nhãn H1/H4 không tự tạo bucket hay đổi session. Tick là bước giá khai báo trong từng case, không tự lấy của BTC/XAU/MGC.

## Mốc xác nhận được chọn thế nào?

1. Buy dùng **swing High LTF**, Sell dùng **swing Low LTF**, cùng timeframe thực thi.
2. Swing phải được biết không muộn hơn TS và còn khả dụng tại thời điểm đó. Một pivot hình thành trước TS nhưng chỉ xác nhận sau TS vẫn bị loại. TS time là mốc bắt đầu raid đã được annotation, không phải lúc nhìn lại chart.
3. Chọn swing có thời điểm hình thành gần TS nhất trong nhóm hợp lệ; thời điểm được biết và ID dùng để xử lý hòa một cách ổn định. Không đổi mốc khi xuất hiện swing mới sau TS.
4. Nếu mốc đã chọn nằm ngoài đoạn giữa INV và target thì báo REFERENCE_NO_PATH. Không chọn lại một mốc cũ dễ phá hơn để hợp thức hóa tín hiệu.

Đây là lựa chọn nghiên cứu. Nó gần với một cách xác nhận cấu trúc đã bị bỏ khỏi chỉ báo trước đây; R1 ghi rõ vai trò đó và chỉ chạy ngoài chart, không lén đưa lại dưới một tên khác.

## Khi nào nhịp đầu được xác nhận?

Sau C2 HTF đóng, xét một bar LTF đã đóng:

| Buy | Sell |
| --- | --- |
| Giá đóng trước đó chưa vượt swing High; nến hiện tại thực sự chạm/cắt mốc và đóng cao hơn ít nhất một tick | Giá đóng trước đó chưa xuyên swing Low; nến hiện tại thực sự chạm/cắt mốc và đóng thấp hơn ít nhất một tick |
| Chỉ râu vượt mốc chưa đủ | Chỉ râu xuyên mốc chưa đủ |

Giá đóng trước đó chỉ dùng nếu bar đó kết thúc ngay tại giờ mở bar hiện tại; nếu không, dùng Open hiện tại. Khoảng thiếu dữ liệu **trong C3** vẫn chặn toàn bộ case. Một gap giá hoàn toàn nằm bên kia mốc không chứng minh đã có nến giao dịch qua mốc.

Nhịp có thể cần nhiều nến để đạt close xác nhận, nhưng sự kiện chỉ được biết khi bar thỏa điều kiện đóng. Cố định mốc, thời điểm xác nhận và cực trị râu của **nến xác nhận** tại đó. Không kéo endpoint theo đỉnh/đáy xuất hiện về sau. Cực trị này là quy ước kiểm tra R1, chưa phải định nghĩa đầy đủ toàn bộ nhịp của tác giả.

R1 **không yêu cầu một TS mới trên hai nến LTF liền nhau** sau TS HTF. Đổi lại, nó yêu cầu mốc tham chiếu được biết trước và close xác nhận như trên. R1 chưa tái dùng nhịp đã hoàn thành khi C2 còn chạy; đó là nhánh riêng cần đặc tả thời điểm biết context, không được lấy SL cuối C2 để đánh giá ngược các nến trước đó.

## Vùng hồi được cố định thế nào?

Phần này chưa có đủ nguồn để tự nhận diện một vùng tối ưu. **R1 nhận vùng được đánh dấu thủ công**, gồm Low, High và thời điểm khai báo, source=manual-annotation. Không tự tính OTE, phần trăm fibo, OB/FVG hoặc đồng nhất vùng với biên TS của bộ lọc hiện tại.

- Thời điểm khai báo phải từ lúc nhịp đầu đã xác nhận trở đi; chỉ bar **mở sau hoặc đúng thời điểm khai báo** mới được dùng phản ứng với vùng. Nếu vùng được khai báo giữa bar, không lấy râu của chính bar đó làm bằng chứng vì không biết thứ tự intrabar.
- Buy: toàn bộ vùng phải nằm cao hơn INV và thấp hơn cực trị High đã cố định của nến xác nhận. Sell: vùng nằm thấp hơn INV và cao hơn cực trị Low đã cố định. Đây là giới hạn đường giá để loại annotation vô lý, không xác định đâu là vùng tốt nhất.
- Cho phép Low=High để nghiên cứu cách đánh dấu bằng một line. Giá và thời điểm vùng không được cập nhật theo nến tương lai.
- Khi vùng trở nên hợp lệ, cố định bản sao của nó trong case. Vùng bị loại không được cứu bằng một đỉnh/đáy mới xuất hiện sau đó.

Vì vùng và reference là annotation, kết quả nghiên cứu còn phụ thuộc chất lượng đánh dấu. Chưa thể tích hợp tự động vào Pine chỉ bằng tên “nhịp đầu → hồi”.

## Trigger và hủy

Trigger nằm trên **một bar sau nến xác nhận**, bar đó phải giao với vùng và đóng phản ứng: Buy đóng trên High vùng, Sell đóng dưới Low vùng. Một bar chạm nhưng đóng bên trong vùng chỉ chờ phản ứng tiếp. Khi gate đổi sang cho phép, vẫn phải có một bar phản ứng mới giao với vùng; không cấp phép hồi tố cho một lần chạm cũ.

| Sự kiện | Kết quả R1 |
| --- | --- |
| Nến chưa đóng | WAIT_CLOSE, chưa cam kết |
| HTF chưa xác nhận | WAIT_HTF; không đọc SL cuối C2 để ra tín hiệu sớm |
| Chưa có reference hợp lệ | NO_REFERENCE |
| Chưa close qua mốc | WAIT_LEG |
| Nhịp vừa xác nhận | LEG_CONFIRMED; không entry cùng nến |
| Vùng chưa được khai báo hoặc chưa tới lúc có thể dùng | WAIT_ZONE |
| Vùng khai báo trước nhịp xác nhận hoặc ngoài đoạn cho phép | INVALID_ZONE |
| Chạm vùng nhưng chưa đóng phản ứng | WAIT_REACTION |
| Giá chưa chạm vùng | WAIT_ZONE_TOUCH; không đuổi |
| Buy close ở/dưới Low vùng; Sell close ở/trên High vùng | ZONE_LOST; dừng attempt |
| Chạm đúng INV hoặc target trước trigger | INV / TARGET_TAKEN; không entry |
| Cùng nến chạm INV và target | AMB; không chọn thứ tự thuận lợi |
| Thiếu bar trong C3 hoặc bar vắt qua thời điểm HTF xác nhận | DATA_GAP / CONTEXT_OVERLAP |
| Hết cửa sổ entry | ENTRY_EXPIRED |
| Bias/key/wave không cho phép | BIAS_BLOCKED / KEY_BLOCKED / WAVE_BLOCKED |
| Đạt toàn bộ điều kiện | SIGNAL tại close của bar phản ứng; sau đó USED |

R1 chỉ phát tối đa một sự kiện mỗi context. Sau tín hiệu không mô phỏng vị thế hay tính kết quả; giá đóng tín hiệu chỉ là referenceClose, không phải giá khớp được bảo đảm. Target/INV giữ theo context HTF, không đo nhịp để thay TP hoặc tính PnL.

ENTRY_EXPIRED chỉ đóng quyền entry của nhánh R1; không tự hủy range C1 còn hiệu lực hoặc ghi nhận SL. Module này không quản lý vòng đời parent HTF hay vị thế đang có.

## Ví dụ tổng hợp có thể chạy

Buy: INV=90, target=120, swing High=104 đã biết trước TS, C3 từ 110 đến 160 (đơn vị thời gian tổng hợp):

| Bar | OHLC | Điều biết được khi bar đóng |
| --- | --- | --- |
| 100–110 | 101 / 104 / 99 / 103 | HTF chưa có quyền entry trước mốc 110 |
| 110–120 | 103 / 110 / 102 / 108 | Close qua 104; nhịp xác nhận tại 120, cực trị cố định 110 |
| Vùng khai báo tại 120 | 102–104 | Chỉ những bar mở từ 120 mới được phản ứng |
| 120–130 | 108 / 109 / 103 / 106 | Chạm vùng, đóng trên 104; sự kiện biết tại 130 nếu các gate cho phép |

Trong case này không có TS mới trên hai bar LTF liền nhau. Bộ Pullback/Confirmation close hiện tại không phát dấu; R1 có sự kiện theo quy tắc khác. Đây là ví dụ có chủ ý để phân biệt thuật toán, không chứng minh R1 tốt hơn.

## Chạy và nghiệm thu

```powershell
node tools/study-crt-first-leg.cjs
node tests/crt-first-leg-study.cjs
```

Output mặc định: output/crt-first-leg/report.json. Bộ [64 case Buy/Sell đối xứng](research/crt-first-leg-fixtures.json) có kỳ vọng độc lập cho thời điểm tín hiệu và trạng thái cuối. Kiểm tra mọi prefix để nến tương lai không đổi các trạng thái đã biết; các ca gồm reference biết muộn/sai khung/đã tiêu thụ, vùng khai báo muộn/giữa bar, vùng ngoài nhịp, nến chưa đóng, target/SL/AMB, thiếu coverage, gate đổi và C3 kết thúc. Hai context chạy riêng không dùng chung state. Không dùng số case có tín hiệu làm tần suất thị trường hoặc tỷ lệ thắng.

**Đã hoàn thành ở mức ngoài chart:** quy tắc R1, module thực thi, fixture và kiểm tra nhân quả. **Còn thiếu trước tích hợp:** reference và vùng hồi được xác định độc lập trên ví dụ thị trường; đủ dữ liệu để kiểm chứng context/gate; đặc tả riêng cho nhịp đã xảy ra trong C2; và quyết định về cách chọn vùng tự động nếu không dùng annotation. Chưa gán R1 là Model 1/OTE chính thống, chưa tối ưu hoặc kết luận lợi nhuận.
