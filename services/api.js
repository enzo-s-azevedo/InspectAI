// BASE URL aponta para o proxy do frontend Docker
// Em desenvolvimento local sem Docker: http://localhost:3001/api
const BASE_URL = '/backend-api'

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function request(path) {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || `Erro ${res.status}`)
  }
  const json = await res.json()
  // O backend retorna { success, data, meta, error }
  if (!json.success) throw new Error(json.error || 'Erro desconhecido')
  return json.data
}

async function requestBody(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || `Erro ${res.status}`)
  }
  const json = await res.json()
  if (!json.success) throw new Error(json.error || 'Erro desconhecido')
  return json.data
}

async function requestForm(path, formData) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || `Erro ${res.status}`)
  }
  const json = await res.json()
  if (!json.success) throw new Error(json.error || 'Erro desconhecido')
  return json.data
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const api = {

  // Health
  getHealth: () =>
    request('/health'),

  // Dashboard (usa os endpoints existentes para montar as métricas)
  getDashboard: async () => {
    const [defeitos, placas, usuarios] = await Promise.all([
      request('/defeitos'),
      request('/placas'),
      request('/usuarios'),
    ])
    return { defeitos, placas, usuarios }
  },

  // Placas
  getPlacas: () =>
    request('/placas'),

  getPlaca: (id) =>
    request(`/placas/${id}`),

  criarPlaca: (body) =>
    requestBody('POST', '/placas', body),

  editarPlaca: (id, body) =>
    requestBody('PUT', `/placas/${id}`, body),

  deletarPlaca: (id) =>
    requestBody('DELETE', `/placas/${id}`),

  // Defeitos
  getDefeitos: (params) =>
    request(`/defeitos${params ? `?${new URLSearchParams(params)}` : ''}`),

  criarDefeito: (body) =>
    requestBody('POST', '/defeitos', body),

  // Detecção por imagem (IA)
  analisarImagem: (formData) =>
    requestForm('/detection', formData),

  // Relatórios
  getRelatorios: () =>
    request('/relatorios'),

  criarRelatorio: (body) =>
    requestBody('POST', '/relatorios', body),

  // Usuários
  getUsuarios: () =>
    request('/usuarios'),

  criarUsuario: (body) =>
    requestBody('POST', '/usuarios', body),

  editarUsuario: (id, body) =>
    requestBody('PUT', `/usuarios/${id}`, body),

  deletarUsuario: (id) =>
    requestBody('DELETE', `/usuarios/${id}`),
}