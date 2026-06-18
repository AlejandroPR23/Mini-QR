/**
 * ui/colors.js
 * Configura los pickers de color para el patrón y el fondo del QR.
 * Para agregar un tercer color (p.ej. color de esquinas), replicar el patrón aquí.
 */

import { state } from '../state.js';
import { updatePreview } from '../qr.js';

export function setupColorPickers() {
  const dotInput = document.getElementById('dot-color-input');
  const dotSwatch = document.getElementById('dot-color-swatch');
  const dotHex = document.getElementById('dot-color-hex');

  const bgInput = document.getElementById('bg-color-input');
  const bgSwatch = document.getElementById('bg-color-swatch');
  const bgHex = document.getElementById('bg-color-hex');

  dotInput.addEventListener('input', () => {
    state.currentDotColor = dotInput.value;
    dotSwatch.style.backgroundColor = state.currentDotColor;
    dotHex.textContent = state.currentDotColor;
    updatePreview();
  });

  bgInput.addEventListener('input', () => {
    state.currentBgColor = bgInput.value;
    bgSwatch.style.backgroundColor = state.currentBgColor;
    bgHex.textContent = state.currentBgColor;
    updatePreview();
  });

  dotSwatch.style.backgroundColor = state.currentDotColor;
  dotHex.textContent = state.currentDotColor;
  bgSwatch.style.backgroundColor = state.currentBgColor;
  bgHex.textContent = state.currentBgColor;
}