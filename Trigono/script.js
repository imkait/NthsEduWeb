/** 單位圓與三角函數互動教材；所有角度控制共用 0.01° 精度。 */
class TrigApp {
    constructor() {
        this.config = {
            width: 0, height: 0, centerX: 0, centerY: 0, radius: 100,
            angle: 0, isDragging: false,
            colors: {
                axis: '#64748b', grid: '#334155', circle: '#94a3b8', text: '#cbd5e1',
                sin: '#f87171', cos: '#60a5fa', tan: '#34d399', angle: '#fbbf24', dragPoint: '#f87171'
            }
        };
        this.unitCanvas = document.getElementById('unit-circle-canvas');
        this.unitCtx = this.unitCanvas.getContext('2d');
        this.waveCanvas = document.getElementById('wave-graph-canvas');
        this.waveCtx = this.waveCanvas.getContext('2d');
        this.ui = {};
        const ids = {
            angleDeg: 'angle-deg', angleRad: 'angle-rad', valSin: 'val-sin', valCos: 'val-cos', valTan: 'val-tan',
            angleInput: 'angle-input', angleSlider: 'angle-slider', resetAngle: 'reset-angle'
        };
        Object.entries(ids).forEach(([key, id]) => { this.ui[key] = document.getElementById(id); });
        this.ui.currentAngle = document.querySelectorAll('.current-angle');
        this.init();
    }

    init() {
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(this.unitCanvas.parentElement);
        this.resizeObserver.observe(this.waveCanvas.parentElement);
        window.addEventListener('resize', () => this.resize());
        this.unitCanvas.addEventListener('pointerdown', e => this.startDrag(e));
        this.unitCanvas.addEventListener('pointermove', e => this.onDrag(e));
        ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => {
            this.unitCanvas.addEventListener(type, event => {
                if (event.pointerId === this.activePointerId) this.stopDrag();
            });
        });
        this.unitCanvas.addEventListener('keydown', e => {
            const degrees = this.config.angle * 180 / Math.PI;
            const delta = e.shiftKey ? 15 : 1;
            const values = { ArrowRight: degrees + delta, ArrowUp: degrees + delta,
                ArrowLeft: degrees - delta, ArrowDown: degrees - delta, Home: 0, End: 360 };
            if (Object.hasOwn(values, e.key)) {
                e.preventDefault();
                this.setAngleDegrees(values[e.key]);
            }
        });
        this.ui.angleInput.addEventListener('input', () => {
            if (this.ui.angleInput.value !== '' && this.ui.angleInput.validity.valid) {
                this.setAngleDegrees(Number(this.ui.angleInput.value), true);
            }
        });
        this.ui.angleInput.addEventListener('blur', () => this.updateUI());
        this.ui.angleSlider.addEventListener('input', () => this.setAngleDegrees(Number(this.ui.angleSlider.value)));
        document.querySelectorAll('[data-angle]').forEach(button => {
            button.addEventListener('click', () => this.setAngleDegrees(Number(button.dataset.angle)));
        });
        this.ui.resetAngle.addEventListener('click', () => this.setAngleDegrees(0));
        this.updateUI();
        this.resize();
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        [this.unitCanvas, this.waveCanvas].forEach(canvas => {
            const width = canvas.parentElement.clientWidth;
            const height = canvas.parentElement.clientHeight;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
        });
        this.config.width = this.unitCanvas.parentElement.clientWidth;
        this.config.height = this.unitCanvas.parentElement.clientHeight;
        this.config.centerX = this.config.width / 2;
        this.config.centerY = this.config.height / 2;
        this.config.radius = Math.min(this.config.width, this.config.height) * 0.32;
        this.draw();
    }

    getMousePos(event) {
        const rect = this.unitCanvas.getBoundingClientRect();
        return { x: (event.clientX - rect.left) * this.config.width / rect.width,
            y: (event.clientY - rect.top) * this.config.height / rect.height };
    }

    startDrag(event) {
        if (!event.isPrimary || event.button !== 0) return;
        event.preventDefault();
        this.unitCanvas.focus({ preventScroll: true });
        this.unitCanvas.setPointerCapture(event.pointerId);
        this.activePointerId = event.pointerId;
        this.config.isDragging = true;
        const position = this.getMousePos(event);
        this.updateAngleFromPos(position.x, position.y);
    }

    onDrag(event) {
        if (!this.config.isDragging || event.pointerId !== this.activePointerId) return;
        const position = this.getMousePos(event);
        this.updateAngleFromPos(position.x, position.y);
    }

    stopDrag() {
        this.config.isDragging = false;
        this.activePointerId = null;
    }

    updateAngleFromPos(x, y) {
        const dx = x - this.config.centerX;
        const dy = this.config.centerY - y;
        if (Math.hypot(dx, dy) < 2) return;
        let degrees = Math.atan2(dy, dx) * 180 / Math.PI;
        if (degrees < 0) degrees += 360;
        const snapped = Math.round(degrees / 15) * 15;
        if (Math.abs(degrees - snapped) < 5) degrees = snapped;
        this.setAngleDegrees(degrees);
    }

    setAngleDegrees(degrees, keepInput = false) {
        if (!Number.isFinite(degrees)) return;
        const clamped = Math.min(360, Math.max(0, degrees));
        this.config.angle = Math.round(clamped * 100) / 100 * Math.PI / 180;
        this.updateUI(keepInput);
        this.draw();
    }

    updateUI(keepInput = false) {
        const degrees = Number((this.config.angle * 180 / Math.PI).toFixed(2));
        const integer = Math.round(degrees);
        const isInteger = Math.abs(degrees - integer) < 1e-10;
        const exactAngle = isInteger && (integer % 30 === 0 || integer % 45 === 0);
        let radText = `≈ ${(this.config.angle / Math.PI).toFixed(6)}π`;
        if (isInteger && integer % 15 === 0) {
            const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
            const divisor = gcd(integer, 180);
            const numerator = integer / divisor;
            const denominator = 180 / divisor;
            radText = numerator === 0 ? '0' : `${numerator === 1 ? '' : numerator}π${denominator === 1 ? '' : '/' + denominator}`;
        }
        this.ui.angleDeg.textContent = `${degrees}°`;
        this.ui.angleRad.textContent = radText;
        this.ui.currentAngle.forEach(el => { el.textContent = `${degrees}°`; });
        if (!keepInput) this.ui.angleInput.value = degrees;
        this.ui.angleSlider.value = degrees;
        this.unitCanvas.setAttribute('aria-valuenow', degrees);
        this.unitCanvas.setAttribute('aria-valuetext', `${degrees} 度`);
        const formatValue = value => {
            if (exactAngle) {
                const fraction = (a, b) => `<span class="frac"><span class="num">${a}</span><span class="den">${b}</span></span>`;
                const known = [[0, '0'], [1, '1'], [0.5, fraction('1', '2')],
                    [Math.sqrt(2) / 2, fraction('√2', '2')], [Math.sqrt(3) / 2, fraction('√3', '2')],
                    [Math.sqrt(3), '√3'], [Math.sqrt(3) / 3, fraction('√3', '3')]];
                const found = known.find(([number]) => Math.abs(Math.abs(value) - number) < 1e-10);
                if (found) return { html: `${value < -1e-10 ? '−' : ''}${found[1]}`, exact: true };
            }
            return { html: Math.abs(value) < 0.00001 && value !== 0 ? value.toExponential(3) : value.toFixed(5), exact: false };
        };
        const defined = Math.abs(Math.cos(this.config.angle)) >= 1e-12;
        [['sin', Math.sin(this.config.angle)], ['cos', Math.cos(this.config.angle)], ['tan', Math.tan(this.config.angle)]].forEach(([name, value]) => {
            const formatted = name === 'tan' && !defined ? { html: '未定義', exact: true } : formatValue(value);
            this.ui['val' + name[0].toUpperCase() + name.slice(1)].innerHTML = formatted.html;
            document.getElementById('eq-' + name).textContent = name === 'tan' && !defined ? '：' : formatted.exact ? '=' : '≈';
        });
        document.getElementById('identity-sin').textContent = `sin θ = sin(180° − ${degrees}°) = cos(90° − ${degrees}°)`;
        document.getElementById('identity-cos').textContent = `cos θ = cos(360° − ${degrees}°) = sin(90° − ${degrees}°)`;
        document.getElementById('identity-tan').textContent = defined
            ? `tan θ = tan(180° + ${degrees}°) = cot(90° − ${degrees}°)`
            : 'cos θ = 0，此角度的 tan θ 未定義。';
    }

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

        ctx.fillStyle = colors.text;
        ctx.font = '12px sans-serif';
        ctx.fillText('x', width - 16, centerY - 8);
        ctx.fillText('y', centerX + 8, 16);
        ctx.fillText('−1', centerX - radius - 15, centerY + 18);
        ctx.fillText('1', centerX + 8, centerY - radius - 8);
        ctx.fillText('−1', centerX + 8, centerY + radius + 16);
        ctx.fillText('O', centerX - 17, centerY + 18);

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
        ctx.beginPath();
        ctx.strokeStyle = colors.cos;
        ctx.lineWidth = 4;
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(pointX, centerY);
        ctx.stroke();

        // Sine Line (Red, Vertical)
        ctx.beginPath();
        ctx.strokeStyle = colors.sin;
        ctx.lineWidth = 4;
        ctx.moveTo(pointX, centerY);
        ctx.lineTo(pointX, pointY);
        ctx.stroke();

        // Radius Line
        ctx.beginPath();
        ctx.strokeStyle = colors.text;
        ctx.lineWidth = 2;
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(pointX, pointY);
        ctx.stroke();

        // 固定 x=1，端點 (1, tanθ) 的有向高度即為正切。
        const tangentX = centerX + radius;
        ctx.save();
        ctx.beginPath();
        ctx.rect(10, 12, width - 20, height - 24);
        ctx.clip();
        ctx.strokeStyle = colors.tan;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.moveTo(tangentX, 12);
        ctx.lineTo(tangentX, height - 12);
        ctx.stroke();
        ctx.setLineDash([]);
        if (Math.abs(cos) >= 1e-12) {
            const tangentY = centerY - Math.tan(angle) * radius;
            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.moveTo(tangentX, centerY);
            ctx.lineTo(tangentX, tangentY);
            ctx.stroke();
            ctx.beginPath();
            ctx.strokeStyle = colors.text;
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(tangentX, tangentY);
            ctx.stroke();
            ctx.setLineDash([]);
            if (tangentY < 16 || tangentY > height - 16) {
                const tip = tangentY < 16 ? 16 : height - 16;
                const direction = tangentY < 16 ? 1 : -1;
                ctx.beginPath();
                ctx.fillStyle = colors.tan;
                ctx.moveTo(tangentX, tip);
                ctx.lineTo(tangentX - 5, tip + direction * 9);
                ctx.lineTo(tangentX + 5, tip + direction * 9);
                ctx.closePath();
                ctx.fill();
            }
        }
        ctx.restore();
        ctx.fillStyle = colors.tan;
        ctx.font = '12px sans-serif';
        ctx.fillText('x = 1', tangentX + 6, 22);

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
        const width = this.waveCanvas.parentElement.clientWidth;
        const height = this.waveCanvas.parentElement.clientHeight;
        const { colors, angle } = this.config;
        ctx.clearRect(0, 0, width, height);
        const left = 36, right = width - 18, top = 15, bottom = height - 48;
        if (right <= left || bottom <= top) return;
        const xFor = radians => left + radians / (2 * Math.PI) * (right - left);
        const yFor = value => (top + bottom) / 2 - value * (bottom - top) / 4;
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'right';
        for (let value = -2; value <= 2; value++) {
            ctx.beginPath();
            ctx.strokeStyle = value === 0 ? colors.axis : colors.grid;
            ctx.lineWidth = 1;
            ctx.moveTo(left, yFor(value));
            ctx.lineTo(right, yFor(value));
            ctx.stroke();
            ctx.fillStyle = colors.text;
            ctx.fillText(value, left - 7, yFor(value) + 4);
        }
        ctx.textAlign = 'center';
        const radLabels = ['0', 'π/2', 'π', '3π/2', '2π'];
        for (let i = 0; i <= 4; i++) {
            const x = xFor(i * Math.PI / 2);
            ctx.beginPath();
            ctx.strokeStyle = colors.grid;
            ctx.moveTo(x, top);
            ctx.lineTo(x, bottom);
            ctx.stroke();
            ctx.fillStyle = colors.text;
            ctx.fillText(`${i * 90}°`, x, bottom + 18);
            ctx.fillText(radLabels[i], x, bottom + 34);
        }
        ctx.setLineDash([4, 5]);
        ctx.strokeStyle = colors.tan;
        [Math.PI / 2, 3 * Math.PI / 2].forEach(radians => {
            ctx.beginPath();
            ctx.moveTo(xFor(radians), top);
            ctx.lineTo(xFor(radians), bottom);
            ctx.stroke();
        });
        ctx.setLineDash([]);
        ctx.save();
        ctx.beginPath();
        ctx.rect(left, top, right - left, bottom - top);
        ctx.clip();
        const indicatorX = xFor(angle);
        ctx.beginPath();
        ctx.strokeStyle = colors.text;
        ctx.setLineDash([3, 4]);
        ctx.moveTo(indicatorX, top);
        ctx.lineTo(indicatorX, bottom);
        ctx.stroke();
        ctx.setLineDash([]);
        const plot = (name, func) => {
            ctx.beginPath();
            ctx.strokeStyle = colors[name];
            ctx.lineWidth = 2;
            let connected = false, previousBranch = null;
            const samples = Math.ceil((right - left) * 2);
            for (let i = 0; i <= samples; i++) {
                const radians = i / samples * 2 * Math.PI;
                const value = func(radians);
                const branch = Math.floor((radians + Math.PI / 2) / Math.PI);
                if (Math.abs(value) > 2 || (name === 'tan' && Math.abs(Math.cos(radians)) < 1e-12)) {
                    connected = false;
                    continue;
                }
                if (!connected || (name === 'tan' && branch !== previousBranch)) ctx.moveTo(xFor(radians), yFor(value));
                else ctx.lineTo(xFor(radians), yFor(value));
                connected = true;
                previousBranch = branch;
            }
            ctx.stroke();
            if (name === 'tan' && Math.abs(Math.cos(angle)) < 1e-12) return;
            const value = func(angle);
            ctx.fillStyle = colors[name];
            ctx.beginPath();
            if (Math.abs(value) <= 2) {
                ctx.arc(indicatorX, yFor(value), 4, 0, Math.PI * 2);
            } else {
                const tip = value > 0 ? top + 2 : bottom - 2;
                const direction = value > 0 ? 1 : -1;
                ctx.moveTo(indicatorX, tip);
                ctx.lineTo(indicatorX - 5, tip + direction * 9);
                ctx.lineTo(indicatorX + 5, tip + direction * 9);
                ctx.closePath();
            }
            ctx.fill();
        };
        plot('sin', Math.sin);
        plot('cos', Math.cos);
        plot('tan', Math.tan);
        ctx.restore();
        ctx.textAlign = 'start';
    }
}

document.addEventListener('DOMContentLoaded', () => { new TrigApp(); });
