# Pine compilation timeout — 25/11/2026

Người dùng báo bản 28524d5 bị `Pine compilation was timed out` khi nạp vào chart. Dòng 1 là vị trí hiển thị lỗi tổng quát, không phải lỗi license hoặc ký tự đầu file.

Đính chính: kết quả trước đó dùng endpoint `translate_light`, trả variables/functions/types/scopes. Đây là phân tích cú pháp/kiểu dữ liệu, chưa chứng minh biên dịch đầy đủ hoặc chạy chart. Báo cáo cross-market đã đổi tên bằng chứng này thành lightTranslation. Không lặp lại một bản đã timeout trên tài khoản người dùng.

Thay đổi kỹ thuật:

- Tắt dynamic_requests vì các khung được chọn từ input cố định, không thay theo từng nến.
- Đưa request key tuần và key Bias TF ra global, dùng chung giữa các engine. Không còn request.security trong f_engine hoặc f_executionSnapshot.
- Các request main/higher/bias/structure đều chạy ở global, ngoài điều kiện chọn nguồn. Điều kiện chọn kết quả để hiển thị/tính tín hiệu vẫn giữ. Không còn wrapper request được gọi qua nhánh if.
- Engine trả một EngineSnapshot với bản sao model/archive thay cho tuple 64 trường. Snapshot được offset cả sự kiện một lần; 64 tên dữ liệu cũ vẫn ánh xạ đủ qua fixture kiểm tra, không đổi timestamp xác nhận hoặc timestamp mở/đóng nến.
- Các lựa chọn nguồn dùng biểu thức có kiểu rõ ràng; không trả một tuple hoặc biến request đơn lẻ từ nhánh if. Compiler đầy đủ đã phát hiện CE10235 ở cấu trúc này trong các bản thử trung gian.
- Không giảm lịch sử 600 nến để che lỗi biên dịch, không xóa nhánh tín hiệu và không đổi điều kiện entry.

Nguồn: [TradingView — Limitations](https://www.tradingview.com/pine-script-docs/writing/limitations/), [TradingView — Other timeframes and data](https://www.tradingview.com/pine-script-docs/concepts/other-timeframes-and-data/).

Kiểm tra: bộ ca điều kiện CRT hiện có, thêm crt-static-requests.cjs kiểm tra request tĩnh, không request trong hai engine nặng và chỉ một request tuần. Phải phân biệt kết quả các bộ kiểm tra này với kết quả nạp chart trực tiếp. Bằng chứng chart cuối cùng được ghi riêng sau khi TradingView trả kết quả.

Trong thử nghiệm đầu, chỉ tắt dynamic_requests và thêm wrapper là chưa đủ: full compiler trả CE10054 tại request lồng trong f_engine. Sau khi đưa hai request này ra global, compiler tiếp tục báo CE10054 tại wrapper main được gọi qua if. Bản tiếp theo chuyển các request này ra global hoàn toàn. Hai kết quả trên là lỗi phạm vi của các bản thử, không phải thêm hai lần timeout.

Sau khi dùng snapshot gộp và biểu thức chọn nguồn, bản đã qua compiler đầy đủ và gắn lên chart. Runtime tiếp tục báo RE10110 với giới hạn tính toán 0,5 giây của tài khoản đang mở. Lỗi này khác compilation timeout. Đã tiếp tục tối ưu:

- Chọn hai zone mới nhất theo type/direction bằng một lần duyệt pool và các slot cố định, thay vì tám lần duyệt cùng pool.
- Match key bằng một lượt có xếp ưu tiên type, thay vì sáu lượt. Giữ nguyên thứ tự thắng khi cùng type.
- Early main/higher dùng lại execution key map đã đóng, không xây hai key map HTF riêng. Bộ lọc knownAt <= đầu C2 vẫn áp dụng; key tuần cũng đi theo map dùng chung.
- Không thay 600 nến, không tắt nhánh Larger/Early/OTE để làm bài kiểm tra nhẹ hơn.

tests/crt-key-scan-equivalence.cjs đối chiếu thân hàm tối ưu với ngữ nghĩa trước sửa bằng 160 pool zone và 320 matcher case. Đây là kiểm tra tương đương kết quả, không phải số đo thời gian trên server TradingView.

Tối ưu tiếp theo tách pool rangeKeys nội bộ khỏi model xuất qua request.security: chart không sử dụng pool này, nên snapshot chỉ giữ các giá trị model và key được chọn. Model trong registry vẫn giữ pool để revalidation C3 như cũ. Đồng thời chỉ dựng pool parent khi nến hiện tại có thể tạo CRT; cập nhật tiêu thụ key và pivot vẫn chạy mỗi nến.

Calculation budget phân biệt tải chạy với tải biên dịch: bản cuối Light dùng 24 nến trên mỗi nguồn yêu cầu, Full giữ 600; chart có ô Calculated bars riêng. Thay đổi cửa sổ có thể làm khác trạng thái khởi tạo bias/model/key cũ, không được coi là kết quả tương đương toàn bộ lịch sử. Đây là lựa chọn cho giới hạn runtime, không phải bằng chứng tối ưu lợi nhuận.

Bản thử với cửa sổ tín hiệu rolling đã bị bỏ. isLtf giữ điều kiện khung cố định như trước; không dùng last_bar_time trong điều kiện xác định khung. Đã loại 24 trường model legacy luôn rỗng; các alias cũ giữ nguyên default na/0. ModelView xuất 33 trường cần dùng, không có collection. Fixture kiểm tra giữ đủ 64 giá trị legacy (gồm metadata và alias rỗng), không đổi mức/giờ CRT đang dùng.

Đã tìm đúng endpoint full compiler từ mã JavaScript công khai của editor: translate_source/__create_new. tools/compile-pine.cjs gọi một lần trong phiên ẩn danh, ghi hash và kết quả; không dùng cookie, không save/publish, không tự retry. Endpoint này không phải API công khai có cam kết ổn định. Bản đã rút gọn vượt full compiler với HTTP 200, success=true, metaInfo.pine có dữ liệu và không warning, khoảng 72 giây. Đây vẫn chưa thay cho kiểm tra runtime trên chart.

Kiểm tra native lúc 17:03 UTC+7: XAUUSD/OANDA M5, HTF H1, Bias D1 Auto, Structure Chart, tất cả nhánh TS/FVG/OTE, Early và Larger vẫn bật; Light 24 nguồn + Calculated bars 150 đã chạy, có dashboard, hai cụm H1/H4 với countdown và dấu lịch sử, không còn biểu tượng lỗi. Chỉ báo Daye và chart gốc được giữ. Không save/publish lên tài khoản. Mặc định release đổi Calculated bars từ 600 thành 150 theo cấu hình này. Hình kiểm tra lưu local ở output/brave-review/crt-light-150-runtime-ok.png (không commit).
