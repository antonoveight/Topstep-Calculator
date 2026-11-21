# Rà soát mức hoàn thành CRT V1 — 22/11/2026

Đối chiếu [kế hoạch](CRT-ONLY-REFORM-PLAN.md), source Pine, web, fixture và ghi nhận kiểm tra. Phạm vi đã chốt là CRT Confirmed trong C3, không có fibo tự động; Early C2 chỉ nghiên cứu. Các dòng kế hoạch ban đầu không được hiểu là mọi thuật ngữ đã thành tính năng.

## Trạng thái theo kế hoạch

| Hạng mục | Trạng thái thực tế |
| --- | --- |
| Đặc tả CRT V1 / phân loại nguồn | Có [đặc tả](CRT-V1-SPEC.md), [nguồn Romeotpt](CRT-ROMEOTPT-RESEARCH.md), quy ước cá nhân và giới hạn xác minh. |
| Pine CRT-only | Hoàn thành: một registry/kênh CRT, bản lưu multi-model, HTF/Bias tùy chỉnh H1/H2/H4/D1. |
| Vị trí / lifecycle / bias | Có key biết trước, CT, EQ riêng, TG/INV/AMB/TO/CAP, entry C3 và gate chống trùng. Đợt này bổ sung xử lý pending C/M bị close phủ nhận. |
| Hiển thị | Giữ mức range/ERL/IRL/key và cụm nguồn/FOLLOW/LAST. Đợt này bổ sung thời gian đóng riêng của C1/C2/C3, gồm archive; nến live ghi Scheduled close. |
| Fibo tự động | Đã gỡ theo yêu cầu; không phải TODO cần tự bật lại. Quy ước fibo thủ công vẫn giữ. |
| Web / Studio / AI / dữ liệu cũ | Đã chuyển CRT-only; giữ snapshot, nhật ký/cá/buổi cũ, bảo vệ dữ liệu tài khoản. Các ô vẫn là ghi nhận thủ công. |
| Nhật ký ngữ cảnh | Lưu HTF/LTF/loại entry/note vào outcome; PnL và tuân thủ riêng. Model ID/key/ET có thể ghi trong note, chưa có schema chuyên biệt hay kết nối feed Pine–web tự động. Giữ nhật ký đơn giản theo yêu cầu. |
| Replay baseline | Người dùng tạm chấp nhận. Không ghi thành Replay độc lập của agent hay bằng chứng hiệu suất. |
| Early C2 | Hoàn thành bước nghiên cứu đã chọn: [35 tình huống, 70 lượt đối xứng, 354 prefix](EARLY-C2-RESEARCH.md). Chưa có Early trong runtime. |

## Hai phần thiếu đã xử lý trong đợt rà soát

### Pending confirmation bị giữ quá lâu

Ca tổng hợp Buy: C/M đóng vượt 105 tại nến 101, nến 102 đóng xuống 104, nến 103 đóng vượt lại, rồi nến 104 retest. Trước sửa, xác nhận 101 vẫn được giữ và nến 103 có thể bị coi là retest của xác nhận đó. Sau sửa, close 102 hủy pending, nến 103 trở thành xác nhận mới và Pullback phải đợi nến 104.

Quy tắc chỉ áp dụng trước khi phát tín hiệu: close **xuyên ngược** mức pending C/M thì xóa confirmation và FVG/OB của phản ứng cũ, giữ các barrier target/SL đã bị lấy. WHY có `CM RESET` khi cần. Chạm bằng râu hoặc close đúng mức không tự hủy; nến retest vẫn phải close giữ đúng phía để đủ điều kiện. Không xóa/mở lại một tín hiệu đã phát ở Confirmation close, không thêm entry sau C3.

Kiểm tra bằng chính thân hàm Pine trong `tests/confirmation-lifetime.cjs`: Auto/CISD/MSS, Buy/Sell, CT, wick/boundary, cache cũ, target/SL sticky, cửa sổ C3, close/bias/time/wave. Đây là sửa hợp đồng thời điểm xác nhận/retest, không phải công thức True MSS theo Romeo. Một số tam giác từ pending cũ sẽ dời sang retest sau xác nhận mới hoặc không xuất hiện nếu hết C3.

### Giờ mở/đóng nến nguồn chưa đủ rõ

Source lưu riêng `time_close[1]` của C1, giờ xác nhận C2 và `time_close` của C3 đã đóng. Archive giữ bản sao các giá trị này. Cache nến chart lưu cặp open/close timestamp; tooltip lấy giờ từ nguồn/cache/feed, không cộng số giây HTF để giả lập giờ đóng qua gap phiên hoặc DST.

Tooltip nến ghi `Open`, `Close`, OHLC; nến đang chạy ghi `Scheduled close`. Nếu thiếu dữ liệu thì ghi `-`. Không thêm nhãn dài trên chart và không đổi giá/neo line. Snapshot hiện 63 field, tổng request tuple 76/127; các field mới vẫn offset riêng theo HTF đã xác nhận. Metadata hiển thị không tham gia gate entry.

## Kiểm tra hoàn thành

- `node tools/check-crt.cjs`: 14 nhóm hiện hành, bao gồm 2 nhóm mới về confirmation lifetime và candle close timestamps.
- `node tests/early-c2-research.cjs`: giao thức nghiên cứu riêng, 70 lượt tổng hợp và 354 kiểm tra prefix; không phải tín hiệu hoặc lợi nhuận Pine.
- `node tools/check-crt-web.cjs`: 12 nhóm browser, gồm 14 ca tổng thể của ứng dụng, nhật ký/payout/backup, migration và fullscreen/Studio. External API được cô lập trong test.
- `chibao.txt` đồng bộ source chính; biên dịch Pine kiểm tra riêng với đúng source cuối. Các ca giả lập không thay thế việc quan sát hình thật trên TradingView.

Kết quả source cuối của đợt rà soát: 14 nhóm chỉ báo và 12 nhóm web đạt; nghiên cứu Early vẫn đạt 70 lượt/354 prefix. Pine trả `exactSource=true`, `success=true`, `errors=null`, không có warning.

## Những việc vẫn còn và giới hạn phạm vi

1. **Forward bằng dữ liệu thực và so feed Topstep–TradingView**, nhất là H2/H4, gap phiên/DST, độ trễ và trường hợp entry thực tế. Cần chart/ghi nhận thực; fixture không chứng minh được phần này.
2. **Early C2 thành tính năng:** cần ví dụ trước khi C2 đóng, đối chiếu đủ lời giảng/chart và nghiệm thu chế độ quan sát tách riêng. Chưa triển khai vì người dùng đã chọn nghiên cứu trước.
3. **Quan sát trước khi có CRT Confirmed**, trạng thái đang tới/rời key và schema journal chuyên biệt cho model/attempt: chưa có tự động trong V1. Chưa kết nối Pine với feed/web nên không giả rằng app biết model ID hoặc fill từ chart.
4. **Model 1/True MSS/KOD/OTE/SMT, range nhiều nến:** còn là backlog nghiên cứu, chưa đủ điều kiện để tự thêm detector hoặc gate.

Các phần trên không bị đánh dấu “đã xong” bằng việc biên dịch thành công. Sau hai sửa chữa trong đợt này, không còn lỗi triển khai tái hiện được từ bộ kiểm tra đã chạy; chưa thể kết luận chỉ báo hoàn hảo hoặc chiến lược đã được kiểm định thị trường.
