import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth, useErrorHandler } from "../hooks";
import { MainApp } from "./MainApp";
import { LoginForm, RegisterForm } from "./features/auth";

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
      </div>
      <p className="text-blue-900">Đang tải...</p>
    </div>
  </div>
);

export default function App() {
  const { user, loading, error } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    if (error) {
      handleError(new Error(error));
    }
  }, [error, handleError]);

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {user ? (
        <MainApp user={user} onLogout={() => {}} />
      ) : (
        <div className="min-h-screen flex items-center justify-center p-4">
          {showRegister ? (
            <RegisterForm
              onSuccess={() => setShowRegister(false)}
              onLogin={() => setShowRegister(false)}
            />
          ) : (
            <LoginForm
              onSuccess={() => {}}
              onRegister={() => setShowRegister(true)}
              onForgotPassword={() => {}}
            />
          )}
        </div>
      )}
    </div>
  );
}
