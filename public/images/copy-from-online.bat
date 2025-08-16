@echo off
echo 🎯 Script để copy files từ online favicon generator
echo.
echo 1. Vào https://favicon.io/favicon-converter/
echo 2. Upload logo.png và download package
echo 3. Extract và chạy script này từ thư mục extract
echo.
set /p continue="Press Enter để copy files từ thư mục hiện tại..."

if exist "favicon-16x16.png" copy "favicon-16x16.png" "c:\Users\tvmar\Desktop\Ứng dụng Học Tiếng Anh\public\images\logo-16.png"
if exist "favicon-32x32.png" copy "favicon-32x32.png" "c:\Users\tvmar\Desktop\Ứng dụng Học Tiếng Anh\public\images\logo-32.png"
if exist "apple-touch-icon.png" copy "apple-touch-icon.png" "c:\Users\tvmar\Desktop\Ứng dụng Học Tiếng Anh\public\images\logo-180.png"
if exist "android-chrome-192x192.png" copy "android-chrome-192x192.png" "c:\Users\tvmar\Desktop\Ứng dụng Học Tiếng Anh\public\images\logo-192.png"
if exist "favicon.ico" copy "favicon.ico" "c:\Users\tvmar\Desktop\Ứng dụng Học Tiếng Anh\public\images\favicon.ico"

echo ✅ Copy hoàn thành! Kiểm tra public/images/
pause