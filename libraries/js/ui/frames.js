/**
 * ui/frames.js
 * Crea las tarjetas de selección de marcos en el grid.
 * Para agregar un nuevo marco: solo editar data/frames.json.
 */

import { state } from '../state.js';
import { updatePreview, updateFrameTextVisibility } from '../qr.js';

export function createFrameCards() {
  const grid = document.getElementById('frame-grid');
  grid.innerHTML = '';

  state.frames.forEach(frame => {
    const card = document.createElement('div');
    const isActive = frame.id === state.currentFrameId;

    card.className = `frame-card border ${isActive ? 'border-zinc-900' : 'border-zinc-200'} bg-white rounded-2xl p-2 cursor-pointer text-center`;

    const preview = frame.type === 'svg'
      ? `<div class="h-12 flex items-center justify-center scale-[0.6]">${frame.svgTemplate}</div>`
      : `<div class="h-12 ${frame.outerClass} flex items-center justify-center">
                 <div class="${frame.innerClass} w-7 h-7 flex items-center justify-center">
                   <div class="mini-qr text-[10px]"><i class="fa-solid fa-qrcode"></i></div>
                 </div>
               </div>`;

    card.innerHTML = `<div class="text-xs font-medium mb-1">${frame.name}</div>${preview}`;

    card.onclick = () => {
      document.querySelectorAll('#frame-grid .frame-card')
        .forEach(c => c.classList.remove('border-zinc-900'));
      card.classList.add('border-zinc-900');
      state.currentFrameId = frame.id;
      updateFrameTextVisibility();
      updatePreview();
    };

    grid.appendChild(card);
  });
}