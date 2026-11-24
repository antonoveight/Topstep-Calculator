# Nghiên cứu nguồn Romeotpt cho hệ thống CRT

Ngày 21/11/2026. Mục tiêu là đưa dự án về CRT, giữ IRL, ERL và Turtle Soup trong đúng vai trò, đồng thời phân biệt nội dung của Romeo với quy ước giao dịch cá nhân. Kết luận cho kế hoạch: lấy range, key level, thời gian và phản ứng làm trục; không chỉ đổi bộ quét ba loại nến thành một bộ quét hình dạng ba nến.

**Bổ sung ngày 24/11/2026:** video mới nhất [CRTology ep.5: MPS](https://www.youtube.com/watch?v=Q-mne0H4lRY), đăng 23/11, đã được đối chiếu toàn bộ phụ đề tự động và các storyboard gốc. [Nghiên cứu MPS và khoảng cách với R1](CRT-ENTRY-FOLLOWUP.md#bổ-sung-24112026--mps-theo-video-mới-nhất), [danh mục bằng chứng](research/romeotpt-mps-sources.json). Phạm vi 17 video và giới hạn phụ đề bên dưới mô tả đợt nghiên cứu 21/11, không bao gồm lần bổ sung này. Chưa xác minh MPS bằng nghe/xem liên tục hoặc hiệu suất thị trường.

## Nguồn và phạm vi xác minh

Kênh [Romeotpt](https://www.youtube.com/@Romeotpt) có channel ID `UCYCbFixbl2KcyLuH6cOfL2g`. Metadata trực tiếp của 17 video dưới đây cùng trả về ID này. Mô tả các video liên kết tới [X @romeotpt](https://x.com/romeotpt) và [Telegram officialRomeotpt](https://t.me/officialRomeotpt); Telegram liên kết ngược về kênh YouTube. Không dùng tên hiển thị Raid hoặc một website mang chữ CRT làm bằng chứng duy nhất về danh tính.

Romeo tự nhận là nguồn/tác giả CRT trong bài [officialRomeotpt/6616](https://t.me/officialRomeotpt/6616), ngày 06/11/2025 UTC. Dùng cách ghi “CRT theo Romeotpt” hoặc “người phổ biến và tự nhận tác giả CRT”; việc xác minh kênh không phải kiểm chứng độc lập quyền ưu tiên lịch sử hoặc hiệu suất giao dịch. Không suy từ mô tả kênh rằng Romeo là người đầu tiên tạo ra mọi khái niệm Turtle Soup. [CMT Association, January 2016](https://cmtassociation.org/wp-content/uploads/2025/08/january2016.pdf) đã mô tả Turtle Soup gắn với sách Street Smarts của Connors và Raschke; biến thể CRT không đồng nhất với setup lookback của sách.

Đã đọc trực tiếp metadata/mô tả 17 video, một số khung hình bài giảng và các bài đăng công khai của tác giả. Chưa đọc được đầy đủ phụ đề: URL phụ đề trả nội dung rỗng hoặc giới hạn truy cập, endpoint transcript trả lỗi điều kiện. Không gọi đây là đã xem/nghe trọn 17 video. Các bản tóm tắt AI trên Video Highlight, Glasp và ghi chú GitHub chỉ được dùng để tìm video/mốc cần xem; không dùng chúng làm định nghĩa thuật toán đã được Romeo xác nhận.

Danh mục tối giản có thể đọc bằng máy: [romeotpt-source-index.json](research/romeotpt-source-index.json). Bản HTML, dữ liệu truy cập và ảnh khung hình đối chiếu chỉ nằm trong thư mục output cục bộ, không đưa toàn bộ nội dung tác giả vào repo.

## Thư viện gốc cần học theo chủ đề

| Nguồn gốc | Vai trò trong việc cải tổ |
| --- | --- |
| [What is turtle soup](https://www.youtube.com/watch?v=U-gNCwbGtTI) | Chuẩn hóa sự kiện TS và phân biệt với chạm mức. |
| [What is CRT](https://www.youtube.com/watch?v=UUq_wKQ61Wo) | Kiểm tra nền tảng range và cách nối HTF/LTF; không thu hẹp toàn bộ CRT thành một mẫu hình. |
| [Secrets 1 One CRT model for life](https://www.youtube.com/watch?v=T7udbrWlARI) | Model 1 là nội dung cần đối chiếu riêng, không tự đổi tên mọi OB/MSS hiện tại thành Model 1. |
| [Secrets 2 The kiss of death](https://www.youtube.com/watch?v=FYr6J5pIDB4) | Tách KOD khỏi TS ban đầu và khỏi mọi tín hiệu lặp. |
| [Secrets 3 The journey](https://www.youtube.com/watch?v=_oiwm8_id8c) | Đối chiếu hành trình trong range và hai nhánh C2/C3. |
| [Secrets 4 Candle anatomy](https://www.youtube.com/watch?v=n2GF8kCpgVg) | Open, High, Low, Close và thời gian của nến. |
| [Secrets 5 Key level](https://www.youtube.com/watch?v=p8UYOgVn1-g) | Vị trí và hành trình tới/rời key level. Phần kỹ thuật được mô tả bắt đầu khoảng 05:52. |
| [Secrets 6 SMT](https://www.youtube.com/watch?v=3IWgc52Dqsg) | Nhánh hỗ trợ nghiên cứu, chưa bắt buộc SMT trong bản CRT đơn giản. |
| [Secrets 7 Candle 3](https://www.youtube.com/watch?v=h7NCST2wPw8) | Entry trong C3 và nhịp hồi; kỹ thuật từ khoảng 02:40 theo mô tả. |
| [Secrets 8 When does CRT fail](https://www.youtube.com/watch?v=-mWYppebugo) | Các tình huống thất bại/chưa hoàn tất; kỹ thuật từ khoảng 04:30. |
| [Secrets 9 Connecting the dots](https://www.youtube.com/watch?v=2sxdsgcIeYA) | Liên kết khung và bối cảnh trước khi chốt workflow. |
| [Secrets 10 A clean close](https://www.youtube.com/watch?v=af7ECe4HBjc) | Kiểm tra nội dung closure và phần kết chuỗi; tên bài không tự cung cấp một công thức close. |
| [CRTology Introduction](https://www.youtube.com/watch?v=8LblVvGZaGY) | Định hướng chuỗi công khai mới. |
| [CRTology 1 SS](https://www.youtube.com/watch?v=4DZWbCzEvhM) | Giữ tên SS nguyên bản, chưa tự mở rộng viết tắt khi chưa đối chiếu lời giảng. |
| [CRTology 2 The Lens](https://www.youtube.com/watch?v=wkSiy27a8ps) | Góc đọc chart và narrative; chưa mã hóa chỉ từ tiêu đề. |
| [CRTology 3 OTE](https://www.youtube.com/watch?v=f4gdAohTi40) | So sánh entry được dạy với fibo ET cá nhân, không đồng nhất hai bộ mức. |
| [CRTology 4 Terminology i](https://www.youtube.com/watch?v=L87Iy51_ATM) | Thuật ngữ CRT, TS, KOD, failure swing, fake MSS và model. Video gốc được công bố 15/11/2026 theo timezone metadata. |

Mốc ở bảng dùng để mở phần nghiên cứu, không phải lời khẳng định đã kiểm tra toàn bộ nội dung phần đó. Đã quan sát khung hình gốc bài Key level khoảng 15:54, Candle 3 khoảng 15:01, bài thất bại khoảng 10:01 và Terminology khoảng 08:01. Ảnh Terminology thể hiện +TS ở các đáy tham chiếu khác nhau: không được gộp tất cả các cấp TS thành một sweep HTF duy nhất.

## Những điểm có thể đưa vào kế hoạch ngay

### Key level và hướng di chuyển

Bài [6273](https://t.me/officialRomeotpt/6273), ngày 28/08/2025 UTC, phân biệt giao dịch trên hành trình tới key level và phản ứng rời key level. Bài [6615](https://t.me/officialRomeotpt/6615), ngày 04/11/2025 UTC, mô tả một kịch bản bearish từ nến mở, đi vào CRTH cũ rồi giảm. Đây là căn cứ để bổ sung **Open, key đã biết trước và trạng thái đang tới/đã phản ứng** vào worksheet. Không biến một kịch bản minh họa thành điều kiện đủ để Sell mọi lần chạm CRTH.

IRL/ERL tiếp tục dùng để định vị trong một range được chỉ rõ. FVG/OB là những reference có thể dùng, không phải hai hộp bắt buộc để mọi CRT tồn tại. LTF có thể tạo mẫu ngược hướng trên đường tới key; mẫu đó không tự hủy mục tiêu HTF.

### TS có cấp khung và cấp tham chiếu

Sơ đồ +TS quan sát trong [Terminology khoảng 08:01](https://www.youtube.com/watch?v=L87Iy51_ATM&t=481s) có sự kiện dưới đáy lớn và sự kiện dưới đáy hồi nhỏ. Kế hoạch phải lưu `reference`, timeframe và thời điểm sự kiện. Một TS M5 dưới đáy nội bộ không chứng minh C2 H1 đã quét Low C1; tên TS không tự là xác nhận HTF.

Nhánh CRT Confirmed của dự án tiếp tục yêu cầu C2 đã đóng trong C1; đó là phạm vi V1 cá nhân, không tuyên bố mọi cách giao dịch CRT theo Romeo đều bắt buộc đúng ba nến liền nhau. Early C2 được tách khỏi nhánh đã xác nhận.

### Mục tiêu 50% và mục tiêu toàn range

Bài [6449](https://t.me/officialRomeotpt/6449), ngày 09/10/2025 UTC, cùng các bài [6332](https://t.me/officialRomeotpt/6332) và [6335](https://t.me/officialRomeotpt/6335) nhắc giao dịch từ CRTH/CRTL về 50% range. Vì vậy phải bỏ cách diễn đạt rằng nguồn Romeo chỉ có mục tiêu biên đối diện.

Giữ hai mốc phân tích riêng: **EQ C1 = (High C1 + Low C1)/2** và **biên đối diện C1**. Người dùng vẫn chọn một TP toàn bộ theo kế hoạch, không tự thêm chốt một phần ở EQ, không tự BE ở EQ.

EQ C1 không tự bằng CE của FVG, mức 0.5 của bộ fibo SL–TP, hoặc nhãn BE/0.6 cá nhân. Ví dụ High C1=110, Low C1=100, High C2=112: EQ C1=105; fibo 0.5 từ SL112 tới TP100=106; BE/0.6=104.8. Ba mức khác nhau.

### Kịch bản sai và thay đổi bias

Bài [6432](https://t.me/officialRomeotpt/6432), ngày 05/10/2025 UTC, nhắc đánh giá lại khi xuất hiện CRT thuyết phục ngược kỳ vọng ban đầu. Bổ sung cơ chế review/vô hiệu thay vì giữ bias bất biến hoặc đổi bias theo mọi TS LTF. Tiêu chuẩn “thuyết phục” chưa được biến thành một điểm số tự động.

Phân biệt failed, target đã lấy, hết cửa sổ entry và hết thời gian chờ. Chạm EQ nhưng chưa tới biên đối diện không được tự ghi thành TP toàn phần hay failed. “Incomplete CRT” xuất hiện trong thông báo bài 8 nhưng cần đối chiếu đủ diễn biến trước khi chốt bộ phân loại tự động.

### Rủi ro và giờ giao dịch

Bài X [16/11/2026](https://x.com/Romeotpt/status/2122412044661989624) có thông điệp ngắn về mức tối thiểu 1:3. Nội dung được đối chiếu qua public embed đúng author Romeotpt, nhưng một câu ngắn chưa xác định entry, phí, stop buffer hoặc phạm vi áp dụng. Đưa vào mục nghiên cứu R:R tại ET/entry thực tế; **không khôi phục bộ lọc R:R tại close tam giác** vốn khác giá entry của người dùng.

Bài [6264](https://t.me/officialRomeotpt/6264), ngày 25/08/2025 UTC, ghi các chuỗi giờ khác nhau cho forex, index futures và crypto. Bài không xác định đủ timezone/session trong chính đoạn chữ. Không hardcode các chuỗi đó thành giờ Việt Nam hoặc áp bộ index futures cho MGC chỉ vì MGC cũng là futures. Phải đối chiếu chart mẫu, DST và nến Topstep/TradingView trước.

## Những điểm chưa được phép gán thành quy tắc nguyên bản

- Fibo ET1=0.2, ET2=0.1, break=0.4, BE=0.6, TL=0.8 là **quy ước của người dùng**. Chưa có bằng chứng nguồn gốc để gán bộ mức này cho Romeo hoặc gọi nó là OTE của Romeo.
- Các bộ H1/M5, H4/M15, D1/H1 được cộng đồng nhắc, nhưng ghi chú khác lại dùng D1/M15 hoặc H4/M5. Chưa chọn một tỷ lệ duy nhất làm yêu cầu bắt buộc của tác giả.
- Có bài riêng về Model 1, KOD, OTE, SMT và fake MSS. Tên chủ đề không đủ để biến mọi close phá pivot thành True MSS, mọi CISD thành Model 1 hoặc mọi hit lặp thành KOD.
- Bản X thuật ngữ [06/11/2026](https://x.com/Romeotpt/status/2118812073455169776) xác nhận được phần đầu qua public embed; bản dài trên mirror cần đối chiếu với video Terminology trước khi nhập toàn bộ glossary.
- Thân nến ≥50%, close ở 1/4 cuối, OB seed timeout 8 nến, model timeout 8 nến, pivot length=2 và Fresh reaction là các lựa chọn code hiện tại, không phải định nghĩa đã xác minh của Romeo.
- Không chuyển các tuyên bố bảo đảm, thành công hoặc ưu việt của người dạy thành cam kết win rate trong web/chỉ báo.

## Hệ quả đối với dự án

Bản kế hoạch thực thi được cập nhật tại [CRT ONLY Reform Plan](CRT-ONLY-REFORM-PLAN.md). Giai đoạn đầu chỉ chuẩn hóa một nhánh C3 sau C2 xác nhận. Các thuật ngữ nâng cao được giữ trong backlog nghiên cứu và phải có ví dụ dương/âm, nguồn và điều kiện được biết ở thời điểm thực trước khi trở thành tín hiệu.
