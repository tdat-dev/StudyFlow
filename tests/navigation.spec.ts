import { test, expect } from '@playwright/test';

test.describe('Navigation - Bottom Nav', () => {
  test('có thể chuyển giữa các tab chính', async ({ page }) => {
    await page.goto('/');
    // chờ Bottom navigation render
    const bottomNav = page.getByRole('navigation', { name: /Bottom navigation/i });
    await expect(bottomNav).toBeVisible();
    await expect(bottomNav.getByRole('button', { name: 'Trang chủ' })).toBeVisible();

    // Mở Pomodoro
    await bottomNav.getByRole('button', { name: 'Pomodoro' }).click();
    // Kiểm tra timer hiển thị (format MM:SS)
    await expect(page.getByText(/\d{2}:\d{2}/)).toBeVisible({ timeout: 3000 });

    // Mở Thói quen
    await bottomNav.getByRole('button', { name: 'Thói quen' }).click();
    await expect(page.getByRole('heading', { name: /Thói quen|Habit/i })).toBeVisible({ timeout: 3000 });

    // Mở Flashcards
    await bottomNav.getByRole('button', { name: 'Flashcards' }).click();
    await expect(page.getByText(/Flashcard|Bộ thẻ/i)).toBeVisible({ timeout: 3000 });
  });
});


