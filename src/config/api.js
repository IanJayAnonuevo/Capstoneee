import axios from 'axios';

const inferDefaultBaseUrl = () => {
	const explicit = import.meta?.env?.VITE_API_BASE_URL;
	if (explicit) {
		return explicit.replace(/\/$/, '');
	}

	if (typeof window !== 'undefined') {
		const host = window.location.hostname.toLowerCase();

		if (host === 'localhost' || host === '127.0.0.1') {
			return 'http://localhost/Capstoneee/backend/api';
		}

		if (host.includes('kolektrash.systemproj.com')) {
			return 'https://kolektrash.systemproj.com/backend/api';
		}

		if (host.includes('koletrash.systemproj.com')) {
			return 'https://koletrash.systemproj.com/backend/api';
		}
	}

	return 'https://koletrash.systemproj.com/backend/api';
};

export const API_BASE_URL = inferDefaultBaseUrl();

export const buildApiUrl = (path = '') => {
	const normalized = String(path || '').replace(/^\/+/, '');
	if (!normalized) {
		return API_BASE_URL;
	}
	return `${API_BASE_URL}/${normalized}`;
};

// Setup axios interceptor to handle 401 errors globally
let isRedirecting = false;

axios.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401 && !isRedirecting) {
			isRedirecting = true;

			// Clear expired token
			try {
				localStorage.removeItem('access_token');
				localStorage.removeItem('token_expires_at');
				localStorage.removeItem('token_type');
			} catch (e) {
				console.error('Failed to clear tokens:', e);
			}

			// Redirect to login
			if (typeof window !== 'undefined') {
				window.location.href = '/login';
			}
		}
		return Promise.reject(error);
	}
);
