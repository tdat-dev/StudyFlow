const fs = require('fs');
const path = require('path');

// Đường dẫn đến thư mục images
const IMG_DIR = path.join(__dirname, '..', 'public', 'images');
const ORIGINAL = path.join(IMG_DIR, 'logo.png');

// Kiểm tra logo gốc có tồn tại không
if (!fs.existsSync(ORIGINAL)) {
  console.log('❌ Không tìm thấy', ORIGINAL);
  console.log('📥 Vui lòng copy logo.png vào thư mục public/images');
  process.exit(1);
}

console.log('✅ Tìm thấy logo.png!');

// Danh sách các kích thước cần tạo
const sizes = [
  { width: 16, height: 16, name: 'logo-16.png' },
  { width: 32, height: 32, name: 'logo-32.png' },
  { width: 48, height: 48, name: 'logo-48.png' },
  { width: 72, height: 72, name: 'logo-72.png' },
  { width: 96, height: 96, name: 'logo-96.png' },
  { width: 120, height: 120, name: 'logo-120.png' },
  { width: 144, height: 144, name: 'logo-144.png' },
  { width: 152, height: 152, name: 'logo-152.png' },
  { width: 180, height: 180, name: 'logo-180.png' },
  { width: 192, height: 192, name: 'logo-192.png' },
];

async function generateLogosWithSharp() {
  try {
    // Thử import Sharp
    const sharp = require('sharp');

    console.log('🎨 Sử dụng Sharp để tạo logo sizes...');

    for (const { width, height, name } of sizes) {
      const outputPath = path.join(IMG_DIR, name);

      await sharp(ORIGINAL)
        .resize(width, height, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Tạo ${name} (${width}x${height})`);
    }

    // Tạo favicon.ico
    const favicon16 = path.join(IMG_DIR, 'favicon-16.png');
    const favicon32 = path.join(IMG_DIR, 'favicon-32.png');

    await sharp(ORIGINAL).resize(16, 16).png().toFile(favicon16);
    await sharp(ORIGINAL).resize(32, 32).png().toFile(favicon32);

    console.log('✅ Tạo favicon files');

    // Note: Sharp không tạo được .ico, cần tool khác
    console.log('ℹ️  Để tạo favicon.ico, sử dụng online converter:');
    console.log('   https://convertio.co/png-ico/');

    console.log('🎉 Hoàn thành với Sharp!');
  } catch (error) {
    console.log('❌ Sharp chưa được cài đặt');
    console.log('📦 Cài Sharp: npm install sharp --save-dev');
    console.log('');
    await generateWithoutDependencies();
  }
}

async function generateWithoutDependencies() {
  console.log('💡 Alternatives không cần dependencies:');
  console.log('');
  console.log('1. 🌐 Online Tools (Dễ nhất):');
  console.log('   https://favicon.io/favicon-converter/');
  console.log('   https://realfavicongenerator.net/');
  console.log('');
  console.log('2. 🖥️ Cài ImageMagick:');
  console.log(
    '   Download: https://imagemagick.org/script/download.php#windows',
  );
  console.log('   Sau đó chạy: npm run generate-logos:win');
  console.log('');
  console.log('3. 📝 Manual với Paint/GIMP:');
  console.log('   Resize logo.png thành các sizes:');
  sizes.forEach(({ width, height, name }) => {
    console.log(`   - ${name}: ${width}x${height}`);
  });

  // Tạo batch file để copy từ online tools
  const batchContent = `@echo off
echo 🎯 Script để copy files từ online favicon generator
echo.
echo 1. Vào https://favicon.io/favicon-converter/
echo 2. Upload logo.png và download package
echo 3. Extract và chạy script này từ thư mục extract
echo.
set /p continue="Press Enter để copy files từ thư mục hiện tại..."

if exist "favicon-16x16.png" copy "favicon-16x16.png" "${IMG_DIR}\\logo-16.png"
if exist "favicon-32x32.png" copy "favicon-32x32.png" "${IMG_DIR}\\logo-32.png"
if exist "apple-touch-icon.png" copy "apple-touch-icon.png" "${IMG_DIR}\\logo-180.png"
if exist "android-chrome-192x192.png" copy "android-chrome-192x192.png" "${IMG_DIR}\\logo-192.png"
if exist "favicon.ico" copy "favicon.ico" "${IMG_DIR}\\favicon.ico"

echo ✅ Copy hoàn thành! Kiểm tra public/images/
pause`;

  const batchPath = path.join(IMG_DIR, 'copy-from-online.bat');
  fs.writeFileSync(batchPath, batchContent);
  console.log('📄 Tạo helper script:', batchPath);
}

// Chạy function chính
generateLogosWithSharp();
