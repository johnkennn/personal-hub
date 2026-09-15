import { App, Button } from 'antd'
import { CopyOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import { PageHero, pageHeroStyles, SectionHead } from '../../components/PageHero'
import { usePageMeta } from '../../hooks/usePageMeta'
import { ROUTES, SITE_BRAND } from '../../router/paths'
import { copyToClipboard } from '../../utils/clipboard'
import styles from './About.module.css'

const CONTACT_PHONE = '13476270359'
const CONTACT_EMAIL = '1668144459@qq.com'

const MODULES = [
  { title: '聊天检索', desc: '问答、导流，搜产品与评测', to: ROUTES.CHAT },
  { title: '发现', desc: '热门产品与精选评测', to: ROUTES.DISCOVER },
  { title: 'AI导览', desc: '成熟 AI 产品按类汇总', to: ROUTES.TOOLS },
  { title: 'AI评测', desc: '真实体验与对比', to: ROUTES.ARTICLES },
  { title: '限时优惠', desc: '折扣与活动一站看', to: ROUTES.DEALS },
] as const

const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.12 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function AboutPage() {
  const { message } = App.useApp()

  usePageMeta({
    title: `关于 ${SITE_BRAND}`,
    description: '更快找到合适的 AI 产品与站内能力。',
  })

  async function copyText(value: string, okMsg: string) {
    const ok = await copyToClipboard(value)
    if (ok) {
      message.success(okMsg)
    } else {
      message.error('复制失败，请手动选中')
    }
  }

  return (
    <PageHero
      narrow
      title={SITE_BRAND}
      tagline="更快找到合适的 AI，用上站内技能。"
    >
      <section className={pageHeroStyles.section} aria-label="站内能力">
        <SectionHead label="能力" />
        <motion.ul
          className={styles.moduleGrid}
          variants={listVariants}
          initial="hidden"
          animate="show"
        >
          {MODULES.map((m) => (
            <motion.li key={m.title} variants={itemVariants}>
              <Link to={m.to} className={styles.moduleLink}>
                <span className={styles.moduleTitle}>{m.title}</span>
                <span className={styles.moduleDesc}>{m.desc}</span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </section>

      <motion.section
        className={styles.contact}
        aria-label="联系"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.4 }}
      >
        <p className={styles.contactLabel}>联系管理员</p>
        <div className={styles.contactRows}>
          <div className={styles.contactRow}>
            <div>
              <p className={styles.contactKind}>手机</p>
              <p className={styles.phone}>{CONTACT_PHONE}</p>
            </div>
            <Button
              className={styles.copyBtn}
              icon={<CopyOutlined />}
              onClick={() => void copyText(CONTACT_PHONE, '已复制手机号')}
            >
              复制
            </Button>
          </div>
          <div className={styles.contactRow}>
            <div>
              <p className={styles.contactKind}>邮箱</p>
              <a className={styles.email} href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
            </div>
            <Button
              className={styles.copyBtn}
              icon={<CopyOutlined />}
              onClick={() => void copyText(CONTACT_EMAIL, '已复制邮箱')}
            >
              复制
            </Button>
          </div>
        </div>
      </motion.section>
    </PageHero>
  )
}
