import fs from 'fs';
import path from 'path';

const srcHtmlPath = 'c:/Users/burla/Downloads/oneatlas_marketing (2) (1).html';
const destStylesDir = 'c:/Users/burla/Downloads/templates/src/styles';

if (!fs.existsSync(destStylesDir)) {
  fs.mkdirSync(destStylesDir, { recursive: true });
}

const html = fs.readFileSync(srcHtmlPath, 'utf8');

// Regex to find all <style> blocks
const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
let match;
let combinedCss = '';
while ((match = styleRegex.exec(html)) !== null) {
  combinedCss += match[1].trim() + '\n\n';
}

if (!combinedCss) {
  console.error('No CSS blocks found in HTML file.');
  process.exit(1);
}

// List of target CSS filenames
const cssFiles = [
  'globals.css',
  'layout.css',
  'marketplace.css',
  'workspace.css',
  'chatbot.css',
  'dashboard.css',
  'responsive.css',
];

cssFiles.forEach((file) => {
  const targetPath = path.join(destStylesDir, file);
  fs.writeFileSync(targetPath, combinedCss, 'utf8');
  console.log(`Written ${file}`);
});

console.log('CSS extraction completed successfully.');
