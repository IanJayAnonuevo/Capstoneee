# Database Setup Instructions

## Problem
The `kolektrash_db` database exists but is missing the `user` table (or other tables), causing login errors.

## Solution: Reset and Import Database

### Step 1: Drop All Existing Tables

1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Click on `kolektrash_db` in the left sidebar
3. Click on the **SQL** tab at the top
4. Copy and paste the contents of `backend/setup/drop_all_tables.sql` into the SQL query box
5. Click **Go** to execute

This will remove all existing tables from the database.

### Step 2: Import the Database Schema

1. Still in phpMyAdmin, with `kolektrash_db` selected
2. Click on the **Import** tab at the top
3. Click **Choose File** and select `kolektrash_db.sql` from your project root directory
4. **Important**: Scroll down and check these options:
   - ✅ **"Allow interruption of import"** (optional, but helpful)
   - Make sure **"Partial import"** is unchecked
5. Click **Go** at the bottom
6. Wait for the import to complete (this may take a minute)

### Step 3: Verify the Import

1. After import completes, you should see a success message
2. Check that the `user` table exists:
   - Click on `kolektrash_db` in the left sidebar
   - You should see a list of tables including `user`, `role`, `admin`, etc.
3. Test the login:
   - Go to your login page
   - Try logging in with username: `admin` and the password from the database

### Alternative: Quick Verification

Visit this URL to check if your database is set up correctly:
```
http://localhost/kolektrash/backend/setup/check_database.php
```

## Default Login Credentials

After importing, you can use:
- **Username**: `admin`
- **Password**: Check the `kolektrash_db.sql` file for the hashed password, or reset it using phpMyAdmin

## Troubleshooting

### If import fails:
- Make sure you selected the `kolektrash_db` database before importing
- Check that the SQL file is not corrupted
- Try increasing the upload size limit in phpMyAdmin settings

### If tables still don't exist:
- Check the phpMyAdmin error messages
- Make sure you're importing into the correct database (`kolektrash_db`)
- Try running the drop script again, then re-import

### If login still fails after import:
- Check the browser console for specific error messages
- Verify the `user` table has data (check in phpMyAdmin)
- Check `backend/logs/login_errors.log` for detailed error information



