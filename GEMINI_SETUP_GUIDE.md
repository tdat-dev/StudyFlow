# 🔧 Hướng dẫn cấu hình Gemini API cho AI File Reading

## 🚀 Tại sao cần Gemini API?

Để AI có thể **đọc và phân tích hình ảnh**, StudyFlow cần tích hợp với **Google Gemini Vision API**. Đây là công nghệ AI tiên tiến cho phép:

- 📸 **Phân tích hình ảnh** - mô tả chi tiết nội dung
- 🔍 **OCR (Optical Character Recognition)** - đọc text trong hình
- 📊 **Nhận diện biểu đồ và diagram** - phân tích charts, graphs
- 🎯 **Context understanding** - hiểu ngữ cảnh và ý nghĩa

## 🔑 Cách lấy Gemini API Key

### Bước 1: Truy cập Google AI Studio

1. Vào [Google AI Studio](https://aistudio.google.com/)
2. Đăng nhập bằng Google account
3. Click **"Get API Key"**

### Bước 2: Tạo API Key

1. Click **"Create API Key"**
2. Chọn project hoặc tạo project mới
3. Copy API key được tạo

### Bước 3: Cấu hình trong StudyFlow

1. Tạo file `.env.local` trong thư mục gốc của project
2. Thêm dòng sau:

```bash
# Gemini AI Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

**Ví dụ:**

```bash
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🛠️ Cấu hình hoàn chỉnh

Tạo file `.env.local` với nội dung:

```bash
# Firebase Configuration (nếu chưa có)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Gemini AI Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

## 🔄 Restart Development Server

Sau khi cấu hình API key:

```bash
# Stop development server (Ctrl+C)
# Restart development server
npm run dev
```

## ✅ Kiểm tra cấu hình

### Cách 1: Upload hình ảnh test

1. Upload một hình ảnh vào chat
2. Nếu AI phân tích được nội dung hình → ✅ Cấu hình thành công
3. Nếu AI chỉ hiển thị "Hình ảnh đã được upload" → ❌ Cần kiểm tra API key

### Cách 2: Check console logs

1. Mở Developer Tools (F12)
2. Upload hình ảnh
3. Xem console có lỗi API không

## 🚨 Troubleshooting

### Lỗi: "API key not found"

- ✅ Kiểm tra file `.env.local` có tồn tại không
- ✅ Kiểm tra tên biến `NEXT_PUBLIC_GEMINI_API_KEY`
- ✅ Restart development server

### Lỗi: "Invalid API key"

- ✅ Kiểm tra API key có đúng không
- ✅ Kiểm tra API key có được enable không trong Google AI Studio
- ✅ Kiểm tra quota và billing

### Lỗi: "Rate limit exceeded"

- ✅ API key có thể đã hết quota
- ✅ Cần upgrade billing plan hoặc đợi reset quota

### AI không phân tích hình ảnh

- ✅ Kiểm tra network connection
- ✅ Kiểm tra console logs
- ✅ Thử với hình ảnh khác

## 💰 Chi phí Gemini API

### Pricing (tính đến 2024):

- **Free tier**: 15 requests/minute, 1M tokens/month
- **Paid tier**: $0.0005 per 1K tokens

### Tips tiết kiệm:

- Chỉ sử dụng khi cần thiết
- Tối ưu kích thước hình ảnh
- Sử dụng fallback khi API fail

## 🔒 Bảo mật

### Best Practices:

- ✅ **Không commit** file `.env.local` vào git
- ✅ **Không chia sẻ** API key công khai
- ✅ **Sử dụng environment variables** trong production
- ✅ **Rotate API keys** định kỳ

### Production Deployment:

```bash
# Vercel
vercel env add NEXT_PUBLIC_GEMINI_API_KEY

# Netlify
# Thêm trong Site Settings > Environment Variables

# Firebase Hosting
# Cấu hình trong Firebase Console
```

## 🎯 Kết quả sau khi cấu hình

Sau khi cấu hình thành công, AI sẽ có thể:

### 📸 **Phân tích hình ảnh:**

```
User: Upload screenshot.png
AI: "Đây là screenshot của một form đăng ký với các trường:
- Email input field
- Password input field
- Submit button màu xanh
- Logo công ty ở góc trên trái
..."
```

### 🔍 **OCR - Đọc text trong hình:**

```
User: Upload image có chứa text
AI: "Trong hình có đoạn text: 'Welcome to StudyFlow!
Learn English with AI tutor...'"
```

### 📊 **Phân tích biểu đồ:**

```
User: Upload chart.png
AI: "Đây là biểu đồ cột thể hiện doanh số theo tháng:
- Tháng 1: 100k
- Tháng 2: 150k
- Tháng 3: 200k
Xu hướng tăng trưởng tích cực..."
```

## 🆘 Hỗ trợ

Nếu gặp vấn đề:

1. Kiểm tra [Google AI Studio Documentation](https://ai.google.dev/docs)
2. Tạo issue trên GitHub repository
3. Liên hệ team phát triển

---

**🎉 Sau khi cấu hình xong, AI sẽ có khả năng "nhìn" và phân tích hình ảnh một cách thông minh!**
