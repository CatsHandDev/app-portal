import React, { useState } from 'react';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import styles from './auth.module.scss';
import Image from 'next/image';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onRegisterSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User registered:', userCredential.user);
      onRegisterSuccess();
      onClose();
    } catch (error) {
      console.error('Error registering:', error);
    }
  };

  const signUpWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('User signed up with Google:', result.user);
      onRegisterSuccess();
      onClose();
    } catch (error) {
      console.error('Error signing up with Google:', error);
    }
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // モーダルの内容がクリックされた場合は、クリックイベントを無視する
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        <h2>Sign Up</h2>
        <div className={styles.modalInputWrapper}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className={styles.authInput}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={styles.authInput}
          />
        </div>
        <div className={styles.modalButtonContainer}>
          <button onClick={handleRegister} className={styles.registerModalButton}>Register</button>
          <button onClick={onClose} className={styles.registerModalButton}>Cancel</button>
        </div>
        <button onClick={signUpWithGoogle} className={styles.googleAuthButton}>
          <Image
            src="https://www.cdnlogo.com/logos/g/35/google-icon.svg"
            width={20}
            height={20}
            alt='google'
          />
          Sign Up with Google
        </button>
      </div>
    </div>
  );
};

export default RegisterModal;
