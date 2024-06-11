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

$sql = "SELECT player_name, score FROM leaderboard ORDER BY score DESC LIMIT 10";
$result = $conn->query($sql);

$leaderboard = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $leaderboard[] = $row;
    }
}

$conn->close();

header('Content-Type: application/json');
echo json_encode($leaderboard);
?>
