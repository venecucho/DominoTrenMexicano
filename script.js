
let players = [];
let currentRound = 1;
const MAX_ROUNDS = 13;
let startIndex = 0;

const addPlayerBtn = document.getElementById('add-player-btn');
const startGameBtn = document.getElementById('start-game-btn');
const playerNameInput = document.getElementById('player-name');
const playerListDiv = document.getElementById('player-list');
const setupSection = document.getElementById('setup-section');
const gameSection = document.getElementById('game-section');
const scoreboardSection = document.getElementById('scoreboard-section');
const gameOverSection = document.getElementById('game-over-section');
const scoreInputArea = document.getElementById('score-input-area');
const scoreboardHead = document.getElementById('scoreboard-head');
const scoreboardBody = document.getElementById('scoreboard-body');
const scoreboardFoot = document.getElementById('scoreboard-foot');
const winnerAnnouncement = document.getElementById('winner-announcement');
const startingPlayerSpan = document.getElementById('starting-player');

addPlayerBtn.addEventListener('click', addPlayer);
playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addPlayer();
});
startGameBtn.addEventListener('click', startGame);
document.getElementById('submit-round-btn').addEventListener('click', submitScores);
document.getElementById('restart-game-btn').addEventListener('click', () => {
    if (confirm("¿Estás seguro que deseas reiniciar el juego? Se perderán los datos actuales.")) {
        restartGame();
    }
});

function addPlayer() {
    const name = playerNameInput.value.trim();
    if (!name || players.some(p => p.name.toLowerCase() === name.toLowerCase())) return;
    players.push({ name, scores: Array(MAX_ROUNDS).fill(null), total: 0 });
    playerNameInput.value = '';
    renderPlayerList();
    startGameBtn.disabled = players.length < 2;
}

function renderPlayerList() {
    playerListDiv.innerHTML = '';
    const list = document.createElement('ul');
    players.forEach((p, i) => {
        const li = document.createElement('li');
        li.textContent = p.name;
        li.className = 'text-gray-700 flex justify-between items-center';
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Eliminar';
        removeBtn.className = 'btn-secondary text-xs px-2 py-1 ml-2';
        removeBtn.onclick = () => {
            players.splice(i, 1);
            renderPlayerList();
            startGameBtn.disabled = players.length < 2;
        };
        li.appendChild(removeBtn);
        list.appendChild(li);
    });
    playerListDiv.appendChild(list);
}

function startGame() {
    setupSection.classList.add('hidden');
    gameSection.classList.remove('hidden');
    scoreboardSection.classList.remove('hidden');
    saveGameState();
    renderRound();
    renderScoreboard();
}

function renderRound() {
    document.getElementById('current-round').textContent = currentRound;
    document.getElementById('current-engine').textContent = 'Doble-' + (13 - currentRound);
    const rotatingIndex = (startIndex + currentRound - 1) % players.length;
    startingPlayerSpan.textContent = players[rotatingIndex].name;

    scoreInputArea.innerHTML = '';
    players.forEach((p, i) => {
        const div = document.createElement('div');
        div.className = 'flex items-center space-x-2';
        const label = document.createElement('label');
        label.textContent = p.name + ':';
        label.className = 'w-1/3 text-sm font-medium text-gray-700 text-right';
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.id = 'score-' + i;
        input.className = 'w-2/3 px-3 py-1 border rounded-md';
        div.appendChild(label);
        div.appendChild(input);
        scoreInputArea.appendChild(div);
    });
}

function submitScores() {
    let valid = true;
    players.forEach((p, i) => {
        const input = document.getElementById('score-' + i);
        const val = parseInt(input.value);
        if (isNaN(val) || val < 0) {
            input.classList.add('border-red-500');
            valid = false;
        } else {
            input.classList.remove('border-red-500');
            p.scores[currentRound - 1] = val;
            p.total = p.scores.reduce((a, b) => a + (b || 0), 0);
        }
    });
    if (!valid) return;

    renderScoreboard();
    saveGameState();

    if (currentRound >= MAX_ROUNDS) {
        endGame();
    } else {
        currentRound++;
        renderRound();
    }
}

function renderScoreboard() {
    scoreboardHead.innerHTML = '';
    scoreboardBody.innerHTML = '';
    const headRow = document.createElement('tr');
    headRow.innerHTML = '<th>Jugador</th>' + Array.from({length: MAX_ROUNDS}, (_, i) => '<th>R' + (i+1) + '</th>').join('') + '<th>Total</th>';
    scoreboardHead.appendChild(headRow);
    players.forEach(p => {
        const row = document.createElement('tr');
        row.className = 'even:bg-white odd:bg-gray-50';
        row.innerHTML = '<td>' + p.name + '</td>' + p.scores.map(s => '<td>' + (s !== null ? s : '-') + '</td>').join('') + '<td class="font-bold">' + p.total + '</td>';
        scoreboardBody.appendChild(row);
    });
}

function endGame() {
    gameSection.classList.add('hidden');
    gameOverSection.classList.remove('hidden');
    localStorage.removeItem('mtgame');
    const min = Math.min(...players.map(p => p.total));
    const winners = players.filter(p => p.total === min).map(p => p.name);
    winnerAnnouncement.textContent = winners.length === 1
        ? `Ganador: ${winners[0]} con ${min} puntos`
        : `Empate entre: ${winners.join(', ')} con ${min} puntos`;
}

function restartGame() {
    players = [];
    currentRound = 1;
    startIndex = 0;
    localStorage.removeItem('mtgame');
    setupSection.classList.remove('hidden');
    gameSection.classList.add('hidden');
    scoreboardSection.classList.add('hidden');
    gameOverSection.classList.add('hidden');
    renderPlayerList();
    startGameBtn.disabled = true;
}

function saveGameState() {
    localStorage.setItem('mtgame', JSON.stringify({
        players,
        currentRound,
        startIndex
    }));
}

function loadGameState() {
    const saved = localStorage.getItem('mtgame');
    if (!saved) return;
    const game = JSON.parse(saved);
    players = game.players;
    currentRound = game.currentRound;
    startIndex = game.startIndex;
    renderPlayerList();
    startGameBtn.disabled = false;
    if (confirm("¿Deseas continuar el juego anterior?")) {
        startGame();
    }
}

window.onload = loadGameState;
