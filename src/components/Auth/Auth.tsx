import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import styles from './auth.module.scss'
import { auth } from '@/lib/firebase';

interface AuthProps {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;}

const Auth: React.FC<AuthProps> = ({ user, setUser }) => {

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

  return (
    <div className={styles.authContainer}>
      {user
        ? <button onClick={signOutUser}>Sign Out</button>
        : <button onClick={signIn}>Sign In</button>
      }
    </div>
  );
};

export default Auth;