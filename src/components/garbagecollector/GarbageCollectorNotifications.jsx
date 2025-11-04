// filepath: c:\Users\Emiruuu\Desktop\KOLEKTRASH\src\components\garbagecollector\GarbageCollectorNotifications.jsx
import React, { useEffect, useState } from 'react';
import { Typography, Button, Stack, Box, Snackbar, Alert, Dialog, DialogActions } from '@mui/material';
import { NotificationsNone as NotificationsNoneIcon, MarkEmailRead as MarkEmailReadIcon, DirectionsCar as DirectionsCarIcon, Schedule as ScheduleIcon, Build as BuildIcon, Security as SecurityIcon, Assessment as AssessmentIcon, School as SchoolIcon } from '@mui/icons-material';
import NotificationItem from '../shared/NotificationItem';
import { dispatchNotificationCount } from '../../utils/notificationUtils';
// Standardized modal replaces custom per-role modals

function getNotificationIcon(type) {
  switch (type) {
  case 'assignment':
  case 'route':
  case 'daily_assignments': return <DirectionsCarIcon sx={{ color: '#059669' }} />;
  case 'schedule': return <ScheduleIcon sx={{ color: '#059669' }} />;
    case 'maintenance': return <BuildIcon sx={{ color: '#f59e0b' }} />;
    case 'safety': return <SecurityIcon sx={{ color: '#dc2626' }} />;
    case 'report': return <AssessmentIcon sx={{ color: '#16a34a' }} />;
    case 'training': return <SchoolIcon sx={{ color: '#7c3aed' }} />;
    default: return <NotificationsNoneIcon sx={{ color: '#6b7280' }} />;
  }
}

function getNotificationColor(priority) {
  switch ((priority || '').toLowerCase()) {
    case 'high': return '#dc2626'; // red-600
    case 'medium': return '#f59e0b'; // amber-500
    case 'low': return '#16a34a'; // green-600
    default: return '#6b7280'; // gray-500
  }
}

export default function GarbageCollectorNotifications({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const effectiveUserId = userId || localStorage.getItem('user_id');

  // Resolve user id robustly when localStorage.user_id is missing
  const resolveUserId = () => {
    const uid = localStorage.getItem('user_id');
    if (uid) return uid;
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      return u?.user_id || u?.id || effectiveUserId;
    } catch {
      return effectiveUserId;
    }
  };

  useEffect(() => {
    if (!effectiveUserId) return;
    setLoading(true);
  fetch(`https://kolektrash.systemproj.com/backend/api/get_notifications.php?recipient_id=${effectiveUserId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNotifications(data.notifications);
          setError(null);
          dispatchNotificationCount(effectiveUserId, data.notifications || []);
        } else {
          setNotifications([]);
          setError(data.message || 'Failed to fetch notifications.');
          dispatchNotificationCount(effectiveUserId, []);
        }
      })
      .catch(() => {
        setNotifications([]);
        setError('Failed to fetch notifications.');
        dispatchNotificationCount(effectiveUserId, []);
      })
      .finally(() => setLoading(false));
  }, [effectiveUserId]);

  const markAllAsRead = async () => {
    // Optimistic UI
    const prev = notifications;
    const updated = prev.map(n => ({ ...n, response_status: 'read' }));
    setNotifications(updated);
    dispatchNotificationCount(resolveUserId(), updated);
    // Backend: mark each notification as read
    try {
      for (const n of prev) {
        if (n.response_status !== 'read') {
          await fetch('https://kolektrash.systemproj.com/backend/api/mark_notification_read.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notification_id: n.notification_id })
          });
        }
      }
    } catch {}
  };

  const deleteNotification = async (id) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.notification_id !== id);
      dispatchNotificationCount(resolveUserId(), updated);
      return updated;
    });
    try {
  await fetch('https://kolektrash.systemproj.com/backend/api/delete_notification.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_id: id })
      });
    } catch {}
  };

  // Respond to assignment function
  const respondAssignment = async (assignment_id, response_status, role, notification_id) => {
    const uid = resolveUserId();
    try {
  const res = await fetch('https://kolektrash.systemproj.com/backend/api/respond_assignment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignment_id, user_id: uid, response_status, role })
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(prev => {
          const updated = prev.map(n =>
            n.notification_id === notification_id ? { ...n, response_status: 'read' } : n
          );
          dispatchNotificationCount(uid, updated);
          return updated;
        });
        setSnackbar({ open: true, message: `Assignment ${response_status} successfully!`, severity: 'success' });
        setOpenModal(false);

        setTimeout(() => {
          fetch(`https://kolektrash.systemproj.com/backend/api/get_notifications.php?recipient_id=${effectiveUserId}`)
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                setNotifications(data.notifications);
                dispatchNotificationCount(effectiveUserId, data.notifications || []);
              }
            })
            .catch(() => {});
        }, 1000);
      } else {
        setSnackbar({ open: true, message: data.message || 'Failed to respond to assignment', severity: 'error' });
      }
    } catch (err) {
      console.error('Error responding to assignment:', err);
      setSnackbar({ open: true, message: 'Network error while responding to assignment', severity: 'error' });
    }
  };

  // Bulk respond for daily assignments (accept/decline all for the date)
  const bulkRespond = async (date, response_status, role, notification_id) => {
    try {
  const res = await fetch('https://kolektrash.systemproj.com/backend/api/respond_assignment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, user_id: resolveUserId(), response_status, role })
      });
      const data = await res.json();
      if (data.success) {
        const uid = resolveUserId();
        setNotifications(prev => {
          const updated = prev.map(n => n.notification_id === notification_id ? { ...n, response_status: 'read' } : n);
          dispatchNotificationCount(uid, updated);
          return updated;
        });
        setSnackbar({ open: true, message: `All assignments for ${date} ${response_status}.`, severity: 'success' });
        setOpenModal(false);
        
        // Refresh notifications to get updated data
        setTimeout(() => {
          fetch(`https://kolektrash.systemproj.com/backend/api/get_notifications.php?recipient_id=${effectiveUserId}`)
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                setNotifications(data.notifications);
                dispatchNotificationCount(effectiveUserId, data.notifications || []);
              }
            })
            .catch(() => {});
        }, 1000);
      } else {
        setSnackbar({ open: true, message: data.message || 'Failed to respond', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Network error while responding', severity: 'error' });
    }
  };

  // Dummy logic for title/type/priority (customize as needed)
  const transformNotification = (notif, idx) => ({
    ...notif,
    title: notif.message?.split(' ')[0] || 'Notification',
    type: 'schedule', // or derive from notif.message or notif.type
    priority: ['high', 'medium', 'low'][idx % 3], // or use notif.priority if available
  });

  const collectorNotifications = notifications.map(transformNotification);

  const markNotificationAsRead = async (notificationId) => {
    try {
  const res = await fetch('https://kolektrash.systemproj.com/backend/api/mark_notification_read.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_id: notificationId })
      });
      const data = await res.json();
      if (data.success) {
        const uid = resolveUserId();
        setNotifications(prev => {
          const updated = prev.map(n =>
            n.notification_id === notificationId ? { ...n, response_status: 'read' } : n
          );
          dispatchNotificationCount(uid, updated);
          return updated;
        });
        setSnackbar({ open: true, message: 'Notification marked as read', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: data.message || 'Failed to mark as read', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Network error', severity: 'error' });
    }
  };

  if (loading) return <div>Loading notifications...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '100%', width: '100%', mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
          Notifications
        </Typography>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<MarkEmailReadIcon />}
          onClick={markAllAsRead}
          disabled={!collectorNotifications.some(n => n.response_status !== 'read')}
          sx={{
            borderRadius: 2,
            bgcolor: '#059669',
            '&:hover': { bgcolor: '#047857' },
            '&:disabled': { bgcolor: '#9ca3af' },
            minWidth: 160,
            boxShadow: 'none',
            fontSize: 14,
            px: 2,
            py: 1
          }}
        >
          Mark all as read
        </Button>
      </Box>
      <Stack spacing={2}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {notifications.map((notif, idx) => {
          let parsedMsg;
          try {
            parsedMsg = JSON.parse(notif.message);
          } catch {
            parsedMsg = { message: notif.message };
          }
          // Check for team_id in assignment notifications
          const isAssignment = parsedMsg.type === 'assignment' && (parsedMsg.team_id || parsedMsg.assignment_id);
          const isDaily = parsedMsg.type === 'daily_assignments' && Array.isArray(parsedMsg.assignments);
          const title = parsedMsg.type === 'daily_assignments'
            ? `Daily Assignments • ${parsedMsg.date || ''}`.trim()
            : (parsedMsg.title || 'Assignment Notification');
          const description = parsedMsg.type === 'daily_assignments'
            ? (() => {
                const list = (parsedMsg.assignments || []).map(a => {
                  const time = a.time ? a.time.slice(0,5) : '';
                  const brgy = a.barangay || a.barangay_name || 'Barangay';
                  const cluster = a.cluster ? ` (${a.cluster})` : '';
                  const truck = a.truck ? ` – Truck ${a.truck}` : '';
                  return `${time} • ${brgy}${cluster}${truck}`;
                });
                return list.length ? `${list.length} stops:\n` + list.join('\n') : 'No assignments in list.';
              })()
            : (parsedMsg.message || notif.message);
          const priority = ['high', 'medium', 'low'][idx % 3];
          return (
            <li key={notif.notification_id} style={{ marginBottom: 16 }}>
              <NotificationItem
                icon={getNotificationIcon(parsedMsg.type || 'schedule')}
                title={title}
                description={description}
                createdAt={notif.created_at}
                priorityLabel={['HIGH', 'MEDIUM', 'LOW'][idx % 3]}
                priorityColor={getNotificationColor(priority)}
                isRead={notif.response_status === 'read'}
                onClick={async () => {
                  if (notif.notification_id && notif.response_status !== 'read') {
                    await markNotificationAsRead(notif.notification_id);
                  }
                  setSelectedNotification({ notif, parsedMsg, isAssignment, isDaily, title, description });
                  setOpenModal(true);
                }}
                onDelete={() => deleteNotification(notif.notification_id)}
              />
            </li>
          );
        })}
        </ul>
        {notifications.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f0fdf4', borderRadius: 2, border: '2px dashed #bbf7d0' }}>
            <NotificationsNoneIcon sx={{ fontSize: 60, color: '#6b7280', mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ color: '#374151' }}>
              No notifications found
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              You're all caught up! 🎉
            </Typography>
          </Box>
        )}
      </Stack>
      {/* Standardized Notification Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, boxShadow: 6 } }}>
        <Box sx={{ width: '100%', bgcolor: '#059669', py: 2, px: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, fontSize: 20, textAlign: 'center', letterSpacing: 0.5 }}>
            {selectedNotification?.title || 'Notification'}
          </Typography>
        </Box>
        <Box sx={{ width: '100%', px: 3, py: 2, display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center' }}>
          {selectedNotification?.isDaily && Array.isArray(selectedNotification?.parsedMsg?.assignments) ? (
            <Box sx={{ maxHeight: 320, overflowY: 'auto', pr: 1 }}>
              {(() => {
                const asg = selectedNotification.parsedMsg.assignments;
                const trucks = asg.map(a => a.truck).filter(Boolean);
                const uniqueTruck = trucks.length && trucks.every(t => t === trucks[0]) ? trucks[0] : null;
                return (
                  <>
                    <Typography variant="body2" sx={{ color: '#374151', mb: 1, textAlign: 'left', fontSize: 14, fontWeight: 600 }}>
                      {`${asg.length} stops:`}
                    </Typography>
                    {uniqueTruck && (
                      <Box sx={{ mb: 1.5 }}>
                        <Box sx={{ display:'inline-block', px:1, py:0.5, borderRadius:1, bgcolor:'#e2e8f0', color:'#334155', fontSize:12, fontWeight:600 }}>
                          {`Truck ${uniqueTruck}`}
                        </Box>
                      </Box>
                    )}
                    <ul style={{ paddingLeft: 16, margin: 0 }}>
                      {asg.map((a, i) => (
                        <li key={i} style={{ marginBottom: 6, color: '#374151', fontSize: 14, lineHeight: 1.45 }}>
                          <span style={{ fontWeight: 700 }}>{a.time ? String(a.time).slice(0,5) : ''}</span>
                          {` • ${a.barangay || a.barangay_name || 'Barangay'}`}
                        </li>
                      ))}
                    </ul>
                  </>
                );
              })()}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: '#374151', mb: 2, textAlign: 'center', fontSize: 16, fontWeight: 500, whiteSpace: 'pre-line' }}>
              {selectedNotification?.description || selectedNotification?.parsedMsg?.message}
            </Typography>
          )}
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: '#e2e8f0', color: '#475569', fontSize: 12, fontWeight: 600 }}>
              {selectedNotification?.notif?.created_at}
            </Box>
          </Box>
        </Box>
        <DialogActions sx={{ width: '100%', bgcolor: 'white', justifyContent: 'center', p: 2, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
          {selectedNotification?.isDaily ? (
            <>
              <Button onClick={() => bulkRespond(selectedNotification?.parsedMsg?.date, 'declined', 'collector', selectedNotification?.notif?.notification_id)} sx={{ color: '#059669', bgcolor: 'white', border: '1px solid #059669', fontWeight: 700, fontSize: 14, px: 3, py: 1, borderRadius: 2, textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: '#f0fdf4' } }}>
                Decline
              </Button>
              <Button onClick={() => bulkRespond(selectedNotification?.parsedMsg?.date, 'accepted', 'collector', selectedNotification?.notif?.notification_id)} sx={{ color: 'white', bgcolor: '#059669', fontWeight: 700, fontSize: 14, px: 3, py: 1, borderRadius: 2, textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: '#047857' } }}>
                Accept
              </Button>
            </>
          ) : selectedNotification?.isAssignment ? (
            <>
              <Button onClick={() => {
                const teamId = selectedNotification?.parsedMsg?.team_id || selectedNotification?.parsedMsg?.assignment_id;
                if (teamId) respondAssignment(teamId, 'declined', 'collector', selectedNotification?.notif?.notification_id);
              }} sx={{ color: '#059669', bgcolor: 'white', border: '1px solid #059669', fontWeight: 700, fontSize: 14, px: 3, py: 1, borderRadius: 2, textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: '#f0fdf4' } }}>
                Decline
              </Button>
              <Button onClick={() => {
                const teamId = selectedNotification?.parsedMsg?.team_id || selectedNotification?.parsedMsg?.assignment_id;
                if (teamId) respondAssignment(teamId, 'accepted', 'collector', selectedNotification?.notif?.notification_id);
              }} sx={{ color: 'white', bgcolor: '#059669', fontWeight: 700, fontSize: 14, px: 3, py: 1, borderRadius: 2, textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: '#047857' } }}>
                Accept
              </Button>
            </>
          ) : (
            <Button onClick={() => setOpenModal(false)} sx={{ color: 'white', bgcolor: '#059669', fontWeight: 700, fontSize: 16, px: 5, py: 1.2, borderRadius: 2, textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: '#047857' } }}>
              Close
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
