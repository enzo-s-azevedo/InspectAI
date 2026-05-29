export const CARGOS = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  FUNCIONARIO: 'FUNCIONARIO',
};

export const PERMISSOES = {
  ADMIN: 'ADMIN',
  RELATORIOS: 'RELATORIOS',
};

export const ROTAS_ADMIN = ['/usuarios', '/configuracoes', '/relatorios'];

export function normalizarCargo(cargo) {
  return String(cargo || '').trim().toUpperCase();
}

export function permissoesPorCargo(cargo) {
  return normalizarCargo(cargo) === CARGOS.ADMINISTRADOR
    ? [PERMISSOES.ADMIN, PERMISSOES.RELATORIOS]
    : [];
}

export function isAdministrador(cargo) {
  return normalizarCargo(cargo) === CARGOS.ADMINISTRADOR;
}

export function getUsuarioLogado() {
  if (typeof window === 'undefined') return null;

  try {
    const userJson = window.localStorage.getItem('inspectai_user');
    return userJson ? JSON.parse(userJson) : null;
  } catch {
    return null;
  }
}

export function usuarioTemPermissao(usuario, permissao) {
  const permissoes = Array.isArray(usuario?.permissoes)
    ? usuario.permissoes
    : permissoesPorCargo(usuario?.cargo);

  return permissoes.includes(permissao);
}
