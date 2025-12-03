# Quick Setup: Auto-Mark Absent Cron Jobs

## ✅ Recommended Setup (Production)

### Step 1: Update Existing Cron Job

Kung meron ka nang cron job sa cron-job.org, i-update mo lang:

**Current Setup (sa screenshot):**
```
URL: https://kolektrash.systemproj.com/backend/api/manual_trigger_absent.php
Time: 6:00 AM
```

**Update to:**
```
URL: https://kolektrash.systemproj.com/cron/auto_mark_absent_am_http.php
Time: 6:05 AM
Timezone: Asia/Manila (GMT+8)
```

### Step 2: Add PM Session Cron Job

Create a new cron job:
```
Title: KolekTrash - Auto Mark Absent PM
URL: https://kolektrash.systemproj.com/cron/auto_mark_absent_pm_http.php
Time: 2:05 PM (14:05)
Timezone: Asia/Manila (GMT+8)
```

---

## 📋 Complete Cron Jobs List

Dapat may **4 cron jobs** in total:

| Time | Job Name | URL |
|------|----------|-----|
| 6:00 AM | Morning Task Generation | `morning_generate_http.php` |
| **6:05 AM** | **Auto-Mark Absent (AM)** | **`auto_mark_absent_am_http.php`** |
| 2:00 PM | Afternoon Task Generation | `afternoon_generate_http.php` |
| **2:05 PM** | **Auto-Mark Absent (PM)** | **`auto_mark_absent_pm_http.php`** |

---

## 🔍 Differences: Manual vs Production

### `manual_trigger_absent.php` (Testing Only)
- ❌ No logging to file
- ❌ Requires `?session=AM` parameter
- ❌ No execution tracking
- ✅ Good for manual testing

### `auto_mark_absent_am_http.php` (Production)
- ✅ Logs to `logs/cron_auto_absent_am.log`
- ✅ Hardcoded for AM session
- ✅ Full error handling
- ✅ Execution tracking
- ✅ Proper HTTP response codes

---

## ✅ Will It Work?

**Short Answer: YES, gumana yan!**

Pero mas maganda kung gamitin mo yung production endpoints (`auto_mark_absent_am_http.php` at `auto_mark_absent_pm_http.php`) para may:
- 📝 **Logs** - Para makita mo kung nag-run successfully
- 🔍 **Monitoring** - Para ma-track mo ang execution history
- 🚨 **Error Handling** - Para ma-notify ka kung may problema

---

## 🧪 Testing

### Test AM Session (Manual)
```
https://kolektrash.systemproj.com/cron/auto_mark_absent_am_http.php
```

### Test PM Session (Manual)
```
https://kolektrash.systemproj.com/cron/auto_mark_absent_pm_http.php
```

### Check Logs
After running, check:
```
/logs/cron_auto_absent_am.log
/logs/cron_auto_absent_pm.log
```

---

## 📊 Expected Response

### Success:
```json
{
  "success": true,
  "message": "AM auto-absent marking completed successfully",
  "result": {
    "total_marked_absent": 2,
    "already_present": 5,
    "marked_absent": [
      {"user_id": 10, "name": "John Doe", "role": "Driver"}
    ]
  }
}
```

### Error:
```json
{
  "success": false,
  "message": "CURL Error: Connection timeout"
}
```

---

## 🎯 Action Items

1. **Update existing cron job** sa cron-job.org:
   - Change URL to `auto_mark_absent_am_http.php`
   - Change time to **6:05 AM**

2. **Create new cron job** for PM:
   - URL: `auto_mark_absent_pm_http.php`
   - Time: **2:05 PM**

3. **Test both endpoints** manually sa browser

4. **Check logs** after first run

---

## 💡 Pro Tips

1. **Enable failure notifications** sa cron-job.org
2. **Check execution history** regularly
3. **Monitor logs** for any issues
4. **Test manually** before relying on automated runs
