import { Outlet } from 'react-router-dom'
import { Layout } from 'antd'

import { FloatingDock } from '../components/FloatingDock'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import styles from './MainLayout.module.css'

const { Content } = Layout

export function MainLayout() {
  return (
    <Layout className={styles.layout}>
      <Header />
      <Content className={styles.main}>
        <div className={styles.mainInner}>
          <Outlet />
        </div>
      </Content>
      <Footer />
      <FloatingDock />
    </Layout>
  )
}
