import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import styles from './timetable.module.scss';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import TimetableModal from './TimetableModal';
import AddIcon from '@mui/icons-material/Add';
import debounce from 'lodash/debounce';
import TimetableRow from './TimetableRow';

interface TimetableItem {
  id: string;
  title: string;
  duration: string;
  endTime: string;
  notes: string;
}

const Timetable: React.FC = () => {
  const headers = ['', 'Title', 'Duration', 'End Time', 'Notes'];
  const emptyRow: TimetableItem = { id: '', title: '', duration: '00:00', endTime: '00:00', notes: '' };
  const initialRows = Array(10).fill(null).map(() => ({ ...emptyRow, id: Math.random().toString(36).substring(2) }));
  const [rows, setRows] = useState<TimetableItem[]>(initialRows);
  const [sortedRows, setSortedRows] = useState<TimetableItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openTime, setOpenTime] = useState('00:00');

  const calculateEndTime = useCallback((startTime: string, duration: string): string => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [durationHours, durationMinutes] = duration.split(':').map(Number);

    let endHours = startHours + durationHours;
    let endMinutes = startMinutes + durationMinutes;

    if (endMinutes >= 60) {
      endHours += Math.floor(endMinutes / 60);
      endMinutes = endMinutes % 60;
    }

    if (endHours >= 24) {
      endHours = endHours % 24;
    }

    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }, []);

  const calculateEndTimes = useCallback((items: TimetableItem[], startTime: string): TimetableItem[] => {
    return items.reduce((acc: TimetableItem[], item: TimetableItem, index: number) => {
      const previousEndTime = index === 0 ? startTime : acc[index - 1].endTime;
      const endTime = calculateEndTime(previousEndTime, item.duration);
      acc.push({ ...item, endTime });
      return acc;
    }, []);
  }, [calculateEndTime]);

  useEffect(() => {
    setRows(prevRows => calculateEndTimes(prevRows, openTime));
  }, [openTime, calculateEndTimes]);

  useEffect(() => {
    const sorted = [...rows].sort((a, b) => (a.title && !b.title) ? -1 : ((!a.title && b.title) ? 1 : 0));
    setSortedRows(sorted);
  }, [rows]);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.index === destination.index) return;

    setRows(prevRows => {
      const items = Array.from(prevRows);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      return calculateEndTimes(items, openTime);
    });
  }, [openTime, calculateEndTimes]);

  const debouncedCalculateEndTimes = useMemo(
    () => {
      let timeoutId: NodeJS.Timeout | null = null;
      return (items: TimetableItem[]) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
          setRows(calculateEndTimes(items, openTime));
        }, 300);
      };
    },
    [calculateEndTimes, openTime]
  );

  const handleInputChange = useCallback(<K extends keyof TimetableItem>(index: number, field: K, value: TimetableItem[K]) => {
    setRows(prevRows => {
      const updatedRows = prevRows.map((row, idx) =>
        idx === index ? { ...row, [field]: value } : row
      );
      if (field === 'duration') {
        debouncedCalculateEndTimes(updatedRows);
      }
      return updatedRows;
    });
  }, [debouncedCalculateEndTimes]);

  const handleAddItem = useCallback((newItem: TimetableItem) => {
    setRows(prevRows => {
      const updatedRows = [...prevRows, newItem];
      const sortedRows = updatedRows.sort((a, b) => (a.title || b.title) ? -1 : 1);
      return calculateEndTimes(sortedRows, openTime);
    });
  }, [openTime, calculateEndTimes]);

  return (
    <div className={styles.tableContainer}>
      <TimetableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddItem}
      />
      <div className={styles.settingContainer}>
        <label>
          <span><b>Open Time</b></span>
          <input
          style={{padding: '5px 15px 5px 0'}}
            type="time"
            value={openTime}
            onChange={(e) => setOpenTime(e.target.value)}
          />
        </label>
        <button
          className={styles.addButton}
          onClick={() => setIsModalOpen(true)}
        >
          <AddIcon />
        </button>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="timetable">
            {(provided) => (
              <tbody ref={provided.innerRef} {...provided.droppableProps}>
                {sortedRows.map((row, index) => (
                  <Draggable key={row.id} draggableId={row.id} index={index}>
                    {(provided) => (
                      <tr ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <TimetableRow
                          row={row}
                          onInputChange={(field, value) => handleInputChange(index, field, value)}
                        />
                      </tr>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </tbody>
            )}
          </Droppable>
        </DragDropContext>
      </table>
    </div>
  );
};

export default Timetable;
