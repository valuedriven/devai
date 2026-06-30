#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SRC_DIR = join(import.meta.dirname, '..', 'src');

function findSpecFiles(dir, files = []) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('node_modules') && !entry.name.startsWith('.')) {
      findSpecFiles(fullPath, files);
    } else if (entry.name.endsWith('.spec.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

function findBlockEnd(lines, start) {
  let depth = 0;
  let first = true;
  for (let i = start; i < lines.length; i++) {
    const opens = (lines[i].match(/\{/g) || []).length;
    const closes = (lines[i].match(/\}/g) || []).length;
    if (first) {
      depth = opens - closes;
      first = false;
    } else {
      depth += opens - closes;
    }
    if (depth <= 0 && !first) {
      return i;
    }
  }
  return lines.length - 1;
}

function hasAct(line) {
  return /^\s*(const\s+\w+\s*=\s*)?await\s+\w+\.\w+\s*\(/.test(line) ||
    line.includes('await this.');
}

function hasAssert(line) {
  return /^\s*(await\s+)?expect\(/.test(line);
}

function hasCombinedActAssert(line) {
  return /^\s*await\s+expect\(/.test(line);
}

function insertAAAComments(content) {
  const lines = content.split('\n');
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const itMatch = line.match(/^(\s*)it\s*\(\s*['"`].*['"`]\s*,.*=>\s*\{/);

    if (itMatch) {
      const indent = itMatch[1];
      result.push(line);
      i++;

      const blockEnd = findBlockEnd(lines, i - 1);
      const bodyLines = lines.slice(i, blockEnd);

      if (bodyLines.length === 0) {
        continue;
      }

      const firstNonBlank = bodyLines.findIndex(l => l.trim() !== '');
      const lastNonBlankIdx = bodyLines.length - 1 - [...bodyLines].reverse().findIndex(l => l.trim() !== '');

      let actIdx = -1;
      let assertIdx = -1;
      let combinedIdx = -1;

      for (let j = 0; j < bodyLines.length; j++) {
        const bl = bodyLines[j];
        if (combinedIdx < 0 && hasCombinedActAssert(bl)) {
          combinedIdx = j;
        }
        if (actIdx < 0 && hasAct(bl)) {
          actIdx = j;
        }
        if (assertIdx < 0 && hasAssert(bl)) {
          assertIdx = j;
        }
      }

      let arrangeLine = -1;
      if (firstNonBlank >= 0) {
        const fl = bodyLines[firstNonBlank];
        if (!fl.trimStart().startsWith('// ')) {
          arrangeLine = firstNonBlank;
        }
      }

      if (combinedIdx >= 0) {
        if (arrangeLine >= 0 && arrangeLine !== combinedIdx) {
          if (!bodyLines[arrangeLine].trimStart().startsWith('// Arrange')) {
            bodyLines[arrangeLine] = indent + '  // Arrange\n' + bodyLines[arrangeLine];
          }
        }
        if (!bodyLines[combinedIdx].trimStart().startsWith('// Act') &&
            !bodyLines[combinedIdx].trimStart().startsWith('// Assert')) {
          bodyLines[combinedIdx] = indent + '  // Act & Assert\n' + bodyLines[combinedIdx];
        }
      } else if (actIdx >= 0 && assertIdx >= 0 && actIdx < assertIdx) {
        if (arrangeLine >= 0) {
          if (!bodyLines[arrangeLine].trimStart().startsWith('// Arrange')) {
            bodyLines[arrangeLine] = indent + '  // Arrange\n' + bodyLines[arrangeLine];
          }
        }
        if (!bodyLines[actIdx].trimStart().startsWith('// Act')) {
          bodyLines[actIdx] = indent + '  // Act\n' + bodyLines[actIdx];
        }
        if (!bodyLines[assertIdx].trimStart().startsWith('// Assert')) {
          bodyLines[assertIdx] = indent + '  // Assert\n' + bodyLines[assertIdx];
        }
      } else if (assertIdx >= 0) {
        if (arrangeLine >= 0) {
          if (!bodyLines[arrangeLine].trimStart().startsWith('// Arrange')) {
            bodyLines[arrangeLine] = indent + '  // Arrange\n' + bodyLines[arrangeLine];
          }
        }
        if (!bodyLines[assertIdx].trimStart().startsWith('// Assert')) {
          bodyLines[assertIdx] = indent + '  // Assert\n' + bodyLines[assertIdx];
        }
      } else if (actIdx >= 0) {
        if (arrangeLine >= 0) {
          if (!bodyLines[arrangeLine].trimStart().startsWith('// Arrange')) {
            bodyLines[arrangeLine] = indent + '  // Arrange\n' + bodyLines[arrangeLine];
          }
        }
        if (!bodyLines[actIdx].trimStart().startsWith('// Act')) {
          bodyLines[actIdx] = indent + '  // Act\n' + bodyLines[actIdx];
        }
      }

      for (const bl of bodyLines) {
        result.push(bl);
      }
      i = blockEnd;
    } else {
      result.push(line);
      i++;
    }
  }

  return result.join('\n');
}

const specFiles = findSpecFiles(SRC_DIR);
let modifiedCount = 0;

for (const filePath of specFiles) {
  const content = readFileSync(filePath, 'utf-8');
  const updated = insertAAAComments(content);
  if (updated !== content) {
    writeFileSync(filePath, updated, 'utf-8');
    console.log(`✓ Added AAA comments to: ${filePath}`);
    modifiedCount++;
  } else {
    console.log(`- No changes: ${filePath}`);
  }
}

console.log(`\nDone. Modified ${modifiedCount} of ${specFiles.length} spec files.`);
