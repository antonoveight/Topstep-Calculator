> Lịch sử trước thay đổi 22/11/2026. Các quy tắc xác nhận LTF, key và thời gian tại đây đã được thay thế bằng [CRT thuần & thời gian](CRT-PURE-AND-TIME.md). Không dùng tài liệu này để cài đặt bản hiện tại.

# OB HTF và OB entry LTF

Cập nhật 16/11/2026. Hai tầng có chung bản chất OB; khác khung xác nhận và vai trò. OB nằm trong dealing range có thể là một internal reference/IRL. Việc hiển thị nhãn riêng OB và FVG không loại OB khỏi khái niệm IRL.

## Nguồn và quy ước

Trong [ICT Month 04 — Orderblocks](https://www.youtube.com/watch?v=PIYh0CxoY9c), đoạn 00:56–01:40 nêu nến giảm tại hỗ trợ, được xác nhận khi giá sau đó vượt High; đoạn 08:04–09:25 mô tả bullish OB bên trong range theo IRL → ERL. [Bản chép lời đối chiếu](https://info.quagmyre.com/xwiki/bin/view/Forex/The-Inner-Circle-Trader/ICT-2016-Premium-Mentorship-Core-Content-Lectures/27-ICT-Mentorship-Core-Content-Month-4-Orderblocks/). Không coi mọi nến ngược màu là OB hay suy ra có lệnh tổ chức từ OHLC.

Các điều kiện dưới đây là đặc tả cá nhân cho công cụ, **không phải định nghĩa ICT duy nhất hoặc quy tắc đã tối ưu lợi nhuận**. Đặc biệt, break bằng close, cực trị ba nến, cửa sổ tám nến và bộ lọc strength là lựa chọn triển khai.

## HTF OB: vị trí chờ phản ứng

1. Lưu một nến đối màu ở cực trị cục bộ: bullish có Low không cao hơn Low nến trước và nến ngay sau; bearish đối xứng với High. Cực trị được biết khi nến ngay sau hoàn thành, không backdate thời điểm được biết.
2. Phải có pivot cấu trúc HTF đã xác nhận từ bar trước, phía ngoài High/Low nến nguồn. Pivot vừa được xác nhận ở bar đang xét không được dùng như mức đã biết trước.
3. Trong tối đa **8 nến HTF sau nến nguồn**, có nến đóng phá pivot đó và vượt High/Low nến nguồn, kèm displacement. Nến xác nhận không cần liền sau nguồn. Close trước còn ở phía bên kia pivot.
4. Trước xác nhận, nếu Low xuyên đáy nguồn bullish hoặc High xuyên đỉnh nguồn bearish thì hủy ứng viên; không dùng lại. Một ứng viên chỉ xác nhận một lần. Đây là timeout ứng viên OB, tách khỏi Model timeout và không xóa OB đã xác nhận.
5. Vùng theo convention hiện hành: bullish Open–Low, bearish Open–High; neo về nến nguồn nhưng `knownAt` là close nến xác nhận. Sau khi vào pool, vòng đời vùng/model theo cơ chế hiện hành; seed timeout không thay thế cơ chế đó.

Strength được dùng nhất quán ở hai tầng: nến đúng hướng, thân ít nhất **50%** toàn biên độ và close trong **1/4 cuối** theo hướng đi. Không bắt buộc tạo FVG. Ngưỡng này chưa được tối ưu bằng dữ liệu thị trường.

HTF OB được xét hoàn toàn trên HTF tương ứng, bao gồm pool Bias TF. Khi dùng cho EGF phải nằm trong range EGF; khi dùng cho CRT counter-bias vẫn phải được xác nhận trước C1. Không lấy OB M5 để chứng minh có OB H1.

## LTF OB: thực thi entry sau phản ứng

1. Giữ nến đối hướng gần nhất thuộc reaction LTF hiện tại; nguồn phải từ `phaseAt` trở đi và trước nến xác nhận. Đổi reaction xóa nguồn cũ trừ nhánh giữ run đã có kiểm tra.
2. Nến xác nhận có CISD **hoặc** MSS theo mode: Auto/OB retest cho phép một trong hai; mode MSS chỉ dùng MSS, mode CISD chỉ dùng CISD. Không ép phải có cả hai. MSS-only hiện có thể tạo OB, khắc phục nhánh chỉ dựa CISD trước đây.
3. Nến đó phải đóng vượt High/Low nến nguồn và qua strength. Với EGF, vị trí HTF phải đã chạm/quét và đang giữ/reclaim đúng phía; không tạo OB entry từ pha chưa có phản ứng hợp lệ.
4. Đóng băng vùng Open–Low/Open–High và thời điểm xác nhận. Chỉ từ nến **sau nến xác nhận** mới xét retest vùng và close đúng phía; nến tạo OB không là retest của chính nó.
5. Bias, target, INV, time, close-bar, CT và chống trùng vẫn áp dụng. OB LTF không thay thế key HTF, không tự đổi bias. Entry mode khác không bắt buộc có OB.

OB entry LTF tiếp tục chỉ tính nội bộ, không thêm box hoặc chữ vào tam giác. FVG, swing iBSL/iSSL và EQ/CE giữ cách nhận diện riêng. Nhận diện OB chặt hơn có thể giảm số vùng và số tín hiệu riêng nhánh OB; không khẳng định giảm false signal hay tăng win rate khi chưa kiểm định.

## Kiểm tra

`node tests/ob-timeframe-roles.cjs` thực thi thân source của strength/HTF seed và LTF channel: Buy/Sell, thiếu cấu trúc, không có local extreme, phá nến nhưng chưa phá cấu trúc, thân yếu, nguồn bị xuyên, xác nhận muộn, hết hạn, không lặp, MSS-only và retest sau xác nhận. Các fixture OB cũ không đạt điều kiện được giữ thành ca âm, thêm ca displacement hợp lệ thành ca dương. Không thay fixture để che lỗi.

Harness không mô phỏng request.security, ta.pivot, rollback hoặc khớp lệnh. Cần đối chiếu chart/Replay để nghiệm thu thời điểm, nguồn và tác động tần suất thực tế. Snapshot request không thêm phần tử; vẫn tổng 127.

Ngày 16/11/2026, toàn bộ source cuối được biên dịch trong Pine Editor tạm: thành công, không có lỗi; còn cảnh báo shadow biến cục bộ. Các kiểm tra contract, CRT counter-bias, EGF internal references, HTF cluster, signal density và day-trading workflow đều qua. Preset Auto/Pullback/Fresh reaction được giữ; kết quả workflow synthetic không phải đánh giá lợi nhuận hay tần suất thị trường.
