import { useEffect, useState } from 'react'

import { fetchHello } from '../../api/hello'

export function HomePage() {
  const [text, setText] = useState('')

  useEffect(() => {
    fetchHello().then((res) => {
      // console.log(res)
      setText(res.data.data)
    }).catch(() => {
      setText('接口请求失败')
    })
  }, [])

  return <h1>{text}</h1>
}
