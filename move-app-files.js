/* eslint-disable */
const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'src', 'app');
const localeDir = path.join(appDir, '[locale]');

if (!fs.existsSync(localeDir)) {
  fs.mkdirSync(localeDir);
}

const items = fs.readdirSync(appDir);
const exclude = ['api', 'favicon.ico', 'globals.css', '[locale]'];

items.forEach(item => {
  if (!exclude.includes(item)) {
    const oldPath = path.join(appDir, item);
    const newPath = path.join(localeDir, item);
    fs.renameSync(oldPath, newPath);
    console.log(`Moved ${item} to [locale]`);
  }
});
