from __future__ import annotations

import json
from pathlib import Path


Detection = dict[str, object]


class DefectJsonExporter:
    def __init__(self, output_path: Path) -> None:
        self.output_path = output_path

    def _load_existing(self) -> list[dict[str, object]]:
        if not self.output_path.exists():
            return []

        with self.output_path.open("r", encoding="utf-8") as file:
            data = json.load(file)
            if isinstance(data, list):
                return data
        return []

    @staticmethod
    def _next_id(existing_payload: list[dict[str, object]]) -> int:
        if not existing_payload:
            return 1

        max_id = 0
        for item in existing_payload:
            value = item.get("id")
            if isinstance(value, int) and value > max_id:
                max_id = value
        return max_id + 1

    def append_detections(self, image_path: Path, defect_detections: list[Detection]) -> Path:
        payload = self._load_existing()
        next_id = self._next_id(payload)

        for defect in defect_detections:
            payload.append(
                {
                    "id": next_id,
                    "classe": str(defect["label"]),
                    "imagem_origem": str(image_path),
                    "data_hora": "DEFAULT",
                }
            )
            next_id += 1

        with self.output_path.open("w", encoding="utf-8") as file:
            json.dump(payload, file, ensure_ascii=False, indent=2)

        return self.output_path
