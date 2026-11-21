# CRT V1 — đặc tả đang triển khai

Ngày 21/11/2026. Áp dụng cho `indicators/funded-angler-v6.pine` và bản sao `chibao.txt`. Web/checklist hiện vẫn dùng cấu trúc cũ; chuyển đổi web là bước tiếp theo. Đối chiếu nguồn tại [nghiên cứu Romeotpt](CRT-ROMEOTPT-RESEARCH.md).

Đây là quy ước CRT ba nến cá nhân để kiểm chứng. Không khẳng định bao quát mọi cách giao dịch CRT của Romeo hoặc bảo đảm xác suất thắng. Các ngưỡng pivot, số tick, độ mạnh displacement và timeout là lựa chọn thuật toán của dự án.

## Range và xác nhận

- C1 là **nến HTF liền trước C2**, đã đóng. High/Low luôn gồm râu; lưu riêng Open/Close và timestamp.
- C2 phải xuyên đúng một biên C1 ít nhất một tick, rồi đóng **strictly trong** High–Low C1. Buy = sweep Low, Sell = sweep High. Chạm biên, close ngay biên, close ngoài C1 hoặc quét cả hai biên đều không tạo CRT V1 có hướng.
- Nếu C2 đã chạm biên đối diện C1, không tạo setup chờ C3; ghi AMB vì không còn đường target sạch và OHLC không cho biết trình tự nội nến.
- Chỉ dùng C2 đã đóng. Không có Early C2, SMT, Model 1 hay KOD tự động trong bản này.
- EGF/ISB không có detector, lifecycle, kênh tín hiệu hoặc bộ đếm độc lập. Một cặp CRT có thân engulfing vẫn được xét **một lần là CRT**, không mất hiệu lực vì hình thái đó.

## Key và bias

- Giữ bias cấu trúc xác nhận và guard intraday hiện hành. B0/B0! chặn tín hiệu; không tự đảo bias từ màu nến hay một sweep LTF.
- CRT thuận bias đi qua gate thông thường. CRT ngược bias cần bật `CRT reversal at prior HTF key`, key đúng hướng đã được biết **trước hoặc tại giờ mở C1**, C2 chạm/phản ứng và close reclaim key, rồi có C/M LTF. Key có thể là FVG, OB cấu trúc HTF hoặc swing; không phải mọi CRT đều cần tự tạo FVG.
- Key HTF được lấy trước khi C2 tiêu thụ pool. Nến nguồn và thời điểm xác nhận key là hai mốc riêng; không dùng pivot/FVG/OB chưa biết để giải thích ngược lịch sử.
- FVG/OB/swing nội bộ range C1 vẫn hiển thị để phân tích; chúng không thay hướng TS đã xác nhận, không biến thành phương pháp khác. OB HTF và OB entry LTF giữ [vai trò khác nhau](OB-TIMEFRAME-ROLES.md).

## Cửa sổ entry và vị trí tam giác

1. Chỉ quan sát entry ở **C3**, tức nến HTF đầu tiên sau C2. Snapshot của C2 có tuổi 0 trong C3; sang C4 tuổi 1, khóa entry với WHY `C3 CLOSED`.
2. Trong C3, đợi nến LTF đóng xác nhận CISD **hoặc** MSS. CISD vượt run-open đối hướng; MSS vượt pivot đã xác nhận. Cùng bar ưu tiên C, trừ khi chọn riêng MSS. Đây là baseline kỹ thuật, chưa gọi là “True MSS” theo bài giảng gốc.
3. Mặc định `Auto / Pullback / Fresh reaction`: sau xác nhận, đợi **nến sau** hồi mức C/M hoặc retest FVG/OB hình thành từ xác nhận đó. Mode FVG/OB riêng cũng không bỏ qua C/M.
4. `Confirmation close` là lựa chọn tham khảo market tại close C/M. FVG/OB vẫn luôn cần retest ở nến sau khi hình thành.
5. Tam giác nằm tại nến **đủ điều kiện đóng**, không lùi về nến nguồn hay pivot. Buy xanh dưới nến; Sell đỏ trên nến; native label size 4 theo lựa chọn trước đây.
6. Chạm target hoặc cực trị SL C2 trên một nến LTF đã đóng sẽ khóa phần entry còn lại của setup, kể cả giá quay lại. Nếu cả hai cùng bị chạm, không suy ra thứ tự hay kết quả giao dịch.
7. Fresh reaction cần pivot hồi mới, xác nhận và tiến triển; gate nhịp được giữ qua lần đổi model để tránh phát nối đuôi. `One per model` chỉ cho một dấu. Tất cả vẫn phải nằm trong C3.

Fibo/ET hiện do người dùng kiểm tra thủ công. **Tam giác không có nghĩa đã chạm ET1/ET2 hoặc khớp lệnh.** Không có bộ lọc R:R ở close tam giác, không tự dời SL/BE/trailing hay chốt một phần. Nếu giá đi luôn không hồi, Pullback bỏ qua thay vì đuổi.

## Vòng đời bối cảnh khác vòng đời entry

| Mốc | Xử lý |
| --- | --- |
| C2 đóng hợp lệ | CRT confirmed; TP = biên đối diện C1, INV = cực trị sweep C2 |
| Trong C3 | Xác nhận LTF → Pullback → tín hiệu nếu còn đường tới TP |
| Chạm EQ C1 sau C2 | Đánh dấu EQ*; chỉ mốc quan sát, **không phải TP toàn bộ** |
| Hết C3 | `C3 CLOSED`, không thêm entry; bối cảnh có thể tiếp tục hiển thị |
| TG | High/Low HTF chạm TP đã chọn; không phải bằng chứng khớp lệnh |
| INV | Nến HTF đóng xuyên cực trị sweep C2; khác gate chạm SL bằng râu trên LTF |
| AMB | Cùng nến HTF vừa chạm target vừa close invalid; không tự gán thắng/thua |
| TO | Hết giới hạn quan sát, mặc định 8 nến sau C2; 0 tắt timeout; không phải SL |
| HIST | Ngoài vùng dữ liệu quét, không phải kết quả lệnh |
| CAP | Đạt giới hạn 12 bối cảnh: chuyển bối cảnh cũ nhất sang LAST để nhường cặp mới có đường target; không phải SL |

Registry giữ các bối cảnh chưa kết thúc. Cặp mới đang mở C3 được ưu tiên để **một** kênh tín hiệu và hình vẽ luôn cùng model. Khi không còn C3 mở, hiển thị bối cảnh còn hiệu lực lâu nhất để theo dõi; không dùng nó phát entry muộn. Timeout không kéo dài hay rút ngắn cửa sổ C3.

## Hiển thị và mặc định

- HTF H1; có thể chọn H2/H4/D1. Bias D1 và phải >= HTF. LTF hỗ trợ M1/M3/M5 chia hết HTF; khung HTF chỉ xem bối cảnh, không phát entry LTF.
- Cụm đầu giữ C1–C2; FOLLOW bắt đầu C3 và giữ đuôi gần nhất, gồm nến live; LAST tùy chọn hiển thị nguồn model đã kết thúc. Giá OHLC dùng dữ liệu chart, không trộn live vào detector.
- High/Low/TP/INV và ERL bắt đầu từ nến tạo mức; FVG neo nến đầu bộ ba HTF nhưng chỉ xuất hiện sau xác nhận. Chữ trong suốt, có bố trí tránh đè; cần nghiệm thu hình thực tế trên chart.
- History 100 dấu, Latest tùy chọn; thay đổi giới hạn hiển thị không đổi logic/alert. Macro/QT mặc định chỉ là bối cảnh, không suy hướng.
- Fibo cá nhân: `0 SL · 0.1 ET2 · 0.2 ET1 · 0.4 break · 0.6 BE · 0.8 TL · 1 TP`. Sell: SL=High C2, TP=Low C1; Buy đối xứng. Chưa tự vẽ fibo.

## Kiểm chứng và giới hạn

Chạy `node tools/check-crt.cjs`. Bộ ca đọc và thực thi các thân hàm/biểu thức Pine có thể chuyển đổi, với HTF context/pivot đầu vào xác định. Bao gồm sweep hai hướng, boundary, entry C3/C4, target/SL sticky, bias/CT, FVG/OB, chống trùng và nhóm nến. Có đối chiếu baseline CRT cũ trên cùng dữ liệu tổng hợp.

Các ca này không mô phỏng `request.security`, rollback realtime, feed broker hoặc khớp lệnh. Biên dịch Pine là bước kiểm tra riêng. Replay/forward trên chart thực tế vẫn cần thiết trước khi đánh giá tần suất, độ trễ, độ chính xác và việc bố trí nhãn khi zoom. Không gọi bảng cấu hình tổng hợp là tối ưu lợi nhuận.
