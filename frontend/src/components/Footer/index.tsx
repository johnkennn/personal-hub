import { Layout, Typography } from 'antd'

import { SITE_BRAND } from '../../router/paths'
import styles from './Footer.module.css'

const { Footer: AntFooter } = Layout

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <AntFooter className={styles.footer}>
      <Typography.Text type="secondary" className={styles.text}>
        © {year} {SITE_BRAND} · 找对 AI，用得上手
      </Typography.Text>
    </AntFooter>
  )
}
