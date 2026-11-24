# Xác nhận nhịp đầu và phản ứng vùng hồi · R1 ngoài chart và tích hợp thử nghiệm

**Nghiên cứu mới từ 7 ảnh của người dùng (24/11/2026):** [ca XAUUSD và các điểm nghẽn](CRT-ENTRY-FOLLOWUP.md#ca-xauusd-của-người-dùng--7-hình-ngày-24112026) chỉ ra cổng MPS toàn cục hiện không khớp workflow. Người dùng đã chốt nhánh #1: tam giác ở chính nến TS đóng ngược vào range, không chờ MPS. Cần tách TS close, TS→FVG và MPS→OTE; OTE dùng cuối leg 1 và hồi 50–80%, không chỉ wick nến kích hoạt. Phần triển khai bên dưới vẫn mô tả bản đang chạy, chưa sửa theo nghiên cứu mới.

Ngày 22/11/2026. Người dùng chọn **đặc tả và kiểm tra ngoài chart trước**. Đây là giả thuyết thực thi cá nhân có thể chạy kiểm tra; không phải Model 1 nguyên bản đã xác minh. Sau đó người dùng yêu cầu tích hợp: bản Pine hiện có chế độ R1 thử nghiệm, không bật mặc định. Phần đặc tả dữ liệu tổng hợp bên dưới vẫn mô tả module ngoài chart; cách lấy dữ liệu thực tế và vận hành Pine nằm ở cuối tài liệu.

Nguồn gốc chỉ cung cấp framework TS → xác nhận nhịp đầu → hồi entry → nhịp tiếp theo. Các quyết định kỹ thuật bên dưới là đề xuất R1, không gán cho Romeo. Đối chiếu nguồn và điều còn thiếu tại [nghiên cứu bổ sung](CRT-ENTRY-FOLLOWUP.md).

**Cập nhật nghiên cứu 24/11/2026:** [MPS trong CRTology ep.5](CRT-ENTRY-FOLLOWUP.md#bổ-sung-24112026--mps-theo-video-mới-nhất) làm rõ mốc xác nhận là swing P2 trực tiếp trước TS và P3 phải tại key level. R1 trước khi bổ sung cổng MPS chọn pivot gần nhất và chỉ bắt buộc key khi ngược bias, nên chưa tương đương MPS; vùng hồi thủ công cũng chưa phải OTE gốc. Xem bảng đối chiếu trong nghiên cứu trước khi diễn giải tín hiệu R1. Đó là bước nghiên cứu; sau yêu cầu tiếp theo, cổng MPS đã được triển khai như phần dưới.

## MPS trước entry · triển khai 24/11/2026

**MPS before entry = bật mặc định.** Trình tự hiện hành là **CRT/TS tại key → MPS → tìm entry**. Tắt công tắc chỉ để đối chiếu nhánh cũ; không cần chọn R1 mới có MPS. Cả Main HTF và Larger HTF có context/state/gate riêng. Early C2 cũng xét MPS trên dữ liệu đã đóng lúc đó và vẫn là cảnh báo thử nghiệm, chưa phải CRT HTF xác nhận.

### Quy ước nhận diện đã mã hóa

1. **P1:** đúng High/Low bao gồm râu của C1 HTF, định vị xuống nến LTF thực sự tạo cực trị. Cần đầy đủ các nến đóng của C1 và phần raid được dùng; thiếu nguồn/khác OHLC thì không neo giả.
2. **P3:** nến LTF có cực trị raid cuối đã biết của attempt. Nếu cùng cực trị xuất hiện nhiều lần, dùng lần cuối. MPS trước P3 cuối không được dùng cho attempt mới. Confirmed chỉ đọc C2 đã đóng; Early dùng C2 tính tới nến LTF hiện tại, không đọc giá cuối tương lai.
3. **P2:** swing ngược hướng quét gần nhất nằm **sau P1 và trước P3**, dùng pivot 2 trái/2 phải đã xác nhận và chưa bị lấy tại giờ mở bar P3. Buy dùng swing High; Sell dùng swing Low. Chọn ứng viên trực tiếp theo thứ tự hình thành trước, rồi mới kiểm tra thời điểm biết/đã tiêu thụ; ứng viên sai không được thay bằng mức cũ dễ phá hơn. Đây là quy ước cơ học thận trọng cho sơ đồ của tác giả, chưa chứng minh bao quát mọi đường giá phức tạp hoặc pivot nội nến.
4. **Key bắt buộc ở cả hai hướng**, kể cả cùng bias. Hiện dùng swing key HTF/Bias TF của hệ thống đã biết trước C1, được raid và reclaim. Không tự coi mọi biên C1/POC/line thủ công là key. Chính sách key này là lựa chọn triển khai; taxonomy key gốc đầy đủ còn cần nghiên cứu.
5. **Một close qua P2:** Buy đóng cao hơn P2; Sell thấp hơn P2. Râu xuyên và close đúng bằng mốc chưa xác nhận. Không buộc thêm buffer ngoài bước giá giao dịch. MPS hình thành trong C2 có thể được giữ khi context được xác nhận; không bắt first leg phải xuất phát lại trong C3.

Không bổ sung bộ lọc giờ hoặc SMT do tập 5 chưa đủ quy tắc để mã hóa. MPS không tự đảo bias D1. Entry vẫn cần gate bias/key/wave, chưa chạm target/INV và cửa sổ của nhánh.

### Thời điểm và cách đọc trên chart

- Nhãn chữ **+MPS / -MPS** tại nến **quan sát được** xác nhận; không phải tam giác entry. Hover ghi timeframe, P1/P2/P3, lúc pivot được biết, activation thực tế, available và observed. Hai nguồn cùng hướng/cùng bar gộp một nhãn, giữ cả thông tin nguồn. Chữ không có nền và đặt cách nến theo biên độ giá.
- Nhãn MPS có bộ nhớ riêng, giữ tối đa 40 nhãn trong History (và không vượt Historical signals to keep); không lấy mất suất tam giác entry. Latest giữ lần MPS quan sát gần nhất, tối đa hai hướng. Giá trị 0 ẩn cả hai loại dấu.
- Dashboard thêm hàng **MPS**: ví dụ H1:+ H4:WAIT. WAIT MPS ở ENTRY nghĩa chưa mở bước tìm entry. Hover MPS/WHY để xem M DATA, M NO KEY, M NO P2, M P2 LATE/USED, M KEY LOST, M GAP, M INV/TG/AMB hoặc M EXP. M DATA còn có thể do OHLC nguồn không khớp hoặc thiếu coverage.
- Phân biệt **activationAt** (close thực sự qua P2), **availableAt** (lúc đã đủ dữ liệu để dùng) và **observedAt** (close chart đầu tiên chỉ báo cam kết). Dữ liệu C2 trong quá khứ không được tạo nhãn lùi; việc phát hiện ở close LTF đầu của C3 có thể chậm một nến LTF. Entry chỉ bắt đầu ở bar mở từ availableAt sau lần quan sát đó, không lấy chính bar vừa quan sát MPS làm entry.
- Alerts **MPS + / MPS -** để bắt đầu tìm entry; E+/E- vẫn là điều kiện entry của timing đang chọn. Đổi code/input thì tạo lại alert TradingView vì alert đã tạo giữ snapshot cũ.

### Các cách entry sau MPS

| Timing | Sau khi MPS đã biết |
| --- | --- |
| Pullback (mặc định) | Bắt đầu tìm TS LTF và retest mới trên các nến từ sau MPS; không giữ một mẫu TS đã tích lũy trước cổng. Đây vẫn là model entry cá nhân. |
| Confirmation close | Xét TS LTF đã đóng trong giai đoạn sau MPS, không phát tại chính MPS. |
| R1 first leg · experimental | Nhận bàn giao reference, wick nến kích hoạt và thời điểm biết MPS; không đòi thêm first leg thứ hai hoặc TS LTF mới. Vùng hồi vẫn nhập tay; Declared at phải từ availableAt trở đi và trong C3. Chưa có vùng thì không có entry R1. |
| Early C2 | MPS tính trên C2 tạm thời; sau đó TS/retest trên nến tiếp theo. Một wick raid mới trước entry xóa nhịp cũ và xét lại P3/MPS, không dùng SL cuối C2 để chấm lại lịch sử. |

R1 vẫn chưa phải OTE/Model 1 gốc. Khi tắt MPS, nhánh R1 cũ bên dưới giữ quy tắc first leg trong C3 và 64 fixture riêng; các fixture đó không được gọi là nghiệm thu cổng MPS.

### Giới hạn dữ liệu và kiểm tra

Giới hạn tính toán mặc định là **600 nến chart**, điều chỉnh ở **Inputs → Calculation → Calculated bars**. Nến chart là khung đang mở: 600 bar M5 khoảng 50 giờ liên tục, M3 khoảng 30 giờ, M1 khoảng 10 giờ. Đây là thiết lập tích hợp của TradingView, thêm vào 31 setting khai báo. Tăng khi cần xem xa hơn hoặc cần đủ C1/C2 của HTF lớn; quá nhiều có thể tái gặp RE10110. M DATA cần kiểm tra cả giới hạn này. Với D1 trên M1 thường cần trên 2880 bar chỉ để phủ hai ngày C1/C2, cộng phần đã chạy của C3; tài khoản Basic có thể không chịu được khối lượng đó. Chưa chứng nhận mọi tổ hợp HTF/LTF trên Basic. Tham khảo [calc_bars_count của Pine](https://www.tradingview.com/pine-script-docs/language/declaration-statements/#calc_bars_count).

Giới hạn tính toán context nguồn còn **600 nến mỗi timeframe** thay cho yêu cầu 5000 trước đây, nhằm giảm khối lượng cho day trading. H1 tương đương khoảng 25 ngày liên tục; sản phẩm có phiên/ngày nghỉ sẽ khác. Đây là giới hạn lịch sử/khởi tạo, không phải timeout setup. Model/key/bias nằm ngoài dữ liệu đã tải không được bảo đảm giữ như bản lookback dài; dashboard DATA và nguồn có sẵn cần được đọc khi so kết quả. Không bù thiếu dữ liệu bằng mức giá phỏng đoán. History 100 là giới hạn nhãn, không đảm bảo có đủ 100 tín hiệu.

MPS cache theo timeframe + model + lần xác nhận, tối đa 128 attempt; pool 512 pivot; kiểm tra nguồn chart tối đa 5000 bar. Sau khi MPS biết vẫn hủy gate khi mất key, chạm INV/target, thiếu bar hoặc hết cửa sổ entry. Parent C1 tiếp tục theo vòng đời CRT hiện hành. Cùng bar chạm INV/target giữ trạng thái mơ hồ, không chọn thứ tự thuận lợi.

CSV khi bật MPS dùng **TFA audit schema=3**, có bốn cột MPS riêng cho mỗi nguồn: direction ở bar quan sát, P2, available ms, activation ms. Công cụ CSV TS cũ từ chối schema 3, không chứng nhận nhầm MPS. Tắt MPS thì schema 1/2 cũ theo timing. Không suy ra giao dịch khớp, PnL hoặc xác suất từ nhãn/alert.

node tools/check-crt.cjs hiện chạy 22 suite. Bộ mới thực thi thân hàm Pine với 70 ca Buy/Sell: nguồn P1/P3, P2 trực tiếp/sai thời điểm/đã tiêu thụ, key cùng/ngược hướng, close/râu/equality, quan sát không backdate, nguồn C2, barrier/gap/expiry, bàn giao R1, cổng TS/retest và Early gặp wick mới. Có ca kiểm tra dừng sớm khi C1 trước dữ liệu đã tải và không đọc quá buffer dù bar_index của dataset lớn. Harness không thay Pine runtime/rollback/feed hoặc backtest thị trường. Đã biên dịch exact source cuối không lỗi/cảnh báo. Đã chạy Brave BTCUSD M5 với H1/H4, Calculated bars=600; không thấy cảnh báo runtime sau tối ưu, dashboard hiện WAIT MPS và NO KEY ở cả hai nguồn. Đây là smoke test ca bị chặn, chưa phải xác minh tín hiệu MPS dương, Replay, reload causality hay hiệu suất thị trường.

Các mục R1 cũ dưới đây mô tả nhánh khi MPS tắt, trừ nơi nói rõ khác.

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

Đây là lựa chọn nghiên cứu. Nó gần với một cách xác nhận cấu trúc đã bị bỏ khỏi chỉ báo trước đây; R1 ghi rõ vai trò xác nhận cấu trúc này; tích hợp theo yêu cầu riêng của người dùng, không tuyên bố đây là Model 1 gốc hay khôi phục toàn bộ bộ lọc cũ.

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

**Đã hoàn thành ở mức ngoài chart:** quy tắc R1, module thực thi, fixture và kiểm tra nhân quả. **Giới hạn của nghiên cứu ngoài chart trước khi tích hợp thử nghiệm:** reference và vùng hồi được xác định độc lập trên ví dụ thị trường; đủ dữ liệu để kiểm chứng context/gate; đặc tả riêng cho nhịp đã xảy ra trong C2; và quyết định về cách chọn vùng tự động nếu không dùng annotation. Chưa gán R1 là Model 1/OTE chính thống, chưa tối ưu hoặc kết luận lợi nhuận.


## Sử dụng R1 trong chỉ báo

R1 là **chế độ thay thế** entry Confirmed, không chạy đồng thời với Pullback/Confirmation close. Mặc định vẫn Pullback. Hai nhánh Main và Larger tự có context, reference, leg, vùng và khóa tín hiệu. Biểu đồ vẫn dùng tam giác Buy xanh dưới nến / Sell đỏ trên nến hoàn tất phản ứng; hover để biết HTF và nhãn R1 EXP. Cụm HTF, IRL/ERL và vòng đời parent giữ quy tắc hiện hành.

1. Trong Inputs, chọn **Signal timing → R1 first leg · experimental**. Larger HTF signals vẫn cần bật, khung lớn phải không vượt Bias TF. Chart entry vẫn dùng các khung LTF đã hỗ trợ.
2. Hover **WHY** trên dashboard: R1 ghi reference, giờ reference được biết, giờ raid, giờ first leg đóng và cực trị nến xác nhận. Các giờ trong WHY là **New York có DST**, kể cả khi trục chart đang là UTC+7.
3. Khi leg đã xác nhận, nhập **Main zone low/high** và **Main declared at** ở nhóm **3b. R1 manual zones**. Vùng của Larger nhập ba ô Larger tương ứng; không dùng chung vùng. Low=High được phép cho một line. Pine không đọc được rectangle/line bạn tự vẽ trên chart.
4. Declared at phải từ lúc leg đóng trở đi, trong C3. Giá trị mặc định 0 là chưa khai báo; chưa có vùng thì không có tín hiệu R1. Chọn đúng múi giờ hiển thị trong bộ nhập ngày/giờ của TradingView khi đối chiếu WHY. Nếu khai báo giữa nến, nến đó chưa được xét; chờ nến sau mở từ mốc khai báo rồi đóng phản ứng.
5. Buy: vùng nằm trên INV và dưới High của nến xác nhận leg; đợi nến sau chạm vùng và đóng trên High vùng. Sell đối xứng. Close Buy ở/dưới Low vùng hoặc Sell ở/trên High vùng làm vùng mất hiệu lực. Không đuổi giá khi không có hồi.
6. Mỗi attempt/source tối đa một R1. Hết C3 dừng entry, không tự hủy parent. Khi chuyển setup mới cần khai báo vùng mới và thời gian mới; vùng của attempt cũ không tự được tái dùng. Signal cadence không tạo thêm lần entry R1 trong cùng attempt.
7. Early C2 là nhánh riêng: nếu vẫn bật, nó tiếp tục TS/Pullback cũ và có ký hiệu E, không lấy vùng R1 hoặc leg khi C2 đang chạy. Tắt Early nếu muốn chỉ quan sát R1 Confirmed. Trở về Pullback để ngừng R1; sáu ô R1 được bỏ qua trong chế độ cũ.

**Cách reference thực tế được hình thành:** dùng pivot LTF 2 nến trái/2 nến phải, chỉ thêm tại close xác nhận. Quét lại các nến LTF đóng của nến raid HTF đã cố định để xác định bar đầu tiên xuyên biên C1 tối thiểu một tick; yêu cầu coverage liên tục. Chọn swing High Buy / Low Sell gần nhất đã biết và chưa bị lấy tại giờ mở bar quét đó. Không dùng thời điểm cực trị cuối của raid. Nếu nguồn thiếu, chặn NO_RAID_DATA; không có swing phù hợp thì NO_REFERENCE; không tự chọn mức dễ phá hơn. R1 không đòi thêm một TS hai nến LTF trong C3. Toàn bộ first leg và entry vẫn phải ở C3.

Pine cố định reference, wick của nến xác nhận leg và bản sao vùng. Nến preview HTF live không cung cấp OHLC cho R1; nguồn model chỉ lấy snapshot đã đóng. Cửa sổ bắt đầu theo bucket C3 thực tế của feed, không giả định phiên sau mở ngay lúc C2 kết thúc. Nếu mất nến trong C3, DATA_GAP chặn attempt. State được lưu theo timeframe + model + lần xác nhận; đổi focus rồi quay về không phát lại tín hiệu cũ. Bộ nhớ giữ tối đa 128 attempt, 512 swing và xét tối đa 5000 bar nguồn; thiếu dữ liệu sẽ không suy đoán tín hiệu.

**Giới hạn cần hiểu:** Declared at là thông tin bạn nhập, không phải nhật ký bất biến chứng minh lúc bạn ra quyết định. Đổi Inputs làm Pine chạy lại toàn lịch sử; khai báo lùi giờ hoặc chọn vùng sau khi xem kết quả vẫn có thể tạo hindsight. Kiểm tra prefix chứng minh state machine không dùng OHLC tương lai khi cùng đầu vào, không chứng minh annotation thủ công không nhìn trước. Thời điểm quét chỉ có độ phân giải một nến LTF, chưa xác định thứ tự tick bên trong nến. Đây là triển khai cá nhân thử nghiệm, chưa xác minh Model 1, tỷ lệ thắng hay lợi nhuận thị trường.

**Xuất dữ liệu:** chế độ cũ giữ TFA audit schema=1. R1 dùng schema=2 và các cột R1 main / R1 larger riêng: direction, reference, reference known, leg known, zone known. Cột tín hiệu TS Confirmed cũ để trống trong R1. Công cụ audit CRT cũ cố ý từ chối schema=2; chưa có bộ nghiệm thu CSV R1 thị trường. Alerts Buy/Sell hiện có áp dụng chế độ Signal timing đang chọn; khi đổi Inputs cần tạo lại alert TradingView vì alert đã tạo giữ snapshot cấu hình cũ.

**Kiểm tra tích hợp:** node tools/check-crt.cjs chạy 21 suite, bao gồm thực thi trực tiếp phần scalar f_stepR1 trong Pine, so khớp toàn bộ 64 ca và 202 prefix với module nghiên cứu, kiểm tra selector/raid/pool, độc lập nguồn và Early vẫn Pullback. Đây là harness giới hạn, không thay Pine runtime, rollback, request.security hay feed thật. Các lệnh nghiên cứu ngoài chart và 64 fixture ở trên tiếp tục được giữ làm tham chiếu.
