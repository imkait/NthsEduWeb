// script.js

// DOM Elements
const periodicTable = document.getElementById('periodic-table');
const lanthanidesRow = document.getElementById('lanthanides-row');
const actinidesRow = document.getElementById('actinides-row');
// Temp controls removed
const infoPanel = document.getElementById('info-panel');
const infoLarge = document.getElementById('info-large');

// Info Panel Elements
const iNumber = document.getElementById('info-number');

// Mnemonic Data (Customizable)
const mnemonicsData = {
    groups: {
        1: "請李娜加入(你讓佳茹)設法",
        2: "媲美蓋茲(斯)被雷",
        3: "待提供",
        4: "待提供",
        5: "待提供",
        6: "待提供",
        7: "待提供",
        8: "待提供",
        9: "待提供",
        10: "待提供",
        11: "銅銀金輪",
        12: "待提供",
        13: "朋(友)屢(次改)嫁因(為)他",
        14: "嘆息者西遷",
        15: "蛋臨身踢壁",
        16: "養牛吸地(楊柳溪地)破",
        17: "浮綠繡點鱷",
        18: "害「乃雅客」先動"
    },
    periods: {
        1: "請嗨、侵害",
        2: "鯉皮捧炭，蛋(營)養服(食)奶",
        3: "那美女「系林牛」，綠牙",
        4: "呷鈣，抗颱「凡哥」猛，鐵骨煉銅心，嫁者深悉休克",
        5: "待提供",
        6: "待提供",
        7: "待提供"
    }
};
const iSymbol = document.getElementById('info-symbol');
const iName = document.getElementById('info-name');
const iZhuyin = document.getElementById('info-zhuyin'); // New
const iMass = document.getElementById('info-mass');
const iNameEn = document.getElementById('info-name-en');
const iWeight = document.getElementById('info-weight');
const iCategory = document.getElementById('info-category');
const iOxidation = document.getElementById('info-oxidation');
const iElectron = document.getElementById('info-electron');

// Current State
const currentTempC = 25; // Fixed at 25°C

// Initialization
function init() {
    renderTable();
    setupControls();
    // Default update done in renderTable? No, render calls updateElementStates at the end.
    // updateTempDisplays removed.

    // Select Hydrogen by default
    showElementInfo(elements[0]);
}

// Helper to clear Mnemonic Box
// 清除口訣內容並隱藏口訣框
function clearMnemonic() {
    const container = document.querySelector('.mnemonic-container');
    const title = document.getElementById('mnemonic-title');
    const content = document.getElementById('mnemonic-content');
    // 隱藏整個口訣容器（包含框線）
    if (container) container.classList.remove('active');
    if (title) title.style.display = 'none';
    if (content) content.textContent = '';
}

// Helper to update Mnemonic Box
// 更新口訣內容並顯示口訣框
function updateMnemonic(text) {
    const container = document.querySelector('.mnemonic-container');
    const title = document.getElementById('mnemonic-title');
    const content = document.getElementById('mnemonic-content');
    // 顯示整個口訣容器（包含框線）
    if (container) container.classList.add('active');
    if (title) title.style.display = 'block';
    if (content) {
        content.textContent = text;
        // 淡入動畫效果
        content.style.opacity = '0';
        setTimeout(() => content.style.opacity = '1', 50);
    }
}

// Render the periodic table
function renderTable() {
    const mainFragment = document.createDocumentFragment();
    const lanFragment = document.createDocumentFragment();
    const actFragment = document.createDocumentFragment();

    // 1. Generate Period Labels (Left Column)
    const romanPeriods = ["I", "II", "III", "IV", "V", "VI", "VII"];
    for (let p = 1; p <= 7; p++) {
        const div = document.createElement('div');
        div.className = `period-cell period-${p}`;
        div.textContent = romanPeriods[p - 1]; // Use Roman Numerals
        div.addEventListener('click', () => {
            const text = mnemonicsData.periods[p] || `週期${romanPeriods[p - 1]}`;
            updateMnemonic(text);
        });
        mainFragment.appendChild(div);
    }

    // 2. Generate Group Headers (Top Rows)
    const groupData = [
        { i: 1, lat: "1A", val: "+1" }, { i: 2, lat: "2A", val: "+2" },
        { i: 3, lat: "3B", val: "" }, { i: 4, lat: "4B", val: "" },
        { i: 5, lat: "5B", val: "" }, { i: 6, lat: "6B", val: "" },
        { i: 7, lat: "7B", val: "" }, { i: 8, lat: "8B", val: "" },
        { i: 9, lat: "8B", val: "" }, { i: 10, lat: "8B", val: "" },
        { i: 11, lat: "1B", val: "" }, { i: 12, lat: "2B", val: "" },
        { i: 13, lat: "3A", val: "+3" }, { i: 14, lat: "4A", val: "±4" },
        { i: 15, lat: "5A", val: "-3" }, { i: 16, lat: "6A", val: "-2" },
        { i: 17, lat: "7A", val: "-1" }, { i: 18, lat: "8A", val: "0" }
    ];

    groupData.forEach(g => {
        // Row 1: IUPAC Number (1-18)
        const d1 = document.createElement('div');
        d1.className = `header-cell header-row-1 group-${g.i}`;
        d1.textContent = g.i;
        d1.addEventListener('click', () => {
            const text = mnemonicsData.groups[g.i] || `族群${g.i}`;
            updateMnemonic(text);
        });
        mainFragment.appendChild(d1);

        // Row 2: CAS/Old IUPAC (1A-8A, 1B-8B)
        const d2 = document.createElement('div');
        d2.className = `header-cell header-row-2 group-${g.i}`;
        d2.textContent = g.lat;
        d2.addEventListener('click', () => {
            const text = mnemonicsData.groups[g.i] || `族群${g.i}`;
            updateMnemonic(text);
        });
        mainFragment.appendChild(d2);

        // Row 3: Valence Electron
        const d3 = document.createElement('div');
        d3.className = `header-cell header-row-3 group-${g.i}`;
        d3.textContent = g.val;
        d3.addEventListener('click', () => {
            const text = mnemonicsData.groups[g.i] || `族群${g.i}`;
            updateMnemonic(text);
        });
        mainFragment.appendChild(d3);
    });

    // Create Mnemonic Box (Placed in Groups 3-12, Periods 2-3)
    const mnemonicBox = document.createElement('div');
    mnemonicBox.className = 'mnemonic-container';
    mnemonicBox.innerHTML = `
        <div class="mnemonic-title" id="mnemonic-title" style="display: none;">口訣</div>
        <div class="mnemonic-content" id="mnemonic-content"></div>
    `;
    mainFragment.appendChild(mnemonicBox);

    // Create placeholder for Lanthanides/Actinides in main table
    // 57-71 Lanthanides
    const ph57 = document.createElement('div');
    ph57.className = 'placeholder-57-71 legend-btn';
    ph57.dataset.cat = 'lanthanide';
    ph57.innerHTML = '57-71<br>鑭系';
    // Position fixed by CSS
    mainFragment.appendChild(ph57);

    // 89-103 Actinides
    const ph89 = document.createElement('div');
    ph89.className = 'placeholder-89-103 legend-btn';
    ph89.dataset.cat = 'actinide';
    ph89.innerHTML = '89-103<br>錒系';
    // Position fixed by CSS
    mainFragment.appendChild(ph89);


    elements.forEach(el => {
        const div = document.createElement('div');
        div.className = `element ${el.category} group-${el.group} period-${el.period}`;
        div.dataset.atomicNumber = el.atomicNumber;
        div.dataset.category = el.category;

        div.innerHTML = `
            <div class="element-num">${el.atomicNumber}</div>
            <div class="element-symbol">${el.symbol}</div>
            <div class="element-name">${el.name}</div>
        `;

        div.addEventListener('click', () => showElementInfo(el));

        // Logic to place elements
        if (el.atomicNumber >= 57 && el.atomicNumber <= 71) {
            lanFragment.appendChild(div);
        } else if (el.atomicNumber >= 89 && el.atomicNumber <= 103) {
            actFragment.appendChild(div);
        } else {
            mainFragment.appendChild(div);
        }
    });

    periodicTable.appendChild(mainFragment);
    lanthanidesRow.appendChild(lanFragment);
    actinidesRow.appendChild(actFragment);

    // Initial state update
    updateElementStates(currentTempC);
}

// Setup Event Listeners
function setupControls() {
    // Legend Hover Effects
    const legendBtns = document.querySelectorAll('.legend-btn');
    legendBtns.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            const cat = btn.dataset.cat;
            const state = btn.dataset.state;

            if (cat) highlightCategory(cat);
            if (state) highlightState(state);
        });

        btn.addEventListener('mouseleave', () => {
            resetHighlights();
        });

        // Clear mnemonic when clicking legends
        btn.addEventListener('click', () => {
            clearMnemonic();
        });
    });
}

// Update Element States (Solid/Liquid/Gas) based on Temperature
function updateElementStates(tempC) {
    const elementDivs = document.querySelectorAll('.element');

    elementDivs.forEach(div => {
        const atomicNum = parseInt(div.dataset.atomicNumber);
        const elData = elements.find(e => e.atomicNumber === atomicNum);

        if (!elData) return;

        const state = getElementState(elData, tempC);

        // Remove previous state classes
        div.classList.remove('state-solid', 'state-liquid', 'state-gas', 'state-unknown');
        // Add new state class
        div.classList.add(`state-${state}`);
    });
}

function getElementState(el, tempC) {
    if (el.meltingPoint === null || el.boilingPoint === null) return 'unknown';

    // Special check for Unknown melting point but category implies something? 
    // Usually adhere to data. If null, unknown.

    if (tempC < el.meltingPoint) return 'solid';
    if (tempC < el.boilingPoint) return 'liquid';
    return 'gas';
}

// Highlighting Logic
function highlightCategory(category) {
    const allElements = document.querySelectorAll('.element');
    allElements.forEach(el => {
        if (el.dataset.category === category) {
            el.classList.add('highlighted');
            el.classList.remove('dimmed');
        } else {
            el.classList.add('dimmed');
            el.classList.remove('highlighted');
        }
    });

    // 佔位方格處理邏輯
    const ph57 = document.querySelector('.placeholder-57-71');
    const ph89 = document.querySelector('.placeholder-89-103');

    // 57-71 鑭系佔位方格
    if (ph57) {
        if (category === 'lanthanide') {
            // 點擊鑭系 → 高亮
            ph57.classList.add('highlighted');
            ph57.classList.remove('dimmed');
        } else {
            // 點擊其他分類（包含錒系）→ 淡化
            ph57.classList.add('dimmed');
            ph57.classList.remove('highlighted');
        }
    }

    // 89-103 錒系佔位方格
    if (ph89) {
        if (category === 'actinide') {
            // 點擊錒系 → 高亮
            ph89.classList.add('highlighted');
            ph89.classList.remove('dimmed');
        } else {
            // 點擊其他分類（包含鑭系）→ 淡化
            ph89.classList.add('dimmed');
            ph89.classList.remove('highlighted');
        }
    }

    // Dim Mnemonic Box during legend highlight
    const mnemonicBox = document.querySelector('.mnemonic-container');
    if (mnemonicBox) mnemonicBox.classList.add('dimmed');
}

function highlightState(state) {
    const allElements = document.querySelectorAll('.element');
    allElements.forEach(div => {
        const atomicNum = parseInt(div.dataset.atomicNumber);
        const elData = elements.find(e => e.atomicNumber === atomicNum);
        const currentState = getElementState(elData, currentTempC);

        if (currentState === state) {
            div.classList.add('highlighted');
            div.classList.remove('dimmed');
        } else {
            div.classList.add('dimmed');
            div.classList.remove('highlighted');
        }
    });

    // 佔位方格：固體時高亮（鑭系錒系都是固體），其他物態時淡化
    const ph57 = document.querySelector('.placeholder-57-71');
    const ph89 = document.querySelector('.placeholder-89-103');
    if (state === 'solid') {
        // 滑過固體 → 高亮（因為鑭系錒系都是固體）
        if (ph57) {
            ph57.classList.add('highlighted');
            ph57.classList.remove('dimmed');
        }
        if (ph89) {
            ph89.classList.add('highlighted');
            ph89.classList.remove('dimmed');
        }
    } else {
        // 滑過其他物態 → 淡化
        if (ph57) {
            ph57.classList.add('dimmed');
            ph57.classList.remove('highlighted');
        }
        if (ph89) {
            ph89.classList.add('dimmed');
            ph89.classList.remove('highlighted');
        }
    }

    // Dim Mnemonic Box during legend highlight
    const mnemonicBox = document.querySelector('.mnemonic-container');
    if (mnemonicBox) mnemonicBox.classList.add('dimmed');
}

function resetHighlights() {
    const allElements = document.querySelectorAll('.element');
    allElements.forEach(el => {
        el.classList.remove('highlighted', 'dimmed');
    });

    // 重置佔位方格
    const ph57 = document.querySelector('.placeholder-57-71');
    const ph89 = document.querySelector('.placeholder-89-103');
    if (ph57) ph57.classList.remove('highlighted', 'dimmed');
    if (ph89) ph89.classList.remove('highlighted', 'dimmed');

    // Undim Mnemonic Box
    const mnemonicBox = document.querySelector('.mnemonic-container');
    if (mnemonicBox) mnemonicBox.classList.remove('dimmed');
}

// Show Element Info
function showElementInfo(el) {
    // Clear Mnemonic Box
    clearMnemonic();

    // Update large display background to match category
    infoLarge.className = `element-large ${el.category}`;

    iNumber.textContent = el.atomicNumber;
    iSymbol.textContent = el.symbol;
    iName.textContent = el.name;
    iZhuyin.textContent = el.zhuyin || '';
    iMass.textContent = el.atomicMass;

    iNameEn.textContent = el.nameEn;
    iWeight.textContent = el.atomicMass;

    // Category Translation map
    const catMap = {
        'alkali-metal': '鹼金屬',
        'alkaline-earth': '鹼土金屬',
        'transition-metal': '過渡金屬',
        'lanthanide': '鑭系',
        'actinide': '錒系',
        'post-transition': '貧金屬',
        'metalloid': '類金屬',
        'reactive-nonmetal': '非金屬',
        'halogen': '鹵素',
        'noble-gas': '惰性氣體',
        'unknown': '未知'
    };
    iCategory.textContent = catMap[el.category] || el.category;

    iOxidation.innerHTML = el.oxidationStates || '未知';
    iElectron.textContent = el.electronConfiguration;
}

// Run Init
document.addEventListener('DOMContentLoaded', init);
