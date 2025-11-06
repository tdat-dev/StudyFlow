import { test, expect } from '@playwright/test';

test.describe('Flashcards - Đánh dấu đã thuộc / chưa thuộc', () => {
  test('đánh dấu thẻ và xác nhận không lỗi', async ({ page }) => {
    // Mở trang chủ
    await page.goto('/');

    // Chờ người dùng đăng nhập (tối đa 120s) để BottomNav xuất hiện
    const bottomNav = page.getByRole('navigation', { name: /Bottom navigation/i });
    await expect(bottomNav).toBeVisible({ timeout: 120_000 });

    // Điều hướng tới Flashcards
    await bottomNav.getByRole('button', { name: 'Flashcards' }).click();

    // Nếu chưa có deck: tạo deck mới thủ công với 2 thẻ tối thiểu
    const emptyState = page.getByText('Chưa có flashcard nào');
    if (await emptyState.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.getByRole('button', { name: 'Tạo thủ công' }).click();
      // Nhập nhanh tiêu đề/subject/topic để có thể lưu
      await page.getByLabel('Môn học').fill('Tiếng Anh');
      await page.getByLabel('Chủ đề').fill('Từ vựng cơ bản');
      await page.getByLabel('Tiêu đề').fill('Deck e2e');
      // Mặc định đã có 1 thẻ, thêm thẻ nữa
      await page.getByRole('button', { name: /Thêm thẻ mới/i }).click();
      // Lưu deck
      await page.getByRole('button', { name: /Lưu bộ thẻ/i }).click();
    }

    // Vào deck đầu tiên và bắt đầu học
    const startButtons = page.getByRole('button', { name: /Bắt đầu học|Chưa có thẻ/ });
    await startButtons.first().click();

    // Xác nhận đang ở player (có tiến độ 1/ N). UI không có khoảng trắng quanh "/"
    await expect(page.getByText(/\d+\/\d+/)).toBeVisible({ timeout: 15000 });

    // Bấm Đã thuộc -> xác nhận trong dialog -> không lỗi
    const learnedBtn = page.getByRole('button', { name: /Đã thuộc/i });
    await learnedBtn.click();
    // Dialog xác nhận
    const confirm = page.getByRole('button', { name: /Xác nhận/i });
    await confirm.click();

    // Đi đến thẻ tiếp theo (tiến độ đổi)
    await expect(page.getByText(/\d+ \/ \d+/)).toBeVisible();

    // Bấm Chưa thuộc -> xác nhận
    const notLearnedBtn = page.getByRole('button', { name: /Chưa thuộc/i });
    await notLearnedBtn.click();
    await confirm.click();

    // Không crash, vẫn thấy tiến độ
    await expect(page.getByText(/\d+ \/ \d+/)).toBeVisible();
  });
});


