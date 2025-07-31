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
import { FirebaseUser, Session, UserProfile } from "@/types";

// Auth functions
export const firebaseAuth = {
  // Đăng nhập bằng email và mật khẩu
  signInWithPassword: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { 
        data: { 
          session: {
            user: userCredential.user as FirebaseUser,
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
          user: userCredential.user as FirebaseUser,
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
                  user: user as FirebaseUser,
                  access_token: token
                } 
              }, 
              error: null 
            });
          } catch (error) {
            resolve({ data: { session: null }, error });
          }
        } else {
          resolve({ data: { session: null }, error: null });
        }
      });
    });
  },

  // Theo dõi thay đổi trạng thái xác thực
  onAuthStateChange: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  }
};

// Firestore functions
export const firestore = {
  // Lấy thông tin profile người dùng
  getProfile: async (userId: string) => {
    try {
      const docRef = doc(db, "profiles", userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { profile: docSnap.data(), error: null };
      } else {
        return { profile: null, error: null };
      }
    } catch (error) {
      return { profile: null, error };
    }
  },

  // Cập nhật thông tin profile người dùng
  updateProfile: async (userId: string, data: Partial<UserProfile>) => {
    try {
      const docRef = doc(db, "profiles", userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        await updateDoc(docRef, data);
      } else {
        await setDoc(docRef, data);
      }
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Lấy danh sách flashcard
  getFlashcards: async (userId: string) => {
    try {
      const decksRef = collection(db, "flashcard_decks");
      const q = query(decksRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const decks: any[] = [];
      querySnapshot.forEach((doc) => {
        decks.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return { decks, error: null };
    } catch (error) {
      return { decks: [], error };
    }
  },

  // Lấy danh sách habits
  getHabits: async (userId: string) => {
    try {
      const habitsRef = collection(db, "habits");
      const q = query(habitsRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const habits: any[] = [];
      querySnapshot.forEach((doc) => {
        habits.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return { habits, error: null };
    } catch (error) {
      return { habits: [], error };
    }
  },

  // Cập nhật tiến độ học tập
  updateProgress: async (userId: string, data: { wordsLearned?: number, studyTime?: number }) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const progressRef = doc(db, "progress", `${userId}_${today}`);
      const docSnap = await getDoc(progressRef);
      
      if (docSnap.exists()) {
        const currentData = docSnap.data();
        await updateDoc(progressRef, {
          wordsLearned: (currentData.wordsLearned || 0) + (data.wordsLearned || 0),
          studyTime: (currentData.studyTime || 0) + (data.studyTime || 0),
          lastUpdated: new Date()
        });
      } else {
        await setDoc(progressRef, {
          userId,
          date: today,
          wordsLearned: data.wordsLearned || 0,
          studyTime: data.studyTime || 0,
          createdAt: new Date(),
          lastUpdated: new Date()
        });
      }
      
      // Cập nhật profile
      const userRef = doc(db, "profiles", userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        await updateDoc(userRef, {
          todayProgress: (userData.todayProgress || 0) + (data.wordsLearned || 0),
          totalWordsLearned: (userData.totalWordsLearned || 0) + (data.wordsLearned || 0),
          lastActive: new Date()
        });
      }
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  }
};

// Export combined API
export const firebase = {
  auth: firebaseAuth,
  firestore: firestore
};