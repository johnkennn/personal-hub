import { Button, Tooltip, Typography } from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  MenuFoldOutlined,
  PlusOutlined,
} from '@ant-design/icons'

import type { ChatConversation } from '../../utils/chatConversations'
import styles from './Chat.module.css'

type ChatSidebarProps = {
  conversations: ChatConversation[]
  activeId: string
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
  onRename: (id: string) => void
  /** 移动端抽屉开合 */
  mobileOpen?: boolean
  onCloseMobile?: () => void
}

export function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  mobileOpen,
  onCloseMobile,
}: ChatSidebarProps) {
  return (
    <aside
      className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ''}`}
      aria-label="会话列表"
    >
      <div className={styles.sidebarHead}>
        <Typography.Text className={styles.sidebarTitle}>会话</Typography.Text>
        <div className={styles.sidebarHeadActions}>
          <Tooltip title="新对话">
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              aria-label="新对话"
              onClick={onNew}
            />
          </Tooltip>
          {onCloseMobile ? (
            <Button
              type="text"
              size="small"
              className={styles.sidebarCloseMobile}
              icon={<MenuFoldOutlined />}
              aria-label="收起会话列表"
              onClick={onCloseMobile}
            />
          ) : null}
        </div>
      </div>
      <ul className={styles.convList}>
        {conversations.map((c) => {
          const active = c.id === activeId
          return (
            <li key={c.id}>
              <button
                type="button"
                className={`${styles.convItem} ${active ? styles.convItemActive : ''}`}
                onClick={() => onSelect(c.id)}
              >
                <span className={styles.convTitle}>{c.title}</span>
              </button>
              <div className={styles.convItemActions}>
                <Tooltip title="重命名">
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    aria-label="重命名"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRename(c.id)
                    }}
                  />
                </Tooltip>
                <Tooltip title="删除">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    aria-label="删除会话"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(c.id)
                    }}
                  />
                </Tooltip>
              </div>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
