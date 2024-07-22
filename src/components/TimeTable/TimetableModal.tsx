import React, { useEffect, useState } from 'react';
import Modal from '@/components/Modal/Modal';
import styles from './timetable.module.scss';

interface TimetableItem {
  id: string;
  title: string;
  duration: string;
  endTime: string;
  notes: string;
}

interface TimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: TimetableItem) => void;
}

const TimetableModal: React.FC<TimetableModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('00:00');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDuration('00:00');
      setNotes('');
    }
  }, [isOpen]);

  const handleSave = () => {
    const newItem: TimetableItem = {
      id: Math.random().toString(36).substring(2),
      title,
      duration,
      endTime: '00:00',
      notes
    };
    onSave(newItem);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalContainer}>
        <div className={styles.formGroup}>
          <label>
            <span>Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
        </div>
        <div className={styles.formGroup}>
          <label>
            <span>Duration</span>
            <input
              type="time"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
        </label>
        </div>
        <div className={styles.formGroup}>
          <label>
            <span>Notes</span>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>
        <div className={styles.buttonContainer}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
    </Modal>
  );
};

export default TimetableModal;
