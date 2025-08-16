const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

console.log('🎨 Đang tạo các kích thước logo khác nhau...');

// Kiểm tra ImageMagick
try {
  execSync('magick -version', { stdio: 'pipe' });
} catch (error) {
  console.log('❌ ImageMagick không được cài đặt');
  console.log('📥 Cài đặt ImageMagick:');
  console.log('   Windows: choco install imagemagick');
  console.log('   Mac: brew install imagemagick');
  console.log('   Linux: sudo apt install imagemagick');
  process.exit(1);
}

// Danh sách các kích thước cần tạo
const sizes = [
  { size: '16x16', name: 'logo-16.png' },
  { size: '32x32', name: 'logo-32.png' },
  { size: '48x48', name: 'logo-48.png' },
  { size: '72x72', name: 'logo-72.png' },
  { size: '96x96', name: 'logo-96.png' },
  { size: '120x120', name: 'logo-120.png' },
  { size: '144x144', name: 'logo-144.png' },
  { size: '152x152', name: 'logo-152.png' },
  { size: '180x180', name: 'logo-180.png' },
  { size: '192x192', name: 'logo-192.png' },
];

// Tạo các kích thước logo
try {
  sizes.forEach(({ size, name }) => {
    const output = path.join(IMG_DIR, name);
    const command = `magick "${ORIGINAL}" -resize ${size} "${output}"`;

    console.log(`✅ Tạo ${name} (${size})`);
    execSync(command, { stdio: 'pipe' });
  });

  // Tạo favicon.ico
  console.log('✅ Tạo favicon.ico');
  const favicon16 = path.join(IMG_DIR, 'favicon-16.png');
  const favicon32 = path.join(IMG_DIR, 'favicon-32.png');
  const faviconIco = path.join(IMG_DIR, 'favicon.ico');

  execSync(`magick "${ORIGINAL}" -resize 16x16 "${favicon16}"`, {
    stdio: 'pipe',
  });
  execSync(`magick "${ORIGINAL}" -resize 32x32 "${favicon32}"`, {
    stdio: 'pipe',
  });
  execSync(`magick "${favicon16}" "${favicon32}" "${faviconIco}"`, {
    stdio: 'pipe',
  });

  // Dọn dẹp files tạm
  fs.unlinkSync(favicon16);
  fs.unlinkSync(favicon32);

  console.log('🎉 Hoàn thành! Đã tạo tất cả kích thước logo cần thiết.');
  console.log('📁 Các file được tạo trong', IMG_DIR);

  // Liệt kê files đã tạo
  const createdFiles = fs
    .readdirSync(IMG_DIR)
    .filter(file => file.startsWith('logo-') || file === 'favicon.ico')
    .sort();

  createdFiles.forEach(file => {
    console.log(`   ✓ ${file}`);
  });
} catch (error) {
  console.error('❌ Lỗi khi tạo logo:', error.message);
  process.exit(1);
}
