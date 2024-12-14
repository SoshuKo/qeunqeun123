let lastParentChoice = null; // CPUの前回の役
let lastChildChoice = null;  // プレイヤーの前回の役
let isParentTurn = true;     // 現在のターンが親のターンかどうか
let turnCounter = 1;         // 現在のターン数
let isSoundOn = localStorage.getItem('isSoundOn') === 'true'; // ローカルストレージから音声設定を読み込む
let isFirstTurn = true;      // 初回ターンの判定
let isRulesVisible = false;  // ルール表示のオン/オフフラグ

const roles = ['Ye', 'Ch’e', 'Nge', 'Kiún', 'Fre'];  // Freを追加
const roleImages = {
    CPU: { 'Ye': 'images/cpu-ye.png', 'Ch’e': 'images/cpu-che.png', 'Nge': 'images/cpu-nge.png', 'Kiún': 'images/cpu-kiun.png', 'Fre': 'images/cpu-fre.png' },
    Player: { 'Ye': 'images/player-ye.png', 'Ch’e': 'images/player-che.png', 'Nge': 'images/player-nge.png', 'Kiún': 'images/player-kiun.png', 'Fre': 'images/player-fre.png' }
};
const soundFiles = {
    Ye: 'audio/ye-sound.mp3',
    'Ch’e': 'audio/che-sound.mp3',
    Nge: 'audio/nge-sound.mp3',
    Kiún: 'audio/kiun-sound.mp3',
    Fre: 'audio/fre-sound.mp3'  // Freの音声ファイル
};

let canFreBeSelected = false; // Freが選べる状態かどうか
let lastFreTurn = -1; // 最後にFreを選んだターンを記録
let freCooldownTurns = 2; // Freが選べるターン数（連続したターンで役を出した後）

let flagA = false; // Ye → Ch’e ルールに従うフラグA
let flagB = false; // Ch’e → Nge ルールに従うフラグB

// ルール表示の切り替え
function toggleRules() {
    isRulesVisible = !isRulesVisible;
    document.getElementById('rules-container').style.display = isRulesVisible ? 'block' : 'none';
}

// 初回ターンの時、CPUはKiúnを選ばない
function getRandomChoice(exclude) {
    let choices = roles.filter(role => role !== exclude && (isFirstTurn ? role !== 'Kiún' : true));
    return choices[Math.floor(Math.random() * choices.length)];
}

function playSound(role) {
    if (isSoundOn) {
        let audio = new Audio(soundFiles[role]);
        audio.play();
    }
}

function updateRoleImages() {
    document.getElementById('cpu-role-img').src = roleImages.CPU[lastParentChoice] || '';
    document.getElementById('player-role-img').src = roleImages.Player[lastChildChoice] || '';
}

function updateNextOptions() {
    let cpuOptions = roles.filter(role => role !== lastParentChoice).join(', ');
    let playerOptions = roles.filter(role => role !== lastChildChoice).join(', ');

    // Freが選べるターンかどうか
    if (canFreBeSelected) {
        cpuOptions += ', Fre';
        playerOptions += ', Fre';
    }

    document.getElementById('cpu-options').innerText = cpuOptions;
    document.getElementById('player-options').innerText = playerOptions;
}

function updateTurnInfo() {
    document.getElementById('turn-counter').innerText = turnCounter;
    document.getElementById('current-parent').innerText = isParentTurn ? 'CPU (親)' : 'プレイヤー (親)';
    document.getElementById('current-child').innerText = isParentTurn ? 'プレイヤー (子)' : 'CPU (子)';
    document.getElementById('flagA').innerText = flagA ? 'true' : 'false';
    document.getElementById('flagB').innerText = flagB ? 'true' : 'false';
}

function endGame(message) {
    document.getElementById('center-info').innerHTML += `<p>${message}</p>`;
    document.getElementById('choices').innerHTML = '<button onclick="location.reload()">もう一度遊ぶ</button>';
}

function checkFreEligibility() {
    // 123ルールに基づいて、Freが選べるかどうかを判断
    flagA = lastParentChoice === 'Ye' && lastChildChoice === 'Ch’e';
    flagB = lastParentChoice === 'Ch’e' && lastChildChoice === 'Nge';
    canFreBeSelected = flagA || flagB;
}

function playTurn(childChoice) {
    if (!roles.includes(childChoice)) {
        alert('無効な選択です。');
        return;
    }

    if (turnCounter === 1 && childChoice === 'Kiún') {
        alert('初手でKiúnは出せません！');
        return;
    }

    if (childChoice === lastChildChoice) {
        alert('同じ役を続けて出すことはできません！');
        return;
    }

    let parentChoice = getRandomChoice(lastParentChoice);

    if (canFreBeSelected && childChoice === 'Fre' && turnCounter <= lastFreTurn + freCooldownTurns) {
        alert('現在、Freを選べるターンではありません。');
        return;
    }

    if (childChoice === 'Fre') lastFreTurn = turnCounter;

    lastParentChoice = parentChoice;
    lastChildChoice = childChoice;

    checkFreEligibility();

    let resultMessage = '';
    if (childChoice === 'Kiún' && parentChoice !== 'Kiún' || parentChoice === 'Kiún' && childChoice !== 'Kiún') {
        resultMessage = 'Kiúnが一致しなかったため、親の負け！';
    } else if (childChoice === parentChoice && parentChoice === 'Kiún') {
        resultMessage = 'Kiúnが一致したためゲームは続行されます。';
    } else if (parentChoice === childChoice) {
        resultMessage = '親と子が同じ役を出したため子の負け！';
    } else if (childChoice === 'Fre' && parentChoice === 'Fre') {
        resultMessage = 'Fre同士の勝負では親が勝利します。';
    } else if ((childChoice === 'Fre' || parentChoice === 'Fre') && childChoice !== parentChoice) {
        resultMessage = 'Freと他の役との勝負では引き分けです。ターンは続行されます。';
    }

    if (resultMessage) {
        updateRoleImages();
        playSound(childChoice);
        endGame(resultMessage);
        return;
    }

    turnCounter++;
    isParentTurn = !isParentTurn;
    isFirstTurn = false;

    updateRoleImages();
    playSound(childChoice);
    updateNextOptions();
    updateTurnInfo();
}

function toggleSound() {
    isSoundOn = !isSoundOn;
    localStorage.setItem('isSoundOn', isSoundOn);
    document.getElementById('sound-toggle').innerText = isSoundOn ? '音声オフ' : '音声オン';
}

document.getElementById('rule-button').addEventListener('click', toggleRules);
