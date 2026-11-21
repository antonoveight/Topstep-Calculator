# Hệ thống hiện hành — CRT V1

Chuẩn hóa ngày 21/11/2026. Web, checklist, Studio và AI Chart Lens chỉ dùng **CRT** cho lượt mới; Pine theo [đặc tả CRT V1](CRT-V1-SPEC.md). [Nguồn Romeotpt](CRT-ROMEOTPT-RESEARCH.md) được tách khỏi các lựa chọn thuật toán cá nhân. [Bản ba model trước chuyển đổi](archive/TRADING-FRAMEWORK-before-crt-web.md) chỉ để đối chiếu.

## Một quy trình, hai tầng xác nhận

| Bước web | Người dùng xác nhận trên chart |
| --- | --- |
| C1 và key HTF | C1 đã đóng; High/Low gồm cả râu. Đánh dấu range, bias tham khảo và key đã có trước. |
| C2 đã đóng xác nhận TS | Sweep một biên C1 rồi đóng trở lại bên trong. Chạm biên, close ngoài, quét hai biên hoặc nến đang chạy chưa đủ điều kiện Confirmed. SL ở cực trị C2, Full TP ở biên đối diện C1; target chưa bị lấy. |
| Xác nhận LTF trong C3 | Nến HTF đầu sau C2; đợi CISD hoặc MSS LTF đã đóng theo hướng CRT. FVG/OB retest cần C/M trước đó. |
| Pullback và entry | Nến sau xác nhận hồi mức/vùng và phản ứng. ET1/ET2 tự đối chiếu fibo; không hồi hoặc hết C3 thì bỏ entry. Chỉ tick sau hành động thực tế. |

HTF có H1/H2/H4/D1; LTF M5/M3/M1. Web lưu lựa chọn/ghi chú của người dùng, không tự đọc OHLC, xác nhận sweep, đếm C3 hoặc nhận tam giác từ TradingView. Những bước này **không gửi lệnh** lên Topstep.

TS xác nhận sweep/reclaim ở tầng HTF. CISD và MSS có cùng vai trò xác nhận LTF nhưng khác hình thái; không bắt buộc có cả hai. Macro/QT chỉ là bối cảnh thời gian, không tự tạo hướng.

## Key, IRL/ERL và bias

Luôn nêu range và timeframe trước khi gọi IRL/ERL. Giữ FVG, OB, swing và FRVP-POC đúng vai trò; không buộc mỗi CRT phải tạo FVG. OB HTF là tham chiếu cấu trúc; OB LTF thuộc phản ứng/xác nhận entry hiện tại. POC khác EQ range và CE FVG.

Pine giữ bias cấu trúc và guard intraday. CRT ngược bias chỉ được qua ngoại lệ key HTF đã biết trước C1, có phản ứng C2 và C/M LTF; không tự đảo bias D1 từ một sweep M5. Web có nút bias tham khảo và ghi chú để bạn tự đối chiếu, không tự kiểm chứng ngoại lệ CT.

## Fibo và quản trị

Quy ước: `0 SL · 0.1 ET2 · 0.2 ET1 · 0.4 break · 0.6 BE · 0.8 TL · 1 TP`. Sell: SL = High C2, TP = Low C1; Buy đối xứng. Mọi cực trị gồm râu. Xem [quy ước fibo](FIBO-CONVENTION.md).

ET là vị trí chờ phản ứng, không tự tạo lệnh. BE/TL là nhãn tham chiếu, không bắt buộc dời SL/trailing. Giữ một Full TP, SL hoặc đóng tay có lý do; không chốt một phần. Tam giác Pine không chứng minh giá đã tới ET hoặc khớp entry.

Các ô +1R/+2R/Full TP trên web chỉ ghi nhận thủ công và điều khiển minh họa; không tự tính số R, dời SL hay ghi PnL. Kết quả và đánh giá tuân thủ là hai việc riêng. Nhật ký tài chính vẫn nhập riêng.

## Tương thích dữ liệu

- Giữ mã **5 = CRT HTF** cho lượt mới. Mã 1–4 và 6–7 chỉ còn lịch sử; không đổi nhãn EGF/ISB thành CRT.
- Checklist dùng schema `crt-v1`. Lần đầu chuyển từ `htf-v1` hoặc schema cũ, giữ toàn bộ state và active setup trong `__legacy`, gồm cả snapshot lồng trước đó; lượt mới bắt đầu chưa tick. Reload không nhân bản snapshot.
- Outcome mới dùng namespace có schema để một lượt CRT cũ chưa kết thúc không khóa lượt CRT V1. `current` cũ và history vẫn được lưu; cá đã câu trong ngày vẫn ở giỏ theo tài khoản/vòng.
- Buổi Studio cũ không tự tiếp tục thành CRT V1. Khi bắt đầu buổi mới, lưu buổi cũ vào lịch sử cùng kết quả đã có. Studio mới chỉ chọn CRT.
- Nhật ký mới chỉ chọn CRT hoặc Chưa phân loại. Khi sửa bản ghi cũ, có thể giữ nguyên mã cũ; validator/import/export tiếp tục đọc mã 1–7. Dữ liệu tài khoản, payout và PnL không được chuyển đổi bởi checklist.
- Nếu checklist JSON hỏng, giữ nguyên chuỗi gốc và ngừng ghi đè checklist cho tới khi khôi phục.

## Kiểm tra và phần còn lại

`node tests/htf-framework.cjs` kiểm tra migration và workflow trình duyệt. `node tests/liquidity-guide.cjs` kiểm tra hướng dẫn và prompt Gemini qua mock; không gửi ảnh thật. [Báo cáo web](CRT-WEB-VALIDATION.md) tách khỏi [kiểm tra Pine](CRT-V1-VALIDATION.md).

Pine đã biên dịch; người dùng tạm chấp nhận Replay baseline ngày 22/11/2026 để tiếp tục. Agent chưa thực hiện Replay độc lập vì phiên tạm yêu cầu đăng nhập để thêm script. Không coi kiểm tra browser web là kiểm chứng thị trường. Fibo tự động đã gỡ theo yêu cầu 22/11/2026; [Early C2](EARLY-C2-RESEARCH.md) đang ở bước đặc tả/ca nghiên cứu, chưa có tín hiệu Early. Model 1/KOD/SMT vẫn chưa triển khai.
