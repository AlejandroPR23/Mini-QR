/**
 * ui/corners.js
 * Crea las tarjetas de selección de estilo de esquinas del QR.
 * Para agregar un estilo nuevo: editar data/corners.json.
 */

import { state } from '../state.js';
import { updatePreview } from '../qr.js';

export function createCornerCards() {
  const grid = document.getElementById('corners-grid');
  grid.innerHTML = '';

  state.corners.forEach(style => {
    const card = document.createElement('div');
    const isActive = state.currentCorners === style.id;

    card.className = `style-card p-2 rounded-xl cursor-pointer text-center ${isActive ? 'active bg-zinc-50' : 'bg-white'}`;

    card.innerHTML = `
            <div class="flex justify-center mb-1">
                <div class="w-9 h-9 border border-zinc-300 flex items-center justify-center relative" style="background:#fff;">
                    <div style="width:18px;height:18px;border:2.5px solid #111827;border-radius:${style.square === 'dot' ? '50%' : '2px'}"></div>
                    <div style="position:absolute;width:6px;height:6px;background:#111827;border-radius:${style.dot === 'dot' ? '50%' : '1px'}"></div>
                </div>
            </div>
            <div class="text-[10px] font-medium">${style.name}</div>`;

    card.onclick = () => {
      state.currentCorners = style.id;
      document.querySelectorAll('#corners-grid .style-card')
        .forEach(c => c.classList.remove('active', 'bg-zinc-50'));
      card.classList.add('active', 'bg-zinc-50');
      updatePreview();
    };

    grid.appendChild(card);
  });
}