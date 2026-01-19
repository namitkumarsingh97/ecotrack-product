"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";

interface UseInactivityOptions {
	timeout?: number; // Inactivity timeout in milliseconds (default: 25 minutes)
	warningTime?: number; // Warning time before logout in milliseconds (default: 5 minutes)
	onLogout?: () => void;
	enabled?: boolean; // Enable/disable inactivity detection
}

/**
 * Hook to detect user inactivity and automatically log out
 * Based on the reference SaaS product's inactivity timeout feature
 */
export function useInactivity({
	timeout = 25 * 60 * 1000, // 25 minutes
	warningTime = 5 * 60 * 1000, // 5 minutes
	onLogout,
	enabled = true,
}: UseInactivityOptions = {}) {
	const router = useRouter();
	const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const logoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const warningToastRef = useRef<string | null>(null);

	const logout = useCallback(() => {
		// Clear all timeouts
		if (inactivityTimeoutRef.current) {
			clearTimeout(inactivityTimeoutRef.current);
		}
		if (logoutTimeoutRef.current) {
			clearTimeout(logoutTimeoutRef.current);
		}

		// Dismiss warning toast if shown
		if (warningToastRef.current) {
			showToast.dismiss(warningToastRef.current);
			warningToastRef.current = null;
		}

		// Clear localStorage
		localStorage.removeItem("token");
		localStorage.removeItem("user");

		// Call custom logout handler if provided
		if (onLogout) {
			onLogout();
		} else {
			// Default logout behavior
			showToast.info("Session expired. Please login again.");
			router.push("/auth/login");
		}
	}, [router, onLogout]);

	const resetTimeout = useCallback(() => {
		if (!enabled) return;

		// Clear existing timeouts
		if (inactivityTimeoutRef.current) {
			clearTimeout(inactivityTimeoutRef.current);
		}
		if (logoutTimeoutRef.current) {
			clearTimeout(logoutTimeoutRef.current);
		}

		// Dismiss warning toast if shown
		if (warningToastRef.current) {
			showToast.dismiss(warningToastRef.current);
			warningToastRef.current = null;
		}

		// Set inactivity timeout
		inactivityTimeoutRef.current = setTimeout(() => {
			// Show warning toast
			const warningMessage = `You have been inactive for ${Math.floor(timeout / 60000)} minutes. You will be automatically logged out in ${Math.floor(warningTime / 60000)} minutes if there is no further activity.`;
			warningToastRef.current = showToast.warning(warningMessage, 0); // 0 = don't auto-dismiss

			// Start logout timer
			logoutTimeoutRef.current = setTimeout(() => {
				logout();
			}, warningTime);
		}, timeout);
	}, [timeout, warningTime, logout, enabled]);

	useEffect(() => {
		if (!enabled) return;

		// Attach event listeners for user activity
		const events = ["mousemove", "keypress", "click", "scroll", "touchstart"];
		events.forEach((event) => {
			window.addEventListener(event, resetTimeout, { passive: true });
		});

		// Initial call to set the inactivity timeout
		resetTimeout();

		// Cleanup
		return () => {
			events.forEach((event) => {
				window.removeEventListener(event, resetTimeout);
			});

			if (inactivityTimeoutRef.current) {
				clearTimeout(inactivityTimeoutRef.current);
			}
			if (logoutTimeoutRef.current) {
				clearTimeout(logoutTimeoutRef.current);
			}

			if (warningToastRef.current) {
				showToast.dismiss(warningToastRef.current);
			}
		};
	}, [resetTimeout, enabled]);

	return {
		resetTimeout,
		logout,
	};
}

