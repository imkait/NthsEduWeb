/**
 * Interactive Trigonometry Logic
 * Handles Unit Circle and Wave Graph rendering and interaction.
 */

class TrigApp {
    constructor() {
        // Configuration
        this.config = {
            width: 0,
            height: 0,
            centerX: 0,
            centerY: 0,
            radius: 200, // Unit circle radius in px
            angle: 0, // Current angle in radians
            isDragging: false,
            colors: {
                axis: '#334155',
                grid: '#1e293b',
                circle: '#94a3b8',
                text: '#94a3b8',
                sin: '#ef4444',
                cos: '#3b82f6',
                tan: '#10b981',
                angle: '#fbbf24', // Amber
                dragPoint: '#ef4444' // Red highlight
            }
        };

        // DOM Elements
        this.unitCanvas = document.getElementById('unit-circle-canvas');
        this.unitCtx = this.unitCanvas.getContext('2d');

        this.waveCanvas = document.getElementById('wave-graph-canvas');
        this.waveCtx = this.waveCanvas.getContext('2d');

        // UI Inputs
        this.ui = {
            angleDeg: document.getElementById('angle-deg'),
            angleRad: document.getElementById('angle-rad'),
            valSin: document.getElementById('val-sin'),
            valCos: document.getElementById('val-cos'),
            valTan: document.getElementById('val-tan'),
            currentAngle: document.querySelectorAll('.current-angle'),
            showSin: document.getElementById('show-sin'),
            showCos: document.getElementById('show-cos'),
            showTan: document.getElementById('show-tan'),
            snapGrid: document.getElementById('snap-grid')
        };

        // Initialization
        this.init();
    }

    init() {
        // Resize observer
        window.addEventListener('resize', () => this.resize());
        this.resize();

        // Mouse/Touch Events for Unit Circle
        this.unitCanvas.addEventListener('mousedown', (e) => this.startDrag(e));
        this.unitCanvas.addEventListener('mousemove', (e) => this.onDrag(e));
        window.addEventListener('mouseup', () => this.stopDrag());

        this.unitCanvas.addEventListener('touchstart', (e) => this.startDrag(e), { passive: false });
        this.unitCanvas.addEventListener('touchmove', (e) => this.onDrag(e), { passive: false });
        window.addEventListener('touchend', () => this.stopDrag());

        // Controls Events
        [this.ui.showSin, this.ui.showCos, this.ui.showTan, this.ui.snapGrid].forEach(el => {
            el.addEventListener('change', () => this.draw());
        });

        // Loop
        this.animate();
    }

    resize() {
        // Resize Unit Circle Canvas
        const unitContainer = this.unitCanvas.parentElement;
        this.unitCanvas.width = unitContainer.clientWidth;
        this.unitCanvas.height = unitContainer.clientHeight;

        this.config.width = this.unitCanvas.width;
        this.config.height = this.unitCanvas.height;
        this.config.centerX = this.config.width / 2;
        this.config.centerY = this.config.height / 2;
        this.config.radius = Math.min(this.config.width, this.config.height) * 0.35;

        // Resize Wave Canvas
        const waveContainer = this.waveCanvas.parentElement;
        this.waveCanvas.width = waveContainer.clientWidth;
        this.waveCanvas.height = waveContainer.clientHeight;

        this.draw();
    }

    /* Interaction Handlers */
    getMousePos(evt) {
        const rect = this.unitCanvas.getBoundingClientRect();
        const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
        const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    startDrag(e) {
        const pos = this.getMousePos(e);
        const dx = pos.x - this.config.centerX;
        const dy = pos.y - this.config.centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Allow click anywhere reasonably close to update angle interactions
        if (dist < 300) {
            this.config.isDragging = true;
            this.updateAngleFromPos(pos.x, pos.y);
        }
    }

    onDrag(e) {
        if (!this.config.isDragging) return;
        if (e.preventDefault) e.preventDefault(); // Prevent scroll on touch
        const pos = this.getMousePos(e);
        this.updateAngleFromPos(pos.x, pos.y);
    }

    stopDrag() {
        this.config.isDragging = false;
    }

    updateAngleFromPos(x, y) {
        const dx = x - this.config.centerX;
        const dy = this.config.centerY - y; // Inverse Y for cartesian
        let angle = Math.atan2(dy, dx);

        // Normalize angle 0 to 2PI
        if (angle < 0) angle += Math.PI * 2;

        // Snap to grid (Special Angles: 30, 45, 60, etc.)
        if (this.ui.snapGrid.checked) {
            const degrees = angle * (180 / Math.PI);
            const snapInterval = 15; // Snap every 15 degrees
            const snappedDeg = Math.round(degrees / snapInterval) * snapInterval;

            // Only snap if close enough (within 5 degrees)
            if (Math.abs(degrees - snappedDeg) < 5) {
                angle = snappedDeg * (Math.PI / 180);
            }
        }

        this.config.angle = angle;
        this.updateUI();
        this.draw();
    }

    updateUI() {
        const deg = Math.round(this.config.angle * (180 / Math.PI));

        // Format PI radians
        let radText = (this.config.angle / Math.PI).toFixed(2) + "π";
        // Try to find exact radian fraction if possible (e.g. 1/6, 1/4, 1/3, 1/2)
        const radFracs = [
            { val: 0, text: "0π" },
            { val: 1 / 6, text: "π/6" },
            { val: 1 / 4, text: "π/4" },
            { val: 1 / 3, text: "π/3" },
            { val: 1 / 2, text: "π/2" },
            { val: 2 / 3, text: "2π/3" },
            { val: 3 / 4, text: "3π/4" },
            { val: 5 / 6, text: "5π/6" },
            { val: 1, text: "π" },
            { val: 7 / 6, text: "7π/6" },
            { val: 5 / 4, text: "5π/4" },
            { val: 4 / 3, text: "4π/3" },
            { val: 3 / 2, text: "3π/2" },
            { val: 5 / 3, text: "5π/3" },
            { val: 7 / 4, text: "7π/4" },
            { val: 11 / 6, text: "11π/6" },
            { val: 2, text: "2π" }
        ];

        const currentPiRatio = this.config.angle / Math.PI;
        const closestRad = radFracs.find(r => Math.abs(r.val - currentPiRatio) < 0.01);
        if (closestRad) radText = closestRad.text;

        this.ui.angleDeg.textContent = `${deg}°`;
        this.ui.angleRad.textContent = radText;

        // Update all current-angle slots
        this.ui.currentAngle.forEach(el => el.textContent = `${deg}°`);

        const cosVal = Math.cos(this.config.angle);
        const sinVal = Math.sin(this.config.angle);
        const tanVal = Math.tan(this.config.angle);

        // Helper to format values as fractions or exact radicals
        const formatValue = (val, type) => {
            // Check for special values
            const epsilon = 0.01;

            // 0, 1, -1
            if (Math.abs(val) < epsilon) return "0";
            if (Math.abs(val - 1) < epsilon) return "1";
            if (Math.abs(val + 1) < epsilon) return "-1";
            if (Math.abs(val - 0.5) < epsilon) return `<div class="frac-container"><div class="frac"><span class="num">1</span><span class="den">2</span></div></div>`;
            if (Math.abs(val + 0.5) < epsilon) return `<div class="frac-container">-<div class="frac"><span class="num">1</span><span class="den">2</span></div></div>`;

            // sqrt(2)/2 approx 0.707
            const root2oc2 = Math.sqrt(2) / 2;
            if (Math.abs(val - root2oc2) < epsilon) return `<div class="frac-container"><div class="frac"><span class="num">√2</span><span class="den">2</span></div></div>`;
            if (Math.abs(val + root2oc2) < epsilon) return `<div class="frac-container">-<div class="frac"><span class="num">√2</span><span class="den">2</span></div></div>`;

            // sqrt(3)/2 approx 0.866
            const root3oc2 = Math.sqrt(3) / 2;
            if (Math.abs(val - root3oc2) < epsilon) return `<div class="frac-container"><div class="frac"><span class="num">√3</span><span class="den">2</span></div></div>`;
            if (Math.abs(val + root3oc2) < epsilon) return `<div class="frac-container">-<div class="frac"><span class="num">√3</span><span class="den">2</span></div></div>`;

            // sqrt(3) approx 1.732 (for Tan)
            const root3 = Math.sqrt(3);
            if (Math.abs(val - root3) < epsilon) return "√3";
            if (Math.abs(val + root3) < epsilon) return "-√3";

            // 1/sqrt(3) or sqrt(3)/3 approx 0.577 (for Tan)
            const root3oc3 = Math.sqrt(3) / 3;
            if (Math.abs(val - root3oc3) < epsilon) return `<div class="frac-container"><div class="frac"><span class="num">√3</span><span class="den">3</span></div></div>`;
            if (Math.abs(val + root3oc3) < epsilon) return `<div class="frac-container">-<div class="frac"><span class="num">√3</span><span class="den">3</span></div></div>`;

            return val.toFixed(2);
        };

        this.ui.valCos.innerHTML = formatValue(cosVal);
        this.ui.valSin.innerHTML = formatValue(sinVal);

        if (Math.abs(tanVal) > 100) {
            this.ui.valTan.textContent = "undefined";
            document.getElementById('identity-tan').innerHTML = "undefined";
            document.getElementById('identity-tan-co').innerHTML = "undefined";
        } else {
            this.ui.valTan.innerHTML = formatValue(tanVal);
            document.getElementById('identity-tan').innerHTML = `<span class="color-tan">TAN</span>(${180}°+${deg}°)`;
            document.getElementById('identity-tan-co').innerHTML = `<span class="color-tan">COT</span>(${90}°-${deg}°)`;
        }

        // Identities
        document.getElementById('identity-sin').innerHTML = `<span class="color-sin">SIN</span>(${180}°-${deg}°)`;
        document.getElementById('identity-sin-co').innerHTML = `<span class="color-cos">COS</span>(${90}°-${deg}°)`;

        document.getElementById('identity-cos').innerHTML = `<span class="color-cos">COS</span>(${360}°-${deg}°)`;
        document.getElementById('identity-cos-co').innerHTML = `<span class="color-sin">SIN</span>(${90}°-${deg}°)`;
    }

    /* Drawing Logic */
    draw() {
        this.drawUnitCircle();
        this.drawWaveGraph();
    }

    drawUnitCircle() {
        const ctx = this.unitCtx;
        const { width, height, centerX, centerY, radius, angle, colors } = this.config;

        ctx.clearRect(0, 0, width, height);

        // 1. Grid & Axis
        ctx.beginPath();
        ctx.strokeStyle = colors.axis;
        ctx.lineWidth = 2;
        // X Axis
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        // Y Axis
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, height);
        ctx.stroke();

        // 2. Unit Circle
        ctx.beginPath();
        ctx.strokeStyle = colors.text;
        ctx.lineWidth = 2;
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // 2b. Special Angle Dots
        const specialAnglesDeg = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
        ctx.fillStyle = colors.grid; // Use a subtle color or grid color

        specialAnglesDeg.forEach(deg => {
            const rad = deg * (Math.PI / 180);
            const dotX = centerX + Math.cos(rad) * radius;
            const dotY = centerY - Math.sin(rad) * radius;

            ctx.beginPath();
            ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
            // check if this is a main axis
            if (deg % 90 === 0) {
                ctx.fillStyle = colors.text; // slightly more visible for axes
                ctx.fill();
                ctx.fillStyle = colors.grid; // reset
            } else {
                ctx.fill();
            }
        });

        // 3. Components Calculations
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const pointX = centerX + cos * radius;
        const pointY = centerY - sin * radius; // Inverted Y for canvas

        // 4. Draw Triangle Components

        // Cosine Line (Blue, Horizontal)
        if (this.ui.showCos.checked) {
            ctx.beginPath();
            ctx.strokeStyle = colors.cos;
            ctx.lineWidth = 4;
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(pointX, centerY);
            ctx.stroke();
        }

        // Sine Line (Red, Vertical)
        if (this.ui.showSin.checked) {
            ctx.beginPath();
            ctx.strokeStyle = colors.sin;
            ctx.lineWidth = 4;
            ctx.moveTo(pointX, centerY);
            ctx.lineTo(pointX, pointY);
            ctx.stroke();
        }

        // Radius Line
        ctx.beginPath();
        ctx.strokeStyle = colors.text;
        ctx.lineWidth = 2;
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(pointX, pointY);
        ctx.stroke();

        // Tangent Line (Green)
        if (this.ui.showTan.checked) {
            // Tan line is tangent to the circle at (1,0) or at the point, usually drawn at x=1
            // Standard representation: Vertical line at circle edge meeting extended radius
            // To be robust for all quadrants, we usually draw tangent at the angle

            // Let's implement the standard textbook visual: Tan represents the segment on the tangent line x=1 (or x=-1)
            // But visually it's often better to show it tangent to the circle at the point, or tangent at x=1 intersecting the extended radius.
            // Simplified: Tangent line at x=Radius (Right side)

            const tanVal = Math.tan(angle);
            // Limit drawing for infinity
            if (Math.abs(tanVal) < 10) {
                // Determine which side to draw (x=1 or x=-1) based on Cos
                const dir = cos >= 0 ? 1 : -1;
                const tanStartX = centerX + (radius * dir);
                const tanStartY = centerY;
                const tanEndY = centerY - (tanVal * radius * dir);

                ctx.beginPath();
                ctx.strokeStyle = colors.tan;
                ctx.lineWidth = 3;
                ctx.moveTo(tanStartX, tanStartY);
                ctx.lineTo(tanStartX, tanEndY);
                ctx.stroke();

                // Dotted extension line from center to tan point
                ctx.beginPath();
                ctx.strokeStyle = colors.text;
                ctx.setLineDash([5, 5]);
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(tanStartX, tanEndY);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        // 5. Angle Arc
        ctx.beginPath();
        ctx.strokeStyle = colors.angle;
        ctx.lineWidth = 3;
        // Correct arc direction: always counter-clockwise from 0
        ctx.arc(centerX, centerY, radius * 0.15, 0, -angle, true); // Canvas Y is inverted, so -angle
        ctx.stroke();

        // 6. Interactive Point (The "Handle")
        ctx.beginPath();
        ctx.fillStyle = colors.dragPoint;
        ctx.arc(pointX, pointY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawWaveGraph() {
        const ctx = this.waveCtx;
        const width = this.waveCanvas.width;
        const height = this.waveCanvas.height;
        const { colors } = this.config;

        ctx.clearRect(0, 0, width, height);

        const centerY = height / 2;
        const margin = 10;

        // ========== 關鍵設定 ==========
        // tan 的最大顯示範圍：±tanMaxValue（能顯示 tan(89°) ≈ 57.29）
        const tanMaxValue = 60;
        // tan 的 yScale：讓 ±tanMaxValue 對應到面板的上下邊界
        const tanYScale = (height / 2 - margin) / tanMaxValue;
        // sin/cos 的 yScale：降低振幅，讓 ±1 對應到較小的範圍
        const sinCosYScale = (height / 2 - margin) / 1.5;

        // 設定裁剪區域，防止曲線繪製超出面板
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, width, height);
        ctx.clip();

        // 繪製座標軸（中央水平線）
        ctx.beginPath();
        ctx.strokeStyle = colors.axis;
        ctx.lineWidth = 1;
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();

        // 繪製 sin/cos 的振幅參考線（y = ±1）
        ctx.beginPath();
        ctx.strokeStyle = colors.grid;
        ctx.setLineDash([3, 3]);
        const sinCosLineY = centerY - 1 * sinCosYScale;
        ctx.moveTo(0, sinCosLineY);
        ctx.lineTo(width, sinCosLineY);
        ctx.moveTo(0, centerY + 1 * sinCosYScale);
        ctx.lineTo(width, centerY + 1 * sinCosYScale);
        ctx.stroke();
        ctx.setLineDash([]);

        // 顯示範圍：0 到 4π（2 個完整週期）
        const xScale = width / (4 * Math.PI);
        const samples = width;

        /**
         * 繪製函數曲線
         * @param {Function} func - 數學函數 (sin, cos, tan)
         * @param {string} color - 曲線顏色
         * @param {number} lineWidth - 線條寬度
         * @param {number} yScaleToUse - 使用的 yScale
         * @param {boolean} isTan - 是否為正切函數（需要特殊處理漸近線）
         */
        const plotFunction = (func, color, lineWidth, yScaleToUse, isTan = false) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            let isFirstPoint = true;

            for (let x = 0; x < samples; x++) {
                const angle = x / xScale;
                const value = func(angle);

                if (isTan) {
                    const prevAngle = (x - 1) / xScale;
                    const prevValue = func(prevAngle);

                    // 漸近線判斷：符號改變且值很大（超過顯示範圍的一半）
                    const signChanged = (prevValue * value < 0) &&
                        (Math.abs(prevValue) > tanMaxValue * 0.3 || Math.abs(value) > tanMaxValue * 0.3);

                    if (signChanged) {
                        if (!isFirstPoint) {
                            ctx.stroke();
                            ctx.beginPath();
                        }
                        isFirstPoint = true;
                    }
                }

                const y = centerY - value * yScaleToUse;

                if (isFirstPoint) {
                    ctx.moveTo(x, y);
                    isFirstPoint = false;
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        };

        // 繪製各函數曲線（tan 使用較小的 yScale 以顯示更大範圍）
        if (this.ui.showSin.checked) plotFunction(Math.sin, colors.sin, 2, sinCosYScale, false);
        if (this.ui.showCos.checked) plotFunction(Math.cos, colors.cos, 2, sinCosYScale, false);
        if (this.ui.showTan.checked) plotFunction(Math.tan, colors.tan, 2, tanYScale, true);

        // 繪製當前角度指示線（模 4π 以對應顯示範圍）
        let indicatorX = (this.config.angle % (4 * Math.PI)) * xScale;

        ctx.beginPath();
        ctx.strokeStyle = colors.text;
        ctx.setLineDash([5, 5]);
        ctx.moveTo(indicatorX, 0);
        ctx.lineTo(indicatorX, height);
        ctx.stroke();
        ctx.setLineDash([]);

        // 繪製各函數在當前角度的標示點
        const drawPoint = (func, color, yScaleToUse) => {
            const value = func(this.config.angle);
            const y = centerY - value * yScaleToUse;

            // 只在點位於可視範圍內時繪製
            if (y >= -10 && y <= height + 10) {
                ctx.beginPath();
                ctx.fillStyle = color;
                ctx.arc(indicatorX, y, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        };

        if (this.ui.showSin.checked) drawPoint(Math.sin, colors.sin, sinCosYScale);
        if (this.ui.showCos.checked) drawPoint(Math.cos, colors.cos, sinCosYScale);
        if (this.ui.showTan.checked) drawPoint(Math.tan, colors.tan, tanYScale);

        // 恢復畫布狀態（移除裁剪區域）
        ctx.restore();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        // Animation loop for smooth dragging or future animations
        // Currently we redraw on events, but rAF is good for specialized animations
        // We can move draw here if we want continuous updates
    }
}

// Start App when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new TrigApp();
});
