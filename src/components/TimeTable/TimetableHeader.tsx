import React from 'react';
import styles from './timetable.module.scss';

const TimetableHeader: React.FC = () => {
  return (
    <header className={styles.header}>
      <h1>Timetable</h1>
    </header>
  );
};

export default TimetableHeader;
