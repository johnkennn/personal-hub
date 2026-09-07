import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Avatar,
  Button,
  Drawer,
  Dropdown,
  Flex,
  Grid,
  Layout,
  Menu,
  theme,
} from 'antd'
import type { InputRef, MenuProps } from 'antd'
import {
  LogoutOutlined,
  MenuOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons'

import { fetchMyProfile } from '../../api/profile'
import {
  clearAuth,
  getUsername,
  isLoggedIn,
  subscribeAuthChange,
} from '../../utils/authStorage'
import {
  getCachedProfileDisplay,
  setCachedProfileDisplay,
  subscribeProfileDisplayChange,
} from '../../utils/profileDisplay'
import { resolveMediaUrl } from '../../utils/mediaUrl'
import { NAV_ITEMS, ROUTES } from '../../router/paths'
import { GlobalSearch } from '../GlobalSearch'
import { HeaderSearch } from '../HeaderSearch'
import { NotificationBell } from '../NotificationBell'
import styles from './AppHeader.module.css'

const { Header } = Layout
const { useBreakpoint } = Grid

export function AppHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const screens = useBreakpoint()
  const { token } = theme.useToken()
  const searchInputRef = useRef<InputRef>(null)
  const [loggedIn, setLoggedIn] = useState(isLoggedIn)
  const [username, setUsername] = useState(getUsername)
  const [avatarUrl, setAvatarUrl] = useState(() => getCachedProfileDisplay().avatarUrl)
  const [nickname, setNickname] = useState(() => getCachedProfileDisplay().nickname)
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    return subscribeAuthChange(() => {
      setLoggedIn(isLoggedIn())
      setUsername(getUsername())
      const cached = getCachedProfileDisplay()
      setAvatarUrl(cached.avatarUrl)
      setNickname(cached.nickname)
    })
  }, [])

  useEffect(() => {
    return subscribeProfileDisplayChange(() => {
      const cached = getCachedProfileDisplay()
      setAvatarUrl(cached.avatarUrl)
      setNickname(cached.nickname)
    })
  }, [])

  useEffect(() => {
    if (!loggedIn) return
    let cancelled = false
    fetchMyProfile()
      .then((res) => {
        if (cancelled) return
        const p = res.data.data
        setCachedProfileDisplay({
          avatarUrl: p.avatarUrl ?? null,
          nickname: p.nickname ?? null,
        })
      })
      .catch(() => {
        /* 顶栏降级：用缓存或用户名 */
      })
    return () => {
      cancelled = true
    }
  }, [loggedIn])

  const isMobile = !screens.md

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (isMobile) {
          setSearchOpen(true)
        } else {
          searchInputRef.current?.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isMobile])

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

  const displayName = (nickname?.trim() || username || '用户').trim()
  const avatarSrc = resolveMediaUrl(avatarUrl) || undefined

  function handleMenuClick(path: string) {
    setOpen(false)
    navigate(path)
  }

  function handleLogout() {
    clearAuth()
    setOpen(false)
    navigate(ROUTES.LOGIN, { replace: true })
  }

  const userMenu: MenuProps['items'] = [
    {
      key: 'hub',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => {
        setOpen(false)
        navigate(ROUTES.STUDIO)
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

  const mobileSearchBtn = (
    <Button
      type="text"
      icon={<SearchOutlined />}
      aria-label="搜索"
      onClick={() => {
        setOpen(false)
        setSearchOpen(true)
      }}
    />
  )

  const authActions = loggedIn ? (
    <div className={styles.actions}>
      {!isMobile ? <HeaderSearch inputRef={searchInputRef} /> : mobileSearchBtn}
      <NotificationBell />
      <Dropdown menu={{ items: userMenu }} placement="bottomRight">
        <Button type="text" className={styles.userTrigger}>
          <Avatar size={24} src={avatarSrc} icon={<UserOutlined />} className={styles.userAvatar} />
          <span className={styles.user}>{displayName}</span>
        </Button>
      </Dropdown>
    </div>
  ) : (
    <div className={styles.actions}>
      {!isMobile ? <HeaderSearch inputRef={searchInputRef} /> : mobileSearchBtn}
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
    </div>
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
