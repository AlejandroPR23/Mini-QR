/**
 * ui/logos.js
 * Responsabilidades:
 *   - Crear las pestañas de categorías de logos
 *   - Renderizar el grid de logos predefinidos con filtro por categoría
 *   - Manejar la selección de logo (carga del SVG, dibujado en canvas)
 *   - Manejar la subida de logo personalizado y el toggle del checkbox
 *
 * Para agregar un logo nuevo: editar data/logos.json.
 * Para agregar una categoría nueva: editar el array "categories" en logos.json.
 */

import { state } from '../state.js';
import { updatePreview } from '../qr.js';

// ─── Canvas helpers ───────────────────────────────────────────────────────────

function drawInitialsOnCanvas(canvas, ctx, logo) {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, cx - 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = logo.color || '#111827';
  ctx.beginPath();
  ctx.arc(cx, cy - 8, Math.floor(cx * 0.62), 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.floor(cx * 0.42)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(logo.name.substring(0, 2).toUpperCase(), cx, cy - 3);
}

function finalizeLogoSelection(logo, card, dataUrl) {
  state.logoDataUrl = dataUrl;
  state.selectedPredefinedLogo = logo.id;

  document.querySelectorAll('#predefined-logos-grid .logo-card')
    .forEach(c => c.classList.remove('active', 'border-zinc-900'));
  card.classList.add('active', 'border-zinc-900');

  document.getElementById('use-logo').checked = true;
  document.getElementById('logo-preview').classList.remove('hidden');
  document.getElementById('logo-thumb').src = dataUrl;

  updatePreview();
}

// ─── Logo card click handler ──────────────────────────────────────────────────

async function handleLogoClick(logo, card) {
  const canvas = document.createElement('canvas');
  canvas.width = 240;
  canvas.height = 240;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(120, 120, 115, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#f3f4f6';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(120, 120, 115, 0, Math.PI * 2);
  ctx.stroke();

  const imageSource = logo.imageUrl || logo.icon;

  if (!imageSource) {
    drawInitialsOnCanvas(canvas, ctx, logo);
    finalizeLogoSelection(logo, card, canvas.toDataURL('image/png'));
    return;
  }

  try {
    const response = await fetch(imageSource);
    if (!response.ok) throw new Error('SVG not found');
    let svgText = await response.text();

    if (logo.color) {
      svgText = svgText.replace(/fill="currentColor"/g, `fill="${logo.color}"`);
      svgText = svgText.replace(/fill="#000"/g, `fill="${logo.color}"`);
      svgText = svgText.replace(/fill="#000000"/g, `fill="${logo.color}"`);
    }

    const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const padding = 42;
      const maxDim = 240 - padding * 2;
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const dx = (240 - drawW) / 2;
      const dy = (240 - drawH) / 2;
      ctx.drawImage(img, dx, dy, drawW, drawH);
      URL.revokeObjectURL(svgUrl);
      finalizeLogoSelection(logo, card, canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      drawInitialsOnCanvas(canvas, ctx, logo);
      finalizeLogoSelection(logo, card, canvas.toDataURL('image/png'));
    };
    img.src = svgUrl;

  } catch {
    console.warn('Could not load SVG logo for', logo.name, '- using fallback');
    drawInitialsOnCanvas(canvas, ctx, logo);
    finalizeLogoSelection(logo, card, canvas.toDataURL('image/png'));
  }
}

// ─── API pública ──────────────────────────────────────────────────────────────

export function createLogoTabs() {
  const container = document.getElementById('logo-tabs');
  container.innerHTML = '';

  state.categories.forEach(cat => {
    const tab = document.createElement('div');
    tab.className = `logo-tab px-3 py-1 text-xs cursor-pointer border ${cat === 'Todos' ? 'active bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 text-zinc-600'}`;
    tab.textContent = cat;

    tab.onclick = () => {
      document.querySelectorAll('#logo-tabs .logo-tab')
        .forEach(t => t.classList.remove('active', 'bg-zinc-900', 'text-white'));
      tab.classList.add('active', 'bg-zinc-900', 'text-white');
      renderPredefinedLogos(cat);
    };

    container.appendChild(tab);
  });
}

export function renderPredefinedLogos(filterCategory = 'Todos') {
  const grid = document.getElementById('predefined-logos-grid');
  grid.innerHTML = '';

  const filtered = filterCategory === 'Todos'
    ? state.logos
    : state.logos.filter(l => l.category === filterCategory);

  filtered.forEach(logo => {
    const card = document.createElement('div');
    card.className = 'logo-card p-2 rounded-xl cursor-pointer flex flex-col items-center justify-center border border-zinc-200 hover:border-zinc-300 bg-white aspect-square';

    const iconSrc = logo.icon || logo.imageUrl;
    const isImageUrl = iconSrc && (
      iconSrc.startsWith('http://') ||
      iconSrc.startsWith('https://') ||
      iconSrc.startsWith('/') ||
      iconSrc.startsWith('svg/')
    );

    const iconEl = isImageUrl
      ? `<img src="${iconSrc}" class="w-8 h-8 mb-1 object-contain" alt="${logo.name}">`
      : `<span class="text-2xl mb-1 leading-none font-bold" style="color:${logo.color || '#111827'}">${logo.name.substring(0, 2).toUpperCase()}</span>`;

    card.innerHTML = `${iconEl}<div class="text-[9px] text-center text-zinc-600 leading-none">${logo.name}</div>`;
    card.onclick = () => handleLogoClick(logo, card);

    grid.appendChild(card);
  });
}

export function removeLogo() {
  state.logoDataUrl = null;
  state.selectedPredefinedLogo = null;

  document.getElementById('logo-preview').classList.add('hidden');
  document.getElementById('logo-file').value = '';
  document.getElementById('use-logo').checked = false;

  document.querySelectorAll('#predefined-logos-grid .logo-card')
    .forEach(c => c.classList.remove('active', 'border-zinc-900'));

  updatePreview();
}

export function setupLogoHandlers() {
  const checkbox = document.getElementById('use-logo');
  const fileInput = document.getElementById('logo-file');
  const previewContainer = document.getElementById('logo-preview');
  const thumb = document.getElementById('logo-thumb');

  checkbox.addEventListener('change', () => {
    if (!checkbox.checked && !state.selectedPredefinedLogo) {
      state.logoDataUrl = null;
      previewContainer.classList.add('hidden');
    }
    updatePreview();
  });

  fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      state.logoDataUrl = ev.target.result;
      state.selectedPredefinedLogo = null;
      thumb.src = state.logoDataUrl;
      previewContainer.classList.remove('hidden');
      checkbox.checked = true;

      document.querySelectorAll('#predefined-logos-grid .logo-card')
        .forEach(c => c.classList.remove('active', 'border-zinc-900'));

      updatePreview();
    };
    reader.readAsDataURL(file);
  });
}