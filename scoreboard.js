let lives = 3;
let score = 0;

let submitScore = () => {
    let playerName = prompt("Enter your name:");
    if (!playerName) {
        playerName = "Anonymous";
    }

    let xhr = new XMLHttpRequest();
    xhr.open("POST", "submit_score.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            alert(xhr.responseText);
        }
    };
    xhr.send("player_name=" + playerName + "&score=" + score);
};
let onGameOver = () => {
    submitScore(); // Score opslaan in de database
    alert("Game Over!"); // Toon bericht aan de speler

    // Optioneel: Voeg een restart optie toe
    if (confirm("Do you want to play again?")) {
        resetGame(); // Roep resetGame functie aan om het spel te resetten
    }
};
let resetGame = () => {
    lives = 3; // Stel levens opnieuw in op 3
    score = 0; // Reset score naar 0
    // Voeg eventuele andere reset logica toe, zoals het herstarten van Pacman en spoken
};



let onGhostCollision = () => {
    lives--;
    if (lives <= 0) {
        onGameOver();
    } else {
        restartPacmanAndGhosts();
    }
};

let fetchScores = () => {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "get_scores.php", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let scores = JSON.parse(xhr.responseText);
            let scoreboard = document.getElementById("scoreboard");
            scoreboard.innerHTML = "<h2>Top Scores</h2>";
            scores.forEach((score, index) => {
                scoreboard.innerHTML += `<p>${index + 1}. ${score.player_name}: ${score.score}</p>`;
            });
        }
    };
    xhr.send();
};

fetchScores();
