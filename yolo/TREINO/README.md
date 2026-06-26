# TREINO

Esta pasta contem apenas recursos de treinamento YOLO.

## Conteudo esperado
- Scripts de treino e preparacao de dados (`train.py`, `train_val_split.py`)
- Configuracao (`data.yaml`)
- Dados (`data/`, `custom_data/`)
- Resultados (`runs/`)
- Notebooks de treino (opcional)

## Regras de acoplamento
- Nao importa nada da pasta INTERFACE.
- Pode ser executada de forma independente via CLI.

## Exemplo de execucao
```bash
python train.py --model yolo11s.pt --data data.yaml --epochs 100 --imgsz 640 --batch 16 --device cpu
```
