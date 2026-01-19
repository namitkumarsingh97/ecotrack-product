/**
 * Metrics Store
 * Caches metrics data to reduce API calls
 */

import { create } from 'zustand';
import { metricsAPI } from '@/lib/api';

interface EnvironmentalMetric {
	_id: string;
	companyId: string;
	period: string;
	electricityUsageKwh: number;
	fuelConsumptionLitres: number;
	waterUsageKL: number;
	wasteGeneratedKg: number;
	renewableEnergyPercent: number;
	carbonEmissionsTons: number;
	createdAt?: string;
	updatedAt?: string;
}

interface SocialMetric {
	_id: string;
	companyId: string;
	period: string;
	totalEmployees: number;
	femaleEmployees: number;
	avgTrainingHours: number;
	workplaceIncidents: number;
	employeeTurnoverPercent: number;
	createdAt?: string;
	updatedAt?: string;
}

interface GovernanceMetric {
	_id: string;
	companyId: string;
	period: string;
	boardMembers: number;
	independentDirectors: number;
	antiCorruptionPolicy: boolean;
	dataPrivacyPolicy: boolean;
	complianceViolations: number;
	createdAt?: string;
	updatedAt?: string;
}

interface MetricsState {
	environmental: Record<string, EnvironmentalMetric[]>; // key: companyId
	social: Record<string, SocialMetric[]>; // key: companyId
	governance: Record<string, GovernanceMetric[]>; // key: companyId
	lastFetched: Record<string, number>; // key: companyId
	isLoading: Record<string, boolean>; // key: companyId
	
	// Actions
	setEnvironmental: (companyId: string, metrics: EnvironmentalMetric[]) => void;
	setSocial: (companyId: string, metrics: SocialMetric[]) => void;
	setGovernance: (companyId: string, metrics: GovernanceMetric[]) => void;
	fetchEnvironmental: (companyId: string) => Promise<void>;
	fetchSocial: (companyId: string) => Promise<void>;
	fetchGovernance: (companyId: string) => Promise<void>;
	fetchAllMetrics: (companyId: string) => Promise<void>;
	addEnvironmental: (metric: EnvironmentalMetric) => void;
	updateEnvironmental: (id: string, updates: Partial<EnvironmentalMetric>) => void;
	deleteEnvironmental: (id: string, companyId: string) => void;
	deleteSocial: (id: string, companyId: string) => void;
	deleteGovernance: (id: string, companyId: string) => void;
	clearCompanyCache: (companyId: string) => void;
	clearAllCache: () => void;
}

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes (metrics change more frequently)

export const useMetricsStore = create<MetricsState>()((set, get) => ({
	environmental: {},
	social: {},
	governance: {},
	lastFetched: {},
	isLoading: {},

	setEnvironmental: (companyId, metrics) => {
		set((state) => ({
			environmental: { ...state.environmental, [companyId]: metrics },
			lastFetched: { ...state.lastFetched, [companyId]: Date.now() }
		}));
	},

	setSocial: (companyId, metrics) => {
		set((state) => ({
			social: { ...state.social, [companyId]: metrics },
			lastFetched: { ...state.lastFetched, [companyId]: Date.now() }
		}));
	},

	setGovernance: (companyId, metrics) => {
		set((state) => ({
			governance: { ...state.governance, [companyId]: metrics },
			lastFetched: { ...state.lastFetched, [companyId]: Date.now() }
		}));
	},

	fetchEnvironmental: async (companyId) => {
		const { lastFetched, environmental } = get();
		
		// Check cache
		if (
			environmental[companyId] && 
			lastFetched[companyId] && 
			Date.now() - lastFetched[companyId] < CACHE_DURATION
		) {
			return;
		}

		set((state) => ({
			isLoading: { ...state.isLoading, [companyId]: true }
		}));

		try {
			const response = await metricsAPI.getEnvironmental(companyId);
			const metrics = response.data.metrics || response.data.environmental || [];
			get().setEnvironmental(companyId, metrics);
		} catch (error) {
			console.error('Failed to fetch environmental metrics:', error);
		} finally {
			set((state) => ({
				isLoading: { ...state.isLoading, [companyId]: false }
			}));
		}
	},

	fetchSocial: async (companyId) => {
		const { lastFetched, social } = get();
		
		if (
			social[companyId] && 
			lastFetched[companyId] && 
			Date.now() - lastFetched[companyId] < CACHE_DURATION
		) {
			return;
		}

		set((state) => ({
			isLoading: { ...state.isLoading, [companyId]: true }
		}));

		try {
			const response = await metricsAPI.getSocial(companyId);
			const metrics = response.data.metrics || response.data.social || [];
			get().setSocial(companyId, metrics);
		} catch (error) {
			console.error('Failed to fetch social metrics:', error);
		} finally {
			set((state) => ({
				isLoading: { ...state.isLoading, [companyId]: false }
			}));
		}
	},

	fetchGovernance: async (companyId) => {
		const { lastFetched, governance } = get();
		
		if (
			governance[companyId] && 
			lastFetched[companyId] && 
			Date.now() - lastFetched[companyId] < CACHE_DURATION
		) {
			return;
		}

		set((state) => ({
			isLoading: { ...state.isLoading, [companyId]: true }
		}));

		try {
			const response = await metricsAPI.getGovernance(companyId);
			const metrics = response.data.metrics || response.data.governance || [];
			get().setGovernance(companyId, metrics);
		} catch (error) {
			console.error('Failed to fetch governance metrics:', error);
		} finally {
			set((state) => ({
				isLoading: { ...state.isLoading, [companyId]: false }
			}));
		}
	},

	fetchAllMetrics: async (companyId) => {
		await Promise.all([
			get().fetchEnvironmental(companyId),
			get().fetchSocial(companyId),
			get().fetchGovernance(companyId)
		]);
	},

	addEnvironmental: (metric) => {
		set((state) => {
			const existing = state.environmental[metric.companyId] || [];
			return {
				environmental: {
					...state.environmental,
					[metric.companyId]: [metric, ...existing]
				}
			};
		});
	},

	updateEnvironmental: (id, updates) => {
		set((state) => {
			const newEnvironmental = { ...state.environmental };
			Object.keys(newEnvironmental).forEach((companyId) => {
				newEnvironmental[companyId] = newEnvironmental[companyId].map((m) =>
					m._id === id ? { ...m, ...updates } : m
				);
			});
			return { environmental: newEnvironmental };
		});
	},

	deleteEnvironmental: (id, companyId) => {
		set((state) => ({
			environmental: {
				...state.environmental,
				[companyId]: (state.environmental[companyId] || []).filter((m) => m._id !== id)
			}
		}));
	},

	deleteSocial: (id, companyId) => {
		set((state) => ({
			social: {
				...state.social,
				[companyId]: (state.social[companyId] || []).filter((m) => m._id !== id)
			}
		}));
	},

	deleteGovernance: (id, companyId) => {
		set((state) => ({
			governance: {
				...state.governance,
				[companyId]: (state.governance[companyId] || []).filter((m) => m._id !== id)
			}
		}));
	},

	clearCompanyCache: (companyId) => {
		set((state) => {
			const newEnvironmental = { ...state.environmental };
			const newSocial = { ...state.social };
			const newGovernance = { ...state.governance };
			const newLastFetched = { ...state.lastFetched };
			
			delete newEnvironmental[companyId];
			delete newSocial[companyId];
			delete newGovernance[companyId];
			delete newLastFetched[companyId];
			
			return {
				environmental: newEnvironmental,
				social: newSocial,
				governance: newGovernance,
				lastFetched: newLastFetched
			};
		});
	},

	clearAllCache: () => {
		set({
			environmental: {},
			social: {},
			governance: {},
			lastFetched: {},
			isLoading: {}
		});
	},
}));


