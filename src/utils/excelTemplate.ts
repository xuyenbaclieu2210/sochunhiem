import * as XLSX from 'xlsx';
import { Student, Gender, StudentStatus } from '../types';

export interface ParsedStudentRow {
  rowNumber: number; // 1-indexed row number in Excel
  stt?: number | string;
  code: string;
  fullName: string;
  gender: Gender;
  dob: string; // YYYY-MM-DD
  dobDisplay: string; // DD/MM/YYYY
  group: number;
  phone: string;
  parentName: string;
  parentPhone: string;
  address: string;
  role: string;
  status: StudentStatus;
  notes: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isDuplicateInSystem: boolean;
  isDuplicateInFile: boolean;
}

export interface ParseResult {
  totalRows: number;
  validCount: number;
  errorCount: number;
  warningCount: number;
  rows: ParsedStudentRow[];
  headerErrors: string[];
}

/**
 * Tạo và tải xuống file Excel mẫu "Mau_danh_sach_hoc_sinh_10A1.xlsx"
 */
export function downloadStudentExcelTemplate(): void {
  const wb = XLSX.utils.book_new();

  // 1. Sheet "Danh sách học sinh"
  const studentHeaders = [
    'STT',
    'Mã HS',
    'Họ và tên',
    'Giới tính',
    'Ngày sinh',
    'Tổ',
    'Số điện thoại',
    'Họ tên phụ huynh',
    'SĐT phụ huynh',
    'Địa chỉ',
    'Chức vụ',
    'Trạng thái',
    'Ghi chú'
  ];

  const sampleData = [
    studentHeaders,
    [
      1,
      'HS1001',
      'Nguyễn Văn An (Dữ liệu mẫu)',
      'Nam',
      '15/05/2011',
      1,
      '0912345601',
      'Nguyễn Văn Bình',
      '0988111222',
      'Số 12 Hùng Vương, P. 1',
      'Lớp trưởng',
      'Đang học',
      'Học sinh gương mẫu, năng động'
    ],
    [
      2,
      'HS1002',
      'Trần Thị Mai (Dữ liệu mẫu)',
      'Nữ',
      '20/08/2011',
      2,
      '0912345602',
      'Trần Đình Trọng',
      '0988222333',
      'Số 45 Trần Phú, P. 2',
      'Lớp phó học tập',
      'Đang học',
      'Giỏi môn Tiếng Anh'
    ],
    [
      3,
      'HS1003',
      'Lê Hoàng Phúc (Dữ liệu mẫu)',
      'Nam',
      '02/11/2011',
      3,
      '0912345603',
      'Lê Quang Vinh',
      '0988333444',
      'Số 89 Lý Thường Kiệt, P. 3',
      'Thành viên',
      'Đang học',
      'Tham gia CLB Tin học'
    ]
  ];

  const wsStudents = XLSX.utils.aoa_to_sheet(sampleData);

  // Cấu hình độ rộng các cột
  wsStudents['!cols'] = [
    { wch: 6 },  // STT
    { wch: 12 }, // Mã HS
    { wch: 28 }, // Họ và tên
    { wch: 10 }, // Giới tính
    { wch: 14 }, // Ngày sinh
    { wch: 8 },  // Tổ
    { wch: 14 }, // SĐT
    { wch: 22 }, // Họ tên PH
    { wch: 14 }, // SĐT PH
    { wch: 30 }, // Địa chỉ
    { wch: 16 }, // Chức vụ
    { wch: 14 }, // Trạng thái
    { wch: 30 }  // Ghi chú
  ];

  XLSX.utils.book_append_sheet(wb, wsStudents, 'Danh sách học sinh');

  // 2. Sheet "Hướng dẫn"
  const guideHeaders = ['Cột', 'Tên trường', 'Bắt buộc?', 'Quy cách nhập & Hướng dẫn chi tiết'];
  const guideData = [
    guideHeaders,
    ['A', 'STT', 'Không', 'Số thứ tự dòng (1, 2, 3...)'],
    ['B', 'Mã HS', 'BẮT BUỘC', 'Mã định danh duy nhất của học sinh (Ví dụ: HS1001, HS1002). Không để trống.'],
    ['C', 'Họ và tên', 'BẮT BUỘC', 'Họ tên đầy đủ học sinh bằng tiếng Việt có dấu (Ví dụ: Nguyễn Văn An). Không để trống.'],
    ['D', 'Giới tính', 'BẮT BUỘC', 'Chỉ nhập "Nam" hoặc "Nữ".'],
    ['E', 'Ngày sinh', 'BẮT BUỘC', 'Định dạng DD/MM/YYYY (ví dụ: 15/05/2011) hoặc YYYY-MM-DD.'],
    ['F', 'Tổ', 'BẮT BUỘC', 'Nhập số tổ: 1, 2, 3, 4 hoặc "Tổ 1", "Tổ 2", "Tổ 3", "Tổ 4".'],
    ['G', 'Số điện thoại', 'Không', 'Số điện thoại liên lạc của học sinh (10 số).'],
    ['H', 'Họ tên phụ huynh', 'Không', 'Họ và tên đầy đủ của cha, mẹ hoặc người giám hộ.'],
    ['I', 'SĐT phụ huynh', 'Không', 'Số điện thoại phụ huynh nhận thông báo từ trường.'],
    ['J', 'Địa chỉ', 'Không', 'Địa chỉ cư trú thường trú của học sinh.'],
    ['K', 'Chức vụ', 'Không', 'Ví dụ: Lớp trưởng, Lớp phó, Bí thư, Tổ trưởng, Thành viên (Mặc định: Học sinh).'],
    ['L', 'Trạng thái', 'Không', 'Nhập một trong các giá trị: "Đang học", "Chuyển lớp", "Bảo lưu", "Nghỉ học" (Mặc định: Đang học).'],
    ['M', 'Ghi chú', 'Không', 'Thông tin bổ sung về sức khỏe, hạnh kiểm, năng khiếu, hoàn cảnh...']
  ];

  const wsGuide = XLSX.utils.aoa_to_sheet(guideData);
  wsGuide['!cols'] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 14 },
    { wch: 65 }
  ];

  XLSX.utils.book_append_sheet(wb, wsGuide, 'Hướng dẫn');

  // Tải file về máy với tên chính xác yêu cầu
  XLSX.writeFile(wb, 'Mau_danh_sach_hoc_sinh_10A1.xlsx');
}

/**
 * Chuẩn hóa và phân tích chuỗi ngày sinh thành YYYY-MM-DD và DD/MM/YYYY
 */
function parseDateCell(raw: any): { iso: string; display: string } | null {
  if (!raw) return null;

  // Trường hợp là Date object (do cellDates: true)
  if (raw instanceof Date && !isNaN(raw.getTime())) {
    const year = raw.getFullYear();
    const month = String(raw.getMonth() + 1).padStart(2, '0');
    const day = String(raw.getDate()).padStart(2, '0');
    return {
      iso: `${year}-${month}-${day}`,
      display: `${day}/${month}/${year}`
    };
  }

  // Trường hợp là chuỗi
  const str = String(raw).trim();
  if (!str) return null;

  // Format DD/MM/YYYY hoặc DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10);
    const y = parseInt(dmyMatch[3], 10);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1990 && y <= 2035) {
      const day = String(d).padStart(2, '0');
      const month = String(m).padStart(2, '0');
      return {
        iso: `${y}-${month}-${day}`,
        display: `${day}/${month}/${y}`
      };
    }
  }

  // Format YYYY-MM-DD hoặc YYYY/MM/DD
  const ymdMatch = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (ymdMatch) {
    const y = parseInt(ymdMatch[1], 10);
    const m = parseInt(ymdMatch[2], 10);
    const d = parseInt(ymdMatch[3], 10);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1990 && y <= 2035) {
      const day = String(d).padStart(2, '0');
      const month = String(m).padStart(2, '0');
      return {
        iso: `${y}-${month}-${day}`,
        display: `${day}/${month}/${y}`
      };
    }
  }

  // Trường hợp số serial của Excel (e.g. 40678)
  if (!isNaN(Number(str))) {
    const serial = Number(str);
    if (serial > 20000 && serial < 60000) {
      // Excel epoch: 1899-12-30
      const date = new Date((serial - 25569) * 86400 * 1000);
      if (!isNaN(date.getTime())) {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        return {
          iso: `${year}-${month}-${day}`,
          display: `${day}/${month}/${year}`
        };
      }
    }
  }

  return null;
}

/**
 * Đọc file Excel người dùng chọn và kiểm tra tính hợp lệ
 */
export async function parseUploadedExcel(
  file: File,
  existingStudents: Student[]
): Promise<ParseResult> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array', cellDates: true });

  // Tìm sheet chứa danh sách học sinh
  let sheetName = workbook.SheetNames[0];
  if (workbook.SheetNames.includes('Danh sách học sinh')) {
    sheetName = 'Danh sách học sinh';
  } else if (workbook.SheetNames.includes('DanhSachHocSinh')) {
    sheetName = 'DanhSachHocSinh';
  }

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error('Không tìm thấy bảng tính dữ liệu trong file Excel.');
  }

  // Chuyển sheet thành dạng ma trận 2D
  const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (rows.length === 0) {
    throw new Error('File Excel rỗng, không có dữ liệu.');
  }

  // Tìm dòng tiêu đề (header row)
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const rowStr = rows[i].map((cell) => String(cell).toLowerCase().trim()).join(' ');
    if (
      (rowStr.includes('mã hs') || rowStr.includes('ma hs') || rowStr.includes('mã')) &&
      (rowStr.includes('họ và tên') || rowStr.includes('họ tên') || rowStr.includes('tên'))
    ) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    // Không tìm thấy tiêu đề rõ ràng, giả định dòng 0
    headerRowIndex = 0;
  }

  const headerRow = rows[headerRowIndex].map((c) => String(c).trim());

  // Ánh xạ cột
  const colIndex = {
    stt: -1,
    code: -1,
    fullName: -1,
    gender: -1,
    dob: -1,
    group: -1,
    phone: -1,
    parentName: -1,
    parentPhone: -1,
    address: -1,
    role: -1,
    status: -1,
    notes: -1
  };

  headerRow.forEach((col, idx) => {
    const lower = col.toLowerCase().trim();
    if (lower === 'stt' || lower.includes('thứ tự')) colIndex.stt = idx;
    else if (lower.includes('mã hs') || lower.includes('ma hs') || lower === 'mã') colIndex.code = idx;
    else if (lower.includes('họ và tên') || lower.includes('họ tên') || lower === 'tên') colIndex.fullName = idx;
    else if (lower.includes('giới tính') || lower === 'phái') colIndex.gender = idx;
    else if (lower.includes('ngày sinh') || lower.includes('ns') || lower.includes('sinh nhật')) colIndex.dob = idx;
    else if (lower === 'tổ' || lower.includes('tổ')) colIndex.group = idx;
    else if (lower.includes('sđt phụ huynh') || lower.includes('sđt ph') || lower.includes('điện thoại ph')) colIndex.parentPhone = idx;
    else if (lower.includes('họ tên phụ huynh') || lower.includes('phụ huynh') || lower.includes('cha mẹ')) colIndex.parentName = idx;
    else if (lower.includes('số điện thoại') || lower.includes('sđt') || lower.includes('điện thoại')) colIndex.phone = idx;
    else if (lower.includes('địa chỉ') || lower.includes('nơi ở')) colIndex.address = idx;
    else if (lower.includes('chức vụ') || lower.includes('vai trò')) colIndex.role = idx;
    else if (lower.includes('trạng thái') || lower.includes('tình trạng')) colIndex.status = idx;
    else if (lower.includes('ghi chú')) colIndex.notes = idx;
  });

  // Fallback nếu theo thứ tự chuẩn
  if (colIndex.code === -1 && headerRow.length >= 2) colIndex.code = 1;
  if (colIndex.fullName === -1 && headerRow.length >= 3) colIndex.fullName = 2;
  if (colIndex.gender === -1 && headerRow.length >= 4) colIndex.gender = 3;
  if (colIndex.dob === -1 && headerRow.length >= 5) colIndex.dob = 4;
  if (colIndex.group === -1 && headerRow.length >= 6) colIndex.group = 5;

  const headerErrors: string[] = [];
  if (colIndex.code === -1) headerErrors.push('Không tìm thấy cột "Mã HS"');
  if (colIndex.fullName === -1) headerErrors.push('Không tìm thấy cột "Họ và tên"');
  if (colIndex.gender === -1) headerErrors.push('Không tìm thấy cột "Giới tính"');
  if (colIndex.dob === -1) headerErrors.push('Không tìm thấy cột "Ngày sinh"');
  if (colIndex.group === -1) headerErrors.push('Không tìm thấy cột "Tổ"');

  const existingCodesMap = new Set(existingStudents.map((s) => s.code.toUpperCase().trim()));
  const seenCodesInFile = new Map<string, number>();

  const parsedRows: ParsedStudentRow[] = [];

  for (let r = headerRowIndex + 1; r < rows.length; r++) {
    const rawRow = rows[r];
    // Bỏ qua dòng hoàn toàn rỗng
    const hasAnyContent = rawRow.some((c) => String(c).trim() !== '');
    if (!hasAnyContent) continue;

    const rowNum = r + 1; // số thứ tự dòng trong file Excel (1-based)
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. STT
    const stt = colIndex.stt !== -1 ? rawRow[colIndex.stt] : parsedRows.length + 1;

    // 2. Mã HS (BẮT BUỘC)
    const rawCode = colIndex.code !== -1 ? String(rawRow[colIndex.code] || '').trim() : '';
    if (!rawCode) {
      errors.push('Thiếu Mã HS (bắt buộc)');
    }

    const codeUpper = rawCode.toUpperCase();
    let isDuplicateInFile = false;
    if (rawCode) {
      if (seenCodesInFile.has(codeUpper)) {
        isDuplicateInFile = true;
        errors.push(`Mã HS "${rawCode}" bị trùng với dòng ${seenCodesInFile.get(codeUpper)} trong file`);
      } else {
        seenCodesInFile.set(codeUpper, rowNum);
      }
    }

    const isDuplicateInSystem = rawCode ? existingCodesMap.has(codeUpper) : false;
    if (isDuplicateInSystem) {
      warnings.push(`Mã HS "${rawCode}" đã tồn tại trong lớp (sẽ cập nhật nếu chọn ghi đè)`);
    }

    // 3. Họ và tên (BẮT BUỘC)
    const rawName = colIndex.fullName !== -1 ? String(rawRow[colIndex.fullName] || '').trim() : '';
    if (!rawName) {
      errors.push('Thiếu Họ và tên (bắt buộc)');
    }

    // 4. Giới tính (BẮT BUỘC)
    const rawGender = colIndex.gender !== -1 ? String(rawRow[colIndex.gender] || '').trim() : '';
    let parsedGender: Gender = 'Nam';
    if (!rawGender) {
      errors.push('Thiếu Giới tính (bắt buộc: "Nam" hoặc "Nữ")');
    } else {
      const lowerGender = rawGender.toLowerCase();
      if (lowerGender === 'nam' || lowerGender === 'boy' || lowerGender === 'male') {
        parsedGender = 'Nam';
      } else if (lowerGender === 'nữ' || lowerGender === 'nu' || lowerGender === 'female' || lowerGender === 'girl') {
        parsedGender = 'Nữ';
      } else {
        errors.push(`Giới tính "${rawGender}" không hợp lệ (phải là "Nam" hoặc "Nữ")`);
      }
    }

    // 5. Ngày sinh (BẮT BUỘC)
    const rawDob = colIndex.dob !== -1 ? rawRow[colIndex.dob] : '';
    const parsedDate = parseDateCell(rawDob);
    let dobIso = '2011-01-01';
    let dobDisplay = '';
    if (!rawDob || String(rawDob).trim() === '') {
      errors.push('Thiếu Ngày sinh (bắt buộc định dạng DD/MM/YYYY)');
    } else if (!parsedDate) {
      errors.push(`Ngày sinh "${String(rawDob)}" không đúng định dạng (cần DD/MM/YYYY)`);
    } else {
      dobIso = parsedDate.iso;
      dobDisplay = parsedDate.display;
    }

    // 6. Tổ (BẮT BUỘC)
    const rawGroup = colIndex.group !== -1 ? rawRow[colIndex.group] : '';
    let parsedGroup = 1;
    const strGroup = String(rawGroup).trim();
    if (!strGroup) {
      errors.push('Thiếu Tổ (bắt buộc từ 1 đến 4)');
    } else {
      const match = strGroup.replace(/\D/g, '');
      const num = parseInt(match, 10);
      if (num >= 1 && num <= 4) {
        parsedGroup = num;
      } else {
        errors.push(`Tổ "${strGroup}" không hợp lệ (chỉ chấp nhận Tổ 1, 2, 3, 4)`);
      }
    }

    // 7. SĐT
    const rawPhone = colIndex.phone !== -1 ? String(rawRow[colIndex.phone] || '').trim() : '';

    // 8. Họ tên phụ huynh
    const rawParentName = colIndex.parentName !== -1 ? String(rawRow[colIndex.parentName] || '').trim() : '';

    // 9. SĐT phụ huynh
    const rawParentPhone = colIndex.parentPhone !== -1 ? String(rawRow[colIndex.parentPhone] || '').trim() : '';

    // 10. Địa chỉ
    const rawAddress = colIndex.address !== -1 ? String(rawRow[colIndex.address] || '').trim() : '';

    // 11. Chức vụ
    const rawRole = colIndex.role !== -1 ? String(rawRow[colIndex.role] || '').trim() : '';

    // 12. Trạng thái
    const rawStatus = colIndex.status !== -1 ? String(rawRow[colIndex.status] || '').trim() : '';
    let finalStatus: StudentStatus = 'Đang học';
    if (rawStatus) {
      const lowerStatus = rawStatus.toLowerCase();
      if (lowerStatus.includes('chuyển')) finalStatus = 'Chuyển trường';
      else if (lowerStatus.includes('nghỉ') || lowerStatus.includes('bảo lưu')) finalStatus = 'Nghỉ học dài hạn';
      else finalStatus = 'Đang học';
    }

    // 13. Ghi chú
    const rawNotes = colIndex.notes !== -1 ? String(rawRow[colIndex.notes] || '').trim() : '';

    const isValid = errors.length === 0;

    parsedRows.push({
      rowNumber: rowNum,
      stt: stt || parsedRows.length + 1,
      code: rawCode,
      fullName: rawName,
      gender: parsedGender,
      dob: dobIso,
      dobDisplay: dobDisplay || String(rawDob),
      group: parsedGroup,
      phone: rawPhone,
      parentName: rawParentName,
      parentPhone: rawParentPhone,
      address: rawAddress,
      role: rawRole || 'Học sinh',
      status: finalStatus,
      notes: rawNotes,
      isValid,
      errors,
      warnings,
      isDuplicateInSystem,
      isDuplicateInFile
    });
  }

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const errorCount = parsedRows.filter((r) => !r.isValid).length;
  const warningCount = parsedRows.filter((r) => r.isValid && r.warnings.length > 0).length;

  return {
    totalRows: parsedRows.length,
    validCount,
    errorCount,
    warningCount,
    rows: parsedRows,
    headerErrors
  };
}
