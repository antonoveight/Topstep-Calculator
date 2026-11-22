# Entry sau TS: đối chiếu nguồn Romeotpt · 22/11/2026

## Nguồn trực tiếp đã kiểm tra

1. [Bài minh họa entry của tác giả, 6219](https://t.me/officialRomeotpt/6219), truy cập qua [bản công khai quanh bài đó](https://t.me/s/officialRomeotpt/6221). Đã đọc HTML gốc và xem trực tiếp hai ảnh đính kèm, không chỉ đọc kết quả tìm kiếm. Ảnh ETH H1 đánh dấu CRTL, sự kiện +TS và vị trí mua; ảnh ETH M15 đánh dấu các nến 1, 2, 3, vùng low tham chiếu, +TS và nến thứ ba là entry. Ảnh M15 được lưu tạm trong output/romeo-entry/proper-ts-1.jpg để đối chiếu, không đưa bản sao hình tác giả vào repo.
2. [Bài tác giả giới thiệu tập 9 về chọn entry model và lập kịch bản](https://t.me/s/officialRomeotpt?before=6541), kèm [video gốc Connecting the dots](https://www.youtube.com/watch?v=2sxdsgcIeYA). Bài nêu rõ đây là nội dung trả lời câu hỏi chọn entry model, không chỉ nhận diện một cú sweep.
3. Metadata/mô tả từ trang YouTube gốc của [What is turtle soup?](https://www.youtube.com/watch?v=U-gNCwbGtTI), [One CRT model for life](https://www.youtube.com/watch?v=T7udbrWlARI), [Candle 3](https://www.youtube.com/watch?v=h7NCST2wPw8) và tập 9. Cả bốn trả channel ID UCYCbFixbl2KcyLuH6cOfL2g, author Romeotpt. Bản nghiên cứu trước: [danh mục và giới hạn nguồn](CRT-ROMEOTPT-RESEARCH.md).

Giới hạn: phụ đề tự động được liệt kê nhưng bốn URL nội dung đều trả 200 với 0 byte. Thử xem khung hình qua player chưa tải được frame kỹ thuật: readyState=1, hình vẫn ở disclaimer dù thanh thời gian đã đổi. Không tính các ảnh player đó là đã xem bài giảng; chưa nghe/xem trọn video hay xác minh một công thức Model 1 đầy đủ. Ghi chú cộng đồng chỉ giúp định vị bài, không dùng làm nguồn thuật toán. Không khẳng định một lần entry trong ảnh chứng minh lợi thế thống kê.

## Kết luận có thể dùng

**TS và entry là hai vai trò cần phân biệt.** Ảnh gốc đánh dấu sự kiện TS tại low tham chiếu và đánh dấu riêng nến thực thi thứ ba. Bài tập 9 cũng tách câu hỏi entry model khỏi việc biết hướng đi. Cần chỉ rõ range/reference, khung thời gian và thời điểm xác nhận, thay vì xem mọi cú quét là một lệnh.

Không có căn cứ đã xác minh để bắt buộc mọi CRT phải có thêm **hai nến M5 liền nhau tạo TS, rồi một nến khác retest đúng biên M5**. Ảnh tác giả không đặc tả công thức đó; nó cũng không đủ để kết luận tất cả biến thể đều bỏ xác nhận hoặc luôn vào ngay sau sweep. Mẫu hình trong ảnh không tự cung cấp buffer SL, cách khớp lệnh, điều kiện vô hiệu hay thứ tự intrabar.

Model 1, cách giao dịch C3 và các cách thực thi khác là chủ đề nghiên cứu riêng. Không đổi tên bộ TS/retest hiện tại thành Model 1 của Romeo, không đưa trở lại các bộ xác nhận người dùng đã bỏ, và không dùng kết quả TP về sau để xác nhận ngược một entry chưa có.

## Quyết định cho lần triển khai này

- Giữ **Pullback** là quy ước cá nhân: CRT HTF xác nhận → TS LTF đóng trong C3 → retest ở nến sau → kiểm tra SL/target, bias/key và nhịp. Chưa quảng bá nó là toàn bộ cách vào của Romeo. Confirmation close vẫn là lựa chọn sẵn có, không tự đổi mặc định để tăng dấu.
- Bổ sung engine Confirmed độc lập trên Larger HTF theo [đặc tả hai nhánh](CRT-DUAL-HTF.md). H1 và H4 cùng xét M5 đang mở, nhưng C1/C2, C3, target/INV, trạng thái TS/retest và khóa sóng riêng.
- H1 đã hết C3 không chặn cửa sổ H4; H4 đã TP không được phát dấu entry muộn. Hai nguồn cùng hướng/cùng bar chỉ vẽ một tam giác, tooltip giữ cả hai. Trái hướng giữ cả hai hướng có nguồn rõ ràng.
- Early C2 vẫn chỉ thuộc HTF chính. Chưa thêm Model 1, KOD, OTE hoặc Early H4 từ các nguồn chưa xác minh đủ.

Việc thêm nhánh khung lớn giải quyết độ bao phủ giữa các khung; nó không thay bằng chứng kiểm thử thị trường cho quy tắc entry. Cần đối chiếu thêm các setup thực tế trước khi thay bộ xác nhận cá nhân.

Nghiên cứu bổ sung đã xác minh thêm hai bài X gốc về biến thể thận trọng và cấp khung Model 1: [framework, điểm chưa đủ đặc tả và bộ đối chiếu 22 ca](CRT-ENTRY-FOLLOWUP.md). Điều này bổ sung bằng chứng về trình tự entry, chưa thay thế giới hạn phụ đề nêu ở trên hoặc biến bộ Pullback hiện tại thành công thức tác giả.
