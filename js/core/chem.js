// Химический движок: разбор формул, молярная масса, уравнивание реакций, степени окисления.

// «Ca(OH)2» → { Ca: 1, O: 2, H: 2 }; поддерживает скобки, кристаллогидраты (· или *) и заряд (^2-)
function parseFormula(formula) {
  let str = String(formula).trim().replace(/\s+/g, '').replace(/\^\d*[+\-]$/, '').replace(/[+\-]$/, '');
  str = str.replace(/\[/g, '(').replace(/\]/g, ')');
  const parts = str.split(/[·*]/);
  const total = {};
  for (const part of parts) {
    const m = part.match(/^(\d+)(.*)$/);
    const k = m ? +m[1] : 1;
    const body = m ? m[2] : part;
    const counts = parseGroup(body);
    for (const [el, n] of Object.entries(counts)) total[el] = (total[el] || 0) + n * k;
  }
  return total;
}

function parseGroup(str) {
  let i = 0;
  const parse = () => {
    const counts = {};
    while (i < str.length) {
      const c = str[i];
      if (c === '(') {
        i++;
        const inner = parse();
        if (str[i] !== ')') throw new Error('Не закрыта скобка в ' + str);
        i++;
        const n = readNum();
        for (const [el, k] of Object.entries(inner)) counts[el] = (counts[el] || 0) + k * n;
      } else if (c === ')') {
        return counts;
      } else if (/[A-Z]/.test(c)) {
        let sym = c;
        i++;
        while (i < str.length && /[a-z]/.test(str[i])) sym += str[i++];
        if (!EL[sym]) throw new Error('Неизвестный элемент: ' + sym);
        const n = readNum();
        counts[sym] = (counts[sym] || 0) + n;
      } else throw new Error('Непонятный символ «' + c + '» в формуле');
    }
    return counts;
  };
  const readNum = () => {
    let num = '';
    while (i < str.length && /\d/.test(str[i])) num += str[i++];
    return num ? +num : 1;
  };
  const res = parse();
  if (i < str.length) throw new Error('Лишняя скобка в ' + str);
  return res;
}

// Заряд частицы: «SO4^2-» → -2, «NH4+» → 1, «Fe^3+» → 3, «e» → -1
function formulaCharge(formula) {
  const str = String(formula).trim();
  const m = str.match(/\^(\d*)([+\-])$/) || str.match(/()([+\-])$/);
  if (!m) return 0;
  return (m[1] ? +m[1] : 1) * (m[2] === '+' ? 1 : -1);
}

function molarMass(formula, school = true) {
  const counts = parseFormula(formula);
  let m = 0;
  for (const [el, n] of Object.entries(counts)) m += (school ? schoolMass(el) : EL[el].mass) * n;
  return roundTo(m, 3);
}

// Подробный расчёт молярной массы для объяснений: «2·1 + 32 + 4·16 = 98»
function molarMassSteps(formula) {
  const counts = parseFormula(formula);
  const terms = Object.entries(counts).map(([el, n]) => (n > 1 ? n + '·' : '') + fmt(schoolMass(el)));
  return terms.join(' + ') + ' = ' + fmt(molarMass(formula)) + ' г/моль';
}

// Массовая доля элемента в веществе
function massFraction(formula, el) {
  const counts = parseFormula(formula);
  return (schoolMass(el) * (counts[el] || 0)) / molarMass(formula);
}

// ---------- Уравнивание реакций (ядро матрицы, рациональные числа) ----------
// «Fe + O2 = Fe2O3» → { reactants: ['Fe','O2'], products: ['Fe2O3'], coeffs: [4, 3, 2] }
function splitEquation(eq) {
  const [l, r] = String(eq).split(/\s*(?:=|→|->|⟶)\s*/);
  if (r == null) throw new Error('Нужен знак «=» или «→» между реагентами и продуктами');
  const side = x => x.split(/\s+\+\s+/).map(t => t.trim()).filter(Boolean).map(t => t.replace(/^\d+(?=[A-Z(\[])/, ''));
  return { reactants: side(l), products: side(r) };
}

function balance(eq) {
  const { reactants, products } = splitEquation(eq);
  const species = [...reactants, ...products];
  const parsed = species.map(sp => sp === 'e' || sp === 'e-' ? {} : parseFormula(sp));
  const charges = species.map(sp => sp === 'e' || sp === 'e-' ? -1 : formulaCharge(sp));
  const elements = [...new Set(parsed.flatMap(p => Object.keys(p)))];
  const rows = elements.map(el => species.map((_, j) => (parsed[j][el] || 0) * (j < reactants.length ? 1 : -1)));
  if (charges.some(c => c !== 0)) rows.push(species.map((_, j) => charges[j] * (j < reactants.length ? 1 : -1)));
  const ns = nullspace(rows, species.length);
  if (ns.length !== 1) {
    throw new Error(ns.length === 0 ? 'Уравнение невозможно уравнять — проверьте формулы' : 'У уравнения несколько независимых решений');
  }
  let v = ns[0];
  // Переводим дроби в наименьшие целые
  const den = v.reduce((acc, f) => lcm(acc, f[1]), 1);
  let ints = v.map(f => f[0] * (den / f[1]));
  const g = ints.reduce((acc, x) => gcd(acc, x), 0) || 1;
  ints = ints.map(x => x / g);
  if (ints.every(x => x <= 0)) ints = ints.map(x => -x);
  if (ints.some(x => x <= 0)) throw new Error('Реакция не уравнивается с положительными коэффициентами');
  return { reactants, products, coeffs: ints };
}

function formatEquation(res, html = true) {
  const part = (list, off) => list.map((sp, i) => {
    const c = res.coeffs[i + off];
    return (c === 1 ? '' : c) + (html ? chem(sp) : sp);
  }).join(' + ');
  return part(res.reactants, 0) + ' → ' + part(res.products, res.reactants.length);
}

// Рациональная арифметика: дробь — [числитель, знаменатель]
function fr(n, d = 1) {
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d) || 1;
  return [n / g, d / g];
}
const frSub = (a, b) => fr(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
const frMul = (a, b) => fr(a[0] * b[0], a[1] * b[1]);
const frDiv = (a, b) => fr(a[0] * b[1], a[1] * b[0]);

// Базис ядра матрицы (метод Гаусса над рациональными числами)
function nullspace(rows, ncols) {
  const m = rows.map(r => r.map(x => fr(x)));
  const pivots = [];
  let r = 0;
  for (let c = 0; c < ncols && r < m.length; c++) {
    let p = r;
    while (p < m.length && m[p][c][0] === 0) p++;
    if (p === m.length) continue;
    [m[r], m[p]] = [m[p], m[r]];
    const pv = m[r][c];
    m[r] = m[r].map(x => frDiv(x, pv));
    for (let i = 0; i < m.length; i++) {
      if (i !== r && m[i][c][0] !== 0) {
        const f = m[i][c];
        m[i] = m[i].map((x, j) => frSub(x, frMul(f, m[r][j])));
      }
    }
    pivots.push(c);
    r++;
  }
  const free = [];
  for (let c = 0; c < ncols; c++) if (!pivots.includes(c)) free.push(c);
  return free.map(fc => {
    const v = Array.from({ length: ncols }, () => fr(0));
    v[fc] = fr(1);
    pivots.forEach((pc, i) => { v[pc] = fr(-m[i][fc][0], m[i][fc][1]); });
    return v;
  });
}

// ---------- Степени окисления ----------
// Решает степень окисления одного «неизвестного» элемента по правилам постоянных степеней.
const FIXED_OX = { F: -1, Li: 1, Na: 1, K: 1, Rb: 1, Cs: 1, Be: 2, Mg: 2, Ca: 2, Sr: 2, Ba: 2, Al: 3, Zn: 2, Ag: 1 };
const METALS = new Set(ELEMENTS.filter(e => ['am', 'ae', 'tm', 'pt', 'la', 'ac'].includes(e.cat)).map(e => e.sym));

function oxidationState(formula, target) {
  const counts = parseFormula(formula);
  const charge = formulaCharge(formula);
  const els = Object.keys(counts);
  if (els.length === 1) return charge / counts[els[0]]; // простое вещество или простой ион
  const known = {};
  for (const el of els) {
    if (el === target) continue;
    if (FIXED_OX[el] != null) known[el] = FIXED_OX[el];
    else if (el === 'H') known.H = els.every(x => x === 'H' || METALS.has(x)) ? -1 : 1;
    else if (el === 'O') known.O = counts.F ? 2 : -2;
  }
  const unknown = els.filter(el => known[el] == null);
  if (unknown.length !== 1 || unknown[0] !== target) throw new Error('Не могу однозначно определить степень окисления ' + target + ' в ' + formula);
  let sum = 0;
  for (const [el, ox] of Object.entries(known)) sum += ox * counts[el];
  return (charge - sum) / counts[target];
}

function fmtOx(n) { return n > 0 ? '+' + n : n < 0 ? '−' + -n : '0'; }
