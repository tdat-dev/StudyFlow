# AI Coding Agent Instructions for Vietnamese English Learning App

Luôn luôn nhắn tin tiếng việt

## Architecture Overview

This is a Next.js 14 learning app with Firebase backend and Gemini AI integration. The app uses a feature-based architecture with responsive design (desktop sidebar + mobile bottom nav).

### Key Components

- **MainApp** (`src/components/MainApp.tsx`): Root layout with tab switching between 6 features
- **Features** (`src/components/features/`): Home dashboard, AI tutor chat, flashcards, habits tracker, pomodoro timer, profile
- **Layout** (`src/components/common/layout/`): Header, Sidebar (desktop), BottomNav (mobile), Footer
- **Services** (`src/services/`): Firebase (auth/firestore), Gemini AI, utility functions

## Development Patterns

### Component Structure

```
src/components/
├── features/[feature]/     # Feature screens + subcomponents
├── common/layout/          # Responsive navigation components
├── ui/                     # shadcn/ui style components (Button, Dialog, etc.)
└── screens/                # Auth screens (Welcome, Login, Register)
```

### Service Layer

- **Firebase**: `src/services/firebase/` - Auth, Firestore operations for chat/flashcards/user data
- **Gemini AI**: `src/services/ai/tutor.ts` - Chat responses with Vietnamese tutor personality
- **Types**: `src/types/` - TypeScript interfaces for chat, flashcards, user data

### State Management

- React Context providers in `pages/_app.tsx`: AuthProvider, AppStateProvider, ThemeProvider
- Local state with hooks: `src/hooks/useAuth.ts`, `useChat.ts`, etc.
- Firebase real-time subscriptions for user profiles and chat sessions

## Critical Environment Setup

### Required Environment Variables (.env.local)

```bash
# Firebase config (from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Gemini AI (from Google AI Studio)
NEXT_PUBLIC_GEMINI_API_KEY=
NEXT_PUBLIC_GEMINI_MODEL=gemini-1.5-flash
```

### Build & Deploy Commands

```bash
npm run dev              # Development server
npm run build            # Static export to out/
npm run deploy           # Build + Firebase Hosting deploy
firebase emulators:start # Local Firebase development
```

## Code Conventions

### Import Patterns

- Use default imports for UI components: `import Button from '../ui/button'`
- Import services directly: `import { generateTutorResponse } from '../services/ai/tutor'`
- Barrel exports in feature directories: `src/components/features/[feature]/index.ts`

### Responsive Design

- Desktop: Sidebar navigation, full Header
- Mobile: BottomNav (fixed bottom), content padding `pb-16 md:pb-0`
- Breakpoint: `md:` (768px+) for desktop layout

### Firebase Integration

- Authentication: Google Sign-in, Firebase Auth with `onAuthStateChanged`
- Firestore collections: `chat_sessions`, `flashcard_decks`, `user_profiles`
- Real-time updates using Firebase subscriptions in `useEffect` with cleanup

### AI Integration

- Gemini responses via `generateTutorResponse(message, chatHistory)`
- Vietnamese-first prompts in `src/services/ai/prompts.ts`
- Graceful fallback when API key missing or API fails
- Chat history passed as `ChatTurn[]` with roles 'user'|'model'

## Chat Feature Architecture

### Layout System

- **ChatScreen** main component with adaptive layout:
  - EmptyState centered when no messages
  - Input area positioned contextually (center for new chat, bottom for existing)
  - Sidebar toggle with desktop/mobile responsive behavior
- **Smart sidebar toggle**: `handleToggleSidebar()` detects screen size (1024px breakpoint)
- **File attachment support**: Preview above input with drag-drop interface

### Chat State Management

- Session management via `currentChatId` and `chatSessions[]`
- Auto-scroll to bottom with `messagesEndRef` and `scrollToBottom()`
- Loading states for typing indicator and session operations
- File attachment state with preview and removal

### CSS Architecture

Use predefined design tokens from `styles/theme-tokens.css`:

- `.glass-surface` for headers/footers with backdrop blur
- `.chat-bubble-user` / `.chat-bubble-ai` for message styling
- `.chat-container` for main layout with proper scrolling
- `.tint-[color]` classes for icon accents

### Input Component Pattern

- Simple textarea instead of contentEditable for reliability
- Auto-resize with `autoResize()` function
- `dir="ltr"` to prevent text direction issues
- Proper padding/alignment: `py-3 px-2 leading-relaxed`

## Fast Refresh Best Practices

- Use `useCallback` for async functions in `useEffect` dependencies
- Single default export per component file
- Move helper functions to separate utility files
- Avoid multiple exports from UI component files

## Common Debugging

- Check Firebase console for auth/database issues
- Verify environment variables are prefixed with `NEXT_PUBLIC_`
- Use browser dev tools Network tab for API call failures
- Fast Refresh issues: check ESLint errors for export patterns
