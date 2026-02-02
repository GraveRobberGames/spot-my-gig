#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const EN_PATH = path.join(ROOT, 'i18n', 'resources', 'en', 'common.json');
const LV_PATH = path.join(ROOT, 'i18n', 'resources', 'lv', 'common.json');
const INCLUDE_EXT = new Set(['.js', '.jsx', '.ts', '.tsx']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'ios', 'android', '.expo']);

const readJSON = (p) => {
    try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return {}; }
};
const writeJSON = (p, obj) => {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    const sorted = Object.fromEntries(Object.entries(obj).sort(([a],[b]) => a.localeCompare(b)));
    fs.writeFileSync(p, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
};

function walk(dir, files = []) {
    for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
        if (name.isDirectory()) {
            if (SKIP_DIRS.has(name.name)) continue;
            walk(path.join(dir, name.name), files);
        } else {
            const ext = path.extname(name.name).toLowerCase();
            if (INCLUDE_EXT.has(ext)) files.push(path.join(dir, name.name));
        }
    }
    return files;
}

const T_CALL_RE =
    /\b(?:i18next\.)?t\s*\(\s*(?:`([^`\\]*(?:\\.[^`\\]*)*)`|'([^'\\]*(?:\\.[^'\\]*)*)'|"([^"\\]*(?:\\.[^"\\]*)*)")/g;

function unescapeString(s, quote) {
    return s.replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\`/g, '`')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'");
}

function extractKeysFromFile(filePath) {
    const src = fs.readFileSync(filePath, 'utf8');
    const keys = new Set();
    let m;
    while ((m = T_CALL_RE.exec(src))) {
        const key = (m[1] ?? m[2] ?? m[3] ?? '').trim();
        if (!key) continue;

        if (key.includes('${')) continue;
        keys.add(unescapeString(key));
    }
    return keys;
}

function main() {
    const allFiles = walk(ROOT);
    const found = new Set();

    for (const f of allFiles) {
        if (f.includes('/i18n/resources/')) continue;
        if (f.includes('/scripts/extract-i18n.js')) continue;
        for (const k of extractKeysFromFile(f)) found.add(k);
    }

    const en = readJSON(EN_PATH);
    const lv = readJSON(LV_PATH);

    let addedEn = 0, addedLv = 0;

    for (const key of found) {
        if (!(key in en)) { en[key] = key; addedEn++; }
        if (!(key in lv)) { lv[key] = key; addedLv++; }
    }

    writeJSON(EN_PATH, en);
    writeJSON(LV_PATH, lv);

    console.log(`i18n extract complete:
  scanned files: ${allFiles.length}
  keys found:    ${found.size}
  en added:      ${addedEn}
  lv added:      ${addedLv}
  -> ${path.relative(ROOT, EN_PATH)}
  -> ${path.relative(ROOT, LV_PATH)}
  `);
}

main();
