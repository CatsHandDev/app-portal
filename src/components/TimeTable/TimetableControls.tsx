import React from 'react';
import styles from './timetable.module.scss';

interface TimetableControlsProps {
  openModal: () => void;
}

const TimetableControls: React.FC<TimetableControlsProps> = ({ openModal }) => {
  return (
    <div className={styles.controls}>
      <button onClick={openModal}>Add New Item</button>
    </div>
  );
};

export default TimetableControls;
