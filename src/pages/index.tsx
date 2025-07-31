import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import Head from 'next/head'

// Sử dụng dynamic import để tránh lỗi SSR
const App = dynamic(() => import('@/components/App'), {
  ssr: false,
  loading: () => null
})

export default function Home() {
  return (
    <>
      <Head>
        <title>Ứng dụng Học Tiếng Anh</title>
        <meta name="description" content="Ứng dụng học tiếng Anh hiệu quả với AI Coach" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Suspense fallback={null}>
        <App />
      </Suspense>
    </>
  )
}