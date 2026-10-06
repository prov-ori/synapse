// Пробный экзамен: смешанный тест с таймером, разбор по темам, история попыток.

Views.exam = (_, ctx) => {
  const root = h('div');
  const cfg = { subject: UIState.examSubject || 'mix', count: 20, minutes: 30, level: 4 };
  const setup = () => {
    root.innerHTML = '';
    root.appendChild(UI.pageHeader('📝 Пробный экзамен', 'Смешанный тест из вопросов курса и задач тренажёров. После теста — разбор слабых тем со ссылками на уроки.'));
    const card = h('div', { class: 'card exam-setup' });
    const seg = (label, opts, key) => h('div', { class: 'field' }, h('div', { class: 'label' }, label), UI.segmented(opts, cfg[key], v => { cfg[key] = v; if (key === 'subject') UIState.examSubject = v; }));
    card.append(
      seg('Предмет', [['mix', '🔀 Все три'], ['chem', '⚗️ Химия'], ['phys', '🧲 Физика'], ['bio', '🧬 Биология']], 'subject'),
      seg('Сложность', [[2, 'До базы'], [3, 'До профиля'], [4, 'Полная (медвуз)']], 'level'),
      seg('Число вопросов', [[10, '10'], [20, '20'], [40, '40'], [60, '60']], 'count'),
      seg('Время', [[0, 'Без таймера'], [15, '15 мин'], [30, '30 мин'], [60, '60 мин'], [120, '2 часа']], 'minutes'),
      h('button', { class: 'btn primary big', type: 'button', onclick: start }, '▶ Начать экзамен'));
    root.appendChild(card);
    const hist = Store.state.exams;
    if (hist.length) {
      root.appendChild(h('h2', { class: 'section-title' }, 'История попыток'));
      root.appendChild(h('div', { class: 'card' }, h('div', { class: 'table-wrap' }, h('table', { class: 'data-table' },
        h('thead', null, h('tr', null, h('th', null, 'Дата'), h('th', null, 'Предмет'), h('th', null, 'Результат'), h('th', null, 'Время'))),
        h('tbody', null, hist.slice(0, 15).map(e => h('tr', null,
          h('td', null, new Date(e.date).toLocaleDateString('ru-RU')),
          h('td', null, e.subject === 'mix' ? 'Все' : SUBJECTS[e.subject].title),
          h('td', null, h('b', null, Math.round(e.score / e.total * 100) + '%'), ` (${e.score}/${e.total})`),
          h('td', null, fmtTime(e.seconds)))))))));
    }
  };

  const buildPool = () => {
    const subs = cfg.subject === 'mix' ? ['chem', 'phys', 'bio'] : [cfg.subject];
    const qs = [];
    const perSub = Math.ceil(cfg.count / subs.length);
    for (const s of subs) {
      const course = shuffle(courseQuestions(s, cfg.level).filter(q => q.type !== 'tf'));
      const gens = GENERATORS.filter(g => g.subject === s && g.level <= cfg.level);
      const nGen = Math.round(perSub * 0.4);
      const picked = course.slice(0, perSub - nGen);
      for (let i = 0; i < nGen; i++) picked.push(genQuestion(pick(gens).id));
      picked.forEach(q => { q.tag = SUBJECTS[s].icon + ' ' + (MODULE_MAP[q.module]?.title || ''); });
      qs.push(...picked);
    }
    return shuffle(qs).slice(0, cfg.count);
  };

  const start = () => {
    root.innerHTML = '';
    const pool = buildPool();
    document.body.classList.add('focus-mode');
    ctx.onCleanup(() => document.body.classList.remove('focus-mode'));
    root.appendChild(QuizSession(pool, {
      ctx, timer: cfg.minutes ? cfg.minutes * 60 : 0, exitHref: '#/exam',
      onAnswer: (ok, q) => Store.answer(ok, q.module),
      onFinish: res => examResult(res, pool),
    }));
  };

  const examResult = (res, pool) => {
    document.body.classList.remove('focus-mode');
    const total = pool.length;
    const byModule = {};
    for (const { q, ok } of res.log) {
      const m = q.module || 'other';
      byModule[m] = byModule[m] || { ok: 0, all: 0 };
      byModule[m].all++;
      if (ok) byModule[m].ok++;
    }
    Store.saveExam({ date: Date.now(), subject: cfg.subject, score: res.correct, total, seconds: res.seconds, byModule });
    const pct = Math.round(res.correct / total * 100);
    Store.addXp(20 + res.correct * 3);
    if (pct >= 80) UI.confetti();
    const weak = Object.entries(byModule).filter(([id, v]) => MODULE_MAP[id] && v.ok < v.all).sort((a, b) => (a[1].ok / a[1].all) - (b[1].ok / b[1].all));
    const verdict = pct >= 90 ? 'Уровень сильного абитуриента медвуза.' : pct >= 75 ? 'Хороший уровень — осталось закрыть отдельные темы.' : pct >= 50 ? 'База есть, но для медвуза нужно подтянуть слабые темы.' : 'Начните с уроков по слабым темам ниже.';
    return h('div', null,
      h('div', { class: 'card result center' },
        h('div', { class: 'big-emoji' }, pct >= 90 ? '🏆' : pct >= 75 ? '🎉' : pct >= 50 ? '📈' : '📚'),
        h('h2', null, `Результат: ${pct}%`),
        h('div', { class: 'result-score' }, `${res.correct} из ${total}`),
        h('p', { class: 'muted' }, (res.timeUp ? '⏱ Время вышло. ' : '') + `Затрачено ${fmtTime(res.seconds)}. ${verdict}`),
        h('div', { class: 'row center' }, h('button', { class: 'btn', type: 'button', onclick: setup }, '⚙ Настроить заново'), h('button', { class: 'btn primary', type: 'button', onclick: start }, '🔁 Новый вариант'))),
      weak.length ? h('div', { class: 'card' }, h('h3', null, '🎯 Что подтянуть'),
        h('div', { class: 'weak-list' }, weak.map(([id, v]) => {
          const m = MODULE_MAP[id];
          return h('a', { class: 'weak-item', href: '#/module/' + id },
            h('span', null, SUBJECTS[m.subject].icon + ' ' + m.title),
            h('span', { class: 'muted small' }, `${v.ok}/${v.all} верно`),
            UI.progressBar(v.ok, v.all));
        }))) : null,
      h('details', { class: 'card mistakes' }, h('summary', null, 'Разбор всех вопросов'),
        res.log.map(({ q, ok }) => h('div', { class: 'mistake-item ' + (ok ? 'ok' : 'bad') },
          h('div', { html: (ok ? '✅ ' : '❌ ') + rich(q.q) }),
          q.explain ? h('div', { class: 'small muted', html: rich(q.explain) }) : null))));
  };

  setup();
  return root;
};
