## StudyFlow

Học thông minh với AI Tutor, Flashcards và Pomodoro. Đây là README rút gọn, tập trung vào khởi chạy và cấu hình cần thiết.

### Yêu cầu

- Node.js 18+
- Firebase + Google AI Studio (để dùng Gemini)

### Cài đặt

```bash
npm install
```

Tạo file `.env.local` và điền các biến môi trường:

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

### Chạy dev

```bash
npm run dev
```

Truy cập `http://localhost:3000`.

### Build & Deploy

```bash
npm run build      # build
npm run deploy     # export + Firebase Hosting
```

### Tài liệu mã nguồn

- Xem chi tiết kiến trúc và hướng dẫn mở rộng tại `src/README.md`.

### Gợi ý commit

- Commit message bằng tiếng Việt theo Conventional Commits: `feat: …`, `fix: …`, `docs: …`.
