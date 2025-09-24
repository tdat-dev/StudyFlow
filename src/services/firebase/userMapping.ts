import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './config';

// Lưu mapping username -> email khi đăng ký
export async function saveUsernameMapping(
  username: string,
  email: string,
): Promise<void> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), 10000);
    });

    const setPromise = setDoc(doc(db, 'username_mappings', username), {
      email: email,
      createdAt: new Date(),
    });

    await Promise.race([setPromise, timeoutPromise]);
  } catch (error) {
    console.error('Error saving username mapping:', error);
    throw error;
  }
}

// Lấy email từ username
export async function getEmailFromUsername(
  username: string,
): Promise<string | null> {
  try {
    const docRef = doc(db, 'username_mappings', username);

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), 10000);
    });

    const getPromise = getDoc(docRef);
    const docSnap = await Promise.race([getPromise, timeoutPromise]);

    if (docSnap.exists()) {
      return docSnap.data().email;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting email from username:', error);
    throw error;
  }
}
