import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth } from './config';
import { saveUsernameMapping, getEmailFromUsername } from './userMapping';

// Đăng ký tài khoản mới bằng email và mật khẩu
export async function registerWithEmail(
  email: string,
  password: string,
  username: string,
): Promise<any> {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    // Cập nhật tên hiển thị với username
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: username,
      });

      // Lưu mapping username -> email
      await saveUsernameMapping(username, email);
    }

    return userCredential.user;
  } catch (error) {
    console.error('Error registering with email:', error);
    throw error;
  }
}

// Đăng nhập bằng email/username và mật khẩu
export async function loginWithEmail(
  loginInput: string,
  password: string,
): Promise<any> {
  try {
    // Validate input
    if (!loginInput || !password) {
      throw new Error('auth/invalid-credential');
    }

    // Trim whitespace
    const trimmedInput = loginInput.trim();
    const trimmedPassword = password.trim();

    if (!trimmedInput || !trimmedPassword) {
      throw new Error('auth/invalid-credential');
    }

    // Kiểm tra xem input có phải là email không (chứa @)
    const isEmail = trimmedInput.includes('@');

    if (isEmail) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedInput)) {
        throw new Error('auth/invalid-email');
      }

      // Nếu là email, đăng nhập trực tiếp
      const userCredential = await signInWithEmailAndPassword(
        auth,
        trimmedInput,
        trimmedPassword,
      );
      return userCredential.user;
    } else {
      // Validate username format
      if (trimmedInput.length < 3) {
        throw new Error('auth/invalid-credential');
      }

      // Nếu là username, tìm email tương ứng
      const email = await getEmailFromUsername(trimmedInput);

      if (!email) {
        throw new Error('auth/user-not-found');
      }

      // Đăng nhập bằng email tìm được
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        trimmedPassword,
      );
      return userCredential.user;
    }
  } catch (error: any) {
    console.error('Error logging in with email/username:', error);

    // Map Firebase error codes to user-friendly messages
    if (error.code === 'auth/invalid-credential') {
      throw new Error('auth/invalid-credential');
    } else if (error.code === 'auth/user-not-found') {
      throw new Error('auth/user-not-found');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('auth/invalid-credential');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('auth/invalid-email');
    } else if (error.code === 'auth/user-disabled') {
      throw new Error('auth/user-disabled');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('auth/too-many-requests');
    } else {
      throw error;
    }
  }
}

// Đăng nhập bằng Google
export async function loginWithGoogle(): Promise<any> {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in with Google:', error);
    throw error;
  }
}

// Đăng xuất
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// Gửi email đặt lại mật khẩu
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}
