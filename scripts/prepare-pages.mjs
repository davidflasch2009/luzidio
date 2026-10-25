// Bereitet den Web-Export (dist/) für GitHub Pages vor (Aufruf: node scripts/prepare-pages.mjs dist).
// - Service Worker für SharedArrayBuffer (Browser-Datenbank) einbinden
// - 404.html = index.html, damit Direktlinks wie /luzidio/journal funktionieren
// - .nojekyll, damit Ordner mit Unterstrich (_expo) ausgeliefert werden
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, process.argv[2] ?? 'dist');
const base = '/luzidio/';

for (const file of ['coi-sw.js', 'coi-register.js']) copyFileSync(join(root, 'web', file), join(out, file));

const indexPath = join(out, 'index.html');
let html = readFileSync(indexPath, 'utf8');
if (!html.includes('coi-register.js')) {
  const tag = `<script src="${base}coi-register.js" data-base="${base}"></script>`;
  html = html.replace(/<head>/i, `<head>${tag}`);
  if (!html.includes(tag)) throw new Error('Kein <head> in index.html gefunden');
  writeFileSync(indexPath, html);
}
writeFileSync(join(out, '404.html'), html);
writeFileSync(join(out, '.nojekyll'), '');
console.log('GitHub-Pages-Vorbereitung abgeschlossen:', out);
