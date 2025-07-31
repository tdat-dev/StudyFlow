import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import '@/styles/globals.css'
import { useEffect } from 'react'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { AuthProvider } from '@/contexts/AuthContext'
import { AppStateProvider } from '@/contexts/AppStateContext'

export default function App({ Component, pageProps }: AppProps) {
  // Đảm bảo các thay đổi được áp dụng ngay lập tức
  useEffect(() => {
    // Để trống - chỉ để kích hoạt Fast Refresh
  }, [])

  // Xử lý lỗi toàn cục
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Ghi log lỗi
    console.error('Global error caught:', error, errorInfo)
    
    // Gửi lỗi đến dịch vụ theo dõi lỗi trong môi trường production
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error)
    }
  }

  return (
    <ErrorBoundary onError={handleError}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AppStateProvider>
          <AuthProvider>
            <Component {...pageProps} />
            <Toaster position="top-center" />
          </AuthProvider>
        </AppStateProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}