# Hostinger Cron Job Setup for Auto-Generate

## Overview
Two cron jobs that automatically generate tasks and routes:
- **6:00 AM** - Morning shift (AM session)
- **2:00 PM** - Afternoon shift (PM session)

## Files
- `morning_generate.php` - 6:00 AM cron script
- `afternoon_generate.php` - 2:00 PM cron script
- `logs/cron_morning.log` - Morning execution logs
- `logs/cron_afternoon.log` - Afternoon execution logs

---

## Setup Instructions for Hostinger

### Step 1: Upload Files

Upload these files to your Hostinger account:
```
/home/u366677621/domains/YOUR_DOMAIN/public_html/
├── cron/
│   ├── morning_generate.php
│   └── afternoon_generate.php
└── logs/ (will be auto-created)
```

### Step 2: Update Configuration

Edit both `morning_generate.php` and `afternoon_generate.php`:

1. Replace `YOUR_DOMAIN` with your actual domain:
```php
$apiUrl = 'https://kolektrash.com/backend/api/auto_generate_all.php';
```

2. Verify the cron token matches your setup:
```php
$cronToken = 'kolektrash_cron_2024';
```

### Step 3: Set File Permissions

Via SSH or File Manager, set executable permissions:
```bash
chmod +x /home/u366677621/domains/YOUR_DOMAIN/public_html/cron/morning_generate.php
chmod +x /home/u366677621/domains/YOUR_DOMAIN/public_html/cron/afternoon_generate.php
```

### Step 4: Add Cron Jobs in cPanel

1. **Login to Hostinger cPanel**

2. **Go to "Advanced" → "Cron Jobs"**

3. **Add Morning Cron Job (6:00 AM)**:
   - **Minute**: `0`
   - **Hour**: `6`
   - **Day**: `*`
   - **Month**: `*`
   - **Weekday**: `*`
   - **Command**:
   ```bash
   /usr/bin/php /home/u366677621/domains/YOUR_DOMAIN/public_html/cron/morning_generate.php
   ```

4. **Add Afternoon Cron Job (2:00 PM)**:
   - **Minute**: `0`
   - **Hour**: `14`
   - **Day**: `*`
   - **Month**: `*`
   - **Weekday**: `*`
   - **Command**:
   ```bash
   /usr/bin/php /home/u366677621/domains/YOUR_DOMAIN/public_html/cron/afternoon_generate.php
   ```

5. **Click "Add New Cron Job"** for each

---

## Alternative: Using Cron Expression

If your Hostinger panel supports cron expressions:

**Morning (6:00 AM)**:
```
0 6 * * * /usr/bin/php /home/u366677621/domains/YOUR_DOMAIN/public_html/cron/morning_generate.php
```

**Afternoon (2:00 PM)**:
```
0 14 * * * /usr/bin/php /home/u366677621/domains/YOUR_DOMAIN/public_html/cron/afternoon_generate.php
```

---

## Testing

### Test via SSH

```bash
# Test morning script
/usr/bin/php /home/u366677621/domains/YOUR_DOMAIN/public_html/cron/morning_generate.php

# Test afternoon script
/usr/bin/php /home/u366677621/domains/YOUR_DOMAIN/public_html/cron/afternoon_generate.php
```

### Test via Browser (Temporary)

Create a test file `test_cron.php`:
```php
<?php
echo "Testing morning cron...\n";
include 'cron/morning_generate.php';
?>
```

Access: `https://YOUR_DOMAIN/test_cron.php`

**⚠️ Delete this file after testing!**

---

## Monitoring Logs

### Via SSH

```bash
# View morning logs
tail -f /home/u366677621/domains/YOUR_DOMAIN/public_html/logs/cron_morning.log

# View afternoon logs
tail -f /home/u366677621/domains/YOUR_DOMAIN/public_html/logs/cron_afternoon.log

# View last 20 lines
tail -20 /home/u366677621/domains/YOUR_DOMAIN/public_html/logs/cron_morning.log
```

### Via File Manager

Navigate to `logs/` folder and download the log files.

---

## Troubleshooting

### Cron not running
- Check cron job list in cPanel
- Verify file paths are correct
- Check file permissions (should be 755)
- Review cPanel cron job execution logs

### API errors
- Check if the domain URL is correct
- Verify SSL certificate is valid
- Check if `cron_token` matches
- Review API logs in `backend/api/`

### No tasks generated
- Verify predefined schedules exist for the date
- Check if the session (AM/PM) has schedules
- Review the log files for details

---

## Important Notes

1. **Timezone**: Scripts use `Asia/Manila` timezone
2. **Session Filter**: Morning generates AM only, Afternoon generates PM only
3. **Overwrite**: Set to `false` to prevent duplicate generation
4. **Logs**: Automatically created in `logs/` directory
5. **Security**: Uses `cron_token` for authentication

---

## Email Notifications (Optional)

To receive email notifications when cron runs:

In cPanel Cron Jobs, add your email at the top:
```
MAILTO=your-email@example.com
```

Then the cron commands will email you the output.
