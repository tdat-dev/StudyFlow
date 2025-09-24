import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './config';

// Lấy thông tin profile người dùng
export async function getUserProfile(userId: string): Promise<any> {
  try {
    const profileRef = doc(db, 'user_profiles', userId);

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), 10000);
    });

    const profilePromise = getDoc(profileRef);
    const profileDoc = await Promise.race([profilePromise, timeoutPromise]);

    if (profileDoc.exists()) {
      return {
        profile: { id: profileDoc.id, ...profileDoc.data() },
        error: null,
      };
    } else {
      return { profile: null, error: null };
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { profile: null, error };
  }
}

// Cập nhật thông tin profile người dùng
export async function updateUserProfile(
  userId: string,
  profileData: any,
): Promise<any> {
  try {
    const profileRef = doc(db, 'user_profiles', userId);

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), 10000);
    });

    const updatePromise = updateDoc(profileRef, {
      ...profileData,
      updatedAt: new Date().toISOString(),
    });

    await Promise.race([updatePromise, timeoutPromise]);

    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error };
  }
}

// Cập nhật tiến độ học tập của người dùng
export async function updateUserProgress(
  userId: string,
  progress: { wordsLearned: number; studyTime: number },
): Promise<any> {
  try {
    const profileRef = doc(db, 'user_profiles', userId);

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), 10000);
    });

    const getProfilePromise = getDoc(profileRef);
    const profileDoc = await Promise.race([getProfilePromise, timeoutPromise]);

    if (profileDoc.exists()) {
      const profileData = profileDoc.data();
      const currentDate = new Date().toISOString().split('T')[0];
      const lastUpdateDate = profileData.lastUpdateDate || '';

      // Kiểm tra xem đã cập nhật streak hôm nay chưa
      let newStreak = profileData.streak || 0;
      if (lastUpdateDate !== currentDate) {
        // Nếu hôm qua đã cập nhật thì tăng streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastUpdateDate === yesterdayStr) {
          newStreak++;
        } else if (lastUpdateDate !== currentDate) {
          // Nếu không phải hôm qua, reset streak
          newStreak = 1;
        }
      }

      const timeoutPromise2 = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Operation timeout')), 10000);
      });

      const updatePromise = updateDoc(profileRef, {
        totalWordsLearned:
          (profileData.totalWordsLearned || 0) + progress.wordsLearned,
        totalStudyTime: (profileData.totalStudyTime || 0) + progress.studyTime,
        todayProgress: (profileData.todayProgress || 0) + progress.wordsLearned,
        streak: newStreak,
        lastUpdateDate: currentDate,
        updatedAt: new Date().toISOString(),
      });

      await Promise.race([updatePromise, timeoutPromise2]);

      return { success: true, error: null };
    } else {
      return { success: false, error: 'Profile not found' };
    }
  } catch (error) {
    console.error('Error updating user progress:', error);
    return { success: false, error };
  }
}

// Lấy danh sách chat sessions
export async function getChatSessions(userId: string): Promise<any[]> {
  try {
    const sessionsRef = collection(db, 'chat_sessions');
    const q = query(sessionsRef, where('userId', '==', userId));

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), 10000);
    });

    const queryPromise = getDocs(q);
    const querySnapshot = await Promise.race([queryPromise, timeoutPromise]);

    const sessions: any[] = [];
    querySnapshot.forEach(doc => {
      sessions.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return sessions.sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  } catch (error) {
    console.error('Error getting chat sessions:', error);
    return [];
  }
}

// Tạo chat session mới
export async function createChatSession(userId: string): Promise<string> {
  try {
    const sessionsRef = collection(db, 'chat_sessions');
    const newSession = {
      userId: userId,
      title: 'Cuộc trò chuyện mới',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
    };

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), 10000);
    });

    const addPromise = addDoc(sessionsRef, newSession);
    const docRef = await Promise.race([addPromise, timeoutPromise]);
    return docRef.id;
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }
}

// Xóa chat session
export async function deleteChatSession(chatId: string): Promise<void> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), 10000);
    });

    const deletePromise = deleteDoc(doc(db, 'chat_sessions', chatId));
    await Promise.race([deletePromise, timeoutPromise]);
  } catch (error) {
    console.error('Error deleting chat session:', error);
    throw error;
  }
}

// Đổi tên chat session
export async function renameChatSession(
  chatId: string,
  newTitle: string,
): Promise<void> {
  try {
    const sessionRef = doc(db, 'chat_sessions', chatId);

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), 10000);
    });

    const updatePromise = updateDoc(sessionRef, {
      title: newTitle,
      updatedAt: new Date().toISOString(),
    });

    await Promise.race([updatePromise, timeoutPromise]);
  } catch (error) {
    console.error('Error renaming chat session:', error);
    throw error;
  }
}

// Lấy tin nhắn trong chat
export async function getChatMessages(chatId: string): Promise<any[]> {
  try {
    const messagesRef = collection(db, 'chat_messages');
    const q = query(messagesRef, where('chatId', '==', chatId));

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), 10000);
    });

    const queryPromise = getDocs(q);
    const querySnapshot = await Promise.race([queryPromise, timeoutPromise]);

    const messages: any[] = [];
    querySnapshot.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return messages.sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
  } catch (error) {
    console.error('Error getting chat messages:', error);
    return [];
  }
}

// Lưu tin nhắn mới
export async function saveMessage(
  chatId: string,
  message: any,
): Promise<string> {
  try {
    // Lưu tin nhắn
    const messagesRef = collection(db, 'chat_messages');
    const messageData = {
      ...message,
      chatId,
    };

    const timeoutPromise1 = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), 10000);
    });

    const addPromise = addDoc(messagesRef, messageData);
    const docRef = await Promise.race([addPromise, timeoutPromise1]);

    // Cập nhật session
    const sessionRef = doc(db, 'chat_sessions', chatId);

    const timeoutPromise2 = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), 10000);
    });

    const getPromise = getDoc(sessionRef);
    const sessionDoc = await Promise.race([getPromise, timeoutPromise2]);

    const timeoutPromise3 = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), 10000);
    });

    const updatePromise = updateDoc(sessionRef, {
      updatedAt: new Date().toISOString(),
      messageCount: sessionDoc.data()?.messageCount + 1 || 1,
    });

    await Promise.race([updatePromise, timeoutPromise3]);

    return docRef.id;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
}
