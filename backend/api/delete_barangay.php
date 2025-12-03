<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $pdo = $database->connect();

    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->barangay_id)) {
        throw new Exception("Barangay ID is required.");
    }

    $sql = "DELETE FROM barangay WHERE barangay_id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$data->barangay_id]);

    echo json_encode(["success" => true, "message" => "Barangay deleted successfully."]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
