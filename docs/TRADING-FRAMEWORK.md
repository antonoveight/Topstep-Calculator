# Hệ thống hiện hành: cấu trúc HTF → kịch bản HTF → entry LTF

Bản chuẩn hóa cho web và cơ sở đặc tả chỉ báo cá nhân sau này. Đây là tổ chức thông tin theo quyết định của người dùng, chưa phải thuật toán được kiểm định. Ưu tiên bản này khi các hướng dẫn cũ còn dùng bốn phương pháp CRT/Trend/AMD/Break.

## 1. Phân tầng

| Lớp | Vai trò | Nội dung |
| --- | --- | --- |
| Cấu trúc HTF | Xác định mô hình và range tham chiếu | CRT, Engulfing/Outside Bar, Inside Bar. Chọn H1/H2/H4/D1 theo chart thực tế. |
| Kịch bản HTF | Chọn vị trí, hướng kỳ vọng, mục tiêu và vô hiệu | IRL/ERL, vùng phản ứng, sweep/break, bias. Trend/AMD chỉ là bối cảnh/hành vi. |
| Entry LTF | Chọn điểm tham gia kịch bản | POC, CISD/MSS, FVG, OB, break-retest hoặc line touch/break. Chọn M5/M3/M1 và ghi điều kiện cụ thể. |

Các lựa chọn timeframe trên web là khung làm việc thủ công, không có ý nghĩa rằng mọi tổ hợp đều đã được kiểm chứng. LTF không tự tạo setup hoặc đổi bias HTF. Macro/QT chỉ bổ sung cửa sổ quan sát.

## 2. Quy ước cấu trúc

- **CRT / TS (Turtle Soup):** ghi C1/range, mức thanh khoản bị C2 quét rồi lấy lại (reclaim), và thời điểm C2 HTF đóng trở lại trong C1. Đây là TS theo quy ước cá nhân của hệ thống: một lần phá mức thất bại, không phải tín hiệu chỉ vì chạm mức. Nếu nến HTF đang chạy, chỉ coi là ứng viên. Đóng ngoài range làm mất điều kiện TS này; không tự chứng minh breakout bền vững. Quét cả hai biên được đánh dấu mơ hồ, không tự chọn hướng.
- **Engulfing/Outside:** hai định nghĩa được ghi trong cùng nhóm UI nhưng không đồng nghĩa. Engulfing xét thân; Outside xét High–Low. Nêu rõ mẫu thực tế trong ghi chú; không suy ra đảo chiều hoặc FVG chỉ từ hình dạng.
- **Inside Bar:** High không vượt và Low không thấp hơn mẹ, ít nhất một biên hẹp hơn. Giữ Mother High/Low ban đầu khi còn nén lồng nhau; ghi Inside High/Low nếu dùng cho kịch bản. Chưa có sweep/break xác nhận thì tiếp tục chờ.
- Các mẫu có thể chồng lấp; chọn cấu trúc chính cho lượt, ghi cấu trúc bổ trợ trong note.

## 3. Bốn bước checklist chung

1. Cấu trúc HTF và range đã xác nhận trên chart.
2. Kịch bản HTF đã rõ: mức chờ, sự kiện, hướng, một mục tiêu và vô hiệu.
3. Điều kiện entry LTF được chọn đã xác nhận theo kịch bản HTF.
4. Đã thực hiện entry theo kế hoạch, với SL và Full TP rõ ràng.

**TS và CISD/MSS khác vai trò:** TS xác nhận sự kiện quét/lấy lại mức trong kịch bản CRT HTF; CISD hoặc MSS là những cách xác nhận entry trên LTF. Không có TS đúng vị trí thì không gọi một tín hiệu CISD/MSS riêng lẻ là CRT đã hợp lệ. Không bắt buộc dùng đồng thời CISD và MSS; nếu chọn entry khác như POC/FVG/OB/line thì phải có điều kiện được định nghĩa trước. Việc thêm TS chưa chứng minh tỷ lệ thắng cao hơn; cần kiểm chứng trên sản phẩm, timeframe và mẫu giao dịch cụ thể.

Trong chỉ báo cá nhân, CISD/MSS chung vai trò xác nhận đổi hướng theo hai hình thái: vượt run-open đối hướng hoặc vượt pivot đã xác nhận. Cùng bar ưu tiên CISD, trừ khi chọn riêng MSS. EGF/OUT là bối cảnh range: màu nến là hình thái, không ép hướng giao dịch. Hướng chờ theo bias; chọn IRL phù hợp trong pool hai phía, chờ phản ứng và xác nhận LTF hướng tới ERL tương ứng. Không bắt buộc close ra khỏi toàn bộ IRL nếu xác nhận LTF hợp lệ còn ở trong vùng. CRT vẫn cần sweep/reclaim xác nhận; Inside Bar giữ mother, chưa resolve thì không suy hướng từ màu nến. Chỉ báo chỉ vẽ tam giác Tiny Buy/Sell; OB/FVG và entry conditions vẫn tính nội bộ để lọc, bạn tự chọn entry thực tế. Không áp R:R tại close tam giác và không tuyên bố xác suất thắng cao khi chưa có kiểm định. Các đặc tả thực thi xem [Auto Models](INDICATOR-AUTO-MODELS.md).

Xem [chỉ báo Auto HTF và đặc tả hiệu lực/bias/entry](INDICATOR-AUTO-MODELS.md), nguồn `indicators/funded-angler-v6.pine`. Chỉ báo tự nhận diện từ giá; checklist web vẫn là ghi nhận thủ công, không tự nhận feed hoặc tín hiệu từ TradingView.

Đây là ghi nhận của người dùng. Web không có feed OHLC/volume để tự kiểm chứng; tick sai thứ tự không tự hoàn thành bước còn thiếu. “Đã ghi nhận vào lệnh” không có nghĩa web gửi lệnh.

## 4. Entry và quản trị

Không bắt buộc POC + CISD + FVG + OB đồng thời. Chọn điều kiện trước, ghi rõ touch/break/close/retest và khung nến đóng. FRVP cần neo và volume thực tế; POC không đồng nghĩa EQ hoặc CE. Quy tắc anchor Open H1 → cực trị râu C2 thuộc biến thể CRT-POC đã có, không áp mặc định cho mọi cấu trúc hoặc mọi HTF.

Mục tiêu và điểm vô hiệu xuất phát từ kịch bản HTF. LTF hỗ trợ chọn entry và SL thực thi; SL không được chọn tùy ý chỉ để tạo R:R đẹp. Một Full TP, SL hoặc đóng tay kèm lý do. Không chốt một phần và không BE máy móc theo số R. Trailing theo swing M5 mới được xác nhận nếu dùng cách quản trị này.

Các ô quản trị trên web chỉ là ghi nhận giữ SL / trailing / Full TP; chúng không đo được +1R/+2R thực tế. Chuyển động và cỡ cá là minh họa, không phải dữ liệu lợi nhuận. PnL tài chính tiếp tục ghi riêng.

## 5. Dữ liệu và tương thích

- Mã nội bộ mới: 5 = CRT HTF, 6 = Engulfing/Outside HTF, 7 = Inside Bar HTF. Mã 1–4 giữ nguyên ý nghĩa lịch sử, không tái sử dụng.
- Checklist lưu schema `htf-v1`, các ô theo cấu trúc và context (HTF, LTF, loại entry, note). Khi chuyển từ bản cũ, giữ nguyên snapshot cũ trong `__legacy`, bắt đầu các ô mới chưa xác nhận.
- Kết quả hồ câu mới chụp context tại thời điểm ghi nhận; không tự tạo bản ghi nhật ký tài chính.
- Các bản ghi và buổi cũ được giữ tên lịch sử. Nếu có buổi cũ đang mở, khi người dùng bắt đầu buổi HTF mới thì lưu buổi cũ vào lịch sử cùng dữ liệu đã có.
- Nhật ký mới chọn một trong ba cấu trúc HTF. Bản ghi cũ vẫn đọc/sửa được với nhãn cũ; nhập/xuất JSON chấp nhận mã cả hai giai đoạn.

## 6. Chuẩn bị chỉ báo, chưa triển khai

Cần đặc tả tiếp: strict/inclusive equal highs/lows; engulf thân với nến doji; phạm vi range; quét một/hai biên; thời hạn setup; xác nhận LTF; quy tắc phối hợp nhiều HTF; ngưỡng displacement/CISD/MSS; cách neo FRVP theo thời gian. Các nội dung chưa chốt không được tự suy đoán thành tín hiệu trên web hoặc Pine.
