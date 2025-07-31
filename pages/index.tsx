import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Sử dụng dynamic import để tránh lỗi SSR
const App = dynamic(() => import('../App'), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center">
    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
})

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <App />
    </Suspense>
  )
} 