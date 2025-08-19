## Tổng quan thư mục `src`

Thư mục `src/` chứa toàn bộ mã nguồn chính của ứng dụng StudyFlow (Next.js 14 + Firebase + Gemini AI). README này mô tả kiến trúc, dòng chảy dữ liệu, các module quan trọng và hướng dẫn mở rộng nhanh.

### Kiến trúc thư mục

- `components/`
  - `MainApp.tsx`: Shell điều hướng các tính năng (home, chat, flashcards, habits, pomodoro, profile).
  - `App.tsx`: Điểm vào React dùng trong `pages` (tích hợp auth + error handler + theme).
  - `common/layout/`: Header, Sidebar, BottomNav, Footer.
  - `features/`
    - `chat/`: Màn hình chat AI (header, input, list, message renderer Markdown, gợi ý...).
    - `flashcards/`: Màn hình flashcard, tạo thẻ bằng AI, chơi thẻ, chỉnh sửa và lưu Firestore.
    - `habits/`: Theo dõi thói quen, streak, biểu đồ.
    - `pomodoro/`: Hẹn giờ Pomodoro hiện đại.
    - `profile/`: Hồ sơ người dùng.
  - `ui/`: Bộ thành phần UI (shadcn-style), Button, Dialog, Card, Badge, v.v.

- `services/`
  - `ai/`: Lớp dịch vụ AI (Gemini) cho chat, gợi ý; xây prompt.
  - `gemini/`: Cấu hình gọi Google Generative AI (model, temp, fallback local).
  - `firebase/`: Auth + Firestore (sessions, messages, profiles, flashcard decks).
  - `fileProcessor.ts`: Xử lý file đính kèm (text, ảnh, pdf/doc placeholder), định dạng prompt và preview UI.

- `contexts/`: Các React Context cấp ứng dụng: `AuthContext`, `AppStateContext`, `LanguageContext`, `LevelContext`.
- `hooks/`: Hooks nghiệp vụ: `useAuth`, `useChat`, `useFlashcards`, `useHabits`, `usePomodoro`, `useErrorHandler`.
- `types/`: Kiểu dữ liệu dùng chung (chat, deck, habit, user...).
- `lib/`: Hằng số, util thuần (định dạng ngày/giờ, id, debounce…).
- `pages/`: Next.js pages tối thiểu (bọc App và mount `App.tsx`).

## Dòng chảy ứng dụng

1. `pages/_app.tsx` khởi tạo các Provider: Theme, Language, AppState, Auth, Level và Toaster.
2. `src/components/App.tsx` xác định màn hình theo trạng thái đăng nhập; nếu đã đăng nhập hiển thị `MainApp`.
3. `MainApp.tsx` điều hướng giữa 6 tab tính năng. `Header`/`BottomNav` hỗ trợ chuyển tab.

## Tích hợp AI (Gemini)

- Entry gọi AI cho chat: `services/ai/index.ts` (hàm `generateTutorResponse`).
- Prompt tutor: xây từ lịch sử + system trong `buildTutorPrompt`.
- Cấu hình Gemini: `services/gemini/config.ts` (model, temperature, fallback local nếu thiếu API key).

### AI cho Flashcards

- Tạo flashcards bằng AI: `components/features/flashcards/FlashcardScreen.tsx`
  - Sinh prompt động theo môn/chủ đề, ép cột Front/Example theo ngôn ngữ môn học, Back/ExampleTranslation theo tiếng Việt.
  - Thêm “danh sách loại trừ” (từ đã có trong các deck trước) để tránh trùng qua các lần tạo.
  - Parser đọc bảng (nhiều bảng nếu có), bỏ header/đường phân cách, làm sạch ký tự, chuẩn hóa `front` (lowercase, bỏ dấu tàng hình), khử trùng lặp và cắt đúng `cardCount`.
  - Trước khi lưu: khử trùng lần cuối và trimming nội dung; xáo trộn ngẫu nhiên để tăng đa dạng.

## Firebase

- `services/firebase/auth.ts`: đăng ký/đăng nhập (email, Google), reset password.
- `services/firebase/firestore.ts`:
  - Profiles: `getUserProfile`, `updateUserProfile`.
  - Chat: `getChatSessions`, `createChatSession`, `renameChatSession`, `deleteChatSession`, `getChatMessages`, `saveMessage`.
  - Flashcards: sử dụng collection `flashcard_decks` (tạo/lấy/xóa/cập nhật từ các màn hình tính năng).

Lưu ý môi trường (đặt trong `.env.local`):

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

NEXT_PUBLIC_GEMINI_API_KEY=
NEXT_PUBLIC_GEMINI_MODEL=gemini-1.5-flash
```

## Context & State

- `AuthContext`: phiên người dùng, tải profile, API đăng nhập/đăng xuất.
- `AppStateContext`: màn hình hiện tại, tab, loading-key map, bộ sưu tập deck/habit local.
- `LanguageContext`: ngôn ngữ người dùng + phát hiện từ lịch sử chat để nội địa hoá gợi ý.
- `LevelContext`: XP, level, thống kê học tập; API `addUserXP` và `updateStats`.

## Hooks chính

- `useChat(user)`: quản lý phiên chat, lưu/đọc Firestore, gọi AI, đổi tên chat tự động.
- `useFlashcards(user)`: tải/lưu deck, đánh dấu đã nhớ, (kèm một bản generate demo nội bộ nếu không có user).
- `useHabits(user)`: dữ liệu thói quen mock + hooks cập nhật.
- `usePomodoro(user)`: quản lý phiên Pomodoro, lịch sử, tính tiến độ.
- `useErrorHandler`: gom lỗi về một nơi, cấu hình toast/console.

## UI & Theming

- `components/ui`: các thành phần UI cơ bản (Button, Card, Dialog, Badge,…), có biến theme và lớp “glass surface”.
- Markdown render cho tin nhắn AI: `features/chat/MarkdownRenderer.tsx` (GFM, highlight, copy code).

## Kiểm thử & Chất lượng

- Kiểm thử: `src/__tests__/` (Vitest). Cấu hình trong `vitest.config.ts`.
- Lint: ESLint (Next core-web-vitals) + Stylelint cho CSS, Prettier cho format.

## Cách mở rộng nhanh

### Thêm tính năng mới trong `features/`

1. Tạo thư mục mới `components/features/<feature>/` với màn hình chính và subcomponents.
2. Thêm export vào `components/features/index.ts` (nếu dùng barrel).
3. Gắn vào `MainApp.tsx` (case cho tab + render màn hình) và điều hướng ở `Header`/`BottomNav`.

### Thêm API AI mới

1. Tạo hàm dịch vụ trong `services/ai/` (hoặc module con) trả về `string`/JSON parse được.
2. Nếu cần parser: đặt tại nơi sử dụng (component/hook) và đảm bảo:
   - Làm sạch ký tự markdown.
   - Chuẩn hóa và khử trùng lặp.
   - Giới hạn kích thước/đếm phần tử trước khi setState/lưu DB.

### Quy ước đặt tên & mã hoá

- TypeScript strict, tên rõ ràng (function là động từ, biến là danh từ), tránh viết tắt khó hiểu.
- Xử lý lỗi theo guard clause, hạn chế `try/catch` lồng nhau, không nuốt lỗi.

## Chạy dự án (tham khảo)

```bash
npm run dev       # Server phát triển
npm run build     # Build
npm run start     # Chạy build
npm run lint      # ESLint
npm run test:run  # Vitest
```

## Ghi chú quan trọng

- Nếu không có `NEXT_PUBLIC_GEMINI_API_KEY`, ứng dụng sẽ fallback sang phản hồi local (hiển thị thông báo thân thiện).
- Tính năng Flashcards AI đã được gia cố chống lặp (theo phiên + theo deck trước), xáo trộn kết quả và ép ngôn ngữ từng cột.
