let lastParentChoice = null; // CPUの前回の役
let lastChildChoice = null;  // プレイヤーの前回の役
let isParentTurn = true;     // 現在のターンが親のターンかどうか
let turnCounter = 1;         // 現在のターン数
let isSoundOn = localStorage.getItem('isSoundOn') === 'true'; // ローカルストレージから音声設定を読み込む
let isFirstTurn = true;      // 初回ターンの判定
let isRulesVisible = false;  // ルール表示のオン/オフフラグ

// 123ルール関連のフラグ
let player123RuleActive = false;
let cpu123RuleActive = false;

const roles = ['Ye', 'Ch’e', 'Nge', 'Kiún', 'Fre'];
const roleImages = {
    CPU: { 
        'Ye': 'images/cpu-ye.png', 
        'Ch’e': 'images/cpu-che.png', 
        'Nge': 'images/cpu-nge.png', 
        'Kiún': 'images/cpu-kiun.png',
        'Fre': 'images/cpu-fre.png' 
    },
    Player: { 
        'Ye': 'images/player-ye.png', 
        'Ch’e': 'images/player-che.png', 
        'Nge': 'images/player-nge.png', 
        'Kiún': 'images/player-kiun.png',
        'Fre': 'images/player-fre.png' 
    }
};
const soundFiles = {
    Ye: 'audio/ye-sound.mp3',
    'Ch’e': 'audio/che-sound.mp3',
    Nge: 'audio/nge-sound.mp3',
    Kiún: 'audio/kiun-sound.mp3',
    Fre: 'audio/fre-sound.mp3'
};

// 123ルール判定用の状態
let playerSequence = [];
let cpuSequence = [];

// ルール表示の切り替え
function toggleRules() {
    isRulesVisible = !isRulesVisible;
    const rulesContainer = document.getElementById('rules-container');
    rulesContainer.style.display = isRulesVisible ? 'block' : 'none';
}

// 音声のオン/オフ切り替え
function toggleSound() {
    isSoundOn = !isSoundOn;
    localStorage.setItem('isSoundOn', isSoundOn);
    document.getElementById('sound-toggle').innerText = isSoundOn ? '音声オフ' : '音声オン';
}

// 初回ターンの時、CPUはKiúnを選ばない
function getRandomChoice(exclude) {
    let validChoices = roles.filter(role => role !== exclude);
    if (!cpu123RuleActive) {
        validChoices = validChoices.filter(role => role !== 'Fre');
    }
    if (isFirstTurn) {
        validChoices = validChoices.filter(role => role !== 'Kiún');
    }
    return validChoices[Math.floor(Math.random() * validChoices.length)];
}

// 音声再生
function playSound(role) {
    if (isSoundOn) {
        const audio = new Audio(soundFiles[role]);
        audio.play();
    }
}

// 役の画像更新
function updateRoleImages() {
    document.getElementById('cpu-role-img').src = roleImages.CPU[lastParentChoice] || 'images/default-cpu.png';
    document.getElementById('player-role-img').src = roleImages.Player[lastChildChoice] || 'images/default-player.png';
}

function updateNextOptions() {
    let cpuOptions = roles.filter(role => role !== lastParentChoice);
    if (!cpu123RuleActive) {
        cpuOptions = cpuOptions.filter(role => role !== 'Fre');
    }
    let playerOptions = roles.filter(role => role !== lastChildChoice);
    if (!player123RuleActive) {
        playerOptions = playerOptions.filter(role => role !== 'Fre');
    }

    document.getElementById('cpu-options').innerText = cpuOptions.join(', ');
    document.getElementById('player-options').innerText = playerOptions.join(', ');
}

function updateTurnInfo() {
    document.getElementById('turn-counter').innerText = turnCounter;
    document.getElementById('current-parent').innerText = isParentTurn ? 'CPU (親)' : 'プレイヤー (親)';
    document.getElementById('current-child').innerText = isParentTurn ? 'プレイヤー (子)' : 'CPU (子)';
}

function endGame(message) {
    document.getElementById('center-info').innerHTML += `<p>${message}</p>`;
    document.getElementById('choices').innerHTML = '<button onclick="location.reload()">もう一度遊ぶ</button>';
}

function update123RuleState(playerRole, cpuRole) {
    // プレイヤー123ルールの更新
    playerSequence.push(playerRole);
    if (playerSequence.slice(-2).join(',') === 'Ye,Ch’e' || playerSequence.slice(-2).join(',') === 'Ch’e,Nge') {
        player123RuleActive = true;
    } else if (playerRole !== 'Fre') {
        player123RuleActive = false;
    }

    // CPU123ルールの更新
    cpuSequence.push(cpuRole);
    if (cpuSequence.slice(-2).join(',') === 'Ye,Ch’e' || cpuSequence.slice(-2).join(',') === 'Ch’e,Nge') {
        cpu123RuleActive = true;
    } else if (cpuRole !== 'Fre') {
        cpu123RuleActive = false;
    }
}

function playTurn(childChoice) {
    if (!roles.includes(childChoice)) {
        alert('無効な選択です。');
        return;
    }

    // Fre選択の制約
    if (childChoice === 'Fre' && !player123RuleActive) {
        alert('Freを選択できるのは特定の条件を満たした場合のみです！');
        return;
    }

    // 初手でKiúnを出せない制約
    if (turnCounter === 1 && childChoice === 'Kiún') {
        alert('初手でKiúnは出せません！');
        return;
    }

    let parentChoice = getRandomChoice(lastParentChoice);

    // 勝敗判定ロジック
    let resultMessage = '';
    if (childChoice === 'Fre' || parentChoice === 'Fre') {
        if (childChoice === parentChoice) {
            resultMessage = 'Fre同士の勝負では親が勝利します！';
        } else if (childChoice === 'Fre' || parentChoice === 'Fre') {
            resultMessage = 'FreとKiúnの勝負では親が勝利します！';
        }
    }

    if (resultMessage) {
        endGame(resultMessage);
        return;
    }

    update123RuleState(childChoice, parentChoice);
    updateRoleImages();
    updateNextOptions();
    updateTurnInfo();

    turnCounter++;
    isParentTurn = !isParentTurn;
    isFirstTurn = false;
}
