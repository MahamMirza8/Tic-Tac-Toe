// Theme switching
const themeSwitch = document.getElementById('checkbox');
const html = document.documentElement;

themeSwitch.addEventListener('change', () => {
    html.setAttribute('data-theme', themeSwitch.checked ? 'dark' : 'light');
});

// Game state
let boxes = document.querySelectorAll(".box");
let resetBtn = document.querySelector(".reset-btn");
let displayMessage = document.querySelector("#header-display");
let messageClass = document.querySelector(".display-message");
let newGameBtn = document.querySelector(".newGame-btn");
let scoreX = document.getElementById("score-x");
let scoreO = document.getElementById("score-o");
let turnText = document.getElementById("turn-text");
let closeModalBtn = document.getElementById("close-modal");
let modal = document.getElementById("modal");
let vsAIButton = document.getElementById("vsAI");
let vsHumanButton = document.getElementById("vsHuman");
let historyList = document.getElementById("history-list");

let turnO = true;
let count = 0;
let scores = { X: 0, O: 0 };
let gameHistory = [];
let isPlayingVsAI = false;

// Optional: Sound effects (add your own mp3/ogg files in the project)
// const moveSound = new Audio('move.mp3');
// const winSound = new Audio('win.mp3');
// const drawSound = new Audio('draw.mp3');

const winPattern = [
    [0, 1, 2],
    [0, 3, 6],
    [0, 4, 8],
    [1, 4, 7],
    [2, 4, 6],
    [2, 5, 8],
    [3, 4, 5],
    [6, 7, 8],
];

// Game options
vsAIButton.addEventListener('click', () => {
    isPlayingVsAI = true;
    vsAIButton.classList.add('active');
    vsHumanButton.classList.remove('active');
    resetGame();
});

vsHumanButton.addEventListener('click', () => {
    isPlayingVsAI = false;
    vsHumanButton.classList.add('active');
    vsAIButton.classList.remove('active');
    resetGame();
});

// AI Logic
function getBestMove() {
    // Simple AI: First try to win, then block, then take center, then take corners
    let bestMove = -1;
    
    // Try to win
    bestMove = findWinningMove('O');
    if (bestMove !== -1) return bestMove;
    
    // Try to block
    bestMove = findWinningMove('X');
    if (bestMove !== -1) return bestMove;
    
    // Take center if available
    if (boxes[4].innerHTML === '') return 4;
    
    // Take corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => boxes[i].innerHTML === '');
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // Take any available spot
    const availableSpots = Array.from(boxes).map((box, index) => box.innerHTML === '' ? index : -1).filter(i => i !== -1);
    return availableSpots[Math.floor(Math.random() * availableSpots.length)];
}

function findWinningMove(player) {
    for (let pattern of winPattern) {
        const [a, b, c] = pattern;
        const boxesArray = Array.from(boxes);
        
        // Check if two spots are filled with player and one is empty
        if (boxesArray[a].innerHTML === player && boxesArray[b].innerHTML === player && boxesArray[c].innerHTML === '') {
            return c;
        }
        if (boxesArray[a].innerHTML === player && boxesArray[c].innerHTML === player && boxesArray[b].innerHTML === '') {
            return b;
        }
        if (boxesArray[b].innerHTML === player && boxesArray[c].innerHTML === player && boxesArray[a].innerHTML === '') {
            return a;
        }
    }
    return -1;
}

function makeAIMove() {
    if (!isPlayingVsAI || turnO) return;
    
    const bestMove = getBestMove();
    if (bestMove !== -1) {
        setTimeout(() => {
            boxes[bestMove].click();
        }, 500);
    }
}

// Game History
function addToHistory(winner) {
    const timestamp = new Date().toLocaleTimeString();
    const result = winner ? `Winner: ${winner}` : "Draw";
    gameHistory.unshift({ timestamp, result });
    
    // Update history display
    historyList.innerHTML = gameHistory.map(game => `
        <div class="history-item">
            <span>${game.timestamp}</span>
            <span>${game.result}</span>
        </div>
    `).join('');
}

// Confetti Effect
function triggerConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}

// Update game functions
function updateTurnText() {
    turnText.textContent = `Player ${turnO ? "O" : "X"}'s turn`;
}

function updateScores() {
    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;
}

boxes.forEach((box) => {
    box.addEventListener("click", () => {
        if (box.innerHTML !== '') return;
        
        const icon = turnO ? '<i class="fas fa-circle"></i>' : '<i class="fas fa-times"></i>';
        box.innerHTML = icon;
        box.classList.add(turnO ? "filled-o" : "filled-x");
        
        turnO = !turnO;
        count++;
        updateTurnText();
        
        let isWinner = checkWinner();
        if (count === 9 && !isWinner) {
            gameDraw();
        } else if (!isWinner) {
            makeAIMove();
        }
    });
});

const gameDraw = () => {
    displayMessage.innerText = `It's a draw!`;
    modal.classList.remove("hide");
    addToHistory(null);
    disableButtons();
};

const disableButtons = () => {
    for (let box of boxes) {
        box.disabled = true;
    }
};

const enableButtons = () => {
    for (let box of boxes) {
        box.disabled = false;
        box.innerHTML = '';
        box.classList.remove("filled-x", "filled-o");
    }
};

const checkWinner = () => {
    for (let pattern of winPattern) {
        let position1Value = boxes[pattern[0]].innerHTML;
        let position2Value = boxes[pattern[1]].innerHTML;
        let position3Value = boxes[pattern[2]].innerHTML;
        
        if (position1Value !== '' && position2Value !== '' && position3Value !== '') {
            if (position1Value === position2Value && position2Value === position3Value) {
                const winner = position1Value.includes('circle') ? 'O' : 'X';
                showWinner(winner);
                return true;
            }
        }
    }
    return false;
};

const showWinner = (winner) => {
    displayMessage.innerText = `Congratulations! The winner is ${winner}`;
    modal.classList.remove("hide");
    scores[winner]++;
    updateScores();
    addToHistory(winner);
    triggerConfetti();
    disableButtons();
};

const resetGame = () => {
    turnO = true;
    count = 0;
    enableButtons();
    modal.classList.add("hide");
    updateTurnText();
};

// Event Listeners
resetBtn.addEventListener("click", resetGame);
newGameBtn.addEventListener("click", resetGame);
closeModalBtn.addEventListener("click", () => {
    modal.classList.add("hide");
});

// Initialize
updateScores();
updateTurnText();
modal.classList.add("hide");
vsHumanButton.classList.add('active');