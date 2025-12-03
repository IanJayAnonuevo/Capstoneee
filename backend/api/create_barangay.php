<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $pdo = $database->connect();

    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->barangay_name) || !isset($data->barangay_id)) {
        throw new Exception("Barangay Name and ID are required.");
    }

    // Check if ID exists
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM barangay WHERE barangay_id = ?");
    $stmt->execute([$data->barangay_id]);
    if ($stmt->fetchColumn() > 0) {
        throw new Exception("Barangay ID already exists.");
    }

    $sql = "INSERT INTO barangay (barangay_id, barangay_name, cluster_id, latitude, longitude) VALUES (?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $data->barangay_id,
        $data->barangay_name,
        $data->cluster_id ?? null,
        $data->latitude ?? null,
        $data->longitude ?? null
    ]);

    echo json_encode(["success" => true, "message" => "Barangay created successfully."]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
