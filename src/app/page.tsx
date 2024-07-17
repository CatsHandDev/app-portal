'use client'
import Image from 'next/image'
import styles from './style.module.scss';
import { Inter } from 'next/font/google';
import { Top } from '@/components/Top/Top';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {


  return (
    <main className={styles.mainContainer}>
      <Top />
    </main>
  )
}