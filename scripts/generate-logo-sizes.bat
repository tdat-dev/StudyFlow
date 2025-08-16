@echo off
REM Script để tạo các kích thước logo từ logo.png chính
REM Yêu cầu ImageMagick để chạy script này

REM Change to project root directory
cd /d "%~dp0.."

set IMG_DIR=public\images
set ORIGINAL=%IMG_DIR%\logo.png

REM Kiểm tra logo gốc có tồn tại không
if not exist "%ORIGINAL%" (
    echo ❌ Không tìm thấy %ORIGINAL%
    echo 📥 Vui lòng copy logo.png vào thư mục %IMG_DIR%
    echo 📍 Current directory: %CD%
    pause
    exit /b 1
)

echo 🎨 Đang tạo các kích thước logo khác nhau...

REM Tạo favicon sizes
magick "%ORIGINAL%" -resize 16x16 "%IMG_DIR%\logo-16.png"
magick "%ORIGINAL%" -resize 32x32 "%IMG_DIR%\logo-32.png"
magick "%ORIGINAL%" -resize 48x48 "%IMG_DIR%\logo-48.png"

REM Tạo PWA icons
magick "%ORIGINAL%" -resize 72x72 "%IMG_DIR%\logo-72.png"
magick "%ORIGINAL%" -resize 96x96 "%IMG_DIR%\logo-96.png"
magick "%ORIGINAL%" -resize 144x144 "%IMG_DIR%\logo-144.png"
magick "%ORIGINAL%" -resize 192x192 "%IMG_DIR%\logo-192.png"

REM Tạo Apple Touch Icons
magick "%ORIGINAL%" -resize 120x120 "%IMG_DIR%\logo-120.png"
magick "%ORIGINAL%" -resize 152x152 "%IMG_DIR%\logo-152.png"
magick "%ORIGINAL%" -resize 180x180 "%IMG_DIR%\logo-180.png"

REM Tạo favicon.ico
magick "%ORIGINAL%" -resize 16x16 "%IMG_DIR%\favicon-16.png"
magick "%ORIGINAL%" -resize 32x32 "%IMG_DIR%\favicon-32.png"
magick "%IMG_DIR%\favicon-16.png" "%IMG_DIR%\favicon-32.png" "%IMG_DIR%\favicon.ico"

REM Dọn dẹp file tạm
del "%IMG_DIR%\favicon-16.png" "%IMG_DIR%\favicon-32.png"

echo ✅ Hoàn thành! Đã tạo tất cả kích thước logo cần thiết.
echo 📁 Các file được tạo trong %IMG_DIR%:
dir "%IMG_DIR%\logo-*.png" "%IMG_DIR%\favicon.ico"

pause
