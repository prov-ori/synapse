// Роутер, шапка, навигация, запуск.

const Views = {};
// Состояние интерфейса на время сессии (выбранные фильтры и т. п.)
const UIState = { practiceFilter: 'all', examSubject: 'mix', labFilter: 'all' };
let currentCleanup = [];

const NAV = [
  { href: '#/', icon: '🏠', label: 'Главная' },
  { href: '#/subject/chem', icon: '⚗️', label: 'Химия' },
  { href: '#/subject/phys', icon: '🧲', label: 'Физика' },
  { href: '#/subject/bio', icon: '🧬', label: 'Биология' },
  { href: '#/practice', icon: '🏋️', label: 'Тренажёры' },
  { href: '#/labs', icon: '🔬', label: 'Лаборатории' },
  { href: '#/exam', icon: '📝', label: 'Экзамен' },
  { href: '#/cards', icon: '🃏', label: 'Карточки' },
  { href: '#/reference', icon: '📚', label: 'Справочник' },
  { href: '#/games', icon: '🎮', label: 'Игры' },
  { href: '#/profile', icon: '🏆', label: 'Профиль' },
];

// Порядок важен: более конкретные шаблоны выше
const ROUTES = [
  [/^\/$/, 'home'],
  [/^\/subject\/(chem|phys|bio)$/, 'subject'],
  [/^\/module\/([\w-]+)$/, 'module'],
  [/^\/lesson\/([\w-]+)\/quiz$/, 'lessonQuiz'],
  [/^\/lesson\/([\w-]+)$/, 'lesson'],
  [/^\/practice$/, 'practice'],
  [/^\/practice\/([\w-]+)$/, 'trainer'],
  [/^\/labs$/, 'labs'],
  [/^\/labs\/([\w-]+)$/, 'lab'],
  [/^\/exam$/, 'exam'],
  [/^\/cards$/, 'cards'],
  [/^\/reference$/, 'reference'],
  [/^\/reference\/([\w-]+)$/, 'reference'],
  [/^\/games$/, 'games'],
  [/^\/games\/([\w-]+)$/, 'game'],
  [/^\/profile$/, 'profile'],
  [/^\/settings$/, 'settings'],
];

// Экраны без бокового меню
const FOCUS_VIEWS = new Set(['lessonQuiz', 'trainer', 'game']);

function navigate(hash) { location.hash = hash; }

function render() {
  const path = decodeURIComponent((location.hash || '#/').slice(1)) || '/';
  let view = null, params = [];
  for (const [re, name] of ROUTES) {
    const m = path.match(re);
    if (m) { view = name; params = m.slice(1); break; }
  }
  for (const f of currentCleanup) { try { f(); } catch (e) { console.error(e); } }
  currentCleanup = [];

  const main = document.getElementById('main');
  main.innerHTML = '';
  const fn = Views[view] || Views.notFound;
  const ctx = { onCleanup: f => currentCleanup.push(f), params };
  try {
    const node = fn(params, ctx);
    if (node) main.appendChild(node);
  } catch (e) {
    console.error(e);
    main.appendChild(h('div', { class: 'card' }, h('h2', null, 'Что-то пошло не так'), h('p', { class: 'muted' }, String(e.message || e))));
  }
  main.focus({ preventScroll: true });
  window.scrollTo(0, 0);

  // подсветка навигации
  const sect = path.split('/')[1];
  let activeHref = '#/' + sect;
  if (sect === 'subject') activeHref = '#' + path;
  if (sect === 'module' || sect === 'lesson') {
    const id = params[0] || '';
    activeHref = '#/subject/' + id.split('-')[0];
  }
  if (sect === 'settings') activeHref = '#/profile';
  document.querySelectorAll('.nav a').forEach(a => {
    const href = a.getAttribute('href');
    a.classList.toggle('active', href === '#/' ? path === '/' : href === activeHref);
  });
  document.body.classList.toggle('focus-mode', FOCUS_VIEWS.has(view));
  document.body.dataset.view = view || 'notFound';
  updateHeader();
}

function updateHeader() {
  const st = Store.state;
  const lvl = Store.level();
  const el = document.getElementById('header-stats');
  if (!el) return;
  el.innerHTML = '';
  el.append(
    h('span', { class: 'stat-chip', title: 'Серия дней' }, h('span', { class: st.streak ? 'flame on' : 'flame' }, '🔥'), st.streak),
    h('span', { class: 'stat-chip', title: 'Опыт' }, '⭐', st.xp),
    h('a', { class: 'stat-chip level', href: '#/profile', title: `${rankName(lvl.level)}: ${lvl.into}/${lvl.need} XP до следующего уровня` },
      'Ур. ' + lvl.level,
      h('span', { class: 'mini-progress' }, h('span', { style: { width: (lvl.into / lvl.need) * 100 + '%' } }))),
  );
  const due = Store.srsDue().length;
  const badge = document.getElementById('cards-badge');
  if (badge) { badge.textContent = due > 99 ? '99+' : due; badge.hidden = !due; }
}

function applyTheme() {
  const t = Store.settings.theme;
  if (t === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
}

function isDark() {
  const t = document.documentElement.getAttribute('data-theme');
  return t === 'dark' || (!t && matchMedia('(prefers-color-scheme: dark)').matches);
}

function buildShell() {
  const nav = document.getElementById('nav');
  nav.append(...NAV.map(n => h('a', { href: n.href },
    h('span', { class: 'nav-icon' }, n.icon),
    h('span', { class: 'nav-label' }, n.label),
    n.href === '#/cards' ? h('span', { class: 'badge', id: 'cards-badge', hidden: true }) : null)));
  document.getElementById('theme-toggle').addEventListener('click', () => {
    Store.settings.theme = isDark() ? 'light' : 'dark';
    Store.save();
    applyTheme();
    render();
  });
}

Views.notFound = () => h('div', { class: 'card center' },
  h('div', { class: 'big-emoji' }, '🔭'),
  h('h2', null, 'Страница не найдена'),
  h('a', { class: 'btn primary', href: '#/' }, 'На главную'));

document.addEventListener('DOMContentLoaded', () => {
  Store.load();
  applyTheme();
  buildShell();
  window.addEventListener('hashchange', render);
  render();
});
