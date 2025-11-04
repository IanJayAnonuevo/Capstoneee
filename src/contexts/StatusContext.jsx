import React, { createContext, useContext, useState, useCallback } from 'react';
import { buildApiUrl } from '../config/api';

const StatusContext = createContext();

export const useStatus = () => {
  const context = useContext(StatusContext);
  if (!context) {
    throw new Error('useStatus must be used within a StatusProvider');
  }
  return context;
};

export const StatusProvider = ({ children }) => {
  const [status, setStatus] = useState('Off Duty');
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = useCallback(async (newStatus, userId) => {
    if (!userId) {
      console.error('User ID is required for status update');
      return false;
    }
    
    setIsUpdating(true);
    try {
  const response = await fetch(buildApiUrl("update_user_status.php"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          status: newStatus
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus(newStatus);
        return true;
      } else {
        console.error('Failed to update status:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error updating status:', error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const autoUpdateStatus = useCallback(async (action, userId) => {
    let newStatus;
    switch (action) {
      case 'route_start':
        newStatus = 'On Duty';
        break;
      case 'route_complete':
        newStatus = 'Off Duty';
        break;
      default:
        return false;
    }
    
    return await updateStatus(newStatus, userId);
  }, [updateStatus]);

  const value = {
    status,
    setStatus,
    updateStatus,
    autoUpdateStatus,
    isUpdating
  };

  return (
    <StatusContext.Provider value={value}>
      {children}
    </StatusContext.Provider>
  );
};


