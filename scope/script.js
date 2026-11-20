(() => {
  'use strict';

  const defaults = { mode: 'micro', microRatio: 0.78, offset: 0 };
  const state = { ...defaults, vision: 'myopia', accommodation: 0 };
  const svg = document.getElementById('ray-diagram');
  const tabs = [...document.querySelectorAll('.mode-tab')];
  const colors = ['#f3a766', '#7bdfca', '#f2a6af'];
  const $ = (id) => document.getElementById(id);
  const fmt = (n, digits = 1) => Number(n).toFixed(digits).replace(/\.0$/, '');
  let verticalScale = 1.55;
  const yScreen = (y) => 340 - verticalScale * y;
  const safe = (n) => Number(n).toFixed(2);

  function horizontalPlot(spacing, fo, fe) {
    const left = Math.min(-2 * fo, spacing - 2 * fe);
    const right = Math.max(2 * fo, spacing + 2 * fe);
    const scale = 880 / (right - left);
    return { x: (world) => 110 + (world - left) * scale, toWorld: (pixels) => pixels / scale };
  }

  function segment(x1, y1, x2, y2, color, dashed = false, width = 3) {
    return `<line x1="${safe(x1)}" y1="${safe(yScreen(y1))}" x2="${safe(x2)}" y2="${safe(yScreen(y2))}" stroke="${color}" stroke-width="${width}" ${dashed ? 'stroke-dasharray="8 7" opacity=".6"' : 'opacity=".95"'} stroke-linecap="round"/>`;
  }

  function textLabel(x, y, content, color = '#d4e6ec', size = 16, anchor = 'middle') {
    return `<text x="${safe(x)}" y="${safe(y)}" fill="${color}" font-size="${size}" text-anchor="${anchor}" font-family="Noto Sans TC, sans-serif">${content}</text>`;
  }

  function arrow(x, yValue, color, label, height = 0) {
    const base = yScreen(0), tip = yScreen(yValue);
    const visibleTip = Math.max(58, Math.min(610, tip));
    const pointingUp = visibleTip < base;
    return `<line x1="${safe(x)}" y1="${safe(base)}" x2="${safe(x)}" y2="${safe(visibleTip)}" stroke="${color}" stroke-width="4"/><path d="M ${safe(x - 6)} ${safe(visibleTip + (pointingUp ? 9 : -9))} L ${safe(x)} ${safe(visibleTip)} L ${safe(x + 6)} ${safe(visibleTip + (pointingUp ? 9 : -9))}" fill="none" stroke="${color}" stroke-width="4" stroke-linejoin="round"/>${textLabel(x, visibleTip + (pointingUp ? -15 : 25) + height, label, color, 14)}`;
  }

  function lens(x, kind) {
    const shape = kind === 'convex'
      ? `<path d="M ${safe(x)} 184 Q ${safe(x - 24)} 340 ${safe(x)} 496 Q ${safe(x + 24)} 340 ${safe(x)} 184" fill="#8bd9cf20" stroke="#a8e4dc" stroke-width="3"/>`
      : `<path d="M ${safe(x - 11)} 184 Q ${safe(x + 4)} 340 ${safe(x - 11)} 496 L ${safe(x + 11)} 496 Q ${safe(x - 4)} 340 ${safe(x + 11)} 184 Z" fill="#e9b7a51b" stroke="#f2bdaa" stroke-width="3"/>`;
    return `<g>${shape}<line x1="${safe(x)}" y1="316" x2="${safe(x)}" y2="364" stroke="#ffffff88"/></g>`;
  }

  function optics(x, spacing, fo, fe) {
    const eyeKind = fe < 0 ? 'concave' : 'convex';
    const near = x(spacing) - x(0) < 140;
    let out = lens(x(0), 'convex') + lens(x(spacing), eyeKind);
    out += textLabel(x(0) - (near ? 8 : 0), 660, '物鏡 · 凸透鏡', '#d5e6eb', 16, near ? 'end' : 'middle');
    out += textLabel(x(spacing) + (near ? 8 : 0), 660, `目鏡 · ${fe < 0 ? '凹' : '凸'}透鏡`, '#d5e6eb', 16, near ? 'start' : 'middle');

    [
      { center: 0, focal: fo, symbol: 'fₒ', labelY: 309, color: '#b0e9f9' },
      { center: spacing, focal: Math.abs(fe), symbol: 'fₑ', labelY: 281, color: '#f9cdb2' }
    ].forEach(({ center, focal, symbol, labelY, color }) => {
      out += `<g class="focal-marks" fill="${color}">`;
      [-2, -1, 1, 2].forEach((multiple) => {
        const position = safe(x(center + multiple * focal));
        const label = Math.abs(multiple) === 1 ? symbol : `2${symbol}`;
        out += `<path d="M ${position} ${labelY + 6} V 345" stroke="${color}" stroke-opacity=".5" fill="none"/>
          <circle cx="${position}" cy="340" r="3"/>
          <text x="${position}" y="${labelY}" text-anchor="middle" font-size="17" font-weight="700"
            stroke="#17364a" stroke-width="4" paint-order="stroke">${label}</text>`;
      });
      out += '</g>';
    });
    return out;
  }

  function frame() {
    return `<title id="diagram-title">雙透鏡成像光路</title><desc id="diagram-desc"></desc><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-opacity=".055" stroke-width="1"/></pattern><clipPath id="plot-clip"><rect x="35" y="25" width="1030" height="615"/></clipPath></defs><rect x="0" y="0" width="1100" height="680" fill="url(#grid)"/><line x1="45" y1="340" x2="1055" y2="340" stroke="#97b7c5" stroke-opacity=".5" stroke-width="1.5" stroke-dasharray="7 7"/>${textLabel(49, 330, '主光軸', '#9fb9c5', 13, 'start')}`;
  }

  function renderMicroscope() {
    const fo = 52, fe = 90, u = fo * 1.35;
    const v1 = 1 / (1 / fo - 1 / u);
    const u2 = fe * state.microRatio;
    const d = v1 + u2;
    const { x, toWorld } = horizontalPlot(d, fo, fe);
    const sourceY = 9, imageY = -v1 / u * sourceY;
    const rayStarts = [-18, 0, 18];
    const v2 = Math.abs(u2 - fe) < 0.2 ? Infinity : 1 / (1 / fe - 1 / u2);
    const finalY = Number.isFinite(v2) ? -v2 / u2 * imageY : Infinity;
    const virtual = v2 < 0;
    const finalInFrame = virtual && x(d + v2) > 40 && x(d + v2) < 1060 && Math.abs(finalY) <= 350;
    const lensHeights = rayStarts.map((lensY) => Math.abs(lensY + ((lensY - sourceY) / u - lensY / fo) * d));
    const rayHeights = rayStarts.map((lensY) => {
      const afterObject = (lensY - sourceY) / u - lensY / fo;
      const atEye = lensY + afterObject * d;
      const afterEyepiece = afterObject - atEye / fe;
      return Math.abs(atEye + afterEyepiece * toWorld(1050 - x(d)));
    }).filter((height) => height <= 450);
    verticalScale = Math.min(1.55, 145 / Math.max(...lensHeights), 260 / Math.max(Math.abs(imageY), finalInFrame ? Math.abs(finalY) : 0, ...rayHeights));
    let out = frame();
    out += `<g clip-path="url(#plot-clip)">`;
    rayStarts.forEach((lensY, index) => {
      const slopeIn = (lensY - sourceY) / u;
      const slopeAfterObj = slopeIn - lensY / fo;
      const atEye = lensY + slopeAfterObj * d;
      const slopeOut = slopeAfterObj - atEye / fe;
      out += segment(x(-u), sourceY, x(0), lensY, colors[index]);
      out += segment(x(0), lensY, x(d), atEye, colors[index]);
      out += segment(x(d), atEye, 1050, atEye + slopeOut * toWorld(1050 - x(d)), colors[index]);
      if (virtual && x(d + v2) > 35 && x(d + v2) < x(d)) {
        out += segment(x(d), atEye, x(d + v2), finalY, colors[index], true, 1.7);
      }
    });
    out += `</g>${optics(x, d, fo, fe)}`;
    out += arrow(x(-u), sourceY, '#7cb4fb', '標本');
    out += arrow(x(v1), imageY, '#f6d477', '中間實像');
    if (finalInFrame) {
      out += arrow(x(d + v2), finalY, '#b9a7fb', '最終虛像');
    } else if (virtual) {
      out += textLabel(1020, 62, '虛像位於圖外', '#cdbffd', 14, 'end');
    } else if (!Number.isFinite(v2)) {
      out += textLabel(1019, 62, '出射光近平行 · 像在無限遠', '#cdbffd', 14, 'end');
    } else {
      out += textLabel(1019, 62, '目鏡後形成實像', '#f6d477', 14, 'end');
    }
    out += textLabel(x(v1), 52, '① 物鏡後實際交會', '#f6d477', 15);
    svg.innerHTML = out;
    $('micro-focus-value').textContent = `${fmt(state.microRatio, 2)} fₑ`;
    $('diagram-desc').textContent = `複式顯微鏡：標本在物鏡焦點外，物鏡後 ${fmt(v1)} 相對單位形成倒立中間實像。中間像在目鏡焦距的 ${fmt(state.microRatio, 2)} 倍處。`;
    $('fact-one-label').textContent = '物鏡形成';
    $('fact-one').textContent = '倒立 · 實像';
    $('fact-two-label').textContent = '目鏡形成';
    if (virtual) {
      $('result-title').textContent = '物鏡成實像，目鏡再放大觀看';
      $('result-description').textContent = '中間實像落在目鏡焦點內；目鏡後光線發散，反向延長線指向倒立的最終虛像。圖外的像仍可由光線方向判讀。';
      $('fact-two').textContent = '倒立 · 虛像';
    } else if (!Number.isFinite(v2)) {
      $('result-title').textContent = '中間像恰在目鏡焦點';
      $('result-description').textContent = '經目鏡後光線平行，眼睛可放鬆觀看；最終像位於無限遠。';
      $('fact-two').textContent = '無限遠';
    } else {
      $('result-title').textContent = '中間像已移到目鏡焦點外';
      $('result-description').textContent = '此時目鏡後光線再次實際交會，形成實像；這不是複式顯微鏡通常用眼睛觀看的配置。';
      $('fact-two').textContent = '實像';
    }
  }

  function renderTelescope() {
    const galileo = state.mode === 'galileo';
    const fo = 200, fe = galileo ? -70 : 70;
    const offset = state.offset;
    const normalD = fo + fe, d = normalD + offset;
    const { x, toWorld } = horizontalPlot(d, fo, Math.abs(fe));
    const alpha = -0.085;
    const imageY = alpha * fo;
    const virtual = offset < 0;
    const atInfinity = offset === 0;
    const orientation = galileo ? '正立' : '倒立';
    const virtualLabel = `${orientation}虛像`;
    // The signed eyepiece object distance is d - fo, negative for Galileo.
    const virtualX = virtual ? x(d + fe * (fe + offset) / offset) : null;
    const virtualY = virtual ? -fe / offset * imageY : 0;
    const virtualInFrame = virtual && virtualX >= 90;
    const virtualColor = '#cdbffd';
    const rayStarts = [-28, 0, 28];
    const lensHeights = rayStarts.map((lensY) => Math.abs(lensY + (alpha - lensY / fo) * d));
    const rayHeights = rayStarts.map((lensY) => {
      const afterObject = alpha - lensY / fo;
      const atEye = lensY + afterObject * d;
      const afterEyepiece = afterObject - atEye / fe;
      return Math.abs(atEye + afterEyepiece * toWorld(1050 - x(d)));
    }).filter((height) => height <= 450);
    verticalScale = Math.min(3, 145 / Math.max(...lensHeights), 260 / Math.max(Math.abs(imageY), virtualInFrame ? Math.abs(virtualY) : 0, ...rayHeights));
    let out = frame();
    out += `<g clip-path="url(#plot-clip)">`;
    rayStarts.forEach((lensY, index) => {
      const inStart = lensY + alpha * toWorld(65 - x(0));
      const slopeAfterObj = alpha - lensY / fo;
      const atEye = lensY + slopeAfterObj * d;
      const slopeOut = slopeAfterObj - atEye / fe;
      out += segment(65, inStart, x(0), lensY, colors[index]);
      out += segment(x(0), lensY, x(d), atEye, colors[index]);
      out += segment(x(d), atEye, 1050, atEye + slopeOut * toWorld(1050 - x(d)), colors[index]);
      if (galileo) out += segment(x(d), atEye, x(fo), imageY, '#b9cdd5', true, 1.5);
      if (virtual) {
        const endX = Math.max(35, virtualX);
        out += segment(x(d), atEye, endX, atEye + slopeOut * toWorld(endX - x(d)), colors[index], true, 1.7);
      }
    });
    out += `</g>${optics(x, d, fo, fe)}`;
    if (galileo) {
      out += `<circle cx="${safe(x(fo))}" cy="${safe(yScreen(imageY))}" r="5" fill="#bfd0d7"/>`;
      out += textLabel(x(fo), 54, '單用物鏡時的成像位置', '#bfd0d7', 14);
      out += textLabel(x(fo), 76, '實際光線已被目鏡截住', '#bfd0d7', 13);
    } else {
      out += arrow(x(fo), imageY, '#f6d477', '倒立中間實像');
      out += textLabel(x(fo), 55, '① 物鏡後實際交會', '#f6d477', 15);
    }
    if (virtualInFrame) {
      out += arrow(virtualX, virtualY, virtualColor, `最終${virtualLabel}`, galileo ? 0 : 10);
    } else if (atInfinity || virtual) {
      const viewArrow = galileo ? 'M 429 572 V 540 M 421 548 L 429 540 L 437 548' : 'M 429 546 V 578 M 421 570 L 429 578 L 437 570';
      out += `<g id="eyepiece-view">
          <rect x="385" y="506" width="330" height="106" rx="12" fill="#152e43" stroke="#645e88"/>
          <circle cx="429" cy="559" r="31" fill="#222d47" stroke="#8f82b5"/>
          <path d="M 406 559 H 452" stroke="#8f82b5" stroke-dasharray="3 4"/>
          <path d="${viewArrow}" fill="none"
            stroke="${virtualColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          ${textLabel(476, 548, '目鏡視野示意', '#b7d3de', 15, 'start')}
          ${textLabel(476, 578, `${virtualLabel} · 位於${atInfinity ? '無限遠' : '圖外'}`, virtualColor, 19, 'start')}
        </g>`;
    }
    out += textLabel(85, 76, '遠方景物 → 近似平行入射', '#b7d3de', 14, 'start');
    out += textLabel(1015, 64, atInfinity ? '準焦：平行出射 → 眼睛' : '失焦：出射光不平行', atInfinity ? '#9ce7d5' : '#f6c793', 14, 'end');
    svg.innerHTML = out;
    $('focus-value').textContent = `${d} 單位`;
    $('focus-offset').setAttribute('aria-valuetext', `${d} 單位${atInfinity ? '，遠物準焦' : ''}`);
    const imageNote = atInfinity
      ? `目鏡出射光平行，${virtualLabel}位於無限遠。`
      : virtual ? `目鏡出射光發散，反向延長線指向${virtualLabel}${virtualInFrame ? '。' : '，像在圖外。'}`
        : '目鏡出射光會聚，在目鏡後方形成實像。';
    $('diagram-desc').textContent = `${galileo ? '伽利略式' : '克卜勒式'}望遠鏡，兩鏡距離 ${d} 單位。${imageNote}`;
    $('fact-one-label').textContent = '最終像';
    $('fact-one').textContent = atInfinity ? `${orientation} · 無限遠` : virtual ? virtualLabel : '實像';
    $('fact-two-label').textContent = '角放大率大小';
    $('fact-two').textContent = atInfinity ? `約 ${fmt(fo / Math.abs(fe), 2)}×` : '失焦中';
    $('result-title').textContent = atInfinity ? '遠物準焦，出射光平行' : virtual ? '鏡筒縮短，出射光發散' : '鏡筒拉長，出射光會聚';
    const typeText = galileo
      ? '凹目鏡在物鏡光線會聚前截住光束。'
      : '物鏡先形成倒立的中間實像。';
    $('result-description').textContent = `${typeText}${imageNote} 準焦鏡距為 ${normalD} 單位（物鏡焦距${galileo ? '減去' : '加上'}目鏡焦距大小）。`;
  }

  function eyeDiagram(myopia, corrected, accommodation) {
    const glassesX = 244, eyeX = 410, retinaX = 624;
    const eyeDistance = retinaX - eyeX;
    const gap = eyeX - glassesX;
    const relaxedPower = 1 / (myopia ? 130 : 287);
    const retinalPower = 1 / eyeDistance;
    const farPoint = myopia && !corrected;
    // Divergent light from the myopic far point focuses on the retina at rest.
    const incomingVergence = farPoint ? relaxedPower - retinalPower : 0;
    const accommodationRange = myopia ? 0.0018 : retinalPower - relaxedPower;
    const eyePower = relaxedPower + accommodationRange * accommodation;
    const imageDistance = corrected ? eyeDistance : 1 / (eyePower - incomingVergence);
    const focusX = eyeX + imageDistance;
    const onRetina = Math.abs(focusX - retinaX) < 1e-8;
    // Solve for the glasses' outgoing slope that puts the focus on the retina.
    const requiredSlopeAtEye = eyePower - retinalPower;
    const rayHeightFactor = corrected ? 1 / (1 - gap * requiredSlopeAtEye) : 1;
    const focusColor = onRetina ? '#91e5cd' : '#f9d091';
    const lensColor = '#a8e4dc';
    const lensName = myopia ? '凹透鏡' : '凸透鏡';
    const afterRetina = !onRetina && focusX > retinaX;
    const location = onRetina ? '視網膜上' : afterRetina ? '視網膜後' : '視網膜前';
    const focusLabel = onRetina ? '成像在視網膜上' : `焦點在${location}`;
    const normalCurve = 23;
    const curve = myopia ? normalCurve + 11 + 22 * accommodation : normalCurve - 10 * (1 - accommodation);
    const lensPath = myopia
      ? 'M 236 -55 Q 243 0 236 55 H 252 Q 245 0 252 -55 Z'
      : 'M 244 -55 Q 220 0 244 55 Q 268 0 244 -55 Z';
    let out = `<g class="eye-panel" transform="translate(0 ${corrected ? 428 : 149})">
      <rect x="20" y="-128" width="720" height="254" rx="16" fill="#112c40" stroke="#37566a"/>
      ${textLabel(44, -91, corrected ? `戴上${lensName}後` : '未戴矯正鏡片', '#e4f1f4', 23, 'start')}
      ${textLabel(716, -91, corrected ? '放鬆調節' : `調節量 ${Math.round(accommodation * 100)}%`, '#b7d3de', 16, 'end')}
      <path d="M 356 0 C 357 -46 406 -75 478 -78 C 558 -82 642 -60 642 0 C 642 60 558 82 478 78 C 406 75 357 46 356 0 Z" fill="#1b4258" stroke="#578097" stroke-width="2"/>
      <path d="M 44 0 H 716" stroke="#83a8bb" stroke-opacity=".55" stroke-dasharray="5 6"/>
      <path class="eye-lens" d="M 410 -53 Q ${safe(eyeX - curve)} 0 410 53 Q ${safe(eyeX + curve)} 0 410 -53 Z" fill="#8bd9cf1a" stroke="${lensColor}" stroke-width="2"/>
      <path d="M 624 -44 V 44" stroke="#9bd6f3" stroke-width="3" stroke-linecap="round"/>
      ${textLabel(44, 73, farPoint ? '近視遠點的發散光 →' : '遠方平行光 →', '#b7d3de', 16, 'start')}
      ${textLabel(410, 106, '眼球等效透鏡', '#b7d3de', 16)}
      ${textLabel(624, 106, '視網膜', '#9bd6f3', 17)}
      ${corrected ? `<path d="${lensPath}" fill="#8bd9cf24" stroke="${lensColor}" stroke-width="2"/>
        ${textLabel(glassesX, 106, lensName, lensColor, 17)}` : ''}`;
    [-25, 0, 25].forEach((y, index) => {
      const atEye = y * rayHeightFactor;
      const atRetina = atEye * (1 - eyeDistance / imageDistance);
      const incoming = farPoint ? `M ${safe(eyeX - 1 / incomingVergence)} 0 L ${eyeX} ${y}`
        : corrected ? `M 48 ${y} H ${glassesX} L ${eyeX} ${safe(atEye)}` : `M 48 ${y} H ${eyeX}`;
      const color = colors[index];
      out += `<path class="eye-ray" d="${incoming} L ${retinaX} ${safe(atRetina)}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>`;
      if (afterRetina) {
        out += `<path class="eye-extension" d="M ${retinaX} ${safe(atRetina)} L ${focusX} 0" fill="none" stroke="${color}" stroke-width="2.5" stroke-dasharray="6 5"/>`;
      }
    });
    const labelX = afterRetina ? 717 : focusX;
    out += `<path d="M ${focusX} 9 V 55" stroke="${focusColor}" stroke-opacity=".7"/>
      <circle class="eye-focus" cx="${focusX}" cy="0" r="6" fill="${focusColor}" stroke="#112c40" stroke-width="2"/>
      ${textLabel(labelX, 76, focusLabel, focusColor, 18, afterRetina ? 'end' : 'middle')}</g>`;
    return { markup: out, location, afterRetina };
  }

  function renderEye() {
    const myopia = state.vision === 'myopia';
    const condition = myopia ? '近視' : '遠視';
    const bare = eyeDiagram(myopia, false, state.accommodation / 100);
    const corrected = eyeDiagram(myopia, true, 0);
    const focusText = myopia
      ? '上圖的物體位於近視眼的遠點，也就是放鬆時能看清楚的最遠位置。增加調節，焦點從視網膜往前移。'
      : '上圖觀察遠方物體。放鬆時水晶體較薄，焦點在視網膜後方。增加調節，水晶體逐漸增厚，直到焦點落在視網膜上，此時以正常厚度示意。';
    const correctionText = myopia ? '下圖以較厚的水晶體示意較強的屈光力。凹透鏡讓遠方平行光先發散，最後聚焦在視網膜上。'
      : '下圖的凸透鏡讓遠方平行光先會聚，最後聚焦在視網膜上。';
    const explanation = `${focusText}${correctionText}`;
    svg.innerHTML = `<title id="diagram-title">${condition}的睫狀肌調節與鏡片矯正光路</title><desc id="diagram-desc"></desc>${bare.markup}${corrected.markup}`;
    $('accommodation-value').textContent = `${state.accommodation}%`;
    $('accommodation').setAttribute('aria-valuetext', `${state.accommodation}% 調節量`);
    $('diagram-desc').textContent = `未戴鏡片的焦點目前在${bare.location}。${explanation}`;
    $('diagram-caption').textContent = `${condition} / 調節與矯正`;
    $('eye-dashes').hidden = !bare.afterRetina;
    $('result-title').textContent = myopia ? '近視用凹透鏡矯正' : '遠視用凸透鏡矯正';
    $('result-description').textContent = explanation;
    $('fact-one-label').textContent = '未戴鏡片的焦點';
    $('fact-one').textContent = bare.location;
    $('fact-two-label').textContent = '矯正後的焦點';
    $('fact-two').textContent = '視網膜上';
  }

  function render() {
    const micro = state.mode === 'micro';
    const eye = state.mode === 'eye';
    const names = { micro: '複式顯微鏡', kepler: '克卜勒式望遠鏡', galileo: '伽利略式望遠鏡', eye: '眼睛與視力矯正' };
    const kickers = { micro: '近物 · 兩次成像', kepler: '遠物 · 兩片凸透鏡', galileo: '遠物 · 凸物鏡＋凹目鏡', eye: '睫狀肌調節 · 鏡片矯正' };
    const descriptions = {
      micro: '物鏡先形成放大的倒立實像，目鏡再像放大鏡一樣觀看它。',
      kepler: '兩片凸透鏡：中間實像真正在鏡內形成，遠物準焦時出射光平行。',
      galileo: '凸物鏡搭配凹目鏡：光線尚未交會便到達目鏡，遠物準焦時可看見正立虛像。',
      eye: '比較戴上鏡片前後，光線如何改變方向，以及焦點是否落在視網膜上。'
    };
    tabs.forEach((tab) => {
      const active = tab.dataset.mode === state.mode;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    $('mode-panel').setAttribute('aria-labelledby', `tab-${state.mode}`);
    $('mode-panel').classList.toggle('eye-mode', eye);
    $('micro-controls').hidden = !micro;
    $('telescope-controls').hidden = micro || eye;
    $('eye-controls').hidden = !eye;
    $('reset').hidden = !micro;
    $('instrument-model').hidden = eye;
    $('eye-model').hidden = !eye;
    $('instrument-dashes').hidden = eye;
    $('lens-key').hidden = eye;
    $('eye-dashes').hidden = true;
    svg.setAttribute('viewBox', eye ? '0 0 760 575' : '0 0 1100 680');
    $('mode-title').textContent = names[state.mode];
    $('mode-kicker').textContent = kickers[state.mode];
    $('mode-description').textContent = descriptions[state.mode];
    $('diagram-caption').textContent = `${names[state.mode]} / ${micro ? '近物' : '遠物'}`;
    $('control-help').textContent = eye ? '滑桿只改變上圖。睫狀肌收縮時，水晶體變凸，焦點往前移。下圖以戴鏡片且放鬆調節為對照。' :
      micro ? '標本固定在物鏡前方 1.35 fₒ。fₑ 是目鏡焦距。' :
        '鏡筒距離是物鏡到目鏡的距離。物鏡焦距 200，目鏡焦距大小 70，皆為相對單位。';
    if (eye) renderEye();
    else if (micro) renderMicroscope();
    else renderTelescope();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => { state.mode = tab.dataset.mode; state.offset = 0; $('focus-offset').value = 0; render(); });
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const step = event.key === 'ArrowRight' ? 1 : -1;
      const next = event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs.at(-1) : tabs[(index + step + tabs.length) % tabs.length];
      next.click();
      next.focus();
    });
  });
  const ranges = [['micro-focus', 'microRatio'], ['focus-offset', 'offset']];
  ranges.forEach(([id, key]) => $(id).addEventListener('input', (event) => { state[key] = Number(event.target.value); render(); }));
  $('autofocus').addEventListener('click', () => { state.offset = 0; $('focus-offset').value = 0; render(); });
  $('eye-controls').addEventListener('change', (event) => {
    if (event.target.name !== 'vision') return;
    state.vision = event.target.value;
    renderEye();
  });
  $('accommodation').addEventListener('input', (event) => {
    state.accommodation = Number(event.target.value);
    renderEye();
  });
  $('reset').addEventListener('click', () => { const mode = state.mode; Object.assign(state, defaults, { mode }); ranges.forEach(([id, key]) => { $(id).value = state[key]; }); render(); });
  render();
})();
