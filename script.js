document.addEventListener("DOMContentLoaded", () => {
    const gameBoard = document.getElementById("game-board");
    const scoreboard = document.getElementById("scoreboard");
    const startButton = document.getElementById("start-button");
    const pauseButton = document.getElementById("pause-button");
    const mainScreen = document.getElementById("main-screen");
    const gameContainer = document.getElementById("game-container");
    const gameOverModal = document.getElementById("game-over-modal");
    const finalScore = document.getElementById("final-score");
    const playerNameInput = document.getElementById("player-name");
    const submitScoreButton = document.getElementById("submit-score");
    const restartButton = document.getElementById("restart-button");
    const leaderboardList = document.getElementById("leaderboard-list");
    const leaderboardContainer = document.getElementById("leaderboard-container");

    let pacmanPosition = { x: 1, y: 1 };
    let ghosts = [];
    let elements = [];
    let score = 0;
    let gameInterval;
    let gamePaused = false;
    let powerUpActive = false;
    let powerUpUsed = false;
    let keysPressed = {};

    const map = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1],
        [1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1],
        [1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1],
        [1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
        [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];

    function updateScore() {
        scoreboard.innerText = `Score: ${score}`;
    }

    function createBoard() {
        gameBoard.innerHTML = "";
        map.forEach((row, y) => {
            row.forEach((cell, x) => {
                const div = document.createElement("div");
                div.classList.add("cell");
                if (cell === 1) {
                    div.classList.add("wall");
                }
                div.dataset.x = x;
                div.dataset.y = y;
                gameBoard.appendChild(div);
            });
        });
    }

    function placeElements() {
        elements = [
            { x: 2, y: 2, type: "coin" },
            { x: 3, y: 3, type: "coin" }
        ];
    }

    function addElementsToBoard() {
        elements.forEach(element => {
            const elementCell = document.querySelector(`[data-x="${element.x}"][data-y="${element.y}"]`);
            if (element.type === "coin") {
                elementCell.classList.add("coin");
            } else if (element.type === "power-up") {
                elementCell.classList.add("power-up");
            }
        });
    }

    function spawnPowerUp() {
        if (!powerUpUsed) {
            const emptyCells = [];
            map.forEach((row, y) => {
                row.forEach((cell, x) => {
                    if (cell === 0 && !elements.some(e => e.x === x && e.y === y) && !ghosts.some(g => g.x === x && g.y === y) && (pacmanPosition.x !== x || pacmanPosition.y !== y)) {
                        emptyCells.push({ x, y });
                    }
                });
            });

            if (emptyCells.length > 0) {
                const randomIndex = Math.floor(Math.random() * emptyCells.length);
                const powerUpCell = emptyCells[randomIndex];
                elements.push({ x: powerUpCell.x, y: powerUpCell.y, type: "power-up" });
                addElementsToBoard();
                powerUpUsed = true;

                setTimeout(() => {
                    powerUpUsed = false;
                    spawnPowerUp();
                }, 15000); // Spawn power-up every 15 seconds
            }
        }
    }

    function pickUpElement() {
        elements.forEach((element, index) => {
            if (pacmanPosition.x === element.x && pacmanPosition.y === element.y) {
                const elementCell = document.querySelector(`[data-x="${element.x}"][data-y="${element.y}"]`);
                if (element.type === "coin") {
                    score += 10;
                } else if (element.type === "power-up") {
                    score += 50;
                    powerUpActive = true;
                    setTimeout(() => {
                        powerUpActive = false;
                    }, 5000); // Power-up lasts for 5 seconds
                }
                updateScore();
                elements.splice(index, 1);
                elementCell.classList.remove("coin", "power-up");
            }
        });
    }

    function movePacman() {
        if (gamePaused) return;

        const newPosition = { ...pacmanPosition };

        if (keysPressed.ArrowUp) {
            newPosition.y--;
        } else if (keysPressed.ArrowDown) {
            newPosition.y++;
        } else if (keysPressed.ArrowLeft) {
            newPosition.x--;
        } else if (keysPressed.ArrowRight) {
            newPosition.x++;
        }

        if (map[newPosition.y][newPosition.x] !== 1) {
            pacmanPosition = newPosition;
            updatePacmanPosition();
            pickUpElement();
            checkCollision();
        }
    }

    function moveGhosts() {
        if (gamePaused) return;

        ghosts.forEach(ghost => {
            const newPosition = { ...ghost };

            const directions = [];
            if (pacmanPosition.x !== newPosition.x) {
                directions.push(pacmanPosition.x < newPosition.x ? "ArrowRight" : "ArrowLeft");
            }
            if (pacmanPosition.y !== newPosition.y) {
                directions.push(pacmanPosition.y < newPosition.y ? "ArrowDown" : "ArrowUp");
            }

            const direction = directions[Math.floor(Math.random() * directions.length)];

            switch (direction) {
                case "ArrowUp":
                    if (map[newPosition.y - 1][newPosition.x] !== 1) newPosition.y--;
                    break;
                case "ArrowDown":
                    if (map[newPosition.y + 1][newPosition.x] !== 1) newPosition.y++;
                    break;
                case "ArrowLeft":
                    if (map[newPosition.y][newPosition.x - 1] !== 1) newPosition.x--;
                    break;
                case "ArrowRight":
                    if (map[newPosition.y][newPosition.x + 1] !== 1) newPosition.x++;
                    break;
            }

            ghost.x = newPosition.x;
            ghost.y = newPosition.y;
        });

        updateGhostPositions();
        checkCollision();
    }

    function checkCollision() {
        ghosts.forEach(ghost => {
            if (pacmanPosition.x === ghost.x && pacmanPosition.y === ghost.y) {
                if (powerUpActive) {
                    const ghostIndex = ghosts.indexOf(ghost);
                    ghosts.splice(ghostIndex, 1); // Remove the ghost if power-up is active
                    score += 100; // Bonus points for eating a ghost
                    updateScore();
                } else {
                    gameOver();
                }
            }
        });
    }

    function updatePacmanPosition() {
        document.querySelectorAll(".pacman").forEach(cell => cell.classList.remove("pacman"));
        const pacmanCell = document.querySelector(`[data-x="${pacmanPosition.x}"][data-y="${pacmanPosition.y}"]`);
        pacmanCell.classList.add("pacman");
    }

    function updateGhostPositions() {
        document.querySelectorAll(".ghost").forEach(cell => cell.classList.remove("ghost"));
        ghosts.forEach(ghost => {
            const ghostCell = document.querySelector(`[data-x="${ghost.x}"][data-y="${ghost.y}"]`);
            ghostCell.classList.add("ghost");
        });
    }

    function gameOver() {
        clearInterval(gameInterval);
        document.removeEventListener("keydown", handleKeyDown);
        gameOverModal.style.display = "flex";
        finalScore.innerText = score;
        fetchLeaderboard();
    }

    function resetGame() {
        pacmanPosition = { x: 1, y: 1 };
        ghosts = [
            { x: 9, y: 9 },
            { x: 5, y: 5 },
            { x: 15, y: 5 }
        ];
        score = 0;
        createBoard();
        placeElements();
        addElementsToBoard();
        updateScore();
        spawnPowerUp();
    }

    function startGame() {
        mainScreen.style.display = "none";
        gameContainer.style.display = "flex";
        gameOverModal.style.display = "none";
        resetGame();
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
        gameInterval = setInterval(() => {
            movePacman();
            moveGhosts();
        }, 200);
    }

    function pauseGame() {
        if (gamePaused) {
            gamePaused = false;
            pauseButton.innerText = "Pause";
            gameInterval = setInterval(() => {
                movePacman();
                moveGhosts();
            }, 200);
        } else {
            gamePaused = true;
            pauseButton.innerText = "Resume";
            clearInterval(gameInterval);
        }
    }

    function handleKeyDown(event) {
        keysPressed[event.key] = true;
    }

    function handleKeyUp(event) {
        keysPressed[event.key] = false;
    }

    function restartGame() {
        gameOverModal.style.display = "none";
        resetGame();
        startGame();
    }

    function fetchLeaderboard() {
        fetch('get_leaderboard.php')
            .then(response => response.json())
            .then(data => {
                leaderboardList.innerHTML = '';
                data.forEach(entry => {
                    const li = document.createElement('li');
                    li.textContent = `${entry.player_name}: ${entry.score}`;
                    leaderboardList.appendChild(li);
                });
            });
    }

    function submitScore() {
        const playerName = playerNameInput.value.trim();
        if (!playerName) {
            alert('Please enter your name.');
            return;
        }

        const formData = new FormData();
        formData.append('player_name', playerName);
        formData.append('score', score);

        fetch('save_score.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(result => {
            alert(result);
            fetchLeaderboard();
        });
    }

    startButton.addEventListener("click", startGame);
    pauseButton.addEventListener("click", pauseGame);
    restartButton.addEventListener("click", restartGame);
    submitScoreButton.addEventListener("click", submitScore);

    // Fetch leaderboard on page load
    fetchLeaderboard();
});


//
+-------------------------------------------------+
|                      Player                     |
+-------------------------------------------------+
| player_id (PK)                                  |
| name                                            |
| total_score                                     |
+-------------------------------------------------+

+-------------------------------------------------+
|                      Score                      |
+-------------------------------------------------+
| score_id (PK)                                   |
| player_id (FK naar Player)                      |
| score                                           |
| date                                            |
+-------------------------------------------------+

+-------------------------------------------------+
|                      Game                       |
+-------------------------------------------------+
| game_id (PK)                                    |
| player_id (FK naar Player)                      |
| start_time                                      |
| end_time                                        |
| duration                                        |
+-------------------------------------------------+

+-------------------------------------------------+
|                      Map                        |
+-------------------------------------------------+
| map_id (PK)                                     |
| map_name                                        |
| map_data (BLOB)                                 |
+-------------------------------------------------+
