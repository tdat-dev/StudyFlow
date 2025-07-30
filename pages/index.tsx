import dynamic from 'next/dynamic'

// Sử dụng dynamic import để tránh lỗi SSR
const App = dynamic(() => import('../App'), {
  ssr: false
})

export default function Home() {
  return <App />
} 