import React, { Dispatch, SetStateAction, useState } from 'react';
import styles from './header.module.scss';
import SettingsIcon from '@mui/icons-material/Settings';
import Auth from '../Auth/Auth';
import { User } from 'firebase/auth';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { ClickAwayListener } from '@mui/material'; // ClickAwayListenerを追加

interface HeaderProps {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  isDarkMode: boolean;
  setIsDarkMode: Dispatch<SetStateAction<boolean>>;
}

export const Header: React.FC<HeaderProps> = ({ user, setUser, isDarkMode, setIsDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // ここでダークモードの設定を保存するなどの処理を行うことができます
  };

  const handleClickAway = () => {
    setIsMenuOpen(false); // モーダル外をクリックしたらメニューを閉じる
  };

  return (
    <div className={`${styles.headerContainer} ${isDarkMode ? styles.darkMode : ''}`}>
      <Auth user={user} setUser={setUser} />

      <div className={styles.modalContainer} onClick={handleClickAway}>
        <div className={`${styles.menu} ${isMenuOpen && styles.open}`}>
          <div className={styles.menuItem} onClick={toggleDarkMode}>
            <SwapVertIcon className={styles.icon}/>
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
          <div className={styles.menuItem}>MenuItem2</div>
        </div>
      </div>

      <SettingsIcon
        className={`${styles.setting} ${isMenuOpen && styles.open}`}
        onClick={toggleMenu}
      />
    </div>
  );
};
