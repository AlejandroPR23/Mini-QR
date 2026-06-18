/**
 * main.js  —  Entry point
 *
 * Responsabilidad única: orquestar la inicialización.
 *   1. Cargar datos desde los JSON
 *   2. Poblar el estado global
 *   3. Llamar a cada módulo de UI para que construya sus elementos
 *   4. Lanzar la primera vista previa
 *
 * Para agregar una nueva sección de UI:
 *   - Crear js/ui/nueva-seccion.js
 *   - Importar y llamar su función de init aquí
 */

import { loadData } from './data.js';
import { state } from './state.js';
import { updatePreview, updateFrameTextVisibility, downloadQR } from './qr.js';
import { createFrameCards } from './ui/frames.js';
import { createPatternCards } from './ui/patterns.js';
import { createCornerCards } from './ui/corners.js';
import { setupColorPickers } from './ui/colors.js';
import { createLogoTabs, renderPredefinedLogos, setupLogoHandlers, removeLogo } from './ui/logos.js';

window.updatePreview = updatePreview;
window.downloadQR = downloadQR;
window.removeLogo = removeLogo;

// ─── Listeners de contenido (URL y texto del marco) ──────────────────────────

function setupContentListeners() {
    const qrInput = document.getElementById('qr-content');
    let qrTimeout = null;
    qrInput.addEventListener('input', () => {
        clearTimeout(qrTimeout);
        qrTimeout = setTimeout(() => updatePreview(), 400);
    });

    const frameTextInput = document.getElementById('frame-text-input');
    let frameTimeout = null;
    frameTextInput.addEventListener('input', () => {
        clearTimeout(frameTimeout);
        frameTimeout = setTimeout(() => updatePreview(), 300);
    });
}

// ─── Shortcut de teclado: "/" enfoca el input de URL ─────────────────────────

function setupKeyboardShortcut() {
    document.addEventListener('keydown', e => {
        if (e.key === '/' && document.activeElement.id !== 'qr-content') {
            e.preventDefault();
            document.getElementById('qr-content').focus();
        }
    });
}

// ─── Init ─────────────────────────────────────────────────────────────────────

async function init() {
    const data = await loadData();

    state.frames = data.frames;
    state.patterns = data.patterns;
    state.corners = data.corners;
    state.logos = data.logos;
    state.categories = data.categories;

    createFrameCards();
    createPatternCards();
    createCornerCards();
    createLogoTabs();
    renderPredefinedLogos('Todos');
    setupColorPickers();
    setupLogoHandlers();
    setupContentListeners();
    setupKeyboardShortcut();
    updateFrameTextVisibility();

    await new Promise(r => setTimeout(r, 100));
    await updatePreview();
}

window.addEventListener('load', init);