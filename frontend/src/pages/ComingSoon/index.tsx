import { Result, Button, Card } from 'antd'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import { ROUTES } from '../../router/paths'
import styles from '../../styles/ui.module.css'

type ComingSoonPageProps = {
  title: string
  subtitle?: string
}

export function ComingSoonPage({ title, subtitle }: ComingSoonPageProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`${styles.panel} ${styles.widePanel}`} variant="borderless">
        <Result
          status="info"
          title={title}
          subTitle={subtitle ?? '该能力将在后续里程碑交付，创作台入口已预留。'}
          extra={
            <Link to={ROUTES.STUDIO}>
              <Button type="primary">返回创作台</Button>
            </Link>
          }
        />
      </Card>
    </motion.div>
  )
}
