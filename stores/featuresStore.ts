/**
 * Features Store
 * Manages feature flags and plan-based features
 */

import { create } from 'zustand';
import { getUserFeatures, hasFeature, clearFeatureCache } from '@/lib/features';
import type { FeaturesResponse } from '@/lib/features';

interface FeaturesState {
	features: FeaturesResponse | null;
	isLoading: boolean;
	lastFetched: number | null;
	error: string | null;
	
	// Actions
	setFeatures: (features: FeaturesResponse) => void;
	fetchFeatures: () => Promise<void>;
	checkFeature: (featureId: string) => boolean;
	clearCache: () => void;
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes (features don't change often)

export const useFeaturesStore = create<FeaturesState>()((set, get) => ({
	features: null,
	isLoading: false,
	lastFetched: null,
	error: null,

	setFeatures: (features) => {
		set({ 
			features,
			lastFetched: Date.now()
		});
	},

	fetchFeatures: async () => {
		const { lastFetched, features } = get();
		
		// Return cached features if fetched recently
		if (features && lastFetched && Date.now() - lastFetched < CACHE_DURATION) {
			return;
		}

		set({ isLoading: true, error: null });
		try {
			const featuresData = await getUserFeatures();
			set({ 
				features: featuresData,
				lastFetched: Date.now(),
				isLoading: false
			});
		} catch (error: any) {
			set({ 
				error: error.message || 'Failed to load features',
				isLoading: false
			});
		}
	},

	checkFeature: (featureId: string) => {
		const { features } = get();
		
		// If features are loaded, use store
		if (features) {
			// Check in features array
			const feature = features.features.find(f => f.id === featureId);
			if (feature) {
				return feature.enabled;
			}
			
			// Check custom features
			if (features.customFeatures?.includes(featureId)) {
				return true;
			}
		}
		
		// Fallback to lib function (which also checks localStorage for test mode)
		return hasFeature(featureId);
	},

	clearCache: () => {
		clearFeatureCache();
		set({ 
			features: null,
			lastFetched: null
		});
	},
}));


