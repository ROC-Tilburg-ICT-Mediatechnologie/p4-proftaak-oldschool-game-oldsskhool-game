<?php
$servername = "localhost"; // Change this if your database server is different
$username = "root"; // Replace with your database username
$password = ""; // Replace with your database password
$dbname = "pacman_game";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $player_name = $_POST['player_name'];
    $score = $_POST['score'];

    $stmt = $conn->prepare("INSERT INTO leaderboard (player_name, score) VALUES (?, ?)");
    $stmt->bind_param("si", $player_name, $score);

    if ($stmt->execute()) {
        echo "Score saved successfully";
    } else {
        echo "Error: " . $stmt->error;
    }

    $stmt->close();
}

$conn->close();
?>
