// game-core.js: Lógica del juego ColorDrop modularizada

import { saveGameResult } from './game-stats.js';

let board = [];
let size = 10;
let moves = 0;
let maxMoves = 20;
let currentColor = "";
let animationSpeed = 3;
let secondsElapsed = 0;
let timerInterval = null;
let sounds = {
    click: null,
    success: null,
    error: null,
    bg: null
};

const colors = ["#0072B2", "#D55E00", "#009E73", "#CC79A7", "#F0E442", "#56B4E9"];

document.getElementById("endContinue")?.addEventListener("click", () => {
    document.getElementById("endMessage").classList.add("hidden");
    abandonGameAndGoToMenu(true); // No guarda nada adicional, solo sale
});

document.getElementById("endReplay")?.addEventListener("click", () => {
    document.getElementById("endMessage").classList.add("hidden");
    restartGame(true); // Solo reinicia, no guarda de nuevo
});

export function initGame() {
    document.querySelectorAll(".level-card").forEach(card => {
        card.addEventListener("click", () => {
            document.querySelectorAll(".level-card").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
        });
    });
}

export function startGame() {
    const svg = document.getElementById("board");
    const info = document.getElementById("info");
    const difficultyInfo = document.getElementById("difficultyInfo");
    const row1 = document.getElementById("colorRow1");
    const row2 = document.getElementById("colorRow2");

    sounds = {
        click: new Audio("assets/sounds/click.mp3"),
        success: new Audio("assets/sounds/success.mp3"),
        error: new Audio("assets/sounds/error.mp3"),
        bg: new Audio("assets/sounds/background_loop.mp3")
    };

    sounds.bg.loop = true;
    sounds.bg.volume = 0.2;

    const selected = document.querySelector(".level-card.selected");
    const [w, h, m] = selected.dataset.value.split("x");
    size = parseInt(w);
    maxMoves = parseInt(m);
    moves = 0;
    secondsElapsed = 0;

    const level = selected.id;
    difficultyInfo.textContent = `Nivel: ${level}`;
    difficultyInfo.className = `info ${level}`;
    window.currentGameLevel = level;
    document.getElementById("menu").classList.remove("active");
    document.getElementById("game").classList.add("active");
    createBoard(svg);
    setupButtons(row1, row2, svg, sounds, info);
    sounds.bg.play();
    startTimer(info);
}


export function restartGame(skipAbandon = false) {

    if (!skipAbandon) {
        saveGameResult({
            nivel: window.currentGameLevel || "desconocido",
            resultado: "abandonada",
            movimientos: 99,
            tiempo: 5999
        });
    }

    moves = 0;
    stopTimer();
    secondsElapsed = 0;
    startTimer(document.getElementById("info"));
    createBoard(document.getElementById("board"));
}


export function abandonGameAndGoToMenu(skipAbandon = false) {
    if (!skipAbandon) {
        saveGameResult({
            nivel: window.currentGameLevel || "desconocido",
            resultado: "abandonada",
            movimientos: 99,
            tiempo: 5999
        });
    }

    if (sounds && sounds.bg) {
        sounds.bg.pause();
        sounds.bg.currentTime = 0;
    }

    document.getElementById("game").classList.remove("active");
    document.getElementById("menu").classList.add("active");
}




function createBoard(svg) {
    const tileSize = Math.floor(window.innerWidth * 0.9 / size);
    const boardSize = tileSize * size;
    svg.setAttribute("viewBox", `0 0 ${boardSize} ${boardSize}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.innerHTML = "";

    board = [];
    for (let y = 0; y < size; y++) {
        board[y] = [];
        for (let x = 0; x < size; x++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            board[y][x] = color;
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", x * tileSize);
            rect.setAttribute("y", y * tileSize);
            rect.setAttribute("width", tileSize);
            rect.setAttribute("height", tileSize);
            rect.setAttribute("fill", color);
            rect.setAttribute("data-x", x);
            rect.setAttribute("data-y", y);
            svg.appendChild(rect);
        }
    }
    currentColor = board[0][0];
    updateInfo(document.getElementById("info"));
}

function setupButtons(row1, row2, svg, sounds, info) {
    row1.innerHTML = "";
    row2.innerHTML = "";
    const half = Math.ceil(colors.length / 2);

    colors.forEach((color, index) => {
        const btn = document.createElement("button");
        btn.style.backgroundColor = color;
        btn.onclick = () => handleColorClick(color, svg, sounds, info);
        if (index < half) row1.appendChild(btn);
        else row2.appendChild(btn);
    });
}

function handleColorClick(color, svg, sounds, info) {
    if (color === currentColor || moves >= maxMoves) return;
    sounds.click.play();
    const targetColor = board[0][0];
    floodFill(0, 0, targetColor, color, svg);
    moves++;
    currentColor = color;
    updateInfo(info);

    if (checkWin()) {
        stopTimer();
        sounds.success.play();
        sounds.bg.pause();
        saveGameResult({
            nivel: window.currentGameLevel,
            resultado: "ganada",
            movimientos: moves,
            tiempo: secondsElapsed
        });
        showEndMessage("¡Has ganado!", "success");



    } else if (moves >= maxMoves) {
        stopTimer();
        sounds.error.play();
        sounds.bg.pause();
        saveGameResult({
            nivel: window.currentGameLevel,
            resultado: "perdida",
            movimientos: moves,
            tiempo: secondsElapsed
        });
        showEndMessage("¡Has perdido! 😢", "fail");


    }
}

function floodFill(x, y, targetColor, replacementColor, svg) {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    if (board[y][x] !== targetColor || board[y][x] === replacementColor) return;
    board[y][x] = replacementColor;
    setTimeout(() => {
        const rect = svg.querySelector(`rect[data-x="${x}"][data-y="${y}"]`);
        rect.setAttribute("fill", replacementColor);
    }, animationSpeed * 20);
    floodFill(x + 1, y, targetColor, replacementColor, svg);
    floodFill(x - 1, y, targetColor, replacementColor, svg);
    floodFill(x, y + 1, targetColor, replacementColor, svg);
    floodFill(x, y - 1, targetColor, replacementColor, svg);
}

function checkWin() {
    return board.every(row => row.every(cell => cell === currentColor));
}

function updateInfo(info) {
    const tiempo = formatTime(secondsElapsed);
    info.textContent = `Movimientos: ${moves}/${maxMoves}  |  🕒 ${tiempo}`;
}

function showEndMessage(text, type) {
    const msg = document.getElementById("endMessage");
    const box = document.getElementById("endBox");
    const textEl = document.getElementById("endText");
    const textScore = document.getElementById("endScore");
    const tiempo = formatTime(secondsElapsed);
    textEl.textContent = text;
    textScore.textContent = `Movimientos: ${moves}/${maxMoves}  |  🕒 ${tiempo}`;
    box.className = `end-box ${type}`;
    msg.classList.remove("hidden");
}

function startTimer(info) {
    stopTimer();
    timerInterval = setInterval(() => {
        secondsElapsed++;
        updateInfo(info);
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}
