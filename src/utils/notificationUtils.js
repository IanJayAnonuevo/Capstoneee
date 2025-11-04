const FINALIZED_STATUSES = new Set([
  'read',
  'accepted',
  'declined',
  'completed',
  'acknowledged',
  'acknowledge',
  'resolved',
  'dismissed'
]);

export const calculateUnreadCount = (notifications = []) => {
  return notifications.reduce((accumulator, notification) => {
    if (!notification) {
      return accumulator;
    }

    const rawStatus = String(notification.response_status || notification.status || '').trim().toLowerCase();
    const isFinalized = FINALIZED_STATUSES.has(rawStatus);

    let isPendingAssignment = false;
    if (notification.message) {
      try {
        const parsed = typeof notification.message === 'string'
          ? JSON.parse(notification.message)
          : notification.message;

        if (parsed && typeof parsed === 'object') {
          const type = String(parsed.type || '').toLowerCase();
          if (type === 'assignment' || type === 'daily_assignments') {
            const resolvedStatus = rawStatus || String(parsed.status || '').toLowerCase();
            isPendingAssignment = !FINALIZED_STATUSES.has(resolvedStatus);
          }
        }
      } catch (_) {
        // ignore JSON parse errors
      }
    }

    const shouldCount = !isFinalized || isPendingAssignment;
    return accumulator + (shouldCount ? 1 : 0);
  }, 0);
};

export const dispatchNotificationCount = (userId, notifications = []) => {
  if (!userId) {
    return;
  }

  const count = calculateUnreadCount(notifications);
  const detail = { userId: String(userId), count };
  window.dispatchEvent(new CustomEvent('notificationsUpdated', { detail }));
};
