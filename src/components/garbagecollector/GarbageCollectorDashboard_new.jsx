import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiMessageSquare } from 'react-icons/fi';
import {
  HomeIcon,
  CalendarIcon,
  MapIcon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { authService } from '../../services/authService';

const navigation = [
  { name: 'Home', href: '/garbagecollector', icon: HomeIcon },
  { name: 'Collection Schedule', href: '/garbagecollector/schedule', icon: CalendarIcon },
  { name: 'Routes', href: '/garbagecollector/routes', icon: MapIcon },
  { name: 'Tasks', href: '/garbagecollector/tasks', icon: ClipboardDocumentCheckIcon },
  { name: 'Settings', href: '/garbagecollector/settings', icon: Cog6ToothIcon },
];

export default function GarbageCollectorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch user data from database
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user data from localStorage first to get the user ID
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          
          // Fetch fresh data from database using the user ID
          if (userData.id) {
            const response = await authService.getUserData(userData.id);
            if (response.status === 'success') {
              setUser(response.data);
            } else {
              console.error('Failed to fetch user data:', response.message);
              // Fallback to stored data
              setUser(userData);
            }
          } else {
            // Use stored data if no ID
            setUser(userData);
          }
        } else {
          console.warn('No user data found in localStorage');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Try to use stored data as fallback
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
          } catch (parseError) {
            console.error('Error parsing stored user data:', parseError);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);
}
