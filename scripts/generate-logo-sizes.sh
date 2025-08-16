#!/bin/bash

# Script để tạo các kích thước logo từ logo.png chính
# Yêu cầu ImageMagick để chạy script này

# Change to project root directory
cd "$(dirname "$0")/.."

# Đường dẫn đến thư mục images
IMG_DIR="public/images"

# Logo gốc
ORIGINAL="$IMG_DIR/logo.png"

# Kiểm tra logo gốc có tồn tại không
if [ ! -f "$ORIGINAL" ]; then
    echo "❌ Không tìm thấy $ORIGINAL"
    echo "📥 Vui lòng copy logo.png vào thư mục $IMG_DIR"
    echo "📍 Current directory: $(pwd)"
    exit 1
fi

echo "🎨 Đang tạo các kích thước logo khác nhau..."

# Tạo favicon sizes
convert "$ORIGINAL" -resize 16x16 "$IMG_DIR/logo-16.png"
convert "$ORIGINAL" -resize 32x32 "$IMG_DIR/logo-32.png"
convert "$ORIGINAL" -resize 48x48 "$IMG_DIR/logo-48.png"

# Tạo PWA icons
convert "$ORIGINAL" -resize 72x72 "$IMG_DIR/logo-72.png"
convert "$ORIGINAL" -resize 96x96 "$IMG_DIR/logo-96.png"
convert "$ORIGINAL" -resize 144x144 "$IMG_DIR/logo-144.png"
convert "$ORIGINAL" -resize 192x192 "$IMG_DIR/logo-192.png"

# Tạo Apple Touch Icons
convert "$ORIGINAL" -resize 120x120 "$IMG_DIR/logo-120.png"
convert "$ORIGINAL" -resize 152x152 "$IMG_DIR/logo-152.png"
convert "$ORIGINAL" -resize 180x180 "$IMG_DIR/logo-180.png"

# Tạo favicon.ico
convert "$ORIGINAL" -resize 16x16 "$IMG_DIR/favicon-16.png"
convert "$ORIGINAL" -resize 32x32 "$IMG_DIR/favicon-32.png"
convert "$IMG_DIR/favicon-16.png" "$IMG_DIR/favicon-32.png" "$IMG_DIR/favicon.ico"

# Dọn dẹp file tạm
rm "$IMG_DIR/favicon-16.png" "$IMG_DIR/favicon-32.png"

echo "✅ Hoàn thành! Đã tạo tất cả kích thước logo cần thiết."
echo "📁 Các file được tạo trong $IMG_DIR:"
ls -la "$IMG_DIR"/logo-*.png "$IMG_DIR"/favicon.ico
