// Справочник: растворимость, ряд активности, генетический код, формулы, константы, нормы, глоссарий.

const REF_TABS = [
  ['solubility', '💧 Растворимость'], ['activity', '⚡ Ряд активности'], ['code', '🧬 Генетический код'],
  ['phys', '🧲 Формулы физики'], ['chem', '⚗️ Формулы химии'], ['organic', '🔗 Органика'],
  ['constants', '📐 Константы и СИ'], ['norms', '🩺 Нормы показателей'], ['glossary', '📖 Глоссарий'],
];

Views.reference = ([tab = 'solubility']) => {
  const root = h('div');
  root.appendChild(UI.pageHeader('📚 Справочник', 'Всё, что обычно дают на экзамене, и немного больше.'));
  root.appendChild(h('div', { class: 'chips ref-tabs' }, REF_TABS.map(([id, label]) => h('a', { class: 'chip' + (id === tab ? ' active' : ''), href: '#/reference/' + id }, label))));
  const body = h('div', { class: 'card ref-body' });
  root.appendChild(body);
  (REF_RENDER[tab] || REF_RENDER.solubility)(body);
  return root;
};

const REF_RENDER = {
  solubility(body) {
    const cls = { 'Р': 'sol-r', 'М': 'sol-m', 'Н': 'sol-n', '—': 'sol-x' };
    body.append(
      h('h2', null, 'Растворимость кислот, оснований и солей в воде'),
      h('div', { class: 'chips' }, [['Р', 'растворимо'], ['М', 'малорастворимо'], ['Н', 'нерастворимо'], ['—', 'не существует / разлагается водой']].map(([k, t]) => h('span', { class: 'leg' }, h('i', { class: cls[k] }, k), t))),
      h('div', { class: 'table-wrap' }, h('table', { class: 'data-table sol-table' },
        h('thead', null, h('tr', null, h('th', null, ''), SOL_ANIONS.map(a => h('th', { html: chem(a) })))),
        h('tbody', null, SOL_TABLE.map(([cat, row]) => h('tr', null, h('th', { html: chem(cat) }), row.map(v => h('td', { class: cls[v] }, v))))))),
      h('p', { class: 'small muted' }, 'Наведите курсор на ячейку строки и столбца, чтобы составить формулу соли. Реакция обмена идёт до конца, если продукт — осадок (Н), газ или вода.'));
  },
  activity(body) {
    body.append(
      h('h2', null, 'Электрохимический ряд активности металлов'),
      h('div', { class: 'activity' }, ACTIVITY_SERIES.map((m, i) => h('div', { class: 'act-item' + (m === 'H2' ? ' hydrogen' : ''), style: { '--t': i / (ACTIVITY_SERIES.length - 1) } }, h('span', { html: chem(m) })))),
      h('div', { class: 'row between small muted' }, h('span', null, '← активность и восстановительные свойства растут'), h('span', null, 'окислительные свойства катионов растут →')),
      h('ul', { class: 'theory-list' },
        h('li', null, 'Металлы до водорода вытесняют его из растворов кислот (кроме HNO₃ и конц. H₂SO₄).'),
        h('li', null, 'Каждый металл вытесняет из растворов солей металлы, стоящие правее (кроме самых активных, которые реагируют с водой).'),
        h('li', null, 'Li … Na реагируют с водой при обычных условиях; Mg — при нагревании; Al — после снятия оксидной плёнки.'),
        h('li', null, 'Металлы правее водорода в природе часто встречаются в самородном виде (Cu, Ag, Au, Pt).')));
  },
  code(body) {
    const order = 'UCAG';
    const amino = c => { const a = CODON_TABLE[c]; return AMINO[a].ru; };
    body.append(
      h('h2', null, 'Генетический код (иРНК)'),
      h('p', { class: 'small muted' }, 'Первое основание — строка слева, второе — столбец сверху, третье — справа в ячейке. Старт-кодон АУГ (Мет), стоп-кодоны: УАА, УАГ, УГА.'),
      h('div', { class: 'table-wrap' }, h('table', { class: 'data-table code-table' },
        h('thead', null, h('tr', null, h('th', null, '1-е'), [...order].map(b => h('th', null, LAT2RU[b])), h('th', null, '3-е'))),
        h('tbody', null, [...order].map(b1 => h('tr', null,
          h('th', null, LAT2RU[b1]),
          [...order].map(b2 => h('td', null, [...order].map(b3 => {
            const c = b1 + b2 + b3;
            const a = CODON_TABLE[c];
            return h('div', { class: 'codon-cell' + (a === '*' ? ' stop' : a === 'M' ? ' start' : '') }, amino(c));
          }))),
          h('td', { class: 'third' }, [...order].map(b => h('div', null, LAT2RU[b])))))))));
    body.append(h('h3', null, 'Аминокислоты'), h('div', { class: 'aa-list' }, Object.entries(AMINO).filter(([k]) => k !== '*').map(([k, v]) => h('span', { class: 'aa-chip' }, h('b', null, v.ru), ' — ', v.name))));
  },
  phys(body) {
    body.appendChild(h('h2', null, 'Основные формулы физики'));
    for (const [title, list] of PHYS_FORMULAS) {
      body.append(h('h3', null, title), h('div', { class: 'formula-grid' }, list.map(([n, f, note]) => h('div', { class: 'formula-card' }, h('div', { class: 'small muted' }, n), h('div', { class: 'formula-main', html: f }), note ? h('div', { class: 'small muted' }, note) : null))));
    }
  },
  chem(body) {
    body.append(h('h2', null, 'Расчётные формулы химии'),
      h('div', { class: 'formula-grid' }, CHEM_FORMULAS.map(([n, f]) => h('div', { class: 'formula-card' }, h('div', { class: 'small muted' }, n), h('div', { class: 'formula-main', html: f })))),
      h('h3', null, 'Индикаторы'),
      h('div', { class: 'table-wrap' }, h('table', { class: 'data-table' },
        h('thead', null, h('tr', null, h('th', null, 'Индикатор'), h('th', null, 'Кислая среда'), h('th', null, 'Нейтральная'), h('th', null, 'Щелочная'))),
        h('tbody', null, INDICATORS.map(ind => h('tr', null, h('td', null, ind.name), [2, 7, 12].map(p => { const c = indicatorColor(ind, p); return h('td', null, h('i', { class: 'dot', style: { background: c.color } }), ' ', c.name); })))))));
  },
  organic(body) {
    body.append(h('h2', null, 'Классы органических соединений'),
      h('div', { class: 'table-wrap' }, h('table', { class: 'data-table' },
        h('thead', null, h('tr', null, h('th', null, 'Класс'), h('th', null, 'Общая формула'), h('th', null, 'Суффикс'), h('th', null, 'Особенность'))),
        h('tbody', null, ORGANIC_CLASSES.map(r => h('tr', null, r.map(c => h('td', { html: c }))))))),
      h('h3', null, 'Корни названий'),
      h('div', { class: 'aa-list' }, ['мет — 1', 'эт — 2', 'проп — 3', 'бут — 4', 'пент — 5', 'гекс — 6', 'гепт — 7', 'окт — 8', 'нон — 9', 'дек — 10'].map(x => h('span', { class: 'aa-chip' }, x))));
  },
  constants(body) {
    body.append(h('h2', null, 'Физические постоянные'),
      h('div', { class: 'table-wrap' }, h('table', { class: 'data-table' },
        h('thead', null, h('tr', null, h('th', null, 'Величина'), h('th', null, 'Обозначение'), h('th', null, 'Значение'))),
        h('tbody', null, CONSTANTS.map(([n, sym, v]) => h('tr', null, h('td', null, n), h('td', { html: sym }), h('td', null, v)))))),
      h('h3', null, 'Приставки СИ'),
      h('div', { class: 'table-wrap' }, h('table', { class: 'data-table' },
        h('thead', null, h('tr', null, h('th', null, 'Приставка'), h('th', null, 'Обозначение'), h('th', null, 'Множитель'))),
        h('tbody', null, SI_PREFIXES.map(r => h('tr', null, r.map(c => h('td', null, c))))))));
  },
  norms(body) {
    body.append(h('h2', null, 'Нормы показателей взрослого человека'),
      h('p', { class: 'small muted' }, 'Ориентировочные значения для обучения. Референсные интервалы зависят от лаборатории, возраста и пола; это не медицинская рекомендация.'),
      h('div', { class: 'table-wrap' }, h('table', { class: 'data-table' },
        h('tbody', null, MED_NORMS.map(([k, v]) => h('tr', null, h('td', null, k), h('td', null, h('b', null, v))))))));
  },
  glossary(body) {
    const list = h('div', { class: 'glossary' });
    const drawList = q => {
      list.innerHTML = '';
      const nq = normalizeText(q);
      const items = GLOSSARY.filter(g => !nq || normalizeText(g.term + ' ' + g.def).includes(nq)).sort((a, b) => a.term.localeCompare(b.term, 'ru'));
      list.append(h('div', { class: 'small muted' }, `Найдено: ${items.length}`), ...items.map(g => h('div', { class: 'gl-item' },
        h('b', null, g.term), h('span', { class: 'tag' }, SUBJECTS[g.subject].icon + ' ' + (MODULE_MAP[g.module]?.title || '')),
        h('div', { html: rich(g.def) }))));
    };
    body.append(h('h2', null, `Глоссарий (${GLOSSARY.length} терминов)`),
      h('input', { type: 'search', class: 'search', placeholder: 'Поиск термина…', oninput: e => drawList(e.target.value) }), list);
    drawList('');
  },
};
