/**
 * state.js
 * Estado global compartido entre todos los módulos.
 * Se importa por referencia, por lo que mutar sus propiedades
 * es visible en todos los módulos que lo importen.
 *
 * Para agregar una nueva opción de configuración, declararla aquí.
 */

export const state = {
    currentPattern: 'rounded',
    currentCorners: 'rounded',
    currentDotColor: '#111827',
    currentBgColor: '#ffffff',
    currentFrameId: 'phone-scan-me',
    logoDataUrl: null,
    selectedPredefinedLogo: null,
    qrCodeInstance: null,
    frames: [],
    patterns: [],
    corners: [],
    logos: [],
    categories: [],
};