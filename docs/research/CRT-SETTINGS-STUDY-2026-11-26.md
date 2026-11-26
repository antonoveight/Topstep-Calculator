# Đối chiếu setting CRT theo phương pháp và quy trình Pullback

Ngày 26/11/2026. Chạy lại bằng `node tools/study-crt-settings.cjs`. [Kết quả từng tổ hợp](crt-settings-study-2026-11-26.json).

## Kết quả và giới hạn

24 tổ hợp của Entry branches × Signal cadence × Require key × Counter được chạy trên các hàm thực tế trích từ Pine: 528 lượt và 288 đối chiếu tiền tố. OHLC, pivot đã biết và context HTF là dữ liệu dựng đối xứng Buy/Sell; không phải lịch sử XAUUSD/MNQ, không có khớp lệnh hoặc thống kê lợi nhuận. Bộ kiểm tra hiện hành gồm 35 suite cũng đạt.

Tiêu chí lựa chọn được công bố trước: giữ entry Pullback, bắt buộc key HTF, ngược bias chỉ quan sát, không vượt CRT cha đang xung đột, chỉ phát sau close và không thay đổi tín hiệu khi nối thêm dữ liệu tương lai. Đây là tiêu chí kết hợp phương pháp với lựa chọn cá nhân, không phải một bảng điểm do Romeo công bố.

Hai tổ hợp đạt các điều kiện đã đo: FVG/OTE, require key bật, counter tắt, với Fresh reaction hoặc One per model. Trong đường giá dựng, Fresh reaction phát OTE ở nến 104 và FVG ở nến 105; One per model chỉ giữ OTE. Giữ Fresh reaction theo lựa chọn đã có để không khóa cả setup sau nhánh đầu tiên. Điều này không chứng minh nhánh thứ hai có kỳ vọng lợi nhuận tốt hơn.

TS close và All branches có entry ngay nến sweep ở 101, nên không thỏa yêu cầu chỉ vào Pullback. Hai lựa chọn đó không sai phương pháp; chúng phục vụ cách vào khác. Tắt require key cho phép một số tín hiệu thiếu key; bật counter cho phép các phản ứng ngược bias đủ điều kiện, vì vậy không phù hợp profile đang chọn. Mọi tổ hợp đều tiếp tục chặn xung đột parent và nến chưa đóng trong các ca đã đo.

## Đối chiếu nguồn gốc

[Romeotpt: CRTology ep.5 — MPS](https://www.youtube.com/watch?v=Q-mne0H4lRY&t=155s), đối chiếu bản chép lời đã lưu và hồ sơ [nguồn MPS](romeotpt-mps-sources.json): điểm 3 tại key (03:43–03:57), close qua điểm 2 kích hoạt MPS (02:58 và ví dụ đối xứng), sau đó có nhịp hồi sâu trước leg tiếp theo (08:18 trở đi và 10:15–10:36). Video không cung cấp một bộ Inputs Pine tối ưu hay quy tắc cơ học hoàn chỉnh cho mọi thị trường.

[CRT secrets ep.5 — Key level](https://www.youtube.com/watch?v=p8UYOgVn1-g&t=352s), hồ sơ [nguồn key](crt-key-level-review-2026-11-25.json): phân biệt giá đi tới key với phản ứng khi đã đến key. [Đặc tả](../CRT-FIRST-LEG-SPEC.md) phân biệt rõ nguồn gốc, các công thức key/pivot đã mã hóa và những giới hạn discretionary chưa tái tạo đầy đủ.

H1/M5 là khung thao tác cá nhân; D1 Auto và H4 Auto là lớp context của chỉ báo. Chưa có kiểm nghiệm lịch sử để khẳng định H1 tốt hơn H2, D1 Auto dự báo đúng hơn cách đọc thủ công, hay Chart tốt hơn M15 cho MPS. Giữ Chart để MPS đọc chính cấu trúc M5; không ép M15 rồi bỏ qua cấu trúc M5 đã được người dùng xác định là hợp lệ.

## Cấu hình áp dụng

| Setting | Giá trị | Cơ sở |
| --- | --- | --- |
| Chart / HTF | M5 / H1 | Quy trình Topstep đang dùng; chưa xếp hạng hiệu quả khung |
| Bias / Larger | D1 Auto / H4 Auto | Giữ context, kiểm tra CRT cha còn hiệu lực |
| Entry branches | FVG / OTE | Giữ cách vào hồi; OTE cần MPS, FVG độc lập |
| Require prior HTF key / Key types | Bật / All | Không loại key swing, OB, open/close hoặc weekly wick chỉ vì không có FVG |
| Counter | Tắt | Ưu tiên thuận bối cảnh; phản ứng ngược bias vẫn được quan sát |
| Structure / Cadence | Chart / Fresh reaction | Giữ cấu trúc entry hiện hành và ngân sách riêng từng nhánh |
| Early C2 | Bật thử nghiệm | Yêu cầu trước đó của người dùng; C2 chưa đóng, không tương đương CRT đã xác nhận |
| SMT | Trống | Không tự đặt mã tương quan khi chưa xác định cặp |
| Clock | TopstepX | Quy ước session đã đối chiếu trên hai feed hỗ trợ; giá vẫn của chart |
| Budget / Calculated bars | Light / 150 | Giới hạn runtime, không phải lựa chọn tối ưu chất lượng tín hiệu |

Không đổi công thức hoặc mặc định Pine vì cấu hình hiện tại đã khớp kết quả lựa chọn. Reset Inputs và áp dụng lại trên Brave. Hash nguồn và nghiệm thu compiler của lần trước vẫn phải khớp chính xác; không cần gửi lại cùng mã để biên dịch chỉ vì thêm công cụ đối chiếu.

Light chỉ tải 24 nến mỗi nguồn và 150 nến chart có thể thiếu context/key hoặc tín hiệu cũ. Cấu hình này chưa giải quyết đánh giá tần suất dài hạn. Muốn kết luận cấu hình có xác suất tốt hơn cần dữ liệu thị trường có timestamp/feed/session nhất quán và quy tắc entry/SL/TP cụ thể.
