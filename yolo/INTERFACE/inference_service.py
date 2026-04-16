from __future__ import annotations

import re
from pathlib import Path

import cv2
from ultralytics import YOLO


BBox = tuple[int, int, int, int]
Detection = dict[str, object]


class YoloInferenceService:
    def __init__(
        self,
        model_path: Path,
        known_classes: set[str] | None = None,
        default_defect_labels: set[str] | None = None,
    ) -> None:
        self.model_path = model_path
        self.model = YOLO(str(model_path))
        self.known_classes = known_classes or set()
        self.default_defect_labels = default_defect_labels or set()

    def get_model_labels(self) -> set[str]:
        names = self.model.names
        if isinstance(names, dict):
            return {str(value).strip() for value in names.values()}
        return set()

    @staticmethod
    def is_generic_coco_labels(labels: set[str]) -> bool:
        common_coco = {"person", "bicycle", "car", "dog", "toothbrush"}
        return len(labels) >= 80 and common_coco.issubset(labels)

    @staticmethod
    def are_labels_compatible(expected_labels: set[str], model_labels: set[str]) -> bool:
        if not expected_labels or not model_labels:
            return True
        return len(expected_labels.intersection(model_labels)) > 0

    @staticmethod
    def find_latest_model(base_dir: Path) -> Path:
        candidates = sorted(base_dir.glob("*.pt"), key=lambda path: path.stat().st_mtime, reverse=True)
        if not candidates:
            raise FileNotFoundError(
                "Nenhum modelo .pt encontrado na pasta INTERFACE. "
                "Adicione um arquivo .pt em INTERFACE para usar a inferencia."
            )
        return candidates[0]

    @staticmethod
    def load_class_names(classes_file: Path) -> set[str]:
        if not classes_file.exists():
            return set()

        with classes_file.open("r", encoding="utf-8") as file:
            return {line.strip() for line in file if line.strip()}

    @staticmethod
    def load_class_names_from_data_yaml(data_yaml_file: Path) -> set[str]:
        if not data_yaml_file.exists():
            return set()

        lines = data_yaml_file.read_text(encoding="utf-8").splitlines()
        names: list[str] = []
        capture_block = False

        for raw_line in lines:
            line = raw_line.strip()
            if not line or line.startswith("#"):
                continue

            if line.startswith("names:"):
                capture_block = True
                inline_list_match = re.search(r"names:\s*\[(.*)\]", line)
                if inline_list_match:
                    values = [part.strip().strip("'\"") for part in inline_list_match.group(1).split(",")]
                    names.extend([value for value in values if value])
                    capture_block = False
                continue

            if capture_block:
                if line.startswith("-"):
                    value = line[1:].strip().strip("'\"")
                    if value:
                        names.append(value)
                    continue

                if re.match(r"^\d+\s*:\s*", line):
                    _, value = line.split(":", 1)
                    value = value.strip().strip("'\"")
                    if value:
                        names.append(value)
                    continue

                capture_block = False

        return set(names)

    @staticmethod
    def infer_default_defect_labels(labels: set[str]) -> set[str]:
        if not labels:
            return set()

        plus_labels = {label for label in labels if label.endswith("+")}
        if plus_labels:
            non_plus = {label for label in labels if not label.endswith("+")}
            if non_plus:
                return non_plus

        keyword_labels = {
            label
            for label in labels
            if any(token in label.casefold() for token in ["falt", "curto", "defeito", "erro", "falha", "missing", "short"])
        }
        if keyword_labels:
            return keyword_labels

        minus_labels = {label for label in labels if label.endswith("-")}
        if minus_labels:
            return minus_labels

        return set()

    def _is_defect_detection(
        self,
        class_id: int,
        label: str,
        configured_error_ids: set[int],
        configured_error_labels: set[str],
    ) -> bool:
        normalized_label = label.strip()

        if configured_error_ids or configured_error_labels:
            return class_id in configured_error_ids or normalized_label in configured_error_labels

        if self.default_defect_labels:
            return normalized_label in self.default_defect_labels

        reference_classes = self.known_classes or self.get_model_labels()
        if reference_classes:
            inferred = self.infer_default_defect_labels(reference_classes)
            if inferred:
                return normalized_label in inferred
            return normalized_label in reference_classes and normalized_label.endswith("-")

        return False

    def predict_defects(
        self,
        image_bgr: cv2.typing.MatLike,
        configured_error_ids: set[int],
        configured_error_labels: set[str],
    ) -> list[Detection]:
        results = self.model.predict(source=image_bgr, verbose=False)
        result = results[0]
        names = result.names
        boxes = result.boxes
        detections: list[Detection] = []

        if boxes is not None:
            for box in boxes:
                class_id = int(box.cls[0].item())
                label = str(names.get(class_id, str(class_id)))
                if not self._is_defect_detection(class_id, label, configured_error_ids, configured_error_labels):
                    continue

                confidence = float(box.conf[0].item())
                x1, y1, x2, y2 = (int(value) for value in box.xyxy[0].tolist())
                detections.append(
                    {
                        "class_id": class_id,
                        "label": label,
                        "confidence": confidence,
                        "bbox": (x1, y1, x2, y2),
                    }
                )

        detections.sort(key=lambda item: float(item["confidence"]), reverse=True)
        return detections


from flask import Flask, request, jsonify
import numpy as np

app = Flask(__name__)

# Instancia a classe que você já tem
# Ele vai procurar automaticamente o modelo .pt na pasta
base_path = Path(__file__).parent
model_file = None
service = None

try:
    model_file = YoloInferenceService.find_latest_model(base_path)
    service = YoloInferenceService(model_file)
except FileNotFoundError:
    service = None

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "Nenhuma imagem enviada"}), 400

    if service is None:
        return jsonify([])
    
    # Converte a imagem recebida para o formato que o OpenCV entende
    file = request.files['image'].read()
    np_img = np.frombuffer(file, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    # Roda a inferência (usando a sua classe)
    # Aqui passamos sets vazios para usar os labels padrão da classe
    detections = service.predict_defects(img, set(), set())
    
    return jsonify(detections)

@app.route('/health', methods=['GET'])
def health():
    if model_file is None:
        return jsonify({"status": "IA Online sem modelo", "model": None}), 200
    return jsonify({"status": "IA Online", "model": str(model_file.name)}), 200

if __name__ == '__main__':
    # '0.0.0.0' permite que o Docker receba conexões externas
    app.run(host='0.0.0.0', port=5000)