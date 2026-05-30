export function serializeModelo(modelo) {
  if (!modelo) return null;

  return {
    codigo: modelo.codigo,
    placas: Array.isArray(modelo.placas)
      ? modelo.placas.map((placa) => ({
          id: placa.id,
          modelo_codigo: placa.modeloCodigo,
        }))
      : undefined,
  };
}

export function serializePlaca(placa) {
  if (!placa) return null;

  return {
    id: placa.id,
    modelo_codigo: placa.modeloCodigo,
    modelo: placa.modelo ? { codigo: placa.modelo.codigo } : undefined,
    defeitos: Array.isArray(placa.defeitos)
      ? placa.defeitos.map((defeito) => ({
          id: defeito.id,
          classe_defeito: defeito.classeDefeito,
          status_confirmacao: defeito.statusConfirmacao,
          tipo: defeito.tipo,
          data_hora: defeito.dataHora,
        }))
      : undefined,
  };
}

export function serializeDefeito(defeito) {
  if (!defeito) return null;

  return {
    id: defeito.id,
    classe_defeito: defeito.classeDefeito,
    status_confirmacao: defeito.statusConfirmacao,
    tipo: defeito.tipo,
    data_hora: defeito.dataHora,
    placa_id: defeito.placaId,
    id_placa: defeito.placaId,
    placa: defeito.placa
      ? {
          id: defeito.placa.id,
          modelo_codigo: defeito.placa.modeloCodigo,
        }
      : null,
  };
}

export function serializeRelatorio(relatorio) {
  if (!relatorio) return null;

  return {
    id: relatorio.id,
    placa_id: relatorio.placaId,
    id_usuario_criador: relatorio.idUsuarioCriador,
    id_usuario_ultimo_acesso: relatorio.idUsuarioUltimoAcesso,
    criado_em: relatorio.criadoEm,
    atualizado_em: relatorio.atualizadoEm,
    placa: relatorio.placa
      ? {
          id: relatorio.placa.id,
          modelo_codigo: relatorio.placa.modeloCodigo,
        }
      : undefined,
    usuario_criador: relatorio.usuarioCriador
      ? {
          id: relatorio.usuarioCriador.id,
          nome: relatorio.usuarioCriador.nome,
          email: relatorio.usuarioCriador.email,
        }
      : undefined,
    usuario_ultimo_acesso: relatorio.usuarioUltimoAcesso
      ? {
          id: relatorio.usuarioUltimoAcesso.id,
          nome: relatorio.usuarioUltimoAcesso.nome,
          email: relatorio.usuarioUltimoAcesso.email,
        }
      : null,
  };
}
