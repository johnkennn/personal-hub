import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Button,
  Drawer,
  Dropdown,
  Flex,
  Grid,
  Layout,
  Menu,
  Space,
  theme,
} from 'antd'
import type { MenuProps } from 'antd'
import {
  CrownOutlined,
  EditOutlined,
  LogoutOutlined,
  MenuOutlined,
  MessageOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons'

import {
  clearAuth,
  getUsername,
  isLoggedIn,
  subscribeAuthChange,
} from '../../utils/authStorage'
import { NAV_ITEMS, ROUTES } from '../../router/paths'
import { GlobalSearch } from '../GlobalSearch'
import { NotificationBell } from '../NotificationBell'
import styles from './AppHeader.module.css'

const { Header } = Layout
const { useBreakpoint } = Grid

export function AppHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const screens = useBreakpoint()
  const { token } = theme.useToken()
  const [loggedIn, setLoggedIn] = useState(isLoggedIn)
  const [username, setUsername] = useState(getUsername)
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    return subscribeAuthChange(() => {
      setLoggedIn(isLoggedIn())
      setUsername(getUsername())
    })
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const selectedKeys = useMemo(() => {
    const match = NAV_ITEMS.find((item) =>
      item.path === '/'
        ? location.pathname === '/'
        : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`),
    )
    return match ? [match.path] : []
  }, [location.pathname])

  const menuItems = NAV_ITEMS.map((item) => ({
    key: item.path,
    label: item.label,
  }))

  function handleMenuClick(path: string) {
    setOpen(false)
    navigate(path)
  }

  function handleLogout() {
    clearAuth()
    setOpen(false)
    navigate(ROUTES.HOME, { replace: true })
  }

  const userMenu: MenuProps['items'] = [
    {
      key: 'studio',
      icon: <EditOutlined />,
      label: '创作台',
      onClick: () => {
        setOpen(false)
        navigate(ROUTES.STUDIO)
      },
    },
    {
      key: 'suggestions',
      icon: <MessageOutlined />,
      label: '我的建议',
      onClick: () => {
        setOpen(false)
        navigate(ROUTES.STUDIO_SUGGESTIONS)
      },
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '我的资料',
      onClick: () => {
        setOpen(false)
        navigate(ROUTES.STUDIO_PROFILE)
      },
    },
    {
      key: 'admin',
      icon: <CrownOutlined />,
      label: '内容治理',
      onClick: () => {
        setOpen(false)
        navigate(ROUTES.ADMIN)
      },
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: handleLogout,
    },
  ]

  const isMobile = !screens.md

  const searchBtn = (
    <Button
      type="text"
      icon={<SearchOutlined />}
      aria-label="搜索"
      onClick={() => {
        setOpen(false)
        setSearchOpen(true)
      }}
    >
      {!isMobile ? '搜索' : null}
    </Button>
  )

  const authActions = loggedIn ? (
    <Space>
      {searchBtn}
      <NotificationBell />
      <Dropdown menu={{ items: userMenu }} placement="bottomRight">
        <Button type="text" icon={<UserOutlined />}>
          {username}
        </Button>
      </Dropdown>
    </Space>
  ) : (
    <Space>
      {searchBtn}
      <NotificationBell />
      <Button
        type="text"
        onClick={() => {
          setOpen(false)
          navigate(ROUTES.LOGIN)
        }}
      >
        登录
      </Button>
      <Button
        type="primary"
        onClick={() => {
          setOpen(false)
          navigate(ROUTES.REGISTER)
        }}
      >
        注册
      </Button>
    </Space>
  )

  return (
    <Header className={styles.header} style={{ borderBottomColor: token.colorBorder }}>
      <div className={styles.inner}>
        <Flex align="center" gap="large" className={styles.left}>
          <Link to={ROUTES.HOME} className={styles.brand}>
            Personal Hub
          </Link>
          {!isMobile ? (
            <Menu
              mode="horizontal"
              theme="dark"
              selectedKeys={selectedKeys}
              items={menuItems}
              onClick={({ key }) => handleMenuClick(String(key))}
              className={styles.menu}
            />
          ) : null}
        </Flex>

        {!isMobile ? (
          authActions
        ) : (
          <Button
            type="text"
            icon={<MenuOutlined />}
            aria-label="打开菜单"
            onClick={() => setOpen(true)}
          />
        )}
      </div>

      <Drawer
        title="Personal Hub"
        placement="right"
        open={open}
        onClose={() => setOpen(false)}
      >
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={({ key }) => handleMenuClick(String(key))}
          style={{ background: 'transparent', border: 'none', marginBottom: 24 }}
        />
        {authActions}
      </Drawer>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </Header>
  )
}
