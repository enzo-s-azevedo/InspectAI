import { promises as fs } from 'node:fs';
import path from 'node:path';

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

export async function GET() {
  try {
    const dataYamlPath = path.join(process.cwd(), 'yolo', 'INTERFACE', 'data.yaml');
    const dataYamlExists = await fs
      .access(dataYamlPath)
      .then(() => true)
      .catch(() => false);

    console.log('[defect-classes] data.yaml path:', dataYamlPath);
    console.log('[defect-classes] data.yaml exists:', dataYamlExists);

    const content = await fs.readFile(dataYamlPath, 'utf-8');
    const classes = parseNamesFromDataYaml(content);

    return Response.json({
      success: true,
      data: {
        classes,
      },
      meta: {
        source: 'yolo/INTERFACE/data.yaml',
      },
      error: null,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        data: null,
        meta: {},
        error: {
          code: 'DATA_YAML_UNAVAILABLE',
          message: 'Nao foi possivel carregar classes de defeitos',
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}
