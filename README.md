# Finpoint Cockpit · Topstep

Ứng dụng web tĩnh quản lý nhật ký giao dịch, rủi ro và lịch sử payout cá nhân cho tài khoản Combine/XFA. HTML nằm trong `index.html`; quy tắc, lưu trữ và giao diện nâng cao được tách trong `assets/`. `topstep.html` là bản sao tương thích.

## Chạy ứng dụng

Mở `index.html` bằng Chrome hoặc Edge. Không cần Node.js hay backend để sử dụng. Tailwind CSS có sẵn trong `assets/tailwind.css`; Google Fonts là tùy chọn qua mạng; phân tích ảnh cần kết nối Gemini và API key của bạn.

Dữ liệu lưu trong LocalStorage. Hãy dùng cùng trình duyệt và cùng địa chỉ mở ứng dụng: `file://`, localhost hoặc tên miền khác nhau có thể có vùng dữ liệu riêng. Hai tệp HTML cũng có thể có vùng lưu riêng khi mở trực tiếp.

## Chức năng

- Quản lý nhiều tài khoản $50K/$100K/$150K, chuyển vòng Combine/XFA, lưu trữ tài khoản đã đóng.
- Nhật ký mặc định chỉ nhập ngày, sản phẩm, PnL. **Ghi chú & tùy chọn** thu gọn các trường bổ sung; **Sửa** chỉnh bản ghi, **⋯** mở chi tiết/lịch sử và xóa. Nhật ký EOD hoặc từng lệnh: sửa, ghi chú, liên kết chart, setup, risk ban đầu, đánh giá tuân thủ; lưu tối đa 30 lần sửa gần nhất.
- Phiên tạm tính không nâng MLL trailing và chưa đủ điều kiện payout; sửa nhật ký tự giữ lịch sử thay đổi.
- Thống kê theo bốn setup: số lệnh, PnL, tỷ lệ thắng, tổng R đã biết và tuân thủ đã đánh giá. Tổng kết EOD và bản ghi cũ không được tính thành lệnh.
- Tự giữ mốc trước khi thay dữ liệu; xem, tải JSON và khôi phục trong **Nhật ký → Khôi phục**. Tối đa 12 mốc; giảm số mốc khi thiếu dung lượng, không ghi tiếp nếu không giữ được mốc mới nhất. Phát hiện tab khác đã thay dữ liệu và yêu cầu tải lại.
- Combine: mục tiêu điều chỉnh theo Consistency 55%; ghi nhớ việc chạm MLL trong lịch sử.
- XFA: số dư bắt đầu $0, MLL ban đầu âm theo gói; khóa MLL tại $0 sau payout đầu tiên.
- Standard/Consistency payout theo từng chu kỳ: kiểm tra số ngày, lợi nhuận và hạn mức. Đây là **ghi nhận cá nhân**, không gửi yêu cầu rút hay đặt lệnh lên Topstep.
- Calculator tính Micro và hợp đồng lớn theo ngân sách SL và ticks/points; trả về 0 khi không đủ ngân sách.
- Checklist CRT–FRVP, Trend, AMD, Break; lưu trạng thái sau khi tải lại; mô phỏng hồ câu bằng Canvas.
- Hồ câu có nút **Toàn màn hình 16:9**: hiện cảnh hồ, nút thao tác như “Thả câu” và nút **Đóng lệnh thủ công · Thu cá**. Nhấn **Esc** hoặc chạm đúp mặt hồ để thoát; giữ nguyên tiến độ checkbox. Nếu trình duyệt chặn Fullscreen API, ứng dụng mở chế độ phủ toàn màn hình trong trang. Màn hình khác tỷ lệ 16:9 có viền tối để giữ tỷ lệ cảnh. Tab/Shift+Tab di chuyển giữa các nút đang dùng được.
- Hồ Câu Tĩnh Tâm dùng cảnh minh họa 2.5D theo mẫu đã duyệt, với cần/dây/phao và gợn nước bằng Canvas. Điều khiển nằm ngoài cảnh; hỗ trợ tạm dừng, giảm chuyển động theo hệ thống và tự dừng khi không hiển thị. Trên điện thoại, checklist nằm ngay sau hồ câu.
- Hồ có nước dao động, lau nhẹ, cá nền xuất hiện ngẫu nhiên và cá mục tiêu riêng. Các bước vào lệnh đọc theo setup và điều kiện trước đó; tích sai thứ tự không tự hoàn thành bước còn thiếu. Các ô quản lý +1R/BE/TP **độc lập**, được lưu riêng theo từng setup: có thể tick BE hoặc TP trực tiếp mà không cần trailing trước. TP được ưu tiên khi vẫn có các ô khác được tích.
- Chuyển động nền có hơi thở nhẹ của nhân vật, đầu cần, lau theo gió, lá rơi và chuồn chuồn thưa. Cá nền không phát âm báo hoặc xác nhận tín hiệu.
- Hồ v2 dùng nền sạch và các lớp PNG trong suốt riêng cho nhân vật, tán cây, cỏ và đèn. Tay/cần dùng cùng phép biến đổi; nước có hai lớp sóng, phản chiếu chuyển động, bóng cá và vệt nước nhẹ. **Chuyển động & hiển thị** cho chọn Nhẹ/Vừa và chế độ giảm tải khi live. [Xem clip khoảng 25 giây](assets/pond/preview-v2.webm).
- **Kết thúc lượt & đánh giá** ghi nhận Full TP / BE / −0.5R / −1R / bỏ qua. Kết quả và tuân thủ được đánh giá riêng; không tự tạo bản ghi PnL hoặc gửi lệnh. Lượt mới làm mới setup hiện tại, giữ các setup khác.
- TP có cú giật mạnh khoảng 0,2 giây, cần bật lên trước rồi cá vọt khỏi nước, có nhịp hồi cần ngắn. Sau đó thu dây về bến → đưa cá vào rổ → thu cần; toàn chuỗi khoảng 3,2 giây. Khôi phục trang hiển thị cá đã nằm trong rổ, không phát lại sự kiện. Tạm dừng/giảm chuyển động hiển thị ngay kết quả cuối.
- Trên desktop, hồ ghim bên trái và quản lý lệnh nằm dưới checklist bên phải. Trên màn hình nhỏ, hồ ghim ở dạng gọn để vẫn tick được các ô bên dưới; nút phóng to cho phép xem cảnh lớn khi cần. Thanh đầu trang cuộn đi trong chế độ Checklist để không che hồ.
- Ánh sáng **Tự động / Sáng / Trưa / Chiều / Tối**: tự động dùng giờ Việt Nam, sáng 05–10h, trưa 10–14h, chiều 14–18h, tối 18–05h. Chọn xem thử chỉ đổi cảnh, không đổi đồng hồ, checklist hoặc lịch hoạt động. Nhãn lịch đọc các khung giờ có sẵn trong dự án; khung Mỹ tính độ lệch giờ Chicago mùa đông. Đây là lịch hiển thị của dự án, không phải dữ liệu thị trường trực tiếp.
- Gemini Chart Lens: tải/dán ảnh, chọn mô hình và đọc kết quả phân tích.
- Xuất CSV EOD; sao lưu/khôi phục JSON gồm cả hai vòng, payout và tùy chọn checklist/giao diện.
- Userscript Tampermonkey hỗ trợ lấy PnL từ giao diện TopstepX.

## Quy tắc tính toán

MLL dựa trên **số dư chốt ngày**, không lấy đỉnh của từng bản ghi trong cùng ngày. Chu kỳ payout loại ngày yêu cầu payout trước. Standard cần 5 ngày thắng từ $150; sau payout đầu, phải có lợi nhuận ròng dương trong chu kỳ mới. Consistency cần 3 ngày và ngày lãi cao nhất không quá 40% lợi nhuận ròng chu kỳ. Payout tối đa bằng 50% số dư XFA và chịu trần theo gói.

| Gói | Standard | Consistency | Standard ưu đãi DLL | Consistency ưu đãi DLL |
| --- | ---: | ---: | ---: | ---: |
| $50K | $2,000 | $3,000 | $4,000 | $6,000 |
| $100K | $3,000 | $4,000 | $6,000 | $8,000 |
| $150K | $5,000 | $6,000 | $10,000 | $12,000 |

Trong **Sửa tài khoản**, chỉ bật ưu đãi gấp đôi trần khi tài khoản thực tế được hưởng ưu đãi DLL lúc mua Combine. Ưu đãi độc lập với phí kích hoạt; dữ liệu cũ mặc định dùng trần cơ bản.

Nguồn đối chiếu ngày **15/10/2026**: [Combine Parameters](https://help.topstep.com/en/articles/8284197-trading-combine-parameters), [Maximum Loss Limit](https://help.topstep.com/en/articles/8284204-what-is-the-maximum-loss-limit), [Payout Policy](https://help.topstep.com/en/articles/8284233-topstep-payout-policy).

Ứng dụng dùng EOD do người dùng ghi nhận, không quan sát lỗ chưa chốt trong phiên hoặc tự xác nhận ngày đã khóa trên Topstep. Calculator xét ngân sách SL, đệm MLL (chừa $0.01 trước ngưỡng), DLL nếu bật và giới hạn hợp đồng. DLL có thể ghi nhận bật/tắt trong **Calculator → Giới hạn tài khoản**. Với XFA, nhập số mini được TopstepX Risk Settings cho phép và ngày phiên áp dụng; chưa xác nhận hoặc khác ngày sẽ trả về 0 hợp đồng. Không tự tăng tier giữa phiên. MBT dùng giới hạn sản phẩm riêng. Xem [Scaling Plan](https://help.topstep.com/en/articles/8284223-what-is-the-scaling-plan) và [DLL](https://help.topstep.com/en/articles/10490293-daily-loss-limit-in-the-trading-combine-and-express-funded-account). Calculator chưa tính phí, trượt giá hoặc vị thế đang mở. Phí gói hiển thị là cấu hình có sẵn, chưa được xác minh trong đợt rà soát này. Thực nhận dùng 90/10, chưa tính phí chuyển tiền/ưu đãi tài khoản cũ. Ngày giao dịch dùng Chicago, đổi phiên lúc 17:00 CT, xử lý cuối tuần; chưa tích hợp lịch nghỉ lễ CME.

## Đồng bộ TopstepX

1. Cài `topstepx_cockpit_sync.user.js` bằng Tampermonkey.
2. Sửa `COCKPIT_URL` đầu script thành địa chỉ `index.html` của bạn. Nếu dùng `file://`, cho phép extension mở file cục bộ trong cài đặt trình duyệt khi cần.
3. Tạo tài khoản Cockpit có ID khớp TopstepX và chọn đúng vòng Combine/XFA.
4. Bấm **Đồng Bộ Cockpit** trên TopstepX, kiểm tra ngày, sản phẩm, PnL rồi xác nhận. PnL bằng 0 được giữ nguyên; nếu không đọc được, ô PnL để trống để bạn nhập.
5. Cockpit hiển thị tài khoản/ngày, số bản ghi và PnL hiện tại so với PnL mới trước khi xác nhận. Đồng bộ thay toàn bộ bản ghi ngày đó bằng một tổng kết EOD và có mốc khôi phục trước khi ghi. ID không tìm thấy hoặc tài khoản lưu trữ sẽ bị từ chối.

Userscript đọc DOM, không dùng API TopstepX; cần kiểm tra lại khi giao diện TopstepX thay đổi. Đồng bộ qua URL fragment và LocalStorage, không qua backend.

## Sao lưu và Google Sheets

Xuất JSON trước khi xóa dữ liệu trình duyệt hoặc chuyển máy. Import kiểm tra tài khoản, ngày, PnL và payout trước khi thay dữ liệu. API key Gemini không nằm trong backup; key lưu trong LocalStorage và ảnh được gửi đến Google khi chạy phân tích.

`topstep_google_sheets_setup.js` là tiện ích **độc lập**, không tự đồng bộ hai chiều. Trong tab Sheets trống, mở Extensions → Apps Script, dán mã rồi chạy `setupTopstepTracker`. Script hỏi trước khi xóa tab hiện tại, tạo cấu hình Combine $50K và công thức cho dòng 12–100. Nhập mỗi ngày một dòng EOD, theo thứ tự ngày và liên tục. CSV xuất từ dashboard cùng cấu trúc 11 cột với `topstep_tracker_template.csv`.

## Cấu trúc

```text
index.html                        Ứng dụng chính
assets/cockpit.js                 Logic giao diện chính và tích hợp
assets/trading-rules.js           Cấu hình, nguồn quy tắc, ledger và payout thuần
assets/account-store.js           Ghi dữ liệu, mốc khôi phục và phát hiện xung đột
assets/workspace.js               Nhật ký gọn, giới hạn, thống kê và khôi phục
assets/workspace.css              Bố cục các phần quản lý mới
assets/tailwind.css               CSS Tailwind cục bộ
assets/angler.css                 Giao diện hồ câu và bố cục checklist
assets/angler.js                  Lớp chuyển động tương tác hồ câu
assets/pond-fullscreen.js         Toàn màn hình 16:9, điều khiển bàn phím và khôi phục
assets/pond-ambient.js            Chuyển động môi trường và nhân vật
assets/pond-scene.js              Ghép lớp cảnh, tư thế, tay/cần và chất lượng
assets/pond-water.js              Sóng, phản chiếu và gợn mặt hồ
assets/pond-behavior.js           Hành vi cá theo bốn setup đã xác nhận
assets/pond-schedule.js           Lịch dùng chung theo mục 7 của playbook
assets/pond-execution.js          Kết quả lượt câu, đánh giá và lưu khôi phục
assets/pond-live.js               Studio, nguồn chart và cam kết/tổng kết buổi
assets/pond-live.css              Bố cục khung live và điều khiển riêng
assets/pond-model.js              Trạng thái checkbox và điều kiện theo setup
assets/pond-life.js               Cá nền, đường bơi và vùng nước
assets/pond-clock.js              Giờ Việt Nam, buổi trong ngày và lịch dự án
assets/pond-catch.js              Quỹ đạo giật cá, thu dây và đưa vào rổ
assets/pond-time.css              Điều khiển ánh sáng và đồng hồ hồ câu
assets/pond/quiet-pond.png         Cảnh minh họa đã duyệt
topstep.html                      Bản sao tương thích
topstepx_cockpit_sync.user.js      Tampermonkey TopstepX → Cockpit
topstep_google_sheets_setup.js    Tiện ích Google Apps Script
topstep_tracker_template.csv     CSV mẫu
trading_playbook.md               Sổ tay giao dịch
phamngocanhthong-topstep.*         Hình ảnh/tài liệu tham khảo
tests/review.cjs                  Kiểm tra ứng dụng bằng Chrome
tests/workspace.cjs               Nhập nhanh/sửa nhật ký, khôi phục, sizing và thống kê
tests/integrations.cjs            Kiểm tra userscript và mock Apps Script
tests/pond.cjs                    Kiểm tra hồ câu, chuyển động và responsive
tests/pond-model.cjs              Kiểm tra 512 tổ hợp checkbox
tests/pond-life.cjs               Mô phỏng cá bơi và giới hạn vùng nước
tests/pond-clock.cjs              Mốc sáng/trưa/chiều/tối và đổi giờ Mỹ
tests/pond-behavior.cjs            Tích sai thứ tự, khôi phục và đổi setup
tests/pond-time.cjs               Đồng hồ tự cập nhật và xem thử ánh sáng
tests/pond-catch.cjs              Quỹ đạo TP và kết quả trong rổ
tests/pond-landing.cjs            TP trực tiếp, hồ ghim và ô quản lý khi cuộn
tools/sync-html.cjs               Đồng bộ hai tệp HTML
tools/build-css.cjs               Biên dịch lại CSS Tailwind cục bộ
REVIEW.md                        Kết quả rà soát
```

## Phát triển và kiểm tra

Chỉnh `index.html`, sau đó đồng bộ bản tương thích. Chỉ phần phát triển/kiểm tra cần Node.js và Playwright:

```powershell
npm install --prefix .review-tools --no-save playwright
node tools/sync-html.cjs
node tests/review.cjs
node tests/workspace.cjs
node tests/integrations.cjs
node tests/pond.cjs
node tests/pond-model.cjs
node tests/pond-life.cjs
node tests/pond-clock.cjs
node tests/pond-behavior.cjs
node tests/pond-time.cjs
node tests/pond-catch.cjs
node tests/pond-landing.cjs
node tests/pond-fullscreen.cjs
node tests/pond-studio.cjs
node tests/pond-layers.cjs
node --check topstepx_cockpit_sync.user.js
node --check topstep_google_sheets_setup.js
```

Nếu thay đổi class Tailwind, tải trình biên dịch chính thức một lần rồi tạo lại CSS:

```powershell
Invoke-WebRequest https://cdn.tailwindcss.com/3.4.17 -OutFile .review-tools/tailwind-cdn.js
node tools/build-css.cjs
```

Kiểm tra dùng Chrome tại đường dẫn mặc định Windows, có thể đổi bằng `CHROME_PATH`. Bộ kiểm tra tạo ngữ cảnh trình duyệt riêng, không truy cập hồ sơ cá nhân. Gemini, TopstepX và Sheets thật không được gọi trong bộ kiểm tra.

Topstep® là thương hiệu của chủ sở hữu tương ứng. Dự án là công cụ quản lý cá nhân.

Kế hoạch phiên đã được loại khỏi giao diện và phép tính. Dữ liệu kế hoạch cũ được giữ trong bản sao lưu để tương thích, không giới hạn calculator.

## Studio livestream và kỷ luật

1. Trong Checklist, bấm biểu tượng điện thoại trên thanh hồ câu để mở **Studio livestream**. Cả Studio và Fullscreen 16:9 đều có nút thao tác chính và **Đóng lệnh thủ công · Thu cá** ngay trên cảnh hồ.
2. Studio có khung dọc 9:16 chia hai nửa hồ/chart; có thể đổi vị trí hai phần. Nút **Chọn chart Topstep** dùng bộ chọn cửa sổ của trình duyệt, không iframe hoặc yêu cầu mật khẩu Topstep. Nguồn chỉ được xem trước, không tự ghi hình/phát sóng. Nếu không hỗ trợ chọn nguồn, có thể ghép chart riêng trong phần mềm live.
3. Kiểm tra thông tin cá nhân trong nguồn trước khi phát. Chọn vùng crop chỉ gồm khung xem trước, không lấy bảng điều khiển. Có thể chọn xem toàn bộ nguồn hoặc cắt viền; chart nhỏ nên chọn cửa sổ chart hẹp hơn.
4. Trước buổi chỉ chọn sản phẩm, setup, khung giờ và xác nhận nguyên tắc chờ đủ điều kiện. Đây là ghi nhận riêng của studio, không đưa lại bảng Kế hoạch phiên trên dashboard. Lịch theo mục 7 playbook: sáng 07:45–10:00 (CRT/Trend), chiều 14:00–16:00 ưu tiên MGC (CRT/AMD), Mỹ 20:15–22:30 (CRT/Trend/Break), mùa đông lùi một giờ. Ngoài khung có nhãn quan sát; giờ không tự tạo tín hiệu.
5. Ghi kết quả thực tế và tự đánh giá quy trình. Nếu đổi setup hoặc tiếp tục sau điều kiện nghỉ, phải ghi lý do. Theo playbook hiện tại, Full TP hoặc hai kết quả −1R liên tiếp chuyển buổi sang nghỉ và chặn bắt đầu lượt mới trong hồ; không can thiệp tài khoản Topstep. Có thể ghi lý do thay đổi để tiếp tục.
6. **Kết thúc buổi** lưu tổng kết tự đánh giá, kể cả không có lệnh. Chưa đánh giá sẽ giữ là chưa đánh giá. Đóng studio/Esc ngừng nguồn chia sẻ và giữ buổi đang theo dõi để mở lại; không tự kết thúc buổi.
7. Dữ liệu lưu cục bộ: tối đa 300 kết quả lượt gần nhất và 30 buổi đã kết thúc. Tổng kết buổi giữ ảnh chụp dữ liệu kết quả khi kết thúc. Có nút tải nhật ký buổi JSON; bản sao lưu JSON đầy đủ cũng bao gồm kết quả và buổi theo dõi, không gồm nguồn video. Dữ liệu buổi tách theo tài khoản/vòng, không cộng vào nhật ký tài chính.

Kiểm tra nguồn chart dùng MediaStream giả trong bộ kiểm thử; phiên TikTok/Topstep thật không được phát trong quá trình phát triển.

Trong hồ câu, +1R hiển thị cá thường, +2R hiển thị cá lớn, Full TP hiển thị cá lớn với màu và hoa văn nổi bật. Tick thẳng TP cũng dùng mức cao nhất. Màu, dáng và hoa văn được chọn ngẫu nhiên theo lượt, giữ nguyên khi tải lại hoặc bỏ tick rồi tick lại; bắt đầu lượt mới sẽ chọn lại. Cá có ánh sáng trên thân, vảy và vây để tạo chiều sâu. Giỏ đan sâu che một phần cá tự nhiên sau khi cất, chân đèn đứng riêng bên trái giỏ.

Nút **Đóng lệnh thủ công · Thu cá** dùng sau khi đã đóng lệnh trên chart, từ bước vào lệnh hoặc khi đang ở +1R/+2R. Nút thu cá theo mức đang chọn, giữ nguyên ô TP và không tự ghi lợi nhuận hay gửi lệnh giao dịch. Lượt được lưu là **Đóng lệnh thủ công**, tách với Full TP; tải lại trang giữ nguyên loại cá và không phát lại động tác. Studio cũng có lựa chọn này trong nhóm kết quả. Kiểm tra bằng `node tests/pond-fish.cjs` và `node tests/pond-manual.cjs`.

Ba nhịp câu được phân biệt: **bước 3** cá thăm mồi, phao nhấp hai nhịp ngắn rồi nghỉ, cần gần như đứng yên; **bước 4** đóng lưỡi một lần rồi cá kéo ngang, phao nghiêng chìm, dây căng và cần chịu lực; **+1R** nâng cần rồi hạ cần thu dây, cá dịu hơn và dần về gần bến, vẫn ở dưới nước. Chuyển bước có nội suy tư thế; tải lại không lặp cú đóng lưỡi. Nhịp này dùng cho cả bốn setup, giữ khác biệt hành vi tiếp cận/xác nhận của từng setup. Kiểm tra bằng `node tests/pond-stages.cjs`.
