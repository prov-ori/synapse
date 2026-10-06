// Карточки: интервальное повторение терминов (упрощённый SM-2) и обзор колоды.

Views.cards = () => {
  const root = h('div');
  const due = Store.srsDue();
  const deck = Object.keys(Store.state.srs).filter(id => GLOSSARY_MAP[id]);
  root.appendChild(UI.pageHeader('🃏 Карточки', 'Термины из пройденных модулей. Алгоритм интервального повторения показывает карточку в момент, когда вы вот-вот её забудете.'));

  const stage = h('div');
  root.appendChild(stage);

  const review = (queue) => {
    let i = 0, flipped = false;
    const total = queue.length;
    const reverse = Math.random() < 0.5;
    const drawCard = () => {
      stage.innerHTML = '';
      if (i >= queue.length) {
        Store.addXp(Math.min(30, total * 2));
        stage.appendChild(h('div', { class: 'card result center' }, h('div', { class: 'big-emoji' }, '🧠'), h('h2', null, 'Повторение завершено!'),
          h('p', { class: 'muted' }, `${total} ${plural(total, 'карточка', 'карточки', 'карточек')}. Следующие появятся, когда подойдёт срок.`),
          h('a', { class: 'btn primary', href: '#/' }, 'На главную')));
        updateHeader();
        return;
      }
      const g = GLOSSARY_MAP[queue[i]];
      const sub = SUBJECTS[g.subject];
      const front = reverse ? h('div', { class: 'flash-def', html: rich(g.def) }) : h('div', { class: 'flash-term' }, g.term);
      const back = reverse ? h('div', { class: 'flash-term' }, g.term) : h('div', { class: 'flash-def', html: rich(g.def) });
      const card = h('div', { class: 'flashcard' + (flipped ? ' flipped' : ''), style: { '--c': sub.color }, onclick: () => { if (!flipped) { flipped = true; drawCard(); } } },
        h('div', { class: 'flash-meta' }, sub.icon + ' ' + (MODULE_MAP[g.module]?.title || '')),
        front,
        flipped ? h('div', { class: 'flash-back' }, back) : h('div', { class: 'muted small' }, reverse ? 'Какой это термин? Нажмите, чтобы проверить' : 'Вспомните определение и нажмите на карточку'));
      const grade = n => { Store.srsGrade(g.id, n); if (n === 0) queue.push(g.id); i++; flipped = false; drawCard(); };
      stage.append(
        h('div', { class: 'row between' }, h('span', { class: 'muted small' }, `${i + 1} / ${queue.length}`), UI.progressBar(i, queue.length, 'grow')),
        card,
        flipped ? h('div', { class: 'grade-row' },
          h('button', { class: 'btn grade g0', type: 'button', onclick: () => grade(0) }, 'Не помню', h('small', null, '< 1 мин')),
          h('button', { class: 'btn grade g1', type: 'button', onclick: () => grade(1) }, 'Трудно'),
          h('button', { class: 'btn grade g2', type: 'button', onclick: () => grade(2) }, 'Хорошо'),
          h('button', { class: 'btn grade g3', type: 'button', onclick: () => grade(3) }, 'Легко')) :
          h('div', { class: 'center' }, h('button', { class: 'btn primary big', type: 'button', onclick: () => { flipped = true; drawCard(); } }, 'Показать ответ')));
    };
    drawCard();
  };

  if (due.length) {
    stage.appendChild(h('div', { class: 'card center' },
      h('div', { class: 'big-emoji' }, '⏰'),
      h('h2', null, `Пора повторить: ${due.length} ${plural(due.length, 'карточка', 'карточки', 'карточек')}`),
      h('button', { class: 'btn primary big', type: 'button', onclick: () => review(due.slice(0, 40)) }, '▶ Начать повторение')));
  } else if (deck.length) {
    stage.appendChild(h('div', { class: 'card center' }, h('div', { class: 'big-emoji' }, '✅'), h('h2', null, 'На сегодня всё повторено'),
      h('p', { class: 'muted' }, 'Можно добавить новые термины ниже или повторить колоду досрочно.'),
      h('button', { class: 'btn', type: 'button', onclick: () => review(shuffle(deck).slice(0, 20)) }, 'Повторить 20 случайных')));
  } else {
    stage.appendChild(h('div', { class: 'card center' }, h('div', { class: 'big-emoji' }, '🃏'), h('h2', null, 'Колода пуста'),
      h('p', { class: 'muted' }, 'Термины модуля попадают сюда после прохождения любого его урока. Или добавьте их вручную ниже.')));
  }

  // Обзор колоды по модулям
  root.appendChild(h('h2', { class: 'section-title' }, 'Колоды по темам'));
  for (const sid of Object.keys(SUBJECTS)) {
    const mods = modulesOf(sid).filter(m => GLOSSARY.some(g => g.module === m.id));
    root.appendChild(h('div', { class: 'card' },
      h('h3', null, SUBJECTS[sid].icon + ' ' + SUBJECTS[sid].title),
      h('div', { class: 'deck-list' }, mods.map(m => {
        const terms = GLOSSARY.filter(g => g.module === m.id);
        const inDeck = terms.filter(g => Store.srsHas(g.id));
        const strength = inDeck.length ? inDeck.reduce((a, g) => a + Store.srsStrength(g.id), 0) / terms.length : 0;
        const btn = h('button', {
          class: 'btn small', type: 'button', disabled: inDeck.length === terms.length,
          onclick: () => { terms.forEach(g => Store.srsAdd(g.id)); Store.checkAchievements(); render(); },
        }, inDeck.length === terms.length ? '✓ в колоде' : '+ добавить');
        return h('div', { class: 'deck-row' },
          h('span', { class: 'grow' }, m.title, h('span', { class: 'muted small' }, ` · ${inDeck.length}/${terms.length}`)),
          h('div', { class: 'deck-strength', title: 'Прочность запоминания' }, UI.progressBar(strength, 1)),
          btn);
      }))));
  }
  return root;
};
