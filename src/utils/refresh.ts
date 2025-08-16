// Utility function để refresh hoàn toàn ứng dụng
export const hardRefresh = () => {
  try {
    // 1. Clear tất cả localStorage
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }

    // 2. Clear tất cả sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }

    // 3. Clear tất cả cookies
    if (typeof document !== 'undefined') {
      document.cookie.split(';').forEach(c => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });
    }

    // 4. Clear browser cache bằng service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
        });
      });
    }

    // 5. Clear cache storage
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }

    // 6. Force reload trang với bypass cache
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  } catch (error) {
    console.error('Lỗi khi refresh:', error);
    // Fallback: reload bình thường
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }
};

// Soft refresh - chỉ reload trang
export const softRefresh = () => {
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
};

// Clear specific storage
export const clearAppStorage = () => {
  try {
    if (typeof window !== 'undefined') {
      // Clear app-specific keys
      const keysToRemove = [
        'auth-token',
        'user-data',
        'chat-history',
        'app-state',
        'theme-preference',
      ];

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
    }
  } catch (error) {
    console.error('Lỗi khi clear storage:', error);
  }
};
