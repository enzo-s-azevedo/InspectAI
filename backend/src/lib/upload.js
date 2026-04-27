import JSZip from 'jszip';

const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);
const ALLOWED_UPLOAD_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.zip']);

function getLowerExtension(fileName) {
  const value = String(fileName || '').toLowerCase();
  const lastDot = value.lastIndexOf('.');
  if (lastDot < 0) return '';
  return value.slice(lastDot);
}

function isJpeg(buffer) {
  return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[buffer.length - 2] === 0xff && buffer[buffer.length - 1] === 0xd9;
}

function isPng(buffer) {
  if (buffer.length < 8) return false;
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  return signature.every((value, index) => buffer[index] === value);
}

function assertValidImageBuffer(buffer, fileName) {
  if (!(buffer instanceof Uint8Array) || buffer.length === 0) {
    throw new Error(`Arquivo de imagem vazio ou invalido: ${fileName}`);
  }

  if (!isJpeg(buffer) && !isPng(buffer)) {
    throw new Error(`Arquivo de imagem corrompido ou formato nao suportado: ${fileName}`);
  }
}

export async function readAndValidateUpload(file) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    throw new Error('Nenhum arquivo valido foi enviado');
  }

  const extension = getLowerExtension(file.name);
  if (!ALLOWED_UPLOAD_EXTENSIONS.has(extension)) {
    throw new Error('Formato invalido. Envie .jpg, .png ou .zip');
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  if (buffer.length === 0) {
    throw new Error('Arquivo vazio');
  }

  if (extension === '.zip') {
    return {
      kind: 'zip',
      fileName: file.name || 'upload.zip',
      buffer,
    };
  }

  assertValidImageBuffer(buffer, file.name || 'upload.jpg');
  return {
    kind: 'image',
    image: {
      name: file.name || 'upload.jpg',
      buffer,
      mimeType: extension === '.png' ? 'image/png' : 'image/jpeg',
    },
  };
}

export async function extractImagesFromZip(zipBuffer) {
  let zip;
  try {
    zip = await JSZip.loadAsync(zipBuffer);
  } catch {
    throw new Error('Arquivo .zip invalido ou corrompido');
  }

  const images = [];

  for (const entry of Object.values(zip.files)) {
    if (entry.dir) continue;

    const extension = getLowerExtension(entry.name);
    if (!ALLOWED_IMAGE_EXTENSIONS.has(extension)) continue;

    const content = await entry.async('uint8array');
    assertValidImageBuffer(content, entry.name);

    images.push({
      name: entry.name,
      buffer: content,
      mimeType: extension === '.png' ? 'image/png' : 'image/jpeg',
    });
  }

  if (images.length === 0) {
    throw new Error('Nenhuma imagem valida (.jpg/.png) encontrada no arquivo .zip');
  }

  return images;
}

export function normalizeDetections(payload) {
  if (!Array.isArray(payload)) {
    throw new Error('Resposta de inferencia invalida: esperado array de deteccoes');
  }

  return payload.map((item) => ({
    class_id: Number(item.class_id || 0),
    label: String(item.label || 'defeito-nao-classificado'),
    confidence: Number(item.confidence || 0),
    bbox: Array.isArray(item.bbox) ? item.bbox : [],
  }));
}
