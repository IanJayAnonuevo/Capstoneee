-- Migration: Add emergency management fields to route_emergency_log table
-- Description: Adds foreman management capabilities to emergency logs
-- Date: 2025-11-27

-- Add new columns for foreman emergency management
ALTER TABLE route_emergency_log 
ADD COLUMN IF NOT EXISTS resolution_notes TEXT NULL COMMENT 'Foreman notes on how emergency was resolved',
ADD COLUMN IF NOT EXISTS foreman_action VARCHAR(50) NULL COMMENT 'acknowledged, resolved, escalated',
ADD COLUMN IF NOT EXISTS foreman_notes TEXT NULL COMMENT 'Additional foreman notes or instructions',
ADD INDEX IF NOT EXISTS idx_resolved(resolved_at);

-- Note: resolved_at and resolved_by columns already exist in the table
-- as they are created in report_route_emergency.php
