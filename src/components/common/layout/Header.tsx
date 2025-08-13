import React from "react";
// Button component
const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  onClick,
  ...props
}: {
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm";
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  };

  const sizeClasses = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};
import { User, LogOut } from "lucide-react";

interface HeaderProps {
  user: any;
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center" />

        <div className="flex items-center space-x-2">
          {user ? (
            <>
              <div className="flex items-center mr-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                )}
                <span className="text-gray-700">{user.name || user.email}</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-gray-600"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Đăng xuất
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm">
              Đăng nhập
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
