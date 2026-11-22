# Vì sao có CRT mà không có tam giác? · 22/11/2026

Tam giác Confirmed là tín hiệu thực thi LTF của **HTF chính trong setting**, không phải dấu đánh trên mọi cặp CRT nhìn thấy. Cụm HTF lớn hơn hiện chỉ hiển thị OHLC; nó không chạy engine CRT/entry thứ hai. Muốn kiểm tra nhánh H4 hiện tại phải chọn HTF chính H4. Việc thêm engine thứ hai cần quy tắc riêng về ưu tiên, trùng nhịp và nguồn tín hiệu; chưa tự thêm trong thay đổi giao diện này.

Nhánh mặc định Pullback: C2 HTF đóng xác nhận → trong nến HTF kế tiếp, hai nến LTF cùng hình thành trong cửa sổ → TS cùng hướng đã đóng → một nến LTF **sau TS** retest biên thu hồi, đóng đúng phía và giữ cực trị TS → còn đường tới target, chưa chạm SL, bias/key và khóa sóng cho phép → tam giác tại nến retest đóng. Mẫu CRT HTF đạt target không chứng minh các điều kiện này từng xảy ra.

## Đối chiếu trường hợp BTCUSD trong ảnh

Đọc trực tiếp tooltip WHY sau Update on chart trong Brave, BTCUSD CRYPTO, M5, HTF H1, Pullback/Fresh reaction:

- C1 mở 21/11 08:00 NY, C2 xác nhận 10:00 NY. Theo dõi cửa sổ C3 sau xác nhận.
- Đã xét **12 nến M5 đóng** trong cửa sổ đó.
- Có **2 mẫu TS hình thái**, **0 retest hợp lệ**, **0 tín hiệu**. Mẫu TS hình thái chưa đồng nghĩa tất cả bộ lọc đã đạt.
- Không có entry đã đạt trigger rồi bị một bộ lọc sau đó chặn (`Entry blocked -`). Trạng thái cuối C3 là **WAIT RETEST**.

Kết luận cho trường hợp này: thiếu bước retest hợp lệ trong cửa sổ Pullback; không phải chỉ báo phát Sell rồi mất hình. Khi qua C3, range vẫn TRACK nhưng không mở entry từ xác nhận cũ. Không thêm tam giác hồi tố chỉ vì giá đã đi theo hướng model. Số liệu là của chart/feed và setting được kiểm tra, không phải kiểm chứng lợi nhuận hoặc mọi setup H4.

## Chẩn đoán và hiển thị

Hover ô **WHY** trên dashboard để xem số nến, TS hình thái, retest, tín hiệu, entry bị chặn và trạng thái cuối cửa sổ. Bộ đếm ghi theo token C1 + thời điểm xác nhận + hướng, lưu tối đa 128 attempt để không mất số liệu khi đổi focus rồi quay về TRACK. Chỉ đếm nến đóng trong nhánh LTF; không nhập Early E vào thống kê Confirmed. Số 0 với 0 nến đã xét là **không có coverage**, không được suy ra không có TS. Một attempt bị loại khỏi cache cũng không còn đủ thống kê.

Giao diện hai cụm chỉ hiện **H1/H4** (hoặc timeframe chọn) phía trên và **HH:MM:SS** dưới nến live. Cụm chính và cụm lớn có đồng hồ riêng từ giờ đóng bucket thật của feed; khung trên một ngày có thêm số ngày. Không còn chữ C1/C2/R, N*, TRACK, FOLLOW hoặc LAST trên các cụm. Nến LAST vẫn giữ màu mờ khi bật; metadata còn ở tooltip tiêu đề/dashboard. Tắt cụm/giảm số nến phải xóa chữ thừa. Đồng hồ cập nhật theo lần indicator nhận dữ liệu; Pine không cung cấp timer nền khi thị trường ngừng cập nhật. Nến đã hết thời gian hiện Closed, nguồn thiếu hiện dấu gạch.

Không đổi điều kiện giao dịch để ép có thêm dấu trong lần này. Vẫn giữ tùy chọn Confirmation close có sẵn nếu chủ động muốn bỏ bước đợi Pullback; đó là một quy tắc vào khác, chưa được chứng minh tốt hơn.

Đã chạy 17 suite CRT, có kiểm tra thân hàm countdown và cờ chẩn đoán từ channel thực tế. TradingView biên dịch exact canonical source không lỗi/cảnh báo; Brave chạy hai clock và tooltip thực tế. Chưa nghiệm thu Replay thị trường cho bản này.
