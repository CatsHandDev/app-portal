import React, { useState, useEffect, useCallback } from 'react';
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import TimetableItem from './TimetableItem';
import TimetableModal from './TimetableModal';
import TimetableHeader from './TimetableHeader';
import TimetableControls from './TimetableControls';
import styles from './timetable.module.scss';

interface TimetableItem {
  id: string;
  title: string;
  duration: number;
  startTime: string;
  endTime: string;
  [key: string]: any;
}

const Timetable: React.FC = () => {
  const [items, setItems] = useState<TimetableItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<TimetableItem | null>(null);

  const fetchTimetableItems = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'timetable'));
      const fetchedItems: TimetableItem[] = [];
      querySnapshot.forEach(doc => {
        fetchedItems.push({ id: doc.id, ...doc.data() } as TimetableItem);
      });
      setItems(fetchedItems);
    } catch (error) {
      console.error('Error fetching timetable items:', error);
    }
  }, []);

  useEffect(() => {
    fetchTimetableItems();
  }, [fetchTimetableItems]);

  const addItem = async (item: Omit<TimetableItem, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'timetable'), item);
      setItems([...items, {
        ...item, id: docRef.id,
        title: '',
        duration: 0,
        startTime: '',
        endTime: ''
      }]);
    } catch (error) {
      console.error('Error adding timetable item:', error);
    }
  };

  const updateItem = async (item: TimetableItem) => {
    try {
      const docRef = doc(db, 'timetable', item.id); // ドキュメント参照を取得
      await updateDoc(docRef, item); // ドキュメントを更新
      console.log('Document updated successfully');
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'timetable', id));
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting timetable item:', error);
    }
  };

  return (
    <div className={styles.container}>
      <TimetableHeader />
      <TimetableControls openModal={() => setIsModalOpen(true)} />
      <div className={styles.timetableContainer}>
        {items.map(item => (
          <TimetableItem key={item.id} item={item} onEdit={setCurrentItem} onDelete={deleteItem} />
        ))}
      </div>
      <TimetableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addItem}
        item={currentItem}
        onUpdate={updateItem}
      />
    </div>
  );
};

export default Timetable;
