import React, { useState, useEffect } from 'react';
import styles from './note.module.scss';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface NoteProps {
  user: User | null;
}

export const Note: React.FC<NoteProps> = ({ user }) => {
  const [userId, setUserId] = useState<string>(user ? user.uid : 'guest');
  const [noteText, setNoteText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchNote = async () => {
      if (user) {
        setIsLoading(true);
        const userDocRef = doc(db, 'users', userId);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setNoteText(docSnap.data().note || '');
          } else {
            await setDoc(userDocRef, { note: '' });
          }
        } catch (error) {
          console.error('Error fetching note:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchNote();
  }, [user]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteText(event.target.value);
  };

  const handleUpdate = async () => {
    if (user) {
      setIsSaving(true);
      const userDocRef = doc(db, 'users', user.uid);
      try {
        await setDoc(userDocRef, { note: noteText }, { merge: true });
        console.log('Note saved successfully');
      } catch (error) {
        console.error('Error saving note:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.noteContainer}>
      <textarea
        className={styles.textarea}
        placeholder="input text"
        value={noteText}
        onChange={handleChange}
      />
      <button
        className={styles.updateButton}
        onClick={handleUpdate}
        disabled={isSaving}
      >
        {isSaving ? 'Saving...' : 'Update'}
      </button>
    </div>
  );
};