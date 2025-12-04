# 🚀 Hostinger Deployment - Fix Backend API Access

## Problem
When accessing backend API URLs on Hostinger (e.g., `https://your-domain.com/backend/api/delete_attendance_by_date.php`), the request is redirected to the landing page instead of executing the PHP file.

## Solution
Upload the updated `.htaccess` files to properly configure URL routing.

---

## 📋 Files to Upload to Hostinger

### 1. Root `.htaccess` File

**Location on Hostinger:** `/public_html/.htaccess`  
**Local file:** `.htaccess-production`

**Instructions:**
1. Login to Hostinger File Manager
2. Navigate to `/public_html/`
3. Find the existing `.htaccess` file
4. **Backup the current file** (download or rename to `.htaccess.backup`)
5. Upload the new `.htaccess-production` file
6. Rename it to `.htaccess`

**What it does:**
- Excludes `/backend/`, `/cron/`, `/uploads/`, and `/storage/` from React Router redirects
- Allows direct access to PHP files in these directories
- Enables CORS for API requests

---

### 2. Backend `.htaccess` File

**Location on Hostinger:** `/public_html/backend/.htaccess`  
**Local file:** `backend/.htaccess`

**Instructions:**
1. Login to Hostinger File Manager
2. Navigate to `/public_html/backend/`
3. Upload the new `backend/.htaccess` file

**What it does:**
- Explicitly allows PHP file execution
- Enables CORS headers for API responses
- Disables directory browsing for security

---

## ✅ Verification Steps

After uploading the files:

### Test 1: Access Backend API Directly
```
https://your-domain.com/backend/api/delete_attendance_by_date.php?password=reset123
```

**Expected:** JSON response showing deleted attendance records  
**Not Expected:** Redirect to landing page

---

### Test 2: Access Cron Job
```
https://your-domain.com/cron/auto_generate_all.php?date=2025-12-05
```

**Expected:** JSON response with task generation results  
**Not Expected:** Redirect to landing page

---

### Test 3: Frontend Still Works
```
https://your-domain.com
```

**Expected:** React app loads normally  
**Expected:** React Router navigation works (e.g., `/login`, `/dashboard`)

---

## 🔧 Alternative: Manual .htaccess Configuration

If you prefer to edit the `.htaccess` file directly in Hostinger:

### Root `.htaccess` (in `/public_html/`)

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Exclude backend API and cron directories from React Router
  RewriteCond %{REQUEST_URI} ^/backend/ [OR]
  RewriteCond %{REQUEST_URI} ^/cron/ [OR]
  RewriteCond %{REQUEST_URI} ^/uploads/ [OR]
  RewriteCond %{REQUEST_URI} ^/storage/
  RewriteRule ^ - [L]
  
  # Don't rewrite files or directories
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  
  # Rewrite everything else to index.html to allow React Router to work
  RewriteRule ^ index.html [L]
</IfModule>

# Enable CORS
<IfModule mod_headers.c>
  Header set Access-Control-Allow-Origin "*"
  Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
  Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

### Backend `.htaccess` (in `/public_html/backend/`)

```apache
# Backend API .htaccess
# This allows direct access to PHP files in the backend directory

<IfModule mod_rewrite.c>
  RewriteEngine On
  
  # Allow direct access to PHP files
  RewriteCond %{REQUEST_FILENAME} -f
  RewriteRule ^.*\.php$ - [L]
  
  # Allow access to directories
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
</IfModule>

# Enable CORS for API endpoints
<IfModule mod_headers.c>
  Header set Access-Control-Allow-Origin "*"
  Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
  Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>

# Disable directory browsing
Options -Indexes

# Allow PHP execution
<FilesMatch "\.php$">
  SetHandler application/x-httpd-php
</FilesMatch>
```

---

## 🐛 Troubleshooting

### Issue: Still redirecting to landing page

**Solution 1:** Clear browser cache
- Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

**Solution 2:** Check file permissions on Hostinger
- `.htaccess` files should have `644` permissions
- PHP files should have `644` permissions
- Directories should have `755` permissions

**Solution 3:** Verify `.htaccess` is enabled
- Contact Hostinger support to ensure `mod_rewrite` is enabled
- Ensure `AllowOverride All` is set in server configuration

---

### Issue: 500 Internal Server Error

**Solution:** Check `.htaccess` syntax
- Ensure no extra spaces or characters
- Verify all `<IfModule>` tags are properly closed
- Check Hostinger error logs for specific error messages

---

### Issue: CORS errors in browser console

**Solution:** Verify CORS headers
- Check that `mod_headers` is enabled on Hostinger
- Ensure the CORS section is in both `.htaccess` files

---

## 📝 Quick Deployment Checklist

- [ ] Backup current `.htaccess` file on Hostinger
- [ ] Upload new root `.htaccess` file to `/public_html/`
- [ ] Upload new backend `.htaccess` file to `/public_html/backend/`
- [ ] Test backend API URL (should return JSON)
- [ ] Test cron job URL (should return JSON)
- [ ] Test frontend (should load React app)
- [ ] Test React Router navigation (should work)
- [ ] Clear browser cache and test again

---

## 🎯 Expected Results

After deployment:

✅ **Backend API URLs work:**
```
https://your-domain.com/backend/api/delete_attendance_by_date.php?password=reset123
→ Returns JSON response
```

✅ **Cron job URLs work:**
```
https://your-domain.com/cron/auto_generate_all.php?date=2025-12-05
→ Returns JSON response
```

✅ **Frontend still works:**
```
https://your-domain.com
→ Loads React app

https://your-domain.com/login
→ Shows login page (React Router)
```

---

## 💡 Why This Works

1. **Root `.htaccess`:**
   - Checks if the request is for `/backend/`, `/cron/`, etc.
   - If yes, allows direct access (doesn't redirect to React)
   - If no, checks if file/directory exists
   - If not, redirects to `index.html` for React Router

2. **Backend `.htaccess`:**
   - Explicitly allows PHP execution
   - Adds CORS headers for API responses
   - Prevents directory browsing

This configuration ensures:
- API endpoints are accessible directly
- React Router still works for frontend routes
- Security is maintained (no directory browsing)

---

## 📞 Need Help?

If you encounter issues:
1. Check Hostinger error logs
2. Verify file permissions
3. Contact Hostinger support about `mod_rewrite` and `mod_headers`
4. Test locally first with XAMPP to ensure files work
