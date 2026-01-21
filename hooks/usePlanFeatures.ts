import { useMemo } from "react";
import { useUserStore } from "@/stores";

export interface PlanFeatures {
	// Dashboard & Tracking
	esgTrackingDashboard: boolean;
	unlimitedReportExports: boolean;
	yearOnYearComparison: boolean;
	multiYearTrendAnalysis: boolean;
	
	// Reports & Templates
	brsrCompliantTemplates: boolean;
	industrySpecificTemplates: boolean;
	customReportBranding: boolean;
	
	// Scoring & Analytics
	basicEsgScoring: boolean;
	advancedAnalytics: boolean;
	benchmarking: boolean;
	
	// Compliance
	complianceDeadlineAlerts: boolean;
	customComplianceFrameworks: boolean;
	
	// Support
	emailSupport: boolean;
	priorityEmailSupport: boolean;
	dedicatedAccountManager: boolean;
	dedicatedSuccessManager: boolean;
	trainingOnboardingSupport: boolean;
	support247: boolean;
	
	// Users & Access
	maxUsers: number; // -1 for unlimited
	apiAccess: boolean;
	
	// Enterprise Features
	whiteLabelOptions: boolean;
	customIntegrations: boolean;
	advancedSecuritySSO: boolean;
	onPremiseDeployment: boolean;
	customSLAGuarantees: boolean;
}

const PLAN_FEATURES: Record<"starter" | "pro" | "enterprise", PlanFeatures> = {
	starter: {
		esgTrackingDashboard: true,
		unlimitedReportExports: true,
		yearOnYearComparison: true,
		multiYearTrendAnalysis: false,
		brsrCompliantTemplates: true,
		industrySpecificTemplates: false,
		customReportBranding: false,
		basicEsgScoring: true,
		advancedAnalytics: false,
		benchmarking: false,
		complianceDeadlineAlerts: true,
		customComplianceFrameworks: false,
		emailSupport: true,
		priorityEmailSupport: false,
		dedicatedAccountManager: false,
		dedicatedSuccessManager: false,
		trainingOnboardingSupport: false,
		support247: false,
		maxUsers: 5,
		apiAccess: false,
		whiteLabelOptions: false,
		customIntegrations: false,
		advancedSecuritySSO: false,
		onPremiseDeployment: false,
		customSLAGuarantees: false,
	},
	pro: {
		esgTrackingDashboard: true,
		unlimitedReportExports: true,
		yearOnYearComparison: true,
		multiYearTrendAnalysis: true,
		brsrCompliantTemplates: true,
		industrySpecificTemplates: true,
		customReportBranding: true,
		basicEsgScoring: true,
		advancedAnalytics: true,
		benchmarking: true,
		complianceDeadlineAlerts: true,
		customComplianceFrameworks: false,
		emailSupport: true,
		priorityEmailSupport: true,
		dedicatedAccountManager: true,
		dedicatedSuccessManager: false,
		trainingOnboardingSupport: true,
		support247: false,
		maxUsers: 20,
		apiAccess: true,
		whiteLabelOptions: false,
		customIntegrations: false,
		advancedSecuritySSO: false,
		onPremiseDeployment: false,
		customSLAGuarantees: false,
	},
	enterprise: {
		esgTrackingDashboard: true,
		unlimitedReportExports: true,
		yearOnYearComparison: true,
		multiYearTrendAnalysis: true,
		brsrCompliantTemplates: true,
		industrySpecificTemplates: true,
		customReportBranding: true,
		basicEsgScoring: true,
		advancedAnalytics: true,
		benchmarking: true,
		complianceDeadlineAlerts: true,
		customComplianceFrameworks: true,
		emailSupport: true,
		priorityEmailSupport: true,
		dedicatedAccountManager: true,
		dedicatedSuccessManager: true,
		trainingOnboardingSupport: true,
		support247: true,
		maxUsers: -1, // Unlimited
		apiAccess: true,
		whiteLabelOptions: true,
		customIntegrations: true,
		advancedSecuritySSO: true,
		onPremiseDeployment: true,
		customSLAGuarantees: true,
	},
};

export const usePlanFeatures = () => {
	const { user } = useUserStore();
	
	const plan = (user?.plan || "starter") as "starter" | "pro" | "enterprise";
	const features = useMemo(() => PLAN_FEATURES[plan], [plan]);
	
	const hasFeature = (feature: keyof PlanFeatures): boolean => {
		return features[feature] === true || (typeof features[feature] === "number" && features[feature] > 0);
	};
	
	return {
		plan,
		features,
		hasFeature,
	};
};

