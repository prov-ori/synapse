// Общие UI-компоненты: тосты, модальные окна, конфетти, звуки, прогресс, ползунки.

const UI = {
  toast(msg, kind = '') {
    const box = document.getElementById('toasts');
    if (!box) return;
    const t = h('div', { class: 'toast ' + kind }, msg);
    box.appendChild(t);
    setTimeout(() => t.classList.add('out'), 2600);
    setTimeout(() => t.remove(), 3100);
  },

  xpPop(n) {
    const el = h('div', { class: 'xp-pop' }, '+' + n + ' XP');
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  },

  modal(title, body, actions = [], opts = {}) {
    const close = () => { overlay.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    const overlay = h('div', { class: 'modal-overlay', onclick: e => { if (e.target === overlay) close(); } },
      h('div', { class: 'modal' + (opts.wide ? ' wide' : ''), role: 'dialog', 'aria-modal': 'true' },
        h('div', { class: 'modal-head' }, h('h3', null, title), h('button', { class: 'icon-btn', onclick: close, 'aria-label': 'Закрыть' }, '✕')),
        h('div', { class: 'modal-body' }, body),
        actions.length ? h('div', { class: 'modal-actions' }, actions.map(a =>
          h('button', { class: 'btn ' + (a.kind || ''), onclick: () => { if (a.onclick?.() !== false) close(); } }, a.label))) : null,
      ));
    document.body.appendChild(overlay);
    document.addEventListener('keydown', onKey);
    return close;
  },

  confirm(title, text, onYes) {
    this.modal(title, h('p', null, text), [
      { label: 'Отмена' },
      { label: 'Да', kind: 'danger', onclick: onYes },
    ]);
  },

  confetti() {
    const canvas = h('canvas', { class: 'confetti' });
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    const colors = ['#7c5cff', '#2f80ed', '#1fb57a', '#ffb020', '#ff5d73', '#21c7d9'];
    const parts = Array.from({ length: 140 }, () => ({
      x: Math.random() * canvas.width, y: -20 - Math.random() * canvas.height * 0.5,
      vx: (Math.random() - 0.5) * 4, vy: 2 + Math.random() * 4,
      r: 4 + Math.random() * 6, c: pick(colors), a: Math.random() * Math.PI, va: (Math.random() - 0.5) * 0.3,
    }));
    let frame = 0;
    const step = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.a += p.va;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.a);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      if (++frame < 180) requestAnimationFrame(step); else canvas.remove();
    };
    step();
  },

  progressBar(value, max, cls = '') {
    const pct = max ? Math.min(100, (value / max) * 100) : 0;
    return h('div', { class: 'progress ' + cls }, h('div', { class: 'progress-fill', style: { width: pct + '%' } }));
  },

  pageHeader(title, subtitle, back) {
    return h('div', { class: 'page-header' },
      back ? h('a', { class: 'back-link', href: back }, '← Назад') : null,
      h('h1', null, title),
      subtitle ? h('p', { class: 'muted' }, subtitle) : null);
  },

  // Ползунок с подписью и значением: onInput(value)
  slider(label, { min, max, step = 1, value, unit = '', dp = 2, onInput }) {
    const out = h('span', { class: 'slider-val' });
    const input = h('input', { type: 'range', min, max, step, value });
    const show = () => { out.innerHTML = fmt(+input.value, dp) + (unit ? ' ' + unit : ''); };
    input.addEventListener('input', () => { show(); onInput(+input.value); });
    show();
    const wrap = h('label', { class: 'slider' }, h('span', { class: 'slider-label', html: label }), input, out);
    wrap.input = input;
    wrap.set = v => { input.value = v; show(); };
    return wrap;
  },

  segmented(options, active, onChange) {
    const box = h('div', { class: 'segmented', role: 'tablist' });
    const render = cur => {
      box.innerHTML = '';
      for (const [val, label] of options) {
        box.appendChild(h('button', {
          type: 'button', role: 'tab', 'aria-selected': String(val === cur), class: val === cur ? 'active' : '',
          onclick: () => { render(val); onChange(val); },
        }, label));
      }
    };
    render(active);
    return box;
  },

  stars(n, max = 3) {
    return h('span', { class: 'stars', 'aria-label': `${n} из ${max}` }, Array.from({ length: max }, (_, i) => h('span', { class: i < n ? 'star on' : 'star' }, '★')));
  },

  // Кольцо прогресса (дневная цель и т. п.)
  ring(value, max, label, color) {
    const pct = max ? Math.min(1, value / max) : 0;
    const r = 34, c = 2 * Math.PI * r;
    return h('div', { class: 'ring' },
      s('svg', { viewBox: '0 0 80 80', width: 88, height: 88 },
        s('circle', { cx: 40, cy: 40, r, fill: 'none', stroke: 'var(--surface-2)', 'stroke-width': 8 }),
        s('circle', {
          cx: 40, cy: 40, r, fill: 'none', stroke: color || 'var(--primary)', 'stroke-width': 8, 'stroke-linecap': 'round',
          'stroke-dasharray': `${c * pct} ${c}`, transform: 'rotate(-90 40 40)',
        })),
      h('div', { class: 'ring-label' }, label));
  },
};

// Повторяющаяся анимация, которую надо остановить при уходе со страницы
function animate(ctx, fn) {
  let id = 0, last = performance.now(), alive = true;
  const loop = t => {
    if (!alive) return;
    const dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    fn(dt, t / 1000);
    id = requestAnimationFrame(loop);
  };
  id = requestAnimationFrame(loop);
  const stop = () => { alive = false; cancelAnimationFrame(id); };
  if (ctx) ctx.onCleanup(stop);
  return stop;
}

// Канвас с поддержкой ретины; возвращает { canvas, g, w, h, resize }
function hiDpiCanvas(w, hgt, cls = 'lab-canvas') {
  const canvas = h('canvas', { class: cls });
  const g = canvas.getContext('2d');
  const obj = { canvas, g, w, h: hgt };
  obj.resize = (nw, nh) => {
    const dpr = window.devicePixelRatio || 1;
    obj.w = nw; obj.h = nh;
    canvas.width = nw * dpr; canvas.height = nh * dpr;
    canvas.style.aspectRatio = nw + ' / ' + nh;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  obj.resize(w, hgt);
  return obj;
}

const SFX = {
  ctx: null,
  tone(freqs, dur = 0.12, type = 'sine', gap = 0.09) {
    if (!Store.settings.sound) return;
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      const t0 = this.ctx.currentTime;
      freqs.forEach((f, i) => {
        const o = this.ctx.createOscillator(), gn = this.ctx.createGain();
        o.type = type;
        o.frequency.value = f;
        gn.gain.setValueAtTime(0.0001, t0 + i * gap);
        gn.gain.exponentialRampToValueAtTime(0.16, t0 + i * gap + 0.01);
        gn.gain.exponentialRampToValueAtTime(0.0001, t0 + i * gap + dur);
        o.connect(gn).connect(this.ctx.destination);
        o.start(t0 + i * gap);
        o.stop(t0 + i * gap + dur + 0.02);
      });
    } catch (e) { /* без звука */ }
  },
  correct() { this.tone([660, 880]); },
  wrong() { this.tone([220, 180], 0.18, 'square', 0.12); },
  finish() { this.tone([523, 659, 784, 1047], 0.18); },
  achievement() { this.tone([784, 988, 1175, 1568], 0.2, 'triangle', 0.1); },
  click() { this.tone([440], 0.05); },
};
