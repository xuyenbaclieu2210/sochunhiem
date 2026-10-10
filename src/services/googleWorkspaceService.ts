/**
 * Google Workspace Service (Client-Side REST calls with OAuth Bearer Token)
 * Supports Google Drive v3 and Google Sheets v4 APIs
 */

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  iconLink?: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
  owners?: { displayName?: string; emailAddress?: string; photoLink?: string }[];
  shared?: boolean;
}

export interface SpreadsheetMetadata {
  spreadsheetId: string;
  title: string;
  sheets: {
    sheetId: number;
    title: string;
    index: number;
    rowCount?: number;
    columnCount?: number;
  }[];
}

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const SHEETS_API_URL = 'https://sheets.googleapis.com/v4';

/**
 * List files from Google Drive
 */
export async function listDriveFiles(
  accessToken: string,
  options?: {
    query?: string;
    mimeTypeFilter?: string;
    folderId?: string;
    pageSize?: number;
  }
): Promise<{ files: DriveFile[]; nextPageToken?: string }> {
  const params = new URLSearchParams();
  params.set('pageSize', String(options?.pageSize || 30));
  params.set(
    'fields',
    'nextPageToken, files(id, name, mimeType, iconLink, webViewLink, webContentLink, thumbnailLink, createdTime, modifiedTime, size, owners, shared)'
  );
  params.set('orderBy', 'folder,modifiedTime desc');

  const queryParts: string[] = ['trashed = false'];
  if (options?.folderId) {
    queryParts.push(`'${options.folderId}' in parents`);
  }
  if (options?.mimeTypeFilter) {
    if (options.mimeTypeFilter === 'spreadsheet') {
      queryParts.push("mimeType = 'application/vnd.google-apps.spreadsheet'");
    } else if (options.mimeTypeFilter === 'document') {
      queryParts.push("mimeType = 'application/vnd.google-apps.document'");
    } else if (options.mimeTypeFilter === 'folder') {
      queryParts.push("mimeType = 'application/vnd.google-apps.folder'");
    } else if (options.mimeTypeFilter === 'pdf') {
      queryParts.push("mimeType = 'application/pdf'");
    }
  }
  if (options?.query && options.query.trim()) {
    const escapedQuery = options.query.replace(/'/g, "\\'");
    queryParts.push(`name contains '${escapedQuery}'`);
  }

  params.set('q', queryParts.join(' and '));

  const response = await fetch(`${DRIVE_API_URL}/files?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Lỗi tải danh sách tệp Google Drive (${response.status})`);
  }

  const data = await response.json();
  return {
    files: data.files || [],
    nextPageToken: data.nextPageToken
  };
}

/**
 * List only spreadsheets from Drive
 */
export async function listDriveSpreadsheets(
  accessToken: string,
  search?: string
): Promise<DriveFile[]> {
  const result = await listDriveFiles(accessToken, {
    mimeTypeFilter: 'spreadsheet',
    query: search,
    pageSize: 50
  });
  return result.files;
}

/**
 * Create a new folder in Google Drive
 */
export async function createDriveFolder(
  accessToken: string,
  name: string,
  parentFolderId?: string
): Promise<DriveFile> {
  const body: any = {
    name,
    mimeType: 'application/vnd.google-apps.folder'
  };
  if (parentFolderId) {
    body.parents = [parentFolderId];
  }

  const response = await fetch(`${DRIVE_API_URL}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Không thể tạo thư mục trên Google Drive');
  }

  return await response.json();
}

/**
 * Upload a file directly to Google Drive using multipart upload
 */
export async function uploadFileToDrive(
  accessToken: string,
  file: File,
  folderId?: string,
  description?: string
): Promise<DriveFile> {
  const metadata: any = {
    name: file.name,
    description: description || 'Tài liệu Sổ Chủ Nhiệm'
  };
  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const reader = new FileReader();
  const fileDataPromise = new Promise<ArrayBuffer>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });

  const arrayBuffer = await fileDataPromise;
  const metadataContentType = 'application/json; charset=UTF-8';
  const metadataString = JSON.stringify(metadata);

  const multipartHeader =
    delimiter +
    `Content-Type: ${metadataContentType}\r\n\r\n` +
    metadataString +
    delimiter +
    `Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`;

  const encoder = new TextEncoder();
  const headerBytes = encoder.encode(multipartHeader);
  const footerBytes = encoder.encode(closeDelimiter);

  const combinedLength = headerBytes.length + arrayBuffer.byteLength + footerBytes.length;
  const combinedBuffer = new Uint8Array(combinedLength);

  combinedBuffer.set(headerBytes, 0);
  combinedBuffer.set(new Uint8Array(arrayBuffer), headerBytes.length);
  combinedBuffer.set(footerBytes, headerBytes.length + arrayBuffer.byteLength);

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,iconLink,size',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: combinedBuffer
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Không thể tải tệp lên Google Drive');
  }

  return await response.json();
}

/**
 * Delete a file or folder from Google Drive
 * CAUTION: MUST be accompanied by explicit user confirmation modal in UI!
 */
export async function deleteDriveFile(
  accessToken: string,
  fileId: string
): Promise<void> {
  const response = await fetch(`${DRIVE_API_URL}/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Không thể xóa tệp khỏi Google Drive');
  }
}

// ==========================================
// GOOGLE SHEETS API V4
// ==========================================

/**
 * Fetch spreadsheet metadata including all sheet tabs
 */
export async function getSpreadsheetMetadata(
  accessToken: string,
  spreadsheetId: string
): Promise<SpreadsheetMetadata> {
  const response = await fetch(`${SHEETS_API_URL}/spreadsheets/${spreadsheetId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Không thể lấy thông tin Google Spreadsheet');
  }

  const data = await response.json();
  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title || 'Không có tiêu đề',
    sheets: (data.sheets || []).map((s: any) => ({
      sheetId: s.properties?.sheetId,
      title: s.properties?.title,
      index: s.properties?.index,
      rowCount: s.properties?.gridProperties?.rowCount,
      columnCount: s.properties?.gridProperties?.columnCount
    }))
  };
}

/**
 * Read cell values from a sheet range (e.g. 'Sheet1!A1:Z50')
 */
export async function getSpreadsheetValues(
  accessToken: string,
  spreadsheetId: string,
  range: string
): Promise<string[][]> {
  const encodedRange = encodeURIComponent(range);
  const response = await fetch(
    `${SHEETS_API_URL}/spreadsheets/${spreadsheetId}/values/${encodedRange}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Không thể đọc dữ liệu từ range "${range}"`);
  }

  const data = await response.json();
  return data.values || [];
}

/**
 * Create a new Google Spreadsheet with sheets and initial formatted data
 */
export async function createSpreadsheet(
  accessToken: string,
  title: string,
  sheetsData?: {
    title: string;
    values?: any[][];
  }[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const requestBody: any = {
    properties: {
      title
    }
  };

  if (sheetsData && sheetsData.length > 0) {
    requestBody.sheets = sheetsData.map((s) => ({
      properties: {
        title: s.title
      }
    }));
  }

  const response = await fetch(`${SHEETS_API_URL}/spreadsheets`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Không thể tạo mới Google Spreadsheet');
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Write initial data if provided
  if (sheetsData && sheetsData.length > 0) {
    for (const sheet of sheetsData) {
      if (sheet.values && sheet.values.length > 0) {
        await updateSpreadsheetValues(
          accessToken,
          spreadsheetId,
          `'${sheet.title}'!A1`,
          sheet.values
        );
      }
    }
  }

  return {
    spreadsheetId,
    spreadsheetUrl
  };
}

/**
 * Update cell values in a range
 */
export async function updateSpreadsheetValues(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: any[][]
): Promise<any> {
  const encodedRange = encodeURIComponent(range);
  const response = await fetch(
    `${SHEETS_API_URL}/spreadsheets/${spreadsheetId}/values/${encodedRange}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Không thể cập nhật ô trong Google Spreadsheet');
  }

  return await response.json();
}

/**
 * Export Class Students list to Google Sheets
 */
export async function exportStudentsToGoogleSheet(
  accessToken: string,
  className: string,
  academicYear: string,
  homeroomTeacher: string,
  students: any[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const title = `Sổ Chủ Nhiệm - Danh sách học sinh ${className} (${academicYear})`;

  const headers = [
    'STT',
    'Mã học sinh',
    'Họ và tên',
    'Ngày sinh',
    'Giới tính',
    'Tổ',
    'Chức vụ',
    'Trạng thái',
    'Số điện thoại phụ huynh',
    'Địa chỉ thường trú',
    'Ghi chú'
  ];

  const infoRows = [
    ['TRƯỜNG THPT - SỔ CHỦ NHIỆM ĐIỆN TỬ'],
    [`LỚP: ${className}`, `NĂM HỌC: ${academicYear}`, `GIÁO VIÊN CHỦ NHIỆM: ${homeroomTeacher}`],
    [`Tổng số học sinh: ${students.length}`, `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`],
    [] // Blank line
  ];

  const dataRows = students.map((s, idx) => [
    idx + 1,
    s.studentId || '',
    s.fullName || '',
    s.dateOfBirth || '',
    s.gender === 'male' ? 'Nam' : s.gender === 'female' ? 'Nữ' : '',
    s.team ? `Tổ ${s.team}` : '',
    s.role || 'Học sinh',
    s.status === 'studying' ? 'Đang học' : s.status === 'transferred' ? 'Chuyển trường' : 'Nghỉ học',
    s.parentPhone || '',
    s.address || '',
    s.notes || ''
  ]);

  const allRows = [...infoRows, headers, ...dataRows];

  return await createSpreadsheet(accessToken, title, [
    {
      title: 'Danh sách học sinh',
      values: allRows
    }
  ]);
}

/**
 * Export Attendance to Google Sheets
 */
export async function exportAttendanceToGoogleSheet(
  accessToken: string,
  className: string,
  date: string,
  students: any[],
  presentCount: number,
  absentCount: number,
  lateCount: number
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const title = `Sổ Chủ Nhiệm - Chuyên cần ${className} (${date})`;

  const infoRows = [
    ['BẢNG ĐIỂM DANH CHUYÊN CẦN HỌC SINH'],
    [`Lớp: ${className}`, `Ngày: ${date}`, `Thời gian xuất: ${new Date().toLocaleTimeString('vi-VN')}`],
    [`Có mặt: ${presentCount}`, `Vắng mặt: ${absentCount}`, `Đi trễ: ${lateCount}`],
    []
  ];

  const headers = ['STT', 'Mã HS', 'Họ và tên', 'Tổ', 'Trạng thái điểm danh', 'Ghi chú lý do'];

  const rows = students.map((s, idx) => [
    idx + 1,
    s.studentId || '',
    s.fullName || '',
    `Tổ ${s.team || 1}`,
    s.status === 'present' ? 'Có mặt' : s.status === 'absent_excused' ? 'Vắng có phép' : s.status === 'absent_unexcused' ? 'Vắng không phép' : 'Đi trễ',
    s.reason || ''
  ]);

  return await createSpreadsheet(accessToken, title, [
    {
      title: `Điểm danh ${date}`,
      values: [...infoRows, headers, ...rows]
    }
  ]);
}

/**
 * Export Competition to Google Sheets
 */
export async function exportCompetitionToGoogleSheet(
  accessToken: string,
  className: string,
  weekNumber: number,
  rankings: any[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const title = `Sổ Chủ Nhiệm - Tổng hợp thi đua Tuần ${weekNumber} (${className})`;

  const infoRows = [
    [`BẢNG TỔNG HỢP XẾP HẠNG THI ĐUA TUẦN ${weekNumber}`],
    [`Lớp: ${className}`, `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`],
    []
  ];

  const headers = ['Hạng', 'Mã HS', 'Họ và tên', 'Tổ', 'Điểm ban đầu', 'Điểm cộng', 'Điểm trừ', 'Tổng điểm tuần', 'Xếp loại'];

  const rows = rankings.map((r) => [
    r.rank || '',
    r.studentId || '',
    r.fullName || '',
    `Tổ ${r.team || ''}`,
    r.baseScore || 100,
    r.bonusScore || 0,
    r.penaltyScore || 0,
    r.totalScore || 0,
    r.rating || ''
  ]);

  return await createSpreadsheet(accessToken, title, [
    {
      title: `Tuần ${weekNumber}`,
      values: [...infoRows, headers, ...rows]
    }
  ]);
}
