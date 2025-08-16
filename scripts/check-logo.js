const fs = require('fs');
const path = require('path');

// Đường dẫn đến thư mục images
const IMG_DIR = path.join(__dirname, '..', 'public', 'images');
const ORIGINAL = path.join(IMG_DIR, 'logo.png');

// Kiểm tra logo gốc có tồn tại không
if (!fs.existsSync(ORIGINAL)) {
  console.log('❌ Không tìm thấy', ORIGINAL);
  console.log('📥 Vui lòng copy logo.png vào thư mục public/images');
  console.log('📍 Current directory:', process.cwd());
  process.exit(1);
}

console.log('✅ Tìm thấy logo.png!');
console.log('📁 Logo path:', ORIGINAL);

// Check file size
const stats = fs.statSync(ORIGINAL);
console.log('📊 File size:', (stats.size / 1024).toFixed(2), 'KB');

// Tạo danh sách files cần có
const requiredSizes = [
  'logo-16.png',
  'logo-32.png',
  'logo-48.png',
  'logo-72.png',
  'logo-96.png',
  'logo-120.png',
  'logo-144.png',
  'logo-152.png',
  'logo-180.png',
  'logo-192.png',
  'favicon.ico',
];

console.log('\n📋 Files cần tạo:');
requiredSizes.forEach(file => {
  const filePath = path.join(IMG_DIR, file);
  const exists = fs.existsSync(filePath);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

console.log('\n💡 Để tạo các kích thước logo:');
console.log('1. Cài ImageMagick:');
console.log('   Windows: choco install imagemagick');
console.log('   Mac: brew install imagemagick');
console.log('   Linux: sudo apt install imagemagick');
console.log('');
console.log('2. Hoặc sử dụng online tools:');
console.log('   https://favicon.io/favicon-converter/');
console.log('   https://realfavicongenerator.net/');
console.log('');
console.log('3. Sau đó chạy: npm run generate-logos');

// Tạo template HTML để preview logo
const htmlTemplate = `<!DOCTYPE html>
<html>
<head>
    <title>StudyFlow Logo Preview</title>
    <style>
        body { font-family: Arial; padding: 20px; background: #f5f5f5; }
        .logo-preview { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; }
        .logo-row { display: flex; align-items: center; margin: 10px 0; }
        .logo-row img { margin-right: 10px; border: 1px solid #ddd; }
    </style>
</head>
<body>
    <h1>🎨 StudyFlow Logo Preview</h1>
    
    <div class="logo-preview">
        <h2>📱 Current Logo</h2>
        <div class="logo-row">
            <img src="logo.png" width="64" height="64" alt="Logo 64px">
            <span>Original Logo (64px preview)</span>
        </div>
    </div>

    <div class="logo-preview">
        <h2>📏 Required Sizes</h2>
        <p>Sau khi generate, bạn sẽ có các sizes sau:</p>
        <ul>
            <li>16x16, 32x32 - Favicon</li>
            <li>48x48, 72x72, 96x96, 144x144, 192x192 - PWA Icons</li>
            <li>120x120, 152x152, 180x180 - Apple Touch Icons</li>
        </ul>
    </div>
</body>
</html>`;

const previewPath = path.join(IMG_DIR, 'logo-preview.html');
fs.writeFileSync(previewPath, htmlTemplate);
console.log('📄 Tạo logo preview:', previewPath);
console.log('   Mở file này trong browser để xem logo');
