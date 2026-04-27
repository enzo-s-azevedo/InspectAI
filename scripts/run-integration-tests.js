const fs = require('node:fs');
const path = require('node:path');
const JSZip = require('jszip');

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://localhost:3001/api';
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
const FRONTEND_API_BASE_URL = process.env.FRONTEND_API_BASE_URL || `${FRONTEND_BASE_URL}/backend-api`;
const AI_BASE_URL = process.env.AI_BASE_URL || 'http://localhost:5005';
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = Number(process.env.DB_PORT || 3307);
const REPORT_OUTPUT_PATH = process.env.REPORT_OUTPUT_PATH || path.resolve(process.cwd(), 'integration-report.md');
const REQUEST_TIMEOUT_MS = Number(process.env.INTEGRATION_TEST_TIMEOUT_MS || 15000);

const results = [];
const failures = [];

function nowIso() {
  return new Date().toISOString();
}

function summarizeValue(value) {
  if (value === null || value === undefined) return String(value);
  if (typeof value === 'string') return value.slice(0, 300);
  try {
    return JSON.stringify(value).slice(0, 300);
  } catch {
    return String(value).slice(0, 300);
  }
}

function createTestPng() {
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO9+XkQAAAAASUVORK5CYII=',
    'base64'
  );
}

function basenameFromAnyPath(filePath) {
  if (!filePath) return null;
  const normalized = String(filePath).replace(/\\/g, '/');
  const parts = normalized.split('/').filter(Boolean);
  return parts.length ? parts[parts.length - 1] : null;
}

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function findRealImageFixture() {
  const root = process.cwd();
  const fixtures = [
    path.join(root, 'yolo', 'TREINO', 'data', 'validation', 'images'),
    path.join(root, 'yolo', 'TREINO', 'custom_data', 'images'),
  ];

  const priorityByJson = [];
  const defectJsonPath = path.join(root, 'yolo', 'INTERFACE', 'defeitos_detectados.json');
  if (fileExists(defectJsonPath)) {
    try {
      const payload = JSON.parse(fs.readFileSync(defectJsonPath, 'utf8'));
      if (Array.isArray(payload)) {
        for (const item of payload) {
          const fileName = basenameFromAnyPath(item && item.imagem_origem);
          if (fileName) priorityByJson.push(fileName);
        }
      }
    } catch {
      // Keep searching by directory scan when JSON cannot be parsed.
    }
  }

  const searchExtensions = ['.jpg', '.jpeg', '.png'];

  for (const directory of fixtures) {
    if (!fs.existsSync(directory)) continue;

    for (const preferred of priorityByJson) {
      const preferredPath = path.join(directory, preferred);
      if (fileExists(preferredPath)) {
        const buffer = fs.readFileSync(preferredPath);
        return {
          filePath: preferredPath,
          fileName: preferred,
          buffer,
          mimeType: preferred.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg',
        };
      }
    }

    const files = fs.readdirSync(directory);
    const candidate = files.find((name) => searchExtensions.some((extension) => name.toLowerCase().endsWith(extension)));
    if (candidate) {
      const candidatePath = path.join(directory, candidate);
      const buffer = fs.readFileSync(candidatePath);
      return {
        filePath: candidatePath,
        fileName: candidate,
        buffer,
        mimeType: candidate.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg',
      };
    }
  }

  return null;
}

async function createZipWithImages(entries) {
  const zip = new JSZip();
  entries.forEach((entry, index) => {
    const name = entry && entry.name ? entry.name : `fixture-${index + 1}.png`;
    zip.file(name, entry.buffer);
  });
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

async function sendDetectionUpload({ url, fileName, fileBuffer, mimeType, placaCodigo }) {
  const formData = new FormData();
  formData.append('image', new Blob([fileBuffer], { type: mimeType }), fileName);
  if (placaCodigo) {
    formData.append('placaCodigo', placaCodigo);
  }

  return request({
    name: `detection-upload-${fileName}`,
    method: 'POST',
    url,
    body: formData,
    expectedStatus: 200,
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function makeSuggestion(name, details) {
  const text = `${name} ${details}`.toLowerCase();
  if (text.includes('timeout') || text.includes('econnrefused') || text.includes('fetch failed')) {
    return 'Verifique se todos os containers estao ativos e se as URLs/ports de ambiente estao corretas.';
  }
  if (text.includes('expected status')) {
    return 'Revise o handler da rota e padronize o status HTTP para o contrato definido.';
  }
  if (text.includes('json') || text.includes('content-type')) {
    return 'Garanta que a rota sempre retorne JSON valido com content-type application/json.';
  }
  if (text.includes('success')) {
    return 'Ajuste o contrato de resposta para manter success/data/meta/error em todas as rotas.';
  }
  if (text.includes('database') || text.includes('prisma') || text.includes('sql')) {
    return 'Revise conectividade com o banco, execucao de db push/seed e relacoes no Prisma.';
  }
  if (text.includes('frontend') || text.includes('proxy') || text.includes('backend-api')) {
    return 'Revise rewrites do Next.js e variaveis BACKEND_INTERNAL_URL/NEXT_PUBLIC_API_BASE_URL.';
  }
  return 'Analise o stack trace da rota/servico e ajuste o ponto de integracao com falha.';
}

async function request({ name, method = 'GET', url, body, headers = {}, expectedStatus = 200 }) {
  const started = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
      signal: controller.signal,
      cache: 'no-store',
    });

    const contentType = response.headers.get('content-type') || '';
    const rawText = await response.text();

    let json = null;
    if (rawText && contentType.includes('application/json')) {
      try {
        json = JSON.parse(rawText);
      } catch (parseError) {
        throw new Error(`JSON invalido retornado por ${url}: ${parseError.message}`);
      }
    }

    assert(
      response.status === expectedStatus,
      `Expected status ${expectedStatus}, got ${response.status} for ${url}. Body: ${rawText.slice(0, 240)}`
    );

    return {
      response,
      contentType,
      rawText,
      json,
      durationMs: Date.now() - started,
      status: response.status,
      name,
    };
  } catch (error) {
    const durationMs = Date.now() - started;
    throw new Error(`${error.message} (after ${durationMs}ms)`);
  } finally {
    clearTimeout(timeout);
  }
}

async function waitForJsonHealth({ url, timeoutMs = 90000, intervalMs = 1500, validator = null }) {
  const started = Date.now();
  let lastError = null;

  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) {
        lastError = new Error(`Status ${res.status}`);
      } else {
        const payload = await res.json();
        if (!validator || validator(payload)) {
          return payload;
        }
        lastError = new Error(`Health payload invalid: ${JSON.stringify(payload).slice(0, 220)}`);
      }
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Health check timeout for ${url}: ${lastError ? lastError.message : 'unknown error'}`);
}

function tcpConnect(host, port, timeoutMs = REQUEST_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const net = require('node:net');
    const socket = new net.Socket();
    let settled = false;

    const finish = (error) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      if (error) reject(error);
      else resolve();
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish());
    socket.once('timeout', () => finish(new Error(`TCP timeout connecting to ${host}:${port}`)));
    socket.once('error', (error) => finish(error));
    socket.connect(port, host);
  });
}

async function assertPageHasMarkers(pageUrl, markers, expectedStatus = 200) {
  const response = await request({ name: pageUrl, url: pageUrl, expectedStatus });
  assert(response.contentType.includes('text/html'), `${pageUrl} must return HTML`);
  for (const marker of markers) {
    assert(response.rawText.includes(marker), `${pageUrl} should include marker: ${marker}`);
  }
  return `markers=${markers.length}`;
}

async function runStep(name, category, fn) {
  const started = Date.now();
  try {
    const details = await fn();
    results.push({
      name,
      category,
      status: 'PASS',
      durationMs: Date.now() - started,
      details: details || 'OK',
    });
  } catch (error) {
    const detail = error && error.message ? error.message : String(error);
    results.push({
      name,
      category,
      status: 'FAIL',
      durationMs: Date.now() - started,
      details: detail,
    });
    failures.push({
      name,
      category,
      detail,
      suggestion: makeSuggestion(name, detail),
    });
  }
}

function validateContract(payload, context) {
  assert(payload && typeof payload === 'object', `${context}: resposta JSON ausente`);
  assert('success' in payload, `${context}: campo success ausente`);
  assert('data' in payload, `${context}: campo data ausente`);
  assert('meta' in payload, `${context}: campo meta ausente`);
  assert('error' in payload, `${context}: campo error ausente`);
}

function scoreHealth(total, failed) {
  if (total <= 0) return 0;
  return Math.round(((total - failed) / total) * 100);
}

function buildReport(state) {
  const { startedAt, endedAt, resultsList, failedList, integrationSummary } = state;
  const total = resultsList.length;
  const passed = resultsList.filter((item) => item.status === 'PASS').length;
  const failed = failedList.length;
  const healthScore = scoreHealth(total, failed);

  const lines = [];
  lines.push('# Integration Testing Report');
  lines.push('');
  lines.push(`Generated at: ${endedAt}`);
  lines.push(`Started at: ${startedAt}`);
  lines.push(`Duration: ${Math.max(0, new Date(endedAt) - new Date(startedAt))} ms`);
  lines.push('');
  lines.push('## 1. Summary of Tested Integrations');
  lines.push('');
  integrationSummary.forEach((item) => lines.push(`- ${item}`));
  lines.push('');
  lines.push('## 2. Pass/Fail Status Per Integration Point');
  lines.push('');
  lines.push('| Integration Point | Category | Status | Duration (ms) | Details |');
  lines.push('|---|---|---|---:|---|');
  resultsList.forEach((item) => {
    lines.push(`| ${item.name} | ${item.category} | ${item.status} | ${item.durationMs} | ${summarizeValue(item.details)} |`);
  });
  lines.push('');
  lines.push('## 3. Failed Endpoints or Flows');
  lines.push('');
  if (!failed) {
    lines.push('- None');
  } else {
    failedList.forEach((item) => lines.push(`- ${item.name}: ${item.detail}`));
  }
  lines.push('');
  lines.push('## 4. Root Cause Analysis');
  lines.push('');
  if (!failed) {
    lines.push('- No integration failures were detected in this run.');
  } else {
    failedList.forEach((item) => {
      lines.push(`- ${item.name}: ${item.detail}`);
    });
  }
  lines.push('');
  lines.push('## 5. Suggested Fixes');
  lines.push('');
  if (!failed) {
    lines.push('- No fixes required for this run.');
  } else {
    failedList.forEach((item) => {
      lines.push(`- ${item.name}: ${item.suggestion}`);
    });
  }
  lines.push('');
  lines.push('## 6. Overall System Health Score');
  lines.push('');
  lines.push(`- Health Score: ${healthScore}%`);
  lines.push(`- Passed: ${passed}/${total}`);
  lines.push(`- Failed: ${failed}/${total}`);
  lines.push('');
  lines.push('## Environment');
  lines.push('');
  lines.push(`- BACKEND_BASE_URL: ${BACKEND_BASE_URL}`);
  lines.push(`- FRONTEND_BASE_URL: ${FRONTEND_BASE_URL}`);
  lines.push(`- FRONTEND_API_BASE_URL: ${FRONTEND_API_BASE_URL}`);
  lines.push(`- AI_BASE_URL: ${AI_BASE_URL}`);

  return lines.join('\n');
}

async function main() {
  const startedAt = nowIso();
  const runTag = Date.now();
  const uniqueUserEmail = `integration.${runTag}@inspectai.local`;
  const uniqueUserName = `Integration User ${runTag}`;
  const uniquePlacaCodigo = `INT-PLACA-${runTag}`;
  const uniqueRelatorioTitulo = `INT-REL-${runTag}`;
  const detectionPlacaCodigo = `API-DET-${runTag}`;
  const zipPlacaCodigo = `ZIP-DET-${runTag}`;
  const frontendDetectionPlacaCodigo = `FRONT-DET-${runTag}`;

  const ctx = {
    userId: null,
    placaId: null,
    defeitoId: null,
    relatorioId: null,
    detectionFixture: null,
    zipFixtureName: `integration-batch-${runTag}.zip`,
    zipDetectionCount: 0,
    apiDetectionCount: 0,
  };

  const integrationSummary = [
    'Backend API contract and endpoint status for health, usuarios, placas, defeitos, relatorios',
    'Database integration through create/read flows spanning usuario -> placa -> defeito -> relatorio',
    'Real YOLO inference using real PCB image fixtures from project dataset',
    'Batch upload validation using .zip with real images and persistence checks',
    'Frontend availability and frontend proxy communication (/backend-api/*) with backend',
    'System-wide validation of frontend -> backend -> database behavior via proxied POST+GET',
    'Container communication checks between backend and AI service',
  ];

  await runStep('Load real image fixture for inference', 'QA/Fixtures', async () => {
    const fixture = findRealImageFixture();
    assert(Boolean(fixture), 'Nenhuma imagem real encontrada em yolo/TREINO para testes de inferencia');
    assert(fixture.buffer.length > 0, 'Imagem real selecionada esta vazia');
    ctx.detectionFixture = fixture;
    return `fixture=${fixture.fileName} size=${fixture.buffer.length} path=${fixture.filePath}`;
  });

  await runStep('Wait AI service readiness', 'Containers', async () => {
    const payload = await waitForJsonHealth({
      url: `${AI_BASE_URL}/health`,
      validator: (value) => Boolean(value && (value.status === 'healthy' || value.status === 'degraded')),
    });
    return `aiStatus=${payload.status} model=${payload.model || 'none'}`;
  });

  await runStep('Wait backend with AI connectivity', 'Containers', async () => {
    const payload = await waitForJsonHealth({
      url: `${BACKEND_BASE_URL}/health`,
      validator: (value) => Boolean(value && value.success === true && value.data && value.data.api === 'ok'),
    });
    return `backendApi=${payload.data.api} ai=${payload.data.ai?.status || 'unknown'}`;
  });

  await runStep('Backend health endpoint contract', 'Backend/API', async () => {
    const res = await request({ name: 'backend-health', url: `${BACKEND_BASE_URL}/health` });
    assert(res.contentType.includes('application/json'), 'Health endpoint must return JSON');
    validateContract(res.json, 'GET /api/health');
    assert(res.json.success === true, 'Health response success must be true');
    assert(res.json.data && res.json.data.api === 'ok', 'Health data.api must be ok');
    assert(res.json.data && res.json.data.database === 'ok', 'Health data.database must be ok');
    assert(res.json.data && res.json.data.ai, 'Health must include ai block');
    return `status=${res.status} aiStatus=${res.json.data.ai.status || 'unknown'}`;
  });

  await runStep('Backend usuarios GET', 'Backend/API', async () => {
    const res = await request({ name: 'backend-usuarios-get', url: `${BACKEND_BASE_URL}/usuarios` });
    validateContract(res.json, 'GET /api/usuarios');
    assert(Array.isArray(res.json.data), 'GET /usuarios data must be array');
    return `usuarios=${res.json.data.length}`;
  });

  await runStep('Backend placas GET', 'Backend/API', async () => {
    const res = await request({ name: 'backend-placas-get', url: `${BACKEND_BASE_URL}/placas` });
    validateContract(res.json, 'GET /api/placas');
    assert(Array.isArray(res.json.data), 'GET /placas data must be array');
    return `placas=${res.json.data.length}`;
  });

  await runStep('Backend defeitos GET', 'Backend/API', async () => {
    const res = await request({ name: 'backend-defeitos-get', url: `${BACKEND_BASE_URL}/defeitos` });
    validateContract(res.json, 'GET /api/defeitos');
    assert(Array.isArray(res.json.data), 'GET /defeitos data must be array');
    return `defeitos=${res.json.data.length}`;
  });

  await runStep('Backend relatorios GET', 'Backend/API', async () => {
    const res = await request({ name: 'backend-relatorios-get', url: `${BACKEND_BASE_URL}/relatorios` });
    validateContract(res.json, 'GET /api/relatorios');
    assert(Array.isArray(res.json.data), 'GET /relatorios data must be array');
    return `relatorios=${res.json.data.length}`;
  });

  await runStep('Database port reachable', 'Docker/Network', async () => {
    await tcpConnect(DB_HOST, DB_PORT);
    return `${DB_HOST}:${DB_PORT} reachable`;
  });

  await runStep('Backend create usuario', 'Backend/DB', async () => {
    const res = await request({
      name: 'backend-usuarios-post',
      method: 'POST',
      url: `${BACKEND_BASE_URL}/usuarios`,
      expectedStatus: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueUserEmail,
        nome: uniqueUserName,
        papel: 'inspetor',
        status: 'ativo',
      }),
    });

    validateContract(res.json, 'POST /api/usuarios');
    assert(res.json.success === true, 'POST /usuarios should return success=true');
    assert(res.json.meta && res.json.meta.created === true, 'POST /usuarios should set meta.created=true');
    assert(res.json.data && res.json.data.id, 'POST /usuarios must return id');
    ctx.userId = res.json.data.id;
    return `userId=${ctx.userId}`;
  });

  await runStep('Backend create placa', 'Backend/DB', async () => {
    const res = await request({
      name: 'backend-placas-post',
      method: 'POST',
      url: `${BACKEND_BASE_URL}/placas`,
      expectedStatus: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo: uniquePlacaCodigo,
        descricao: 'Placa criada por teste de integracao',
        localizacao: 'Bancada QA',
      }),
    });

    validateContract(res.json, 'POST /api/placas');
    assert(res.json.success === true, 'POST /placas should return success=true');
    assert(res.json.data && res.json.data.id, 'POST /placas must return id');
    assert(res.json.data && res.json.data.codigo === uniquePlacaCodigo, 'POST /placas should preserve codigo');
    ctx.placaId = res.json.data.id;
    assert(typeof res.json.data.nome_classe === 'string', 'Placa deve expor campo nome_classe');
    return `placaId=${ctx.placaId}`;
  });

  await runStep('Backend create defeito with relations', 'Backend/DB', async () => {
    assert(ctx.placaId, 'placaId is required before creating defeito');
    assert(ctx.userId, 'userId is required before creating defeito');

    const res = await request({
      name: 'backend-defeitos-post',
      method: 'POST',
      url: `${BACKEND_BASE_URL}/defeitos`,
      expectedStatus: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        placaId: ctx.placaId,
        tipo: 'trilha-rompida',
        componente: 'R45',
        origem: 'manual',
        severidade: 'media',
        descricao: 'Defeito criado por teste de integracao',
        status: 'aberto',
        usuarioId: ctx.userId,
      }),
    });

    validateContract(res.json, 'POST /api/defeitos');
    assert(res.json.success === true, 'POST /defeitos should return success=true');
    assert(res.json.data && res.json.data.id, 'POST /defeitos must return id');
    assert(res.json.data && res.json.data.placa && res.json.data.placa.id === ctx.placaId, 'Defeito must reference created placa');
    ctx.defeitoId = res.json.data.id;
    return `defeitoId=${ctx.defeitoId}`;
  });

  await runStep('Backend create relatorio linked to defeito', 'Backend/DB', async () => {
    assert(ctx.userId, 'userId is required before creating relatorio');
    assert(ctx.defeitoId, 'defeitoId is required before creating relatorio');

    const res = await request({
      name: 'backend-relatorios-post',
      method: 'POST',
      url: `${BACKEND_BASE_URL}/relatorios`,
      expectedStatus: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: uniqueRelatorioTitulo,
        descricao: 'Relatorio criado por teste de integracao',
        usuarioId: ctx.userId,
        origem: 'inspecao',
        status: 'finalizado',
        defeitoIds: [ctx.defeitoId],
      }),
    });

    validateContract(res.json, 'POST /api/relatorios');
    assert(res.json.success === true, 'POST /relatorios should return success=true');
    assert(res.json.data && res.json.data.id, 'POST /relatorios must return id');
    ctx.relatorioId = res.json.data.id;
    return `relatorioId=${ctx.relatorioId}`;
  });

  await runStep('Backend detection upload via API', 'Backend/API', async () => {
    assert(ctx.detectionFixture, 'Fixture de imagem real nao carregada');

    const res = await sendDetectionUpload({
      url: `${BACKEND_BASE_URL}/detection`,
      fileName: ctx.detectionFixture.fileName,
      fileBuffer: ctx.detectionFixture.buffer,
      mimeType: ctx.detectionFixture.mimeType,
      placaCodigo: detectionPlacaCodigo,
    });

    validateContract(res.json, 'POST /api/detection');
    assert(res.json.success === true, 'POST /detection should return success=true');
    assert(res.json.data && Array.isArray(res.json.data.detections), 'Detection response must include detections array');
    assert(res.json.data && Array.isArray(res.json.data.savedDefeitos), 'Detection response must include savedDefeitos array');
    assert(res.json.data.detections.length > 0, 'Inferencia em imagem real deve retornar ao menos 1 deteccao');
    assert(
      res.json.data.savedDefeitos.length === res.json.data.detections.length,
      'Total de defeitos persistidos deve acompanhar total de deteccoes para imagem unica'
    );
    assert(res.json.meta && res.json.meta.totalFiles === 1, 'Upload de imagem unica deve processar exatamente 1 arquivo');
    ctx.apiDetectionCount = Number(res.json.data.detections.length || 0);
    return `detections=${res.json.data.detections.length} saved=${res.json.data.savedDefeitos.length}`;
  });

  await runStep('AI service real image inference', 'AI/Inference', async () => {
    assert(ctx.detectionFixture, 'Fixture de imagem real nao carregada');

    const formData = new FormData();
    formData.append(
      'image',
      new Blob([ctx.detectionFixture.buffer], { type: ctx.detectionFixture.mimeType }),
      ctx.detectionFixture.fileName
    );

    const res = await request({
      name: 'ai-predict-real-image',
      method: 'POST',
      url: `${AI_BASE_URL}/predict`,
      body: formData,
      expectedStatus: 200,
    });

    assert(Array.isArray(res.json), 'AI /predict deve retornar array de deteccoes');
    assert(res.json.length > 0, 'IA deve detectar ao menos um defeito na imagem de fixture real');
    return `fixture=${ctx.detectionFixture.fileName} detections=${res.json.length}`;
  });

  await runStep('Backend detection upload via ZIP', 'Backend/API', async () => {
    assert(ctx.detectionFixture, 'Fixture de imagem real nao carregada');

    const zipBuffer = await createZipWithImages([
      { name: `zip-a-${ctx.detectionFixture.fileName}`, buffer: ctx.detectionFixture.buffer },
      { name: `zip-b-${ctx.detectionFixture.fileName}`, buffer: ctx.detectionFixture.buffer },
    ]);

    const res = await sendDetectionUpload({
      url: `${BACKEND_BASE_URL}/detection`,
      fileName: ctx.zipFixtureName,
      fileBuffer: zipBuffer,
      mimeType: 'application/zip',
      placaCodigo: zipPlacaCodigo,
    });

    validateContract(res.json, 'POST /api/detection (zip)');
    assert(res.json.success === true, 'POST /detection zip should return success=true');
    assert(res.json.meta && res.json.meta.inputType === 'zip', 'Meta inputType deve indicar zip');
    assert(res.json.meta && res.json.meta.totalFiles === 2, 'ZIP de teste deve processar 2 imagens');
    assert(Array.isArray(res.json.data.itens), 'Resposta ZIP deve incluir itens por arquivo');
    assert(res.json.data.itens.length === 2, 'Resposta ZIP deve incluir os 2 arquivos processados');
    assert(res.json.data.detections.length > 0, 'Inferencia em .zip real deve retornar deteccoes');
    assert(
      res.json.data.savedDefeitos.length === res.json.data.detections.length,
      'Total de defeitos persistidos deve acompanhar total de deteccoes no zip'
    );
    ctx.zipDetectionCount = Number(res.json.data.detections.length || 0);
    return `zipFiles=${res.json.meta.totalFiles} detections=${ctx.zipDetectionCount} saved=${res.json.data.savedDefeitos.length}`;
  });

  await runStep('Detection persistence integrity by placa', 'Backend/DB', async () => {
    const apiDetectionRes = await request({
      name: 'backend-defeitos-detection-filter',
      url: `${BACKEND_BASE_URL}/defeitos?placaCodigo=${encodeURIComponent(detectionPlacaCodigo)}`,
    });
    validateContract(apiDetectionRes.json, 'GET /api/defeitos?placaCodigo API detection');
    assert(Array.isArray(apiDetectionRes.json.data), 'Filtro de deteccao por placa deve retornar array');

    const zipDetectionRes = await request({
      name: 'backend-defeitos-zip-filter',
      url: `${BACKEND_BASE_URL}/defeitos?placaCodigo=${encodeURIComponent(zipPlacaCodigo)}`,
    });
    validateContract(zipDetectionRes.json, 'GET /api/defeitos?placaCodigo ZIP detection');
    assert(Array.isArray(zipDetectionRes.json.data), 'Filtro de deteccao zip por placa deve retornar array');

    const combined = [...apiDetectionRes.json.data, ...zipDetectionRes.json.data];
    combined.forEach((item) => {
      assert(item.id, 'Defeito persistido precisa ter id');
      assert(item.classe, 'Defeito persistido precisa ter classe');
      assert(item.data_hora, 'Defeito persistido precisa ter data_hora');
      assert(item.nome_arquivo_origem, 'Defeito persistido precisa ter nome_arquivo_origem');
      assert(item.id_placa_origem, 'Defeito persistido precisa ter id_placa_origem');
      assert(item.placa && item.placa.id, 'Defeito persistido precisa manter relacao com placa');
      assert(item.id_placa_origem === item.placa.id, 'id_placa_origem deve ser igual ao id da placa relacionada');
    });

    return `apiByPlaca=${apiDetectionRes.json.data.length} zipByPlaca=${zipDetectionRes.json.data.length} apiDetections=${ctx.apiDetectionCount} zipDetections=${ctx.zipDetectionCount}`;
  });

  await runStep('Backend read created defeito by placaCodigo filter', 'Backend/DB', async () => {
    const res = await request({
      name: 'backend-defeitos-filter',
      url: `${BACKEND_BASE_URL}/defeitos?placaCodigo=${encodeURIComponent(uniquePlacaCodigo)}`,
    });

    validateContract(res.json, 'GET /api/defeitos?placaCodigo');
    assert(Array.isArray(res.json.data), 'Filtered defeitos must be array');
    assert(res.json.data.some((item) => item.id === ctx.defeitoId), 'Created defeito must be found in filtered list');
    return `filteredCount=${res.json.data.length}`;
  });

  await runStep('Backend read created relatorio by usuarioId filter', 'Backend/DB', async () => {
    const res = await request({
      name: 'backend-relatorios-filter',
      url: `${BACKEND_BASE_URL}/relatorios?usuarioId=${encodeURIComponent(ctx.userId)}`,
    });

    validateContract(res.json, 'GET /api/relatorios?usuarioId');
    assert(Array.isArray(res.json.data), 'Filtered relatorios must be array');
    assert(res.json.data.some((item) => item.id === ctx.relatorioId), 'Created relatorio must be found in filtered list');
    return `filteredCount=${res.json.data.length}`;
  });

  await runStep('Frontend root is reachable', 'Frontend', async () => {
    const res = await request({
      name: 'frontend-root',
      url: FRONTEND_BASE_URL,
      expectedStatus: 200,
    });

    assert(res.contentType.includes('text/html'), 'Frontend root must return HTML');
    assert(res.rawText.includes('InspectAI'), 'Frontend HTML should contain InspectAI marker');
    return 'frontend-html-ok';
  });

  await runStep('Frontend dashboard shell and metrics route', 'Frontend', async () => {
    const page = await assertPageHasMarkers(`${FRONTEND_BASE_URL}/`, [
      'InspectAI',
      'CONTROLE',
      'Inspeção de Imagens',
      'Feed Realtime',
      'Relatórios',
      'IA Status',
    ]);

    const [defeitos, placas, usuarios, health] = await Promise.all([
      request({ name: 'dashboard-defeitos-api', url: `${BACKEND_BASE_URL}/defeitos` }),
      request({ name: 'dashboard-placas-api', url: `${BACKEND_BASE_URL}/placas` }),
      request({ name: 'dashboard-usuarios-api', url: `${BACKEND_BASE_URL}/usuarios` }),
      request({ name: 'dashboard-health-api', url: `${BACKEND_BASE_URL}/health` }),
    ]);

    validateContract(defeitos.json, 'GET /api/defeitos dashboard');
    validateContract(placas.json, 'GET /api/placas dashboard');
    validateContract(usuarios.json, 'GET /api/usuarios dashboard');
    validateContract(health.json, 'GET /api/health dashboard');
    return `${page}; counts=${defeitos.json.data.length}/${placas.json.data.length}/${usuarios.json.data.length}`;
  });

  await runStep('Frontend Usuarios page renders', 'Frontend', async () =>
    assertPageHasMarkers(`${FRONTEND_BASE_URL}/usuarios`, ['Usuários', 'Novo Usuário', 'cadastrados'])
  );

  await runStep('Frontend Defeitos page renders', 'Frontend', async () =>
    assertPageHasMarkers(`${FRONTEND_BASE_URL}/defeitos`, ['Defeitos', 'Carregando defeitos'])
  );

  await runStep('Frontend Relatorios page renders', 'Frontend', async () =>
    assertPageHasMarkers(`${FRONTEND_BASE_URL}/relatorios`, ['Repositório de Dados', 'Novo Relatório', 'Carregando relatorios'])
  );

  await runStep('Frontend Imagens page renders', 'Frontend', async () =>
    assertPageHasMarkers(`${FRONTEND_BASE_URL}/imagens`, ['Imagem para analise', 'Codigo da placa', 'Executar deteccao', 'Defeitos persistidos'])
  );

  await runStep('Frontend Configuracoes page renders health block', 'Frontend', async () =>
    assertPageHasMarkers(`${FRONTEND_BASE_URL}/configuracoes`, ['Configurações', 'Saúde dos serviços', 'API:', 'Database:', 'IA:'])
  );

  await runStep('Frontend proxy health (frontend -> backend)', 'Frontend/Backend', async () => {
    const res = await request({
      name: 'frontend-proxy-health',
      url: `${FRONTEND_API_BASE_URL}/health`,
      expectedStatus: 200,
    });

    assert(res.contentType.includes('application/json'), 'Frontend proxy health must return JSON');
    validateContract(res.json, 'GET /backend-api/health');
    assert(res.json.success === true, 'Frontend proxy health should return success=true');
    assert(res.json.data && res.json.data.database === 'ok', 'Frontend proxy health should expose backend database status');
    return `proxyHealth=${res.json.data.api}`;
  });

  await runStep('Frontend proxy detection upload', 'Frontend/Backend', async () => {
    assert(ctx.detectionFixture, 'Fixture de imagem real nao carregada');

    const res = await sendDetectionUpload({
      url: `${FRONTEND_API_BASE_URL}/detection`,
      fileName: ctx.detectionFixture.fileName,
      fileBuffer: ctx.detectionFixture.buffer,
      mimeType: ctx.detectionFixture.mimeType,
      placaCodigo: frontendDetectionPlacaCodigo,
    });

    validateContract(res.json, 'POST /backend-api/detection');
    assert(res.json.success === true, 'Frontend proxy detection should return success=true');
    assert(Array.isArray(res.json.data.detections), 'Frontend proxy detection must expose detections array');
    assert(Array.isArray(res.json.data.savedDefeitos), 'Frontend proxy detection must expose savedDefeitos array');
    return `proxyDetections=${res.json.data.detections.length} saved=${res.json.data.savedDefeitos.length}`;
  });

  await runStep('System flow via frontend proxy creates usuario in DB', 'System-Wide', async () => {
    const proxyUserEmail = `proxy.${runTag}@inspectai.local`;

    const createRes = await request({
      name: 'frontend-proxy-usuarios-post',
      method: 'POST',
      url: `${FRONTEND_API_BASE_URL}/usuarios`,
      expectedStatus: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: proxyUserEmail,
        nome: `Proxy User ${runTag}`,
        papel: 'funcionario',
      }),
    });
    validateContract(createRes.json, 'POST /backend-api/usuarios');
    assert(createRes.json.success === true, 'Proxy create usuario should return success=true');

    const listRes = await request({
      name: 'backend-usuarios-verify-proxy-insert',
      url: `${BACKEND_BASE_URL}/usuarios`,
      expectedStatus: 200,
    });
    validateContract(listRes.json, 'GET /api/usuarios verify proxy insert');
    const found = Array.isArray(listRes.json.data)
      ? listRes.json.data.find((item) => item.email === proxyUserEmail)
      : null;
    assert(Boolean(found), 'User created through frontend proxy must exist in backend list');
    return `proxyInsertedUserId=${found.id}`;
  });

  await runStep('AI service health endpoint', 'Containers', async () => {
    const res = await request({
      name: 'ai-health',
      url: `${AI_BASE_URL}/health`,
      expectedStatus: 200,
    });

    assert(res.contentType.includes('application/json'), 'AI health must return JSON');
    assert(res.json && typeof res.json === 'object', 'AI health must return JSON object');
    assert('status' in res.json, 'AI health must include status');
    return `aiStatus=${res.json.status}`;
  });

  const endedAt = nowIso();
  const report = buildReport({
    startedAt,
    endedAt,
    resultsList: results,
    failedList: failures,
    integrationSummary,
  });

  fs.writeFileSync(REPORT_OUTPUT_PATH, report, 'utf8');

  const total = results.length;
  const failed = failures.length;
  const passed = total - failed;
  const score = scoreHealth(total, failed);

  console.log('');
  console.log('Integration test summary');
  console.log(`- Passed: ${passed}/${total}`);
  console.log(`- Failed: ${failed}/${total}`);
  console.log(`- Health score: ${score}%`);
  console.log(`- Report: ${REPORT_OUTPUT_PATH}`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  const failureReport = [
    '# Integration Testing Report',
    '',
    `Generated at: ${nowIso()}`,
    '',
    '## Fatal Runner Error',
    '',
    `- ${error && error.message ? error.message : String(error)}`,
    '',
    '## Suggested Fix',
    '',
    '- Verifique dependencias de runtime (containers ativos e endpoints acessiveis).',
  ].join('\n');

  fs.writeFileSync(REPORT_OUTPUT_PATH, failureReport, 'utf8');
  console.error(error);
  process.exit(1);
});
