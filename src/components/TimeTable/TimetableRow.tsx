import React from 'react';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import styles from './timetable.module.scss'

interface TimetableRowProps {
  row: {
    id: string;
    title: string;
    duration: string;
    endTime: string;
    notes: string;
  };
  onInputChange: <K extends keyof TimetableRowProps['row']>(field: K, value: TimetableRowProps['row'][K]) => void;
  onDelete: () => void;
}

const TimetableRow: React.FC<TimetableRowProps> = ({ row, onInputChange, onDelete }) => {
  return (
    <>
      <td width={30}>
        <SwapVertIcon />
      </td>
      <td>
        <input
          type="text"
          value={row.title || ''}
          onChange={(e) => onInputChange('title', e.target.value)}
        />
      </td>
      <td>
        <input
          type="time"
          value={row.duration || '00:00'}
          onChange={(e) => onInputChange('duration', e.target.value)}
        />
      </td>
      <td width={90}>
        <input
          type="time"
          value={row.endTime || '00:00'}
          onChange={(e) => onInputChange('endTime', e.target.value)}
          disabled
        />
      </td>
      <td>
        <input
          type="text"
          value={row.notes || ''}
          onChange={(e) => onInputChange('notes', e.target.value)}
        />
      </td>
      <td>
        <button className={styles.deleteButton} onClick={onDelete}>
          <DeleteForeverIcon />
        </button>
      </td>
    </>
  );
};

export default TimetableRow;
