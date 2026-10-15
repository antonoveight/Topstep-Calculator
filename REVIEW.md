# Rà soát dự án — 14/10/2026

## Cập nhật giao diện hồ câu — 15/10/2026

**Bổ sung mới nhất:** TP có quỹ đạo 4 giây qua các pha giật khỏi nước, thu dây, đưa qua rổ và thả cá vào rổ; phần đan mặt trước của rổ che cá đúng lớp. Trạng thái hoàn tất giữ cá trong rổ khi tải lại, không phát lại sự kiện.

Các ô quản lý +1R/BE/TP giờ độc lập với nhau và với checklist vào lệnh. TP trực tiếp không bắt tick BE/trailing, không tự sửa các ô khác. TP có ưu tiên cao nhất khi nhiều ô được tích; trạng thái vẫn tách theo setup.

Chuyển quản lý lệnh sang dưới checklist ở cột phải; hồ ghim bên trái trên desktop. Mobile/tablet có hồ ghim gọn và nút xem lớn. Cho header cuộn đi riêng ở Checklist để tránh che cảnh, đo lại chiều cao hồ để giữ khoảng cuộn phù hợp.

`tests/pond-catch.cjs` kiểm tra quỹ đạo liên tục, khoảng giật lên, dây nối miệng cá và điểm rổ. `tests/pond-landing.cjs` kiểm tra TP trực tiếp bằng checkbox thật, các pha chạy theo thời gian thực, kết quả rổ sau tải lại, nút phóng to và việc canvas không bị header che ở 5 kích thước. Ảnh kiểm tra: `output/pond-tp-reel.png`, `output/pond-tp-basket.png`, `output/pond-tp-done.png`, `output/pond-management-mobile.png`.

Nâng cấp tiếp theo đã thực hiện theo thứ tự: (1) mô hình checkbox chính xác, (2) chuyển động môi trường/cá nền, (3) thời gian và ánh sáng, (4) kiểm tra tổng thể.

- `pond-model.js`: kiểm tra 512 tổ hợp của 4 setup và 7 ô điều kiện/rủi ro. Bước thiếu chặn hiệu ứng sau đó; mỗi setup có hành vi riêng. Khôi phục, đổi setup và bỏ tích không phát lại sự kiện bắt cá. Trạng thái rủi ro lưu riêng theo setup, có chuyển đổi dữ liệu cũ.
- `pond-life.js`: cá nền độc lập, đường cong Bezier nằm trong vùng nước an toàn, quẫy đuôi, fade in/out và đổi lượt ngẫu nhiên. Giới hạn 5 cá desktop/3 cá mobile. Kiểm tra 400 giây mô phỏng cho từng loại thiết bị.
- Mặt nước được dịch chuyển nhẹ trong mask, giữ bờ/cầu/người cố định; thêm sóng, phản sáng, lau và cá mục tiêu theo setup. Render giới hạn khoảng 30 FPS, tiếp tục tuân thủ pause/reduced motion/ẩn cảnh.
- `pond-clock.js`: giờ Việt Nam, 4 buổi và xem thử, chuyển màu dần, sương sáng, đèn/đom đóm tối. Lịch hoạt động đọc dữ liệu từ thẻ giờ hiện có, khung Mỹ dùng offset Chicago để áp dụng dịch mùa đông. Xem thử không thay lịch thực hay checklist.
- `tests/pond-time.cjs` kiểm tra bằng đồng hồ giả: mốc chuyển phút tự cập nhật, thiết bị đặt múi giờ Mỹ vẫn hiển thị giờ Việt Nam, lưu chế độ, ngừng timer khi ẩn cảnh, và thế giới đứng yên khi pause.

Ảnh kiểm tra bốn buổi: `output/pond-morning.png`, `output/pond-noon.png`, `output/pond-afternoon.png`, `output/pond-evening.png`.

Triển khai mẫu được duyệt: cảnh minh họa 2.5D cục bộ, bố cục hồ/checklist khoảng 60/40 trên desktop, bỏ HUD tiền vàng/level và đưa trạng thái cùng nút hành động ra ngoài cảnh. Tách engine và CSS hồ câu thành `assets/angler.js`/`assets/angler.css`.

Cần, dây và phao dùng chung hệ tọa độ với ảnh nền; có chuyển động thả câu, gợn nước và cá khi hoàn tất TP. Nút hành động đi qua 4 điều kiện của setup đang chọn, sau đó +1R, BE và TP theo thứ tự. Trạng thái checklist và khôi phục dữ liệu giữ nguyên.

Thêm nút tạm dừng có lưu tùy chọn, hỗ trợ `prefers-reduced-motion`, dừng RAF khi hồ thu gọn, rời viewport, chuyển dashboard hoặc ẩn tab. Cảnh nền là ảnh tĩnh; phần chuyển động là Canvas phủ lên ảnh.

Sửa sidebar che nội dung khi màn hình nhỏ; trên mobile xếp hồ → checklist → quản trị lệnh → AI. `tests/pond.cjs` kiểm tra chuỗi tương tác, khôi phục tạm dừng, thu gọn/mở rộng, giảm chuyển động và dark/light ở 1600/1280/768/390/320px. Ảnh chụp ứng dụng nằm tại `output/pond-desktop.png` và `output/pond-mobile.png`.

## Đã sửa

- Bổ sung `exportTrackerCSV`: UTF-8 BOM, đúng 11 cột, tổng hợp EOD theo ngày và dùng cùng ledger với dashboard.
- Đồng bộ TopstepX lưu vào khóa tài khoản chính, tìm đúng account ID, kiểm tra payload, xác nhận thay dữ liệu ngày đã có; không tạo PnL giả khi giá trị bằng 0 hoặc không đọc được.
- Userscript tránh đọc mã tài khoản trong nội dung script và tránh nhầm số dư với PnL; dùng ngày giao dịch Chicago và `GM_openInTab`.
- Khôi phục checklist trước khi ghi trạng thái mới; nút câu cá dùng setup đang chọn. Loại bỏ engine và các hàm câu cá trùng, giữ engine hồ tự nhiên hiện tại.
- Calculator trả 0 khi không đủ ngân sách, xóa kết quả cũ khi nhập không hợp lệ, làm tròn ticks lên và tính số hợp đồng lớn riêng theo giá trị tick, gồm tỷ lệ MBT/BTC 1:50.
- Sắp xếp nhật ký theo ngày; tính MLL sau khi cộng tất cả bản ghi của ngày; ghi nhớ việc chạm MLL dù tài khoản phục hồi sau đó.
- XFA bắt đầu $0; MLL âm ban đầu và khóa $0 sau payout đầu; số dư lịch sử payout dựa vào thời điểm rút.
- Payout dùng điều kiện thống nhất cho form, KPI và hub; reset chu kỳ ngày/Consistency; không cho rút lặp bằng ngày thắng của chu kỳ trước hoặc xác nhận bỏ qua điều kiện.
- Sửa bảng cap theo hai lộ trình; quyền lợi gấp đôi DLL là tùy chọn riêng trong Sửa tài khoản, độc lập với phí kích hoạt.
- Đồng nhất Consistency Combine 55% trên các thẻ; thanh tiến độ dùng mục tiêu đã điều chỉnh.
- Kiểm tra đầy đủ JSON trước khi thay dữ liệu; bảo toàn LocalStorage bị lỗi; backup thêm tùy chọn giao diện/checklist, không chứa API key.
- Escape tên/mã tài khoản và văn bản AI khi hiển thị HTML; bỏ nội suy account ID vào mã JavaScript trong nút chọn quỹ.
- Thay các nút gọi hàm không tồn tại bằng điều hướng hoạt động.
- Apps Script: sửa API gridlines, loại ngày trống khi đếm ngày, tạo công thức đến dòng 100 và xác nhận trước khi thay tab.
- Đưa CSS Tailwind 3.4.17 vào `assets/`, kèm giấy phép; giao diện không phụ thuộc CDN Tailwind. Google Fonts vẫn là tùy chọn qua mạng.
- Bổ sung hướng dẫn sử dụng, đồng bộ, sao lưu và các công cụ bảo trì hai bản HTML/CSS.

## Xác minh

`node tests/review.cjs`: 14 nhóm kiểm tra trên Chrome headless, gồm tải lại dữ liệu/checklist, tổng hợp EOD và MLL, sizing, payload đồng bộ, tải CSV/JSON, các cap, hai chu kỳ payout, phục hồi sau lỗi và hiển thị văn bản không thực thi HTML. Không có lỗi JavaScript trong các luồng được kiểm tra.

`node tests/integrations.cjs`: userscript chạy trên DOM mô phỏng TopstepX với PnL 0/âm; Apps Script chạy với mock API để kiểm tra hủy thao tác và công thức đến dòng 100.

Kiểm tra cú pháp JavaScript và `git diff --check`; kiểm tra hai entry point có nội dung giống nhau và không còn hàm khai báo trùng.

Kiểm tra hiển thị thực tế với CSS cục bộ ở 1440px và 390px, cả dashboard và checklist: không có tràn ngang toàn trang; modal đóng khi khởi động. Giữ bảng có cuộn ngang riêng.

## Giới hạn thực tế

Chưa đăng nhập tài khoản TopstepX thật, gọi Gemini bằng key thật hoặc chạy script trên Google Sheets thật. Các kiểm tra tích hợp sử dụng dữ liệu giả lập; cần kiểm tra lại userscript nếu DOM TopstepX thay đổi.

Dự án là nhật ký EOD, không xác nhận việc khóa ngày hoặc theo dõi rủi ro chưa chốt trong phiên. Calculator chưa áp dụng XFA Scaling Plan. Chưa có lịch nghỉ lễ CME, thuế/phí chuyển tiền, tỷ lệ chia đặc biệt cho tài khoản cũ hoặc kiểm chứng giá bán các gói. Những phạm vi này được ghi rõ trong README.

## Nguồn đối chiếu

- [Trading Combine Parameters](https://help.topstep.com/en/articles/8284197-trading-combine-parameters)
- [Maximum Loss Limit](https://help.topstep.com/en/articles/8284204-what-is-the-maximum-loss-limit)
- [Payout Policy](https://help.topstep.com/en/articles/8284233-topstep-payout-policy)
- [Google Apps Script Sheet API](https://developers.google.com/apps-script/reference/spreadsheet/sheet)
- [CME Micro Bitcoin overview](https://www.cmegroup.com/education/courses/micro-cryptocurrency-futures-and-options-fundamentals/micro-bitcoin/micro-bitcoin-futures-product-overview.hideSubnav.educationIframe.html?hideAddThisExt=y&hideFooter=y&hideHeader=y&hideRightRail=y)


## Nâng cấp quản lý phiên và dữ liệu — 15/10/2026

- Tách JavaScript chính thành `assets/cockpit.js`; đưa cấu hình/ledger/payout vào `trading-rules.js`, cơ chế lưu và snapshot vào `account-store.js`, các phần nhật ký/kế hoạch/thống kê vào `workspace.js`. Không thêm bước build khi chạy ứng dụng.
- Sửa enum `no_act_fee` → `no_activation`, đọc tương thích dữ liệu cũ. Kiểm tra metadata mới khi import và lưu.
- Snapshot trước mỗi thay đổi tài khoản/nhật ký; khôi phục toàn bộ hoặc tải JSON, tối đa 12 mốc. Từ chối ghi nếu không giữ được mốc mới nhất hoặc dữ liệu đã thay đổi ở tab khác. Lỗi ghi khôi phục dữ liệu đã lưu trong bộ nhớ ứng dụng.
- Import và sync đi qua cùng cơ chế lưu; sync xem trước PnL cũ/mới, số bản ghi, ngày và ID trước khi thay cả ngày.
- Nhật ký hỗ trợ sửa có lịch sử, ghi chú, link chart, bốn setup, risk/R, tuân thủ và EOD tạm tính/đã chốt. Không trộn tổng EOD với từng lệnh trong cùng ngày qua biểu mẫu. Sửa/xóa phiên đã chốt phải xác nhận; bản ghi cũ được hiểu là tổng EOD đã chốt để giữ tương thích.
- Kế hoạch phiên lưu riêng theo tài khoản/vòng/ngày CT. Calculator xét MLL/DLL/ngân sách phiên/risk mỗi lệnh. XFA cần giới hạn mini được xác nhận từ Risk Settings đúng phiên; không tự suy đoán tier hoặc tăng giữa phiên. MBT có giới hạn riêng.
- Thống kê chỉ đếm bản ghi từng lệnh; các tỷ lệ R và tuân thủ ghi rõ mẫu dữ liệu. Thêm mô tả hành động nút hồ câu bằng tooltip/nhãn truy cập.
- Kiểm chứng mới: `tests/workspace.cjs` chạy thao tác biểu mẫu thực, sửa/lịch sử, ghi chú có HTML, link chart, lưu/reload kế hoạch, thống kê Break/R/tuân thủ, xóa/khôi phục, thiếu giới hạn XFA, MLL mỏng, lỗi quota, xung đột tab, migration, filter ngày và responsive 1440/768/390.
- Tiếp tục dùng bộ kiểm tra cũ cho journal/payout/sync/import, tích hợp mock và toàn bộ mô phỏng hồ câu. Dịch vụ Gemini/TopstepX/Sheets thật không được gọi trong kiểm tra.
- Kết quả: 11 tệp kiểm thử chạy đạt; bộ review gồm 14 nhóm trình duyệt. Các phần mới không ghi nhận lỗi runtime trong kiểm tra. Hub tổng hợp cộng cả hai vòng và đếm theo ngày/vòng, tách rõ thắng/thua/hòa; toast xác nhận hiển thị đúng.


## Rút gọn theo phản hồi

- Bỏ Kế hoạch phiên và các ràng buộc risk/ngân sách từ kế hoạch cũ. Giữ metadata cũ trong backup, không dùng để tính khối lượng.
- Nhật ký mặc định nhập ngày, mã, PnL. Đưa thông tin phụ vào “Ghi chú & tùy chọn” thu gọn. Sửa trực tiếp, tự giữ lịch sử; chi tiết tài chính/lịch sử/xóa nằm trong nút ⋯.
- Thu gọn bảng, thống kê setup mặc định đóng. Chuyển Khôi phục về thanh nhật ký, giới hạn DLL/XFA về Calculator.
- Kiểm tra nhập nhanh không mở tùy chọn, sửa bản ghi cũ, khôi phục, calculator bỏ qua ngân sách kế hoạch cũ và responsive desktop/tablet/mobile.

## Hồ câu toàn màn hình 16:9

- Thêm nút toàn màn hình trên thanh công cụ hồ câu. Khi bật chỉ còn cảnh và một nút thao tác, sử dụng trạng thái và hiệu ứng câu hiện có.
- Ảnh và canvas cùng crop 16:9 ở tâm, dùng tỷ lệ đồng nhất để không kéo méo; các điểm neo cần/dây/cá/rổ giữ khớp. Màn hình khác 16:9 dùng viền tối.
- Fullscreen API có fallback dialog toàn màn hình; Esc hoặc chạm đúp mặt hồ để thoát. Giữ tiến độ và khôi phục trạng thái thu gọn, focus, overflow; Tab tập trung vào nút duy nhất.
- `tests/pond-fullscreen.cjs` đạt: native fullscreen, một nút, tỷ lệ cảnh/canvas, cả lượt câu tới rổ, Esc, fallback khi API bị từ chối, bàn phím và bốn kích thước desktop/mobile. `tests/review.cjs`, `tests/pond.cjs`, `tests/pond-landing.cjs` cũng đạt sau thay đổi.
