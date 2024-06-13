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
    const playAgainButton = document.getElementById("play-again-button");
    
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
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1],
        [1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1],
        [1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
        [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
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
        elements = [];
    
        // Voeg coins toe op specifieke locaties
        elements.push({ x: 2, y: 2, type: "coin" });
        elements.push({ x: 3, y: 3, type: "coin" });
    
        // Extra voorbeeld: Coins willekeurig plaatsen op lege cellen
        for (let i = 0; i < 5; i++) {
            let emptyCell = findEmptyCell();
            elements.push({ x: emptyCell.x, y: emptyCell.y, type: "coin" });
        }
    }
    
    function findEmptyCell() {
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
            return emptyCells[randomIndex];
        }
        return { x: 0, y: 0 }; // fallback, zou normaal niet mogen gebeuren als er lege cellen zijn
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
                    elements = elements.filter(e => e.type !== "power-up"); // Verwijder de power-up na 5 seconden
                    addElementsToBoard();
                    setTimeout(() => {
                        spawnPowerUp();
                    }, 10000); // Wacht nog eens 10 seconden voordat een nieuwe power-up verschijnt
                }, 5000); // Power-up blijft 5 seconden
            }
        } else {
            setTimeout(() => {
                spawnPowerUp();
            }, 15000); // Opnieuw proberen na 15 seconden als de power-up al gebruikt is
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
                    }, 5000); 
                }
                updateScore();
                elements.splice(index, 1);
                elementCell.classList.remove("coin", "power-up");
            }
        });
    }
    function moveGhosts() {
        if (gamePaused) return;
    
        ghosts.forEach(ghost => {
            const newPosition = { ...ghost };
    
            // Bereken de richting naar de Pacman
            const dx = pacmanPosition.x - ghost.x;
            const dy = pacmanPosition.y - ghost.y;
    
            // Bepaal welke as het grootste verschil heeft en beweeg in die richting
            if (Math.abs(dx) > Math.abs(dy)) {
                // Horizontale beweging
                newPosition.x += Math.sign(dx);
            } else {
                // Verticale beweging
                newPosition.y += Math.sign(dy);
            }
    
            // Controleer of de newPosition geen muur is, niet bezet is door een andere ghost en niet door Pacman
            if (map[newPosition.y][newPosition.x] !== 1 &&
                !ghosts.some(g => g.x === newPosition.x && g.y === newPosition.y) &&
                (newPosition.x !== pacmanPosition.x || newPosition.y !== pacmanPosition.y)) {
                ghost.x = newPosition.x;
                ghost.y = newPosition.y;
            }
        });
    
        // Update de posities van de geesten in de UI
        updateGhostPositions();
    
        // Controleer op botsingen met Pacman
        checkCollision();
    
        // Controleer de winconditie
        checkWinCondition();
    
        // Pas de bewegingssnelheid van de geesten aan op basis van de power-up status
        const ghostSpeed = powerUpActive ? 150 : 135; // Aangepaste snelheden
        clearInterval(gameInterval);
        gameInterval = setInterval(() => {
            movePacman();
            moveGhosts();
        }, ghostSpeed);
    }
    
    function startGame() {
        createBoard();
        placeElements();
        addElementsToBoard();
        spawnPowerUp();
    
        pacmanPosition = { x: 1, y: 1 };
    
        // De spoken zullen na 3 seconden verschijnen
        setTimeout(() => {
            ghosts = [
                { x: 5, y: 5 },
                { x: 7, y: 7 },
                { x: 9, y: 9 },
            ];
    
            updateGhostPositions();
            updatePacmanPosition();
            updateScore();
    
            gamePaused = false;
            gameInterval = setInterval(() => {
                movePacman();
                moveGhosts();
            }, 135); // Normale snelheid bij start van het spel
        }, 3000); // 3000 milliseconds = 3 seconds
    }
    
    
            
                function updatePacmanPosition() {
                    const pacmanCell = document.querySelector(".pacman");
                    if (pacmanCell) {
                        pacmanCell.classList.remove("pacman");
                    }
                    const newPacmanCell = document.querySelector(`[data-x="${pacmanPosition.x}"][data-y="${pacmanPosition.y}"]`);
                    if (newPacmanCell) {
                        newPacmanCell.classList.add("pacman");
                    }
                }
            
                function updateGhostPositions() {
                    document.querySelectorAll(".ghost").forEach(ghostCell => {
                        ghostCell.classList.remove("ghost");
                    });
            
                    ghosts.forEach(ghost => {
                        const ghostCell = document.querySelector(`[data-x="${ghost.x}"][data-y="${ghost.y}"]`);
                        if (ghostCell) {
                            ghostCell.classList.add("ghost");
                        }
                    });
                }
            

                function checkWinCondition() {
                    if (ghosts.length === 0) {
                        clearInterval(gameInterval);
                        gamePaused = true;
                        // Display winning animation or message
                        // For example, show a winning message
                        finalScore.innerText = `You won! Final Score: ${score}`;
                        gameOverModal.style.display = "block";
                    }
                }
                
                function checkCollision() {
                    ghosts.forEach(ghost => {
                        if (pacmanPosition.x === ghost.x && pacmanPosition.y === ghost.y) {
                            if (powerUpActive) {
                                ghosts = ghosts.filter(g => g !== ghost);
                            } else {
                                endGame();
                            }
                        }
                    });
                }
            
                function endGame() {
                    clearInterval(gameInterval);
                    gamePaused = true;
                    finalScore.innerText = `Score: ${score}`;
                    gameOverModal.style.display = "block";
                }
            
                function startGame() {
                    createBoard();
                    placeElements();
                    addElementsToBoard();
                    spawnPowerUp();
            
                    pacmanPosition = { x: 1, y: 1 };
            
                    // De spoken zullen na 3 seconden verschijnen
                    setTimeout(() => {
                        ghosts = [
                            { x: 5, y: 5 },
                            { x: 7, y: 7 },
                            { x: 9, y: 9 },
                        ];
            
                        updateGhostPositions();
                        updatePacmanPosition();
                        updateScore();
            
                        gamePaused = false;
                        gameInterval = setInterval(() => {
                            movePacman();
                            moveGhosts();
                        }, 135);
                    }, 3000); // 3000 milliseconds = 3 seconds
                }
            
                function pauseGame() {
                    gamePaused = !gamePaused;
                }
            
                function submitScore() {
                    const playerName = playerNameInput.value;
                    if (playerName) {
                        fetch("save_score.php", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded"
                            },
                            body: `player_name=${encodeURIComponent(playerName)}&score=${score}`
                        }).then(response => response.text()).then(data => {
                            alert(data);
                            fetchLeaderboard();
                        });
                    } else {
                        alert("Please enter your name");
                    }
                }
            
                function fetchLeaderboard() {
                    fetch("get_leaderboard.php")
                        .then(response => response.json())
                        .then(data => {
                            leaderboardList.innerHTML = "";
                            data.forEach(entry => {
                                const li = document.createElement("li");
                                li.innerText = `${entry.player_name}: ${entry.score}`;
                                leaderboardList.appendChild(li);
                            });
                        });
                }
            
                startButton.addEventListener("click", () => {
                    mainScreen.style.display = "none";
                    gameContainer.style.display = "block";
                    startGame();
                });
            
                pauseButton.addEventListener("click", () => {
                    pauseGame();
                });
            
                submitScoreButton.addEventListener("click", () => {
                    submitScore();
                });
            
                restartButton.addEventListener("click", () => {
                    gameOverModal.style.display = "none";
                    gameContainer.style.display = "none";
                    mainScreen.style.display = "block";
                    score = 0;
                });
            
                playAgainButton.addEventListener("click", () => {
                    gameOverModal.style.display = "none";
                    startGame();
                });
            
                window.addEventListener("keydown", e => {
                    keysPressed[e.key] = true;
                });
            
                window.addEventListener("keyup", e => {
                    keysPressed[e.key] = false;
                });
            });
            
