import { useEffect, useRef,useState } from "react";
import { Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, useTexture} from "@react-three/drei";
import * as THREE from "three";
import "../styles/home.css";
import "../styles/lova-capsule.css";
import { CapsuleModel } from "../scripts/capsule.jsx";
import logo from "../assets/logo/tempus-logo.png";

const capsuleHeader = (
  <>
      {/* HEADER */}
      <header className="hp-nav">
        <div className="hp-nav-inner">
          <Link to="/home" className="hp-logo">
            <img src={logo} alt="Tempus Capsule" className="hp-logo-img" />
          </Link>
          <nav className="hp-menu">
            <Link className="hp-menu-item" to="/feature/hora">HoraWhisper+</Link>
            <Link className="hp-menu-item" to="/feature/lova">LovaNote</Link>
            <Link className="hp-menu-item" to="/feature/eterea">EtereaMoment</Link>
            <Link className="hp-menu-item" to="/feature/vermis">VermissSandglass</Link>
          </nav>
          <Link className="hp-user" to="/profile" aria-label="Profile">
            <span className="hp-user-icon">👤</span>
          </Link>
        </div>
      </header>

  </>
);

const STICKER_FILES = [
  "IMG_1283.png",
  "IMG_1284.png",
  "IMG_1285.png",
  "IMG_1286.png",
  "IMG_1287.png",
  "IMG_1288.png",
  "IMG_1289.png",
  "IMG_1290.png",
  "IMG_1291.png",
  "IMG_1292.png",
  "IMG_1293.png",
  "IMG_1294.png",
  "IMG_1295.png",
  "IMG_1296.png",
  "IMG_1297.png",
  "IMG_1298.png",
];

const STICKER_PATHS = STICKER_FILES.map((file) => `/stickers_capsule/${file}`);
const PHOTO_FRAME_SIZE = 320;
const PHOTO_OUTPUT_SIZE = 1024;
const DEFAULT_TOP_COLOR = "#ffffff";
const DEFAULT_RING_COLOR = "#f2ece6";
const DEFAULT_BOTTOM_COLOR = "#ffffff";
const PHOTO_SHAPES = [
  { id: "normal", label: "Original" },
  { id: "circle", label: "Circle" },
  { id: "heart", label: "Heart" },
  { id: "star", label: "Star" },
  { id: "square", label: "Square" },
];
const TEXT_FONT_OPTIONS = [
  {
    id: "modern",
    label: "Modern",
    family: '"Avenir Next", "Helvetica Neue", "Segoe UI", sans-serif',
  },
  {
    id: "serif",
    label: "Serif",
    family: '"Cormorant Garamond", Georgia, serif',
  },
  {
    id: "mono",
    label: "Mono",
    family: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
  },
  {
    id: "script",
    label: "Script",
    family: '"Brush Script MT", "Snell Roundhand", cursive',
  },
];
const TEXT_STYLE_OPTIONS = [
  { id: "regular", label: "Regular", fontStyle: "normal", fontWeight: 500 },
  { id: "bold", label: "Bold", fontStyle: "normal", fontWeight: 700 },
  { id: "italic", label: "Italic", fontStyle: "italic", fontWeight: 600 },
];

function getTextFontOption(fontId) {
  return TEXT_FONT_OPTIONS.find((option) => option.id === fontId) || TEXT_FONT_OPTIONS[0];
}

function getTextStyleOption(styleId) {
  return TEXT_STYLE_OPTIONS.find((option) => option.id === styleId) || TEXT_STYLE_OPTIONS[0];
}

function createTextStickerTexture({
  text,
  fontFamily = "modern",
  fontStyle = "regular",
  fontSize = 88,
  color = "#5f4b44",
}) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (!lines.length) return null;

  const font = getTextFontOption(fontFamily);
  const style = getTextStyleOption(fontStyle);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const fontPx = Math.max(36, Math.min(180, fontSize));
  const paddingX = Math.round(fontPx * 0.38);
  const paddingY = Math.round(fontPx * 0.32);
  const lineHeight = Math.round(fontPx * 1.08);
  ctx.font = `${style.fontStyle} ${style.fontWeight} ${fontPx}px ${font.family}`;
  const maxTextWidth = Math.max(...lines.map((line) => ctx.measureText(line).width), 1);

  canvas.width = Math.ceil(maxTextWidth + paddingX * 2);
  canvas.height = Math.ceil(lineHeight * lines.length + paddingY * 2);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${style.fontStyle} ${style.fontWeight} ${fontPx}px ${font.family}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.shadowColor = "rgba(255,255,255,0.4)";
  ctx.shadowBlur = Math.max(4, fontPx * 0.08);

  lines.forEach((line, index) => {
    const y = paddingY + lineHeight * index + lineHeight / 2;
    ctx.fillText(line, canvas.width / 2, y);
  });

  return {
    texture: canvas.toDataURL("image/png"),
    aspectRatio: canvas.width / Math.max(canvas.height, 1),
  };
}

function getPhotoShapeMask(shape) {
  if (shape === "normal") return "none";

  let svg = "";

  switch (shape) {
    case "circle":
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="black"/></svg>`;
      break;
    case "heart":
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 90C22 68 10 47 10 30C10 15 21 6 34 6C42 6 48 10 50 18C52 10 58 6 66 6C79 6 90 15 90 30C90 47 78 68 50 90Z" fill="black"/></svg>`;
      break;
    case "star":
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,5 61,35 94,36 68,57 77,92 50,73 23,92 32,57 6,36 39,35" fill="black"/></svg>`;
      break;
    case "square":
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="0" y="0" width="100" height="100" fill="black"/></svg>`;
      break;
    default:
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="10" ry="10" fill="black"/></svg>`;
      break;
  }

  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

function createPhotoShapePath(shape, size) {
  if (shape === "circle") {
    const path = new Path2D();
    path.arc(size / 2, size / 2, size * 0.48, 0, Math.PI * 2);
    return path;
  }

  if (shape === "heart") {
    const base = new Path2D("M50 90C22 68 10 47 10 30C10 15 21 6 34 6C42 6 48 10 50 18C52 10 58 6 66 6C79 6 90 15 90 30C90 47 78 68 50 90Z");
    const scaled = new Path2D();
    scaled.addPath(base, new DOMMatrix().scale(size / 100));
    return scaled;
  }

  if (shape === "star") {
    const base = new Path2D("M50 5L61 35L94 36L68 57L77 92L50 73L23 92L32 57L6 36L39 35Z");
    const scaled = new Path2D();
    scaled.addPath(base, new DOMMatrix().scale(size / 100));
    return scaled;
  }

  if (shape === "square") {
    return new Path2D(`M0 0H${size}V${size}H0Z`);
  }

  const roundedRect = new Path2D();
  const corner = size * 0.08;
  roundedRect.moveTo(corner, 0);
  roundedRect.lineTo(size - corner, 0);
  roundedRect.quadraticCurveTo(size, 0, size, corner);
  roundedRect.lineTo(size, size - corner);
  roundedRect.quadraticCurveTo(size, size, size - corner, size);
  roundedRect.lineTo(corner, size);
  roundedRect.quadraticCurveTo(0, size, 0, size - corner);
  roundedRect.lineTo(0, corner);
  roundedRect.quadraticCurveTo(0, 0, corner, 0);
  roundedRect.closePath();
  return roundedRect;
}

function cloneSticker(sticker) {
  return {
    ...sticker,
    localPosition: sticker?.localPosition?.clone?.() ?? sticker?.localPosition ?? null,
    rotation: sticker?.rotation?.clone?.() ?? sticker?.rotation ?? null,
    normal: sticker?.normal?.clone?.() ?? sticker?.normal ?? null,
    photoEdit: sticker?.photoEdit
      ? {
          ...sticker.photoEdit,
          offset: sticker.photoEdit.offset ? { ...sticker.photoEdit.offset } : { x: 0, y: 0 },
          meta: sticker.photoEdit.meta ? { ...sticker.photoEdit.meta } : { width: 1, height: 1 },
        }
      : null,
    textEdit: sticker?.textEdit ? { ...sticker.textEdit } : null,
  };
}

function createCapsuleSnapshot({ topColor, ringColor, bottomColor, stickers }) {
  return {
    topColor,
    ringColor,
    bottomColor,
    stickers: stickers.map(cloneSticker),
  };
}

function vectorsEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return a === b;
  if (typeof a.equals === "function") return a.equals(b);

  return (
    a.x === b.x &&
    a.y === b.y &&
    a.z === b.z &&
    ("order" in a ? a.order : undefined) === ("order" in b ? b.order : undefined)
  );
}

function stickersEqual(a = [], b = []) {
  if (a.length !== b.length) return false;

  return a.every((sticker, index) => {
    const other = b[index];
    if (!other) return false;

    return (
      sticker.part === other.part &&
      sticker.meshId === other.meshId &&
      sticker.sourceMeshName === other.sourceMeshName &&
      sticker.scale === other.scale &&
      sticker.size === other.size &&
      sticker.texture === other.texture &&
      sticker.aspectRatio === other.aspectRatio &&
      sticker.kind === other.kind &&
      sticker.rotationOffset === other.rotationOffset &&
      vectorsEqual(sticker.localPosition, other.localPosition) &&
      vectorsEqual(sticker.rotation, other.rotation) &&
      vectorsEqual(sticker.normal, other.normal) &&
      (sticker.photoEdit?.source ?? null) === (other.photoEdit?.source ?? null) &&
      (sticker.photoEdit?.shape ?? null) === (other.photoEdit?.shape ?? null) &&
      (sticker.photoEdit?.zoom ?? null) === (other.photoEdit?.zoom ?? null) &&
      (sticker.photoEdit?.offset?.x ?? 0) === (other.photoEdit?.offset?.x ?? 0) &&
      (sticker.photoEdit?.offset?.y ?? 0) === (other.photoEdit?.offset?.y ?? 0) &&
      (sticker.photoEdit?.meta?.width ?? 1) === (other.photoEdit?.meta?.width ?? 1) &&
      (sticker.photoEdit?.meta?.height ?? 1) === (other.photoEdit?.meta?.height ?? 1) &&
      (sticker.textEdit?.text ?? null) === (other.textEdit?.text ?? null) &&
      (sticker.textEdit?.fontFamily ?? null) === (other.textEdit?.fontFamily ?? null) &&
      (sticker.textEdit?.fontStyle ?? null) === (other.textEdit?.fontStyle ?? null) &&
      (sticker.textEdit?.fontSize ?? null) === (other.textEdit?.fontSize ?? null)
    );
  });
}

function snapshotsEqual(a, b) {
  if (!a || !b) return false;

  return (
    a.topColor === b.topColor &&
    a.ringColor === b.ringColor &&
    a.bottomColor === b.bottomColor &&
    stickersEqual(a.stickers, b.stickers)
  );
}

export default function LovaCapsule({ onBack }) {
  const [selectedPart, setSelectedPart] = useState(null);
  const [topColor, setTopColor] = useState(DEFAULT_TOP_COLOR);
  const [ringColor, setRingColor] = useState(DEFAULT_RING_COLOR);
  const [bottomColor, setBottomColor] = useState(DEFAULT_BOTTOM_COLOR);
  const [history, setHistory] = useState(() => [
    createCapsuleSnapshot({
      topColor: DEFAULT_TOP_COLOR,
      ringColor: DEFAULT_RING_COLOR,
      bottomColor: DEFAULT_BOTTOM_COLOR,
      stickers: [],
    }),
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedStickerIndex, setSelectedStickerIndex] = useState(null);
  const [mode, setMode] = useState("edit"); // "edit" | "sticker"

  const [showStickerPanel, setShowStickerPanel] = useState(false);
  const [showTextPanel, setShowTextPanel] = useState(false);
  const [placingSticker, setPlacingSticker] = useState(null);
  const [stickers, setStickers] = useState([]);
  const topLabel = "";
  const bodyLabel = "";
  const [textDraft, setTextDraft] = useState("");
  const [textFontFamily, setTextFontFamily] = useState("modern");
  const [textFontStyle, setTextFontStyle] = useState("regular");
  const [textFontSize, setTextFontSize] = useState(88);
  const [editingTextStickerIndex, setEditingTextStickerIndex] = useState(null);
  const [surfaceHint, setSurfaceHint] = useState("");
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [photoSource, setPhotoSource] = useState("");
  const [photoShape, setPhotoShape] = useState("normal");
  const [photoZoom, setPhotoZoom] = useState(1);
  const [photoOffset, setPhotoOffset] = useState({ x: 0, y: 0 });
  const [photoMeta, setPhotoMeta] = useState({ width: 1, height: 1 });
  const [isPhotoDragging, setIsPhotoDragging] = useState(false);
  const [editingPhotoStickerIndex, setEditingPhotoStickerIndex] = useState(null);
  const fileInputRef = useRef(null);
  const topColorRef = useRef(topColor);
  const ringColorRef = useRef(ringColor);
  const bottomColorRef = useRef(bottomColor);
  const stickersRef = useRef(stickers);
  const historyRef = useRef(history);
  const historyIndexRef = useRef(historyIndex);
  const photoDragRef = useRef({
    pointerId: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  });
  const photoShapeMask = getPhotoShapeMask(photoShape);
  const activeCreativeTool = showTextPanel
    ? "text"
    : showStickerPanel
      ? "stickers"
      : showPhotoEditor || editingPhotoStickerIndex !== null
        ? "photos"
        : null;

  useEffect(() => {
    document.body.classList.add("lova-capsule-route");

    return () => {
      document.body.classList.remove("lova-capsule-route");
    };
  }, []);

  useEffect(() => {
    STICKER_PATHS.forEach((path) => useTexture.preload(path));
  }, []);

  useEffect(() => {
    topColorRef.current = topColor;
    ringColorRef.current = ringColor;
    bottomColorRef.current = bottomColor;
    stickersRef.current = stickers;
  }, [topColor, ringColor, bottomColor, stickers]);

  useEffect(() => {
    historyRef.current = history;
    historyIndexRef.current = historyIndex;
  }, [history, historyIndex]);

  useEffect(() => {
    if (!photoSource) return undefined;

    const img = new Image();
    img.onload = () => {
      setPhotoMeta({
        width: img.naturalWidth || 1,
        height: img.naturalHeight || 1,
      });
    };
    img.src = photoSource;

    return () => {
      img.onload = null;
    };
  }, [photoSource]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      const target = event.target;

      if (!(target instanceof Element)) return;
      if (target.closest("canvas")) return;
      if (target.closest(".surface-guide")) return;
      if (target.closest(".surface-hint")) return;

      setSelectedStickerIndex(null);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const removeSelectedSticker = () => {
    if (selectedStickerIndex === null) return;

    setStickersWithHistory((prev) => prev.filter((_, i) => i !== selectedStickerIndex));
    setSelectedStickerIndex(null);
  };

  const getCurrentSnapshot = () =>
    createCapsuleSnapshot({
      topColor: topColorRef.current,
      ringColor: ringColorRef.current,
      bottomColor: bottomColorRef.current,
      stickers: stickersRef.current,
    });

  const applySnapshotState = (snapshot) => {
    const nextSnapshot = createCapsuleSnapshot(snapshot);

    setTopColor(nextSnapshot.topColor);
    setRingColor(nextSnapshot.ringColor);
    setBottomColor(nextSnapshot.bottomColor);
    setStickers(nextSnapshot.stickers);
    topColorRef.current = nextSnapshot.topColor;
    ringColorRef.current = nextSnapshot.ringColor;
    bottomColorRef.current = nextSnapshot.bottomColor;
    stickersRef.current = nextSnapshot.stickers;
  };

  const commitSnapshot = (nextSnapshot) => {
    const currentSnapshot = historyRef.current[historyIndexRef.current] || getCurrentSnapshot();
    const normalizedNextSnapshot = createCapsuleSnapshot(nextSnapshot);

    if (snapshotsEqual(currentSnapshot, normalizedNextSnapshot)) return;

    const trimmedHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    const nextHistory = [...trimmedHistory, normalizedNextSnapshot];

    applySnapshotState(normalizedNextSnapshot);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    historyRef.current = nextHistory;
    historyIndexRef.current = nextHistory.length - 1;
  };

  const setStickersWithHistory = (valueOrUpdater) => {
    const currentSnapshot = getCurrentSnapshot();
    const baseStickers = currentSnapshot.stickers.map(cloneSticker);
    const nextStickers =
      typeof valueOrUpdater === "function"
        ? valueOrUpdater(baseStickers)
        : valueOrUpdater;

    commitSnapshot({
      ...currentSnapshot,
      stickers: nextStickers,
    });
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isUndoShortcut =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z" && !event.shiftKey;
      const isRedoShortcut =
        (event.metaKey || event.ctrlKey) &&
        (event.key.toLowerCase() === "y" || (event.key.toLowerCase() === "z" && event.shiftKey));

      if (isUndoShortcut) {
        event.preventDefault();
        const nextIndex = historyIndexRef.current - 1;
        const previousSnapshot = historyRef.current[nextIndex];
        if (!previousSnapshot) return;

        applySnapshotState(previousSnapshot);
        setHistoryIndex(nextIndex);
        historyIndexRef.current = nextIndex;
        setSelectedStickerIndex(null);
        return;
      }

      if (isRedoShortcut) {
        event.preventDefault();
        const nextIndex = historyIndexRef.current + 1;
        const nextSnapshot = historyRef.current[nextIndex];
        if (!nextSnapshot) return;

        applySnapshotState(nextSnapshot);
        setHistoryIndex(nextIndex);
        historyIndexRef.current = nextIndex;
        setSelectedStickerIndex(null);
        return;
      }

      if (selectedStickerIndex === null) return;

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        setStickersWithHistory((prev) => prev.filter((_, i) => i !== selectedStickerIndex));
        setSelectedStickerIndex(null);
      }

      if (event.key === "Escape") {
        setSelectedStickerIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const clampPhotoOffset = (nextOffset, nextZoom = photoZoom) => {
    const baseScale = Math.max(
      PHOTO_FRAME_SIZE / Math.max(photoMeta.width, 1),
      PHOTO_FRAME_SIZE / Math.max(photoMeta.height, 1)
    );
    const renderedWidth = photoMeta.width * baseScale * nextZoom;
    const renderedHeight = photoMeta.height * baseScale * nextZoom;
    const maxOffsetX = Math.max(0, (renderedWidth - PHOTO_FRAME_SIZE) / 2);
    const maxOffsetY = Math.max(0, (renderedHeight - PHOTO_FRAME_SIZE) / 2);

    return {
      x: THREE.MathUtils.clamp(nextOffset.x, -maxOffsetX, maxOffsetX),
      y: THREE.MathUtils.clamp(nextOffset.y, -maxOffsetY, maxOffsetY),
    };
  };

  const closePhotoEditor = () => {
    setShowPhotoEditor(false);
    setIsPhotoDragging(false);
    setEditingPhotoStickerIndex(null);
    setPhotoSource("");
    setPhotoShape("normal");
    setPhotoZoom(1);
    setPhotoOffset({ x: 0, y: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const closeTextEditor = () => {
    setShowTextPanel(false);
    setEditingTextStickerIndex(null);
    setTextDraft("");
    setTextFontFamily("modern");
    setTextFontStyle("regular");
    setTextFontSize(88);
  };

  const handlePhotoFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setSurfaceHint("Please choose an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoSource(typeof reader.result === "string" ? reader.result : "");
      setPhotoShape("normal");
      setPhotoZoom(1);
      setPhotoOffset({ x: 0, y: 0 });
      setEditingPhotoStickerIndex(null);
      setShowPhotoEditor(true);
    };
    reader.readAsDataURL(file);
  };

  const openPhotoEditorForSticker = (stickerIndex) => {
    const sticker = stickers[stickerIndex];
    const photoEdit = sticker?.photoEdit;
    if (!photoEdit?.source) return;

    setSelectedStickerIndex(stickerIndex);
    setPhotoSource(photoEdit.source);
    setPhotoShape(photoEdit.shape || "normal");
    setPhotoZoom(photoEdit.zoom || 1);
    setPhotoOffset(photoEdit.offset || { x: 0, y: 0 });
    setPhotoMeta(photoEdit.meta || { width: 1, height: 1 });
    setEditingPhotoStickerIndex(stickerIndex);
    setShowPhotoEditor(true);
  };

  const applyPhotoSticker = () => {
    if (!photoSource) return;

    const photoEditPayload = {
      source: photoSource,
      shape: photoShape,
      zoom: photoZoom,
      offset: photoOffset,
      meta: photoMeta,
    };

    if (photoShape === "normal") {
      const originalPayload = {
        texture: photoSource,
        aspectRatio: photoMeta.width / Math.max(photoMeta.height, 1),
        kind: "photo",
        photoEdit: photoEditPayload,
      };

      if (editingPhotoStickerIndex !== null) {
        setStickersWithHistory((prev) =>
          prev.map((item, index) =>
            index === editingPhotoStickerIndex
              ? {
                  ...item,
                  texture: originalPayload.texture,
                  aspectRatio: originalPayload.aspectRatio,
                  kind: originalPayload.kind,
                  photoEdit: originalPayload.photoEdit,
                }
              : item
          )
        );
        closePhotoEditor();
        setSurfaceHint("Your photo has been updated.");
        return;
      }

      setPlacingSticker(originalPayload);
      setMode("sticker");
      closePhotoEditor();
      setSurfaceHint("Your photo is ready. Tap the capsule to place it.");
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = PHOTO_OUTPUT_SIZE;
      canvas.height = PHOTO_OUTPUT_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const baseScale = Math.max(
        PHOTO_FRAME_SIZE / Math.max(img.naturalWidth, 1),
        PHOTO_FRAME_SIZE / Math.max(img.naturalHeight, 1)
      );
      const previewScale = baseScale * photoZoom;
      const previewWidth = img.naturalWidth * previewScale;
      const previewHeight = img.naturalHeight * previewScale;
      const scaleToOutput = PHOTO_OUTPUT_SIZE / PHOTO_FRAME_SIZE;
      const drawWidth = previewWidth * scaleToOutput;
      const drawHeight = previewHeight * scaleToOutput;
      const drawX = (PHOTO_OUTPUT_SIZE - drawWidth) / 2 + photoOffset.x * scaleToOutput;
      const drawY = (PHOTO_OUTPUT_SIZE - drawHeight) / 2 + photoOffset.y * scaleToOutput;
      const shapePath = createPhotoShapePath(photoShape, PHOTO_OUTPUT_SIZE);

      ctx.clearRect(0, 0, PHOTO_OUTPUT_SIZE, PHOTO_OUTPUT_SIZE);
      ctx.save();
      ctx.clip(shapePath);
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      ctx.restore();

      const shapedPayload = {
        texture: canvas.toDataURL("image/png"),
        aspectRatio: 1,
        kind: "photo",
        photoEdit: photoEditPayload,
      };

      if (editingPhotoStickerIndex !== null) {
        setStickersWithHistory((prev) =>
          prev.map((item, index) =>
            index === editingPhotoStickerIndex
              ? {
                  ...item,
                  texture: shapedPayload.texture,
                  aspectRatio: shapedPayload.aspectRatio,
                  kind: shapedPayload.kind,
                  photoEdit: shapedPayload.photoEdit,
                }
              : item
          )
        );
        closePhotoEditor();
        setSurfaceHint("Your photo has been updated.");
        return;
      }

      setPlacingSticker(shapedPayload);
      setMode("sticker");
      closePhotoEditor();
      setSurfaceHint("Your photo is ready. Tap the capsule to place it.");
    };
    img.src = photoSource;
  };

  const applyColorChange = (newColor) => {
    if (!selectedPart) return;

    const nextSnapshot = getCurrentSnapshot();

    if (selectedPart === "A") nextSnapshot.topColor = newColor;
    if (selectedPart === "R") nextSnapshot.ringColor = newColor;
    if (selectedPart === "B") nextSnapshot.bottomColor = newColor;

    commitSnapshot(nextSnapshot);
  };

  const openTextPanel = () => {
    setEditingTextStickerIndex(null);
    setTextDraft("");
    setTextFontFamily("modern");
    setTextFontStyle("regular");
    setTextFontSize(88);
    setShowTextPanel(true);
  };

  const openTextEditorForSticker = (stickerIndex) => {
    const sticker = stickers[stickerIndex];
    const textEdit = sticker?.textEdit;
    if (!textEdit?.text) return;

    setSelectedStickerIndex(stickerIndex);
    setTextDraft(textEdit.text);
    setTextFontFamily(textEdit.fontFamily || "modern");
    setTextFontStyle(textEdit.fontStyle || "regular");
    setTextFontSize(textEdit.fontSize || 88);
    setEditingTextStickerIndex(stickerIndex);
    setShowTextPanel(true);
  };

  const applyText = () => {
    const nextText = textDraft.trim();
    if (!nextText) {
      setSurfaceHint("Type a message first.");
      return;
    }

    const generated = createTextStickerTexture({
      text: nextText,
      fontFamily: textFontFamily,
      fontStyle: textFontStyle,
      fontSize: textFontSize,
    });

    if (!generated) return;

    const payload = {
      texture: generated.texture,
      aspectRatio: generated.aspectRatio,
      kind: "text",
      textEdit: {
        text: nextText,
        fontFamily: textFontFamily,
        fontStyle: textFontStyle,
        fontSize: textFontSize,
      },
    };

    if (editingTextStickerIndex !== null) {
      setStickersWithHistory((prev) =>
        prev.map((item, index) =>
          index === editingTextStickerIndex
            ? {
                ...item,
                texture: payload.texture,
                aspectRatio: payload.aspectRatio,
                kind: payload.kind,
                textEdit: payload.textEdit,
              }
            : item
        )
      );
      closeTextEditor();
      setSurfaceHint("Your text has been updated.");
      return;
    }

    setPlacingSticker(payload);
    setMode("sticker");
    closeTextEditor();
    setSurfaceHint("Your text is ready. Tap the capsule to place it.");
  };

    return (
      <div
        className="capsule-page"
      >
        {capsuleHeader}

        {typeof onBack === "function" && (
          <button
            type="button"
          className="capsule-back-button"
          onClick={onBack}
        >
          <span className="capsule-back-arrow" aria-hidden="true">←</span>
          <span>Back To Create</span>
        </button>
      )}

      <div className="dreamscape-layer" aria-hidden="true">
        <div className="falling-star falling-star-fourpoint falling-star-one" />
        <div className="falling-star falling-star-fourpoint falling-star-two" />
        <div className="falling-star falling-star-fourpoint falling-star-three" />
        <div className="falling-star falling-star-fourpoint falling-star-four" />
        <div className="falling-star falling-star-fourpoint falling-star-five" />
        <div className="falling-star falling-star-fourpoint falling-star-six" />
        <div className="falling-star falling-star-fourpoint falling-star-seven" />
        <div className="falling-star falling-star-fourpoint falling-star-eight" />
        <div className="falling-star falling-star-fourpoint falling-star-nine" />
        <div className="falling-star falling-star-fourpoint falling-star-ten" />
        <div className="falling-star falling-star-fourpoint falling-star-eleven" />
        <div className="falling-star falling-star-fourpoint falling-star-twelve" />
      </div>

      {/* ===== MODEL AREA ===== */}
      <div className="model-area">
        <Canvas
          shadows
          camera={{ position: [0, 0.4, 6.5], fov: 38 }}
          gl={{
            physicallyCorrectLights: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.36
          }}
        >

          <CapsuleModel
            mode={mode}
            selectedPart={selectedPart}
            topColor={topColor}
            ringColor={ringColor}
            bottomColor={bottomColor}
            setSelectedPart={setSelectedPart}
            stickers={stickers}
            setStickers={setStickersWithHistory}
            placingSticker={placingSticker}
            setPlacingSticker={setPlacingSticker}
            topLabel={topLabel}
            bodyLabel={bodyLabel}
            onTopAreaInfo={() =>
              setSurfaceHint("Top stickers are supported now, but smaller stickers will fit the lid best.")
            }
            selectedStickerIndex={selectedStickerIndex}
            setSelectedStickerIndex={setSelectedStickerIndex}
            setIsDragging={setIsDragging}
            onEditPhotoSticker={openPhotoEditorForSticker}
            onEditTextSticker={openTextEditorForSticker}
          />
          <ambientLight intensity={0.05} />
          <directionalLight position={[4.5, 7, 4]} intensity={0.36} castShadow />
          <directionalLight position={[-4, 3.5, 4]} intensity={0.24} color="#f3e5dd" />
          <Environment preset="studio" intensity={0.22} />
          <directionalLight position={[0, 4, -5]} intensity={0.12} color="#d9e5ff" />


          <ContactShadows
            position={[0, -1.05, 0]}
            opacity={0.4}
            scale={5}
            blur={2.5}
            far={4}
          />

          <OrbitControls enableZoom={false} enabled={!isDragging} />
        </Canvas>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar-section">
        <div className="toolbar-status" aria-live="polite">
          <span className="toolbar-status-chip">
            {mode === "sticker" ? "Decorate Mode" : "Color Mode"}
          </span>
          <span className="toolbar-status-text">
            {activeCreativeTool === "text"
              ? "Text editor open"
              : activeCreativeTool === "stickers"
                ? "Sticker library open"
                : activeCreativeTool === "photos"
                  ? "Photo editor open"
                  : selectedPart === "A"
                    ? "Top selected"
                    : selectedPart === "R"
                      ? "Ring selected"
                      : selectedPart === "B"
                        ? "Body selected"
                        : "Choose a surface or a creative tool"}
          </span>
        </div>
        <div className="toolbar">
          <div className="tools-left">
            <div className="tool-item">
              <button
                type="button"
                className="tool-icon-button"
                disabled={historyIndex <= 0}
                data-tooltip="Undo"
                onClick={() => {
                  const nextIndex = historyIndex - 1;
                  const previousSnapshot = history[nextIndex];
                  if (!previousSnapshot) return;

                  applySnapshotState(previousSnapshot);
                  setHistoryIndex(nextIndex);
                  setSelectedStickerIndex(null);
                }}
              >
                ⟲
              </button>
            </div>
            <div className="tool-item">
              <button
                type="button"
                className="tool-icon-button"
                disabled={historyIndex >= history.length - 1}
                data-tooltip="Redo"
                onClick={() => {
                  const nextIndex = historyIndex + 1;
                  const nextSnapshot = history[nextIndex];
                  if (!nextSnapshot) return;

                  applySnapshotState(nextSnapshot);
                  setHistoryIndex(nextIndex);
                  setSelectedStickerIndex(null);
                }}
              >
                ⟳
              </button>
            </div>
            <div className="divider" />
            <div className="tool-item">
              <button
                type="button"
                className={`tool-icon-button ${activeCreativeTool === "text" ? "active" : ""}`}
                data-tooltip="Create a text sticker"
                onClick={openTextPanel}
              >
                T
              </button>
            </div>
            <div className="tool-item">
              <button
                type="button"
                className={`tool-icon-button ${activeCreativeTool === "stickers" ? "active" : ""}`}
                data-tooltip="Open stickers"
                onClick={() => {
                  setMode("sticker");
                  setShowStickerPanel(true);
                }}
              >
                ⭐
              </button>
            </div>
            <div className="tool-item">
              <button
                type="button"
                className={`tool-icon-button photo-upload-button ${activeCreativeTool === "photos" ? "active" : ""}`}
                aria-label="Upload a photo"
                data-tooltip="Upload a photo"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="photo-upload-glyph" aria-hidden="true" />
                🖼
              </button>
            </div>
            <div className="tool-item">
              <input
                type="color"
                value={
                  selectedPart === "A"
                    ? topColor
                    : selectedPart === "R"
                      ? ringColor
                      : selectedPart === "B"
                        ? bottomColor
                        : "#ffffff"
                }
                disabled={!selectedPart}
                onChange={(e) => applyColorChange(e.target.value)}
                data-tooltip="Change surface color"
              />
            </div>
          </div>

          <div className="divider" />

          <div className="tools-right">
            <button
              className={selectedPart === "A" ? "active" : ""}
              onClick={() => {
                setMode("edit"); // 🔥 กลับโหมดสี
                setSelectedPart("A");
              }}
            >
              Top
            </button>

            <button
              className={selectedPart === "R" ? "active" : ""}
              onClick={() => {
                setMode("edit");
                setSelectedPart("R");
              }}
            >
              Ring
            </button>

            <button
              className={selectedPart === "B" ? "active" : ""}
              onClick={() => {
                setMode("edit"); // 🔥 กลับโหมดสี
                setSelectedPart("B");
              }}
            >
              Body
            </button>


          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="photo-input"
        onChange={handlePhotoFile}
      />

      {mode === "sticker" && (
        <div className="surface-guide">
          <strong>Add stickers, photos, or text anywhere on the capsule.</strong>
          {selectedStickerIndex !== null && (
            <>
              <em>Drag to move, use the corners to resize, and the top handle to rotate. Double-click photos or text to edit.</em>
              <button
                type="button"
                className="surface-guide-delete"
                onClick={removeSelectedSticker}
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}

      {surfaceHint && (
        <div className="surface-hint" onAnimationEnd={() => setSurfaceHint("")}>
          {surfaceHint}
        </div>
      )}

      {/* FORM */}
      <section className="capsule-form-section">
        <div className="form-split">
          <div className="form-box">
            <label>Capsule Name</label>
            <input type="text" placeholder="Enter capsule name" />
          </div>

          <div className="form-box">
            <label>Capsule Password</label>
            <input type="password" placeholder="Enter capsule password" />
          </div>
        </div>

        <button className="save-btn">
          Save Capsule
        </button>
      </section>

      {/* ✅ PUT POPUP HERE */}
      {showStickerPanel && (
        <>
          <div
            className="popup-overlay"
            onClick={() => setShowStickerPanel(false)}
          />

          <div className="sticker-popup">
            <h3>Stickers</h3>

            <div className="sticker-grid">
              {STICKER_FILES.map((file, i) => (
                <img
                  key={i}
                  src={`/stickers_capsule/${file}`}
                  className="sticker-item"
                  onClick={() => {
                    setPlacingSticker(`/stickers_capsule/${file}`);
                    setShowStickerPanel(false);
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {showTextPanel && (
        <>
          <div
            className="popup-overlay"
            onClick={closeTextEditor}
          />

          <div className="text-popup">
            <h3>{editingTextStickerIndex !== null ? "Edit Text Sticker" : "Create A Text Sticker"}</h3>
            <p>Write a line for your future self, then choose the font, style, and scale before placing it on the capsule.</p>
            <textarea
              value={textDraft}
              autoFocus
              maxLength={72}
              rows={3}
              placeholder={"Write your message"}
              onChange={(e) => setTextDraft(e.target.value)}
            />
            <div className="text-style-section">
              <span>Font</span>
              <div className="text-style-grid">
                {TEXT_FONT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={textFontFamily === option.id ? "active" : ""}
                    onClick={() => setTextFontFamily(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-style-section">
              <span>Style</span>
              <div className="text-style-grid compact">
                {TEXT_STYLE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={textFontStyle === option.id ? "active" : ""}
                    onClick={() => setTextFontStyle(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="text-size-control">
              Text Size
              <input
                type="range"
                min="44"
                max="150"
                step="1"
                value={textFontSize}
                onChange={(e) => setTextFontSize(Number(e.target.value))}
              />
            </label>
            <div
              className="text-preview-card"
              style={{
                fontFamily: getTextFontOption(textFontFamily).family,
                fontStyle: getTextStyleOption(textFontStyle).fontStyle,
                fontWeight: getTextStyleOption(textFontStyle).fontWeight,
                fontSize: `${Math.max(18, Math.min(42, textFontSize * 0.35))}px`,
              }}
            >
              {textDraft.trim() || "Your message preview"}
            </div>
            <div className="text-popup-actions">
              <button type="button" onClick={closeTextEditor}>
                Cancel
              </button>
              <button type="button" onClick={applyText}>
                {editingTextStickerIndex !== null ? "Update Text" : "Use This Text"}
              </button>
            </div>
          </div>
        </>
      )}

      {showPhotoEditor && photoSource && (
        <>
          <div
            className="popup-overlay"
            onClick={closePhotoEditor}
          />

          <div className="photo-popup">
            <div className="photo-popup-head">
              <div>
                <h3>Turn Your Photo Into A Capsule Sticker</h3>
                <p>Drag to frame it, zoom in, then choose the shape you want to place on your capsule.</p>
              </div>
              <button
                type="button"
                className="photo-popup-close"
                onClick={closePhotoEditor}
              >
                Close
              </button>
            </div>

            <div className="photo-editor-layout">
              <div className="photo-crop-shell">
                <div
                  className={`photo-crop-stage photo-shape-${photoShape}`}
                  onPointerDown={(event) => {
                    if (!(event.target instanceof Element)) return;
                    if (!event.target.closest(".photo-crop-image")) return;

                    photoDragRef.current = {
                      pointerId: event.pointerId,
                      startX: event.clientX,
                      startY: event.clientY,
                      offsetX: photoOffset.x,
                      offsetY: photoOffset.y,
                    };
                    setIsPhotoDragging(true);
                    event.currentTarget.setPointerCapture(event.pointerId);
                  }}
                  onPointerMove={(event) => {
                    if (!isPhotoDragging || photoDragRef.current.pointerId !== event.pointerId) return;

                    const nextOffset = clampPhotoOffset({
                      x: photoDragRef.current.offsetX + (event.clientX - photoDragRef.current.startX),
                      y: photoDragRef.current.offsetY + (event.clientY - photoDragRef.current.startY),
                    });

                    setPhotoOffset(nextOffset);
                  }}
                  onPointerUp={(event) => {
                    if (photoDragRef.current.pointerId !== event.pointerId) return;
                    setIsPhotoDragging(false);
                    photoDragRef.current.pointerId = null;
                    event.currentTarget.releasePointerCapture(event.pointerId);
                  }}
                >
                  <div
                    className="photo-crop-viewport"
                    style={{
                      WebkitMaskImage: photoShapeMask,
                      maskImage: photoShapeMask,
                      WebkitMaskRepeat: photoShapeMask === "none" ? undefined : "no-repeat",
                      maskRepeat: photoShapeMask === "none" ? undefined : "no-repeat",
                      WebkitMaskPosition: photoShapeMask === "none" ? undefined : "center",
                      maskPosition: photoShapeMask === "none" ? undefined : "center",
                      WebkitMaskSize: photoShapeMask === "none" ? undefined : "100% 100%",
                      maskSize: photoShapeMask === "none" ? undefined : "100% 100%",
                    }}
                  >
                    <img
                      src={photoSource}
                      alt="Crop preview"
                      className="photo-crop-image"
                      draggable={false}
                      style={{
                        width: `${Math.max(
                          PHOTO_FRAME_SIZE,
                          photoMeta.width * Math.max(
                            PHOTO_FRAME_SIZE / Math.max(photoMeta.width, 1),
                            PHOTO_FRAME_SIZE / Math.max(photoMeta.height, 1)
                          ) * photoZoom
                        )}px`,
                        height: `${Math.max(
                          PHOTO_FRAME_SIZE,
                          photoMeta.height * Math.max(
                            PHOTO_FRAME_SIZE / Math.max(photoMeta.width, 1),
                            PHOTO_FRAME_SIZE / Math.max(photoMeta.height, 1)
                          ) * photoZoom
                        )}px`,
                        transform: `translate(calc(-50% + ${photoOffset.x}px), calc(-50% + ${photoOffset.y}px))`,
                      }}
                    />
                  </div>
                  <div
                    className="photo-crop-outline"
                    style={{
                      WebkitMaskImage: photoShapeMask,
                      maskImage: photoShapeMask,
                      WebkitMaskRepeat: photoShapeMask === "none" ? undefined : "no-repeat",
                      maskRepeat: photoShapeMask === "none" ? undefined : "no-repeat",
                      WebkitMaskPosition: photoShapeMask === "none" ? undefined : "center",
                      maskPosition: photoShapeMask === "none" ? undefined : "center",
                      WebkitMaskSize: photoShapeMask === "none" ? undefined : "100% 100%",
                      maskSize: photoShapeMask === "none" ? undefined : "100% 100%",
                    }}
                  />
                </div>
              </div>

              <div className="photo-editor-controls">
                <div className="photo-shape-grid">
                  {PHOTO_SHAPES.map((shape) => (
                    <button
                      key={shape.id}
                      type="button"
                      className={photoShape === shape.id ? "active" : ""}
                      onClick={() => setPhotoShape(shape.id)}
                    >
                      <span
                        className={`photo-shape-preview photo-shape-${shape.id}`}
                        style={{
                          WebkitMaskImage: getPhotoShapeMask(shape.id),
                          maskImage: getPhotoShapeMask(shape.id),
                          WebkitMaskRepeat: shape.id === "normal" ? undefined : "no-repeat",
                          maskRepeat: shape.id === "normal" ? undefined : "no-repeat",
                          WebkitMaskPosition: shape.id === "normal" ? undefined : "center",
                          maskPosition: shape.id === "normal" ? undefined : "center",
                          WebkitMaskSize: shape.id === "normal" ? undefined : "100% 100%",
                          maskSize: shape.id === "normal" ? undefined : "100% 100%",
                        }}
                      />
                      {shape.label}
                    </button>
                  ))}
                </div>

                <label className="photo-zoom-control">
                  Zoom
                  <input
                    type="range"
                    min="1"
                    max="2.6"
                    step="0.01"
                    value={photoZoom}
                    onChange={(event) => {
                      const nextZoom = Number(event.target.value);
                      setPhotoOffset((prev) =>
                        clampPhotoOffset(
                          {
                            x: prev.x * (nextZoom / Math.max(photoZoom, 0.0001)),
                            y: prev.y * (nextZoom / Math.max(photoZoom, 0.0001)),
                          },
                          nextZoom
                        )
                      );
                      setPhotoZoom(nextZoom);
                    }}
                  />
                </label>

                <div className="photo-popup-actions">
                  <button type="button" onClick={closePhotoEditor}>
                    Cancel
                  </button>
                  <button type="button" onClick={applyPhotoSticker}>
                    Use This Photo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
