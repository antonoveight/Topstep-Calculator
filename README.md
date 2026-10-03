# 📊 Topstep® Multi-Account Risk & Payout Dashboard (2026)

Hệ thống quản trị rủi ro đa tài khoản, theo dõi Target Scaling và mô phỏng đợt rút tiền Payout chuẩn quy định Topstep® Combine & Express Funded Account (XFA).

## 🌟 Tính Năng Nổi Bật

- **💳 Quản Lý Đa Tài Khoản (Multi-Account Engine)**: Quản lý nhiều tài khoản cùng lúc với mã ID chuỗi tùy chỉnh (VD: `TS-50K-001`, `XFA-100K-MAIN`).
- **🎯 Bảng Tính Target Scaling (Combine®)**: Tự động đếm ngày thi, tính mức PnL an toàn hàng ngày giúp đỗ Combine mà không bị vi phạm quy tắc Consistency 55%.
- **🏷️ Bảng Giá & Thông Số 3 Gói Vốn Topstep®**: Cập nhật chuẩn gói $50K ($85/tháng), $100K ($129/tháng), $150K ($199/tháng) với quyền lợi Responsible Trading Advantage (DOUBLE Payout Caps, miễn phí kích hoạt XFA $0).
- **💰 Mô Phỏng Payout XFA®**: Tự động đếm ngày thắng ($\ge +\$150$ EOD), kiểm tra tỷ lệ Consistency và tính hạn mức tiền rút tối đa đợt hiện tại dựa trên $50\%$ lợi nhuận và Payout Cap ($2K-$4K / $3K-$6K / $5K-$10K).
- **⚡ Calculator Vị Thế An Toàn**: Tính khối lượng Lot Micro / Mini tối đa dựa theo số tiền cắt lỗ ($ USD) và số Ticks Stop Loss.
- **📊 Đồng Bộ Bảng Tính Google Sheets**: Hỗ trợ xuất file CSV nhật ký EOD và hỗ trợ mã Google Apps Script tự động.

## 🚀 Hướng Dẫn Chạy Trang Web

Trang web được xây dựng thuần **HTML5 + TailwindCSS + JavaScript**. Không cần cài đặt NodeJS hay Server.
1. Mở file `topstep.html` bằng bất kỳ trình duyệt web nào (Chrome, Edge, Brave, Safari).
2. Lưu dữ liệu tự động 100% vào LocalStorage của trình duyệt.

## 📂 Cấu Trúc Dự Án

```
topstep/
├── topstep.html                   # Trình quản lý Risk & Payout Dashboard
├── topstep_tracker_template.csv   # File CSV mẫu nhật ký EOD
├── topstep_google_sheets_setup.js # Mã Google Apps Script hỗ trợ
└── README.md                      # Tài liệu hướng dẫn
```

---
*Disclaimer: Topstep® là thương hiệu đã được đăng ký. Công cụ được phát triển phục vụ mục đích quản trị rủi ro cá nhân.*
