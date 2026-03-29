from __future__ import annotations

from pathlib import Path
import tkinter as tk
from tkinter import filedialog, messagebox

import cv2
from PIL import Image, ImageTk

from defect_json_exporter import DefectJsonExporter
from inference_service import YoloInferenceService


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
DISPLAY_SIZE = (640, 420)
ZOOM_SIZE = (320, 320)
DEFAULT_PREDICT_DIR = Path(__file__).resolve().parent


workspace = Path(__file__).resolve().parent
classes_file = workspace / "classes.txt"
data_yaml_file = workspace / "data.yaml"
defects_json_file = workspace / "defeitos_detectados.json"
current_image_path: Path | None = None
current_image_bgr: cv2.typing.MatLike | None = None
inference_service: YoloInferenceService | None = None
defect_json_exporter = DefectJsonExporter(defects_json_file)
known_classes: set[str] = set()
default_defect_labels: set[str] = set()
current_defect_detections: list[dict[str, object]] = []
current_defect_index = 0
loaded_image_paths: list[Path] = []
current_loaded_image_index = 0
configured_error_ids: set[int] = set()
configured_error_labels: set[str] = set()

root = tk.Tk()
root.title("Inspecao YOLO")
root.geometry("1060x760")

status_var = tk.StringVar(value="Carregue uma imagem para iniciar a inspecao.")
result_var = tk.StringVar(value="Resultado da inspecao: aguardando imagem")
model_var = tk.StringVar(value="Modelo: carregando...")
defect_nav_var = tk.StringVar(value="Defeito selecionado: nenhum")
image_nav_var = tk.StringVar(value="Imagem selecionada: nenhuma")

original_panel: tk.Label | None = None
zoom_panel: tk.Label | None = None
prev_button: tk.Button | None = None
next_button: tk.Button | None = None
prev_image_button: tk.Button | None = None
next_image_button: tk.Button | None = None
error_codes_entry: tk.Entry | None = None


def find_trained_model_candidate() -> Path | None:
    treino_dir = workspace.parent / "TREINO"
    candidates = sorted(
        treino_dir.glob("runs/detect/*/weights/best.pt"),
        key=lambda path: path.stat().st_mtime,
        reverse=True,
    )
    if candidates:
        return candidates[0]
    return None


def load_inference_model(model_path: Path, show_incompatibility_dialog: bool = False) -> bool:
    global inference_service

    inference_service = YoloInferenceService(
        model_path=model_path,
        known_classes=known_classes,
        default_defect_labels=default_defect_labels,
    )
    model_var.set(f"Modelo: {model_path.name}")

    labels = inference_service.get_model_labels()
    compatible = YoloInferenceService.are_labels_compatible(known_classes, labels)

    if not compatible:
        status_var.set(
            "Modelo incompativel com as classes esperadas. Selecione o .pt treinado no seu dataset de defeitos."
        )
        if show_incompatibility_dialog:
            messagebox.showwarning(
                "Modelo incompativel",
                "As classes do modelo nao batem com as classes configuradas em classes.txt/data.yaml.",
            )
        return False

    if YoloInferenceService.is_generic_coco_labels(labels):
        status_var.set(
            "Modelo generico (COCO) carregado. Use seu modelo treinado para detectar defeitos corretamente."
        )
    else:
        status_var.set(f"Modelo carregado: {model_path.name}")

    return True


def resize_for_display(image_bgr: cv2.typing.MatLike, size: tuple[int, int]) -> cv2.typing.MatLike:
    target_w, target_h = size
    height, width = image_bgr.shape[:2]
    scale = min(target_w / width, target_h / height)
    new_w = max(1, int(width * scale))
    new_h = max(1, int(height * scale))
    interpolation = cv2.INTER_AREA if scale < 1 else cv2.INTER_LINEAR
    return cv2.resize(image_bgr, (new_w, new_h), interpolation=interpolation)


def set_panel_image(panel: tk.Label, image_bgr: cv2.typing.MatLike, size: tuple[int, int]) -> None:
    display_bgr = resize_for_display(image_bgr, size)
    display_rgb = cv2.cvtColor(display_bgr, cv2.COLOR_BGR2RGB)
    photo = ImageTk.PhotoImage(Image.fromarray(display_rgb))
    panel.configure(image=photo, text="")
    panel.image = photo


def list_images_in_folder(folder_path: Path) -> list[Path]:
    return sorted([path for path in folder_path.iterdir() if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS])


def parse_error_codes(raw_text: str) -> tuple[set[int], set[str]]:
    separators = [",", ";", "\n", "\t"]
    normalized_text = raw_text
    for separator in separators:
        normalized_text = normalized_text.replace(separator, " ")

    ids: set[int] = set()
    labels: set[str] = set()
    for token in [part.strip() for part in normalized_text.split(" ") if part.strip()]:
        if token.isdigit():
            ids.add(int(token))
        else:
            labels.add(token)
    return ids, labels


def apply_error_codes(show_feedback: bool = False) -> None:
    global configured_error_ids, configured_error_labels

    if error_codes_entry is None:
        return

    ids, labels = parse_error_codes(error_codes_entry.get())
    configured_error_ids = ids
    configured_error_labels = labels

    if show_feedback:
        status_var.set(
            f"Filtro de erros aplicado: ids={sorted(configured_error_ids)} labels={sorted(configured_error_labels)}"
        )

        # Re-run inference immediately when the filter changes and an image is loaded.
        if current_image_bgr is not None and inference_service is not None:
            run_inference()


def update_navigation_buttons() -> None:
    has_multiple = len(current_defect_detections) > 1
    if prev_button is not None:
        prev_button.configure(state="normal" if has_multiple else "disabled")
    if next_button is not None:
        next_button.configure(state="normal" if has_multiple else "disabled")


def update_image_navigation_buttons() -> None:
    has_multiple = len(loaded_image_paths) > 1
    if prev_image_button is not None:
        prev_image_button.configure(state="normal" if has_multiple else "disabled")
    if next_image_button is not None:
        next_image_button.configure(state="normal" if has_multiple else "disabled")


def draw_selected_defect_indicator(image_bgr: cv2.typing.MatLike, bbox: tuple[int, int, int, int]) -> cv2.typing.MatLike:
    highlighted = image_bgr.copy()
    x1, y1, x2, y2 = bbox
    center_x = (x1 + x2) // 2
    center_y = (y1 + y2) // 2
    radius = max(18, min(x2 - x1, y2 - y1) // 2)

    cv2.circle(highlighted, (center_x, center_y), radius, (0, 255, 255), 3)

    arrow_start_x = max(20, x1 - 70)
    arrow_start_y = max(20, y1 - 40)
    cv2.arrowedLine(
        highlighted,
        (arrow_start_x, arrow_start_y),
        (center_x, center_y),
        (0, 255, 255),
        3,
        tipLength=0.25,
    )
    return highlighted


def refresh_display_for_selected_defect() -> None:
    if current_image_bgr is None:
        return

    if not current_defect_detections:
        if original_panel is not None:
            set_panel_image(original_panel, current_image_bgr, DISPLAY_SIZE)
        if zoom_panel is not None:
            zoom_panel.configure(image="", text="Peca OK")
            zoom_panel.image = None
        result_var.set("Resultado da inspecao: Peca OK")
        defect_nav_var.set("Defeito selecionado: nenhum")
        status_var.set("Nenhum defeito detectado.")
        update_navigation_buttons()
        return

    selected_defect = current_defect_detections[current_defect_index]
    annotated_image = current_image_bgr.copy()

    for index, defect in enumerate(current_defect_detections):
        x1, y1, x2, y2 = defect["bbox"]
        color = (0, 255, 255) if index == current_defect_index else (0, 0, 255)
        thickness = 3 if index == current_defect_index else 2
        cv2.rectangle(annotated_image, (x1, y1), (x2, y2), color, thickness)
        label = str(defect["label"])
        confidence = float(defect["confidence"])
        caption = f"{label} {confidence:.2f}"
        cv2.putText(
            annotated_image,
            caption,
            (x1, max(20, y1 - 10)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            color,
            2,
            cv2.LINE_AA,
        )

    highlighted_image = draw_selected_defect_indicator(annotated_image, selected_defect["bbox"])
    if original_panel is not None:
        set_panel_image(original_panel, highlighted_image, DISPLAY_SIZE)

    zoomed_crop = crop_defect(current_image_bgr, selected_defect["bbox"], zoom_factor=5)
    if zoom_panel is not None and zoomed_crop.size == 0:
        zoom_panel.configure(image="", text="Nao foi possivel ampliar a regiao detectada")
        zoom_panel.image = None
    elif zoom_panel is not None:
        set_panel_image(zoom_panel, zoomed_crop, ZOOM_SIZE)

    label = str(selected_defect["label"])
    confidence = float(selected_defect["confidence"])
    total = len(current_defect_detections)
    result_var.set(f"Resultado da inspecao: Defeito ({label})")
    defect_nav_var.set(f"Defeito selecionado: {current_defect_index + 1} de {total}")
    status_var.set(f"{total} defeito(s) detectado(s). Defeito atual: {label} com confianca {confidence:.2f}")
    update_navigation_buttons()


def show_previous_defect() -> None:
    global current_defect_index

    if not current_defect_detections:
        return

    current_defect_index = (current_defect_index - 1) % len(current_defect_detections)
    refresh_display_for_selected_defect()


def show_next_defect() -> None:
    global current_defect_index

    if not current_defect_detections:
        return

    current_defect_index = (current_defect_index + 1) % len(current_defect_detections)
    refresh_display_for_selected_defect()


def load_image_path(image_path: Path) -> None:
    global current_image_path, current_image_bgr, current_defect_detections, current_defect_index

    if image_path.suffix.lower() not in IMAGE_EXTENSIONS:
        messagebox.showerror("Formato invalido", "Selecione uma imagem compativel.")
        return

    image_bgr = cv2.imread(str(image_path))
    if image_bgr is None:
        messagebox.showerror("Erro ao abrir", "Nao foi possivel ler a imagem selecionada.")
        return

    current_image_path = image_path
    current_image_bgr = image_bgr
    current_defect_detections = []
    current_defect_index = 0
    status_var.set(f"Imagem carregada: {image_path.name}")
    result_var.set("Resultado da inspecao: processando...")
    defect_nav_var.set("Defeito selecionado: analisando")

    if loaded_image_paths:
        image_nav_var.set(f"Imagem selecionada: {current_loaded_image_index + 1} de {len(loaded_image_paths)}")
    else:
        image_nav_var.set("Imagem selecionada: individual")

    if original_panel is not None:
        set_panel_image(original_panel, image_bgr, DISPLAY_SIZE)
    if zoom_panel is not None:
        zoom_panel.configure(image="", text="Aguardando inferencia")
        zoom_panel.image = None

    run_inference()


def load_image() -> None:
    global loaded_image_paths, current_loaded_image_index

    file_path = filedialog.askopenfilename(
        title="Selecione uma imagem",
        filetypes=[("Imagens", "*.jpg *.jpeg *.png *.bmp *.webp")],
        initialdir=str(workspace),
    )
    if not file_path:
        return

    image_path = Path(file_path)
    loaded_image_paths = [image_path]
    current_loaded_image_index = 0
    update_image_navigation_buttons()
    load_image_path(image_path)


def select_model_file() -> None:
    file_path = filedialog.askopenfilename(
        title="Selecione um modelo YOLO (.pt)",
        filetypes=[("Modelos YOLO", "*.pt")],
        initialdir=str(workspace),
    )
    if not file_path:
        return

    model_path = Path(file_path)
    try:
        load_inference_model(model_path, show_incompatibility_dialog=True)

        if current_image_bgr is not None:
            run_inference()
    except Exception as exc:
        messagebox.showerror("Erro ao carregar modelo", str(exc))


def load_images_from_folder() -> None:
    global loaded_image_paths, current_loaded_image_index

    default_dir = DEFAULT_PREDICT_DIR if DEFAULT_PREDICT_DIR.exists() else workspace
    selected_dir = filedialog.askdirectory(title="Selecione a pasta com imagens", initialdir=str(default_dir))
    if not selected_dir:
        return

    folder_path = Path(selected_dir)
    if not folder_path.exists() or not folder_path.is_dir():
        messagebox.showerror("Pasta invalida", "A pasta selecionada nao existe ou e invalida.")
        return

    image_paths = list_images_in_folder(folder_path)
    if not image_paths:
        messagebox.showwarning("Sem imagens", "Nenhuma imagem compativel foi encontrada na pasta selecionada.")
        return

    loaded_image_paths = image_paths
    current_loaded_image_index = 0
    update_image_navigation_buttons()
    load_image_path(loaded_image_paths[current_loaded_image_index])
    status_var.set(f"Pasta carregada: {folder_path} | {len(loaded_image_paths)} imagem(ns)")


def show_previous_image() -> None:
    global current_loaded_image_index

    if len(loaded_image_paths) <= 1:
        return

    current_loaded_image_index = (current_loaded_image_index - 1) % len(loaded_image_paths)
    load_image_path(loaded_image_paths[current_loaded_image_index])


def show_next_image() -> None:
    global current_loaded_image_index

    if len(loaded_image_paths) <= 1:
        return

    current_loaded_image_index = (current_loaded_image_index + 1) % len(loaded_image_paths)
    load_image_path(loaded_image_paths[current_loaded_image_index])


def crop_defect(image_bgr: cv2.typing.MatLike, bbox: tuple[int, int, int, int], zoom_factor: int = 3) -> cv2.typing.MatLike:
    x1, y1, x2, y2 = bbox
    cropped = image_bgr[y1:y2, x1:x2]
    if cropped.size == 0:
        return cropped

    height, width = cropped.shape[:2]
    zoomed_size = (max(1, width * zoom_factor), max(1, height * zoom_factor))
    return cv2.resize(cropped, zoomed_size, interpolation=cv2.INTER_CUBIC)


def run_inference() -> None:
    global current_defect_detections, current_defect_index

    if current_image_bgr is None:
        messagebox.showwarning("Sem imagem", "Carregue uma imagem antes de rodar a inferencia.")
        return

    if inference_service is None:
        messagebox.showerror("Modelo indisponivel", "O modelo YOLO nao foi carregado.")
        return

    apply_error_codes(show_feedback=False)

    defect_detections = inference_service.predict_defects(
        image_bgr=current_image_bgr,
        configured_error_ids=configured_error_ids,
        configured_error_labels=configured_error_labels,
    )
    current_defect_detections = defect_detections
    current_defect_index = 0

    if current_image_path is not None:
        exported_json_path = defect_json_exporter.append_detections(current_image_path, current_defect_detections)
    else:
        exported_json_path = None

    display_results(current_defect_detections)

    if exported_json_path is not None:
        status_var.set(f"{status_var.get()} JSON atualizado em: {exported_json_path.name}")


def display_results(defect_detections: list[dict[str, object]]) -> None:
    current_defect_detections[:] = defect_detections
    refresh_display_for_selected_defect()


def setup_ui() -> None:
    global original_panel, zoom_panel, prev_button, next_button, prev_image_button, next_image_button, error_codes_entry

    top_frame = tk.Frame(root, padx=12, pady=12)
    top_frame.pack(fill="x")

    tk.Button(top_frame, text="Carregar imagem", command=load_image, width=20).pack(side="left")
    tk.Button(top_frame, text="Carregar pasta", command=load_images_from_folder, width=20).pack(side="left", padx=(8, 0))
    tk.Button(top_frame, text="Selecionar modelo", command=select_model_file, width=20).pack(side="left", padx=(8, 0))
    tk.Label(top_frame, textvariable=model_var, anchor="w").pack(side="left", padx=(16, 0))

    filter_frame = tk.Frame(root, padx=12, pady=0)
    filter_frame.pack(fill="x")
    tk.Label(filter_frame, text="Classes/defeitos a detectar (nomes ou IDs):").pack(side="left")
    error_codes_entry = tk.Entry(filter_frame, width=60)
    error_codes_entry.pack(side="left", padx=(8, 8), fill="x", expand=True)
    tk.Button(filter_frame, text="Aplicar", command=lambda: apply_error_codes(show_feedback=True), width=10).pack(side="left")

    content_frame = tk.Frame(root, padx=12, pady=12)
    content_frame.pack(fill="both", expand=True)
    content_frame.columnconfigure(0, weight=2)
    content_frame.columnconfigure(1, weight=1)
    content_frame.rowconfigure(1, weight=1)

    tk.Label(content_frame, text="Imagem original com bounding box", anchor="w", font=("Segoe UI", 11, "bold")).grid(row=0, column=0, sticky="w", pady=(0, 8))
    tk.Label(content_frame, text="Defeito ampliado", anchor="w", font=("Segoe UI", 11, "bold")).grid(row=0, column=1, sticky="w", padx=(16, 0), pady=(0, 8))

    original_panel = tk.Label(content_frame, text="Imagem original", bg="#d9d9d9", width=80, height=24)
    zoom_panel = tk.Label(content_frame, text="Regiao do defeito ampliada", bg="#d9d9d9", width=40, height=20)

    original_panel.grid(row=1, column=0, sticky="nsew")
    zoom_panel.grid(row=1, column=1, sticky="nsew", padx=(16, 0))

    navigation_frame = tk.Frame(content_frame)
    navigation_frame.grid(row=2, column=1, sticky="ew", padx=(16, 0), pady=(10, 0))
    navigation_frame.columnconfigure(1, weight=1)

    prev_button = tk.Button(navigation_frame, text="<- Defeito anterior", command=show_previous_defect, state="disabled")
    prev_button.grid(row=0, column=0, sticky="w")

    tk.Label(navigation_frame, textvariable=defect_nav_var, anchor="center").grid(row=0, column=1, sticky="ew", padx=8)

    next_button = tk.Button(navigation_frame, text="Proximo defeito ->", command=show_next_defect, state="disabled")
    next_button.grid(row=0, column=2, sticky="e")

    image_navigation_frame = tk.Frame(content_frame)
    image_navigation_frame.grid(row=3, column=0, columnspan=2, sticky="ew", pady=(10, 0))
    image_navigation_frame.columnconfigure(1, weight=1)

    prev_image_button = tk.Button(image_navigation_frame, text="<- Imagem anterior", command=show_previous_image, state="disabled")
    prev_image_button.grid(row=0, column=0, sticky="w")

    tk.Label(image_navigation_frame, textvariable=image_nav_var, anchor="center").grid(row=0, column=1, sticky="ew", padx=8)

    next_image_button = tk.Button(image_navigation_frame, text="Proxima imagem ->", command=show_next_image, state="disabled")
    next_image_button.grid(row=0, column=2, sticky="e")

    bottom_frame = tk.Frame(root, padx=12, pady=12)
    bottom_frame.pack(fill="x")
    tk.Label(bottom_frame, textvariable=result_var, anchor="w", font=("Segoe UI", 12, "bold")).pack(fill="x")
    tk.Label(bottom_frame, textvariable=status_var, anchor="w").pack(fill="x", pady=(6, 0))


def initialize_model() -> None:
    global known_classes, default_defect_labels

    known_classes = YoloInferenceService.load_class_names(classes_file)
    if not known_classes:
        known_classes = YoloInferenceService.load_class_names_from_data_yaml(data_yaml_file)

    default_defect_labels = YoloInferenceService.infer_default_defect_labels(known_classes)
    model_path = YoloInferenceService.find_latest_model(workspace)

    default_error_labels = sorted(default_defect_labels)
    if error_codes_entry is not None:
        error_codes_entry.delete(0, tk.END)
        error_codes_entry.insert(0, ",".join(default_error_labels))
    apply_error_codes(show_feedback=False)

    primary_ok = load_inference_model(model_path, show_incompatibility_dialog=False)

    if not primary_ok:
        trained_candidate = find_trained_model_candidate()
        if trained_candidate is not None:
            trained_ok = load_inference_model(trained_candidate, show_incompatibility_dialog=False)
            if trained_ok:
                status_var.set(f"Modelo de treino carregado automaticamente: {trained_candidate.name}")


def main() -> None:
    setup_ui()

    try:
        initialize_model()
    except Exception as exc:
        model_var.set("Modelo: erro ao carregar")
        status_var.set(str(exc))
        messagebox.showerror("Erro ao carregar modelo", str(exc))

    root.mainloop()


if __name__ == "__main__":
    main()