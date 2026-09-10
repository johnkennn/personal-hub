import { Layout, Typography } from 'antd'

import styles from './Footer.module.css'

const { Footer: AntFooter } = Layout

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <AntFooter className={styles.footer}>
      <Typography.Text type="secondary" className={styles.text}>
        © {year} AI Tools Hub · 找对 AI，用得上手
      </Typography.Text>
    </AntFooter>
  )
}
