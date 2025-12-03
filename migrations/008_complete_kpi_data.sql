-- Complete Sample Data for All 4 Dashboard KPIs
-- This script will populate all metrics on the Daily Operations Overview

-- ============================================
-- CLEAN UP EXISTING DATA FOR TODAY
-- ============================================
DELETE FROM daily_route WHERE date = '2025-11-28';
DELETE FROM attendance_request WHERE DATE(submitted_at) = '2025-11-28';

-- ============================================
-- 1. TOTAL ROUTES SCHEDULED TODAY (18 routes across 18 barangays)
-- ============================================
INSERT INTO daily_route (date, cluster_id, barangay_id, barangay_name, status, source, version, created_at, updated_at)
VALUES
-- 5 In-progress routes (for "Ongoing Collections")
('2025-11-28', 'KPI-C01', 1, 'Sagrada Familia', 'in_progress', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'KPI-C02', 2, 'Aldezar', 'in_progress', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'KPI-C03', 3, 'Bulan', 'in_progress', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'KPI-C04', 4, 'Biglaan', 'in_progress', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'KPI-C05', 5, 'Salvacion', 'in_progress', 'manual', 1, NOW(), NOW()),

-- 10 Scheduled routes (for "Pending Tasks")
('2025-11-28', 'KPI-C06', 6, 'Alteza', 'scheduled', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'KPI-C07', 7, 'Anib', 'scheduled', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'KPI-C08', 8, 'Awayan', 'scheduled', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'KPI-C09', 9, 'Azucena', 'scheduled', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'KPI-C10', 10, 'Bagong Sirang', 'scheduled', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'KPI-C11', 11, 'Binahian', 'scheduled', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'KPI-C12', 12, 'Bolo Norte', 'scheduled', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'KPI-C13', 13, 'Bolo Sur', 'scheduled', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'KPI-C14', 14, 'Bulawan', 'scheduled', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'KPI-C15', 15, 'Cabuyao', 'scheduled', 'manual', 1, NOW(), NOW()),

-- 2 Missed routes (for "Delayed Tasks")
('2025-11-28', 'KPI-C16', 16, 'Caima', 'missed', 'manual', 1, NOW(), NOW()),
('2025-11-28', 'KPI-C17', 17, 'Calagbangan', 'missed', 'manual', 1, NOW(), NOW()),

-- 1 Completed route
('2025-11-28', 'KPI-C18', 18, 'Calampinay', 'completed', 'manual', 1, NOW(), NOW());

-- ============================================
-- 2. ACTIVE COLLECTORS & DRIVERS (13 staff)
-- ============================================
-- Insert attendance for DRIVERS (role_id = 3): user_ids 16, 17, 62
INSERT INTO attendance_request (user_id, submitted_at, request_status, remarks)
VALUES
(16, '2025-11-28 06:45:00', 'approved', 'Driver time-in'),
(17, '2025-11-28 06:46:00', 'approved', 'Driver time-in'),
(62, '2025-11-28 06:47:00', 'approved', 'Driver time-in');

-- Insert attendance for COLLECTORS (role_id = 4): user_ids 28, 29, 30, 31, 32, 33, 34, 35, 36, 86
INSERT INTO attendance_request (user_id, submitted_at, request_status, remarks)
VALUES
(28, '2025-11-28 06:48:00', 'approved', 'Collector time-in'),
(29, '2025-11-28 06:49:00', 'approved', 'Collector time-in'),
(30, '2025-11-28 06:50:00', 'approved', 'Collector time-in'),
(31, '2025-11-28 06:51:00', 'approved', 'Collector time-in'),
(32, '2025-11-28 06:52:00', 'approved', 'Collector time-in'),
(33, '2025-11-28 06:53:00', 'approved', 'Collector time-in'),
(34, '2025-11-28 06:54:00', 'approved', 'Collector time-in'),
(35, '2025-11-28 06:55:00', 'approved', 'Collector time-in'),
(36, '2025-11-28 06:56:00', 'approved', 'Collector time-in'),
(86, '2025-11-28 06:57:00', 'approved', 'Collector time-in');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
SELECT '=== VERIFICATION RESULTS ===' as '';

SELECT 
    'Total Routes Today' as metric,
    COUNT(*) as value,
    '18 expected' as expected
FROM daily_route 
WHERE date = '2025-11-28';

SELECT 
    'Ongoing Collections' as metric,
    COUNT(*) as value,
    '5 expected' as expected
FROM daily_route 
WHERE date = '2025-11-28' AND status = 'in_progress';

SELECT 
    'Active Drivers' as metric,
    COUNT(DISTINCT ar.user_id) as value,
    '3 expected' as expected
FROM attendance_request ar
INNER JOIN user u ON ar.user_id = u.user_id
WHERE DATE(ar.submitted_at) = '2025-11-28'
AND ar.request_status = 'approved'
AND u.role_id = 3;

SELECT 
    'Active Collectors' as metric,
    COUNT(DISTINCT ar.user_id) as value,
    '10 expected' as expected
FROM attendance_request ar
INNER JOIN user u ON ar.user_id = u.user_id
WHERE DATE(ar.submitted_at) = '2025-11-28'
AND ar.request_status = 'approved'
AND u.role_id = 4;

SELECT 
    'Pending Tasks (Scheduled)' as metric,
    COUNT(*) as value,
    '10 expected' as expected
FROM daily_route 
WHERE date = '2025-11-28' AND status = 'scheduled';

SELECT 
    'Delayed Tasks (Missed)' as metric,
    COUNT(*) as value,
    '2 expected' as expected
FROM daily_route 
WHERE date = '2025-11-28' AND status = 'missed';

SELECT '=== ALL DATA INSERTED SUCCESSFULLY! ===' as '';
