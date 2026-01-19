/**
 * Toast notification utility
 * Provides a simple interface for showing toast notifications
 */
import toast from "react-hot-toast";

export const showToast = {
	success: (message: string, duration: number = 3000) => {
		toast.success(message, {
			duration,
			position: "bottom-right",
			style: {
				background: "#10b981",
				color: "#fff",
				padding: "16px",
				borderRadius: "8px",
			},
		});
	},
	error: (message: string, duration: number = 5000) => {
		toast.error(message, {
			duration,
			position: "bottom-right",
			style: {
				background: "#ef4444",
				color: "#fff",
				padding: "16px",
				borderRadius: "8px",
			},
		});
	},
	warning: (message: string, duration: number = 4000) => {
		toast(message, {
			icon: "⚠️",
			duration,
			position: "bottom-right",
			style: {
				background: "#f59e0b",
				color: "#fff",
				padding: "16px",
				borderRadius: "8px",
			},
		});
	},
	info: (message: string, duration: number = 3000) => {
		toast(message, {
			icon: "ℹ️",
			duration,
			position: "bottom-right",
			style: {
				background: "#3b82f6",
				color: "#fff",
				padding: "16px",
				borderRadius: "8px",
			},
		});
	},
	loading: (message: string) => {
		return toast.loading(message, {
			position: "bottom-right",
		});
	},
	dismiss: (toastId: string) => {
		toast.dismiss(toastId);
	},
};

