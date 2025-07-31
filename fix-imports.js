const fs = require('fs');
const path = require('path');

const UI_COMPONENTS_DIR = path.join(__dirname, 'components', 'ui');

function fixImports() {
  try {
    const files = fs.readdirSync(UI_COMPONENTS_DIR).filter(file => file.endsWith('.tsx'));
    
    for (const file of files) {
      const filePath = path.join(UI_COMPONENTS_DIR, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Tìm và thay thế tất cả các import có chứa phiên bản cụ thể
      const fixedContent = content.replace(/from\s+["']([^"']+)@[0-9][^"']*["']/g, (match, p1) => {
        // Lấy phần tên package (không bao gồm phiên bản)
        return `from "${p1}"`;
      });
      
      // Ghi lại nội dung đã sửa vào file
      if (content !== fixedContent) {
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        console.log(`Fixed imports in ${file}`);
      }
    }
    
    console.log('All imports fixed successfully!');
  } catch (error) {
    console.error('Error fixing imports:', error);
  }
}

fixImports(); 