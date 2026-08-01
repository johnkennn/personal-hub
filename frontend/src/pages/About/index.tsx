import { useEffect, useState } from 'react'
import { Card, Col, Row, Typography, Button, Space } from 'antd'
import { GithubOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import { ROUTES } from '../../router/paths'
import { isLoggedIn, subscribeAuthChange } from '../../utils/authStorage'
import styles from '../../styles/ui.module.css'

const skills = [
  { title: '前端', items: 'React · TypeScript · 工程化' },
  { title: '后端', items: 'Spring Boot · MySQL · JWT' },
  { title: '工程', items: 'Git 工作流 · Linux 部署 · CI/CD' },
]

export function AboutPage() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn)

  useEffect(() => {
    return subscribeAuthChange(() => setLoggedIn(isLoggedIn()))
  }, [])

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.pageHead}>
        <div>
          <Typography.Title level={2} className={styles.pageTitle}>
            关于 Personal Hub
          </Typography.Title>
          <Typography.Paragraph className={styles.pageDesc} style={{ maxWidth: 560 }}>
            面向创作者的多模块内容平台：写文章、晒项目，支持多作者与轻社交。既是作品展示，也是可上线的全栈实践。
          </Typography.Paragraph>
        </div>
        {loggedIn ? (
          <Link to={ROUTES.STUDIO}>
            <Button type="primary">进入创作台</Button>
          </Link>
        ) : (
          <Link to={ROUTES.REGISTER}>
            <Button type="primary">加入创作</Button>
          </Link>
        )}
      </div>

      <Card className={styles.contentCard} variant="borderless" style={{ marginBottom: 16 }}>
        <Typography.Title level={4}>产品定位</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          好用、引流、可扩展——不是收费工具，而是让创作者把作品被看见的主场。文章与项目是前两个模块，后续可继续扩展。
        </Typography.Paragraph>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {skills.map((s) => (
          <Col xs={24} md={8} key={s.title}>
            <Card className={styles.contentCard} variant="borderless">
              <Typography.Text type="secondary">{s.title}</Typography.Text>
              <Typography.Title level={5} style={{ margin: '8px 0 0' }}>
                {s.items}
              </Typography.Title>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className={styles.contentCard} variant="borderless">
        <Typography.Title level={4}>联系</Typography.Title>
        <Space>
          <Button
            icon={<GithubOutlined />}
            href="https://github.com/johnkennn"
            target="_blank"
            rel="noreferrer"
          >
            GitHub · johnkennn
          </Button>
          <Link to={ROUTES.ARTICLES}>
            <Button type="text">去看文章</Button>
          </Link>
        </Space>
      </Card>
    </motion.div>
  )
}
