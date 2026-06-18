/**
 * qr.js
 * Responsabilidades:
 *   - Inicializar / actualizar la instancia de QRCodeStyling
 *   - Renderizar la vista previa (tipo CSS o tipo SVG)
 *   - Descargar el QR final con html2canvas
 *
 * Para agregar un nuevo tipo de marco SVG, solo hay que agregar
 * su id y coordenadas en el mapa QR_AREA_MAP de este archivo.
 */

import { state } from './state.js';

// ─── Mapa de posición del área QR por frame SVG ───────────────────────────────
const QR_AREA_MAP = {
  'phone-scan-me': { x: 115, y: 62, w: 150, h: 150 },
  'business-card': { x: 205, y: 35, w: 135, h: 150 },
  'shopping-bag-pro': { x: 80, y: 170, w: 260, h: 260 },
  'wifi-free': { x: 78, y: 148, w: 224, h: 224 },
  _default: { x: 115, y: 62, w: 150, h: 150 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCurrentFrame() {
  return state.frames.find(f => f.id === state.currentFrameId) || state.frames[0];
}

function getCornerOptions() {
  const style = state.corners.find(s => s.id === state.currentCorners) || state.corners[0];
  return {
    cornersSquareOptions: { color: state.currentDotColor, type: style.square },
    cornersDotOptions: { color: state.currentDotColor, type: style.dot },
  };
}

// ─── API pública ──────────────────────────────────────────────────────────────

export function getCurrentFramePublic() {
  return getCurrentFrame();
}

/**
 * Crea o actualiza la instancia de QRCodeStyling con los parámetros actuales.
 */
export function initializeQR() {
  const frame = getCurrentFrame();
  const content = document.getElementById('qr-content').value.trim() || 'https://x.ai';

  const options = {
    width: frame.qrSize || 240,
    height: frame.qrSize || 240,
    type: 'canvas',
    data: content,
    margin: 0,
    qrOptions: { errorCorrectionLevel: 'H' },
    dotsOptions: {
      color: state.currentDotColor,
      type: state.currentPattern,
    },
    backgroundOptions: {
      color: state.currentBgColor,
    },
    ...getCornerOptions(),
  };

  const useLogoChecked = document.getElementById('use-logo').checked;
  if (useLogoChecked && state.logoDataUrl) {
    options.image = state.logoDataUrl;
    options.imageOptions = {
      hideBackgroundDots: true,
      imageSize: 0.28,
      margin: 6,
    };
  }

  if (state.qrCodeInstance) {
    state.qrCodeInstance.update(options);
  } else {
    state.qrCodeInstance = new QRCodeStyling(options);
  }
}

/**
 * Renderiza la vista previa en el DOM según el tipo del marco actual.
 */
export async function renderPreview() {
  const frame = getCurrentFrame();
  const cssContainer = document.getElementById('css-frame-container');
  const svgContainer = document.getElementById('svg-frame-container');

  cssContainer.classList.add('hidden');
  svgContainer.classList.add('hidden');
  svgContainer.innerHTML = '';
  document.getElementById('frame-extra').innerHTML = '';

  document.getElementById('current-frame-name').innerHTML = `<span>${frame.name}</span>`;

  if (frame.type === 'css') {
    cssContainer.classList.remove('hidden');
    cssContainer.className = `qr-preview relative mx-auto transition-all ${frame.outerClass}`;

    const inner = document.getElementById('frame-inner');
    inner.className = `flex items-center justify-center transition-all ${frame.innerClass}`;
    document.getElementById('frame-extra').innerHTML = frame.extraHTML || '';

    const qrHost = document.getElementById('qr-host');
    qrHost.innerHTML = '';
    if (state.qrCodeInstance) state.qrCodeInstance.append(qrHost);

  } else if (frame.type === 'svg') {
    svgContainer.classList.remove('hidden');

    let qrDataUrl;
    try {
      const rawData = await state.qrCodeInstance.getRawData('png');
      qrDataUrl = URL.createObjectURL(rawData);
    } catch {
      qrDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    }

    const area = QR_AREA_MAP[frame.id] || QR_AREA_MAP._default;

    const qrImageTag = `<image href="${qrDataUrl}" x="${area.x}" y="${area.y}" width="${area.w}" height="${area.h}" preserveAspectRatio="xMidYMid meet"/>`;

    let svgHTML = frame.svgTemplate;
    svgHTML = svgHTML.replace(/<rect id="qr-area"[^>]*\/>/, qrImageTag);

    const frameTextValue = document.getElementById('frame-text-input').value.trim() || 'SCAN ME';
    svgHTML = svgHTML.replace(/{{FRAME_TEXT}}/g, frameTextValue);

    svgContainer.innerHTML = svgHTML;

    setTimeout(() => {
      if (qrDataUrl.startsWith('blob:')) URL.revokeObjectURL(qrDataUrl);
    }, 5000);
  }
}

/**
 * Orquesta initializeQR + pequeño delay + renderPreview.
 * Es la función que llaman todos los módulos de UI al detectar un cambio.
 */
export async function updatePreview() {
  initializeQR();
  await new Promise(r => setTimeout(r, 80));
  await renderPreview();
}

/**
 * Descarga el QR actual como PNG usando html2canvas.
 */
export async function downloadQR() {
  const preview = document.getElementById('preview');
  const frame = getCurrentFrame();
  const scale = frame.type === 'svg' ? 2.2 : 2.8;
  const canvas = await html2canvas(preview, { scale, backgroundColor: '#ffffff' });
  const link = document.createElement('a');
  link.download = `qr-${frame.id}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/**
 * Muestra u oculta el campo "Texto del marco" según si el frame actual lo usa.
 */
export function updateFrameTextVisibility() {
  const frame = getCurrentFrame();
  const section = document.getElementById('frame-text-section');
  const hasText = frame.type === 'svg'
    && frame.svgTemplate
    && frame.svgTemplate.includes('{{FRAME_TEXT}}');
  section.classList.toggle('hidden', !hasText);
}