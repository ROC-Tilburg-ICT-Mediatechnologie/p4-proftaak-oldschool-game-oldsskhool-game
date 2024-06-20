<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "pacman_game";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $player_name = $_POST['player_name'];
    $score = $_POST['score'];

   // Check if the player already exists in the leaderboard
$checkQuery = "SELECT id FROM leaderboard WHERE player_name = ? AND score = ?";
$checkStmt = $conn->prepare($checkQuery);
$checkStmt->bind_param("si", $player_name, $score);
$checkStmt->execute();
$checkStmt->store_result();

if ($checkStmt->num_rows > 0) {
    // Player with the same name and score already exists, update the existing record
    echo "Player already exists in the leaderboard. Updating score.";
    // Perform an update query here
} else {
    // Insert a new record for the player
    $insertStmt = $conn->prepare("INSERT INTO leaderboard (player_name, score) VALUES (?, ?)");
    $insertStmt->bind_param("si", $player_name, $score);
    
    if ($insertStmt->execute()) {
        echo "New score recorded successfully";
    } else {
        echo "Error: " . $insertStmt->error;
    }
    $insertStmt->close();
}}

$checkStmt->close();
?>