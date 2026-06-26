from __future__ import annotations

import argparse
from pathlib import Path

from ultralytics import YOLO


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Treinamento YOLO independente da interface grafica")
    parser.add_argument("--model", default="yolo11s.pt", help="Modelo base para treino")
    parser.add_argument("--data", default="data.yaml", help="Arquivo de configuracao do dataset")
    parser.add_argument("--epochs", type=int, default=100, help="Numero de epocas")
    parser.add_argument("--imgsz", type=int, default=640, help="Tamanho da imagem")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    parser.add_argument("--device", default="cpu", help="Device (cpu, 0, 0,1, etc)")
    parser.add_argument("--project", default="runs/detect", help="Pasta de saida dos resultados")
    parser.add_argument("--name", default="train", help="Nome da execucao")
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    treino_dir = Path(__file__).resolve().parent
    data_yaml = (treino_dir / args.data).resolve()

    if not data_yaml.exists():
        raise FileNotFoundError(f"Arquivo data.yaml nao encontrado: {data_yaml}")

    model = YOLO(args.model)
    model.train(
        data=str(data_yaml),
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        device=args.device,
        project=str((treino_dir / args.project).resolve()),
        name=args.name,
    )


if __name__ == "__main__":
    main()
