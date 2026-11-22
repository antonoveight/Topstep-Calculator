# Hai nhánh CRT Confirmed · 22/11/2026

**Larger HTF signals** mặc định bật. **Larger HTF** dùng lựa chọn đã có ở Display: Auto H1/H2 → H4, H4 → D1, D1 → W1. Tổng cộng 24 input. Mỗi nhánh tìm CRT trên feed khung của mình, dùng snapshot chỉ từ nến đã đóng; nhánh lớn đóng gói object để tránh vượt giới hạn tổng 127 trường tuple request của Pine.

## Phạm vi độc lập

| Thành phần | HTF chính | Larger HTF |
| --- | --- | --- |
| C1/C2, lựa chọn model | Engine chính | Engine riêng, cùng quy tắc C1 đã sửa |
| C3 | Nến đầu sau xác nhận chính | Nến đầu sau xác nhận khung lớn |
| Xác nhận entry | LTF hiện tại, TS/Pullback hoặc Confirmation close đã chọn | Cùng LTF/timing, state riêng |
| Target/INV và kết thúc | Mức của model chính | Mức của model khung lớn |
| Fresh reaction / khóa nhịp | Giữ nhánh chính/Early hiện có | Có lịch sử Buy/Sell riêng, không ghi khóa chính |
| Bias | Bias TF và bias mode đang chọn | Cùng bias tham chiếu, key từ HTF của model lớn; không lấy key H1 gán cho H4 |
| Early C2 | Giữ công tắc đang có | Chưa hỗ trợ Early |

Điều kiện khung lớn: chart phải là LTF được hỗ trợ M1/M3/M5, chia hết Larger HTF, khung lớn > HTF chính và <= Bias TF. Nếu không đạt, chỉ nhánh lớn dừng với WHY **TF/Bias**, nhánh chính tiếp tục. Ví dụ main H1 / larger H4 / bias D1 / chart M5 chạy được. Main D1 / larger W1 / bias D1 chỉ có cụm W1 để nhìn; không chạy entry W1 do vượt Bias TF. Không âm thầm hạ khung lớn hoặc đổi bias của người dùng.

Bật/tắt **CRT HTF candle groups** hoặc **Larger HTF candle cluster** chỉ đổi hình, không đổi tín hiệu. Tắt nhánh lớn bằng **Larger HTF signals**. Cụm lớn vẫn là ba nến OHLC đã đóng và nến live; không khẳng định luôn trùng cặp nguồn model engine chọn. Tooltip WHY ghi timestamp C1 và trạng thái của nhánh lớn để phân biệt nguồn.

## Tam giác, alert và chẩn đoán

- Buy xanh dưới nến, Sell đỏ trên nến; kích thước giữ nguyên. Mỗi hướng tối đa một tam giác trên một bar.
- Khi H1/H4 cùng hướng và cùng bar, tooltip gộp hai phần có tên HTF cùng ID, thời điểm xác nhận, target/INV riêng. Không gộp thành một model hay trộn mức SL/TP.
- Khi ngược hướng, giữ Buy và Sell ở hai phía nến; nguồn/key ngược bias còn phải đạt quy tắc đang có. Không tự giải quyết xung đột thành lệnh thực tế.
- Latest giữ nến có sự kiện gần nhất, tối đa hai dấu khi hai hướng hoặc Early/Higher cùng xuất hiện trên nến đó; xóa các dấu của nến sự kiện cũ. History vẫn theo giới hạn số dấu đã chọn, 0 ẩn toàn bộ.
- Alert E+/E- thông thường nhận tín hiệu từ một trong hai nguồn; có thêm **Higher HTF E+ / E-** để chỉ nhận nhánh lớn. Chọn một nhóm phù hợp để tránh nhận cả alert tổng lẫn alert riêng cho cùng sự kiện. Các alert TradingView đã tạo trước đây cần được tạo lại để dùng snapshot script mới.
- Hover WHY: mỗi nguồn có bộ đếm C3 riêng (bar, mẫu TS, retest, signal, trigger bị chặn và trạng thái cuối). Cache phân biệt timeframe + C1 + lần xác nhận + hướng; 128 attempt tổng cộng. Không biến 0 bar coverage thành kết luận không có mẫu TS.

Các cột CSV/audit Confirmed cũ vẫn chỉ ghi nhánh chính, không đưa sự kiện H4 vào các cột H1. Data Window thêm các cột **Higher CRT** cho hướng, target, INV, giờ xác nhận và số giây timeframe. Công cụ audit CSV hiện tại chưa nghiệm thu causal trace của nhánh lớn; không gọi đó là backtest hai nhánh.

## Kiểm tra

18 suite CRT, gồm trace Buy/Sell đối xứng từ thân hàm Pine: main hết C3/higher còn C3; INV một nguồn không hủy nguồn kia; target higher chặn entry muộn; hết C3 của từng nguồn; cùng bar cùng hướng và hai pending khác hướng; đóng gói snapshot với offset trước; nguồn key đúng khung; không lấy OHLC live làm điều kiện; tắt hình không lọc entry; cô lập export chính. Pine compiler và chart runtime được kiểm tra riêng; fixture tổng hợp không thay Replay thị trường.

Nghiệm thu Brave trên BTCUSD CRYPTO M5, main H1 / larger Auto H4 / bias D1, Pullback/Fresh reaction: mã editor so khớp canonical, Update on chart chạy không có thông báo lỗi runtime. Dữ liệu đang tải ghi C9/H4; tắt riêng Larger HTF signals về C9/H0, bật lại C9/H4. Đây là số sự kiện của từng nguồn trên tập dữ liệu đang tải, không phải số lệnh khớp hay win rate. Không tính kiểm tra này là Replay; chưa có ảnh hover của từng tam giác H4 hoặc đối chiếu CSV thị trường cho toàn bộ nhánh lớn.

Nền tảng entry và giới hạn đối chiếu tác giả: [Entry Romeotpt](CRT-ENTRY-ROMEOTPT.md). Quy tắc C1 và C3 thay raid vẫn theo [vòng đời setup](CRT-SETUP-LIFECYCLE.md).
