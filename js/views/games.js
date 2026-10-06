// Игры: быстрые раунды на время, мемори, марафон на выживание.

const GAMES = [
  { id: 'elements', icon: '🔤', title: 'Символы элементов', desc: 'Название ↔ символ на скорость', subject: 'chem' },
  { id: 'molar', icon: '⚖️', title: 'Молярная масса', desc: 'Выберите верную M за секунды', subject: 'chem' },
  { id: 'classify', icon: '🗂️', title: 'Сортировщик веществ', desc: 'Оксид, основание, кислота или соль?', subject: 'chem' },
  { id: 'units', icon: '📏', title: 'Единицы СИ', desc: 'Величина → единица измерения', subject: 'phys' },
  { id: 'dna', icon: '🧬', title: 'Комплементарность', desc: 'Достройте цепь ДНК на скорость', subject: 'bio' },
  { id: 'organs', icon: '🫀', title: 'Кто за что отвечает', desc: 'Органоиды, органы и гормоны', subject: 'bio' },
  { id: 'truefalse', icon: '⚖️', title: 'Верю — не верю', desc: 'Утверждения из всех трёх наук', subject: 'bio' },
  { id: 'memory', icon: '🧠', title: 'Мемори', desc: 'Найдите пары «термин — определение»', subject: 'bio' },
  { id: 'marathon', icon: '🏃', title: 'Марафон', desc: '3 жизни, задачи всё сложнее', subject: 'phys' },
];

const UNIT_PAIRS = [['сила', 'Н'], ['энергия', 'Дж'], ['мощность', 'Вт'], ['давление', 'Па'], ['частота', 'Гц'], ['заряд', 'Кл'], ['напряжение', 'В'],
  ['сопротивление', 'Ом'], ['сила тока', 'А'], ['ёмкость', 'Ф'], ['магнитная индукция', 'Тл'], ['оптическая сила', 'дптр'], ['температура (СИ)', 'К'],
  ['количество вещества', 'моль'], ['масса', 'кг'], ['ускорение', 'м/с²'], ['импульс', 'кг·м/с'], ['плотность', 'кг/м³'], ['эквивалентная доза', 'Зв'],
  ['поглощённая доза', 'Гр'], ['активность радиоизотопа', 'Бк'], ['молярная масса', 'г/моль'], ['удельная теплоёмкость', 'Дж/(кг·°C)']];

const ORGAN_PAIRS = [['митохондрия', 'синтез АТФ'], ['рибосома', 'синтез белка'], ['лизосома', 'переваривание'], ['хлоропласт', 'фотосинтез'],
  ['ядро', 'хранение ДНК'], ['комплекс Гольджи', 'упаковка веществ'], ['гладкая ЭПС', 'синтез липидов'], ['клеточный центр', 'веретено деления'],
  ['инсулин', 'снижает глюкозу'], ['глюкагон', 'повышает глюкозу'], ['адреналин', 'реакция «бей или беги»'], ['тироксин', 'ускоряет обмен веществ'],
  ['АДГ (вазопрессин)', 'задерживает воду'], ['мелатонин', 'суточные ритмы'], ['мозжечок', 'координация'], ['продолговатый мозг', 'дыхательный центр'],
  ['нефрон', 'образование мочи'], ['альвеолы', 'газообмен'], ['эритроциты', 'перенос O₂'], ['тромбоциты', 'свёртывание крови'],
  ['лейкоциты', 'защита организма'], ['печень', 'обезвреживание ядов'], ['желчь', 'эмульгирует жиры'], ['пепсин', 'расщепляет белки'],
  ['амилаза', 'расщепляет крахмал'], ['липаза', 'расщепляет жиры'], ['гипоталамус', 'терморегуляция'], ['палочки', 'сумеречное зрение'], ['колбочки', 'цветное зрение']];

const TF_EXTRA = [
  ['Кровь человека в венах синего цвета.', false, 'Венозная кровь тёмно-красная; вены кажутся синими из-за оптических свойств кожи.'],
  ['Электроны в атоме тяжелее протонов.', false, 'Протон в 1836 раз тяжелее электрона.'],
  ['Звук не распространяется в вакууме.', true, 'Звуку нужна среда.'],
  ['Растения дышат кислородом.', true, 'Клеточное дыхание идёт у растений постоянно — и днём, и ночью.'],
  ['Молния никогда не бьёт в одно место дважды.', false, 'Высокие сооружения поражаются многократно.'],
  ['Самый распространённый газ в атмосфере — кислород.', false, 'Азот — 78 %.'],
  ['Бактерии могут быть полезны для человека.', true, 'Микробиом кишечника синтезирует витамины и защищает от патогенов.'],
  ['Вода закипает при 100 °C на любой высоте.', false, 'На высоте давление ниже — вода кипит при более низкой температуре.'],
  ['Человек использует только 10 % мозга.', false, 'Миф: разные области мозга активны в разное время, задействован весь мозг.'],
  ['Алмаз и графит состоят из одного элемента.', true, 'Оба — углерод.'],
  ['У человека 23 пары хромосом.', true, '46 хромосом.'],
  ['Свет быстрее звука.', true, '300 000 км/с против 340 м/с.'],
  ['Антибиотики убивают вирусы.', false, 'Антибиотики действуют на бактерии.'],
  ['Сердце находится строго слева.', false, 'Оно лежит почти посередине грудной клетки, смещено влево примерно на 2/3.'],
  ['Кислоты окрашивают лакмус в красный цвет.', true, 'Лакмус: кислая — красный, щелочная — синий.'],
  ['Масса тела на Луне меньше, чем на Земле.', false, 'Меньше вес; масса та же.'],
];

Views.games = () => h('div', null,
  UI.pageHeader('🎮 Игры', 'Короткие раунды для повторения на скорость. Рекорды сохраняются.'),
  h('div', { class: 'card-grid' }, GAMES.map(g => h('a', { class: 'card game-card', href: '#/games/' + g.id, style: { '--c': SUBJECTS[g.subject].color } },
    h('div', { class: 'game-icon' }, g.icon),
    h('div', null, h('b', null, g.title), h('div', { class: 'small muted' }, g.desc),
      Store.stats.gameBest[g.id] ? h('div', { class: 'tag ok' }, 'Рекорд: ' + Store.stats.gameBest[g.id]) : null)))));

// Быстрая игра: next() → { prompt (html), options: [..], answer: index, explain? }
function speedGame(root, ctx, { id, seconds = 60, next, intro }) {
  let score = 0, combo = 0, left = seconds, timer = null, current = null;
  const head = h('div', { class: 'game-head' });
  const stage = h('div', { class: 'game-stage' });
  const drawHead = () => {
    head.innerHTML = '';
    add(head, h('a', { class: 'icon-btn', href: '#/games', 'aria-label': 'Выйти' }, '✕'),
      h('span', { class: 'stat-chip' }, '⏱ ' + left), h('span', { class: 'stat-chip' }, '⭐ ' + score), combo >= 3 ? h('span', { class: 'stat-chip hot' }, '🔥 ×' + combo) : null);
  };
  const ask = () => {
    current = next();
    stage.innerHTML = '';
    const order = shuffle(current.options.map((_, i) => i));
    stage.append(h('div', { class: 'game-prompt', html: current.prompt }),
      h('div', { class: 'options grid' }, order.map((i, k) => h('button', {
        class: 'option', type: 'button',
        onclick: e => {
          const ok = i === current.answer;
          if (ok) { score += 1 + Math.floor(combo / 3); combo++; SFX.correct(); }
          else { combo = 0; SFX.wrong(); UI.toast('✗ ' + (current.explain || 'Верно: ' + stripTags(current.options[current.answer])), 'bad'); }
          e.currentTarget.classList.add(ok ? 'right' : 'wrong');
          drawHead();
          setTimeout(ask, ok ? 150 : 600);
        },
      }, h('span', { class: 'opt-key' }, k + 1), h('span', { html: current.options[i] })))));
  };
  const finish = () => {
    clearInterval(timer);
    Store.stats.games++;
    const best = Store.stats.gameBest[id] || 0;
    if (score > best) Store.stats.gameBest[id] = score;
    Store.save();
    Store.addXp(Math.min(40, 5 + score));
    stage.innerHTML = '';
    head.innerHTML = '';
    stage.appendChild(h('div', { class: 'card result center' }, h('div', { class: 'big-emoji' }, score > best ? '🏆' : '⏱'),
      h('h2', null, score > best ? 'Новый рекорд!' : 'Время вышло'), h('div', { class: 'result-score' }, score + ' очков'),
      h('p', { class: 'muted' }, 'Рекорд: ' + Math.max(best, score)),
      h('div', { class: 'row center' }, h('a', { class: 'btn', href: '#/games' }, 'Все игры'), h('button', { class: 'btn primary', type: 'button', onclick: start }, 'Ещё раз'))));
  };
  const start = () => {
    score = 0; combo = 0; left = seconds;
    drawHead(); ask();
    clearInterval(timer);
    timer = setInterval(() => { left--; drawHead(); if (left <= 0) finish(); }, 1000);
  };
  ctx.onCleanup(() => clearInterval(timer));
  const onKey = e => { const n = parseInt(e.key, 10); if (n >= 1 && n <= 4) stage.querySelectorAll('.option')[n - 1]?.click(); };
  document.addEventListener('keydown', onKey);
  ctx.onCleanup(() => document.removeEventListener('keydown', onKey));
  root.append(head, stage);
  stage.appendChild(h('div', { class: 'card center' }, h('p', null, intro), h('p', { class: 'muted small' }, `${seconds} секунд. Серия из 3 верных ответов подряд даёт бонус. Клавиши 1–4.`),
    h('button', { class: 'btn primary big', type: 'button', onclick: start }, '▶ Старт')));
}

function stripTags(html) { return String(html).replace(/<[^>]+>/g, ''); }

function choiceFrom(pool, correct, getLabel, n = 3) {
  const wrong = sample(pool.filter(x => getLabel(x) !== getLabel(correct)), n);
  return [correct, ...wrong].map(getLabel);
}

const GAME_SETUP = {
  elements: () => ({
    intro: 'Определите символ по названию элемента или название по символу.',
    next() {
      const pool = ELEMENTS.slice(0, 56);
      const e = pick(pool);
      const bySym = Math.random() < 0.5;
      const opts = bySym ? choiceFrom(pool, e, x => x.name) : choiceFrom(pool, e, x => x.sym);
      return { prompt: bySym ? `<span class="game-big">${e.sym}</span>` : `<span class="game-big">${e.name}</span>`, options: opts, answer: 0 };
    },
  }),
  molar: () => ({
    intro: 'Найдите верную молярную массу вещества (г/моль).',
    next() {
      const [f, name] = pick(COMMON_SUBSTANCES);
      const M = molarMass(f);
      const opts = [fmt(M), ...numDistractors(M, [M + 16, M - 2, M + 18, M + 1], 1)].slice(0, 4);
      return { prompt: `<span class="game-big">${chem(f)}</span><div class="muted">${name}</div>`, options: opts, answer: 0, explain: `M = ${fmt(M)} г/моль` };
    },
  }),
  classify: () => ({
    intro: 'К какому классу относится вещество?',
    next() {
      const [f, cls] = pick(CLASSIFY);
      const big = cls.includes('оксид') ? 'оксид' : cls.includes('основание') || cls === 'щёлочь' ? 'основание' : cls === 'амфотерный гидроксид' ? 'амфотерный гидроксид' : cls === 'кислота' ? 'кислота' : 'соль';
      const opts = ['оксид', 'основание', 'кислота', 'соль', 'амфотерный гидроксид'];
      const four = [big, ...sample(opts.filter(o => o !== big), 3)];
      return { prompt: `<span class="game-big">${chem(f)}</span>`, options: four, answer: 0, explain: `${f} — ${cls}` };
    },
  }),
  units: () => ({
    intro: 'В каких единицах СИ измеряется величина?',
    next() {
      const p = pick(UNIT_PAIRS);
      return { prompt: `<span class="game-big">${p[0]}</span>`, options: choiceFrom(UNIT_PAIRS, p, x => x[1]), answer: 0 };
    },
  }),
  dna: () => ({
    intro: 'Выберите цепь, комплементарную данной цепи ДНК.',
    next() {
      const seq = Array.from({ length: 6 }, () => pick(['A', 'T', 'G', 'C'])).join('');
      const right = complementDNA(seq);
      const wrongs = new Set();
      while (wrongs.size < 3) {
        const k = randInt(0, 5);
        const w = right.slice(0, k) + pick(['A', 'T', 'G', 'C'].filter(b => b !== right[k])) + right.slice(k + 1);
        if (w !== right) wrongs.add(w);
      }
      return { prompt: `<span class="game-big mono">${toRu(seq)}</span>`, options: [right, ...wrongs].map(x => `<span class="mono">${toRu(x)}</span>`), answer: 0 };
    },
  }),
  organs: () => ({
    intro: 'Что делает эта структура или вещество?',
    next() {
      const p = pick(ORGAN_PAIRS);
      return { prompt: `<span class="game-big">${p[0]}</span>`, options: choiceFrom(ORGAN_PAIRS, p, x => x[1]), answer: 0 };
    },
  }),
  truefalse: () => {
    const fromCourse = COURSE.flatMap(m => m.lessons.flatMap(l => l.quiz.filter(q => q.type === 'tf').map(q => [q.q, q.answer, q.explain])));
    const pool = [...fromCourse, ...TF_EXTRA];
    return {
      intro: 'Верно ли утверждение? Утверждения из уроков химии, физики и биологии.',
      next() {
        const [q, a, ex] = pick(pool);
        return { prompt: `<div class="game-statement">${rich(q)}</div>`, options: [a ? '👍 Верно' : '👎 Неверно', a ? '👎 Неверно' : '👍 Верно'], answer: 0, explain: ex };
      },
    };
  },
};

Views.game = ([id], ctx) => {
  const meta = GAMES.find(g => g.id === id);
  if (!meta) return Views.notFound();
  const root = h('div', { class: 'game-page', style: { '--c': SUBJECTS[meta.subject].color } });
  root.appendChild(h('h1', { class: 'center' }, meta.icon + ' ' + meta.title));
  if (id === 'memory') return memoryGame(root, ctx);
  if (id === 'marathon') return marathonGame(root, ctx);
  speedGame(root, ctx, { id, ...GAME_SETUP[id]() });
  return root;
};

function memoryGame(root, ctx) {
  const subSel = UIState.memorySubject || 'bio';
  const board = h('div', { class: 'memory-board' });
  const status = h('div', { class: 'row center' });
  let open = [], matched = 0, moves = 0, pairs = [];
  const start = sid => {
    UIState.memorySubject = sid;
    pairs = sample(GLOSSARY.filter(g => g.subject === sid && g.def.length < 90), 6);
    const tiles = shuffle(pairs.flatMap(p => [{ id: p.id, text: p.term, kind: 'term' }, { id: p.id, text: p.def, kind: 'def' }]));
    open = []; matched = 0; moves = 0;
    board.innerHTML = '';
    tiles.forEach(t => {
      const el = h('button', { class: 'mem-tile', type: 'button', onclick: () => flip(el, t) }, h('span', { class: 'mem-back' }, '?'), h('span', { class: 'mem-front ' + t.kind, html: rich(t.text) }));
      board.appendChild(el);
    });
    drawStatus();
  };
  const drawStatus = () => { status.innerHTML = ''; status.append(h('span', { class: 'stat-chip' }, `Ходов: ${moves}`), h('span', { class: 'stat-chip' }, `Пар: ${matched}/6`)); };
  const flip = (el, t) => {
    if (el.classList.contains('open') || open.length === 2) return;
    el.classList.add('open');
    open.push({ el, t });
    if (open.length === 2) {
      moves++;
      const [a, b] = open;
      if (a.t.id === b.t.id && a.t.kind !== b.t.kind) {
        a.el.classList.add('done'); b.el.classList.add('done'); matched++; open = []; SFX.correct();
        if (matched === 6) {
          Store.stats.games++;
          const score = Math.max(1, 30 - moves);
          if (score > (Store.stats.gameBest.memory || 0)) Store.stats.gameBest.memory = score;
          Store.save(); Store.addXp(15); UI.confetti();
          status.appendChild(h('button', { class: 'btn primary small', type: 'button', onclick: () => start(UIState.memorySubject) }, 'Ещё раз'));
        }
      } else setTimeout(() => { a.el.classList.remove('open'); b.el.classList.remove('open'); open = []; }, 900);
      drawStatus();
    }
  };
  root.append(h('div', { class: 'row center' }, UI.segmented([['chem', '⚗️ Химия'], ['phys', '🧲 Физика'], ['bio', '🧬 Биология']], subSel, start)), status, board);
  start(subSel);
  return root;
}

function marathonGame(root, ctx) {
  let level = 1;
  root.appendChild(h('p', { class: 'center muted' }, 'Случайные задачи из всех тренажёров. Каждые 5 верных ответов — уровень сложности выше. Три ошибки — конец.'));
  root.appendChild(QuizSession(i => {
    level = Math.min(4, 1 + Math.floor(i / 5));
    const pool = GENERATORS.filter(g => g.level <= level);
    const g = pick(pool);
    const q = genQuestion(g.id);
    q.tag = `Уровень ${level} · ${SUBJECTS[g.subject].icon} ${g.title}`;
    return q;
  }, {
    ctx, lives: 3, exitHref: '#/games',
    onAnswer: (ok, q) => { Store.trainerAnswer(q.gen, q.subject, ok, q.module); if (ok) Store.addXp(3); },
    onFinish: res => {
      Store.stats.games++;
      const best = Store.stats.gameBest.marathon || 0;
      if (res.correct > best) Store.stats.gameBest.marathon = res.correct;
      Store.save();
      return h('div', { class: 'card result center' }, h('div', { class: 'big-emoji' }, res.correct > best ? '🏆' : '🏁'),
        h('h2', null, res.correct > best ? 'Новый рекорд марафона!' : 'Финиш'),
        h('div', { class: 'result-score' }, `${res.correct} ${plural(res.correct, 'задача', 'задачи', 'задач')}`),
        h('p', { class: 'muted' }, `Рекорд: ${Math.max(best, res.correct)} · дошли до уровня ${level}`),
        h('div', { class: 'row center' }, h('a', { class: 'btn', href: '#/games' }, 'Все игры'), h('button', { class: 'btn primary', type: 'button', onclick: () => render() }, 'Ещё раз')));
    },
  }));
  return root;
}
