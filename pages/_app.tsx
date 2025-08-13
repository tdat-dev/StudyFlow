import type { AppProps } from "next/app";
import "../styles/globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { ErrorBoundary } from "../src/components/ui/error-boundary";
import { AuthProvider } from "../src/contexts/AuthContext";
import { AppStateProvider } from "../src/contexts/AppStateContext";

export default function App({ Component, pageProps }: AppProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error("Global error caught:", error, errorInfo);
    if (process.env.NODE_ENV === "production") {
      // send to monitoring here
    }
  };

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
  );
}
