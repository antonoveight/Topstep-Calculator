# CRT thuần & thời gian · 22/11/2026

Nhánh Confirmed phát trong nến HTF đầu tiên sau mỗi lần xác nhận: C3 ở attempt đầu, hoặc nến sau raid/reclaim mới của cùng C1. Hết cửa sổ không xóa range. Nhánh [Early C2 thử nghiệm](EARLY-C2-EXPERIMENT.md) có dấu E riêng; xem [vòng đời range/attempt](CRT-SETUP-LIFECYCLE.md).

Đây là đặc tả hiện hành, thay thế phần entry/key/time trong tài liệu trước ngày này. Người dùng đã chọn bỏ cả CISD/MSS, FVG/OB, ICT Macros, Quarterly Theory và True Open. Bản Pine cũ giữ riêng trong `indicators/archive/funded-angler-v6-crt-support-2026-11-22.pine` để đối chiếu, không chạy trên web.

## HTF và thanh khoản

C1 là nến ngay trước C2. High/Low luôn gồm râu. C2 xuyên đúng một biên C1 ít nhất một tick rồi đóng hẳn trong range: quét Low cho Buy, quét High cho Sell. Quét hai biên không xác nhận một hướng. Target là biên đối diện C1; INV là cực trị C2. EQ chỉ là mốc quan sát.

IRL trong phiên bản cá nhân này thu hẹp thành **swing HTF đã xác nhận, chưa bị lấy, nằm trong range C1**. ERL là thanh khoản swing ngoài range. Đây là lựa chọn cá nhân, không tuyên bố mọi định nghĩa IRL chỉ gồm swing. Không có nguồn hợp lệ thì để trống. Đường vẽ neo nến tạo cực trị; chỉ biết pivot sau khi được xác nhận.

CRT ngược bias cần key swing HTF đã biết trước lúc C1 mở, được C2 sweep/reclaim. Key có thể từ HTF model hoặc Bias TF lớn hơn. Bias Auto vẫn dùng cấu trúc swing/close đã xác nhận và guard tạm dừng; đó là bối cảnh hướng, không phải bộ xác nhận entry. Long/Short/Neutral vẫn cho phép tự chọn.

## TS LTF và retest

Đây là **quy ước thực thi của công cụ cá nhân**, không gán cho Romeotpt như một thuật toán ông đã công bố.

1. Chỉ xét M1/M3/M5 chia hết HTF, trong C3 HTF sau C2 đã đóng.
2. Cả hai nến C1/C2 LTF phải mở sau thời điểm xác nhận HTF. C2 LTF sweep một biên, đóng trong range nến trước; hướng TS cùng hướng CRT HTF. Quét hai biên hoặc chỉ chạm không xác nhận.
3. Mặc định Pullback: **nến sau TS** mới được retest biên C1 LTF đã thu hồi, đóng đúng phía và không chạm cực trị TS. Tam giác nằm tại chính nến retest đã đóng.
4. Confirmation close là tùy chọn phát dấu khi TS LTF đóng, không đợi hồi. Không phải Early C2 HTF.
5. Pending bị hủy nếu close trở lại hoặc đúng biên thu hồi, hoặc wick chạm cực trị TS LTF. TS mới có thể xác nhận lại; không dùng cùng nến đó làm retest của xác nhận cũ.
6. Fresh reaction cần TS mới với cả hai nến nguồn sau dấu trước, cực trị tiến triển và pivot hồi mới đã xác nhận. One per model chỉ một dấu. Khóa sóng xuyên model vẫn giữ.
7. Chạm target/cực trị SL HTF, hết C3, thiếu key ngược bias, bias trung tính/tạm dừng hoặc thiếu đường tới target đều chặn entry.

Thay bộ xác nhận sẽ thay vị trí và tần suất dấu. Chưa có Replay thị trường hay bằng chứng tỷ lệ thắng cho bản mới; chấp nhận Replay bản trước không tự chuyển sang bản này.

## Thời gian CRT

| Mốc | Cách dùng |
| --- | --- |
| C1 đóng | Cố định range theo đúng feed. |
| C2 đang chạy | Chỉ quan sát khả năng raid/reclaim; chưa xác nhận model HTF. |
| C2 đóng | Xác nhận TS nếu đạt điều kiện; theo dõi C3 thực tế kế tiếp. |
| C3 đang chạy | Cửa sổ duy nhất để tìm TS/retest LTF. |
| C3 đóng | Hết quyền entry; không mang pending sang C4. |
| TRACK / WATCH | Hết C3 chỉ đóng entry; INV kết thúc attempt. C1 còn để theo dõi/tái xác nhận đến khi target bị lấy hoặc bị loại khỏi bộ nhớ. |
| TG / INV / AMB | Target chạm / wick chạm cực trị C2 trên nến đã đóng / không phân biệt được thứ tự hai rào cản trong cùng nến. |

Pine lấy giờ mở/đóng và OHLC từ feed. Panel T hiển thị giờ đóng HTF hiện tại theo America/New_York có DST; C3 là entry window đầu tiên; sau đó TRACK giữ range, WATCH tạm đợi C3 gốc đóng, SEARCH khi không còn parent. Tooltip giữ giờ nguồn, không cộng cứng số giờ qua khoảng nghỉ.

Web giữ phiên thị trường, lịch tin và thêm đồng hồ C3 với hai mốc **nhập từ chart**, múi giờ chart rõ ràng. Web chưa nhận model/feed từ Pine. Không đến một giờ cố định rồi tự coi là có TS. Lưu đồng hồ tách khỏi tài khoản. Từ chối giờ DST không tồn tại hoặc lặp chưa phân biệt; dùng UTC trong giờ lặp. Lịch sinh hoạt cá nhân vẫn chỉ là lịch quan sát.

## Nguồn giờ Romeotpt

[Bài chính thức 6264](https://t.me/officialRomeotpt/6264), đọc qua [bản công khai](https://t.me/s/officialRomeotpt?before=6280), liệt kê Forex 159159, index futures 26102610, crypto 12481248. Bài ngắn chưa chỉ rõ múi giờ, phiên và cách neo nến. Chưa dùng làm bộ lọc/cảnh báo. MGC là vàng futures, không tự áp lịch index futures.

[Bài khác trên kênh chính thức](https://t.me/s/officialRomeotpt?after=6276) nêu 00:00, 03:00, 08:15, 09:30, 13:30 để quay lại quan sát sau khi lỡ nhịp. Cũng chưa đủ dữ kiện múi giờ/sản phẩm để quy đổi tự động. Chỉ trình bày trong mục tham khảo, không biến thành cửa sổ thuật toán.

## Cài đặt và kiểm tra

Mặc định: HTF H1, Bias TF D1, Auto bias, Pullback, Fresh reaction, History 100. Còn 23 input, gồm công tắc Early C2 thử nghiệm bật sẵn theo yêu cầu mới; HTF tùy H1/H2/H4/D1. Không còn chọn loại xác nhận hoặc bộ lọc giờ cũ.

Checklist schema `crt-v1` → `crt-ts-v2`: snapshot cũ giữ nguyên, các ô mới bắt đầu chưa xác nhận. Nhật ký, kết quả cũ, giỏ cá và tài khoản vẫn giữ. Early C2 nay đã được cho phép bật thử theo [đặc tả thuần CRT riêng](EARLY-C2-EXPERIMENT.md). Dấu E chưa phải HTF Confirmed, không trộn vào tam giác C3 hay bộ audit Confirmed. Nghiên cứu cũ không còn là đặc tả đang chạy.

Chạy `node tools/check-crt.cjs` và `node tools/check-crt-web.cjs`. Kiểm tra thân hàm Pine giới hạn và trình duyệt không thay Pine runtime/Replay dữ liệu giá. Các bài test của bộ lọc đã bỏ chỉ còn giá trị lịch sử.

Vòng đời setup hiện hành: [Range C1, attempt, INV/TG và xác nhận lại](CRT-SETUP-LIFECYCLE.md).
