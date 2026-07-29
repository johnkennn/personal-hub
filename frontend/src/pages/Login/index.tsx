import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { login } from '../../api/auth'
import { ROUTES } from '../../router/paths'
import { setAuth } from '../../utils/authStorage'

export function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await login({ username, password })
      const data = res.data.data
      setAuth(data.token, data.username)
      navigate(ROUTES.BLOG)
    } catch {
      setError('登录失败，请检查用户名或密码')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1>管理员登录</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">用户名</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div>
          <label htmlFor="password">密码</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        {error ? <p>{error}</p> : null}
        <button type="submit" disabled={submitting}>
          {submitting ? '登录中...' : '登录'}
        </button>
      </form>
    </div>
  )
}
