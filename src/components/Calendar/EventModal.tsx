import React, { useState, useEffect } from 'react';
import styles from './calendar.module.scss';
import { Event } from '@/lib/types';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<Event>) => void;
  onDelete: (eventId: string) => void;
  event: Partial<Event>;
  userId: string;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, onDelete, event, userId }) => {
  const [title, setTitle] = useState(event.title || '');
  const [start, setStart] = useState(event.start ? new Date(event.start) : new Date());
  const [end, setEnd] = useState(event.end ? new Date(event.end) : new Date());
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    setTitle(event.title || '');
    setStart(event.start ? new Date(event.start) : new Date());
    setEnd(event.end ? new Date(event.end) : new Date());
  }, [event]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (title) {
      const eventId = event.id || uuidv4();
      const newEvent: Partial<Event> = {
        id: eventId,
        title,
        start,
        end,
        allDay: true,
        resource: null,
      };

      try {
        const eventsCollectionRef = collection(db, 'users', userId, 'calendar');
        if (!event.id) {
          await addDoc(eventsCollectionRef, newEvent);
        } else {
          const eventDocRef = doc(db, 'users', userId, 'calendar', event.id);
          await updateDoc(eventDocRef, newEvent);
        }
      } catch (error) {
        console.error('Error saving event:', error);
      }
      onSave(newEvent);
      handleClose();
    };
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
      }
      setIsDeleteConfirmOpen(false);
      handleClose();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleClose = () => {
    setIsDeleteConfirmOpen(false);
    onClose();
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div className={styles.modalContainer} onClick={handleContainerClick}>
      <div className={styles.modalWrapper} onClick={(e) => e.stopPropagation()}>
        <input
          className={styles.modalInput}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event"
          required
        />
        <div className={styles.modalDateInputs}>
          <div className={styles.modalScheduleWrapper}>
            <label>Start:</label>
            <input
              className={styles.modalDateInput}
              type="datetime-local"
              value={new Date(start.getTime() - (start.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)}
              onChange={(e) => setStart(new Date(e.target.value))}
            />
          </div>
          <div className={styles.modalScheduleWrapper}>
            <label>End:</label>
            <input
              className={styles.modalDateInput}
              type="datetime-local"
              value={new Date(end.getTime() - (end.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)}
              onChange={(e) => setEnd(new Date(e.target.value))}
            />
          </div>
        </div>
        <div className={styles.modalButtonWrapper}>
          <button className={styles.modalButton} onClick={handleClose}>Cancel</button>
          <button className={styles.modalButton} onClick={handleSave}>Add</button>
          {event.id && (
            <button className={styles.modalButton} onClick={handleDeleteConfirm}>Delete</button>
          )}
        </div>
        {isDeleteConfirmOpen && (
          <div className={styles.ModalDeleteConfirm}>
            <p>Are you sure you want to delete this event?</p>
            <div className={styles.modalButtonWrapper}>
              <button className={styles.modalButton} onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</button>
              <button className={styles.modalButton} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventModal;
