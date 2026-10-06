// Каркас курса: модули → уроки → теория + тест.
//
// Блоки теории:
//   'строка'                 — абзац (формулы в {фигурных скобках}: {H2SO4}, {SO4^2-})
//   { h: 'подзаголовок' }
//   { key: '…' }             — главная мысль
//   { f: 'формула HTML', note: 'пояснение' }
//   { list: ['…', …] }  { ol: ['…', …] }
//   { table: ['заголовок', …], rows: [['…', …], …] }
//   { med: '…' }             — «В медицине»
//   { fact: '…' }            — «Интересно»
//   { warn: '…' }            — «Частая ошибка»
//   { q: вопрос }            — вопрос для самопроверки прямо в теории
//   { lab: 'id', text: '…' } — ссылка на лабораторию
//   { gen: 'id' }            — ссылка на тренажёр

const COURSE = [];
const MODULE_MAP = {};
const LESSON_MAP = {};

function mod(def) {
  def.lessons.forEach((l, i) => {
    l.id = def.id + '-' + (i + 1);
    l.module = def.id;
    l.subject = def.subject;
    l.index = i;
    for (const q of l.quiz) q.module = def.id;
    LESSON_MAP[l.id] = l;
  });
  def.trainers = def.trainers || [];
  COURSE.push(def);
  MODULE_MAP[def.id] = def;
}

// Модули предмета по уровням (порядок внутри уровня — как в файлах курса)
function modulesOf(subject) { return COURSE.filter(m => m.subject === subject).sort((a, b) => a.level - b.level); }
function lessonsOf(subject) { return modulesOf(subject).flatMap(m => m.lessons); }
function allLessons() { return COURSE.flatMap(m => m.lessons); }

// Следующий непройденный урок (по порядку курса)
function nextLesson(subject) {
  const list = subject ? lessonsOf(subject) : allLessons();
  return list.find(l => !Store.lessonDone(l.id)) || null;
}

// Все вопросы курса (для экзамена и игр)
function courseQuestions(subject, levelMax = 4) {
  return COURSE.filter(m => (!subject || m.subject === subject) && m.level <= levelMax)
    .flatMap(m => m.lessons.flatMap(l => l.quiz.map(q => ({ ...q, module: m.id, subject: m.subject }))));
}
