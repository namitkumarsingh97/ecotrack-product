import { useMemo } from "react";
import { useCompanyStore } from "@/stores";

export interface TrialStatus {
	isTrial: boolean;
	daysRemaining: number | null;
	trialEndDate: Date | null;
	isExpired: boolean;
	subscriptionStatus: 'trial' | 'active' | 'expired' | 'cancelled';
}

export const useTrialStatus = (): TrialStatus => {
	const { selectedCompany } = useCompanyStore();

	return useMemo(() => {
		if (!selectedCompany?.isTrial || !selectedCompany?.trialEndDate) {
			return {
				isTrial: false,
				daysRemaining: null,
				trialEndDate: null,
				isExpired: false,
				subscriptionStatus: selectedCompany?.subscriptionStatus || 'active'
			};
		}

		const now = new Date();
		const endDate = new Date(selectedCompany.trialEndDate);
		const diffTime = endDate.getTime() - now.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		const isExpired = diffDays <= 0;

		return {
			isTrial: true,
			daysRemaining: isExpired ? 0 : diffDays,
			trialEndDate: endDate,
			isExpired,
			subscriptionStatus: selectedCompany.subscriptionStatus || 'trial'
		};
	}, [selectedCompany]);
};

