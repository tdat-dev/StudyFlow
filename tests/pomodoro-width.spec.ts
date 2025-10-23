import { test, expect } from '@playwright/test';

test('phần text nhiệm vụ pomodoro có max-width mở rộng', async ({ page }) => {
  await page.setContent(`
    <html>
      <head>
        <meta charset="utf-8" />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-white p-4">
        <div class="max-w-screen-sm mx-auto">
          <div
            id="task-text"
            class="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 max-w-2xl w-full mx-auto break-words"
          >
            Đây là nội dung nhiệm vụ dài để xác nhận rằng phần hiển thị đã đủ rộng và không bị cắt chữ khi đặt giới hạn max-w-2xl.
          </div>
        </div>
      </body>
    </html>
  `);

  const computedMaxWidth = await page
    .locator('#task-text')
    .evaluate(element => getComputedStyle(element).maxWidth);

  await expect.soft(computedMaxWidth).toBe('672px');

  const boundingBox = await page.locator('#task-text').boundingBox();
  expect(boundingBox?.width ?? 0).toBeGreaterThanOrEqual(400);
});
