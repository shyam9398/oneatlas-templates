// migrate_scripts.js – extracts <script> blocks from the original HTML
// and writes them as TypeScript modules under src/scripts.
// It also updates index.html to load the bundled main.ts.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = process.cwd(); // assume cwd is project root
const htmlPath = path.join(projectRoot, 'index.html');
const srcDir = path.join(projectRoot, 'src');
const scriptsDir = path.join(srcDir, 'scripts');
if (!fs.existsSync(scriptsDir)) fs.mkdirSync(scriptsDir, { recursive: true });

let html = fs.readFileSync(htmlPath, 'utf-8');

// Regex to capture <script>...</script> blocks (including attributes)
const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
let match;
let scriptIndex = 0;
let imports = [];
while ((match = scriptRegex.exec(html)) !== null) {
  const attrs = match[1].trim();
  const content = match[2];
  // Skip external CDN scripts (e.g., chart.js) – keep as is.
  if (/src=\s*".*chart\.js"/.test(attrs)) continue;
  // Determine file name
  const fileName = `script${scriptIndex}.ts`;
  const filePath = path.join(scriptsDir, fileName);
  // Wrap content in a function to avoid polluting global scope
  const wrapped = `export function initScript${scriptIndex}() {\n${content}\n}\n`;
  fs.writeFileSync(filePath, wrapped, 'utf-8');
  // Create import line for main.ts
  imports.push(`import { initScript${scriptIndex} } from './scripts/${fileName}';`);
  scriptIndex++;
}

// Update main.ts to call all init functions after DOM is ready
const mainPath = path.join(srcDir, 'main.ts');
let mainContent = fs.readFileSync(mainPath, 'utf-8');
// Insert imports after existing imports (find last import line)
const importInsertPos = mainContent.lastIndexOf('import');
// Simple approach: prepend imports
mainContent = imports.join('\n') + '\n' + mainContent;
// Append init calls at end of file
mainContent += '\n// Initialize extracted scripts\n' + imports.map((_, i) => `initScript${i}();`).join('\n') + '\n';
fs.writeFileSync(mainPath, mainContent, 'utf-8');

// Finally, clean index.html: remove all inline script blocks (except external CDN)
let cleanedHtml = html.replace(scriptRegex, (full, attrs) => {
  if (/src=\s*".*chart\.js"/.test(attrs)) return full; // keep CDN script
  return '';
});
// Ensure a single module script tag exists (Vite default)
if (!/type="module"/.test(cleanedHtml)) {
  cleanedHtml = cleanedHtml.replace(/<head>([\s\S]*?)<\/head>/i, (headMatch, headContent) => {
    return `<head>${headContent}\n    <script type="module" src="/src/main.ts"></script>\n</head>`;
  });
}
fs.writeFileSync(htmlPath, cleanedHtml, 'utf-8');

console.log('Migration script completed. Extracted', scriptIndex, 'scripts.');
