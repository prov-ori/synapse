// Курс: карта предмета, страница модуля, урок (теория) и тест урока.

Views.subject = ([sid]) => {
  const sub = SUBJECTS[sid];
  const root = h('div', { class: 'subject-page', style: { '--c': sub.color } });
  const ls = lessonsOf(sid);
  const done = ls.filter(l => Store.lessonDone(l.id)).length;
  const next = nextLesson(sid);
  root.appendChild(h('div', { class: 'card subject-hero' },
    h('div', { class: 'subject-hero-icon' }, sub.icon),
    h('div', { class: 'grow' },
      h('h1', null, sub.title),
      h('p', { class: 'muted' }, sub.tagline + ` · ${modulesOf(sid).length} модулей · ${ls.length} уроков`),
      UI.progressBar(done, ls.length, 'subj thick'),
      h('div', { class: 'row' },
        next ? h('a', { class: 'btn primary', href: '#/lesson/' + next.id }, done ? '▶ Продолжить' : '🚀 Начать') : null,
        h('a', { class: 'btn', href: '#/practice', onclick: () => { UIState.practiceFilter = sid; } }, '🏋️ Тренажёры'),
        h('a', { class: 'btn', href: '#/exam', onclick: () => { UIState.examSubject = sid; } }, '📝 Экзамен по предмету'))),
  ));

  for (const lvl of [1, 2, 3, 4]) {
    const mods = modulesOf(sid).filter(m => m.level === lvl);
    if (!mods.length) continue;
    root.appendChild(h('div', { class: 'level-head' },
      h('span', { class: 'level-pill l' + lvl }, `Уровень ${lvl} · ${LEVELS[lvl].name}`),
      h('span', { class: 'muted small' }, LEVELS[lvl].desc)));
    root.appendChild(h('div', { class: 'module-grid' }, mods.map(m => moduleCard(m))));
  }
  return root;
};

function moduleCard(m) {
  const d = m.lessons.filter(l => Store.lessonDone(l.id)).length;
  const stars = m.lessons.reduce((a, l) => a + Store.lessonStars(l.id), 0);
  const complete = d === m.lessons.length;
  return h('a', { class: 'card module-card' + (complete ? ' complete' : d ? ' started' : ''), href: '#/module/' + m.id },
    h('div', { class: 'module-icon' }, m.icon),
    h('div', { class: 'grow' },
      h('h3', null, m.title),
      h('p', { class: 'muted small' }, m.desc),
      h('div', { class: 'row between small' },
        h('span', { class: 'muted' }, `${d}/${m.lessons.length} ${plural(m.lessons.length, 'урок', 'урока', 'уроков')}`),
        h('span', { class: 'stars-count' }, '★ ' + stars + '/' + m.lessons.length * 3)),
      UI.progressBar(d, m.lessons.length)));
}

function moduleTrainers(m) {
  const ids = new Set(m.trainers);
  GENERATORS.filter(g => g.module === m.id).forEach(g => ids.add(g.id));
  return [...ids].map(id => GEN_MAP[id]).filter(Boolean);
}

Views.module = ([mid]) => {
  const m = MODULE_MAP[mid];
  if (!m) return Views.notFound();
  const sub = SUBJECTS[m.subject];
  const root = h('div', { class: 'module-page', style: { '--c': sub.color } });
  root.appendChild(UI.pageHeader(m.icon + ' ' + m.title, m.desc, '#/subject/' + m.subject));
  root.appendChild(h('div', { class: 'chips' },
    h('span', { class: 'level-pill l' + m.level }, `Уровень ${m.level} · ${LEVELS[m.level].name}`),
    h('span', { class: 'tag' }, sub.icon + ' ' + sub.title)));

  root.appendChild(h('div', { class: 'lesson-list' }, m.lessons.map((l, i) => {
    const st = Store.state.lessons[l.id];
    return h('a', { class: 'card lesson-row' + (st ? ' done' : ''), href: '#/lesson/' + l.id },
      h('div', { class: 'lesson-num' }, st ? '✓' : i + 1),
      h('div', { class: 'grow' },
        h('b', null, l.title),
        h('div', { class: 'small muted' }, `${l.theory.length} ${plural(l.theory.length, 'блок', 'блока', 'блоков')} теории · ${l.quiz.length} ${plural(l.quiz.length, 'вопрос', 'вопроса', 'вопросов')}` + (st ? ` · лучший результат ${Math.round(st.best * 100)}%` : ''))),
      UI.stars(Store.lessonStars(l.id)));
  })));

  const trainers = moduleTrainers(m);
  if (trainers.length) {
    root.appendChild(h('h2', { class: 'section-title' }, '🏋️ Тренажёры по теме'));
    root.appendChild(h('div', { class: 'card-grid' }, trainers.map(trainerCard)));
  }
  const terms = GLOSSARY.filter(g => g.module === m.id);
  if (terms.length) {
    root.appendChild(h('h2', { class: 'section-title' }, '📖 Ключевые термины'));
    root.appendChild(h('div', { class: 'card terms' }, h('dl', null, terms.map(t => [h('dt', null, t.term), h('dd', { html: rich(t.def) })]))));
  }
  return root;
};

// ---------- Урок: теория ----------

function renderBlock(b) {
  if (typeof b === 'string') return h('p', { html: rich(b) });
  if (b.h) return h('h3', { class: 'theory-h' }, b.h);
  if (b.key) return h('div', { class: 'callout key' }, h('div', { class: 'callout-label' }, '🔑 Главное'), h('div', { html: rich(b.key) }));
  if (b.med) return h('div', { class: 'callout med' }, h('div', { class: 'callout-label' }, '🩺 В медицине'), h('div', { html: rich(b.med) }));
  if (b.fact) return h('div', { class: 'callout fact' }, h('div', { class: 'callout-label' }, '✨ Интересно'), h('div', { html: rich(b.fact) }));
  if (b.warn) return h('div', { class: 'callout warn' }, h('div', { class: 'callout-label' }, '⚠️ Частая ошибка'), h('div', { html: rich(b.warn) }));
  if (b.f) return h('div', { class: 'formula' }, h('div', { class: 'formula-main', html: rich(b.f) }), b.note ? h('div', { class: 'formula-note', html: rich(b.note) }) : null);
  if (b.list) return h('ul', { class: 'theory-list' }, b.list.map(x => h('li', { html: rich(x) })));
  if (b.ol) return h('ol', { class: 'theory-list' }, b.ol.map(x => h('li', { html: rich(x) })));
  if (b.table) return h('div', { class: 'table-wrap' }, h('table', { class: 'data-table' },
    h('thead', null, h('tr', null, b.table.map(c => h('th', { html: rich(c) })))),
    h('tbody', null, b.rows.map(r => h('tr', null, r.map(c => h('td', { html: rich(c) })))))));
  if (b.q) {
    const wrap = h('div', { class: 'inline-q' }, h('div', { class: 'callout-label' }, '❓ Проверь себя'));
    wrap.appendChild(renderQuestion(b.q, { compact: true, onAnswer: ok => Store.answer(ok) }));
    return wrap;
  }
  if (b.lab) {
    const lab = LAB_MAP[b.lab];
    if (!lab) return null;
    return h('a', { class: 'callout lab-link', href: '#/labs/' + b.lab },
      h('div', { class: 'lab-link-icon' }, lab.icon),
      h('div', null, h('div', { class: 'callout-label' }, '🔬 Лаборатория: ' + lab.title), h('div', null, b.text || lab.desc)),
      h('span', { class: 'lab-arrow' }, '→'));
  }
  if (b.gen) {
    const g = GEN_MAP[b.gen];
    return h('a', { class: 'callout gen-link', href: '#/practice/' + g.id },
      h('div', { class: 'lab-link-icon' }, g.icon),
      h('div', null, h('div', { class: 'callout-label' }, '🏋️ Тренажёр: ' + g.title), h('div', null, g.desc + ' — бесконечные задачи с решениями')),
      h('span', { class: 'lab-arrow' }, '→'));
  }
  return null;
}

Views.lesson = ([lid]) => {
  const l = LESSON_MAP[lid];
  if (!l) return Views.notFound();
  const m = MODULE_MAP[l.module];
  const sub = SUBJECTS[m.subject];
  const all = lessonsOf(m.subject);
  const pos = all.indexOf(l);
  const prev = all[pos - 1], next = all[pos + 1];

  const root = h('article', { class: 'lesson-page', style: { '--c': sub.color } });
  root.appendChild(h('div', { class: 'crumbs small' },
    h('a', { href: '#/subject/' + m.subject }, sub.icon + ' ' + sub.title), ' / ',
    h('a', { href: '#/module/' + m.id }, m.title), ' / ',
    h('span', { class: 'muted' }, `урок ${l.index + 1} из ${m.lessons.length}`)));
  root.appendChild(h('h1', { class: 'lesson-title' }, l.title));
  const progress = h('div', { class: 'read-progress' }, h('div', { class: 'read-progress-fill' }));
  root.appendChild(progress);

  const body = h('div', { class: 'theory' });
  for (const b of l.theory) {
    const el = renderBlock(b);
    if (el) body.appendChild(el);
  }
  root.appendChild(body);

  const st = Store.state.lessons[l.id];
  root.appendChild(h('div', { class: 'card lesson-cta center' },
    h('h2', null, st ? 'Пройти тест ещё раз?' : 'Готовы проверить себя?'),
    h('p', { class: 'muted' }, `${l.quiz.length} ${plural(l.quiz.length, 'вопрос', 'вопроса', 'вопросов')}. Ошибки вернутся в конце теста. ` + (st ? `Ваш лучший результат: ${Math.round(st.best * 100)}%.` : '')),
    h('a', { class: 'btn primary big', href: '#/lesson/' + l.id + '/quiz' }, '📝 Начать тест')));

  root.appendChild(h('div', { class: 'row between lesson-nav' },
    prev ? h('a', { class: 'btn small', href: '#/lesson/' + prev.id }, '← ' + prev.title) : h('span'),
    next ? h('a', { class: 'btn small', href: '#/lesson/' + next.id }, next.title + ' →') : h('span')));

  // Индикатор прочитанного
  const onScroll = () => {
    const r = body.getBoundingClientRect();
    const total = r.height - innerHeight * 0.6;
    const pct = clamp((-r.top + 80) / Math.max(1, total), 0, 1);
    progress.firstChild.style.width = pct * 100 + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  ctxCleanup(() => window.removeEventListener('scroll', onScroll));
  return root;
};

// Регистрирует очистку для текущего экрана (когда ctx недоступен напрямую)
function ctxCleanup(f) { currentCleanup.push(f); }

// ---------- Тест урока ----------

Views.lessonQuiz = ([lid], ctx) => {
  const l = LESSON_MAP[lid];
  if (!l) return Views.notFound();
  const m = MODULE_MAP[l.module];
  const questions = shuffle(l.quiz);
  const root = h('div', { class: 'lesson-quiz', style: { '--c': SUBJECTS[m.subject].color } });
  root.appendChild(QuizSession(questions, {
    ctx, repeatWrong: true, exitHref: '#/lesson/' + l.id,
    onAnswer: ok => Store.answer(ok, m.id),
    onFinish: res => lessonResult(l, res),
  }));
  return root;
};

function lessonResult(l, res) {
  const m = MODULE_MAP[l.module];
  const acc = res.total ? res.correct / res.total : 0;
  const firstTime = !Store.lessonDone(l.id);
  const stars = Store.completeLesson(l.id, acc);
  const xp = 10 + res.correct * 3 + (acc >= 1 ? 10 : 0) + (firstTime ? 10 : 0);
  // термины модуля → в карточки
  let added = 0;
  for (const g of GLOSSARY.filter(g => g.module === m.id)) if (Store.srsAdd(g.id)) added++;
  Store.addXp(xp);
  if (acc >= 0.8) { UI.confetti(); SFX.finish(); }
  updateHeader();

  const all = lessonsOf(m.subject);
  const next = all[all.indexOf(l) + 1];
  const trainers = moduleTrainers(m).slice(0, 3);
  const wrong = res.log.filter(x => !x.ok);
  return h('div', { class: 'card result center' },
    h('div', { class: 'big-emoji' }, acc >= 1 ? '🏆' : acc >= 0.8 ? '🎉' : acc >= 0.5 ? '👍' : '📚'),
    h('h2', null, acc >= 1 ? 'Безупречно!' : acc >= 0.8 ? 'Отличный результат!' : acc >= 0.5 ? 'Неплохо!' : 'Стоит повторить теорию'),
    UI.stars(stars),
    h('div', { class: 'result-score' }, `${res.correct} из ${res.total}`),
    h('p', { class: 'muted' }, `+${xp} XP · ${fmtTime(res.seconds)}` + (added ? ` · ${added} ${plural(added, 'термин', 'термина', 'терминов')} добавлено в карточки` : '')),
    wrong.length ? h('details', { class: 'mistakes' }, h('summary', null, `Разбор ошибок (${wrong.length})`),
      wrong.map(x => h('div', { class: 'mistake-item' }, h('div', { html: rich(x.q.q) }), x.q.explain ? h('div', { class: 'small muted', html: rich(x.q.explain) }) : null))) : null,
    h('div', { class: 'row center' },
      acc < 0.8 ? h('a', { class: 'btn', href: '#/lesson/' + l.id }, '📖 Перечитать теорию') : null,
      h('a', { class: 'btn', href: '#/lesson/' + l.id + '/quiz', onclick: e => { e.preventDefault(); render(); } }, '🔁 Ещё раз'),
      next ? h('a', { class: 'btn primary', href: '#/lesson/' + next.id }, 'Следующий урок →') : h('a', { class: 'btn primary', href: '#/subject/' + m.subject }, 'К предмету')),
    trainers.length ? h('div', { class: 'result-trainers' },
      h('div', { class: 'small muted' }, 'Закрепить навык в тренажёре:'),
      h('div', { class: 'row center' }, trainers.map(g => h('a', { class: 'chip', href: '#/practice/' + g.id }, g.icon + ' ' + g.title)))) : null);
}
