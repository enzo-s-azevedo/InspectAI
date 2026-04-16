const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/backend-api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
    cache: 'no-store',
  });

  const contentType = response.headers.get('content-type') || '';
  const rawBody = await response.text();

  let payload = null;
  if (rawBody && contentType.includes('application/json')) {
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = null;
    }
  }

  if (!response.ok || !payload?.success) {
    const errorMessage =
      payload?.error?.message ||
      (rawBody && !contentType.includes('application/json')
        ? `Resposta invalida da API (${response.status}): esperado JSON e recebido ${contentType || 'desconhecido'}`
        : `Erro inesperado na API (${response.status})`);
    throw new Error(errorMessage);
  }

  return payload;
}

export const api = {
  getHealth: async () => {
    const payload = await request('/health');
    return payload.data;
  },
  getDefeitos: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const payload = await request(`/defeitos${query ? `?${query}` : ''}`);
    return payload.data;
  },
  createDefeito: async (body) => {
    const payload = await request('/defeitos', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return payload.data;
  },
  getUsuarios: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const payload = await request(`/usuarios${query ? `?${query}` : ''}`);
    return payload.data;
  },
  createUsuario: async (body) => {
    const payload = await request('/usuarios', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return payload.data;
  },
  getPlacas: async () => {
    const payload = await request('/placas');
    return payload.data;
  },
  getRelatorios: async () => {
    const payload = await request('/relatorios');
    return payload.data;
  },
  analisarImagem: async ({ imageFile, placaCodigo }) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (placaCodigo) formData.append('placaCodigo', placaCodigo);

    const payload = await request('/detection', {
      method: 'POST',
      body: formData,
    });
    return payload.data;
  },
};