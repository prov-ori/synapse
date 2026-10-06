// Профиль: уровень, прогресс по предметам, активность, достижения; настройки и перенос прогресса.

Views.profile = () => {
  const st = Store.state;
  const lvl = Store.level();
  const root = h('div');
  const name = Store.settings.name || 'Будущий врач';
  root.appendChild(h('div', { class: 'card profile-hero' },
    h('div', { class: 'avatar' }, name[0].toUpperCase()),
    h('div', { class: 'grow' },
      h('h1', null, name),
      h('div', { class: 'muted' }, `Уровень ${lvl.level} · ${rankName(lvl.level)}`),
      UI.progressBar(lvl.into, lvl.need, 'thick'),
      h('div', { class: 'small muted' }, `${lvl.into} / ${lvl.need} XP до уровня ${lvl.level + 1}`)),
    h('a', { class: 'btn', href: '#/settings' }, '⚙ Настройки')));

  const solved = st.stats.solved.chem + st.stats.solved.phys + st.stats.solved.bio;
  const acc = st.stats.correct + st.stats.wrong ? Math.round(st.stats.correct / (st.stats.correct + st.stats.wrong) * 100) : 0;
  root.appendChild(h('div', { class: 'stat-grid' },
    [['⭐', st.xp, 'XP всего'], ['🔥', st.streak, 'серия дней (рекорд ' + st.bestStreak + ')'], ['📗', Object.keys(st.lessons).filter(id => LESSON_MAP[id]).length, 'уроков пройдено'],
      ['🧮', solved, 'задач решено'], ['🎯', acc + '%', 'точность ответов'], ['🃏', Object.keys(st.srs).length, 'карточек в колоде'],
      ['🔬', Object.keys(st.labs).length + '/' + LAB_LIST.length, 'лабораторий открыто'], ['📝', st.stats.exams, 'экзаменов (лучший ' + st.stats.bestExam + '%)']]
      .map(([i, v, l]) => h('div', { class: 'card stat-tile' }, h('div', { class: 'stat-icon' }, i), h('div', { class: 'stat-val' }, v), h('div', { class: 'small muted' }, l)))));

  // Прогресс по предметам
  root.appendChild(h('h2', { class: 'section-title' }, 'Прогресс по предметам'));
  root.appendChild(h('div', { class: 'card' }, Object.values(SUBJECTS).map(sub => {
    const ls = lessonsOf(sub.id);
    const d = ls.filter(l => Store.lessonDone(l.id)).length;
    const gens = GENERATORS.filter(g => g.subject === sub.id);
    const masters = gens.filter(g => Store.mastery(g.id) === 3).length;
    return h('div', { class: 'subj-progress', style: { '--c': sub.color } },
      h('div', { class: 'row between' }, h('b', null, sub.icon + ' ' + sub.title), h('span', { class: 'small muted' }, `${d}/${ls.length} уроков · мастер в ${masters}/${gens.length} тренажёрах`)),
      UI.progressBar(d, ls.length, 'subj'));
  })));

  // Тепловая карта активности (18 недель)
  root.appendChild(h('h2', { class: 'section-title' }, 'Активность'));
  const weeks = 18;
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - (weeks * 7 - 1) - ((today.getDay() + 6) % 7));
  const cells = [];
  for (let i = 0; i < weeks * 7 + ((today.getDay() + 6) % 7) + 1; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    if (d > today) break;
    const xp = st.activity[todayKey(d)] || 0;
    const lvlC = xp === 0 ? 0 : xp < 30 ? 1 : xp < 80 ? 2 : xp < 150 ? 3 : 4;
    cells.push(h('div', { class: 'hm-cell hm' + lvlC, title: `${d.toLocaleDateString('ru-RU')}: ${xp} XP`, style: { gridRow: ((d.getDay() + 6) % 7) + 1 } }));
  }
  root.appendChild(h('div', { class: 'card' }, h('div', { class: 'heatmap' }, cells), h('div', { class: 'small muted' }, 'Каждая клетка — день; чем ярче, тем больше XP.')));

  // Достижения
  const got = ACHIEVEMENTS.filter(a => st.achievements[a.id]).length;
  root.appendChild(h('h2', { class: 'section-title' }, `Достижения (${got}/${ACHIEVEMENTS.length})`));
  root.appendChild(h('div', { class: 'ach-grid' }, ACHIEVEMENTS.map(a => h('div', { class: 'card ach' + (st.achievements[a.id] ? ' got' : '') },
    h('div', { class: 'ach-icon' }, a.icon), h('b', null, a.title), h('div', { class: 'small muted' }, a.desc)))));
  return root;
};

Views.settings = () => {
  const s0 = Store.settings;
  const root = h('div');
  root.appendChild(UI.pageHeader('⚙ Настройки', null, '#/profile'));
  const nameInput = h('input', { type: 'text', value: s0.name, placeholder: 'Как к вам обращаться?', maxlength: 30, onchange: e => { s0.name = e.target.value.trim(); Store.save(); } });
  const goal = h('select', { 'aria-label': 'Цель дня', onchange: e => { s0.dailyGoal = +e.target.value; Store.save(); } },
    [[30, '30 XP — лёгкий темп'], [60, '60 XP — обычный'], [120, '120 XP — интенсив'], [200, '200 XP — подготовка к экзамену']].map(([v, l]) => h('option', { value: v, selected: s0.dailyGoal === v }, l)));
  const theme = h('select', { 'aria-label': 'Тема', onchange: e => { s0.theme = e.target.value; Store.save(); applyTheme(); } },
    [['auto', 'Как в системе'], ['light', 'Светлая'], ['dark', 'Тёмная']].map(([v, l]) => h('option', { value: v, selected: s0.theme === v }, l)));
  root.appendChild(h('div', { class: 'card settings' },
    h('label', { class: 'field' }, h('div', { class: 'label' }, 'Имя'), nameInput),
    h('label', { class: 'field' }, h('div', { class: 'label' }, 'Цель дня'), goal),
    h('label', { class: 'field' }, h('div', { class: 'label' }, 'Тема оформления'), theme),
    h('label', { class: 'switch' }, h('input', { type: 'checkbox', checked: s0.sound, onchange: e => { s0.sound = e.target.checked; Store.save(); } }), 'Звуковые эффекты')));

  const fileInput = h('input', { type: 'file', accept: 'application/json', hidden: true, onchange: e => {
    const f = e.target.files[0];
    if (!f) return;
    f.text().then(t => { try { Store.importJSON(t); UI.toast('Прогресс загружен', 'gold'); applyTheme(); render(); } catch (err) { UI.toast('Не удалось прочитать файл: ' + err.message, 'bad'); } });
  } });
  root.appendChild(h('div', { class: 'card' },
    h('h3', null, 'Прогресс'),
    h('p', { class: 'muted small' }, 'Прогресс хранится только в этом браузере. Сохраните файл, чтобы перенести его на другое устройство.'),
    h('div', { class: 'row' },
      h('button', { class: 'btn', type: 'button', onclick: () => {
        const blob = new Blob([Store.exportJSON()], { type: 'application/json' });
        const a = h('a', { href: URL.createObjectURL(blob), download: `synapse-progress-${todayKey()}.json` });
        document.body.appendChild(a); a.click(); a.remove();
      } }, '💾 Сохранить в файл'),
      h('button', { class: 'btn', type: 'button', onclick: () => fileInput.click() }, '📂 Загрузить из файла'), fileInput,
      h('button', { class: 'btn danger', type: 'button', onclick: () => UI.confirm('Сбросить весь прогресс?', 'Это действие нельзя отменить.', () => { Store.reset(); applyTheme(); render(); }) }, '🗑 Сбросить'))));
  root.appendChild(h('div', { class: 'card small muted' },
    h('p', null, 'Синапс — учебная платформа. Медицинские сведения приведены для обучения и не заменяют консультацию врача.'),
    h('p', null, `Курс: ${allLessons().length} уроков, ${courseQuestions().length} вопросов, ${GENERATORS.length} генераторов задач, ${LAB_LIST.length} лабораторий, ${GLOSSARY.length} терминов.`)));
  return root;
};
