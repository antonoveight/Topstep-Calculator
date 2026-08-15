/**
 * ==============================================================================
 * TOPSTEP® DASHBOARD & DAILY RISK TRACKER - GOOGLE APPS SCRIPT (UPDATE 08/2026)
 * ==============================================================================
 * Quy tắc Consistency 50% (Trading Combine):
 * - NẾU LÃI 1 NGÀY > 50% TARGET: KHÔNG PHẢI LỖI VI PHẠM (KHÔNG FAIL TÀI KHOẢN).
 * - Target tổng sẽ TỰ ĐỘNG SCALE UP lên = (Lãi Ngày Cao Nhất x 2).
 * - Trader chỉ cần trade tiếp để tổng lãi đạt mốc Target Điều Chỉnh mới là đỗ Combine.
 * ==============================================================================
 */

function setupTopstepTracker() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  sheet.setName("Topstep Risk Dashboard");
  sheet.clear();
  sheet.setGridlines(true);

  // 1. Header Title
  sheet.getRange("A1:K1").merge()
    .setValue("TOÀN CẢNH QUỸ TOPSTEP & NHẬT KÝ THỐNG KÊ EOD HÀNG NGÀY (2026)")
    .setFontFamily("Inter")
    .setFontSize(14)
    .setFontWeight("bold")
    .setBackground("#0f172a")
    .setFontColor("#38bdf8")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(1, 45);

  // 2. Account Config & Summary KPI Block
  sheet.getRange("A3:C3").merge().setValue("⚙️ CẤU HÌNH TÀI KHOẢN").setFontWeight("bold").setBackground("#1e293b").setFontColor("#94a3b8");
  sheet.getRange("A4").setValue("Gói Tài Khoản:"); sheet.getRange("B4").setValue("50K ($50,000)");
  sheet.getRange("A5").setValue("Vốn Ban Đầu ($):"); sheet.getRange("B5").setValue(50000);
  sheet.getRange("A6").setValue("Target Lợi Nhuận Gốc ($):"); sheet.getRange("B6").setValue(3000);
  sheet.getRange("A7").setValue("Hạn Mức Lỗ MLL ($):"); sheet.getRange("B7").setValue(2000);
  sheet.getRange("A8").setValue("Hạn Mức Lỗ Ngày DLL ($):"); sheet.getRange("B8").setValue(1000);

  // Metrics Block (Cộng dồn EOD hàng ngày + Target Scaling)
  sheet.getRange("E3:G3").merge().setValue("📈 TIẾN TRÌNH & TARGET SCALING").setFontWeight("bold").setBackground("#1e293b").setFontColor("#94a3b8");
  sheet.getRange("E4").setValue("Tổng PnL Tích Lũy Các Ngày:"); sheet.getRange("F4").setFormula("=SUM(E12:E100)");
  sheet.getRange("E5").setValue("Số Dư Cuối Ngày Hiện Tại:"); sheet.getRange("F5").setFormula("=B5+F4");
  sheet.getRange("E6").setValue("Mục Tiêu Lợi Nhuận Điều Chỉnh:"); sheet.getRange("F6").setFormula("=MAX(B6, J4*2)");
  sheet.getRange("E7").setValue("% Đạt Profit Target Điều Chỉnh:"); sheet.getRange("F7").setFormula("=F4/F6");
  sheet.getRange("E8").setValue("Ngưỡng MLL Trailing EOD:"); sheet.getRange("F8").setFormula("=MIN(B5, B5-B7+MAX(0, MAX(F12:F100)-B5))");
  sheet.getRange("E9").setValue("Đệm MLL Khả Dụng:"); sheet.getRange("F9").setFormula("=F5-F8");

  // Rule & Scaling Checks
  sheet.getRange("I3:K3").merge().setValue("🛡️ KIỂM TRA CONSISTENCY & SỐ NGÀY").setFontWeight("bold").setBackground("#1e293b").setFontColor("#94a3b8");
  sheet.getRange("I4").setValue("Tổng Lãi Ngày Cao Nhất:"); sheet.getRange("J4").setFormula("=MAX(E12:E100)");
  sheet.getRange("I5").setValue("% Ngày Cao Nhất / Lãi Tổng:"); sheet.getRange("J5").setFormula("=IF(F4>0, J4/F4, 0)");
  sheet.getRange("I6").setValue("Số Ngày Giao Dịch Riêng Biệt:"); sheet.getRange("J6").setFormula("=COUNTUNIQUE(A12:A100)");
  sheet.getRange("I7").setValue("Trạng Thái Trình Đỗ Combine:"); 
  sheet.getRange("J7:K7").merge().setFormula('=IF(AND(F4>=F6, J5<0.5, J6>=2), "🎉 ĐỦ ĐIỀU KIỆN CẤP VỐN!", IF(AND(F4>=F6, J6<2), "ℹ️ CẦN THÊM NGÀY (Mới đạt " & J6 & "/2 ngày)", IF(J4>B6*0.5, "ℹ️ TARGET SCALE LÊN " & TEXT(F6, "$#,##0") & " (Cần " & TEXT(F6-F4, "$#,##0") & ")", "🟢 ĐANG THI (<50%)")))');

  // Format KPI Block
  sheet.getRange("B5:B8").setNumberFormat("$#,##0");
  sheet.getRange("F4:F6").setNumberFormat("$#,##0.00");
  sheet.getRange("F7").setNumberFormat("0.0%");
  sheet.getRange("F8:F9").setNumberFormat("$#,##0.00");
  sheet.getRange("J4").setNumberFormat("$#,##0.00");
  sheet.getRange("J5").setNumberFormat("0.0%");

  // 3. Table Headers (Row 11)
  var headers = [
    "Ngày Giao Dịch", "Sản Phẩm (Gold/NQ/ES/BTC)", "Số Hợp Đồng (Contracts)", "Số Lệnh", 
    "Tổng PnL Cuối Ngày ($)", "Số Dư EOD ($)", "MLL Trailing EOD ($)", 
    "Đệm MLL ($)", "Kiểm Tra DLL Ngày", "% Consistency Ngày", "Ghi Chú Nhật Ký"
  ];
  
  var headerRange = sheet.getRange(11, 1, 1, headers.length);
  headerRange.setValues([headers])
    .setFontWeight("bold")
    .setBackground("#1e293b")
    .setFontColor("#f8fafc")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(11, 32);

  // Formulas for Daily Rows
  for (var i = 12; i <= 30; i++) {
    sheet.getRange(i, 6).setFormula('=IF(ISBLANK(A' + i + '), "", IF(ROW()=12, B5+E12, F' + (i-1) + '+E' + i + '))');
    sheet.getRange(i, 7).setFormula('=IF(ISBLANK(A' + i + '), "", MIN(B$5, B$5-B$7+MAX(0, MAX(F$12:F' + i + ')-B$5)))');
    sheet.getRange(i, 8).setFormula('=IF(ISBLANK(A' + i + '), "", F' + i + '-G' + i + ')');
    sheet.getRange(i, 9).setFormula('=IF(ISBLANK(A' + i + '), "", IF(E' + i + '<=-B$8, "🔴 VI PHẠM DLL NGÀY", "🟢 AN TOÀN"))');
    sheet.getRange(i, 10).setFormula('=IF(OR(ISBLANK(A' + i + '), F$4<=0), "", IF(E' + i + '>0, E' + i + '/F$4, 0))');
  }

  // Formatting Numbers
  sheet.getRange("E12:H50").setNumberFormat("$#,##0.00");
  sheet.getRange("J12:J50").setNumberFormat("0.0%");

  // Auto column widths
  for (var col = 1; col <= 11; col++) {
    sheet.autoResizeColumn(col);
  }
  sheet.setColumnWidth(1, 120);
  sheet.setColumnWidth(11, 240);

  SpreadsheetApp.getUi().alert("🎉 Khởi tạo Bảng tính Topstep Risk & Target Scaling Dashboard thành công!");
}
