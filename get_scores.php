<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "pacman_game";
$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT id, player_name, score FROM leaderboard ORDER BY score DESC";
$result = $conn->query($sql);
$scores = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $scores[] = $row;
    }
}

$conn->close();
echo json_encode($scores);
?>