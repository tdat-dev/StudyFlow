import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Vitest compatibility alias for Jest APIs used in tests
// Map jest.* to vi.* so existing mocks continue to work
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const jest = vi as any;
// Also expose on global for libraries referencing globalThis.jest
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).jest = jest;

// Global Firebase mocks to avoid accessing real SDK in tests
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn((_auth, callback: (user: unknown) => void) => {
    callback(null);
    return vi.fn();
  }),
  GoogleAuthProvider: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
}));

// Mock Firebase
jest.mock('@/services/firebase/client', () => ({
  auth: {},
  db: {},
}));

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
