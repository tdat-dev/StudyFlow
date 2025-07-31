import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Kết hợp các class name từ clsx và tailwind-merge
 * @param inputs Danh sách các class name
 * @returns Class name đã được xử lý
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format thời gian từ chuỗi ISO
 * @param dateString Chuỗi thời gian dạng ISO
 * @returns Chuỗi thời gian đã được format
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

/**
 * Tạo ID duy nhất
 * @returns Chuỗi ID duy nhất
 */
export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Trì hoãn thực thi
 * @param ms Thời gian trì hoãn (milliseconds)
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Tạo mảng từ khoảng số
 * @param start Số bắt đầu
 * @param end Số kết thúc
 * @returns Mảng các số từ start đến end
 */
export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Lấy ngày trong tuần
 * @param index Chỉ số ngày (0-6)
 * @returns Tên ngày
 */
export function getDayLabel(index: number): string {
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return days[index % 7];
}

/**
 * Cắt ngắn chuỗi
 * @param text Chuỗi cần cắt
 * @param maxLength Độ dài tối đa
 * @returns Chuỗi đã cắt
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}