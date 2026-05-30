// BASE URL aponta para o proxy do frontend Docker
// Em desenvolvimento local sem Docker: http://localhost:3001/api
const BASE_URL = '/backend-api'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getErrorMessage(payload, fallback) {
  if (typeof payload?.error === 'string') return payload.error
  return payload?.error?.message || payload?.message || fallback
}

async function request(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(getErrorMessage(error, `Erro ${res.status}`))
  }
  const json = await res.json()
  // O backend retorna { success, data, meta, error }
  if (!json.success) throw new Error(getErrorMessage(json, 'Erro desconhecido'))
  return json.data
}

async function requestBody(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(getErrorMessage(error, `Erro ${res.status}`))
  }
  const json = await res.json()
  if (!json.success) throw new Error(getErrorMessage(json, 'Erro desconhecido'))
  return json.data
}

async function requestForm(path, formData) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: getAuthHeaders(),
    body: formData,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(getErrorMessage(error, `Erro ${res.status}`))
  }
  const json = await res.json()
  if (!json.success) throw new Error(getErrorMessage(json, 'Erro desconhecido'))
  return json.data
}

function getAuthHeaders(headers = {}) {
  if (typeof window === 'undefined') return headers

  try {
    const user = JSON.parse(window.localStorage.getItem('inspectai_user') || 'null')
    return user?.token
      ? { ...headers, Authorization: `Bearer ${user.token}` }
      : headers
  } catch {
    return headers
  }
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const api = {

  // Health
  getHealth: () =>
    request('/health'),

  // Modelos
  getModelos: () =>
    request('/modelos'),

  criarModelo: (body) =>
    requestBody('POST', '/modelos', body),

  // Dashboard (usa os endpoints existentes para montar as métricas)
  getDashboard: async () => {
    const [defeitos, placas, modelos] = await Promise.all([
      request('/defeitos'),
      request('/placas'),
      request('/modelos'),
    ])
    return { defeitos, placas, modelos }
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

  atualizarDefeito: (body) =>
    requestBody('PUT', '/defeitos', body),

  // Detecção por imagem (IA)
  analisarImagem: (formData) =>
    requestForm('/detection', formData),

  processarLoteImagens: (formData) =>
    requestForm('/detection/batch', formData),

  salvarDeteccoes: (body) =>
    requestBody('POST', '/detection/save', body),

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
