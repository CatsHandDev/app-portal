import React, { useState, useEffect } from 'react';
import styles from './calendar.module.scss';
import { Event } from '@/lib/types';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<Event>) => void;
  onDelete: (eventId: string) => void; // 削除用関数のプロパティを追加
  event: Partial<Event>;
  userId: string;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, onDelete, event, userId }) => {
  const [title, setTitle] = useState(event.title || '');
  const [start, setStart] = useState(new Date(event.start || ''));
  const [end, setEnd] = useState(new Date(event.end || ''));
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    setTitle(event.title || '');
    setStart(new Date(event.start || ''));
    setEnd(new Date(event.end || ''));
  }, [event]);

  if (!isOpen) return null;

  const toJapaneseTime = (date: Date) => {
    const offset = 9 * 60; // 日本はUTC+9
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    localDate.setMinutes(localDate.getMinutes() + offset);
    return localDate;
  };

  const formatDateToLocalString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSave = async () => {
    try {
      const eventsCollectionRef = collection(db, 'users', userId, 'calendar');
      const eventId = event.id || uuidv4();
      if (!event.id) {
        await addDoc(eventsCollectionRef, {
          id: eventId,
          title,
          start,
          end,
          allDay: true,
          resource: null,
        });
      } else {
        // イベントの更新ロジックを追加する場合はここに実装
      }
      onSave({ ...event, id: eventId, title });
      onClose();
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleDeleteConfirm = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      if (event.id) {
        const eventDocRef = doc(db, 'users', userId, 'calendar', event.id);
        await deleteDoc(eventDocRef);
        onDelete(event.id);
        setIsDeleteConfirmOpen(!isDeleteConfirmOpen);
        onClose();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleClose = () => {
    setIsDeleteConfirmOpen(!isDeleteConfirmOpen);
    onClose();
  }

  return (
    <div className={styles.modalContainer} onClick={handleContainerClick}>
      <div className={styles.modalWrapper} onClick={(e) => e.stopPropagation()}>
        <input
          className={styles.modalInput}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event"
        />

        <div className={styles.modalDateInputs}>
          <div className={styles.modalScheduleWrapper}>
            <label>Start:</label>
            <input
              className={styles.modalDateInput}
              type="datetime-local"
              value={formatDateToLocalString(toJapaneseTime(start))}
              onChange={(e) => setStart(new Date(e.target.value))}
            />
          </div>

          <div className={styles.modalScheduleWrapper}>
            <label>End:</label>
            <input
              className={styles.modalDateInput}
              type="datetime-local"
              value={formatDateToLocalString(toJapaneseTime(end))}
              onChange={(e) => setEnd(new Date(e.target.value))}
            />
          </div>
        </div>

        <div className={styles.modalButtonWrapper}>
          <button className={styles.modalButton} onClick={handleClose}>Cancel</button>
          <button className={styles.modalButton} onClick={handleSave}>Save</button>
          {event.id && (
            <button className={styles.modalButton} onClick={handleDeleteConfirm}>Delete</button>
          )}
        </div>

        {isDeleteConfirmOpen && (
          <div className={styles.confirmModalContainer} onClick={handleContainerClick}>
            <div className={styles.confirmModalWrapper} onClick={(e) => e.stopPropagation()}>
              <p>Are you sure you want to delete this event?</p>
              <div className={styles.confirmModalButtonWrapper}>
                <button
                  className={styles.modalButton}
                  onClick={() => setIsDeleteConfirmOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.modalButton}
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventModal;
