# Range C1 và từng attempt CRT · 22/11/2026

> Cập nhật 25/11/2026: quy tắc Pine hiện hành ở [CRT key và ba nhánh entry](CRT-FIRST-LEG-SPEC.md). Các phần universal MPS, R1 nhập tay, IRL/ERL hoặc C3-only bên dưới là lịch sử của phiên bản trước. CSV hiện dùng schema 4; auditor TS-only cũ không chứng nhận bản mới. Web chưa được migration trong lần sửa indicator này.

Range gốc C1 và lần xác nhận/giao dịch (**attempt**) là hai vòng đời khác nhau. Hết C3 không tự làm range mất hiệu lực. C4/C5 vẫn có thể đi tới biên đối diện C1. Đây là quy ước thực thi của công cụ cá nhân, không khẳng định một thuật toán do Romeo công bố.

| Sự kiện | Trạng thái | Hành động |
| --- | --- | --- |
| C2 đóng sweep một biên và reclaim C1 | ENTRY | Tìm TS/retest LTF trong nến HTF ngay sau xác nhận. |
| Hết nến HTF đầu tiên sau xác nhận, chưa chạm rào cản | TRACK | Đóng entry; vẫn theo dõi range/attempt, không mang pending sang nến sau. |
| Buy chạm Low raid; Sell chạm High raid | INV | Kết thúc attempt cũ. Chỉ C3 gốc được xét thay raid theo điều kiện bên dưới; không giữ C1 chờ vô thời hạn. |
| Chạm biên đối diện C1 | TG | Kết thúc parent range; tìm range mới. EQ không phải full TP. |
| INV và target trong cùng nến quan sát, không rõ thứ tự | AMB | Không chọn kết quả thuận lợi. Target bị tiêu thụ nên parent không tái dùng. |
| Không có parent phù hợp | SEARCH | Chờ CRT mới. Có thể vẫn hiện cụm OHLC CTX để quan sát. |

## Xác nhận lại cùng C1

CRT mới luôn lấy **C1 liền trước C2**. Ngoại lệ giữ C1 chỉ dành cho **C3 gốc, ngay sau C2 gốc**: quét vượt cực trị C2 ít nhất một tick, phản ứng tại key swing HTF đã biết **trước khi C1 mở**, rồi chính C3 đóng trong C1. Key được chụp lúc tạo parent, không lấy key xuất hiện muộn để hợp thức hóa quá khứ. Chỉ thay raid một lần, không tái xác nhận dây chuyền.

Chỉ đóng trong C2 nhưng ngoài **C1 gốc** không đủ. Không ghi một raid rồi chờ nhiều nến sau reclaim để ghép lại với C1 cũ. Target phải còn nguyên. C4/C5 được hoàn thành một attempt vẫn hợp lệ; không dùng chúng để hồi sinh attempt đã INV.

Ví dụ Sell: C3 quét High C2, chạm key cũ, đóng lại trong C1 → attempt C2 đã INV; C1 được cấp attempt mới, SL tại High C3. Entry window mới là nến HTF ngay sau xác nhận, vẫn cần TS/retest LTF đóng. Nếu C3 không đủ điều kiện, hoặc raid xuất hiện từ C4 trở đi, attempt kết thúc và bộ tìm kiếm xét cặp C1/C2 mới tại đó.

UID parent giữ timestamp C1; token attempt dùng thời điểm xác nhận mới. Dấu/SL và kết quả attempt trước không bị sửa. Khóa sóng, bias/key ngược bias và điều kiện LTF vẫn áp dụng.

## Nến đóng, lịch sử và focus

LTF chốt INV/target từ wick nến **đã đóng**, không đợi HTF đóng. Nến đang chạy chưa cam kết kết thúc. Nến raid nguồn không tự hủy mình. Nếu LTF đã thấy INV trước rồi TP ở nến khác, archive giữ INV, không đổi thành thắng vì nến HTF tổng hợp chạm cả hai.

Ưu tiên setup có cửa sổ entry đang mở; nếu nhiều setup cùng mở, ưu tiên C1 gần nhất. Khi chỉ còn TRACK thì chọn C1 gần nhất còn hợp lệ. Không có fallback parent đã INV. WATCH chỉ có thể xuất hiện tạm trên LTF sau INV trong lúc chờ HTF đóng để đánh giá C3. Không còn timeout thị trường; giới hạn kỹ thuật là scan 1.000 nến HTF và hàng đợi 12 parent. HIST/CAP là loại khỏi bộ nhớ, không phải SL.

**Last ended model cluster** giữ snapshot attempt cuối, tách khỏi entry. Thân/viền/râu cùng màu tăng/giảm, giữ độ mờ 75/65/70. Nhãn nến/tiêu đề lệch hàng, nền chữ trong suốt. LAST không phải toàn bộ nhật ký lệnh.

## Hai cụm HTF

Cụm chính giữ C1 + nến raid và FOLLOW. Chưa chọn parent thì hiện ba nến HTF đã đóng cùng nến đang chạy, nhãn CTX. **Show larger HTF cluster** thêm ba nến đã đóng và nến đang chạy của khung lớn hơn, cùng chiều rộng body/nhịp nến và có khoảng cách riêng.

**Larger HTF = Auto**: H1/H2 → H4; H4 → D1; D1 → W1. Có thể chọn H2/H4/D1/W1; lựa chọn không lớn hơn HTF chính quay về Auto. W1 chỉ là khung quan sát bổ sung; HTF model vẫn H1/H2/H4/D1. Nến đóng lấy offset xác nhận; N* tổng hợp OHLC chart hiện tại. Bucket đầu thiếu dữ liệu không giả là nến hoàn chỉnh.

Nhánh Larger HTF signals nay có engine CRT/entry độc lập, bật sẵn; công tắc cụm nến chỉ điều khiển OHLC. Màu nến không phải bias. Xem [hai nhánh CRT](CRT-DUAL-HTF.md) để phân biệt cửa sổ và nguồn dấu. Màn hình hẹp có thể cần tăng khoảng trống phải hoặc giảm FOLLOW; không co body để nhét hình.

## Early C2 và kiểm tra

[Early C2 thử nghiệm](EARLY-C2-EXPERIMENT.md) vẫn dùng C1 ngay trước bucket C2 hiện tại; chưa vào sớm cho lần tái xác nhận của parent cũ. Mỗi E khóa SL/TP riêng, không tự hồi sinh sau hủy. Confirmed/Early không trộn dấu.

Chạy node tools/check-crt.cjs: 18 nhóm, có 18 ca parent Buy/Sell (gồm từ chối raid xa/raid dây chuyền), kiểm tra ưu tiên C1 từ hàm Pine thực tế, 34 trace vòng đời, 74 trace Early và kiểm tra nguồn OHLC/hình vẽ. Test tổng hợp/biên dịch không thay Replay thị trường. Brave Basic vẫn bị chặn Replay intraday. Chưa có backtest hiệu suất cho thay đổi này.

Cập nhật hai nhánh Confirmed: [H1/H4 độc lập, nguồn tam giác và giới hạn khung](CRT-DUAL-HTF.md). Đối chiếu entry sau TS từ [nguồn Romeotpt](CRT-ENTRY-ROMEOTPT.md); Pullback trong code vẫn là quy ước cá nhân.
