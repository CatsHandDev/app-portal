import React, { useEffect, useState } from 'react';
import styles from './top.module.scss';
import { Nav } from '../Nav/Nav';
import { Header } from '../Header/Header';
import MyCalendar from '@/components/Calendar/Calendar';
import TodoList from '@/components/Todo/TodoList';
import { User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { View, Views } from 'react-big-calendar';
import { Note } from '../Note/Note';
import Timetable from '../TimeTable/Timetable';

export const Top = () => {
  const [activeMenu, setActiveMenu] = useState('Home');
  const [user, setUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [view, setView] = useState<View>(Views.MONTH);

  const renderContent = () => {
    switch (activeMenu) {
      case 'Home':
        return null;
      case 'Calendar':
        return <MyCalendar view={view} setView={setView} userId={user ? user.uid : 'guest'} />;
      case 'Todo':
        return <TodoList user={user} />;
      case 'Note':
        return <Note user={user} />;
      case 'TimeTable':
        return <Timetable />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.topContainer}>
      <Header user={user} setUser={setUser} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      {renderContent()}
      <Nav activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
    </div>
  );
};
