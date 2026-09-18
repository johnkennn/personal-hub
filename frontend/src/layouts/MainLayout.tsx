import { Outlet, useLocation } from 'react-router-dom'
import { Suspense } from 'react'
import { Spin } from 'antd'

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
        <Suspense
            fallback={
              <div style={{ padding: 48, textAlign: 'center' }}>
                <Spin tip="页面加载中…" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </main>
      {!isChat ? <Footer /> : null}
    </div>
  )
}
