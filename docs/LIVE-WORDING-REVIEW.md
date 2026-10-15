# Rà soát ngôn ngữ phát TikTok LIVE

Ngày rà soát: 15/10/2026. Phạm vi dự kiến: người phát và người xem tại Việt Nam; dự án Topstep Calculator, hồ câu, fullscreen và Studio 9:16. Đây là rà soát nội dung và thiết kế, không phải xác nhận đủ điều kiện pháp lý cho hoạt động kinh doanh dịch vụ tài chính.

Triển khai sau xác nhận của người dùng: khung phát dùng tiếng Anh gọn, gồm tên nhật ký, nhãn Combine/XFA mô phỏng, một trạng thái ngắn và ghi chú tự ghi nhận. Phần vận hành chi tiết bằng tiếng Việt giữ ngoài khung phát. Bảng câu chữ bên dưới là bản rà soát đầy đủ, không phải yêu cầu chiếu toàn bộ lên màn hình. Nhãn nguồn chart do người dùng chọn, không tự suy ra từ calculator; đổi/ngừng nguồn hoặc tải lại sẽ bỏ xác nhận cũ. Nguồn chart có thể được crop như ảnh người dùng cung cấp, nhưng crop không tự xác nhận quyền phát hoặc khả năng được TikTok chấp nhận. Mã triển khai: `assets/pond-public.js`, `assets/pond-public.css`; kiểm tra: `tests/pond-public.cjs`.

## Kết luận áp dụng

Nên định vị buổi phát là nhật ký giao dịch và việc tự đánh giá quy trình của chính người phát. Cảnh cá minh họa tiến trình do người dùng đánh dấu, không phải dữ liệu khớp lệnh tự động, tín hiệu cho người xem hay phần thưởng có giá trị quy đổi.

Không dùng từ thay thế để giấu bản chất giao dịch. Trong các tài liệu được kiểm tra, không thấy danh sách từ cấm riêng cho TP, SL, 1R hoặc Topstep; không thể từ đó bảo đảm mọi lần dùng các từ này đều được chấp nhận. Cần xem cả lời nói, chart, lời kêu gọi, bình luận được chiếu lên và quan hệ thương mại.

Người dùng đã xác nhận: LIVE chỉ là nhật ký cá nhân, không bán hoặc giới thiệu dịch vụ. Phạm vi dự án chỉ có Combine và XFA; nguồn chart có thể đổi giữa hai loại này, đều là mô phỏng. Không bổ sung lựa chọn loại tài khoản khác. Nếu mục đích thương mại thay đổi, cần rà soát lại phần quy định liên quan. Loại tài khoản trong calculator không tự chứng minh loại tài khoản của cửa sổ chart đang được chia sẻ.

## Nguồn và phạm vi quy định

1. TikTok Community Guidelines, bản ghi hiệu lực 13/09/2025: cấm lừa đảo tài chính; yêu cầu công bố nội dung thương mại. Quy định LIVE nhấn mạnh trách nhiệm đối với cả nội dung từ công cụ bên thứ ba và việc né biện pháp xử lý có thể dẫn tới hạn chế tài khoản. Nguồn: [hoạt động thương mại](https://www.tiktok.com/community-guidelines/en/regulated-commercial-activities/), [LIVE và tài khoản](https://www.tiktok.com/community-guidelines/en/accounts-features).
2. Branded Content Policy, trang ghi cập nhật 12/2025: affiliate là một dạng quan hệ thương mại. Dịch vụ tài chính tại Việt Nam có điều kiện giới hạn tuổi/thị trường và điều kiện sản phẩm; không được suy ra chỉ gắn nhãn tài trợ là đủ. Nguồn: [Branded Content](https://www.tiktok.com/legal/page/global/bc-policy/en). Quy định riêng theo thị trường còn đề cập nội dung thương mại mô phỏng cờ bạc tại Việt Nam: [market-specific requirements](https://ads.tiktok.com/resources/help/article/branded-content-policy-country-specific-requirements?lang=en). Không tự đồng nhất hoạt cảnh cá trang trí hiện tại với cờ bạc.
3. Financial Services Ads Policy, trang ghi cập nhật 09/2026: quảng cáo dịch vụ đầu tư tại Việt Nam có điều kiện đăng ký với cơ quan quản lý được liệt kê. Đây là chính sách quảng cáo; không phải lệnh cấm mọi nhật ký giao dịch không thương mại. Nguồn: [TikTok Financial Services](https://ads.tiktok.com/resources/help/article/tiktok-ads-policy-financial-services?lang=en). Công cụ công bố thương mại áp dụng được khi LIVE: [TikTok Help](https://support.tiktok.com/en/business-and-creator/creator-and-business-accounts/promoting-a-brand-product-or-service).
4. Luật 75/2025/QH15, hiệu lực 01/01/2026: Điều 15a bổ sung nghĩa vụ của người chuyển tải quảng cáo; Điều 19 yêu cầu nội dung chính xác, không gây hiểu nhầm; Điều 23 điều chỉnh quảng cáo trên mạng. Người có ảnh hưởng quảng cáo phải kiểm tra thông tin và công bố việc quảng cáo trước và trong hoạt động. Nguồn: [văn bản chính thức](https://datafiles.chinhphu.vn/cpp/files/vbpq/2025/7/75-2025-qh15.pdf). Nghị định hướng dẫn 342/2025/NĐ-CP có hiệu lực 15/02/2026: [trang văn bản Chính phủ](https://chinhphu.vn/?docid=216403&pageid=27160). Việc áp dụng phải xét nội dung/quan hệ thực tế, không chỉ tên buổi phát.
5. Topstep xác nhận Trading Combine là đánh giá mô phỏng và Express Funded Account là tài khoản mô phỏng; không dùng nhãn “giao dịch tiền thật” cho hai loại này. Nguồn: [New to Topstep](https://help.topstep.com/en/articles/8284199-new-to-topstep-start-here), [XFA Parameters](https://help.topstep.com/en/articles/8284215-express-funded-account-parameters).
6. Quyền phát chart là vấn đề riêng với cách viết. Mục 19 của Terms of Use Topstep giới hạn quyền sử dụng nội dung theo điều khoản cấp phép cá nhân, không công khai; cần kiểm tra phạm vi cho phép áp dụng cho nguồn chart/tài khoản, không coi thao tác chọn cửa sổ là đã có quyền phát. Nguồn: [Topstep Terms of Use, cập nhật 21/09/2026](https://www.topstep.com/terms-of-use). Chưa xác nhận quyền phát lại dữ liệu giá cho tài khoản cụ thể của người dùng.

Không kết luận giao dịch futures/prop của người dùng thuộc Forex hay xác nhận được phép kinh doanh tại Việt Nam chỉ từ những nguồn này. Nếu bán tín hiệu, nhận tiền quản lý, môi giới hoặc quảng bá trả phí, cần rà soát giấy phép và mô hình cụ thể với người có chuyên môn pháp lý.

## Những gì thực sự xuất hiện trong dự án

- `assets/pond-model.js`: trạng thái và nút của cả bốn phương pháp, từ quan sát đến vào lệnh, 1R, BE, TP.
- `assets/angler.js`: câu nhắc, tooltip, aria-label, nút chính và nhãn thu cá.
- `assets/pond-execution.js`: kết quả thủ công, đánh giá quy trình, nút thu cá sau khi đóng trên chart.
- `assets/pond-live.js`: caption động, giờ phiên, nguyên tắc, placeholder chart, các nhãn buổi theo dõi.
- `assets/pond-catch.js`: mô tả giật/thu/cất cá; có thể giữ vì mô tả đúng hoạt cảnh.
- Fullscreen và Studio dùng lại chính card hồ; nhãn trên hai nút cũng nằm trong vùng có thể phát cho người xem.

## Bảng câu chữ đề xuất

Đây là đề xuất biên tập để thông tin chính xác hơn, không phải danh sách thay từ để né kiểm duyệt. Các mốc tài chính vẫn giữ đúng ý nghĩa.

| Vị trí/trạng thái | Hiện tại hoặc rủi ro hiểu nhầm | Đề xuất cho khung công khai |
|---|---|---|
| Tên buổi | Dễ chỉ thấy hồ mà thiếu ngữ cảnh chart | Nhật ký giao dịch cá nhân |
| Ngữ cảnh | Chưa phân biệt tài khoản nguồn | Tài khoản mô phỏng · Trading Combine hoặc Tài khoản mô phỏng · XFA, theo nguồn thực tế đã xác nhận |
| Hoạt cảnh | Cá lớn có thể bị hiểu như tiền thưởng | Hồ câu minh họa tiến trình tự ghi nhận |
| Chưa bắt đầu | Hồ câu · chờ đúng điều kiện | Tôi đang quan sát, chưa ghi nhận giao dịch |
| Bước 1 | Các bước xác định vùng/sóng/hộp | Tôi đang xác định vùng quan sát của mình |
| Bước 2 | Phản ứng POC, bẫy giá, nến break | Tôi đang theo dõi phản ứng tại vùng đã chọn |
| Bước 3 | POC đã có xác nhận, Retest đã giữ vùng giá | Tôi đã đánh dấu điều kiện xác nhận trong checklist |
| Bước 4 | Đã khớp lệnh theo kế hoạch | Tôi đã ghi nhận bước vào lệnh của mình |
| Nút mốc 1R | Theo dõi +1R | Ghi nhận mốc +1R của tôi |
| Nút BE | Dời SL về BE | Ghi nhận SL về BE của tôi |
| TP | Full TP · Trọn kỷ luật | Tôi đã ghi nhận TP · Đánh giá quy trình riêng |
| Nút đóng tay | Đóng lệnh thủ công · Thu cá có thể bị hiểu là gửi lệnh | Đã đóng trên chart · Thu cá |
| BE/SL/−0.5R | Có thể bị bỏ qua khi chỉ khoe TP | Giữ đầy đủ các kết quả, kèm “Tôi đã ghi nhận…” |
| Bỏ setup | Bỏ qua setup | Tôi bỏ qua lượt này |
| Lượt mới | Bắt đầu lượt mới | Lượt mới trong nhật ký |
| Nhắc nhở | Giữ kế hoạch. Để xác suất làm phần việc còn lại. | Tôi theo dõi việc tuân thủ kế hoạch; kết quả vẫn không chắc chắn |
| Đánh giá | Kết quả lệnh và mức tuân thủ được đánh giá riêng | Giữ nguyên ý này |
| Nghỉ | Đã nghỉ | Tôi đã dừng phiên theo quy tắc cá nhân |
| Thiếu điều kiện/tick ngoài thứ tự | Có thể suy diễn là tín hiệu | Checklist của tôi còn thiếu điều kiện; chưa xác nhận đủ quy trình |
| Chưa chọn nguồn | CHART TOPSTEP | Chưa chia sẻ nguồn chart |
| Mất/ngừng chia sẻ | Dễ tưởng chart vẫn đang trực tiếp | Nguồn chart đã dừng chia sẻ |
| Kết thúc | Không nhất thiết có giao dịch | Tôi kết thúc phiên · Có/không có lượt ghi nhận |

Giữ những lời mô tả hoạt cảnh như “Thả câu”, “Thu dây, đưa cá về bến”, “Đã cất cá vào giỏ”, đồng thời giữ ngữ cảnh giao dịch ở caption. Không chuyển toàn bộ giao dịch thành một “trò câu cá” nhằm làm người xem hiểu sai nội dung.

Không tuyên bố đã khớp lệnh chỉ vì checkbox được tick: ứng dụng chưa có xác nhận thực thi lệnh từ chart. Không gọi đạt TP là tự động tuân thủ tốt. Không diễn giải bảo vệ BE là chắc chắn không thể mất tiền.

## Caption và lời giới thiệu dùng được theo đúng sự thật

Ví dụ với nguồn Combine/XFA:

> Nhật ký giao dịch cá nhân · Tài khoản mô phỏng
>
> Hoạt cảnh do tôi tự đánh dấu; không xác nhận khớp lệnh từ chart. Không khuyến nghị mua/bán. Kết quả không bảo đảm tương lai.

Ví dụ lời mở đầu: “Tôi ghi lại cách mình chờ điều kiện và quản lý rủi ro trong phiên này. Đây là tài khoản mô phỏng [chỉ nói nếu đúng]. Hoạt cảnh cá minh họa các bước tôi tự ghi nhận. Tôi không hướng dẫn người xem vào lệnh theo mình.”

Chỉ ghi “không tài trợ”, “không affiliate”, “không nhận vốn” nếu đúng. Nếu có quan hệ thương mại, công bố theo thực tế và kiểm tra điều kiện dịch vụ trước. Một dòng miễn trừ không hợp thức hóa hành vi quảng cáo sai hoặc dịch vụ không đủ điều kiện.

## Hướng triển khai sau rà soát

1. Tạo bảng nội dung công khai dùng chung cho normal/fullscreen/Studio; giữ mã trạng thái, checkbox và phép tính. Các câu nên nói về hành động của “tôi”, không ra chỉ thị cho người xem.
2. Cho người vận hành chọn một trong hai loại tài khoản của nguồn chart: **Trading Combine — mô phỏng** hoặc **Express Funded (XFA) — mô phỏng**. Không bổ sung loại khác và không đoán từ calculator. Khi chọn nguồn chart mới, xóa xác nhận loại nguồn cũ và yêu cầu xác nhận lại; cho phép sửa loại khi đổi tài khoản bên trong cùng cửa sổ đang chia sẻ. Trước khi xác nhận thì hiển thị **Chưa xác nhận nguồn chart**, đây là trạng thái chờ, không phải loại tài khoản thứ ba. Đây là nhãn do người dùng xác nhận, không phải xác minh kỹ thuật từ nền tảng.
3. Giữ caption ngữ cảnh đọc được trong khung 9:16, kể cả sau đảo vị trí hai phần; tránh bị hai nút hoặc giao diện TikTok che. Nếu là quảng cáo có cảnh báo bắt buộc, tuân thủ yêu cầu hiển thị tương ứng, không thu nhỏ thành dòng khó đọc.
4. Nút đóng tay chỉ ghi nhận sau khi người dùng đóng trên chart; tooltip/aria-label cũng phải diễn đạt điều này. Giữ đầy đủ TP/BE/SL/bỏ lượt, không chỉ hiển thị lượt tốt.
5. Chặn việc đưa trực tiếp lý do tự nhập, tên tài khoản hoặc bình luận lên caption nếu chưa có lựa chọn và xem trước của người vận hành; đây là quản lý nội dung và quyền riêng tư, không phải che bản chất giao dịch.
6. Kiểm tra cả bốn phương pháp, các bước 0–7, tick ngoài thứ tự, rollback, mọi kết quả, nghỉ/tiếp tục, chưa chọn/mất nguồn, reload, fullscreen và Studio; kiểm tra cả tooltip/aria-label. Phần chữ chỉnh sửa không được tự thay đổi số liệu tài chính hay dữ liệu lịch sử.

Không hứa buổi LIVE sẽ không bị hạn chế. Kết quả xét duyệt còn phụ thuộc nội dung thực tế và cách áp dụng của TikTok. Khi có thông báo vi phạm, dùng quy trình khiếu nại và căn cứ rõ ràng thay vì thử các cách viết để né nhận diện.
