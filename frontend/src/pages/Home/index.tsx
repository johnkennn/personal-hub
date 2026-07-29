import { Link } from 'react-router-dom'

import { ROUTES } from '../../router/paths'

export function HomePage() {
  return (
    <div>
      <p>Personal Hub</p>
      <h1>用作品与文字，记录全栈成长</h1>
      <p>
        这里是我的个人站点：分享技术博客，展示项目实践，并持续迭代可上线的工程能力。
      </p>

      <p>
        <Link to={ROUTES.BLOG}>阅读博客</Link>
        {' · '}
        <Link to={ROUTES.PROJECTS}>查看项目</Link>
        {' · '}
        <Link to={ROUTES.ABOUT}>关于我</Link>
      </p>
    </div>
  )
}