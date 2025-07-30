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
          const token = await user.getIdToken();
          resolve({ 
            data: { 
              session: {
                user,
                access_token: token
              } 
            }, 
            error: null 
          });
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
      const docRef = doc(db, "profiles", userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { profile: docSnap.data(), error: null };
      } else {
        return { profile: null, error: "Profile not found" };
      }
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
      const docRef = doc(db, "progress", userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const currentData = docSnap.data();
        await updateDoc(docRef, {
          todayProgress: (currentData.todayProgress || 0) + (data.wordsLearned || 0),
          totalWordsLearned: (currentData.totalWordsLearned || 0) + (data.wordsLearned || 0),
          streak: currentData.streak || 0
        });
      } else {
        await setDoc(docRef, {
          todayProgress: data.wordsLearned || 0,
          totalWordsLearned: data.wordsLearned || 0,
          streak: 1,
          dailyGoal: 20
        });
      }
      
      // Lấy dữ liệu đã cập nhật
      const updatedDocSnap = await getDoc(docRef);
      return { profile: updatedDocSnap.data(), error: null };
    } catch (error: any) {
      return { profile: null, error };
    }
  }
};

// Export Firebase client
export const firebase = {
  auth: firebaseAuth,
  firestore
}; 