let lastParentChoice = null; // CPUの前回の役
let lastChildChoice = null;  // プレイヤーの前回の役
let isParentTurn = true;     // 現在のターンが親のターンかどうか
let turnCounter = 1;         // 現在のターン数
let isSoundOn = localStorage.getItem('isSoundOn') === 'true'; // ローカルストレージから音声設定を読み込む
let isFirstTurn = true;      // 初回ターンの判定
let isRulesVisible = false;  // ルール表示のオン/オフフラグ

const roles = ['Ye', 'Ch’e', 'Nge', 'Kiún', 'Fre'];  // ③: Freを追加
const roleImages = {
    CPU: { 'Ye': 'images/cpu-ye.png', 'Ch’e': 'images/cpu-che.png', 'Nge': 'images/cpu-nge.png', 'Kiún': 'images/cpu-kiun.png', 'Fre': 'images/cpu-fre.png' },  // ⑩: Freの画像追加
    Player: { 'Ye': 'images/player-ye.png', 'Ch’e': 'images/player-che.png', 'Nge': 'images/player-nge.png', 'Kiún': 'images/player-kiun.png', 'Fre': 'images/player-fre.png' } // ⑩: Freの画像追加
};
const soundFiles = {
    Ye: 'audio/ye-sound.mp3',
    'Ch’e': 'audio/che-sound.mp3',
    Nge: 'audio/nge-sound.mp3',
    Kiún: 'audio/kiun-sound.mp3',
    Fre: 'audio/fre-sound.mp3'  // ⑩: Freの音声追加
};

// ③: 123ルール適用
let playerFreAvailable = false;
let cpuFreAvailable = false;

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

    if (cpuFreAvailable) {
        cpuOptions += ', Fre';
    }

    if (playerFreAvailable) {
        playerOptions += ', Fre';
    }

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

// ④: 123ルールのFre選択判定
function playTurn(childChoice) {
    if (!roles.includes(childChoice)) {
        alert('無効な選択です。');
        return;
    }

    // ③: 123ルールチェック
    if ((lastChildChoice === 'Ye' && childChoice === 'Ch’e') || (lastChildChoice === 'Ch’e' && childChoice === 'Nge')) {
        if (!playerFreAvailable) {
            alert('Freはまだ選べません！');
            return;
        }
        playerFreAvailable = false; // Fre選択後は無効に
        childChoice = 'Fre'; // ここで強制的にFreにする
    } else if ((lastParentChoice === 'Ye' && childChoice === 'Ch’e') || (lastParentChoice === 'Ch’e' && childChoice === 'Nge')) {
        if (!cpuFreAvailable) {
            alert('CPUはFreを選べません！');
            return;
        }
        cpuFreAvailable = false; // CPUのFre選択後は無効に
    }

    // 初手でKiúnを出せない制約
    if (turnCounter === 1 && childChoice === 'Kiún') {
        alert('初手でKiúnは出せません！');
        return;
    }

    if (childChoice === lastChildChoice) {
        alert('同じ役を続けて出すことはできません！');
        return;
    }

    let parentChoice = getRandomChoice(lastParentChoice);
    if (isParentTurn && parentChoice === lastParentChoice) {
        parentChoice = getRandomChoice(lastParentChoice);
    }

    // 現在の役を保存
    lastParentChoice = parentChoice;
    lastChildChoice = childChoice;

    // 勝敗判定
    let resultMessage = '';
    if (childChoice === 'Kiún' && parentChoice !== 'Kiún') {
        resultMessage = 'Kiúnが一致しなかったため、親の負け！';
    } else if (parentChoice === 'Kiún' && childChoice !== 'Kiún') {
        resultMessage = 'Kiúnが一致しなかったため、親の負け！';
    } else if (parentChoice === childChoice && childChoice === 'Kiún') {
        resultMessage = 'Kiúnが一致したためゲームは続行されます。';
        // ゲーム続行の場合、ターン交代せず次のターンへ
        turnCounter++;
        updateRoleImages();
        playSound(childChoice); // 役の音声を再生
        updateNextOptions();
        updateTurnInfo();
        return;
    } else if (parentChoice === childChoice) {
        resultMessage = '親と子が同じ役を出したため子の負け！';
    }

    // 勝敗が決した場合
    if (resultMessage) {
        updateRoleImages();
        playSound(childChoice); // 役の音声を再生
        endGame(resultMessage);
        return;
    }

    // 勝負が決まらない場合、ターン交代
    turnCounter++;
    isParentTurn = !isParentTurn; // 親と子を交代
    isFirstTurn = false; // 初回ターンが終わったのでフラグを更新

    // UIの更新
    updateRoleImages();
    playSound(childChoice); // 役の音声を再生
    updateNextOptions();
    updateTurnInfo();
}

function toggleSound() {
    isSoundOn = !isSoundOn;
    localStorage.setItem('isSoundOn', isSoundOn); // 音声設定をローカルストレージに保存
    document.getElementById('sound-toggle').innerText = isSoundOn ? '音声オフ' : '音声オン';
}

// ⑦、⑧、⑨：Freの勝負規則
function checkFreFight(parentChoice, childChoice) {
    if (parentChoice === 'Fre' && childChoice === 'Kiún') {
        return 'FreとKiúnの戦いでは親が勝利します。';
    } else if (childChoice === 'Fre' && parentChoice === 'Kiún') {
        return 'FreとKiúnの戦いでは親が勝利します。';
    } else if (parentChoice === 'Fre' && childChoice === 'Fre') {
        return 'Fre同士の戦いでは親が勝利します。';
    } else if (parentChoice === 'Fre' && (childChoice === 'Ye' || childChoice === 'Ch’e' || childChoice === 'Nge')) {
        return 'FreとYe、Ch’e、Ngeとの戦いは引き分けです。ターンが続行します。';
    } else if (childChoice === 'Fre' && (parentChoice === 'Ye' || parentChoice === 'Ch’e' || parentChoice === 'Nge')) {
        return 'FreとYe、Ch’e、Ngeとの戦いは引き分けです。ターンが続行します。';
    }
}

// ルールボタンの追加
document.getElementById('rule-button').addEventListener('click', toggleRules);
