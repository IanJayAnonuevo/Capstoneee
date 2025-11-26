# 🔧 Fix: Database Connection Error

## ❌ Problem
Error: "Cannot connect to database. Please check your database configuration and ensure MySQL is running."

**Root Cause:** Mali ang database name sa configuration. Dapat `u366677621_kolektrash_db` (may `_db`), pero naka-set ay `u366677621_kolektrash` (walang `_db`).

---

## ✅ Solution

### Step 1: Update Database Configuration (Local)
✅ **DONE** - Na-update na ang `backend/config/database.php`:
- Database: `u366677621_kolektrash_db` ✅
- Username: `u366677621_kolektrash` ✅
- Password: `Kolektrash2025` ✅

### Step 2: Upload Updated File to Hostinger

#### Option A: Via File Manager
1. **Open Hostinger File Manager**
   - Login sa Hostinger cPanel
   - Open File Manager
   - Navigate to `public_html/backend/config/`

2. **Edit database.php**
   - Right-click sa `database.php`
   - Click **Edit** o **Code Editor**
   - Replace ang database name line:
     ```php
     private $db_name = 'u366677621_kolektrash_db'; // Hostinger database name (with _db suffix)
     ```
   - Save

#### Option B: Upload New File
1. Sa local, copy ang updated `backend/config/database.php`
2. Upload ito sa `public_html/backend/config/`
3. Replace existing file

### Step 3: Verify Configuration
Check na tama ang values sa `public_html/backend/config/database.php`:
```php
private $host = 'localhost';
private $db_name = 'u366677621_kolektrash_db';  // ← Dapat may _db
private $username = 'u366677621_kolektrash';
private $password = 'Kolektrash2025';
```

### Step 4: Test Again
1. Clear browser cache
2. Go to: `https://kolektrash.systemproj.com/login`
3. Try mag-login
4. Dapat wala na ang database error

---

## 🔍 Additional Checks

### Verify Database Exists
1. Sa Hostinger cPanel, go to **MySQL Databases**
2. Verify na may database: `u366677621_kolektrash_db`
3. Verify na may user: `u366677621_kolektrash`
4. Check na naka-assign ang user sa database

### Check Database Import
1. Open phpMyAdmin
2. Select database: `u366677621_kolektrash_db`
3. Verify na may tables:
   - `user`
   - `role`
   - `admin`
   - `attendance`
   - etc.

### Test Database Connection
1. Sa phpMyAdmin, try mag-login with:
   - User: `u366677621_kolektrash`
   - Password: `Kolektrash2025`
2. Dapat makita ang database

---

## 🚨 If Still Not Working

### Check File Permissions
1. Verify na ang `database.php` ay readable (644 permissions)
2. Check na tama ang file path: `public_html/backend/config/database.php`

### Check PHP Error Logs
1. Sa Hostinger cPanel, go to **Error Logs**
2. Check kung may database-related errors
3. Common errors:
   - "Access denied" → Wrong username/password
   - "Unknown database" → Wrong database name
   - "Connection refused" → Wrong host

### Test with Simple PHP Script
Create test file: `public_html/test_db.php`
```php
<?php
$host = 'localhost';
$db = 'u366677621_kolektrash_db';
$user = 'u366677621_kolektrash';
$pass = 'Kolektrash2025';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    echo "Database connection successful!";
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
```
Access: `https://kolektrash.systemproj.com/test_db.php`
- If "successful" → Database config is correct
- If error → Check the error message

---

## ✅ Expected Result

After fixing, dapat:
- ✅ Login page loads without database error
- ✅ Can connect to database
- ✅ Login functionality works
- ✅ No 500 errors in console

---

**Last Updated:** 2025-01-XX












