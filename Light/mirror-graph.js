(() => {
  const svg = document.getElementById('mirror-plot');
  const staticLayer = document.getElementById('mirror-static');
  const dynamicLayer = document.getElementById('mirror-dynamic');
  const slider = document.getElementById('mirror-distance');
  const mainSlider = document.getElementById('distance-range');
  const opticsSelect = document.getElementById('optics-select');
  const presets = [...document.querySelectorAll('[data-mirror-u]')];
  const X0 = 390;
  const Y0 = 411;
  const SCALE = 95;
  const x = value => X0 + value * SCALE;
  const y = value => Y0 - value * SCALE;
  const element = (tag, attributes, content = '') =>
    `<${tag} ${Object.entries(attributes).map(([key, value]) => `${key}="${value}"`).join(' ')}>${content}</${tag}>`;
  const segment = (x1, y1, x2, y2, className, extra = '') =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${className}" ${extra}/>`;

  staticLayer.innerHTML = `
    ${[-2, -1, 1, 2, 3, 4].map(n => segment(x(n), y(0), x(n), y(3.55), 'graph-grid')).join('')}
    ${[1, 2, 3].map(n => segment(x(-3.25), y(n), x(5.08), y(n), 'graph-grid')).join('')}
    ${segment(x(-3.25), y(0), x(5.08), y(0), 'graph-axis', 'marker-end="url(#mirror-axis-arrow)"')}
    ${segment(x(0), y(-.28), x(0), y(3.65), 'graph-axis', 'marker-end="url(#mirror-axis-arrow)"')}
    ${[1, 2].map(n => segment(x(n), y(0) - 6, x(n), y(0) + 6, 'graph-tick')).join('')}
    ${[1, 2].map(n => segment(x(0) - 6, y(n), x(0) + 6, y(n), 'graph-tick')).join('')}
    ${element('text', { x: x(1), y: y(0) + 31, 'text-anchor': 'middle', class: 'graph-label-strong' }, 'f')}
    ${element('text', { x: x(2), y: y(0) + 31, 'text-anchor': 'middle', class: 'graph-label-strong' }, '2f = C')}
    ${element('text', { x: x(0) - 22, y: y(1) + 5, 'text-anchor': 'end', class: 'graph-label-strong' }, 'f')}
    ${element('text', { x: x(0) - 22, y: y(2) + 5, 'text-anchor': 'end', class: 'graph-label-strong' }, '2f = C')}
    ${element('text', { x: x(0) - 13, y: y(0) + 26, 'text-anchor': 'end', class: 'graph-label' }, '0')}
    ${element('text', { x: 930, y: y(0) - 12, 'text-anchor': 'end', class: 'graph-label-strong' }, '像距 v →')}
    ${element('text', { x: x(0) + 18, y: 31, class: 'graph-label-strong' }, '物距 u ↑')}
    ${element('text', { x: 82, y: y(0) + 31, class: 'graph-label' }, '鏡後虛像（正立）')}
    ${element('text', { x: 614, y: y(0) + 31, class: 'graph-label' }, '鏡前實像（倒立）')}
    ${element('circle', { cx: x(1), cy: y(1), r: 6, class: 'graph-focus-dot' })}
    ${element('text', { x: x(1) + 13, y: y(1) - 15, class: 'graph-annotation' }, '(f, f)')}`;

  let u = 2.5;
  let dragging = false;
  let dragStartY = 0;
  let dragStartU = 0;

  function caseInfo() {
    if (u === 1) return ['U = F', '物在焦點 f', '反射光平行，不在有限距離成像。', '∞'];
    const vText = (u / (u - 1)).toFixed(2) + ' f';
    if (u < 1) return ['U < F', '物在焦點內', '在鏡後成正立、放大的虛像。', vText];
    if (u === 2) return ['U = 2F = C', '物在曲率中心 C', '在鏡前成倒立、等大的實像，像也落在 C。', vText];
    if (u < 2) return ['F < U < C', '物在 f 與 C 間', '在鏡前成倒立、放大的實像，像落在 C 外。', vText];
    return ['U > C', '物在 C 外', '在鏡前成倒立、縮小的實像，像落在 f 與 C 之間。', vText];
  }

  function draw() {
    const [caseTag, caseTitle, caseDescription, vText] = caseInfo();
    const v = u === 1 ? Infinity : u / (u - 1);
    const snapped = u === 1 ? 'f' : u === 2 ? 'C' : null;
    document.getElementById('mirror-drag-status').textContent = snapped
      ? `已吸附至 ${snapped} · 繼續拖曳可移開`
      : '拖曳黃色虛線或紅色圓點';
    document.getElementById('mirror-case-tag').textContent = caseTag;
    document.getElementById('mirror-case-title').textContent = caseTitle;
    document.getElementById('mirror-case-description').textContent = caseDescription;
    document.getElementById('mirror-u-value').textContent = u.toFixed(2) + ' f';
    document.getElementById('mirror-v-value').textContent = vText;
    document.getElementById('mirror-range-value').value = u.toFixed(2) + ' f';
    slider.value = String(u);
    presets.forEach(button => button.classList.toggle('active', Number(button.dataset.mirrorU) === u));

    // The same mirror equation gives a line through (f, f).
    const slope = 1 - u;
    const left = -3.28;
    const right = 5.08;
    const guide = segment(x(left), y(1 + slope * (left - 1)), x(right), y(1 + slope * (right - 1)), 'graph-guide');
    const hit = segment(x(left), y(1 + slope * (left - 1)), x(right), y(1 + slope * (right - 1)), 'graph-guide-hit' + (dragging ? ' dragging' : ''), 'id="mirror-drag-line"');
    const object = segment(x(0), y(0), x(0), y(u), 'graph-object', 'marker-end="url(#mirror-object-arrow)"');
    const image = u === 1 ? '' : segment(x(0), y(0), x(v), y(0), 'graph-image', 'marker-end="url(#mirror-image-arrow)"');
    const imageOffscreen = u === 1
      ? element('text', { x: x(2.5), y: y(0) - 18, class: 'graph-annotation' }, 'v → ∞')
      : v > 5.08 || v < -3.25
        ? element('text', { x: v > 0 ? 886 : 55, y: y(0) - 18, class: 'graph-annotation' }, v > 0 ? 'v → 畫面外' : '← v 畫面外')
        : '';
    const snapRing = snapped
      ? element('circle', { cx: x(0), cy: y(u), r: 17, fill: 'none', stroke: '#ff8f9d', 'stroke-width': 2, opacity: .4 })
      : '';
    dynamicLayer.innerHTML = `<g clip-path="url(#mirror-clip)">${guide}${hit}${object}${image}</g>${snapRing}${element('circle', { id: 'mirror-drag-handle', cx: x(0), cy: y(u), r: 11, class: 'graph-handle' })}${imageOffscreen}${element('circle', { cx: x(1), cy: y(1), r: 6, class: 'graph-focus-dot' })}`;
  }

  function setU(value, snap = true, syncMain = true) {
    let next = Math.max(.4, Math.min(4, Math.round(value * 100) / 100));
    if (snap) {
      if (Math.abs(next - 1) <= .06) next = 1;
      else if (Math.abs(next - 2) <= .06) next = 2;
    }
    u = next;
    draw();
    if (syncMain && opticsSelect.value === 'concave-mirror') {
      mainSlider.value = String(Math.round(u * 100));
      mainSlider.dispatchEvent(new Event('input'));
    }
  }

  slider.addEventListener('input', event => setU(Number(event.target.value)));
  slider.addEventListener('keydown', event => {
    const step = {
      ArrowLeft: -.01, ArrowDown: -.01, ArrowRight: .01, ArrowUp: .01,
      PageDown: -.1, PageUp: .1
    }[event.key];
    if (step === undefined) return;
    event.preventDefault();
    setU(u + step, false);
  });
  presets.forEach(button => button.addEventListener('click', () => setU(Number(button.dataset.mirrorU))));

  function svgPoint(event) {
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  }
  svg.addEventListener('pointerdown', event => {
    if (!event.target.closest('#mirror-drag-line, #mirror-drag-handle')) return;
    dragging = true;
    dragStartY = svgPoint(event).y;
    dragStartU = u;
    svg.setPointerCapture(event.pointerId);
    draw();
  });
  svg.addEventListener('pointermove', event => {
    if (dragging) setU(dragStartU + (dragStartY - svgPoint(event).y) / SCALE);
  });
  const endDrag = () => {
    if (dragging) {
      dragging = false;
      draw();
    }
  };
  svg.addEventListener('pointerup', endDrag);
  svg.addEventListener('pointercancel', endDrag);
  window.mirrorGraph = { setDistance: value => setU(value, false, false) };
  setU(Number(mainSlider.value) / 100, false, false);
})();
