// Лаборатории по физике.

const PLANETS = [['Земля', 9.81], ['Луна', 1.62], ['Марс', 3.71], ['Юпитер', 24.79], ['Венера', 8.87]];

// ---------- Бросок под углом ----------
defLab({
  id: 'projectile', subject: 'phys', icon: '🎯', title: 'Бросок под углом',
  desc: 'Траектория, дальность и высота полёта на Земле, Луне и Марсе',
  render(ctx) {
    const st = { angle: 45, v0: 20, h0: 0, g: 9.81, planet: 'Земля' };
    const cv = hiDpiCanvas(720, 400);
    const trails = [];
    let flight = null;
    const rL = readout('Дальность L', 'м'), rH = readout('Макс. высота H', 'м'), rT = readout('Время полёта t', 'с');
    const calc = () => {
      const a = st.angle * Math.PI / 180;
      const vx = st.v0 * Math.cos(a), vy = st.v0 * Math.sin(a);
      const T = (vy + Math.sqrt(vy * vy + 2 * st.g * st.h0)) / st.g;
      return { vx, vy, T, L: vx * T, H: st.h0 + vy * vy / (2 * st.g) };
    };
    const show = () => { const r = calc(); rL.set(fmt(r.L, 1)); rH.set(fmt(r.H, 1)); rT.set(fmt(r.T, 2)); };
    const launch = () => {
      const r = calc();
      flight = { ...r, t: 0, pts: [], color: pick(['#7c5cff', '#2f80ed', '#1fb57a', '#ff8a00', '#e0457b']), label: `${st.angle}°, ${st.v0} м/с, ${st.planet}` };
    };
    const draw = dt => {
      const g = cv.g, c = themeColors();
      g.clearRect(0, 0, cv.w, cv.h);
      const all = [...trails, flight].filter(Boolean);
      const maxL = Math.max(40, ...all.map(f => f.L), calc().L) * 1.08;
      const maxH = Math.max(20, ...all.map(f => f.H), calc().H) * 1.15;
      const scale = Math.min((cv.w - 60) / maxL, (cv.h - 50) / maxH);
      const X = x => 40 + x * scale, Y = y => cv.h - 30 - y * scale;
      // земля и сетка
      g.strokeStyle = c.grid; g.lineWidth = 1; g.font = '11px system-ui'; g.fillStyle = c.muted;
      const stepM = niceStep(maxL / 8);
      for (let x = 0; x <= maxL; x += stepM) { g.beginPath(); g.moveTo(X(x), Y(0)); g.lineTo(X(x), 10); g.stroke(); g.fillText(fmt(x, 0) + ' м', X(x) + 2, Y(0) + 14); }
      for (let y = stepM; y <= maxH; y += stepM) { g.beginPath(); g.moveTo(40, Y(y)); g.lineTo(cv.w, Y(y)); g.stroke(); g.fillText(fmt(y, 0), 4, Y(y) + 4); }
      g.fillStyle = c.bio; g.fillRect(0, Y(0), cv.w, 30);
      if (st.h0 > 0) { g.fillStyle = c.muted; g.fillRect(X(0) - 14, Y(st.h0), 14, st.h0 * scale); }
      // пушка
      const a = st.angle * Math.PI / 180;
      g.save(); g.translate(X(0), Y(st.h0)); g.rotate(-a);
      g.fillStyle = c.text; g.fillRect(0, -5, 34, 10); g.restore();
      // прогноз
      const r = calc();
      g.setLineDash([4, 6]); g.strokeStyle = c.muted; g.lineWidth = 1.5; g.beginPath();
      for (let i = 0; i <= 60; i++) { const t = r.T * i / 60; const x = r.vx * t, y = st.h0 + r.vy * t - st.g * t * t / 2; i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y)); }
      g.stroke(); g.setLineDash([]);
      for (const f of all) {
        g.strokeStyle = f.color; g.lineWidth = 3; g.beginPath();
        f.pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))));
        g.stroke();
      }
      if (flight) {
        flight.t = Math.min(flight.T, flight.t + dt * 1.2);
        const x = flight.vx * flight.t, y = st.h0 + flight.vy * flight.t - st.g * flight.t * flight.t / 2;
        flight.pts.push([x, Math.max(0, y)]);
        g.fillStyle = flight.color; g.beginPath(); g.arc(X(x), Y(Math.max(0, y)), 7, 0, Math.PI * 2); g.fill();
        // вектор скорости
        const vy = flight.vy - st.g * flight.t;
        g.strokeStyle = c.bad; g.lineWidth = 2; g.beginPath(); g.moveTo(X(x), Y(y)); g.lineTo(X(x) + flight.vx * 2, Y(y) - vy * 2); g.stroke();
        if (flight.t >= flight.T) { trails.push(flight); if (trails.length > 5) trails.shift(); flight = null; SFX.click(); }
      }
    };
    animate(ctx, draw);
    show();
    const planetSel = h('select', { 'aria-label': 'Планета', onchange: e => { const p = PLANETS[+e.target.value]; st.g = p[1]; st.planet = p[0]; show(); } }, PLANETS.map(([n, gv], i) => h('option', { value: i }, `${n} (g = ${fmt(gv, 2)})`)));
    return labShell(cv.canvas, [
      labPanel('Параметры',
        UI.slider('Угол α', { min: 5, max: 85, step: 1, value: 45, unit: '°', dp: 0, onInput: v => { st.angle = v; show(); } }),
        UI.slider('Скорость v₀', { min: 5, max: 50, step: 1, value: 20, unit: 'м/с', dp: 0, onInput: v => { st.v0 = v; show(); } }),
        UI.slider('Высота h₀', { min: 0, max: 30, step: 1, value: 0, unit: 'м', dp: 0, onInput: v => { st.h0 = v; show(); } }),
        h('label', { class: 'field' }, h('span', { class: 'label' }, 'Планета '), planetSel),
        h('div', { class: 'row' }, h('button', { class: 'btn primary', type: 'button', onclick: launch }, '🚀 Огонь!'), h('button', { class: 'btn', type: 'button', onclick: () => { trails.length = 0; } }, 'Очистить'))),
      labPanel('Расчёт', rL.el, rH.el, rT.el),
      h('p', { class: 'small muted' }, 'Проверьте: при h₀ = 0 углы 30° и 60° дают одинаковую дальность, а максимум — при 45°. На Луне тот же бросок улетит в 6 раз дальше.'),
    ]);
  },
});

function niceStep(x) {
  const p = Math.pow(10, Math.floor(Math.log10(x)));
  const m = x / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}

// ---------- Маятник ----------
defLab({
  id: 'pendulum', subject: 'phys', icon: '🕰️', title: 'Маятник и энергия',
  desc: 'Период колебаний, превращение потенциальной энергии в кинетическую',
  render(ctx) {
    const st = { L: 1, g: 9.81, amp: 20, m: 1, damp: 0 };
    let th = st.amp * Math.PI / 180, w = 0, time = 0, lastCross = null, measured = null, prevTh = th;
    const cv = hiDpiCanvas(720, 400);
    const rT = readout('Период по формуле', 'с'), rM = readout('Измеренный период', 'с'), rN = readout('Частота', 'Гц');
    const reset = () => { th = st.amp * Math.PI / 180; w = 0; time = 0; lastCross = null; measured = null; prevTh = th; };
    const draw = dt => {
      // интегрирование θ'' = −(g/L)·sin θ − b·θ' (полушаговый метод)
      const steps = 8;
      for (let i = 0; i < steps; i++) {
        const h2 = dt / steps;
        w += (-(st.g / st.L) * Math.sin(th) - st.damp * w) * h2;
        th += w * h2;
        time += h2;
        if (prevTh < 0 && th >= 0) { if (lastCross != null) measured = time - lastCross; lastCross = time; }
        prevTh = th;
      }
      const g = cv.g, c = themeColors();
      g.clearRect(0, 0, cv.w, cv.h);
      const px = 260, py = 40;
      const len = Math.min(300, 120 + st.L * 60);
      const bx = px + len * Math.sin(th), by = py + len * Math.cos(th);
      g.strokeStyle = c.muted; g.lineWidth = 4; g.beginPath(); g.moveTo(px - 60, py); g.lineTo(px + 60, py); g.stroke();
      g.strokeStyle = c.text; g.lineWidth = 2; g.beginPath(); g.moveTo(px, py); g.lineTo(bx, by); g.stroke();
      // дуга амплитуды
      g.strokeStyle = c.grid; g.setLineDash([4, 4]); g.beginPath(); g.arc(px, py, len, Math.PI / 2 - st.amp * Math.PI / 180, Math.PI / 2 + st.amp * Math.PI / 180); g.stroke(); g.setLineDash([]);
      g.fillStyle = c.phys; g.beginPath(); g.arc(bx, by, 10 + st.m * 4, 0, Math.PI * 2); g.fill();
      // энергия
      const hgt = st.L * (1 - Math.cos(th)), v = w * st.L;
      const Ep = st.m * st.g * hgt, Ek = st.m * v * v / 2, E = Ep + Ek || 1;
      const bx0 = 540, bw = 40, bh = 260, base = 340;
      const bar = (x, val, col, label) => {
        g.fillStyle = c.surface2; g.fillRect(x, base - bh, bw, bh);
        g.fillStyle = col; g.fillRect(x, base - bh * val / E, bw, bh * val / E);
        g.fillStyle = c.text; g.font = '12px system-ui'; g.textAlign = 'center'; g.fillText(label, x + bw / 2, base + 16);
      };
      bar(bx0, Ep, c.accent, 'Eп'); bar(bx0 + 60, Ek, c.bad, 'Eк'); bar(bx0 + 120, Ep + Ek, c.ok, 'E');
      g.textAlign = 'left'; g.fillStyle = c.muted; g.fillText('Энергия (доли полной)', bx0 - 10, 60);
    };
    animate(ctx, draw);
    const show = () => {
      const T = 2 * Math.PI * Math.sqrt(st.L / st.g);
      rT.set(fmt(T, 3)); rN.set(fmt(1 / T, 3));
    };
    const tick = setInterval(() => { rM.set(measured ? fmt(measured, 3) : '…'); }, 300);
    ctx.onCleanup(() => clearInterval(tick));
    show();
    const planetSel = h('select', { 'aria-label': 'Планета', onchange: e => { st.g = PLANETS[+e.target.value][1]; show(); reset(); } }, PLANETS.map(([n, gv], i) => h('option', { value: i }, `${n} (g = ${fmt(gv, 2)})`)));
    return labShell(cv.canvas, [
      labPanel('Параметры',
        UI.slider('Длина нити l', { min: 0.2, max: 3, step: 0.1, value: 1, unit: 'м', dp: 1, onInput: v => { st.L = v; show(); reset(); } }),
        UI.slider('Амплитуда', { min: 5, max: 80, step: 1, value: 20, unit: '°', dp: 0, onInput: v => { st.amp = v; reset(); } }),
        UI.slider('Масса груза', { min: 0.2, max: 3, step: 0.1, value: 1, unit: 'кг', dp: 1, onInput: v => { st.m = v; } }),
        UI.slider('Трение (затухание)', { min: 0, max: 0.5, step: 0.05, value: 0, unit: '', dp: 2, onInput: v => { st.damp = v; } }),
        h('label', { class: 'field' }, h('span', { class: 'label' }, 'Планета '), planetSel)),
      labPanel('Показания', rT.el, rM.el, rN.el),
      h('p', { class: 'small muted' }, 'Формула T = 2π√(l/g) точна для малых углов. При амплитуде 60–80° измеренный период заметно больше. А масса на период не влияет вовсе.'),
    ]);
  },
});

// ---------- Электрическая цепь ----------
defLab({
  id: 'circuit', subject: 'phys', icon: '🔋', title: 'Электрическая цепь',
  desc: 'Закон Ома, последовательное и параллельное соединение, мощность',
  render(ctx) {
    const st = { E: 12, r: 0.5, R1: 6, R2: 3, mode: 'series', on: true };
    const svg = s('svg', { viewBox: '0 0 520 320', class: 'circuit-svg', role: 'img', 'aria-label': 'Схема цепи' });
    const rI = readout('Общий ток I', 'А'), rR = readout('Общее сопротивление R', 'Ом'), rU = readout('Напряжение на клеммах U', 'В');
    const r1 = readout('Резистор R₁: I₁, U₁'), r2 = readout('Резистор R₂: I₂, U₂'), rP = readout('Мощность в нагрузке P', 'Вт');
    let phase = 0;
    const solve = () => {
      const R = st.mode === 'series' ? st.R1 + st.R2 : st.R1 * st.R2 / (st.R1 + st.R2);
      const I = st.on ? st.E / (R + st.r) : 0;
      const U = I * R;
      const I1 = st.mode === 'series' ? I : U / st.R1, I2 = st.mode === 'series' ? I : U / st.R2;
      return { R, I, U, I1, I2, U1: I1 * st.R1, U2: I2 * st.R2 };
    };
    const resistor = (x, y, label, val, current) => s('g', null,
      s('rect', { x: x - 34, y: y - 13, width: 68, height: 26, rx: 4, fill: 'var(--surface)', stroke: 'var(--text)', 'stroke-width': 2.5 }),
      s('rect', { x: x - 34, y: y - 13, width: 68 * Math.min(1, current / 4), height: 26, rx: 4, fill: 'var(--accent)', opacity: 0.35 }),
      s('text', { x, y: y + 5, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: 'var(--text)' }, `${label} ${fmt(val)} Ом`));
    const draw = dt => {
      const r = solve();
      phase = (phase + dt * r.I * 30) % 1000;
      svg.innerHTML = '';
      const wire = d => s('path', { d, fill: 'none', stroke: 'var(--text)', 'stroke-width': 3, 'stroke-linejoin': 'round' });
      const flow = d => s('path', { d, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 4, 'stroke-dasharray': '3 17', 'stroke-dashoffset': -phase, opacity: r.I ? 1 : 0 });
      // батарея слева
      svg.append(
        s('line', { x1: 50, y1: 145, x2: 90, y2: 145, stroke: 'var(--text)', 'stroke-width': 4 }),
        s('line', { x1: 58, y1: 160, x2: 82, y2: 160, stroke: 'var(--text)', 'stroke-width': 8 }),
        s('text', { x: 100, y: 158, 'font-size': 14, 'font-weight': 800, fill: 'var(--text)' }, `ℰ = ${fmt(st.E)} В`),
        s('text', { x: 100, y: 176, 'font-size': 12, fill: 'var(--muted)' }, `r = ${fmt(st.r)} Ом`));
      // ключ
      const kx = 260;
      const loop = st.mode === 'series'
        ? ['M70 145 L70 40 L470 40 L470 280 L70 280 L70 160']
        : ['M70 145 L70 40 L470 40 L470 280 L70 280 L70 160', 'M200 40 L200 110 L340 110 L340 40', 'M200 280 L200 210 L340 210 L340 280'];
      loop.forEach(d => { svg.append(wire(d), flow(d)); });
      svg.append(s('rect', { x: kx - 22, y: 268, width: 44, height: 24, fill: 'var(--surface)' }),
        s('line', { x1: kx - 20, y1: 280, x2: kx + 18, y2: st.on ? 280 : 262, stroke: 'var(--text)', 'stroke-width': 3 }),
        s('circle', { cx: kx - 20, cy: 280, r: 4, fill: 'var(--text)' }), s('circle', { cx: kx + 20, cy: 280, r: 4, fill: 'var(--text)' }),
        s('text', { x: kx, y: 308, 'text-anchor': 'middle', 'font-size': 12, fill: 'var(--muted)' }, st.on ? 'ключ замкнут' : 'ключ разомкнут'));
      if (st.mode === 'series') { svg.append(resistor(200, 40, 'R₁', st.R1, r.I1), resistor(340, 40, 'R₂', st.R2, r.I2)); }
      else { svg.append(resistor(270, 110, 'R₁', st.R1, r.I1), resistor(270, 210, 'R₂', st.R2, r.I2)); }
      // амперметр
      svg.append(s('circle', { cx: 470, cy: 160, r: 18, fill: 'var(--surface)', stroke: 'var(--phys)', 'stroke-width': 3 }),
        s('text', { x: 470, y: 166, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 900, fill: 'var(--phys)' }, 'A'),
        s('text', { x: 494, y: 166, 'font-size': 13, 'font-weight': 800, fill: 'var(--phys)' }, fmt(r.I, 2)));
      rI.set(fmt(r.I, 3)); rR.set(fmt(r.R, 2)); rU.set(fmt(r.U, 2));
      r1.set(`${fmt(r.I1, 3)} А, ${fmt(r.U1, 2)} В`); r2.set(`${fmt(r.I2, 3)} А, ${fmt(r.U2, 2)} В`); rP.set(fmt(r.U * r.I, 2));
    };
    animate(ctx, draw);
    return labShell(svg, [
      UI.segmented([['series', 'Последовательно'], ['parallel', 'Параллельно']], st.mode, v => { st.mode = v; }),
      labPanel('Элементы',
        UI.slider('ЭДС ℰ', { min: 1.5, max: 24, step: 0.5, value: 12, unit: 'В', dp: 1, onInput: v => { st.E = v; } }),
        UI.slider('Внутр. сопротивление r', { min: 0, max: 5, step: 0.1, value: 0.5, unit: 'Ом', dp: 1, onInput: v => { st.r = v; } }),
        UI.slider('R₁', { min: 1, max: 50, step: 1, value: 6, unit: 'Ом', dp: 0, onInput: v => { st.R1 = v; } }),
        UI.slider('R₂', { min: 1, max: 50, step: 1, value: 3, unit: 'Ом', dp: 0, onInput: v => { st.R2 = v; } }),
        h('label', { class: 'switch' }, h('input', { type: 'checkbox', checked: true, onchange: e => { st.on = e.target.checked; } }), 'Ключ замкнут')),
      labPanel('Измерения', rI.el, rR.el, rU.el, r1.el, r2.el, rP.el),
    ]);
  },
});

// ---------- Линза ----------
defLab({
  id: 'lens', subject: 'phys', icon: '🔍', title: 'Тонкая линза',
  desc: 'Ход лучей, действительное и мнимое изображение, увеличение',
  render(ctx) {
    const st = { F: 80, d: 200, hObj: 60, conv: true };
    const cv = hiDpiCanvas(720, 380);
    const rf = readout('Расстояние до изображения f', 'см'), rG = readout('Увеличение Γ'), rType = readout('Изображение'), rD = readout('Оптическая сила D', 'дптр');
    let dragging = false;
    const draw = () => {
      const g = cv.g, c = themeColors();
      g.clearRect(0, 0, cv.w, cv.h);
      const cx = cv.w / 2, cy = cv.h / 2;
      const F = st.conv ? st.F : -st.F;
      const d = st.d;
      const f = Math.abs(d - F) < 0.01 ? Infinity : 1 / (1 / F - 1 / d);
      const G = -f / d; // со знаком: <0 — перевёрнутое
      const hImg = st.hObj * G;
      // ось
      g.strokeStyle = c.muted; g.lineWidth = 1; g.beginPath(); g.moveTo(0, cy); g.lineTo(cv.w, cy); g.stroke();
      // фокусы
      g.fillStyle = c.text; g.font = '12px system-ui'; g.textAlign = 'center';
      [[-F, 'F'], [F, 'F'], [-2 * F, '2F'], [2 * F, '2F']].forEach(([x, l]) => { g.beginPath(); g.arc(cx + x, cy, 3, 0, Math.PI * 2); g.fill(); g.fillText(l, cx + x, cy + 18); });
      // линза
      g.strokeStyle = c.phys; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, 20); g.lineTo(cx, cv.h - 20); g.stroke();
      const arrowHead = (y, up) => { g.beginPath(); g.moveTo(cx - 10, y + (up ? 10 : -10)); g.lineTo(cx, y); g.lineTo(cx + 10, y + (up ? 10 : -10)); g.stroke(); };
      if (st.conv) { arrowHead(20, true); arrowHead(cv.h - 20, false); } else { arrowHead(30, false); arrowHead(cv.h - 30, true); }
      // предмет
      const ox = cx - d, oy = cy - st.hObj;
      const arrow = (x, y0, y1, col, dash) => {
        g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 4; g.setLineDash(dash ? [6, 5] : []);
        g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); g.setLineDash([]);
        const dir = Math.sign(y1 - y0) || -1;
        g.beginPath(); g.moveTo(x, y1); g.lineTo(x - 8, y1 - dir * 12); g.lineTo(x + 8, y1 - dir * 12); g.closePath(); g.fill();
      };
      arrow(ox, cy, oy, c.ok);
      // лучи
      const ray = (pts, col, dash) => { g.strokeStyle = col; g.lineWidth = 1.8; g.setLineDash(dash ? [5, 5] : []); g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.setLineDash([]); };
      const far = 2000;
      // луч 1: параллельно оси → через фокус
      const dirY1 = st.hObj / F; // наклон после линзы (вниз для собирающей)
      ray([[ox, oy], [cx, oy], [cx + far, oy + dirY1 * far]], c.accent);
      // луч 2: через центр линзы
      const k2 = st.hObj / d;
      ray([[ox, oy], [cx + far, oy + k2 * (far + d)]], c.bad);
      const finite = isFinite(f);
      if (finite) {
        const ix = cx + f, iy = cy - hImg;
        if (f < 0) { // мнимое: продолжения лучей
          ray([[cx, oy], [ix, iy]], c.accent, true);
          ray([[ox, oy], [ix, iy]], c.bad, true);
        }
        if (Math.abs(f) < 3000 && Math.abs(hImg) < 2000) arrow(ix, cy, iy, c.chem, f < 0);
      }
      g.fillStyle = c.muted; g.textAlign = 'left'; g.fillText('Тяните зелёную стрелку (предмет) мышью или пальцем', 10, cv.h - 8);
      // показания (1 px = 1 мм → см)
      rD.set(fmt(1000 / F, 1));
      if (!finite) { rf.set('∞'); rG.set('∞'); rType.set('изображения нет — лучи параллельны (предмет в фокусе)'); }
      else {
        rf.set(fmt(f / 10, 1)); rG.set(fmt(Math.abs(G), 2));
        rType.set((f > 0 ? 'действительное, перевёрнутое' : 'мнимое, прямое') + ', ' + (Math.abs(G) > 1.02 ? 'увеличенное' : Math.abs(G) < 0.98 ? 'уменьшенное' : 'равное'));
      }
    };
    const dSlider = UI.slider('Расстояние до предмета d', { min: 20, max: 340, step: 1, value: st.d, unit: 'мм', dp: 0, onInput: v => { st.d = v; draw(); } });
    const pos = e => { const r = cv.canvas.getBoundingClientRect(); return (e.clientX - r.left) / r.width * cv.w; };
    cv.canvas.addEventListener('pointerdown', e => { dragging = true; cv.canvas.setPointerCapture(e.pointerId); });
    cv.canvas.addEventListener('pointermove', e => { if (!dragging) return; st.d = clamp(Math.round(cv.w / 2 - pos(e)), 20, 340); dSlider.set(st.d); draw(); });
    cv.canvas.addEventListener('pointerup', () => { dragging = false; });
    cv.canvas.style.touchAction = 'none';
    draw();
    const themeObs = new MutationObserver(draw);
    themeObs.observe(document.documentElement, { attributes: true });
    ctx.onCleanup(() => themeObs.disconnect());
    return labShell(cv.canvas, [
      UI.segmented([['conv', 'Собирающая'], ['div', 'Рассеивающая']], 'conv', v => { st.conv = v === 'conv'; draw(); }),
      labPanel('Параметры', dSlider,
        UI.slider('Фокусное расстояние F', { min: 40, max: 150, step: 1, value: st.F, unit: 'мм', dp: 0, onInput: v => { st.F = v; draw(); } }),
        UI.slider('Высота предмета', { min: 20, max: 120, step: 1, value: st.hObj, unit: 'мм', dp: 0, onInput: v => { st.hObj = v; draw(); } })),
      labPanel('Изображение', rf.el, rG.el, rType.el, rD.el),
      h('p', { class: 'small muted' }, 'Подвиньте предмет ближе фокуса — получится лупа (мнимое увеличенное изображение). За двойным фокусом — уменьшенное, как в глазу и фотоаппарате. Рассеивающая линза всегда даёт мнимое уменьшенное изображение.'),
    ]);
  },
});

// ---------- Идеальный газ ----------
defLab({
  id: 'gas', subject: 'phys', icon: '🎈', title: 'Идеальный газ',
  desc: 'Молекулы в цилиндре с поршнем: давление, объём, температура',
  render(ctx) {
    const st = { V: 1, T: 300, N: 60, lock: 'none' };
    const cv = hiDpiCanvas(720, 380);
    const parts = [];
    const spawn = n => { while (parts.length < n) { const a = Math.random() * Math.PI * 2; parts.push({ x: Math.random(), y: Math.random(), a }); } parts.length = n; };
    spawn(st.N);
        const rp = readout('Давление p', 'кПа'), rV = readout('Объём V', 'л'), rT = readout('Температура T', 'К'), rv = readout('Средняя скорость молекул', 'м/с');
    // p = νRT/V; 60 частиц на экране изображают 1 моль, объём — в долях 22,4 л
    const nu = () => st.N / 60;
    const pTheory = () => nu() * 8.31 * st.T / (st.V * 22.4e-3) / 1000;
    const draw = dt => {
      const g = cv.g, c = themeColors();
      g.clearRect(0, 0, cv.w, cv.h);
      const boxX = 40, boxY = 40, boxH = 300, maxW = 520;
      const W = maxW * st.V / 2;
      g.fillStyle = c.surface2; g.fillRect(boxX, boxY, W, boxH);
      g.strokeStyle = c.text; g.lineWidth = 4; g.strokeRect(boxX, boxY, W, boxH);
      // поршень
      g.fillStyle = c.muted; g.fillRect(boxX + W, boxY - 10, 16, boxH + 20); g.fillRect(boxX + W + 16, boxY + boxH / 2 - 6, 120, 12);
      // термометр
      const tH = clamp((st.T - 100) / 600, 0, 1) * 240;
      g.fillStyle = c.surface2; g.fillRect(cv.w - 40, 60, 16, 240);
      g.fillStyle = `hsl(${240 - tH}, 80%, 55%)`; g.fillRect(cv.w - 40, 300 - tH, 16, tH);
      g.fillStyle = c.text; g.font = '12px system-ui'; g.textAlign = 'center'; g.fillText(st.T + ' К', cv.w - 32, 320);
      const speed = Math.sqrt(st.T / 300) * 0.9;
      for (const p of parts) {
        p.x += Math.cos(p.a) * speed * dt * 300 / W;
        p.y += Math.sin(p.a) * speed * dt * 300 / boxH;
        if (p.x < 0) { p.x = -p.x; p.a = Math.PI - p.a; }
        if (p.x > 1) { p.x = 2 - p.x; p.a = Math.PI - p.a; }
        if (p.y < 0) { p.y = -p.y; p.a = -p.a; }
        if (p.y > 1) { p.y = 2 - p.y; p.a = -p.a; }
        const hot = Math.min(1, (st.T - 100) / 600);
        g.fillStyle = `hsl(${220 - hot * 220}, 75%, 50%)`;
        g.beginPath(); g.arc(boxX + 5 + p.x * (W - 10), boxY + 5 + p.y * (boxH - 10), 5, 0, Math.PI * 2); g.fill();
      }
      rp.set(fmt(pTheory(), 1)); rV.set(fmt(st.V * 22.4, 1)); rT.set(st.T); rv.set(fmt(Math.sqrt(3 * 8.31 * st.T / 0.029), 0) + ' (воздух)');
    };
    animate(ctx, draw);
    let sV, sT;
    const apply = (key, val) => {
      const p0 = pTheory();
      st[key] = val;
      if (st.lock !== 'p') return;
      // изобарный процесс: держим p = p0, подстраивая второй параметр
      if (key === 'T') { st.V = clamp(nu() * 8.31 * st.T / (p0 * 1000 * 22.4e-3), 0.3, 2); sV.set(st.V); }
      if (key === 'V') { st.T = clamp(Math.round(p0 * 1000 * st.V * 22.4e-3 / (nu() * 8.31)), 100, 700); sT.set(st.T); }
    };
    sV = UI.slider('Объём (доля от 22,4 л)', { min: 0.3, max: 2, step: 0.05, value: 1, unit: '', dp: 2, onInput: v => apply('V', v) });
    sT = UI.slider('Температура', { min: 100, max: 700, step: 10, value: 300, unit: 'К', dp: 0, onInput: v => apply('T', v) });
    return labShell(cv.canvas, [
      UI.segmented([['none', 'Свободно'], ['p', 'p = const']], 'none', v => { st.lock = v; }),
      labPanel('Параметры', sV, sT,
        UI.slider('Число молекул (модель)', { min: 10, max: 150, step: 5, value: 60, unit: '', dp: 0, onInput: v => { st.N = v; spawn(v); } })),
      labPanel('Показания', rp.el, rV.el, rT.el, rv.el),
      h('p', { class: 'small muted' }, 'Сожмите газ вдвое при той же температуре — удары о стенки участятся и давление вырастет вдвое (закон Бойля — Мариотта). Нагрейте — молекулы полетят быстрее. В режиме «p = const» объём сам растёт с температурой (закон Гей-Люссака).'),
    ]);
  },
});

// ---------- Радиоактивный распад ----------
defLab({
  id: 'decay', subject: 'phys', icon: '☢️', title: 'Радиоактивный распад',
  desc: 'Сотни ядер распадаются случайно, но вместе подчиняются закону полураспада',
  render(ctx) {
    const ISOS = [['¹⁸F (ПЭТ)', 110, 'мин'], ['⁹⁹ᵐTc (сцинтиграфия)', 6, 'ч'], ['¹³¹I (щитовидная железа)', 8, 'сут'], ['¹⁴C (датирование)', 5730, 'лет']];
    const N0 = 400;
    let iso = 0, atoms, t, history, running = true, speed = 1;
    const cv = hiDpiCanvas(720, 400);
    const rN = readout('Осталось ядер'), rt = readout('Прошло'), rHalf = readout('Периодов полураспада');
    const reset = () => { atoms = Array.from({ length: N0 }, () => true); t = 0; history = [[0, N0]]; };
    reset();
    const draw = dt => {
      const T = ISOS[iso][1];
      if (running) {
        const step = dt * speed * T / 3; // один период полураспада ≈ 3 секунды
        const p = 1 - Math.pow(2, -step / T);
        for (let i = 0; i < N0; i++) if (atoms[i] && Math.random() < p) atoms[i] = false;
        t += step;
        const left = atoms.filter(Boolean).length;
        history.push([t, left]);
        if (t > T * 6) running = false;
      }
      const g = cv.g, c = themeColors();
      g.clearRect(0, 0, cv.w, cv.h);
      const cols = 20;
      atoms.forEach((a, i) => {
        g.fillStyle = a ? c.accent : c.surface2;
        g.beginPath(); g.arc(20 + (i % cols) * 14, 30 + Math.floor(i / cols) * 17, 5.5, 0, Math.PI * 2); g.fill();
      });
      const theory = [];
      for (let k = 0; k <= 60; k++) { const tt = T * 6 * k / 60; theory.push([tt / T, N0 * Math.pow(2, -tt / T)]); }
      drawChart(g, { x: 340, y: 20, w: 360, h: 330 }, {
        xMin: 0, xMax: 6, yMin: 0, yMax: N0, xTicks: 6, yTicks: 4, xLabel: 't / T½', yLabel: 'N', fmtX: v => fmt(v, 0), fmtY: v => fmt(v, 0),
        marks: [{ y: N0 / 2, color: c.muted }, { y: N0 / 4, color: c.muted }],
        series: [{ points: theory, color: c.border, width: 2, dash: [5, 4] }, { points: history.map(([tt, n]) => [tt / T, n]), color: c.bad, width: 2.5, dot: true }],
      });
      const left = atoms.filter(Boolean).length;
      rN.set(`${left} из ${N0}`); rt.set(fmt(t, t < 10 ? 2 : 0) + ' ' + ISOS[iso][2]); rHalf.set(fmt(t / T, 2));
    };
    animate(ctx, draw);
    const sel = h('select', { 'aria-label': 'Изотоп', onchange: e => { iso = +e.target.value; reset(); running = true; } }, ISOS.map(([n, T, u], i) => h('option', { value: i }, `${n}: T½ = ${fmt(T)} ${u}`)));
    return labShell(cv.canvas, [
      labPanel('Опыт', h('label', { class: 'field' }, h('span', { class: 'label' }, 'Изотоп '), sel),
        UI.slider('Скорость', { min: 0.25, max: 3, step: 0.25, value: 1, unit: '×', dp: 2, onInput: v => { speed = v; } }),
        h('div', { class: 'row' },
          h('button', { class: 'btn', type: 'button', onclick: () => { running = !running; } }, '⏯ Пауза'),
          h('button', { class: 'btn primary', type: 'button', onclick: () => { reset(); running = true; } }, '↺ Заново'))),
      labPanel('Показания', rN.el, rt.el, rHalf.el),
      h('p', { class: 'small muted' }, 'Каждое ядро распадается случайно — предсказать, какое распадётся следующим, невозможно. Но за каждый период полураспада исчезает примерно половина оставшихся. Пунктир — теоретическая кривая N = N₀·2^(−t/T).'),
    ]);
  },
});

// ---------- Волны и звук ----------
defLab({
  id: 'waves', subject: 'phys', icon: '🌊', title: 'Сложение волн и звук',
  desc: 'Интерференция, биения — посмотрите и послушайте',
  render(ctx) {
    const st = { f1: 4, f2: 5, a1: 1, a2: 1, ph: 0 };
    const cv = hiDpiCanvas(720, 400);
    let audio = null;
    const stopAudio = () => { if (audio) { audio.oscs.forEach(o => { try { o.stop(); } catch (e) { /* уже остановлен */ } }); audio.ctx.close(); audio = null; } };
    ctx.onCleanup(stopAudio);
    const play = () => {
      stopAudio();
      try {
        const ac = new (window.AudioContext || window.webkitAudioContext)();
        const gain = ac.createGain(); gain.gain.value = 0.08; gain.connect(ac.destination);
        const mk = (f, a) => { const o = ac.createOscillator(); const g = ac.createGain(); g.gain.value = a; o.frequency.value = 220 + f * 20; o.connect(g).connect(gain); o.start(); return o; };
        audio = { ctx: ac, oscs: [mk(st.f1, st.a1), mk(st.f2, st.a2)] };
        setTimeout(stopAudio, 4000);
      } catch (e) { UI.toast('Звук недоступен в этом браузере', 'bad'); }
    };
    const draw = (dt, time) => {
      const g = cv.g, c = themeColors();
      g.clearRect(0, 0, cv.w, cv.h);
      const rows = [[st.a1, st.f1, 0, c.phys, 'волна 1'], [st.a2, st.f2, st.ph, c.chem, 'волна 2']];
      const H = 90;
      const wave = (y0, fn, col, label, width = 2.5) => {
        g.strokeStyle = c.grid; g.lineWidth = 1; g.beginPath(); g.moveTo(0, y0); g.lineTo(cv.w, y0); g.stroke();
        g.strokeStyle = col; g.lineWidth = width; g.beginPath();
        for (let x = 0; x <= cv.w; x += 2) { const y = y0 - fn(x / cv.w) * 35; x ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.stroke();
        g.fillStyle = c.muted; g.font = '12px system-ui'; g.fillText(label, 8, y0 - 40);
      };
      const tt = time * 0.5;
      const f1 = u => st.a1 * Math.sin(2 * Math.PI * (st.f1 * u - tt));
      const f2 = u => st.a2 * Math.sin(2 * Math.PI * (st.f2 * u - tt) + st.ph);
      wave(H * 0.6, f1, rows[0][3], `волна 1: ${st.f1} колебаний на экране`);
      wave(H * 1.7, f2, rows[1][3], `волна 2: ${st.f2} колебаний на экране`);
      wave(H * 3.2, u => (f1(u) + f2(u)) / 1.3, c.bad, 'сумма (интерференция)', 3);
    };
    animate(ctx, draw);
    return labShell(cv.canvas, [
      labPanel('Волна 1',
        UI.slider('Частота', { min: 1, max: 12, step: 0.5, value: 4, unit: '', dp: 1, onInput: v => { st.f1 = v; } }),
        UI.slider('Амплитуда', { min: 0, max: 1, step: 0.05, value: 1, unit: '', dp: 2, onInput: v => { st.a1 = v; } })),
      labPanel('Волна 2',
        UI.slider('Частота', { min: 1, max: 12, step: 0.5, value: 5, unit: '', dp: 1, onInput: v => { st.f2 = v; } }),
        UI.slider('Амплитуда', { min: 0, max: 1, step: 0.05, value: 1, unit: '', dp: 2, onInput: v => { st.a2 = v; } }),
        UI.slider('Сдвиг фазы', { min: 0, max: 6.28, step: 0.1, value: 0, unit: 'рад', dp: 1, onInput: v => { st.ph = v; } })),
      h('button', { class: 'btn primary', type: 'button', onclick: play }, '🔊 Послушать (4 с)'),
      h('p', { class: 'small muted' }, 'Одинаковые частоты и сдвиг фазы π (≈ 3,1) — волны гасят друг друга: так работают наушники с шумоподавлением. Близкие частоты дают биения — громкость пульсирует. По биениям настраивают музыкальные инструменты.'),
    ]);
  },
});
