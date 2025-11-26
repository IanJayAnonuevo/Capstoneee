# 🧪 Paano i-Test ang Time-In Window (5:00 AM - 6:00 AM)

## Problem
Naka-deploy na ang system, hindi na pwedeng i-adjust ang local time para i-test ang time-in window.

---

## ✅ Solution 1: Browser Console Override (Easiest - No Code Changes)

### Step 1: Open Browser Console
1. Go to: `https://kolektrash.systemproj.com`
2. Login as Truck Driver o Garbage Collector
3. Press `F12` to open Developer Tools
4. Go to **Console** tab

### Step 2: Override Date Object
Paste this code sa console:

```javascript
// Override Date to simulate 5:30 AM
const originalDate = Date;
Date = class extends originalDate {
  constructor(...args) {
    if (args.length === 0) {
      // Create date with current date but 5:30 AM time
      const now = new originalDate();
      super(now.getFullYear(), now.getMonth(), now.getDate(), 5, 30, 0);
    } else {
      super(...args);
    }
  }
  static now() {
    const now = new originalDate();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 5, 30, 0).getTime();
  }
};

// Force page refresh
window.location.reload();
```

### Step 3: Test Different Times
Para sa ibang oras, palitan ang `5, 30` (hour, minute):

- **5:00 AM** (Start): `5, 0`
- **5:30 AM** (Middle): `5, 30`
- **5:55 AM** (Near end): `5, 55`
- **6:00 AM** (Closed): `6, 0`
- **7:00 AM** (After window): `7, 0`

### Step 4: Reset
Para ibalik sa normal:
```javascript
Date = originalDate;
window.location.reload();
```

---

## ✅ Solution 2: Add Debug Mode (Recommended - Permanent Solution)

Ito ay magdadag ng debug mode na pwedeng i-enable via URL parameter o localStorage.

### Step 1: Add Debug Mode sa Components

I-update ang `TruckDriverHome.jsx` at `GarbageCollectorHome.jsx`:

```javascript
// Check for debug mode
const getDebugTime = () => {
  // Check URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const debugHour = urlParams.get('debug_hour');
  const debugMinute = urlParams.get('debug_minute');
  
  // Check localStorage
  const storedDebug = localStorage.getItem('debug_time');
  
  if (debugHour !== null && debugMinute !== null) {
    return { hour: parseInt(debugHour), minute: parseInt(debugMinute) };
  }
  
  if (storedDebug) {
    const parsed = JSON.parse(storedDebug);
    return { hour: parsed.hour, minute: parsed.minute };
  }
  
  return null;
};

// Use debug time if available
const debugTime = getDebugTime();
const [now, setNow] = React.useState(() => {
  if (debugTime) {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), debugTime.hour, debugTime.minute, 0);
  }
  return new Date();
});

const WINDOW_START_HOUR = 5;
const WINDOW_END_HOUR = 6;
```

### Step 2: How to Use

**Via URL Parameter:**
```
https://kolektrash.systemproj.com/truckdriver/home?debug_hour=5&debug_minute=30
```

**Via Browser Console:**
```javascript
localStorage.setItem('debug_time', JSON.stringify({ hour: 5, minute: 30 }));
window.location.reload();
```

**Disable:**
```javascript
localStorage.removeItem('debug_time');
window.location.reload();
```

---

## ✅ Solution 3: Temporary Admin Override (For Testing)

Gumawa ng simple admin page para i-override ang time window.

### Create: `backend/api/get_server_time.php`
```php
<?php
require_once '../config/database.php';
require_once '../includes/auth.php';

header('Content-Type: application/json');

// Check if admin
$user = authenticate();
if (!$user || $user['role_id'] != 1) {
    http_response_code(403);
    echo json_encode(['error' => 'Admin only']);
    exit;
}

// Check for debug override
$debugHour = isset($_GET['debug_hour']) ? (int)$_GET['debug_hour'] : null;
$debugMinute = isset($_GET['debug_minute']) ? (int)$_GET['debug_minute'] : null;

if ($debugHour !== null && $debugMinute !== null) {
    // Return debug time
    $now = new DateTime();
    $debugTime = new DateTime();
    $debugTime->setTime($debugHour, $debugMinute, 0);
    
    echo json_encode([
        'debug' => true,
        'hour' => $debugHour,
        'minute' => $debugMinute,
        'timestamp' => $debugTime->getTimestamp()
    ]);
} else {
    // Return actual server time
    echo json_encode([
        'debug' => false,
        'hour' => (int)date('H'),
        'minute' => (int)date('i'),
        'timestamp' => time()
    ]);
}
?>
```

---

## ✅ Solution 4: Browser Extension (Advanced)

Gumamit ng browser extension na pwedeng i-override ang Date object globally.

**Recommended Extension:**
- **Time Shift** (Chrome/Edge)
- **Clock Manipulation** (Firefox)

---

## 🎯 Quick Test Guide

### Test Scenarios:

1. **Before Window (4:59 AM)**
   - Status: "pre"
   - Button: Disabled
   - Message: None

2. **Window Open (5:00 AM - 5:54 AM)**
   - Status: "open"
   - Button: Enabled
   - Message: "Time-in window is open from 5:00 AM to 6:00 AM"

3. **Near End (5:55 AM - 5:59 AM)**
   - Status: "near_end"
   - Button: Enabled
   - Message: "You haven't timed in yet! Please log in immediately"

4. **Window Closed (6:00 AM+)**
   - Status: "closed"
   - Button: Disabled
   - Message: "Time-In Closed: The time-in period is now over"

---

## 📝 Recommended Approach

**For Quick Testing:** Use Solution 1 (Browser Console Override)
- Fastest
- No code changes needed
- Works immediately

**For Regular Testing:** Use Solution 2 (Debug Mode)
- Permanent solution
- Easy to enable/disable
- No need to modify code every time

---

## ⚠️ Important Notes

1. **Server-Side Validation:** Ang backend ay may validation din, kaya kahit i-override mo ang frontend time, dapat tama pa rin ang server time para sa actual submission.

2. **Production Safety:** Huwag i-enable ang debug mode sa production para sa regular users. Dapat admin-only o via special URL parameter.

3. **Time Zone:** Make sure na ang time zone ay tama. Ang system ay gumagamit ng local timezone ng user.

---

**Last Updated:** 2025-01-XX












