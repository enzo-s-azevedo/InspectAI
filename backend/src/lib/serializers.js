export function serializeUsuario(usuario) {
  if (!usuario) return null;

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
    status: usuario.status,
    avatar: usuario.avatar,
    criado: usuario.criado,
    atualizado: usuario.atualizado,
  };
}

export function serializePlaca(placa) {
  if (!placa) return null;

  return {
    id: placa.id,
    codigo: placa.codigo,
    nome_classe: placa.nomeClasse,
    descricao: placa.descricao,
    localizacao: placa.localizacao,
    criado: placa.criado,
    atualizado: placa.atualizado,
    defeitos: Array.isArray(placa.defeitos)
      ? placa.defeitos.map((defeito) => ({
          id: defeito.id,
          codigoInterno: defeito.codigoInterno,
          tipo: defeito.tipo,
          severidade: defeito.severidade,
          status: defeito.status,
        }))
      : undefined,
  };
}

export function serializeDefeito(defeito) {
  if (!defeito) return null;

  return {
    id: defeito.id,
    classe: defeito.classe,
    data_hora: defeito.dataHora,
    nome_arquivo_origem: defeito.nomeArquivoOrigem,
    id_placa_origem: defeito.idPlacaOrigem || defeito.placaId,
    codigoInterno: defeito.codigoInterno,
    tipo: defeito.tipo,
    componente: defeito.componente,
    origem: defeito.origem,
    severidade: defeito.severidade,
    descricao: defeito.descricao,
    status: defeito.status,
    criado: defeito.criado,
    atualizado: defeito.atualizado,
    resolvido: defeito.resolvido,
    placa: defeito.placa
      ? {
          id: defeito.placa.id,
          codigo: defeito.placa.codigo,
          descricao: defeito.placa.descricao,
        }
      : null,
    usuario: defeito.usuario
      ? {
          id: defeito.usuario.id,
          nome: defeito.usuario.nome,
          email: defeito.usuario.email,
        }
      : null,
    imagens: Array.isArray(defeito.imagens)
      ? defeito.imagens.map((imagem) => ({
          id: imagem.id,
          url: imagem.url,
          tipo: imagem.tipo,
          metadados: imagem.metadados,
          criado: imagem.criado,
        }))
      : undefined,
  };
}

export function serializeRelatorio(relatorio) {
  if (!relatorio) return null;

  return {
    id: relatorio.id,
    codigoInterno: relatorio.codigoInterno,
    titulo: relatorio.titulo,
    descricao: relatorio.descricao,
    origem: relatorio.origem,
    status: relatorio.status,
    criado: relatorio.criado,
    atualizado: relatorio.atualizado,
    usuario: relatorio.usuario
      ? {
          id: relatorio.usuario.id,
          nome: relatorio.usuario.nome,
          email: relatorio.usuario.email,
        }
      : null,
    defeitos: Array.isArray(relatorio.defeitos)
      ? relatorio.defeitos.map((item) => ({
          id: item.id,
          notas: item.notas,
          defeito: serializeDefeito(item.defeito),
        }))
      : undefined,
  };
}
