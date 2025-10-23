# 🔥 Firebase Debug Guide - StudyFlow

## Lỗi `auth/invalid-credential` - Hướng dẫn khắc phục

### 1. Kiểm tra Environment Variables

Đảm bảo file `.env.local` có đầy đủ các biến môi trường:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 2. Kiểm tra Firebase Console

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn
3. Vào **Authentication** > **Sign-in method**
4. Đảm bảo **Email/Password** đã được bật
5. Kiểm tra **Authorized domains** có chứa domain của bạn

### 3. Kiểm tra Browser Console

Mở Developer Tools (F12) và kiểm tra:

```javascript
// Kiểm tra Firebase có được khởi tạo không
console.log('Firebase app:', window.firebase);
console.log('Auth instance:', window.firebase?.auth());

// Kiểm tra environment variables
console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
```

### 4. Test Authentication

Thử đăng nhập với tài khoản test:

```javascript
// Test trong browser console
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './src/services/firebase/config';

signInWithEmailAndPassword(auth, 'test@example.com', 'password123')
  .then(userCredential => {
    console.log('Login successful:', userCredential.user);
  })
  .catch(error => {
    console.error('Login failed:', error);
  });
```

### 5. Các lỗi thường gặp và cách khắc phục

#### `auth/invalid-credential`

- **Nguyên nhân**: Email/password không đúng hoặc tài khoản không tồn tại
- **Khắc phục**: Kiểm tra lại thông tin đăng nhập

#### `auth/user-not-found`

- **Nguyên nhân**: Tài khoản không tồn tại
- **Khắc phục**: Đăng ký tài khoản mới hoặc kiểm tra email

#### `auth/wrong-password`

- **Nguyên nhân**: Mật khẩu không đúng
- **Khắc phục**: Sử dụng tính năng "Quên mật khẩu"

#### `auth/too-many-requests`

- **Nguyên nhân**: Quá nhiều lần thử đăng nhập
- **Khắc phục**: Đợi vài phút rồi thử lại

#### `auth/user-disabled`

- **Nguyên nhân**: Tài khoản bị vô hiệu hóa
- **Khắc phục**: Liên hệ admin để kích hoạt lại

### 6. Debug Steps

1. **Kiểm tra Network Tab**: Xem có request nào fail không
2. **Kiểm tra Console**: Xem có error nào không
3. **Test với Firebase Console**: Thử đăng nhập trực tiếp trên Firebase Console
4. **Kiểm tra Firestore Rules**: Đảm bảo rules cho phép đọc/ghi

### 7. Common Solutions

#### Solution 1: Reset Environment Variables

```bash
# Xóa .env.local và tạo lại
rm .env.local
# Copy từ Firebase Console và paste vào .env.local
```

#### Solution 2: Clear Browser Cache

```bash
# Clear browser cache và cookies
# Hoặc sử dụng incognito mode
```

#### Solution 3: Check Firebase Project Settings

1. Vào Firebase Console
2. Project Settings > General
3. Kiểm tra **Web apps** section
4. Đảm bảo config đúng

### 8. Test Commands

```bash
# Kiểm tra build
npm run build

# Kiểm tra type checking
npm run type-check

# Kiểm tra linting
npm run lint

# Chạy development server
npm run dev
```

### 9. Contact Support

Nếu vẫn gặp vấn đề:

1. Kiểm tra [Firebase Documentation](https://firebase.google.com/docs/auth/web/start)
2. Tạo issue trên GitHub với thông tin:
   - Error message đầy đủ
   - Steps to reproduce
   - Browser version
   - Firebase project ID (ẩn sensitive info)

---

**Lưu ý**: Không bao giờ commit file `.env.local` vào Git!
