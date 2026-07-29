export function AboutPage() {
  return (
    <div>
      <h1>关于我</h1>

      <section>
        <h2>简介</h2>
        <p>
          我是一名前端工程师，正在通过 Personal Hub
          系统学习全栈开发与工程化实践。
        </p>
      </section>

      <section>
        <h2>技术方向</h2>
        <ul>
          <li>前端：React、TypeScript、工程化</li>
          <li>后端：Spring Boot、MySQL、JWT</li>
          <li>工程：Git 工作流、部署与 CI/CD（进行中）</li>
        </ul>
      </section>

      <section>
        <h2>这个项目</h2>
        <p>
          Personal Hub 用于展示个人博客与项目作品，同时作为长期可上线的实践项目。
        </p>
      </section>

      <section>
        <h2>联系方式</h2>
        <ul>
          <li>
            GitHub：{' '}
            <a
              href="https://github.com/johnkennn"
              target="_blank"
              rel="noreferrer"
            >
              johnkennn
            </a>
          </li>
          {/* 可再加邮箱 / 博客等 */}
        </ul>
      </section>
    </div>
  )
}