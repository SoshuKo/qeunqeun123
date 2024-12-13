let lastParentChoice = null; // CPUの前回の役
let lastChildChoice = null;  // プレイヤーの前回の役
let isParentTurn = true;     // 現在のターンが親のターンかどうか
let turnCounter = 1;         // 現在のターン数
let isSoundOn = localStorage.getItem('isSoundOn') === 'true'; // ローカルストレージから音声設定を読み込む
let isFirstTurn = true;      // 初回ターンの判定
let isRulesVisible = false;  // ルール表示のオン/オフフラグ

const roles = ['Ye', 'Ch’e', 'Nge', 'Kiún', 'Fre'];  // Freを追加
const roleImages = {
    CPU: { 
        'Ye': 'images/cpu-ye.png', 
        'Ch’e': 'images/cpu-che.png', 
        'Nge': 'images/cpu-nge.png', 
        'Kiún': 'images/cpu-kiun.png', 
        'Fre': 'images/cpu-fre.png'  // Freを追加
    },
    Player: { 
        'Ye': 'images/player-ye.png', 
        'Ch’e': 'images/player-che.png', 
        'Nge': 'images/player-nge.png', 
        'Kiún': 'images/player-kiun.png', 
        'Fre': 'images/player-fre.png'  // Freを追加
    }
};
const soundFiles = {
    Ye: 'audio/ye-sound.mp3',
    'Ch’e': 'audio/che-sound.mp3',
    Nge: 'audio/nge-sound.mp3',
    Kiún: 'audio/kiun-sound.mp3',
    Fre: 'audio/fre-sound.mp3'  // Freの音声追加
};

let player123Progress = [];  // プレイヤーの進行状況
let cpu123Progress = [];     // CPUの進行状況

// ルール表示の切り替え
function toggleRules() {
    isRulesVisible = !isRulesVisible;
    document.getElementById('rules-container').style.display = isRulesVisible ? 'block' : 'none';
}

// 初回ターンの時、CPUはKiúnを選ばない
function getRandomChoice(exclude) {
    if (isFirstTurn) {
        let choices = roles.filter(role => role !== exclude && role !== 'Kiún');
        return choices[Math.floor(Math.random() * choices.length)];
    } else {
        let choices = roles.filter(role => role !== exclude);
        return choices[Math.floor(Math.random() * choices.length)];
    }
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

function validate123Progress(progress, role) {
    return (progress.length === 0 && role === 'Ye') || 
           (progress.length === 1 && role === 'Ch’e') || 
           (progress.length === 2 && role === 'Fre');
}

function playTurn(childChoice) {
    if (!roles.includes(childChoice)) {
        alert('無効な選択です。');
        return;
    }

    // ①Fre選択条件
    if (childChoice === 'Fre' && !validate123Progress(player123Progress, childChoice)) {
        alert('123ルールの条件を満たしていないため、Freは選べません。');
        return;
    }

    player123Progress.push(childChoice);
    if (player123Progress.length > 3) player123Progress.shift();

    // ②CPUの選択条件
    let cpuChoice = getRandomChoice(lastParentChoice);
    if (player123Progress.length === 2 && cpu123Progress.length === 2 && cpuChoice === 'Fre') {
        cpu123Progress.push('Fre');
    } else if (!roles.includes(cpuChoice)) {
        cpuChoice = getRandomChoice(lastParentChoice);
    }

    // ③Freの選択
    if (cpuChoice === 'Fre' && !validate123Progress(cpu123Progress, cpuChoice)) {
        cpuChoice = getRandomChoice(lastParentChoice); // Freを選べない場合は他の役に変更
    }

    lastParentChoice = cpuChoice;
    lastChildChoice = childChoice;

    // 勝敗判定
    let resultMessage = '';
    if (childChoice === 'Fre' && cpuChoice === 'Fre') {
        resultMessage = 'Fre同士の勝負なので、親が勝利します！';
    } else if (childChoice === 'Fre' && cpuChoice !== 'Fre') {
        resultMessage = 'Freは親が勝利します！';
    } else if (cpuChoice === 'Fre' && childChoice !== 'Fre') {
        resultMessage = 'Freは親が勝利します！';
    } else if (childChoice === 'Kiún' && cpuChoice !== 'Kiún') {
        resultMessage = 'Kiúnが一致しなかったため、親の負け！';
    } else if (cpuChoice === 'Kiún' && childChoice !== 'Kiún') {
        resultMessage = 'Kiúnが一致しなかったため、親の負け！';
    } else if (parentChoice === childChoice && childChoice === 'Kiún') {
        resultMessage = 'Kiúnが一致したためゲームは続行されます。';
        turnCounter++;
        updateRoleImages();
        playSound(childChoice); // 役の音声を再生
        updateNextOptions();
        updateTurnInfo();
        return;
    }

    // ⑧FreとKiún
    if (childChoice === 'Fre' || cpuChoice === 'Fre') {
        resultMessage = 'FreとKiúnの勝負は、親が勝利します！';
    }

    // 結果を表示
    updateRoleImages();
    playSound(childChoice); // 役の音声を再生
    endGame(resultMessage);
}

function toggleSound() {
    isSoundOn = !isSoundOn;
    localStorage.setItem('isSoundOn', isSoundOn); // 音声設定をローカルストレージに保存
    document.getElementById('sound-toggle').innerText = isSoundOn ? '音声オフ' : '音声オン';
}

// ルールボタンの追加
document.getElementById('rule-button').addEventListener('click', toggleRules);
