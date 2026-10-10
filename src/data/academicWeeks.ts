/**
 * Quy ước số tuần học của Lớp 10A1 - Năm học 2026–2027
 * 
 * QUY TẮC BẮT BUỘC:
 * - Tuần học được đánh số theo tuần học của lớp, KHÔNG sử dụng ISO week number hay getWeek() mặc định.
 * - Tuần 5: Thứ Hai, 05/10/2026 → Thứ Bảy, 10/10/2026
 *   Do đó:
 *   05/10/2026 = Tuần 5 (Thứ Hai)
 *   06/10/2026 = Tuần 5 (Thứ Ba)
 *   07/10/2026 = Tuần 5 (Thứ Tư)
 *   08/10/2026 = Tuần 5 (Thứ Năm - Hôm nay)
 *   09/10/2026 = Tuần 5 (Thứ Sáu)
 *   10/10/2026 = Tuần 5 (Thứ Bảy)
 * - Chủ nhật 11/10/2026:
 *   + Không thuộc tuần học
 *   + Là ngày nghỉ
 *   + Không tính chuyên cần tuần
 *   + Không tính thi đua tuần
 * 
 * Mỗi tuần học gồm: Thứ Hai → Thứ Bảy (6 ngày học)
 * Chủ nhật là ngày nghỉ và không tăng số tuần.
 */

import { CompetitionWeek } from '../types';

export interface AcademicWeekDay {
  date: string; // YYYY-MM-DD
  shortDate: string; // DD/MM
  fullDate: string; // DD/MM/YYYY
  dayOfWeek: string; // 'Thứ Hai', 'Thứ Ba', ... 'Thứ Bảy'
  dayShort: string; // 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'
  isToday: boolean;
  isRestDay: boolean;
}

export interface AcademicConfig {
  academicYearStart: string; // '2026-09-07' (Thứ Hai)
  currentWeekNumber: number; // 5
  totalWeeksHK1: number; // 18
  totalWeeksYear: number; // 35
}

export const DEFAULT_ACADEMIC_CONFIG: AcademicConfig = {
  academicYearStart: '2026-09-07', // Thứ Hai đầu tiên của năm học
  currentWeekNumber: 5, // Tuần hiện tại: Tuần 5 (05/10/2026 – 10/10/2026)
  totalWeeksHK1: 18,
  totalWeeksYear: 35,
};

/**
 * Format Date object to YYYY-MM-DD
 */
function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Format Date object to DD/MM/YYYY
 */
function formatDateVN(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

/**
 * Format Date object to DD/MM
 */
function formatDateVNDayMonth(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}`;
}

/**
 * Tạo danh sách tuần học theo quy ước lớp 10A1
 * Bắt đầu từ Thứ Hai của ngày khai giảng, mỗi tuần từ Thứ Hai đến Thứ Bảy (6 ngày học).
 * Chủ nhật là ngày nghỉ.
 */
export function generateAcademicWeeks(
  startDateStr: string = DEFAULT_ACADEMIC_CONFIG.academicYearStart,
  totalWeeks: number = DEFAULT_ACADEMIC_CONFIG.totalWeeksHK1,
  currentWeekNumber: number = DEFAULT_ACADEMIC_CONFIG.currentWeekNumber
): CompetitionWeek[] {
  const weeks: CompetitionWeek[] = [];
  const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
  
  // Base Monday
  const baseMonday = new Date(startYear, startMonth - 1, startDay);

  for (let i = 1; i <= totalWeeks; i++) {
    // Week i start: baseMonday + (i - 1) * 7 days
    const monday = new Date(baseMonday);
    monday.setDate(baseMonday.getDate() + (i - 1) * 7);

    // Week i end: Monday + 5 days (Thứ Bảy)
    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5);

    const startDateISO = formatDateISO(monday);
    const endDateISO = formatDateISO(saturday);

    const startVN = formatDateVN(monday);
    const endVN = formatDateVN(saturday);

    const startShort = formatDateVNDayMonth(monday);
    const endShort = formatDateVNDayMonth(saturday);

    const monthNum = monday.getMonth() + 1;
    const yearNum = monday.getFullYear();
    const monthText = `Tháng ${monthNum}/${yearNum}`;

    const isCurrent = i === currentWeekNumber;

    weeks.push({
      id: `w${i}`,
      weekNumber: i,
      name: `Tuần ${i}`,
      startDate: startDateISO,
      endDate: endDateISO,
      formattedRange: `${startVN} – ${endVN}`,
      displayRange: `${startVN} → ${endVN}`,
      shortRange: `${startShort} - ${endShort}`,
      month: monthText,
      semester: i <= 18 ? 'HK1' : 'HK2',
      isCurrent,
    });
  }

  return weeks;
}

/**
 * Lấy danh sách 6 ngày học trong tuần (Thứ Hai → Thứ Bảy)
 * Kèm theo thông tin ngày Chủ nhật nghỉ
 */
export function getDaysInWeek(
  week: CompetitionWeek,
  todayStr: string = '2026-10-08'
): { schoolDays: AcademicWeekDay[]; sundayRestDay: AcademicWeekDay } {
  const [y, m, d] = week.startDate.split('-').map(Number);
  const monday = new Date(y, m - 1, d);

  const dayNames = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayShorts = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const schoolDays: AcademicWeekDay[] = [];

  for (let i = 0; i < 6; i++) {
    const curDate = new Date(monday);
    curDate.setDate(monday.getDate() + i);
    const iso = formatDateISO(curDate);
    schoolDays.push({
      date: iso,
      shortDate: formatDateVNDayMonth(curDate),
      fullDate: formatDateVN(curDate),
      dayOfWeek: dayNames[i],
      dayShort: dayShorts[i],
      isToday: iso === todayStr,
      isRestDay: false,
    });
  }

  // Chủ nhật nghỉ
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const sundayIso = formatDateISO(sunday);

  const sundayRestDay: AcademicWeekDay = {
    date: sundayIso,
    shortDate: formatDateVNDayMonth(sunday),
    fullDate: formatDateVN(sunday),
    dayOfWeek: 'Chủ Nhật',
    dayShort: 'CN',
    isToday: sundayIso === todayStr,
    isRestDay: true,
  };

  return { schoolDays, sundayRestDay };
}

/**
 * Tìm tuần học theo ngày
 * Trả về tuần học tương ứng và thông báo nếu rơi vào Chủ nhật (ngày nghỉ)
 */
export function findWeekByDate(
  dateStr: string, // YYYY-MM-DD
  weeks: CompetitionWeek[]
): { week: CompetitionWeek | undefined; isSunday: boolean } {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const isSunday = dateObj.getDay() === 0;

  // Nếu là Chủ nhật, ngày này nằm giữa Thứ Bảy của tuần đó và Thứ Hai tuần sau
  if (isSunday) {
    // Trừ 1 ngày để ra Thứ Bảy của tuần đó
    const prevSat = new Date(dateObj);
    prevSat.setDate(dateObj.getDate() - 1);
    const prevSatISO = formatDateISO(prevSat);
    const week = weeks.find((w) => dateStr >= w.startDate && prevSatISO <= w.endDate);
    return { week, isSunday: true };
  }

  const week = weeks.find((w) => dateStr >= w.startDate && dateStr <= w.endDate);
  return { week, isSunday: false };
}
