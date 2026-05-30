/* eslint-disable */
const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // If it imports redirect from @/i18n/routing, remove it and add it to next/navigation
    if (content.includes('import { redirect } from "@/i18n/routing"')) {
      content = content.replace('import { redirect } from "@/i18n/routing";\n', '');
      content = 'import { redirect } from "next/navigation";\n' + content;
    } else if (content.includes('redirect') && /import\s+{([^}]*)\bredirect\b([^}]*)}\s+from\s+["']@\/i18n\/routing["']/.test(content)) {
      content = content.replace(/import\s+{([^}]*)\bredirect\b([^}]*)}\s+from\s+["']@\/i18n\/routing["'];?/, (match, p1, p2) => {
        let newImport = `import {${p1}${p2}} from "@/i18n/routing";`.replace(/,\s*,/g, ',').replace(/{\s*,/, '{').replace(/,\s*}/, '}');
        if (newImport.includes('{}')) newImport = '';
        return newImport;
      });
      // Add redirect to next/navigation
      if (/import\s+{([^}]+)}\s+from\s+["']next\/navigation["']/.test(content)) {
        content = content.replace(/import\s+{([^}]+)}\s+from\s+["']next\/navigation["']/, 'import { $1, redirect } from "next/navigation"');
      } else {
        content = 'import { redirect } from "next/navigation";\n' + content;
      }
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Reverted redirect in ${filePath}`);
    }
  }
});
