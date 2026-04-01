const DB_ID = "1f-pdirDSmwLN_TdPh8DcL2WUr1VJYLDjMFMu6L8C0Mc";
const DB_SHEET_NAME = "DB_QRCODE";

function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle("ตรวจรหัสสินค้า");
}

// Helper: ดึงข้อมูลและสร้าง Lookup function
function getDataAndLookupHelper() {
  const ss = SpreadsheetApp.openById(DB_ID);
  const sheet = ss.getSheetByName(DB_SHEET_NAME);
  if (!sheet) throw new Error("ไม่พบชีทฐานข้อมูล " + DB_SHEET_NAME);

  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(2, 1, lastRow - 1, 34).getValues();

  return {
    data: data,
    lookup: (val, searchColIdx, resultColIdx) => {
      if (!val) return "-";
      const valToSearch = String(val).trim();
      const foundRow = data.find(r => {
        const cellValue = String(r[searchColIdx]).trim();
        return cellValue === valToSearch;
      });
      return foundRow ? foundRow[resultColIdx] : "ไม่พบข้อมูล";
    }
  };
}

// ฟังก์ชันเดิม: ถอดรหัสจาก QR Code (Logic เดิม)
function decodeProductCode(qrCodeFull) {
  if (!qrCodeFull) return { error: "ไม่พบรหัสคิวอาร์โคด" };

  try {
    const helper = getDataAndLookupHelper();
    const lookup = helper.lookup;

    let baseCode = "";
    const dashIndex = qrCodeFull.indexOf('-');
    if (dashIndex !== -1) {
      baseCode = qrCodeFull.substring(0, dashIndex);
    } else {
      baseCode = qrCodeFull;
    }
    baseCode = baseCode.trim().replace(/\s/g, '');

    let weight = "-";
    const slashParts = qrCodeFull.split('/');
    if (slashParts.length > 1) {
      weight = slashParts[1].trim();
    }

    const getChars = (start, length) => {
      if (baseCode.length < start) return "";
      return baseCode.substring(start - 1, start - 1 + length);
    };

    // Mapping เดิมสำหรับ QR Code
    const val_d1 = lookup(getChars(1, 1), 0, 1);
    const val_d2 = lookup(getChars(2, 1), 2, 3);
    const val_d3 = lookup(getChars(3, 1), 4, 5);
    const val_d4 = lookup(getChars(4, 1), 6, 7);
    const val_d5 = lookup(getChars(5, 1), 8, 9);
    const val_d6 = lookup(getChars(6, 1), 10, 12);
    const val_d7_8 = lookup(getChars(7, 2), 13, 14);
    const val_d9 = lookup(getChars(9, 1), 15, 16);
    const val_d10 = lookup(getChars(10, 1), 17, 18);
    const val_productName = lookup(getChars(14, 3), 19, 21); // QR ใช้ 14-16
    const val_d17 = lookup(getChars(17, 1), 22, 23);
    const val_d18 = lookup(getChars(18, 1), 24, 25);
    const val_d19 = lookup(getChars(19, 1), 26, 27);
    const val_d20_24 = getChars(20, 5) || "-";
    
    // D25/29 Logic เดิม
    const val_d25_29_code = getChars(25, 5);
    const val_d25_29_desc = lookup(val_d25_29_code, 30, 29);

    const val_d30_34 = getChars(30, 5) || "-";
    const val_d35 = lookup(getChars(35, 1), 32, 33);

    return {
      success: true,
      data: {
        baseCode: baseCode,
        productName: val_productName,
        d1: val_d1,
        d2: val_d2,
        d3: val_d3,
        d4: val_d4,
        d5: val_d5,
        d6: val_d6 !== "ไม่พบข้อมูล" ? val_d6 + " บาท" : val_d6,
        d7_8: val_d7_8 !== "ไม่พบข้อมูล" ? val_d7_8 + " บาท" : val_d7_8,
        d9: val_d9 !== "ไม่พบข้อมูล" ? val_d9 + " บาท" : val_d9,
        d10: val_d10,
        d17: val_d17,
        d18: val_d18,
        d19: val_d19,
        d20_24: val_d20_24,
        d25_29: val_d25_29_code + " " + val_d25_29_desc,
        d30_34: val_d30_34,
        d35: val_d35,
        weight: weight
      }
    };

  } catch (e) {
    return { error: "เกิดข้อผิดพลาด: " + e.toString() };
  }
}

// ฟังก์ชัน: ค้นหาด้วยรหัสเต็ม (Manual Full Search)
function searchManualCode(manualCode) {
  if (!manualCode) return { error: "กรุณากรอกรหัสสินค้า" };

  try {
    const helper = getDataAndLookupHelper();
    const lookup = helper.lookup;
    const cleanCode = String(manualCode).trim().replace(/\s/g, '');

    const getChars = (start, length) => {
      if (cleanCode.length < start) return "";
      return cleanCode.substring(start - 1, start - 1 + length);
    };

    // Mapping สำหรับ Manual Search (Full Code)
    const val_d1 = lookup(getChars(1, 1), 0, 1);
    const val_d2 = lookup(getChars(2, 1), 2, 3);
    const val_d3 = lookup(getChars(3, 1), 4, 5);
    const val_d4 = lookup(getChars(4, 1), 6, 7);
    const val_d5 = lookup(getChars(5, 1), 8, 9);
    const val_d6 = lookup(getChars(6, 1), 10, 12);
    const val_d7_8 = lookup(getChars(7, 2), 13, 14);
    const val_d9 = lookup(getChars(9, 1), 15, 16);
    const val_productName = lookup(getChars(10, 3), 19, 21); // Manual ใช้ 10-12

    return {
      success: true,
      data: {
        productName: val_productName,
        d1: val_d1,
        d2: val_d2,
        d3: val_d3,
        d4: val_d4,
        d5: val_d5,
        d6: val_d6 !== "ไม่พบข้อมูล" ? val_d6 + " บาท" : val_d6,
        d7_8: val_d7_8 !== "ไม่พบข้อมูล" ? val_d7_8 + " บาท" : val_d7_8,
        d9: val_d9 !== "ไม่พบข้อมูล" ? val_d9 + " บาท" : val_d9
      }
    };

  } catch (e) {
    return { error: "เกิดข้อผิดพลาด: " + e.toString() };
  }
}

// ฟังก์ชันใหม่: ค้นหารายหลัก (Individual Search)
function searchSingleField(type, code) {
  if (!code) return ""; // ถ้าไม่กรอกให้คืนค่าว่าง

  try {
    const helper = getDataAndLookupHelper();
    const lookup = helper.lookup;
    const cleanCode = String(code).trim();
    
    let result = "";

    switch(type) {
      case 'D1': // A->B
        result = lookup(cleanCode, 0, 1);
        break;
      case 'D2': // C->D
        result = lookup(cleanCode, 2, 3);
        break;
      case 'D3': // E->F
        result = lookup(cleanCode, 4, 5);
        break;
      case 'D4': // G->H
        result = lookup(cleanCode, 6, 7);
        break;
      case 'D5': // I->J
        result = lookup(cleanCode, 8, 9);
        break;
      case 'D6': // K->M
        result = lookup(cleanCode, 10, 12);
        if(result !== "ไม่พบข้อมูล") result += " บาท";
        break;
      case 'D7_8': // N->O
        result = lookup(cleanCode, 13, 14);
        if(result !== "ไม่พบข้อมูล") result += " บาท";
        break;
      case 'D9': // P->Q
        result = lookup(cleanCode, 15, 16);
        if(result !== "ไม่พบข้อมูล") result += " บาท";
        break;
      case 'D10_12': // T->V
        result = lookup(cleanCode, 19, 21);
        break;
    }
    return result;
  } catch (e) {
    return "Error: " + e.toString();
  }
}
