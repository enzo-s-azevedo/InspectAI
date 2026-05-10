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

export function serializeModelo(modelo) {
  if (!modelo) return null;

  return {
    codigo: modelo.codigo,
    descricao: modelo.descricao,
    criado: modelo.criado,
    atualizado: modelo.atualizado,
    placas: Array.isArray(modelo.placas)
      ? modelo.placas.map((placa) => ({
          id: placa.id,
          codigo: placa.codigo,
          nome_classe: placa.nomeClasse,
        }))
      : undefined,
  };
}

export function serializePlaca(placa) {
  if (!placa) return null;

  return {
    id: placa.id,
    codigo: placa.codigo,
    modelo: placa.modeloCodigo,
    modelo_dados: placa.modelo
      ? {
          codigo: placa.modelo.codigo,
          descricao: placa.modelo.descricao,
        }
      : undefined,
    nome_classe: placa.nomeClasse,
    descricao: placa.descricao,
    localizacao: placa.localizacao,
    criado: placa.criado,
    atualizado: placa.atualizado,
    defeitos: Array.isArray(placa.defeitos)
      ? placa.defeitos.map((defeito) => ({
          id: defeito.id,
          classe_defeito: defeito.classeDefeito,
          confirmado: defeito.confirmado,
        }))
      : undefined,
  };
}

export function serializeDefeito(defeito) {
  if (!defeito) return null;

  return {
    id: defeito.id,
    classe_defeito: defeito.classeDefeito,
    data_hora: defeito.dataHora,
    nome_arquivo_origem: defeito.nomeArquivoOrigem,
    id_placa: defeito.idPlaca,
    componente: defeito.componente,
    origem: defeito.origem,
    descricao: defeito.descricao,
    confirmado: defeito.confirmado,
    criado: defeito.criado,
    atualizado: defeito.atualizado,
    resolvido: defeito.resolvido,
    placa: defeito.placa
      ? {
          id: defeito.placa.id,
          codigo: defeito.placa.codigo,
          modelo: defeito.placa.modeloCodigo,
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
    videos: Array.isArray(defeito.videos)
      ? defeito.videos.map((video) => serializeDefeitoVideo(video))
      : undefined,
  };
}

export function serializeDefeitoVideo(defeitoVideo) {
  if (!defeitoVideo) return null;

  return {
    id: defeitoVideo.id,
    defeito_id: defeitoVideo.defeitoId,
    datahora: defeitoVideo.dataHora,
    frame: defeitoVideo.frame,
    criado: defeitoVideo.criado,
    atualizado: defeitoVideo.atualizado,
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
