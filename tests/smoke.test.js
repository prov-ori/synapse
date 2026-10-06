// Браузерный smoke-тест: открывает каждый экран, проходит урок, решает задачи, запускает лаборатории и игры,
// ловит ошибки консоли. Запуск: NODE_PATH=$(npm root -g) node tests/smoke.test.js
// SHOTS_DIR=папка — сохранить скриншоты; MOBILE=1 — узкий экран.

const path = require('path');
const { chromium } = require('playwright');

const url = 'file://' + path.join(__dirname, '..', 'index.html');
const shotsDir = process.env.SHOTS_DIR;
const mobile = !!process.env.MOBILE;

(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const page = await browser.newPage({ viewport: mobile ? { width: 390, height: 844 } : { width: 1366, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)/.test(m.text()) && !/ERR_/.test(m.text())) errors.push('console: ' + m.text()); });

  await page.goto(url + '#/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  const ids = await page.evaluate(() => ({
    modules: COURSE.map(m => m.id), lessons: allLessons().map(l => l.id), gens: GENERATORS.map(g => g.id),
    labs: LAB_LIST.map(l => l.id), games: GAMES.map(g => g.id), refs: REF_TABS.map(t => t[0]),
  }));

  const routes = ['#/', '#/subject/chem', '#/subject/phys', '#/subject/bio', '#/practice', '#/labs', '#/exam', '#/cards', '#/reference',
    '#/games', '#/profile', '#/settings', '#/nope', '#/practice/mix-chem', '#/practice/mix-bio',
    ...ids.modules.map(m => '#/module/' + m), ...ids.lessons.map(l => '#/lesson/' + l),
    ...ids.gens.map(g => '#/practice/' + g), ...ids.labs.map(l => '#/labs/' + l), ...ids.games.map(g => '#/games/' + g),
    ...ids.refs.map(r => '#/reference/' + r)];
  const shots = ['#/', '#/subject/bio', '#/module/chem-redox', '#/lesson/bio-protein-2', '#/practice', '#/practice/translation', '#/labs/periodic',
    '#/labs/ph', '#/labs/lens', '#/labs/dna', '#/labs/heart', '#/labs/punnett', '#/labs/projectile', '#/labs/cell', '#/reference/code', '#/profile', '#/exam'];
  for (const r of routes) {
    await page.goto(url + r);
    await page.waitForTimeout(r.startsWith('#/labs/') ? 400 : 60);
    const text = await page.locator('main').innerText();
    if (/Что-то пошло не так/.test(text)) errors.push(`${r}: render error — ${text.slice(0, 200)}`);
    if (r === '#/nope' && !/не найдена/.test(text)) errors.push('404 не сработал');
    if (shotsDir && shots.includes(r)) await page.screenshot({ path: path.join(shotsDir, (mobile ? 'm_' : '') + r.replace(/[#/]/g, '_') + '.png') });
  }

  // Проходим тест урока, отвечая наугад (ошибки должны вернуться в конце)
  await page.goto(url + '#/lesson/chem-mole-2/quiz');
  let guard = 0;
  while (guard++ < 40) {
    if (await page.locator('.result').count()) break;
    const q = page.locator('.question').last();
    const cls = await q.getAttribute('class');
    if (/q-(choice|tf)/.test(cls)) await q.locator('.option').first().click();
    else if (/q-multi/.test(cls)) await q.locator('.option').first().click();
    else if (/q-(num|text)/.test(cls)) await q.locator('input').fill('1');
    else if (/q-order/.test(cls)) { while (await q.locator('.chip-bank .chip').count()) await q.locator('.chip-bank .chip').first().click(); }
    else if (/q-match/.test(cls)) { const sels = q.locator('select'); for (let i = 0; i < await sels.count(); i++) await sels.nth(i).selectOption({ index: 1 }); }
    else if (/q-coeffs/.test(cls)) { const ins = q.locator('.coef-input'); for (let i = 0; i < await ins.count(); i++) await ins.nth(i).fill('1'); }
    await q.locator('.check-btn').click();
    await page.locator('.next-btn').last().click();
  }
  if (!(await page.locator('.result').count())) errors.push('урок не завершился');
  const st = await page.evaluate(() => ({ lessons: Object.keys(Store.state.lessons).length, cards: Object.keys(Store.state.srs).length, xp: Store.state.xp }));
  if (!st.lessons) errors.push('урок не сохранён');
  if (!st.cards) errors.push('термины не добавились в карточки');
  if (!st.xp) errors.push('XP не начислен');

  // Тренажёр: правильный ответ на числовую задачу засчитывается
  await page.goto(url + '#/practice/molar-mass');
  await page.waitForTimeout(100);
  const ans = await page.evaluate(() => {
    const t = document.querySelector('.q-text').innerText;
    const m = t.match(/массу: (.+?) \(/);
    return m ? molarMass(m[1].replace(/[₀-₉]/g, d => '₀₁₂₃₄₅₆₇₈₉'.indexOf(d)).replace(/·/g, '*')) : null;
  });
  await page.fill('.answer-input', String(ans).replace('.', ','));
  await page.click('.check-btn');
  if (!(await page.locator('.is-correct').count())) errors.push('тренажёр: верный ответ не засчитан (' + ans + ')');

  // Карточки: повторение
  await page.goto(url + '#/cards');
  const startBtn = page.locator('text=Начать повторение');
  if (await startBtn.count()) {
    await startBtn.click();
    await page.click('text=Показать ответ');
    await page.click('.grade.g2');
  } else errors.push('нет карточек к повторению');

  // Экзамен: короткий, без таймера
  await page.goto(url + '#/exam');
  await page.click('text=10');
  await page.click('text=Начать экзамен');
  guard = 0;
  while (guard++ < 40) {
    if (await page.locator('.result').count()) break;
    const q = page.locator('.question').last();
    const cls = await q.getAttribute('class');
    if (/q-(choice|tf|multi)/.test(cls)) await q.locator('.option').first().click();
    else if (/q-(num|text)/.test(cls)) await q.locator('input').fill('2');
    else if (/q-order/.test(cls)) { while (await q.locator('.chip-bank .chip').count()) await q.locator('.chip-bank .chip').first().click(); }
    else if (/q-match/.test(cls)) { const sels = q.locator('select'); for (let i = 0; i < await sels.count(); i++) await sels.nth(i).selectOption({ index: 1 }); }
    else if (/q-coeffs/.test(cls)) { const ins = q.locator('.coef-input'); for (let i = 0; i < await ins.count(); i++) await ins.nth(i).fill('1'); }
    await q.locator('.check-btn').click();
    await page.locator('.next-btn').last().click();
  }
  if (!(await page.locator('.result').count())) errors.push('экзамен не завершился');
  if (shotsDir) await page.screenshot({ path: path.join(shotsDir, (mobile ? 'm_' : '') + 'exam_result.png'), fullPage: false });

  // Лаборатории: взаимодействие
  await page.goto(url + '#/labs/calculator');
  await page.fill('.answer-input >> nth=0', 'Al + O2 = Al2O3');
  await page.click('button:has-text("Уравнять")');
  if (!/4Al/.test(await page.locator('.big-eq').first().innerText())) errors.push('калькулятор не уравнял');
  await page.goto(url + '#/labs/periodic');
  await page.click('.el >> nth=25');
  if (!/Железо/.test(await page.locator('.ptable-detail').innerText())) errors.push('таблица: нет карточки железа');
  await page.goto(url + '#/labs/dna');
  await page.locator('.strand.dna .nt').nth(4).click();
  await page.goto(url + '#/labs/projectile');
  await page.click('text=Огонь');
  await page.waitForTimeout(600);
  await page.goto(url + '#/labs/selection');
  await page.click('text=Запустить эволюцию');

  // Быстрая игра
  await page.goto(url + '#/games/elements');
  await page.click('text=Старт');
  for (let i = 0; i < 5; i++) { await page.locator('.game-stage .option').first().click(); await page.waitForTimeout(650); }
  await page.goto(url + '#/games/memory');
  await page.locator('.mem-tile').first().click();

  // Тема и профиль
  await page.click('#theme-toggle');
  await page.goto(url + '#/profile');
  if (shotsDir) await page.screenshot({ path: path.join(shotsDir, (mobile ? 'm_' : '') + 'profile_dark.png') });
  await page.goto(url + '#/labs/heart');
  await page.waitForTimeout(300);
  if (shotsDir) await page.screenshot({ path: path.join(shotsDir, (mobile ? 'm_' : '') + 'heart_dark.png') });

  // Горизонтальной прокрутки страницы быть не должно
  for (const r of ['#/', '#/subject/chem', '#/lesson/chem-atom-2', '#/labs/ph', '#/reference/solubility', '#/practice']) {
    await page.goto(url + r);
    await page.waitForTimeout(150);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (over > 2) errors.push(`${r}: горизонтальная прокрутка ${over}px`);
  }

  await browser.close();
  if (errors.length) {
    console.error('Ошибки:\n' + [...new Set(errors)].join('\n'));
    process.exit(1);
  }
  console.log(`OK: ${routes.length} экранов, урок, тренажёр, карточки, экзамен, лаборатории и игры без ошибок`);
})();
