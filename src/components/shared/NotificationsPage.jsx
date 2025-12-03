import React, { useEffect, useState, useCallback } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Button,
    IconButton,
    Box,
    Avatar,
    Stack,
    Paper,
    Tooltip,
    Dialog,
    DialogActions,
    Checkbox,
} from '@mui/material';
import {
    Delete as DeleteIcon,
    NotificationsNone as NotificationsNoneIcon,
    MarkEmailRead as MarkEmailReadIcon,
    Assignment as AssignmentIcon,
    LocalShipping as LocalShippingIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    CheckBox as CheckBoxIcon,
} from '@mui/icons-material';

import { dispatchNotificationCount } from '../../utils/notificationUtils';
import { buildApiUrl } from '../../config/api';

export default function NotificationsPage({ userRole = 'user' }) {
    const [openModal, setOpenModal] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [longPressTimer, setLongPressTimer] = useState(null);

    const resolveUserId = useCallback(() => {
        const storedId = localStorage.getItem('user_id');
        if (storedId) return storedId;
        try {
            const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
            return storedUser?.user_id || storedUser?.id || null;
        } catch (_) {
            return null;
        }
    }, []);

    const syncCount = useCallback((updatedNotifications) => {
        const uid = userId || resolveUserId();
        if (!uid) return;
        dispatchNotificationCount(uid, updatedNotifications);
    }, [resolveUserId, userId]);

    const authHeaders = () => {
        try {
            const t = localStorage.getItem('access_token');
            return t ? { Authorization: `Bearer ${t}` } : {};
        } catch {
            return {};
        }
    };

    // Fetch notifications from backend
    useEffect(() => {
        const uid = resolveUserId();
        if (!uid) { setLoading(false); return; }
        setUserId(uid);
        setLoading(true);
        fetch(buildApiUrl(`get_notifications.php?recipient_id=${uid}`), { headers: { ...authHeaders() } })
            .then(res => res.json())
            .then(data => {
                if (data?.success) {
                    const list = data.notifications || [];
                    setNotifications(list);
                    syncCount(list);
                } else {
                    setNotifications([]);
                    setError(data?.message || 'Failed to load notifications');
                    syncCount([]);
                }
            })
            .catch(() => { setNotifications([]); setError('Failed to load notifications'); syncCount([]); })
            .finally(() => setLoading(false));
    }, [resolveUserId, syncCount]);

    // Transform notifications
    const transformedNotifications = notifications.map((notif) => {
        let parsed = null;
        try { parsed = JSON.parse(notif.message); } catch { parsed = null; }

        // Handle leave request notifications
        if (parsed && parsed.type === 'leave_request') {
            const leaveType = parsed.leave_type || 'leave';
            const userName = parsed.name || 'A user';
            const startDate = parsed.start_date ? new Date(parsed.start_date).toLocaleDateString() : '';
            const endDate = parsed.end_date ? new Date(parsed.end_date).toLocaleDateString() : '';
            return {
                id: notif.notification_id,
                title: 'Leave Request',
                message: `${userName} requested ${leaveType} leave from ${startDate} to ${endDate}`,
                time: new Date(notif.created_at).toLocaleString(),
                read: notif.response_status === 'read',
                type: 'task',
            };
        }

        // Handle attendance request notifications
        if (parsed && parsed.type === 'attendance_request') {
            const userName = parsed.name || 'A user';
            const requestType = parsed.request_type || 'attendance';
            return {
                id: notif.notification_id,
                title: 'Attendance Request',
                message: `${userName} submitted ${requestType} request`,
                time: new Date(notif.created_at).toLocaleString(),
                read: notif.response_status === 'read',
                type: 'task',
            };
        }

        // Handle leave request reviewed notifications
        if (parsed && parsed.type === 'leave_request_reviewed') {
            const decision = parsed.decision || 'reviewed';
            const foremanName = parsed.foreman_name || 'Foreman';
            const startDate = parsed.start_date ? new Date(parsed.start_date).toLocaleDateString() : '';
            const endDate = parsed.end_date ? new Date(parsed.end_date).toLocaleDateString() : '';
            const statusText = decision === 'approved' ? 'approved' : 'declined';
            const statusEmoji = decision === 'approved' ? '✅' : '❌';

            return {
                id: notif.notification_id,
                title: `Leave Request ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
                message: `${statusEmoji} ${foremanName} ${statusText} your leave request from ${startDate} to ${endDate}`,
                time: new Date(notif.created_at).toLocaleString(),
                read: notif.response_status === 'read',
                type: 'task',
            };
        }

        // Handle attendance reviewed notifications
        if (parsed && parsed.type === 'attendance_reviewed') {
            const decision = parsed.decision || 'reviewed';
            const foremanName = parsed.foreman_name || 'Foreman';
            const requestType = parsed.request_type || 'attendance';
            const statusText = decision === 'approved' ? 'Approved' : 'Declined';
            const statusEmoji = decision === 'approved' ? '✅' : '❌';

            return {
                id: notif.notification_id,
                title: `Attendance Request ${statusText}`,
                message: `${statusEmoji} Your ${requestType} request for today has been ${statusText}.`,
                time: new Date(notif.created_at).toLocaleString(),
                read: notif.response_status === 'read',
                type: 'task',
            };
        }

        // Handle daily assignments notifications
        if (parsed && parsed.type === 'daily_assignments') {
            const date = parsed.date ? new Date(parsed.date).toLocaleDateString() : 'today';
            const assignmentsCount = parsed.assignments ? parsed.assignments.length : 0;

            return {
                id: notif.notification_id,
                title: 'Daily Task Assignment',
                message: `You have ${assignmentsCount} task assignment${assignmentsCount !== 1 ? 's' : ''} for ${date}`,
                time: new Date(notif.created_at).toLocaleString(),
                read: notif.response_status === 'read',
                type: 'task',
            };
        }

        // Handle pickup request notifications
        if (parsed && parsed.type === 'pickup_request') {
            return {
                id: notif.notification_id,
                title: 'Pickup Request',
                message: `${parsed.resident_name || 'Resident'} requested pickup for ${parsed.waste_type || 'waste'} in ${parsed.barangay || 'barangay'}`,
                time: new Date(notif.created_at).toLocaleString(),
                read: notif.response_status === 'read',
                type: 'pickup',
            };
        }

        // Handle emergency alerts
        if (parsed && parsed.type === 'emergency_alert') {
            return {
                id: notif.notification_id,
                title: 'Emergency Alert',
                message: parsed.message || 'Emergency situation reported',
                time: new Date(notif.created_at).toLocaleString(),
                read: notif.response_status === 'read',
                type: 'emergency',
            };
        }

        // Handle task assignments
        if (parsed && parsed.type === 'task_assignment') {
            return {
                id: notif.notification_id,
                title: 'Task Assignment',
                message: parsed.message || 'New task assigned',
                time: new Date(notif.created_at).toLocaleString(),
                read: notif.response_status === 'read',
                type: 'task',
            };
        }

        // Fallback: show message
        return {
            id: notif.notification_id,
            title: 'Notification',
            message: (parsed && parsed.message) ? parsed.message : (notif.message || ''),
            time: new Date(notif.created_at).toLocaleString(),
            read: notif.response_status === 'read',
            type: 'default',
        };
    });

    const markAllAsRead = async () => {
        const unread = notifications.filter(n => n.response_status !== 'read');
        if (!unread.length) return;
        setNotifications(prev => {
            const updated = prev.map(n => ({ ...n, response_status: 'read' }));
            syncCount(updated);
            return updated;
        });
        for (const n of unread) {
            try {
                await fetch(buildApiUrl('mark_notification_read.php'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...authHeaders() },
                    body: JSON.stringify({ notification_id: n.notification_id })
                });
            } catch { }
        }
    };

    const deleteNotification = async (id) => {
        setNotifications(prev => {
            const updated = prev.filter(n => (n.notification_id || n.id) !== id);
            syncCount(updated);
            return updated;
        });
        try {
            await fetch(buildApiUrl('delete_notification.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ notification_id: id })
            });
        } catch { }
    };

    const deleteSelected = async () => {
        if (selectedIds.length === 0) return;

        setNotifications(prev => {
            const updated = prev.filter(n => !selectedIds.includes(n.notification_id));
            syncCount(updated);
            return updated;
        });

        for (const id of selectedIds) {
            try {
                await fetch(buildApiUrl('delete_notification.php'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...authHeaders() },
                    body: JSON.stringify({ notification_id: id })
                });
            } catch { }
        }

        setSelectedIds([]);
        setSelectionMode(false);
    };

    const toggleSelection = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        setSelectedIds(transformedNotifications.map(n => n.id));
    };

    const cancelSelection = () => {
        setSelectedIds([]);
        setSelectionMode(false);
    };

    const handleLongPressStart = (id) => {
        const timer = setTimeout(() => {
            setSelectionMode(true);
            setSelectedIds([id]);
        }, 500);
        setLongPressTimer(timer);
    };

    const handleLongPressEnd = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }
    };

    const getNotificationIcon = (type) => {
        const iconProps = { fontSize: 'small' };
        switch (type) {
            case 'pickup': return <LocalShippingIcon sx={{ color: '#059669' }} {...iconProps} />;
            case 'emergency': return <WarningIcon sx={{ color: '#dc2626' }} {...iconProps} />;
            case 'task': return <AssignmentIcon sx={{ color: '#7c3aed' }} {...iconProps} />;
            default: return <InfoIcon sx={{ color: '#6b7280' }} {...iconProps} />;
        }
    };

    return (
        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '100%', width: '100%', mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                    Notifications
                </Typography>
            </Box>

            {/* Actions */}
            <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {!selectionMode ? (
                    <Button
                        variant="contained"
                        startIcon={<MarkEmailReadIcon />}
                        onClick={markAllAsRead}
                        disabled={!transformedNotifications.some(n => !n.read)}
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
                ) : (
                    <>
                        <Button
                            variant="contained"
                            startIcon={<CheckBoxIcon />}
                            onClick={selectAll}
                            sx={{
                                borderRadius: 2,
                                bgcolor: '#059669',
                                '&:hover': { bgcolor: '#047857' },
                                boxShadow: 'none',
                                fontSize: 14,
                                px: 2,
                                py: 1
                            }}
                        >
                            Select All
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<DeleteIcon />}
                            onClick={deleteSelected}
                            disabled={selectedIds.length === 0}
                            sx={{
                                borderRadius: 2,
                                bgcolor: '#dc2626',
                                '&:hover': { bgcolor: '#b91c1c' },
                                '&:disabled': { bgcolor: '#9ca3af' },
                                boxShadow: 'none',
                                fontSize: 14,
                                px: 2,
                                py: 1
                            }}
                        >
                            Delete ({selectedIds.length})
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={cancelSelection}
                            sx={{
                                borderRadius: 2,
                                borderColor: '#9ca3af',
                                color: '#6b7280',
                                '&:hover': { borderColor: '#6b7280', bgcolor: '#f3f4f6' },
                                boxShadow: 'none',
                                fontSize: 14,
                                px: 2,
                                py: 1
                            }}
                        >
                            Cancel
                        </Button>
                    </>
                )}
            </Box>

            {/* Notifications List */}
            <Stack spacing={2}>
                {loading && (
                    <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: '#f0fdf4', borderRadius: 2, border: '2px dashed #bbf7d0' }}>
                        <Typography>Loading notifications…</Typography>
                    </Paper>
                )}
                {error && (
                    <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: '#fef2f2', borderRadius: 2, border: '2px dashed #fecaca' }}>
                        <Typography color="error">{error}</Typography>
                    </Paper>
                )}
                {!loading && !error && transformedNotifications.map(notification => (
                    <Card
                        key={notification.id}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            border: selectedIds.includes(notification.id) ? '2px solid #059669' : '1px solid #e0e0e0',
                            bgcolor: notification.read ? 'grey.50' : 'white',
                            transition: 'all 0.2s ease-in-out',
                            cursor: 'pointer',
                            '&:hover': {
                                boxShadow: 3,
                                transform: 'translateY(-2px)'
                            }
                        }}
                        onTouchStart={() => handleLongPressStart(notification.id)}
                        onTouchEnd={handleLongPressEnd}
                        onMouseDown={() => handleLongPressStart(notification.id)}
                        onMouseUp={handleLongPressEnd}
                        onMouseLeave={handleLongPressEnd}
                        onClick={() => {
                            if (selectionMode) {
                                toggleSelection(notification.id);
                            } else {
                                setSelectedNotification(notification);
                                setOpenModal(true);
                            }
                        }}
                    >
                        <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                            <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="flex-start">
                                {/* Selection Checkbox */}
                                {selectionMode && (
                                    <Checkbox
                                        checked={selectedIds.includes(notification.id)}
                                        onChange={() => toggleSelection(notification.id)}
                                        sx={{ p: 0, mt: 0.5 }}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                )}

                                {/* Icon */}
                                <Avatar
                                    sx={{
                                        width: { xs: 36, sm: 40 },
                                        height: { xs: 36, sm: 40 },
                                        bgcolor: 'white',
                                        border: '2px solid #e0e0e0',
                                        color: '#6b7280'
                                    }}
                                >
                                    {getNotificationIcon(notification.type)}
                                </Avatar>

                                {/* Content */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight={notification.read ? 'normal' : 'bold'}
                                                sx={{ mb: 0.5 }}
                                            >
                                                {notification.title}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ mb: 1, lineHeight: 1.4 }}
                                            >
                                                {notification.message}
                                            </Typography>
                                            <Typography variant="caption" color="text.disabled">
                                                {notification.time}
                                            </Typography>
                                        </Box>

                                        {/* Delete Button */}
                                        {!selectionMode && (
                                            <Tooltip title="Delete notification">
                                                <IconButton
                                                    size="small"
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        deleteNotification(notification.id);
                                                    }}
                                                    sx={{
                                                        color: '#dc2626',
                                                        '&:hover': { bgcolor: '#fef2f2', color: '#dc2626' }
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Stack>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                ))}

                {!loading && !error && transformedNotifications.length === 0 && (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            textAlign: 'center',
                            bgcolor: '#f0fdf4',
                            borderRadius: 2,
                            border: '2px dashed #bbf7d0'
                        }}
                    >
                        <NotificationsNoneIcon sx={{ fontSize: 60, color: '#6b7280', mb: 2 }} />
                        <Typography variant="h6" gutterBottom sx={{ color: '#374151' }}>
                            No notifications found
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            You're all caught up! 🎉
                        </Typography>
                    </Paper>
                )}
            </Stack>

            {/* Modal for notification details */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, boxShadow: 6 } }}>
                <Box sx={{ bgcolor: 'white', borderRadius: 3, overflow: 'hidden', p: 0, minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Green header with title */}
                    <Box sx={{ width: '100%', bgcolor: '#059669', py: 2, px: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, fontSize: 20, textAlign: 'center', letterSpacing: 0.5 }}>
                            {selectedNotification?.title}
                        </Typography>
                    </Box>
                    {/* Message and time */}
                    <Box sx={{ width: '100%', px: 3, py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#374151', mb: 2, textAlign: 'center', fontSize: 16, fontWeight: 500 }}>
                            {selectedNotification?.message}
                        </Typography>
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <Typography variant="caption" sx={{ color: '#f59e0b', fontSize: 15, fontWeight: 600, textAlign: 'center', px: 2, py: 0.5, borderRadius: 2, bgcolor: '#fef3c7', display: 'inline-block' }}>
                                {selectedNotification?.time}
                            </Typography>
                        </Box>
                    </Box>
                    {/* Close button */}
                    <DialogActions sx={{ width: '100%', bgcolor: 'white', justifyContent: 'center', p: 2, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
                        <Button onClick={() => setOpenModal(false)} sx={{ color: 'white', bgcolor: '#059669', fontWeight: 700, fontSize: 16, px: 5, py: 1.2, borderRadius: 2, textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: '#047857' } }}>
                            Close
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Box>
    );
}
