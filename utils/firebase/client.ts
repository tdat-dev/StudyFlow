import { 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs 
} from "firebase/firestore";
import { auth, db } from "./config";

// Auth functions
export const firebaseAuth = {
  // Đăng nhập bằng email và mật khẩu
  signInWithPassword: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { 
        data: { 
          session: {
            user: userCredential.user,
            access_token: await userCredential.user.getIdToken()
          } 
        }, 
        error: null 
      };
    } catch (error: any) {
      return { data: { session: null }, error };
    }
  },

  // Đăng ký tài khoản mới
  signUp: async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { 
        data: { 
          user: userCredential.user,
          session: {
            access_token: await userCredential.user.getIdToken()
          }
        }, 
        error: null 
      };
    } catch (error: any) {
      return { data: { user: null, session: null }, error };
    }
  },

  // Đăng nhập với Google
  signInWithOAuth: async ({ provider }: { provider: string }) => {
    try {
      if (provider === 'google') {
        const googleProvider = new GoogleAuthProvider();
        googleProvider.setCustomParameters({
          prompt: 'select_account'
        });
        const result = await signInWithPopup(auth, googleProvider);
        return { data: result, error: null };
      }
      throw new Error(`Unsupported provider: ${provider}`);
    } catch (error: any) {
      return { data: null, error };
    }
  },

  // Đăng xuất
  signOut: async () => {
    try {
      await signOut(auth);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  // Lấy phiên hiện tại
  getSession: async () => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();
        if (user) {
          try {
            const token = await user.getIdToken(true); // Force refresh token
            resolve({ 
              data: { 
                session: {
                  user,
                  access_token: token
                } 
              }, 
              error: null 
            });
          } catch (error) {
            console.error("Error getting token:", error);
            resolve({ data: { session: null }, error });
          }
        } else {
          resolve({ data: { session: null }, error: null });
        }
      });
    });
  },

  // Lắng nghe thay đổi trạng thái xác thực
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        callback('SIGNED_IN', { user, access_token: token });
      } else {
        callback('SIGNED_OUT', null);
      }
    });
    
    return { data: { subscription: { unsubscribe } } };
  }
};

// Firestore functions
export const firestore = {
  // Lấy profile người dùng
  getProfile: async (userId: string) => {
    try {
      // Lấy thông tin cơ bản từ profiles
      const profileRef = doc(db, "profiles", userId);
      const profileSnap = await getDoc(profileRef);
      
      // Lấy thông tin tiến độ từ progress
      const progressRef = doc(db, "progress", userId);
      const progressSnap = await getDoc(progressRef);
      
      // Kết hợp dữ liệu từ cả hai nguồn
      let profileData = {};
      
      if (profileSnap.exists()) {
        profileData = { ...profileData, ...profileSnap.data() };
      }
      
      if (progressSnap.exists()) {
        profileData = { 
          ...profileData, 
          ...progressSnap.data(),
          // Đảm bảo các trường quan trọng luôn tồn tại
          todayProgress: progressSnap.data().todayProgress || 0,
          totalWordsLearned: progressSnap.data().totalWordsLearned || 0,
          streak: progressSnap.data().streak || 0,
          dailyGoal: progressSnap.data().dailyGoal || 20
        };
      }
      
      // Nếu không có dữ liệu nào, trả về null
      if (Object.keys(profileData).length === 0) {
        return { profile: null, error: "Profile not found" };
      }
      
      return { profile: profileData, error: null };
    } catch (error: any) {
      return { profile: null, error };
    }
  },

  // Cập nhật profile người dùng
  updateProfile: async (userId: string, data: any) => {
    try {
      const docRef = doc(db, "profiles", userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        await updateDoc(docRef, data);
      } else {
        await setDoc(docRef, data);
      }
      
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  // Lấy flashcards
  getFlashcards: async (userId: string) => {
    try {
      const q = query(collection(db, "flashcard_decks"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const decks: any[] = [];
      querySnapshot.forEach((doc) => {
        decks.push({ id: doc.id, ...doc.data() });
      });
      
      return { decks, error: null };
    } catch (error: any) {
      return { decks: [], error };
    }
  },

  // Lấy habits
  getHabits: async (userId: string) => {
    try {
      const q = query(collection(db, "habits"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const habits: any[] = [];
      querySnapshot.forEach((doc) => {
        habits.push({ id: doc.id, ...doc.data() });
      });
      
      return { habits, error: null };
    } catch (error: any) {
      return { habits: [], error };
    }
  },

  // Cập nhật tiến độ học tập
  updateProgress: async (userId: string, data: any) => {
    try {
      // Cập nhật dữ liệu trong bảng progress
      const progressRef = doc(db, "progress", userId);
      const progressSnap = await getDoc(progressRef);
      
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      let updatedProgress;
      
      if (progressSnap.exists()) {
        const currentData = progressSnap.data();
        const lastUpdateDate = currentData.lastUpdateDate || '';
        
        // Kiểm tra xem có phải ngày mới không
        const isNewDay = lastUpdateDate !== todayStr;
        
        // Nếu là ngày mới, reset todayProgress và tăng streak nếu hôm qua đã hoàn thành
        if (isNewDay) {
          updatedProgress = {
            todayProgress: data.wordsLearned || 0,
            totalWordsLearned: (currentData.totalWordsLearned || 0) + (data.wordsLearned || 0),
            streak: currentData.streak || 0,
            lastUpdateDate: todayStr,
            lastStudyTime: now.toISOString()
          };
          
          // Kiểm tra xem có duy trì streak không
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (lastUpdateDate === yesterdayStr) {
            // Nếu hôm qua đã học, tăng streak
            updatedProgress.streak = (currentData.streak || 0) + 1;
          } else if (lastUpdateDate !== todayStr) {
            // Nếu bỏ lỡ ngày, reset streak
            updatedProgress.streak = 1;
          }
        } else {
          // Cùng ngày, chỉ cập nhật tiến độ
          updatedProgress = {
            todayProgress: (currentData.todayProgress || 0) + (data.wordsLearned || 0),
            totalWordsLearned: (currentData.totalWordsLearned || 0) + (data.wordsLearned || 0),
            streak: currentData.streak || 0,
            lastUpdateDate: todayStr,
            lastStudyTime: now.toISOString()
          };
        }
        
        await updateDoc(progressRef, updatedProgress);
      } else {
        // Tạo document mới nếu chưa tồn tại
        updatedProgress = {
          todayProgress: data.wordsLearned || 0,
          totalWordsLearned: data.wordsLearned || 0,
          streak: 1,
          dailyGoal: 20,
          lastUpdateDate: todayStr,
          lastStudyTime: now.toISOString()
        };
        
        await setDoc(progressRef, updatedProgress);
      }
      
      // Cập nhật dữ liệu tổng hợp vào profiles
      const profileRef = doc(db, "profiles", userId);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        const profileData = profileSnap.data();
        await updateDoc(profileRef, {
          totalWordsLearned: updatedProgress.totalWordsLearned,
          streak: updatedProgress.streak,
          lastStudyTime: updatedProgress.lastStudyTime
        });
      }
      
      // Cập nhật dữ liệu rank points
      try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        
        // Tính điểm thưởng dựa trên số từ học được
        const pointsEarned = data.wordsLearned || 0;
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          await updateDoc(userRef, {
            rankPoints: (userData.rankPoints || 0) + pointsEarned,
            updatedAt: now.toISOString()
          });
        } else {
          await setDoc(userRef, {
            rankPoints: pointsEarned,
            achievements: [],
            createdAt: now.toISOString(),
            updatedAt: now.toISOString()
          }, { merge: true });
        }
      } catch (error) {
        console.error('Failed to update rank points:', error);
      }
      
      // Lấy dữ liệu đã cập nhật từ progress
      const updatedProgressSnap = await getDoc(progressRef);
      
      // Kết hợp với dữ liệu từ profiles
      const updatedProfileSnap = await getDoc(profileRef);
      
      let combinedData = {};
      
      if (updatedProgressSnap.exists()) {
        combinedData = { ...combinedData, ...updatedProgressSnap.data() };
      }
      
      if (updatedProfileSnap.exists()) {
        combinedData = { ...combinedData, ...updatedProfileSnap.data() };
      }
      
      return { profile: combinedData, error: null };
    } catch (error: any) {
      console.error('Error updating progress:', error);
      return { profile: null, error };
    }
  }
};

// Export Firebase client
export const firebase = {
  auth: firebaseAuth,
  firestore
}; 