import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 30000, // 30 seconds timeout
});

// Request interceptor - Add token and encrypt query params
api.interceptors.request.use(
	(config) => {
		// Add token from localStorage
		const token = localStorage.getItem("token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		// Encrypt query parameters for sensitive routes (optional enhancement)
		// This can be enabled for routes that contain sensitive data
		if (config.url && config.url.includes("?") && config.params) {
			// For now, we'll keep query params as-is
			// In production, you might want to encrypt sensitive query params
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor - Handle errors and retry logic
api.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

		// Handle 401 - Unauthorized
		if (error.response?.status === 401) {
			// Don't redirect if we're already on login page
			if (typeof window !== "undefined" && !window.location.pathname.includes("/auth/login")) {
				// Clear localStorage
				localStorage.removeItem("token");
				localStorage.removeItem("user");
				// Redirect to login
				window.location.href = "/auth/login";
			}
		}

		// Handle 500 - Server Error with retry logic
		if (error.response?.status === 500 && !originalRequest._retry) {
			originalRequest._retry = true;
			// Wait 1 second before retry
			await new Promise((resolve) => setTimeout(resolve, 1000));
			return api(originalRequest);
		}

		// Handle network errors
		if (!error.response) {
			// Network error - could retry here if needed
			console.error("Network error:", error.message);
		}

		// 403 errors are handled by individual components (like admin page)
		return Promise.reject(error);
	}
);

// Auth
export const authAPI = {
	register: (data: { email: string; password: string; name: string }) =>
		api.post("/auth/register", data),
	login: (data: { email: string; password: string }) =>
		api.post("/auth/login", data),
	logout: () => api.post("/auth/logout"),
	getMe: () => api.get("/auth/me"),
	forgotPassword: (data: { email: string }) =>
		api.post("/auth/forgot-password", data),
	resetPassword: (data: { token: string; password: string }) =>
		api.post("/auth/reset-password", data),
	updateProfile: (data: { name?: string }) =>
		api.put("/auth/profile", data),
	changePassword: (data: { currentPassword: string; newPassword: string }) =>
		api.post("/auth/change-password", data),
};

// Company
export const companyAPI = {
	create: (data: any) => api.post("/company", data),
	getAll: () => api.get("/company"),
	getById: (id: string) => api.get(`/company/${id}`),
	update: (id: string, data: any) => api.put(`/company/${id}`, data),
	delete: (id: string) => api.delete(`/company/${id}`),
};

// Metrics
export const metricsAPI = {
	// Environmental
	createEnvironmental: (data: any) => api.post("/metrics/environment", data),
	getEnvironmental: (companyId: string) => api.get(`/metrics/environment/${companyId}`),
	getEnvironmentalById: (id: string) => api.get(`/metrics/environment/id/${id}`),
	updateEnvironmental: (id: string, data: any) => api.put(`/metrics/environment/${id}`, data),
	deleteEnvironmental: (id: string) => api.delete(`/metrics/environment/${id}`),
	// Social
	createSocial: (data: any) => api.post("/metrics/social", data),
	getSocial: (companyId: string) => api.get(`/metrics/social/${companyId}`),
	getSocialById: (id: string) => api.get(`/metrics/social/id/${id}`),
	updateSocial: (id: string, data: any) => api.put(`/metrics/social/${id}`, data),
	deleteSocial: (id: string) => api.delete(`/metrics/social/${id}`),
	// Governance
	createGovernance: (data: any) => api.post("/metrics/governance", data),
	getGovernance: (companyId: string) => api.get(`/metrics/governance/${companyId}`),
	getGovernanceById: (id: string) => api.get(`/metrics/governance/id/${id}`),
	updateGovernance: (id: string, data: any) => api.put(`/metrics/governance/${id}`, data),
	deleteGovernance: (id: string) => api.delete(`/metrics/governance/${id}`),
	// All
	getByCompany: (companyId: string) => api.get(`/metrics/${companyId}`),
	// Data Collection Hub
	getCollectionHub: (companyId: string) => api.get(`/metrics/collection-hub/${companyId}`),
};

// ESG
export const esgAPI = {
	calculate: (companyId: string, period: string) =>
		api.post(`/esg/calculate/${companyId}`, { period }),
	getScore: (companyId: string) => api.get(`/esg/score/${companyId}`),
	getScorecard: (companyId: string, period?: string) =>
		api.get(`/esg/scorecard/${companyId}`, { params: { period } }),
	getReport: (companyId: string, format: string = "json", period?: string) => {
		if (format === "pdf" || format === "excel") {
			return api.get(`/esg/report/${companyId}`, {
				params: { format, period },
				responseType: "blob",
			});
		}
		return api.get(`/esg/report/${companyId}`, { params: { format, period } });
	},
};

// Admin (requires ADMIN role)
export const adminAPI = {
	// Users
	getUsers: () => api.get("/admin/users"),
	getUser: (id: string) => api.get(`/admin/users/${id}`),
	createUser: (data: {
		email: string;
		name: string;
		plan?: "starter" | "pro" | "enterprise";
		role?: "USER" | "ADMIN" | "AUDITOR";
		sendInvitation?: boolean;
	}) => api.post("/admin/users", data),
	updateUser: (id: string, data: {
		name?: string;
		plan?: "starter" | "pro" | "enterprise";
		role?: "USER" | "ADMIN" | "AUDITOR";
	}) => api.put(`/admin/users/${id}`, data),
	resetUserPassword: (id: string, sendEmail?: boolean) =>
		api.post(`/admin/users/${id}/reset-password`, { sendEmail }),
	deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
	// Clients (Company + User)
	createClient: (data: {
		// Company data
		companyName: string;
		industry: string;
		employeeCount: number;
		annualRevenue: number;
		location: string;
		reportingYear?: number;
		// User data
		email: string;
		name: string;
		plan: "starter" | "pro" | "enterprise";
		password?: string;
		sendInvitation?: boolean;
	}) => api.post("/admin/clients", data),
};

export default api;
