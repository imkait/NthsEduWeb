/**
 * =============================================
 * 減數分裂互動教學網頁 - JavaScript 腳本
 * =============================================
 * 
 * 此腳本包含以下功能模組：
 * 1. 粒子背景動畫 (ParticleBackground)
 * 2. 減數分裂動畫模擬器 (MeiosisSimulator)
 * 3. 染色體互換拖放遊戲 (CrossingOverGame)
 * 4. 翻牌比較卡片 (FlipCards)
 * 5. 互動測驗系統 (QuizManager)
 * 6. 滾動顯示動畫 (ScrollReveal)
 * 7. 導覽列功能 (Navigation)
 */

'use strict';

// =============================================
// 1. 粒子背景動畫
// =============================================
class ParticleBackground {
    /**
     * 建構粒子背景動畫
     * @param {string} canvasId - Canvas 元素的 ID
     */
    constructor(canvasId) {
        // 取得 Canvas 元素與繪圖上下文
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = []; // 儲存所有粒子
        this.particleCount = 50; // 粒子數量

        // 初始化並開始動畫
        this.init();
        this.animate();

        // 監聽視窗大小變化
        window.addEventListener('resize', () => this.resize());
    }

    /**
     * 初始化 Canvas 尺寸並建立粒子
     */
    init() {
        this.resize();
        this.createParticles();
    }

    /**
     * 調整 Canvas 尺寸以符合視窗大小
     */
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    /**
     * 建立所有粒子
     */
    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,    // 隨機 X 座標
                y: Math.random() * this.canvas.height,   // 隨機 Y 座標
                radius: Math.random() * 2 + 1,           // 隨機半徑 (1-3)
                vx: (Math.random() - 0.5) * 0.5,         // X 方向速度
                vy: (Math.random() - 0.5) * 0.5,         // Y 方向速度
                alpha: Math.random() * 0.5 + 0.2         // 透明度 (0.2-0.7)
            });
        }
    }

    /**
     * 動畫迴圈 - 每幀更新並繪製粒子
     */
    animate() {
        // 清除畫布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 更新並繪製每個粒子
        this.particles.forEach(particle => {
            // 更新位置
            particle.x += particle.vx;
            particle.y += particle.vy;

            // 邊界檢測 - 超出邊界則從另一側出現
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;

            // 繪製粒子
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(59, 130, 246, ${particle.alpha})`;
            this.ctx.fill();
        });

        // 使用 requestAnimationFrame 進行下一幀
        requestAnimationFrame(() => this.animate());
    }
}

// =============================================
// 2. 減數分裂動畫模擬器
// =============================================
class MeiosisSimulator {
    /**
     * 建構減數分裂模擬器
     */
    constructor() {
        // 取得 DOM 元素
        this.svg = document.getElementById('meiosis-svg');
        this.chromosomesGroup = document.getElementById('chromosomes-group');
        this.stageLabel = document.getElementById('stage-label');
        this.progressFill = document.getElementById('progress-fill');
        this.progressSteps = document.getElementById('progress-steps');
        this.infoTitle = document.getElementById('info-title');
        this.infoDescription = document.getElementById('info-description');
        this.infoHighlights = document.getElementById('info-highlights');

        // 控制按鈕
        this.btnPlay = document.getElementById('btn-play');
        this.btnPrev = document.getElementById('btn-prev');
        this.btnNext = document.getElementById('btn-next');
        this.btnReset = document.getElementById('btn-reset');
        this.speedSlider = document.getElementById('speed-slider');
        this.speedValue = document.getElementById('speed-value');

        // 檢查必要元素是否存在
        if (!this.svg || !this.btnPlay) return;

        // 狀態變數
        this.currentStage = 0;    // 目前階段索引
        this.isPlaying = false;   // 是否正在播放
        this.speed = 1;           // 播放速度
        this.animationInterval = null;

        // 定義所有減數分裂階段
        this.stages = [
            {
                name: '間期',
                title: '間期 (Interphase)',
                description: '細胞在進行減數分裂前，DNA 會先進行複製，形成由兩條姊妹染色分體組成的染色體。此時染色質呈散開狀態。',
                highlights: ['DNA 複製', '染色體形成', '細胞生長']
            },
            {
                name: '第一階段：前期',
                title: '第一階段：前期 (Prophase I)',
                description: '這是最關鍵的時期！同源染色體配對形成「聯會複合體」，並發生「互換」(Crossing Over)，交換遺傳物質。',
                highlights: ['同源染色體配對', '聯會', '互換']
            },
            {
                name: '第一階段：中期',
                title: '第一階段：中期 (Metaphase I)',
                description: '同源染色體對排列在細胞赤道板上，紡錘絲分別從兩極連接到每條同源染色體的著絲點（動粒），準備將同源染色體拉向兩極。',
                highlights: ['赤道板排列', '紡錘絲形成']
            },
            {
                name: '第一階段：後期',
                title: '第一階段：後期 (Anaphase I)',
                description: '同源染色體分離，移向細胞兩極。注意：此時姊妹染色分體仍然相連，這是染色體數目減半的關鍵步驟！',
                highlights: ['同源染色體分離', '染色體數目減半']
            },
            {
                name: '第一階段：末期',
                title: '第一階段：末期 (Telophase I)',
                description: '染色體到達兩極，細胞開始分裂成兩個子細胞，每個子細胞含有一半數量的染色體（但每條染色體仍由姊妹染色分體組成）。',
                highlights: ['細胞質分裂', '形成兩個子細胞']
            },
            {
                name: '第二階段：前期',
                title: '第二階段：前期 (Prophase II)',
                description: '兩個子細胞進入第二次分裂，紡錘絲再度形成。這次不需要 DNA 複製，因為染色體已經是複製過的。',
                highlights: ['紡錘絲形成', '無 DNA 複製']
            },
            {
                name: '第二階段：中期',
                title: '第二階段：中期 (Metaphase II)',
                description: '染色體排列於赤道板上，與有絲分裂類似。紡錘絲附著在姊妹染色分體的著絲點上。',
                highlights: ['赤道板排列', '類似有絲分裂']
            },
            {
                name: '第二階段：後期',
                title: '第二階段：後期 (Anaphase II)',
                description: '姊妹染色分體分離，成為獨立的染色體，向細胞兩極移動。',
                highlights: ['姊妹染色分體分離']
            },
            {
                name: '第二階段：末期',
                title: '第二階段：末期 (Telophase II)',
                description: '分裂完成！形成 4 個單倍體子細胞，每個細胞的染色體數目是原來的一半，且遺傳組成各不相同。',
                highlights: ['4 個子細胞', '單倍體 (n)', '遺傳多樣性']
            }
        ];

        // 初始化
        this.init();
    }

    /**
     * 初始化模擬器
     */
    init() {
        this.createProgressSteps();
        this.bindEvents();
        this.renderStage(0);
    }

    /**
     * 建立進度步驟點
     */
    createProgressSteps() {
        this.progressSteps.innerHTML = '';
        this.stages.forEach((stage, index) => {
            const step = document.createElement('div');
            step.className = 'progress-step' + (index === 0 ? ' active' : '');
            step.title = stage.name;
            step.addEventListener('click', () => this.goToStage(index));
            this.progressSteps.appendChild(step);
        });
    }

    /**
     * 綁定事件監聽器
     */
    bindEvents() {
        // 播放/暫停按鈕
        this.btnPlay.addEventListener('click', () => this.togglePlay());

        // 上一步/下一步按鈕
        this.btnPrev.addEventListener('click', () => this.prevStage());
        this.btnNext.addEventListener('click', () => this.nextStage());

        // 重置按鈕
        this.btnReset.addEventListener('click', () => this.reset());

        // 速度滑桿
        this.speedSlider.addEventListener('input', (e) => {
            this.speed = parseFloat(e.target.value);
            this.speedValue.textContent = this.speed + 'x';
            // 若正在自動播放，先停止再重新啟動，使新速度立即生效
            if (this.isPlaying) {
                this.stopAutoPlay();
                this.startAutoPlay();
            }
        });
    }

    /**
     * 切換播放/暫停狀態
     */
    togglePlay() {
        this.isPlaying = !this.isPlaying;

        // 更新按鈕圖示
        const playIcon = this.btnPlay.querySelector('.icon-play');
        const pauseIcon = this.btnPlay.querySelector('.icon-pause');

        if (this.isPlaying) {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
            this.startAutoPlay();
        } else {
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
            this.stopAutoPlay();
        }
    }

    /**
     * 開始自動播放
     */
    startAutoPlay() {
        const baseInterval = 3000; // 基本間隔 3 秒
        const interval = baseInterval / this.speed;

        this.animationInterval = setInterval(() => {
            if (this.currentStage < this.stages.length - 1) {
                this.nextStage();
            } else {
                this.stopAutoPlay();
                this.isPlaying = false;
                this.btnPlay.querySelector('.icon-play').classList.remove('hidden');
                this.btnPlay.querySelector('.icon-pause').classList.add('hidden');
            }
        }, interval);
    }

    /**
     * 停止自動播放
     */
    stopAutoPlay() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
    }

    /**
     * 前往上一階段
     */
    prevStage() {
        if (this.currentStage > 0) {
            this.goToStage(this.currentStage - 1);
        }
    }

    /**
     * 前往下一階段
     */
    nextStage() {
        if (this.currentStage < this.stages.length - 1) {
            this.goToStage(this.currentStage + 1);
        }
    }

    /**
     * 前往指定階段
     * @param {number} index - 階段索引
     */
    goToStage(index) {
        this.currentStage = index;
        this.renderStage(index);
        this.updateProgress();
    }

    /**
     * 重置模擬器
     */
    reset() {
        this.stopAutoPlay();
        this.isPlaying = false;
        this.btnPlay.querySelector('.icon-play').classList.remove('hidden');
        this.btnPlay.querySelector('.icon-pause').classList.add('hidden');
        this.goToStage(0);
    }

    /**
     * 更新進度顯示
     */
    updateProgress() {
        // 更新進度條
        const progress = ((this.currentStage + 1) / this.stages.length) * 100;
        this.progressFill.style.width = progress + '%';

        // 更新步驟點
        const steps = this.progressSteps.querySelectorAll('.progress-step');
        steps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index < this.currentStage) {
                step.classList.add('completed');
            } else if (index === this.currentStage) {
                step.classList.add('active');
            }
        });
    }

    /**
     * 渲染指定階段的視覺效果
     * @param {number} index - 階段索引
     */
    renderStage(index) {
        const stage = this.stages[index];

        // 更新階段標籤
        this.stageLabel.textContent = stage.name;

        // 更新資訊面板
        this.infoTitle.textContent = stage.title;
        this.infoDescription.textContent = stage.description;
        this.infoHighlights.innerHTML = stage.highlights
            .map(h => `<span class="highlight-tag">${h}</span>`)
            .join('');

        // 渲染染色體動畫
        this.renderChromosomes(index);
    }

    /**
     * 渲染染色體視覺效果
     * @param {number} stageIndex - 階段索引
     * 
     * 染色體配色說明：
     * - 長染色體對：藍色(父源) + 紅色(母源)
     * - 短染色體對：淺藍色(父源) + 淺紅色(母源)
     */
    renderChromosomes(stageIndex) {
        // 根據階段繪製不同的染色體配置
        // 長染色體高度 80px，短染色體高度 50px
        // 藍色系(父源)、紅色系(母源)

        let svgContent = '';

        switch (stageIndex) {
            case 0: // 間期 - 染色質散開
                svgContent = `
                    <g class="interphase-chromosomes" style="opacity: 0.7;">
                        <!-- 長染色體對的染色質 -->
                        <circle cx="320" cy="220" r="50" fill="none" stroke="url(#chr-blue)" stroke-width="3" stroke-dasharray="10,5"/>
                        <circle cx="380" cy="240" r="50" fill="none" stroke="url(#chr-red)" stroke-width="3" stroke-dasharray="10,5"/>
                        <!-- 短染色體對的染色質 -->
                        <circle cx="420" cy="280" r="35" fill="none" stroke="#93c5fd" stroke-width="3" stroke-dasharray="8,4"/>
                        <circle cx="480" cy="260" r="35" fill="none" stroke="#fca5a5" stroke-width="3" stroke-dasharray="8,4"/>
                        <text x="400" y="380" fill="#6b7280" font-size="12" text-anchor="middle">DNA 複製中...</text>
                        <!-- 染色體/DNA數目標示 -->                        
                        <text x="550" y="160" fill="#facc15" font-size="13" font-weight="bold">染色質複製(S期)</text>                        
                        <text x="550" y="180" fill="#d381e6ff" font-size="13" font-weight="bold">中心體複製(G2期)</text>
                        <text x="550" y="200" fill="#22c55e" font-size="13" font-weight="bold">2N/2a->2N/4a</text>

                    </g>
                `;
                break;

            case 1: // 前期 I - 同源染色體配對
                svgContent = `
                    <g class="prophase-i">
                        <!-- 長染色體對 (藍+紅) - 高度 80 -->
                        <g transform="translate(280, 180)">
                            <!-- 藍色(父源) 姊妹染色分體 - )( 形狀，中間交會 -->
                            <path d="M 0 0 Q 10 40 0 80" stroke="url(#chr-blue)" stroke-width="10" fill="none" stroke-linecap="round"/>
                            <path d="M 15 0 Q 5 40 15 80" stroke="url(#chr-blue)" stroke-width="10" fill="none" stroke-linecap="round"/>
                            <!-- 著絲點（中節）-->
                            <ellipse cx="7" cy="40" rx="12" ry="6" fill="#1e40af" stroke="#fff" stroke-width="1"/>
                            <!-- 紅色(母源) 姊妹染色分體 - )( 形狀，中間交會 -->
                            <path d="M 35 0 Q 45 40 35 80" stroke="url(#chr-red)" stroke-width="10" fill="none" stroke-linecap="round"/>
                            <path d="M 50 0 Q 40 40 50 80" stroke="url(#chr-red)" stroke-width="10" fill="none" stroke-linecap="round"/>
                            <!-- 著絲點（中節）-->
                            <ellipse cx="43" cy="40" rx="12" ry="6" fill="#991b1b" stroke="#fff" stroke-width="1"/>
                            <!-- 聯會複合體 -->
                            <ellipse cx="25" cy="40" rx="35" ry="10" fill="rgba(255,255,255,0.15)"/>
                            <text x="25" y="-10" fill="#f59e0b" font-size="10" text-anchor="middle">長染色體</text>
                        </g>
                        <!-- 短染色體對 (淺藍+淺紅) - 高度 50 -->
                        <g transform="translate(430, 200)">
                            <!-- 淺藍色(父源) 姊妹染色分體 - )( 形狀，中間交會 -->
                            <path d="M 0 0 Q 8 25 0 50" stroke="#93c5fd" stroke-width="8" fill="none" stroke-linecap="round"/>
                            <path d="M 12 0 Q 4 25 12 50" stroke="#93c5fd" stroke-width="8" fill="none" stroke-linecap="round"/>
                            <!-- 著絲點（中節）-->
                            <ellipse cx="6" cy="25" rx="10" ry="5" fill="#1e40af" stroke="#fff" stroke-width="1"/>
                            <!-- 淺紅色(母源) 姊妹染色分體 - )( 形狀，中間交會 -->
                            <path d="M 28 0 Q 36 25 28 50" stroke="#fca5a5" stroke-width="8" fill="none" stroke-linecap="round"/>
                            <path d="M 40 0 Q 32 25 40 50" stroke="#fca5a5" stroke-width="8" fill="none" stroke-linecap="round"/>
                            <!-- 著絲點（中節）-->
                            <ellipse cx="34" cy="25" rx="10" ry="5" fill="#991b1b" stroke="#fff" stroke-width="1"/>
                            <!-- 聯會複合體 -->
                            <ellipse cx="20" cy="25" rx="28" ry="8" fill="rgba(255,255,255,0.15)"/>
                            <text x="20" y="-10" fill="#f59e0b" font-size="10" text-anchor="middle">短染色體</text>
                        </g>
                        <!-- 互換標示 -->
                        <text x="400" y="320" fill="#f59e0b" font-size="14" text-anchor="middle">⟵ 互換 (Crossing Over) ⟶</text>
                        <!-- 染色體/DNA數目標示 -->
                        <text x="250" y="120" fill="#facc15" font-size="13" font-weight="bold">二分體：1個中節連接姐妹染色分體</text>  
                        <text x="250" y="140" fill="#87dae9ff" font-size="13" font-weight="bold">四分體：1對同源姐妹染色分體(2個中節)，由聯會複合體連接</text>
                        <text x="200" y="360" fill="#b4b8b9ff" font-size="13" font-weight="bold">聯會複合體：位於兩條同源染色體之間(圖中淺灰色），幫助互換</text>
                        <text x="550" y="200" fill="#22c55e" font-size="14" font-weight="bold">2N / 4a</text>

                    </g>
                `;
                break;

            case 2: // 中期 I - 赤道板排列
                svgContent = `
                    <!-- ===== 左側中心體 (紡錘絲交會點) ===== -->
                    <g class="centrosome-left">
                        <circle cx="80" cy="250" r="6" fill="#fbbf24" opacity="0.9"/>
                        <circle cx="80" cy="250" r="12" fill="none" stroke="#fbbf24" stroke-width="1" opacity="0.3"/>
                        <text x="80" y="275" fill="#fbbf24" font-size="10" text-anchor="middle">中心體</text>
                    </g>
                    <!-- ===== 右側中心體 (紡錘絲交會點) ===== -->
                    <g class="centrosome-right">
                        <circle cx="720" cy="250" r="6" fill="#fbbf24" opacity="0.9"/>
                        <circle cx="720" cy="250" r="12" fill="none" stroke="#fbbf24" stroke-width="1" opacity="0.3"/>
                        <text x="720" y="275" fill="#fbbf24" font-size="10" text-anchor="middle">中心體</text>
                    </g>

                    <!-- 紡錘絲 - 著絲點 → 左側中心體(80,250) - 大弧度曲線匯聚 -->
                    <g class="spindle-fibers-left" opacity="0.6">
                        <!-- 長染色體藍色(父源)著絲點(376,190) → 左中心體(80,250) -->
                        <path d="M 376 190 C 300 140, 150 180, 80 250" stroke="#3b82f6" stroke-width="1.5" fill="none"/>
                        <path d="M 376 190 C 310 170, 160 210, 80 250" stroke="#3b82f6" stroke-width="1.5" fill="none"/>
                        <path d="M 376 190 C 320 210, 170 250, 80 250" stroke="#3b82f6" stroke-width="1.5" fill="none"/>
                        <!-- 短染色體淺藍色(父源)著絲點(380,300) → 左中心體(80,250) -->
                        <path d="M 380 300 C 310 340, 150 310, 80 250" stroke="#93c5fd" stroke-width="1.5" fill="none"/>
                        <path d="M 380 300 C 320 320, 160 290, 80 250" stroke="#93c5fd" stroke-width="1.5" fill="none"/>
                    </g>

                    <!-- 紡錘絲 - 著絲點 → 右側中心體(720,250) - 大弧度曲線匯聚 -->
                    <g class="spindle-fibers-right" opacity="0.6">
                        <!-- 長染色體紅色(母源)著絲點(424,190) → 右中心體(720,250) -->
                        <path d="M 424 190 C 500 140, 650 180, 720 250" stroke="#ef4444" stroke-width="1.5" fill="none"/>
                        <path d="M 424 190 C 490 170, 640 210, 720 250" stroke="#ef4444" stroke-width="1.5" fill="none"/>
                        <path d="M 424 190 C 480 210, 630 250, 720 250" stroke="#ef4444" stroke-width="1.5" fill="none"/>
                        <!-- 短染色體淺紅色(母源)著絲點(420,300) → 右中心體(720,250) -->
                        <path d="M 420 300 C 490 340, 650 310, 720 250" stroke="#fca5a5" stroke-width="1.5" fill="none"/>
                        <path d="M 420 300 C 480 320, 640 290, 720 250" stroke="#fca5a5" stroke-width="1.5" fill="none"/>
                    </g>
                    <!-- 赤道板標示 (放在染色體後面) -->
                    <line x1="400" y1="130" x2="400" y2="400" stroke="#22d3ee" stroke-width="2" stroke-dasharray="5,5"/>
                    <g class="metaphase-i">
                        <!-- 長染色體對 (四分體/Bivalent) - 橫跨赤道板 -->
                        <g transform="translate(370, 155)">
                            <!-- 藍色(父源)染色體 - 左側 - )( 形狀 -->
                            <path d="M 0 5 Q 8 35 0 65" stroke="url(#chr-blue)" stroke-width="10" fill="none" stroke-linecap="round"/>
                            <path d="M 12 0 Q 4 35 12 70" stroke="url(#chr-blue)" stroke-width="10" fill="none" stroke-linecap="round"/>
                            <!-- 紅色(母源)染色體 - 右側 - )( 形狀 -->
                            <path d="M 48 5 Q 56 35 48 65" stroke="url(#chr-red)" stroke-width="10" fill="none" stroke-linecap="round"/>
                            <path d="M 60 0 Q 52 35 60 70" stroke="url(#chr-red)" stroke-width="10" fill="none" stroke-linecap="round"/>
                            <!-- 聯會區域 (Chiasma) -->
                            <ellipse cx="30" cy="35" rx="22" ry="8" fill="rgba(255,255,255,0.2)" stroke="#fbbf24" stroke-width="1" stroke-dasharray="3,2"/>
                            <!-- 著絲點 (Kinetochore) - 藍色染色體 -->
                            <ellipse cx="6" cy="35" rx="8" ry="4" fill="#1e3a8a" stroke="#fff" stroke-width="1"/>
                            <!-- 著絲點 (Kinetochore) - 紅色染色體 -->
                            <ellipse cx="54" cy="35" rx="8" ry="4" fill="#7f1d1d" stroke="#fff" stroke-width="1"/>
                            <text x="30" y="-8" fill="#f59e0b" font-size="9" text-anchor="middle">長染色體四分體</text>
                        </g>
                        <!-- 短染色體對 (四分體/Bivalent) - 橫跨赤道板 -->
                        <g transform="translate(375, 280)">
                            <!-- 淺藍色(父源)染色體 - 左側 - )( 形狀 -->
                            <path d="M 0 3 Q 6 20 0 37" stroke="#93c5fd" stroke-width="8" fill="none" stroke-linecap="round"/>
                            <path d="M 10 0 Q 4 20 10 40" stroke="#93c5fd" stroke-width="8" fill="none" stroke-linecap="round"/>
                            <!-- 淺紅色(母源)染色體 - 右側 - )( 形狀 -->
                            <path d="M 40 3 Q 46 20 40 37" stroke="#fca5a5" stroke-width="8" fill="none" stroke-linecap="round"/>
                            <path d="M 50 0 Q 44 20 50 40" stroke="#fca5a5" stroke-width="8" fill="none" stroke-linecap="round"/>
                            <!-- 聯會區域 (Chiasma) -->
                            <ellipse cx="25" cy="20" rx="18" ry="6" fill="rgba(255,255,255,0.2)" stroke="#fbbf24" stroke-width="1" stroke-dasharray="3,2"/>
                            <!-- 著絲點 (Kinetochore) - 淺藍色染色體 -->
                            <ellipse cx="5" cy="20" rx="6" ry="3" fill="#1e40af" stroke="#fff" stroke-width="1"/>
                            <!-- 著絲點 (Kinetochore) - 淺紅色染色體 -->
                            <ellipse cx="45" cy="20" rx="6" ry="3" fill="#991b1b" stroke="#fff" stroke-width="1"/>
                            <text x="25" y="-8" fill="#f59e0b" font-size="9" text-anchor="middle">短染色體四分體</text>
                        </g>
                    </g>
                    <!-- 標示文字 -->
                    <text x="400" y="420" fill="#22d3ee" font-size="12" text-anchor="middle">赤道板 (Metaphase Plate)</text>
                    <text x="250" y="110" fill="#facc15" font-size="13" font-weight="bold">同源染色體聯會並被紡錘絲拉扯，排列於赤道板(中期板)</text>  
                    <!-- 染色體/DNA數目標示 -->
                    <text x="700" y="150" fill="#22c55e" font-size="14" font-weight="bold">2N / 4a</text>

                `;
                break;

            case 3: // 後期 I - 同源染色體分離
                svgContent = `
                    <!-- 紡錘絲 -->
                    <g class="spindle-fibers" opacity="0.4">
                        <line x1="80" y1="250" x2="180" y2="250" stroke="#6b7280" stroke-width="1"/>
                        <line x1="720" y1="250" x2="620" y2="250" stroke="#6b7280" stroke-width="1"/>
                    </g>
                    <g class="anaphase-i">
                        <!-- 左側：藍色長 + 淺藍色短 (父源) -->
                        <g transform="translate(160, 190)">
                            <!-- 藍色長染色體 - )( 形狀 -->
                            <path d="M 0 0 Q 10 35 0 70" stroke="url(#chr-blue)" stroke-width="10" fill="none" stroke-linecap="round"/>
                            <path d="M 15 0 Q 5 35 15 70" stroke="url(#chr-blue)" stroke-width="10" fill="none" stroke-linecap="round"/>
                            <!-- 著絲點（中節）-->
                            <ellipse cx="7" cy="35" rx="12" ry="5" fill="#1e40af" stroke="#fff" stroke-width="1"/>
                        </g>
                        <g transform="translate(215, 210)">
                            <!-- 淺藍色短染色體 - )( 形狀 -->
                            <path d="M 0 0 Q 6 20 0 40" stroke="#93c5fd" stroke-width="8" fill="none" stroke-linecap="round"/>
                            <path d="M 12 0 Q 6 20 12 40" stroke="#93c5fd" stroke-width="8" fill="none" stroke-linecap="round"/>
                            <!-- 著絲點（中節）-->
                            <ellipse cx="6" cy="20" rx="10" ry="4" fill="#1e40af" stroke="#fff" stroke-width="1"/>
                        </g>
                        <!-- 右側：紅色長 + 淺紅色短 (母源) -->
                        <g transform="translate(560, 190)">
                            <!-- 紅色長染色體 - )( 形狀 -->
                            <path d="M 0 0 Q 10 35 0 70" stroke="url(#chr-red)" stroke-width="10" fill="none" stroke-linecap="round"/>
                            <path d="M 15 0 Q 5 35 15 70" stroke="url(#chr-red)" stroke-width="10" fill="none" stroke-linecap="round"/>
                            <!-- 著絲點（中節）-->
                            <ellipse cx="7" cy="35" rx="12" ry="5" fill="#991b1b" stroke="#fff" stroke-width="1"/>
                        </g>
                        <g transform="translate(610, 210)">
                            <!-- 淺紅色短染色體 - )( 形狀 -->
                            <path d="M 0 0 Q 6 20 0 40" stroke="#fca5a5" stroke-width="8" fill="none" stroke-linecap="round"/>
                            <path d="M 12 0 Q 6 20 12 40" stroke="#fca5a5" stroke-width="8" fill="none" stroke-linecap="round"/>
                            <!-- 著絲點（中節）-->
                            <ellipse cx="6" cy="20" rx="10" ry="4" fill="#991b1b" stroke="#fff" stroke-width="1"/>
                        </g>
                    </g>

                    <!-- ===== 左極中心體 (紡錘絲交會點) ===== -->
                    <g class="centrosome-left">
                        <circle cx="80" cy="250" r="5" fill="#fbbf24" opacity="0.9"/>
                        <circle cx="80" cy="250" r="10" fill="none" stroke="#fbbf24" stroke-width="0.8" opacity="0.3"/>
                    </g>
                    <!-- ===== 右極中心體 (紡錘絲交會點) ===== -->
                    <g class="centrosome-right">
                        <circle cx="720" cy="250" r="5" fill="#fbbf24" opacity="0.9"/>
                        <circle cx="720" cy="250" r="10" fill="none" stroke="#fbbf24" stroke-width="0.8" opacity="0.3"/>
                    </g>

                    <!-- 紡錘絲 — 左極(80,250) 拉動父源藍色染色體 -->
                    <g class="spindle-left" opacity="0.55">
                        <!-- 長藍著絲點(167,225) → 左極 -->
                        <path d="M 167 225 C 135 190, 100 210, 80 250" stroke="#3b82f6" stroke-width="1.5" fill="none"/>
                        <path d="M 167 225 C 140 215, 105 235, 80 250" stroke="#3b82f6" stroke-width="1.5" fill="none"/>
                        <!-- 短藍著絲點(221,230) → 左極 -->
                        <path d="M 221 230 C 175 270, 110 275, 80 250" stroke="#93c5fd" stroke-width="1.5" fill="none"/>
                        <path d="M 221 230 C 180 255, 115 260, 80 250" stroke="#93c5fd" stroke-width="1.5" fill="none"/>
                    </g>

                    <!-- 紡錘絲 — 右極(720,250) 拉動母源紅色染色體 -->
                    <g class="spindle-right" opacity="0.55">
                        <!-- 長紅著絲點(567,225) → 右極 -->
                        <path d="M 567 225 C 600 190, 690 210, 720 250" stroke="#ef4444" stroke-width="1.5" fill="none"/>
                        <path d="M 567 225 C 595 215, 685 235, 720 250" stroke="#ef4444" stroke-width="1.5" fill="none"/>
                        <!-- 短紅著絲點(616,230) → 右極 -->
                        <path d="M 616 230 C 650 270, 700 275, 720 250" stroke="#fca5a5" stroke-width="1.5" fill="none"/>
                        <path d="M 616 230 C 645 255, 695 260, 720 250" stroke="#fca5a5" stroke-width="1.5" fill="none"/>
                    </g>
                    <!-- 箭頭標示 -->
                    <text x="180" y="160" fill="#22d3ee" font-size="20">←</text>
                    <text x="600" y="160" fill="#22d3ee" font-size="20">→</text>
                    <text x="400" y="380" fill="#f59e0b" font-size="12" text-anchor="middle">染色體數目減半！</text>
                    <!-- 染色體/DNA數目標示 -->
                    <text x="190" y="400" fill="#22c55e" font-size="12" font-weight="bold" text-anchor="middle">N / 2a</text>
                    <text x="580" y="400" fill="#22c55e" font-size="12" font-weight="bold" text-anchor="middle">N / 2a</text>
                    <text x="400" y="400" fill="#f59e0b" font-size="11" text-anchor="middle">2N/4a → N/2a</text>
                    <text x="200" y="120" fill="#facc15" font-size="13" font-weight="bold">同源染色體被紡錘絲往兩極拉開，各自以二分體形式是被搬運到細胞兩側</text>  

                `;
                break;

            case 4: // 末期 I - 形成兩個細胞
                svgContent = `
                    <g class="telophase-i">
                        <!-- 左側細胞 (父源：藍色長 + 淺藍色短) -->
                        <ellipse cx="200" cy="250" rx="140" ry="120" fill="none" stroke="url(#membrane-gradient)" stroke-width="3"/>
                        <g transform="translate(155, 200)">
                            <!-- 藍色長染色體 - )( 形狀 -->
                            <path d="M 0 0 Q 8 30 0 60" stroke="url(#chr-blue)" stroke-width="8" fill="none" stroke-linecap="round"/>
                            <path d="M 12 0 Q 4 30 12 60" stroke="url(#chr-blue)" stroke-width="8" fill="none" stroke-linecap="round"/>
                            <!-- 著絲點（中節）-->
                            <ellipse cx="6" cy="30" rx="10" ry="4" fill="#1e40af" stroke="#fff" stroke-width="1"/>
                        </g>
                        <g transform="translate(205, 215)">
                            <!-- 淺藍色短染色體 - )( 形狀 -->
                            <path d="M 0 0 Q 5 17 0 35" stroke="#93c5fd" stroke-width="6" fill="none" stroke-linecap="round"/>
                            <path d="M 10 0 Q 5 17 10 35" stroke="#93c5fd" stroke-width="6" fill="none" stroke-linecap="round"/>
                            <!-- 著絲點（中節）-->
                            <ellipse cx="5" cy="17" rx="8" ry="3" fill="#1e40af" stroke="#fff" stroke-width="1"/>
                        </g>
                        
                        <!-- 右側細胞 (母源：紅色長 + 淺紅色短) -->
                        <ellipse cx="600" cy="250" rx="140" ry="120" fill="none" stroke="url(#membrane-gradient)" stroke-width="3"/>
                        <g transform="translate(555, 200)">
                            <!-- 紅色長染色體 - )( 形狀 -->
                            <path d="M 0 0 Q 8 30 0 60" stroke="url(#chr-red)" stroke-width="8" fill="none" stroke-linecap="round"/>
                            <path d="M 12 0 Q 4 30 12 60" stroke="url(#chr-red)" stroke-width="8" fill="none" stroke-linecap="round"/>
                            <!-- 著絲點（中節）-->
                            <ellipse cx="6" cy="30" rx="10" ry="4" fill="#991b1b" stroke="#fff" stroke-width="1"/>
                        </g>
                        <g transform="translate(605, 215)">
                            <!-- 淺紅色短染色體 - )( 形狀 -->
                            <path d="M 0 0 Q 5 17 0 35" stroke="#fca5a5" stroke-width="6" fill="none" stroke-linecap="round"/>
                            <path d="M 10 0 Q 5 17 10 35" stroke="#fca5a5" stroke-width="6" fill="none" stroke-linecap="round"/>
                            <!-- 著絲點（中節）-->
                            <ellipse cx="5" cy="17" rx="8" ry="3" fill="#991b1b" stroke="#fff" stroke-width="1"/>
                        </g>
                    </g>
                    
                    <!-- 染色體/DNA數目標示 -->
                    <text x="200" y="390" fill="#22c55e" font-size="12" font-weight="bold" text-anchor="middle">N / 2a</text>                
                    <text x="600" y="390" fill="#22c55e" font-size="12" font-weight="bold" text-anchor="middle">N / 2a</text>
                    <text x="250" y="120" fill="#facc15" font-size="13" font-weight="bold">紡錘絲消失，核膜重新出現，逐漸分裂成兩個細胞</text>  
                `;
                break;

            case 5: // 前期 II
                svgContent = `
                    <g class="prophase-ii">
                        <!-- 左側細胞 -->
                        <ellipse cx="200" cy="250" rx="140" ry="120" fill="none" stroke="url(#membrane-gradient)" stroke-width="3"/>
                        <g transform="translate(155, 210)">
                            <!-- 藍色長染色體 - )( 形狀 -->
                            <path d="M 0 0 Q 6 22 0 45" stroke="url(#chr-blue)" stroke-width="7" fill="none" stroke-linecap="round"/>
                            <path d="M 10 0 Q 4 22 10 45" stroke="url(#chr-blue)" stroke-width="7" fill="none" stroke-linecap="round"/>
                            <!-- 著絲點（中節）-->
                            <ellipse cx="5" cy="22" rx="10" ry="4" fill="#1e40af" stroke="#fff" stroke-width="1"/>
                        </g>
                        <g transform="translate(210, 220)">
                            <!-- 淺藍色短染色體 - )( 形狀 -->
                            <path d="M 0 0 Q 4 12 0 25" stroke="#93c5fd" stroke-width="5" fill="none" stroke-linecap="round"/>
                            <path d="M 8 0 Q 4 12 8 25" stroke="#93c5fd" stroke-width="5" fill="none" stroke-linecap="round"/>
                            <!-- 著絲點（中節）-->
                            <ellipse cx="4" cy="12" rx="7" ry="3" fill="#3b82f6" stroke="#fff" stroke-width="1"/>
                        </g>
                        
                        <!-- 右側細胞 -->
                        <ellipse cx="600" cy="250" rx="140" ry="120" fill="none" stroke="url(#membrane-gradient)" stroke-width="3"/>
                        <g transform="translate(555, 210)">
                            <!-- 紅色長染色體 - )( 形狀 -->
                            <path d="M 0 0 Q 6 22 0 45" stroke="url(#chr-red)" stroke-width="7" fill="none" stroke-linecap="round"/>
                            <path d="M 10 0 Q 4 22 10 45" stroke="url(#chr-red)" stroke-width="7" fill="none" stroke-linecap="round"/>
                            <!-- 著絲點（中節）-->
                            <ellipse cx="5" cy="22" rx="10" ry="4" fill="#991b1b" stroke="#fff" stroke-width="1"/>
                        </g>
                        <g transform="translate(610, 220)">
                            <!-- 淺紅色短染色體 - )( 形狀 -->
                            <path d="M 0 0 Q 4 12 0 25" stroke="#fca5a5" stroke-width="5" fill="none" stroke-linecap="round"/>
                            <path d="M 8 0 Q 4 12 8 25" stroke="#fca5a5" stroke-width="5" fill="none" stroke-linecap="round"/>
                            <!-- 著絲點（中節）-->
                            <ellipse cx="4" cy="12" rx="7" ry="3" fill="#dc2626" stroke="#fff" stroke-width="1"/>
                        </g>
                    </g>

                    <!-- ===== 左側細胞 - 中心體與紡錘絲 ===== -->
                    <!-- 左中心體 -->
                    <g class="centrosome-left-cell-left">
                        <circle cx="80" cy="250" r="4" fill="#fbbf24" opacity="0.9"/>
                        <circle cx="80" cy="250" r="8" fill="none" stroke="#fbbf24" stroke-width="0.8" opacity="0.3"/>
                    </g>
                    <!-- 右中心體 -->
                    <g class="centrosome-left-cell-right">
                        <circle cx="320" cy="250" r="4" fill="#fbbf24" opacity="0.9"/>
                        <circle cx="320" cy="250" r="8" fill="none" stroke="#fbbf24" stroke-width="0.8" opacity="0.3"/>
                    </g>
                    <!-- 紡錘絲（從中心體向著絲點延伸，尚未完全附著） -->
                    <g class="spindle-left-cell" opacity="0.35">
                        <!-- 長染色體著絲點(160,232) ← 兩極 -->
                        <path d="M 160 232 C 130 195, 95 215, 80 250" stroke="#3b82f6" stroke-width="1" fill="none"/>
                        <path d="M 160 232 C 200 195, 300 215, 320 250" stroke="#3b82f6" stroke-width="1" fill="none"/>
                        <!-- 短染色體著絲點(214,232) ← 兩極 -->
                        <path d="M 214 232 C 170 270, 100 275, 80 250" stroke="#93c5fd" stroke-width="1" fill="none"/>
                        <path d="M 214 232 C 250 270, 305 275, 320 250" stroke="#93c5fd" stroke-width="1" fill="none"/>
                    </g>

                    <!-- ===== 右側細胞 - 中心體與紡錘絲 ===== -->
                    <!-- 左中心體 -->
                    <g class="centrosome-right-cell-left">
                        <circle cx="480" cy="250" r="4" fill="#fbbf24" opacity="0.9"/>
                        <circle cx="480" cy="250" r="8" fill="none" stroke="#fbbf24" stroke-width="0.8" opacity="0.3"/>
                    </g>
                    <!-- 右中心體 -->
                    <g class="centrosome-right-cell-right">
                        <circle cx="720" cy="250" r="4" fill="#fbbf24" opacity="0.9"/>
                        <circle cx="720" cy="250" r="8" fill="none" stroke="#fbbf24" stroke-width="0.8" opacity="0.3"/>
                    </g>
                    <!-- 紡錘絲（從中心體向著絲點延伸） -->
                    <g class="spindle-right-cell" opacity="0.35">
                        <!-- 長染色體著絲點(560,232) ← 兩極 -->
                        <path d="M 560 232 C 530 195, 495 215, 480 250" stroke="#ef4444" stroke-width="1" fill="none"/>
                        <path d="M 560 232 C 600 195, 700 215, 720 250" stroke="#ef4444" stroke-width="1" fill="none"/>
                        <!-- 短染色體著絲點(614,232) ← 兩極 -->
                        <path d="M 614 232 C 570 270, 500 275, 480 250" stroke="#fca5a5" stroke-width="1" fill="none"/>
                        <path d="M 614 232 C 650 270, 705 275, 720 250" stroke="#fca5a5" stroke-width="1" fill="none"/>
                    </g>
                    <text x="250" y="120" fill="#facc15" font-size="13" font-weight="bold">核膜、核仁消失，中心體移至兩極，紡錘絲形成</text>  

                    <!-- 染色體/DNA數目標示 -->
                    <text x="200" y="390" fill="#22c55e" font-size="12" text-anchor="middle">N / 2a</text>
                    <text x="600" y="390" fill="#22c55e" font-size="12" text-anchor="middle">N / 2a</text>
                    
                    <text x="200" y="150" fill="#6b7280" font-size="12" font-weight="bold" text-anchor="middle">紡錘絲形成</text>
                    <text x="600" y="150" fill="#6b7280" font-size="12" font-weight="bold" text-anchor="middle">紡錘絲形成</text>
                `;
                break;

            case 6: // 中期 II
                svgContent = `
                    <g class="metaphase-ii">
                        <!-- ===== 左側細胞 (父源/藍色) ===== -->
                        <ellipse cx="200" cy="250" rx="140" ry="120" fill="none" stroke="url(#membrane-gradient)" stroke-width="3"/>
                        
                        <!-- 左側細胞 - 左中心體(紡錘絲交會點) -->
                        <g class="centrosome-left-cell-left">
                            <circle cx="80" cy="250" r="4" fill="#fbbf24" opacity="0.9"/>
                            <circle cx="80" cy="250" r="8" fill="none" stroke="#fbbf24" stroke-width="0.8" opacity="0.3"/>
                        </g>
                        <!-- 左側細胞 - 右中心體(紡錘絲交會點) -->
                        <g class="centrosome-left-cell-right">
                            <circle cx="320" cy="250" r="4" fill="#fbbf24" opacity="0.9"/>
                            <circle cx="320" cy="250" r="8" fill="none" stroke="#fbbf24" stroke-width="0.8" opacity="0.3"/>
                        </g>
                        
                        <!-- 左側細胞 - 紡錘絲（曲線從著絲點匯聚到中心體）-->
                        <g class="spindle-left-cell" opacity="0.6">
                            <!-- 長染色體著絲點(193,220) → 左中心體(80,250) -->
                            <path d="M 193 220 C 155 185, 100 210, 80 250" stroke="#3b82f6" stroke-width="1.2" fill="none"/>
                            <path d="M 193 220 C 160 210, 110 235, 80 250" stroke="#3b82f6" stroke-width="1.2" fill="none"/>
                            <!-- 長染色體著絲點(193,220) → 右中心體(320,250) -->
                            <path d="M 193 220 C 230 185, 300 210, 320 250" stroke="#3b82f6" stroke-width="1.2" fill="none"/>
                            <path d="M 193 220 C 225 210, 290 235, 320 250" stroke="#3b82f6" stroke-width="1.2" fill="none"/>
                            <!-- 短染色體著絲點(194,280) → 左中心體(80,250) -->
                            <path d="M 194 280 C 155 310, 100 285, 80 250" stroke="#93c5fd" stroke-width="1.2" fill="none"/>
                            <!-- 短染色體著絲點(194,280) → 右中心體(320,250) -->
                            <path d="M 194 280 C 230 310, 300 285, 320 250" stroke="#93c5fd" stroke-width="1.2" fill="none"/>
                        </g>
                        
                        <!-- 左側細胞 - 赤道板（畫在兩條染色體中間：長染色體著絲點 y=220，短染色體著絲點 y=280，赤道板 x 對齊著絲點 x=193）-->
                        <line x1="193" y1="150" x2="193" y2="350" stroke="#22d3ee" stroke-width="1.5" stroke-dasharray="3,3"/>
                        
                        <!-- 左側細胞 - 長染色體 (姊妹染色分體) - 以赤道板為中心 -->
                        <g transform="translate(193, 195)">
                            <!-- 姊妹染色分體 - )( 形狀，中間交會 -->
                            <path d="M -8 0 Q 0 25 -8 50" stroke="url(#chr-blue)" stroke-width="8" fill="none" stroke-linecap="round"/>
                            <path d="M 8 0 Q 0 25 8 50" stroke="url(#chr-blue)" stroke-width="8" fill="none" stroke-linecap="round"/>
                            <!-- 著絲點（中節）-->
                            <ellipse cx="0" cy="25" rx="10" ry="4" fill="#1e3a8a" stroke="#fff" stroke-width="1"/>
                        </g>
                        <!-- 左側細胞 - 短染色體 (姊妹染色分體) - 以赤道板為中心 -->
                        <g transform="translate(194, 268)">
                            <!-- 姊妹染色分體 - )( 形狀，中間交會 -->
                            <path d="M -6 0 Q 0 12 -6 25" stroke="#93c5fd" stroke-width="6" fill="none" stroke-linecap="round"/>
                            <path d="M 6 0 Q 0 12 6 25" stroke="#93c5fd" stroke-width="6" fill="none" stroke-linecap="round"/>
                            <!-- 著絲點（中節）-->
                            <ellipse cx="0" cy="12" rx="8" ry="3" fill="#1e40af" stroke="#fff" stroke-width="1"/>
                        </g>
                        <text x="200" y="385" fill="#3b82f6" font-size="10" text-anchor="middle">父源細胞</text>
                        
                        <!-- ===== 右側細胞 (母源/紅色) ===== -->
                        <ellipse cx="600" cy="250" rx="140" ry="120" fill="none" stroke="url(#membrane-gradient)" stroke-width="3"/>
                        
                        <!-- 右側細胞 - 左中心體(紡錘絲交會點) -->
                        <g class="centrosome-right-cell-left">
                            <circle cx="480" cy="250" r="4" fill="#fbbf24" opacity="0.9"/>
                            <circle cx="480" cy="250" r="8" fill="none" stroke="#fbbf24" stroke-width="0.8" opacity="0.3"/>
                        </g>
                        <!-- 右側細胞 - 右中心體(紡錘絲交會點) -->
                        <g class="centrosome-right-cell-right">
                            <circle cx="720" cy="250" r="4" fill="#fbbf24" opacity="0.9"/>
                            <circle cx="720" cy="250" r="8" fill="none" stroke="#fbbf24" stroke-width="0.8" opacity="0.3"/>
                        </g>
                        
                        <!-- 右側細胞 - 紡錘絲（曲線從著絲點匯聚到中心體）-->
                        <g class="spindle-right-cell" opacity="0.6">
                            <!-- 長染色體著絲點(593,220) → 左中心體(480,250) -->
                            <path d="M 593 220 C 555 185, 500 210, 480 250" stroke="#ef4444" stroke-width="1.2" fill="none"/>
                            <path d="M 593 220 C 560 210, 510 235, 480 250" stroke="#ef4444" stroke-width="1.2" fill="none"/>
                            <!-- 長染色體著絲點(593,220) → 右中心體(720,250) -->
                            <path d="M 593 220 C 630 185, 700 210, 720 250" stroke="#ef4444" stroke-width="1.2" fill="none"/>
                            <path d="M 593 220 C 625 210, 690 235, 720 250" stroke="#ef4444" stroke-width="1.2" fill="none"/>
                            <!-- 短染色體著絲點(594,280) → 左中心體(480,250) -->
                            <path d="M 594 280 C 555 310, 500 285, 480 250" stroke="#fca5a5" stroke-width="1.2" fill="none"/>
                            <!-- 短染色體著絲點(594,280) → 右中心體(720,250) -->
                            <path d="M 594 280 C 630 310, 700 285, 720 250" stroke="#fca5a5" stroke-width="1.2" fill="none"/>
                        </g>
                        
                        <!-- 右側細胞 - 赤道板（對齊著絲點 x=593）-->
                        <line x1="593" y1="150" x2="593" y2="350" stroke="#22d3ee" stroke-width="1.5" stroke-dasharray="3,3"/>
                        
                        <!-- 右側細胞 - 長染色體 (姊妹染色分體) - 以赤道板為中心 -->
                        <g transform="translate(593, 195)">
                            <!-- 姊妹染色分體 - )( 形狀，中間交會 -->
                            <path d="M -8 0 Q 0 25 -8 50" stroke="url(#chr-red)" stroke-width="8" fill="none" stroke-linecap="round"/>
                            <path d="M 8 0 Q 0 25 8 50" stroke="url(#chr-red)" stroke-width="8" fill="none" stroke-linecap="round"/>
                            <!-- 著絲點（中節）-->
                            <ellipse cx="0" cy="25" rx="10" ry="4" fill="#7f1d1d" stroke="#fff" stroke-width="1"/>
                        </g>
                        <!-- 右側細胞 - 短染色體 (姊妹染色分體) - 以赤道板為中心 -->
                        <g transform="translate(594, 268)">
                            <!-- 姊妹染色分體 - )( 形狀，中間交會 -->
                            <path d="M -6 0 Q 0 12 -6 25" stroke="#fca5a5" stroke-width="6" fill="none" stroke-linecap="round"/>
                            <path d="M 6 0 Q 0 12 6 25" stroke="#fca5a5" stroke-width="6" fill="none" stroke-linecap="round"/>
                            <!-- 著絲點（中節）-->
                            <ellipse cx="0" cy="12" rx="8" ry="3" fill="#991b1b" stroke="#fff" stroke-width="1"/>
                        </g>
                        <text x="600" y="385" fill="#ef4444" font-size="10" text-anchor="middle">母源細胞</text>
                    </g>
                    <!-- 說明文字 -->
                    <text x="300" y="120" fill="#facc15" font-size="13" font-weight="bold">姊妹染色分體排列在赤道板上，準備分離</text>
                    <!-- 染色體/DNA數目標示 -->
                    <text x="200" y="140" fill="#22c55e" font-size="12" font-weight="bold" text-anchor="middle">N / 2a</text>
                    <text x="600" y="140" fill="#22c55e" font-size="12" font-weight="bold" text-anchor="middle">N / 2a</text>
                `;
                break;

            case 7: // 後期 II
                svgContent = `
                    <g class="anaphase-ii">
                        <!-- 左側細胞 -->
                        <ellipse cx="200" cy="250" rx="140" ry="120" fill="none" stroke="url(#membrane-gradient)" stroke-width="3"/>
                        <!-- 藍色長分離 - 往左極 ) 形 -->
                        <g transform="translate(120, 230)">
                            <path d="M 0 0 Q 4 12 0 25" stroke="url(#chr-blue)" stroke-width="5" fill="none" stroke-linecap="round"/>
                        </g>
                        <!-- 藍色長分離 - 往右極 ( 形 -->
                        <g transform="translate(260, 230)">
                            <path d="M 0 0 Q -4 12 0 25" stroke="url(#chr-blue)" stroke-width="5" fill="none" stroke-linecap="round"/>
                        </g>
                        <!-- 淺藍色短分離 - 往左極 ) 形 -->
                        <g transform="translate(145, 235)">
                            <path d="M 0 0 Q 2 7 0 15" stroke="#93c5fd" stroke-width="4" fill="none" stroke-linecap="round"/>
                        </g>
                        <!-- 淺藍色短分離 - 往右極 ( 形 -->
                        <g transform="translate(235, 235)">
                            <path d="M 0 0 Q -2 7 0 15" stroke="#93c5fd" stroke-width="4" fill="none" stroke-linecap="round"/>
                        </g>
                        
                        <!-- 右側細胞 -->
                        <ellipse cx="600" cy="250" rx="140" ry="120" fill="none" stroke="url(#membrane-gradient)" stroke-width="3"/>
                        <!-- 紅色長分離 - 往左極 ) 形 -->
                        <g transform="translate(520, 230)">
                            <path d="M 0 0 Q 4 12 0 25" stroke="url(#chr-red)" stroke-width="5" fill="none" stroke-linecap="round"/>
                        </g>
                        <!-- 紅色長分離 - 往右極 ( 形 -->
                        <g transform="translate(660, 230)">
                            <path d="M 0 0 Q -4 12 0 25" stroke="url(#chr-red)" stroke-width="5" fill="none" stroke-linecap="round"/>
                        </g>
                        <!-- 淺紅色短分離 - 往左極 ) 形 -->
                        <g transform="translate(545, 235)">
                            <path d="M 0 0 Q 2 7 0 15" stroke="#fca5a5" stroke-width="4" fill="none" stroke-linecap="round"/>
                        </g>
                        <!-- 淺紅色短分離 - 往右極 ( 形 -->
                        <g transform="translate(635, 235)">
                            <path d="M 0 0 Q -2 7 0 15" stroke="#fca5a5" stroke-width="4" fill="none" stroke-linecap="round"/>
                        </g>
                    </g>

                    <!-- ===== 左側細胞 - 中心體與縮短的紡錘絲 ===== -->
                    <g class="centrosome-left-cell-left">
                        <circle cx="80" cy="250" r="4" fill="#fbbf24" opacity="0.9"/>
                        <circle cx="80" cy="250" r="8" fill="none" stroke="#fbbf24" stroke-width="0.8" opacity="0.3"/>
                    </g>
                    <g class="centrosome-left-cell-right">
                        <circle cx="320" cy="250" r="4" fill="#fbbf24" opacity="0.9"/>
                        <circle cx="320" cy="250" r="8" fill="none" stroke="#fbbf24" stroke-width="0.8" opacity="0.3"/>
                    </g>
                    <!-- 紡錘絲（已縮短，正拉動染色體） -->
                    <g class="spindle-left-cell" opacity="0.55">
                        <!-- 左極(80,250) ← 拉動左側長藍(120,242) -->
                        <path d="M 120 242 C 105 225, 90 235, 80 250" stroke="#3b82f6" stroke-width="1.2" fill="none"/>
                        <path d="M 120 242 C 110 235, 88 245, 80 250" stroke="#3b82f6" stroke-width="1.2" fill="none"/>
                        <!-- 左極(80,250) ← 拉動左側短藍(145,242) -->
                        <path d="M 145 242 C 120 260, 95 262, 80 250" stroke="#93c5fd" stroke-width="1.2" fill="none"/>
                        <!-- 右極(320,250) ← 拉動右側長藍(260,242) -->
                        <path d="M 260 242 C 280 225, 305 235, 320 250" stroke="#3b82f6" stroke-width="1.2" fill="none"/>
                        <path d="M 260 242 C 275 235, 308 245, 320 250" stroke="#3b82f6" stroke-width="1.2" fill="none"/>
                        <!-- 右極(320,250) ← 拉動右側短藍(235,242) -->
                        <path d="M 235 242 C 265 260, 300 262, 320 250" stroke="#93c5fd" stroke-width="1.2" fill="none"/>
                    </g>

                    <!-- ===== 右側細胞 - 中心體與縮短的紡錘絲 ===== -->
                    <g class="centrosome-right-cell-left">
                        <circle cx="480" cy="250" r="4" fill="#fbbf24" opacity="0.9"/>
                        <circle cx="480" cy="250" r="8" fill="none" stroke="#fbbf24" stroke-width="0.8" opacity="0.3"/>
                    </g>
                    <g class="centrosome-right-cell-right">
                        <circle cx="720" cy="250" r="4" fill="#fbbf24" opacity="0.9"/>
                        <circle cx="720" cy="250" r="8" fill="none" stroke="#fbbf24" stroke-width="0.8" opacity="0.3"/>
                    </g>
                    <!-- 紡錘絲（已縮短，正拉動染色體） -->
                    <g class="spindle-right-cell" opacity="0.55">
                        <!-- 左極(480,250) ← 拉動左側長紅(520,242) -->
                        <path d="M 520 242 C 505 225, 490 235, 480 250" stroke="#ef4444" stroke-width="1.2" fill="none"/>
                        <path d="M 520 242 C 510 235, 488 245, 480 250" stroke="#ef4444" stroke-width="1.2" fill="none"/>
                        <!-- 左極(480,250) ← 拉動左側短紅(545,242) -->
                        <path d="M 545 242 C 520 260, 495 262, 480 250" stroke="#fca5a5" stroke-width="1.2" fill="none"/>
                        <!-- 右極(720,250) ← 拉動右側長紅(660,242) -->
                        <path d="M 660 242 C 680 225, 705 235, 720 250" stroke="#ef4444" stroke-width="1.2" fill="none"/>
                        <path d="M 660 242 C 675 235, 708 245, 720 250" stroke="#ef4444" stroke-width="1.2" fill="none"/>
                        <!-- 右極(720,250) ← 拉動右側短紅(635,242) -->
                        <path d="M 635 242 C 665 260, 700 262, 720 250" stroke="#fca5a5" stroke-width="1.2" fill="none"/>
                    </g>
                    <!-- 箭頭標示 -->
                    <text x="130" y="200" fill="#22d3ee" font-size="14">←</text>
                    <text x="255" y="200" fill="#22d3ee" font-size="14">→</text>
                    <text x="530" y="200" fill="#22d3ee" font-size="14">←</text>
                    <text x="655" y="200" fill="#22d3ee" font-size="14">→</text>
                    <!-- 染色體/DNA數目標示 -->
                    <text x="200" y="390" fill="#22c55e" font-size="11" font-weight="bold" text-anchor="middle">N/2a → N/a</text>
                    <text x="600" y="390" fill="#22c55e" font-size="11" font-weight="bold" text-anchor="middle">N/2a → N/a</text>
                    <text x="250" y="120" fill="#facc15" font-size="13" font-weight="bold">紡錘絲縮短，姐妹染色體從中節處分離，各自移往兩極</text>  

                `;
                break;

            case 8: // 末期 II - 四個子細胞
                svgContent = `
                    <g class="telophase-ii">
                        <!-- 子細胞 1：藍色長 + 淺藍色短 -->
                        <ellipse cx="150" cy="200" rx="70" ry="60" fill="none" stroke="url(#membrane-gradient)" stroke-width="2"/>
                        <g transform="translate(133, 183)">
                            <path d="M 0 0 Q 3 10 0 20" stroke="url(#chr-blue)" stroke-width="4" fill="none" stroke-linecap="round"/>
                            <path d="M 15 3 Q 17 8 15 13" stroke="#93c5fd" stroke-width="3" fill="none" stroke-linecap="round"/>
                        </g>
                        <text x="150" y="275" fill="#3b82f6" font-size="11" text-anchor="middle">N (父源)</text>
                        
                        <!-- 子細胞 2：藍色長 + 淺藍色短 -->
                        <ellipse cx="310" cy="200" rx="70" ry="60" fill="none" stroke="url(#membrane-gradient)" stroke-width="2"/>
                        <g transform="translate(293, 183)">
                            <path d="M 0 0 Q -3 10 0 20" stroke="url(#chr-blue)" stroke-width="4" fill="none" stroke-linecap="round"/>
                            <path d="M 15 3 Q 13 8 15 13" stroke="#93c5fd" stroke-width="3" fill="none" stroke-linecap="round"/>
                        </g>
                        <text x="310" y="275" fill="#3b82f6" font-size="11" text-anchor="middle">N (父源)</text>
                        
                        <!-- 子細胞 3：紅色長 + 淺紅色短 -->
                        <ellipse cx="490" cy="200" rx="70" ry="60" fill="none" stroke="url(#membrane-gradient)" stroke-width="2"/>
                        <g transform="translate(473, 183)">
                            <path d="M 0 0 Q 3 10 0 20" stroke="url(#chr-red)" stroke-width="4" fill="none" stroke-linecap="round"/>
                            <path d="M 15 3 Q 17 8 15 13" stroke="#fca5a5" stroke-width="3" fill="none" stroke-linecap="round"/>
                        </g>
                        <text x="490" y="275" fill="#ef4444" font-size="11" text-anchor="middle">N (母源)</text>
                        
                        <!-- 子細胞 4：紅色長 + 淺紅色短 -->
                        <ellipse cx="650" cy="200" rx="70" ry="60" fill="none" stroke="url(#membrane-gradient)" stroke-width="2"/>
                        <g transform="translate(633, 183)">
                            <path d="M 0 0 Q -3 10 0 20" stroke="url(#chr-red)" stroke-width="4" fill="none" stroke-linecap="round"/>
                            <path d="M 15 3 Q 13 8 15 13" stroke="#fca5a5" stroke-width="3" fill="none" stroke-linecap="round"/>
                        </g>
                        <text x="650" y="275" fill="#ef4444" font-size="11" text-anchor="middle">N (母源)</text>
                        
                        <!-- 完成標示 -->
                        <text x="400" y="340" fill="#22c55e" font-size="16" text-anchor="middle" font-weight="bold">✓ 形成 4 個單倍體配子</text>

                        <!-- 染色體/DNA數目標示 -->
                        <text x="400" y="410" fill="#22c55e" font-size="14" font-weight="bold" text-anchor="middle">N / a</text>

                         <!-- 說明文字 -->
                        <text x="200" y="120" fill="#facc15" font-size="13" font-weight="bold">紡錘絲消失，核膜重新出現，各自分裂成2個子細胞(共4個配子)</text>

                    </g>
                `;
                break;
        }

        this.chromosomesGroup.innerHTML = svgContent;
    }
}

// =============================================
// 3. 染色體互換拖放遊戲
// =============================================
class CrossingOverGame {
    /**
     * 建構互換拖放遊戲
     */
    constructor() {
        this.stage = document.getElementById('crossing-over-stage');
        this.result = document.getElementById('crossing-result');
        this.resetBtn = document.getElementById('btn-reset-crossing');

        if (!this.stage) return;

        this.swapCount = 0;     // 互換次數
        this.targetSwaps = 2;    // 目標互換次數

        this.init();
    }

    /**
     * 初始化遊戲
     */
    init() {
        this.bindDragEvents();
        this.bindResetEvent();
    }

    /**
     * 綁定拖放事件
     */
    bindDragEvents() {
        // 取得所有可拖曳的片段
        const draggables = this.stage.querySelectorAll('.chr-blue-drag .chr-segment');
        const dropZones = this.stage.querySelectorAll('.drop-zone');

        // 為每個可拖曳元素綁定事件
        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', (e) => this.handleDragStart(e));
            draggable.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });

        // 為每個放置區綁定事件
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => this.handleDragOver(e));
            zone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            zone.addEventListener('drop', (e) => this.handleDrop(e));
        });
    }

    /**
     * 處理拖曳開始事件
     */
    handleDragStart(e) {
        e.target.classList.add('dragging');
        e.dataTransfer.setData('text/plain', e.target.dataset.segment);
        e.dataTransfer.setData('content', e.target.textContent);
    }

    /**
     * 處理拖曳結束事件
     */
    handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    /**
     * 處理拖曳經過事件
     */
    handleDragOver(e) {
        e.preventDefault();
        e.target.classList.add('drag-over');
    }

    /**
     * 處理拖曳離開事件
     */
    handleDragLeave(e) {
        e.target.classList.remove('drag-over');
    }

    /**
     * 處理放置事件
     */
    handleDrop(e) {
        e.preventDefault();
        e.target.classList.remove('drag-over');

        const draggedSegment = e.dataTransfer.getData('text/plain');
        const draggedContent = e.dataTransfer.getData('content');
        const targetSegment = e.target.dataset.segment;

        // 檢查是否為對應的片段
        if (draggedSegment === targetSegment) {
            // 執行互換動畫
            const originalContent = e.target.textContent;
            e.target.textContent = draggedContent;
            e.target.classList.add('swapped');

            // 找到對應的藍色片段並更新
            const blueSegment = this.stage.querySelector(
                `.chr-blue-drag .chr-segment[data-segment="${targetSegment}"]`
            );
            if (blueSegment) {
                blueSegment.textContent = originalContent;
                blueSegment.classList.add('swapped');
                blueSegment.draggable = false;
            }

            // 移除放置區標記
            e.target.classList.remove('drop-zone');

            this.swapCount++;

            // 檢查是否完成
            if (this.swapCount >= this.targetSwaps) {
                setTimeout(() => this.showResult(), 500);
            }
        }
    }

    /**
     * 顯示結果
     */
    showResult() {
        this.result.classList.remove('hidden');
    }

    /**
     * 綁定重置事件
     */
    bindResetEvent() {
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.reset());
        }
    }

    /**
     * 重置遊戲
     */
    reset() {
        this.swapCount = 0;
        this.result.classList.add('hidden');

        // 重置藍色染色體
        const blueSegments = ['A', 'B', 'C', 'D', 'E'];
        const blueElements = this.stage.querySelectorAll('.chr-blue-drag .chr-segment');
        blueElements.forEach((el, i) => {
            el.textContent = blueSegments[i];
            el.classList.remove('swapped');
            el.draggable = true;
        });

        // 重置紅色染色體
        const redSegments = ['a', 'b', 'c', 'd', 'e'];
        const redElements = this.stage.querySelectorAll('.chr-red-drag .chr-segment');
        redElements.forEach((el, i) => {
            el.textContent = redSegments[i];
            el.classList.remove('swapped');
            el.classList.add('drop-zone');
        });
    }
}

// =============================================
// 4. 翻牌比較卡片
// =============================================
class FlipCards {
    /**
     * 建構翻牌卡片功能
     */
    constructor() {
        this.cards = document.querySelectorAll('.flip-card');
        if (this.cards.length === 0) return;

        this.init();
    }

    /**
     * 初始化翻牌功能
     */
    init() {
        this.cards.forEach(card => {
            card.addEventListener('click', () => {
                card.classList.toggle('flipped');
            });
        });
    }
}

// =============================================
// 5. 互動測驗系統
// =============================================
class QuizManager {
    /**
     * 建構測驗系統
     */
    constructor() {
        this.container = document.getElementById('quiz-container');
        this.resultContainer = document.getElementById('quiz-result');
        this.progressFill = document.getElementById('quiz-progress-fill');
        this.progressText = document.getElementById('quiz-progress-text');
        this.questionText = document.getElementById('question-text');
        this.optionsContainer = document.getElementById('quiz-options');
        this.feedback = document.getElementById('quiz-feedback');
        this.feedbackIcon = document.getElementById('feedback-icon');
        this.feedbackText = document.getElementById('feedback-text');
        this.btnNext = document.getElementById('btn-next-question');
        this.btnRestart = document.getElementById('btn-restart-quiz');

        if (!this.container) return;

        // 題庫
        this.questions = [
            {
                question: '減數分裂中，染色體數目在哪個階段真正減半？',
                options: ['前期 I', '後期 I', '中期 II', '後期 II'],
                correct: 1,
                explanation: '在後期 I，同源染色體分離移向兩極，使得每個子細胞的染色體數目減半。'
            },
            {
                question: '減數分裂完成後會產生幾個子細胞？',
                options: ['1 個', '2 個', '3 個', '4 個'],
                correct: 3,
                explanation: '減數分裂經過兩次連續分裂，最終形成 4 個單倍體子細胞。'
            },
            {
                question: '「互換」(Crossing Over) 主要發生在哪個時期？',
                options: ['間期', '前期 I', '中期 I', '前期 II'],
                correct: 1,
                explanation: '互換發生在前期 I，當同源染色體配對形成聯會複合體時，非姊妹染色分體會交換片段。'
            },
            {
                question: '下列何者是減數分裂與有絲分裂的主要差異？',
                options: [
                    '減數分裂只分裂一次',
                    '減數分裂產生的子細胞染色體數目減半',
                    '減數分裂不需要 DNA 複製',
                    '減數分裂只發生在植物細胞'
                ],
                correct: 1,
                explanation: '減數分裂的關鍵特徵是產生單倍體 (n) 子細胞，而有絲分裂產生的子細胞保持雙倍體 (2n)。'
            },
            {
                question: '減數分裂產生的子細胞會用於什麼目的？',
                options: ['組織修復', '生長發育', '有性生殖', '無性生殖'],
                correct: 2,
                explanation: '減數分裂產生的配子（精子和卵子）用於有性生殖，結合後形成新個體。'
            },
            {
                question: '一個「四分體」(Tetrad) 包含幾條染色分體？',
                options: ['1 條', '2 條', '3 條', '4 條'],
                correct: 3,
                explanation: '四分體是由 2 條同源染色體（每條含 2 個姊妹染色分體）組成，共有 4 條染色分體。'
            },
            {
                question: '人類精原細胞 (2n=46) 進行減數分裂後，每個精子的染色體數目為？',
                options: ['46 條', '23 條', '92 條', '12 條'],
                correct: 1,
                explanation: '人類體細胞含 46 條染色體 (2n=46)，經減數分裂後產生的配子含 23 條 (n=23)。'
            },
            {
                question: '減數分裂 I 與減數分裂 II 最大的差異是什麼？',
                options: [
                    '分裂 I 有 DNA 複製，分裂 II 沒有',
                    '分裂 I 分離同源染色體，分裂 II 分離姊妹染色分體',
                    '分裂 I 不需要紡錘絲，分裂 II 需要',
                    '分裂 II 比分裂 I 時間更長'
                ],
                correct: 1,
                explanation: '減數分裂 I 的關鍵是同源染色體分離（使染色體數減半），而減數分裂 II 則是姊妹染色分體分離（類似有絲分裂）。'
            },
            {
                question: '「自由組合定律」與減數分裂的什麼過程有關？',
                options: ['DNA 複製', '中期 I 同源染色體的隨機排列', '細胞質分裂', '紡錘絲的形成'],
                correct: 1,
                explanation: '在中期 I，每對同源染色體在赤道板上的排列方向是隨機的，不同對之間的排列互不影響，這就是自由組合定律的細胞學基礎。'
            }
        ];

        this.currentQuestion = 0;
        this.score = 0;
        this.answered = false;

        this.init();
    }

    /**
     * 初始化測驗
     */
    init() {
        this.shuffleQuestions();
        this.renderQuestion();
        this.bindEvents();
    }

    /**
     * 隨機打亂題目順序
     */
    shuffleQuestions() {
        for (let i = this.questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
        }
    }

    /**
     * 渲染當前題目
     */
    renderQuestion() {
        const q = this.questions[this.currentQuestion];

        // 更新進度
        const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
        this.progressFill.style.width = progress + '%';
        this.progressText.textContent = `題目 ${this.currentQuestion + 1} / ${this.questions.length}`;

        // 顯示題目
        this.questionText.textContent = q.question;

        // 渲染選項
        this.optionsContainer.innerHTML = '';
        q.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.textContent = option;
            btn.addEventListener('click', () => this.checkAnswer(index));
            this.optionsContainer.appendChild(btn);
        });

        // 隱藏回饋和下一題按鈕
        this.feedback.classList.add('hidden');
        this.btnNext.classList.add('hidden');
        this.answered = false;
    }

    /**
     * 檢查答案
     * @param {number} selectedIndex - 選擇的選項索引
     */
    checkAnswer(selectedIndex) {
        if (this.answered) return;
        this.answered = true;

        const q = this.questions[this.currentQuestion];
        const options = this.optionsContainer.querySelectorAll('.quiz-option');

        // 禁用所有選項
        options.forEach(opt => opt.disabled = true);

        // 標記正確與錯誤答案
        options[q.correct].classList.add('correct');
        if (selectedIndex !== q.correct) {
            options[selectedIndex].classList.add('wrong');
        } else {
            this.score++;
        }

        // 顯示回饋
        this.feedback.classList.remove('hidden', 'correct', 'wrong');
        if (selectedIndex === q.correct) {
            this.feedback.classList.add('correct');
            this.feedbackIcon.textContent = '✅';
            this.feedbackText.textContent = '答對了！' + q.explanation;
        } else {
            this.feedback.classList.add('wrong');
            this.feedbackIcon.textContent = '❌';
            this.feedbackText.textContent = '很遺憾，答錯了。' + q.explanation;
        }

        // 顯示下一題按鈕或結果
        if (this.currentQuestion < this.questions.length - 1) {
            this.btnNext.classList.remove('hidden');
        } else {
            setTimeout(() => this.showResult(), 1500);
        }
    }

    /**
     * 顯示測驗結果
     */
    showResult() {
        this.container.classList.add('hidden');
        this.resultContainer.classList.remove('hidden');

        const resultIcon = document.getElementById('result-icon');
        const resultTitle = document.getElementById('result-title');
        const scoreNumber = document.getElementById('score-number');
        const resultMessage = document.getElementById('result-message');

        scoreNumber.textContent = this.score;

        // 根據分數顯示不同結果
        if (this.score === this.questions.length) {
            resultIcon.textContent = '🏆';
            resultTitle.textContent = '太棒了！';
            resultMessage.textContent = '你完全掌握了減數分裂的知識，繼續保持！';
        } else if (this.score >= this.questions.length * 0.6) {
            resultIcon.textContent = '👍';
            resultTitle.textContent = '做得不錯！';
            resultMessage.textContent = '你對減數分裂有不錯的理解，再複習一下會更好！';
        } else {
            resultIcon.textContent = '📚';
            resultTitle.textContent = '繼續加油！';
            resultMessage.textContent = '建議回頭複習減數分裂的各個階段，再來挑戰！';
        }
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        // 下一題按鈕
        this.btnNext.addEventListener('click', () => {
            this.currentQuestion++;
            this.renderQuestion();
        });

        // 重新開始按鈕
        this.btnRestart.addEventListener('click', () => this.restart());
    }

    /**
     * 重新開始測驗
     */
    restart() {
        this.currentQuestion = 0;
        this.score = 0;
        this.shuffleQuestions();
        this.container.classList.remove('hidden');
        this.resultContainer.classList.add('hidden');
        this.renderQuestion();
    }
}

// =============================================
// 6. 滾動顯示動畫
// =============================================
class ScrollReveal {
    /**
     * 建構滾動顯示動畫
     */
    constructor() {
        this.reveals = document.querySelectorAll('.reveal');
        if (this.reveals.length === 0) return;

        this.init();
    }

    /**
     * 初始化
     */
    init() {
        // 立即檢查一次
        this.checkReveal();

        // 監聽滾動事件
        window.addEventListener('scroll', () => this.checkReveal());
    }

    /**
     * 檢查並觸發顯示動畫
     */
    checkReveal() {
        const windowHeight = window.innerHeight;
        const triggerPoint = 150; // 觸發點：距離視窗底部的距離

        this.reveals.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;

            if (elementTop < windowHeight - triggerPoint) {
                element.classList.add('active');
            }
        });
    }
}

// =============================================
// 7. 導覽列功能
// =============================================
class Navigation {
    /**
     * 建構導覽列功能
     */
    constructor() {
        this.burger = document.getElementById('burger-menu');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.navLinks = document.querySelectorAll('a[href^="#"]');

        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.bindMobileMenu();
        this.bindSmoothScroll();
    }

    /**
     * 綁定手機選單切換
     */
    bindMobileMenu() {
        if (this.burger && this.mobileMenu) {
            this.burger.addEventListener('click', () => {
                this.burger.classList.toggle('active');
                this.mobileMenu.classList.toggle('active');
            });

            // 點擊選單項目後關閉選單
            const mobileLinks = this.mobileMenu.querySelectorAll('a');
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    this.burger.classList.remove('active');
                    this.mobileMenu.classList.remove('active');
                });
            });
        }
    }

    /**
     * 綁定平滑滾動
     */
    bindSmoothScroll() {
        this.navLinks.forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const target = document.querySelector(targetId);

                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// =============================================
// 初始化所有功能
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    // 初始化粒子背景
    new ParticleBackground('particle-canvas');

    // 初始化導覽列
    new Navigation();

    // 初始化滾動顯示動畫
    new ScrollReveal();

    // 初始化減數分裂模擬器
    new MeiosisSimulator();

    // 初始化互換拖放遊戲
    new CrossingOverGame();

    // 初始化翻牌卡片
    new FlipCards();

    // 初始化測驗系統
    new QuizManager();

    console.log('🧬 減數分裂互動教學網頁已載入完成！');
});
