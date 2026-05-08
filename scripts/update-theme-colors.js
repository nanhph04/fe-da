/**
 * Script to replace hardcoded colors with theme tokens
 */

const fs = require('fs');
const path = require('path');

// Color mappings
const colorMappings = {
  '#ff8e80': 'var(--color-primary-600)',
  '#ff7668': 'var(--color-primary-700)',
  '#fdc003': 'var(--color-secondary-600)',
  '#fbbf24': 'var(--color-secondary-700)',
  '#0e0e10': 'var(--color-background-950)',
  '#1e293b': 'var(--color-background-900)',
  '#f9f5f8': 'var(--color-text-50)',
  '#94a3b8': 'var(--color-text-400)',
  '#262528': 'var(--color-border-700)',
  '#19191c': 'var(--color-background-900)',
};

// Function to replace colors in a file
function replaceColorsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Replace all color codes
    Object.entries(colorMappings).forEach(([from, to]) => {
      const regex = new RegExp(from.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
      content = content.replace(regex, to);
    });

    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to process all files in a directory
function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  let updatedCount = 0;

  files.forEach(file => {
    const filePath = path.join(directory, file);

    if (fs.statSync(filePath).isDirectory() && file !== 'node_modules') {
      // Recursively process subdirectories
      updatedCount += processDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      // Process TypeScript/React files
      if (replaceColorsInFile(filePath)) {
        updatedCount++;
      }
    }
  });

  return updatedCount;
}

// Main execution
if (require.main === module) {
  const targetDirectory = process.argv[2] || 'src';
  console.log(`🔄 Processing files in: ${targetDirectory}`);

  const startTime = Date.now();
  const updatedFiles = processDirectory(targetDirectory);

  const endTime = Date.now();
  console.log(`\n✨ Complete! Updated ${updatedFiles} files in ${endTime - startTime}ms`);

  if (updatedFiles === 0) {
    console.log('\n🎯 No hardcoded colors found. Colors are already using theme tokens.');
  }
}

module.exports = { replaceColorsInFile, processDirectory };