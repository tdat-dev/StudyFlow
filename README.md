## StudyFlow

Ứng dụng học tập thông minh kết hợp AI Tutor, Flashcards và Pomodoro, giúp bạn học nhanh – nhớ lâu – luyện tập đều đặn mỗi ngày.

### Điểm nổi bật của ứng dụng

- **AI Tutor (tiếng Việt thân thiện)**: Hỏi đáp đa môn học, giải thích từng bước, gợi ý bài tập và ví dụ thực tế.
- **Flashcards tạo bằng AI**: Sinh thẻ theo môn/chủ đề, có ví dụ và bản dịch; lọc trùng, đa dạng từ vựng và hỗ trợ nhiều ngôn ngữ mặt trước.
- **Luyện tập & theo dõi tiến độ**: Học thẻ, đánh dấu đã nhớ, đếm tổng số từ đã học, streak ngày học.
- **Pomodoro hiện đại**: Tập trung theo phiên, tự động ghi nhận thời gian học.
- **Habit tracker**: Tạo, theo dõi, hoàn thành thói quen học mỗi ngày.
- **Giao diện đẹp, responsive, dark mode**: Dùng tốt trên desktop và mobile.

### Công nghệ & kiến trúc

- **Frontend**: Next.js 14, React 18, Tailwind CSS, shadcn/ui, Lucide Icons.
- **AI**: Google Gemini (qua Google AI Studio).
- **Backend-as-a-Service**: Firebase Auth + Firestore + Firebase Hosting.
- **Cấu trúc mã**: Tổ chức theo tính năng (`src/components/features/*`), services riêng (`src/services/*`), context/hooks dùng lại.
- **Xuất tĩnh**: Cấu hình `next.config.js` dùng `output: 'export'` để deploy Firebase Hosting.

### Bắt đầu nhanh

Yêu cầu: Node.js 18+, tài khoản Firebase, khóa API Gemini.

1. Cài phụ thuộc

```bash
npm install
```

2. Tạo file `.env.local` và điền biến môi trường:

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=
NEXT_PUBLIC_GEMINI_MODEL=gemini-1.5-flash
```

3. Chạy dev

```bash
npm run dev
```

Mở `http://localhost:3000` để truy cập ứng dụng.

4. Build & Deploy (Firebase Hosting)

```bash
npm run build      # build
npm run deploy     # export + deploy hosting
```

### Tài liệu thêm

- Kiến trúc, luồng dữ liệu và hướng dẫn mở rộng: `src/README.md`.
- Attributions: `Attributions.md`.

### Quy ước commit (gợi ý)

- Luôn dùng tiếng Việt theo Conventional Commits: `feat: …`, `fix: …`, `docs: …`.
