-- Test data: Create a route with stops from multiple barangays
-- This will demonstrate the multiple barangays feature

-- Insert a test route
INSERT INTO `daily_route` (
    `id`, `date`, `barangay_name`, `truck_id`, `team_id`, 
    `start_time`, `end_time`, `status`, `source`
) VALUES (
    9999, 
    '2025-11-28', 
    'Multi-Barangay Route', 
    1, 
    1167, 
    '08:00:00', 
    '12:00:00', 
    'scheduled', 
    'manual'
);

-- Insert stops from different barangays
-- Stop 1: North Centro (barangay_id: 15-NCTR, collection_point_id: 20)
INSERT INTO `daily_route_stop` (
    `id`, `daily_route_id`, `seq`, `collection_point_id`, 
    `name`, `lat`, `lng`, `status`
) VALUES (
    99991, 9999, 1, 20, 'North Centro CP', 
    13.7886000, 122.9855000, 'pending'
);

-- Stop 2: Aldezar (barangay_id: 01-ALDZR, collection_point_id: 1)
INSERT INTO `daily_route_stop` (
    `id`, `daily_route_id`, `seq`, `collection_point_id`, 
    `name`, `lat`, `lng`, `status`
) VALUES (
    99992, 9999, 2, 1, 'Aldezar Main CP', 
    13.8349000, 123.0281000, 'pending'
);

-- Stop 3: Bulan (barangay_id: 08-BLN, collection_point_id: 10)
INSERT INTO `daily_route_stop` (
    `id`, `daily_route_id`, `seq`, `collection_point_id`, 
    `name`, `lat`, `lng`, `status`
) VALUES (
    99993, 9999, 3, 10, 'Bulan Market CP', 
    13.7654000, 122.9876000, 'pending'
);

-- Stop 4: Sagrada Familia (barangay_id: 24-SGFM, collection_point_id: 33)
INSERT INTO `daily_route_stop` (
    `id`, `daily_route_id`, `seq`, `collection_point_id`, 
    `name`, `lat`, `lng`, `status`
) VALUES (
    99994, 9999, 4, 33, 'Sagrada Familia Plaza CP', 
    13.7789000, 122.9923000, 'pending'
);

-- Stop 5: Mantila (barangay_id: 14-MNTL, collection_point_id: 19)
INSERT INTO `daily_route_stop` (
    `id`, `daily_route_id`, `seq`, `collection_point_id`, 
    `name`, `lat`, `lng`, `status`
) VALUES (
    99995, 9999, 5, 19, 'Mantila School CP', 
    13.7723000, 122.9912000, 'pending'
);

-- This route should now display as:
-- "Aldezar, Bulan, Mantila, North Centro, Sagrada Familia" (alphabetically ordered)
