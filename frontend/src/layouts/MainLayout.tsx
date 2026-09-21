import { Outlet, useLocation } from 'react-router-dom'
import { Suspense } from 'react'
import { Spin } from 'antd'

import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { ROUTES } from '../router/paths'
import styles from './MainLayout.module.css'

/** 仅发现首页、关于页展示页脚（含备案号） */
function showFooter(pathname: string): boolean {
  return pathname === ROUTES.HOME || pathname === ROUTES.ABOUT
}

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
                <Spin description="页面加载中…" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </main>
      {showFooter(pathname) ? <Footer /> : null}
    </div>
  )
}
