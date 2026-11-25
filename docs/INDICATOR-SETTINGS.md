# Cài đặt CRT Key Reactions

Cập nhật 25/11/2026. [Đặc tả hiện hành và nguồn gốc](CRT-FIRST-LEG-SPEC.md). [Cài đặt trước migration](archive/INDICATOR-SETTINGS-before-key-reactions-2026-11-25.md) chỉ dùng đối chiếu lịch sử.

Mặc định có 28 input khai báo và ô Calculated bars tích hợp của TradingView. MPS gate chung và sáu ô R1 nhập tay đã bỏ. Không có fibo hay vùng entry LTF tự vẽ.

| Mục | Mặc định / cách dùng |
| --- | --- |
| HTF / chart | H1 / M5 để bắt đầu; HTF có H1/H2/H4/D1. Engine entry ở M1/M3/M5/M15 chia hết HTF. |
| Bias TF / Bias | D1 / Auto. Bias cấu trúc dùng nến đã đóng; có Long/Short/Neutral chủ động. |
| CRT reversal at prior HTF key | Bật. Ngược bias cần key bối cảnh trước C2 và TS/P3 trực tiếp tại key HTF; không cho phép mọi TS chỉ vì key cũ còn giữ. Không đổi bias hoặc vượt B0/B0!. |
| Entry branches | TS + FVG + OTE. Chọn TS close để chỉ xem nến sweep; FVG / OTE để chỉ xem nhánh hồi. |
| Structure timeframe | Chart mặc định. Chọn M15 trên chart nhỏ hơn để dùng swing/close M15 xác nhận MPS; entry vẫn trên chart. Không ép một cặp HTF/LTF cố định. |
| Signal cadence | Fresh reaction: ngân sách riêng từng nhánh/nhịp/attempt. One per model để xem thưa hơn. |
| Require prior HTF key reaction | Bật. TS/P3 phải trực tiếp phản ứng tại key H1/HTF chính/Larger/Bias đã biết trước nhịp quét. Tắt chỉ chẩn đoán TS/FVG cùng bias; MPS/OTE và CRT ngược bias vẫn cần local key. |
| Key types | All. Có thể đối chiếu riêng Swing, Swing + FVG, Swing + OB hoặc Open / Close. |
| SMT comparison | Trống = tắt. Tự chọn mã so sánh và Direct/Inverse phù hợp; chỉ hiển thị bằng chứng, không tạo tam giác riêng. |
| Early C2 | Bật thử nghiệm theo yêu cầu. Chỉ điều khiển quyền phát E; tắt vẫn quan sát C2 và chuyển bằng chứng hợp lệ sang setup xác nhận. Không phát E hồi tố. |
| Larger HTF / signals | Auto và bật. H1/H2 → H4, H4 → D1, D1 → W1. Engine Larger chỉ chạy khi khung đó <= Bias TF. |
| History / historical signals | History / 100. Latest chỉ giữ sự kiện gần nhất; 0 ẩn marker. |
| CRT range / target / HTF key | Bật. CRTH/CRTL, EQ, INV, TGT và KEY có loại/khung nguồn; không còn IRL/ERL. |
| Cluster / follow / last ended | Hai cụm bật; follow 6 nến; LAST mặc định tắt. Không thay logic hiệu lực setup. |
| Drawing horizon / recency | 3 HTF; giới hạn hình/line, không làm setup hết hạn. |
| Calculated bars | 600 chart bar, có thể tăng khi cần lịch sử; theo dõi giới hạn runtime tài khoản. |

Key FVG, OB và open/close phải đủ quy tắc xác nhận của mã, không phải mọi hình tự đánh dấu thủ công. SMT là detector giới hạn trên hai range HTF đã đóng với timestamp đồng bộ. Xem công thức, invalidation và phạm vi chưa triển khai trong đặc tả.

Khi thay phiên bản, xem lại Inputs vì timing cũ đã đổi thành Entry branches. Các alert TradingView cũ là snapshot script cũ; tạo lại nếu muốn chạy điều kiện mới. CSV schema 4 chưa có auditor thị trường đầy đủ; công cụ TS-only cũ chủ động từ chối.

Nhãn MPS dùng font tự điều chỉnh 8–12 point theo mật độ nến trong vùng nhìn ngang, không theo Chart text size chung. Không có bảng thời gian/trace phủ chart trong bản phát hành. MPS giờ giữ cặp P1/P2 của sóng đã raid/reclaim và giải phóng parent đã mở rộng quá một range; các tam giác/OTE có thể khác phiên bản chỉ dùng pivot gần nhất. Xem đặc tả để phân biệt quy tắc mã hóa này với cách đọc discretionary.

Mũi tên History ghi nguồn tại lúc phát, không đổi theo panel khi có setup mới ngược hướng. Hover để xem HTF/hướng, C1, giờ close UTC+7 và P3 KEY. WAIT P3 KEY nghĩa là đã có TS nhưng chưa chứng minh tiếp xúc key HTF của chính nhịp đó; MPS không được xác nhận chỉ từ key bối cảnh cũ. Không thêm chữ dài lên chart; thông tin chi tiết ở tooltip.

Early C2 hiện chỉ truyền cấu trúc cho MPS/OTE nếu P1 → P2 → P3 đúng thứ tự thời gian và P3 thực sự quét P1. TS-close Early vẫn độc lập với MPS. Hover MPS để xem P1/P2/P3 nguồn; nhãn H2 chỉ context HTF, các swing MPS vẫn thuộc chart LTF. Không cần đổi input sau bản sửa này.

Tooltip entry ghi vai trò chuỗi FROM C2 / LOCAL C3 / LOCAL TRACK, bối cảnh FLOW / CONT / KEY REV / HTF KEY REV / COUNTER SWING và key HTF kế tiếp nếu có. Đây là phân loại theo quy ước trong đặc tả, không khẳng định hướng sẽ thắng. Key cản trung gian hiện chỉ là quan sát: tooltip WHY ghi loại, giá và thời điểm chạm; không dùng KEY DELIVERED để hủy leg. Target CRT, INV, giới hạn nhánh và thời gian chờ bằng chứng vẫn được giữ.

Bản sửa sau rà soát nhiều thị trường ngày 25/11/2026:

- Counter D1 hoặc counter parent CRT có key cần cả key bối cảnh, key phản ứng P3 và P1 → P2 → P3 đúng thứ tự, P3 quét P1 rồi đóng lại. Hai nến liền kề đơn lẻ không đủ. WHY có thể ghi WAIT CT SWING; Early có E WAIT CT SWING. Không ép mọi entry phải chờ MPS.
- Key types = All đã gồm trung điểm râu trên/dưới của tuần đã đóng; chọn Weekly wick để chỉ xét loại này. Nhãn WW-L50/W1 và WW-H50/W1. Body min/max dùng cả open và close; high/low gồm râu. Tuần đang chạy không được dùng làm nguồn key này. Phản ứng tại midpoint là chạm và đóng lại qua mức; không đòi quét đáy/đỉnh cả tuần.
- Key tuần dùng cùng feed chart. Bằng chứng reclaim cho entry bị mất khi H1 đã đóng sau phản ứng xuyên ngược mức; cơ chế sticky của nhịp TS vẫn áp dụng. Tham chiếu tuần được thay khi có tuần mới hoàn tất; không tự kéo mức futures sang spot.
- Cấu hình đối chiếu ban đầu: M5, HTF H1 hoặc H2 tùy setup, Bias D1 Auto, Structure Chart, TS close, Fresh reaction, Require prior HTF key reaction bật. Khi kiểm tra MPS M15 thì đổi riêng Structure M15. Sau đó mới bật thêm FVG/OTE và so sánh từng nguồn main/higher/Early/counter bằng tooltip. Đây là cấu hình chẩn đoán, chưa phải setting đã chứng minh tối ưu lợi nhuận; mặc định All branches không đổi.
