# Vòng đời setup CRT · 22/11/2026

Thay đổi này xử lý trường hợp model Buy vẫn chiếm chart sau khi giá xuyên INV. Quy tắc cũ đợi HTF đóng xuyên mức, và còn dùng model đã hết C3 làm bối cảnh dự phòng. Hai cơ chế này đã được thay thế.

| Sự kiện | Trạng thái | Hành động |
| --- | --- | --- |
| C2 đóng xác nhận CRT, đường target còn hợp lệ | C3 | Theo dõi TS/retest LTF theo hướng model. |
| Buy chạm hoặc xuyên Low C2; Sell chạm hoặc xuyên High C2 | INV | Hủy setup, dừng entry và bỏ cụm/line active. |
| Chạm biên đối diện C1 | TG | Hoàn thành đường target, dừng tìm entry cho setup đó. EQ không phải full TP. |
| Cả INV và TP trong một nến quan sát | AMB | Kết thúc, không đoán thứ tự chạm hoặc kết quả lệnh. |
| C3 kết thúc mà chưa có sự kiện giá khác | EXP | Hết hạn setup, chuyển sang chờ CRT mới. Không đồng nghĩa thua lệnh hay đóng vị thế thực tế. |

## Không đợi HTF đóng để bỏ focus

Trên M1/M3/M5, điểm kết thúc bằng giá được chốt bằng High/Low của **nến LTF đã đóng**. Chỉ cần wick chạm INV; không yêu cầu close xuyên INV và không đợi H1/H2/H4/D1 đóng. Nến LTF đang chạy chưa cam kết kết thúc; khi nó đóng, cực trị đã chạm vẫn được ghi nhận dù close hồi vào range.

HTF registry cũng dùng cùng rào cản wick/target và loại model sau C3. Không còn fallback chọn model cũ khi không có model mới. Đã bỏ input Context timeout 8 nến vì nó không còn phù hợp với vòng đời C3; chỉ báo hiện có 21 input, vẫn giữ công tắc Early C2.

Nến C2 nguồn không tự hủy vì chính râu tạo sweep của nó. Nến cuối C3 vẫn được xét entry nếu đáp ứng điều kiện và chưa chạm rào cản; bước sang C4 không tiếp tục pending.

## Model mới và hiển thị

Model đã kết thúc không còn tham gia signal context, line mức giá, cụm active hoặc alert xác nhận mới. Dashboard hiện `SEARCH` nếu chưa có model hợp lệ. Chỉ một CRT mới đã đáp ứng điều kiện mới được chọn tiếp; việc hủy model cũ không tự tạo Buy/Sell đối diện.

Bật **Last ended model cluster** nếu muốn giữ tham chiếu lịch sử. Model cũ chỉ xuất hiện với nhãn `LAST / INV`, `LAST / TG`, `LAST / EXP`…; không phát entry. Nếu kết thúc giữa nến HTF, snapshot local giữ C1/C2 đã đóng, không dựng giả C3 đã đóng. Archive HTF vẫn giữ C3 thật khi có đủ dữ liệu.

Khi đã thấy INV trước rồi TP ở nến LTF khác, không đổi ngược kết quả setup thành TG/AMB vì HTF tổng hợp chạm cả hai. Cùng model thì bằng chứng kết thúc LTF đầu tiên được giữ. Đây là phân loại setup tham khảo, không phải PnL hay xác nhận khớp SL/TP.

## Early C2

Early tiếp tục quét mỗi cửa sổ C2 mới, độc lập với model Confirmed cũ đã hủy. Nó vẫn cần key có trước, raid/reclaim và TS/retest theo [đặc tả Early](EARLY-C2-EXPERIMENT.md). Terminal reason như `E DOUBLE`, `E TP TAKEN`, `E KEY LOST` được giữ đến hết cửa sổ thay vì biến thành `E BLOCKED` chung chung. Không tái dùng cùng C2 sau khi đã hủy/phát E; C2 mới bắt đầu state mới. Khóa sóng và ưu tiên tín hiệu Confirmed vẫn giữ để tránh trùng nhịp.

## Kiểm tra

Chạy `node tools/check-crt.cjs`: 14 nhóm, gồm 34 trace vòng đời Buy/Sell đối xứng từ thân hàm Pine, ca tương tự ảnh BTCUSD, wick bằng đúng INV, hồi lại sau INV, TG, AMB, EXP, chuyển UID mới, chống hồi sinh cùng model, không hủy trên C2 nguồn và chọn archive đúng thứ tự. Bộ Early có 74 trace riêng.

Test tổng hợp và biên dịch không thay Replay thị trường. Tài khoản Brave Basic đã kiểm tra trước đây vẫn bị chặn Replay intraday; không coi thay đổi này là một kết quả backtest hiệu suất.
