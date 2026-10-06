// Вопросы и тесты: компактные конструкторы для авторов контента, отрисовка, проверка, сессия теста.
//
// Типы: choice (один ответ), multi (несколько), num (число), text (слово/формула), tf (верно/неверно),
// order (расставить по порядку), match (соответствие), coeffs (коэффициенты в уравнении).

// ---------- Конструкторы (используются в js/data/course/*.js) ----------
// C('вопрос', 'верный', ['неверный', …], 'объяснение')
function C(q, right, wrong, explain) { return { type: 'choice', q, options: [right, ...wrong], answer: 0, explain }; }
// M('вопрос', ['верный', …], ['неверный', …], 'объяснение') — «выберите все верные»
function M(q, right, wrong, explain) {
  return { type: 'multi', q, options: [...right, ...wrong], answers: right.map((_, i) => i), explain };
}
// N('вопрос', 12.5, 'г', 'объяснение', погрешность)
function N(q, answer, unit, explain, tol) { return { type: 'num', q, answer, unit, explain, tol }; }
// W('вопрос', 'ответ/синоним', 'объяснение')
function W(q, answer, explain) { return { type: 'text', q, answer, explain }; }
function T(q, answer, explain) { return { type: 'tf', q, answer, explain }; }
function O(q, items, explain) { return { type: 'order', q, items, explain }; }
function P(q, pairs, explain) { return { type: 'match', q, pairs, explain }; }

const TYPE_HINT = {
  choice: 'Выберите один ответ', multi: 'Выберите все верные ответы', num: 'Введите число',
  text: 'Введите ответ', tf: 'Верно или неверно?', order: 'Расставьте по порядку: нажимайте в нужной последовательности',
  match: 'Установите соответствие', coeffs: 'Расставьте коэффициенты (1 тоже нужно вписать)',
};

// Вариант ответа: «чистая» формула (H2SO4, Ca(OH)2, NH4^+) форматируется автоматически
function optHtml(text) {
  const str = String(text);
  if (/^[A-Z(][A-Za-z0-9()·*]*(\^\d*[+\-])?$/.test(str) && /\d|\^/.test(str)) return chem(str);
  return rich(str);
}

// ---------- Проверка ----------
function checkText(input, expected) {
  const norm = x => normalizeText(x).replace(/\s/g, '').replace(/[₀-₉]/g, d => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(d)));
  return String(expected).split('/').some(v => norm(v) === norm(input));
}

// ---------- Отрисовка одного вопроса ----------
// opts.onAnswer(correct, q) — вызывается один раз после проверки
// opts.compact — без подсказки о типе (для встроенных в теорию вопросов)
function renderQuestion(q, opts = {}) {
  const box = h('div', { class: 'question q-' + q.type });
  if (q.tag) box.appendChild(h('div', { class: 'q-tag' }, q.tag));
  box.appendChild(h('div', { class: 'q-text', html: rich(q.q) }));
  if (q.figure) box.appendChild(h('div', { class: 'q-figure' }, typeof q.figure === 'function' ? q.figure() : h('div', { html: q.figure })));
  if (!opts.compact) box.appendChild(h('div', { class: 'q-hint muted small' }, TYPE_HINT[q.type]));

  const body = h('div', { class: 'q-body' });
  const feedback = h('div', { class: 'q-feedback', 'aria-live': 'polite' });
  const checkBtn = h('button', { class: 'btn primary check-btn', type: 'button' }, 'Проверить');
  const actions = h('div', { class: 'q-actions' }, checkBtn);
  box.append(body, actions, feedback);

  let done = false;
  const finish = (correct, rightText) => {
    if (done) return;
    done = true;
    box.classList.add(correct ? 'is-correct' : 'is-wrong');
    checkBtn.remove();
    add(feedback, 
      h('div', { class: 'fb-head ' + (correct ? 'ok' : 'bad') }, correct ? pick(['✅ Верно!', '✅ Точно!', '✅ Отлично!', '✅ Так и есть!']) : '❌ Не совсем'),
      !correct && rightText ? h('div', { class: 'fb-right', html: 'Правильный ответ: ' + rich(rightText) }) : null,
      q.explain ? h('div', { class: 'fb-explain', html: rich(q.explain) }) : null,
    );
    if (correct) SFX.correct(); else SFX.wrong();
    opts.onAnswer?.(correct, q);
  };

  const R = QUESTION_RENDERERS[q.type];
  if (!R) throw new Error('Неизвестный тип вопроса: ' + q.type);
  const api = R(q, body, { setReady: on => { checkBtn.disabled = !on; }, submit: () => checkBtn.click() });
  checkBtn.addEventListener('click', () => {
    if (done) return;
    const res = api.check();
    if (res == null) return; // ответ ещё не дан
    api.reveal?.(res.correct);
    finish(res.correct, res.right);
  });
  box.focusInput = () => box.querySelector('input')?.focus();
  return box;
}

const QUESTION_RENDERERS = {
  choice(q, body, ctl) {
    let chosen = null;
    const order = q.keepOrder ? q.options.map((_, i) => i) : shuffle(q.options.map((_, i) => i));
    const buttons = order.map((idx, k) => h('button', {
      type: 'button', class: 'option', 'data-idx': idx,
      onclick: () => { chosen = idx; buttons.forEach(b => b.classList.toggle('selected', +b.dataset.idx === idx)); ctl.setReady(true); },
    }, h('span', { class: 'opt-key' }, k + 1), h('span', { html: optHtml(q.options[idx]) })));
    body.appendChild(h('div', { class: 'options' + (q.options.every(o => String(o).length < 22) ? ' grid' : '') }, buttons));
    ctl.setReady(false);
    return {
      check: () => chosen == null ? null : { correct: chosen === q.answer, right: q.options[q.answer] },
      reveal: () => buttons.forEach(b => {
        b.disabled = true;
        if (+b.dataset.idx === q.answer) b.classList.add('right');
        else if (+b.dataset.idx === chosen) b.classList.add('wrong');
      }),
    };
  },

  multi(q, body, ctl) {
    const sel = new Set();
    const order = shuffle(q.options.map((_, i) => i));
    const buttons = order.map(idx => h('button', {
      type: 'button', class: 'option check', 'data-idx': idx,
      onclick: e => {
        sel.has(idx) ? sel.delete(idx) : sel.add(idx);
        e.currentTarget.classList.toggle('selected', sel.has(idx));
        ctl.setReady(sel.size > 0);
      },
    }, h('span', { class: 'opt-box' }), h('span', { html: optHtml(q.options[idx]) })));
    body.appendChild(h('div', { class: 'options' }, buttons));
    ctl.setReady(false);
    const right = new Set(q.answers);
    return {
      check: () => sel.size === 0 ? null : {
        correct: sel.size === right.size && [...sel].every(i => right.has(i)),
        right: q.answers.map(i => q.options[i]).join('; '),
      },
      reveal: () => buttons.forEach(b => {
        b.disabled = true;
        const i = +b.dataset.idx;
        if (right.has(i)) b.classList.add('right'); else if (sel.has(i)) b.classList.add('wrong');
      }),
    };
  },

  num(q, body, ctl) {
    const input = h('input', { type: 'text', inputmode: 'decimal', class: 'answer-input', placeholder: 'Число', autocomplete: 'off' });
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ctl.submit(); } });
    body.appendChild(h('div', { class: 'num-row' }, input, q.unit ? h('span', { class: 'unit', html: rich(q.unit) }) : null));
    body.appendChild(h('div', { class: 'muted small' }, 'Дробные числа — через запятую. Степени: 3,2·10^-5 или 3.2e-5'));
    return {
      check: () => {
        const v = parseNum(input.value);
        if (!input.value.trim()) return null;
        if (isNaN(v)) { UI.toast('Введите число', 'bad'); return null; }
        const ok = numClose(v, q.answer, { tol: q.tol ?? 0.02, abs: q.abs });
        return { correct: ok, right: fmtAnswer(q.answer) + (q.unit ? ' ' + q.unit : '') };
      },
      reveal: ok => { input.disabled = true; input.classList.add(ok ? 'correct' : 'wrong'); },
    };
  },

  text(q, body, ctl) {
    const input = h('input', { type: 'text', class: 'answer-input', placeholder: q.placeholder || 'Ответ', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ctl.submit(); } });
    body.appendChild(input);
    return {
      check: () => !input.value.trim() ? null : { correct: checkText(input.value, q.answer), right: String(q.answer).split('/')[0] },
      reveal: ok => { input.disabled = true; input.classList.add(ok ? 'correct' : 'wrong'); },
    };
  },

  tf(q, body, ctl) {
    let chosen = null;
    const mk = (val, label) => h('button', {
      type: 'button', class: 'option tf-btn', 'data-v': String(val),
      onclick: e => { chosen = val; btns.forEach(b => b.classList.toggle('selected', b === e.currentTarget)); ctl.setReady(true); },
    }, label);
    const btns = [mk(true, '👍 Верно'), mk(false, '👎 Неверно')];
    body.appendChild(h('div', { class: 'options grid' }, btns));
    ctl.setReady(false);
    return {
      check: () => chosen == null ? null : { correct: chosen === q.answer, right: q.answer ? 'Верно' : 'Неверно' },
      reveal: () => btns.forEach(b => {
        b.disabled = true;
        if (b.dataset.v === String(q.answer)) b.classList.add('right'); else if (b.dataset.v === String(chosen)) b.classList.add('wrong');
      }),
    };
  },

  order(q, body, ctl) {
    const picked = [];
    const bank = h('div', { class: 'chip-bank' });
    const line = h('ol', { class: 'order-line' });
    const items = shuffle(q.items.map((t, i) => ({ t, i })));
    const draw = () => {
      line.innerHTML = '';
      picked.forEach((it, k) => line.appendChild(h('li', {
        class: 'chip placed', onclick: () => { picked.splice(k, 1); draw(); },
      }, h('span', { html: optHtml(it.t) }))));
      bank.innerHTML = '';
      items.filter(it => !picked.includes(it)).forEach(it => bank.appendChild(h('button', {
        type: 'button', class: 'chip', onclick: () => { picked.push(it); draw(); },
      }, h('span', { html: optHtml(it.t) }))));
      ctl.setReady(picked.length === items.length);
    };
    body.append(line, bank);
    draw();
    return {
      check: () => picked.length < items.length ? null : {
        correct: picked.every((it, k) => it.i === k),
        right: q.items.join(' → '),
      },
      reveal: () => { [...line.children].forEach((li, k) => li.classList.add(picked[k].i === k ? 'right' : 'wrong')); bank.remove(); },
    };
  },

  match(q, body, ctl) {
    const left = q.pairs.map((p, i) => ({ t: p[0], i }));
    const right = shuffle(q.pairs.map((p, i) => ({ t: p[1], i })));
    const choice = {}; // leftIdx -> rightIdx
    const letters = 'АБВГДЕЖЗ';
    const rows = left.map(l => {
      const sel = h('select', { 'aria-label': 'Соответствие для ' + l.t },
        h('option', { value: '' }, '—'),
        right.map((r, k) => h('option', { value: r.i }, letters[k])));
      sel.addEventListener('change', () => {
        if (sel.value === '') delete choice[l.i]; else choice[l.i] = +sel.value;
        ctl.setReady(Object.keys(choice).length === left.length);
      });
      return h('div', { class: 'match-row' }, h('span', { class: 'match-left', html: optHtml(l.t) }), sel);
    });
    body.append(
      h('div', { class: 'match-grid' },
        h('div', { class: 'match-col' }, rows),
        h('div', { class: 'match-col right' }, right.map((r, k) => h('div', { class: 'match-opt' }, h('b', null, letters[k] + ') '), h('span', { html: optHtml(r.t) }))))));
    ctl.setReady(false);
    return {
      check: () => Object.keys(choice).length < left.length ? null : {
        correct: left.every(l => choice[l.i] === l.i),
        right: q.pairs.map(p => p[0] + ' — ' + p[1]).join('; '),
      },
      reveal: () => rows.forEach((row, k) => { row.querySelector('select').disabled = true; row.classList.add(choice[k] === k ? 'right' : 'wrong'); }),
    };
  },

  coeffs(q, body, ctl) {
    const inputs = [];
    const mkSide = (list) => list.map((sp, i) => {
      const inp = h('input', { type: 'text', inputmode: 'numeric', class: 'coef-input', 'aria-label': 'Коэффициент перед ' + sp, maxlength: 2 });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ctl.submit(); } });
      inputs.push(inp);
      return [i ? h('span', { class: 'eq-plus' }, '+') : null, h('span', { class: 'eq-term' }, inp, h('span', { html: chem(sp) }))];
    });
    body.appendChild(h('div', { class: 'equation' }, mkSide(q.reactants), h('span', { class: 'eq-arrow' }, '→'), mkSide(q.products)));
    return {
      check: () => {
        const vals = inputs.map(i => parseInt(i.value, 10));
        if (vals.some(v => !(v > 0))) { UI.toast('Заполните все коэффициенты (включая 1)', 'bad'); return null; }
        const ok = vals.every((v, i) => v === q.coeffs[i]);
        // пропорциональный, но не наименьший набор
        if (!ok) {
          const k = vals[0] / q.coeffs[0];
          if (vals.every((v, i) => v === q.coeffs[i] * k)) q._note = 'Уравнение сбалансировано, но коэффициенты нужно сократить до наименьших целых.';
        }
        return { correct: ok, right: formatEquation(q) };
      },
      reveal: ok => inputs.forEach((inp, i) => { inp.disabled = true; inp.classList.add(+inp.value === q.coeffs[i] ? 'correct' : 'wrong'); }),
    };
  },
};

function fmtAnswer(x) {
  if (typeof x !== 'number') return String(x);
  if (x !== 0 && (Math.abs(x) < 0.001 || Math.abs(x) >= 1e7)) return fmtSci(x, 2);
  return fmt(x, 3);
}

// ---------- Сессия теста ----------
// questions — массив вопросов или функция () => вопрос (бесконечный режим);
// opts: { title, total, repeatWrong, onFinish(result), onAnswer(correct, q), exitHref, timer (сек), lives }
function QuizSession(questions, opts = {}) {
  const infinite = typeof questions === 'function';
  const queue = infinite ? [] : questions.slice();
  const total = infinite ? (opts.total || Infinity) : queue.length;
  let idx = 0, correct = 0, answered = 0, firstTry = 0, lives = opts.lives ?? null;
  const wrongOnes = [];
  const started = Date.now();
  const log = [];

  const root = h('div', { class: 'quiz' });
  const top = h('div', { class: 'quiz-top' });
  const bar = h('div', { class: 'progress thick grow' }, h('div', { class: 'progress-fill', style: { width: '0%' } }));
  const counter = h('span', { class: 'quiz-counter' });
  const lifeBox = h('span', { class: 'lives' });
  const timerBox = h('span', { class: 'timer' });
  top.append(h('a', { class: 'icon-btn', href: opts.exitHref || '#/', 'aria-label': 'Выйти', title: 'Выйти' }, '✕'), bar, counter, lifeBox, timerBox);
  const stage = h('div', { class: 'quiz-stage' });
  root.append(top, stage);

  let timerId = null;
  if (opts.timer) {
    const end = started + opts.timer * 1000;
    const tick = () => {
      const left = (end - Date.now()) / 1000;
      timerBox.textContent = '⏱ ' + fmtTime(left);
      timerBox.classList.toggle('urgent', left < 60);
      if (left <= 0) { clearInterval(timerId); finish(true); }
    };
    timerId = setInterval(tick, 500);
    tick();
    opts.ctx?.onCleanup(() => clearInterval(timerId));
  }

  const updateTop = () => {
    const shown = infinite && total === Infinity ? answered : Math.min(answered, total);
    bar.firstChild.style.width = (total === Infinity ? 100 : (shown / (total + wrongOnes.length * 0)) * 100) + '%';
    counter.textContent = total === Infinity ? `✔ ${correct}` : `${Math.min(idx + 1, total)} / ${total}`;
    lifeBox.textContent = lives != null ? '❤️'.repeat(Math.max(0, lives)) + '🤍'.repeat(Math.max(0, (opts.lives || 0) - lives)) : '';
  };

  let repeatPhase = false;
  const next = () => {
    stage.innerHTML = '';
    let q;
    if (!repeatPhase && idx < total) {
      q = infinite ? questions(idx) : queue[idx];
    } else if (opts.repeatWrong && wrongOnes.length) {
      repeatPhase = true;
      q = wrongOnes.shift();
      stage.appendChild(h('div', { class: 'repeat-note' }, '🔁 Повторяем вопрос, где была ошибка'));
    } else return finish();
    updateTop();
    const card = renderQuestion(q, {
      onAnswer: ok => {
        answered++;
        if (!repeatPhase) {
          log.push({ q, ok });
          if (ok) { correct++; firstTry++; } else if (opts.repeatWrong) wrongOnes.push(q);
          if (!ok && lives != null) lives--;
        }
        opts.onAnswer?.(ok, q);
        if (!repeatPhase) idx++;
        updateTop();
        const out = lives != null && lives <= 0;
        const nextBtn = h('button', { class: 'btn primary big next-btn', type: 'button', onclick: () => out ? finish() : next() }, out ? 'Итоги' : 'Дальше →');
        card.appendChild(h('div', { class: 'q-next' }, nextBtn));
        if (q._note) card.querySelector('.q-feedback').prepend(h('div', { class: 'fb-note' }, q._note));
        nextBtn.focus({ preventScroll: true });
        setTimeout(() => nextBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 50);
      },
    });
    stage.appendChild(card);
    setTimeout(() => card.focusInput?.(), 30);
  };

  let finished = false;
  const finish = (timeUp = false) => {
    if (finished) return;
    finished = true;
    clearInterval(timerId);
    const result = { correct: firstTry, total: infinite ? answered : total, seconds: (Date.now() - started) / 1000, log, timeUp };
    stage.innerHTML = '';
    top.remove();
    stage.appendChild(opts.onFinish ? opts.onFinish(result) : resultCard(result, opts));
  };

  // клавиши 1–9 для выбора варианта, Enter — дальше
  const onKey = e => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 9) stage.querySelectorAll('.option:not([disabled])')[n - 1]?.click();
    if (e.key === 'Enter') {
      const nb = stage.querySelector('.next-btn') || stage.querySelector('.check-btn:not([disabled])');
      if (nb) { e.preventDefault(); nb.click(); }
    }
  };
  document.addEventListener('keydown', onKey);
  opts.ctx?.onCleanup(() => { document.removeEventListener('keydown', onKey); clearInterval(timerId); });

  next();
  return root;
}

function resultCard(result, opts = {}) {
  const pct = result.total ? Math.round(result.correct / result.total * 100) : 0;
  const emoji = pct >= 100 ? '🏆' : pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '📚';
  return h('div', { class: 'card result center' },
    h('div', { class: 'big-emoji' }, emoji),
    h('h2', null, opts.title || 'Готово!'),
    h('div', { class: 'result-score' }, `${result.correct} из ${result.total}`),
    h('p', { class: 'muted' }, `${pct}% · ${fmtTime(result.seconds)}`),
    h('div', { class: 'row center' }, h('a', { class: 'btn primary', href: opts.exitHref || '#/' }, 'Готово')));
}
