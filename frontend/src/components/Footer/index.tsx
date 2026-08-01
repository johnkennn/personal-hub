import { Layout, Typography } from 'antd'

import styles from './Footer.module.css'

const { Footer: AntFooter } = Layout

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <AntFooter className={styles.footer}>
      <Typography.Text type="secondary" className={styles.text}>
        © {year} Personal Hub · 创作者内容平台
      </Typography.Text>
    </AntFooter>
  )
}
