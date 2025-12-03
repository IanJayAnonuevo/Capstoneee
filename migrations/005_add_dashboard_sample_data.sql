-- Minimal Sample Data for Admin Dashboard Testing
-- This script only updates existing data to avoid foreign key errors

-- ============================================
-- 1. DAILY ROUTES - Add sample routes for today
-- ============================================

-- Clear existing routes for today
DELETE FROM daily_route WHERE date = '2025-11-28';

-- Insert 18 routes with unique cluster_ids
INSERT INTO daily_route (date, cluster_id, barangay_id, barangay_name, status, source, version, created_at, updated_at)
VALUES
-- 5 In-progress routes
('2025-11-28', 'TEST-C01', 1, 'Sagrada Familia', 'in_progress', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'TEST-C02', 2, 'Aldezar', 'in_progress', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'TEST-C03', 3, 'Bulan', 'in_progress', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'TEST-C04', 4, 'Biglaan', 'in_progress', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'TEST-C05', 5, 'Salvacion', 'in_progress', 'manual', 1, NOW(), NOW()),

-- 12 Scheduled routes
('2025-11-28', 'TEST-C06', 6, 'Alteza', 'scheduled', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'TEST-C07', 7, 'Anib', 'scheduled', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'TEST-C08', 8, 'Awayan', 'scheduled', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'TEST-C09', 9, 'Azucena', 'scheduled', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'TEST-C10', 10, 'Bagong Sirang', 'scheduled', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'TEST-C11', 11, 'Binahian', 'scheduled', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'TEST-C12', 12, 'Bolo Norte', 'scheduled', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'TEST-C13', 13, 'Bolo Sur', 'scheduled', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'TEST-C14', 14, 'Bulawan', 'scheduled', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'TEST-C15', 15, 'Cabuyao', 'scheduled', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'TEST-C16', 16, 'Caima', 'scheduled', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'TEST-C17', 17, 'Calagbangan', 'scheduled', 'manual', 1, NOW(), NOW()),

-- 1 Completed route
('2025-11-28', 'TEST-C18', 18, 'Calampinay', 'completed', 'manual', 1, NOW(), NOW());

-- ============================================
-- 2. ISSUE REPORTS - Add sample issues
-- ============================================

-- Insert 21 issues (15 resolved, 6 unresolved)
INSERT INTO issue_reports (reporter_name, barangay, issue_type, description, status, priority, created_at, updated_at)
VALUES
-- Resolved (15)
('Sample User 1', 'Sagrada Familia', 'Missed Collection', 'Test issue 1', 'resolved', 'high', '2025-11-27 08:00:00', NOW()),
('Sample User 2', 'Aldezar', 'Overflowing Bin', 'Test issue 2', 'resolved', 'medium', '2025-11-27 09:00:00', NOW()),
('Sample User 3', 'Bulan', 'Damaged Bin', 'Test issue 3', 'resolved', 'low', '2025-11-26 10:00:00', NOW()),
('Sample User 4', 'Biglaan', 'Illegal Dumping', 'Test issue 4', 'resolved', 'urgent', '2025-11-26 11:00:00', NOW()),
('Sample User 5', 'Salvacion', 'Missed Collection', 'Test issue 5', 'resolved', 'high', '2025-11-25 08:00:00', NOW()),
('Sample User 6', 'Alteza', 'Overflowing Bin', 'Test issue 6', 'resolved', 'medium', '2025-11-25 09:00:00', NOW()),
('Sample User 7', 'Anib', 'Damaged Bin', 'Test issue 7', 'resolved', 'low', '2025-11-24 10:00:00', NOW()),
('Sample User 8', 'Awayan', 'Missed Collection', 'Test issue 8', 'resolved', 'high', '2025-11-24 11:00:00', NOW()),
('Sample User 9', 'Azucena', 'Illegal Dumping', 'Test issue 9', 'resolved', 'urgent', '2025-11-23 08:00:00', NOW()),
('Sample User 10', 'Bagong Sirang', 'Overflowing Bin', 'Test issue 10', 'resolved', 'medium', '2025-11-23 09:00:00', NOW()),
('Sample User 11', 'Binahian', 'Damaged Bin', 'Test issue 11', 'resolved', 'low', '2025-11-22 10:00:00', NOW()),
('Sample User 12', 'Bolo Norte', 'Missed Collection', 'Test issue 12', 'resolved', 'high', '2025-11-22 11:00:00', NOW()),
('Sample User 13', 'Bolo Sur', 'Overflowing Bin', 'Test issue 13', 'resolved', 'medium', '2025-11-21 08:00:00', NOW()),
('Sample User 14', 'Bulawan', 'Illegal Dumping', 'Test issue 14', 'resolved', 'urgent', '2025-11-21 09:00:00', NOW()),
('Sample User 15', 'Cabuyao', 'Damaged Bin', 'Test issue 15', 'resolved', 'low', '2025-11-20 10:00:00', NOW()),

-- Unresolved (6)
('Sample User 16', 'Caima', 'Missed Collection', 'Test issue 16', 'pending', 'high', '2025-11-28 08:00:00', NOW()),
('Sample User 17', 'Calagbangan', 'Overflowing Bin', 'Test issue 17', 'active', 'urgent', '2025-11-28 09:00:00', NOW()),
('Sample User 18', 'Calampinay', 'Damaged Bin', 'Test issue 18', 'pending', 'medium', '2025-11-27 10:00:00', NOW()),
('Sample User 19', 'Sagrada Familia', 'Illegal Dumping', 'Test issue 19', 'active', 'urgent', '2025-11-27 11:00:00', NOW()),
('Sample User 20', 'Aldezar', 'Missed Collection', 'Test issue 20', 'pending', 'high', '2025-11-27 08:00:00', NOW()),
('Sample User 21', 'Bulan', 'Overflowing Bin', 'Test issue 21', 'open', 'medium', '2025-11-27 09:00:00', NOW());

-- ============================================
-- 3. TRUCK STATUS - Update existing trucks
-- ============================================

-- Update truck statuses (only if trucks exist)
UPDATE truck SET status = 'Available' WHERE truck_id <= 8;
UPDATE truck SET status = 'Maintenance' WHERE truck_id > 8 AND truck_id <= 10;

-- ============================================
-- VERIFICATION - Check what was inserted
-- ============================================

SELECT 
    'Routes inserted' as item,
    COUNT(*) as count 
FROM daily_route 
WHERE date = '2025-11-28'

UNION ALL

SELECT 
    'Issues inserted' as item,
    COUNT(*) as count 
FROM issue_reports 
WHERE created_at >= '2025-11-20'

UNION ALL

SELECT 
    'Trucks updated' as item,
    COUNT(*) as count 
FROM truck;

-- ============================================
-- NOTES FOR MANUAL DATA ENTRY
-- ============================================

-- For attendance and task assignments, you need to:
-- 1. Check which user_ids actually exist in your database
-- 2. Manually insert attendance_request records for those users
-- 3. Manually insert task_assignment records for those users

-- To see existing users:
-- SELECT user_id, role_id FROM user WHERE role_id IN (3, 4) LIMIT 30;

-- Then manually create attendance records like:
-- INSERT INTO attendance_request (user_id, submitted_at, request_status, remarks)
-- VALUES (actual_user_id, '2025-11-28 07:00:00', 'approved', 'Sample');
