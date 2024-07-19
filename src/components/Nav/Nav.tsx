import React, { useEffect, useState } from "react";
import styles from './nav.module.scss';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import EditCalendarOutlinedIcon from '@mui/icons-material/EditCalendarOutlined';
import PlaylistAddCheckOutlinedIcon from '@mui/icons-material/PlaylistAddCheckOutlined';
import HomeTwoToneIcon from '@mui/icons-material/HomeTwoTone';
import EditCalendarTwoToneIcon from '@mui/icons-material/EditCalendarTwoTone';
import PlaylistAddCheckTwoToneIcon from '@mui/icons-material/PlaylistAddCheckTwoTone';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';
import TextSnippetTwoToneIcon from '@mui/icons-material/TextSnippetTwoTone';

interface NavProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}

export const Nav: React.FC<NavProps> = ({ activeMenu, setActiveMenu }) => {
  useEffect(() => {
    const savedMenu = localStorage.getItem('activeMenu');
    if (savedMenu) {
      setActiveMenu(savedMenu);
    }
  }, [setActiveMenu]);

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
    localStorage.setItem('activeMenu', menu);
  };

  return (
    <nav className={styles.navContainer}>
      <div
        className={`${styles.menu} ${activeMenu === 'Home' ? styles.active : ''}`}
        onClick={() => handleMenuClick('Home')}
      >
        {activeMenu === 'Home' ?
          <HomeTwoToneIcon className={styles.icon} /> :
          <HomeOutlinedIcon className={styles.icon} />
        }
        <p>Home</p>
      </div>
      <div
        className={`${styles.menu} ${activeMenu === 'Calendar' ? styles.active : ''}`}
        onClick={() => handleMenuClick('Calendar')}
      >
        {activeMenu === 'Calendar' ?
          <EditCalendarTwoToneIcon className={styles.icon} /> :
          <EditCalendarOutlinedIcon className={styles.icon} />
        }
        <p>Calendar</p>
      </div>
      <div
        className={`${styles.menu} ${activeMenu === 'Todo' ? styles.active : ''}`}
        onClick={() => handleMenuClick('Todo')}
      >
        {activeMenu === 'Todo' ?
          <PlaylistAddCheckTwoToneIcon className={styles.icon} /> :
          <PlaylistAddCheckOutlinedIcon className={styles.icon} />
        }
        <p>Todo</p>
      </div>
      <div
        className={`${styles.menu} ${activeMenu === 'Note' ? styles.active : ''}`}
        onClick={() => handleMenuClick('Note')}
      >
        {activeMenu === 'Note' ?
          <TextSnippetTwoToneIcon className={styles.icon} /> :
          <TextSnippetOutlinedIcon className={styles.icon} />
        }
        <p>Note</p>
      </div>
      <div
        className={`${styles.menu} ${activeMenu === 'Timetable' ? styles.active : ''}`}
        onClick={() => handleMenuClick('Timetable')}
      >
        {activeMenu === 'Timetable' ?
          <TextSnippetTwoToneIcon className={styles.icon} /> :
          <TextSnippetOutlinedIcon className={styles.icon} />
        }
        <p>Timetable</p>
      </div>
    </nav>
  );
};
