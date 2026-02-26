const canvas = document.getElementById('optics-canvas');
const ctx = canvas.getContext('2d');
const select = document.getElementById('optics-select');

const centerX = 400;
const centerY = 200;
const f = 100; // 焦距大小
const OBJ_HEIGHT = 70; // 從 100 減小以確保光線能打到透鏡
const LENS_R = 250; // 透鏡表面的曲率半徑
const LENS_HALF_HEIGHT = 140; // 透鏡視覺上的半高
const MIRROR_R = 250; // 面鏡的曲率半徑
const SNAP_THRESHOLD = 15; // 吸附功能的像素距離

let objectX = 150;
let isDragging = false;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const optics = select.value;

    let focalLength;
    if (optics === 'convex-lens' || optics === 'concave-mirror') {
        focalLength = f;
    } else {
        focalLength = -f;
    }

    // 繪製光學元件
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;

    if (optics.includes('lens')) {
        if (optics === 'convex-lens') {
            // 凸透鏡：() 形狀 (兩個圓的交集)
            const X_Offset = Math.sqrt(LENS_R * LENS_R - LENS_HALF_HEIGHT * LENS_HALF_HEIGHT);
            const angle = Math.asin(LENS_HALF_HEIGHT / LENS_R); // 交點的角度

            // 左表面 (圓心在右側)
            ctx.beginPath();
            ctx.arc(centerX + X_Offset, centerY, LENS_R, Math.PI - angle, Math.PI + angle);
            ctx.stroke();

            // 右表面 (圓心在左側)
            ctx.beginPath();
            ctx.arc(centerX - X_Offset, centerY, LENS_R, -angle, angle);
            ctx.stroke();

        } else {
            // 凹透鏡：)( 形狀
            const Middle_Gap = 10; // 中間間隙的一半
            // 中心位置：我們希望頂點位於 +/- Middle_Gap
            const C_Offset = LENS_R + Middle_Gap;
            // 使用相同的高度以維持一致性
            const angle = Math.asin(LENS_HALF_HEIGHT / LENS_R);

            // 左表面 (圓心在左側，畫出圓形的右側)
            ctx.beginPath();
            ctx.arc(centerX - C_Offset, centerY, LENS_R, -angle, angle);
            ctx.stroke();

            // 右表面 (圓心在右側，畫出圓形的左側)
            ctx.beginPath();
            ctx.arc(centerX + C_Offset, centerY, LENS_R, Math.PI - angle, Math.PI + angle);
            ctx.stroke();

            // 根據使用者要求移除上下封閉線 (它們之前看起來像「黑色光線」)
        }
    } else {

        // 繪製面鏡
        if (optics === 'concave-mirror') {
            // 凹面鏡：)| 形狀 (前端凹入，後端平整)
            // 在形狀厚度中間計算鏡軸中心 (centerX)
            const angle = Math.asin(LENS_HALF_HEIGHT / MIRROR_R);
            // 「弧矢」厚度 (sagittal thickness)
            const sagittal = MIRROR_R * (1 - Math.cos(angle));
            const extraThickness = 20; // 根據要求增加的厚度
            const totalWidth = sagittal + extraThickness;

            // ... (計算過程略)
            // 使用者要求的對齊：曲線 ) 的頂點位於 centerX
            const vertexX = centerX;
            const tipsX = centerX - sagittal;
            const backX = centerX + extraThickness;
            const centerCurvatureX = vertexX - MIRROR_R;

            ctx.beginPath();
            // 繪製弧形 ) (從頂部順時針畫到底部)
            // arc(x, y, 半徑, 起始角, 結束角, 逆時針方向)
            // 預設為 False (順時針)
            // 角度：-angle (頂部) 到 +angle (底部)
            ctx.arc(centerCurvatureX, centerY, MIRROR_R, -angle, angle);

            // 現在位於底部頂端 (tipsX, bottom)
            // 畫線到底部背面 (backX, bottom)
            ctx.lineTo(backX, centerY + LENS_HALF_HEIGHT);
            // 畫線到頂部背面 (backX, top)
            ctx.lineTo(backX, centerY - LENS_HALF_HEIGHT);
            // 畫線到頂部頂端 (tipsX, top)
            ctx.lineTo(tipsX, centerY - LENS_HALF_HEIGHT);

            // 閉合路徑 (連回弧形的起始點)
            ctx.stroke();

        } else {
            // 凸面鏡：(| 形狀
            // 在形狀厚度中間計算中心點 (centerX)
            const angle = Math.asin(LENS_HALF_HEIGHT / MIRROR_R);
            const thickness = MIRROR_R * (1 - Math.cos(angle));
            const offset = thickness / 2;

            // 前表面 (曲線)
            // 原始曲率中心：centerX + MIRROR_R
            // 向左平移 offset
            ctx.beginPath();
            ctx.arc(centerX + MIRROR_R - offset, centerY, MIRROR_R, Math.PI - angle, Math.PI + angle);
            ctx.stroke();

            // 後表面 (垂直線)
            // 背面位於中心點 +offset 處
            ctx.beginPath();
            const backX = centerX + offset;

            ctx.moveTo(backX, centerY - LENS_HALF_HEIGHT);
            ctx.lineTo(backX, centerY + LENS_HALF_HEIGHT);
            ctx.stroke();
        }
    }
    ctx.lineWidth = 1;

    // 繪製主軸
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.stroke();

    // 繪製焦點 (兩側)
    const points = [
        { x: centerX - f, label: 'F' },
        { x: centerX - 2 * f, label: '2F' },
        { x: centerX + f, label: 'F' },
        { x: centerX + 2 * f, label: '2F' }
    ];

    points.forEach(p => {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(p.x, centerY, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.fillText(p.label, p.x - 10, centerY - 10);
    });

    // 輔助函式定義
    function drawArrow(x, yTail, yHead, color, label) {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x, yTail);
        ctx.lineTo(x, yHead);
        ctx.stroke();

        // 箭頭
        ctx.beginPath();
        // 頂點位於 (x, yHead)
        // 如果 yHead < yTail (向上)，箭頭朝上
        // 如果 yHead > yTail (向下)，箭頭朝下
        let sign = (yHead < yTail) ? -1 : 1;

        ctx.moveTo(x, yHead);
        ctx.lineTo(x - 5, yHead - sign * 10);
        ctx.lineTo(x + 5, yHead - sign * 10);
        ctx.lineTo(x, yHead);
        ctx.fill();

        // 標籤
        ctx.fillStyle = 'black';
        ctx.fillText(label, x - 10, yHead + sign * 10);
    }

    // 繪製物體 (在鏡軸上)
    // 箭身：底部 (centerY) 到頂部 (centerY - OBJ_HEIGHT)
    drawArrow(objectX, centerY, centerY - OBJ_HEIGHT, 'blue', '物體');

    // 計算成像位置
    // 注意：焦距正負號邏輯保持不變
    let f1X;
    if (optics === 'convex-lens') { f1X = centerX + f; }
    else if (optics === 'concave-lens') { f1X = centerX - f; }
    else if (optics === 'concave-mirror') { f1X = centerX - f; }
    else { f1X = centerX + f; }

    // focalLength 已在 draw 函式頂部定義

    let u = centerX - objectX; // 物距
    let v = (focalLength * u) / (u - focalLength);

    let imageX;
    if (optics.includes('lens')) {
        imageX = centerX + v;
    } else {
        imageX = centerX - v;
    }

    // 繪製像
    // 計算成像性質
    let magnification = Math.abs(v / u);
    let absHeight = OBJ_HEIGHT * magnification;
    if (!isFinite(absHeight)) absHeight = 0;

    let isReal = (v > 0); // 透鏡中：v>0 為實像(右側)。面鏡中：v>0 為實像(左側)。
    // 在此程式碼中：
    // 透鏡：imageX = centerX + v。實像在右側。倒立。
    // 面鏡：imageX = centerX - v。實像在左側。倒立。
    // 公式 M = -v/u。
    // 如果 v 為正 (實像)，M 為負 (倒立)。
    // 如果 v 為負 (虛像)，M 為正 (正立)。
    // 因此 isInverted = (v > 0) 是正確的。

    let isInverted = (v > 0);

    if (isInverted) {
        // 倒立像：底部在 centerY，頂端向下在 centerY + absHeight
        drawArrow(imageX, centerY, centerY + absHeight, 'green', '像');
    } else {
        // 正立像：底部在 centerY，頂端向上在 centerY - absHeight
        drawArrow(imageX, centerY, centerY - absHeight, 'green', '像');
    }

    // 繪製光線 (符合物理原理)
    ctx.lineWidth = 2;

    const objectTopX = objectX;
    const objectTopY = centerY - OBJ_HEIGHT; // 物體頂端
    const lensHitY = objectTopY; // 平行光線打到透鏡的位置

    // 畫線輔助函式
    function drawLine(x1, y1, x2, y2, color, dashed = false) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        if (dashed) {
            ctx.setLineDash([5, 5]);
        } else {
            ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]); // 重置虛線設定
    }

    // Start ray tracing logic with defined variables
    if (optics === 'convex-lens') {
        const colorParallel = '#FECA57'; // 粉蠟筆黃 (Macaron Yellow)
        const colorCenter = '#1DD1A1';   // 粉蠟筆綠 (Macaron Green)
        const colorFocus = '#FF6B6B';    // 粉蠟筆粉 (Macaron Pink)

        // 1. 平行光線 -> 折射過焦點 (右側)
        // 物體到透鏡
        drawLine(objectTopX, objectTopY, centerX, lensHitY, colorParallel);
        // 透鏡到像 (穿過 F2)
        // 延伸光線
        let slope1 = (centerY - lensHitY) / (f1X - centerX);
        let endX1 = canvas.width;
        let endY1 = centerY + slope1 * (endX1 - f1X); // y - y1 = m(x - x1)
        drawLine(centerX, lensHitY, endX1, endY1, colorParallel);

        // 2. 中心光線 -> 直線穿過
        let slope2 = (centerY - objectTopY) / (centerX - objectTopX);
        let endX2 = canvas.width;
        let endY2 = centerY + slope2 * (endX2 - centerX);
        drawLine(objectTopX, objectTopY, endX2, endY2, colorCenter);

        // 檢查是否為虛像 (u < f)
        if (Math.abs(centerX - objectX) < f) {
            let imgTipY = centerY - absHeight;

            // 1. 第一條光線的延伸線：從透鏡打到點 (centerX, lensHitY) 到像的頂端
            drawLine(centerX, lensHitY, imageX, imgTipY, colorParallel, true);

            // 2. 第二條光線的延伸線：從中心點到像的頂端
            drawLine(centerX, centerY, imageX, imgTipY, colorCenter, true);
        }

    } else if (optics === 'concave-lens') {
        const colorParallel = '#FECA57'; // Macaron Yellow
        const colorCenter = '#1DD1A1';   // Macaron Green
        const colorFocus = '#FF6B6B';    // Macaron Pink

        // 1. Parallel Ray -> Diverges as if coming from Focus (Left)
        // Object to Lens
        drawLine(objectTopX, objectTopY, centerX, lensHitY, colorParallel);

        // Diverging ray
        // Virtual part: from F1 (Left) to Lens Hit
        drawLine(f1X, centerY, centerX, lensHitY, colorParallel, true);

        // 真實部分：從透鏡打到點向外延伸
        let slope1 = (lensHitY - centerY) / (centerX - f1X); // 正斜率
        let endX1 = canvas.width;
        let endY1 = lensHitY + slope1 * (endX1 - centerX);
        drawLine(centerX, lensHitY, endX1, endY1, colorParallel);

        // 2. 中心光線 -> 直線穿過
        let slope2 = (centerY - objectTopY) / (centerX - objectTopX);
        let endX2 = canvas.width;
        let endY2 = centerY + slope2 * (endX2 - centerX);
        drawLine(objectTopX, objectTopY, endX2, endY2, colorCenter);

    } else if (optics === 'concave-mirror') {
        const colorParallel = '#FECA57'; // 粉蠟筆黃 (Macaron Yellow)
        const colorCenter = '#1DD1A1';   // 粉蠟筆綠 (Macaron Green)
        const colorFocus = '#FF6B6B';    // 粉蠟筆粉 (Macaron Pink)

        // 物體在左側
        // 1. 平行光線 -> 反射過焦點 (左側)
        // 物體到面鏡
        drawLine(objectTopX, objectTopY, centerX, lensHitY, colorParallel);

        // 反射：從面鏡反射點穿過左側焦點 (F1)
        // 反射光線通過 F1 (centerX - f, centerY)
        // 直線方程式：(y - lensHitY) = m * (x - centerX)
        // m = (centerY - lensHitY) / (f1X - centerX)
        let slope1 = (centerY - lensHitY) / (f1X - centerX);

        // 繪製真實反射光線 (向左)
        let endX1 = 0;
        let endY1 = lensHitY + slope1 * (endX1 - centerX);
        drawLine(centerX, lensHitY, endX1, endY1, colorParallel);

        // 如果是虛像 (u < f)，繪製虛擬延伸線 (向右)
        if (Math.abs(centerX - objectX) < f) {
            let endX_Virt = canvas.width;
            let endY_Virt = lensHitY + slope1 * (endX_Virt - centerX);
            drawLine(centerX, lensHitY, endX_Virt, endY_Virt, colorParallel, true);
        }

        // 2. 頂點光線 (向 centerY) -> 對稱反射
        // 物體到面鏡中心
        drawLine(objectTopX, objectTopY, centerX, centerY, colorCenter);

        // 反射
        // 入射角 = 反射角
        // 反射斜率 (真實) = -入射斜率 (因為關於 X 軸對稱)
        let slopeIn = (centerY - objectTopY) / (centerX - objectTopX);
        let slopeOut = -slopeIn;

        // 真實光線 (向左)
        let endX2 = 0;
        let endY2 = centerY + slopeOut * (endX2 - centerX);
        drawLine(centerX, centerY, endX2, endY2, colorCenter);

        // 如果 u < f，繪製虛擬延伸線 (向右)
        if (Math.abs(centerX - objectX) < f) {
            let endX_Virt2 = canvas.width;
            let endY_Virt2 = centerY + slopeOut * (endX_Virt2 - centerX);
            drawLine(centerX, centerY, endX_Virt2, endY_Virt2, colorCenter, true);
        }

        // 3. 穿過焦點 (F1) 的光線 -> 反射後平行
        // F1 位於 (centerX - f, centerY)
        // 如果 u > f：光線從物體 -> 穿過 F1 -> 射向面鏡
        // 如果 u < f：光線從物體射向面鏡 (沿著來自 F1 的連線)

        let m3 = (centerY - objectTopY) / (f1X - objectTopX); // 通過焦點與物體的斜率
        // 與面鏡交點 (x = centerX)
        // y - objectTopY = m3 * (x - objectTopX)
        let mirrorHitY_3 = objectTopY + m3 * (centerX - objectTopX);

        // 檢查 u < f 或 u > f 以正確繪製
        if (Math.abs(centerX - objectX) > f) {
            // 物體在焦點外：光線通過 F1
            drawLine(objectTopX, objectTopY, centerX, mirrorHitY_3, colorFocus);
        } else {
            // 物體在焦點內：光線從物體射向鏡面，方向與 F1 對齊 (虛擬起始自 F1)
            // 繪製物體到面鏡的實線
            drawLine(objectTopX, objectTopY, centerX, mirrorHitY_3, colorFocus);
            // 繪製 F1 到物體的虛線 (選擇性繪製，通常 F1 在極左側)
            drawLine(f1X, centerY, objectTopX, objectTopY, colorFocus, true);
        }

        // 反射光線 (平行於主軸)
        // 真實反射光線向左
        drawLine(centerX, mirrorHitY_3, 0, mirrorHitY_3, colorFocus);

        // 如果 u < f，繪製虛擬延伸線 (向右)
        if (Math.abs(centerX - objectX) < f) {
            drawLine(centerX, mirrorHitY_3, canvas.width, mirrorHitY_3, 'orange', true);
        }

    } else if (optics === 'convex-mirror') {
        const colorParallel = '#FECA57'; // 粉蠟筆黃 (Macaron Yellow)
        const colorCenter = '#48DBFB';   // 粉蠟筆青/藍綠 - 比淡綠色更容易看清
        // 使用柔和的綠色
        const colorGreen = '#1DD1A1';
        const colorFocus = '#FF6B6B';    // 粉蠟筆紅/粉 (Macaron Red/Pink)

        // 物體在左側

        // 1. 平行光線 (黃色) -> 反射效果看似來自右側焦點
        // 物體到面鏡 (水平)
        drawLine(objectTopX, objectTopY, centerX, lensHitY, colorParallel);

        // 虛擬延伸線：右側焦點 (F) 到面鏡打到點
        // 光線看似來自 F
        drawLine(f1X, centerY, centerX, lensHitY, colorParallel, true);

        // 真實反射：面鏡反射點向外延伸 (向左)
        // 從 F 到打到點計算斜率
        let slope1 = (lensHitY - centerY) / (centerX - f1X);
        let endX1 = 0;
        let endY1 = lensHitY + slope1 * (endX1 - centerX);
        drawLine(centerX, lensHitY, endX1, endY1, colorParallel);

        // 2. 射向頂點的光線 (綠色) -> 對稱反射
        // 入射光：物體到頂點 (centerX, centerY)
        drawLine(objectTopX, objectTopY, centerX, centerY, colorGreen);

        // 在頂點反射
        // 入射斜率 = (centerY - objectTopY) / (centerX - objectTopX)
        // 反射斜率 = -入射斜率
        let slopeIn = (centerY - objectTopY) / (centerX - objectTopX);
        let slopeOut = -slopeIn;

        // 真實反射光線 (向左側)
        let endX2 = 0;
        let endY2 = centerY + slopeOut * (endX2 - centerX);
        drawLine(centerX, centerY, endX2, endY2, colorGreen);

        // 虛擬延伸線 (向右側)
        // 看似來自像的一側
        let endX_Virt2 = canvas.width;
        let endY_Virt2 = centerY + slopeOut * (endX_Virt2 - centerX);
        drawLine(centerX, centerY, endX_Virt2, endY_Virt2, colorGreen, true);

        // 3. 瞄準焦點的光線 (粉色) -> 反射後平行
        let F_Right_X = centerX + f; // 面鏡後方的焦點

        // 從物體頂端瞄準 F_Right 的光線
        let slope3 = (centerY - objectTopY) / (F_Right_X - objectTopX);
        let mirrorHitY_3 = objectTopY + slope3 * (centerX - objectTopX);

        // 繪製物體 -> 面鏡打到點 (實線)
        drawLine(objectTopX, objectTopY, centerX, mirrorHitY_3, colorFocus);

        // 折射後平行 (水平) 向左 (真實)
        // 從面鏡打到點到左側邊緣
        drawLine(centerX, mirrorHitY_3, 0, mirrorHitY_3, colorFocus);

        // 虛擬延伸線 2：反射光線的延伸 (水平)
        // 從面鏡打到點到右側邊緣 (虛線) -> 穿過成像點
        drawLine(centerX, mirrorHitY_3, canvas.width, mirrorHitY_3, colorFocus, true);
    }

    // 3. Third Ray (Lens Only)
    if (optics === 'convex-lens') {
        const colorFocus = '#FF6B6B'; // Macaron Pink

        // Ray through Front Focus (F1, Left) -> Refracts Parallel
        // Object Tip: (objectTopX, objectTopY)
        // F1: (f1X - f? No, f1X is F2 usually? Let's check definitions)
        // In my code:
        // Convex Lens: f1X = center + f (Right), f2X = center + 2f (Right).
        // Standard ray tracing usually calls Left focus F and Right focus F'.
        // Code drew F points at +/- f.
        // F_Left = centerX - f.

        let F_Left_X = centerX - f;

        // Ray from Object Tip through F_Left to Lens (x=centerX)
        // This ray might not hit the lens if object is closer than F.
        // But we draw it anyway for theory.

        // Geometry: Line from (objX, objY) through (F_Left_X, centerY)
        // Find y at x = centerX.
        // Slope = (centerY - objY) / (F_Left_X - objX)
        let slope3 = (centerY - objectTopY) / (F_Left_X - objectTopX);
        let lensHitY_3 = objectTopY + slope3 * (centerX - objectTopX);

        // Draw Object -> LensHit
        // Note: Pass through F_Left.
        // Need to draw line segment.
        drawLine(objectTopX, objectTopY, centerX, lensHitY_3, colorFocus);

        // Refracts Parallel (Horizontal)
        // From (centerX, lensHitY_3) to Right Edge
        drawLine(centerX, lensHitY_3, canvas.width, lensHitY_3, colorFocus);

        // Virtual Extension for 3rd Ray (if u < f)
        if (Math.abs(centerX - objectX) < f) {
            let imgTipY = centerY - absHeight;
            // Backtrace from Lens Hit (centerX, lensHitY_3) to Image Tip
            // This should be a horizontal line if logic is correct.
            drawLine(centerX, lensHitY_3, imageX, imgTipY, colorFocus, true);
        }

    } else if (optics === 'concave-lens') {
        const colorFocus = '#FF6B6B'; // Macaron Pink

        // Ray aimed at Opposite Focus (F_Right) -> Refracts Parallel
        // F_Right = centerX + f.
        let F_Right_X = centerX + f;

        // Ray from Object Tip aimed at F_Right.
        // Calculate intersection with Lens (x=centerX).
        // Slope = (centerY - objY) / (F_Right_X - objX)
        let slope3 = (centerY - objectTopY) / (F_Right_X - objectTopX);
        let lensHitY_3 = objectTopY + slope3 * (centerX - objectTopX);

        // Draw Object -> LensHit (Solid)
        drawLine(objectTopX, objectTopY, centerX, lensHitY_3, colorFocus);

        // Draw Virtual Extension from LensHit to F_Right (Dashed)
        // To show it was aimed there
        drawLine(centerX, lensHitY_3, F_Right_X, centerY, colorFocus, true);

        // Refracts Parallel (Horizontal) to Right Edge (Solid)
        // Ray aimed at F' emerges parallel.
        drawLine(centerX, lensHitY_3, canvas.width, lensHitY_3, colorFocus);

        // Virtual Extension: Refracted Ray extended backwards (Horizontal)
        // Passes through Image
        drawLine(centerX, lensHitY_3, 0, lensHitY_3, colorFocus, true);


    }
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // 檢查點擊是否在物體附近
    if (x >= objectX - 20 && x <= objectX + 20 && y >= centerY - OBJ_HEIGHT && y <= centerY + 20) {
        isDragging = true;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;

        // 吸附邏輯
        const snapPoints = [
            centerX - f,       // 左側 F
            centerX - 2 * f,   // 左側 2F
            centerX + f,       // 右側 F
            centerX + 2 * f    // 右側 2F
        ];

        for (let point of snapPoints) {
            if (Math.abs(x - point) < SNAP_THRESHOLD) {
                x = point;
                break;
            }
        }

        // 限制物體在左側區域移動
        objectX = Math.max(50, Math.min(350, x));
        draw();
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

select.addEventListener('change', draw);

// 初始繪製
draw();