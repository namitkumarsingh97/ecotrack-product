/**
 * Plan-aware messaging
 * Language matters more than logic - different plans see different messaging
 */

export type PlanType = 'starter' | 'pro' | 'enterprise';

export interface PlanMessaging {
	upgradePrompt: string;
	statusMessage: string;
	readinessMessage: string;
	enterpriseReady: string;
	auditReady: string;
}

export const PLAN_MESSAGING: Record<PlanType, PlanMessaging> = {
	starter: {
		upgradePrompt: "Upgrade to Pro to unlock enterprise-ready insights.",
		statusMessage: "Starter Plan",
		readinessMessage: "Getting started with ESG compliance",
		enterpriseReady: "Upgrade to Pro to unlock enterprise-ready insights.",
		auditReady: "Upgrade to Pro for audit-ready reporting."
	},
	pro: {
		upgradePrompt: "You're enterprise-ready.",
		statusMessage: "Pro Plan - Enterprise Ready",
		readinessMessage: "You're enterprise-ready.",
		enterpriseReady: "You're enterprise-ready.",
		auditReady: "Upgrade to Enterprise for fully audit-ready compliance."
	},
	enterprise: {
		upgradePrompt: "Fully audit-ready.",
		statusMessage: "Enterprise Plan - Fully Audit Ready",
		readinessMessage: "Fully audit-ready.",
		enterpriseReady: "Fully audit-ready.",
		auditReady: "Fully audit-ready."
	}
};

/**
 * Get plan-appropriate messaging
 */
export const getPlanMessaging = (plan: PlanType): PlanMessaging => {
	return PLAN_MESSAGING[plan] || PLAN_MESSAGING.starter;
};

/**
 * Get upgrade message for a specific plan
 */
export const getUpgradeMessage = (currentPlan: PlanType, targetPlan: PlanType): string => {
	if (currentPlan === 'starter' && targetPlan === 'pro') {
		return "Upgrade to Pro to unlock enterprise-ready insights.";
	}
	if (currentPlan === 'pro' && targetPlan === 'enterprise') {
		return "Upgrade to Enterprise for fully audit-ready compliance.";
	}
	if (currentPlan === 'starter' && targetPlan === 'enterprise') {
		return "Upgrade to Enterprise for fully audit-ready compliance.";
	}
	return PLAN_MESSAGING[currentPlan].upgradePrompt;
};

