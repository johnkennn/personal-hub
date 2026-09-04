import { useNavigate } from 'react-router-dom'
import { Button } from 'antd'
import type { ButtonProps } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'

import { goBackOr } from '../utils/navigation'

type BackNavButtonProps = {
  /** 无站内历史时的回落路径 */
  fallback: string
  label?: string
  type?: ButtonProps['type']
  size?: ButtonProps['size']
  style?: ButtonProps['style']
  className?: string
}

/**
 * 内层页统一「返回上一页」；无历史时落到 fallback。
 * 标准位置：pageHead 左侧标题上方，配合 styles.pageBack；右侧留给操作按钮。
 */
export function BackNavButton({
  fallback,
  label = '返回上一页',
  type = 'text',
  size,
  style,
  className,
}: BackNavButtonProps) {
  const navigate = useNavigate()
  return (
    <Button
      type={type}
      size={size}
      icon={<ArrowLeftOutlined />}
      style={style}
      className={className}
      onClick={() => goBackOr(navigate, fallback)}
    >
      {label}
    </Button>
  )
}
