/**
 * User Store
 * Manages user authentication state and user data
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '@/lib/api';

interface User {
	id: string;
	email: string;
	name: string;
	plan: 'starter' | 'pro' | 'enterprise';
	role: 'USER' | 'ADMIN' | 'AUDITOR';
	createdAt?: string;
	updatedAt?: string;
}

interface UserState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	lastFetched: number | null;
	
	// Actions
	setUser: (user: User | null) => void;
	setToken: (token: string | null) => void;
	fetchUser: () => Promise<void>;
	logout: () => void;
	updateUser: (updates: Partial<User>) => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useUserStore = create<UserState>()(
	persist(
		(set, get) => ({
			user: null,
			token: null,
			isAuthenticated: false,
			isLoading: false,
			lastFetched: null,

			setUser: (user) => {
				set({ 
					user, 
					isAuthenticated: !!user,
					lastFetched: Date.now()
				});
			},

			setToken: (token) => {
				set({ token });
				if (typeof window !== 'undefined') {
					if (token) {
						localStorage.setItem('token', token);
					} else {
						localStorage.removeItem('token');
					}
				}
			},

			fetchUser: async () => {
				const { lastFetched, user } = get();
				
				// Return cached user if fetched recently
				if (user && lastFetched && Date.now() - lastFetched < CACHE_DURATION) {
					return;
				}

				set({ isLoading: true });
				try {
					const token = typeof window !== 'undefined' 
						? localStorage.getItem('token') 
						: null;
					
					if (!token) {
						set({ user: null, isAuthenticated: false, isLoading: false });
						return;
					}

					const response = await authAPI.getMe();
					if (response.data?.user) {
						// Check for admin test plan override
						const adminTestPlan = typeof window !== 'undefined' 
							? localStorage.getItem('admin_test_plan') 
							: null;
						
						if (adminTestPlan && response.data.user.role === 'ADMIN') {
							response.data.user.plan = adminTestPlan as any;
						}

						set({ 
							user: response.data.user,
							isAuthenticated: true,
							lastFetched: Date.now(),
							isLoading: false
						});
					}
				} catch (error: any) {
					if (error.response?.status === 401) {
						// Token invalid, clear everything
						get().logout();
					}
					set({ isLoading: false });
				}
			},

			logout: () => {
				set({ 
					user: null, 
					token: null, 
					isAuthenticated: false,
					lastFetched: null
				});
				if (typeof window !== 'undefined') {
					localStorage.removeItem('token');
					localStorage.removeItem('user');
				}
			},

			updateUser: (updates) => {
				const { user } = get();
				if (user) {
					set({ 
						user: { ...user, ...updates },
						lastFetched: Date.now()
					});
				}
			},
		}),
		{
			name: 'user-storage',
			partialize: (state) => ({
				user: state.user,
				token: state.token,
				isAuthenticated: state.isAuthenticated,
			}),
		}
	)
);


