# Attendance Monitoring - Visual Guide

## 🖼️ User Interface Walkthrough

### 1. Navigation to Attendance
**From Foreman Home Page:**
- Look for the "Monitor Attendance" card
- Icon: 👥 People icon with blue background
- Description: "Handle your tasks in just few taps."

```
┌──────────────────────────────────────────┐
│  FOREMAN HOME                            │
├──────────────────────────────────────────┤
│  Quick Actions                           │
│                                          │
│  ┌────────────┐  ┌────────────┐        │
│  │  👥         │  │  📅         │        │
│  │  Monitor    │  │  Manage     │        │
│  │  Attendance │  │  Schedule   │        │
│  └────────────┘  └────────────┘        │
└──────────────────────────────────────────┘
```

### 2. Attendance Recording Form

```
┌─────────────────────────────────────────────────┐
│  ← Back                                         │
│                                                 │
│  Attendance Monitoring                          │
│  Record and monitor drivers and collectors      │
│                                                 │
│  ┌──────── Record Attendance ────────┐        │
│  │                                     │        │
│  │  📅 Date: [2025-11-20        ]    │        │
│  │                                     │        │
│  │  Session:  [AM] [PM]               │        │
│  │            ▓▓▓  ░░░                 │        │
│  │                                     │        │
│  │  Personnel ID: [16_____________]🔍  │        │
│  │  ↓ Search Results                  │        │
│  │  ┌──────────────────────────────┐  │        │
│  │  │ ID: 16 - Paul Bermal        │  │        │
│  │  │ Driver • Paul123            │  │        │
│  │  └──────────────────────────────┘  │        │
│  │                                     │        │
│  │  Action:  [Time In] [Time Out]     │        │
│  │           ▓▓▓▓▓▓▓  ░░░░░░░░         │        │
│  │                                     │        │
│  │  [Record Time In] ←──── Click!     │        │
│  └─────────────────────────────────────┘        │
└─────────────────────────────────────────────────┘
```

### 3. Success Message

```
┌─────────────────────────────────────────┐
│  ✅ Paul Bermal - Time in recorded      │
│     successfully                        │
└─────────────────────────────────────────┘
```

### 4. Attendance Table

```
┌──────────────────────────────────────────────────────────────┐
│  Attendance Records                                          │
│  Wednesday, November 20, 2025                                │
├──────────────────────────────────────────────────────────────┤
│  Status Legend:                                              │
│  ⚫ Present  ⚫ Absent  ⚫ On-leave  ⚪ Pending               │
├──────────────────────────────────────────────────────────────┤
│  ID │ Name           │ Role      │ AM      │ PM             │
│     │                │           │ IN  OUT │ IN  OUT        │
├─────┼────────────────┼───────────┼─────────┼────────────────┤
│  16 │ Paul Bermal    │ Driver    │ 🟢  ⚪  │ ⚪  ⚪        │
│     │                │           │ 8:00    │                │
├─────┼────────────────┼───────────┼─────────┼────────────────┤
│  17 │ Ronald F.      │ Driver    │ 🟢  🟠  │ ⚪  ⚪        │
│     │                │           │ 8:15 5:00│               │
├─────┼────────────────┼───────────┼─────────┼────────────────┤
│  28 │ Alvin Monida   │ Collector │ 🟢  🟠  │ 🟢  ⚪        │
│     │                │           │ 8:30 5:10│ 1:00          │
└─────┴────────────────┴───────────┴─────────┴────────────────┘

Legend:
🟢 = Time in recorded (Green)
🟠 = Time out recorded (Orange)
⚪ = No record yet (Gray)
```

### 5. Summary Statistics

```
┌────────────────────────────────────────────────────┐
│  Summary                                           │
├────────────────────────────────────────────────────┤
│  Status       │  Driver  │  Collector             │
│               │  AM   PM │  AM   PM               │
├───────────────┼──────────┼────────────────────────┤
│  Present      │  2    1  │  4    3    🟢          │
│  Absent       │  0    1  │  1    2    🔴          │
│  On-leave     │  0    0  │  1    1    🟡          │
└────────────────────────────────────────────────────┘
```

### 6. Info Cards

```
┌────────────────────┬────────────────────┬────────────────────┐
│  📘 How to Use     │  📙 Status Guide   │  📗 Quick Stats    │
├────────────────────┼────────────────────┼────────────────────┤
│  • Enter ID or     │  • Present: Timed  │  Total: 12         │
│    search name     │    in successfully │  Drivers: 2        │
│  • Select session  │  • Pending: No     │  Collectors: 10    │
│  • Choose action   │    record yet      │                    │
│  • Click Record    │  • Times shown     │                    │
│                    │    below dots      │                    │
└────────────────────┴────────────────────┴────────────────────┘
```

## 🎬 Step-by-Step Recording Process

### Step 1: Select Date
```
Click on date picker → Choose date → [2025-11-20]
```

### Step 2: Choose Session
```
Morning work? → Click [AM]
Afternoon work? → Click [PM]
```

### Step 3: Find Personnel
```
Option A: Type ID directly
[16] → Auto-searches

Option B: Type name
[Pa] → Shows "Paul Bermal"
      ↓ Click to select
```

### Step 4: Select Action
```
Person arriving? → Click [Time In]
Person leaving? → Click [Time Out]
```

### Step 5: Record
```
Click [Record Time In/Out]
    ↓
✅ Success message appears
    ↓
Table updates automatically
    ↓
Summary recalculates
```

## 🎨 Color Coding System

### Status Dots
- **🟢 Green Circle** = Present (has time_in)
  - Solid green dot
  - Time displayed below (e.g., "8:00 AM")
  
- **🟠 Orange Circle** = Time Out recorded
  - Solid orange dot
  - Time displayed below (e.g., "5:00 PM")
  
- **⚪ Gray Circle** = Pending
  - Hollow or light gray
  - No time displayed
  - Waiting for record

### Form Buttons
- **Selected** = Solid color with white text
- **Unselected** = White background with border

### Message Types
- **Success** = Green background with checkmark
- **Error** = Red background with X icon

## 📋 Common Workflows

### Morning Time In
1. 8:00 AM - Personnel arrive
2. Foreman opens attendance page
3. Enter ID: 16
4. Session: AM
5. Action: Time In
6. Record → ✅ Done

### Afternoon Time In
1. 1:00 PM - Personnel return from lunch
2. Enter ID: 16
3. Session: PM
4. Action: Time In
5. Record → ✅ Done

### End of Day Time Out
1. 5:00 PM - Personnel leaving
2. Enter ID: 16
3. Session: PM
4. Action: Time Out
5. Record → ✅ Done

### Batch Recording
1. Record Person 1 → Success
2. Form clears automatically
3. Enter Person 2 → Record
4. Repeat for all personnel
5. View summary for totals

## 🔍 Search Feature Demo

### Type "Pa"
```
┌─────────────────────────────────┐
│ ID: 16 - Paul Bermal           │
│ Driver • Paul123                │
└─────────────────────────────────┘
```

### Type "Ron"
```
┌─────────────────────────────────┐
│ ID: 17 - Ronald Frondozo       │
│ Driver • Ronald123              │
└─────────────────────────────────┘
```

### Type "16"
```
┌─────────────────────────────────┐
│ ID: 16 - Paul Bermal           │
│ Driver • Paul123                │
└─────────────────────────────────┘
```

## 💡 Pro Tips

### Fast Input
1. Keep form visible while recording
2. Use Tab key to move between fields
3. Enter key to submit
4. Type ID quickly for known personnel

### Verification
- Green dot = Successfully recorded
- Check time stamp matches
- Verify name is correct
- Summary updates = System saved

### Error Prevention
- Can't time out before time in ✓
- Can't duplicate same session ✓
- Must be driver or collector ✓
- Date validation ✓

## 📱 Mobile View (Responsive)

```
┌──────────────────────┐
│  ← Attendance        │
├──────────────────────┤
│  📅 Date             │
│  [2025-11-20]        │
│                      │
│  Session             │
│  [AM] [PM]           │
│                      │
│  ID/Name             │
│  [__________]🔍      │
│                      │
│  Action              │
│  [Time In]           │
│  [Time Out]          │
│                      │
│  [Record]            │
│                      │
├──────────────────────┤
│  Attendance Table    │
│  (Scrollable)        │
└──────────────────────┘
```

## 🎯 Key Points

✅ **Real-time Updates** - Table refreshes after each record
✅ **Smart Search** - Find by ID or name instantly
✅ **Session Split** - Separate AM and PM tracking
✅ **Auto-timestamps** - System records exact time
✅ **Visual Status** - Color-coded for quick scanning
✅ **Summary Stats** - Instant totals calculation
✅ **Error Prevention** - Built-in validations
✅ **Mobile Friendly** - Works on tablets

---
**Interface Version**: 1.0  
**Last Updated**: November 20, 2025
