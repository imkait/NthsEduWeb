const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
const values = document.getElementById('values');
const insight = document.getElementById('insight');
const colors = { a: '#2369b6', b: '#168673', result: '#df6549', guide: '#9eafaa' };
const state = {
  unit: 1, operation: 'add',
  v: { x: 4, y: 3 }, a: { x: 4, y: 1 }, b: { x: 2, y: 3 }, dotB: { x: 3, y: 4 }
};
let size = { width: 0, height: 0, scale: 30, ox: 0, oy: 0 };
let dragging = null;

function clampCoordinate(value) {
  return Math.max(-8, Math.min(8, Math.round(value)));
}
function coordinateText(v) { return `(${v.x}, ${v.y})`; }
function lengthText(v) { return Math.hypot(v.x, v.y).toFixed(2); }
function point(v) { return { x: size.ox + v.x * size.scale, y: size.oy - v.y * size.scale }; }
function world(x, y) { return { x: (x - size.ox) / size.scale, y: (size.oy - y) / size.scale }; }
function currentVectors() {
  if (state.unit === 1) return [state.v];
  if (state.unit === 3) return [{ x: 6, y: 0 }, state.dotB];
  const sign = state.operation === 'add' ? 1 : -1;
  return [state.a, state.b, { x: state.a.x + sign * state.b.x, y: state.a.y + sign * state.b.y }];
}
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  size.width = rect.width;
  size.height = rect.height;
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}
function drawLine(from, to, color, width = 2, dashed = false) {
  const p = point(from), q = point(to);
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.setLineDash(dashed ? [6, 6] : []);
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(q.x, q.y);
  ctx.stroke();
  ctx.setLineDash([]);
}
function drawArrow(from, to, color, label, options = {}) {
  drawLine(from, to, color, options.width || 3, options.dashed || false);
  const p = point(from), q = point(to);
  const distance = Math.hypot(q.x - p.x, q.y - p.y);
  if (distance > 3) {
    const angle = Math.atan2(q.y - p.y, q.x - p.x);
    ctx.beginPath();
    ctx.moveTo(q.x, q.y);
    ctx.lineTo(q.x - 12 * Math.cos(angle - .5), q.y - 12 * Math.sin(angle - .5));
    ctx.lineTo(q.x - 12 * Math.cos(angle + .5), q.y - 12 * Math.sin(angle + .5));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
  if (options.handle) {
    ctx.beginPath(); ctx.arc(q.x, q.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = color; ctx.stroke();
  }
  if (label) {
    const dx = q.x >= size.ox ? 11 : -11;
    ctx.font = '700 14px "Noto Sans TC", sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = dx > 0 ? 'left' : 'right';
    ctx.fillText(label, q.x + dx, q.y - 12);
  }
}
function drawGrid() {
  const { width, height, scale, ox, oy } = size;
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#e8eeea'; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = ox % scale; x < width; x += scale) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
  for (let y = oy % scale; y < height; y += scale) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
  ctx.stroke();
  ctx.strokeStyle = '#8a9a9b'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(width, oy); ctx.moveTo(ox, 0); ctx.lineTo(ox, height); ctx.stroke();
  ctx.font = '11px "DM Mono", monospace'; ctx.fillStyle = '#839394'; ctx.textAlign = 'center';
  ctx.fillText('0', ox - 12, oy + 17);
  for (let n = -8; n <= 8; n += 2) {
    if (n === 0) continue;
    const x = ox + n * scale, y = oy - n * scale;
    if (x > 16 && x < width - 16) ctx.fillText(String(n), x, oy + 17);
    if (y > 16 && y < height - 8) ctx.fillText(String(n), ox - 16, y + 4);
  }
  ctx.fillText('x', width - 13, oy - 9);
  ctx.fillText('y', ox + 13, 16);
}
function draw() {
  if (!size.width || !size.height) return;
  const vectors = currentVectors();
  const maxX = Math.max(9, ...vectors.map(v => Math.abs(v.x) + 2));
  const maxY = Math.max(8, ...vectors.map(v => Math.abs(v.y) + 2));
  size.scale = Math.min(34, (size.width - 28) / (2 * maxX), (size.height - 32) / (2 * maxY));
  size.ox = size.width / 2; size.oy = size.height / 2;
  drawGrid();
  const zero = { x: 0, y: 0 };
  if (state.unit === 1) {
    const v = state.v;
    drawLine({ x: v.x, y: 0 }, v, colors.guide, 1.5, true);
    drawLine({ x: 0, y: v.y }, v, colors.guide, 1.5, true);
    drawArrow(zero, v, colors.a, 'v', { handle: true });
  } else if (state.unit === 2) {
    const a = state.a, b = state.b;
    const copy = state.operation === 'add' ? b : { x: -b.x, y: -b.y };
    const result = { x: a.x + copy.x, y: a.y + copy.y };
    drawArrow(a, result, colors.b, state.operation === 'add' ? 'b' : '−b', { dashed: true, width: 2 });
    drawArrow(zero, result, colors.result, state.operation === 'add' ? 'a+b' : 'a−b', { width: 4 });
    drawArrow(zero, a, colors.a, 'a', { handle: true });
    drawArrow(zero, b, colors.b, 'b', { handle: true });
  } else {
    const b = state.dotB, projection = { x: b.x, y: 0 };
    drawLine(b, projection, colors.guide, 1.5, true);
    drawArrow(zero, { x: 6, y: 0 }, colors.a, 'a');
    drawArrow(zero, projection, colors.result, '', { width: 5 });
    drawArrow(zero, b, colors.b, 'b', { handle: true });
    const p = point(projection);
    ctx.fillStyle = colors.result; ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
  }
}
function updateReadout() {
  if (state.unit === 1) {
    const v = state.v;
    values.innerHTML = `<span class="math-line">v = ${coordinateText(v)}</span><strong>|v| = √(${v.x}² + ${v.y}²) = ${lengthText(v)}</strong>`;
    insight.textContent = v.x === 0 && v.y === 0 ? '零向量的長度是 0，沒有特定方向；仍可用座標輸入或拖曳原點重新設定。' : `從原點走 ${Math.abs(v.x)} 格${v.x >= 0 ? '向右' : '向左'}、${Math.abs(v.y)} 格${v.y >= 0 ? '向上' : '向下'}，就抵達箭頭終點。`;
  } else if (state.unit === 2) {
    const a = state.a, b = state.b, sign = state.operation === 'add' ? 1 : -1;
    const result = { x: a.x + sign * b.x, y: a.y + sign * b.y };
    values.innerHTML = `<span class="math-line">a = ${coordinateText(a)}　b = ${coordinateText(b)}</span><strong>a ${sign === 1 ? '+' : '−'} b = ${coordinateText(result)}</strong><span class="math-line">= (${a.x} ${sign === 1 ? '+' : '−'} ${b.x}, ${a.y} ${sign === 1 ? '+' : '−'} ${b.y})</span>`;
    insight.textContent = sign === 1 ? '加法：把 b 平移到 a 的終點；從原點連到新終點就是 a + b。' : '減法：把 b 反向成 −b，再接到 a 的終點；結果是 a − b。';
  } else {
    const b = state.dotB, dot = 6 * b.x;
    const magnitude = Math.hypot(b.x, b.y);
    const angle = magnitude === 0 ? '未定義' : `${(Math.acos(Math.max(-1, Math.min(1, b.x / magnitude))) * 180 / Math.PI).toFixed(1)}°`;
    values.innerHTML = `<span class="math-line">a · b = 6 × ${b.x} + 0 × ${b.y}</span><strong>a · b = ${dot}</strong><span class="math-line">夾角 θ = ${angle}</span>`;
    insight.textContent = magnitude === 0 ? '零向量沒有方向，因此與其他向量的夾角未定義；內積仍是 0。' : dot > 0 ? '內積為正，夾角是銳角；b 在 a 方向上的投影朝右。' : dot < 0 ? '內積為負，夾角是鈍角；b 在 a 方向上的投影朝左。' : '內積為 0，兩個非零向量互相垂直，夾角為 90°。';
  }
  draw();
}
function syncInputs() {
  document.querySelectorAll('[data-vector]').forEach(group => {
    const v = state[group.dataset.vector];
    group.querySelector('[data-axis="x"]').value = v.x;
    group.querySelector('[data-axis="y"]').value = v.y;
  });
}
function setUnit(n) {
  state.unit = n; dragging = null;
  const data = [
    ['向量與成分', '箭頭的方向與長度描述一個向量；水平與垂直位移就是它的兩個成分。'],
    ['加法與減法', '向量可以平移而不改變。觀察紅色結果向量如何由兩個成分合成。'],
    ['內積與夾角', '內積連結座標運算與幾何角度；看綠色向量在藍色方向上的投影。']
  ][n - 1];
  document.getElementById('lesson-number').textContent = `LESSON 0${n}`;
  document.getElementById('lesson-title').textContent = data[0];
  document.getElementById('lesson-description').textContent = data[1];
  document.querySelectorAll('.unit-tab').forEach(tab => {
    const active = Number(tab.dataset.unit) === n;
    tab.classList.toggle('active', active);
    if (active) tab.setAttribute('aria-current', 'step'); else tab.removeAttribute('aria-current');
  });
  document.querySelectorAll('.unit-controls').forEach((section, index) => { section.hidden = index !== n - 1; });
  updateReadout();
}
document.querySelectorAll('.unit-tab').forEach(tab => tab.addEventListener('click', () => setUnit(Number(tab.dataset.unit))));
document.querySelectorAll('.mode-button').forEach(button => button.addEventListener('click', () => {
  state.operation = button.dataset.operation;
  document.querySelectorAll('.mode-button').forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  updateReadout();
}));
document.querySelectorAll('[data-vector] input').forEach(input => input.addEventListener('change', () => {
  const vector = state[input.closest('[data-vector]').dataset.vector];
  const axis = input.dataset.axis;
  const parsed = Number(input.value);
  if (input.value.trim() !== '' && Number.isFinite(parsed)) vector[axis] = clampCoordinate(parsed);
  syncInputs(); updateReadout();
}));
document.querySelectorAll('.preset').forEach(button => button.addEventListener('click', () => {
  const [name, coords] = button.dataset.preset.split(':');
  const [x, y] = coords.split(',').map(Number);
  state[name] = { x, y };
  syncInputs(); updateReadout();
}));
function pointerPosition(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}
canvas.addEventListener('pointerdown', event => {
  const p = pointerPosition(event);
  const candidates = state.unit === 1 ? ['v'] : state.unit === 2 ? ['a', 'b'] : ['dotB'];
  let nearest = null, distance = 20;
  candidates.forEach(name => {
    const q = point(state[name]);
    const d = Math.hypot(p.x - q.x, p.y - q.y);
    if (d < distance) { nearest = name; distance = d; }
  });
  if (nearest) { dragging = nearest; canvas.setPointerCapture(event.pointerId); event.preventDefault(); }
});
canvas.addEventListener('pointermove', event => {
  if (!dragging) return;
  const p = pointerPosition(event);
  const v = world(p.x, p.y);
  state[dragging].x = clampCoordinate(v.x);
  state[dragging].y = clampCoordinate(v.y);
  syncInputs(); updateReadout();
});
function endDrag(event) {
  dragging = null;
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
}
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);
new ResizeObserver(resizeCanvas).observe(canvas);
syncInputs();
setUnit(1);
