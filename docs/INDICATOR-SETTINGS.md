# Cài đặt CRT Key Reactions

Cập nhật 26/11/2026. [Đặc tả hiện hành và nguồn gốc](CRT-FIRST-LEG-SPEC.md). [Cài đặt trước migration](archive/INDICATOR-SETTINGS-before-key-reactions-2026-11-25.md) chỉ dùng đối chiếu lịch sử.

Mặc định có 30 input khai báo và ô Calculated bars tích hợp của TradingView. MPS gate chung và sáu ô R1 nhập tay đã bỏ. Không có fibo hay vùng entry LTF tự vẽ.

Calculation budget: Light mặc định tải 24 nến trên mỗi nguồn timeframe; Full tải 600. **Calculated bars mặc định 150 nến chart** (khoảng 12,5 giờ trên M5, có thể dài hơn khi có khoảng nghỉ phiên). Light có thể thiếu model/key cũ hoặc khởi tạo bias khác Full. Đây là giới hạn tải cho tài khoản có thời gian tính toán ngắn, không phải setting được tối ưu tỷ lệ thắng. Khi cần lịch sử rộng hơn, điều chỉnh cả Calculation budget và Calculated bars; Full có thể vẫn vượt runtime của tài khoản. Không thử lại liên tục một mã đang báo compilation timeout; xem [ghi nhận lỗi và kiểm tra](research/CRT-COMPILE-TIMEOUT-2026-11-25.md).

| Mục | Mặc định / cách dùng |
| --- | --- |
| H2 / H4 clock | TopstepX mặc định trên OANDA:XAUUSD và STONEXTRADING:USTECH100CFD: ghép H1 theo phiên 17:00 Chicago có DST. Dùng chung cho C1/C2, key, Early và hai cụm nến. Native để trở về nến của feed; mã khác luôn native. Xem [phạm vi và cách đối chiếu](CRT-TOPSTEP-CLOCK.md). |
| HTF / chart | H1 / M5 để bắt đầu; HTF có H1/H2/H4/D1. Engine entry ở M1/M3/M5/M15 chia hết HTF. |
| Bias TF / Bias | D1 / Auto. Bias cấu trúc dùng nến đã đóng; có Long/Short/Neutral chủ động. |
| CRT reversal at prior HTF key | **Tắt mặc định.** Ngược bias chỉ quan sát. Bật cần CRT HTF đã đóng tại key hoặc parent cùng hướng đã xác nhận tại key, cộng cấu trúc/key LTF. Không vượt parent còn sống đang ngược hướng hoặc B0. Early không tự cấp quyền đảo chiều HTF. |
| Entry branches | **FVG / OTE mặc định:** chờ nhánh hồi sau TS. Chọn TS close nếu chủ động muốn xem entry ngay nến quét; TS + FVG + OTE mở cả ba nhánh. |
| Structure timeframe | Chart mặc định. Chọn M15 trên chart nhỏ hơn để dùng swing/close M15 xác nhận MPS; entry vẫn trên chart. Không ép một cặp HTF/LTF cố định. |
| Signal cadence | Fresh reaction: ngân sách riêng từng nhánh/nhịp/attempt. One per model để xem thưa hơn. |
| Require prior HTF key reaction | Bật. TS/P3 phải trực tiếp phản ứng tại key H1/HTF chính/Larger/Bias đã biết trước nhịp quét. Tắt chỉ chẩn đoán TS/FVG cùng bias; MPS/OTE và CRT ngược bias vẫn cần local key. |
| Key types | All. Có thể đối chiếu riêng Swing, Swing + FVG, Swing + OB hoặc Open / Close. |
| SMT comparison | Trống = tắt. Tự chọn mã so sánh và Direct/Inverse phù hợp; chỉ hiển thị bằng chứng, không tạo tam giác riêng. |
| Early C2 | Bật thử nghiệm theo yêu cầu. Fresh reaction: một E trên mỗi attempt; sau vô hiệu cần quét sâu thêm ít nhất một tick và reclaim đủ key để có E2/E3. One per model: tối đa một E/C2. Tắt vẫn quan sát và chuyển bằng chứng hợp lệ; không phát hồi tố. |
| Larger HTF / signals | Auto và bật. H1/H2 → H4, H4 → D1, D1 → W1. Entry Larger chỉ phát khi khung đó <= Bias TF. Tắt phát tín hiệu hoặc ẩn cụm vẫn giữ context Larger trong bộ kiểm tra xung đột. |
| History / historical signals | History / 100. Latest chỉ giữ sự kiện gần nhất; 0 ẩn marker. |
| CRT range / target / HTF key | Bật. CRTH/CRTL, EQ, INV, TGT và KEY có loại/khung nguồn; không còn IRL/ERL. |
| Cluster / follow / last ended | Hai cụm bật; follow 6 nến; LAST mặc định tắt. Không thay logic hiệu lực setup. |
| Drawing horizon / recency | 3 HTF; giới hạn hình/line, không làm setup hết hạn. |
| Calculated bars | 150 chart bar mặc định; tăng khi cần lịch sử và theo dõi giới hạn runtime tài khoản. |

Input không hiện dài trên status line nhưng vẫn chỉnh trong Inputs. TGT được gộp với CRTH hoặc CRTL cùng mức; các nhãn còn lại là EQ, INV và KEY. Hover tên cụm để xem giờ mở/đóng nguồn và OHLC. [Nghiệm thu bản đồng hồ TopstepX](research/crt-topstep-clock-validation-2026-11-25.json) tách riêng kết quả compiler, runtime và giới hạn dữ liệu.

Key FVG, OB và open/close phải đủ quy tắc xác nhận của mã, không phải mọi hình tự đánh dấu thủ công. SMT là detector giới hạn trên hai range HTF đã đóng với timestamp đồng bộ. Xem công thức, invalidation và phạm vi chưa triển khai trong đặc tả.

Khi thay phiên bản, xem lại Inputs vì timing cũ đã đổi thành Entry branches. Các alert TradingView cũ là snapshot script cũ; tạo lại nếu muốn chạy điều kiện mới. CSV schema 4 chưa có auditor thị trường đầy đủ; công cụ TS-only cũ chủ động từ chối.

Nhãn MPS dùng font tự điều chỉnh 8–12 point theo mật độ nến trong vùng nhìn ngang, không theo Chart text size chung. Không có bảng thời gian/trace phủ chart trong bản phát hành. MPS giờ giữ cặp P1/P2 của sóng đã raid/reclaim và giải phóng parent đã mở rộng quá một range; các tam giác/OTE có thể khác phiên bản chỉ dùng pivot gần nhất. Xem đặc tả để phân biệt quy tắc mã hóa này với cách đọc discretionary.

Mũi tên History ghi nguồn tại lúc phát, không đổi theo panel khi có setup mới ngược hướng. Hover để xem HTF/hướng, C1, giờ close UTC+7 và P3 KEY. WAIT P3 KEY nghĩa là đã có TS nhưng chưa chứng minh tiếp xúc key HTF của chính nhịp đó; MPS không được xác nhận chỉ từ key bối cảnh cũ. Không thêm chữ dài lên chart; thông tin chi tiết ở tooltip.

Early C2 hiện chỉ truyền cấu trúc cho MPS/OTE nếu P1 → P2 → P3 đúng thứ tự thời gian và P3 thực sự quét P1. TS-close Early vẫn độc lập với MPS. Hover MPS để xem P1/P2/P3 nguồn; nhãn H2 chỉ context HTF, các swing MPS vẫn thuộc chart LTF. Không cần đổi input sau bản sửa này.

Cập nhật 26/11/2026: Fresh reaction nhận E2/E3 sau khi attempt trước vô hiệu, quét thêm ít nhất một tick và reclaim hợp lệ tại key HTF. Chạm bằng cực trị cũ không mở lại. Mỗi nhịp giữ một E, kể cả nhánh fallback; không mở lại sau target hoặc AMB. Nhãn cũ giữ mức tham chiếu của chính nó. Tooltip E ghi HTF nguồn và số attempt; đây vẫn là tín hiệu trước khi C2 HTF đóng. Mức risk/SL tự điều chỉnh khi giao dịch độc lập với tham chiếu chỉ báo. Xem [nghiệm thu vòng đời TS](research/crt-early-renewal-validation-2026-11-26.json).

Tooltip entry ghi vai trò chuỗi FROM C2 / LOCAL C3 / LOCAL TRACK và bối cảnh FLOW / CONT / KEY REV / HTF KEY REV. `HTF CONFLICT` chặn entry khi parent còn sống ngược hướng; `COUNTER OBS` là ngược bias khi counter tắt; `WAIT HTF REV` là chưa có xác nhận đảo chiều HTF; `LEG DONE / NEW TS` yêu cầu TS mới sau checkpoint. EQ/cản không đổi TP hoặc buộc chốt một phần; chỉ ngăn tái dùng FVG/OTE của leg đã tới checkpoint. MPS vẫn được quan sát. Xem [nghiệm thu quyền entry](research/crt-context-permission-validation-2026-11-26.json).

Bản sửa sau rà soát nhiều thị trường ngày 25/11/2026:

- Counter D1 cần chủ động bật và có quyền đảo chiều HTF theo chính sách 26/11 ở trên; không được counter CRT cha còn sống đang ngược hướng. Khi được cấp quyền vẫn cần key bối cảnh, key P3 và P1 → P2 → P3 đúng thứ tự. Không ép mọi entry thuận hướng phải chờ MPS.
- Key types = All đã gồm trung điểm râu trên/dưới của tuần đã đóng; chọn Weekly wick để chỉ xét loại này. Nhãn WW-L50/W1 và WW-H50/W1. Body min/max dùng cả open và close; high/low gồm râu. Tuần đang chạy không được dùng làm nguồn key này. Phản ứng tại midpoint là chạm và đóng lại qua mức; không đòi quét đáy/đỉnh cả tuần.
- Key tuần dùng cùng feed chart. Bằng chứng reclaim cho entry bị mất khi H1 đã đóng sau phản ứng xuyên ngược mức; cơ chế sticky của nhịp TS vẫn áp dụng. Tham chiếu tuần được thay khi có tuần mới hoàn tất; không tự kéo mức futures sang spot.
- Cấu hình đối chiếu TS riêng: M5, HTF H1 hoặc H2 tùy setup, Bias D1 Auto, Structure Chart, TS close, Fresh reaction, Require prior HTF key reaction bật. Khi kiểm tra MPS M15 thì đổi riêng Structure M15. Đây là cấu hình chẩn đoán; mặc định day trading hiện dùng FVG / OTE để giữ cách vào Pullback.

Mặc định day trading đã chốt: H1/M5, Bias D1 Auto, Larger Auto (H4 với H1/H2), TopstepX clock, Structure Chart, Fresh reaction, FVG / OTE, prior HTF key bật, Key types All, counter tắt. Early C2 giữ bật theo yêu cầu, nhưng với FVG / OTE cũng phải chờ nhánh hồi hợp lệ trước khi phát E; tắt Early vẫn giữ quan sát/handoff. SMT mặc định để trống, không tự chọn mã tương quan. History 100, hai cụm bật, follow 6, LAST tắt; Light và Calculated bars 150. Đây là profile phù hợp quy trình và hạn mức chạy đã kiểm tra, chưa phải cấu hình tối ưu lợi nhuận. Khi nạp lại cần Reset settings để TradingView không giữ input cũ.
