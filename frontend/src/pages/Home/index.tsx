import { useEffect, useState } from 'react'

import { request } from '../../api/request'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export function HomePage() {
  const [text, setText] = useState('')

  useEffect(() => {
    request
      .get<ApiResponse<string>>('/api/hello')
      .then((res) => {
        console.log(res)
        setText(res.data.data)
      })
      .catch(() => {
        setText('接口请求失败')
      })
  }, [])

  return <h1>{text}</h1>
}
