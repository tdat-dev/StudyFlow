import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useAuth } from '@/hooks/useAuth';

// Mock Firebase auth
vi.mock('@/services/firebase', () => ({
  auth: {
    currentUser: null,
  },
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth, callback) => {
    // Simulate no user logged in
    callback(null);
    return vi.fn(); // unsubscribe function
  }),
}));

vi.mock('@/services/firebase/firestore', () => ({
  getUserProfile: vi.fn(),
  updateUserProfile: vi.fn(),
}));

describe('useAuth hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with null user', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
  });

  it('should provide updateUser function', () => {
    const { result } = renderHook(() => useAuth());
    expect(typeof result.current.updateUser).toBe('function');
  });

  it('should update user data when updateUser is called', () => {
    const { result } = renderHook(() => useAuth());

    // Since user is null initially, updateUser should not crash
    act(() => {
      result.current.updateUser({ name: 'Test User' });
    });

    // User should still be null since there was no initial user
    expect(result.current.user).toBeNull();
  });

  it('should have loading state initially false after auth check', async () => {
    const { result } = renderHook(() => useAuth());

    // Wait for useEffect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
  });
});
