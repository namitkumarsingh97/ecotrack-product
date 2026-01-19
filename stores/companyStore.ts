/**
 * Company Store
 * Manages companies list and selected company
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { companyAPI } from '@/lib/api';

interface Company {
	_id: string;
	userId: string;
	name: string;
	industry: string;
	employeeCount: number;
	annualRevenue: number;
	location: string;
	reportingYear: number;
	customFeatures?: string[];
	featureOverrides?: Record<string, boolean>;
	createdAt?: string;
	updatedAt?: string;
}

interface CompanyState {
	companies: Company[];
	selectedCompany: Company | null;
	isLoading: boolean;
	lastFetched: number | null;
	error: string | null;
	
	// Actions
	setCompanies: (companies: Company[]) => void;
	setSelectedCompany: (company: Company | null) => void;
	fetchCompanies: () => Promise<void>;
	addCompany: (company: Company) => void;
	updateCompany: (id: string, updates: Partial<Company>) => void;
	removeCompany: (id: string) => void;
	clearCache: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useCompanyStore = create<CompanyState>()(
	persist(
		(set, get) => ({
			companies: [],
			selectedCompany: null,
			isLoading: false,
			lastFetched: null,
			error: null,

			setCompanies: (companies) => {
				set({ 
					companies,
					lastFetched: Date.now()
				});
			},

			setSelectedCompany: (company) => {
				set({ selectedCompany: company });
				if (typeof window !== 'undefined' && company) {
					localStorage.setItem('selectedCompany', JSON.stringify(company));
				}
			},

			fetchCompanies: async () => {
				const { lastFetched, companies } = get();
				
				// Return cached companies if fetched recently
				if (companies.length > 0 && lastFetched && Date.now() - lastFetched < CACHE_DURATION) {
					// Still set selected company from localStorage if not set
					if (!get().selectedCompany) {
						const saved = typeof window !== 'undefined' 
							? localStorage.getItem('selectedCompany') 
							: null;
						if (saved) {
							try {
								const parsed = JSON.parse(saved);
								const exists = companies.find(c => c._id === parsed._id);
								if (exists) {
									set({ selectedCompany: exists });
								} else if (companies.length > 0) {
									set({ selectedCompany: companies[0] });
								}
							} catch (e) {
								if (companies.length > 0) {
									set({ selectedCompany: companies[0] });
								}
							}
						} else if (companies.length > 0) {
							set({ selectedCompany: companies[0] });
						}
					}
					return;
				}

				set({ isLoading: true, error: null });
				try {
					const response = await companyAPI.getAll();
					const fetchedCompanies = response.data.companies || [];
					
					set({ 
						companies: fetchedCompanies,
						lastFetched: Date.now(),
						isLoading: false
					});

					// Set selected company
					if (fetchedCompanies.length > 0) {
						const saved = typeof window !== 'undefined' 
							? localStorage.getItem('selectedCompany') 
							: null;
						
						if (saved) {
							try {
								const parsed = JSON.parse(saved);
								const exists = fetchedCompanies.find((c: Company) => c._id === parsed._id);
								if (exists) {
									set({ selectedCompany: exists });
								} else {
									set({ selectedCompany: fetchedCompanies[0] });
								}
							} catch (e) {
								set({ selectedCompany: fetchedCompanies[0] });
							}
						} else {
							set({ selectedCompany: fetchedCompanies[0] });
						}
					}
				} catch (error: any) {
					set({ 
						error: error.response?.data?.error || 'Failed to load companies',
						isLoading: false
					});
				}
			},

			addCompany: (company) => {
				set((state) => ({
					companies: [...state.companies, company],
					lastFetched: Date.now()
				}));
			},

			updateCompany: (id, updates) => {
				set((state) => ({
					companies: state.companies.map((c) =>
						c._id === id ? { ...c, ...updates } : c
					),
					selectedCompany: state.selectedCompany?._id === id
						? { ...state.selectedCompany, ...updates }
						: state.selectedCompany,
					lastFetched: Date.now()
				}));
			},

			removeCompany: (id) => {
				set((state) => ({
					companies: state.companies.filter((c) => c._id !== id),
					selectedCompany: state.selectedCompany?._id === id
						? null
						: state.selectedCompany,
					lastFetched: Date.now()
				}));
			},

			clearCache: () => {
				set({ 
					companies: [],
					selectedCompany: null,
					lastFetched: null
				});
			},
		}),
		{
			name: 'company-storage',
			partialize: (state) => ({
				companies: state.companies,
				selectedCompany: state.selectedCompany,
			}),
		}
	)
);


