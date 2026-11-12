import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  wishlist: string[];
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  toggleDemoAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdminState, setIsAdminState] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zn_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Keep wishlist synced with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('zn_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn('LocalStorage wishlist write error', e);
    }
  }, [wishlist]);

  // Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const isAdminUser = Boolean(
          currentUser.email === 'nidatariq6nov@gmail.com' ||
          currentUser.email?.includes('admin')
        );
        setIsAdminState(isAdminUser);

        // Fetch or create profile in Firestore
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              id: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Distinguished Patron',
              phone: currentUser.phoneNumber || '',
              role: isAdminUser ? 'admin' : 'customer',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }

          // Fetch user's wishlist from Firestore
          const wishlistRef = doc(db, 'wishlists', currentUser.uid);
          const wishSnap = await getDoc(wishlistRef);
          if (wishSnap.exists()) {
            const data = wishSnap.data();
            if (Array.isArray(data.productIds)) {
              setWishlist(Array.from(new Set([...wishlist, ...data.productIds])));
            }
          }
        } catch (err) {
          console.error('Error fetching user profile from Firestore:', err);
        }
      } else {
        setProfile(null);
        setIsAdminState(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
      setIsAdminState(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleWishlist = async (productId: string) => {
    const updated = wishlist.includes(productId)
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];
    setWishlist(updated);

    if (user) {
      try {
        const wishDoc = doc(db, 'wishlists', user.uid);
        await setDoc(wishDoc, {
          userId: user.uid,
          productIds: updated,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `wishlists/${user.uid}`);
      }
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const toggleDemoAdmin = () => {
    setIsAdminState((prev) => !prev);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin: isAdminState,
        loading,
        wishlist,
        loginWithGoogle,
        logout,
        toggleWishlist,
        isInWishlist,
        toggleDemoAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
