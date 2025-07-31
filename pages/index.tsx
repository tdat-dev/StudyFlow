import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Sử dụng dynamic import để tránh lỗi SSR
const App = dynamic(() => import('../App'), {
  ssr: false,
  loading: () => null
})

export default function Home() {
  return (
    <Suspense fallback={null}>
      <App />
    </Suspense>
  )
} 