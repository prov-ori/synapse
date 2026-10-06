// Тренажёры: каталог генераторов задач и бесконечная тренировка с пошаговыми решениями.

const MASTERY = [
  { name: 'не начат', cls: 'm0' }, { name: 'новичок', cls: 'm1' }, { name: 'уверенно', cls: 'm2' }, { name: 'мастер', cls: 'm3' },
];

function trainerCard(g) {
  const t = Store.trainer(g.id);
  const ms = MASTERY[Store.mastery(g.id)];
  return h('a', { class: 'card trainer-card', href: '#/practice/' + g.id, style: { '--c': SUBJECTS[g.subject].color } },
    h('div', { class: 'trainer-icon' }, g.icon),
    h('div', { class: 'grow' },
      h('b', null, g.title),
      h('div', { class: 'small muted' }, g.desc),
      h('div', { class: 'row small' },
        h('span', { class: 'mastery ' + ms.cls }, ms.name),
        t.done ? h('span', { class: 'muted' }, `✔ ${t.correct}/${t.done} · рекорд серии ${t.best}`) : h('span', { class: 'muted' }, LEVELS[g.level].name))));
}

Views.practice = () => {
  const root = h('div');
  root.appendChild(UI.pageHeader('🏋️ Тренажёры', `${GENERATORS.length} генераторов создают бесконечное число задач. К каждой — пошаговое решение. Решите 20 задач с точностью 85 % — получите уровень «мастер».`));
  const list = h('div');
  const draw = filter => {
    UIState.practiceFilter = filter;
    list.innerHTML = '';
    const subs = filter === 'all' ? Object.keys(SUBJECTS) : [filter];
    list.appendChild(h('div', { class: 'card-grid mix-row' }, subs.map(s => h('a', { class: 'card mix-card', href: '#/practice/mix-' + s, style: { '--c': SUBJECTS[s].color } },
      h('div', { class: 'trainer-icon' }, '🎲'),
      h('div', null, h('b', null, 'Микс: ' + SUBJECTS[s].title), h('div', { class: 'small muted' }, 'Случайные задачи из всех тренажёров предмета'))))));
    for (const s of subs) {
      if (filter === 'all') list.appendChild(h('h2', { class: 'section-title' }, SUBJECTS[s].icon + ' ' + SUBJECTS[s].title));
      for (const lvl of [1, 2, 3, 4]) {
        const gens = GENERATORS.filter(g => g.subject === s && g.level === lvl);
        if (!gens.length) continue;
        list.appendChild(h('div', { class: 'level-head' }, h('span', { class: 'level-pill l' + lvl }, `${LEVELS[lvl].name}`)));
        list.appendChild(h('div', { class: 'card-grid' }, gens.map(trainerCard)));
      }
    }
  };
  root.appendChild(UI.segmented([['all', 'Все'], ['chem', '⚗️ Химия'], ['phys', '🧲 Физика'], ['bio', '🧬 Биология']], UIState.practiceFilter, draw));
  root.appendChild(list);
  draw(UIState.practiceFilter);
  return root;
};

Views.trainer = ([id], ctx) => {
  const mix = id.startsWith('mix-') ? id.slice(4) : null;
  if (mix && !SUBJECTS[mix]) return Views.notFound();
  const g = mix ? null : GEN_MAP[id];
  if (!mix && !g) return Views.notFound();
  const subject = mix || g.subject;
  const pool = mix ? GENERATORS.filter(x => x.subject === mix) : [g];

  const root = h('div', { class: 'trainer-page', style: { '--c': SUBJECTS[subject].color } });
  const statsBox = h('div', { class: 'trainer-stats' });
  let sessionCorrect = 0, sessionDone = 0, streak = 0;
  const drawStats = () => {
    statsBox.innerHTML = '';
    add(statsBox, 
      h('span', { class: 'stat-chip' }, '✔ ', sessionCorrect, ' / ', sessionDone),
      h('span', { class: 'stat-chip' + (streak >= 3 ? ' hot' : '') }, '⚡ серия ', streak),
      g ? h('span', { class: 'mastery ' + MASTERY[Store.mastery(g.id)].cls }, MASTERY[Store.mastery(g.id)].name) : null);
  };
  root.appendChild(h('div', { class: 'trainer-head' },
    h('div', null,
      h('a', { class: 'back-link', href: '#/practice' }, '← Все тренажёры'),
      h('h1', null, mix ? `🎲 Микс: ${SUBJECTS[mix].title}` : `${g.icon} ${g.title}`),
      h('p', { class: 'muted small' }, mix ? 'Задачи из всех тренажёров предмета вперемешку' : g.desc)),
    statsBox));
  drawStats();

  const make = () => {
    const gen = pick(pool);
    const q = genQuestion(gen.id);
    q.tag = mix ? gen.icon + ' ' + gen.title : null;
    return q;
  };
  root.appendChild(QuizSession(() => make(), {
    ctx, exitHref: '#/practice',
    onAnswer: (ok, q) => {
      sessionDone++;
      Store.trainerAnswer(q.gen, q.subject, ok, q.module);
      if (ok) {
        sessionCorrect++; streak++;
        Store.addXp(streak > 0 && streak % 5 === 0 ? 10 : 4);
        if (streak % 5 === 0) UI.toast(`⚡ Серия ${streak}! Бонус XP`, 'gold');
      } else streak = 0;
      drawStats();
    },
  }));
  return root;
};
