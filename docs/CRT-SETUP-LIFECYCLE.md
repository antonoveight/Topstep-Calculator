# Range C1 và từng attempt CRT · 22/11/2026

Range gốc C1 và lần xác nhận/giao dịch (**attempt**) là hai vòng đời khác nhau. Hết C3 không tự làm range mất hiệu lực. C4/C5 vẫn có thể đi tới biên đối diện C1. Đây là quy ước thực thi của công cụ cá nhân, không khẳng định một thuật toán do Romeo công bố.

| Sự kiện | Trạng thái | Hành động |
| --- | --- | --- |
| C2 đóng sweep một biên và reclaim C1 | ENTRY | Tìm TS/retest LTF trong nến HTF ngay sau xác nhận. |
| Hết nến HTF đầu tiên sau xác nhận, chưa chạm rào cản | TRACK | Đóng entry; vẫn theo dõi range/attempt, không mang pending sang nến sau. |
| Buy chạm Low raid; Sell chạm High raid | INV / WATCH | Kết thúc attempt cũ; giữ C1 để chờ xác nhận mới. Không coi lệnh cũ được cứu. |
| Chạm biên đối diện C1 | TG | Kết thúc parent range; tìm range mới. EQ không phải full TP. |
| INV và target trong cùng nến quan sát, không rõ thứ tự | AMB | Không chọn kết quả thuận lợi. Target bị tiêu thụ nên parent không tái dùng. |
| Không có parent phù hợp | SEARCH | Chờ CRT mới. Có thể vẫn hiện cụm OHLC CTX để quan sát. |

## Xác nhận lại cùng C1

Sau INV cần **raid mới vượt cực trị attempt trước ít nhất một tick**, phản ứng sweep/reclaim tại key swing HTF đã biết **trước khi C1 mở**. Key được chụp lúc tạo parent, không lấy key xuất hiện muộn để hợp thức hóa quá khứ.

Nến HTF phải đóng hẳn trong **C1 gốc**. Chỉ đóng trong C2 nhưng còn ngoài C1 không đủ. Có thể nến raid đóng ngoài C1 rồi nến sau mới reclaim; timestamp/OHLC raid tách riêng khỏi thời điểm xác nhận. Target phải chưa bị lấy cả trên nến raid lẫn nến xác nhận.

Ví dụ Sell: C3 quét High C2, chạm key cũ, đóng lại trong C1 → attempt C2 đã INV; C1 được cấp attempt mới, SL tại High raid mới. Entry window mới là nến HTF ngay sau xác nhận, vẫn cần TS/retest LTF đóng. Không phát Buy/Sell chỉ vì có attempt mới. Nếu chỉ quay vào range mà thiếu raid/key/reclaim thì còn WATCH.

UID parent giữ timestamp C1; token attempt dùng thời điểm xác nhận mới. Dấu/SL và kết quả attempt trước không bị sửa. Khóa sóng, bias/key ngược bias và điều kiện LTF vẫn áp dụng.

## Nến đóng, lịch sử và focus

LTF chốt INV/target từ wick nến **đã đóng**, không đợi HTF đóng. Nến đang chạy chưa cam kết kết thúc. Nến raid nguồn không tự hủy mình. Nếu LTF đã thấy INV trước rồi TP ở nến khác, archive giữ INV, không đổi thành thắng vì nến HTF tổng hợp chạm cả hai.

Ưu tiên attempt sống lâu nhất. Không có attempt sống thì hiển thị parent WATCH mới nhất. Target đóng parent kể cả khi attempt đã INV; không sửa kết quả INV cũ. Không còn timeout thị trường; giới hạn kỹ thuật là scan 1.000 nến HTF và hàng đợi 12 parent. HIST/CAP là loại khỏi bộ nhớ, không phải SL.

**Last ended model cluster** giữ snapshot attempt cuối, tách khỏi entry. Thân/viền/râu cùng màu tăng/giảm, giữ độ mờ 75/65/70. Nhãn nến/tiêu đề lệch hàng, nền chữ trong suốt. LAST không phải toàn bộ nhật ký lệnh.

## Hai cụm HTF

Cụm chính giữ C1 + nến raid và FOLLOW. Chưa chọn parent thì hiện ba nến HTF đã đóng cùng nến đang chạy, nhãn CTX. **Show larger HTF cluster** thêm ba nến đã đóng và nến đang chạy của khung lớn hơn, cùng chiều rộng body/nhịp nến và có khoảng cách riêng.

**Larger HTF = Auto**: H1/H2 → H4; H4 → D1; D1 → W1. Có thể chọn H2/H4/D1/W1; lựa chọn không lớn hơn HTF chính quay về Auto. W1 chỉ là khung quan sát bổ sung; HTF model vẫn H1/H2/H4/D1. Nến đóng lấy offset xác nhận; N* tổng hợp OHLC chart hiện tại. Bucket đầu thiếu dữ liệu không giả là nến hoàn chỉnh.

Cụm lớn hơn chỉ đối chiếu đồng pha bằng mắt, chưa lọc entry hay nhận diện CRT thứ hai. Màu nến không phải bias. Màn hình hẹp có thể cần tăng khoảng trống phải hoặc giảm FOLLOW; không co body để nhét hình.

## Early C2 và kiểm tra

[Early C2 thử nghiệm](EARLY-C2-EXPERIMENT.md) vẫn dùng C1 ngay trước bucket C2 hiện tại; chưa vào sớm cho lần tái xác nhận của parent cũ. Mỗi E khóa SL/TP riêng, không tự hồi sinh sau hủy. Confirmed/Early không trộn dấu.

Chạy node tools/check-crt.cjs: 16 nhóm, có 14 ca tái xác nhận Buy/Sell, 34 trace vòng đời, 74 trace Early và kiểm tra nguồn OHLC/hình vẽ. Test tổng hợp/biên dịch không thay Replay thị trường. Brave Basic vẫn bị chặn Replay intraday. Chưa có backtest hiệu suất cho thay đổi này.
