// Реестр генераторов задач. Каждый генератор возвращает вопрос в формате js/core/quiz.js
// и объяснение с пошаговым решением. Уровни: 1 — старт, 2 — база, 3 — профиль, 4 — медвуз (ЕГЭ).

const GENERATORS = [];
const GEN_MAP = {};

function defGen(def) {
  GENERATORS.push(def);
  GEN_MAP[def.id] = def;
}

// Сгенерировать вопрос с пометкой генератора (для статистики)
function genQuestion(id) {
  const g = GEN_MAP[id];
  const q = g.gen();
  q.gen = id;
  q.subject = g.subject;
  q.module = g.module;
  return q;
}

// Варианты ответа для числового вопроса в виде выбора: правдоподобные ошибки
function numDistractors(answer, extra = [], dp = 2) {
  const set = new Set([fmt(answer, dp)]);
  const out = [];
  const cands = [...extra, answer * 2, answer / 2, answer * 10, answer / 10, answer + 1, answer * 1.5];
  for (const c of cands) {
    const f = fmt(c, dp);
    if (!set.has(f) && isFinite(c) && c !== 0) { set.add(f); out.push(f); }
    if (out.length >= 3) break;
  }
  return out;
}

const SUBJECTS = {
  chem: { id: 'chem', title: 'Химия', icon: '⚗️', color: 'var(--chem)', tagline: 'Вещества, реакции, расчёты' },
  phys: { id: 'phys', title: 'Физика', icon: '🧲', color: 'var(--phys)', tagline: 'Движение, энергия, поля, свет' },
  bio: { id: 'bio', title: 'Биология', icon: '🧬', color: 'var(--bio)', tagline: 'Клетка, генетика, человек' },
};

const LEVELS = {
  1: { name: 'Старт', desc: 'с нуля, без подготовки' },
  2: { name: 'База', desc: 'школьная программа 7–9 классов' },
  3: { name: 'Профиль', desc: 'углублённая программа 10–11 классов' },
  4: { name: 'Медвуз', desc: 'задачи уровня ЕГЭ / вступительных' },
};
