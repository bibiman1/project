(function () {
  const roots = document.querySelectorAll('[data-fp9-lifechart]');
  if (!roots.length) return;

  const logoUrl = 'https://242476225.fs1.hubspotusercontent-na2.net/hubfs/242476225/logo/logo_fp9_ver1.2f.png';
  const svgNs = 'http://www.w3.org/2000/svg';
  const categoryColors = {
    '進学・卒業':'#1E5EEB','仕事':'#5A2A2A','就職':'#151515','転職':'#151515','独立・起業':'#151515','退職':'#8A8A8A','結婚':'#E619B8','恋愛':'#E619B8','出産・子育て':'#E619B8','家族の変化':'#E619B8','人との関係':'#1E5EEB','住宅購入':'#151515','引っ越し':'#151515','収入・お金':'#00D45A','病気・けが':'#00D45A','介護':'#00D45A','別れ・死別':'#8A8A8A','挑戦':'#00D45A','学び・資格':'#1E5EEB','趣味':'#E619B8','その他':'#8A8A8A'
  };
  const tagEmoji = {
    '進学・卒業':'🎓','仕事':'💼','就職':'💼','転職':'💼','独立・起業':'💼','退職':'🌙','結婚':'💍','恋愛':'💗','出産・子育て':'👶','家族の変化':'👪','人との関係':'🤝','住宅購入':'🏠','引っ越し':'🏠','収入・お金':'💰','病気・けが':'🩺','介護':'🩺','別れ・死別':'🌙','挑戦':'🔥','学び・資格':'🎓','趣味':'🎨','その他':'✨'
  };
  const lifeEventPriority = ['結婚','恋愛','出産・子育て','住宅購入','仕事','就職','転職','独立・起業','退職','進学・卒業','家族の変化','人との関係','引っ越し','病気・けが','介護','別れ・死別','収入・お金'];

  roots.forEach(init);

  function init(root) {
    const state = { events: [], editingIndex: null, lastAge: 30 };
    const $ = (s) => root.querySelector(s);
    const add = $('[data-add-event]');
    const clear = $('[data-clear-input]');
    const reset = $('[data-reset-all]');
    const build = $('[data-build-chart]');
    const save = $('[data-save-chart]');
    const copyReport = $('[data-copy-report]');
    const eventList = $('[data-event-list]');
    const empty = $('[data-empty-text]');
    const actions = $('[data-events-actions]');
    const result = $('[data-result-section]');
    const resultTitle = $('[data-result-title]');
    const chart = $('[data-chart]');
    const report = $('[data-report-list]');
    const reflection = $('[data-reflection]');
    const msg = $('[data-message]');
    const score = $('[data-score]');
    const scoreLabel = $('[data-score-label]');
    const ageRange = $('[data-age-range]');
    const ageNumber = $('[data-age-number]');
    const titleInput = $('[data-title]');
    const nicknameInput = $('[data-nickname]');
    const saveStatus = $('[data-save-status]');

    setupChips(root);
    syncAge(ageRange, ageNumber, 'range');
    updateScore(root, score, scoreLabel);
    renderEvents();

    score.addEventListener('input', () => updateScore(root, score, scoreLabel));
    ageRange.addEventListener('input', () => { syncAge(ageRange, ageNumber, 'range'); state.lastAge = Number(ageNumber.value) || 0; });
    ageNumber.addEventListener('input', () => { syncAge(ageRange, ageNumber, 'number'); state.lastAge = Number(ageNumber.value) || 0; });

    add.addEventListener('click', () => {
      const editing = state.editingIndex !== null;
      const item = readInput(root, editing ? state.events[state.editingIndex].inputIndex : state.events.length + 1);
      const validation = validate(item);
      if (!validation.ok) { msg.textContent = validation.message; return; }
      state.lastAge = item.age;
      if (!editing && state.events.length >= 30) { msg.textContent = '入力できる出来事は30件までです。'; return; }
      if (editing) {
        state.events[state.editingIndex] = item;
        state.editingIndex = null;
        add.textContent = '＋ 出来事に追加';
        msg.textContent = '出来事を修正しました。必要に応じてグラフを作り直してください。';
      } else {
        state.events.push(item);
        msg.textContent = '追加しました。最後に「ライフラインチャートを作る」を押してください。';
      }
      clearInput(root, { preserveAge: true, age: state.lastAge });
      ageRange.value = String(state.lastAge);
      ageNumber.value = String(state.lastAge);
      syncAge(ageRange, ageNumber, 'number');
      updateScore(root, score, scoreLabel);
      renderEvents();
      hideResult();
    });

    clear.addEventListener('click', () => {
      state.editingIndex = null;
      add.textContent = '＋ 出来事に追加';
      state.lastAge = Number(ageNumber.value) || state.lastAge;
      clearInput(root, { preserveAge: true, age: state.lastAge });
      syncAge(ageRange, ageNumber, 'number');
      updateScore(root, score, scoreLabel);
      renderEvents();
      msg.textContent = '入力中の内容を消しました。';
    });

    reset.addEventListener('click', () => {
      state.events = [];
      state.editingIndex = null;
      state.lastAge = 30;
      add.textContent = '＋ 出来事に追加';
      clearInput(root, { preserveAge: false });
      if (nicknameInput) nicknameInput.value = '';
      syncAge(ageRange, ageNumber, 'range');
      updateScore(root, score, scoreLabel);
      renderEvents();
      hideResult();
      msg.textContent = '';
    });

    build.addEventListener('click', () => {
      if (!state.events.length) { msg.textContent = '出来事を追加してからライフラインチャートを作成してください。'; return; }
      const events = sortEvents(state.events);
      const displayTitle = getDisplayTitle(root);
      result.hidden = false;
      if (resultTitle) resultTitle.textContent = displayTitle;
      drawChart(chart, events);
      renderReport(report, events);
      renderReflection(reflection, events);
      result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    eventList.addEventListener('click', (e) => {
      const editBtn = e.target.closest('[data-edit]');
      if (editBtn) {
        const i = Number(editBtn.dataset.edit);
        if (Number.isNaN(i) || !state.events[i]) return;
        state.editingIndex = i;
        loadEventForEdit(state.events[i]);
        add.textContent = '修正を反映';
        msg.textContent = '選択した出来事を修正中です。内容を変更して「修正を反映」を押してください。';
        renderEvents();
        return;
      }
      const deleteBtn = e.target.closest('[data-delete]');
      if (!deleteBtn) return;
      const i = Number(deleteBtn.dataset.delete);
      if (Number.isNaN(i)) return;
      state.events.splice(i, 1);
      if (state.editingIndex === i) {
        state.editingIndex = null;
        add.textContent = '＋ 出来事に追加';
        clearInput(root, { preserveAge: true, age: state.lastAge });
      } else if (state.editingIndex !== null && state.editingIndex > i) {
        state.editingIndex -= 1;
      }
      renderEvents();
      hideResult();
    });

    if (save) save.addEventListener('click', () => saveResultAsPng(chart, sortEvents(state.events), getDisplayTitle(root), 'lifeline-chart-result.png', saveStatus));
    if (copyReport) copyReport.addEventListener('click', () => copyReportText(sortEvents(state.events), getDisplayTitle(root), saveStatus));

    function renderEvents() {
      eventList.innerHTML = '';
      const has = state.events.length > 0;
      actions.hidden = !has;
      empty.hidden = has;
      if (!has) return;
      state.events.forEach((item, i) => {
        const cls = item.score > 0 ? 'is-positive' : item.score < 0 ? 'is-negative' : 'is-neutral';
        const card = document.createElement('article');
        card.className = 'fp9-lifechart__event' + (state.editingIndex === i ? ' is-editing' : '');
        card.innerHTML = '<div><p class="fp9-lifechart__event-title">' + esc(item.title) + '</p><p class="fp9-lifechart__event-meta">' + esc(item.ageLabel) + '</p>' + renderTagHtml(item.tags) + '</div><span class="fp9-lifechart__score ' + cls + '">' + fmt(item.score) + '</span><div class="fp9-lifechart__event-actions"><button type="button" class="fp9-lifechart__edit" data-edit="' + i + '">修正</button><button type="button" class="fp9-lifechart__delete" data-delete="' + i + '">削除</button></div>';
        eventList.appendChild(card);
      });
    }

    function loadEventForEdit(item) {
      ageRange.value = String(item.age);
      ageNumber.value = String(item.age);
      state.lastAge = item.age;
      titleInput.value = item.memo || '';
      score.value = String(item.score);
      root.querySelectorAll('[data-chip-group="tag"] button').forEach((button) => {
        button.classList.toggle('is-selected', item.tags.indexOf(button.dataset.value) >= 0);
        colorBtn(button, 'tag');
      });
      syncAge(ageRange, ageNumber, 'number');
      updateScore(root, score, scoreLabel);
      titleInput.focus();
    }

    function hideResult() {
      result.hidden = true;
      chart.innerHTML = '';
      report.innerHTML = '';
      reflection.innerHTML = '';
    }
  }

  function setupChips(root) {
    root.querySelectorAll('[data-chip-group]').forEach((group) => {
      const name = group.dataset.chipGroup;
      if (name === 'tag') group.querySelectorAll('button').forEach((button) => colorBtn(button, name));
      group.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;
        button.classList.toggle('is-selected');
        colorBtn(button, name);
      });
    });
  }

  function colorBtn(button, name) {
    if (name !== 'tag') return;
    const color = categoryColors[button.dataset.value] || categoryColors['その他'];
    button.style.borderColor = color;
    if (button.classList.contains('is-selected')) {
      button.style.backgroundColor = color;
      button.style.color = color === '#00D45A' ? '#151515' : '#fff';
    } else {
      button.style.backgroundColor = '#fff';
      button.style.color = color;
    }
  }

  function readInput(root, number) {
    const tags = getMulti(root, 'tag');
    const memo = root.querySelector('[data-title]').value.trim();
    const age = Number(root.querySelector('[data-age-number]').value);
    const score = Number(root.querySelector('[data-score]').value);
    const ageLabel = age + '歳';
    const title = memo || tags[0] || ageLabel || '出来事' + number;
    return { age, ageLabel, tags, memo, title, score, inputIndex: number };
  }

  function getDisplayTitle(root) {
    const nicknameInput = root.querySelector('[data-nickname]');
    const nickname = nicknameInput ? nicknameInput.value.trim() : '';
    return nickname ? nickname + 'のライフラインチャート' : 'ライフラインチャート';
  }

  function validate(item) {
    if (Number.isNaN(item.age) || item.age < 0 || item.age > 100) return { ok: false, message: '年齢は0〜100歳の範囲で入力してください。' };
    if (Number.isNaN(item.score)) return { ok: false, message: '気持ちの値を確認してください。' };
    return { ok: true, message: '' };
  }

  function clearInput(root, options) {
    const preserveAge = options && options.preserveAge === true;
    const ageRange = root.querySelector('[data-age-range]');
    const ageNumber = root.querySelector('[data-age-number]');
    const currentAge = options && typeof options.age !== 'undefined' ? String(options.age) : (ageNumber ? ageNumber.value : '30');
    root.querySelector('[data-title]').value = '';
    root.querySelector('[data-score]').value = '0';
    if (preserveAge) { ageRange.value = currentAge; ageNumber.value = currentAge; } else { ageRange.value = '30'; ageNumber.value = '30'; }
    root.querySelectorAll('.is-selected').forEach((item) => item.classList.remove('is-selected'));
    const tagGroup = root.querySelector('[data-chip-group="tag"]');
    if (tagGroup) tagGroup.querySelectorAll('button').forEach((button) => colorBtn(button, 'tag'));
  }

  function syncAge(range, number, source) {
    if (source === 'number') {
      let value = Number(number.value);
      if (Number.isNaN(value)) value = 0;
      value = Math.max(0, Math.min(100, value));
      number.value = String(value);
      range.value = String(value);
    } else {
      number.value = String(range.value);
    }
  }

  function updateScore(root, input, label) {
    const value = Number(input.value);
    const color = value < 0 ? '#E63B5A' : value > 0 ? '#00A85A' : '#8A8A8A';
    root.style.setProperty('--emotion-color', color);
    label.textContent = fmt(value) + ' ' + emotionText(value);
  }

  function emotionText(value) {
    if (value <= -8) return 'とてもつらい';
    if (value <= -4) return 'つらい';
    if (value <= -1) return '少し沈んだ';
    if (value === 0) return 'ふつう';
    if (value <= 3) return '少し前向き';
    if (value <= 7) return 'うれしい';
    return 'とても印象的';
  }

  function getMulti(root, name) {
    return Array.from(root.querySelectorAll('[data-chip-group="' + name + '"] .is-selected')).map((item) => item.dataset.value);
  }

  function sortEvents(events) {
    return events.slice().sort((a, b) => a.age !== b.age ? a.age - b.age : a.inputIndex - b.inputIndex);
  }

  function drawChart(svg, events) {
    events = sortEvents(events);
    const W = 1120, H = 540;
    const m = { top: 72, right: 54, bottom: 72, left: 72 };
    const pw = W - m.left - m.right;
    const ph = H - m.top - m.bottom;
    const zero = scoreY(0, m.top, ph);
    const feat = getFeatured(events);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    svg.innerHTML = '';
    svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, rx: 24, fill: '#fff' }));
    svg.appendChild(el('rect', { x: m.left, y: m.top, width: pw, height: zero - m.top, fill: '#fff4ef' }));
    svg.appendChild(el('rect', { x: m.left, y: zero, width: pw, height: m.top + ph - zero, fill: '#f1f5ff' }));
    svg.appendChild(el('text', { x: 26, y: m.top + 42, fill: '#e63b5a', 'font-size': 14, 'font-weight': 900 }, 'たのしい'));
    svg.appendChild(el('text', { x: 26, y: m.top + 68, 'font-size': 24 }, '😊'));
    svg.appendChild(el('text', { x: 26, y: zero + 70, fill: '#3b5fe6', 'font-size': 14, 'font-weight': 900 }, 'つらい'));
    svg.appendChild(el('text', { x: 26, y: zero + 98, 'font-size': 24 }, '😟'));
    [-10, -5, 0, 5, 10].forEach((value) => {
      const y = scoreY(value, m.top, ph);
      svg.appendChild(el('line', { x1: m.left, y1: y, x2: W - m.right, y2: y, stroke: value === 0 ? '#151515' : 'rgba(21,21,21,.1)', 'stroke-width': value === 0 ? 2 : 1, 'stroke-dasharray': value === 0 ? '0' : '5 8' }));
      svg.appendChild(el('text', { x: m.left - 18, y: y + 5, fill: value > 0 ? '#e63b5a' : value < 0 ? '#3b5fe6' : '#151515', 'font-size': 13, 'font-weight': 900, 'text-anchor': 'end' }, value > 0 ? '+' + value : String(value)));
    });
    const pts = buildPts(events, m, pw, ph);
    if (pts.length > 1) svg.appendChild(el('path', { d: smooth(pts), fill: 'none', stroke: '#0757c8', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    drawTicks(svg, pts, m, ph);
    pts.forEach((point, i) => {
      const tag = point.item.tags[0] || 'その他';
      const color = categoryColors[tag] || '#8a8a8a';
      const emoji = tagEmoji[tag] || '✨';
      const featured = feat.includes(i);
      const radius = featured ? 10 : 7;
      svg.appendChild(el('circle', { cx: point.x, cy: point.y, r: radius + 5, fill: '#fff', stroke: '#0757c8', 'stroke-width': featured ? 3 : 2 }));
      svg.appendChild(el('circle', { cx: point.x, cy: point.y, r: radius, fill: color }));
      svg.appendChild(el('text', { x: point.x, y: point.y + 5, fill: '#fff', 'font-size': featured ? 12 : 10, 'text-anchor': 'middle' }, emoji));
      svg.appendChild(el('text', { x: point.x, y: point.item.score >= 0 ? point.y - 16 : point.y + 26, fill: '#151515', 'font-size': 13, 'font-weight': 900, 'text-anchor': 'middle' }, fmt(point.item.score)));
    });
    feat.forEach((index, order) => {
      const point = pts[index];
      const item = point.item;
      const tag = item.tags[0] || 'その他';
      const color = categoryColors[tag] || categoryColors['その他'];
      const above = item.score >= 0;
      const offset = above ? -108 - (order % 2) * 20 : 112 + (order % 2) * 20;
      const box = card(svg, point.x, point.y + offset, item, color);
      const lineEndY = above ? box.y + box.h : box.y;
      const lineStartY = above ? point.y - 12 : point.y + 12;
      svg.appendChild(el('line', { x1: point.x, y1: lineStartY, x2: point.x, y2: lineEndY, stroke: color, 'stroke-width': 1.2, 'stroke-dasharray': '3 5' }));
    });
    svg.appendChild(el('text', { x: m.left, y: H - 22, fill: '#8a8a8a', 'font-size': 12 }, '※年齢順に並べたうえで、横幅は出来事ごとに等間隔で表示しています。詳細は下のレポートに表示されます。'));
  }

  function buildPts(events, m, pw, ph) {
    return events.map((item, i) => ({ x: events.length === 1 ? m.left + pw / 2 : m.left + (pw * i / (events.length - 1)), y: scoreY(item.score, m.top, ph), item }));
  }

  function getFeatured(events) {
    const arr = [];
    const add = (index) => { if (index >= 0 && !arr.includes(index)) arr.push(index); };
    if (!events.length) return arr;
    events.map((item, index) => ({ index, abs: Math.abs(item.score) })).sort((a, b) => b.abs - a.abs).slice(0, 3).forEach((item) => { if (item.abs >= 4) add(item.index); });
    lifeEventPriority.forEach((tag) => { const index = events.findIndex((event) => event.tags && event.tags.indexOf(tag) >= 0); if (index >= 0) add(index); });
    const swing = largestSwing(events);
    if (swing) { add(events.indexOf(swing.from)); add(events.indexOf(swing.to)); }
    add(0);
    add(events.length - 1);
    return arr.slice(0, 6).sort((a, b) => a - b);
  }

  function drawTicks(svg, pts, m, ph) {
    const count = Math.min(7, pts.length);
    const indexes = [];
    for (let i = 0; i < count; i++) {
      const index = Math.round((pts.length - 1) * i / Math.max(1, count - 1));
      if (!indexes.includes(index)) indexes.push(index);
    }
    indexes.forEach((index) => {
      const point = pts[index];
      const y = m.top + ph;
      svg.appendChild(el('line', { x1: point.x, y1: y, x2: point.x, y2: y + 8, stroke: '#151515' }));
      svg.appendChild(el('text', { x: point.x, y: y + 28, fill: '#151515', 'font-size': 12, 'font-weight': 900, 'text-anchor': 'middle' }, point.item.ageLabel));
    });
  }

  function card(svg, x, y, item, color) {
    const tag = item.tags[0] || 'その他';
    const emoji = tagEmoji[tag] || '✨';
    const title = clipText(item.memo || item.title || tag, 17);
    const w = 210;
    const h = 67;
    const cx = clamp(x - w / 2, 82, 1120 - w - 28);
    const cy = clamp(y - h / 2, 18, 540 - h - 34);
    svg.appendChild(el('rect', { x: cx, y: cy, width: w, height: h, rx: 12, fill: '#fff', stroke: color, 'stroke-width': 1.6 }));
    svg.appendChild(el('text', { x: cx + 12, y: cy + 20, fill: '#151515', 'font-size': 12, 'font-weight': 900 }, item.ageLabel));
    svg.appendChild(el('text', { x: cx + w - 18, y: cy + 23, 'font-size': 20, 'text-anchor': 'middle' }, emoji));
    svg.appendChild(el('text', { x: cx + 12, y: cy + 45, fill: '#151515', 'font-size': 12, 'font-weight': 900 }, title));
    return { x: cx, y: cy, w, h };
  }

  function renderReport(box, events) {
    box.innerHTML = '';
    events.forEach((item, i) => {
      const cls = item.score > 0 ? 'is-positive' : item.score < 0 ? 'is-negative' : 'is-neutral';
      const article = document.createElement('article');
      article.className = 'fp9-lifechart__report-item';
      article.innerHTML = '<div class="fp9-lifechart__report-index">' + pad(i + 1) + '</div><div class="fp9-lifechart__report-time">' + esc(item.ageLabel) + '</div><div class="fp9-lifechart__report-tags">' + renderTagHtml(item.tags) + '</div><p class="fp9-lifechart__report-title">' + esc(item.memo || 'ー') + '</p><span class="fp9-lifechart__score ' + cls + '">' + fmt(item.score) + '</span>';
      box.appendChild(article);
    });
  }

  function renderReflection(box, events) {
    const max = events.reduce((a, b) => a.score >= b.score ? a : b);
    const min = events.reduce((a, b) => a.score <= b.score ? a : b);
    const swing = largestSwing(events);
    const counts = count(events.flatMap((item) => item.tags));
    const repeated = Object.keys(counts).filter((key) => counts[key] >= 2);
    const top = topItems(counts, 3);
    const move = swing ? '最大変化は「' + swing.from.title + '」から「' + swing.to.title + '」。差は' + fmt(swing.diff) + 'です。' : '複数件入力すると、変化幅を確認できます。';
    const theme = repeated.length ? '複数回出ているテーマ：' + repeated.map((tag) => (tagEmoji[tag] || '') + tag).join('、') : (top.length ? '主なテーマ：' + top.map((tag) => (tagEmoji[tag] || '') + tag).join('、') : 'テーマは未選択です。');
    box.innerHTML = '<article class="fp9-lifechart__reflection-card"><h4>気持ちが動いたところ</h4><p>最高点：「' + esc(max.title) + '」' + fmt(max.score) + '<br>最低点：「' + esc(min.title) + '」' + fmt(min.score) + '</p><p>' + esc(move) + '</p></article><article class="fp9-lifechart__reflection-card"><h4>繰り返し出てくるテーマ</h4><p>' + esc(theme) + '</p></article><article class="fp9-lifechart__reflection-card"><h4>次に考える問い</h4><ul><li>感情が大きく上がった出来事には何が関係していましたか？</li><li>感情が大きく下がった前後で暮らしやお金に変化はありましたか？</li><li>大きく変化した区間の前後で何が変わっていましたか？</li></ul></article>';
  }

  function renderTagHtml(tags) {
    if (!tags || !tags.length) return '<div class="fp9-lifechart__event-tags"><span class="fp9-lifechart__event-tag" style="color:#8A8A8A;border-color:#8A8A8A">✨ その他</span></div>';
    return '<div class="fp9-lifechart__event-tags">' + tags.map((tag) => '<span class="fp9-lifechart__event-tag" style="color:' + (categoryColors[tag] || '#8A8A8A') + ';border-color:' + (categoryColors[tag] || '#8A8A8A') + '">' + (tagEmoji[tag] || '✨') + ' ' + esc(tag) + '</span>').join('') + '</div>';
  }

  function copyReportText(events, title, status) {
    if (!events || !events.length) { setSaveStatus(status, '先に出来事を追加してライフラインチャートを作成してください。'); return; }
    const lines = [title, 'No.\t年齢\t感情点\t出来事・テーマ\t出来事メモ'];
    events.forEach((item, i) => {
      const tags = (item.tags && item.tags.length ? item.tags : ['その他']).map((tag) => (tagEmoji[tag] || '✨') + ' ' + tag).join('、');
      lines.push([pad(i + 1), item.ageLabel, fmt(item.score), tags, item.memo || 'ー'].join('\t'));
    });
    const text = lines.join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => setSaveStatus(status, 'レポートをコピーしました。')).catch(() => fallbackCopyText(text, status)); else fallbackCopyText(text, status);
  }

  function fallbackCopyText(text, status) {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', 'readonly');
    area.style.position = 'fixed';
    area.style.left = '-9999px';
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); setSaveStatus(status, 'レポートをコピーしました。'); } catch (error) { setSaveStatus(status, 'コピーできませんでした。'); }
    document.body.removeChild(area);
  }

  // 保存PNGは下部の出来事一覧を圧縮し、2カラム表を維持します。
  async function saveResultAsPng(svg, events, title, fileName, status) {
    if (!svg || !svg.innerHTML) { setSaveStatus(status, '先にライフラインチャートを作成してください。'); return; }
    if (!events || !events.length) { setSaveStatus(status, '先に出来事を追加してください。'); return; }
    const chartW = 2048;
    const chartH = 980;
    const reportPad = 18;
    const tableTopPad = 12;
    const tableRowH = 38;
    const tableHeaderH = 30;
    const rowCount = Math.ceil(events.length / 2);
    const reportH = tableTopPad + tableHeaderH + rowCount * tableRowH + reportPad;
    const canvas = document.createElement('canvas');
    canvas.width = chartW;
    canvas.height = chartH + reportH + 28;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    roundRect(ctx, 1, 1, canvas.width - 2, canvas.height - 2, 28, false, true, '#C7CDD6');

    const clone = svg.cloneNode(true);
    clone.setAttribute('xmlns', svgNs);
    clone.setAttribute('width', chartW);
    clone.setAttribute('height', chartH);
    clone.setAttribute('viewBox', '0 0 1120 540');
    const xml = new XMLSerializer().serializeToString(clone);
    const img = new Image();
    img.onload = function () {
      ctx.drawImage(img, 0, 0, chartW, chartH);
      drawReportBlock(ctx, buildPngRows(events), 0, chartH, chartW, reportH, reportPad, tableHeaderH, tableRowH);
      downloadCanvas(canvas, fileName, status);
    };
    img.onerror = function () { setSaveStatus(status, '画像生成に失敗しました。ブラウザの設定をご確認ください。'); };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(xml)));
  }

  function buildPngRows(events) {
    return events.map((item, i) => {
      const tag = item.tags && item.tags.length ? item.tags[0] : 'その他';
      return {
        no: pad(i + 1),
        icon: tagEmoji[tag] || '✨',
        memo: item.memo || item.title || 'ー'
      };
    });
  }

  function drawReportBlock(ctx, rows, x, y, w, h, padSize, headerH, rowH) {
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(x, y, w, h);
    const fullX = x + 20;
    const fullW = w - 40;
    const gap = 14;
    const colW = (fullW - gap) / 2;
    const topY = y + 12;
    const split = Math.ceil(rows.length / 2);
    const leftRows = rows.slice(0, split);
    const rightRows = rows.slice(split);
    drawReportTable(ctx, leftRows, fullX, topY, colW, headerH, rowH);
    if (rightRows.length) drawReportTable(ctx, rightRows, fullX + colW + gap, topY, colW, headerH, rowH);
  }

  function drawReportTable(ctx, rows, x, y, w, headerH, rowH) {
    const noW = 54;
    const iconW = 50;
    const textW = w - noW - iconW;
    const navy = '#112657';
    const border = '#BFC7D4';
    ctx.fillStyle = navy;
    roundRect(ctx, x, y, w, headerH, 6, true, false);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText('No.', x + 14, y + 21);
    ctx.textAlign = 'center';
    ctx.fillText('出来事', x + noW + iconW + textW / 2, y + 21);
    ctx.textAlign = 'start';
    rows.forEach((row, i) => {
      const ry = y + headerH + i * rowH;
      ctx.fillStyle = i % 2 === 0 ? '#fff' : '#F6F8FB';
      ctx.fillRect(x, ry, w, rowH);
      ctx.strokeStyle = border;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, ry, w, rowH);
      ctx.fillStyle = '#151515';
      ctx.font = 'bold 17px sans-serif';
      ctx.fillText(row.no, x + 14, ry + 25);
      drawCircleIcon(ctx, row.icon, x + noW + iconW / 2, ry + rowH / 2, 14);
      ctx.fillStyle = '#151515';
      ctx.font = 'bold 16px sans-serif';
      const lines = wrapCanvasText(ctx, row.memo || 'ー', textW - 18, 'bold 16px sans-serif').slice(0, 1);
      const text = lines.length ? lines[0] : 'ー';
      ctx.fillText(clipCanvasText(ctx, text, textW - 18, 'bold 16px sans-serif'), x + noW + iconW + 9, ry + 25);
    });
  }

  function drawCircleIcon(ctx, icon, cx, cy, r) {
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#151515';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon || '✨', cx, cy + 1);
    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';
  }

  function wrapCanvasText(ctx, text, maxWidth, font) {
    ctx.font = font;
    const chars = String(text || '').split('');
    const lines = [];
    let line = '';
    chars.forEach((char) => {
      const test = line + char;
      if (line && ctx.measureText(test).width > maxWidth) { lines.push(line); line = char; }
      else { line = test; }
    });
    if (line) lines.push(line);
    return lines;
  }

  async function drawImageHeader(ctx, title, width, height) {
    const left = 56;
    const top = 24;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);
    try {
      const logo = await loadImage(logoUrl);
      const logoW = 120;
      const logoH = logo.height * (logoW / logo.width);
      ctx.drawImage(logo, left, top, logoW, logoH);
    } catch (error) {
      ctx.fillStyle = '#151515';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('FP9', left, top + 30);
    }
    ctx.fillStyle = '#151515';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText(clipCanvasText(ctx, title, width - left * 2, 'bold 44px sans-serif'), left, 96);
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#4a4a4a';
    ctx.fillText('LIFE LINE CHART', left, 124);
    ctx.strokeStyle = '#ececec';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left, height - 1);
    ctx.lineTo(width - left, height - 1);
    ctx.stroke();
  }

  function clipCanvasText(ctx, text, maxWidth, font) {
    const value = String(text || 'ライフラインチャート');
    ctx.font = font;
    if (ctx.measureText(value).width <= maxWidth) return value;
    let output = value;
    while (output.length > 0 && ctx.measureText(output + '…').width > maxWidth) output = output.slice(0, -1);
    return output ? output + '…' : 'ライフラインチャート';
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  function downloadCanvas(canvas, fileName, status) {
    try {
      if (canvas.toBlob) {
        canvas.toBlob((blob) => {
          if (!blob) { openCanvasInNewTab(canvas, status); return; }
          const url = URL.createObjectURL(blob), anchor = document.createElement('a');
          anchor.download = fileName;
          anchor.href = url;
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          setSaveStatus(status, '画像を保存しました。');
        }, 'image/png');
      } else openCanvasInNewTab(canvas, status);
    } catch (error) { openCanvasInNewTab(canvas, status); }
  }

  function openCanvasInNewTab(canvas, status) {
    const dataUrl = canvas.toDataURL('image/png'), win = window.open();
    if (win) { win.document.write('<img src="' + dataUrl + '" style="width:100%;height:auto;">'); setSaveStatus(status, '画像を新しいタブで開きました。長押しで保存してください。'); }
    else setSaveStatus(status, '画像を作成しましたが、ブラウザにより保存がブロックされました。');
  }

  function setSaveStatus(status, text) { if (status) status.textContent = text || ''; }
  function largestSwing(events) { if (events.length < 2) return null; let lg = null; for (let i = 1; i < events.length; i++) { const from = events[i - 1], to = events[i], diff = to.score - from.score, abs = Math.abs(diff); if (!lg || abs > lg.abs) lg = { from, to, diff, abs }; } return lg && lg.abs >= 4 ? lg : null; }
  function count(items) { return items.reduce((acc, item) => { acc[item] = (acc[item] || 0) + 1; return acc; }, {}); }
  function topItems(items, limit) { return Object.keys(items).sort((a, b) => items[b] - items[a]).slice(0, limit); }
  function scoreY(value, top, height) { return top + ((10 - value) / 20) * height; }
  function smooth(pts) { let d = 'M ' + pts[0].x + ' ' + pts[0].y; for (let i = 1; i < pts.length; i++) { const p = pts[i - 1], c = pts[i], mx = (p.x + c.x) / 2; d += ' C ' + mx + ' ' + p.y + ', ' + mx + ' ' + c.y + ', ' + c.x + ' ' + c.y; } return d; }
  function el(tag, attrs, text) { const element = document.createElementNS(svgNs, tag); Object.keys(attrs || {}).forEach((key) => element.setAttribute(key, attrs[key])); if (typeof text === 'string') element.textContent = text; return element; }
  function clipText(text, maxChars) { const value = String(text || 'ー'); return value.length > maxChars ? value.slice(0, Math.max(0, maxChars - 1)) + '…' : value; }
  function fmt(value) { return value > 0 ? '+' + value : String(value); }
  function pad(number) { return String(number).padStart(2, '0'); }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function esc(value) { return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function roundRect(ctx, x, y, w, h, r, fill, stroke, strokeColor) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); if (fill) ctx.fill(); if (stroke) { if (strokeColor) ctx.strokeStyle = strokeColor; ctx.stroke(); } }
})();
