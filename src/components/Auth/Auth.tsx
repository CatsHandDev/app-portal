import React, { useState, Dispatch, SetStateAction, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import styles from './auth.module.scss';
import { auth } from '@/lib/firebase';
import RegisterModal from './RegisterModal';

interface AuthProps {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
}

const Auth: React.FC<AuthProps> = ({ user, setUser }) => {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [setUser]);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const handleRegisterSuccess = () => {
    setIsRegisterModalOpen(false);
  };

  return (
    <div className={styles.authContainer}>
      {user ? (
        <button onClick={signOutUser} className={styles.authButton}>Sign Out</button>
      ) : (
        <div>
          <button onClick={signIn} className={styles.authButton}>Sign In</button>
          <button onClick={() => setIsRegisterModalOpen(true)} className={styles.authButton}>Sign Up</button>
        </div>
      )}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterSuccess={handleRegisterSuccess}
      />
    </div>
  );
};

export default Auth;
