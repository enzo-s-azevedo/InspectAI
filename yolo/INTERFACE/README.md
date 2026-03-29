# INTERFACE

Esta pasta contem apenas recursos de visualizacao e inferencia.

## Conteudo esperado
- Interface grafica (`yolo_inspection_gui.py`)
- Modelos treinados (`*.pt`)
- Servico de inferencia (`inference_service.py`)
- Exportacao JSON de defeitos (`defect_json_exporter.py`)

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
    "imagem_origem": "caminho_ou_nome_da_imagem",
    "data_hora": "DEFAULT"
  }
]
```
