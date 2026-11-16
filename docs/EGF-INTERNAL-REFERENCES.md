# EGF: FVG, OB và thanh khoản nội bộ

Hiệu đính 16/11/2026, thay thế nhận định “EGF tự tạo FVG” và “EQ/CE là IRL mặc định” trong cẩm nang gốc.

## Định nghĩa và nguồn

- Engulfing xét thân; Outside Bar xét High–Low. Hai hình thái không đồng nghĩa. Cặp nến không tự xác nhận FVG: cần ba nến đóng, Bull Low C3 > High C1 hoặc Bear High C3 < Low C1.
- IRL tương đối với range và timeframe đã chọn. ICT Episode 3, khoảng 35:04–35:31, mô tả đỉnh/đáy ngắn hạn bên trong nhịp và các stop trên/dưới chúng, hoặc mất cân bằng trong range. [Video gốc](https://www.youtube.com/watch?v=nQfHZ2DEJ8c&t=2104s), [bản chép lời để đối chiếu](https://info.quagmyre.com/xwiki/bin/view/Forex/The-Inner-Circle-Trader/ICT-Youtube-Series-2022/ICT-YT-2022-01-26-ICT-Mentorship-2022-Episode-3-srt/). Nghiên cứu dựa trên bản chép lời; không xác nhận đã xem từng khung hình.
- FVG là vùng mất cân bằng. OB là vùng phản ứng và có thể thuộc IRL khi nằm trong range tham chiếu; nhãn riêng không loại OB khỏi IRL. Không gọi mọi nến đối màu là OB. HTF OB cần cực trị, pivot đã biết và displacement phá cấu trúc; OB entry LTF xác nhận bởi CISD hoặc MSS. Xem [hai tầng OB](OB-TIMEFRAME-ROLES.md); OHLC không chứng minh có lệnh tổ chức.
- EQ = 50% range; CE = trung điểm FVG đang xét. Hai giá có thể khác nhau; không tự tạo thành một vùng thanh khoản hoặc tín hiệu.
- POC từ FRVP là khái niệm khối lượng riêng. Chỉ báo này không đọc FRVP/POC hoặc nét vẽ thủ công của bạn.

## Quy tắc cá nhân được triển khai

Giữ lựa chọn hiện tại: FVG chưa bị xử lý → OB hợp lệ → swing nội bộ chưa bị quét. Đây là ưu tiên của công cụ, không phải thứ tự bắt buộc do ICT quy định. Reference phải nằm trong range model, trên HTF; có thể tồn tại trước EGF, không bắt buộc chính EGF tạo ra. Hai phía vẫn được hiển thị nếu tồn tại; reference dùng cho tín hiệu theo bias. Không có cả ba thì chờ, không lấy EQ thay thế.

| Reference | Nhãn chart | Điều kiện vị trí trước xác nhận LTF |
| --- | --- | --- |
| FVG HTF | FVG+ / FVG- | Giá giao vùng; vùng chưa bị HTF close-through. |
| OB HTF | OB+ / OB- | Giá giao vùng phản ứng; vùng chưa bị HTF close-through. |
| Đỉnh nội bộ | iBSL | Sell cần High vượt mức ít nhất sweepSize, rồi close dưới mức. Chạm đúng mức không đủ. |
| Đáy nội bộ | iSSL | Buy cần Low xuyên mức ít nhất sweepSize, rồi close trên mức. Chạm đúng mức không đủ. |

Với swing, reclaim có thể cùng nến quét hoặc nến sau. C/M trước cú quét không được dùng để hợp thức hóa entry; state phản ứng được reset khi quét lần đầu. Sau khi vị trí hợp lệ, các điều kiện LTF/Signal timing/Pullback, bias, target, INV và chống trùng vẫn áp dụng. Chạm/quét riêng lẻ không là tín hiệu. Swing đã chọn có thể được giữ qua wick theo lifecycle model, nhưng không phải pool “chưa quét” mới; phát lại vẫn phải qua Fresh reaction và WAVE WAIT.

FVG/OB entry ở LTF vẫn tính riêng, không đổi thành FVG HTF. Không bắt buộc vùng phản ứng HTF phải do EGF sinh ra. CRT counter-bias và ISB không được nới điều kiện bởi thay đổi này.

## Hiển thị và kiểm tra

Setting đổi tên thành `HTF FVG / OB / internal stops`; bảng dùng hàng REF, ghi FVG/OB/iSSL/iBSL. Dấu * là reference được chọn theo bias. FVG/OB giữ neo nến nguồn HTF, swing giữ neo cực trị; EQ vẫn là line riêng. Không thêm nhãn vào tam giác.

WHY dùng NO REF khi thiếu reference, WAIT ZONE khi chờ vùng, WAIT SWEEP khi chờ quét swing, REF X khi chưa giữ/reclaim. Lifecycle target/INV/timeout và các gate khác có thể được báo ưu tiên trước các trạng thái này.

Snapshot thêm loại reference EGF và offset riêng khi đọc HTF: 114 phần tử chính + 7 bias trong engine + 6 bias ngoài = 127, đạt giới hạn tuple request Pine. Test `node tests/egf-internal-references.cjs` thực thi thân LTF source với Buy/Sell, chạm/thiếu một tick/quét/reclaim/C-M/Pullback/thiếu reference. Đây là kiểm tra synthetic; không mô phỏng request.security/rollback, không phải Replay thị trường hoặc thống kê win rate.

Ngày 16/11/2026, Pine Editor biên dịch nguyên bản source hiện hành thành công, không có lỗi (còn cảnh báo shadow biến cục bộ). Các kiểm tra contract, CRT counter-bias, HTF cluster, signal density và preset workflow cũng qua. Chưa có nghiệm thu chart/Replay cho thay đổi này.
