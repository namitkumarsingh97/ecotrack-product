/**
 * Frontend Feature Management Utilities
 * Check feature access based on user plan and company custom features
 */

import api from './api';

export interface Feature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  source: 'plan' | 'custom';
}

export interface FeaturesResponse {
  plan: 'starter' | 'pro' | 'enterprise';
  features: Feature[];
  customFeatures: string[];
}

let cachedFeatures: FeaturesResponse | null = null;

/**
 * Get all features available for current user
 * Uses test plan/company from localStorage if in admin test mode
 */
export async function getUserFeatures(): Promise<FeaturesResponse> {
  // Check for admin test mode
  const testPlan = localStorage.getItem('admin_test_plan') as 'starter' | 'pro' | 'enterprise' | null;
  const userData = localStorage.getItem('user');
  
  // If in test mode and user is admin, override plan
  if (testPlan && userData) {
    try {
      const user = JSON.parse(userData);
      if (user.role === 'ADMIN') {
        // Clear cache to force refresh
        cachedFeatures = null;
        // Temporarily update user plan in localStorage for API call
        const originalPlan = user.plan;
        user.plan = testPlan;
        localStorage.setItem('user', JSON.stringify(user));
        
        try {
          const response = await api.get<FeaturesResponse>('/features');
          const features = response.data;
          // Restore original plan
          user.plan = originalPlan;
          localStorage.setItem('user', JSON.stringify(user));
          cachedFeatures = features;
          return features;
        } catch (error) {
          // Restore original plan on error
          user.plan = originalPlan;
          localStorage.setItem('user', JSON.stringify(user));
          throw error;
        }
      }
    } catch (error) {
      console.error('Failed to fetch features in test mode:', error);
    }
  }

  if (cachedFeatures) {
    return cachedFeatures;
  }

  try {
    const response = await api.get<FeaturesResponse>('/features');
    cachedFeatures = response.data;
    return cachedFeatures;
  } catch (error) {
    console.error('Failed to fetch features:', error);
    // Return default features for starter plan
    return {
      plan: 'starter',
      features: [],
      customFeatures: [],
    };
  }
}

/**
 * Check if user has access to a specific feature
 * Uses test plan from localStorage if in admin test mode
 */
export async function hasFeature(featureId: string): Promise<boolean> {
  // Check for admin test mode
  const testPlan = localStorage.getItem('admin_test_plan') as 'starter' | 'pro' | 'enterprise' | null;
  const userData = localStorage.getItem('user');
  
  // If in test mode and user is admin, temporarily update plan for API call
  if (testPlan && userData) {
    try {
      const user = JSON.parse(userData);
      if (user.role === 'ADMIN') {
        // Temporarily update user plan
        const originalPlan = user.plan;
        user.plan = testPlan;
        localStorage.setItem('user', JSON.stringify(user));
        
        try {
          const response = await api.get<{ hasAccess: boolean }>(`/features/check/${featureId}`);
          // Restore original plan
          user.plan = originalPlan;
          localStorage.setItem('user', JSON.stringify(user));
          return response.data.hasAccess;
        } catch (error) {
          // Restore original plan on error
          user.plan = originalPlan;
          localStorage.setItem('user', JSON.stringify(user));
          throw error;
        }
      }
    } catch (error) {
      console.error('Test mode feature check error:', error);
    }
  }

  try {
    const response = await api.get<{ hasAccess: boolean }>(`/features/check/${featureId}`);
    return response.data.hasAccess;
  } catch (error) {
    console.error(`Failed to check feature ${featureId}:`, error);
    return false;
  }
}

/**
 * Get feature by ID
 */
export async function getFeature(featureId: string): Promise<Feature | null> {
  const features = await getUserFeatures();
  return features.features.find(f => f.id === featureId) || null;
}

/**
 * Clear cached features (call after plan change or feature update)
 */
export function clearFeatureCache(): void {
  cachedFeatures = null;
}

// Note: React hooks should be in a separate file (hooks/useFeature.ts)
// This utility file is for non-hook functions only

