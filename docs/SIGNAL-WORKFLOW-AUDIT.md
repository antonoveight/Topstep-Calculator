# Audit workflow và tần suất tín hiệu

Mục tiêu: loại các chỗ nghẽn làm bỏ sót xác nhận hợp lệ, không điều chỉnh thuật toán để đạt số dấu gấp ba bằng mọi giá. Chưa có thống kê dữ liệu thị trường chứng minh tỷ lệ tăng hoặc win rate.

## Luồng hiện hành

1. Nhận diện CRT/TS, EGF/OUT và ISB trên HTF đã đóng; cùng cặp có thể gộp flag, root ưu tiên CRT/TS → ISB → EGF/OUT.
2. Registry giữ các model còn hiệu lực. Cụm/line chỉ dùng một focus FIFO chung để không chồng hình.
3. Xuất thêm ba context cũ nhất còn hiệu lực của từng nhóm, độc lập focus. Snapshot có 97 scalar, tất cả offset riêng trên LTF; không dùng nến HTF tương lai.
4. Ba ReactionState riêng theo dõi IRL, run-open, MSS, FVG/OB, mother retest, CP taken và cadence của CRT/EGF/ISB. Không chia sẻ trạng thái sent giữa ba nhóm.
5. Mỗi nhánh áp điều kiện riêng, sau đó gate chung: nến LTF đã đóng, hướng/mục tiêu hợp lệ, bias, time nếu bật, context chưa bị vô hiệu và CP chưa bị lấy.
6. Các hit cùng bar/cùng hướng được gộp một tam giác cố định size.tiny. Tooltip chứa đầy đủ model/xác nhận/CP/INV của từng hit. Counter C/E/I đếm hit từng nhóm, không phải số hình hợp nhất.

## Các điểm nghẽn đã xử lý

| Điểm nghẽn | Hành vi sau sửa |
| --- | --- |
| All chỉ đưa một model vào bộ xét LTF | Ba kênh riêng; CRT đang chờ/đã dùng không khóa EGF hoặc ISB. Trong từng nhóm vẫn giữ model cũ nhất còn hiệu lực. |
| Một E khóa toàn bộ vòng đời model | Fresh reaction mặc định cho phép dấu mới sau phản ứng mới; One per model là chế độ đối chiếu cũ. Không tự phát lại mỗi bar. |
| Reset mất run-open ngay lúc chạm IRL | Nếu chuỗi đối hướng vẫn còn tiếp nối ngay trước lần chạm, giữ run-open đó để không bỏ sót CISD chạm–rút chân một nến. Đổi vùng thì bỏ chuỗi cũ. FVG/OB/MSS vẫn được khởi tạo lại theo pha mới. |
| IRL đang chọn bị xóa ngay khi râu full-fill | Giữ vùng đã chọn nếu HTF đóng chưa xuyên biên xa. Pool vùng chưa chọn vẫn loại full-fill; không dựng vùng đã bị dùng xong tại quá khứ bằng hindsight. |
| LTF close vượt vùng khóa vĩnh viễn dù reclaim | Chặn khi close còn sai phía; có thể xét lại sau reclaim nếu snapshot HTF vẫn giữ vùng. Không nhìn trước kết quả HTF đóng và không tự gọi đó là TS HTF đã xác nhận. |
| Râu chạm INV bị coi là SL thực tế | Chỉ báo hướng đi dùng close so với INV; wick sweep/reclaim có thể hợp lệ. Không mô phỏng SL/fill của bạn. CP taken vẫn chặn, kể cả bar có thứ tự intrabar không xác định. |
| MSS giữ mức cũ đã bị phá | Seed theo pha và cập nhật bằng pivot mới đã xác nhận thuộc pha hiện hành. Không backdate tín hiệu. |
| Chỉ thấy ít hình vì hiển thị | History giữ 100–200 dấu và không xóa theo tuổi line; Latest vẫn có lựa chọn giữ một dấu. |

## Fresh reaction cụ thể

- CRT/TS: sau dấu trước, cần bắt đầu một run nến đối hướng mới, rồi có lại xác nhận LTF theo hướng context. Không coi nhịp hồi là tín hiệu ngay khi nó xuất hiện.
- ISB breakout: run mới reset điều kiện retest; cần quay lại mother và xác nhận mới. ISB đã resolve bằng TS dùng quy tắc TS.
- EGF: phải rời vùng sau lượt trước rồi trở lại chạm IRL, hoặc context chọn IRL mới; cần xác nhận mới. Nếu chưa rời lượt chạm cũ, không tạo thêm dấu chỉ vì có nhiều nến trong vùng.
- One per model: everSent giữ khóa qua các lượt vùng/pullback của cùng revision. Đổi revision do context/bias đổi tạo vòng đời riêng.
- CP taken không reset theo Fresh reaction. Model/target/HTF close-through vẫn quản lý như bình thường.

## Giới hạn còn giữ có chủ đích

Không xét tất cả 12 model cùng nhóm song song; mỗi nhóm dùng FIFO. Queue đầy vẫn bỏ model mới thay vì đẩy model cũ còn hiệu lực. Bias neutral/counter-bias, thiếu ERL/IRL, thiếu mother retest, ngoài time gate, CP đã lấy và nến LTF chưa đóng vẫn không phát dấu. Chart chỉ hỗ trợ tín hiệu M1/M3/M5 dưới HTF.

Vì vậy ba nhóm không đồng nghĩa tần suất chắc chắn gấp ba. Các mẫu có thể trùng nhau, cùng bar hoặc không qua các gate trên. Không tự nới target/bias/time để đạt một con số mong muốn.

## Kiểm tra đã thực hiện

- Contract nguồn: 97 trường snapshot có offset, ba context và ba state riêng, bộ đếm dựa từng kết quả, tam giác Tiny và không phụ thuộc cỡ chữ.
- Công thức lấy từ Pine: từng nhánh có đường hợp lệ; các gate vẫn chặn; rearm cùng bar/cùng pulse bị từ chối; EGF cần rời rồi chạm lại; One per model vẫn khóa dấu thứ hai.
- Harness test-only thực thi thân f_stepChannel/f_clearReaction trích từ source qua một tập cú pháp JS giới hạn: hai chu kỳ pullback/reclaim Buy và Sell, ba kênh cùng có thể hit; CRT bị khóa không chặn hai kênh còn lại; first-touch CISD; excursion/reclaim; không signal khi chưa đóng bar, ngược bias, ngoài giờ hoặc sau CP taken.
- Harness không phải Pine compiler/runtime: không mô phỏng request.security, cách TradingView tính pivot, rollback hoặc API vẽ. Context HTF và pivot xác nhận là đầu vào fixture, không phải backtest NQ/XAUUSD thật.

Kết quả editor và giới hạn chart/Replay được cập nhật trong [đặc tả](INDICATOR-AUTO-MODELS.md). Chưa có xác nhận hiệu quả thống kê.

## Cách quan sát thực tế

Giữ cùng symbol/session/HTF/LTF/bias/time và cùng dữ liệu tải. Bật All, History, 100–200 dấu, Fresh reaction. Xem N; hover WHY để biết trạng thái ba kênh, hover tam giác và Data Window để xem từng nhóm. Sau đó chọn từng nhóm; bộ đếm tương ứng phải khớp All nếu dữ liệu/cấu hình không đổi. So Fresh reaction với One per model để thấy tác động của cadence. Tạo lại alert E+/E− sau khi đổi source/input; alert HTF vẫn theo focus, alert tín hiệu theo hợp ba kênh.
