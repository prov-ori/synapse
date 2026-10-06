// Модульные тесты без зависимостей: node tests/unit.test.js
// Загружает скрипты в общий контекст так же, как браузер (классические <script>).

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const root = path.join(__dirname, '..');
const files = [
  'js/core/util.js', 'js/data/elements.js', 'js/core/chem.js', 'js/data/genetic.js', 'js/data/reference.js', 'js/core/quiz.js',
  'js/gen/registry.js', 'js/gen/chem.js', 'js/gen/phys.js', 'js/gen/bio.js',
  'js/data/course/core.js', 'js/data/course/chem1.js', 'js/data/course/chem2.js', 'js/data/course/phys1.js',
  'js/data/course/phys2.js', 'js/data/course/bio1.js', 'js/data/course/bio2.js', 'js/data/glossary.js',
];
const exportsList = ['ELEMENTS', 'EL', 'schoolMass', 'configString', 'configShort', 'shells', 'parseFormula', 'formulaCharge', 'molarMass', 'balance',
  'oxidationState', 'massFraction', 'CODON_TABLE', 'translate', 'transcribe', 'complementDNA', 'toRu', 'toLat', 'gametes', 'crossGenotypes', 'phenotypeOf',
  'GENERATORS', 'GEN_MAP', 'genQuestion', 'COURSE', 'MODULE_MAP', 'LESSON_MAP', 'GLOSSARY', 'SOL_TABLE', 'SOL_ANIONS', 'OX_ITEMS', 'REACTIONS_TO_BALANCE',
  'parseNum', 'numClose', 'fmt', 'checkText', 'chem', 'modulesOf'];
const code = files.map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n;\n') + `\n;({ ${exportsList.join(', ')} });`;
const G = vm.runInContext(code, vm.createContext({ console }));

// Массивы из vm-контекста имеют другой прототип — сравниваем по содержимому
const same = (a, b, msg) => assert.strictEqual(JSON.stringify(a), JSON.stringify(b), msg);

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; } catch (e) { failed++; console.error('✗ ' + name + '\n   ' + e.message); }
}

// ---------- Таблица Менделеева ----------
test('118 элементов, номера по порядку', () => {
  assert.strictEqual(G.ELEMENTS.length, 118);
  G.ELEMENTS.forEach((e, i) => assert.strictEqual(e.z, i + 1));
  assert.strictEqual(G.EL.Og.z, 118);
  assert.strictEqual(G.EL.Fe.name, 'Железо');
});

test('Школьные атомные массы', () => {
  const expect = { H: 1, C: 12, N: 14, O: 16, Na: 23, Mg: 24, Al: 27, S: 32, Cl: 35.5, K: 39, Ca: 40, Fe: 56, Cu: 64, Zn: 65, Ag: 108, Ba: 137 };
  for (const [s, m] of Object.entries(expect)) assert.strictEqual(G.schoolMass(s), m, s);
});

test('Электронные конфигурации и «провал» электрона', () => {
  assert.strictEqual(G.configString(11), '1s² 2s² 2p⁶ 3s¹');
  assert.strictEqual(G.configShort(26), '[Ar] 3d⁶ 4s²');
  assert.strictEqual(G.configShort(24), '[Ar] 3d⁵ 4s¹');
  assert.strictEqual(G.configShort(29), '[Ar] 3d¹⁰ 4s¹');
  assert.strictEqual(G.configShort(47), '[Kr] 4d¹⁰ 5s¹');
  same(G.shells(20), [2, 8, 8, 2]);
  same(G.shells(17), [2, 8, 7]);
  // сумма электронов совпадает с Z для всех элементов до лоуренсия
  for (let z = 1; z <= 103; z++) assert.strictEqual(G.shells(z).reduce((a, b) => a + b, 0), z, 'Z=' + z);
});

// ---------- Химический движок ----------
test('Разбор формул', () => {
  same(G.parseFormula('Ca(OH)2'), { Ca: 1, O: 2, H: 2 });
  same(G.parseFormula('Al2(SO4)3'), { Al: 2, S: 3, O: 12 });
  same(G.parseFormula('CuSO4*5H2O'), { Cu: 1, S: 1, O: 9, H: 10 });
  same(G.parseFormula('NH4+'), { N: 1, H: 4 });
  assert.strictEqual(G.formulaCharge('SO4^2-'), -2);
  assert.strictEqual(G.formulaCharge('NH4+'), 1);
  assert.strictEqual(G.formulaCharge('Fe^3+'), 3);
  assert.throws(() => G.parseFormula('Xy2'));
});

test('Молярные массы', () => {
  const cases = { H2O: 18, H2SO4: 98, NaCl: 58.5, CaCO3: 100, C6H12O6: 180, 'Ca(OH)2': 74, 'CuSO4*5H2O': 250, 'Ca3(PO4)2': 310, KMnO4: 158 };
  for (const [f, m] of Object.entries(cases)) assert.strictEqual(G.molarMass(f), m, f);
  assert.ok(Math.abs(G.massFraction('H2O', 'H') - 2 / 18) < 1e-9);
});

test('Уравнивание реакций', () => {
  const cases = {
    'Fe + O2 = Fe2O3': [4, 3, 2],
    'KMnO4 + HCl = KCl + MnCl2 + Cl2 + H2O': [2, 16, 2, 2, 5, 8],
    'Cu + HNO3 = Cu(NO3)2 + NO + H2O': [3, 8, 3, 2, 4],
    'C6H12O6 + O2 = CO2 + H2O': [1, 6, 6, 6],
    'MnO4^- + H^+ + Fe^2+ = Mn^2+ + Fe^3+ + H2O': [1, 8, 5, 1, 5, 4],
    'Ca3(PO4)2 + SiO2 + C = CaSiO3 + P + CO': [1, 3, 5, 3, 2, 5],
  };
  for (const [eq, k] of Object.entries(cases)) same(G.balance(eq).coeffs, k, eq);
  assert.throws(() => G.balance('H2 + O2 = NaCl'));
  for (const eq of G.REACTIONS_TO_BALANCE) G.balance(eq);
});

test('Степени окисления', () => {
  const cases = [['KMnO4', 'Mn', 7], ['K2Cr2O7', 'Cr', 6], ['H2SO4', 'S', 6], ['NH3', 'N', -3], ['NH4^+', 'N', -3], ['CaH2', 'H', -1], ['OF2', 'O', 2], ['SO4^2-', 'S', 6], ['Fe2O3', 'Fe', 3]];
  for (const [f, el, ox] of cases) assert.strictEqual(G.oxidationState(f, el), ox, f);
  for (const [f, el] of G.OX_ITEMS) {
    const ox = G.oxidationState(f, el);
    assert.ok(Number.isInteger(ox) && ox >= -4 && ox <= 7, `${f}: ${ox}`);
  }
});

// ---------- Генетика ----------
test('Генетический код', () => {
  assert.strictEqual(Object.keys(G.CODON_TABLE).length, 64);
  assert.strictEqual(G.CODON_TABLE.AUG, 'M');
  assert.strictEqual(G.CODON_TABLE.UGG, 'W');
  ['UAA', 'UAG', 'UGA'].forEach(c => assert.strictEqual(G.CODON_TABLE[c], '*'));
  assert.strictEqual(G.CODON_TABLE.GAG, 'E');
  assert.strictEqual(G.CODON_TABLE.GUG, 'V');
  assert.strictEqual(G.CODON_TABLE.UUU, 'F');
  assert.strictEqual(G.CODON_TABLE.AGA, 'R');
  const counts = {};
  Object.values(G.CODON_TABLE).forEach(a => { counts[a] = (counts[a] || 0) + 1; });
  assert.strictEqual(counts.L, 6); assert.strictEqual(counts.S, 6); assert.strictEqual(counts.R, 6); assert.strictEqual(counts['*'], 3);
});

test('Транскрипция и трансляция', () => {
  assert.strictEqual(G.transcribe('TACGGACTT'), 'AUGCCUGAA');
  same(G.translate('AUGCCUGAA'), ['M', 'P', 'E']);
  assert.strictEqual(G.complementDNA('ATGC'), 'TACG');
  assert.strictEqual(G.toRu('ATGCU'), 'АТГЦУ');
  assert.strictEqual(G.toLat('атгц'), 'ATGC');
});

test('Скрещивания', () => {
  same(G.gametes('AaBb').sort(), ['AB', 'Ab', 'aB', 'ab']);
  same(G.gametes('AA'), ['A']);
  const f2 = G.crossGenotypes('Aa', 'Aa');
  assert.strictEqual(f2.filter(g => G.phenotypeOf(g) === 'A').length, 3);
  const di = G.crossGenotypes('AaBb', 'AaBb');
  assert.strictEqual(di.length, 16);
  assert.strictEqual(di.filter(g => G.phenotypeOf(g) === 'AB').length, 9);
  assert.strictEqual(di.filter(g => G.phenotypeOf(g) === 'ab').length, 1);
});

// ---------- Числа и проверка ответов ----------
test('Разбор чисел', () => {
  assert.strictEqual(G.parseNum('2,5'), 2.5);
  assert.strictEqual(G.parseNum('−3'), -3);
  assert.strictEqual(G.parseNum('+6'), 6);
  assert.ok(Math.abs(G.parseNum('3,2·10^-5') - 3.2e-5) < 1e-15);
  assert.ok(Math.abs(G.parseNum('1.2e-3') - 0.0012) < 1e-15);
  assert.ok(Number.isNaN(G.parseNum('abc')));
  assert.ok(G.numClose(9.9, 10, { tol: 0.02 }));
  assert.ok(!G.numClose(9, 10, { tol: 0.02 }));
  assert.strictEqual(G.fmt(2.5), '2,5');
  assert.strictEqual(G.fmt(-3), '−3');
  assert.ok(G.checkText('Na2O', 'Na2O'));
  assert.ok(G.checkText(' na2o ', 'Na2O'));
  assert.ok(G.checkText('ТАЦГГТ', 'ТАЦГГТ'));
  assert.ok(G.checkText('CnH2n', 'CnH2n'));
  assert.strictEqual(G.chem('H2SO4'), 'H<sub>2</sub>SO<sub>4</sub>');
  assert.strictEqual(G.chem('SO4^2-'), 'SO<sub>4</sub><sup>2−</sup>');
});

// ---------- Генераторы ----------
test('Все генераторы дают корректные задачи (по 300 прогонов)', () => {
  assert.ok(G.GENERATORS.length >= 40);
  for (const g of G.GENERATORS) {
    for (let i = 0; i < 300; i++) {
      const q = G.genQuestion(g.id);
      const text = q.q + ' ' + (q.explain || '') + ' ' + (q.options || []).join(' ');
      assert.ok(!/undefined|NaN(?!O)|Infinity|\[object/.test(text), `${g.id}: ${text.slice(0, 200)}`);
      if (q.type === 'num') assert.ok(Number.isFinite(q.answer), `${g.id}: answer ${q.answer}`);
      if (q.type === 'choice') {
        assert.ok(q.options.length >= 2, `${g.id}: мало вариантов`);
        assert.strictEqual(new Set(q.options).size, q.options.length, `${g.id}: повтор вариантов ${q.options}`);
      }
      if (q.type === 'coeffs') assert.ok(q.coeffs.every(k => k > 0));
      assert.ok(q.explain, `${g.id}: нет решения`);
    }
  }
});

test('Ответы генераторов совпадают с независимым расчётом', () => {
  // молярная масса: ответ генератора = molarMass формулы из условия
  for (let i = 0; i < 50; i++) {
    const q = G.genQuestion('molar-mass');
    const f = q.q.match(/\{([^}]+)\}/)[1];
    assert.strictEqual(q.answer, G.molarMass(f));
  }
  // моногибридное: доли кратны 25 %
  for (let i = 0; i < 50; i++) {
    const q = G.genQuestion('mono');
    assert.ok([0, 25, 50, 75, 100].includes(q.answer), 'mono ' + q.answer);
  }
});

// ---------- Курс ----------
test('Курс: структура, уникальность, ссылки', () => {
  const ids = new Set();
  let lessons = 0, questions = 0;
  for (const m of G.COURSE) {
    assert.ok(['chem', 'phys', 'bio'].includes(m.subject), m.id);
    assert.ok(m.level >= 1 && m.level <= 4, m.id);
    assert.ok(!ids.has(m.id), 'дубль модуля ' + m.id);
    ids.add(m.id);
    for (const t of m.trainers) assert.ok(G.GEN_MAP[t], `${m.id}: нет тренажёра ${t}`);
    for (const l of m.lessons) {
      lessons++;
      assert.ok(l.theory.length >= 3, l.id + ': мало теории');
      assert.ok(l.quiz.length >= 4, l.id + ': мало вопросов');
      for (const b of l.theory) {
        if (b.gen) assert.ok(G.GEN_MAP[b.gen], `${l.id}: нет тренажёра ${b.gen}`);
        if (b.table) b.rows.forEach(r => assert.strictEqual(r.length, b.table.length, `${l.id}: строка таблицы ${r}`));
      }
      const qs = [...l.quiz, ...l.theory.filter(b => b.q).map(b => b.q)];
      for (const q of qs) {
        questions++;
        assert.ok(q.q && q.explain, `${l.id}: вопрос без текста или объяснения`);
        if (q.type === 'choice') assert.strictEqual(new Set(q.options).size, q.options.length, `${l.id}: ${q.q}`);
        if (q.type === 'num') assert.ok(Number.isFinite(q.answer), `${l.id}: ${q.q}`);
        if (q.type === 'coeffs') same(G.balance(q.reactants.join(' + ') + ' = ' + q.products.join(' + ')).coeffs, q.coeffs, `${l.id}: ${q.q}`);
        if (q.type === 'match') assert.ok(q.pairs.length >= 2);
        if (q.type === 'order') assert.strictEqual(new Set(q.items).size, q.items.length, `${l.id}: повтор в порядке`);
      }
    }
  }
  for (const g of G.GENERATORS) assert.ok(G.MODULE_MAP[g.module], `генератор ${g.id}: нет модуля ${g.module}`);
  assert.ok(lessons >= 130, 'уроков ' + lessons);
  assert.ok(questions >= 600, 'вопросов ' + questions);
  // уровни внутри предмета идут по возрастанию
  for (const s of ['chem', 'phys', 'bio']) {
    const lv = G.modulesOf(s).map(m => m.level);
    same(lv, lv.slice().sort((a, b) => a - b));
  }
});

test('Глоссарий: модули существуют, термины уникальны', () => {
  const seen = new Set();
  for (const g of G.GLOSSARY) {
    assert.ok(G.MODULE_MAP[g.module], 'нет модуля ' + g.module + ' для ' + g.term);
    assert.ok(g.def && g.def.length > 5, g.term);
    assert.ok(!seen.has(g.id), 'дубль термина ' + g.term);
    seen.add(g.id);
  }
  assert.ok(G.GLOSSARY.length >= 200);
});

test('Таблица растворимости: прямоугольная, ключевые ячейки', () => {
  for (const [cat, row] of G.SOL_TABLE) assert.strictEqual(row.length, G.SOL_ANIONS.length, cat);
  const cell = (cat, an) => G.SOL_TABLE.find(r => r[0] === cat)[1][G.SOL_ANIONS.indexOf(an)];
  assert.strictEqual(cell('Ba^2+', 'SO4^2-'), 'Н');
  assert.strictEqual(cell('Ag^+', 'Cl^-'), 'Н');
  assert.strictEqual(cell('Ca^2+', 'SO4^2-'), 'М');
  assert.strictEqual(cell('Na^+', 'CO3^2-'), 'Р');
  assert.strictEqual(cell('Ca^2+', 'CO3^2-'), 'Н');
  assert.strictEqual(cell('Al^3+', 'S^2-'), '—');
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
