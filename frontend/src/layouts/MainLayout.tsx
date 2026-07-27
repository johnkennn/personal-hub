import { Outlet } from 'react-router-dom'

import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import styles from './MainLayout.module.css'

export function MainLayout() {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
