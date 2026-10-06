// Генераторы задач по биологии: генетика, молекулярная биология, деление клеток, обмен веществ, экология.

// Признаки с полным доминированием: [организм, доминантный, рецессивный]
const TRAITS = [
  ['горох', 'жёлтые семена', 'зелёные семена'], ['горох', 'гладкие семена', 'морщинистые семена'],
  ['томат', 'красные плоды', 'жёлтые плоды'], ['морская свинка', 'чёрная шерсть', 'белая шерсть'],
  ['дрозофила', 'серое тело', 'чёрное тело'], ['дрозофила', 'нормальные крылья', 'зачаточные крылья'],
  ['человек', 'здоров (норма)', 'фенилкетонурия (аутосомно-рецессивная)'], ['человек', 'нормальная пигментация', 'альбинизм'],
  ['человек', 'полидактилия (доминантная)', 'пятипалая кисть'], ['человек', 'здоров (норма)', 'муковисцидоз (аутосомно-рецессивный)'],
];

const MONO_CROSSES = [['Aa', 'Aa'], ['Aa', 'aa'], ['AA', 'aa'], ['AA', 'Aa'], ['Aa', 'Aa'], ['Aa', 'aa']];

defGen({
  id: 'mono', subject: 'bio', module: 'bio-genetics', level: 2, icon: '🫛',
  title: 'Моногибридное скрещивание', desc: 'Законы Менделя, вероятность признака',
  gen() {
    const [org, dom, rec] = pick(TRAITS);
    const [p1, p2] = pick(MONO_CROSSES);
    const kids = crossGenotypes(p1, p2);
    const askRec = Math.random() < 0.5;
    const share = fraction(kids, g => (phenotypeOf(g) === 'a') === askRec) * 100;
    const table = kids.join(', ');
    const ph = g => phenotypeOf(g) === 'A' ? dom : rec;
    return N(`${org[0].toUpperCase() + org.slice(1)}: признак «${dom}» (A) доминирует над «${rec}» (a). Скрещивают особей ${p1} (${ph(p1)}) и ${p2} (${ph(p2)}). Какова вероятность (%) появления потомка с признаком «${askRec ? rec : dom}»?`,
      share, '%',
      `Гаметы: ${p1} → ${gametes(p1).join(', ')}; ${p2} → ${gametes(p2).join(', ')}. Решётка Пеннета даёт генотипы: ${table}. ` +
      `«${askRec ? rec : dom}» — ${askRec ? 'только у aa' : 'у AA и Aa'}: ${fmt(share)} %.`, 0.001);
  },
});

defGen({
  id: 'di', subject: 'bio', module: 'bio-genetics', level: 3, icon: '🎲',
  title: 'Дигибридное скрещивание', desc: 'Независимое наследование, 9 : 3 : 3 : 1',
  gen() {
    const crosses = [['AaBb', 'AaBb'], ['AaBb', 'aabb'], ['AaBb', 'Aabb'], ['AABb', 'aaBb'], ['AaBB', 'Aabb']];
    const [p1, p2] = pick(crosses);
    const kids = crossGenotypes(p1, p2);
    const phen = pick(['AB', 'Ab', 'aB', 'ab'].filter(ph => kids.some(g => phenotypeOf(g) === ph)));
    const desc = { AB: 'жёлтые гладкие', Ab: 'жёлтые морщинистые', aB: 'зелёные гладкие', ab: 'зелёные морщинистые' };
    const share = fraction(kids, g => phenotypeOf(g) === phen) * 100;
    const per = (gt, d) => {
      const g = gt.slice(d * 2, d * 2 + 2);
      return g;
    };
    const locusProb = d => {
      const g1 = per(p1, d), g2 = per(p2, d);
      const k = crossGenotypes(g1, g2);
      const wantDom = phen[d] === phen[d].toUpperCase();
      return fraction(k, g => (phenotypeOf(g) === phenotypeOf(g).toUpperCase()) === wantDom);
    };
    const pA = locusProb(0), pB = locusProb(1);
    return N(`У гороха жёлтая окраска (A) доминирует над зелёной (a), гладкая форма (B) — над морщинистой (b); гены в разных хромосомах. Скрещивают ${p1} × ${p2}. Какова доля (%) потомков с фенотипом «${desc[phen]}»?`,
      share, '%',
      `Гены наследуются независимо, поэтому вероятности перемножаются. По окраске: ${per(p1, 0)} × ${per(p2, 0)} → нужный признак с вероятностью ${fmt(pA)}; по форме: ${per(p1, 1)} × ${per(p2, 1)} → ${fmt(pB)}. Итог: ${fmt(pA)} · ${fmt(pB)} = ${fmt(share / 100, 4)} = ${fmt(share, 2)} %.`, 0.001, 0.01);
  },
});

defGen({
  id: 'sexlinked', subject: 'bio', module: 'bio-genetics', level: 3, icon: '🩸',
  title: 'Сцепленное с полом', desc: 'Гемофилия и дальтонизм: X-сцепленные признаки',
  gen() {
    const dis = pick([['гемофилия', 'h', 'H'], ['дальтонизм', 'd', 'D']]);
    const [, r, D] = dis;
    const variant = pick(['carrierXhealthy', 'carrierXsick', 'healthyXsick']);
    let mother, father, mDesc, fDesc;
    if (variant === 'carrierXhealthy') { mother = [D, r]; father = D; mDesc = 'носительница'; fDesc = 'здоров'; }
    if (variant === 'carrierXsick') { mother = [D, r]; father = r; mDesc = 'носительница'; fDesc = 'болен'; }
    if (variant === 'healthyXsick') { mother = [D, D]; father = r; mDesc = 'здорова, не носительница'; fDesc = 'болен'; }
    const kids = [];
    for (const xm of mother) { kids.push({ sex: 'дочь', g: [xm, father] }); kids.push({ sex: 'сын', g: [xm] }); }
    const sick = k => k.g.every(a => a === r);
    const ask = pick(['sonsOfAll', 'amongSons', 'carrierDaughters']);
    let ans, what;
    if (ask === 'sonsOfAll') { ans = kids.filter(k => k.sex === 'сын' && sick(k)).length / kids.length * 100; what = 'рождения больного сына (среди всех детей)'; }
    if (ask === 'amongSons') { const sons = kids.filter(k => k.sex === 'сын'); ans = sons.filter(sick).length / sons.length * 100; what = 'того, что сын будет болен'; }
    if (ask === 'carrierDaughters') { const ds = kids.filter(k => k.sex === 'дочь'); ans = ds.filter(k => !sick(k) && k.g.includes(r)).length / ds.length * 100; what = 'того, что дочь окажется носительницей (здоровой)'; }
    const X = a => `X<sup>${a}</sup>`;
    const list = kids.map(k => k.sex === 'сын' ? `${X(k.g[0])}Y` : `${X(k.g[0])}${X(k.g[1])}`).join(', ');
    return N(`${dis[0][0].toUpperCase() + dis[0].slice(1)} — рецессивный признак, сцепленный с X-хромосомой. Мать ${mDesc} (${X(mother[0])}${X(mother[1])}), отец ${fDesc} (${X(father)}Y). Какова вероятность (%) ${what}?`,
      ans, '%',
      `Гаметы матери: ${X(mother[0])}, ${X(mother[1])}; отца: ${X(father)}, Y. Дети: ${list}. Сын получает X только от матери, поэтому отец не передаёт сыновьям X-сцепленные болезни. Ответ: ${fmt(ans)} %.`, 0.001);
  },
});

const ABO = { 'I': ['ii'], 'II': ['IᴬIᴬ', 'IᴬI'], 'III': ['IᴮIᴮ', 'IᴮI'], 'IV': ['IᴬIᴮ'] };
const ABO_ALLELES = { 'ii': ['i', 'i'], 'IᴬIᴬ': ['A', 'A'], 'IᴬI': ['A', 'i'], 'IᴮIᴮ': ['B', 'B'], 'IᴮI': ['B', 'i'], 'IᴬIᴮ': ['A', 'B'] };
function aboGroup(a, b) {
  const s = new Set([a, b]);
  if (s.has('A') && s.has('B')) return 'IV';
  if (s.has('A')) return 'II';
  if (s.has('B')) return 'III';
  return 'I';
}
const ABO_LABEL = { 'IᴬI': 'Iᴬi', 'IᴮI': 'Iᴮi' };

defGen({
  id: 'blood', subject: 'bio', module: 'bio-genetics', level: 3, icon: '🅰️',
  title: 'Группы крови', desc: 'Наследование групп крови АВ0 (кодоминирование)',
  gen() {
    const gts = Object.keys(ABO_ALLELES);
    const g1 = pick(gts), g2 = pick(gts);
    const groups = new Set();
    for (const a of ABO_ALLELES[g1]) for (const b of ABO_ALLELES[g2]) groups.add(aboGroup(a, b));
    const all = ['I', 'II', 'III', 'IV'];
    const name = g => `${g} (${{ I: '0', II: 'A', III: 'B', IV: 'AB' }[g]})`;
    const lab = g => ABO_LABEL[g] || g;
    return M(`Генотип матери ${lab(g1)}, отца ${lab(g2)}. Какие группы крови возможны у их детей? Выберите все.`,
      all.filter(g => groups.has(g)).map(name), all.filter(g => !groups.has(g)).map(name),
      `Аллели Iᴬ и Iᴮ доминируют над i и кодоминантны друг другу (IᴬIᴮ — IV группа). Гаметы матери: ${[...new Set(ABO_ALLELES[g1])].join(', ')}; отца: ${[...new Set(ABO_ALLELES[g2])].join(', ')}. Возможные группы: ${[...groups].sort().map(name).join(', ')}.`);
  },
});

defGen({
  id: 'dna-complement', subject: 'bio', module: 'bio-protein', level: 2, icon: '🧬',
  title: 'Комплементарность ДНК', desc: 'Вторая цепь, иРНК, антикодоны тРНК',
  gen() {
    const tpl = randomTemplateDNA(randInt(3, 5));
    const kind = pick(['dna', 'mrna', 'trna']);
    const sp = x => toRu(x);
    if (kind === 'dna') {
      return W(`Фрагмент цепи ДНК: ${sp(tpl)}. Запишите комплементарную цепь (буквами А, Т, Г, Ц, без пробелов).`, sp(complementDNA(tpl)),
        `Принцип комплементарности: А — Т, Г — Ц. Ответ: ${sp(complementDNA(tpl))}.`);
    }
    if (kind === 'mrna') {
      return W(`Матричная (транскрибируемая) цепь ДНК: ${sp(tpl)}. Запишите последовательность иРНК (буквами А, У, Г, Ц).`, sp(transcribe(tpl)),
        `При транскрипции иРНК строится комплементарно матричной цепи, вместо тимина — урацил: А→У, Т→А, Г→Ц, Ц→Г. Ответ: ${sp(transcribe(tpl))}.`);
    }
    const mrna = transcribe(tpl);
    const anti = anticodons(mrna);
    return W(`Фрагмент иРНК: ${sp(mrna)}. Запишите антикодоны тРНК, которые доставят аминокислоты, через пробел (например: ААГ УЦЦ).`, sp(anti.join(' ')),
      `Антикодон тРНК комплементарен кодону иРНК: ${codonsOf(mrna).map((c, i) => sp(c) + '→' + sp(anti[i])).join(', ')}.`);
  },
});

defGen({
  id: 'translation', subject: 'bio', module: 'bio-protein', level: 3, icon: '🔬',
  title: 'Биосинтез белка', desc: 'ДНК → иРНК → белок по таблице генетического кода',
  gen() {
    const tpl = randomTemplateDNA(randInt(3, 4));
    const mrna = transcribe(tpl);
    const prot = translate(mrna);
    const wrongs = new Set();
    // правдоподобные ошибки: перевод по смысловой цепи, сдвиг рамки, перевод без замены Т→У
    const sense = complementDNA(tpl).replace(/T/g, 'U');
    wrongs.add(aaRu(translate(tpl.replace(/T/g, 'U'), false).map(a => a === '*' ? 'G' : a)));
    wrongs.add(aaRu(translate(sense.slice(1) + 'A', false).map(a => a === '*' ? 'S' : a)));
    const shuffled = shuffle(prot.slice());
    wrongs.add(aaRu(shuffled));
    wrongs.delete(aaRu(prot));
    while (wrongs.size < 3) wrongs.add(aaRu(prot.map(a => pick(Object.keys(AMINO).filter(x => x !== '*')))));
    return C(`Матричная цепь ДНК: ${toRu(tpl)}. Определите последовательность аминокислот во фрагменте белка (используйте таблицу генетического кода в «Справочнике»).`,
      aaRu(prot), [...wrongs].slice(0, 3),
      `1) иРНК (комплементарно матричной цепи, Т→А, А→У): ${toRu(mrna)}. 2) Делим на кодоны: ${codonsOf(mrna).map(toRu).join(' ')}. 3) По таблице: ${codonsOf(mrna).map((c, i) => toRu(c) + ' — ' + AMINO[prot[i]].ru).join('; ')}.`);
  },
});

defGen({
  id: 'chargaff', subject: 'bio', module: 'bio-chemistry', level: 2, icon: '📊',
  title: 'Правило Чаргаффа', desc: 'Нуклеотидный состав ДНК',
  gen() {
    const A = randInt(5, 45);
    const base = pick(['А', 'Т', 'Г', 'Ц']);
    const pair = { 'А': 'Т', 'Т': 'А', 'Г': 'Ц', 'Ц': 'Г' };
    const ask = pick(['same-pair', 'other']);
    const given = base;
    const value = A;
    const target = ask === 'same-pair' ? pair[base] : pick(['А', 'Т', 'Г', 'Ц'].filter(b => b !== base && b !== pair[base]));
    const ans = target === pair[base] ? value : 50 - value;
    if (Math.random() < 0.3) {
      const total = randInt(10, 40) * 100;
      const nA = Math.round(total * value / 100);
      return N(`В молекуле ДНК ${total} нуклеотидов, из них ${nA} — с азотистым основанием ${given}. Сколько в ней нуклеотидов с ${target}?`,
        target === pair[base] ? nA : (total - 2 * nA) / 2, '',
        `По правилу Чаргаффа ${given} = ${pair[given]} = ${nA}. ${target === pair[base] ? '' : `На пару Г+Ц (или А+Т) приходится ${total} − 2·${nA} = ${total - 2 * nA}, поровну на каждое основание: ${(total - 2 * nA) / 2}.`}`, 0);
    }
    return N(`В молекуле ДНК нуклеотиды с ${given} составляют ${value} %. Каково содержание (%) нуклеотидов с ${target}?`, ans, '%',
      `Правило Чаргаффа: А = Т, Г = Ц, а А + Г = Т + Ц = 50 %. ${given} = ${pair[given]} = ${value} %; ${target === pair[base] ? '' : `на каждое из двух других оснований: (100 − 2·${value})/2 = ${50 - value} %.`}`, 0);
  },
});

defGen({
  id: 'dna-math', subject: 'bio', module: 'bio-protein', level: 4, icon: '📏',
  title: 'Расчёты по ДНК и белку', desc: 'Аминокислоты ⇄ нуклеотиды ⇄ длина гена ⇄ масса',
  gen() {
    const kind = pick(['aa2nt', 'nt2aa', 'length', 'mass', 'trna']);
    const aa = randInt(50, 400);
    if (kind === 'aa2nt') return N(`Белок состоит из ${aa} аминокислот. Сколько нуклеотидов в участке иРНК, кодирующем этот белок (без стоп-кодона)?`, aa * 3, '',
      `Каждая аминокислота кодируется триплетом: ${aa}·3 = ${aa * 3} нуклеотидов иРНК. В гене (двуцепочечной ДНК) их было бы вдвое больше: ${aa * 6}.`, 0);
    if (kind === 'nt2aa') return N(`Участок иРНК содержит ${aa * 3} нуклеотидов (без стоп-кодона). Сколько аминокислот в белке, синтезированном по нему?`, aa, '',
      `${aa * 3} / 3 = ${aa} аминокислот (один триплет — одна аминокислота).`, 0);
    if (kind === 'trna') return N(`В синтезе белка участвовало ${aa} молекул тРНК (каждая принесла одну аминокислоту). Сколько нуклеотидов в кодирующей цепи гена?`, aa * 3, '',
      `Число тРНК = числу аминокислот = ${aa}. Число кодонов иРНК = ${aa}, нуклеотидов ${aa * 3}; в одной цепи гена столько же: ${aa * 3}.`, 0);
    if (kind === 'length') return N(`Определите длину (нм) участка гена, кодирующего белок из ${aa} аминокислот. Расстояние между соседними нуклеотидами — 0,34 нм.`, roundTo(aa * 3 * 0.34, 2), 'нм',
      `Нуклеотидов в одной цепи: ${aa}·3 = ${aa * 3}. Длина: ${aa * 3}·0,34 = ${fmt(aa * 3 * 0.34, 2)} нм (длина двойной спирали равна длине одной цепи).`, 0.001);
    return N(`Средняя масса аминокислоты 110 а. е. м., нуклеотида — 345 а. е. м. Во сколько раз (до сотых) масса кодирующей цепи гена тяжелее белка из ${aa} аминокислот?`, roundTo(3 * 345 / 110, 2), 'раз',
      `Масса белка: ${aa}·110. Масса одной цепи гена: ${aa}·3·345. Отношение: 3·345/110 = ${fmt(3 * 345 / 110, 2)} — не зависит от длины.`, 0, 0.006);
  },
});

// Набор хромосом и ДНК по фазам (для клетки, у которой в соматической клетке 2n хромосом)
const PHASES = [
  ['интерфаза, период G1 (пресинтетический)', 2, 2, 'mit'], ['профаза митоза', 2, 4, 'mit'], ['метафаза митоза', 2, 4, 'mit'],
  ['анафаза митоза', 4, 4, 'mit'], ['телофаза митоза (в каждой дочерней клетке)', 2, 2, 'mit'],
  ['профаза мейоза I', 2, 4, 'mei'], ['метафаза мейоза I', 2, 4, 'mei'], ['анафаза мейоза I', 2, 4, 'mei'],
  ['телофаза мейоза I (в каждой клетке)', 1, 2, 'mei'], ['метафаза мейоза II', 1, 2, 'mei'], ['анафаза мейоза II', 2, 2, 'mei'],
  ['телофаза мейоза II (в каждой клетке)', 1, 1, 'mei'],
];
const PHASE_WHY = {
  'интерфаза, период G1 (пресинтетический)': 'До удвоения ДНК каждая хромосома состоит из одной хроматиды: 2n2c.',
  'профаза митоза': 'ДНК удвоилась в S-периоде: хромосомы двухроматидные — 2n4c.',
  'метафаза митоза': 'Хромосомы двухроматидные выстроены на экваторе — 2n4c.',
  'анафаза митоза': 'Сестринские хроматиды расходятся и становятся самостоятельными хромосомами: в клетке временно 4n4c.',
  'телофаза митоза (в каждой дочерней клетке)': 'Каждая дочерняя клетка получает 2n2c — копию материнской.',
  'профаза мейоза I': 'Хромосомы двухроматидные, идёт конъюгация и кроссинговер — 2n4c.',
  'метафаза мейоза I': 'Пары гомологов (биваленты) на экваторе — 2n4c.',
  'анафаза мейоза I': 'К полюсам расходятся целые гомологичные хромосомы (двухроматидные), набор в клетке ещё 2n4c.',
  'телофаза мейоза I (в каждой клетке)': 'В каждой клетке гаплоидный набор двухроматидных хромосом — n2c.',
  'метафаза мейоза II': 'Набор n2c, хромосомы на экваторе.',
  'анафаза мейоза II': 'Хроматиды расходятся, в клетке временно 2n2c.',
  'телофаза мейоза II (в каждой клетке)': 'Гаметы (споры) — nc.',
};

defGen({
  id: 'division', subject: 'bio', module: 'bio-division', level: 3, icon: '🔀',
  title: 'Митоз и мейоз: n и c', desc: 'Число хромосом и молекул ДНК в фазах деления',
  gen() {
    const org = pick([['человека', 46], ['дрозофилы', 8], ['кошки', 38], ['собаки', 78], ['пшеницы', 42], ['гороха', 14], ['кукурузы', 20]]);
    const [phase, nk, ck] = pick(PHASES);
    const n = org[1] / 2;
    const ask = pick(['chr', 'dna']);
    const ans = ask === 'chr' ? nk * n : ck * n;
    return N(`В соматических клетках ${org[0]} ${org[1]} хромосом. Сколько ${ask === 'chr' ? 'хромосом' : 'молекул ДНК'} в клетке в фазе: ${phase}?`, ans, '',
      `${PHASE_WHY[phase]} При n = ${n}: ${ask === 'chr' ? 'хромосом' : 'молекул ДНК'} = ${ask === 'chr' ? nk : ck}·${n} = ${ans}.`, 0);
  },
});

defGen({
  id: 'atp', subject: 'bio', module: 'bio-metabolism', level: 3, icon: '🔋',
  title: 'Энергетический обмен', desc: 'АТФ при гликолизе и полном окислении глюкозы',
  gen() {
    const n = randInt(2, 15);
    const kind = pick(['total', 'glyco', 'oxygen', 'co2', 'lactate']);
    if (kind === 'total') return N(`Сколько молекул АТФ образуется при полном (кислородном) окислении ${n} молекул глюкозы?`, 38 * n, 'АТФ',
      `Из 1 молекулы глюкозы: гликолиз — 2 АТФ, кислородный этап — 36 АТФ, всего 38. ${n}·38 = ${38 * n}.`, 0);
    if (kind === 'glyco') return N(`Сколько молекул АТФ (чистый выход) образуется при гликолизе ${n} молекул глюкозы?`, 2 * n, 'АТФ',
      `При гликолизе одна глюкоза → 2 ПВК и 2 АТФ. ${n}·2 = ${2 * n}.`, 0);
    if (kind === 'oxygen') return N(`Сколько молекул АТФ образуется на кислородном этапе, если в гликолиз вступило ${n} молекул глюкозы?`, 36 * n, 'АТФ',
      `${n} глюкоз дают ${2 * n} ПВК; каждая ПВК в митохондриях даёт 18 АТФ, т. е. 36 на одну глюкозу: ${36 * n}.`, 0);
    if (kind === 'co2') return N(`Сколько молекул CO₂ выделится при полном окислении ${n} молекул глюкозы?`, 6 * n, '',
      `C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O: на одну глюкозу 6 CO₂ (и 6 O₂ расходуется). ${n}·6 = ${6 * n}.`, 0);
    return N(`При интенсивной работе в мышцах ${n} молекул глюкозы подверглись молочнокислому брожению (без кислорода). Сколько АТФ получили клетки?`, 2 * n, 'АТФ',
      `Без кислорода работает только гликолиз: 2 АТФ на глюкозу, ПВК превращается в молочную кислоту (лактат). ${n}·2 = ${2 * n} — в 19 раз меньше, чем при дыхании.`, 0);
  },
});

defGen({
  id: 'eco-pyramid', subject: 'bio', module: 'bio-ecology', level: 2, icon: '🔺',
  title: 'Правило 10 %', desc: 'Экологические пирамиды и цепи питания',
  gen() {
    const chains = [['растения', 'кузнечики', 'лягушки', 'ужи', 'орёл'], ['фитопланктон', 'зоопланктон', 'сельдь', 'тюлень'], ['трава', 'заяц', 'лиса'], ['трава', 'мышь', 'змея', 'ястреб']];
    const ch = pick(chains);
    const top = ch.length - 1;
    const mTop = pick([1, 2, 5, 10]);
    const ans = mTop * Math.pow(10, top);
    if (Math.random() < 0.5) {
      return N(`Цепь питания: ${ch.join(' → ')}. Какая масса (кг) продуцентов нужна, чтобы вырос ${ch[top]} массой ${mTop} кг? Используйте правило 10 %.`, ans, 'кг',
        `На каждый следующий уровень переходит ≈10 % энергии (биомассы). Уровней перехода: ${top}. ${mTop}·10<sup>${top}</sup> = ${ans} кг.`, 0);
    }
    const E = pick([10000, 100000, 50000]);
    const lvl = randInt(1, top);
    return N(`Цепь питания: ${ch.join(' → ')}. Продуценты накопили ${E} кДж энергии. Сколько энергии (кДж) достанется звену «${ch[lvl]}»?`, E / Math.pow(10, lvl), 'кДж',
      `Переходов: ${lvl}. ${E}/10<sup>${lvl}</sup> = ${fmt(E / Math.pow(10, lvl))} кДж.`, 0.001);
  },
});

defGen({
  id: 'hardy', subject: 'bio', module: 'bio-evolution', level: 4, icon: '👥',
  title: 'Закон Харди — Вайнберга', desc: 'Частоты аллелей и генотипов в популяции',
  gen() {
    const q = pick([0.1, 0.2, 0.3, 0.01, 0.05, 0.4]);
    const p = 1 - q;
    const kind = pick(['carriers', 'p', 'dominant']);
    const dis = pick(['альбинизм', 'фенилкетонурия', 'муковисцидоз']);
    const q2 = roundTo(q * q, 6);
    if (kind === 'p') return N(`Частота рецессивного заболевания (${dis}) в популяции ${fmt(q2 * 100, 4)} %. Найдите частоту доминантного аллеля p (до сотых).`, roundTo(p, 2), '',
      `q² = ${fmt(q2, 6)} → q = ${fmt(q)}; p = 1 − q = ${fmt(p, 2)}.`, 0, 0.006);
    if (kind === 'dominant') return N(`Частота рецессивного аллеля в популяции q = ${fmt(q)}. Какой процент людей имеет доминантный фенотип (AA + Aa)?`, roundTo((1 - q2) * 100, 2), '%',
      `p² + 2pq = 1 − q² = 1 − ${fmt(q2, 6)} = ${fmt(1 - q2, 6)} → ${fmt((1 - q2) * 100, 2)} %.`, 0, 0.006);
    return N(`Частота рецессивного заболевания (${dis}) — ${fmt(q2 * 100, 4)} % населения. Какой процент составляют здоровые гетерозиготные носители (до десятых)?`, roundTo(2 * p * q * 100, 1), '%',
      `q² = ${fmt(q2, 6)} → q = ${fmt(q)}; p = ${fmt(p)}. Носители: 2pq = 2·${fmt(p)}·${fmt(q)} = ${fmt(2 * p * q, 4)} → ${fmt(2 * p * q * 100, 1)} %. Носителей гораздо больше, чем больных!`, 0, 0.051);
  },
});
