// Состояние ученика: XP, серия дней, уроки, тренажёры, карточки (SRS), экзамены, достижения, настройки.

const STORE_KEY = 'synapse.v1';

const DEFAULT_STATE = () => ({
  xp: 0,
  activity: {},          // 'YYYY-MM-DD' -> XP за день
  streak: 0,
  bestStreak: 0,
  lastDay: null,
  lessons: {},           // lessonId -> { stars, best, times, last }
  trainers: {},          // generatorId -> { done, correct, streak, best }
  srs: {},               // cardId -> { due, interval, ease, reps, lapses }
  exams: [],             // { date, subject, score, total, seconds, byModule }
  mistakes: {},          // moduleId -> число ошибок (для «слабых мест»)
  labs: {},              // labId -> число открытий
  achievements: {},      // id -> timestamp
  stats: {
    correct: 0, wrong: 0, lessons: 0, perfectLessons: 0, reviews: 0,
    games: 0, gameBest: {}, solved: { chem: 0, phys: 0, bio: 0 }, exams: 0, bestExam: 0,
  },
  settings: {
    dailyGoal: 60, sound: true, theme: 'auto', name: '', target: 'med',
  },
});

const Store = {
  state: null,

  load() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { /* приватный режим */ }
    const base = DEFAULT_STATE();
    this.state = saved ? deepMerge(base, saved) : base;
    this.checkStreak();
  },

  save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(this.state)); } catch (e) { /* ignore */ }
  },

  get settings() { return this.state.settings; },
  get stats() { return this.state.stats; },

  reset() {
    this.state = DEFAULT_STATE();
    this.save();
  },

  exportJSON() { return JSON.stringify(this.state, null, 2); },

  importJSON(text) {
    const data = JSON.parse(text);
    if (typeof data !== 'object' || data == null || typeof data.xp !== 'number') throw new Error('Неверный формат');
    this.state = deepMerge(DEFAULT_STATE(), data);
    this.save();
  },

  // ---------- XP / уровни / серия ----------
  level() { return levelFromXp(this.state.xp); },

  todayXp() { return this.state.activity[todayKey()] || 0; },

  checkStreak() {
    const st = this.state;
    if (!st.lastDay) return;
    if (daysBetween(st.lastDay, todayKey()) > 1) st.streak = 0;
  },

  addXp(amount) {
    if (amount <= 0) return;
    const st = this.state;
    const today = todayKey();
    const prevLevel = this.level().level;
    const hadToday = (st.activity[today] || 0) > 0;
    st.xp += amount;
    st.activity[today] = (st.activity[today] || 0) + amount;
    if (!hadToday) {
      if (st.lastDay && daysBetween(st.lastDay, today) === 1) st.streak += 1;
      else if (st.lastDay !== today) st.streak = 1;
      st.lastDay = today;
      st.bestStreak = Math.max(st.bestStreak, st.streak);
    }
    this.save();
    UI.xpPop(amount);
    const lvl = this.level().level;
    if (lvl > prevLevel) UI.toast(`🎉 Новый уровень: ${lvl} — ${rankName(lvl)}`, 'gold');
    if (st.activity[today] >= st.settings.dailyGoal && st.activity[today] - amount < st.settings.dailyGoal) {
      UI.toast('🎯 Дневная цель выполнена!', 'gold');
    }
    this.checkAchievements();
    updateHeader();
  },

  answer(correct, moduleId) {
    if (correct) this.stats.correct++;
    else {
      this.stats.wrong++;
      if (moduleId) this.state.mistakes[moduleId] = (this.state.mistakes[moduleId] || 0) + 1;
    }
    this.save();
  },

  // ---------- Уроки ----------
  lessonDone(id) { return !!this.state.lessons[id]; },
  lessonStars(id) { return this.state.lessons[id]?.stars || 0; },

  completeLesson(id, accuracy) {
    const stars = accuracy >= 1 ? 3 : accuracy >= 0.8 ? 2 : 1;
    const prev = this.state.lessons[id] || { stars: 0, times: 0, best: 0 };
    this.state.lessons[id] = {
      stars: Math.max(prev.stars, stars), times: prev.times + 1,
      best: Math.max(prev.best || 0, accuracy), last: Date.now(),
    };
    this.stats.lessons++;
    if (accuracy >= 1) this.stats.perfectLessons++;
    this.save();
    return stars;
  },

  // ---------- Тренажёры ----------
  trainer(id) { return this.state.trainers[id] || { done: 0, correct: 0, streak: 0, best: 0 }; },

  trainerAnswer(id, subject, correct, moduleId) {
    const t = this.trainer(id);
    t.done++;
    if (correct) { t.correct++; t.streak++; t.best = Math.max(t.best, t.streak); this.stats.solved[subject]++; }
    else t.streak = 0;
    this.state.trainers[id] = t;
    this.answer(correct, moduleId);
  },

  // 0 — не начат, 1 — новичок, 2 — уверенно, 3 — мастер
  mastery(id) {
    const t = this.trainer(id);
    if (!t.done) return 0;
    const acc = t.correct / t.done;
    if (t.correct >= 20 && acc >= 0.85) return 3;
    if (t.correct >= 7 && acc >= 0.7) return 2;
    return 1;
  },

  // ---------- SRS (упрощённый SM-2) ----------
  srsAdd(id) {
    if (this.state.srs[id]) return false;
    this.state.srs[id] = { due: Date.now(), interval: 0, ease: 2.5, reps: 0, lapses: 0 };
    this.save();
    return true;
  },

  srsHas(id) { return !!this.state.srs[id]; },

  srsRemove(id) { delete this.state.srs[id]; this.save(); },

  srsDue() {
    const now = Date.now();
    return Object.entries(this.state.srs)
      .filter(([id, c]) => c.due <= now && GLOSSARY_MAP[id])
      .sort((a, b) => a[1].due - b[1].due)
      .map(([id]) => id);
  },

  // grade: 0 = снова, 1 = трудно, 2 = хорошо, 3 = легко
  srsGrade(id, grade) {
    const c = this.state.srs[id];
    if (!c) return;
    const DAY = 86400000;
    if (grade === 0) {
      c.reps = 0; c.lapses++; c.interval = 0;
      c.ease = Math.max(1.3, c.ease - 0.2);
      c.due = Date.now() + 60 * 1000;
    } else {
      c.reps++;
      if (c.reps === 1) c.interval = grade === 3 ? 3 : 1;
      else if (c.reps === 2) c.interval = grade === 3 ? 7 : grade === 1 ? 2 : 4;
      else c.interval = Math.round(c.interval * (grade === 1 ? 1.2 : grade === 3 ? c.ease * 1.3 : c.ease));
      c.ease = Math.max(1.3, c.ease + (grade === 1 ? -0.15 : grade === 3 ? 0.15 : 0));
      c.due = Date.now() + c.interval * DAY;
    }
    this.stats.reviews++;
    this.save();
  },

  srsStrength(id) {
    const c = this.state.srs[id];
    return c ? Math.min(1, c.interval / 21) : 0;
  },

  // ---------- Экзамены ----------
  saveExam(result) {
    this.state.exams.unshift(result);
    this.state.exams = this.state.exams.slice(0, 50);
    this.stats.exams++;
    this.stats.bestExam = Math.max(this.stats.bestExam, Math.round(result.score / result.total * 100));
    this.save();
    this.checkAchievements();
  },

  labVisit(id) {
    this.state.labs[id] = (this.state.labs[id] || 0) + 1;
    this.save();
    this.checkAchievements();
  },

  // ---------- Достижения ----------
  unlock(id) {
    if (this.state.achievements[id]) return;
    this.state.achievements[id] = Date.now();
    this.save();
    const a = ACHIEVEMENTS.find(x => x.id === id);
    if (a) {
      UI.toast(`${a.icon} Достижение: ${a.title}`, 'gold');
      SFX.achievement();
    }
  },

  checkAchievements() {
    for (const a of ACHIEVEMENTS) {
      if (!this.state.achievements[a.id] && a.test(this.state)) this.unlock(a.id);
    }
  },
};

function levelFromXp(xp) {
  // Каждый следующий уровень требует на 60 XP больше: 100, 160, 220…
  let level = 1, need = 100, rest = xp;
  while (rest >= need) { rest -= need; level++; need += 60; }
  return { level, into: rest, need };
}

const RANKS = ['Любопытный', 'Наблюдатель', 'Лаборант', 'Исследователь', 'Экспериментатор', 'Аналитик',
  'Абитуриент', 'Олимпиадник', 'Почти студент', 'Будущий врач', 'Профессор'];
function rankName(level) { return RANKS[Math.min(RANKS.length - 1, Math.floor((level - 1) / 3))]; }

function deepMerge(base, extra) {
  for (const [k, v] of Object.entries(extra)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) base[k] = deepMerge(base[k], v);
    else base[k] = v;
  }
  return base;
}

function lessonsDoneIn(st, subject) {
  return Object.keys(st.lessons).filter(id => id.startsWith(subject + '-')).length;
}

const ACHIEVEMENTS = [
  { id: 'first_lesson', icon: '🌱', title: 'Первый шаг', desc: 'Пройти первый урок', test: st => st.stats.lessons >= 1 },
  { id: 'lessons10', icon: '📗', title: 'Втянулся', desc: 'Пройти 10 уроков', test: st => Object.keys(st.lessons).length >= 10 },
  { id: 'lessons30', icon: '📚', title: 'Книжный червь', desc: 'Пройти 30 разных уроков', test: st => Object.keys(st.lessons).length >= 30 },
  { id: 'lessons60', icon: '🎓', title: 'Без пяти минут студент', desc: 'Пройти 60 разных уроков', test: st => Object.keys(st.lessons).length >= 60 },
  { id: 'perfect', icon: '💎', title: 'Без единой ошибки', desc: 'Пройти урок на 100%', test: st => st.stats.perfectLessons >= 1 },
  { id: 'perfect10', icon: '👑', title: 'Перфекционист', desc: '10 уроков без ошибок', test: st => st.stats.perfectLessons >= 10 },
  { id: 'chem5', icon: '⚗️', title: 'Юный химик', desc: '5 уроков химии', test: st => lessonsDoneIn(st, 'chem') >= 5 },
  { id: 'phys5', icon: '🧲', title: 'Юный физик', desc: '5 уроков физики', test: st => lessonsDoneIn(st, 'phys') >= 5 },
  { id: 'bio5', icon: '🧬', title: 'Юный биолог', desc: '5 уроков биологии', test: st => lessonsDoneIn(st, 'bio') >= 5 },
  { id: 'triad', icon: '🔺', title: 'Естествоиспытатель', desc: 'По 10 уроков каждого предмета', test: st => ['chem', 'phys', 'bio'].every(x => lessonsDoneIn(st, x) >= 10) },
  { id: 'solve50', icon: '🧮', title: 'Решала', desc: 'Решить 50 задач в тренажёрах', test: st => st.stats.solved.chem + st.stats.solved.phys + st.stats.solved.bio >= 50 },
  { id: 'solve300', icon: '🏋️', title: 'Машина для задач', desc: 'Решить 300 задач в тренажёрах', test: st => st.stats.solved.chem + st.stats.solved.phys + st.stats.solved.bio >= 300 },
  { id: 'master1', icon: '🥇', title: 'Мастер', desc: 'Достичь уровня «мастер» в любом тренажёре', test: st => Object.values(st.trainers).some(t => t.correct >= 20 && t.correct / t.done >= 0.85) },
  { id: 'master10', icon: '🏆', title: 'Многостаночник', desc: 'Уровень «мастер» в 10 тренажёрах', test: st => Object.values(st.trainers).filter(t => t.correct >= 20 && t.correct / t.done >= 0.85).length >= 10 },
  { id: 'streak10', icon: '⚡', title: 'Серия 10', desc: '10 верных подряд в тренажёре', test: st => Object.values(st.trainers).some(t => t.best >= 10) },
  { id: 'labs3', icon: '🔬', title: 'Лаборант', desc: 'Открыть 3 лаборатории', test: st => Object.keys(st.labs).length >= 3 },
  { id: 'labs12', icon: '🧪', title: 'Завлаб', desc: 'Открыть 12 лабораторий', test: st => Object.keys(st.labs).length >= 12 },
  { id: 'cards50', icon: '🃏', title: 'Картотека', desc: '50 терминов в карточках', test: st => Object.keys(st.srs).length >= 50 },
  { id: 'review100', icon: '🧠', title: 'Память как сталь', desc: '100 повторений карточек', test: st => st.stats.reviews >= 100 },
  { id: 'exam1', icon: '📝', title: 'Пробник', desc: 'Пройти первый пробный экзамен', test: st => st.stats.exams >= 1 },
  { id: 'exam80', icon: '🎯', title: 'Высокий балл', desc: 'Набрать 80% на экзамене', test: st => st.stats.bestExam >= 80 },
  { id: 'streak3', icon: '🔥', title: 'Три дня подряд', desc: 'Серия 3 дня', test: st => st.bestStreak >= 3 },
  { id: 'streak7', icon: '📅', title: 'Неделя науки', desc: 'Серия 7 дней', test: st => st.bestStreak >= 7 },
  { id: 'streak30', icon: '🗓️', title: 'Месяц без пропусков', desc: 'Серия 30 дней', test: st => st.bestStreak >= 30 },
  { id: 'xp1000', icon: '⭐', title: 'Тысяча', desc: 'Набрать 1000 XP', test: st => st.xp >= 1000 },
  { id: 'xp10000', icon: '🌟', title: 'Звезда науки', desc: 'Набрать 10 000 XP', test: st => st.xp >= 10000 },
  { id: 'games10', icon: '🎮', title: 'Игрок', desc: 'Сыграть 10 игр', test: st => st.stats.games >= 10 },
];
