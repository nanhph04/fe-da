const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const targets = ['useRouter', 'usePathname', 'redirect'];

walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Update next/link
    content = content.replace(/import Link from ["']next\/link["'];?/g, 'import { Link } from "@/i18n/routing";');

    // 2. Update next/navigation
    const navRegex = /import\s+{([^}]+)}\s+from\s+["']next\/navigation["'];?/g;
    content = content.replace(navRegex, (match, importsStr) => {
      const imports = importsStr.split(',').map(s => s.trim()).filter(s => s);
      const nextIntlImports = [];
      const nextNavImports = [];

      imports.forEach(imp => {
        if (targets.includes(imp)) {
          nextIntlImports.push(imp);
        } else {
          nextNavImports.push(imp);
        }
      });

      let newImportLines = [];
      if (nextIntlImports.length > 0) {
        newImportLines.push(`import { ${nextIntlImports.join(', ')} } from "@/i18n/routing";`);
      }
      if (nextNavImports.length > 0) {
        newImportLines.push(`import { ${nextNavImports.join(', ')} } from "next/navigation";`);
      }
      
      return newImportLines.join('\n');
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated imports in ${filePath}`);
    }
  }
});
