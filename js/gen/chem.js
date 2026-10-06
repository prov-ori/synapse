// Генераторы задач по химии.

const COMMON_SUBSTANCES = [
  ['H2O', 'вода'], ['CO2', 'углекислый газ'], ['NaCl', 'поваренная соль'], ['H2SO4', 'серная кислота'], ['HCl', 'хлороводород'],
  ['NaOH', 'гидроксид натрия'], ['CaCO3', 'карбонат кальция (мел)'], ['NH3', 'аммиак'], ['CH4', 'метан'], ['C6H12O6', 'глюкоза'],
  ['Ca(OH)2', 'гидроксид кальция'], ['Al2O3', 'оксид алюминия'], ['Fe2O3', 'оксид железа(III)'], ['CuSO4', 'сульфат меди(II)'],
  ['KMnO4', 'перманганат калия'], ['HNO3', 'азотная кислота'], ['H3PO4', 'фосфорная кислота'], ['Na2CO3', 'карбонат натрия'],
  ['NaHCO3', 'гидрокарбонат натрия (пищевая сода)'], ['C2H5OH', 'этанол'], ['CH3COOH', 'уксусная кислота'], ['Mg(OH)2', 'гидроксид магния'],
  ['Al2(SO4)3', 'сульфат алюминия'], ['Ca3(PO4)2', 'фосфат кальция'], ['Fe(OH)3', 'гидроксид железа(III)'], ['KNO3', 'нитрат калия'],
  ['BaSO4', 'сульфат бария'], ['AgNO3', 'нитрат серебра'], ['SO2', 'оксид серы(IV)'], ['SO3', 'оксид серы(VI)'], ['P2O5', 'оксид фосфора(V)'],
  ['CuSO4*5H2O', 'медный купорос'], ['C12H22O11', 'сахароза'], ['NH4Cl', 'хлорид аммония'], ['(NH4)2SO4', 'сульфат аммония'],
  ['K2Cr2O7', 'дихромат калия'], ['FeSO4', 'сульфат железа(II)'], ['MgCl2', 'хлорид магния'], ['ZnO', 'оксид цинка'], ['C3H8', 'пропан'],
];

const GASES = [['H2', 'водород'], ['O2', 'кислород'], ['N2', 'азот'], ['CO2', 'углекислый газ'], ['CH4', 'метан'], ['NH3', 'аммиак'],
  ['Cl2', 'хлор'], ['SO2', 'сернистый газ'], ['C2H2', 'ацетилен'], ['C3H8', 'пропан'], ['He', 'гелий'], ['CO', 'угарный газ']];

defGen({
  id: 'molar-mass', subject: 'chem', module: 'chem-mole', level: 1, icon: '⚖️',
  title: 'Молярная масса', desc: 'Сложите атомные массы с учётом индексов',
  gen() {
    const [f, name] = pick(COMMON_SUBSTANCES);
    return N(`Вычислите молярную массу: {${f}} (${name}).`, molarMass(f), 'г/моль',
      `<i>M</i>({${f}}) = ${molarMassSteps(f)}. Атомные массы берём из таблицы Менделеева, округлив до целых (хлор — 35,5).`, 0.005);
  },
});

defGen({
  id: 'moles', subject: 'chem', module: 'chem-mole', level: 1, icon: '🧮',
  title: 'Количество вещества', desc: 'Масса ⇄ моли ⇄ число частиц ⇄ объём газа',
  gen() {
    const kind = pick(['m2n', 'n2m', 'n2N', 'V2n', 'm2V']);
    if (kind === 'm2n' || kind === 'n2m') {
      const [f, name] = pick(COMMON_SUBSTANCES.slice(0, 30));
      const M = molarMass(f);
      const n = pick([0.1, 0.2, 0.25, 0.5, 1.5, 2, 3, 0.05, 4]);
      const m = roundTo(n * M, 3);
      return kind === 'm2n'
        ? N(`Какое количество вещества (моль) содержится в ${fmt(m)} г {${f}} (${name})?`, n, 'моль',
          `<i>M</i>({${f}}) = ${fmt(M)} г/моль. ν = <i>m</i>/<i>M</i> = ${fmt(m)} / ${fmt(M)} = ${fmt(n)} моль.`)
        : N(`Найдите массу ${fmt(n)} моль {${f}} (${name}).`, m, 'г',
          `<i>M</i>({${f}}) = ${fmt(M)} г/моль. <i>m</i> = ν·<i>M</i> = ${fmt(n)} · ${fmt(M)} = ${fmt(m)} г.`);
    }
    if (kind === 'n2N') {
      const n = pick([0.5, 2, 3, 0.1, 1.5, 5]);
      const [f] = pick(GASES);
      return N(`Сколько молекул содержится в ${fmt(n)} моль {${f}}? Ответ дайте в виде a·10^23.`, n * 6.02e23, 'молекул',
        `<i>N</i> = ν·<i>N</i><sub>A</sub> = ${fmt(n)} · 6,02·10²³ = ${fmtSci(n * 6.02e23, 3)}.`);
    }
    if (kind === 'V2n') {
      const n = pick([0.1, 0.25, 0.5, 2, 3, 1.5, 0.2]);
      const [f, name] = pick(GASES);
      return N(`Какой объём (н. у.) занимают ${fmt(n)} моль газа {${f}} (${name})?`, n * 22.4, 'л',
        `При нормальных условиях 1 моль любого газа занимает 22,4 л. <i>V</i> = ν·<i>V</i><sub>m</sub> = ${fmt(n)} · 22,4 = ${fmt(n * 22.4)} л.`);
    }
    const [f, name] = pick(GASES.filter(g => g[0] !== 'He'));
    const n = pick([0.5, 2, 0.25, 0.1, 1.5]);
    const M = molarMass(f);
    return N(`Какой объём (н. у.) займут ${fmt(n * M)} г газа {${f}} (${name})?`, n * 22.4, 'л',
      `ν = <i>m</i>/<i>M</i> = ${fmt(n * M)} / ${fmt(M)} = ${fmt(n)} моль; <i>V</i> = ν·22,4 = ${fmt(n * 22.4)} л.`);
  },
});

defGen({
  id: 'mass-fraction-el', subject: 'chem', module: 'chem-formulas', level: 1, icon: '🥧',
  title: 'Массовая доля элемента', desc: 'Какую часть массы вещества составляет элемент',
  gen() {
    const [f, name] = pick(COMMON_SUBSTANCES.filter(x => !x[0].includes('*')));
    const counts = parseFormula(f);
    const el = pick(Object.keys(counts));
    const w = massFraction(f, el) * 100;
    return N(`Вычислите массовую долю элемента ${EL[el].name.toLowerCase()} ({${el}}) в {${f}} (${name}). Ответ в процентах, до десятых.`, roundTo(w, 1), '%',
      `<i>M</i>({${f}}) = ${molarMassSteps(f)}.<br>ω(${el}) = ${counts[el] > 1 ? counts[el] + '·' : ''}${fmt(schoolMass(el))} / ${fmt(molarMass(f))} · 100 % = ${fmt(w, 1)} %.`, 0, 0.051);
  },
});

defGen({
  id: 'solution', subject: 'chem', module: 'chem-solutions', level: 2, icon: '🧂',
  title: 'Растворы: массовая доля', desc: 'ω, разбавление, упаривание, смешивание',
  gen() {
    const solute = pick(['NaCl', 'сахар', 'KNO3', 'NaOH', 'глюкоза', 'CuSO4']);
    const sName = /^[A-Z]/.test(solute) ? `{${solute}}` : solute;
    const kind = pick(['w', 'msolute', 'dilute', 'mix', 'evap', 'saline']);
    if (kind === 'w') {
      const ms = randInt(2, 40) * 5, mw = randInt(10, 60) * 10;
      const w = ms / (ms + mw) * 100;
      return N(`В ${mw} г воды растворили ${ms} г ${sName}. Найдите массовую долю вещества в растворе (%, до десятых).`, roundTo(w, 1), '%',
        `<i>m</i>(р-ра) = ${mw} + ${ms} = ${mw + ms} г. ω = ${ms} / ${mw + ms} · 100 % = ${fmt(w, 1)} %.`, 0, 0.051);
    }
    if (kind === 'msolute') {
      const m = randInt(4, 30) * 25, w = pick([2, 5, 8, 10, 12, 15, 20, 25]);
      return N(`Сколько граммов ${sName} нужно для приготовления ${m} г ${w}%-го раствора?`, m * w / 100, 'г',
        `<i>m</i>(в-ва) = <i>m</i>(р-ра)·ω = ${m} · ${w / 100} = ${fmt(m * w / 100)} г.`);
    }
    if (kind === 'saline') {
      const V = pick([200, 250, 400, 500, 1000]);
      return N(`Физиологический раствор — 0,9%-й раствор NaCl. Сколько граммов соли содержится в ${V} г такого раствора?`, V * 0.009, 'г',
        `<i>m</i>(NaCl) = ${V} · 0,009 = ${fmt(V * 0.009)} г. Такой раствор изотоничен плазме крови: клетки в нём не набухают и не сморщиваются.`);
    }
    if (kind === 'dilute') {
      const m = randInt(4, 20) * 25, w1 = pick([10, 15, 20, 25, 30, 40]), add = randInt(2, 20) * 25;
      const w2 = m * w1 / (m + add);
      return N(`К ${m} г ${w1}%-го раствора ${sName} добавили ${add} г воды. Найдите массовую долю вещества в новом растворе (%, до десятых).`, roundTo(w2, 1), '%',
        `Масса вещества не изменилась: ${m} · ${w1 / 100} = ${fmt(m * w1 / 100)} г. Масса раствора: ${m} + ${add} = ${m + add} г. ω = ${fmt(m * w1 / 100)} / ${m + add} · 100 % = ${fmt(w2, 1)} %.`, 0, 0.051);
    }
    if (kind === 'evap') {
      const m = randInt(8, 20) * 25, w1 = pick([5, 8, 10, 12, 15]), ev = randInt(1, Math.floor(m / 50)) * 25;
      const w2 = m * w1 / (m - ev);
      return N(`Из ${m} г ${w1}%-го раствора ${sName} выпарили ${ev} г воды. Какова массовая доля вещества теперь (%, до десятых)?`, roundTo(w2, 1), '%',
        `<i>m</i>(в-ва) = ${m} · ${w1 / 100} = ${fmt(m * w1 / 100)} г; <i>m</i>(р-ра) = ${m} − ${ev} = ${m - ev} г; ω = ${fmt(w2, 1)} %.`, 0, 0.051);
    }
    const m1 = randInt(4, 16) * 25, w1 = pick([5, 10, 15, 20]), m2 = randInt(4, 16) * 25, w2 = pick([25, 30, 40, 50]);
    const w = (m1 * w1 + m2 * w2) / (m1 + m2);
    return N(`Смешали ${m1} г ${w1}%-го и ${m2} г ${w2}%-го растворов ${sName}. Найдите массовую долю вещества в смеси (%, до десятых).`, roundTo(w, 1), '%',
      `<i>m</i>(в-ва) = ${m1}·${w1 / 100} + ${m2}·${w2 / 100} = ${fmt((m1 * w1 + m2 * w2) / 100)} г; <i>m</i>(р-ра) = ${m1 + m2} г; ω = ${fmt(w, 1)} %.`, 0, 0.051);
  },
});

const OX_ITEMS = [
  ['H2SO4', 'S'], ['H2SO3', 'S'], ['H2S', 'S'], ['SO3', 'S'], ['Na2SO3', 'S'], ['Na2S2O3', 'S'], ['KMnO4', 'Mn'], ['K2MnO4', 'Mn'],
  ['MnO2', 'Mn'], ['K2Cr2O7', 'Cr'], ['K2CrO4', 'Cr'], ['Cr2O3', 'Cr'], ['Fe2O3', 'Fe'], ['FeO', 'Fe'], ['NH3', 'N'],
  ['HNO3', 'N'], ['HNO2', 'N'], ['NO2', 'N'], ['N2O', 'N'], ['NO', 'N'], ['N2O5', 'N'], ['NH4^+', 'N'], ['NO3^-', 'N'],
  ['HClO4', 'Cl'], ['KClO3', 'Cl'], ['NaClO', 'Cl'], ['HCl', 'Cl'], ['Cl2O7', 'Cl'], ['PH3', 'P'], ['H3PO4', 'P'], ['P2O3', 'P'],
  ['CaH2', 'H'], ['NaH', 'H'], ['OF2', 'O'], ['CO', 'C'], ['CO2', 'C'], ['CH4', 'C'], ['SiH4', 'Si'],
  ['Cr2O7^2-', 'Cr'], ['MnO4^-', 'Mn'], ['SO4^2-', 'S'], ['CO3^2-', 'C'], ['PO4^3-', 'P'], ['ClO3^-', 'Cl'], ['Cu2O', 'Cu'],
];

defGen({
  id: 'oxidation', subject: 'chem', module: 'chem-redox', level: 2, icon: '⚡',
  title: 'Степени окисления', desc: 'Найдите степень окисления по правилам',
  gen() {
    const [f, el] = pick(OX_ITEMS);
    const ox = oxidationState(f, el);
    const charge = formulaCharge(f);
    const wrong = shuffle([-4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7].filter(x => x !== ox)).sort((a, b) => Math.abs(a - ox) - Math.abs(b - ox)).slice(0, 3);
    const counts = parseFormula(f);
    const metalOnly = Object.keys(counts).every(y => y === 'H' || METALS.has(y));
    const knownOx = x => x === 'H' ? (metalOnly ? -1 : 1) : x === 'O' ? (counts.F ? 2 : -2) : FIXED_OX[x];
    const others = Object.keys(counts).filter(x => x !== el);
    return C(`Определите степень окисления {${el}} в {${f}}.`, fmtOx(ox), wrong.map(fmtOx),
      `Сумма степеней окисления всех атомов равна заряду частицы (${charge === 0 ? '0 для молекулы' : charge}). ` +
      (others.length ? `Известные: ${others.map(x => `${x} ${fmtOx(knownOx(x))}`).join(', ')}. ` : '') +
      `Отсюда {${el}} = ${fmtOx(ox)}.`);
  },
});

const REACTIONS_TO_BALANCE = [
  'H2 + O2 = H2O', 'Fe + O2 = Fe2O3', 'Al + O2 = Al2O3', 'Na + H2O = NaOH + H2', 'Al + HCl = AlCl3 + H2', 'P + O2 = P2O5',
  'CH4 + O2 = CO2 + H2O', 'C2H6 + O2 = CO2 + H2O', 'C3H8 + O2 = CO2 + H2O', 'C6H12O6 + O2 = CO2 + H2O', 'Fe + Cl2 = FeCl3',
  'N2 + H2 = NH3', 'KClO3 = KCl + O2', 'H2O2 = H2O + O2', 'Ca + H2O = Ca(OH)2 + H2', 'Fe2O3 + H2 = Fe + H2O', 'Fe2O3 + CO = Fe + CO2',
  'Al + Fe2O3 = Al2O3 + Fe', 'NaOH + H2SO4 = Na2SO4 + H2O', 'Ca(OH)2 + HNO3 = Ca(NO3)2 + H2O', 'Al(OH)3 + H2SO4 = Al2(SO4)3 + H2O',
  'BaCl2 + Na2SO4 = BaSO4 + NaCl', 'AgNO3 + CaCl2 = AgCl + Ca(NO3)2', 'Fe(OH)3 = Fe2O3 + H2O', 'Cu + HNO3 = Cu(NO3)2 + NO + H2O',
  'Cu + HNO3 = Cu(NO3)2 + NO2 + H2O', 'KMnO4 + HCl = KCl + MnCl2 + Cl2 + H2O', 'MnO2 + HCl = MnCl2 + Cl2 + H2O',
  'Zn + H2SO4 = ZnSO4 + H2S + H2O', 'NH3 + O2 = NO + H2O', 'FeS2 + O2 = Fe2O3 + SO2', 'Mg + HNO3 = Mg(NO3)2 + N2O + H2O',
  'C2H5OH + O2 = CO2 + H2O', 'C2H2 + O2 = CO2 + H2O', 'Na2O2 + CO2 = Na2CO3 + O2', 'H2S + O2 = SO2 + H2O', 'SO2 + O2 = SO3',
  'Ca3(PO4)2 + H2SO4 = CaSO4 + H3PO4', 'KMnO4 = K2MnO4 + MnO2 + O2', 'K2Cr2O7 + HCl = KCl + CrCl3 + Cl2 + H2O',
];

defGen({
  id: 'balance', subject: 'chem', module: 'chem-reactions', level: 2, icon: '⚖️',
  title: 'Уравнивание реакций', desc: 'Расставьте коэффициенты — от простых до ОВР',
  gen() {
    const eq = pick(REACTIONS_TO_BALANCE);
    const res = balance(eq);
    const counts = (list, off) => {
      const total = {};
      list.forEach((sp, i) => { for (const [el, n] of Object.entries(parseFormula(sp))) total[el] = (total[el] || 0) + n * res.coeffs[i + off]; });
      return total;
    };
    const left = counts(res.reactants, 0);
    const check = Object.keys(left).map(el => `${el}: ${left[el]}`).join(', ');
    return {
      type: 'coeffs', q: 'Уравняйте реакцию.', reactants: res.reactants, products: res.products, coeffs: res.coeffs,
      explain: formatEquation(res) + `<br>Проверка — атомов каждого элемента слева и справа поровну (${check}).`,
    };
  },
});

defGen({
  id: 'e-config', subject: 'chem', module: 'chem-atom', level: 2, icon: '🌀',
  title: 'Электронные конфигурации', desc: 'Элементы 1–4 периодов, включая «провал» электрона',
  gen() {
    const z = Math.random() < 0.2 ? pick([24, 29]) : randInt(3, 36);
    const right = configString(z);
    const wrongs = new Set();
    if (z === 24 || z === 29) wrongs.add(configString(z, { noExceptions: true }));
    const alt = [z - 1, z + 1, z + 2].filter(x => x > 0 && x <= 36);
    for (const a of alt) wrongs.add(configString(a));
    wrongs.delete(right);
    const e = ELEMENTS[z - 1];
    const note = z === 24 || z === 29 ? ' Обратите внимание на «провал» электрона: наполовину или полностью заполненный d-подуровень энергетически выгоднее, поэтому один 4s-электрон переходит на 3d.' : '';
    return C(`Выберите электронную конфигурацию атома ${e.name.toLowerCase()} ({${e.sym}}, Z = ${z}).`, right, [...wrongs].slice(0, 3),
      `Число электронов = Z = ${z}. Заполняем подуровни по правилу Клечковского: 1s → 2s → 2p → 3s → 3p → 4s → 3d → 4p.${note}`);
  },
});

defGen({
  id: 'atom-particles', subject: 'chem', module: 'chem-atom', level: 1, icon: '⚛️',
  title: 'Протоны, нейтроны, электроны', desc: 'Состав атомов, изотопов и ионов',
  gen() {
    const items = [['Na', 23, 0], ['Cl', 35, 0], ['Cl', 37, 0], ['C', 12, 0], ['C', 14, 0], ['O', 16, -2], ['Mg', 24, 2], ['Fe', 56, 3], ['Fe', 56, 2],
      ['S', 32, -2], ['Ca', 40, 2], ['K', 39, 1], ['Al', 27, 3], ['U', 235, 0], ['H', 3, 0], ['H', 2, 0], ['P', 31, 0], ['Cu', 64, 2], ['I', 127, -1], ['N', 14, -3]];
    const [sym, A, q] = pick(items);
    const Z = EL[sym].z;
    const ask = pick(['p', 'n', 'e']);
    const label = { p: 'протонов', n: 'нейтронов', e: 'электронов' }[ask];
    const ans = { p: Z, n: A - Z, e: Z - q }[ask];
    const sp = q ? `иона ${A}{${sym}^${Math.abs(q) > 1 ? Math.abs(q) : ''}${q > 0 ? '+' : '-'}}` : `атома ${A}{${sym}}`;
    return N(`Сколько ${label} содержит частица: ${sp} (массовое число ${A})?`, ans, '',
      `Протонов = Z = ${Z}. Нейтронов = A − Z = ${A} − ${Z} = ${A - Z}. Электронов = Z − заряд = ${Z} − (${q}) = ${Z - q}.`, 0);
  },
});

const PH_KIND = [['HCl', 'соляной кислоты', 'acid'], ['HNO3', 'азотной кислоты', 'acid'], ['NaOH', 'гидроксида натрия', 'base'], ['KOH', 'гидроксида калия', 'base']];
defGen({
  id: 'ph', subject: 'chem', module: 'chem-solutions', level: 3, icon: '🧪',
  title: 'Водородный показатель pH', desc: 'pH растворов сильных кислот и оснований',
  gen() {
    const [f, name, kind] = pick(PH_KIND);
    const p = randInt(1, 5);
    const c = Math.pow(10, -p);
    if (Math.random() < 0.3) {
      const pH = randInt(1, 13);
      return N(`pH раствора равен ${pH}. Какова концентрация ионов H⁺ (моль/л)? Ответ в виде 1·10^-n.`, Math.pow(10, -pH), 'моль/л',
        `[H⁺] = 10<sup>−pH</sup> = 10<sup>−${pH}</sup> моль/л. ${pH < 7 ? 'Среда кислая.' : pH > 7 ? 'Среда щелочная.' : 'Среда нейтральная.'}`, 0.01);
    }
    const pH = kind === 'acid' ? p : 14 - p;
    return N(`Вычислите pH раствора ${name} ({${f}}) с концентрацией ${fmtSci(c, 1)} моль/л (диссоциация полная).`, pH, '',
      kind === 'acid'
        ? `Сильная одноосновная кислота: [H⁺] = c = 10<sup>−${p}</sup> моль/л. pH = −lg[H⁺] = ${p}.`
        : `Сильное основание: [OH⁻] = 10<sup>−${p}</sup> моль/л, pOH = ${p}, pH = 14 − pOH = ${14 - p}.`, 0, 0.05);
  },
});

// Расчёт по уравнению: [уравнение, дано, найти, 'm' | 'V', подпись]
const STOICH = [
  ['Zn + HCl = ZnCl2 + H2', 'Zn', 'H2', 'V', 'цинка с избытком соляной кислоты'],
  ['Mg + HCl = MgCl2 + H2', 'Mg', 'H2', 'V', 'магния с избытком соляной кислоты'],
  ['Al + HCl = AlCl3 + H2', 'Al', 'H2', 'V', 'алюминия с избытком соляной кислоты'],
  ['CaCO3 = CaO + CO2', 'CaCO3', 'CO2', 'V', 'при полном разложении карбоната кальция'],
  ['CaCO3 = CaO + CO2', 'CaCO3', 'CaO', 'm', 'при полном разложении карбоната кальция'],
  ['CH4 + O2 = CO2 + H2O', 'CH4', 'O2', 'V', 'для полного сгорания метана'],
  ['C6H12O6 + O2 = CO2 + H2O', 'C6H12O6', 'CO2', 'V', 'при полном окислении глюкозы'],
  ['NaOH + HCl = NaCl + H2O', 'NaOH', 'NaCl', 'm', 'при нейтрализации гидроксида натрия соляной кислотой'],
  ['Fe2O3 + H2 = Fe + H2O', 'Fe2O3', 'Fe', 'm', 'при восстановлении оксида железа(III) водородом'],
  ['H2 + O2 = H2O', 'H2', 'H2O', 'm', 'при сгорании водорода'],
  ['Na + H2O = NaOH + H2', 'Na', 'H2', 'V', 'натрия с водой'],
  ['BaCl2 + H2SO4 = BaSO4 + HCl', 'BaCl2', 'BaSO4', 'm', 'хлорида бария с избытком серной кислоты (масса осадка)'],
  ['AgNO3 + NaCl = AgCl + NaNO3', 'NaCl', 'AgCl', 'm', 'хлорида натрия с избытком нитрата серебра (масса осадка)'],
  ['C2H5OH + O2 = CO2 + H2O', 'C2H5OH', 'CO2', 'V', 'при сгорании этанола'],
  ['KClO3 = KCl + O2', 'KClO3', 'O2', 'V', 'при разложении бертолетовой соли'],
];

function stoichQuestion(withYield) {
  const [eq, given, find, mode, label] = pick(STOICH);
  const res = balance(eq);
  const species = [...res.reactants, ...res.products];
  const ci = species.indexOf(given), cf = species.indexOf(find);
  const kg = res.coeffs[ci], kf = res.coeffs[cf];
  const Mg = molarMass(given);
  const nGiven = pick([0.1, 0.2, 0.25, 0.4, 0.5, 1, 1.5, 2]);
  const mGiven = roundTo(nGiven * Mg, 3);
  const nFind = nGiven * kf / kg;
  const eta = withYield ? pick([60, 70, 75, 80, 85, 90]) : 100;
  const theo = mode === 'V' ? nFind * 22.4 : nFind * molarMass(find);
  const ans = theo * eta / 100;
  const what = mode === 'V' ? `объём (н. у., л) ${find === 'O2' && res.reactants.includes('O2') ? 'израсходованного' : 'образовавшегося'} {${find}}` : `массу {${find}} (г)`;
  const qText = `Найдите ${what} — реакция ${label}, если взято ${fmt(mGiven)} г {${given}}${withYield ? `, а выход продукта составил ${eta} %` : ''}.`;
  const steps = [
    `Уравнение: ${formatEquation(res)}.`,
    `ν({${given}}) = ${fmt(mGiven)} / ${fmt(Mg)} = ${fmt(nGiven)} моль.`,
    `По уравнению ν({${find}}) = ν({${given}}) · ${kf}/${kg} = ${fmt(nFind)} моль.`,
    mode === 'V' ? `<i>V</i> = ${fmt(nFind)} · 22,4 = ${fmt(theo)} л.` : `<i>m</i> = ${fmt(nFind)} · ${fmt(molarMass(find))} = ${fmt(theo)} г.`,
    withYield ? `С учётом выхода: ${fmt(theo)} · ${eta / 100} = ${fmt(ans)}.` : '',
  ];
  return N(qText, roundTo(ans, 2), mode === 'V' ? 'л' : 'г', steps.join('<br>'), 0.01);
}

defGen({ id: 'stoich', subject: 'chem', module: 'chem-calc', level: 3, icon: '📐', title: 'Расчёт по уравнению', desc: 'Масса и объём продуктов реакции', gen: () => stoichQuestion(false) });
defGen({ id: 'yield', subject: 'chem', module: 'chem-calc', level: 4, icon: '🎯', title: 'Выход продукта', desc: 'Практический выход от теоретического', gen: () => stoichQuestion(true) });

const CLASSIFY = [
  ['Na2O', 'основный оксид'], ['CaO', 'основный оксид'], ['MgO', 'основный оксид'], ['FeO', 'основный оксид'], ['CuO', 'основный оксид'],
  ['CO2', 'кислотный оксид'], ['SO3', 'кислотный оксид'], ['P2O5', 'кислотный оксид'], ['SiO2', 'кислотный оксид'], ['N2O5', 'кислотный оксид'], ['CrO3', 'кислотный оксид'], ['Mn2O7', 'кислотный оксид'],
  ['ZnO', 'амфотерный оксид'], ['Al2O3', 'амфотерный оксид'], ['BeO', 'амфотерный оксид'], ['Cr2O3', 'амфотерный оксид'], ['Fe2O3', 'амфотерный оксид'],
  ['CO', 'несолеобразующий оксид'], ['NO', 'несолеобразующий оксид'], ['N2O', 'несолеобразующий оксид'],
  ['NaOH', 'щёлочь'], ['KOH', 'щёлочь'], ['Ba(OH)2', 'щёлочь'], ['Cu(OH)2', 'нерастворимое основание'], ['Fe(OH)2', 'нерастворимое основание'], ['Mg(OH)2', 'нерастворимое основание'],
  ['Zn(OH)2', 'амфотерный гидроксид'], ['Al(OH)3', 'амфотерный гидроксид'],
  ['HCl', 'кислота'], ['H2SO4', 'кислота'], ['HNO3', 'кислота'], ['H3PO4', 'кислота'], ['H2S', 'кислота'], ['H2CO3', 'кислота'],
  ['NaCl', 'средняя соль'], ['K2SO4', 'средняя соль'], ['CaCO3', 'средняя соль'], ['NaHCO3', 'кислая соль'], ['KH2PO4', 'кислая соль'], ['NaHSO4', 'кислая соль'],
  ['(CuOH)2CO3', 'основная соль'], ['Mg(OH)Cl', 'основная соль'],
];
const CLASS_NAMES = [...new Set(CLASSIFY.map(c => c[1]))];

defGen({
  id: 'classify', subject: 'chem', module: 'chem-classes', level: 2, icon: '🗂️',
  title: 'Классы неорганических веществ', desc: 'Оксиды, основания, кислоты, соли',
  gen() {
    const [f, cls] = pick(CLASSIFY);
    const wrong = sample(CLASS_NAMES.filter(c => c !== cls), 3);
    const tips = {
      'основный оксид': 'Оксиды металлов в степени окисления +1, +2 (кроме Zn, Be и др.) — основные.',
      'кислотный оксид': 'Оксиды неметаллов и металлов в высоких степенях окисления (+5…+7) — кислотные.',
      'амфотерный оксид': 'Амфотерные оксиды (ZnO, Al₂O₃, BeO, Cr₂O₃, Fe₂O₃) реагируют и с кислотами, и со щелочами.',
      'несолеобразующий оксид': 'CO, NO, N₂O (и SiO) не образуют солей.',
      'щёлочь': 'Щёлочи — растворимые основания (гидроксиды щелочных и щёлочноземельных металлов, кроме Be, Mg).',
      'нерастворимое основание': 'Нерастворимые основания — гидроксиды большинства металлов в степени окисления +2.',
      'амфотерный гидроксид': 'Амфотерные гидроксиды реагируют и с кислотами, и со щелочами.',
      'кислота': 'Кислоты — сложные вещества из атомов водорода и кислотного остатка.',
      'средняя соль': 'Средние соли — продукт полного замещения водорода в кислоте на металл.',
      'кислая соль': 'Кислые соли содержат водород в кислотном остатке (HCO₃⁻, H₂PO₄⁻, HSO₄⁻).',
      'основная соль': 'Основные соли содержат гидроксогруппу OH.',
    };
    return C(`К какому классу относится {${f}}?`, cls, wrong, tips[cls]);
  },
});

defGen({
  id: 'gas-density', subject: 'chem', module: 'chem-calc', level: 3, icon: '🎈',
  title: 'Плотность газов', desc: 'Относительная плотность и молярная масса газа',
  gen() {
    const [f, name] = pick(GASES);
    const M = molarMass(f);
    const by = pick([['воздуху', 29], ['водороду', 2], ['кислороду', 32], ['гелию', 4]]);
    if (Math.random() < 0.5) {
      return N(`Вычислите относительную плотность газа {${f}} (${name}) по ${by[0]} (до сотых).`, roundTo(M / by[1], 2), '',
        `<i>D</i> = <i>M</i>({${f}}) / <i>M</i> = ${fmt(M)} / ${by[1]} = ${fmt(M / by[1], 2)}. ${by[0] === 'воздуху' ? (M > 29 ? 'Газ тяжелее воздуха.' : 'Газ легче воздуха.') : ''}`, 0, 0.006);
    }
    const D = roundTo(M / by[1], 3);
    return N(`Относительная плотность газа по ${by[0]} равна ${fmt(D, 3)}. Найдите его молярную массу.`, M, 'г/моль',
      `<i>M</i> = <i>D</i> · ${by[1]} = ${fmt(D, 3)} · ${by[1]} = ${fmt(M)} г/моль. Это может быть {${f}}.`, 0.01);
  },
});

const ALKANE_NAMES = ['', 'метан', 'этан', 'пропан', 'бутан', 'пентан', 'гексан', 'гептан', 'октан', 'нонан', 'декан'];
defGen({
  id: 'organic-formula', subject: 'chem', module: 'chem-hydrocarbons', level: 3, icon: '🔗',
  title: 'Гомологические ряды', desc: 'Общие формулы и названия органических веществ',
  gen() {
    const n = randInt(1, 10);
    const kind = pick(['alkane', 'alkene', 'alkyne', 'alcohol', 'acid']);
    const root = ALKANE_NAMES[n].replace(/ан$/, '');
    if (kind === 'alkane' || n < 2) {
      return W(`Напишите молекулярную формулу алкана «${ALKANE_NAMES[n]}» (например, C2H6).`, `C${n > 1 ? n : ''}H${2 * n + 2}`,
        `Алканы: C<sub>n</sub>H<sub>2n+2</sub>. При n = ${n}: C${subNum(n > 1 ? n : '')}H${subNum(2 * n + 2)}.`);
    }
    if (kind === 'alkene') return W(`Напишите молекулярную формулу алкена с ${n} атомами углерода («${root}ен»).`, `C${n}H${2 * n}`,
      `Алкены: C<sub>n</sub>H<sub>2n</sub> → C${subNum(n)}H${subNum(2 * n)}.`);
    if (kind === 'alkyne') return W(`Напишите молекулярную формулу алкина «${root}ин».`, `C${n}H${2 * n - 2}`,
      `Алкины: C<sub>n</sub>H<sub>2n−2</sub> → C${subNum(n)}H${subNum(2 * n - 2)}.`);
    if (kind === 'alcohol') {
      const f = `C${n}H${2 * n + 1}OH`;
      return N(`Вычислите молярную массу предельного одноатомного спирта с ${n} атомами углерода (${root}анол).`, molarMass(f), 'г/моль',
        `Формула C<sub>n</sub>H<sub>2n+1</sub>OH = ${chem(f)}; <i>M</i> = 14n + 18 = ${14 * n + 18} г/моль.`, 0.005);
    }
    return N(`Вычислите молярную массу предельной одноосновной карбоновой кислоты C<sub>n</sub>H<sub>2n</sub>O<sub>2</sub> при n = ${n}.`, 14 * n + 32, 'г/моль',
      `<i>M</i> = 14n + 32 = 14·${n} + 32 = ${14 * n + 32} г/моль.`, 0.005);
  },
});

defGen({
  id: 'thermo', subject: 'chem', module: 'chem-reactions', level: 3, icon: '🔥',
  title: 'Термохимия', desc: 'Сколько тепла выделится по термохимическому уравнению',
  gen() {
    const items = [
      ['C + O2 = CO2', 'C', 393], ['CH4 + 2O2 = CO2 + 2H2O', 'CH4', 890], ['2H2 + O2 = 2H2O', 'H2', 572],
      ['C6H12O6 + 6O2 = 6CO2 + 6H2O', 'C6H12O6', 2800], ['S + O2 = SO2', 'S', 297], ['2Mg + O2 = 2MgO', 'Mg', 1204],
    ];
    const [eq, sp, Q] = pick(items);
    const coef = parseInt((eq.match(new RegExp('(\\d*)' + sp.replace(/[()]/g, '\\$&') + '\\b')) || [])[1] || '1', 10);
    const n = pick([0.5, 1, 2, 0.25, 3, 0.1]);
    const m = roundTo(n * molarMass(sp), 3);
    const ans = Q * n / coef;
    return N(`По термохимическому уравнению ${rich(eq.replace(/(\d*)([A-Z][A-Za-z0-9()]*)/g, (x, k, f) => k + '{' + f + '}'))} + ${Q} кДж вычислите, сколько теплоты выделится при сгорании ${fmt(m)} г {${sp}}.`,
      roundTo(ans, 2), 'кДж',
      `ν({${sp}}) = ${fmt(m)} / ${fmt(molarMass(sp))} = ${fmt(n)} моль. По уравнению ${coef} моль → ${Q} кДж, значит <i>Q</i> = ${Q} · ${fmt(n)} / ${coef} = ${fmt(ans)} кДж.`, 0.01);
  },
});
