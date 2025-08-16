# 🎨 Setup Logo cho StudyFlow - Hướng Dẫn Hoàn Chỉnh

## ✅ Trạng Thái Hiện Tại

- ✅ Logo chính đã có: `public/images/logo.png`
- ✅ Scripts đã sẵn sàng
- ❌ Các sizes khác chưa có (cần generate)

## 🚀 Cách Tạo Logo Sizes

### Phương Án 1: Sử dụng ImageMagick

#### Bước 1: Cài ImageMagick

**Option A: Download trực tiếp (Khuyến nghị)**

1. Vào https://imagemagick.org/script/download.php#windows
2. Download "ImageMagick-7.x.x-Q16-HDRI-x64-dll.exe"
3. Chạy installer và tick "Add application directory to your system path"
4. Restart Command Prompt

**Option B: Với Chocolatey (nếu đã có)**

```bash
choco install imagemagick
```

**Option C: Với Winget**

```bash
winget install ImageMagick.ImageMagick
```

#### Bước 2: Kiểm tra cài đặt

```bash
magick -version
```

#### Bước 3: Chạy Script

```bash
# Từ root directory
npm run generate-logos:win

# Hoặc
scripts\generate-logo-sizes.bat
```

### Phương Án 2: Online Tools (Dễ nhất)

#### Bước 1: Upload logo

- Vào https://favicon.io/favicon-converter/
- Upload file `public/images/logo.png`
- Download package

#### Bước 2: Extract và copy

```
Download → Extract → Copy vào public/images/
├── favicon-16x16.png → logo-16.png
├── favicon-32x32.png → logo-32.png
├── apple-touch-icon.png → logo-180.png
├── android-chrome-192x192.png → logo-192.png
└── favicon.ico → favicon.ico
```

#### Bước 3: Tạo thêm sizes còn lại

Resize logo.png để tạo:

- logo-48.png (48x48)
- logo-72.png (72x72)
- logo-96.png (96x96)
- logo-120.png (120x120)
- logo-144.png (144x144)
- logo-152.png (152x152)

### Phương Án 3: Manual (Photoshop/GIMP)

1. Mở `logo.png` trong image editor
2. Resize và save as các sizes:

```
Required Files:
├── logo-16.png    (16x16)
├── logo-32.png    (32x32)
├── logo-48.png    (48x48)
├── logo-72.png    (72x72)
├── logo-96.png    (96x96)
├── logo-120.png   (120x120)
├── logo-144.png   (144x144)
├── logo-152.png   (152x152)
├── logo-180.png   (180x180)
├── logo-192.png   (192x192)
└── favicon.ico    (16x16 + 32x32)
```

## 🔍 Kiểm Tra Setup

### Kiểm tra logo hiện tại:

```bash
npm run check-logo
```

### Test website:

```bash
npm run dev
```

Mở http://localhost:3000 và kiểm tra:

- Logo trong header
- Logo ở welcome screen
- Favicon trong browser tab

## 📱 Kết Quả Mong Đợi

Sau khi setup xong, bạn sẽ có:

- ✅ Logo trong header (32x32)
- ✅ Logo trong welcome screen (96x96)
- ✅ Favicon trong browser tab
- ✅ PWA icons cho mobile
- ✅ Apple Touch icons cho iOS

## 🆘 Troubleshooting

### Script không chạy được:

```bash
# Kiểm tra từ root directory
cd "c:\Users\tvmar\Desktop\Ứng dụng Học Tiếng Anh"
dir public\images
```

### ImageMagick không cài được:

- Download manual: https://imagemagick.org/script/download.php#windows
- Hoặc dùng online tools (phương án 2)

### Logo không hiển thị:

- Clear browser cache
- Kiểm tra file paths trong DevTools
- Restart dev server

## 💡 Tips

- Logo nên có background trong suốt
- Kích thước gốc tối thiểu 512x512px
- Test trên nhiều devices
- Check PWA manifest cho mobile install
