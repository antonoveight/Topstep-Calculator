# TFA v6 — CRT V1

Từ 21/11/2026, nguồn chính `indicators/funded-angler-v6.pine` chỉ nhận diện CRT. `chibao.txt` là bản đồng bộ để dán vào Pine Editor. [Đặc tả CRT V1](CRT-V1-SPEC.md) và [25 setting](INDICATOR-SETTINGS.md) thay thế các mô tả detector EGF/ISB trước đây.

## Workflow hiện tại

C1 đã đóng → C2 sweep một biên và đóng trở lại trong C1 → C3 có xác nhận CISD hoặc MSS LTF → Pullback ở nến sau → tam giác tại nến đủ điều kiện. TP tham chiếu là biên đối diện C1, INV là cực trị sweep C2. High/Low gồm râu. Không phát entry sau C3 hoặc từ C2 đang chạy.

IRL/ERL, FVG, OB và swing vẫn phục vụ vị trí và bối cảnh. CRT ngược bias giữ ngoại lệ key HTF đã biết trước C1 cùng xác nhận LTF; không biến một C/M riêng lẻ thành CRT. EQ chỉ là mốc quan sát. TG/INV/AMB/TO/HIST là trạng thái bối cảnh, không phải kết quả khớp lệnh.

## Kiến trúc

- Một registry CRT, một kênh LTF. Cặp đang mở C3 được ưu tiên trước bối cảnh cũ; hình vẽ và tín hiệu dùng cùng model ID.
- Snapshot 63 field, offset riêng từng field; tổng field trong các request là 76/127. Nến live chỉ phục vụ hình ảnh, không vào detector HTF confirmed.
- Cặp nguồn C1–C2, FOLLOW từ C3 và LAST tùy chọn được vẽ riêng. FVG/OB entry LTF chỉ tính nội bộ.
- Pending C/M bị close xuyên ngược trước entry được hủy; một xác nhận mới cần retest sau chính nó. Tín hiệu đã phát được giữ lịch sử.
- Giữ gate closed-bar, bias, CT, thời gian, target/SL, chống trùng và pivot rearm. Không có điểm xác suất hoặc ranking EGF/ISB.
- Đã gỡ fibo tự động; không có ET fill tự động, Early C2, partial, tự dời BE hay trailing. [Quy ước fibo](FIBO-CONVENTION.md) vẫn dùng thủ công. [Early C2](EARLY-C2-RESEARCH.md) mới có đặc tả/ca nghiên cứu, không chạy trong indicator.

## Bản lưu và kiểm tra

Source trước cải tổ: `indicators/archive/funded-angler-v6-multimodel-2026-11-21.pine`. Đặc tả cũ: [bản lưu multi-model](archive/INDICATOR-AUTO-MODELS-multimodel-2026-11-21.md). Các test `legacy-*` chỉ kiểm tra source đã lưu; không dùng kết quả đó để khẳng định runtime CRT V1.

Chạy `node tools/sync-indicator.cjs` sau khi sửa source và `node tools/check-crt.cjs` để chạy 14 nhóm kiểm tra hiện hành. Chúng thực thi các phần source Pine có thể chuyển đổi trên dữ liệu tổng hợp; không mô phỏng đầy đủ security/rollback hay feed thị trường. Biên dịch Pine và Replay trên chart là hai bước nghiệm thu riêng. Xem [báo cáo triển khai](CRT-V1-VALIDATION.md).
