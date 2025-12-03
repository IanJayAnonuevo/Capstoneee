<?php
require_once __DIR__ . '/_bootstrap.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: DELETE, POST, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        throw new Exception('Database connection failed');
    }

    // Get task ID from URL parameter or POST body
    $task_id = null;
    
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE' || $_SERVER['REQUEST_METHOD'] === 'POST') {
        // Try to get from URL parameter first
        if (isset($_GET['task_id'])) {
            $task_id = intval($_GET['task_id']);
        } elseif (isset($_GET['id'])) {
            $task_id = intval($_GET['id']);
        } elseif (isset($_GET['assignment_id'])) {
            $task_id = intval($_GET['assignment_id']);
        } else {
            // Try to get from POST body
            $data = json_decode(file_get_contents('php://input'), true);
            if (isset($data['task_id'])) {
                $task_id = intval($data['task_id']);
            } elseif (isset($data['id'])) {
                $task_id = intval($data['id']);
            } elseif (isset($data['assignment_id'])) {
                $task_id = intval($data['assignment_id']);
            }
        }
    }

    if (!$task_id) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Missing task_id parameter. Use ?task_id=123 or send in request body'
        ]);
        exit;
    }

    // Start transaction
    $db->beginTransaction();

    try {
        // First, check if the task exists
        $checkStmt = $db->prepare("SELECT team_id, schedule_id FROM collection_team WHERE team_id = ?");
        $checkStmt->execute([$task_id]);
        $task = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if (!$task) {
            $db->rollBack();
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Task not found with ID: ' . $task_id
            ]);
            exit;
        }

        // Delete related records in order (to respect foreign key constraints)
        
        // 1. Delete from collection_team_member (team members)
        $stmt1 = $db->prepare("DELETE FROM collection_team_member WHERE team_id = ?");
        $stmt1->execute([$task_id]);
        $deletedMembers = $stmt1->rowCount();

        // 2. Delete from daily_route (if exists)
        $stmt2 = $db->prepare("DELETE FROM daily_route WHERE team_id = ?");
        $stmt2->execute([$task_id]);
        $deletedRoutes = $stmt2->rowCount();

        // 3. Delete from collection_team (main task)
        $stmt3 = $db->prepare("DELETE FROM collection_team WHERE team_id = ?");
        $stmt3->execute([$task_id]);
        $deletedTask = $stmt3->rowCount();

        // Commit transaction
        $db->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Task deleted successfully',
            'task_id' => $task_id,
            'deleted' => [
                'team_members' => $deletedMembers,
                'routes' => $deletedRoutes,
                'task' => $deletedTask
            ]
        ]);

    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
