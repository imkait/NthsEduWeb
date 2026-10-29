document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const startBtn = document.getElementById('startBtn');
    const nextBtn = document.getElementById('nextBtn');
    const playMode = document.getElementById('playMode');
    const modeHint = document.getElementById('modeHint');
    const stepStatus = document.getElementById('stepStatus');
    const resetBtn = document.getElementById('resetBtn');
    const messageInput = document.getElementById('messageInput');
    const speedRange = document.getElementById('speedRange');
    const senderStack = document.getElementById('senderStack');
    const receiverStack = document.getElementById('receiverStack');
    const flyingPacket = document.getElementById('flyingPacket');
    const explanationText = document.getElementById('explanationText');
    const finalMessage = document.getElementById('finalMessage');
    const router = document.querySelector('.router');
    const hopDetails = document.getElementById('hopDetails');

    // Separate steps for Sender and Receiver
    const senderSteps = {
        7: document.getElementById('s-step7'),
        6: document.getElementById('s-step6'),
        5: document.getElementById('s-step5'),
        4: document.getElementById('s-step4'),
        3: document.getElementById('s-step3'),
        2: document.getElementById('s-step2'),
        1: document.getElementById('s-step1')
    };
    const receiverSteps = {
        7: document.getElementById('r-step7'),
        6: document.getElementById('r-step6'),
        5: document.getElementById('r-step5'),
        4: document.getElementById('r-step4'),
        3: document.getElementById('r-step3'),
        2: document.getElementById('r-step2'),
        1: document.getElementById('r-step1')
    };

    // State
    let isAnimating = false;
    let isPaused = false;
    let shouldReset = false;  // 用於中斷動畫
    let animationSpeed = 2400 - Number(speedRange.value) * 400;
    let explanationBeforePause = '';
    let activeAnimationToken = 0;
    let manualMode = false;
    let nextResolve = null;
    let stepNumber = 0;
    let packetPosition = 20;

    function positionPacket(position) {
        packetPosition = position;
        const vertical = window.matchMedia('(max-width: 1300px)').matches;
        flyingPacket.style.left = vertical ? '50%' : `${position}%`;
        flyingPacket.style.top = vertical ? `${position}%` : '50%';
    }
    window.addEventListener('resize', () => positionPacket(packetPosition));

    // Config
    const texts = {
        idle: "準備好開始了嗎？輸入訊息並點擊「開始傳輸」！",
        encapsulation: {
            app: "7. 應用層 (Application)：產生使用者資料，提供網路服務介面。",
            pres: "6. 表現層 (Presentation)：資料格式轉換、加密與壓縮。",
            sess: "5. 會議層 (Session)：建立、管理與終止連線會議。",
            trans: "4. 傳輸層 (Transport)：切割資料，加入 TCP/UDP 標頭 (Port)。",
            net: "3. 網路層 (Network)：邏輯定址與路徑選擇，加入 IP 標頭。",
            link: "2. 資料連結層 (Data Link)：實體定址 (MAC)，加入訊框標頭。",
            phy: "1. 實體層 (Physical)：將位元轉為電、光或無線訊號傳輸。"
        },
        transmission: "傳輸中：路由器移除收到的訊框，依 IP 選擇路徑，再建立下一段鏈路的訊框。",
        decapsulation: {
            phy: "1. 實體層：接收電、光或無線訊號，還原為位元流。",
            link: "2. 資料連結層：檢查 MAC 位址，移除訊框標頭。",
            net: "3. 網路層：檢查 IP 位址，移除網路層標頭。",
            trans: "4. 傳輸層：檢查 Port 號，重組資料區段。",
            sess: "5. 會議層：同步與管理對話狀態。",
            pres: "6. 表現層：資料解密與格式轉換。",
            app: "7. 應用層：接收最終資料，呈現給使用者！"
        }
    };

    // 各層詳細說明 (供手動點擊時顯示)
    const layerDescriptions = {
        7: {
            name: "應用層 (Application Layer)",
            desc: "OSI 第七層，負責提供網路服務介面給應用程式使用。常見協定：HTTP、FTP、SMTP、DNS 等。",
            example: "例如：瀏覽器發送 HTTP 請求、郵件軟體使用 SMTP 發信。",
            analogy: "📦 寄包裹比喻：你決定要寄什麼東西給朋友（寫信、寄禮物），這就是「產生內容」的階段。就像你打開購物App下單一樣！",
            color: "#ffadad"
        },
        6: {
            name: "表現層 (Presentation Layer)",
            desc: "OSI 第六層，負責資料格式轉換、加密、解密與壓縮。確保不同系統間的資料相容性。",
            example: "例如：資料加密、影像壓縮 (JPEG)、字元編碼轉換；TLS 常用於 TCP 之上，與 OSI 層次不是一一對應。",
            analogy: "📦 寄包裹比喻：把禮物整理成較精簡的形式（壓縮）、如果是重要物品還要上鎖（加密），確保對方收到時完好無缺！",
            color: "#fffb7d"
        },
        5: {
            name: "會議層 (Session Layer)",
            desc: "OSI 第五層，負責建立、管理與終止應用程式之間的連線會議。",
            example: "例如：維持登入狀態、管理遠端桌面連線、同步對話節點。",
            analogy: "📦 寄包裹比喻：打電話給物流公司預約取件，建立一次「寄件對話」。如果電話斷了可以重撥繼續（會議管理）！",
            color: "#a0c4ff"
        },
        4: {
            name: "傳輸層 (Transport Layer)",
            desc: "OSI 第四層提供端對端傳輸，使用 Port 號區分服務；TCP 提供可靠傳輸，UDP 不保證送達或順序。",
            example: "例如：TCP 提供可靠的位元組串流；UDP 不保證送達或順序。Port 80 常用於 HTTP，443 常用於 HTTPS。",
            analogy: "📦 寄包裹比喻：大包裹要分成好幾箱寄送，每箱標上「第1箱/共3箱」（分段編號）。Port就像收件人的手機門號，確保送到正確的人手上！",
            color: "#ffd6a5"
        },
        3: {
            name: "網路層 (Network Layer)",
            desc: "OSI 第三層，負責邏輯定址 (IP 位址) 與路徑選擇，決定封包如何從來源到目的地。",
            example: "例如：IP 定址、路由器轉發封包、ICMP (ping) 診斷。",
            analogy: "📦 寄包裹比喻：在包裹上寫上寄件地址和收件地址（IP位址），物流中心根據地址決定要走哪條路線送達（路由選擇）！",
            color: "#fdffb6"
        },
        2: {
            name: "資料連結層 (Data Link Layer)",
            desc: "OSI 第二層，負責實體定址 (MAC 位址)、訊框封裝與錯誤偵測。",
            example: "例如：Ethernet 訊框、MAC 位址辨識、交換器運作。",
            analogy: "📦 寄包裹比喻：包裹到了當地的物流站，配送員根據「門牌號碼」（MAC位址）一站一站送到下個點。就像接力賽一棒接一棒！",
            color: "#caffbf"
        },
        1: {
            name: "實體層 (Physical Layer)",
            desc: "OSI 第一層，負責將資料轉換為電子訊號、光訊號或無線訊號在物理介質上傳輸。",
            example: "例如：網路線 (Cat5e/Cat6)、光纖、Wi-Fi 電波、集線器。",
            analogy: "📦 寄包裹比喻：包裹實際放上貨車、飛機或船運送（物理運輸）。網路線就像高速公路，Wi-Fi就像無人機空運！",
            color: "#bdb2ff"
        }
    };

    // 接收端各層詳細說明 (解封裝視角)
    const receiverLayerDescriptions = {
        7: {
            name: "應用層 (Application Layer)",
            desc: "OSI 第七層，接收端從這裡取出最終資料，交給應用程式處理。常見協定：HTTP、FTP、SMTP、DNS 等。",
            example: "例如：伺服器回應 HTTP 200 OK、郵件軟體接收 SMTP 郵件、DNS 回應查詢結果。",
            analogy: "📦 收包裹比喻：打開包裹，取出朋友送的禮物！終於看到內容物了，這就是「接收成品」的階段。就像你收到網購的商品一樣！",
            color: "#ffadad"
        },
        6: {
            name: "表現層 (Presentation Layer)",
            desc: "OSI 第六層，接收端負責將收到的資料解密、解壓縮、還原為可讀格式。",
            example: "例如：TLS 解密資料流、JPEG 解壓縮影像、UTF-8 解碼。",
            analogy: "📦 收包裹比喻：將精簡的內容還原（解壓縮）、打開鎖頭（解密），把包裝好的禮物還原成原本的樣子！",
            color: "#fffb7d"
        },
        5: {
            name: "會議層 (Session Layer)",
            desc: "OSI 第五層，接收端管理與發送端之間的連線狀態，確保對話完整後才關閉。",
            example: "例如：確認登入狀態有效、維持遠端桌面連線、處理斷線重連。",
            analogy: "📦 收包裹比喻：接到物流公司的電話確認「您的包裹已送達」，確認雙方的對話順利完成！",
            color: "#a0c4ff"
        },
        4: {
            name: "傳輸層 (Transport Layer)",
            desc: "OSI 第四層依 Port 號將資料交給對應的應用程式；TCP 可排序並重組位元組串流，UDP 不保證順序或送達。",
            example: "例如：TCP 確認封包正確到達、重新排序亂序封包、回傳 ACK 訊號。",
            analogy: "📦 收包裹比喻：收到好幾箱包裹，根據箱子上的「收件人手機號碼」（Port）找到對應的你，再把「第1箱、第2箱」按順序排好！",
            color: "#ffd6a5"
        },
        3: {
            name: "網路層 (Network Layer)",
            desc: "OSI 第三層，接收端驗證目標 IP 位址是否為自己，然後移除 IP 標頭繼續上傳。",
            example: "例如：確認封包目的地是自己的 IP、TTL 過期則丟棄、ICMP 回應。",
            analogy: "📦 收包裹比喻：物流站收到包裹，檢查「收件地址」是不是自己的門牌。確認無誤後拆掉地址標籤，交給下一層！",
            color: "#fdffb6"
        },
        2: {
            name: "資料連結層 (Data Link Layer)",
            desc: "OSI 第二層，接收端檢查 MAC 位址是否匹配，執行錯誤偵測後移除訊框標頭。",
            example: "例如：比對目的地 MAC 位址、CRC 錯誤檢查、移除 Ethernet 訊框標頭。",
            analogy: "📦 收包裹比喻：配送員送到你家，確認「門牌號碼」（MAC位址）正確後，拆掉外層包裝，把包裹交給你！",
            color: "#caffbf"
        },
        1: {
            name: "實體層 (Physical Layer)",
            desc: "OSI 第一層，接收端透過實體介質接收電、光或無線訊號，將其還原為數位資料位元流。",
            example: "例如：網路卡接收電子脈衝、光纖收發器轉換光訊號、Wi-Fi 天線接收無線訊號。",
            analogy: "📦 收包裹比喻：貨車到站卸貨，把高速公路上運送的包裹從車上搬下來（訊號→資料），準備拆封！",
            color: "#bdb2ff"
        }
    };

    // Mock Header Data
    const headerData = {
        macFirst: "來源: 02:00:00:00:00:10 ｜ 目的: 02:00:00:00:00:01",
        macSecond: "來源: 02:00:00:00:00:02 ｜ 目的: 02:00:00:00:00:20",
        ip: "來源: 192.0.2.10 ｜ 目的: 198.51.100.20",
        tcp: "來源 Port: 49152 ｜ 目的 Port: 443",
        sess: "連線管理（概念示意）",
        pres: "文字可使用 UTF-8 編碼（概念示意）",
        app: "使用者訊息（概念示意）"
    };

    function escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Events
    const pauseBtn = document.getElementById('pauseBtn');
    startBtn.addEventListener('click', startAnimation);
    resetBtn.addEventListener('click', resetAnimation);
    pauseBtn.addEventListener('click', togglePause);
    nextBtn.addEventListener('click', () => {
        if (nextResolve) {
            const resolve = nextResolve;
            nextResolve = null;
            nextBtn.disabled = true;
            resolve(true);
        }
    });
    playMode.addEventListener('change', updateModeControls);
    speedRange.addEventListener('input', (e) => {
        animationSpeed = 2400 - (e.target.value * 400);
    });

    function updateModeControls() {
        const manual = playMode.value === 'manual';
        speedRange.disabled = manual;
        modeHint.textContent = manual
            ? '按「開始傳輸」進入第一步，再按「下一步」逐一觀察。'
            : '選擇手動逐步，可在每個階段停下來觀察。';
    }

    // 暫停/繼續切換
    function togglePause() {
        if (!isAnimating) return;

        isPaused = !isPaused;
        pauseBtn.textContent = isPaused ? '繼續' : '暫停';
        pauseBtn.classList.toggle('paused', isPaused);

        document.getAnimations().forEach(animation => {
            if (isPaused) animation.pause();
            else animation.play();
        });

        if (isPaused) {
            explanationBeforePause = explanationText.textContent;
            explanationText.textContent = '⏸️ 動畫已暫停，點擊「繼續」按鈕繼續播放。';
        } else {
            explanationText.textContent = explanationBeforePause;
        }
    }

    // 為所有 layer-item 加入點擊事件 (手動查看各層狀態)
    function setupLayerClickEvents() {
        const allLayerItems = document.querySelectorAll('.layer-item');
        allLayerItems.forEach(item => {
            item.style.cursor = 'pointer';
            item.addEventListener('click', (e) => {
                // 動畫進行中時不處理點擊
                if (isAnimating) return;

                // 解析層級編號 (從 id 取得，例如 s-step7 或 r-step7)
                const id = item.id;
                const layerNum = parseInt(id.replace(/[^0-9]/g, ''), 10);
                const side = id.startsWith('s-') ? '發送端' : '接收端';

                const descriptions = id.startsWith('r-') ? receiverLayerDescriptions : layerDescriptions;
                if (descriptions[layerNum]) {
                    const info = descriptions[layerNum];
                    // 清除所有 active 狀態，標記當前點擊的項目
                    clearActiveSteps();
                    item.classList.add('active');

                    // 顯示該層詳細說明
                    explanationText.innerHTML = `
                        <strong style="color: #212529; background: ${info.color}; padding: 2px 8px; border-radius: 4px;">
                            ${info.name}
                        </strong><br>
                        <span style="display: block; margin-top: 8px;">${info.desc}</span>
                        <span style="display: block; margin-top: 6px; color: #666; font-size: 0.95rem;">
                            💡 ${info.example}
                        </span>
                        <span style="display: block; margin-top: 10px; padding: 10px; background: linear-gradient(135deg, #fff9e6, #fff3cd); border-radius: 8px; border-left: 4px solid #ffc107; font-size: 0.95rem;">
                            ${info.analogy}
                        </span>
                        <span style="display: block; margin-top: 10px; color: #868e96; font-size: 0.85rem;">
                            📍 位置：${side}
                        </span>
                    `;
                }
            });
        });
    }

    // 初始化點擊事件
    setupLayerClickEvents();

    // 動畫時間只在播放時累計，重置或新一輪播放會使舊流程失效。
    function sleep(ms, runToken, onProgress = () => {}) {
        return new Promise(resolve => {
            let elapsed = 0;
            let previous = null;
            function tick(now) {
                if (shouldReset || runToken !== activeAnimationToken) {
                    resolve(false);
                    return;
                }
                if (isPaused) {
                    previous = null;
                } else {
                    if (previous !== null) elapsed += now - previous;
                    previous = now;
                    onProgress(Math.min(elapsed / ms, 1));
                    if (elapsed >= ms) {
                        resolve(true);
                        return;
                    }
                }
                requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        });
    }

    function waitForStep(ms, runToken, onProgress) {
        if (!manualMode) return sleep(ms, runToken, onProgress);
        if (shouldReset || runToken !== activeAnimationToken) return Promise.resolve(false);
        if (onProgress) onProgress(1);
        nextBtn.disabled = false;
        return new Promise(resolve => { nextResolve = resolve; });
    }

    function showProgress(phase) {
        stepNumber += 1;
        stepStatus.textContent = `${phase} · ${stepNumber} / 17`;
    }

    // Helper to create layer visual
    function createLayer(type, content, label, detailedHeader = "") {
        const div = document.createElement('div');
        div.className = `data-unit layer-${type}`;

        const title = ['app', 'pres', 'sess'].includes(type) ? `${label} 處理` : `${label} 標頭`;
        let headerHtml = `<div class="header-title">${title}</div>`;
        if (detailedHeader) {
            headerHtml += `<div class="header-details">${detailedHeader}</div>`;
        }

        div.innerHTML = `
            <div class="layer-header-block">
                ${headerHtml}
            </div>
            <div class="layer-content-wrapper">${content}</div>
        `;
        return div;
    }

    async function startAnimation() {
        if (isAnimating) return;
        const runToken = ++activeAnimationToken;
        isAnimating = true;
        isPaused = false;
        shouldReset = false;
        manualMode = playMode.value === 'manual';
        stepNumber = 0;
        startBtn.disabled = true;
        playMode.disabled = true;
        resetBtn.disabled = false;  // 允許在動畫中重置
        pauseBtn.disabled = manualMode;
        pauseBtn.textContent = '暫停';
        messageInput.disabled = true;
        modeHint.textContent = manualMode ? '閱讀目前階段後，按「下一步」繼續。' : '自動播放中，可隨時暫停或重置。';

        resetVisuals();

        const message = messageInput.value || "Hello!";

        // --- 1. Encapsulation (Sender) ---

        // Step 7: App Layer
        setSenderStep(7);
        explanationText.textContent = texts.encapsulation.app;
        const appLayer = createLayer('app', `<div class="message-content">${escapeHtml(message)}</div>`, 'APP', headerData.app);
        senderStack.appendChild(appLayer);
        appLayer.style.opacity = '0';
        appLayer.style.transform = 'translateY(-20px)';
        if (!(await sleep(50, runToken))) return;
        appLayer.style.opacity = '1';
        appLayer.style.transform = 'translateY(0)';
        if (!(await waitForStep(animationSpeed, runToken))) return;

        // Step 6: Presentation Layer
        setSenderStep(6);
        explanationText.textContent = texts.encapsulation.pres;
        const presLayer = createLayer('pres', '', 'PRES', headerData.pres);
        presLayer.querySelector('.layer-content-wrapper').appendChild(appLayer);
        senderStack.appendChild(presLayer);
        if (!(await waitForStep(animationSpeed, runToken))) return;

        // Step 5: Session Layer
        setSenderStep(5);
        explanationText.textContent = texts.encapsulation.sess;
        const sessLayer = createLayer('sess', '', 'SESS', headerData.sess);
        sessLayer.querySelector('.layer-content-wrapper').appendChild(presLayer);
        senderStack.appendChild(sessLayer);
        if (!(await waitForStep(animationSpeed, runToken))) return;

        // Step 4: Transport Layer
        setSenderStep(4);
        explanationText.textContent = texts.encapsulation.trans;
        const tcpLayer = createLayer('tcp', '', 'TCP', headerData.tcp);
        tcpLayer.querySelector('.layer-content-wrapper').appendChild(sessLayer);
        senderStack.appendChild(tcpLayer);
        if (!(await waitForStep(animationSpeed, runToken))) return;

        // Step 3: Network Layer
        setSenderStep(3);
        explanationText.textContent = texts.encapsulation.net;
        const ipLayer = createLayer('ip', '', 'IP', headerData.ip);
        ipLayer.querySelector('.layer-content-wrapper').appendChild(tcpLayer);
        senderStack.appendChild(ipLayer);
        if (!(await waitForStep(animationSpeed, runToken))) return;

        // Step 2: Data Link Layer
        setSenderStep(2);
        explanationText.textContent = texts.encapsulation.link;
        const macLayer = createLayer('mac', '', 'MAC', headerData.macFirst);
        macLayer.querySelector('.layer-content-wrapper').appendChild(ipLayer);
        senderStack.appendChild(macLayer);
        if (!(await waitForStep(animationSpeed, runToken))) return;

        // Step 1: Physical Layer
        setSenderStep(1);
        explanationText.textContent = texts.encapsulation.phy;
        if (!(await waitForStep(animationSpeed, runToken))) return;


        // --- 2. Transmission ---
        clearActiveSteps();
        explanationText.textContent = texts.transmission;

        senderStack.style.opacity = '0';
        flyingPacket.classList.remove('hidden');

        showProgress('第一段傳送');
        hopDetails.textContent = `第一段：發送端 → 路由器｜${headerData.macFirst}`;
        hopDetails.classList.remove('hidden');
        positionPacket(20);
        if (!(await waitForStep(animationSpeed, runToken, progress => {
            positionPacket(20 + progress * 30);
        }))) return;

        showProgress('路由器轉送');
        router.classList.add('active');
        explanationText.textContent = '路由器檢查目的 IP 並選擇下一站，移除舊訊框，再封裝新的鏈路標頭。';
        if (!(await waitForStep(500, runToken))) return;
        router.classList.remove('active');

        showProgress('第二段傳送');
        hopDetails.textContent = `第二段：路由器 → 接收端｜${headerData.macSecond}`;
        explanationText.textContent = texts.transmission;
        if (!(await waitForStep(animationSpeed, runToken, progress => {
            positionPacket(50 + progress * 30);
        }))) return;

        flyingPacket.classList.add('hidden');
        hopDetails.classList.add('hidden');
        positionPacket(20);


        // --- 3. Decapsulation (Receiver) ---
        // Step 1: Physical Reception
        setReceiverStep(1);
        explanationText.textContent = texts.decapsulation.phy;

        // Rebuild Stack
        receiverStack.innerHTML = '';
        const r_app = createLayer('app', `<div class="message-content">${escapeHtml(message)}</div>`, 'APP', headerData.app);

        const r_pres = createLayer('pres', '', 'PRES', headerData.pres);
        r_pres.querySelector('.layer-content-wrapper').appendChild(r_app);

        const r_sess = createLayer('sess', '', 'SESS', headerData.sess);
        r_sess.querySelector('.layer-content-wrapper').appendChild(r_pres);

        const r_tcp = createLayer('tcp', '', 'TCP', headerData.tcp);
        r_tcp.querySelector('.layer-content-wrapper').appendChild(r_sess);

        const r_ip = createLayer('ip', '', 'IP', headerData.ip);
        r_ip.querySelector('.layer-content-wrapper').appendChild(r_tcp);

        const r_mac = createLayer('mac', '', 'MAC', headerData.macSecond);
        r_mac.querySelector('.layer-content-wrapper').appendChild(r_ip);

        receiverStack.appendChild(r_mac);

        if (!(await waitForStep(animationSpeed, runToken))) return;

        // Step 2: Remove Link
        setReceiverStep(2);
        explanationText.textContent = texts.decapsulation.link;
        if (!(await waitForStep(animationSpeed, runToken))) return;
        r_mac.replaceWith(r_ip);

        // Step 3: Remove Network
        setReceiverStep(3);
        explanationText.textContent = texts.decapsulation.net;
        if (!(await waitForStep(animationSpeed, runToken))) return;
        r_ip.replaceWith(r_tcp);

        // Step 4: Remove Transport
        setReceiverStep(4);
        explanationText.textContent = texts.decapsulation.trans;
        if (!(await waitForStep(animationSpeed, runToken))) return;
        r_tcp.replaceWith(r_sess);

        // Step 5: Remove Session
        setReceiverStep(5);
        explanationText.textContent = texts.decapsulation.sess;
        if (!(await waitForStep(animationSpeed, runToken))) return;
        r_sess.replaceWith(r_pres);

        // Step 6: Remove Presentation
        setReceiverStep(6);
        explanationText.textContent = texts.decapsulation.pres;
        if (!(await waitForStep(animationSpeed, runToken))) return;
        r_pres.replaceWith(r_app);

        // Step 7: Done
        setReceiverStep(7);
        explanationText.textContent = texts.decapsulation.app;

        finalMessage.textContent = `收到訊息：${message}`;
        finalMessage.classList.remove('hidden');

        isAnimating = false;
        isPaused = false;
        nextBtn.disabled = true;
        playMode.disabled = false;
        modeHint.textContent = '傳輸完成！可重新開始或重置。';
        startBtn.disabled = false;
        resetBtn.disabled = false;
        pauseBtn.disabled = true;
        pauseBtn.textContent = '暫停';
        pauseBtn.classList.remove('paused');
        messageInput.disabled = false;
    }

    function resetAnimation() {
        // 設定中斷標記
        shouldReset = true;
        activeAnimationToken += 1;
        if (nextResolve) {
            nextResolve(false);
            nextResolve = null;
        }

        isAnimating = false;
        isPaused = false;
        resetVisuals();
        nextBtn.disabled = true;
        playMode.disabled = false;
        stepStatus.textContent = '準備就緒';
        updateModeControls();
        startBtn.disabled = false;
        resetBtn.disabled = false;
        pauseBtn.disabled = true;
        pauseBtn.textContent = '暫停';
        pauseBtn.classList.remove('paused');
        messageInput.disabled = false;
        explanationText.textContent = texts.idle;
    }

    function resetVisuals() {
        senderStack.innerHTML = '';
        senderStack.style.opacity = '1';
        receiverStack.innerHTML = '';
        flyingPacket.classList.add('hidden');
        positionPacket(20);
        hopDetails.classList.add('hidden');
        router.classList.remove('active');
        finalMessage.classList.add('hidden');
        clearActiveSteps();
    }

    function setSenderStep(stepNum) {
        showProgress('發送端封裝');
        clearActiveSteps();
        if (senderSteps[stepNum]) senderSteps[stepNum].classList.add('active');
    }

    function setReceiverStep(stepNum) {
        showProgress('接收端解封裝');
        clearActiveSteps();
        if (receiverSteps[stepNum]) receiverSteps[stepNum].classList.add('active');
    }

    function clearActiveSteps() {
        Object.values(senderSteps).forEach(s => s?.classList.remove('active'));
        Object.values(receiverSteps).forEach(s => s?.classList.remove('active'));
    }
});
