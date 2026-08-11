/* build.js — bundle the modular game into ONE self-contained HTML file
 * (brainrot.html): CSS inlined into <style>, every module inlined into
 * <script>. Used to produce a single deployable/shareable artifact.
 * Run: node brainrot/build.js */
const fs = require('fs'), path = require('path');
const DIR = __dirname;
// Keep this in the SAME ORDER as the <script> tags in index.html. The build
// asserts every tag is inlined (see the leftover check below), so adding a
// module to index.html without adding it here fails the build loudly.
const FILES = ['config.js','sprites.js','audio.js','animations.js','countries.js','worldmap.js','upgrades.js','events.js','world.js','save.js','genes.js','ui.js','game.js'];

let html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(DIR, 'style.css'), 'utf8');

// Strip cache-busting ?v=N query strings so the inliner anchors match.
html = html.replace(/(\b(?:src|href)="[^"?]+)\?v=\d+"/g, '$1"');

// Drop the PWA/install links: a single-file bundle has no sibling manifest or
// icon files to point at, and leaving them would trip the external-ref check.
html = html.replace(/\s*<link rel="manifest"[^>]*>/g, '')
           .replace(/\s*<link rel="apple-touch-icon"[^>]*>/g, '')
           .replace(/\s*<link rel="icon"[^>]*>/g, '');

if (!html.includes('<link rel="stylesheet" href="style.css">')) throw new Error('CSS link anchor not found');
html = html.replace('<link rel="stylesheet" href="style.css">', '<style>\n' + css + '\n</style>');

for (const f of FILES) {
  const anchor = '<script src="' + f + '"></script>';
  if (!html.includes(anchor)) throw new Error('script anchor not found: ' + f);
  let js = fs.readFileSync(path.join(DIR, f), 'utf8');
  js = js.replace(/<\/script>/g, '<\\/script>'); // never let inlined code close the tag
  html = html.replace(anchor, '<script>\n/* ===== ' + f + ' ===== */\n' + js + '\n</script>');
}

// Sanity: nothing external should remain referenced. Check the MARKUP only —
// inlined JS legitimately contains strings like src="${...}" (sprites.js builds
// <img> tags at runtime), which would otherwise trip this.
const markup = html.replace(/<script>[\s\S]*?<\/script>/g, '');
const leftover = markup.match(/(src|href)="(?!https?:|data:|#)[^"]+"/g);
if (leftover) throw new Error('unexpected external ref(s): ' + leftover.join(', '));

fs.writeFileSync(path.join(DIR, 'brainrot.html'), html);
console.log('built brainrot.html:', html.length, 'bytes');

// ---- Artifact variant --------------------------------------------------
// Claude Artifacts supply their own <!doctype><html><head><body> skeleton,
// so the deployed file must be BODY CONTENT ONLY: <title> + <style> + markup
// + inline scripts, with no doctype/html/head/body wrappers of our own.
const titleM = html.match(/<title>([\s\S]*?)<\/title>/);
const styleM = html.match(/<style>[\s\S]*?<\/style>/);
const bodyM = html.match(/<body>([\s\S]*?)<\/body>/);
if (!titleM || !styleM || !bodyM) throw new Error('artifact extraction failed');
const artifact = '<title>' + titleM[1] + '</title>\n' + styleM[0] + '\n' + bodyM[1].trim() + '\n';
fs.writeFileSync(path.join(DIR, 'brainrot.artifact.html'), artifact);
console.log('built brainrot.artifact.html:', artifact.length, 'bytes');
