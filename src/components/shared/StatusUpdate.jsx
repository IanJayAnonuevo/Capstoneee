import React, { useState, useEffect } from "react";
import { FiClock, FiCheckCircle, FiXCircle, FiUserCheck } from "react-icons/fi";
import { useStatus } from "../../contexts/StatusContext";

const StatusUpdate = ({ userId, currentStatus, onStatusUpdate, showAutoUpdate = true }) => {
  const { status, updateStatus, isUpdating } = useStatus();
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (currentStatus) {
      // Update context status when currentStatus prop changes
      updateStatus(currentStatus, userId);
    }
  }, [currentStatus, userId, updateStatus]);

  const handleStatusUpdate = async (newStatus) => {
    if (!userId) {
      showStatusMessage("Error: User ID is missing", 'error');
      return;
    }
    
    const success = await updateStatus(newStatus, userId);
    
    if (success) {
      setLastUpdate(new Date().toLocaleTimeString());
      if (onStatusUpdate) {
        onStatusUpdate(newStatus);
      }
      showStatusMessage(`Status updated to ${newStatus}`, 'success');
    } else {
      showStatusMessage("Failed to update status", 'error');
    }
  };

  const showStatusMessage = (message, type) => {
    // Simple alert for now, can be enhanced with toast notifications
    alert(message);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "On Duty":
        return "bg-green-100 text-green-800 border-green-200";
      case "On Leave":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Off Duty":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "On Duty":
        return <FiCheckCircle className="text-green-600" />;
      case "On Leave":
        return <FiClock className="text-yellow-600" />;
      case "Off Duty":
        return <FiXCircle className="text-red-600" />;
      default:
        return <FiUserCheck className="text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">My Status</h3>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(status)}`}>
          {getStatusIcon(status)}
          <span className="font-medium">{status}</span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600 mb-3">
          Your status is managed automatically based on your route activity.
        </p>
        {showAutoUpdate && (
          <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <FiCheckCircle className="text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Auto Status Update</span>
            </div>
            <p className="text-xs text-blue-700">
              It switches to "On Duty" when you start a route and back to "Off Duty" when you complete it.
            </p>
          </div>
        )}

        {lastUpdate && (
          <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
            Last updated: {lastUpdate}
          </div>
        )}

        {isUpdating && (
          <div className="text-xs text-blue-600 mt-2">
            Updating status...
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusUpdate;
