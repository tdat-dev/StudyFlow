# Hướng dẫn sử dụng File Upload & Download trong AI Chat

## 🚀 Tính năng mới

AI Chatbot của StudyFlow giờ đây hỗ trợ:

### 📤 **File Upload (Gửi file cho AI)**

- **Drag & Drop**: Kéo thả file trực tiếp vào chat input
- **Click Upload**: Click vào icon đính kèm để chọn file
- **File Preview**: Xem trước file đã chọn trước khi gửi
- **Real-time Processing**: Xử lý file ngay lập tức

### 📥 **File Download (Tải file từ AI)**

- **Auto-detect Code**: Tự động phát hiện code blocks trong AI response
- **Multiple Files**: Hỗ trợ tải nhiều file cùng lúc
- **Smart Naming**: Tự động đặt tên file phù hợp
- **One-click Download**: Tải file chỉ với 1 click

## 📁 Các loại file được hỗ trợ

### ✅ **Được hỗ trợ đầy đủ:**

- **Text Files**: `.txt`, `.md`, `.log`, `.ini`, `.conf`
- **Code Files**: `.js`, `.ts`, `.jsx`, `.tsx`, `.css`, `.html`, `.json`, `.xml`
- **Programming**: `.py`, `.java`, `.cpp`, `.c`, `.php`, `.sql`
- **Data Files**: `.yaml`, `.yml`, `.csv`
- **Images**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.svg`, `.webp`

### ✅ **Hỗ trợ đầy đủ với AI Analysis:**

- **PDF**: `.pdf` - AI đọc và phân tích toàn bộ nội dung
- **Word**: `.doc`, `.docx` - AI đọc và phân tích document
- **Excel**: `.xlsx`, `.xls` - AI đọc và phân tích dữ liệu
- **PowerPoint**: `.ppt`, `.pptx` - AI phân tích metadata và đưa ra gợi ý

### ❌ **Không được hỗ trợ:**

- **Archive Files**: `.zip`, `.rar`, `.7z`, `.tar`, `.gz`
- **Binary Files**: `.exe`, `.dll`, `.bin`
- **Media Files**: `.mp4`, `.mp3`, `.avi` (trừ hình ảnh)

## 🎯 Cách sử dụng

### 1. **Gửi file cho AI**

#### Cách 1: Drag & Drop

```
1. Kéo file từ máy tính
2. Thả vào vùng chat input (sẽ có border xanh)
3. File sẽ được xử lý tự động
4. Xem preview và gửi tin nhắn
```

#### Cách 2: Click Upload

```
1. Click vào icon đính kèm (📎) trong chat input
2. Chọn file từ máy tính
3. File sẽ được xử lý tự động
4. Xem preview và gửi tin nhắn
```

### 2. **Tải file từ AI**

#### Tự động phát hiện

````
1. AI trả lời có chứa code blocks (```)
2. Button "Tải xuống" xuất hiện khi hover
3. Click để tải file về máy
````

#### Nhiều file

```
1. Nếu AI trả lời có nhiều code blocks
2. Click "Tải xuống" sẽ hiện menu chọn file
3. Chọn file muốn tải
```

## 💡 Ví dụ sử dụng

### **Gửi code file cho AI review:**

```
1. Upload file .js hoặc .ts
2. Gửi tin nhắn: "Hãy review code này và đưa ra gợi ý cải thiện"
3. AI sẽ phân tích code và đưa ra feedback
```

### **Gửi hình ảnh cho AI phân tích:**

```
1. Upload file hình ảnh (.jpg, .png, .svg)
2. Gửi tin nhắn: "Hãy mô tả hình ảnh này"
3. AI sẽ phân tích và mô tả nội dung hình ảnh
```

### **Tải code từ AI:**

```
1. Hỏi AI: "Hãy tạo một component React cho button"
2. AI trả lời với code block
3. Click "Tải xuống" để lưu file .tsx
```

## 🔧 Technical Details

### **File Processing:**

- **Max Size**: 10MB per file
- **Encoding**: UTF-8 for text files
- **Security**: Client-side processing only
- **Error Handling**: User-friendly error messages

### **Download Features:**

- **Auto-detect**: Regex pattern matching for code blocks
- **MIME Types**: Proper MIME type detection
- **File Naming**: Smart naming based on content
- **Browser Support**: Works on all modern browsers

## 🚨 Lưu ý quan trọng

1. **File Size**: Giới hạn 10MB per file
2. **Security**: File được xử lý hoàn toàn trên client-side
3. **Privacy**: Nội dung file không được lưu trữ trên server
4. **Performance**: File lớn có thể mất thời gian xử lý
5. **Browser**: Cần browser hỗ trợ FileReader API

## 🐛 Troubleshooting

### **File không upload được:**

- Kiểm tra kích thước file (< 10MB)
- Kiểm tra loại file có được hỗ trợ không
- Thử refresh trang và upload lại

### **File không download được:**

- Kiểm tra popup blocker
- Thử click chuột phải và "Save as"
- Kiểm tra quyền ghi file trong thư mục Downloads

### **AI không đọc được file:**

- **PDF/Word/Excel**: AI giờ đây có thể đọc tự động
- **Hình ảnh**: AI phân tích nội dung với Gemini Vision
- **Code**: AI phân tích và review code tự động
- **File lỗi**: Kiểm tra file không bị corrupt và < 10MB

## 🔮 Roadmap

### **Sắp tới:**

- [x] ✅ Hỗ trợ đọc PDF với PDF.js
- [x] ✅ Hỗ trợ đọc Word với mammoth.js
- [x] ✅ Hỗ trợ đọc Excel với SheetJS
- [x] ✅ AI phân tích hình ảnh với Gemini Vision
- [x] ✅ AI phân tích code và documents
- [ ] Batch upload nhiều file cùng lúc
- [ ] File history và quản lý
- [ ] Advanced PowerPoint content reading

### **Tương lai:**

- [ ] Cloud storage integration
- [ ] File versioning
- [ ] Collaborative file editing
- [ ] Advanced file search

---

**Hỗ trợ**: Nếu gặp vấn đề, vui lòng báo cáo qua GitHub Issues hoặc liên hệ team phát triển.
