/**
 * ui/patterns.js
 * Crea las tarjetas de selección de patrones de puntos del QR.
 * Para agregar un patrón nuevo: editar data/patterns.json.
 */

import { state } from '../state.js';
import { updatePreview } from '../qr.js';

export function createPatternCards() {
  const grid = document.getElementById('pattern-grid');
  grid.innerHTML = '';

  state.patterns.forEach(style => {
    const card = document.createElement('div');
    const isActive = state.currentPattern === style.id;

    card.className = `style-card p-2 rounded-xl cursor-pointer text-center ${isActive ? 'active bg-zinc-50' : 'bg-white'}`;

    const isRound = style.type.includes('rounded') || style.type === 'dots';
    card.innerHTML = `
            <div class="flex justify-center mb-1">
                <div class="w-9 h-9 border border-zinc-300 flex items-center justify-center" style="background:#fff;">
                    <div style="width:22px;height:22px;background:#111827;border-radius:${isRound ? '50%' : '2px'}"></div>
                </div>
            </div>
            <div class="text-[10px] font-medium">${style.name}</div>`;

    card.onclick = () => {
      state.currentPattern = style.id;
      document.querySelectorAll('#pattern-grid .style-card')
        .forEach(c => c.classList.remove('active', 'bg-zinc-50'));
      card.classList.add('active', 'bg-zinc-50');
      updatePreview();
    };

    grid.appendChild(card);
  });
}