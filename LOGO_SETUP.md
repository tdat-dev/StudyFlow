# 🎨 Hướng Dẫn Setup Logo cho StudyFlow

## 📥 Bước 1: Copy Logo

1. **Lưu logo chính** (hình ảnh bạn đã gửi) với tên `logo.png` vào thư mục:
   ```
   public/images/logo.png
   ```
2. **Kích thước khuyến nghị**: 512x512px hoặc lớn hơn để tạo các size nhỏ

## 🔧 Bước 2: Generate Các Kích Thước

Có 3 cách để tạo các kích thước logo:

### Cách 1: Sử dụng ImageMagick (Khuyến nghị)

```bash
# Cài ImageMagick trước
# Windows: choco install imagemagick
# Mac: brew install imagemagick
# Linux: sudo apt install imagemagick

# Chạy script
scripts/generate-logo-sizes.bat  # Windows
scripts/generate-logo-sizes.sh   # Linux/Mac
```

### Cách 2: Online Tools

- Sử dụng [favicon.io](https://favicon.io/favicon-converter/)
- Upload logo và download tất cả sizes
- Copy vào `public/images/`

### Cách 3: Manual (Photoshop/GIMP)

Tạo thủ công các file:

```
public/images/
├── logo.png          # 512x512 (chính)
├── logo-16.png       # 16x16 (favicon)
├── logo-32.png       # 32x32 (favicon)
├── logo-48.png       # 48x48 (PWA)
├── logo-72.png       # 72x72 (PWA)
├── logo-96.png       # 96x96 (PWA)
├── logo-120.png      # 120x120 (Apple)
├── logo-144.png      # 144x144 (PWA)
├── logo-152.png      # 152x152 (Apple)
├── logo-180.png      # 180x180 (Apple)
├── logo-192.png      # 192x192 (PWA)
└── favicon.ico       # Multi-size ICO
```

## ✅ Bước 3: Kiểm Tra

1. **Build và test**:

   ```bash
   npm run build
   npm run dev
   ```

2. **Kiểm tra các vị trí logo xuất hiện**:
   - Header (32x32)
   - Welcome screen (96x96)
   - Browser tab (favicon)
   - PWA install

## 🎯 Files Đã Được Cập Nhật

### ✅ Components

- `Header.tsx` - Logo trong navigation bar
- `WelcomeScreen.tsx` - Logo lớn ở trang chào mừng
- `Logo.tsx` - Component tái sử dụng

### ✅ Configuration

- `App.tsx` - Meta tags, favicon links
- `manifest.json` - PWA icons
- `public/images/` - Thư mục chứa logo

### ✅ Features

- **Responsive logo** - Tự động scale theo screen size
- **Dark mode support** - Logo hiển thị tốt ở cả 2 theme
- **PWA ready** - Icons cho Progressive Web App
- **SEO optimized** - Open Graph, Twitter Cards

## 🚀 Next Steps

1. Copy logo.png vào `public/images/`
2. Run script generate sizes
3. Test build
4. Deploy và enjoy! 🎉

## 💡 Tips

- Logo nên có background trong suốt (PNG)
- Thiết kế simple để scale tốt ở size nhỏ
- Test trên nhiều devices và browsers
- Cân nhắc tạo variant cho dark mode nếu cần
