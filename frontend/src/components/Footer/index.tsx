import { Layout, Typography } from 'antd'

import { SITE_BRAND } from '../../router/paths'
import styles from './Footer.module.css'

const { Footer: AntFooter } = Layout

const ICP_BEIAN = '鄂ICP备2026052726号-1'
const ICP_URL = 'https://beian.miit.gov.cn/'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <AntFooter className={styles.footer}>
      <Typography.Text type="secondary" className={styles.text}>
        © {year} {SITE_BRAND} · 找对 AI，用得上手
      </Typography.Text>
      <Typography.Link
        type="secondary"        
        href={ICP_URL}        
        target="_blank"        
        rel="noreferrer"        
        className={styles.beian}      
      >        
        {ICP_BEIAN}      
      </Typography.Link>
    </AntFooter>
  )
}
