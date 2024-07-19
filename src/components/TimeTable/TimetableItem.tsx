import React from 'react';
import styles from './timetable.module.scss';

interface TimetableItemProps {
  item: {
    id: string;
    title: string;
    duration: number;
    startTime: string;
    endTime: string;
  };
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
}

const TimetableItem: React.FC<TimetableItemProps> = ({ item, onEdit, onDelete }) => {
  return (
    <div className={styles.item}>
      <h3>{item.title}</h3>
      <p>Duration: {item.duration} mins</p>
      <p>Start: {new Date(item.startTime).toLocaleTimeString()}</p>
      <p>End: {new Date(item.endTime).toLocaleTimeString()}</p>
      <button onClick={() => onEdit(item)}>Edit</button>
      <button onClick={() => onDelete(item.id)}>Delete</button>
    </div>
  );
};

export default TimetableItem;
