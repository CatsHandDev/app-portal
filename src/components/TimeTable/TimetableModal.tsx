import React, { useEffect, useState } from 'react';
import styles from './timetable.module.scss';

interface TimetableItem {
  id: string;
  orderId: number;
  title: string;
  duration: string;
  endTime: string;
  notes: string;
  createTime: number;
}

interface TimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<TimetableItem, 'id' | 'orderId' | 'createTime'>) => void;
  maxOrderId: number;
}

const TimetableModal: React.FC<TimetableModalProps> = ({ isOpen, onClose, onSave, maxOrderId }) => {
  const [title, setTitle] = useState<string>('');
  const [duration, setDuration] = useState<string>('00:00');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDuration('00:00');
      setNotes('');
    }
  }, [isOpen]);

  const handleSave = () => {
    const newItem: Omit<TimetableItem, 'id' | 'orderId' | 'createTime'> = {
      title,
      duration,
      endTime: '00:00',
      notes
    };
    onSave(newItem);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalBackground} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalWrapper}>
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
      </div>
    </div>
  );
};

export default TimetableModal;
