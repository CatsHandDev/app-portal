import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './todo.module.scss';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import CheckBoxOutlineBlankOutlinedIcon from '@mui/icons-material/CheckBoxOutlineBlankOutlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import AddIcon from '@mui/icons-material/Add';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import Modal from './Modal';
import { Data, Todo } from '@/lib/types';
import { User } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, getDocs, addDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

interface AuthProps {
  user: User | null;
}

const TodoList: React.FC<AuthProps> = ({ user }) => {
  const [userId, setUserId] = useState<string>(user ? user.uid : 'guest');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [activeTag, setActiveTag] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newTodo, setNewTodo] = useState<Omit<Todo, 'id' | 'completed'>>({
    title: '',
    deadline: '',
    importance: 1,
    tag: '',
  });
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchTodosAndTags = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const userDocRef = doc(db, 'users', userId);

      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {

        const userData = userDocSnap.data();
        setTags(userData.tags || []);

        const todosQuery = query(collection(db, 'users', userId, 'todos'));
        const todosSnapshot = await getDocs(todosQuery);
        const fetchedTodos: Todo[] = [];
        todosSnapshot.forEach((doc) => {
          fetchedTodos.push({ id: doc.id, ...doc.data() } as unknown as Todo);
        });

        setTodos(fetchedTodos);
      } else {
        await setDoc(userDocRef, { tags: [] });
      }
    } catch (error) {
      console.error('Error fetching todos and tags:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, userId]);

  useEffect(() => {
    if (user) {
      fetchTodosAndTags();
    }
  }, [fetchTodosAndTags, user]);

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !user) return;
    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTodos(items);

    // Firestoreの順序を更新（オプション：必要に応じて実装）
  };

  const handleTagClick = (tag: string) => {
    setActiveTag(tag);
  };

  const handleTagLongPress = async (tag: string) => {
    if (!user) return;
    const newTag = prompt('タグ名を編集してください:', tag);
    if (newTag && newTag !== tag) {
      const newTags = tags.map(t => t === tag ? newTag : t);
      setTags(newTags);

      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { tags: newTags });

      const todosToUpdate = todos.filter(todo => todo.tag === tag);
      for (const todo of todosToUpdate) {
        const todosQuery = query(
          collection(db, 'users', userId, 'todos'),
          where('id', '==', todo.id)
        );

        const querySnapshot = await getDocs(todosQuery);
        querySnapshot.forEach(async (doc) => {
          const todoDocRef = doc.ref;
          await updateDoc(todoDocRef, { tag: newTag });
        });
      }

      setTodos(todos.map(todo => todo.tag === tag ? { ...todo, tag: newTag } : todo));
    }
  };

  const handleAddTodo = async (newTodo: Omit<Todo, 'id' | 'completed'>) => {
    if (!user) return;

    const todosCollectionRef = collection(db, 'users', userId, 'todos');

    try {
      const querySnapshot = await getDocs(todosCollectionRef);
    } catch (error) {
      console.error("Error fetching documents: ", error);
    }

    const todoId = uuidv4();
    const newTodoDoc = await addDoc(todosCollectionRef, {
      ...newTodo,
      id: todoId,
      completed: false,
    });

    const newTodoWithId = { ...newTodo, id: newTodoDoc.id as unknown as number, completed: false };
    setTodos([...todos, newTodoWithId]);

    if (!tags.includes(newTodo.tag)) {
      const newTags = [...tags, newTodo.tag];
      setTags(newTags);
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { tags: newTags });
    }

    setIsModalOpen(false);
    setNewTodo({ title: '', deadline: '', importance: 1, tag: '' });
  };

  const handleCompleteTodo = (id: number) => {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  };

  const handleDeleteTodo = async (id: number) => {
    if (!user) return;
    setTodos(todos.filter(todo => todo.id !== id));

    const todosQuery = query(
      collection(db, 'users', userId, 'todos'),
      where('id', '==', id)
    );

    const querySnapshot = await getDocs(todosQuery);
    querySnapshot.forEach(async (doc) => {
      const todoDocRef = doc.ref;
      await deleteDoc(todoDocRef);
    });
  };

  const handleSortTodos = () => {
    const sortedTodos = [...todos].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.importance - b.importance;
      } else {
        return b.importance - a.importance;
      }
    });

    setTodos(sortedTodos);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filteredTodos = activeTag === 'all' ? todos : todos.filter(todo => todo.tag === activeTag);

  const getImportanceStyle = (importance: number) => {
    const importanceStyles = [
      styles.Importance1,
      styles.Importance2,
      styles.Importance3,
      styles.Importance4,
      styles.Importance5
    ];

    const index = Math.max(1, Math.min(importance, 5)) - 1;

    return importanceStyles[index];
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      {user && (
        <div className={`${styles.todoListContainer} ${styles.scrollBar}`}>
          <div className={styles.tagContainer}>
            <button
              className={`
                ${styles.tag}
                ${activeTag === 'all' ? styles.active : styles.nonActive}
              `}
              onClick={() => handleTagClick('all')}
            >
              ALL
            </button>
            {tags.map(tag => (
              <button
                className={`
                  ${styles.tag}
                  ${activeTag === tag ? styles.active : styles.nonActive}
                `}
                key={tag}
                onClick={() => handleTagClick(tag)}
                onContextMenu={(e) => { e.preventDefault(); handleTagLongPress(tag); }}
              >
                {tag}
              </button>
            ))}
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="todos">
              {(provided) => (
                <ul {...provided.droppableProps} ref={provided.innerRef}>
                  <AnimatePresence>
                    {filteredTodos.map((todo, index) => (
                      <Draggable key={todo.id} draggableId={todo.id.toString()} index={index}>
                        {(provided) => (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <li
                              className={`${styles.listContainer} ${todo.completed && styles.listComp}`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <div className={styles.listWrapper}>
                                <div>
                                  <span
                                    className={`
                                      ${styles.title}
                                      ${todo.completed && styles.todoComp}
                                      ${getImportanceStyle(todo.importance)}
                                    `}
                                  >
                                    {todo.title}
                                  </span>
                                  <div className={styles.detailWrapper}>
                                    <div className={styles.tagText}>期限：{todo.deadline}</div>
                                    <div className={styles.tagText}>タグ：{todo.tag}</div>
                                  </div>
                                </div>

                                <div className={styles.buttonWrapper}>
                                  <button
                                    className={styles.checkButton}
                                    onClick={() => handleCompleteTodo(todo.id)}
                                  >
                                    {todo.completed
                                      ? <CheckBoxOutlinedIcon className={styles.button}/>
                                      : <CheckBoxOutlineBlankOutlinedIcon className={styles.button}/>
                                    }
                                  </button>
                                  <button onClick={() => handleDeleteTodo(todo.id)}>
                                    <DeleteForeverOutlinedIcon className={styles.button}/>
                                  </button>
                                </div>
                              </div>
                            </li>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                  </AnimatePresence>
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>

          <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            newTodo={newTodo}
            setNewTodo={setNewTodo}
            handleAddTodo={handleAddTodo}
          />

          <button className={styles.addTodo} onClick={openModal}>
            <AddIcon className={styles.AddIcon}/>
          </button>

          <button className={styles.sortButton} onClick={handleSortTodos}>
            <SwapVertIcon
              className={`
                ${styles.SwapVertIcon}
                ${sortOrder !== 'asc' && styles.desc}
              `}
            />
          </button>
        </div>
      )}
    </div>
  );
};

export default TodoList;
