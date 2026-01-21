/**
 * Upgrade Reason Mapping
 * Centralized mapping of features to business value propositions
 * Used in FeatureGate, Pricing page, and Sales materials
 */

export interface UpgradeReason {
	feature: string;
	whyItMatters: string;
	businessImpact: string;
	riskAvoided: string;
	valueUnlocked: string;
	requiredPlan: "Pro" | "Enterprise";
	category: "Analytics" | "Integration" | "Support" | "Compliance" | "Branding" | "Security";
}

export const UPGRADE_REASONS: Record<string, UpgradeReason> = {
	// Analytics & Reporting
	multiYearTrendAnalysis: {
		feature: "Multi-Year Trend Analysis",
		whyItMatters: "Required by investors",
		businessImpact: "Multi-year trends help you answer investor & client ESG questions faster.",
		riskAvoided: "Without trend analysis, you may struggle to demonstrate ESG progress to stakeholders.",
		valueUnlocked: "Show continuous improvement and build trust with enterprise clients.",
		requiredPlan: "Pro",
		category: "Analytics"
	},
	advancedAnalytics: {
		feature: "Advanced Analytics",
		whyItMatters: "Increases audit confidence for large enterprises",
		businessImpact: "Advanced analytics increases audit confidence for large enterprises.",
		riskAvoided: "Missing advanced insights can delay enterprise deals and reduce competitive advantage.",
		valueUnlocked: "Unlock deeper insights that help you win enterprise contracts.",
		requiredPlan: "Pro",
		category: "Analytics"
	},
	benchmarking: {
		feature: "Industry Benchmarking",
		whyItMatters: "Helps win enterprise deals",
		businessImpact: "Benchmarking helps you understand where you stand vs competitors.",
		riskAvoided: "Without benchmarking, you can't identify improvement opportunities or competitive gaps.",
		valueUnlocked: "Position your company as an ESG leader in your industry.",
		requiredPlan: "Pro",
		category: "Analytics"
	},

	// Integration & Automation
	apiAccess: {
		feature: "API Access",
		whyItMatters: "Needed for large clients",
		businessImpact: "API access automates data collection and integrates with your existing systems.",
		riskAvoided: "Manual data entry increases errors and delays reporting cycles.",
		valueUnlocked: "Save 10+ hours per month with automated data sync and integrations.",
		requiredPlan: "Pro",
		category: "Integration"
	},
	customIntegrations: {
		feature: "Custom Integrations",
		whyItMatters: "Required for enterprise IT infrastructure",
		businessImpact: "Custom integrations connect ESG data with your ERP, accounting, and other systems.",
		riskAvoided: "Manual data transfer increases errors and delays critical reporting deadlines.",
		valueUnlocked: "Eliminate data silos and create a single source of truth for ESG data.",
		requiredPlan: "Enterprise",
		category: "Integration"
	},

	// Branding & Presentation
	customReportBranding: {
		feature: "Custom Report Branding",
		whyItMatters: "Client-facing credibility",
		businessImpact: "Branded reports strengthen your company's professional image with clients.",
		riskAvoided: "Unbranded reports look unprofessional and reduce client confidence.",
		valueUnlocked: "Present ESG data in a way that matches your brand identity.",
		requiredPlan: "Pro",
		category: "Branding"
	},
	whiteLabelOptions: {
		feature: "White-Label Options",
		whyItMatters: "Enables ESG as a service offering",
		businessImpact: "White-labeling lets you present ESG data under your own brand to clients.",
		riskAvoided: "Without white-labeling, you can't offer ESG services as your own product.",
		valueUnlocked: "Monetize ESG reporting as a value-added service to your clients.",
		requiredPlan: "Enterprise",
		category: "Branding"
	},

	// Templates & Compliance
	industrySpecificTemplates: {
		feature: "Industry-Specific Templates",
		whyItMatters: "Ensures sector compliance",
		businessImpact: "Industry templates save time and ensure compliance with sector-specific requirements.",
		riskAvoided: "Generic templates may miss critical industry-specific ESG requirements.",
		valueUnlocked: "Reduce reporting time by 40% with pre-built industry templates.",
		requiredPlan: "Pro",
		category: "Compliance"
	},
	customComplianceFrameworks: {
		feature: "Custom Compliance Frameworks",
		whyItMatters: "Meets specific regulatory requirements",
		businessImpact: "Custom frameworks align with your specific regulatory and client requirements.",
		riskAvoided: "Generic frameworks may not meet all your compliance needs, creating audit risks.",
		valueUnlocked: "Ensure 100% compliance with your specific regulatory requirements.",
		requiredPlan: "Enterprise",
		category: "Compliance"
	},

	// Support & Training
	dedicatedAccountManager: {
		feature: "Dedicated Account Manager",
		whyItMatters: "Maximizes platform ROI",
		businessImpact: "A dedicated manager ensures you get maximum value from your ESG platform.",
		riskAvoided: "Without dedicated support, you may miss optimization opportunities and best practices.",
		valueUnlocked: "Get personalized guidance to improve your ESG scores faster.",
		requiredPlan: "Pro",
		category: "Support"
	},
	trainingOnboardingSupport: {
		feature: "Training & Onboarding",
		whyItMatters: "Ensures correct adoption",
		businessImpact: "Expert training helps your team adopt ESG practices quickly and correctly.",
		riskAvoided: "Without proper training, your team may make errors that affect compliance scores.",
		valueUnlocked: "Ensure your team is fully trained and maximizing platform value.",
		requiredPlan: "Pro",
		category: "Support"
	},
	support247: {
		feature: "24/7 Priority Support",
		whyItMatters: "Critical for enterprise operations",
		businessImpact: "24/7 support ensures issues are resolved immediately, even during off-hours.",
		riskAvoided: "Delayed support during critical periods can impact compliance deadlines and client deliverables.",
		valueUnlocked: "Get instant help when you need it, ensuring zero disruption to your operations.",
		requiredPlan: "Enterprise",
		category: "Support"
	},
	dedicatedSuccessManager: {
		feature: "Dedicated Success Manager",
		whyItMatters: "Strategic ESG improvement",
		businessImpact: "A success manager ensures you achieve maximum ROI and ESG score improvements.",
		riskAvoided: "Without dedicated success support, you may not realize the full potential of the platform.",
		valueUnlocked: "Get strategic guidance to continuously improve your ESG performance and scores.",
		requiredPlan: "Enterprise",
		category: "Support"
	},

	// Security & Infrastructure
	advancedSecuritySSO: {
		feature: "Advanced Security & SSO",
		whyItMatters: "Required for enterprise IT audits",
		businessImpact: "SSO and advanced security meet enterprise IT requirements and reduce access risks.",
		riskAvoided: "Without SSO, you may fail enterprise security audits and lose large deals.",
		valueUnlocked: "Meet enterprise security standards and pass IT audits seamlessly.",
		requiredPlan: "Enterprise",
		category: "Security"
	},
	onPremiseDeployment: {
		feature: "On-Premise Deployment",
		whyItMatters: "Meets data residency requirements",
		businessImpact: "On-premise deployment meets strict data residency and security requirements.",
		riskAvoided: "Cloud-only solutions may be rejected by enterprises with strict data policies.",
		valueUnlocked: "Deploy ESG platform within your own infrastructure for maximum control.",
		requiredPlan: "Enterprise",
		category: "Security"
	},
	customSLAGuarantees: {
		feature: "Custom SLA Guarantees",
		whyItMatters: "Ensures enterprise uptime",
		businessImpact: "Custom SLAs ensure uptime and support levels required for enterprise operations.",
		riskAvoided: "Without SLAs, platform downtime could delay critical ESG reporting deadlines.",
		valueUnlocked: "Get guaranteed uptime and support levels for mission-critical ESG operations.",
		requiredPlan: "Enterprise",
		category: "Security"
	}
};

/**
 * Get upgrade reason for a feature
 */
export const getUpgradeReason = (feature: string): UpgradeReason | null => {
	return UPGRADE_REASONS[feature] || null;
};

/**
 * Get all upgrade reasons by category
 */
export const getUpgradeReasonsByCategory = (category: UpgradeReason["category"]): UpgradeReason[] => {
	return Object.values(UPGRADE_REASONS).filter(reason => reason.category === category);
};

/**
 * Get all upgrade reasons by plan
 */
export const getUpgradeReasonsByPlan = (plan: "Pro" | "Enterprise"): UpgradeReason[] => {
	return Object.values(UPGRADE_REASONS).filter(reason => reason.requiredPlan === plan);
};

/**
 * Get simple feature-to-reason mapping for quick reference
 */
export const FEATURE_WHY_IT_MATTERS: Record<string, string> = {
	multiYearTrendAnalysis: "Required by investors",
	advancedAnalytics: "Increases audit confidence for large enterprises",
	benchmarking: "Helps win enterprise deals",
	apiAccess: "Needed for large clients",
	customReportBranding: "Client-facing credibility",
	whiteLabelOptions: "Enables ESG as a service offering",
	industrySpecificTemplates: "Ensures sector compliance",
	customComplianceFrameworks: "Meets specific regulatory requirements",
	dedicatedAccountManager: "Maximizes platform ROI",
	trainingOnboardingSupport: "Ensures correct adoption",
	support247: "Critical for enterprise operations",
	dedicatedSuccessManager: "Strategic ESG improvement",
	advancedSecuritySSO: "Required for enterprise IT audits",
	onPremiseDeployment: "Meets data residency requirements",
	customIntegrations: "Required for enterprise IT infrastructure",
	customSLAGuarantees: "Ensures enterprise uptime"
};

