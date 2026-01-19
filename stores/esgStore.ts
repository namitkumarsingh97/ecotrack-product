/**
 * ESG Store
 * Caches ESG scores to reduce API calls
 */

import { create } from 'zustand';
import { esgAPI } from '@/lib/api';

interface ESGScore {
	_id: string;
	companyId: string;
	period: string;
	environmentalScore: number;
	socialScore: number;
	governanceScore: number;
	overallScore: number;
	calculatedAt?: string;
	createdAt?: string;
	updatedAt?: string;
}

interface ESGState {
	scores: Record<string, ESGScore[]>; // key: companyId
	lastFetched: Record<string, number>; // key: companyId
	isLoading: Record<string, boolean>; // key: companyId
	error: Record<string, string | null>; // key: companyId
	
	// Actions
	setScores: (companyId: string, scores: ESGScore[]) => void;
	fetchScores: (companyId: string) => Promise<void>;
	calculateScore: (companyId: string, period: string) => Promise<void>;
	clearCompanyCache: (companyId: string) => void;
	clearAllCache: () => void;
}

const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

export const useESGStore = create<ESGState>()((set, get) => ({
	scores: {},
	lastFetched: {},
	isLoading: {},
	error: {},

	setScores: (companyId, scores) => {
		set((state) => ({
			scores: { ...state.scores, [companyId]: scores },
			lastFetched: { ...state.lastFetched, [companyId]: Date.now() }
		}));
	},

	fetchScores: async (companyId) => {
		const { lastFetched, scores } = get();
		
		// Check cache
		if (
			scores[companyId] && 
			lastFetched[companyId] && 
			Date.now() - lastFetched[companyId] < CACHE_DURATION
		) {
			return;
		}

		set((state) => ({
			isLoading: { ...state.isLoading, [companyId]: true },
			error: { ...state.error, [companyId]: null }
		}));

		try {
			const response = await esgAPI.getScore(companyId);
			const fetchedScores = response.data.scores || [];
			get().setScores(companyId, fetchedScores);
		} catch (error: any) {
			set((state) => ({
				error: {
					...state.error,
					[companyId]: error.response?.data?.error || 'Failed to load ESG scores'
				}
			}));
		} finally {
			set((state) => ({
				isLoading: { ...state.isLoading, [companyId]: false }
			}));
		}
	},

	calculateScore: async (companyId, period) => {
		set((state) => ({
			isLoading: { ...state.isLoading, [companyId]: true },
			error: { ...state.error, [companyId]: null }
		}));

		try {
			await esgAPI.calculate(companyId, period);
			// Refresh scores after calculation
			await get().fetchScores(companyId);
		} catch (error: any) {
			set((state) => ({
				error: {
					...state.error,
					[companyId]: error.response?.data?.error || 'Failed to calculate ESG score'
				}
			}));
		} finally {
			set((state) => ({
				isLoading: { ...state.isLoading, [companyId]: false }
			}));
		}
	},

	clearCompanyCache: (companyId) => {
		set((state) => {
			const newScores = { ...state.scores };
			const newLastFetched = { ...state.lastFetched };
			const newError = { ...state.error };
			
			delete newScores[companyId];
			delete newLastFetched[companyId];
			delete newError[companyId];
			
			return {
				scores: newScores,
				lastFetched: newLastFetched,
				error: newError
			};
		});
	},

	clearAllCache: () => {
		set({
			scores: {},
			lastFetched: {},
			isLoading: {},
			error: {}
		});
	},
}));


