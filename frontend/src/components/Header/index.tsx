import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

import {
  clearAuth,
  getUsername,
  isLoggedIn,
  subscribeAuthChange,
} from '../../utils/authStorage'
import { NAV_ITEMS, ROUTES } from '../../router/paths'
import styles from './Header.module.css'

export function Header() {
  const navigate = useNavigate()
  const [loggedIn, setLoggedIn] = useState(isLoggedIn)
  const [username, setUsername] = useState(getUsername)

  useEffect(() => {
    const sync = () => {
      setLoggedIn(isLoggedIn())
      setUsername(getUsername())
    }

    return subscribeAuthChange(sync)
  }, [])

  function handleLogout() {
    clearAuth()
    // Leave admin contexts (edit/new/detail with manage actions) after logout
    navigate(ROUTES.HOME, { replace: true })
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.brand} end>
          Personal Hub
        </NavLink>
        <nav className={styles.nav} aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div>
          {loggedIn ? (
            <>
              <span>{username}</span>{' '}
              <Link to={ROUTES.ADMIN_ARTICLES}>文章管理</Link>{' '}
              <Link to={ROUTES.ADMIN_PROJECTS}>项目管理</Link>{' '}
              <button type="button" onClick={handleLogout}>
                退出
              </button>
            </>
          ) : (
            <Link to={ROUTES.LOGIN}>Login</Link>
          )}
        </div>
      </div>
    </header>
  )
}
