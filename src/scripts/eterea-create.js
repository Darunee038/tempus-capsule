window.initEtereaCreate = function () {


  if (window.__etereaCreateInited) return; // ⛔ กันรันซ้ำ
  window.__etereaCreateInited = true;
  console.log("create.js init");

  const canvas = document.getElementById("canvas");
  if (!canvas) {
    console.warn("canvas not found");
    return;
  }

  const ctx = canvas.getContext("2d");
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // ===== STATE =====
  let tool = null;
  let color = "#000000";
  let size = 4;

  let drawing = false;
  let currentStroke = null;
  const strokes = [];

  // text drag
  let draggingItem = false;
  let selectedItem = null;
  let editingText = null;
  let lastTapTime = 0;
  let lastTapText = null;
  let dragOffset = { x: 0, y: 0 };

  // text resize
  let resizingItem = false;
  let resizeStart = { x: 0, y: 0, w: 0, h: 0, size: 0 };
  let resizeHandle = null;

  // rotate
  let rotatingItem = false;
  let rotateStartAngle = 0;
  let rotateStartRotation = 0;

  // eraser smooth
  let erasing = false;
  let needsRedraw = false;

  // Open date state (used by date popup)
  let selectedOpenDate = null;

  // ===== UNDO / REDO =====
  const undoStack = [];
  const redoStack = [];
  const MAX_HISTORY = 50;

  let isSyncing = false;

  function saveHistory() {
    undoStack.push(JSON.stringify(strokes));
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack.length = 0;
  }
  function undo() {
    if (!undoStack.length) return;
    redoStack.push(JSON.stringify(strokes));
    strokes.length = 0;
    strokes.push(...JSON.parse(undoStack.pop()));
    reviveImages();
    redraw();
  }
  function redo() {
    if (!redoStack.length) return;
    undoStack.push(JSON.stringify(strokes));
    strokes.length = 0;
    strokes.push(...JSON.parse(redoStack.pop()));
    reviveImages();
    redraw();
  }
  function reviveImages() {
    strokes.forEach(s => {
      if (s.type === "image" && !s.img && s.src) {
        const im = new Image();
        im.onload = redraw;
        im.src = s.src;
        s.img = im;
      }
    });
  }

  // ===== TOOL BUTTONS =====
  const penBtn = document.getElementById("penBtn");
  const eraserBtn = document.getElementById("eraserBtn");
  const textBtn = document.getElementById("textBtn");

  const sizeSlider = document.querySelector(".tools-left input[type='range']");
  const penColorInput = document.getElementById("penColor");

  const imageBtn = document.getElementById("imageBtn");
  const imageInput = document.getElementById("imageInput");
  const paperColorInput = document.getElementById("paperColorInput");
  const bgButtons = Array.from(document.querySelectorAll(".bg-list .bg-item"));
  const pageEls = Array.from(document.querySelectorAll(".book.unified .page"));

  const backgroundThemes = {
    stars: {
      base: "#f6f0db",
      pattern: `
        radial-gradient(circle at 6px 6px, #8fc0ec 0 2px, transparent 2.2px),
        radial-gradient(circle at 18px 7px, #ea6a73 0 2px, transparent 2.2px),
        radial-gradient(circle at 12px 15px, #72c7a6 0 2px, transparent 2.2px),
        radial-gradient(circle at 19px 18px, #e7a8d2 0 2px, transparent 2.2px),
        radial-gradient(circle at 7px 19px, #b57d4c 0 2px, transparent 2.2px)
      `,
      size: "24px 24px"
    },
    blueFloral: {
      base: "#f6f0e2",
      pattern: `
        radial-gradient(circle at 6px 6px, #7f93bb 0 1px, transparent 1.2px),
        radial-gradient(circle at 4px 4px, #b8c5de 0 2.3px, transparent 2.5px),
        radial-gradient(circle at 8px 4px, #b8c5de 0 2.3px, transparent 2.5px),
        radial-gradient(circle at 4px 8px, #b8c5de 0 2.3px, transparent 2.5px),
        radial-gradient(circle at 8px 8px, #b8c5de 0 2.3px, transparent 2.5px),
        linear-gradient(35deg, transparent 0 42%, #8f9a7c 42% 46%, transparent 46% 100%)
      `,
      size: "18px 18px"
    },
    sprinkles: {
      base: "#fbfaf6",
      pattern: `
        radial-gradient(circle at 6px 6px, #5da45d 0 2px, transparent 2.2px),
        radial-gradient(circle at 12px 6px, #5da45d 0 2px, transparent 2.2px),
        radial-gradient(circle at 9px 2px, #5da45d 0 2px, transparent 2.2px),
        radial-gradient(circle at 9px 10px, #5da45d 0 2px, transparent 2.2px),
        linear-gradient(70deg, transparent 0 52%, #3f7c43 52% 56%, transparent 56% 100%)
      `,
      size: "24px 24px"
    },
    pastelGrid: {
      base: "#fdf9f3",
      pattern: `
        linear-gradient(rgba(227, 205, 192, 0.6) 1px, transparent 1px),
        linear-gradient(90deg, rgba(227, 205, 192, 0.6) 1px, transparent 1px),
        radial-gradient(circle at 10px 8px, #f39caf 0 1.2px, transparent 1.4px),
        radial-gradient(circle at 14px 12px, #77d7e6 0 1.2px, transparent 1.4px),
        radial-gradient(circle at 6px 16px, #9edb8c 0 1.2px, transparent 1.4px)
      `,
      size: "12px 12px, 12px 12px, 24px 24px, 24px 24px, 24px 24px"
    },
    confettiDots: {
      base: "#fcfbf7",
      pattern: `
        radial-gradient(circle at 6px 6px, #f08fa1 0 1.3px, transparent 1.5px),
        radial-gradient(circle at 18px 8px, #9cd7f5 0 1.3px, transparent 1.5px),
        radial-gradient(circle at 10px 18px, #bde6a7 0 1.3px, transparent 1.5px),
        radial-gradient(circle at 22px 22px, #f4c68e 0 1.3px, transparent 1.5px)
      `,
      size: "28px 28px"
    }
  };

  let selectedBackground = "stars";

  function applyPageAppearance() {
    const theme = backgroundThemes[selectedBackground] || backgroundThemes.stars;
    const pageBase = paperColorInput?.value || theme.base;
    pageEls.forEach(page => {
      page.style.setProperty("--page-base", pageBase);
      page.style.setProperty("--page-pattern", theme.pattern);
      page.style.setProperty("--page-pattern-size", theme.size);
    });
  }

  function setBackground(bgKey) {
    if (!backgroundThemes[bgKey]) return;
    selectedBackground = bgKey;
    bgButtons.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.bg === bgKey);
    });
    if (paperColorInput) {
      paperColorInput.value = backgroundThemes[bgKey].base;
    }
    applyPageAppearance();
  }

  // ===== ACTIVE BUTTON =====
  function setActiveButton(btn) {
    document
      .querySelectorAll(".tools-left button")
      .forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
  }

  // ===== CURSOR =====
  function makeCursor({ r, stroke, fill, dash }) {
    const d = r * 2 + 8;
    const dashAttr = dash ? `stroke-dasharray="${dash}"` : "";
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${d}" height="${d}">
      <circle cx="${d / 2}" cy="${d / 2}" r="${r}"
        fill="${fill}"
        stroke="${stroke}"
        stroke-width="2"
        ${dashAttr}/>
    </svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${d / 2} ${d / 2}, auto`;
  }
  function updateCursor() {
    if (tool === "pen") {
      canvas.style.cursor = makeCursor({
        r: size,
        stroke: color,
        fill: color + "33"
      });
    } else if (tool === "eraser") {
      canvas.style.cursor = makeCursor({
        r: size * 1.2,
        stroke: "#666",
        fill: "rgba(200,200,200,0.15)",
        dash: "4 3"
      });
    } else {
      canvas.style.cursor = "default";
    }
  }

  // ===== TEXT POPUP CONTROL =====
  let textOverlay = null;
  function closeTextPopup() {
    popup.style.display = "none";
    textarea.value = "";
    if (textOverlay) {
      textOverlay.remove();
      textOverlay = null;
    }
  }
  function openTextPopup() {
    closeTextPopup();
    if (!textOverlay) {
      textOverlay = document.createElement("div");
      textOverlay.className = "popup-overlay";
      textOverlay.onclick = closeTextPopup;
      document.body.appendChild(textOverlay);
    }
    popup.style.display = "block";
    popup.style.left = "50%";
    popup.style.top = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    textarea.value = "";
    textState = { bold: false, italic: false, align: "center" };
    popup.querySelectorAll("[data-style]").forEach(btn => btn.classList.remove("active"));
    popup.querySelectorAll("[data-align]").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.align === "center");
    });
    updateTextPreview();
  }
  function openEditTextPopup(t) {
    editingText = t;
    if (!textOverlay) {
      textOverlay = document.createElement("div");
      textOverlay.className = "popup-overlay";
      textOverlay.onclick = closeTextPopup;
      document.body.appendChild(textOverlay);
    }
    textarea.value = t.text;
    popup.querySelector(".font").value = t.font;
    popup.querySelector(".size").value = t.size;
    popup.querySelector(".color").value = t.color;
    textState.bold = !!t.bold;
    textState.italic = !!t.italic;
    textState.align = t.align || "center";
    popup.querySelectorAll("[data-style]").forEach(btn => {
      btn.classList.toggle("active", textState[btn.dataset.style]);
    });
    popup.querySelectorAll("[data-align]").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.align === textState.align);
    });
    popup.style.display = "block";
    popup.style.left = "50%";
    popup.style.top = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    updateTextPreview();
  }

  // ===== TOOL SWITCH =====
  penBtn.onclick = () => {
    closeTextPopup();
    tool = "pen";
    setActiveButton(penBtn);
    updateCursor();
  };
  eraserBtn.onclick = () => {
    closeTextPopup();
    tool = "eraser";
    setActiveButton(eraserBtn);
    updateCursor();
  };
  textBtn.onclick = () => {
    tool = "text";
    setActiveButton(textBtn);
    openTextPopup();
  };
  imageBtn.onclick = () => {
    closeTextPopup();
    tool = "image";
    imageInput.click();
  };

  // ===== COLOR / SIZE =====
  penColorInput.addEventListener("input", e => {
    color = e.target.value;
    penColorInput.parentElement.style.background = color;
    updateCursor();
  });
  sizeSlider.oninput = e => {
    size = Number(e.target.value);
    updateCursor();
  };
  paperColorInput?.addEventListener("input", applyPageAppearance);
  bgButtons.forEach(btn => {
    btn.addEventListener("click", () => setBackground(btn.dataset.bg));
  });

  // ===== CANVAS POINTER EVENTS =====
  canvas.addEventListener("pointerdown", e => {
    draggingItem = false;
    resizingItem = false;
    rotatingItem = false;
    const p = getPos(e);
    let hitSomething = false;
    // 1. rotate/resize
    if (selectedItem) {
      if (hitRotateHandle(p, selectedItem)) {
        hitSomething = true;
        rotatingItem = true;
        rotateStartAngle = Math.atan2(p.y - selectedItem.y, p.x - selectedItem.x);
        rotateStartRotation = selectedItem.rotation || 0;
        canvas.setPointerCapture(e.pointerId);
        return;
      }
      const h = hitResizeHandle(p, selectedItem);
      if (h) {
        hitSomething = true;
        resizingItem = true;
        resizeHandle = h;
        resizeStart.x = p.x;
        resizeStart.y = p.y;
        if (selectedItem.type === "text") resizeStart.size = selectedItem.size;
        if (selectedItem.type === "image") {
          resizeStart.w = selectedItem.w;
          resizeStart.h = selectedItem.h;
        }
        canvas.setPointerCapture(e.pointerId);
        return;
      }
    }
    // 2. image
    for (let i = strokes.length - 1; i >= 0; i--) {
      const s = strokes[i];
      if (s.type !== "image") continue;
      if (hitImage(p, s)) {
        hitSomething = true;
        selectedItem = s;
        draggingItem = true;
        dragOffset.x = p.x - s.x;
        dragOffset.y = p.y - s.y;
        canvas.setPointerCapture(e.pointerId);
        redraw();
        return;
      }
    }
    // 3. text
    for (let i = strokes.length - 1; i >= 0; i--) {
      const s = strokes[i];
      if (s.type !== "text") continue;
      if (hitText(p, s)) {
        hitSomething = true;
        selectedItem = s;
        draggingItem = true;
        dragOffset.x = p.x - s.x;
        dragOffset.y = p.y - s.y;
        canvas.setPointerCapture(e.pointerId);
        redraw();
        return;
      }
    }
    // 4. click empty
    if (
      !hitSomething &&
      !draggingItem &&
      !resizingItem &&
      !rotatingItem &&
      tool !== "pen" &&
      tool !== "eraser"
    ) {
      selectedItem = null;
      redraw();
    }
    // 5. draw/erase
    if (tool === "pen" || tool === "eraser") {
      drawing = true;
      canvas.setPointerCapture(e.pointerId);
      if (tool === "pen") {
        currentStroke = { type: "stroke", color, size, points: [p] };
      } else {
        eraseAt(p.x, p.y);
        scheduleRedraw();
      }
    }
  });
  canvas.addEventListener("pointermove", e => {
    const p = getPos(e);
    if (rotatingItem && selectedItem) {
      const a = Math.atan2(p.y - selectedItem.y, p.x - selectedItem.x);
      selectedItem.rotation = rotateStartRotation + (a - rotateStartAngle);
      redraw();
      return;
    }
    if (resizingItem && selectedItem) {
      const dx = p.x - resizeStart.x;
      const dy = p.y - resizeStart.y;
      if (selectedItem.type === "text") {
        const dir = (resizeHandle === "tl" || resizeHandle === "tr") ? -1 : 1;
        selectedItem.size = Math.max(10, resizeStart.size + dy * dir);
      }
      if (selectedItem.type === "image") {
        const signX = (resizeHandle === "tl" || resizeHandle === "bl") ? -1 : 1;
        const signY = (resizeHandle === "tl" || resizeHandle === "tr") ? -1 : 1;
        selectedItem.w = Math.max(20, resizeStart.w + dx * signX);
        selectedItem.h = Math.max(20, resizeStart.h + dy * signY);
      }
      redraw();
      return;
    }
    if (draggingItem && selectedItem) {
      selectedItem.x = p.x - dragOffset.x;
      selectedItem.y = p.y - dragOffset.y;
      redraw();
      return;
    }
    if (!drawing || !tool) return;
    if (tool === "pen") {
      currentStroke.points.push(p);
      redraw();
    } else {
      eraseAt(p.x, p.y);
      scheduleRedraw();
    }
  });
  canvas.addEventListener("pointerup", stopAll);
  canvas.addEventListener("pointercancel", stopAll);
  function stopAll(e) {
  const wasDrawing = drawing;
  const wasDragging = draggingItem;
  const wasResizing = resizingItem;
  const wasRotating = rotatingItem;

  draggingItem = false;
  resizingItem = false;
  rotatingItem = false;
  resizeHandle = null;
  lastTapText = null;

  if (wasDrawing && currentStroke && tool === "pen") {
    saveHistory();
    strokes.push(currentStroke);
  }

  drawing = false;
  currentStroke = null;
  updateCursor();

  if (wasDrawing || wasDragging || wasResizing || wasRotating) {
    redraw();
    triggerSave();
  }

  try { canvas.releasePointerCapture(e.pointerId); } catch {}
}

  // ====== ADD IMAGE INPUT ======
  imageInput.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        saveHistory();

        const scale = Math.min(300 / img.width, 300 / img.height, 1);
        const w = img.width * scale;
        const h = img.height * scale;

        strokes.push({
          type: "image",
          src: reader.result, // ✅ data URL ข้าม client ได้
          x: canvas.width / 2,
          y: canvas.height / 2,
          w,
          h,
          rotation: 0
        });

        redraw();
        triggerSave();
      };

      img.onerror = () => {
        console.error("Failed to load uploaded image");
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(file);
    imageInput.value = "";
  };

  // ====== TEXT POPUP ======
  const popup = document.createElement("div");
  popup.className = "text-popup";
  popup.innerHTML = `
    <textarea placeholder="Type your text..." rows="4"></textarea>
    <div class="text-preview"></div>
    <div class="row">
      <select class="font">
        <option value="Segoe UI">Segoe UI</option>
        <option value="Arial">Arial</option>
        <option value="Georgia">Georgia</option>
        <option value="Times New Roman">Times New Roman</option>
      </select>
      <input type="number" class="size" value="28" min="12" max="96" />
      <input type="color" class="color" value="#000000" />
    </div>
    <div class="row">
      <button data-style="bold"><b>B</b></button>
      <button data-style="italic"><i>I</i></button>
      <button data-align="left">L</button>
      <button data-align="center" class="active">C</button>
      <button data-align="right">R</button>
    </div>
    <div class="row end">
      <button class="cancel">Cancel</button>
      <button class="done">Done</button>
    </div>
  `;
  document.body.appendChild(popup);
  let textState = { bold: false, italic: false, align: "center" };
  const textarea = popup.querySelector("textarea");
  const preview = popup.querySelector(".text-preview");
  preview.style.whiteSpace = "pre-wrap";
  function updateTextPreview() {
    preview.textContent = textarea.value || "Preview text";
    preview.style.fontFamily = popup.querySelector(".font").value;
    preview.style.fontSize = popup.querySelector(".size").value + "px";
    preview.style.color = popup.querySelector(".color").value;
    preview.style.fontWeight = textState.bold ? "bold" : "normal";
    preview.style.fontStyle = textState.italic ? "italic" : "normal";
    preview.style.textAlign = textState.align;
  }
  textarea.addEventListener("input", updateTextPreview);
  popup.querySelector(".font").onchange = updateTextPreview;
  popup.querySelector(".size").oninput = updateTextPreview;
  popup.querySelector(".color").oninput = updateTextPreview;
  popup.querySelectorAll("[data-style]").forEach(btn => {
    btn.onclick = () => {
      const k = btn.dataset.style;
      textState[k] = !textState[k];
      btn.classList.toggle("active", textState[k]);
      updateTextPreview();
    };
  });
  popup.querySelectorAll("[data-align]").forEach(btn => {
    btn.onclick = () => {
      textState.align = btn.dataset.align;
      popup.querySelectorAll("[data-align]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      updateTextPreview();
    };
  });
  popup.querySelector(".cancel").onclick = () => {
    editingText = null;
    closeTextPopup();
    setActiveButton(null);
    tool = null;
  };
  popup.querySelector(".done").onclick = () => {
    const raw = textarea.value;
    const text = raw.trim();
    if (editingText) {
      if (text === "") {
        const i = strokes.indexOf(editingText);
        if (i !== -1) strokes.splice(i, 1);
      } else {
        saveHistory();
        editingText.text = raw;
        editingText.font = popup.querySelector(".font").value;
        editingText.size = Number(popup.querySelector(".size").value);
        editingText.color = popup.querySelector(".color").value;
        editingText.bold = textState.bold;
        editingText.italic = textState.italic;
        editingText.align = textState.align;
      }
      editingText = null;
    } else {
      if (text !== "") {
        saveHistory();
        strokes.push({
          type: "text",
          text: raw,
          font: popup.querySelector(".font").value,
          size: Number(popup.querySelector(".size").value),
          color: popup.querySelector(".color").value,
          ...textState,
          rotation: 0,
          x: canvas.width / 2,
          y: canvas.height / 2
        });
      }
    }
    closeTextPopup();
    setActiveButton(null);
    tool = null;
    redraw();
    triggerSave();

  };

  // ===== RENDER =====
  function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.forEach(drawItem);
    if (currentStroke) drawItem(currentStroke);

  }
  function drawItem(s) {
    if (s.type === "stroke") {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.size;
      ctx.beginPath();
      ctx.moveTo(s.points[0].x, s.points[0].y);
      s.points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    }
    if (s.type === "text") {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rotation || 0);
      ctx.fillStyle = s.color;
      ctx.font = `${s.italic ? "italic" : ""} ${s.bold ? "bold" : ""} ${s.size}px ${s.font}`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      const lines = s.text.split("\n");
      const lh = s.size * 1.2;
      const widths = lines.map(l => ctx.measureText(l).width);
      const maxW = Math.max(...widths);
      const startX = -maxW / 2;
      const startY = -(lines.length * lh) / 2;
      lines.forEach((line, i) => {
        ctx.fillText(line, startX, startY + i * lh);
      });
      ctx.restore();
      if (s === selectedItem) drawTextSelection(s);
    }
    if (s.type === "image") {
      if (!s.img && s.src) {
        const im = new Image();

        im.onload = () => {
          s.img = im;
          redraw();
        };

        im.onerror = () => {
          console.warn("Image failed to load:", s.src);
          s.img = null;
        };

        im.src = s.src;
        return;
      }

      // ✅ กัน broken / not ready
      if (!s.img || !s.img.complete || s.img.naturalWidth === 0) {
        return;
      }

      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rotation || 0);
      ctx.drawImage(
        s.img,
        -s.w / 2,
        -s.h / 2,
        s.w,
        s.h
      );
      ctx.restore();

      if (s === selectedItem) drawImageSelection(s);
    }
  }
  function drawTextSelection(t) {
    const b = getTextBounds(t);
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate(t.rotation || 0);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 0.75;
    ctx.strokeRect(b.x, b.y, b.w, b.h);
    drawResizeHandles(b);
    drawRotateHandle(b);
    ctx.restore();
  }
  function drawResizeHandles(b) {
    const r = 3;
    const corners = [
      { x: b.x, y: b.y },
      { x: b.x + b.w, y: b.y },
      { x: b.x, y: b.y + b.h },
      { x: b.x + b.w, y: b.y + b.h }
    ];
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 0.75;
    corners.forEach(c => {
      ctx.beginPath();
      ctx.rect(c.x - r, c.y - r, r * 2, r * 2);
      ctx.fill();
      ctx.stroke();
    });
  }
  function drawRotateHandle(b) {
    const cx = b.x + b.w / 2;
    const cy = b.y - 16;
    ctx.beginPath();
    ctx.moveTo(cx, b.y);
    ctx.lineTo(cx, cy);
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 0.75;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.stroke();
  }
  // ===== ERASER =====
  function eraseAt(x, y) {
    const r = size * 1.5;
    const out = [];
    strokes.forEach(s => {
      if (s.type !== "stroke") return out.push(s);
      let seg = [];
      s.points.forEach(p => {
        if (Math.hypot(p.x - x, p.y - y) > r) seg.push(p);
        else {
          if (seg.length > 1) out.push({ ...s, points: seg });
          seg = [];
        }
      });
      if (seg.length > 1) out.push({ ...s, points: seg });
    });
    strokes.length = 0;
    strokes.push(...out);
  }
  function scheduleRedraw() {
    if (needsRedraw) return;
    needsRedraw = true;
    requestAnimationFrame(() => {
      redraw();
      needsRedraw = false;
    });
  }

  // ===== STICKER BUTTON =====
  const stickerBtn = document.getElementById("stickerBtn");
  let stickerOverlay = null;

  if (stickerBtn) {
    // ===== CREATE STICKER POPUP (ONCE) =====
    const stickerPopup = document.createElement("div");
    stickerPopup.className = "sticker-popup";
    stickerPopup.style.display = "none";
    stickerPopup.innerHTML = `
    <h3>Stickers</h3>
      <div class="sticker-grid">
        <img src="/assets/stickers/IMG_1283.png" class="sticker-item" />
        <img src="/assets/stickers/IMG_1284.png" class="sticker-item" />
        <img src="/assets/stickers/IMG_1285.png" class="sticker-item" />
        <img src="/assets/stickers/IMG_1286.png" class="sticker-item" />
        <img src="/assets/stickers/IMG_1287.png" class="sticker-item" />
        <img src="/assets/stickers/IMG_1288.png" class="sticker-item" />
        <img src="/assets/stickers/IMG_1289.png" class="sticker-item" />
        <img src="/assets/stickers/IMG_1290.png" class="sticker-item" />
        <img src="/assets/stickers/IMG_1291.png" class="sticker-item" />
        <img src="/assets/stickers/IMG_1292.png" class="sticker-item" />
        <img src="/assets/stickers/IMG_1293.png" class="sticker-item" />
        <img src="/assets/stickers/IMG_1294.png" class="sticker-item" />
        <img src="/assets/stickers/IMG_1295.png" class="sticker-item" />
        <img src="/assets/stickers/IMG_1296.png" class="sticker-item" />
        <img src="/assets/stickers/IMG_1297.png" class="sticker-item" />
        <img src="/assets/stickers/IMG_1298.png" class="sticker-item" />
      </div>  `;
    document.body.appendChild(stickerPopup);

    // ===== OPEN POPUP =====
    stickerBtn.onclick = () => {
      if (stickerPopup.style.display === "block") return;

      stickerOverlay = document.createElement("div");
      stickerOverlay.className = "popup-overlay";
      stickerOverlay.onclick = closeStickerPopup;
      document.body.appendChild(stickerOverlay);

      stickerPopup.style.display = "block";
      stickerPopup.style.left = "50%";
      stickerPopup.style.top = "50%";
      stickerPopup.style.transform = "translate(-50%, -50%)";
    };

    function closeStickerPopup() {
      stickerPopup.style.display = "none";
      if (stickerOverlay) {
        stickerOverlay.remove();
        stickerOverlay = null;
      }
    }

    // ===== CLICK STICKER → ADD TO CANVAS =====
    stickerPopup.querySelector(".sticker-grid").onclick = (e) => {
      const item = e.target.closest(".sticker-item");
      if (!item) return;

      const src = item.src;
      const img = new Image();

      img.onload = () => {
        saveHistory();

        const scale = Math.min(200 / img.width, 200 / img.height, 1);

        strokes.push({
          type: "image",
          // img,
          src,
          x: canvas.width / 2,
          y: canvas.height / 2,
          w: img.width * scale,
          h: img.height * scale,
          rotation: 0
        });

        redraw();
        closeStickerPopup();
        triggerSave();
      };

      img.src = src;
    };
  } else {
    console.warn("stickerBtn not found (skip sticker feature)");
  }
  // ===== UTIL =====
  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (canvas.width / r.width),
      y: (e.clientY - r.top) * (canvas.height / r.height)
    };
  }
  function hitRotateHandle(p, item) {
    const a = -(item.rotation || 0);
    const dx = p.x - item.x;
    const dy = p.y - item.y;
    const rx = dx * Math.cos(a) - dy * Math.sin(a);
    const ry = dx * Math.sin(a) + dy * Math.cos(a);
    const b =
      item.type === "text"
        ? getTextBounds(item)
        : getImageBounds(item);
    return Math.hypot(
      rx - (b.x + b.w / 2),
      ry - (b.y - 16)
    ) < 8;
  }
  function hitText(p, t) {
    const b = getTextBounds(t);
    const a = -(t.rotation || 0);
    const dx = p.x - t.x;
    const dy = p.y - t.y;
    const rx = dx * Math.cos(a) - dy * Math.sin(a);
    const ry = dx * Math.sin(a) + dy * Math.cos(a);
    return rx >= b.x && rx <= b.x + b.w && ry >= b.y && ry <= b.y + b.h;
  }
  function hitResizeHandle(p, item) {
    const a = -(item.rotation || 0);
    const dx = p.x - item.x;
    const dy = p.y - item.y;
    const rx = dx * Math.cos(a) - dy * Math.sin(a);
    const ry = dx * Math.sin(a) + dy * Math.cos(a);
    const b =
      item.type === "text"
        ? getTextBounds(item)
        : getImageBounds(item);
    const r = 8;
    const handles = [
      { k: "tl", x: b.x, y: b.y },
      { k: "tr", x: b.x + b.w, y: b.y },
      { k: "bl", x: b.x, y: b.y + b.h },
      { k: "br", x: b.x + b.w, y: b.y + b.h }
    ];
    for (const h of handles) {
      if (Math.abs(rx - h.x) < r && Math.abs(ry - h.y) < r) return h.k;
    }
    return null;
  }
  function getTextBounds(t) {
    ctx.font = `${t.italic ? "italic" : ""} ${t.bold ? "bold" : ""} ${t.size}px ${t.font}`;
    const lines = t.text.split("\n");
    const lh = t.size * 1.2;
    const w = Math.max(...lines.map(l => ctx.measureText(l).width));
    const h = lines.length * lh;
    return {
      x: -w / 2 - 6,
      y: -h / 2 - 6,
      w: w + 12,
      h: h + 12
    };
  }
  function getImageBounds(img) {
    return {
      x: -img.w / 2,
      y: -img.h / 2,
      w: img.w,
      h: img.h
    };
  }
  function drawImageSelection(img) {
    const b = getImageBounds(img);
    ctx.save();
    ctx.translate(img.x, img.y);
    ctx.rotate(img.rotation || 0);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#666";
    ctx.strokeRect(b.x, b.y, b.w, b.h);
    drawResizeHandles(b);
    drawRotateHandle(b);
    ctx.restore();
  }
  function hitImage(p, img) {
    const a = -(img.rotation || 0);
    const dx = p.x - img.x;
    const dy = p.y - img.y;
    const rx = dx * Math.cos(a) - dy * Math.sin(a);
    const ry = dx * Math.sin(a) + dy * Math.cos(a);
    return (
      rx >= -img.w / 2 &&
      rx <= img.w / 2 &&
      ry >= -img.h / 2 &&
      ry <= img.h / 2
    );
  }

  // ===== DOUBLE CLICK TEXT TO EDIT =====
  canvas.addEventListener("dblclick", e => {
    const p = getPos(e);
    for (let i = strokes.length - 1; i >= 0; i--) {
      const s = strokes[i];
      if (s.type !== "text") continue;
      if (hitText(p, s)) {
        draggingItem = false;
        resizingItem = false;
        rotatingItem = false;
        openEditTextPopup(s);
        return;
      }
    }
  });

  // ===== DELETE SELECTED TEXT =====
  document.addEventListener("keydown", e => {
    if (editingText) return;
    if (popup.style.display === "block") return;
    if (!selectedItem) return;
    if (e.key !== "Delete" && e.key !== "Backspace") return;
    const i = strokes.indexOf(selectedItem);
    if (i !== -1) {
      saveHistory();
      strokes.splice(i, 1);
      selectedItem = null;
      redraw();
      triggerSave();
    }
  });

  // ===== KEYBOARD SHORTCUT : UNDO / REDO =====
  document.addEventListener("keydown", e => {
    const isMac = navigator.platform.toUpperCase().includes("MAC");
    const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
    if (cmdOrCtrl && !e.shiftKey && e.key.toLowerCase() === "z") {
      e.preventDefault();
      undo();
    }
    if (
      (cmdOrCtrl && e.key.toLowerCase() === "y") ||
      (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === "z")
    ) {
      e.preventDefault();
      redo();
    }
  });

  // ===== UI BUTTON : UNDO / REDO =====
  const undoBtn = document.getElementById("undoBtn");
  const redoBtn = document.getElementById("redoBtn");
  undoBtn.addEventListener("click", () => {
    undo();
  });
  redoBtn.addEventListener("click", () => {
    redo();
  });

  // ===== DATE POPUP =====
  let dateOverlay = null;

  const dateDropdown = document.getElementById("dateDropdown");

  const datePopup = document.createElement("div");
  datePopup.className = "date-popup";
  datePopup.style.display = "none";
  datePopup.innerHTML = `
  <h3>Select open date</h3>
  <div class="date-row">
    <select id="yearSelect"></select>
    <select id="monthSelect"></select>
    <select id="daySelect"></select>
  </div>
  <div class="row end">
    <button id="dateCancelBtn">Cancel</button>
    <button id="dateDoneBtn">Done</button>
  </div>
`;
  document.body.appendChild(datePopup);

  const yearSelect = datePopup.querySelector("#yearSelect");
  const monthSelect = datePopup.querySelector("#monthSelect");
  const daySelect = datePopup.querySelector("#daySelect");
  const dateCancelBtn = datePopup.querySelector("#dateCancelBtn");
  const dateDoneBtn = datePopup.querySelector("#dateDoneBtn");

  // เติม option ครั้งเดียว
  (function initDateSelect() {
    const now = new Date();
    const currentYear = now.getFullYear();
    for (let y = currentYear; y <= currentYear + 30; y++) yearSelect.append(new Option(y, y));
    for (let m = 1; m <= 12; m++) monthSelect.append(new Option(m, m));
    for (let d = 1; d <= 31; d++) daySelect.append(new Option(d, d));
  })();

  function openDatePopup() {
    if (datePopup.style.display === "block") return;

    dateOverlay = document.createElement("div");
    dateOverlay.className = "popup-overlay";
    dateOverlay.onclick = closeDatePopup;
    document.body.appendChild(dateOverlay);

    const base = selectedOpenDate || new Date();
    yearSelect.value = base.getFullYear();
    monthSelect.value = base.getMonth() + 1;
    daySelect.value = base.getDate();

    datePopup.style.display = "block";
    datePopup.style.left = "50%";
    datePopup.style.top = "50%";
    datePopup.style.transform = "translate(-50%, -50%)";
  }

  function closeDatePopup() {
    datePopup.style.display = "none";
    if (dateOverlay) {
      dateOverlay.remove();
      dateOverlay = null;
    }
  }

  function updateDatePreview() {
    const d = String(daySelect.value).padStart(2, "0");
    const m = String(monthSelect.value).padStart(2, "0");
    const y = yearSelect.value;
    dateDropdown.textContent = `${d}/${m}/${y}`;
    dateDropdown.classList.remove("placeholder");
  }

  let saveTimer = null;

  function triggerSave() {
    if (!window.etereaCreateApi?.onChange) return;
    if (isSyncing) return;

    clearTimeout(saveTimer);

    saveTimer = setTimeout(() => {
      const cleanStrokes = strokes.map(s => {
        if (s.type === "image") {
          const { img, ...rest } = s;
          return rest;
        }
        return s;
      });

      window.etereaCreateApi.onChange({
        strokes: cleanStrokes,
        openDate: selectedOpenDate,
      });
    }, 300); // 👈 ปรับได้ 200–500ms
  }

  dateDropdown.onclick = openDatePopup;
  yearSelect.onchange = updateDatePreview;
  monthSelect.onchange = updateDatePreview;
  daySelect.onchange = updateDatePreview;

  dateCancelBtn.onclick = closeDatePopup;
  dateDoneBtn.onclick = () => {
    selectedOpenDate = new Date(
      yearSelect.value,
      monthSelect.value - 1,
      daySelect.value
    );
    updateDatePreview();
    closeDatePopup();
  };
  setBackground(selectedBackground);
  updateCursor();


  window.etereaCreateApi = {
    loadSnapshot(snapshot) {
      if (!snapshot) return;
      if (drawing || draggingItem || resizingItem || rotatingItem) return;

      isSyncing = true;

      strokes.length = 0;
      if (snapshot.strokes) {
        strokes.push(...snapshot.strokes);
      }

      selectedOpenDate = snapshot.openDate
        ? new Date(snapshot.openDate)
        : null;

      reviveImages();
      redraw();

      setTimeout(() => {
        isSyncing = false;
      }, 0);
    },

    getSnapshot() {
      return {
        strokes: strokes.map(s => {
          if (s.type === "image") {
            const { img, ...rest } = s;
            return rest;
          }
          return s;
        }),
        openDate: selectedOpenDate,
      };
    },

    onChange: null, // ให้ React มา inject ทีหลัง
  };
};
