
import React from 'react';
import styles from './todo.module.scss';
import { ModalProps } from '@/lib/types';

const today = new Date().toISOString().split('T')[0];

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, newTodo, setNewTodo, handleAddTodo }) => {
  if (!isOpen) return null;

  const handleClick = async () => {
    await handleAddTodo(newTodo);
  };
  return (
    <div className={`${styles.modalContainer} ${isOpen && styles.open}`} onClick={onClose}>
      <div className={styles.modalWrapper} onClick={(e) => e.stopPropagation()}>
        <input
          className={styles.input}
          type="text"
          placeholder="title"
          value={newTodo.title}
          onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
        />
        <div>
          <input
            className={styles.input}
            type="text"
            placeholder="tag"
            value={newTodo.tag}
            onChange={(e) => setNewTodo({ ...newTodo, tag: e.target.value })}
          />
          <input
            className={styles.input}
            type="date"
            value={newTodo.deadline}
            min={today}
            onChange={(e) => setNewTodo({ ...newTodo, deadline: e.target.value })}
          />
        </div>
        <div>
          <div>
            <span>重要度</span>
            <span>{newTodo.importance}</span>
          </div>
          <input
            className={styles.range}
            type="range"
            min="1"
            max="5"
            value={newTodo.importance}
            onChange={(e) => setNewTodo({ ...newTodo, importance: parseInt(e.target.value) })}
          />
        </div>
        <div className={styles.buttonWrapper}>
          <button className={styles.cancel} onClick={onClose}>
            cancel
          </button>
          <button className={styles.create} onClick={handleClick}>
            create
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
