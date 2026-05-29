const fs = require('node:fs');
const path = require('node:path');

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://localhost:3001/api';
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
const FRONTEND_API_BASE_URL = process.env.FRONTEND_API_BASE_URL || `${FRONTEND_BASE_URL}/backend-api`;
const DATABASE_URL = process.env.DATABASE_URL || '';
const REPORT_OUTPUT_PATH = process.env.REPORT_OUTPUT_PATH || path.resolve(process.cwd(), 'integration-report.md');

const results = [];
const failures = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request({ name, method = 'GET', url, body, headers = {}, expectedStatus = 200 }) {
  const response = await fetch(url, { method, body, headers, cache: 'no-store' });
  const rawText = await response.text();
  const json = rawText ? JSON.parse(rawText) : null;
  assert(response.status === expectedStatus, `${name}: expected ${expectedStatus}, got ${response.status}. ${rawText}`);
  return json;
}

async function runStep(name, fn) {
  const started = Date.now();
  try {
    const details = await fn();
    results.push({ name, status: 'PASS', durationMs: Date.now() - started, details: details || 'OK' });
  } catch (error) {
    const details = error?.message || String(error);
    results.push({ name, status: 'FAIL', durationMs: Date.now() - started, details });
    failures.push({ name, details });
  }
}

function validateContract(payload, context) {
  assert(payload && typeof payload === 'object', `${context}: JSON ausente`);
  assert('success' in payload, `${context}: success ausente`);
  assert('data' in payload, `${context}: data ausente`);
  assert('meta' in payload, `${context}: meta ausente`);
  assert('error' in payload, `${context}: error ausente`);
}

function tcpConnect(host, port, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const net = require('node:net');
    const socket = new net.Socket();
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error(`TCP timeout ${host}:${port}`));
    }, timeoutMs);

    socket.once('connect', () => {
      clearTimeout(timer);
      socket.destroy();
      resolve();
    });
    socket.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    socket.connect(port, host);
  });
}

async function main() {
  const runTag = Date.now();
  const modeloCodigo = `PCB-MIN-${runTag}`;
  let placaId = null;
  let defeitoId = null;

  await runStep('Database endpoint reachable', async () => {
    assert(DATABASE_URL, 'DATABASE_URL ausente');
    const dbUrl = new URL(DATABASE_URL);
    const port = Number(dbUrl.port || 5432);
    await tcpConnect(dbUrl.hostname, port);
    return `${dbUrl.hostname}:${port}`;
  });

  await runStep('Backend health', async () => {
    const payload = await request({ name: 'health', url: `${BACKEND_BASE_URL}/health` });
    validateContract(payload, 'GET /api/health');
    assert(payload.data.database === 'ok', 'database deve estar ok');
    return payload.data.api;
  });

  await runStep('Create modelo', async () => {
    const payload = await request({
      name: 'create-modelo',
      method: 'POST',
      url: `${BACKEND_BASE_URL}/modelos`,
      expectedStatus: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo: modeloCodigo }),
    });
    validateContract(payload, 'POST /api/modelos');
    assert(payload.data.codigo === modeloCodigo, 'modelo.codigo divergente');
    return modeloCodigo;
  });

  await runStep('Create placa', async () => {
    const payload = await request({
      name: 'create-placa',
      method: 'POST',
      url: `${BACKEND_BASE_URL}/placas`,
      expectedStatus: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modelo_codigo: modeloCodigo }),
    });
    validateContract(payload, 'POST /api/placas');
    placaId = payload.data.id;
    assert(Number.isInteger(placaId), 'placa.id invalido');
    assert(payload.data.modelo_codigo === modeloCodigo, 'placa.modelo_codigo divergente');
    return `placa=${placaId}`;
  });

  await runStep('Create defeito from image', async () => {
    const payload = await request({
      name: 'create-defeito',
      method: 'POST',
      url: `${BACKEND_BASE_URL}/defeitos`,
      expectedStatus: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        placa_id: placaId,
        tipo: 'imagem',
      }),
    });
    validateContract(payload, 'POST /api/defeitos');
    defeitoId = payload.data.id;
    assert(payload.data.placa_id === placaId, 'defeito.placa_id divergente');
    assert(payload.data.tipo === 'imagem', 'defeito.tipo deve ser imagem');
    assert(payload.data.data_hora === null, 'defeito de imagem deve ter data_hora null');
    return `defeito=${defeitoId}`;
  });

  await runStep('Read persisted relation chain', async () => {
    const payload = await request({ name: 'list-defeitos', url: `${BACKEND_BASE_URL}/defeitos?placa_id=${placaId}` });
    validateContract(payload, 'GET /api/defeitos');
    const item = payload.data.find((row) => row.id === defeitoId);
    assert(item, 'defeito criado nao encontrado');
    assert(item.placa.modelo_codigo === modeloCodigo, 'cadeia modelo -> placa -> defeito invalida');
    assert(item.tipo === 'imagem', 'tipo persistido divergente');
    return `rows=${payload.data.length}`;
  });

  await runStep('Create defeito from video with SQL timestamp', async () => {
    const payload = await request({
      name: 'create-video-defeito',
      method: 'POST',
      url: `${BACKEND_BASE_URL}/defeitos`,
      expectedStatus: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        placa_id: placaId,
        tipo: 'video',
      }),
    });
    validateContract(payload, 'POST /api/defeitos video');
    assert(payload.data.tipo === 'video', 'defeito.tipo deve ser video');
    assert(Boolean(payload.data.data_hora), 'defeito de video deve ter data_hora preenchida pelo SQL');
    return `videoDefeito=${payload.data.id}`;
  });

  await runStep('Frontend reachable', async () => {
    const response = await fetch(FRONTEND_BASE_URL, { cache: 'no-store' });
    const text = await response.text();
    assert(response.ok, `frontend status ${response.status}`);
    assert(text.includes('InspectAI'), 'frontend sem marcador InspectAI');
    return 'ok';
  });

  await runStep('Frontend proxy health', async () => {
    const payload = await request({ name: 'proxy-health', url: `${FRONTEND_API_BASE_URL}/health` });
    validateContract(payload, 'GET /backend-api/health');
    return payload.data.database;
  });

  const lines = [
    '# Integration Testing Report',
    '',
    `Generated at: ${new Date().toISOString()}`,
    '',
    '| Step | Status | Duration (ms) | Details |',
    '|---|---|---:|---|',
    ...results.map((item) => `| ${item.name} | ${item.status} | ${item.durationMs} | ${String(item.details).replace(/\|/g, '/')} |`),
    '',
    `Failures: ${failures.length}`,
  ];

  fs.writeFileSync(REPORT_OUTPUT_PATH, lines.join('\n'), 'utf8');
  if (failures.length) process.exitCode = 1;
}

main().catch((error) => {
  fs.writeFileSync(REPORT_OUTPUT_PATH, `# Integration Testing Report\n\nFatal error: ${error.message}\n`, 'utf8');
  console.error(error);
  process.exit(1);
});
