import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleProvider,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  FirebaseUser,
  testFirestoreConnection
} from './config';
import { syncUserProfile, ensureClassDocument, FirestoreUserData } from './firestoreService';

// In-memory token cache (never stored in localStorage or sessionStorage as per security guidelines)
let cachedAccessToken: string | null = null;

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null): void => {
  cachedAccessToken = token;
};

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: FirestoreUserData | null;
  loading: boolean;
  loginError: string | null;
  accessToken: string | null;
  hasWorkspaceAccess: boolean;
  signInWithGoogle: () => Promise<void>;
  requestWorkspaceAccessToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
  firestoreConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<FirestoreUserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [firestoreConnected, setFirestoreConnected] = useState<boolean>(true);
  const [tokenState, setTokenState] = useState<string | null>(cachedAccessToken);

  useEffect(() => {
    // Check Firestore connection at boot
    testFirestoreConnection().then((connected) => {
      setFirestoreConnected(connected);
    });

    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await syncUserProfile(
            user.uid,
            user.email || '',
            user.displayName || 'Thầy Nguyễn Văn Xuyên',
            user.photoURL || undefined
          );
          setUserProfile(profile);

          // Ensure class document exists with this user as owner
          await ensureClassDocument(user.uid, '10A1');
        } catch (err) {
          console.error('Error syncing user profile with Firestore:', err);
        }
      } else {
        setUserProfile(null);
        cachedAccessToken = null;
        setTokenState(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoginError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
        setTokenState(credential.accessToken);
      }
    } catch (err: any) {
      console.error('Lỗi đăng nhập Google:', err);
      // Map error message to friendly Vietnamese
      if (err.code === 'auth/popup-closed-by-user') {
        setLoginError('Cửa sổ đăng nhập đã bị đóng trước khi hoàn tất.');
      } else if (err.code === 'auth/popup-blocked') {
        setLoginError('Trình duyệt đã chặn cửa sổ đăng nhập pop-up. Vui lòng cho phép pop-up và thử lại.');
      } else if (err.code === 'auth/network-request-failed') {
        setLoginError('Lỗi kết nối mạng khi liên hệ dịch vụ xác thực Google.');
      } else {
        setLoginError(err.message || 'Không thể đăng nhập bằng Google. Vui lòng thử lại.');
      }
    }
  };

  const requestWorkspaceAccessToken = async (): Promise<string | null> => {
    if (cachedAccessToken) {
      return cachedAccessToken;
    }
    setLoginError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
        setTokenState(credential.accessToken);
        return credential.accessToken;
      }
      return null;
    } catch (err: any) {
      console.error('Lỗi cấp quyền Google Workspace:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setLoginError('Cửa sổ xác thực đã bị đóng trước khi hoàn tất.');
      } else if (err.code === 'auth/popup-blocked') {
        setLoginError('Trình duyệt đã chặn pop-up xác thực Google. Vui lòng cho phép mở pop-up.');
      } else {
        setLoginError(err.message || 'Không thể cấp quyền Google Workspace.');
      }
      return null;
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
      cachedAccessToken = null;
      setTokenState(null);
      setCurrentUser(null);
      setUserProfile(null);
    } catch (err: any) {
      console.error('Lỗi đăng xuất:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        loginError,
        accessToken: tokenState,
        hasWorkspaceAccess: !!tokenState,
        signInWithGoogle,
        requestWorkspaceAccessToken,
        signOut,
        firestoreConnected
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
