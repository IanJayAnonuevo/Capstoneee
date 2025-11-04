# Resolution Photo Feature - Implementation Guide

## Overview
Nag-implement ng feature para sa Admin na mag-upload ng resolution photo as proof na naayos na yung issue na na-report ng resident.

## Flow ng Feature:

### 1. **Resident Reports Issue**
   - Resident nag-submit ng issue report (may photo evidence ng problem)
   - Example: "Madaming tambak na basura sa kanto"

### 2. **Admin Resolves Issue**
   - Admin nag-access ng Issues page
   - Click "View" button sa issue
   - Update status to "Resolved"
   - **REQUIRED**: Upload resolution photo (proof na wala na yung basura)
   - Add resolution notes (optional)
   - Submit

### 3. **Resident Views Resolution**
   - Resident nag-check ng Issue Status
   - Makikita yung:
     - Status: Resolved (green badge)
     - Resolution notes ng admin
     - **Resolution photo** (proof na solved na)

## Files Created/Modified:

### Backend Files:

1. **`backend/api/resolve_issue_with_photo.php`** (NEW)
   - Endpoint for resolving issues with photo upload
   - Accepts multipart/form-data
   - Uploads photo to `uploads/issue_resolutions/`
   - Updates database with resolution info

2. **`backend/add_resolution_photo_column.sql`** (NEW)
   - SQL script to add `resolution_photo_url` column
   - Run this first sa Hostinger phpMyAdmin!

3. **`backend/api/get_user_issue_reports.php`** (MODIFIED)
   - Changed localhost URLs to production: `https://kolektrash.systemproj.com/`
   - Returns `resolution_photo_url` field

### Frontend Files:

4. **`src/components/admin/Issues.jsx`** (MODIFIED)
   - Updated `StatusUpdateModal` with photo upload field
   - Shows upload field only when status is "resolved"
   - Photo upload is **required** for resolved status
   - Preview uploaded photo before submit
   - Updated `updateReportStatus()` to handle photo upload via FormData

5. **`src/components/resident/ResidentIssueStatus.jsx`** (ALREADY DONE)
   - Already displays resolution photos
   - Shows in green success box when issue is resolved

## Database Migration:

**IMPORTANT**: Kailangan i-run to sa Hostinger phpMyAdmin:

```sql
ALTER TABLE `issue_reports` 
ADD COLUMN `resolution_photo_url` VARCHAR(500) NULL 
AFTER `resolution_notes`;
```

## API Endpoints:

### New: Resolve Issue with Photo
```
POST https://kolektrash.systemproj.com/backend/api/resolve_issue_with_photo.php

Content-Type: multipart/form-data

Fields:
- issue_id (required)
- status (default: 'resolved')
- resolved_by (admin user ID)
- resolution_notes (optional)
- resolution_photo (file, required)

Response:
{
  "status": "success",
  "message": "Issue resolved successfully with photo",
  "data": {
    "issue_id": 123,
    "status": "resolved",
   "resolution_photo_url": "https://kolektrash.systemproj.com/uploads/issue_resolutions/resolution_123_1234567890.jpg",
    "updated_at": "2025-10-07 10:30:00"
  }
}
```

## Folder Structure:

New folder will be created automatically:
```
uploads/
  issue_reports/          (existing - resident uploads)
  issue_resolutions/      (new - admin resolution photos)
```

## Features:

✅ Admin must upload photo when resolving issues
✅ Photo preview before submit
✅ Remove photo option
✅ Validates file type (JPG, JPEG, PNG, GIF)
✅ Unique filename generation (resolution_[issue_id]_[timestamp].[ext])
✅ Automatic directory creation if not exists
✅ Resident can view resolution photo in Issue Status page
✅ Production URLs (https://kolektrash.systemproj.com/)

## Testing Steps:

1. **Run Database Migration**
   - Access Hostinger phpMyAdmin
   - Select your database
   - Run the SQL script from `backend/add_resolution_photo_column.sql`

2. **Upload Files to Hostinger**
   - Upload `backend/api/resolve_issue_with_photo.php`
   - Upload modified `backend/api/get_user_issue_reports.php`
   - Upload modified `src/components/admin/Issues.jsx` (build first: `npm run build`)

3. **Test as Admin**
   - Login as admin
   - Go to Issues page
   - Click "View" on any pending/active issue
   - Change status to "Resolved"
   - Upload a resolution photo (kunwari picture ng cleaned area)
   - Add resolution notes
   - Click "Update Status"

4. **Test as Resident**
   - Login as the resident who reported the issue
   - Go to "View Issue Status"
   - Find the resolved issue
   - Verify na makikita yung:
     - Green "Resolved" badge
     - Resolution notes
     - Resolution photo (clickable para mag-zoom)

## Error Handling:

- If no photo uploaded for resolved status: Button is disabled
- If invalid file type: "Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed."
- If upload fails: "Failed to upload resolution photo"
- If column doesn't exist: "Column not found: resolution_photo_url" (run migration first!)

## Notes:

- Resolution photo is **REQUIRED** when setting status to "Resolved"
- For other statuses (pending, active, closed), photo is optional
- Photo is stored in `uploads/issue_resolutions/` directory
- Filename format: `resolution_[issue_id]_[timestamp].[ext]`
- Maximum file size: Server dependent (dapat i-configure sa php.ini)
- Supported formats: JPG, JPEG, PNG, GIF

## Deployment Checklist:

- [ ] Run database migration sa Hostinger
- [ ] Upload `resolve_issue_with_photo.php` to backend/api/
- [ ] Upload modified `get_user_issue_reports.php`
- [ ] Build frontend: `npm run build`
- [ ] Upload build files to Hostinger
- [ ] Test admin resolution with photo
- [ ] Test resident viewing resolution photo
- [ ] Verify folder permissions for uploads/issue_resolutions/

