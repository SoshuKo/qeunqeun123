let lastParentChoice = null; // CPUの前回の役
let lastChildChoice = null;  // プレイヤーの前回の役
let isParentTurn = true;     // 現在のターンが親のターンかどうか
let turnCounter = 1;         // 現在のターン数
let isSoundOn = localStorage.getItem('isSoundOn') === 'true'; // ローカルストレージから音声設定を読み込む
let isFirstTurn = true;      // 初回ターンの判定
let isRulesVisible = false;  // ルール表示のオン/オフフラグ

// 123ルール関連
let child123Eligible = false; // プレイヤーがFreを選べるかどうか
let parent123Eligible = false; // CPUがFreを選べるかどうか

const roles = ['Ye', 'Ch’e', 'Nge', 'Kiún', 'Fre'];
const roleImages = {
    CPU: { 'Ye': 'images/cpu-ye.png', 'Ch’e': 'images/cpu-che.png', 'Nge': 'images/cpu-nge.png', 'Kiún': 'images/cpu-kiun.png', 'Fre': 'images/cpu-fre.png' },
    Player: { 'Ye': 'images/player-ye.png', 'Ch’e': 'images/player-che.png', 'Nge': 'images/player-nge.png', 'Kiún': 'images/player-kiun.png', 'Fre': 'images/player-fre.png' }
};
const soundFiles = {
    Ye: 'audio/ye-sound.mp3',
    'Ch’e': 'audio/che-sound.mp3',
    Nge: 'audio/nge-sound.mp3',
    Kiún: 'audio/kiun-sound.mp3',
    Fre: 'audio/fre-sound.mp3'
};

// ルール表示の切り替え
function toggleRules() {
    isRulesVisible = !isRulesVisible;
    document.getElementById('rules-container').style.display = isRulesVisible ? 'block' : 'none';
}

// 初回ターンの時、CPUはKiúnを選ばない
function getRandomChoice(exclude, includeFre = false) {
    let choices = roles.filter(role => role !== exclude && role !== 'Kiún');

    if (!includeFre) {
        choices = choices.filter(role => role !== 'Fre');
    }

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

    document.getElementById('cpu-options').innerText = cpuOptions;
    document.getElementById('player-options').innerText = playerOptions;
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

function check123Rule(choice1, choice2) {
    return (choice1 === 'Ye' && choice2 === 'Ch’e') || (choice1 === 'Ch’e' && choice2 === 'Nge');
}

function playTurn(childChoice) {
    if (!roles.includes(childChoice)) {
        alert('無効な選択です。');
        return;
    }

    if (childChoice === 'Fre' && !child123Eligible) {
        alert('Freを選択できる条件を満たしていません。');
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

    let parentChoice = isParentTurn && parent123Eligible ? getRandomChoice(lastParentChoice, true) : getRandomChoice(lastParentChoice);

    // 現在の役を保存
    lastParentChoice = parentChoice;
    lastChildChoice = childChoice;

    // 123ルール適用の確認
    child123Eligible = check123Rule(lastChildChoice, childChoice);
    parent123Eligible = check123Rule(lastParentChoice, parentChoice);

    // 勝敗判定
    let resultMessage = '';
    if (childChoice === 'Fre' && parentChoice === 'Fre') {
        resultMessage = 'Fre同士の勝負では親が勝利します！';
    } else if (childChoice === 'Fre' || parentChoice === 'Fre') {
        if (childChoice === 'Fre' && parentChoice !== 'Kiún') {
            resultMessage = 'Freと他の役の勝負は引き分けです。';
        } else if (parentChoice === 'Fre' && childChoice !== 'Kiún') {
            resultMessage = 'Freと他の役の勝負は引き分けです。';
        } else {
            resultMessage = 'FreとKiúnの勝負では親が勝利します！';
        }
    } else if (parentChoice === childChoice) {
        resultMessage = '親と子が同じ役を出したため子の負け！';
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
