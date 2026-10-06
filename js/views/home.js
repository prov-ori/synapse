// Главная: приветствие, продолжить обучение, дневная цель, предметы, задача дня, факт дня.

const DAILY_FACTS = [
  'В теле взрослого человека около 37 триллионов клеток, а бактерий в кишечнике — примерно столько же.',
  'Если вытянуть ДНК из одной клетки человека в нитку, её длина составит около 2 метров.',
  'Сердце за жизнь совершает около 2,5–3 миллиардов сокращений.',
  'Общая длина кровеносных сосудов человека — около 100 000 км, это 2,5 оборота вокруг Земли.',
  'Желудок полностью обновляет слизистую оболочку каждые 3–5 дней, иначе кислота переварила бы его самого.',
  'Нервный импульс по самым быстрым волокнам бежит со скоростью около 120 м/с — быстрее гоночного болида.',
  'Гемоглобин одного эритроцита — около 270 миллионов молекул, и каждая переносит до 4 молекул O₂.',
  'Кость прочнее бетона на сжатие при той же массе, а бедренная кость выдерживает нагрузку около тонны.',
  'Роговица — одна из немногих тканей без кровеносных сосудов: кислород она получает прямо из воздуха.',
  'Почки фильтруют всю плазму крови около 60 раз в сутки.',
  'Мозг составляет 2 % массы тела, но потребляет около 20 % кислорода и глюкозы.',
  'Самый лёгкий газ — водород, а самый тяжёлый простой газ при н. у. — радон, почти в 8 раз тяжелее воздуха.',
  'Золото настолько пластично, что из 1 грамма можно вытянуть проволоку длиной около 2 км.',
  'Вода — одно из немногих веществ, у которых твёрдая фаза легче жидкой. Поэтому водоёмы замерзают сверху.',
  'Капля воды состоит примерно из 1,7·10²¹ молекул — это больше, чем звёзд в наблюдаемой части Вселенной… почти.',
  'Скорость звука в кости — около 3500 м/с, в 10 раз быстрее, чем в воздухе.',
  'Первый рентгеновский снимок — кисть жены Рентгена с обручальным кольцом (1895).',
  'Бактерия E. coli в идеальных условиях делится каждые 20 минут: из одной клетки за сутки получилось бы больше массы Земли — если бы хватило еды.',
  'Ген человека и ген дрожжей, отвечающие за деление клетки, настолько похожи, что человеческий может заменить дрожжевой.',
  'Пенициллин открыли случайно: Флеминг уехал в отпуск, оставив чашки с бактериями, и плесень сделала остальное.',
  'Гигантская секвойя растёт из семени массой около 5 мг до массы более 1000 тонн — почти вся эта масса взята из воздуха (CO₂).',
  'Ногти растут примерно на 3 мм в месяц, а волосы — на 1–1,5 см.',
  'Человек выдыхает около 400 литров CO₂ в сутки.',
  'У осьминога три сердца и голубая кровь (гемоцианин с медью).',
  'Ахиллово сухожилие выдерживает нагрузку до 400 кг.',
];

Views.home = () => {
  const st = Store.state;
  const root = h('div', { class: 'home' });
  const name = Store.settings.name;
  const next = nextLesson();
  const today = Store.todayXp(), goal = Store.settings.dailyGoal;
  const totalLessons = allLessons().length;
  const done = Object.keys(st.lessons).filter(id => LESSON_MAP[id]).length;
  const newbie = st.xp === 0 && !done;

  root.appendChild(h('section', { class: 'hero card' },
    h('div', { class: 'hero-text' },
      h('div', { class: 'hero-kicker' }, 'Химия · Физика · Биология'),
      h('h1', null, newbie ? 'От нуля до медвуза' : `С возвращением${name ? ', ' + name : ''}!`),
      h('p', { class: 'muted' }, newbie
        ? `${totalLessons} уроков с объяснениями, ${GENERATORS.length} генераторов бесконечных задач, ${LAB_LIST.length} интерактивных лабораторий и пробные экзамены. Начните с любого предмета — или пройдите путь по порядку.`
        : `Пройдено уроков: ${done} из ${totalLessons}. ${rankName(Store.level().level)} — продолжайте!`),
      next ? h('a', { class: 'btn primary big', href: '#/lesson/' + next.id },
        newbie ? '🚀 Начать с первого урока' : '▶ Продолжить: ' + next.title) : h('a', { class: 'btn primary big', href: '#/exam' }, '📝 Все уроки пройдены — к экзамену!'),
      next ? h('div', { class: 'small muted', style: { marginTop: '.4rem' } }, `${SUBJECTS[next.subject].icon} ${MODULE_MAP[next.module].title}`) : null),
    h('div', { class: 'hero-goal' },
      UI.ring(today, goal, h('div', null, h('b', null, today), h('div', { class: 'small muted' }, '/ ' + goal + ' XP')), 'var(--accent)'),
      h('div', { class: 'small muted' }, 'цель дня')),
  ));

  // Предметы
  root.appendChild(h('h2', { class: 'section-title' }, 'Предметы'));
  root.appendChild(h('div', { class: 'subject-grid' }, Object.values(SUBJECTS).map(sub => {
    const ls = lessonsOf(sub.id);
    const d = ls.filter(l => Store.lessonDone(l.id)).length;
    const nl = nextLesson(sub.id);
    return h('a', { class: 'card subject-card', href: '#/subject/' + sub.id, style: { '--c': sub.color } },
      h('div', { class: 'subject-icon' }, sub.icon),
      h('h3', null, sub.title),
      h('p', { class: 'muted small' }, sub.tagline),
      UI.progressBar(d, ls.length, 'subj'),
      h('div', { class: 'small muted' }, `${d} / ${ls.length} уроков · ${modulesOf(sub.id).length} модулей`),
      nl ? h('div', { class: 'small next-up' }, '→ ' + nl.title) : h('div', { class: 'small ok-text' }, '✓ Всё пройдено'));
  })));

  // Быстрые действия
  const due = Store.srsDue().length;
  const weak = weakModules(2);
  const daily = dailyGenerator();
  root.appendChild(h('h2', { class: 'section-title' }, 'Сегодня'));
  root.appendChild(h('div', { class: 'card-grid' },
    h('a', { class: 'card action-card', href: '#/practice/' + daily.id },
      h('div', { class: 'action-icon' }, daily.icon),
      h('div', null, h('b', null, 'Задача дня'), h('div', { class: 'small muted' }, `${SUBJECTS[daily.subject].title}: ${daily.title}`))),
    h('a', { class: 'card action-card', href: '#/cards' },
      h('div', { class: 'action-icon' }, '🃏'),
      h('div', null, h('b', null, due ? `Повторить ${due} ${plural(due, 'карточку', 'карточки', 'карточек')}` : 'Карточки'),
        h('div', { class: 'small muted' }, due ? 'Интервальное повторение — лучший способ запомнить надолго' : 'Термины добавляются после уроков'))),
    h('a', { class: 'card action-card', href: '#/labs/' + dailyLab().id },
      h('div', { class: 'action-icon' }, dailyLab().icon),
      h('div', null, h('b', null, 'Лаборатория дня'), h('div', { class: 'small muted' }, dailyLab().title))),
    weak.length ? h('a', { class: 'card action-card warn', href: '#/module/' + weak[0].id },
      h('div', { class: 'action-icon' }, '🎯'),
      h('div', null, h('b', null, 'Слабое место'), h('div', { class: 'small muted' }, weak[0].title + ' — здесь больше всего ошибок'))) :
      h('a', { class: 'card action-card', href: '#/exam' },
        h('div', { class: 'action-icon' }, '📝'),
        h('div', null, h('b', null, 'Пробный экзамен'), h('div', { class: 'small muted' }, 'Проверьте себя в формате теста с таймером'))),
  ));

  // Факт дня
  const dayN = Math.floor(Date.now() / 86400000);
  root.appendChild(h('div', { class: 'card fact-card' },
    h('div', { class: 'fact-label' }, '💡 Факт дня'),
    h('p', { html: rich(DAILY_FACTS[dayN % DAILY_FACTS.length]) })));

  // Как устроено обучение
  if (newbie) {
    root.appendChild(h('div', { class: 'card how' },
      h('h2', null, 'Как здесь учиться'),
      h('ol', { class: 'how-list' },
        h('li', null, h('b', null, 'Уроки. '), 'Короткая теория с примерами из медицины и вопросами для самопроверки, затем тест. Ошибки возвращаются в конце теста.'),
        h('li', null, h('b', null, 'Тренажёры. '), 'Генераторы создают бесконечные задачи с пошаговым решением: от молярной массы до генетики и линз.'),
        h('li', null, h('b', null, 'Лаборатории. '), 'Интерактивные модели: таблица Менделеева, титрование, маятник, линзы, решётка Пеннета, синтез белка и другие.'),
        h('li', null, h('b', null, 'Карточки. '), 'Термины из пройденных модулей повторяются по алгоритму интервального повторения.'),
        h('li', null, h('b', null, 'Экзамен. '), 'Смешанный тест с таймером и разбором слабых тем — как на вступительных.')),
      h('p', { class: 'muted small' }, 'Всё работает в браузере, без регистрации. Прогресс хранится на этом устройстве (его можно экспортировать в профиле).')));
  }
  return root;
};

function weakModules(min = 1) {
  const m = Store.state.mistakes;
  return Object.entries(m).filter(([id, n]) => n >= min && MODULE_MAP[id]).sort((a, b) => b[1] - a[1]).map(([id]) => MODULE_MAP[id]);
}

function dailyGenerator() {
  const day = Math.floor(Date.now() / 86400000);
  return GENERATORS[(day * 7) % GENERATORS.length];
}

function dailyLab() {
  const day = Math.floor(Date.now() / 86400000);
  return LAB_LIST[(day * 5) % LAB_LIST.length];
}
