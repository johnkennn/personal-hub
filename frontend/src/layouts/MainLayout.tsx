import { Outlet, useLocation } from 'react-router-dom'

import { FloatingDock } from '../components/FloatingDock'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import styles from './MainLayout.module.css'

export function MainLayout() {
  const { pathname } = useLocation()
  const fillViewport = pathname === '/' || pathname === '/chat'

  return (
    <div className={styles.layout}>
      <Header />
      <main className={`${fillViewport ? styles.mainFill : styles.main} ph-scroll`}>
        <div className={fillViewport ? styles.mainInnerFill : styles.mainInner}>
          <Outlet />
        </div>
      </main>
      <Footer />
      {import.meta.env.DEV ? <FloatingDock /> : null}
    </div>
  )
}
