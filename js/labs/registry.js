// Реестр интерактивных лабораторий и общие детали интерфейса для них.

const LAB_LIST = [];
const LAB_MAP = {};

// def: { id, subject, icon, title, desc, render(ctx) → Node }
function defLab(def) {
  LAB_LIST.push(def);
  LAB_MAP[def.id] = def;
}

// Каркас: слева сцена, справа управление и показания (на телефоне — столбиком)
function labShell(stage, side) {
  return h('div', { class: 'lab' }, h('div', { class: 'lab-stage' }, stage), h('div', { class: 'lab-side' }, side));
}

// Показание прибора: { el, set(html) }
function readout(label, unit = '') {
  const val = h('span', { class: 'readout-val' }, '—');
  const el = h('div', { class: 'readout' }, h('span', { class: 'readout-label', html: label }), h('span', null, val, unit ? h('span', { class: 'readout-unit', html: ' ' + unit }) : null));
  return { el, set: v => { val.innerHTML = v; } };
}

function labPanel(title, ...children) {
  return h('div', { class: 'lab-panel' }, title ? h('div', { class: 'lab-panel-title' }, title) : null, children);
}

// Цвета темы для canvas (читаются при каждой отрисовке — тема может смениться)
function themeColors() {
  return {
    text: cssVar('--text'), muted: cssVar('--muted'), border: cssVar('--border'), surface: cssVar('--surface'),
    surface2: cssVar('--surface-2'), primary: cssVar('--primary'), accent: cssVar('--accent'), ok: cssVar('--ok'),
    bad: cssVar('--bad'), chem: cssVar('--chem'), phys: cssVar('--phys'), bio: cssVar('--bio'), grid: cssVar('--grid'),
  };
}

// Простой линейный график на canvas: series = [{ points: [[x, y]], color, width, dash }]
function drawChart(g, box, { xMin, xMax, yMin, yMax, series, xLabel, yLabel, xTicks = 5, yTicks = 5, fmtX = v => fmt(v, 1), fmtY = v => fmt(v, 1), marks = [] }) {
  const c = themeColors();
  const { x, y, w, h: hh } = box;
  const X = v => x + (v - xMin) / (xMax - xMin) * w;
  const Y = v => y + hh - (v - yMin) / (yMax - yMin) * hh;
  g.save();
  g.font = '12px system-ui, sans-serif';
  g.strokeStyle = c.grid; g.lineWidth = 1; g.fillStyle = c.muted;
  for (let i = 0; i <= yTicks; i++) {
    const v = yMin + (yMax - yMin) * i / yTicks;
    g.beginPath(); g.moveTo(x, Y(v)); g.lineTo(x + w, Y(v)); g.stroke();
    g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText(fmtY(v), x - 6, Y(v));
  }
  for (let i = 0; i <= xTicks; i++) {
    const v = xMin + (xMax - xMin) * i / xTicks;
    g.beginPath(); g.moveTo(X(v), y); g.lineTo(X(v), y + hh); g.stroke();
    g.textAlign = 'center'; g.textBaseline = 'top'; g.fillText(fmtX(v), X(v), y + hh + 6);
  }
  g.strokeStyle = c.muted; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + hh); g.lineTo(x + w, y + hh); g.stroke();
  if (xLabel) { g.textAlign = 'right'; g.textBaseline = 'bottom'; g.fillStyle = c.text; g.fillText(xLabel, x + w, y + hh - 4); }
  if (yLabel) { g.textAlign = 'left'; g.textBaseline = 'top'; g.fillStyle = c.text; g.fillText(yLabel, x + 6, y + 2); }
  for (const m of marks) {
    g.strokeStyle = m.color || c.accent; g.setLineDash([4, 4]); g.lineWidth = 1.5;
    g.beginPath();
    if (m.y != null) { g.moveTo(x, Y(m.y)); g.lineTo(x + w, Y(m.y)); }
    if (m.x != null) { g.moveTo(X(m.x), y); g.lineTo(X(m.x), y + hh); }
    g.stroke(); g.setLineDash([]);
  }
  g.beginPath(); g.rect(x, y - 2, w, hh + 4); g.clip();
  for (const s of series) {
    if (!s.points.length) continue;
    g.strokeStyle = s.color; g.lineWidth = s.width || 2.5; g.setLineDash(s.dash || []);
    g.beginPath();
    s.points.forEach(([px, py], i) => (i ? g.lineTo(X(px), Y(py)) : g.moveTo(X(px), Y(py))));
    g.stroke();
    g.setLineDash([]);
    if (s.dot) {
      const [px, py] = s.points[s.points.length - 1];
      g.fillStyle = s.color; g.beginPath(); g.arc(X(px), Y(py), 5, 0, Math.PI * 2); g.fill();
    }
  }
  g.restore();
  return { X, Y };
}

// Модель Бора: SVG с ядром и электронами по слоям
function bohrSvg(z, opts = {}) {
  const sh = opts.shells || shells(z);
  const size = opts.size || 200;
  const cx = size / 2, cy = size / 2;
  const maxR = size / 2 - 8;
  const step = (maxR - 22) / Math.max(1, sh.length);
  const svg = s('svg', { viewBox: `0 0 ${size} ${size}`, class: 'bohr', width: size, height: size, role: 'img', 'aria-label': 'Модель атома' });
  svg.appendChild(s('circle', { cx, cy, r: 16, fill: 'var(--chem)' }));
  svg.appendChild(s('text', { x: cx, y: cy + 4, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 800, fill: '#fff' }, opts.nucleus || '+' + z));
  sh.forEach((n, i) => {
    const r = 22 + step * (i + 1);
    svg.appendChild(s('circle', { cx, cy, r, fill: 'none', stroke: 'var(--border)', 'stroke-width': 1.5 }));
    const g = s('g', { class: 'shell', style: `animation-duration:${8 + i * 4}s` });
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 - Math.PI / 2;
      g.appendChild(s('circle', { cx: cx + r * Math.cos(a), cy: cy + r * Math.sin(a), r: 4, fill: 'var(--phys)' }));
    }
    svg.appendChild(g);
  });
  return svg;
}

Views.labs = () => {
  const root = h('div');
  root.appendChild(UI.pageHeader('🔬 Лаборатории', 'Интерактивные модели: меняйте параметры и смотрите, как работают законы природы.'));
  const list = h('div', { class: 'card-grid' });
  const draw = f => {
    UIState.labFilter = f;
    list.innerHTML = '';
    LAB_LIST.filter(l => f === 'all' || l.subject === f).forEach(l => list.appendChild(h('a', { class: 'card lab-card', href: '#/labs/' + l.id, style: { '--c': SUBJECTS[l.subject].color } },
      h('div', { class: 'lab-card-icon' }, l.icon),
      h('div', null, h('b', null, l.title), h('div', { class: 'small muted' }, l.desc),
        Store.state.labs[l.id] ? h('span', { class: 'tag ok' }, '✓ открыта') : h('span', { class: 'tag' }, SUBJECTS[l.subject].title)))));
  };
  root.appendChild(UI.segmented([['all', 'Все'], ['chem', '⚗️ Химия'], ['phys', '🧲 Физика'], ['bio', '🧬 Биология']], UIState.labFilter, draw));
  root.appendChild(list);
  draw(UIState.labFilter);
  return root;
};

Views.lab = ([id], ctx) => {
  const lab = LAB_MAP[id];
  if (!lab) return Views.notFound();
  const first = !Store.state.labs[id];
  Store.labVisit(id);
  if (first) Store.addXp(5);
  const root = h('div', { class: 'lab-page', style: { '--c': SUBJECTS[lab.subject].color } });
  root.appendChild(UI.pageHeader(lab.icon + ' ' + lab.title, lab.desc, '#/labs'));
  root.appendChild(lab.render(ctx));
  return root;
};
