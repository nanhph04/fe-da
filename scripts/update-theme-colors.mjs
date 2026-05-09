/**
 * Script to replace hardcoded colors with theme tokens
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Color mappings
const colorMappings = {
  "#ff8e80": "var(--color-primary-600)",
  "#ff7668": "var(--color-primary-700)",
  "#fdc003": "var(--color-secondary-600)",
  "#fbbf24": "var(--color-secondary-700)",
  "#0e0e10": "var(--color-background-950)",
  "#1e293b": "var(--color-background-900)",
  "#f9f5f8": "var(--color-text-50)",
  "#94a3b8": "var(--color-text-400)",
  "#262528": "var(--color-border-700)",
  "#19191c": "var(--color-background-900)",
};

export function replaceColorsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    const originalContent = content;

    Object.entries(colorMappings).forEach(([from, to]) => {
      const regex = new RegExp(from.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "g");
      content = content.replace(regex, to);
    });

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`Updated: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error processing ${filePath}:`, message);
    return false;
  }
}

export function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  let updatedCount = 0;

  files.forEach(file => {
    const filePath = path.join(directory, file);

    if (fs.statSync(filePath).isDirectory() && file !== "node_modules") {
      updatedCount += processDirectory(filePath);
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      if (replaceColorsInFile(filePath)) {
        updatedCount++;
      }
    }
  });

  return updatedCount;
}

const isMainModule = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (isMainModule) {
  const targetDirectory = process.argv[2] || "src";
  console.log(`Processing files in: ${targetDirectory}`);

  const startTime = Date.now();
  const updatedFiles = processDirectory(targetDirectory);
  const endTime = Date.now();

  console.log(`\nComplete! Updated ${updatedFiles} files in ${endTime - startTime}ms`);

  if (updatedFiles === 0) {
    console.log("\nNo hardcoded colors found. Colors are already using theme tokens.");
  }
}
