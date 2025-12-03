<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Attendance - Time Bypass</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
        }
        input, select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        button {
            background: #4CAF50;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            width: 100%;
            margin-top: 10px;
        }
        button:hover {
            background: #45a049;
        }
        .result {
            margin-top: 20px;
            padding: 15px;
            border-radius: 4px;
            display: none;
        }
        .success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
        .error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
        .info {
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🕐 Test Attendance - Time Bypass</h1>
        
        <div class="info">
            <strong>⚠️ Testing Tool</strong><br>
            This bypasses time restrictions for testing purposes.
        </div>

        <div class="form-group">
            <label>User ID:</label>
            <input type="number" id="user_id" placeholder="Enter user ID" value="">
        </div>

        <div class="form-group">
            <label>Session:</label>
            <select id="session">
                <option value="AM">AM</option>
                <option value="PM">PM</option>
            </select>
        </div>

        <div class="form-group">
            <label>Date:</label>
            <input type="date" id="attendance_date" value="<?php echo date('Y-m-d'); ?>">
        </div>

        <div class="form-group">
            <label>Action:</label>
            <select id="action">
                <option value="time_in">Time In</option>
                <option value="time_out">Time Out</option>
            </select>
        </div>

        <button onclick="recordAttendance()">Submit Attendance</button>

        <div id="result" class="result"></div>
    </div>

    <script>
        async function recordAttendance() {
            const userId = document.getElementById('user_id').value;
            const session = document.getElementById('session').value;
            const date = document.getElementById('attendance_date').value;
            const action = document.getElementById('action').value;

            if (!userId) {
                showResult('Please enter a user ID', 'error');
                return;
            }

            const data = {
                user_id: parseInt(userId),
                attendance_date: date,
                session: session,
                action: action,
                recorded_by: null,
                notes: 'Test attendance - time bypass'
            };

            try {
                const response = await fetch('/backend/api/record_attendance.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    const msg = `
                        <strong>✅ Success!</strong><br>
                        ${result.message}<br><br>
                        <strong>User:</strong> ${result.user_info?.name || 'N/A'}<br>
                        <strong>Role:</strong> ${result.user_info?.role || 'N/A'}<br>
                        <strong>Time In:</strong> ${result.attendance?.time_in || 'N/A'}<br>
                        <strong>Time Out:</strong> ${result.attendance?.time_out || 'N/A'}<br>
                        <strong>Status:</strong> ${result.attendance?.status || 'N/A'}
                    `;
                    showResult(msg, 'success');
                } else {
                    showResult(`❌ Error: ${result.message}`, 'error');
                }
            } catch (error) {
                showResult(`❌ Network Error: ${error.message}`, 'error');
            }
        }

        function showResult(message, type) {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = message;
            resultDiv.className = 'result ' + type;
            resultDiv.style.display = 'block';
        }
    </script>
</body>
</html>
