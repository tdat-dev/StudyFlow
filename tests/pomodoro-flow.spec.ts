import { test, expect } from '@playwright/test';

test.describe('Pomodoro - Flow cơ bản', () => {
  test('bắt đầu, tạm dừng, reset và bỏ qua', async ({ page }) => {
    // Clear localStorage để đảm bảo dùng default settings
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('pomodoro-settings');
    });

    const bottomNav = page.getByRole('navigation', { name: /Bottom navigation/i });
    await expect(bottomNav).toBeVisible();
    await bottomNav.getByRole('button', { name: 'Pomodoro' }).click();

    // Đồng hồ hiển thị với default time (25:00)
    await expect(page.getByText(/25:00/)).toBeVisible();

    // Bắt đầu
    await page.getByRole('button', { name: /Bắt đầu/i }).click();
    await page.waitForTimeout(1500);

    // Tạm dừng
    await page.getByRole('button', { name: /Tạm dừng|Pause/i }).click();

    // Reset
    await page.getByRole('button', { name: /Reset/i }).click();
    await expect(page.getByText(/25:00/)).toBeVisible();

    // Bỏ qua (khi chưa chạy sẽ disabled)
    const skip = page.getByRole('button', { name: /Bỏ qua|Skip/i });
    await expect(skip).toBeVisible();
  });
});


