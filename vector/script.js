// 基礎向量互動教學 - script.js
// 注意：此檔案使用 Pointer Events（統一處理滑鼠與觸控），並在關鍵位置加上註解說明碰撞偵測與繪圖流程。

// --- 介面元素 ---
const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
const tabs = document.querySelectorAll('.tab');
const unitTitle = document.getElementById('unit-title');
const unitControls = document.getElementById('unit-controls');
const valuesBox = document.getElementById('values');

// 高解析度畫布設定
function resizeCanvas(){
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * devicePixelRatio);
  canvas.height = Math.floor(rect.height * devicePixelRatio);
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// 世界座標系統設定：原點放在畫布中心
let grid = { spacing: 30, // 每格像素數
             originX: 0, originY: 0 };
function updateOrigin(){
  grid.originX = canvas.clientWidth/2;
  grid.originY = canvas.clientHeight/2;
}
updateOrigin();

// 向量資料結構（以畫布座標表示，原點為世界原點）
let unit = 1;
let vecV = {x: 4, y: -3}; // 單元1：向量 v（以格數為單位）
let vecA = {x: 5, y: 1};
let vecB = {x: 2, y: 4};
let baseA = {x:0,y:0}; // for future extension

// 拖曳狀態
let dragTarget = null; // 'v','a','b' 或 null
let dragOffset = {x:0,y:0};

// Utility: 轉換世界座標(格數) <-> 畫布像素
function worldToScreen(wx, wy){
  return {x: grid.originX + wx*grid.spacing, y: grid.originY - wy*grid.spacing};
}
function screenToWorld(sx, sy){
  return {x: (sx - grid.originX)/grid.spacing, y: (grid.originY - sy)/grid.spacing};
}

// 碰撞偵測：判斷是否點到從原點到 vec 的箭頭線段本身（包含箭頭區域）
function hitTestVectorLine(eventX, eventY, vec){
  const p1 = worldToScreen(0, 0);
  const p2 = worldToScreen(vec.x, vec.y);
  const dx = p2.x - p1.x, dy = p2.y - p1.y;
  const len2 = dx*dx + dy*dy;
  if(len2 < 1) return false;
  // 點到線段的最近距離（限制在線段範圍內）
  let t = ((eventX - p1.x)*dx + (eventY - p1.y)*dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = p1.x + t*dx, cy = p1.y + t*dy;
  const ddx = eventX - cx, ddy = eventY - cy;
  // 寬鬆一點的容差，讓使用者容易點到
  return (ddx*ddx + ddy*ddy) <= 225; // 15px 內
}

// Draw Grid and Axes
function drawGrid(){
  const w = canvas.clientWidth, h = canvas.clientHeight;
  ctx.clearRect(0,0,w,h);

  // background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0,0,w,h);

  // minor grid lines
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--grid').trim();
  ctx.lineWidth = 1;
  ctx.beginPath();
  for(let x = grid.originX % grid.spacing; x < w; x += grid.spacing){
    ctx.moveTo(x,0); ctx.lineTo(x,h);
  }
  for(let y = grid.originY % grid.spacing; y < h; y += grid.spacing){
    ctx.moveTo(0,y); ctx.lineTo(w,y);
  }
  ctx.stroke();

  // axes
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--axis').trim();
  ctx.lineWidth = 2;
  // X axis
  ctx.beginPath();
  ctx.moveTo(0, grid.originY);
  ctx.lineTo(w, grid.originY);
  ctx.stroke();
  // arrow
  ctx.beginPath();
  ctx.moveTo(w-14, grid.originY-8);
  ctx.lineTo(w, grid.originY);
  ctx.lineTo(w-14, grid.originY+8);
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--axis').trim();
  ctx.fill();
  // Y axis
  ctx.beginPath();
  ctx.moveTo(grid.originX, 0);
  ctx.lineTo(grid.originX, h);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(grid.originX-8, 14);
  ctx.lineTo(grid.originX, 0);
  ctx.lineTo(grid.originX+8, 14);
  ctx.fill();
}

// Draw arrow helper
function drawArrow(wx1, wy1, wx2, wy2, color, width=3, drawHead=true){
  const p1 = worldToScreen(wx1, wy1);
  const p2 = worldToScreen(wx2, wy2);
  const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

  // line
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();

  if(drawHead){
    // arrowhead
    const headlen = 16;
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(p2.x, p2.y);
    ctx.lineTo(p2.x - headlen*Math.cos(angle - Math.PI/6), p2.y - headlen*Math.sin(angle - Math.PI/6));
    ctx.lineTo(p2.x - headlen*Math.cos(angle + Math.PI/6), p2.y - headlen*Math.sin(angle + Math.PI/6));
    ctx.closePath();
    ctx.fill();
  }
}

// Draw dashed arrow helper（線身為虛線，箭頭仍為實心三角形）
function drawDashedArrow(wx1, wy1, wx2, wy2, color, width=3){
  const p1 = worldToScreen(wx1, wy1);
  const p2 = worldToScreen(wx2, wy2);
  const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

  // dashed line
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash([6, 6]);
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // arrowhead (solid, 同 drawArrow)
  const headlen = 16;
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.moveTo(p2.x, p2.y);
  ctx.lineTo(p2.x - headlen*Math.cos(angle - Math.PI/6), p2.y - headlen*Math.sin(angle - Math.PI/6));
  ctx.lineTo(p2.x - headlen*Math.cos(angle + Math.PI/6), p2.y - headlen*Math.sin(angle + Math.PI/6));
  ctx.closePath();
  ctx.fill();
}

// 主繪圖迴圈
function render(){
  updateOrigin();
  drawGrid();

  // 根據 unit 畫不同內容
  if(unit === 1){
    // 單元1：向量 v
    drawArrow(0,0, vecV.x, vecV.y, getComputedStyle(document.documentElement).getPropertyValue('--vecA').trim(), 4);

    // 顯示分量虛線（投影到 X 與 Y）
    const p = worldToScreen(vecV.x, vecV.y);
    const px = worldToScreen(vecV.x, 0);
    const py = worldToScreen(0, vecV.y);
    ctx.strokeStyle = '#94a3b8';
    ctx.setLineDash([6,6]);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y); ctx.lineTo(px.x, px.y);
    ctx.moveTo(p.x, p.y); ctx.lineTo(py.x, py.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // (端點圓形已移除,讓整個箭頭都可拖曳)

    // update side panel values
    const len = Math.hypot(vecV.x, vecV.y);
    // 顯示座標以整數格四捨五入，但向量長度仍保留小數
    valuesBox.innerHTML = `坐標 (x, y): (${Math.round(vecV.x)}, ${Math.round(vecV.y)})\n|v| = sqrt(x^2 + y^2) = ${len.toFixed(3)}`;
  }

  else if(unit === 2){
    // 單元2：向量 a 和 b
    // Draw vectors at origin
    drawArrow(0,0, vecA.x, vecA.y, getComputedStyle(document.documentElement).getPropertyValue('--vecA').trim(), 4);
    drawArrow(0,0, vecB.x, vecB.y, getComputedStyle(document.documentElement).getPropertyValue('--vecB').trim(), 4);

    // (端點圓形已移除,讓整個箭頭都可拖曳)

    // read method radio (使用 :checked 來判斷目前選項,因為 .value 永遠回傳 HTML 屬性初始值)
    const checked = document.querySelector('input[name="add-mode"]:checked');
    const mode = checked ? checked.value : 'tail';
    const colorA = getComputedStyle(document.documentElement).getPropertyValue('--vecA').trim();   // 藍
    const colorB = getComputedStyle(document.documentElement).getPropertyValue('--vecB').trim();   // 綠
    const colorR = getComputedStyle(document.documentElement).getPropertyValue('--result').trim(); // 紅
    if(mode === 'tail'){
      // 首尾相接法：b 的複製品從 a 的頭部開始（綠色虛線），再加總向量從原點到 a+b（紅色實線）
      drawDashedArrow(vecA.x, vecA.y, vecA.x + vecB.x, vecA.y + vecB.y, colorB, 3);
      drawArrow(0,0, vecA.x + vecB.x, vecA.y + vecB.y, colorR, 4);
    } else {
      // 平行四邊形法
      // 對角線（加總向量）：紅色實線
      drawArrow(0,0, vecA.x + vecB.x, vecA.y + vecB.y, colorR, 4);
      // 兩條輔助虛線形成平行四邊形
      // 從 a 末端畫一條平行於 b 的線（綠色虛線，代表 b 的長度）
      drawDashedArrow(vecA.x, vecA.y, vecA.x + vecB.x, vecA.y + vecB.y, colorB, 3);
      // 從 b 末端畫一條平行於 a 的線（藍色虛線，代表 a 的長度）
      drawDashedArrow(vecB.x, vecB.y, vecB.x + vecA.x, vecB.y + vecA.y, colorA, 3);
    }

    // show formula
    // 座標顯示四捨五入為整數格，合成向量座標也四捨五入
    valuesBox.innerHTML = `a = (${Math.round(vecA.x)}, ${Math.round(vecA.y)})\n b = (${Math.round(vecB.x)}, ${Math.round(vecB.y)})\n a + b = (${Math.round(vecA.x+vecB.x)}, ${Math.round(vecA.y+vecB.y)})`;
  }

  else if(unit === 3){
    // 單元3：內積
    // fix a horizontal to the right (we'll draw it with a fixed length)
    const aFixed = {x:6, y:0};
    drawArrow(0,0, aFixed.x, aFixed.y, getComputedStyle(document.documentElement).getPropertyValue('--vecA').trim(), 4);
    drawArrow(0,0, vecB.x, vecB.y, getComputedStyle(document.documentElement).getPropertyValue('--vecB').trim(), 4);

    // projection of b onto a
    const adotb = aFixed.x*vecB.x + aFixed.y*vecB.y;
    const aLen2 = aFixed.x*aFixed.x + aFixed.y*aFixed.y;
    const projScale = adotb / aLen2;
    const proj = {x: projScale * aFixed.x, y: projScale * aFixed.y};

    // draw perpendicular from b endpoint to a's line
    const bend = worldToScreen(vecB.x, vecB.y);
    const pproj = worldToScreen(proj.x, proj.y);
    ctx.setLineDash([6,6]); ctx.strokeStyle = '#94a3b8';
    ctx.beginPath(); ctx.moveTo(bend.x, bend.y); ctx.lineTo(pproj.x, pproj.y); ctx.stroke(); ctx.setLineDash([]);

    // draw projection segment on a
    drawArrow(0,0, proj.x, proj.y, '#7c3aed', 4); // purple for projection/result

    // angle between a and b
    const angle = Math.acos( Math.max(-1, Math.min(1, adotb / (Math.sqrt(aLen2)*Math.hypot(vecB.x,vecB.y)))) );
    const degrees = (angle*180/Math.PI);

    // sign
    const sign = adotb > 0 ? '正' : (Math.abs(adotb) < 1e-6 ? '0' : '負');

    // 顯示時座標以整數格四捨五入；內積與角度仍保留小數
    valuesBox.innerHTML = `a = (${Math.round(aFixed.x)}, ${Math.round(aFixed.y)})\n b = (${Math.round(vecB.x)}, ${Math.round(vecB.y)})\n a·b = ${adotb.toFixed(3)}\n 夾角 = ${degrees.toFixed(1)}° (${sign})`;
  }

  requestAnimationFrame(render);
}
requestAnimationFrame(render);

// --- UI: Tabs 和控制面板內容 ---
function setActiveTab(n){
  unit = n;
  tabs.forEach(t=>t.classList.toggle('active', Number(t.dataset.unit)===n));
  // update title and controls
  if(n===1){
    unitTitle.innerHTML = `<h2 class="text-lg font-medium">單元一：認識向量與成分</h2><p class="text-sm text-slate-600 mt-1">拖曳箭頭終點即可改變向量。</p>`;
    unitControls.innerHTML = `<div class="control-row"><span class="legend-dot" style="background:var(--vecA)"></span><strong>向量 v</strong></div>`;
  } else if(n===2){
    unitTitle.innerHTML = `<h2 class="text-lg font-medium">單元二：向量的加法</h2><p class="text-sm text-slate-600 mt-1">拖曳 a 或 b，切換繪圖方式。</p>`;
    unitControls.innerHTML = `
      <div class="space-y-2">
        <div class="control-row"><span class="legend-dot" style="background:var(--vecA)"></span><strong>a</strong> <span class="ml-2 legend-dot" style="background:var(--vecB)"></span><strong>b</strong></div>
        <div class="pt-2">
          <label class="inline-flex items-center"><input type="radio" name="add-mode" value="tail" checked class="mr-2">首尾相接法</label>
          <label class="inline-flex items-center ml-3"><input type="radio" name="add-mode" value="para" class="mr-2">平行四邊形法</label>
        </div>
      </div>`;
  } else if(n===3){
    unitTitle.innerHTML = `<h2 class="text-lg font-medium">單元三：向量內積</h2><p class="text-sm text-slate-600 mt-1">拖曳 b，觀察投影與內積變化（a 固定為水平向右）。</p>`;
    unitControls.innerHTML = `<div class="control-row"><span class="legend-dot" style="background:var(--vecA)"></span><strong>a</strong> <span class="ml-2 legend-dot" style="background:var(--vecB)"></span><strong>b</strong></div>`;
  }
}
tabs.forEach(t=>t.addEventListener('click', ()=> setActiveTab(Number(t.dataset.unit))));

// 初始化顯示
setActiveTab(1);

// --- Pointer Events: 處理滑鼠/觸控拖曳 ---
let pointerDown = false;
canvas.addEventListener('pointerdown', (e)=>{
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left);
  const y = (e.clientY - rect.top);
  // hit test depending on current unit（直接拖曳整個箭頭線段即可）
  if(unit === 1){
    if(hitTestVectorLine(x,y, vecV)){
      dragTarget = 'v'; pointerDown = true; canvas.setPointerCapture(e.pointerId);
    }
  } else if(unit === 2){
    if(hitTestVectorLine(x,y, vecA)){ dragTarget='a'; pointerDown=true; canvas.setPointerCapture(e.pointerId); }
    else if(hitTestVectorLine(x,y, vecB)){ dragTarget='b'; pointerDown=true; canvas.setPointerCapture(e.pointerId); }
  } else if(unit === 3){
    if(hitTestVectorLine(x,y, vecB)){ dragTarget='b'; pointerDown=true; canvas.setPointerCapture(e.pointerId); }
  }
});

canvas.addEventListener('pointermove', (e)=>{
  if(!pointerDown || !dragTarget) return;
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left);
  const y = (e.clientY - rect.top);
  const w = screenToWorld(x,y);

  // 更新對應向量的終點座標（以格數為單位）
  // 實作格點吸附（snap to integer grid）：拖曳時將座標四捨五入到最接近的整數格
  const snapped = { x: Math.round(w.x), y: Math.round(w.y) };
  if(dragTarget === 'v'){
    vecV.x = snapped.x; vecV.y = snapped.y;
  } else if(dragTarget === 'a'){
    vecA.x = snapped.x; vecA.y = snapped.y;
  } else if(dragTarget === 'b'){
    vecB.x = snapped.x; vecB.y = snapped.y;
  }
});

canvas.addEventListener('pointerup', (e)=>{
  pointerDown = false; dragTarget = null; try{ canvas.releasePointerCapture(e.pointerId);}catch(e){}
});

// Prevent unwanted gestures on mobile
canvas.addEventListener('touchstart', (e)=>{ e.preventDefault(); }, {passive:false});

// 簡單鍵盤支援：數字切換單元（1/2/3）
window.addEventListener('keydown', (e)=>{ if(['1','2','3'].includes(e.key)){ setActiveTab(Number(e.key)); }});

// End of script.js
