import React from "react";

export function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 border-t">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-2 md:mb-0">
            <p className="text-sm text-gray-600">
              &copy; {new Date().getFullYear()} Bản quyền.
            </p>
          </div>

          <div className="flex space-x-4">
            <a href="#" className="text-sm text-gray-600 hover:text-blue-600">
              Điều khoản sử dụng
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-blue-600">
              Chính sách bảo mật
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-blue-600">
              Liên hệ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
