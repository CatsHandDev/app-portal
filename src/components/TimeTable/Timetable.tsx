import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import styles from './timetable.module.scss';
import TimetableModal from './TimetableModal';
import AddIcon from '@mui/icons-material/Add';
import debounce from 'lodash/debounce';
import TimetableRow from './TimetableRow';
import { db } from '@/lib/firebase';
import { User } from 'firebase/auth';
import { doc, collection, getDoc, setDoc, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

interface TimetableItem {
  id: string;
  orderId: number;
  title: string;
  duration: string;
  endTime: string;
  notes: string;
  createTime: number;
}

interface AuthProps {
  user: User | null;
}

const Timetable: React.FC<AuthProps> = ({ user }) => {
  const [userId, setUserId] = useState<string>('');
  const headers = ['', 'Title', 'Duration', 'End Time', 'Notes', ''];
  const [rows, setRows] = useState<TimetableItem[]>([]);
  const [sortedRows, setSortedRows] = useState<TimetableItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openTime, setOpenTime] = useState('00:00');
  const [maxOrderId, setMaxOrderId] = useState(0);

  useEffect(() => {
    if (user) {
      setUserId(user.uid);
    } else {
      setUserId('guest');
    }
  }, [user]);

  const saveTimetable = useCallback(async (items: TimetableItem[]) => {
    if (userId) {
      try {
        const batch = writeBatch(db);
        items.forEach((item) => {
          const itemRef = doc(collection(db, 'users', userId, 'timetable'), item.id);
          batch.set(itemRef, item);
        });
        await batch.commit();
      } catch (error) {
        console.error('Error saving timetable:', error);
      }
    }
  }, [userId]);

  const calculateEndTime = useCallback((startTime: string = '00:00', duration: string = '00:00'): string => {
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

  const fetchTimetable = useCallback(async () => {
    if (userId) {
      try {
        const timetableCollectionRef = collection(db, 'users', userId, 'timetable');
        const querySnapshot = await getDocs(timetableCollectionRef);

        const fetchedItems: TimetableItem[] = [];
        let maxId = 0;
        querySnapshot.forEach((doc) => {
          const data = doc.data() as TimetableItem;
          fetchedItems.push({
            ...data,
            id: doc.id,
          });
          maxId = Math.max(maxId, data.orderId);
        });

        const sortedItems = fetchedItems.sort((a, b) => a.orderId - b.orderId);
        const itemsWithCalculatedEndTimes = calculateEndTimes(sortedItems, openTime);
        setRows(itemsWithCalculatedEndTimes);
        setMaxOrderId(maxId);
      } catch (error) {
        console.error('Error fetching timetable data:', error);
      }
    }
  }, [userId, calculateEndTimes, openTime]);

  useEffect(() => {
    if (userId) {
      fetchTimetable();
  }
  }, [fetchTimetable, userId]);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.index === destination.index) return;

    setRows(prevRows => {
      const items = Array.from(prevRows);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      // Update orderIds
      const updatedItems = items.map((item, index) => ({
        ...item,
        orderId: index + 1
      }));

      saveTimetable(updatedItems);
      return calculateEndTimes(updatedItems, openTime);
    });
  }, [openTime, calculateEndTimes, saveTimetable]);

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

  const handleAddItem = useCallback(async (newItem: Omit<TimetableItem, 'id' | 'orderId' | 'createTime'>) => {
    if (userId) {
      try {
        const newDocId = uuidv4();
        const newOrderId = maxOrderId + 1;
        const itemWithOrderId: TimetableItem = {
          ...newItem,
          id: newDocId,
          orderId: newOrderId,
          createTime: Date.now()
        };

        await setDoc(doc(collection(db, 'users', userId, 'timetable'), newDocId), itemWithOrderId);

        setRows(prevRows => {
          const updatedRows = [...prevRows, itemWithOrderId];
          return calculateEndTimes(updatedRows, openTime);
        });
        setMaxOrderId(newOrderId);
      } catch (error) {
        console.error('Error adding timetable item:', error);
      }
    }
}, [calculateEndTimes, maxOrderId, openTime, userId]);

  const deleteTimetableItem = useCallback(async (id: string) => {
    if (userId) {
      const itemRef = doc(collection(db, 'users', userId, 'timetable'), id);
      await deleteDoc(itemRef);
      fetchTimetable();
    }
  }, [userId, fetchTimetable]);

  return (
    <div className={styles.tableContainer}>
      <TimetableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddItem}
        maxOrderId={maxOrderId}
      />
      <div className={styles.settingContainer}>
        <label>
          <span><b>Open Time</b></span>
          <input
          style={{padding: '5px 15px'}}
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
                {rows.length > 0 ? (
                  rows.map((row, index) => (
                    <Draggable key={row.id} draggableId={row.id} index={index}>
                      {(provided) => (
                        <tr ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <TimetableRow
                            row={row}
                            onInputChange={(field, value) => handleInputChange(index, field, value)}
                            onDelete={() => deleteTimetableItem(row.id)}
                          />
                        </tr>
                      )}
                    </Draggable>
                  ))
                ) : (
                  <tr>
                    <td colSpan={headers.length}>No items found</td>
                  </tr>
                )}
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
