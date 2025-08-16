# StudyFlow - Smart Learning Platform

> **Học thông minh với AI, Flashcards & Pomodoro Timer**

StudyFlow là một ứng dụng học tập toàn diện với AI Tutor đa môn học. Ứng dụng hỗ trợ học tập từ tiểu học đến đại học với AI tutoring, flashcards thông minh, Pomodoro timer và theo dõi thói quen học tập.

## ✨ Tính Năng Chính

### 🤖 StudyFlow AI Tutor

- Chat với AI tutor thông minh 24/7 hỗ trợ TẤT CẢ các môn học
- Phản hồi cá nhân hóa cho toán học, khoa học, tiếng Anh, lịch sử...
- Tạo flashcards tự động từ AI cho mọi chủ đề
- Giải bài tập từng bước chi tiết và giải thích khái niệm

### 📚 Smart Flashcards

- Tạo và quản lý bộ thẻ học cho mọi môn học
- Hệ thống spaced repetition thông minh
- Tích hợp AI để tạo thẻ tự động từ toán, khoa học, ngôn ngữ...
- Theo dõi tiến độ học tập chi tiết

### ⏰ Pomodoro Timer

- Timer tập trung với kỹ thuật Pomodoro
- Quản lý task và theo dõi thời gian
- Thống kê hiệu suất học tập
- Tích hợp với hệ thống điểm thưởng

### 📈 Habit Tracker

- Theo dõi thói quen học tập hàng ngày
- Streak counter và motivation
- Báo cáo tiến độ chi tiết
- Gamification với level và XP

### 👤 Profile & Progress

- Dashboard cá nhân hóa
- Thống kê toàn diện
- Cài đặt mục tiêu và theo dõi
- Hệ thống level và achievement

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Firebase (Auth, Firestore)
- **AI Integration**: Google Gemini AI
- **State Management**: React Context + Hooks
- **Build Tool**: Next.js Static Export

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm hoặc yarn
- Firebase account
- Google AI Studio account

### Installation

1. **Clone repository**

```bash
git clone https://github.com/tdat-dev/studyflow.git
cd studyflow
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**

```bash
cp .env.example .env.local
```

Cập nhật `.env.local` với Firebase và Gemini API keys:

```bash
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

4. **Run development server**

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## 📱 Build & Deploy

### Static Export

```bash
npm run build
```

### Firebase Hosting

```bash
npm run deploy
```

## 🏗 Project Structure

```
src/
├── components/          # React components
│   ├── features/       # Feature-based components
│   ├── common/         # Shared components
│   ├── ui/            # UI components (buttons, cards, etc.)
│   └── screens/       # Screen components
├── services/           # External services
│   ├── firebase/      # Firebase integration
│   ├── ai/           # AI service integration
│   └── gemini/       # Gemini AI specific
├── hooks/             # Custom React hooks
├── contexts/          # React contexts
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── lib/              # Configuration & constants
```

## 🔧 Development

### Code Standards

- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Component-driven development

### Testing

```bash
npm run test           # Run tests
npm run test:coverage  # Coverage report
```

### Linting & Formatting

```bash
npm run lint          # Check linting
npm run lint:fix      # Fix linting issues
npm run format        # Format code
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: [@tdat-dev](https://github.com/tdat-dev)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Firebase](https://firebase.google.com/) - Backend services
- [Google AI](https://ai.google.dev/) - Gemini AI integration
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Radix UI](https://www.radix-ui.com/) - UI components

---

**StudyFlow** - Học thông minh, tiến bộ mỗi ngày! 🚀
