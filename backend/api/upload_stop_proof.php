<?php
require_once __DIR__ . '/_bootstrap.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit();
}

try {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    throw new RuntimeException('Invalid request method.');
  }

  $stopId = isset($_POST['stop_id']) ? (int) $_POST['stop_id'] : 0;
  if ($stopId <= 0) {
    throw new RuntimeException('Missing stop_id.');
  }

  if (!isset($_FILES['proof_photo']) || $_FILES['proof_photo']['error'] !== UPLOAD_ERR_OK) {
    throw new RuntimeException('Proof photo is required.');
  }

  $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  $fileInfo = $_FILES['proof_photo'];
  $extension = strtolower(pathinfo($fileInfo['name'], PATHINFO_EXTENSION));
  if (!in_array($extension, $allowedExtensions, true)) {
    throw new RuntimeException('Invalid photo format. Use JPG, PNG, or WEBP.');
  }

  $uploadDir = realpath(__DIR__ . '/../..') . '/uploads/route_proofs';
  if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true)) {
    throw new RuntimeException('Failed to prepare upload directory.');
  }

  $filename = sprintf('stop_%d_%d.%s', $stopId, time(), $extension);
  $targetPath = $uploadDir . '/' . $filename;
  if (!move_uploaded_file($fileInfo['tmp_name'], $targetPath)) {
    throw new RuntimeException('Failed to store photo.');
  }

  $relativePath = 'uploads/route_proofs/' . $filename;

  echo json_encode([
    'success' => true,
    'proof_photo_url' => $relativePath,
  ]);
} catch (Throwable $e) {
  http_response_code(400);
  echo json_encode([
    'success' => false,
    'message' => $e->getMessage(),
  ]);
}





