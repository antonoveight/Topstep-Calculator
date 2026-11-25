# Cài đặt CRT Key Reactions

Cập nhật 25/11/2026. [Đặc tả hiện hành và nguồn gốc](CRT-FIRST-LEG-SPEC.md). [Cài đặt trước migration](archive/INDICATOR-SETTINGS-before-key-reactions-2026-11-25.md) chỉ dùng đối chiếu lịch sử.

Mặc định có 27 input khai báo và ô Calculated bars tích hợp của TradingView. MPS gate chung và sáu ô R1 nhập tay đã bỏ. Không có fibo hay vùng entry LTF tự vẽ.

| Mục | Mặc định / cách dùng |
| --- | --- |
| HTF / chart | H1 / M5 để bắt đầu; HTF có H1/H2/H4/D1. Engine entry ở M1/M3/M5 chia hết HTF. |
| Bias TF / Bias | D1 / Auto. Bias cấu trúc dùng nến đã đóng; có Long/Short/Neutral chủ động. |
| CRT reversal at prior HTF key | Bật. Cho phép CRT phản ứng key ngược bias; không đổi bias tổng thể và không vượt B0/B0!. |
| Entry branches | TS + FVG + OTE. Chọn TS close để chỉ xem nến sweep; FVG / OTE để chỉ xem nhánh hồi. |
| Signal cadence | Fresh reaction: ngân sách riêng từng nhánh/nhịp/attempt. One per model để xem thưa hơn. |
| Require prior HTF key reaction | Bật. Tắt chỉ để chẩn đoán sự khác biệt; không tự cho phép CRT ngược bias thiếu key. |
| Key types | All. Có thể đối chiếu riêng Swing, Swing + FVG, Swing + OB hoặc Open / Close. |
| SMT comparison | Trống = tắt. Tự chọn mã so sánh và Direct/Inverse phù hợp; chỉ hiển thị bằng chứng, không tạo tam giác riêng. |
| Early C2 | Bật thử nghiệm theo yêu cầu. Dấu E tại close sweep/reclaim còn C2 live, chưa xác nhận CRT HTF. |
| Larger HTF / signals | Auto và bật. H1/H2 → H4, H4 → D1, D1 → W1. Engine Larger chỉ chạy khi khung đó <= Bias TF. |
| History / historical signals | History / 100. Latest chỉ giữ sự kiện gần nhất; 0 ẩn marker. |
| CRT range / target / HTF key | Bật. CRTH/CRTL, EQ, INV, TGT và KEY có loại/khung nguồn; không còn IRL/ERL. |
| Cluster / follow / last ended | Hai cụm bật; follow 6 nến; LAST mặc định tắt. Không thay logic hiệu lực setup. |
| Drawing horizon / recency | 3 HTF; giới hạn hình/line, không làm setup hết hạn. |
| Calculated bars | 600 chart bar, có thể tăng khi cần lịch sử; theo dõi giới hạn runtime tài khoản. |

Key FVG, OB và open/close phải đủ quy tắc xác nhận của mã, không phải mọi hình tự đánh dấu thủ công. SMT là detector giới hạn trên hai range HTF đã đóng với timestamp đồng bộ. Xem công thức, invalidation và phạm vi chưa triển khai trong đặc tả.

Khi thay phiên bản, xem lại Inputs vì timing cũ đã đổi thành Entry branches. Các alert TradingView cũ là snapshot script cũ; tạo lại nếu muốn chạy điều kiện mới. CSV schema 4 chưa có auditor thị trường đầy đủ; công cụ TS-only cũ chủ động từ chối.

Nhãn MPS dùng font tự điều chỉnh 8–12 point theo mật độ nến trong vùng nhìn ngang, không theo Chart text size chung. Không có bảng thời gian/trace phủ chart trong bản phát hành. MPS giờ giữ cặp P1/P2 của sóng đã raid/reclaim và giải phóng parent đã mở rộng quá một range; các tam giác/OTE có thể khác phiên bản chỉ dùng pivot gần nhất. Xem đặc tả để phân biệt quy tắc mã hóa này với cách đọc discretionary.
