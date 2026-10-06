// Лаборатории по химии.

// ---------- Таблица Менделеева ----------
function elementPos(e) {
  if (e.cat === 'la') return { row: 9, col: e.z - 57 + 3 };
  if (e.cat === 'ac') return { row: 10, col: e.z - 89 + 3 };
  return { row: e.period, col: e.group };
}

function elementBlock(e) {
  if (e.cat === 'la' || e.cat === 'ac') return 'f';
  if (e.group <= 2 || e.z === 2) return 's';
  if (e.group >= 13) return 'p';
  return 'd';
}

function enColor(en) {
  if (en == null) return 'var(--surface-2)';
  const t = clamp((en - 0.7) / (4 - 0.7), 0, 1);
  return `hsl(${220 - t * 220}, 70%, ${70 - t * 15}%)`;
}

function elementColor(e, mode) {
  if (mode === 'cat') return CATEGORIES[e.cat].color;
  if (mode === 'en') return enColor(e.en);
  if (mode === 'state') return { s: '#b0bec5', l: '#4fc3f7', g: '#ffd54f' }[e.state];
  if (mode === 'block') return { s: '#ff8a80', p: '#ffd180', d: '#80d8ff', f: '#b9f6ca' }[elementBlock(e)];
  if (mode === 'bio') return ELEMENT_NOTES[e.sym] ? '#81c784' : 'var(--surface-2)';
  return '#ccc';
}

function elementDetails(e) {
  const box = h('div', { class: 'el-detail' });
  add(box, 
    h('div', { class: 'el-detail-head' },
      h('div', { class: 'el-big', style: { background: CATEGORIES[e.cat].color } },
        h('div', { class: 'el-big-z' }, e.z), h('div', { class: 'el-big-sym' }, e.sym), h('div', { class: 'el-big-mass' }, fmt(e.mass, 3))),
      h('div', null,
        h('h2', null, e.name),
        h('div', { class: 'muted small' }, CATEGORIES[e.cat].name),
        h('div', { class: 'small' }, `Период ${e.period}, ${e.cat === 'la' || e.cat === 'ac' ? 'f-элемент' : 'группа ' + e.group}`))),
    h('table', { class: 'kv' }, h('tbody', null,
      h('tr', null, h('td', null, 'Атомная масса'), h('td', null, fmt(e.mass, 3) + (e.z < 100 ? ` (в задачах — ${fmt(schoolMass(e.sym))})` : ''))),
      h('tr', null, h('td', null, 'Протоны / электроны'), h('td', null, e.z)),
      h('tr', null, h('td', null, 'Электроотрицательность'), h('td', null, e.en != null ? fmt(e.en, 2) : '—')),
      h('tr', null, h('td', null, 'Состояние (н. у.)'), h('td', null, STATES[e.state])),
      e.z <= 103 ? h('tr', null, h('td', null, 'Электронная формула'), h('td', null, configShort(e.z))) : null,
      e.z <= 103 ? h('tr', null, h('td', null, 'Электроны по слоям'), h('td', null, shells(e.z).join(', '))) : null)),
    e.z <= 54 ? h('div', { class: 'center' }, bohrSvg(e.z, { size: 190 })) : null,
    ELEMENT_NOTES[e.sym] ? h('div', { class: 'callout med' }, h('div', { class: 'callout-label' }, '🩺 В живом и в медицине'), h('div', { html: rich(ELEMENT_NOTES[e.sym]) })) : null);
  return box;
}

defLab({
  id: 'periodic', subject: 'chem', icon: '🧱', title: 'Таблица Менделеева',
  desc: 'Все 118 элементов: строение атома, электроотрицательность, роль в организме',
  render() {
    let mode = 'cat', query = '';
    const grid = h('div', { class: 'ptable' });
    const detail = h('div', { class: 'card ptable-detail' }, h('p', { class: 'muted' }, 'Нажмите на элемент, чтобы увидеть подробности.'));
    const legend = h('div', { class: 'ptable-legend' });
    const cells = [];
    for (const e of ELEMENTS) {
      const { row, col } = elementPos(e);
      const cell = h('button', {
        type: 'button', class: 'el', style: { gridRow: row, gridColumn: col }, title: e.name,
        onclick: () => { cells.forEach(c => c.classList.remove('sel')); cell.classList.add('sel'); detail.innerHTML = ''; detail.appendChild(elementDetails(e)); if (innerWidth < 900) detail.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
      }, h('span', { class: 'el-z' }, e.z), h('span', { class: 'el-sym' }, e.sym), h('span', { class: 'el-name' }, e.name));
      cell.el = e;
      cells.push(cell);
      grid.appendChild(cell);
    }
    grid.appendChild(h('div', { class: 'el-gap', style: { gridRow: 6, gridColumn: 3 } }, '57–71'));
    grid.appendChild(h('div', { class: 'el-gap', style: { gridRow: 7, gridColumn: 3 } }, '89–103'));
    grid.appendChild(h('div', { class: 'el-spacer', style: { gridRow: 8, gridColumn: '1 / 19' } }));

    const paint = () => {
      const q = query.trim().toLowerCase();
      for (const c of cells) {
        c.style.background = elementColor(c.el, mode);
        const hit = !q || c.el.sym.toLowerCase() === q || c.el.name.toLowerCase().includes(q) || String(c.el.z) === q;
        c.classList.toggle('dim', !hit);
      }
      legend.innerHTML = '';
      if (mode === 'cat') for (const [, v] of Object.entries(CATEGORIES)) legend.appendChild(h('span', { class: 'leg' }, h('i', { style: { background: v.color } }), v.name));
      if (mode === 'en') legend.append(h('span', { class: 'leg' }, h('i', { style: { background: enColor(0.8) } }), 'низкая (металлы)'), h('span', { class: 'leg' }, h('i', { style: { background: enColor(2.3) } }), 'средняя'), h('span', { class: 'leg' }, h('i', { style: { background: enColor(3.9) } }), 'высокая (F, O)'));
      if (mode === 'state') legend.append(...[['#b0bec5', 'твёрдые'], ['#4fc3f7', 'жидкие (Br, Hg)'], ['#ffd54f', 'газы']].map(([c, t]) => h('span', { class: 'leg' }, h('i', { style: { background: c } }), t)));
      if (mode === 'block') legend.append(...[['#ff8a80', 's-элементы'], ['#ffd180', 'p-элементы'], ['#80d8ff', 'd-элементы'], ['#b9f6ca', 'f-элементы']].map(([c, t]) => h('span', { class: 'leg' }, h('i', { style: { background: c } }), t)));
      if (mode === 'bio') legend.append(h('span', { class: 'leg' }, h('i', { style: { background: '#81c784' } }), 'важны для организма или медицины'));
    };
    const search = h('input', { type: 'search', class: 'search', placeholder: 'Поиск: символ, название или номер', oninput: e => { query = e.target.value; paint(); } });
    paint();
    return h('div', null,
      h('div', { class: 'row' }, UI.segmented([['cat', 'Категории'], ['en', 'Электроотрицательность'], ['block', 'Блоки s/p/d/f'], ['state', 'Состояние'], ['bio', 'Биология']], mode, v => { mode = v; paint(); }), search),
      legend,
      h('div', { class: 'ptable-wrap' }, h('div', { class: 'ptable-scroll' }, grid), detail));
  },
});

// ---------- Конструктор атома ----------
const ATOM_TASKS = [
  { text: 'Соберите атом водорода-1', p: 1, n: 0, e: 1 },
  { text: 'Соберите атом гелия-4', p: 2, n: 2, e: 2 },
  { text: 'Соберите атом углерода-12', p: 6, n: 6, e: 6 },
  { text: 'Соберите радиоактивный углерод-14', p: 6, n: 8, e: 6 },
  { text: 'Соберите дейтерий (водород-2)', p: 1, n: 1, e: 1 },
  { text: 'Соберите ион натрия Na⁺ (²³Na)', p: 11, n: 12, e: 10 },
  { text: 'Соберите ион фтора F⁻ (¹⁹F)', p: 9, n: 10, e: 10 },
  { text: 'Соберите атом кислорода-16', p: 8, n: 8, e: 8 },
  { text: 'Соберите ион магния Mg²⁺ (²⁴Mg)', p: 12, n: 12, e: 10 },
  { text: 'Соберите ион хлора Cl⁻ (³⁵Cl)', p: 17, n: 18, e: 18 },
];

defLab({
  id: 'atom', subject: 'chem', icon: '⚛️', title: 'Конструктор атома',
  desc: 'Добавляйте протоны, нейтроны и электроны: элемент, изотоп, ион, устойчивость',
  render() {
    const st = { p: 1, n: 0, e: 1 };
    let task = 0;
    const view = h('div', { class: 'atom-view' });
    const info = h('div', { class: 'atom-info' });
    const taskBox = h('div', { class: 'callout key' });
    const counter = (key, label, color) => {
      const val = h('b', { class: 'cnt-val' });
      const box = h('div', { class: 'counter' },
        h('span', { class: 'cnt-dot', style: { background: color } }),
        h('span', { class: 'cnt-label' }, label),
        h('button', { class: 'btn small', type: 'button', onclick: () => { if (st[key] > 0) { st[key]--; draw(); } } }, '−'),
        val,
        h('button', { class: 'btn small', type: 'button', onclick: () => { if (st[key] < 36) { st[key]++; draw(); } } }, '+'));
      box.val = val;
      return box;
    };
    const cP = counter('p', 'Протоны', 'var(--bad)'), cN = counter('n', 'Нейтроны', 'var(--muted)'), cE = counter('e', 'Электроны', 'var(--phys)');

    const drawNucleus = () => {
      const size = 280, cx = 140, cy = 140;
      const sh = st.e ? shells(Math.min(st.e, 36)) : [];
      // электроны по слоям — по правилу заполнения для заданного числа электронов
      const svg = bohrSvg(Math.max(1, st.e), { size, shells: sh, nucleus: '' });
      // заменяем ядро на «шарики» протонов и нейтронов
      const nuc = s('g');
      const total = st.p + st.n;
      const parts = shuffleSeeded([...Array(st.p).fill('p'), ...Array(st.n).fill('n')]);
      parts.forEach((t, i) => {
        const r = 3.2 * Math.sqrt(i + 0.5);
        const a = i * 2.39996;
        nuc.appendChild(s('circle', { cx: cx + r * Math.cos(a), cy: cy + r * Math.sin(a), r: 5.5, fill: t === 'p' ? 'var(--bad)' : 'var(--muted)', stroke: 'var(--surface)', 'stroke-width': 1 }));
      });
      svg.querySelector('circle').setAttribute('r', Math.max(10, 3.2 * Math.sqrt(total) + 6));
      svg.querySelector('circle').setAttribute('fill', 'none');
      svg.querySelector('text').remove();
      svg.appendChild(nuc);
      return svg;
    };

    const draw = () => {
      cP.val.textContent = st.p; cN.val.textContent = st.n; cE.val.textContent = st.e;
      view.innerHTML = '';
      view.appendChild(drawNucleus());
      info.innerHTML = '';
      const A = st.p + st.n, q = st.p - st.e;
      if (st.p === 0) {
        info.appendChild(h('p', { class: 'muted' }, st.n ? 'Без протонов это не атом, а свободные нейтроны.' : 'Добавьте протон — его число определяет элемент.'));
      } else {
        const el = ELEMENTS[st.p - 1];
        const chg = q === 0 ? '' : (Math.abs(q) > 1 ? Math.abs(q) : '') + (q > 0 ? '+' : '−');
        const stable = STABLE_ISOTOPES[st.p];
        const radio = RADIO_ISOTOPES[st.p + '-' + A];
        let status;
        if (stable && stable.includes(A)) status = h('span', { class: 'ok-text' }, '✓ устойчивый изотоп');
        else if (radio) status = h('span', { class: 'bad-text' }, '☢ радиоактивный: ' + radio);
        else if (stable) status = h('span', { class: 'bad-text' }, '✗ неустойчивое ядро (нейтронов ' + (st.n < A - st.n ? 'мало' : 'много') + ' для этого элемента)');
        else status = h('span', { class: 'muted' }, 'данные об устойчивости — для Z ≤ 20');
        info.append(
          h('div', { class: 'atom-notation' },
            h('span', { class: 'iso' }, h('sup', null, A), h('sub', null, st.p)),
            h('span', { class: 'iso-sym' }, el.sym), chg ? h('sup', { class: 'iso-chg' }, chg) : null),
          h('h3', null, el.name + (q === 0 ? '' : q > 0 ? ' — катион' : ' — анион')),
          h('table', { class: 'kv' }, h('tbody', null,
            h('tr', null, h('td', null, 'Массовое число A = p + n'), h('td', null, A)),
            h('tr', null, h('td', null, 'Заряд частицы'), h('td', null, q > 0 ? '+' + q : q)),
            h('tr', null, h('td', null, 'Электроны по слоям'), h('td', null, st.e ? shells(Math.min(st.e, 36)).join(', ') : '—')))),
          h('p', null, status));
      }
      const t = ATOM_TASKS[task];
      taskBox.innerHTML = '';
      if (t) {
        const ok = st.p === t.p && st.n === t.n && st.e === t.e;
        taskBox.append(h('div', { class: 'callout-label' }, `🎯 Задание ${task + 1} из ${ATOM_TASKS.length}`), h('div', null, t.text));
        if (ok) {
          SFX.correct();
          Store.addXp(5);
          taskBox.appendChild(h('div', { class: 'ok-text' }, '✓ Верно!'));
          taskBox.appendChild(h('button', { class: 'btn small primary', type: 'button', onclick: () => { task++; draw(); } }, 'Следующее задание'));
        }
      } else taskBox.append(h('div', { class: 'callout-label' }, '🏆 Все задания выполнены!'), h('div', null, 'Экспериментируйте свободно.'));
    };
    draw();
    return labShell(view, [labPanel('Частицы', cP, cN, cE), taskBox, info]);
  },
});

// Детерминированное «перемешивание», чтобы ядро не мерцало при перерисовке
function shuffleSeeded(arr) {
  const a = arr.slice();
  let seed = 7;
  for (let i = a.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor(seed / 233280 * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Химический калькулятор ----------
defLab({
  id: 'calculator', subject: 'chem', icon: '🧮', title: 'Химический калькулятор',
  desc: 'Уравнивание любых реакций, молярная масса и состав вещества',
  render() {
    const out = h('div', { class: 'calc-out' });
    const eqInput = h('input', { type: 'text', class: 'answer-input left', value: 'KMnO4 + HCl = KCl + MnCl2 + Cl2 + H2O', spellcheck: 'false', 'aria-label': 'Уравнение реакции' });
    const doBalance = () => {
      out.innerHTML = '';
      try {
        const res = balance(eqInput.value);
        const species = [...res.reactants, ...res.products];
        const els = [...new Set(species.flatMap(sp => Object.keys(parseFormula(sp))))];
        const count = (list, off) => els.map(el => list.reduce((a, sp, i) => a + (parseFormula(sp)[el] || 0) * res.coeffs[i + off], 0));
        const L = count(res.reactants, 0), R = count(res.products, res.reactants.length);
        out.append(
          h('div', { class: 'big-eq', html: formatEquation(res) }),
          h('div', { class: 'table-wrap' }, h('table', { class: 'data-table' },
            h('thead', null, h('tr', null, h('th', null, 'Элемент'), h('th', null, 'Слева'), h('th', null, 'Справа'))),
            h('tbody', null, els.map((el, i) => h('tr', null, h('td', null, el), h('td', null, L[i]), h('td', { class: L[i] === R[i] ? 'ok-text' : 'bad-text' }, R[i])))))),
          h('div', { class: 'small muted' }, 'Массы: ' + species.map((sp, i) => `${res.coeffs[i]}·${fmt(molarMass(sp))}`).join(' | ') + ' г/моль'));
      } catch (e) { out.appendChild(h('div', { class: 'bad-text' }, e.message)); }
    };
    eqInput.addEventListener('keydown', e => { if (e.key === 'Enter') doBalance(); });
    const examples = ['Fe + O2 = Fe2O3', 'C6H12O6 + O2 = CO2 + H2O', 'Cu + HNO3 = Cu(NO3)2 + NO + H2O', 'Al + H2SO4 = Al2(SO4)3 + H2', 'Ca3(PO4)2 + SiO2 + C = CaSiO3 + P + CO', 'MnO4^- + H^+ + Fe^2+ = Mn^2+ + Fe^3+ + H2O'];

    const mmOut = h('div', { class: 'calc-out' });
    const mmInput = h('input', { type: 'text', class: 'answer-input left', value: 'C6H12O6', spellcheck: 'false', 'aria-label': 'Формула вещества' });
    const doMass = () => {
      mmOut.innerHTML = '';
      try {
        const f = mmInput.value.trim();
        const counts = parseFormula(f);
        const M = molarMass(f);
        const colors = ['var(--chem)', 'var(--phys)', 'var(--bio)', 'var(--accent)', 'var(--bad)', 'var(--muted)'];
        const parts = Object.entries(counts).map(([el, n], i) => ({ el, n, w: schoolMass(el) * n / M, c: colors[i % colors.length] }));
        mmOut.append(
          h('div', { class: 'big-eq', html: chem(f) + ' : <b>' + fmt(M) + ' г/моль</b>' }),
          h('div', { class: 'small muted' }, molarMassSteps(f)),
          h('div', { class: 'stack-bar' }, parts.map(p => h('div', { style: { width: p.w * 100 + '%', background: p.c }, title: p.el }, p.w > 0.08 ? p.el : ''))),
          h('div', { class: 'table-wrap' }, h('table', { class: 'data-table' },
            h('thead', null, h('tr', null, h('th', null, 'Элемент'), h('th', null, 'Атомов'), h('th', null, 'Aᵣ'), h('th', null, 'ω, %'))),
            h('tbody', null, parts.map(p => h('tr', null, h('td', null, h('i', { class: 'dot', style: { background: p.c } }), ' ', EL[p.el].name), h('td', null, p.n), h('td', null, fmt(schoolMass(p.el))), h('td', null, fmt(p.w * 100, 2))))))));
      } catch (e) { mmOut.appendChild(h('div', { class: 'bad-text' }, e.message)); }
    };
    mmInput.addEventListener('keydown', e => { if (e.key === 'Enter') doMass(); });
    doBalance(); doMass();
    return h('div', { class: 'calc-grid' },
      h('div', { class: 'card' },
        h('h2', null, '⚖️ Уравнять реакцию'),
        h('p', { class: 'muted small' }, 'Пишите формулы латиницей, реагенты и продукты разделяйте знаком «=». Ионы: Fe^3+, SO4^2-.'),
        h('div', { class: 'row' }, eqInput, h('button', { class: 'btn primary', type: 'button', onclick: doBalance }, 'Уравнять')),
        h('div', { class: 'chips' }, examples.map(x => h('button', { class: 'chip', type: 'button', onclick: () => { eqInput.value = x; doBalance(); } }, h('span', { html: chem(x.split(' = ')[0]) + ' → …' })))),
        out),
      h('div', { class: 'card' },
        h('h2', null, '⚗️ Молярная масса'),
        h('p', { class: 'muted small' }, 'Скобки и кристаллогидраты поддерживаются: Ca(OH)2, CuSO4*5H2O.'),
        h('div', { class: 'row' }, mmInput, h('button', { class: 'btn primary', type: 'button', onclick: doMass }, 'Рассчитать')),
        h('div', { class: 'chips' }, ['H2SO4', 'Ca3(PO4)2', 'CuSO4*5H2O', 'C12H22O11', 'NaHCO3', 'C9H8O4'].map(x => h('button', { class: 'chip', type: 'button', onclick: () => { mmInput.value = x; doMass(); } }, h('span', { html: chem(x) })))),
        mmOut));
  },
});

// ---------- Титрование и pH ----------
const PH_SAMPLES = [
  ['Желудочный сок', 1.5], ['Лимонный сок', 2.4], ['Кола', 2.5], ['Уксус столовый', 2.9], ['Кофе', 5], ['Кожа', 5.5],
  ['Моча (в среднем)', 6], ['Слюна', 6.8], ['Чистая вода', 7], ['Кровь', 7.4], ['Сок поджелудочной железы', 8.1],
  ['Морская вода', 8.1], ['Пищевая сода (р-р)', 8.3], ['Хозяйственное мыло', 10.5], ['Нашатырный спирт', 11.6], ['Отбеливатель', 12.5],
];

defLab({
  id: 'ph', subject: 'chem', icon: '🧪', title: 'Титрование и pH',
  desc: 'Добавляйте щёлочь к кислоте: кривая титрования и цвет индикаторов',
  render(ctx) {
    const Va = 25, ca = 0.1;
    let cb = 0.1, Vb = 0, ind = 1;
    const cv = hiDpiCanvas(640, 360);
    const pHOf = v => {
      const na = ca * Va / 1000, nb = cb * v / 1000, Vt = (Va + v) / 1000;
      if (Math.abs(na - nb) < 1e-12) return 7;
      if (na > nb) return -Math.log10((na - nb) / Vt);
      return 14 + Math.log10((nb - na) / Vt);
    };
    // Коническая колба: стенки поверх жидкости
    const liquid = s('path', { d: 'M22 150 L52 82 L88 82 L118 150 Z', fill: '#f7f7f7' });
    const label = s('text', { x: 70, y: 132, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 900, fill: '#1c2033' });
    const flask = s('svg', { viewBox: '0 0 140 160', width: 130, height: 150, class: 'flask-svg', role: 'img', 'aria-label': 'Колба с раствором' },
      liquid,
      s('path', { d: 'M54 6 L54 60 L14 152 Q12 156 18 156 L122 156 Q128 156 126 152 L86 60 L86 6', fill: 'none', stroke: 'var(--muted)', 'stroke-width': 4, 'stroke-linejoin': 'round' }),
      s('line', { x1: 48, y1: 6, x2: 92, y2: 6, stroke: 'var(--muted)', 'stroke-width': 4, 'stroke-linecap': 'round' }),
      label);
    const rpH = readout('pH'), rV = readout('Добавлено NaOH', 'мл'), rCol = readout('Цвет индикатора');
    const indSel = h('select', { 'aria-label': 'Индикатор', onchange: e => { ind = +e.target.value; draw(); } },
      INDICATORS.map((x, i) => h('option', { value: i, selected: i === ind }, x.name)), h('option', { value: -1 }, 'Универсальный'));
    const slider = UI.slider('Объём NaOH (0,1 М)', { min: 0, max: 50, step: 0.1, value: 0, unit: 'мл', dp: 1, onInput: v => { Vb = v; draw(); } });
    const cbSlider = UI.slider('Концентрация NaOH', { min: 0.05, max: 0.2, step: 0.05, value: 0.1, unit: 'М', dp: 2, onInput: v => { cb = v; draw(); } });
    const draw = () => {
      const pH = pHOf(Vb);
      const col = ind < 0 ? { color: universalColor(pH), name: '—' } : indicatorColor(INDICATORS[ind], pH);
      liquid.setAttribute('fill', col.color);
      label.textContent = 'pH ' + fmt(pH, 2);
      rpH.set(fmt(pH, 2) + (pH < 6.95 ? ' — кислая' : pH > 7.05 ? ' — щелочная' : ' — нейтральная'));
      rV.set(fmt(Vb, 1)); rCol.set(col.name);
      const g = cv.g, c = themeColors();
      g.clearRect(0, 0, cv.w, cv.h);
      const pts = [];
      for (let v = 0; v <= 50; v += 0.25) pts.push([v, pHOf(v)]);
      const cur = [];
      for (let v = 0; v <= Vb; v += 0.25) cur.push([v, pHOf(v)]);
      cur.push([Vb, pH]);
      const eqV = ca * Va / cb;
      drawChart(g, { x: 46, y: 16, w: cv.w - 64, h: cv.h - 50 }, {
        xMin: 0, xMax: 50, yMin: 0, yMax: 14, xTicks: 5, yTicks: 7, xLabel: 'V(NaOH), мл', yLabel: 'pH', fmtY: v => fmt(v, 0), fmtX: v => fmt(v, 0),
        marks: [{ y: 7, color: c.ok }, eqV <= 50 ? { x: eqV, color: c.accent } : null].filter(Boolean),
        series: [{ points: pts, color: c.border, width: 2, dash: [5, 4] }, { points: cur, color: c.chem, width: 3, dot: true }],
      });
    };
    draw();
    const scale = h('div', { class: 'ph-scale' }, PH_SAMPLES.map(([n, p]) => h('div', { class: 'ph-item', style: { left: (p / 14) * 100 + '%' }, title: n + ': pH ' + fmt(p) }, h('span', { class: 'ph-dot', style: { background: universalColor(p) } }), h('span', { class: 'ph-name' }, n))));
    return h('div', null,
      labShell(cv.canvas, [
        h('div', { class: 'row center' }, flask),
        labPanel('Управление', slider, cbSlider, h('label', { class: 'field' }, h('span', { class: 'label' }, 'Индикатор '), indSel),
          h('div', { class: 'row' },
            h('button', { class: 'btn small', type: 'button', onclick: () => { Vb = Math.min(50, Vb + 1); slider.set(Vb); draw(); } }, '+1 мл'),
            h('button', { class: 'btn small', type: 'button', onclick: () => { Vb = Math.min(50, Vb + 0.1); slider.set(Vb); draw(); } }, '+1 капля'),
            h('button', { class: 'btn small', type: 'button', onclick: () => { Vb = 0; slider.set(0); draw(); } }, 'Сброс'))),
        labPanel('Показания', rpH.el, rV.el, rCol.el),
        h('p', { class: 'small muted' }, `В колбе 25 мл HCl 0,1 М. Точка эквивалентности — когда моли щёлочи равны молям кислоты. Обратите внимание на скачок pH вблизи неё: одна капля меняет pH на несколько единиц — поэтому индикатор меняет цвет резко.`),
      ]),
      h('div', { class: 'card' }, h('h3', null, 'Шкала pH знакомых растворов'), h('div', { class: 'ph-gradient' }), scale));
  },
});

// ---------- Осмос и эритроциты ----------
defLab({
  id: 'osmosis', subject: 'chem', icon: '🔴', title: 'Осмос и эритроциты',
  desc: 'Что происходит с клетками крови в гипо-, изо- и гипертонических растворах',
  render(ctx) {
    let w = 0.9;
    const svg = s('svg', { viewBox: '0 0 400 260', class: 'osmo-svg', role: 'img', 'aria-label': 'Эритроциты в растворе' });
    const rConc = readout('Концентрация NaCl', '%'), rOsm = readout('Осмолярность', 'мосм/л'), rType = readout('Раствор');
    const text = h('div', { class: 'callout' });
    const cellPath = (cx, cy, k) => {
      // k < 1 — сморщивание (зубчатый край), k = 1 — двояковогнутый диск, k > 1 — набухание до шара
      const pts = [];
      const N = 48;
      for (let i = 0; i <= N; i++) {
        const a = (i / N) * Math.PI * 2;
        let r = 34 * Math.min(k, 1.25);
        if (k < 1) r *= 1 + (1 - k) * 0.35 * Math.sin(a * 10) - (1 - k) * 0.25;
        const rx = r * (k > 1 ? 1 : 1.25), ry = r * (k > 1 ? 1 : 1.25);
        pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
      }
      return 'M' + pts.map(p => p.map(v => v.toFixed(1)).join(',')).join('L') + 'Z';
    };
    const draw = (t = 0) => {
      svg.innerHTML = '';
      const osm = Math.round(2 * (w * 10 / 58.5) * 1000 * 0.93);
      const k = w >= 0.9 ? 1 - Math.min(0.6, (w - 0.9) * 0.45) : 1 + Math.min(0.5, (0.9 - w) * 0.9);
      const burst = w < 0.45;
      svg.appendChild(s('rect', { x: 0, y: 0, width: 400, height: 260, rx: 16, fill: w > 0.9 ? 'rgba(255,193,7,.12)' : w < 0.9 ? 'rgba(33,150,243,.10)' : 'rgba(76,175,80,.10)' }));
      const positions = [[90, 90], [210, 70], [320, 110], [140, 190], [270, 190]];
      positions.forEach(([x, y], i) => {
        const wob = Math.sin(t * 1.5 + i) * 3;
        if (burst) {
          svg.appendChild(s('circle', { cx: x + wob, cy: y, r: 40, fill: 'none', stroke: '#d32f2f', 'stroke-width': 1.5, 'stroke-dasharray': '4 6', opacity: 0.6 }));
          svg.appendChild(s('circle', { cx: x + wob, cy: y, r: 46, fill: 'rgba(211,47,47,.12)' }));
        } else {
          svg.appendChild(s('path', { d: cellPath(x + wob, y, k), fill: '#e53935', stroke: '#b71c1c', 'stroke-width': 2 }));
          if (k >= 0.95 && k <= 1.05) svg.appendChild(s('ellipse', { cx: x + wob, cy: y, rx: 18, ry: 16, fill: '#ef5350', opacity: 0.8 }));
        }
        // стрелки воды
        if (Math.abs(w - 0.9) > 0.05 && !burst) {
          const inward = w < 0.9;
          for (let j = 0; j < 4; j++) {
            const a = j * Math.PI / 2 + 0.6;
            const r1 = inward ? 62 : 44, r2 = inward ? 48 : 60;
            svg.appendChild(s('line', { x1: x + wob + r1 * Math.cos(a), y1: y + r1 * Math.sin(a), x2: x + wob + r2 * Math.cos(a), y2: y + r2 * Math.sin(a), stroke: '#1e88e5', 'stroke-width': 2, 'marker-end': 'url(#arr)' }));
          }
        }
      });
      svg.appendChild(s('defs', null, s('marker', { id: 'arr', viewBox: '0 0 10 10', refX: 6, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' }, s('path', { d: 'M0,0 L10,5 L0,10 z', fill: '#1e88e5' }))));
      rConc.set(fmt(w, 2)); rOsm.set(osm);
      const type = Math.abs(w - 0.9) <= 0.05 ? 'изотонический' : w < 0.9 ? 'гипотонический' : 'гипертонический';
      rType.set(type);
      text.className = 'callout ' + (type === 'изотонический' ? 'key' : 'warn');
      text.innerHTML = type === 'изотонический'
        ? '<b>Изотонический раствор.</b> Концентрации снаружи и внутри клетки равны — вода входит и выходит поровну, эритроциты сохраняют форму двояковогнутого диска. Так действует физраствор 0,9 % NaCl.'
        : type === 'гипотонический'
          ? (burst ? '<b>Гемолиз!</b> Вода продолжает поступать в клетки, мембрана разрывается, гемоглобин выходит в раствор («лаковая кровь»). Поэтому нельзя вводить в вену чистую воду.' : '<b>Гипотонический раствор.</b> Снаружи частиц меньше, чем в клетке, — вода по осмосу входит внутрь, эритроциты набухают и становятся шарообразными.')
          : '<b>Гипертонический раствор.</b> Снаружи частиц больше — вода выходит из клеток, эритроциты сморщиваются и приобретают зубчатый край (эхиноциты). На этом основано действие гипертонических повязок.';
    };
    const slider = UI.slider('Концентрация NaCl, %', { min: 0, max: 3, step: 0.05, value: 0.9, unit: '%', dp: 2, onInput: v => { w = v; } });
    animate(ctx, (dt, t) => draw(t));
    return labShell(svg, [
      labPanel('Раствор', slider,
        h('div', { class: 'row' }, [['Вода', 0], ['0,45 %', 0.45], ['0,9 %', 0.9], ['3 %', 3]].map(([l, v]) => h('button', { class: 'btn small', type: 'button', onclick: () => { w = v; slider.set(v); } }, l)))),
      labPanel('Показания', rConc.el, rOsm.el, rType.el),
      text,
      h('p', { class: 'small muted' }, 'Осмолярность плазмы ≈ 285–295 мосм/л. Расчёт для NaCl: каждая формульная единица даёт два иона, коэффициент активности ≈ 0,93.'),
    ]);
  },
});
