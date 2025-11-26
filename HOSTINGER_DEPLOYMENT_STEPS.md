# Hostinger Deployment - Step by Step Guide

## 📋 Pre-Deployment Checklist

- [x] Database configuration updated
- [x] All hardcoded localhost URLs replaced with buildApiUrl()
- [x] CORS settings updated for production
- [x] Frontend ready to build

---

## 🚀 Step 1: Build Frontend (Local)

### 1.1 Open Terminal/Command Prompt
```bash
cd C:\xampp\htdocs\kolektrash
```

### 1.2 Install Dependencies (if not done)
```bash
npm install
```

### 1.3 Build Production Version
```bash
npm run build
```

### 1.4 Verify Build Output
Check na may `dist` folder na may:
- `index.html`
- `assets/` folder (may JS at CSS files)
- Other static files

---

## 📤 Step 2: Prepare Files for Upload

### 2.1 Files to Upload:

#### A. Frontend Files (from `dist` folder)
- Upload LAHAT ng contents ng `dist` folder
- Destination: `public_html/`

#### B. Backend Files
- Upload buong `backend` folder
- Destination: `public_html/backend/`

#### C. Uploads Folder
- Upload buong `uploads` folder
- Destination: `public_html/uploads/`

#### D. Materials Folder (if may PDF files)
- Create `materials/pdf/` folder sa `public_html/`
- Upload PDF files dito

---

## 🌐 Step 3: Access Hostinger cPanel

### 3.1 Login to Hostinger
1. Go to https://hpanel.hostinger.com
2. Login with your credentials
3. Click on your domain: `kolektrash.systemproj.com`

### 3.2 Open File Manager
1. Sa cPanel, hanapin ang **File Manager**
2. Click to open

---

## 📁 Step 4: Upload Files via File Manager

### 4.1 Navigate to public_html
1. Sa File Manager, pumunta sa `public_html` folder
2. Delete lahat ng default files (kung meron) EXCEPT `.htaccess` kung importante

### 4.2 Upload Frontend Files
1. Click **Upload** button
2. Select LAHAT ng files mula sa `dist` folder
3. Wait for upload to complete
4. Verify na may:
   - `index.html`
   - `assets/` folder
   - Other static files

### 4.3 Upload Backend Folder
1. Sa File Manager, click **Upload**
2. Select buong `backend` folder
3. After upload, move ito sa `public_html/backend/`
4. Verify structure: `public_html/backend/api/`, `public_html/backend/config/`, etc.

### 4.4 Upload/Create Uploads Folder
1. Create folder: `public_html/uploads/`
2. Create subfolders:
   - `public_html/uploads/attendance/`
   - `public_html/uploads/profile_images/`
   - `public_html/uploads/route_proofs/`
   - `public_html/uploads/issue_reports/`

### 4.5 Create Materials Folder (for PDFs)
1. Create folder: `public_html/materials/pdf/`
2. Upload PDF files dito kung mayroon

---

## 🔐 Step 5: Set File Permissions

### 5.1 Set Uploads Folder Permissions
1. Right-click sa `uploads` folder
2. Click **Change Permissions** o **File Permissions**
3. Set to **755** o **777** (777 para sa write access)
4. Apply recursively sa lahat ng subfolders

### 5.2 Set Backend Logs Permissions
1. Right-click sa `backend/logs` folder
2. Set permissions to **755** o **777**

---

## 🗄️ Step 6: Database Setup

### 6.1 Access phpMyAdmin
1. Sa cPanel, hanapin ang **MySQL Databases** o **phpMyAdmin**
2. Click to open phpMyAdmin

### 6.2 Import Database
1. Click sa database: `u366677621_kolektrash`
2. Click **Import** tab
3. Click **Choose File**
4. Select ang `kolektrash_db.sql` file mula sa local project
5. Scroll down, check:
   - ✅ **"Allow interruption of import"** (optional)
   - Make sure **"Partial import"** is unchecked
6. Click **Go** at hintayin matapos

### 6.3 Verify Database Import
1. Check na may tables:
   - `user`
   - `role`
   - `admin`
   - `attendance`
   - `routes`
   - etc.

---

## ✅ Step 7: Verify Configuration

### 7.1 Check Database Config
File: `public_html/backend/config/database.php`
- ✅ Host: `localhost`
- ✅ Database: `u366677621_kolektrash`
- ✅ Username: `u366677621_kolektrash`
- ✅ Password: `Kolektrash2025`

### 7.2 Check CORS Settings
File: `public_html/backend/includes/cors.php`
- ✅ May check para sa `kolektrash.systemproj.com`

---

## 🌍 Step 8: Test the Website

### 8.1 Access Website
1. Open browser
2. Go to: `https://kolektrash.systemproj.com`
3. Dapat makita ang landing page o login page

### 8.2 Test Login
1. Try mag-login with test credentials
2. Check kung naglo-load ang dashboard

### 8.3 Test API Endpoints
1. Open browser console (F12)
2. Check Network tab
3. Verify na ang API calls ay pumupunta sa: `https://kolektrash.systemproj.com/backend/api/`

---

## 🔧 Step 9: Troubleshooting

### Problem: 404 Error sa API calls
**Solution:**
- Check `.htaccess` file sa `public_html/backend/`
- Verify na tama ang file structure

### Problem: Database Connection Error
**Solution:**
1. Double-check database credentials sa `backend/config/database.php`
2. Verify database name, username, at password sa Hostinger cPanel
3. Check kung naka-import na ang database

### Problem: File Upload Not Working
**Solution:**
1. Check folder permissions (dapat 755 o 777)
2. Verify na may write access ang `uploads` folder
3. Check PHP upload limits sa cPanel

### Problem: CORS Error
**Solution:**
1. Check `backend/includes/cors.php`
2. Verify na may entry para sa `kolektrash.systemproj.com`
3. Clear browser cache

### Problem: Assets Not Loading
**Solution:**
1. Verify na naka-upload lahat ng files mula sa `dist` folder
2. Check browser console para sa 404 errors
3. Verify file paths sa `index.html`

---

## 📝 Step 10: Final Checklist

- [ ] Frontend files uploaded to `public_html/`
- [ ] Backend folder uploaded to `public_html/backend/`
- [ ] Uploads folder created with proper permissions
- [ ] Database imported successfully
- [ ] Database credentials verified
- [ ] Website accessible via domain
- [ ] Login functionality working
- [ ] API calls working
- [ ] File uploads working
- [ ] No console errors

---

## 🎉 Success!

Kung lahat ng steps ay successful, ang website ay dapat na accessible at functional sa:
**https://kolektrash.systemproj.com**

---

## 📞 Support

Kung may issues:
1. Check Hostinger error logs sa cPanel
2. Check browser console (F12) para sa errors
3. Verify file permissions
4. Double-check database credentials

---

## 🔄 Future Updates

Para mag-update ng website:
1. Build ulit: `npm run build`
2. Upload new files mula sa `dist` folder
3. Upload updated backend files kung may changes
4. Clear browser cache

---

**Last Updated:** 2025-01-XX
**Deployment Status:** Ready for Hostinger












