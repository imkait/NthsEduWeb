const media = {
  air: { name: '空氣', n: 1.00 },
  water: { name: '水', n: 1.33 },
  glass: { name: '玻璃', n: 1.50 }
};

const pairSelect = document.querySelector('#medium-pair');
const directionSelect = document.querySelector('#ray-direction');
const angleRange = document.querySelector('#angle-range');
const sourceHandle = document.querySelector('#source-handle');
const diagram = document.querySelector('#ray-diagram');
const center = { x: 450, y: 280 };
const rayLength = 253;
const radians = degrees => degrees * Math.PI / 180;
const degrees = radiansValue => radiansValue * 180 / Math.PI;
const setText = (id, value) => { document.getElementById(id).textContent = value; };
const setPath = (id, value) => { document.getElementById(id).setAttribute('d', value); };
const setVisible = (id, visible) => { document.getElementById(id).style.display = visible ? '' : 'none'; };
const roundAngle = value => `${value.toFixed(1).replace(/\.0$/, '')}°`;

function arcPath(radius, angle, verticalSide, horizontalSide) {
  const endX = center.x + horizontalSide * radius * Math.sin(radians(angle));
  const endY = center.y + verticalSide * radius * Math.cos(radians(angle));
  const sweep = verticalSide === horizontalSide ? 0 : 1;
  return `M ${center.x} ${center.y + verticalSide * radius} A ${radius} ${radius} 0 0 ${sweep} ${endX} ${endY}`;
}

function reflectedFraction(n1, n2, incidentAngle, transmittedAngle) {
  if (transmittedAngle === null) return 1;
  const cosI = Math.cos(radians(incidentAngle));
  const cosT = Math.cos(radians(transmittedAngle));
  const rs = (n1 * cosI - n2 * cosT) / (n1 * cosI + n2 * cosT);
  const rp = (n1 * cosT - n2 * cosI) / (n1 * cosT + n2 * cosI);
  return Math.min(1, Math.max(0, (rs * rs + rp * rp) / 2));
}

function update() {
  const [upperKey, lowerKey] = pairSelect.value.split('-');
  const upper = media[upperKey];
  const lower = media[lowerKey];
  const sourceAbove = directionSelect.value === 'down';
  const sourceSide = sourceAbove ? -1 : 1;
  const source = sourceAbove ? upper : lower;
  const target = sourceAbove ? lower : upper;
  const incident = Number(angleRange.value);
  const ratio = source.n / target.n;
  const sine = ratio * Math.sin(radians(incident));
  const critical = source.n > target.n ? degrees(Math.asin(target.n / source.n)) : null;
  const totalReflection = sine > 1 + 1e-10;
  const transmitted = totalReflection ? null : degrees(Math.asin(Math.min(1, sine)));
  const reflectedShare = reflectedFraction(source.n, target.n, incident, transmitted);
  const transmittedShare = 1 - reflectedShare;
  const ix = center.x - rayLength * Math.sin(radians(incident));
  const iy = center.y + sourceSide * rayLength * Math.cos(radians(incident));
  const rx = center.x + rayLength * Math.sin(radians(incident));
  const ry = iy;
  const tx = transmitted === null ? null : center.x + rayLength * Math.sin(radians(transmitted));
  const ty = transmitted === null ? null : center.y - sourceSide * rayLength * Math.cos(radians(transmitted));
  const incidentPath = `M ${ix} ${iy} L ${center.x} ${center.y}`;
  const reflectedPath = `M ${center.x} ${center.y} L ${rx} ${ry}`;
  const refractedPath = transmitted === null ? '' : `M ${center.x} ${center.y} L ${tx} ${ty}`;

  setPath('incident-ray', incidentPath);
  setPath('incident-glow', incidentPath);
  setPath('reflected-ray', reflectedPath);
  setPath('reflected-glow', reflectedPath);
  setPath('refracted-ray', refractedPath);
  setPath('refracted-glow', refractedPath);
  sourceHandle.setAttribute('transform', `translate(${ix} ${iy})`);
  sourceHandle.setAttribute('aria-label', `從${source.name}射向${target.name}，入射角 ${incident} 度。拖曳或按方向鍵調整。`);

  setPath('incident-arc', incident > 0 ? arcPath(65, incident, sourceSide, -1) : '');
  setPath('reflected-arc', incident > 0 ? arcPath(80, incident, sourceSide, 1) : '');
  setPath('refracted-arc', transmitted > 0 ? arcPath(65, transmitted, -sourceSide, 1) : '');
  setVisible('refracted-arc', transmitted !== null);
  setVisible('reflected-angle-label', incident > 0);
  setVisible('refracted-angle-label', transmitted !== null);
  setVisible('refracted-ray-name', transmitted !== null);
  setVisible('refracted-ray', transmitted !== null);
  setVisible('refracted-glow', transmitted !== null);
  setVisible('incident-angle-label', incident > 0);
  document.getElementById('reflected-ray').classList.toggle('normal-overlap', incident === 0);

  const place = (id, x, y) => {
    const element = document.getElementById(id);
    element.setAttribute('x', x);
    element.setAttribute('y', y);
  };
  place('incident-angle-label', center.x - 96 * Math.sin(radians(incident / 2)) - 22, center.y + sourceSide * 96 * Math.cos(radians(incident / 2)) + (sourceAbove ? 0 : 14));
  place('reflected-angle-label', center.x + 106 * Math.sin(radians(incident / 2)) + 5, center.y + sourceSide * 106 * Math.cos(radians(incident / 2)) + (sourceAbove ? 0 : 14));
  if (transmitted !== null) place('refracted-angle-label', center.x + 92 * Math.sin(radians(transmitted / 2)) + 5, center.y - sourceSide * 92 * Math.cos(radians(transmitted / 2)) + (sourceAbove ? 6 : 0));
  place('incident-ray-name', center.x + (ix - center.x) * .70 - 80, center.y + (iy - center.y) * .70 + (sourceAbove ? -12 : 20));
  place('reflected-ray-name', center.x + (rx - center.x) * .73 + 10, center.y + (ry - center.y) * .73 + (sourceAbove ? -10 : 20));
  if (transmitted !== null) place('refracted-ray-name', center.x + (tx - center.x) * .72 + 13, center.y + (ty - center.y) * .72 + (sourceAbove ? 20 : -10));
  setText('incident-angle-label', `${incident}°`);
  setText('reflected-angle-label', `${incident}°`);
  if (transmitted !== null) setText('refracted-angle-label', roundAngle(transmitted));

  setText('upper-label', upper.name);
  setText('upper-index', `n = ${upper.n.toFixed(2)}`);
  setText('lower-label', lower.name);
  setText('lower-index', `n = ${lower.n.toFixed(2)}`);
  document.getElementById('upper-field').setAttribute('fill', upperKey === 'water' ? '#ECF5FF' : '#FDFFFF');
  document.getElementById('lower-field').setAttribute('fill', lowerKey === 'glass' ? '#CFE2F3' : '#ECF5FF');
  setText('angle-output', `${incident}°`);
  setText('incident-value', `${incident}°`);
  setText('reflected-value', `${incident}°`);
  setText('refracted-value', transmitted === null ? '—' : roundAngle(transmitted));
  setText('snell-symbolic', totalReflection ? 'n₁ sin θᵢ > n₂ sin 90°' : 'n₁ sin θᵢ = n₂ sin θₜ');
  setText('snell-left', `${source.n} × sin ${incident}°`);
  setText('snell-relation', totalReflection ? '>' : '=');
  setText('snell-right', `${target.n} × sin ${transmitted === null ? '90°' : roundAngle(transmitted)}`);
  const reflectedTenths = Math.round(reflectedShare * 1000);
  const reflectedPercent = (reflectedTenths / 10).toFixed(1);
  const transmittedPercent = ((1000 - reflectedTenths) / 10).toFixed(1);
  setText('reflection-percent', `${reflectedPercent}%`);
  setText('transmission-percent', `${transmittedPercent}%`);
  setText('intensity-status', totalReflection ? '全反射：入射光的強度全部成為反射光。' : '反射與折射的比例會隨介質和入射角改變。');
  document.getElementById('reflection-bar').style.width = `${reflectedShare * 100}%`;
  document.getElementById('transmission-bar').style.width = `${transmittedShare * 100}%`;
  document.getElementById('intensity-bar').setAttribute('aria-label', `反射光 ${reflectedPercent}%，折射光 ${transmittedPercent}%`);
  document.getElementById('reflected-ray').style.strokeWidth = `${2 + 3 * Math.sqrt(reflectedShare)}`;
  document.getElementById('refracted-ray').style.strokeWidth = `${2 + 3 * Math.sqrt(transmittedShare)}`;
  document.getElementById('reflected-ray').style.opacity = `${.45 + .55 * Math.sqrt(reflectedShare)}`;
  document.getElementById('refracted-ray').style.opacity = `${.45 + .55 * Math.sqrt(transmittedShare)}`;
  document.getElementById('reflected-glow').style.opacity = `${Math.max(.08, reflectedShare)}`;
  document.getElementById('refracted-glow').style.opacity = `${Math.max(.08, transmittedShare)}`;

  let observation;
  let note;
  let tag;
  if (totalReflection) {
    tag = '全反射';
    note = `臨界角約 ${roundAngle(critical)}；目前入射角已超過臨界角。`;
    observation = `光從${source.name}射向${target.name}，入射角 ${incident}° 超過臨界角 ${roundAngle(critical)}，只剩反射光線。`;
  } else if (critical !== null && Math.abs(incident - critical) < .05) {
    tag = '臨界角';
    note = `折射光沿著介面前進；臨界角約 ${roundAngle(critical)}。`;
    observation = `光從${source.name}射向${target.name}，折射角達到 90°，再增大入射角就會全反射。`;
  } else if (incident === 0) {
    tag = '垂直入射';
    note = '折射光沿法線前進；反射光與入射光重疊，以虛線表示。';
    observation = `光垂直射入${target.name}，折射方向不偏轉；反射角也是 0°。`;
  } else if (source.n < target.n) {
    tag = '偏向法線';
    note = '折射率變大，折射角小於入射角。';
    observation = `光從${source.name}進入${target.name}，折射光線偏向法線；反射角等於入射角。`;
  } else {
    tag = '偏離法線';
    note = `折射率變小；臨界角約 ${roundAngle(critical)}。`;
    observation = `光從${source.name}進入${target.name}，折射光線偏離法線；反射角等於入射角。`;
  }
  setText('stage-tag', tag);
  setText('stage-note', note);
  setText('snell-note', totalReflection ? `${source.name} → ${target.name}；入射角超過臨界角 ${roundAngle(critical)}，沒有折射角。` : `${source.name} → ${target.name}；折射角顯示至小數一位。`);
  document.getElementById('stage-tag').classList.toggle('is-tir', totalReflection);
  document.getElementById('diagram-description').textContent = `${observation} 上方是${upper.name}，下方是${lower.name}。入射角 ${incident} 度，反射角 ${incident} 度，${transmitted === null ? '沒有折射光線' : `折射角 ${roundAngle(transmitted)}`}。`;
}

function setAngle(value) {
  angleRange.value = Math.max(0, Math.min(80, Math.round(value)));
  update();
}

function angleFromPointer(event) {
  const point = diagram.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const local = point.matrixTransform(diagram.getScreenCTM().inverse());
  const sourceSide = directionSelect.value === 'down' ? -1 : 1;
  setAngle(degrees(Math.atan2(center.x - local.x, sourceSide * (local.y - center.y))));
}

let dragging = false;
sourceHandle.addEventListener('pointerdown', event => {
  dragging = true;
  sourceHandle.setPointerCapture(event.pointerId);
  angleFromPointer(event);
});
sourceHandle.addEventListener('pointermove', event => {
  if (dragging) angleFromPointer(event);
});
sourceHandle.addEventListener('pointerup', () => { dragging = false; });
sourceHandle.addEventListener('pointercancel', () => { dragging = false; });
sourceHandle.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') { event.preventDefault(); setAngle(Number(angleRange.value) - 1); }
  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') { event.preventDefault(); setAngle(Number(angleRange.value) + 1); }
});

pairSelect.addEventListener('change', update);
directionSelect.addEventListener('change', update);
angleRange.addEventListener('input', update);
document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => {
  const presets = {
    'bend-in': ['air-water', 'down', 42],
    'bend-out': ['air-water', 'up', 42],
    tir: ['air-glass', 'up', 55]
  };
  const [pair, direction, angle] = presets[button.dataset.preset];
  pairSelect.value = pair;
  directionSelect.value = direction;
  setAngle(angle);
}));

update();
