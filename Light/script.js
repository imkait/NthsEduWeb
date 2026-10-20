const canvas = document.getElementById('optics-canvas');
const ctx = canvas.getContext('2d');
const select = document.getElementById('optics-select');
const range = document.getElementById('distance-range');
const distanceOutput = document.getElementById('distance-output');
const presets = [...document.querySelectorAll('[data-distance]')];

const W = canvas.width;
const H = canvas.height;
const CX = 400;
const CY = 225;
const F = 100;
const OBJECT_HEIGHT = 62;
const ELEMENT_HALF_HEIGHT = 180;
const colors = {
  grid: '#234052',
  axis: '#7b9aaa',
  parallel: '#ffc188',
  center: '#7ce4c4',
  focal: '#ff8f9d',
  object: '#69adff',
  image: '#c4f495',
  text: '#d2e3e4'
};
const names = {
  'convex-lens': '凸透鏡 / 會聚',
  'concave-lens': '凹透鏡 / 發散',
  'concave-mirror': '凹面鏡 / 會聚',
  'convex-mirror': '凸面鏡 / 發散'
};
let dragging = false;

function line(x1, y1, x2, y2, color, dashed = false, width = 2.5) {
  if (![x1, y1, x2, y2].every(Number.isFinite)) return;
  ctx.beginPath();
  ctx.setLineDash(dashed ? [7, 7] : []);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
}

function label(text, x, y, color = colors.text, align = 'center') {
  ctx.fillStyle = color;
  ctx.font = '600 13px "DM Sans", "Noto Sans TC", sans-serif';
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}

function arrow(x, height, color, name, isImage = false) {
  const tip = CY - height;
  if (x < 15 || x > W - 15 || tip < 13 || tip > H - 13) return false;
  line(x, CY, x, tip, color, false, 4);
  const direction = Math.sign(height) || 1;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, tip);
  ctx.lineTo(x - 7, tip + 15 * direction);
  ctx.lineTo(x + 7, tip + 15 * direction);
  ctx.closePath();
  ctx.fill();
  label(name, x, direction > 0 ? tip - 16 : tip + 27, color);
  if (!isImage) {
    ctx.beginPath();
    ctx.arc(x, tip, 11, 0, Math.PI * 2);
    ctx.strokeStyle = '#69adff55';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  return true;
}

function background() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#12283b';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 40) line(x, 0, x, H, colors.grid, false, 1);
  for (let y = 25; y <= H; y += 40) line(0, y, W, y, colors.grid, false, 1);
  line(0, CY, W, CY, colors.axis, true, 1.4);
  label('主光軸', W - 20, CY - 12, colors.axis, 'right');
  for (const multiplier of [-2, -1, 1, 2]) {
    const x = CX + multiplier * F;
    ctx.beginPath();
    ctx.arc(x, CY, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#b4cbd1';
    ctx.fill();
    label(Math.abs(multiplier) === 2 ? '2F' : 'F', x, CY + 22, '#a9c2c8');
  }
}

function opticalElement(type) {
  ctx.save();
  ctx.strokeStyle = '#bdf3e2';
  ctx.fillStyle = '#bdf3e21c';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#84ebcf';
  ctx.shadowBlur = 18;
  ctx.beginPath();
  if (type === 'convex-lens') {
    ctx.moveTo(CX, CY - ELEMENT_HALF_HEIGHT);
    ctx.quadraticCurveTo(CX - 32, CY, CX, CY + ELEMENT_HALF_HEIGHT);
    ctx.quadraticCurveTo(CX + 32, CY, CX, CY - ELEMENT_HALF_HEIGHT);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (type === 'concave-lens') {
    ctx.moveTo(CX - 22, CY - ELEMENT_HALF_HEIGHT);
    ctx.quadraticCurveTo(CX + 8, CY, CX - 22, CY + ELEMENT_HALF_HEIGHT);
    ctx.lineTo(CX + 22, CY + ELEMENT_HALF_HEIGHT);
    ctx.quadraticCurveTo(CX - 8, CY, CX + 22, CY - ELEMENT_HALF_HEIGHT);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (type === 'concave-mirror') {
    ctx.moveTo(CX - 18, CY - ELEMENT_HALF_HEIGHT);
    ctx.quadraticCurveTo(CX + 18, CY, CX - 18, CY + ELEMENT_HALF_HEIGHT);
    ctx.lineTo(CX + 17, CY + ELEMENT_HALF_HEIGHT);
    ctx.lineTo(CX + 17, CY - ELEMENT_HALF_HEIGHT);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.moveTo(CX + 18, CY - ELEMENT_HALF_HEIGHT);
    ctx.quadraticCurveTo(CX - 18, CY, CX + 18, CY + ELEMENT_HALF_HEIGHT);
    ctx.lineTo(CX + 26, CY + ELEMENT_HALF_HEIGHT);
    ctx.lineTo(CX + 26, CY - ELEMENT_HALF_HEIGHT);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
  label(names[type].split(' / ')[0], CX, CY - ELEMENT_HALF_HEIGHT - 15, '#bdf3e2');
}

function drawRays(type, u, v) {
  const ox = CX - u;
  const oy = CY - OBJECT_HEIGHT;
  const isLens = type.includes('lens');
  const isConverging = type === 'convex-lens' || type === 'concave-mirror';
  const imageX = isLens ? CX + v : CX - v;
  const imageTipY = CY + OBJECT_HEIGHT * v / u;
  const virtual = v < 0;

  // 1. Parallel ray: through the far focus, or apparently from the near focus.
  line(ox, oy, CX, oy, colors.parallel);
  if (isLens) {
    const slope = (isConverging ? 1 : -1) * OBJECT_HEIGHT / F;
    line(CX, oy, W, oy + slope * (W - CX), colors.parallel);
  } else {
    const slope = (isConverging ? -1 : 1) * OBJECT_HEIGHT / F;
    line(CX, oy, 0, oy + slope * (0 - CX), colors.parallel);
  }
  if (virtual) {
    const apparentFocusX = isLens ? CX - F : CX + F;
    const extensionX = isConverging ? imageX : apparentFocusX;
    const extensionY = isConverging ? imageTipY : CY;
    line(CX, oy, extensionX, extensionY, colors.parallel, true, 1.8);
  }

  // 2. Lens-center ray goes straight; mirror-vertex ray reflects symmetrically.
  line(ox, oy, CX, CY, colors.center);
  if (isLens) {
    const slope = OBJECT_HEIGHT / u;
    line(CX, CY, W, CY + slope * (W - CX), colors.center);
  } else {
    const slope = -OBJECT_HEIGHT / u;
    line(CX, CY, 0, CY + slope * (0 - CX), colors.center);
  }
  if (virtual) line(CX, CY, imageX, imageTipY, colors.center, true, 1.8);

  // 3. Through the near focus (converging), or aimed at the far focus
  // (diverging), then parallel to the axis. The ray must hit the element.
  const hitY = isConverging
    ? CY + OBJECT_HEIGHT * F / (u - F)
    : CY - OBJECT_HEIGHT * F / (u + F);
  if (!Number.isFinite(hitY) || Math.abs(hitY - CY) > ELEMENT_HALF_HEIGHT) {
    return false;
  }
  line(ox, oy, CX, hitY, colors.focal);
  if (isConverging && u < F) {
    line(CX - F, CY, ox, oy, colors.focal, true, 1.8);
  }
  if (!isConverging) {
    line(CX, hitY, CX + F, CY, colors.focal, true, 1.8);
  }
  line(CX, hitY, isLens ? W : 0, hitY, colors.focal);
  if (virtual) line(CX, hitY, imageX, imageTipY, colors.focal, true, 1.8);
  return true;
}

function updateReadout(type, u, v) {
  const atFocus = !Number.isFinite(v);
  const real = v > 0;
  const size = Math.abs(v / u);
  const sizeText = size > 1.01 ? '放大' : size < .99 ? '縮小' : '等大';
  const kind = atFocus ? '像在無限遠' : real ? '倒立的實像' : '正立的虛像';
  document.getElementById('canvas-subtitle').textContent = names[type];
  document.getElementById('result-title').textContent = kind;
  document.getElementById('image-distance').textContent = atFocus ? '∞' : String(Math.round(v));
  document.getElementById('magnification').textContent = atFocus ? '—' : size.toFixed(2) + '×';
  document.getElementById('image-nature').textContent = atFocus ? '無有限位置' : sizeText + ' · ' + (real ? '倒立' : '正立');
  let note;
  if (atFocus) {
    note = '出射光近似平行，像位於無限遠；有限距離內無法用屏幕取得清晰像。';
  } else if (real) {
    note = (type.includes('lens') ? '折射光' : '反射光') + '在元件' + (type.includes('lens') ? '另一側' : '前方') + '實際交會，可以用屏幕承接。';
  } else {
    note = '光線的反向延長線交會形成虛像，無法直接用屏幕承接。';
  }
  if (!atFocus && (Math.abs(v) > 370 || size * OBJECT_HEIGHT > 190)) {
    note += ' 此時像的位置或高度超出光路圖範圍，請參考數值。';
  }
  document.getElementById('result-note').textContent = note;
  distanceOutput.value = String(u);
  presets.forEach(button => button.classList.toggle('active', Number(button.dataset.distance) === u));
}

function draw() {
  const type = select.value;
  document.getElementById('convex-graph-section').hidden = type !== 'convex-lens';
  const u = Number(range.value);
  const f = type === 'convex-lens' || type === 'concave-mirror' ? F : -F;
  const v = u === f ? Infinity : f * u / (u - f);
  background();
  const hasFocalRay = drawRays(type, u, v);
  document.getElementById('ray-status').textContent = hasFocalRay
    ? ''
    : u === F
      ? '物體恰在焦點時，第三條「經焦點後平行」的作圖光線無法定義。'
      : '第三條焦點光線會射到元件圖示之外，這個位置暫不繪製。';
  opticalElement(type);
  arrow(CX - u, OBJECT_HEIGHT, colors.object, '物體');
  if (Number.isFinite(v)) {
    const imageX = type.includes('lens') ? CX + v : CX - v;
    const height = -OBJECT_HEIGHT * v / u;
    arrow(imageX, height, colors.image, '像', true);
  }
  updateReadout(type, u, v);
}

function pointerPosition(event) {
  const bounds = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - bounds.left) * W / bounds.width,
    y: (event.clientY - bounds.top) * H / bounds.height
  };
}

canvas.addEventListener('pointerdown', event => {
  const point = pointerPosition(event);
  const objectX = CX - Number(range.value);
  if (Math.abs(point.x - objectX) > 22 || point.y < CY - OBJECT_HEIGHT - 25 || point.y > CY + 22) return;
  dragging = true;
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove', event => {
  if (!dragging) return;
  const point = pointerPosition(event);
  let u = Math.max(Number(range.min), Math.min(Number(range.max), Math.round(CX - point.x)));
  if (Math.abs(u - 100) <= 5) u = 100;
  if (Math.abs(u - 200) <= 5) u = 200;
  range.value = String(u);
  draw();
});
canvas.addEventListener('pointerup', () => { dragging = false; });
canvas.addEventListener('pointercancel', () => { dragging = false; });
range.addEventListener('input', draw);
select.addEventListener('change', draw);
presets.forEach(button => button.addEventListener('click', () => {
  range.value = button.dataset.distance;
  draw();
}));
draw();
