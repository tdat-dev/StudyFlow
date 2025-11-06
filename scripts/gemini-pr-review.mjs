/*
  Gemini PR Reviewer
  - Lấy danh sách file thay đổi trong PR
  - Gửi diff đến Gemini để review theo luật StudyFlow
  - Đăng bình luận tổng hợp lên PR
*/

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const REPO = process.env.REPO; // e.g. owner/name
const PR_NUMBER = process.env.PR_NUMBER;

if (!GITHUB_TOKEN || !GEMINI_API_KEY || !REPO || !PR_NUMBER) {
  console.error('Missing envs: GITHUB_TOKEN, GEMINI_API_KEY, REPO, PR_NUMBER');
  process.exit(1);
}

const [owner, repo] = REPO.split('/');

async function getChangedFiles() {
  const files = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${PR_NUMBER}/files?per_page=100&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
    );
    if (!res.ok) throw new Error(`GitHub files API ${res.status}`);
    const data = await res.json();
    files.push(...data);
    if (data.length < 100) break;
    page += 1;
  }
  return files;
}

function buildPrompt(diffText) {
  return `Bạn là reviewer AI (Gemini) cho dự án StudyFlow (Next.js 14 + React 18 + TS, Tailwind, Firebase). Hãy review phần diff sau và đưa nhận xét NGẮN GỌN bằng tiếng Việt, theo bullets:

- Vấn đề (bảo mật, hiệu năng, a11y, code smell)
- Rủi ro & tác động
- Cách sửa cụ thể: đường dẫn + gợi ý code ngắn (nếu cần)

Các quy chuẩn bắt buộc:
- Không dùng any, không inline style; Tailwind + tokens; dark mode
- Zod cho input mới; a11y cho icon/button
- Không console.log trong production; tách logic khỏi UI
- Tuân file rules pomodoro/habits; types trong src/types

Chỉ review các thay đổi, đừng nhắc lại code cũ.

---- DIFF ----\n${diffText}`;
}

async function callGemini(prompt) {
  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      topK: 32,
      topP: 0.9,
      maxOutputTokens: 3000,
    },
  };

  const res = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' +
      GEMINI_API_KEY,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) throw new Error(`Gemini API ${res.status}`);
  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    'Không có phản hồi từ Gemini.';
  return text;
}

async function postComment(body) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues/${PR_NUMBER}/comments`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ body }),
    },
  );
  if (!res.ok) throw new Error(`GitHub comment API ${res.status}`);
}

(async () => {
  try {
    const files = await getChangedFiles();
    if (!files.length) {
      await postComment(
        'AI Review (Gemini): Không thấy thay đổi nào trong PR.',
      );
      return;
    }

    // Gom diff (patch); cắt bớt để không quá dài
    const MAX_CHARS = 60_000; // đủ cho flash
    let diff = '';
    for (const f of files) {
      if (!f.patch) continue;
      diff += `\n### ${f.filename}\n${f.patch}\n`;
      if (diff.length > MAX_CHARS) break;
    }

    const prompt = buildPrompt(diff);
    const review = await callGemini(prompt);
    await postComment(`## AI Review (Gemini)\n\n${review}`);
    console.log('Posted Gemini review comment.');
  } catch (e) {
    console.error('Gemini review failed:', e);
    // Đăng lỗi lên PR để dễ theo dõi
    try {
      await postComment(`AI Review (Gemini) gặp lỗi: ${String(e)}`);
    } catch {}
    process.exit(1);
  }
})();
