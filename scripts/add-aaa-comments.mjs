import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const SPEC_GLOB = 'apps/backend/src';

function findSpecFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findSpecFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.spec.ts')) {
      results.push(full);
    }
  }
  return results;
}

function insertAaaComments(content) {
  const lines = content.split('\n');
  const result = [];
  let inItBlock = false;
  let braceDepth = 0;
  let actInserted = false;
  let assertInserted = false;
  let actLine = -1;
  let assertLine = -1;
  let arrangeLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Detect start of it block
    if (/^\s*it\(/.test(line) && line.endsWith('{')) {
      if (inItBlock) {
        result.push(line);
        continue;
      }
      inItBlock = true;
      actInserted = false;
      assertInserted = false;
      actLine = -1;
      assertLine = -1;
      arrangeLine = -1;
      result.push(line);
      // Insert // Arrange after opening brace
      result.push('');
      result.push('      // Arrange');
      continue;
    }

    // Track brace depth for multi-line it blocks
    if (inItBlock) {
      for (const ch of line) {
        if (ch === '{') braceDepth++;
        if (ch === '}') braceDepth--;
      }
    }

    // Detect // Act line - before first service call
    if (inItBlock && !actInserted && i > arrangeLine + 1) {
      if (
        /^\s*(const\s+\w+\s*=\s*)?await\s+\w+\./.test(trimmed) ||
        /^\s*const\s+\w+\s*=\s*await\s+\w+\./.test(trimmed)
      ) {
        actLine = i;
        actInserted = true;
      }
    }

    // Detect // Assert line - before first expect after Act
    if (inItBlock && actInserted && !assertInserted) {
      if (
        /^\s*expect\(/.test(trimmed) ||
        /^\s*await\s+expect\(/.test(trimmed)
      ) {
        assertLine = i;
        assertInserted = true;
      }
    }

    // Detect closing brace of it block
    if (inItBlock && braceDepth === 0 && /^\s*}\s*;?\s*$/.test(line) && i > 0) {
      inItBlock = false;
    }

    result.push(line);
  }

  // Now insert // Act and // Assert markers
  const final = [];
  for (let i = 0; i < result.length; i++) {
    if (i === actLine) {
      final.push('');
      final.push('      // Act');
    }
    if (i === assertLine) {
      final.push('');
      final.push('      // Assert');
    }
    final.push(result[i]);
  }

  return final.join('\n');
}

function processFile(filePath) {
  const original = readFileSync(filePath, 'utf-8');

  // Skip files that already have AAA comments
  if (original.includes('// Arrange') && original.includes('// Assert')) {
    return;
  }

  const updated = insertAaaComments(original);
  writeFileSync(filePath, updated, 'utf-8');
}

const specFiles = findSpecFiles(join(ROOT, SPEC_GLOB));
for (const file of specFiles) {
  processFile(file);
}
