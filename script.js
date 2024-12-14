let lastParentChoice = null; // CPUの前回の役
let lastChildChoice = null;  // プレイヤーの前回の役
let secondLastParentChoice = null; // CPUの前々回の役
let secondLastChildChoice = null;  // プレイヤーの前々回の役
let isParentTurn = true;     // 現在のターンが親のターンかどうか
let turnCounter = 0;         // 現在のターン数
let isSoundOn = localStorage.getItem('isSoundOn') === 'true'; // ローカルストレージから音声設定を読み込む
let isFirstTurn = true;      // 初回ターンの判定
let isRulesVisible = false;  // ルール表示のオン/オフフラグ

const roles = ['Ye', 'Ch’e', 'Nge', 'Kiún', 'Fre']; // ① Freを追加
const roleImages = {
    CPU: { 
        'Ye': 'images/cpu-ye.png', 
        'Ch’e': 'images/cpu-che.png', 
        'Nge': 'images/cpu-nge.png', 
        'Kiún': 'images/cpu-kiun.png',
        'Fre': 'images/cpu-fre.png' // ⑩ Fre用の画像
    },
    Player: { 
        'Ye': 'images/player-ye.png', 
        'Ch’e': 'images/player-che.png', 
        'Nge': 'images/player-nge.png', 
        'Kiún': 'images/player-kiun.png',
        'Fre': 'images/player-fre.png' // ⑩ Fre用の画像
    }
};
const soundFiles = {
    Ye: 'audio/ye-sound.mp3',
    'Ch’e': 'audio/che-sound.mp3',
    Nge: 'audio/nge-sound.mp3',
    Kiún: 'audio/kiun-sound.mp3',
    Fre: 'audio/fre-sound.mp3' // ⑩ Fre用の音声
};

let playerSequence = []; // ③ プレイヤーの選択履歴
let cpuSequence = [];    // ④ CPUの選択履歴
let playerCanChooseFre = false; // ③ プレイヤーがFreを選べるかどうか
let cpuCanChooseFre = false;    // ④ CPUがFreを選べるかどうか
let isFTurn = false; // Fターンの判定フラグ
let isCPUFTurn = false; // CPUFターンの判定フラグ

// ルール表示の切り替え
function toggleRules() {
    isRulesVisible = !isRulesVisible;
    document.getElementById('rules-container').style.display = isRulesVisible ? 'block' : 'none';
}

// 初回ターンの時、CPUはKiúnを選ばない
function getRandomChoice(exclude, includeFre = false) {
    let choices = roles.filter(role => role !== exclude);
    if (!includeFre) {
        choices = choices.filter(role => role !== 'Fre'); // ④ Freは選べる条件でのみ追加
    }
    if (isFirstTurn) {
        choices = choices.filter(role => role !== 'Kiún');
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

// 前回の役を更新する関数
function updateLastRoles() {
    document.getElementById('cpu-last-role').innerText = lastParentChoice || 'なし';
    document.getElementById('cpu-second-last-role').innerText = secondLastParentChoice || 'なし'; // 追加: 前々回の役を表示
    document.getElementById('player-last-role').innerText = lastChildChoice || 'なし';
    document.getElementById('player-second-last-role').innerText = secondLastChildChoice || 'なし'; // 追加: 前々回の役を表示
}

function updateNextOptions() {
    let cpuOptions = roles.filter(role => role !== lastParentChoice).join(', ');
    let playerOptions = roles.filter(role => role !== lastChildChoice).join(', ');

    document.getElementById('cpu-options').innerText = cpuOptions;
    document.getElementById('player-options').innerText = playerOptions;
    if (cpuCanChooseFre) {
        document.getElementById('cpu-options').innerText += ', Fre'; // ⑪ CPUがFreを選べる場合にUI更新
    }
}

function updateTurnInfo() {
    document.getElementById('turn-counter').innerText = turnCounter;
    document.getElementById('current-parent').innerText = isParentTurn ? 'CPU (親)' : 'プレイヤー (親)';
    document.getElementById('current-child').innerText = isParentTurn ? 'プレイヤー (子)' : 'CPU (子)';

    // CPUFターンとFターンの状態を表示
    document.getElementById('cpuft-turn-status').innerText = isCPUFTurn ? '開始' : '未開始';
    document.getElementById('ft-turn-status').innerText = isFTurn ? '開始' : '未開始';
}

function endGame(message) {
    document.getElementById('center-info').innerHTML += `<p>${message}</p>`;
    document.getElementById('choices').innerHTML = '<button onclick="location.reload()">もう一度遊ぶ</button>';
}

function playTurn(childChoice) {
    if (!roles.includes(childChoice)) {
        alert('無効な選択です。');
        return;
    }

    if (childChoice === 'Fre' && !playerCanChooseFre) { // ③ プレイヤーがFreを選べる条件を確認
        alert('Freを選べる状況ではありません！');
        return;
    }

    // 初手でKiúnを出せない制約
    if (turnCounter === 0 && childChoice === 'Kiún') {
        alert('初手でKiúnは出せません！');
        return;
    }

    if (childChoice === lastChildChoice) {
        alert('同じ役を続けて出すことはできません！');
        return;
    }

    let parentChoice = getRandomChoice(lastParentChoice, cpuCanChooseFre); // ④ CPUがFreを選べるか確認
    
    // 現在の役を保存
    secondLastParentChoice = lastParentChoice; // 前々回の役を更新
    secondLastChildChoice = lastChildChoice;   // 前々回の役を更新
    lastParentChoice = parentChoice;           // 前回の役を更新
    lastChildChoice = childChoice;             // 前回の役を更新

    // 前回の役を更新
    updateLastRoles();

    // 選択履歴を更新 (③, ④)
    playerSequence.push(childChoice);
    cpuSequence.push(parentChoice);

    // 123ルールの判定 (③, ④)
    if (playerSequence.slice(-2).join(',') === 'Ye,Ch’e' || playerSequence.slice(-2).join(',') === 'Ch’e,Nge') {
        playerCanChooseFre = true;
    } else if (childChoice === 'Fre') {
        playerCanChooseFre = false;
    }

    if (cpuSequence.slice(-2).join(',') === 'Ye,Ch’e' || cpuSequence.slice(-2).join(',') === 'Ch’e,Nge') {
        cpuCanChooseFre = true;
    } else if (parentChoice === 'Fre') {
        cpuCanChooseFre = false;
    }

    // Fターン判定: Ye→Ch’e または Ch’e→Ngeの順で出された場合
    if (playerSequence.slice(-2).join(',') === 'Ye,Ch’e' || playerSequence.slice(-2).join(',') === 'Ch’e,Nge') {
        isFTurn = true;
    } else if (isFTurn && childChoice !== 'Fre') {
        isFTurn = false;
        playerCanChooseFre = false;
    }

    // CPUFターン終了の判定
    if ((cpuSequence.slice(-2).join(',') === 'Ye,Ch’e' || cpuSequence.slice(-2).join(',') === 'Ch’e,Nge') && !isCPUFTurn) {
        isCPUFTurn = true;
    }
    
    // CPUFターン終了の判定を追加
    if (isCPUFTurn) {
        // CPUがYe→Ch’e または Ch’e→Ngeの次に何を選んでもそのターン限りでCPUFTを終了
        if (['Ye', 'Ch’e', 'Nge', 'Kiún'].includes(parentChoice)) {
            isCPUFTurn = false; // 次にYe, Ch’e, Nge, Kiúnが選ばれたらCPUFTを終了
        }
    }
    
    // さらにターン終了時にリセットするロジック
    if (isParentTurn && turnCounter > 0) {
        // CPUターン終了時にフラグをリセット
        if (isCPUFTurn) {
            isCPUFTurn = false;
        }
}

    // 勝敗判定
    let resultMessage = '';
    if (childChoice === 'Fre' && parentChoice === 'Kiún') {
        resultMessage = 'FreとKiúnの勝負で親の勝利！'; // ⑦
    } else if (childChoice === 'Kiún' && parentChoice === 'Fre') {
        resultMessage = 'KiúnとFreの勝負で親の勝利！'; // ⑦
    } else if (childChoice === 'Fre' && parentChoice === 'Fre') {
        resultMessage = 'Fre同士の勝負で親の勝利！'; // ⑧
    } else if (['Ye', 'Ch’e', 'Nge'].includes(childChoice) && parentChoice === 'Fre') {
        resultMessage = 'Freと他の役の勝負で引き分け！ターン続行！'; // ⑨
        // 引き分けの処理: 親と子を交代して次のターンへ進む
        turnCounter++;
        isParentTurn = !isParentTurn; // 親と子を交代
        updateRoleImages();
        playSound(childChoice); // 役の音声を再生
        updateNextOptions();
        updateTurnInfo();
        return;
    } else if (childChoice === parentChoice && childChoice === 'Kiún') {
        resultMessage = 'Kiúnが一致したためゲームは続行されます。';
        // ゲーム続行の場合、ターン交代せず次のターンへ
        turnCounter++;
        isParentTurn = !isParentTurn; // 親と子を交代
        updateRoleImages();
        playSound(childChoice); // 役の音声を再生
        updateNextOptions();
        updateTurnInfo();
        return;
    } else if (parentChoice === childChoice) {
        resultMessage = '親と子が同じ役を出したため子の負け！';
    }

    // 新しい勝敗判定の追加
    if ((childChoice === 'Kiún' && parentChoice !== 'Kiún' && parentChoice !== 'Fre') || (parentChoice === 'Kiún' && childChoice !== 'Kiún' && childChoice !== 'Fre')) {
        resultMessage = 'Kiúnが一致しなかったため、親の負け！';
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

// ルールボタンの追加
document.getElementById('rule-button').addEventListener('click', toggleRules);
