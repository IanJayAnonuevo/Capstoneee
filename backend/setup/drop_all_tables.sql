-- Script to drop all tables in kolektrash_db
-- Run this in phpMyAdmin SQL tab before importing kolektrash_db.sql

SET FOREIGN_KEY_CHECKS = 0;

-- Drop all tables in the correct order (respecting foreign key dependencies)
DROP TABLE IF EXISTS `admin`;
DROP TABLE IF EXISTS `attendance`;
DROP TABLE IF EXISTS `attendance_request`;
DROP TABLE IF EXISTS `barangay`;
DROP TABLE IF EXISTS `barangay_head`;
DROP TABLE IF EXISTS `cluster`;
DROP TABLE IF EXISTS `collection`;
DROP TABLE IF EXISTS `collection_point`;
DROP TABLE IF EXISTS `collection_schedule`;
DROP TABLE IF EXISTS `collection_team`;
DROP TABLE IF EXISTS `collection_team_member`;
DROP TABLE IF EXISTS `collection_type`;
DROP TABLE IF EXISTS `daily_route`;
DROP TABLE IF EXISTS `daily_route_stop`;
DROP TABLE IF EXISTS `email_verification`;
DROP TABLE IF EXISTS `email_verifications`;
DROP TABLE IF EXISTS `feedback`;
DROP TABLE IF EXISTS `gps_route_log`;
DROP TABLE IF EXISTS `iec_material`;
DROP TABLE IF EXISTS `iec_view`;
DROP TABLE IF EXISTS `issue_reports`;
DROP TABLE IF EXISTS `notification`;
DROP TABLE IF EXISTS `password_resets`;
DROP TABLE IF EXISTS `permission`;
DROP TABLE IF EXISTS `pickup_requests`;
DROP TABLE IF EXISTS `predefined_schedules`;
DROP TABLE IF EXISTS `role`;
DROP TABLE IF EXISTS `role_permission`;
DROP TABLE IF EXISTS `route_generation_run`;
DROP TABLE IF EXISTS `task_events`;
DROP TABLE IF EXISTS `truck`;
DROP TABLE IF EXISTS `truck_malfunction`;
DROP TABLE IF EXISTS `user`;
DROP TABLE IF EXISTS `user_profile`;
DROP TABLE IF EXISTS `waste_log`;

-- Drop any additional tables that might exist (legacy or renamed tables)
DROP TABLE IF EXISTS `garbage_collector`;
DROP TABLE IF EXISTS `truck_driver`;
DROP TABLE IF EXISTS `route`;
DROP TABLE IF EXISTS `route_assignment`;
DROP TABLE IF EXISTS `schedule`;
DROP TABLE IF EXISTS `task_assignment`;
DROP TABLE IF EXISTS `task_event`;
DROP TABLE IF EXISTS `pickup_request`;

SET FOREIGN_KEY_CHECKS = 1;

