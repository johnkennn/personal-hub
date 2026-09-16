import { Outlet, useLocation } from 'react-router-dom'

import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import styles from './MainLayout.module.css'

export function MainLayout() {
  const { pathname } = useLocation()
  const isChat = pathname === '/chat'

  return (
    <div className={styles.layout}>
      <Header />
      <main className={isChat ? styles.mainFill : `${styles.main} ph-scroll`}>
        <div className={isChat ? styles.mainInnerFillBleed : styles.mainInner}>
          <Outlet />
        </div>
      </main>
      {!isChat ? <Footer /> : null}
    </div>
  )
}
