const inferDefaultBaseUrl = () => {
	const explicit = import.meta?.env?.VITE_API_BASE_URL;
	if (explicit) {
		return explicit.replace(/\/$/, '');
	}

	if (typeof window !== 'undefined') {
		const host = window.location.hostname.toLowerCase();

		if (host === 'localhost' || host === '127.0.0.1') {
			return 'http://localhost/kolektrash/backend/api';
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
