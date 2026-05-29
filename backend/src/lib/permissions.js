export const CARGOS = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  FUNCIONARIO: 'FUNCIONARIO',
};

export const PERMISSOES = {
  ADMIN: 'ADMIN',
  RELATORIOS: 'RELATORIOS',
};

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
