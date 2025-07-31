import type { AppProps } from 'next/app'
import '../styles/globals.css'
import { useEffect } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  // Đảm bảo các thay đổi được áp dụng ngay lập tức
  useEffect(() => {
    // Để trống - chỉ để kích hoạt Fast Refresh
  }, [])

  return <Component {...pageProps} />
} 