import React, { useState, useEffect, useCallback } from "react";
import { buildApiUrl } from '../../config/api';
import { FiSearch, FiPlus, FiUser, FiMoreVertical, FiCheckCircle, FiAlertCircle, FiX } from "react-icons/fi";

// Environmental theme colors - Tree-inspired palette (same as ManageRoute)
const ENV_COLORS = {
  primary: '#2d5016',      // Deep forest green (tree trunk)
  secondary: '#4a7c59',    // Sage green (mature leaves)
  accent: '#8fbc8f',       // Light sage (new leaves)
  light: '#f8faf5',        // Very light mint (forest mist)
  white: '#ffffff',        // Pure white
  text: '#2c3e50',         // Dark bark
  textLight: '#7f8c8d',    // Light bark
  success: '#27ae60',      // Emerald green (healthy leaves)
  warning: '#f39c12',      // Autumn orange (falling leaves)
  error: '#e74c3c',        // Red (diseased leaves)
  border: '#e8f5e8',       // Light green border (forest floor)
  shadow: 'rgba(45, 80, 22, 0.08)', // Tree-tinted shadow
  bark: '#5d4e37',         // Tree bark brown
  moss: '#9caa7b',         // Moss green
  leaf: '#6b8e23',         // Olive green (leaves)
  soil: '#8b4513'          // Rich soil brown
};

const accountTypes = ["All", "Foreman", "Truck Driver", "Garbage Collector", "Barangay Head", "Resident"];

// Color map for roles using tree palette
const roleColors = {
  "Admin": "bg-purple-800 text-white",
  "Foreman": "bg-lime-700 text-white",
  "Truck Driver": "bg-green-800 text-white",
  "Garbage Collector": "bg-green-600 text-white",
  "Barangay Head": "bg-amber-800 text-white",
  "Resident": "bg-green-300 text-gray-800",
};

const roleDisplay = {
  admin: "Admin",
  foreman: "Foreman",
  truck_driver: "Truck Driver",
  garbage_collector: "Garbage Collector",
  barangay_head: "Barangay Head",
  resident: "Resident"
};


export default function ManageUsers() {
  const [search, setSearch] = useState("");
  const [accountType, setAccountType] = useState("All");
  const [cluster, setCluster] = useState("All");
  const [clusterOptions, setClusterOptions] = useState(["All"]);
  const [barangayOptions, setBarangayOptions] = useState([]);
  const [openMenuUserId, setOpenMenuUserId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const initialFormState = {
    username: "",
    email: "",
    password: "",
    role: "Truck Driver", // default
    firstname: "",
    lastname: "",
    birthdate: "",
    gender: "",
    contact_num: "",
    address: "",
    status: "",
    barangay_id: ""
  };
  const [form, setForm] = useState(initialFormState);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [viewModal, setViewModal] = useState({ open: false, loading: false, error: '', data: null });
  const [editModal, setEditModal] = useState({ open: false, loading: false, submitting: false, error: '', form: null });
  const [deactivateModal, setDeactivateModal] = useState({ open: false, submitting: false, error: '', user: null });
  const [feedbackModal, setFeedbackModal] = useState({ open: false, type: 'success', title: '', message: '' });

  const closeFeedbackModal = () => setFeedbackModal((prev) => ({ ...prev, open: false }));

  const showFeedbackModal = (title, message, type = 'success') => {
    setFeedbackModal({
      open: true,
      type,
      title,
      message
    });
  };

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(buildApiUrl('get_all_users.php'));
      const data = await res.json();
      if (data.success) {
        const nonAdmins = Array.isArray(data.users) ? data.users.filter(u => u.user_type !== 'admin') : [];
        setUsers(nonAdmins);
      } else {
        alert(data.message || "Failed to fetch users.");
      }
    } catch (err) {
      alert("Error fetching users.");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Fetch clusters for barangay head and resident filtering
  useEffect(() => {
    async function fetchClusters() {
      try {
        const res = await fetch(buildApiUrl('get_clusters.php'));
        const data = await res.json();
        let options = [];
        if (Array.isArray(data?.clusters)) {
          // Accept either array of strings or array of objects with cluster_id
          options = data.clusters.map(c => typeof c === 'string' ? c : (c.cluster_id || c.name || '')).filter(Boolean);
        }
        setClusterOptions(["All", ...Array.from(new Set(options))]);
      } catch (err) {
        // Fallback keeps only "All"
        setClusterOptions(["All"]);
      }
    }
    fetchClusters();
  }, []);

  // Fetch barangays for create account modal selection
  useEffect(() => {
    async function fetchBarangays() {
      try {
        const res = await fetch(buildApiUrl('get_barangays.php'));
        const data = await res.json();
        if (data.success && Array.isArray(data.barangays)) {
          setBarangayOptions(data.barangays);
        } else {
          console.warn('Failed to load barangays', data.message);
        }
      } catch (err) {
        console.warn('Error fetching barangays', err);
      }
    }
    fetchBarangays();
  }, []);

  const fetchUserDetails = useCallback(async (userId) => {
    const url = buildApiUrl(`get_user.php?id=${encodeURIComponent(userId)}`);
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to load user details.');
    }
    return data.data;
  }, []);

  const handleViewUser = async (userId) => {
    setOpenMenuUserId(null);
    setViewModal({ open: true, loading: true, error: '', data: null });
    try {
      const detail = await fetchUserDetails(userId);
      setViewModal({ open: true, loading: false, error: '', data: detail });
    } catch (error) {
      setViewModal({ open: true, loading: false, error: error.message || 'Failed to load user details.', data: null });
    }
  };

  const closeViewModal = () => {
    setViewModal({ open: false, loading: false, error: '', data: null });
  };

  const handleEditUser = async (userId) => {
    setOpenMenuUserId(null);
    setEditModal({ open: true, loading: true, submitting: false, error: '', form: null });
    try {
      const detail = await fetchUserDetails(userId);
      setEditModal({
        open: true,
        loading: false,
        submitting: false,
        error: '',
        form: {
          id: detail.id,
          firstname: detail.firstname || '',
          lastname: detail.lastname || '',
          email: detail.email || '',
          phone: detail.phone || '',
          role: detail.role,
          barangay: detail.barangay,
          barangay_id: detail.barangay_id,
          status: detail.status
        }
      });
    } catch (error) {
      setEditModal({ open: true, loading: false, submitting: false, error: error.message || 'Failed to load user details.', form: null });
    }
  };

  const handleEditFormChange = (field, value) => {
    setEditModal((prev) => ({
      ...prev,
      form: prev.form ? { ...prev.form, [field]: value } : prev.form
    }));
  };

  const closeEditModal = () => {
    setEditModal({ open: false, loading: false, submitting: false, error: '', form: null });
  };

  const handleSubmitEdit = async (event) => {
    event.preventDefault();
    if (!editModal.form) return;
    setEditModal((prev) => ({ ...prev, submitting: true, error: '' }));
    try {
      const payload = {
        id: editModal.form.id,
        firstname: (editModal.form.firstname || '').trim(),
        lastname: (editModal.form.lastname || '').trim(),
        phone: editModal.form.phone || '',
        email: (editModal.form.email || '').trim()
      };
      const response = await fetch(buildApiUrl('update_profile.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.status === 'success') {
        setEditModal({ open: false, loading: false, submitting: false, error: '', form: null });
        await fetchUsers();
        alert('User details updated successfully.');
      } else {
        throw new Error(data.message || 'Failed to update user.');
      }
    } catch (error) {
      setEditModal((prev) => ({ ...prev, submitting: false, error: error.message || 'Failed to update user.' }));
    }
  };

  const handleDeactivatePrompt = (user) => {
    setOpenMenuUserId(null);
    setDeactivateModal({ open: true, submitting: false, error: '', user });
  };

  const closeDeactivateModal = () => {
    setDeactivateModal({ open: false, submitting: false, error: '', user: null });
  };

  const confirmDeactivate = async () => {
    if (!deactivateModal.user) return;
    setDeactivateModal((prev) => ({ ...prev, submitting: true, error: '' }));
    try {
      const response = await fetch(buildApiUrl('delete_account.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: deactivateModal.user.id })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setDeactivateModal({ open: false, submitting: false, error: '', user: null });
        await fetchUsers();
        alert('User account deactivated.');
      } else {
        throw new Error(data.message || 'Failed to deactivate user.');
      }
    } catch (error) {
      setDeactivateModal((prev) => ({ ...prev, submitting: false, error: error.message || 'Failed to deactivate user.' }));
    }
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const normalizedRole = (u.user_type || '').toLowerCase();
    const displayRole = roleDisplay[normalizedRole] || (u.user_type ? u.user_type.replace(/_/g, ' ') : 'Unknown');
    const matchesSearch =
      (u.username && u.username.toLowerCase().includes(search.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
      (u.full_name && u.full_name.toLowerCase().includes(search.toLowerCase()));
    const matchesType = accountType === "All" || displayRole === accountType;

    const isResidentOrBgyHead = ['resident', 'barangay_head'].includes(normalizedRole);
    const matchesCluster = cluster === "All" || !isResidentOrBgyHead || (u.cluster_id === cluster || u.barangay === cluster);

    return matchesSearch && matchesType && matchesCluster;
  });

  const formatRoleLabel = (role) => roleDisplay[(role || '').toLowerCase()] || role || '—';

  const formatFullName = (user) => {
    if (!user) return '—';
    if (user.full_name && user.full_name.trim()) return user.full_name.trim();
    const composed = `${user.firstname || ''} ${user.lastname || ''}`.trim();
    return composed || '—';
  };

  return (
    <>
      <div className="p-6 max-w-full overflow-x-auto bg-emerald-50 min-h-screen font-sans">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl text-green-800 mb-2 font-normal tracking-tight">
          User Management
        </h1>
        <p className="text-sm md:text-base lg:text-lg text-gray-600 m-0 font-normal">
          Manage all system users and their information
        </p>
      </div>

      {/* Action Buttons - Minimal Design */}
      <div className="flex gap-3 my-6 flex-wrap justify-start">
        <button
          className="px-5 py-2.5 bg-green-800 text-white border-none rounded-lg font-medium cursor-pointer text-sm min-w-fit transition-all duration-200 flex items-center gap-2 hover:bg-green-600"
          onClick={() => {
            setShowModal(true);
          }}
        >
          <FiPlus className="text-base" />
          Create Account
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 items-center flex-wrap justify-center p-4 bg-white rounded-lg border border-gray-200">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-200 text-sm bg-white text-gray-800 outline-none transition-all duration-200 focus:border-green-800"
          />
        </div>
        <select 
          value={accountType} 
          onChange={(e) => setAccountType(e.target.value)} 
          className="px-3 py-2 rounded-md border border-gray-200 text-sm min-w-fit bg-white text-gray-800 outline-none cursor-pointer transition-all duration-200 focus:border-green-800"
        >
          {accountTypes.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        {(
          accountType === 'Barangay Head' || accountType === 'Resident'
        ) && (
          <select 
            value={cluster} 
            onChange={(e) => setCluster(e.target.value)} 
            className="px-3 py-2 rounded-md border border-gray-200 text-sm min-w-fit bg-white text-gray-800 outline-none cursor-pointer transition-all duration-200 focus:border-green-800"
          >
            {clusterOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      {/* Summary Cards - Minimal Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <div className="bg-white p-5 rounded-lg border border-gray-200 text-center">
          <div className="text-sm text-gray-600 mb-2">Total Users</div>
          <div className="text-2xl font-normal text-green-800">
            {loadingUsers ? "Loading..." : filteredUsers.length}
          </div>
        </div>
      </div>

      {/* Main Content: User Cards */}
      <div className="flex gap-5 flex-col lg:flex-row">
        {/* User Cards */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-lg mb-4 text-green-800 font-medium">
              Users
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredUsers.map((user) => {
                const normalizedRole = (user.user_type || '').toLowerCase();
                const displayRole = roleDisplay[normalizedRole] || (user.user_type ? user.user_type.replace(/_/g, ' ') : 'Unknown');
                const roleBadgeClass = roleColors[displayRole] || 'bg-gray-400 text-white';
                return (
                <div
                  key={user.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200 text-center hover:bg-green-50 relative"
                >
                  {/* Action menu trigger */}
                  <button
                    className="absolute right-2 top-2 p-1 rounded hover:bg-gray-100 border-0 bg-transparent cursor-pointer"
                    onClick={() => setOpenMenuUserId(openMenuUserId === user.id ? null : user.id)}
                    aria-label="Manage user"
                  >
                    <FiMoreVertical />
                  </button>
                  {openMenuUserId === user.id && (
                    <div className="absolute right-2 top-8 bg-white border border-gray-200 rounded shadow z-10 text-left w-36">
                      <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 border-0 bg-transparent cursor-pointer"
                        onClick={() => handleViewUser(user.id)}
                      >
                        View
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 border-0 bg-transparent cursor-pointer"
                        onClick={() => handleEditUser(user.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 border-0 bg-transparent cursor-pointer"
                        onClick={() => handleDeactivatePrompt(user)}
                      >
                        Deactivate
                      </button>
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mx-auto mb-3 ${roleBadgeClass}`}>
                    <FiUser />
                  </div>
                  <div className="font-medium text-sm text-gray-800 mb-1">
                    {user.full_name}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    {user.email}
                  </div>
                  <div className="text-sm text-gray-800 mb-2">
                    {displayRole}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {user.barangay}
                  </div>
                  
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              );
              })}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-green-900">Create Account</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                // Send POST request to your backend API
                try {
                  const res = await fetch(buildApiUrl('register_personnel.php'), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                  });
                  const data = await res.json();
                  if (data.success) {
                    showFeedbackModal('Account Created', data.message || 'User account created successfully.', 'success');
                    setShowModal(false);
                    setForm(initialFormState);
                    fetchUsers();
                  } else {
                    showFeedbackModal('Unable to Create Account', data.message || 'Failed to create account.', 'error');
                  }
                } catch (err) {
                  console.error('Error creating account:', err);
                  const message = err instanceof Error ? err.message : 'An unexpected error occurred while creating the account.';
                  showFeedbackModal('Request Failed', message, 'error');
                }
              }}
            >
              {/* Personal Information Section */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-green-800 border-b border-gray-200 pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      className="w-full p-2 border border-gray-300 rounded"
                      name="firstname"
                      placeholder="First Name"
                      value={form.firstname}
                      onChange={e => setForm({ ...form, firstname: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      className="w-full p-2 border border-gray-300 rounded"
                      name="lastname"
                      placeholder="Last Name"
                      value={form.lastname}
                      onChange={e => setForm({ ...form, lastname: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Birthdate</label>
                    <input
                      className="w-full p-2 border border-gray-300 rounded"
                      name="birthdate"
                      type="date"
                      value={form.birthdate}
                      onChange={e => setForm({ ...form, birthdate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded"
                      name="gender"
                      value={form.gender}
                      onChange={e => setForm({ ...form, gender: e.target.value })}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    <input
                      className="w-full p-2 border border-gray-300 rounded"
                      name="contact_num"
                      placeholder="Contact Number"
                      value={form.contact_num}
                      onChange={e => setForm({ ...form, contact_num: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      className="w-full p-2 border border-gray-300 rounded"
                      name="address"
                      placeholder="Address"
                      value={form.address}
                      onChange={e => setForm({ ...form, address: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="w-full p-2 border rounded"
                      name="status"
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="">Select Status</option>
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                      <option value="on_leave">On Leave</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
                    <select
                      className="w-full p-2 border rounded"
                      name="barangay_id"
                      value={form.barangay_id}
                      onChange={e => setForm({ ...form, barangay_id: e.target.value })}
                      required
                    >
                      <option value="">Select Barangay</option>
                      {barangayOptions.map((b) => (
                        <option key={b.barangay_id} value={b.barangay_id}>
                          {b.barangay_name || `Barangay ${b.barangay_id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              {/* Account Information Section */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-green-800 border-b border-gray-200 pb-2">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      className="w-full p-2 border border-gray-300 rounded"
                      name="username"
                      placeholder="Username"
                      value={form.username}
                      onChange={e => setForm({ ...form, username: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      className="w-full p-2 border border-gray-300 rounded"
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      className="w-full p-2 border border-gray-300 rounded"
                      name="password"
                      type="password"
                      placeholder="Password"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded"
                      name="role"
                      value={form.role}
                      onChange={e => setForm({ ...form, role: e.target.value })}
                      required
                    >
                      <option value="admin">Admin</option>
                      <option value="foreman">Foreman</option>
                      <option value="truck_driver">Truck Driver</option>
                      <option value="garbage_collector">Garbage Collector</option>
                      <option value="barangay_head">Barangay Head</option>
                      <option value="resident">Resident</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-6">
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>

      {viewModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-2xl">
            <div className="px-6 py-5">
              <h3 className="text-lg font-semibold text-green-800 mb-4">User Details</h3>
              {viewModal.loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
                </div>
              ) : viewModal.error ? (
                <p className="text-sm text-red-600">{viewModal.error}</p>
              ) : viewModal.data ? (
                <div className="space-y-3 text-sm text-gray-700">
                  <div>
                    <span className="font-semibold text-gray-800">Full name:</span> {formatFullName(viewModal.data)}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">Email:</span> {viewModal.data.email || '—'}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">Username:</span> {viewModal.data.username || '—'}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">Role:</span> {formatRoleLabel(viewModal.data.role)}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">Contact:</span> {viewModal.data.phone || '—'}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">Barangay:</span> {viewModal.data.barangay || viewModal.data.barangay_id || '—'}
                  </div>
                  {viewModal.data.status && (
                    <div>
                      <span className="font-semibold text-gray-800">Status:</span> {viewModal.data.status}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No user details available.</p>
              )}
            </div>
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 text-right">
              <button
                type="button"
                onClick={closeViewModal}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white shadow-2xl">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-green-800">Edit User</h3>
            </div>
            {editModal.loading && !editModal.form ? (
              <div className="p-6 flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
              </div>
            ) : editModal.error && !editModal.form ? (
              <div className="p-6">
                <p className="text-sm text-red-600 mb-4">{editModal.error}</p>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form className="p-6 space-y-4" onSubmit={handleSubmitEdit}>
                {editModal.error && editModal.form && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                    {editModal.error}
                  </div>
                )}
                {editModal.form && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                        <input
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-green-600 focus:outline-none"
                          value={editModal.form.firstname || ''}
                          onChange={(e) => handleEditFormChange('firstname', e.target.value)}
                          disabled={editModal.submitting}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                        <input
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-green-600 focus:outline-none"
                          value={editModal.form.lastname || ''}
                          onChange={(e) => handleEditFormChange('lastname', e.target.value)}
                          disabled={editModal.submitting}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-green-600 focus:outline-none"
                          value={editModal.form.email || ''}
                          onChange={(e) => handleEditFormChange('email', e.target.value)}
                          disabled={editModal.submitting}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact number</label>
                        <input
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-green-600 focus:outline-none"
                          value={editModal.form.phone || ''}
                          onChange={(e) => handleEditFormChange('phone', e.target.value)}
                          disabled={editModal.submitting}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <input
                          className="w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600"
                          value={formatRoleLabel(editModal.form.role)}
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
                        <input
                          className="w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600"
                          value={editModal.form.barangay || editModal.form.barangay_id || ''}
                          disabled
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={closeEditModal}
                        disabled={editModal.submitting}
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={editModal.submitting}
                        className="inline-flex items-center justify-center rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {editModal.submitting ? 'Saving…' : 'Save changes'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      )}

  {deactivateModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white shadow-2xl">
            <div className="px-6 py-5">
              <h3 className="text-lg font-semibold text-red-600">Deactivate account</h3>
              <p className="mt-2 text-sm text-gray-600">
                This will remove access for <span className="font-semibold text-gray-800">{formatFullName(deactivateModal.user)}</span>.
                This action permanently deletes the account.
              </p>
              {deactivateModal.user?.email && (
                <p className="mt-2 text-xs text-gray-500">Email: {deactivateModal.user.email}</p>
              )}
              {deactivateModal.error && (
                <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {deactivateModal.error}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-200 bg-gray-50 px-6 py-3">
              <button
                type="button"
                onClick={closeDeactivateModal}
                disabled={deactivateModal.submitting}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeactivate}
                disabled={deactivateModal.submitting}
                className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deactivateModal.submitting ? 'Deactivating…' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {feedbackModal.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={closeFeedbackModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              aria-label="Close notification dialog"
            >
              <FiX className="h-5 w-5" />
            </button>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${feedbackModal.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                {feedbackModal.type === 'success' ? (
                  <FiCheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <FiAlertCircle className="h-8 w-8 text-red-600" />
                )}
              </div>
              <div>
                <h3 className={`text-xl font-bold ${feedbackModal.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                  {feedbackModal.title || (feedbackModal.type === 'success' ? 'Success' : 'Something went wrong')}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {feedbackModal.message || (feedbackModal.type === 'success' ? 'Action completed successfully.' : 'Please try again.')}
                </p>
              </div>
              <button
                type="button"
                onClick={closeFeedbackModal}
                className={`w-full rounded-lg px-4 py-3 font-semibold text-white transition ${feedbackModal.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
