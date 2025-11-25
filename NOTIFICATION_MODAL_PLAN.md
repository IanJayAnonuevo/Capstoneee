# Foreman Notification System Implementation Plan

## Summary
The previous implementation got corrupted during file edits. We need to re-implement the notification system with a custom confirmation modal.

## Steps:
1. Add notification state variables (notifications, showNotifications, unreadCount, showClearConfirmModal)
2. Implement fetchNotifications function with attendance requests and pickup requests
3. Implement handleNotificationClick function
4. Add notification bell UI with dropdown
5. Add "Mark All Read" and "Clear All" buttons
6. Replace browser confirm() with custom modal
7. Add individual delete buttons
8. Add Clear All confirmation modal at the end before closing </div>

## Key Features:
- Real-time notification polling (every 30s)
- Attendance verification requests as notifications
- Special pickup requests as notifications  
- Mark all as read functionality
- Delete individual notifications
- Clear all with custom modal confirmation
- Instant UI updates

## Files to modify:
- ForemanDashboard.jsx
- authService.js (already has getNotifications, markNotificationAsRead, deleteNotification)
