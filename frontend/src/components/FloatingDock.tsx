import { useEffect, useState } from 'react'
import { Button, Modal, Typography } from 'antd'
import { QuestionCircleOutlined, VerticalAlignTopOutlined } from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'

import styles from './FloatingDock.module.css'

export function FloatingDock() {
  const [showTop, setShowTop] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  useEffect(() => {
    function onScroll() {
      setShowTop(window.scrollY > 420)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        e.preventDefault()
        setHelpOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <div className={styles.dock}>
        <Button
          shape="circle"
          size="large"
          icon={<QuestionCircleOutlined />}
          onClick={() => setHelpOpen(true)}
          aria-label="快捷键帮助"
        />
        <AnimatePresence>
          {showTop ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
            >
              <Button
                type="primary"
                shape="circle"
                size="large"
                icon={<VerticalAlignTopOutlined />}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="回到顶部"
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <Modal title="演示快捷键" open={helpOpen} onCancel={() => setHelpOpen(false)} footer={null}>
        <Typography.Paragraph>
          <Typography.Text code>⌘/Ctrl + K</Typography.Text> 打开全局搜索
        </Typography.Paragraph>
        <Typography.Paragraph>
          <Typography.Text code>?</Typography.Text> 打开本帮助
        </Typography.Paragraph>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          建议演示路径：发现 → 文章详情赞评 → 作者主页关注 → 创作台批量发布 → 内容治理。
        </Typography.Paragraph>
      </Modal>
    </>
  )
}
