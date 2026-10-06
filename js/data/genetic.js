// Генетический код (иРНК → аминокислота) и вспомогательные функции молекулярной биологии.

const BASES = 'UCAG';
// 64 кодона в порядке U C A G по каждой позиции; * — стоп-кодон
const CODE_STRING = 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';

const AMINO = {
  F: { ru: 'Фен', name: 'фенилаланин' }, L: { ru: 'Лей', name: 'лейцин' }, I: { ru: 'Иле', name: 'изолейцин' },
  M: { ru: 'Мет', name: 'метионин' }, V: { ru: 'Вал', name: 'валин' }, S: { ru: 'Сер', name: 'серин' },
  P: { ru: 'Про', name: 'пролин' }, T: { ru: 'Тре', name: 'треонин' }, A: { ru: 'Ала', name: 'аланин' },
  Y: { ru: 'Тир', name: 'тирозин' }, H: { ru: 'Гис', name: 'гистидин' }, Q: { ru: 'Глн', name: 'глутамин' },
  N: { ru: 'Асн', name: 'аспарагин' }, K: { ru: 'Лиз', name: 'лизин' }, D: { ru: 'Асп', name: 'аспарагиновая кислота' },
  E: { ru: 'Глу', name: 'глутаминовая кислота' }, C: { ru: 'Цис', name: 'цистеин' }, W: { ru: 'Три', name: 'триптофан' },
  R: { ru: 'Арг', name: 'аргинин' }, G: { ru: 'Гли', name: 'глицин' }, '*': { ru: 'стоп', name: 'стоп-кодон' },
};

const CODON_TABLE = {};
for (let i = 0; i < 64; i++) {
  const codon = BASES[i >> 4] + BASES[(i >> 2) & 3] + BASES[i & 3];
  CODON_TABLE[codon] = CODE_STRING[i];
}

// Русские буквы ↔ латинские (в ЕГЭ нуклеотиды пишут по-русски: А, Т, Г, Ц, У)
const RU2LAT = { 'А': 'A', 'Т': 'T', 'Г': 'G', 'Ц': 'C', 'У': 'U' };
const LAT2RU = { A: 'А', T: 'Т', G: 'Г', C: 'Ц', U: 'У' };
function toLat(seq) { return String(seq).toUpperCase().split('').map(c => RU2LAT[c] || c).filter(c => /[ATGCU]/.test(c)).join(''); }
function toRu(seq) { return String(seq).split('').map(c => LAT2RU[c] || c).join(''); }

const DNA_PAIR = { A: 'T', T: 'A', G: 'C', C: 'G' };
const RNA_FROM_DNA = { A: 'U', T: 'A', G: 'C', C: 'G' };
const RNA_PAIR = { A: 'U', U: 'A', G: 'C', C: 'G' };

function complementDNA(seq) { return toLat(seq).split('').map(c => DNA_PAIR[c]).join(''); }
function transcribe(templateDNA) { return toLat(templateDNA).split('').map(c => RNA_FROM_DNA[c]).join(''); }
function anticodons(mrna) { return codonsOf(toLat(mrna).split('').map(c => RNA_PAIR[c]).join('')); }

function codonsOf(seq) {
  const out = [];
  for (let i = 0; i + 3 <= seq.length; i += 3) out.push(seq.slice(i, i + 3));
  return out;
}

// Трансляция: массив аминокислот (однобуквенные коды); stopAtStop — обрывать на стоп-кодоне
function translate(mrna, stopAtStop = true) {
  const res = [];
  for (const c of codonsOf(toLat(mrna))) {
    const aa = CODON_TABLE[c];
    if (aa === '*' && stopAtStop) { res.push('*'); break; }
    res.push(aa);
  }
  return res;
}

function aaRu(list) { return list.map(a => AMINO[a].ru).join('–'); }

// Случайная последовательность ДНК без стоп-кодонов в иРНК (для генераторов задач)
function randomTemplateDNA(codons) {
  const sense = [];
  const pool = Object.keys(CODON_TABLE).filter(c => CODON_TABLE[c] !== '*');
  for (let i = 0; i < codons; i++) sense.push(pick(pool));
  // иРНК = sense; матричная ДНК — комплементарна иРНК
  const mrna = sense.join('');
  return mrna.split('').map(c => ({ A: 'T', U: 'A', G: 'C', C: 'G' }[c])).join('');
}

// ---------- Классическая генетика ----------
// Генотип записывается парами аллелей по локусам: 'AaBb'. Гаметы: 'AaBb' → ['AB', 'Ab', 'aB', 'ab']
function gametes(genotype) {
  const loci = [];
  for (let i = 0; i < genotype.length; i += 2) loci.push([genotype[i], genotype[i + 1]]);
  let res = [''];
  for (const [a, b] of loci) {
    const next = [];
    for (const g of res) { next.push(g + a); if (b !== a) next.push(g + b); }
    res = next;
  }
  return [...new Set(res)];
}

// Все зиготы (с повторами, как в решётке Пеннета): массив генотипов вида 'AaBb'
function crossGenotypes(g1, g2) {
  const ga = gametesWithMultiplicity(g1), gb = gametesWithMultiplicity(g2);
  const out = [];
  for (const x of ga) for (const y of gb) {
    let z = '';
    for (let i = 0; i < x.length; i++) {
      const pair = [x[i], y[i]].sort((p, q) => (p === p.toUpperCase() ? 0 : 1) - (q === q.toUpperCase() ? 0 : 1));
      z += pair.join('');
    }
    out.push(z);
  }
  return out;
}

// Гаметы с кратностью (для гомозиготы AA — две одинаковые гаметы A, чтобы решётка была 2×2)
function gametesWithMultiplicity(genotype) {
  let res = [''];
  for (let i = 0; i < genotype.length; i += 2) {
    const next = [];
    for (const g of res) next.push(g + genotype[i], g + genotype[i + 1]);
    res = next;
  }
  return res;
}

// Фенотип при полном доминировании: строка из букв (заглавная — доминантный признак)
function phenotypeOf(genotype) {
  let p = '';
  for (let i = 0; i < genotype.length; i += 2) {
    const dom = genotype[i] === genotype[i].toUpperCase() || genotype[i + 1] === genotype[i + 1].toUpperCase();
    p += dom ? genotype[i].toUpperCase() : genotype[i].toLowerCase();
  }
  return p;
}

// Доля потомков с условием
function fraction(list, test) { return list.filter(test).length / list.length; }
