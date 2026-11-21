# Cài đặt CRT V1

Áp dụng cho `indicators/funded-angler-v6.pine` và `chibao.txt` từ 21/11/2026. Có 25 input, phần lớn dành cho hiển thị. [Đặc tả logic](CRT-V1-SPEC.md) được ưu tiên; [hướng dẫn multi-model cũ](archive/INDICATOR-SETTINGS-multimodel-2026-11-21.md) chỉ để đối chiếu.

## Bắt đầu với cấu hình mặc định

Chart M5 tiêu chuẩn → HTF H1 → Bias TF D1 → Bias Auto → LTF Auto → Pullback → Fresh reaction. Giữ time filter `Context only` và History 100. Đây là cấu hình phù hợp bộ ca workflow tổng hợp, **chưa phải tối ưu lợi nhuận/tần suất thị trường**.

Chỉ cần chọn HTF/Bias theo phân tích thực tế. Không nới điều kiện vì ít tam giác: trước tiên xem WHY để biết đang thiếu xác nhận, retest, key ngược bias hay đã hết C3. Một sóng đẹp không hồi có thể không có dấu ở Pullback.

## Ý nghĩa 25 input

| Input | Mặc định và cách dùng |
| --- | --- |
| HTF | H1; chọn H1/H2/H4/D1. C1–C2 lấy từ khung này. |
| Context timeout | 8 nến sau C2; 0 tắt, tối đa 48. Chỉ giới hạn quan sát; entry luôn kết thúc sau C3. |
| Bias TF | D1, phải >= HTF hiệu lực. H1/H2/H4/D1. |
| Bias | Auto theo swing/close đã xác nhận; Long/Short là chủ động, Neutral chặn tín hiệu. |
| CRT reversal at prior HTF key | Bật. Ngược bias cần key HTF có trước C1, phản ứng C2 và xác nhận C/M. B0/B0! vẫn chặn. |
| Signal cadence | Fresh reaction: pivot hồi mới và tiến triển; One per model: chỉ một dấu. Cả hai chỉ trong C3. |
| Signal timing | Pullback đợi nến sau xác nhận hồi lại mức/vùng. Confirmation close cho dấu ở close C/M; FVG/OB vẫn đợi retest sau hình thành. |
| LTF condition | Auto dùng C/M và retest. Chọn CISD/MSS nếu muốn riêng một hình thái; FVG/OB retest vẫn cần C/M trước đó. |
| Time filter for E | Context only không chặn giờ. Web macros/working windows dùng lịch NY có DST; không phải lịch riêng Romeo đã kiểm chứng. |
| Macro background | Tắt; chỉ tô nền quan sát. |
| QT clock context | Bật; thời gian quý không tự tạo hướng. |
| CRT HTF candle groups | Bật; cặp nguồn C1–C2 và FOLLOW từ C3 tách riêng. |
| Follow candles to show | 6; chọn 2–12 nến cuối. Dấu … là số nến lược hiển thị, không bỏ dữ liệu logic. |
| Last ended model cluster | Tắt; bật để xem LAST với TG/INV/TO/AMB/HIST/CAP. CAP là nhường slot lưu trữ, không phải SL. Không phát entry từ lịch sử. |
| Cluster offset | 30 bar chart; tăng nếu cần thêm khoảng trống bên phải. |
| Cluster body width | 4 bar; số lẻ làm tròn xuống chẵn, râu đồng tâm 1 px. |
| Model range / ERL / CP | Bật RH/RL, EQ, INV, CP và ERL có nguồn. EQ* là EQ đã chạm, không phải full TP. |
| HTF internal references | Bật FVG/OB/swing trong range. Đây là tham chiếu phân tích; không phải kênh tín hiệu khác. |
| Compact panel | Bật; HTF/LTF, hướng CRT, bias, reference, giờ, entry, số dấu và WHY. |
| Signal display | History giữ quá khứ; Latest chỉ giữ dấu mới nhất. Không đổi logic/alert. |
| Historical signals to keep | 100, tối đa 200; 0 ẩn tam giác. Latest chỉ giữ một nếu giá trị >0. |
| Hide drawings without a recent signal | Bật; cấu trúc HTF mới cũng đủ để xem tổng quan trước entry LTF. Không hủy model. |
| Drawing horizon / recency | 3 nến HTF; giới hạn chiếu trước và tuổi hiển thị, không cắt điểm nguồn cũ của line. |
| Chart text size | Normal; tăng khi cần. Không thay giá của mức. |
| Dashboard text size | Small; Normal phù hợp khi chia màn hình. |

## Đọc WHY

| Trạng thái | Ý nghĩa |
| --- | --- |
| NO MODEL / VIEW TF | Chưa có CRT phù hợp hoặc đang xem khung không phát entry LTF. |
| WAIT CLOSE | Nến đang chạy; chưa dùng close chưa xác nhận. |
| WAIT CONFIRM / CT CONFIRM | Chưa có C/M LTF; CT là nhánh ngược bias. |
| WAIT RETEST | Đã xác nhận, chờ hồi ở nến sau; không đuổi nếu giá đi luôn. |
| BIAS / NO KEY / KEY X | Bias chặn hoặc nhánh CT thiếu/mất key có trước. B0! là guard intraday tạm chặn, không phải bias đối diện. |
| TIME / WAVE WAIT | Ngoài giờ lọc hoặc chưa có pivot xác nhận nhịp mới. |
| SIGNAL / CT SIGNAL | Đủ điều kiện đóng nến, không có nghĩa đã khớp entry. |
| PULLBACK / USED | Đã phát dấu; chờ nhịp mới hoặc đã dùng quota một dấu/model. |
| CP TAKEN / SL TOUCHED | Target hoặc cực trị SL C2 đã bị chạm trong C3; khóa entry còn lại. Không tự gán kết quả lệnh thực tế. |
| C3 CLOSED | Hết cửa sổ entry; model có thể vẫn hiển thị để theo dõi. |

Nến nguồn C1/C2, Open/High/Low/Close, thời điểm xác nhận, loại C/M/F/O và key CT nằm trong tooltip tam giác. Buy xanh dưới nến, Sell đỏ trên nến, native size 4. Không có chữ B C/M hoặc S C/M cạnh tam giác.

FVG HTF là gap giữa râu nến 1 và 3, neo từ nến 1 nhưng chỉ biết khi nến 3 đóng. Đây là bộ ba tạo FVG, **không nhất thiết là C1–C3 của CRT**. OB HTF giữ nến nguồn và thời điểm xác nhận cấu trúc riêng; không đồng nhất với OB entry LTF.

Chart M1/M3/M5 nhỏ hơn và chia hết HTF mới phát entry. Khi chart > HTF đã chọn, chỉ báo dùng chart làm khung VIEW; Bias TF vẫn phải >= khung hiệu lực. Với H2/H4 cần đối chiếu giờ chia nến của feed Topstep và TradingView.

Fibo ET1/ET2 do bạn đánh dấu thủ công theo [quy ước](FIBO-CONVENTION.md). Bản này chưa kiểm tra giá đã tới ET, chưa tự vẽ fibo, chưa có Early C2 và không tự quản lý lệnh.

Kiểm tra: `node tools/check-crt.cjs`. Phân biệt rõ ca tổng hợp, biên dịch Pine và Replay thị trường; kết quả của loại trước không thay thế loại sau.
