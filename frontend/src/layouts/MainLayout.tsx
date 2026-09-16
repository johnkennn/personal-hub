import { Outlet, useLocation } from 'react-router-dom'

import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { ROUTES } from '../router/paths'
import styles from './MainLayout.module.css'

export function MainLayout() {
  const { pathname } = useLocation()
  const isChat = pathname === '/chat'
  /** 列表页：主区不整页滚，交给内部列表滚，分页始终可见 */
  const lockMainScroll =
    isChat ||
    pathname === ROUTES.ARTICLES ||
    pathname === ROUTES.TOOLS ||
    pathname === ROUTES.DEALS

  return (
    <div className={styles.layout}>
      <Header />
      <main
        className={
          lockMainScroll ? styles.mainFill : `${styles.main} ph-scroll`
        }
      >
        <div
          className={
            isChat
              ? styles.mainInnerFillBleed
              : lockMainScroll
                ? styles.mainInnerFill
                : styles.mainInner
          }
        >
          <Outlet />
        </div>
      </main>
      {!isChat ? <Footer /> : null}
    </div>
  )
}
