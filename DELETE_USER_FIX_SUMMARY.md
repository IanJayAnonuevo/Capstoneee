## 🔍 DELETE USER FIX - WHAT CHANGED

### File: backend/api/delete_account.php

### ❌ OLD CODE (Lines 59-67)
```php
// 6. Delete waste logs
$stmt = $db->prepare("DELETE FROM waste_log WHERE collector_id = :user_id");
$stmt->bindParam(':user_id', $data->user_id);
$stmt->execute();

// 7. Delete attendance requests
$stmt = $db->prepare("DELETE FROM attendance_request WHERE user_id = :user_id OR foreman_id = :user_id");
$stmt->bindParam(':user_id', $data->user_id);
$stmt->execute();
```

### ✅ NEW CODE (Lines 59-72)
```php
// 6. Delete waste logs
$stmt = $db->prepare("DELETE FROM waste_log WHERE collector_id = :user_id");
$stmt->bindParam(':user_id', $data->user_id);
$stmt->execute();

// 7. Delete attendance records (user_id and recorded_by)  ← NEW!
$stmt = $db->prepare("DELETE FROM attendance WHERE user_id = :user_id OR recorded_by = :user_id");
$stmt->bindParam(':user_id', $data->user_id);
$stmt->execute();

// 8. Delete attendance requests  ← Renumbered from 7 to 8
$stmt = $db->prepare("DELETE FROM attendance_request WHERE user_id = :user_id OR foreman_id = :user_id");
$stmt->bindParam(':user_id', $data->user_id);
$stmt->execute();
```

### 📌 Summary of Changes:
1. **ADDED:** Step 7 - Delete from `attendance` table
2. **CHANGED:** Renumbered steps 7-17 to 8-18
3. **WHY:** The `attendance` table has foreign keys to `user_id` and `recorded_by`, which must be deleted before deleting the user

---

## 🚀 Quick Upload Guide

### Using Hostinger File Manager:
1. Login to Hostinger
2. Go to **File Manager**
3. Navigate to: `public_html/backend/api/`
4. Upload `delete_account.php` (overwrite existing)
5. **IMPORTANT:** Upload `run_migration.php` to the same folder
6. Visit `https://kolektrash.systemproj.com/backend/api/run_migration.php` in your browser
7. **Clear browser cache** (Ctrl + Shift + Delete)
8. Test delete user

### Using FTP (FileZilla):
1. Connect to your Hostinger FTP
2. Navigate to: `/domains/yourdomain.com/public_html/backend/api/`
3. Upload `delete_account.php` (overwrite)
4. **Clear browser cache**
5. **IMPORTANT:** Upload `run_migration.php` to `public_html/backend/api/`
6. Visit `https://kolektrash.systemproj.com/backend/api/run_migration.php` in your browser to update the database.
7. Test delete user

---

## 🚨 FINAL FIX: Database Column Missing

The error `Unknown column 'u.deleted_at'` means the **migration script hasn't run yet**.
This confirms your database connection is working (Good!), but the table is outdated.

### Option 1: Run the Script (Easiest)
1. **Upload** `run_migration.php` to `public_html/backend/api/`.
2. **Visit** `https://kolektrash.systemproj.com/backend/api/run_migration.php`
3. It should say "Executed" or "Done".

### Option 2: Manual Fix (If script fails)
1. Login to **Hostinger** -> **Databases** -> **phpMyAdmin**.
2. Select your database (`u366677621_kolektrash_db`).
3. Click **SQL** tab.
4. **Copy ONLY the code below** (Do not include any links or extra text):

```sql
ALTER TABLE `user` ADD COLUMN `deleted_at` DATETIME NULL DEFAULT NULL;
ALTER TABLE `user` ADD COLUMN `deleted_by` INT(11) NULL DEFAULT NULL;
```

5. Click **Go** or **Execute**.
6. Go back to Admin Panel and test.

---

## ❓ Still getting 500 Error?
...

---

## 🚀 Quick Upload Guide
...
