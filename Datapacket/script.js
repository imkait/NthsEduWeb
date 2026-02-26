document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    const messageInput = document.getElementById('messageInput');
    const speedRange = document.getElementById('speedRange');
    const senderStack = document.getElementById('senderStack');
    const receiverStack = document.getElementById('receiverStack');
    const flyingPacket = document.getElementById('flyingPacket');
    const explanationText = document.getElementById('explanationText');
    const finalMessage = document.getElementById('finalMessage');
    const router = document.querySelector('.router');

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
    let animationSpeed = 1000;
    let pauseResolve = null;  // 暫停時的 Promise resolver

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
            phy: "1. 實體層 (Physical)：將資料轉為電子訊號傳輸。"
        },
        transmission: "傳輸中：電子訊號透過物理介質傳送到路由器，再轉送到目的地。",
        decapsulation: {
            phy: "1. 實體層：接收電子訊號，還原為數位資料流。",
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
            example: "例如：將資料加密 (SSL/TLS)、影像壓縮 (JPEG)、字元編碼轉換。",
            analogy: "📦 寄包裹比喻：把禮物包裝好、加上氣泡紙保護（壓縮）、如果是重要物品還要上鎖（加密），確保對方收到時完好無缺！",
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
            desc: "OSI 第四層，負責端對端的可靠資料傳輸，使用 Port 號區分不同服務。",
            example: "例如：TCP 提供可靠連線、UDP 提供快速傳輸、Port 80 (HTTP)、Port 443 (HTTPS)。",
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

    // Mock Header Data
    const headerData = {
        mac: "Src: 00:1A:2B:3C:4D:5E<br>Dst: FF:FF:FF:FF:FF:FF",
        ip: "Src: 192.168.1.10<br>Dst: 104.21.25.10",
        tcp: "Src Port: 49152<br>Dst Port: 443",
        sess: "SessionID: 0x8F3A2C1B",
        pres: "Format: ASCII",
        app: "Content-Type: text/plain"
    };

    // Events
    const pauseBtn = document.getElementById('pauseBtn');
    startBtn.addEventListener('click', startAnimation);
    resetBtn.addEventListener('click', resetAnimation);
    pauseBtn.addEventListener('click', togglePause);
    speedRange.addEventListener('input', (e) => {
        animationSpeed = 2400 - (e.target.value * 400);
    });

    // 暫停/繼續切換
    function togglePause() {
        if (!isAnimating) return;

        isPaused = !isPaused;
        pauseBtn.textContent = isPaused ? '繼續' : '暫停';
        pauseBtn.classList.toggle('paused', isPaused);

        if (!isPaused && pauseResolve) {
            // 繼續執行
            pauseResolve();
            pauseResolve = null;
        }

        explanationText.textContent = isPaused
            ? '⏸️ 動畫已暫停，點擊「繼續」按鈕繼續播放...'
            : explanationText.textContent.replace('⏸️ 動畫已暫停，點擊「繼續」按鈕繼續播放...', '');
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

                if (layerDescriptions[layerNum]) {
                    const info = layerDescriptions[layerNum];
                    // 清除所有 active 狀態，標記當前點擊的項目
                    clearActiveSteps();
                    item.classList.add('active');

                    // 顯示該層詳細說明
                    explanationText.innerHTML = `
                        <strong style="color: ${info.color}; background: rgba(0,0,0,0.05); padding: 2px 8px; border-radius: 4px;">
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

    // 可被暫停和中斷的 sleep 函式
    function sleep(ms) {
        return new Promise(resolve => {
            if (shouldReset) {
                resolve();
                return;
            }

            const checkPause = () => {
                if (shouldReset) {
                    resolve();
                    return;
                }
                if (isPaused) {
                    // 等待繼續
                    new Promise(r => { pauseResolve = r; }).then(() => {
                        if (shouldReset) {
                            resolve();
                        } else {
                            setTimeout(resolve, ms);
                        }
                    });
                } else {
                    setTimeout(resolve, ms);
                }
            };
            checkPause();
        });
    }

    // Helper to create layer visual
    function createLayer(type, content, label, detailedHeader = "") {
        const div = document.createElement('div');
        div.className = `data-unit layer-${type}`;

        let headerHtml = `<div class="header-title">${label} Header</div>`;
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
        isAnimating = true;
        isPaused = false;
        shouldReset = false;
        startBtn.disabled = true;
        resetBtn.disabled = false;  // 允許在動畫中重置
        pauseBtn.disabled = false;  // 啟用暫停按鈕
        pauseBtn.textContent = '暫停';
        messageInput.disabled = true;

        resetVisuals();

        const message = messageInput.value || "Hello!";

        // --- 1. Encapsulation (Sender) ---

        // Step 7: App Layer
        setSenderStep(7);
        explanationText.textContent = texts.encapsulation.app;
        const appLayer = createLayer('app', `<div class="message-content">${message}</div>`, 'APP', headerData.app);
        senderStack.appendChild(appLayer);
        appLayer.style.opacity = '0';
        appLayer.style.transform = 'translateY(-20px)';
        await sleep(50);
        appLayer.style.opacity = '1';
        appLayer.style.transform = 'translateY(0)';
        await sleep(animationSpeed);

        // Step 6: Presentation Layer
        setSenderStep(6);
        explanationText.textContent = texts.encapsulation.pres;
        const presLayer = createLayer('pres', '', 'PRES', headerData.pres);
        presLayer.querySelector('.layer-content-wrapper').appendChild(appLayer);
        senderStack.appendChild(presLayer);
        await sleep(animationSpeed);

        // Step 5: Session Layer
        setSenderStep(5);
        explanationText.textContent = texts.encapsulation.sess;
        const sessLayer = createLayer('sess', '', 'SESS', headerData.sess);
        sessLayer.querySelector('.layer-content-wrapper').appendChild(presLayer);
        senderStack.appendChild(sessLayer);
        await sleep(animationSpeed);

        // Step 4: Transport Layer
        setSenderStep(4);
        explanationText.textContent = texts.encapsulation.trans;
        const tcpLayer = createLayer('tcp', '', 'TCP', headerData.tcp);
        tcpLayer.querySelector('.layer-content-wrapper').appendChild(sessLayer);
        senderStack.appendChild(tcpLayer);
        await sleep(animationSpeed);

        // Step 3: Network Layer
        setSenderStep(3);
        explanationText.textContent = texts.encapsulation.net;
        const ipLayer = createLayer('ip', '', 'IP', headerData.ip);
        ipLayer.querySelector('.layer-content-wrapper').appendChild(tcpLayer);
        senderStack.appendChild(ipLayer);
        await sleep(animationSpeed);

        // Step 2: Data Link Layer
        setSenderStep(2);
        explanationText.textContent = texts.encapsulation.link;
        const macLayer = createLayer('mac', '', 'MAC', headerData.mac);
        macLayer.querySelector('.layer-content-wrapper').appendChild(ipLayer);
        senderStack.appendChild(macLayer);
        await sleep(animationSpeed);

        // Step 1: Physical Layer
        setSenderStep(1);
        explanationText.textContent = texts.encapsulation.phy;
        await sleep(animationSpeed);


        // --- 2. Transmission ---
        clearActiveSteps();
        explanationText.textContent = texts.transmission;

        senderStack.style.opacity = '0';
        flyingPacket.classList.remove('hidden');

        flyingPacket.style.transition = `left ${animationSpeed / 1000}s linear`;
        flyingPacket.style.left = '20%';
        flyingPacket.offsetHeight;

        flyingPacket.style.left = '50%';

        await sleep(animationSpeed);

        router.classList.add('active');
        await sleep(500);
        router.classList.remove('active');

        flyingPacket.style.left = '80%';

        await sleep(animationSpeed);

        flyingPacket.classList.add('hidden');
        flyingPacket.style.left = '20%';


        // --- 3. Decapsulation (Receiver) ---
        // Step 1: Physical Reception
        setReceiverStep(1);
        explanationText.textContent = texts.decapsulation.phy;

        // Rebuild Stack
        receiverStack.innerHTML = '';
        const r_app = createLayer('app', `<div class="message-content">${message}</div>`, 'APP', headerData.app);

        const r_pres = createLayer('pres', '', 'PRES', headerData.pres);
        r_pres.querySelector('.layer-content-wrapper').appendChild(r_app);

        const r_sess = createLayer('sess', '', 'SESS', headerData.sess);
        r_sess.querySelector('.layer-content-wrapper').appendChild(r_pres);

        const r_tcp = createLayer('tcp', '', 'TCP', headerData.tcp);
        r_tcp.querySelector('.layer-content-wrapper').appendChild(r_sess);

        const r_ip = createLayer('ip', '', 'IP', headerData.ip);
        r_ip.querySelector('.layer-content-wrapper').appendChild(r_tcp);

        const r_mac = createLayer('mac', '', 'MAC', headerData.mac);
        r_mac.querySelector('.layer-content-wrapper').appendChild(r_ip);

        receiverStack.appendChild(r_mac);

        await sleep(animationSpeed);

        // Step 2: Remove Link
        setReceiverStep(2);
        explanationText.textContent = texts.decapsulation.link;
        await sleep(animationSpeed);
        r_mac.replaceWith(r_ip);

        // Step 3: Remove Network
        setReceiverStep(3);
        explanationText.textContent = texts.decapsulation.net;
        await sleep(animationSpeed);
        r_ip.replaceWith(r_tcp);

        // Step 4: Remove Transport
        setReceiverStep(4);
        explanationText.textContent = texts.decapsulation.trans;
        await sleep(animationSpeed);
        r_tcp.replaceWith(r_sess);

        // Step 5: Remove Session
        setReceiverStep(5);
        explanationText.textContent = texts.decapsulation.sess;
        await sleep(animationSpeed);
        r_sess.replaceWith(r_pres);

        // Step 6: Remove Presentation
        setReceiverStep(6);
        explanationText.textContent = texts.decapsulation.pres;
        await sleep(animationSpeed);
        r_pres.replaceWith(r_app);

        // Step 7: Done
        setReceiverStep(7);
        explanationText.textContent = texts.decapsulation.app;
        await sleep(animationSpeed);

        finalMessage.textContent = `收到訊息：${message}`;
        finalMessage.classList.remove('hidden');

        isAnimating = false;
        isPaused = false;
        startBtn.disabled = false;
        resetBtn.disabled = false;
        pauseBtn.disabled = true;
        pauseBtn.textContent = '暫停';
        messageInput.disabled = false;
    }

    function resetAnimation() {
        // 設定中斷標記
        shouldReset = true;

        // 如果正在暫停中，解除暫停讓動畫可以結束
        if (isPaused && pauseResolve) {
            pauseResolve();
            pauseResolve = null;
        }

        isAnimating = false;
        isPaused = false;
        resetVisuals();
        startBtn.disabled = false;
        resetBtn.disabled = false;
        pauseBtn.disabled = true;
        pauseBtn.textContent = '暫停';
        messageInput.disabled = false;
        explanationText.textContent = texts.idle;

        // 重置中斷標記
        setTimeout(() => { shouldReset = false; }, 100);
    }

    function resetVisuals() {
        senderStack.innerHTML = '';
        senderStack.style.opacity = '1';
        receiverStack.innerHTML = '';
        flyingPacket.classList.add('hidden');
        flyingPacket.style.left = '20%';
        finalMessage.classList.add('hidden');
        clearActiveSteps();
    }

    function setSenderStep(stepNum) {
        clearActiveSteps();
        if (senderSteps[stepNum]) senderSteps[stepNum].classList.add('active');
    }

    function setReceiverStep(stepNum) {
        clearActiveSteps();
        if (receiverSteps[stepNum]) receiverSteps[stepNum].classList.add('active');
    }

    function clearActiveSteps() {
        Object.values(senderSteps).forEach(s => s?.classList.remove('active'));
        Object.values(receiverSteps).forEach(s => s?.classList.remove('active'));
    }
});
