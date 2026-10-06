// Лаборатории по биологии.

// ---------- Клетка ----------
const ORGANELLES = {
  membrane: ['Плазматическая мембрана', 'Двойной слой фосфолипидов с белками. Отделяет клетку от среды, избирательно пропускает вещества, несёт рецепторы.'],
  nucleus: ['Ядро', 'Двумембранный органоид с порами. Хранит ДНК (хроматин), здесь идёт репликация и транскрипция. Управляет жизнью клетки.'],
  nucleolus: ['Ядрышко', 'Участок ядра без мембраны: синтез рРНК и сборка субъединиц рибосом.'],
  mito: ['Митохондрия', 'Двумембранный органоид с кристами. Кислородный этап дыхания и синтез АТФ — «энергостанция» клетки. Своя кольцевая ДНК, наследуется по материнской линии.'],
  rer: ['Шероховатая ЭПС', 'Система мембранных каналов с рибосомами. Синтез белков на экспорт и мембранных белков.'],
  ser: ['Гладкая ЭПС', 'Каналы без рибосом. Синтез липидов и стероидов, обезвреживание ядов и лекарств (особенно в печени), запас Ca²⁺ в мышцах.'],
  golgi: ['Комплекс Гольджи', 'Стопка уплощённых цистерн. Модифицирует, сортирует и упаковывает вещества в пузырьки; образует лизосомы.'],
  lyso: ['Лизосома', 'Пузырёк с пищеварительными ферментами. Переваривает поглощённые частицы и отслужившие органоиды (аутофагия).'],
  ribo: ['Рибосомы', 'Немембранные органоиды из рРНК и белка. Синтез белка (трансляция). Свободные и прикреплённые к ЭПС.'],
  centro: ['Клеточный центр', 'Две центриоли из микротрубочек. Формирует веретено деления. У высших растений отсутствует.'],
  wall: ['Клеточная стенка', 'Жёсткая оболочка из целлюлозы снаружи от мембраны. Опора и защита растительной клетки.'],
  vacuole: ['Центральная вакуоль', 'Крупный пузырь с клеточным соком. Поддерживает тургор, запасает вещества, накапливает отходы.'],
  chloro: ['Хлоропласт', 'Двумембранная пластида с тилакоидами (граны). Фотосинтез. Своя ДНК и рибосомы.'],
  cyto: ['Цитоплазма', 'Внутренняя среда клетки (гиалоплазма) с органоидами и цитоскелетом. Здесь идёт гликолиз.'],
};

function cellSvg(kind, onPick) {
  const svg = s('svg', { viewBox: '0 0 520 380', class: 'cell-svg', role: 'img', 'aria-label': kind === 'plant' ? 'Растительная клетка' : 'Животная клетка' });
  const part = (id, el) => {
    el.setAttribute('data-part', id);
    el.classList.add('cell-part');
    el.addEventListener('click', e => { e.stopPropagation(); onPick(id, el); });
    return el;
  };
  const g = (...children) => s('g', null, ...children);
  if (kind === 'plant') {
    svg.append(
      part('wall', s('rect', { x: 20, y: 20, width: 480, height: 340, rx: 18, fill: '#c5e1a5', stroke: '#689f38', 'stroke-width': 10 })),
      part('membrane', s('rect', { x: 34, y: 34, width: 452, height: 312, rx: 12, fill: 'none', stroke: '#558b2f', 'stroke-width': 3 })),
      part('cyto', s('rect', { x: 37, y: 37, width: 446, height: 306, rx: 11, fill: '#f1f8e9' })),
      part('vacuole', s('rect', { x: 200, y: 70, width: 250, height: 240, rx: 40, fill: '#b3e5fc', stroke: '#4fc3f7', 'stroke-width': 3 })),
    );
    [[90, 80], [150, 300], [470, 330], [90, 230]].forEach(([x, y], i) => svg.append(part('chloro', g(
      s('ellipse', { cx: x, cy: y, rx: 30, ry: 16, fill: '#43a047', stroke: '#1b5e20', 'stroke-width': 2, transform: `rotate(${i * 30} ${x} ${y})` }),
      ...[-12, 0, 12].map(dx => s('rect', { x: x + dx - 4, y: y - 7, width: 8, height: 14, rx: 2, fill: '#1b5e20', transform: `rotate(${i * 30} ${x} ${y})` }))))));
  } else {
    svg.append(
      part('cyto', s('ellipse', { cx: 260, cy: 190, rx: 240, ry: 165, fill: '#fff3e0' })),
      part('membrane', s('ellipse', { cx: 260, cy: 190, rx: 240, ry: 165, fill: 'none', stroke: '#ef6c00', 'stroke-width': 5 })),
      part('centro', g(s('rect', { x: 380, y: 95, width: 26, height: 10, rx: 3, fill: '#8d6e63' }), s('rect', { x: 412, y: 82, width: 10, height: 26, rx: 3, fill: '#8d6e63' }))),
    );
    [[130, 270], [410, 250]].forEach(([x, y]) => svg.append(part('lyso', s('circle', { cx: x, cy: y, r: 13, fill: '#ce93d8', stroke: '#8e24aa', 'stroke-width': 2 }))));
  }
  // общие органоиды
  const nx = kind === 'plant' ? 120 : 230, ny = kind === 'plant' ? 160 : 180;
  svg.append(
    part('rer', s('path', { d: `M${nx + 60} ${ny - 50} q 20 15 0 30 q -20 15 0 30 q 20 15 0 30 q -20 15 0 30`, fill: 'none', stroke: '#5c6bc0', 'stroke-width': 6, 'stroke-linecap': 'round' })),
    part('ser', s('path', { d: `M${nx + 85} ${ny - 40} q 18 12 0 24 q -18 12 0 24 q 18 12 0 24`, fill: 'none', stroke: '#9fa8da', 'stroke-width': 6, 'stroke-linecap': 'round' })),
    part('nucleus', s('circle', { cx: nx, cy: ny, r: 52, fill: '#d1c4e9', stroke: '#5e35b1', 'stroke-width': 4 })),
    part('nucleolus', s('circle', { cx: nx + 10, cy: ny - 6, r: 16, fill: '#7e57c2' })),
    part('golgi', g(...[0, 1, 2, 3].map(i => s('path', { d: `M${kind === 'plant' ? 90 : 330} ${(kind === 'plant' ? 300 : 230) + i * 9} q 30 -12 60 0`, fill: 'none', stroke: '#fbc02d', 'stroke-width': 5, 'stroke-linecap': 'round' })))),
  );
  const mitos = kind === 'plant' ? [[140, 110], [180, 330]] : [[110, 130], [380, 180], [300, 300], [170, 320]];
  mitos.forEach(([x, y], i) => svg.append(part('mito', g(
    s('ellipse', { cx: x, cy: y, rx: 30, ry: 15, fill: '#ef9a9a', stroke: '#c62828', 'stroke-width': 2.5, transform: `rotate(${i * 40} ${x} ${y})` }),
    s('path', { d: `M${x - 20} ${y} l7 -8 l7 16 l7 -16 l7 16 l7 -8`, fill: 'none', stroke: '#c62828', 'stroke-width': 1.6, transform: `rotate(${i * 40} ${x} ${y})` })))));
  const ribos = [];
  for (let i = 0; i < 26; i++) {
    const a = i * 0.9, r = 85 + (i % 5) * 18;
    const x = (kind === 'plant' ? 120 : 260) + r * Math.cos(a) * (kind === 'plant' ? 0.6 : 1.4), y = (kind === 'plant' ? 190 : 190) + r * Math.sin(a) * 0.8;
    ribos.push(s('circle', { cx: x, cy: y, r: 3.2, fill: '#455a64' }));
  }
  svg.append(part('ribo', g(...ribos)));
  return svg;
}

defLab({
  id: 'cell', subject: 'bio', icon: '🦠', title: 'Строение клетки',
  desc: 'Кликабельные животная и растительная клетки, режим «найди органоид»',
  render() {
    let kind = 'animal', quiz = null, score = 0;
    const stage = h('div', { class: 'cell-stage' });
    const info = h('div', { class: 'card cell-info' }, h('p', { class: 'muted' }, 'Нажмите на любую часть клетки.'));
    const quizBox = h('div', { class: 'callout key' });
    const pickTarget = () => {
      const ids = [...new Set([...stage.querySelectorAll('.cell-part')].map(e => e.dataset.part))].filter(id => id !== 'cyto');
      quiz = pick(ids.filter(id => id !== quiz));
      quizBox.innerHTML = '';
      quizBox.append(h('div', { class: 'callout-label' }, `🎯 Найдите: счёт ${score}`), h('b', null, ORGANELLES[quiz][0]));
    };
    const onPick = (id, el) => {
      stage.querySelectorAll('.cell-part.sel').forEach(x => x.classList.remove('sel'));
      el.classList.add('sel');
      const [name, text] = ORGANELLES[id];
      info.innerHTML = '';
      info.append(h('h3', null, name), h('p', { html: rich(text) }));
      if (quiz) {
        if (id === quiz) { score++; SFX.correct(); Store.addXp(2); pickTarget(); }
        else { SFX.wrong(); UI.toast('Это ' + name.toLowerCase() + ', а не ' + ORGANELLES[quiz][0].toLowerCase(), 'bad'); }
      }
    };
    const draw = () => { stage.innerHTML = ''; stage.appendChild(cellSvg(kind, onPick)); if (quiz) pickTarget(); };
    draw();
    return labShell(stage, [
      UI.segmented([['animal', '🐾 Животная'], ['plant', '🌿 Растительная']], kind, v => { kind = v; draw(); }),
      h('button', { class: 'btn', type: 'button', onclick: () => { score = 0; pickTarget(); } }, '🎯 Режим «Найди органоид»'),
      quizBox, info,
    ]);
  },
});

// ---------- ДНК → белок ----------
const AA_COLORS = { F: '#ffb74d', L: '#ffb74d', I: '#ffb74d', M: '#81c784', V: '#ffb74d', S: '#4fc3f7', P: '#ffd54f', T: '#4fc3f7', A: '#ffb74d', Y: '#4fc3f7', H: '#9575cd', Q: '#4fc3f7', N: '#4fc3f7', K: '#9575cd', D: '#e57373', E: '#e57373', C: '#fff176', W: '#ffb74d', R: '#9575cd', G: '#ffd54f', '*': '#90a4ae' };

defLab({
  id: 'dna', subject: 'bio', icon: '🧬', title: 'ДНК → белок',
  desc: 'Транскрипция, трансляция и мутации: замена, вставка, выпадение нуклеотида',
  render() {
    let original = 'TACAAACCGGTAGCTTTAATT';
    let tpl = original;
    let tool = 'sub';
    const out = h('div', { class: 'dna-out' });
    const effect = h('div', { class: 'callout' });
    const input = h('input', { type: 'text', class: 'answer-input left mono', value: toRu(tpl), 'aria-label': 'Матричная цепь ДНК', spellcheck: 'false' });
    const strandRow = (label, seq, cls, clickable) => h('div', { class: 'strand-row' },
      h('span', { class: 'strand-label' }, label),
      h('div', { class: 'strand ' + cls }, seq.split('').map((b, i) => h(clickable ? 'button' : 'span', {
        class: 'nt nt-' + b, type: clickable ? 'button' : null, title: clickable ? 'Нажмите, чтобы изменить' : null,
        onclick: clickable ? () => mutate(i) : null,
      }, LAT2RU[b] || b))));
    const protein = seq => translate(transcribe(seq), true);
    const mutate = i => {
      const bases = 'ATGC';
      if (tool === 'sub') tpl = tpl.slice(0, i) + bases[(bases.indexOf(tpl[i]) + 1) % 4] + tpl.slice(i + 1);
      if (tool === 'ins') tpl = tpl.slice(0, i) + pick(bases.split('')) + tpl.slice(i);
      if (tool === 'del') tpl = tpl.slice(0, i) + tpl.slice(i + 1);
      draw();
    };
    const draw = () => {
      const mrna = transcribe(tpl);
      const prot = protein(tpl), prot0 = protein(original);
      input.value = toRu(tpl);
      out.innerHTML = '';
      out.append(
        strandRow('ДНК (матричная) 3′→5′', tpl, 'dna', true),
        strandRow('ДНК (кодирующая) 5′→3′', complementDNA(tpl), 'dna2', false),
        strandRow('иРНК 5′→3′', mrna, 'rna', false),
        h('div', { class: 'strand-row' }, h('span', { class: 'strand-label' }, 'Кодоны'), h('div', { class: 'codons' }, codonsOf(mrna).map(c => h('span', { class: 'codon' }, toRu(c))))),
        h('div', { class: 'strand-row' }, h('span', { class: 'strand-label' }, 'Антикодоны тРНК'), h('div', { class: 'codons' }, anticodons(mrna).map(c => h('span', { class: 'codon anti' }, toRu(c))))),
        h('div', { class: 'strand-row' }, h('span', { class: 'strand-label' }, 'Белок'), h('div', { class: 'protein' }, prot.map(a => h('span', { class: 'aa', style: { background: AA_COLORS[a] }, title: AMINO[a].name }, AMINO[a].ru)))),
      );
      // эффект мутации
      const same = tpl === original;
      const p0 = aaRu(prot0), p1 = aaRu(prot);
      let txt;
      if (same) txt = 'Исходный ген. Выберите инструмент и нажмите на нуклеотид матричной цепи, чтобы внести мутацию.';
      else if (tpl.length !== original.length && (tpl.length - original.length) % 3 !== 0) txt = '<b>Сдвиг рамки считывания.</b> Вставка или выпадение нуклеотида меняют все последующие кодоны — белок меняется полностью, часто появляется преждевременный стоп-кодон.';
      else if (p0 === p1) txt = '<b>Молчащая мутация.</b> Кодон изменился, но кодирует ту же аминокислоту — генетический код вырожден.';
      else if (prot.length < prot0.length || (prot.includes('*') && prot.indexOf('*') < prot0.indexOf('*'))) txt = '<b>Нонсенс-мутация.</b> Возник преждевременный стоп-кодон — белок укорочен и, скорее всего, не работает.';
      else txt = '<b>Миссенс-мутация.</b> Одна аминокислота заменена на другую. Так возникает серповидноклеточная анемия (Глу → Вал в β-глобине).';
      effect.className = 'callout ' + (same ? '' : p0 === p1 ? 'key' : 'warn');
      effect.innerHTML = txt + (same ? '' : `<div class="small muted">Было: ${p0}<br>Стало: ${p1}</div>`);
    };
    input.addEventListener('change', () => {
      const seq = toLat(input.value).replace(/U/g, '');
      if (seq.length < 3) { UI.toast('Введите хотя бы один триплет (А, Т, Г, Ц)', 'bad'); return; }
      original = tpl = seq;
      draw();
    });
    draw();
    return h('div', null,
      h('div', { class: 'card' },
        h('div', { class: 'row' }, input,
          h('button', { class: 'btn', type: 'button', onclick: () => { original = tpl = 'TAC' + randomTemplateDNA(5) + 'ATT'; draw(); } }, '🎲 Случайный ген'),
          h('button', { class: 'btn', type: 'button', onclick: () => { tpl = original; draw(); } }, '↺ Отменить мутации')),
        h('div', { class: 'row' }, h('span', { class: 'small muted' }, 'Инструмент:'),
          UI.segmented([['sub', 'Замена'], ['ins', 'Вставка'], ['del', 'Выпадение']], tool, v => { tool = v; }))),
      h('div', { class: 'card' }, out),
      effect,
      h('p', { class: 'small muted' }, 'Матричная (транскрибируемая) цепь записана 3′→5′, поэтому иРНК читается 5′→3′. Ген начинается с ТАЦ (→ старт-кодон АУГ) и кончается стоп-кодоном.'));
  },
});

// ---------- Решётка Пеннета ----------
defLab({
  id: 'punnett', subject: 'bio', icon: '🔲', title: 'Решётка Пеннета',
  desc: 'Скрещивания по одному и двум генам, полное и неполное доминирование',
  render() {
    const st = { genes: 1, p1: ['Aa', 'Bb'], p2: ['Aa', 'Bb'], incomplete: false };
    const out = h('div');
    const options = ['AA', 'Aa', 'aa'];
    const sel = (who, k) => h('select', {
      'aria-label': `Родитель ${who === 'p1' ? 1 : 2}, ген ${k ? 'B' : 'A'}`,
      onchange: e => { st[who][k] = e.target.value; draw(); },
    }, options.map(o => { const v = k ? o.replace(/A/g, 'B').replace(/a/g, 'b') : o; return h('option', { value: v, selected: st[who][k] === v }, v); }));
    const ctrl = h('div', { class: 'row' });
    const phenName = (gt) => {
      const a = gt.slice(0, 2), b = gt.slice(2, 4);
      let s1 = st.incomplete ? (a === 'AA' ? 'красные' : a === 'aa' ? 'белые' : 'розовые') : (/A/.test(a) ? 'жёлтые' : 'зелёные');
      if (st.genes === 1) return s1;
      return s1 + ', ' + (/B/.test(b) ? 'гладкие' : 'морщинистые');
    };
    const phenColor = gt => {
      const a = gt.slice(0, 2);
      if (st.incomplete) return a === 'AA' ? '#ef5350' : a === 'aa' ? '#fafafa' : '#f8bbd0';
      return /A/.test(a) ? '#ffe082' : '#a5d6a7';
    };
    const draw = () => {
      ctrl.innerHTML = '';
      add(ctrl, 
        h('span', null, 'Родитель 1: '), sel('p1', 0), st.genes === 2 ? sel('p1', 1) : null,
        h('span', { class: 'cross-x' }, '×'),
        h('span', null, 'Родитель 2: '), sel('p2', 0), st.genes === 2 ? sel('p2', 1) : null);
      const g1 = st.genes === 1 ? st.p1[0] : st.p1[0] + st.p1[1];
      const g2 = st.genes === 1 ? st.p2[0] : st.p2[0] + st.p2[1];
      const ga = gametesWithMultiplicity(g1), gb = gametesWithMultiplicity(g2);
      const kids = crossGenotypes(g1, g2);
      const grid = h('table', { class: 'punnett' },
        h('thead', null, h('tr', null, h('th', { class: 'corner' }, '♀ \\ ♂'), gb.map(x => h('th', { class: 'gamete' }, x)))),
        h('tbody', null, ga.map((x, i) => h('tr', null, h('th', { class: 'gamete' }, x), gb.map((y, j) => {
          const gt = kids[i * gb.length + j];
          return h('td', { style: { background: phenColor(gt) }, title: phenName(gt) }, h('b', null, gt), h('div', { class: 'tiny' }, phenName(gt)));
        })))));
      const tally = arr => { const m = new Map(); arr.forEach(x => m.set(x, (m.get(x) || 0) + 1)); return [...m.entries()].sort((a, b) => b[1] - a[1]); };
      const gtT = tally(kids), phT = tally(kids.map(phenName));
      const ratio = list => { const gg = list.reduce((a, [, n]) => gcd(a, n), 0); return list.map(([, n]) => n / gg).join(' : '); };
      out.innerHTML = '';
      out.append(
        h('div', { class: 'card' }, h('div', { class: 'small muted' }, `Гаметы ♀: ${[...new Set(ga)].join(', ')} · Гаметы ♂: ${[...new Set(gb)].join(', ')}`), h('div', { class: 'table-wrap' }, grid)),
        h('div', { class: 'calc-grid' },
          h('div', { class: 'card' }, h('h3', null, 'По генотипу: ' + ratio(gtT)), h('ul', { class: 'tally' }, gtT.map(([k, n]) => h('li', null, h('b', null, k), ` — ${n}/${kids.length} (${fmt(n / kids.length * 100, 2)} %)`)))),
          h('div', { class: 'card' }, h('h3', null, 'По фенотипу: ' + ratio(phT)), h('ul', { class: 'tally' }, phT.map(([k, n]) => h('li', null, h('i', { class: 'dot', style: { background: phenColor(kids.find(x => phenName(x) === k)) } }), ' ', k, ` — ${n}/${kids.length} (${fmt(n / kids.length * 100, 2)} %)`))))));
    };
    draw();
    return h('div', null,
      h('div', { class: 'card' },
        h('div', { class: 'row' },
          UI.segmented([[1, 'Один ген'], [2, 'Два гена']], 1, v => { st.genes = v; draw(); }),
          h('label', { class: 'switch' }, h('input', { type: 'checkbox', onchange: e => { st.incomplete = e.target.checked; draw(); } }), 'Неполное доминирование по гену A (ночная красавица)')),
        ctrl,
        h('p', { class: 'small muted' }, 'Ген A — окраска (жёлтая > зелёная, у гороха), ген B — форма семян (гладкие > морщинистые). Попробуйте Aa × Aa (3 : 1), Aa × aa (анализирующее, 1 : 1), AaBb × AaBb (9 : 3 : 3 : 1).')),
      out);
  },
});

// ---------- Кровообращение ----------
const HEART_INFO = {
  ra: ['Правое предсердие', 'Принимает венозную кровь из верхней и нижней полых вен. Здесь находится синусно-предсердный узел — водитель ритма.'],
  rv: ['Правый желудочек', 'Выталкивает венозную кровь в лёгочный ствол — начало малого круга. Стенка тоньше, чем у левого: давление в малом круге ниже (~25 мм рт. ст.).'],
  la: ['Левое предсердие', 'Принимает артериальную кровь из лёгочных вен — конец малого круга.'],
  lv: ['Левый желудочек', 'Самая мощная камера (стенка до 1,5 см). Выталкивает артериальную кровь в аорту — начало большого круга (~120 мм рт. ст.).'],
  pa: ['Лёгочный ствол и артерии', 'Несут ВЕНОЗНУЮ кровь от сердца к лёгким. Артерии — потому что от сердца.'],
  pv: ['Лёгочные вены', 'Несут АРТЕРИАЛЬНУЮ (богатую O₂) кровь из лёгких в левое предсердие.'],
  aorta: ['Аорта', 'Самая крупная артерия. Несёт артериальную кровь ко всем органам. Скорость крови ≈ 0,5 м/с.'],
  vc: ['Полые вены', 'Верхняя и нижняя полые вены собирают венозную кровь от всего тела и несут её в правое предсердие.'],
  lungs: ['Капилляры лёгких', 'Газообмен в альвеолах: кровь отдаёт CO₂ и насыщается O₂ — из венозной становится артериальной.'],
  body: ['Капилляры органов', 'Кровь отдаёт тканям O₂ и питательные вещества, забирает CO₂ и продукты обмена — становится венозной.'],
  tri: ['Трёхстворчатый клапан', 'Между правым предсердием и правым желудочком. Не даёт крови вернуться в предсердие при сокращении желудочка.'],
  mitral: ['Двустворчатый (митральный) клапан', 'Между левым предсердием и левым желудочком.'],
};

defLab({
  id: 'heart', subject: 'bio', icon: '🫀', title: 'Круги кровообращения',
  desc: 'Путь крови через сердце, лёгкие и органы — с анимацией и подсказками',
  render(ctx) {
    let bpm = 70, t = 0, show = 'all';
    const info = h('div', { class: 'card cell-info' }, h('p', { class: 'muted' }, 'Нажмите на камеру сердца, сосуд или орган.'));
    const loop = [
      [140, 375, 'v'], [100, 375, 'v'], [100, 190, 'v'], [170, 190, 'v'], // полые вены → ПП
      [212, 215, 'v'], [212, 262, 'v'], // ПП → ПЖ
      [170, 262, 'v'], [130, 262, 'v'], [130, 50, 'v'], [170, 50, 'v'], // лёгочный ствол
      [260, 50, 'a'], [350, 50, 'a'], // капилляры лёгких
      [420, 50, 'a'], [420, 190, 'a'], [350, 190, 'a'], // лёгочные вены → ЛП
      [308, 215, 'a'], [308, 262, 'a'], // ЛП → ЛЖ
      [350, 262, 'a'], [400, 262, 'a'], [400, 375, 'a'], // аорта
      [270, 375, 'v'], // капилляры тела
    ];
    const segLen = loop.map((p, i) => { const q = loop[(i + 1) % loop.length]; return Math.hypot(q[0] - p[0], q[1] - p[1]); });
    const total = segLen.reduce((a, b) => a + b, 0);
    const posAt = d => {
      d = ((d % total) + total) % total;
      for (let i = 0; i < loop.length; i++) {
        if (d <= segLen[i]) { const p = loop[i], q = loop[(i + 1) % loop.length]; const k = d / segLen[i]; return [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, p[2]]; }
        d -= segLen[i];
      }
      return loop[0];
    };
    const svg = s('svg', { viewBox: '0 0 520 420', class: 'heart-svg', role: 'img', 'aria-label': 'Схема кругов кровообращения' });
    const RED = '#e53935', BLUE = '#3f6fd8';
    const click = id => () => { const [n, txt] = HEART_INFO[id]; info.innerHTML = ''; info.append(h('h3', null, n), h('p', { html: rich(txt) })); };
    const vessel = (id, d, col, dim) => s('path', { d, fill: 'none', stroke: col, 'stroke-width': 12, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: dim ? 0.25 : 0.9, class: 'cell-part', onclick: click(id) });
    const dots = s('g');
    const build = () => {
      svg.innerHTML = '';
      // при показе одного круга второй приглушаем
      const smallDim = show === 'big', bigDim = show === 'small';
      svg.append(
        s('rect', { x: 160, y: 20, width: 210, height: 60, rx: 30, fill: '#f8bbd0', opacity: smallDim ? 0.3 : 1, class: 'cell-part', onclick: click('lungs') }),
        s('text', { x: 265, y: 32, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#880e4f' }, 'Лёгкие (малый круг)'),
        s('rect', { x: 140, y: 350, width: 260, height: 52, rx: 20, fill: '#ffe0b2', opacity: bigDim ? 0.3 : 1, class: 'cell-part', onclick: click('body') }),
        s('text', { x: 270, y: 396, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#e65100' }, 'Органы тела (большой круг)'),
        vessel('vc', 'M140 375 L100 375 L100 190 L170 190', BLUE, bigDim),
        vessel('pa', 'M170 262 L130 262 L130 50 L170 50', BLUE, smallDim),
        vessel('pv', 'M360 50 L420 50 L420 190 L350 190', RED, smallDim),
        vessel('aorta', 'M350 262 L400 262 L400 375', RED, bigDim),
      );
      const chamber = (id, x, y, w, hh, col, label) => s('g', { class: 'cell-part chamber', onclick: click(id) },
        s('rect', { x, y, width: w, height: hh, rx: 14, fill: col, stroke: '#5d1a1a', 'stroke-width': 2 }),
        s('text', { x: x + w / 2, y: y + hh / 2 + 5, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#fff' }, label));
      svg.append(
        chamber('ra', 170, 160, 85, 60, BLUE, 'ПП'), chamber('la', 265, 160, 85, 60, RED, 'ЛП'),
        chamber('rv', 170, 228, 85, 72, BLUE, 'ПЖ'), chamber('lv', 265, 228, 85, 72, RED, 'ЛЖ'),
        s('rect', { x: 186, y: 219, width: 52, height: 8, rx: 3, fill: '#fff59d', class: 'cell-part', onclick: click('tri') }),
        s('rect', { x: 282, y: 219, width: 52, height: 8, rx: 3, fill: '#fff59d', class: 'cell-part', onclick: click('mitral') }),
        s('text', { x: 270, y: 416, 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--muted)' }, 'вид спереди: правая половина сердца — слева на рисунке'),
        dots);
    };
    build();
    animate(ctx, dt => {
      t += dt * bpm / 60;
      dots.innerHTML = '';
      const beat = 1 + 0.06 * Math.max(0, Math.sin(t * Math.PI * 2));
      svg.querySelectorAll('.chamber rect').forEach(r => { r.style.transformBox = 'fill-box'; r.style.transformOrigin = 'center'; r.style.transform = `scale(${beat})`; });
      for (let k = 0; k < 28; k++) {
        const [x, y, type] = posAt(t * 120 + k * total / 28);
        dots.appendChild(s('circle', { cx: x, cy: y, r: 4, fill: type === 'a' ? '#ffcdd2' : '#bbdefb', stroke: type === 'a' ? RED : BLUE, 'stroke-width': 1.5 }));
      }
    });
    return labShell(svg, [
      UI.segmented([['all', 'Оба круга'], ['small', 'Малый'], ['big', 'Большой']], 'all', v => { show = v; build(); }),
      labPanel('Пульс', UI.slider('ЧСС', { min: 40, max: 180, step: 5, value: 70, unit: 'уд/мин', dp: 0, onInput: v => { bpm = v; } })),
      info,
      h('p', { class: 'small muted' }, 'Синие точки — венозная кровь (мало O₂), красные — артериальная. Кровь проходит полный путь примерно за 20–25 секунд в покое.'),
    ]);
  },
});

// ---------- Естественный отбор и дрейф генов ----------
defLab({
  id: 'selection', subject: 'bio', icon: '🧮', title: 'Отбор и дрейф генов',
  desc: 'Модель Райта — Фишера: как меняется частота аллеля в популяциях',
  render() {
    const st = { N: 100, p0: 0.5, s: 0.05, hdom: 0, gens: 150, reps: 8 };
    const cv = hiDpiCanvas(720, 400);
    const res = h('div', { class: 'small' });
    const run = () => {
      const c = themeColors();
      const colors = ['#7c5cff', '#2f80ed', '#1fb57a', '#ff8a00', '#e0457b', '#00acc1', '#8d6e63', '#c0ca33'];
      const series = [];
      let fixed = 0, lost = 0;
      for (let r = 0; r < st.reps; r++) {
        let p = st.p0;
        const pts = [[0, p]];
        for (let g = 1; g <= st.gens; g++) {
          // приспособленность: AA = 1, Aa = 1 − h·s, aa = 1 − s (отбор против аллеля a)
          const q = 1 - p;
          const wAA = 1, wAa = 1 - st.hdom * st.s, waa = 1 - st.s;
          const wbar = p * p * wAA + 2 * p * q * wAa + q * q * waa;
          const pSel = (p * p * wAA + p * q * wAa) / wbar;
          // дрейф: биномиальная выборка 2N аллелей
          let k = 0;
          const n2 = 2 * st.N;
          for (let i = 0; i < n2; i++) if (Math.random() < pSel) k++;
          p = k / n2;
          pts.push([g, p]);
        }
        if (p === 1) fixed++; if (p === 0) lost++;
        series.push({ points: pts, color: colors[r % colors.length], width: 2 });
      }
      // детерминированная кривая без дрейфа
      let p = st.p0; const det = [[0, p]];
      for (let g = 1; g <= st.gens; g++) {
        const q = 1 - p, wAa = 1 - st.hdom * st.s, waa = 1 - st.s;
        const wbar = p * p + 2 * p * q * wAa + q * q * waa;
        p = (p * p + p * q * wAa) / wbar; det.push([g, p]);
      }
      series.push({ points: det, color: c.text, width: 3, dash: [6, 4] });
      cv.g.clearRect(0, 0, cv.w, cv.h);
      drawChart(cv.g, { x: 50, y: 16, w: cv.w - 70, h: cv.h - 50 }, {
        xMin: 0, xMax: st.gens, yMin: 0, yMax: 1, xTicks: 5, yTicks: 4, xLabel: 'поколения', yLabel: 'частота аллеля A (p)', fmtX: v => fmt(v, 0), fmtY: v => fmt(v, 2), series,
      });
      res.innerHTML = `Из ${st.reps} популяций аллель A закрепился в <b>${fixed}</b>, утрачен в <b>${lost}</b>. Пунктир — ожидание без дрейфа (бесконечная популяция). ` +
        `При p = ${fmt(st.p0)} по Харди — Вайнбергу: AA = ${fmt(st.p0 ** 2 * 100, 1)} %, Aa = ${fmt(2 * st.p0 * (1 - st.p0) * 100, 1)} %, aa = ${fmt((1 - st.p0) ** 2 * 100, 1)} %.`;
    };
    run();
    return labShell(cv.canvas, [
      labPanel('Популяция',
        UI.slider('Размер популяции N', { min: 5, max: 1000, step: 5, value: st.N, unit: 'особей', dp: 0, onInput: v => { st.N = v; } }),
        UI.slider('Начальная частота p (аллель A)', { min: 0.05, max: 0.95, step: 0.05, value: st.p0, unit: '', dp: 2, onInput: v => { st.p0 = v; } }),
        UI.slider('Отбор против aa (s)', { min: 0, max: 0.5, step: 0.01, value: st.s, unit: '', dp: 2, onInput: v => { st.s = v; } }),
        UI.slider('Доминирование h (0 — A доминантен)', { min: 0, max: 1, step: 0.1, value: 0, unit: '', dp: 1, onInput: v => { st.hdom = v; } }),
        UI.slider('Поколений', { min: 20, max: 400, step: 10, value: st.gens, unit: '', dp: 0, onInput: v => { st.gens = v; } }),
        h('button', { class: 'btn primary', type: 'button', onclick: run }, '▶ Запустить эволюцию')),
      res,
      h('p', { class: 'small muted' }, 'Поставьте s = 0 и N = 10: частоты «гуляют» случайно и быстро доходят до 0 или 1 — это дрейф генов. При N = 1000 и s = 0,05 все линии дружно идут к закреплению A — это отбор. При сильном доминировании рецессивный аллель a исчезает очень медленно: он «прячется» в гетерозиготах.'),
    ]);
  },
});

// ---------- Хищник и жертва ----------
defLab({
  id: 'population', subject: 'bio', icon: '🐺', title: 'Хищник и жертва',
  desc: 'Модель Лотки — Вольтерры и логистический рост популяции',
  render() {
    const st = { a: 1, b: 0.02, c: 0.6, d: 0.01, x0: 60, y0: 15, mode: 'lv', r: 0.5, K: 500, n0: 10 };
    const cv = hiDpiCanvas(720, 400);
    const note = h('div', { class: 'small' });
    const panelLV = h('div'), panelLog = h('div');
    const run = () => {
      const c = themeColors();
      cv.g.clearRect(0, 0, cv.w, cv.h);
      if (st.mode === 'lv') {
        let x = st.x0, y = st.y0;
        const T = 60, dt = 0.01;
        const px = [[0, x]], py = [[0, y]];
        let maxV = Math.max(x, y);
        for (let t = dt; t <= T; t += dt) {
          // метод Рунге — Кутты 2-го порядка
          const fx = (x, y) => st.a * x - st.b * x * y, fy = (x, y) => st.d * x * y - st.c * y;
          const kx = fx(x, y), ky = fy(x, y);
          const xm = x + kx * dt / 2, ym = y + ky * dt / 2;
          x += fx(xm, ym) * dt; y += fy(xm, ym) * dt;
          if (Math.round(t / dt) % 10 === 0) { px.push([t, x]); py.push([t, y]); maxV = Math.max(maxV, x, y); }
        }
        drawChart(cv.g, { x: 50, y: 16, w: cv.w - 70, h: cv.h - 50 }, {
          xMin: 0, xMax: T, yMin: 0, yMax: niceStep(maxV) * Math.ceil(maxV / niceStep(maxV)), xLabel: 'время', yLabel: 'численность', fmtX: v => fmt(v, 0), fmtY: v => fmt(v, 0),
          series: [{ points: px, color: c.bio, width: 2.5 }, { points: py, color: c.bad, width: 2.5 }],
        });
        note.innerHTML = '<span style="color:var(--bio)">■</span> жертвы (зайцы) &nbsp; <span style="color:var(--bad)">■</span> хищники (рыси). Пики хищников запаздывают относительно пиков жертв — так в данных о шкурках компании Гудзонова залива колебались численности зайца-беляка и рыси с периодом ~10 лет.';
      } else {
        const T = 40, dt = 0.05;
        let n = st.n0, ne = st.n0;
        const logi = [[0, n]], expo = [[0, ne]];
        for (let t = dt; t <= T; t += dt) {
          n += st.r * n * (1 - n / st.K) * dt;
          ne += st.r * ne * dt;
          logi.push([t, n]); if (ne < st.K * 1.6) expo.push([t, ne]);
        }
        drawChart(cv.g, { x: 50, y: 16, w: cv.w - 70, h: cv.h - 50 }, {
          xMin: 0, xMax: T, yMin: 0, yMax: st.K * 1.5, xLabel: 'время', yLabel: 'численность', fmtX: v => fmt(v, 0), fmtY: v => fmt(v, 0),
          marks: [{ y: st.K, color: c.accent }],
          series: [{ points: expo, color: c.muted, width: 2, dash: [5, 4] }, { points: logi, color: c.bio, width: 3 }],
        });
        note.innerHTML = 'Пунктир — экспоненциальный рост (неограниченные ресурсы, J-кривая). Сплошная — логистический рост (S-кривая): численность выходит на <b>ёмкость среды K</b> (жёлтая линия). Так растут колонии бактерий в пробирке и популяции на новой территории.';
      }
    };
    const sl = (label, key, min, max, step, dp) => UI.slider(label, { min, max, step, value: st[key], unit: '', dp, onInput: v => { st[key] = v; run(); } });
    panelLV.append(sl('Рождаемость жертв a', 'a', 0.2, 2, 0.1, 1), sl('Выедание b', 'b', 0.005, 0.05, 0.005, 3), sl('Смертность хищников c', 'c', 0.1, 1.5, 0.1, 1), sl('Эффективность хищников d', 'd', 0.002, 0.03, 0.002, 3), sl('Жертв в начале', 'x0', 10, 200, 5, 0), sl('Хищников в начале', 'y0', 2, 60, 1, 0));
    panelLog.append(sl('Скорость роста r', 'r', 0.1, 1.5, 0.05, 2), sl('Ёмкость среды K', 'K', 100, 1000, 50, 0), sl('Начальная численность', 'n0', 1, 100, 1, 0));
    panelLog.hidden = true;
    run();
    return labShell(cv.canvas, [
      UI.segmented([['lv', 'Хищник — жертва'], ['log', 'Рост популяции']], 'lv', v => { st.mode = v; panelLV.hidden = v !== 'lv'; panelLog.hidden = v === 'lv'; run(); }),
      labPanel('Параметры', panelLV, panelLog),
      note,
    ]);
  },
});
