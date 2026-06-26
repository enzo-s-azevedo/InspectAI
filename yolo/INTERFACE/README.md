# INTERFACE

Esta pasta contem apenas recursos de visualizacao e inferencia.

## Conteudo esperado
- Interface grafica (`yolo_inspection_gui.py`)
- Modelos treinados (`*.pt`)
- Servico de inferencia (`inference_service.py`)
- Exportacao JSON de defeitos (`defect_json_exporter.py`)
- Endpoints `/predict` para imagens e `/predict-video` para vídeos

## Modelo obrigatorio
Para a API detectar defeitos, copie o peso treinado para esta pasta como:

```bash
yolo/INTERFACE/best.pt
```

Tambem funciona com outro arquivo `*.pt` nesta pasta, mas `best.pt` tem prioridade.
Depois de adicionar o arquivo, reconstrua o servico:

```bash
docker compose up -d --build ai backend frontend
```

## Regras de acoplamento
- Nao contem logica de treinamento.
- Nao importa nada da pasta TREINO.
- Funciona sem a pasta TREINO, desde que exista um modelo `.pt` aqui.

## Saida JSON obrigatoria
A interface gera/atualiza `defeitos_detectados.json` com este formato:

```json
[
  {
    "id": 1,
    "classe": "nome_do_defeito",
    "nome_arquivo_origem": "caminho_ou_nome_da_imagem",
    "id_placa_origem": "id_da_placa",
    "data_hora": "DEFAULT"
  }
]
```
