import { create } from 'zustand';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from '../lib/firebaseConfig'; 

export const useAuthStore = create((set) => ({
  userId: null,
  isAuthLoading: true,

  checkAuth: () => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        set({ userId: user.uid, isAuthLoading: false });
      } else {
        try {
          const userCredential = await signInAnonymously(auth);
          set({ userId: userCredential.user.uid, isAuthLoading: false });
        } catch (error) {
          console.error("Anonymous sign-in failed:", error);
          set({ isAuthLoading: false });
        }
      }
    });
  },
}));