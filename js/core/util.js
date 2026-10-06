// Общие утилиты: DOM-хелпер, случайности, числа (с запятой), химические формулы, даты.

function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') {
        for (const [prop, val] of Object.entries(v)) {
          if (prop.startsWith('--')) el.style.setProperty(prop, val); else el.style[prop] = val;
        }
      }
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    }
  }
  appendChildren(el, children);
  return el;
}

function appendChildren(el, children) {
  for (const c of children) {
    if (c == null || c === false) continue;
    if (Array.isArray(c)) appendChildren(el, c);
    else if (typeof Node !== 'undefined' && c instanceof Node) el.appendChild(c);
    else el.appendChild(document.createTextNode(String(c)));
  }
}

// Добавить детей, пропуская null/false (нативный append печатает их как текст)
function add(el, ...children) { appendChildren(el, children); return el; }

// SVG-элементы (для схем и лабораторий)
function s(tag, attrs, ...children) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

function esc(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function sample(arr, n) { return shuffle(arr).slice(0, n); }

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// Случайное число из диапазона с шагом: randStep(1, 5, 0.5) → 1, 1.5 … 5
function randStep(min, max, step) {
  const n = Math.round((max - min) / step);
  return roundTo(min + randInt(0, n) * step, 6);
}

function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

function roundTo(x, dp) {
  const k = Math.pow(10, dp);
  return Math.round((x + Number.EPSILON) * k) / k;
}

function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; }
function lcm(a, b) { return a / gcd(a, b) * b; }

// Число по-русски: десятичная запятая, без лишних нулей, неразрывный минус
function fmt(x, dp = 3) {
  if (typeof x !== 'number' || !isFinite(x)) return String(x);
  let v = roundTo(x, dp);
  if (Object.is(v, -0)) v = 0;
  const str = String(v);
  if (/e/.test(str)) return fmtSci(v);
  return str.replace('.', ',').replace('-', '−');
}

// Научная запись: 3,2·10⁻⁵
function fmtSci(x, digits = 2) {
  if (x === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(x)));
  const m = roundTo(x / Math.pow(10, e), digits);
  if (e === 0) return fmt(m, digits);
  return fmt(m, digits) + '·10' + supNum(e);
}

const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', '+': '⁺' };
const SUB = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };
function supNum(n) { return String(n).split('').map(c => SUP[c] || c).join(''); }
function subNum(n) { return String(n).split('').map(c => SUB[c] || c).join(''); }

// Разбор числа, введённого человеком: «2,5», «−3», «+6», «1.2e-3», «3,2·10^-5», «3,2*10^-5»
function parseNum(str) {
  if (typeof str === 'number') return str;
  let t = String(str).trim().replace(/\s+/g, '').replace(/[−–]/g, '-').replace(',', '.');
  if (!t) return NaN;
  const m = t.match(/^([+-]?\d*\.?\d+)(?:[·*x×]10\^?([+-]?\d+))$/i);
  if (m) return parseFloat(m[1]) * Math.pow(10, parseInt(m[2], 10));
  if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(t)) return NaN;
  return parseFloat(t);
}

// Совпадает ли введённое число с ответом (относительная или абсолютная погрешность)
function numClose(got, expected, opts = {}) {
  if (!isFinite(got)) return false;
  const rel = opts.tol ?? 0.01;
  const abs = opts.abs ?? 1e-9;
  return Math.abs(got - expected) <= Math.max(abs, Math.abs(expected) * rel);
}

// Химическая формула → HTML: H2SO4 → H₂SO₄, SO4^2- → SO₄²⁻, CuSO4*5H2O → CuSO₄·5H₂O
function chem(formula) {
  let out = '';
  const str = String(formula).replace(/\*/g, '·');
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === '^') {
      let j = i + 1, chg = '';
      while (j < str.length && /[0-9+\-]/.test(str[j])) chg += str[j++];
      out += '<sup>' + chg.replace('-', '−') + '</sup>';
      i = j - 1;
    } else if (/\d/.test(c) && i > 0 && /[A-Za-z)\]]/.test(str[i - 1])) {
      let j = i, num = '';
      while (j < str.length && /\d/.test(str[j])) num += str[j++];
      out += '<sub>' + num + '</sub>';
      i = j - 1;
    } else out += esc(c);
  }
  return out;
}

// Текст с формулами в фигурных скобках: «Реакция {H2} + {O2}» → HTML
function rich(text) {
  return String(text).replace(/\{([^{}]+)\}/g, (_, f) => '<span class="f">' + chem(f) + '</span>');
}

// Узел с «богатым» HTML
function richEl(tag, text, cls) { return h(tag, { class: cls, html: rich(text) }); }

function plural(n, one, few, many) {
  const m10 = Math.abs(n) % 10, m100 = Math.abs(n) % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

function todayKey(d = new Date()) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function daysBetween(a, b) {
  const da = new Date(a + 'T00:00:00'), db = new Date(b + 'T00:00:00');
  return Math.round((db - da) / 86400000);
}

function fmtTime(sec) {
  sec = Math.max(0, Math.round(sec));
  return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function normalizeText(str) {
  return String(str).toLowerCase().replace(/ё/g, 'е').replace(/[«»"().,;:!?]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Цвет из CSS-переменной (для canvas)
function cssVar(name, el = document.documentElement) {
  return getComputedStyle(el).getPropertyValue(name).trim();
}
