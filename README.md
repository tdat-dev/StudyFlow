## StudyFlow – AI-Powered Study Companion (Next.js + Firebase)

StudyFlow is a production-grade web app that helps learners practice and track their progress with an AI tutor, flashcards, habit tracking, and a Pomodoro timer. It supports rich file understanding (images, PDF, Word, Excel/CSV, code/HTML) powered by Google Gemini.

### Highlights

- AI Tutor (Gemini) with file analysis and downloads
- Flashcards with progress tracking
- Habits and Pomodoro integrated into daily learning
- Firebase Auth (Email/Password + Google), Firestore, Hosting
- TypeScript strict, TailwindCSS, accessible dark UI

---

### Table of Contents

- Overview
- Architecture & Tech Stack
- Project Structure
- Features
- Firestore Data Model
- Environment Variables
- Local Development
- Testing & Quality
- Build & Deployment
- Security & Privacy
- Troubleshooting
- Roadmap
- Contributing
- License

---

### Overview

StudyFlow provides a unified learning experience: converse with an AI tutor, upload files for AI analysis, practice flashcards, track habits, and stay focused using Pomodoro.

---

### Architecture & Tech Stack

- Next.js 14, React 18, TypeScript
- TailwindCSS, design tokens, dark theme
- Firebase: Auth, Firestore, Hosting
- Google Gemini API for chat, file/image analysis
- ESLint + Prettier, Vitest + React Testing Library

---

### Project Structure

```
src/
  components/
    ui/            # Reusable UI
    features/      # Feature modules (auth, chat, flashcards, habits, pomodoro, profile)
  contexts/        # React Context providers
  hooks/           # Custom hooks
  services/        # Firebase, AI, file processing
  types/           # Global TS types
  utils/           # Helpers
  styles/          # CSS and theme
pages/             # Next.js pages
public/            # Static assets
```

---

### Features

1. AI Chat Tutor
   - Drag & drop uploads, file previews
   - Image analysis (Vision), PDF/Word/Excel parsing, code/HTML review
   - Download AI-generated code/text as files

2. Authentication
   - Firebase Auth (Email/Password, Google)
   - Protected routes and global `AuthContext`

3. Flashcards, Habits, Pomodoro, Profile & Dashboard

---

### Firestore Data Model

- `profiles` – user profiles and settings
- `flashcard_decks` – decks and cards
- `habits` – user habits and streaks
- `progress` – daily progress tracking

Indexes: `firestore.indexes.json` · Rules: `firestore.rules`

---

### Environment Variables (.env.local)

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Gemini
NEXT_PUBLIC_GEMINI_API_KEY=
```

See `GEMINI_SETUP_GUIDE.md` for setup details and best practices.

---

### Local Development

```bash
npm install
npm run dev   # http://localhost:3000
```

Common scripts:

```bash
npm run build
npm run start
npm run lint
npm run test
```

---

### Testing & Quality

- Vitest + React Testing Library under `src/__tests__/`
- ESLint + Prettier

```bash
npm run test
npm run lint
```

---

### Build & Deployment (Firebase Hosting)

```bash
npm run build
firebase login
firebase emulators:start   # optional preview
firebase deploy
```

---

### Security & Privacy

- Role-based Firestore security rules
- Secrets via environment variables
- HTTPS in production
- Client-side validation + Firestore rules

---

### Troubleshooting

- Image analysis not working → set `NEXT_PUBLIC_GEMINI_API_KEY` and restart dev server
- PDF/Word/Excel parsing → ensure `pdfjs-dist`, `mammoth`, `xlsx` are installed
- Send button disabled with file only → fixed (enabled for text OR file)
- Message not cleared after sending → fixed (ChatInput clears text + file)

---

### Roadmap

- Advanced PowerPoint reading
- Batch file processing & multi-file context
- Enhanced OCR and diagram reasoning
- Cloud storage & versioning

---

### Contributing

PRs and issues are welcome. Follow strict TypeScript, functional components, ESLint + Prettier, no inline styles.

---

### License

MIT (to be added).
