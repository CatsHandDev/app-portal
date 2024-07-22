import React, { memo } from 'react';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import styles from './timetable.module.scss';

interface TimetableItem {
  id: string;
  title: string;
  duration: string;
  endTime: string;
  notes: string;
}

interface TimetableRowProps {
  row: TimetableItem;
  onInputChange: <K extends keyof TimetableItem>(field: K, value: TimetableItem[K]) => void;
}

const TimetableRow: React.FC<TimetableRowProps> = memo(function TimetableRow({ row, onInputChange }) {
  return (
    <>
      <td width={30}>
        <SwapVertIcon />
      </td>
      <td>
        <input
          type="text"
          value={row.title}
          onChange={(e) => onInputChange('title', e.target.value)}
        />
      </td>
      <td width='90px'>
        <input
          type="time"
          value={row.duration}
          onChange={(e) => onInputChange('duration', e.target.value)}
        />
      </td>
      <td width='90px'>
        <input
          type="time"
          value={row.endTime}
          readOnly
        />
      </td>
      <td width='200px'>
        <input
          type="text"
          value={row.notes}
          onChange={(e) => onInputChange('notes', e.target.value)}
        />
      </td>
    </>
  );
});

export default TimetableRow;