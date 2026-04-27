const fs = require('fs');
const path = require('path');

function parseNamesFromDataYaml(content) {
  const lines = String(content || '').split(/\r?\n/);
  const names = [];
  let inNamesBlock = false;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    if (!inNamesBlock) {
      if (!trimmed.startsWith('names:')) {
        continue;
      }

      inNamesBlock = true;

      const inlineList = trimmed.match(/^names:\s*\[(.*)\]\s*$/);
      if (inlineList) {
        const values = inlineList[1]
          .split(',')
          .map((item) => item.trim().replace(/^['\"]|['\"]$/g, ''))
          .filter(Boolean);
        names.push(...values);
        break;
      }

      continue;
    }

    if (/^[a-zA-Z_]+\s*:/.test(trimmed)) {
      break;
    }

    const numberedItem = trimmed.match(/^\d+\s*:\s*(.+)$/);
    if (numberedItem) {
      const value = numberedItem[1].trim().replace(/^['\"]|['\"]$/g, '');
      if (value) names.push(value);
      continue;
    }

    const listItem = trimmed.match(/^-\s*(.+)$/);
    if (listItem) {
      const value = listItem[1].trim().replace(/^['\"]|['\"]$/g, '');
      if (value) names.push(value);
      continue;
    }
  }

  return [...new Set(names)];
}

(async function () {
  try {
    const dataYamlPath = path.join(process.cwd(), 'yolo', 'INTERFACE', 'data.yaml');
    const content = await fs.promises.readFile(dataYamlPath, 'utf-8');
    const classes = parseNamesFromDataYaml(content);
    console.log('Classes found:', classes);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
