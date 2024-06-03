document.addEventListener("DOMContentLoaded", () => {
    const gameBoard = document.getElementById("game-board");
    const scoreboard = document.getElementById("scoreboard");
    const startButton = document.getElementById("start-button");
    const pauseButton = document.getElementById("pause-button");
    const mainScreen = document.getElementById("main-screen");
    const gameContainer = document.getElementById("game-container");
    const boardSize = 10;
    let pacmanPosition = { x: 0, y: 0 };
    let ghosts = [
        { x: 9, y: 9 },
        { x: 5, y: 5 },
        { x: 3, y: 7 }
    ];
    const elements = [
        { type: "coin", x: 2, y: 5 },
        { type: "coin", x: 8, y: 3 }
    ];
    let score = 0;
    let gameInterval;
    let gamePaused = false;

    function updateScore() {
        scoreboard.innerText = `Score: ${score}`;
    }

    function createBoard() {
        gameBoard.innerHTML = '';
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.setAttribute("data-x", j);
                cell.setAttribute("data-y", i);
                gameBoard.appendChild(cell);
            }
        }
        updatePacmanPosition();
        updateGhostPositions();
        addCoinsToBoard();
    }

    function updatePacmanPosition() {
        document.querySelectorAll(".cell").forEach(cell => {
            cell.classList.remove("pacman");
        });
        const newPacmanCell = document.querySelector(`[data-x="${pacmanPosition.x}"][data-y="${pacmanPosition.y}"]`);
        newPacmanCell.classList.add("pacman");
    }

    function updateGhostPositions() {
        document.querySelectorAll(".cell").forEach(cell => {
            cell.classList.remove("ghost");
        });
        ghosts.forEach(ghost => {
            const newGhostCell = document.querySelector(`[data-x="${ghost.x}"][data-y="${ghost.y}"]`);
            newGhostCell.classList.add("ghost");
        });
    }

    function addCoinsToBoard() {
        elements.forEach(element => {
            if (element.type === "coin") {
                const coinCell = document.querySelector(`[data-x="${element.x}"][data-y="${element.y}"]`);
                coinCell.classList.add("coin");
            }
        });
    }

    function pickUpCoin() {
        elements.forEach((element, index) => {
            if (pacmanPosition.x === element.x && pacmanPosition.y === element.y && element.type === "coin") {
                const coinCell = document.querySelector(`[data-x="${element.x}"][data-y="${element.y}"]`);
                coinCell.classList.remove("coin");

                score += 10;
                updateScore();
                elements.splice(index, 1);
            }
        });
    }

    function movePacman(event) {
        if (gamePaused) return;

        switch (event.key) {
            case "ArrowUp":
                if (pacmanPosition.y > 0) pacmanPosition.y--;
                break;
            case "ArrowDown":
                if (pacmanPosition.y < boardSize - 1) pacmanPosition.y++;
                break;
            case "ArrowLeft":
                if (pacmanPosition.x > 0) pacmanPosition.x--;
                break;
            case "ArrowRight":
                if (pacmanPosition.x < boardSize - 1) pacmanPosition.x++;
                break;
        }
        updatePacmanPosition();
        pickUpCoin();
        checkCollision();
    }

    function moveGhosts() {
        if (gamePaused) return;

        ghosts.forEach(ghost => {
            const directions = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
            let direction;

            if (Math.random() < 0.7) {
                if (Math.abs(pacmanPosition.x - ghost.x) > Math.abs(pacmanPosition.y - ghost.y)) {
                    direction = pacmanPosition.x > ghost.x ? "ArrowRight" : "ArrowLeft";
                } else {
                    direction = pacmanPosition.y > ghost.y ? "ArrowDown" : "ArrowUp";
                }
            } else {
                direction = directions[Math.floor(Math.random() * directions.length)];
            }

            switch (direction) {
                case "ArrowUp":
                    if (ghost.y > 0) ghost.y--;
                    break;
                case "ArrowDown":
                    if (ghost.y < boardSize - 1) ghost.y++;
                    break;
                case "ArrowLeft":
                    if (ghost.x > 0) ghost.x--;
                    break;
                case "ArrowRight":
                    if (ghost.x < boardSize - 1) ghost.x++;
                    break;
            }
        });
        updateGhostPositions();
        checkCollision();
    }

    function checkCollision() {
        ghosts.forEach(ghost => {
            if (pacmanPosition.x === ghost.x && pacmanPosition.y === ghost.y) {
                alert("Game Over!");
                resetGame();
            }
        });
    }

    function resetGame() {
        pacmanPosition = { x: 0, y: 0 };
        ghosts = [
            { x: 9, y: 9 },
            { x: 5, y: 5 },
            { x: 3, y: 7 }
        ];
        score = 0;
        updateScore();
        updatePacmanPosition();
        updateGhostPositions();
        addCoinsToBoard();
    }

    function startGame() {
        mainScreen.style.display = "none";
        gameContainer.style.display = "flex";
        createBoard();
        document.addEventListener("keydown", movePacman);
        gameInterval = setInterval(moveGhosts, 1000);
        updateScore();
    }

    function pauseGame() {
        if (gamePaused) {
            gamePaused = false;
            pauseButton.innerText = "Pause";
        } else {
            gamePaused = true;
            pauseButton.innerText = "Resume";
        }
    }

    startButton.addEventListener("click", startGame);
    pauseButton.addEventListener("click", pauseGame);
});
