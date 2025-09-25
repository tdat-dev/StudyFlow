import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Vitest compatibility alias for Jest APIs used trong tests
const jest: typeof vi = vi;
// Expose trên global để các thư viện tìm thấy
(globalThis as unknown as { jest?: typeof vi }).jest = jest;

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
  value: jest.fn().mockImplementation((query: string) => ({
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
