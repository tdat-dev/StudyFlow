/**
 * Các tiện ích xử lý ngày theo múi giờ IANA.
 * Không dùng thư viện ngoài để giữ gọn nhẹ.
 */

/** Lấy time zone của người dùng theo IANA, ví dụ: 'Asia/Ho_Chi_Minh' */
export function getUserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/** Tạo Date mới đã chuyển đổi theo múi giờ (cùng thời điểm cục bộ ở tz) */
function toTimeZoneLocalDate(date: Date, timeZone: string): Date {
  // Biến đổi thành chuỗi theo tz rồi parse lại về Date (giờ địa phương của tz)
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, p) => {
      if (p.type !== 'literal') acc[p.type] = p.value;
      return acc;
    }, {});

  const y = Number(parts.year);
  const m = Number(parts.month) - 1; // 0-indexed
  const d = Number(parts.day);
  const hh = Number(parts.hour || '0');
  const mm = Number(parts.minute || '0');
  const ss = Number(parts.second || '0');
  return new Date(y, m, d, hh, mm, ss);
}

/** So sánh cùng ngày theo lịch (Y-M-D) trong một múi giờ cho hai Date */
export function isSameCalendarDay(a: Date, b: Date, timeZone: string): boolean {
  const aa = toTimeZoneLocalDate(a, timeZone);
  const bb = toTimeZoneLocalDate(b, timeZone);
  return (
    aa.getFullYear() === bb.getFullYear() &&
    aa.getMonth() === bb.getMonth() &&
    aa.getDate() === bb.getDate()
  );
}

/** Lấy thứ trong tuần (0=Thứ 2, ... 6=Chủ nhật) theo tz */
export function getWeekdayIndexMondayFirst(
  date: Date,
  timeZone: string,
): number {
  const local = toTimeZoneLocalDate(date, timeZone);
  // JS getDay: 0=CN..6=Th7 → chuyển về 0=Th2..6=CN
  return (local.getDay() + 6) % 7;
}

/** Lấy ngày trong tháng theo chỉ số 0-based (0..30) theo tz */
export function getMonthDayIndexZeroBased(
  date: Date,
  timeZone: string,
): number {
  const local = toTimeZoneLocalDate(date, timeZone);
  return Math.max(0, local.getDate() - 1);
}

/** Chuẩn hoá ngày (yyyy-mm-dd) theo tz để lưu/so sánh nếu cần */
export function formatDateYMD(date: Date, timeZone: string): string {
  const local = toTimeZoneLocalDate(date, timeZone);
  const y = local.getFullYear();
  const m = String(local.getMonth() + 1).padStart(2, '0');
  const d = String(local.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
