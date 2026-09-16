import { Outlet, useLocation } from 'react-router-dom'

import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import styles from './MainLayout.module.css'

export function MainLayout() {
  const { pathname } = useLocation()
  const fillViewport = pathname === '/chat'

  return (
    <div className={styles.layout}>
      <Header />
      <main
        className={
          fillViewport ? styles.mainFill : `${styles.main} ph-scroll`
        }
      >
        <div
          className={
            fillViewport ? styles.mainInnerFillBleed : styles.mainInner
          }
        >
          <Outlet />
        </div>
      </main>
      {!fillViewport ? <Footer /> : null}
    </div>
  )
}
