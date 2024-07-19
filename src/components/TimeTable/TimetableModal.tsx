import React, { useState, useEffect } from 'react';
import styles from './timetable.module.scss';
import { TimetableItem } from '@/lib/types'

interface TimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<TimetableItem, 'id'>) => void;
  item: TimetableItem | null;
  onUpdate: (item: TimetableItem) => void;
}

const TimetableModal: React.FC<TimetableModalProps> = ({ isOpen, onClose, onSubmit, item, onUpdate }) => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDuration(item.duration);
      setStartTime(item.startTime);
      setEndTime(item.endTime);
    }
  }, [item]);

  const handleSubmit = () => {
    const newItem = { title, duration, startTime, endTime };
    if (item) {
      onUpdate({ ...newItem, id: item.id });
    } else {
      onSubmit(newItem);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>{item ? 'Edit Item' : 'Add New Item'}</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          placeholder="Duration (minutes)"
        />
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          placeholder="Start Time"
        />
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          placeholder="End Time"
        />
        <button onClick={handleSubmit}>{item ? 'Update' : 'Add'}</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default TimetableModal;
