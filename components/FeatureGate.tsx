"use client";

import { ReactNode } from "react";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";
import { Lock, Crown, TrendingUp, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { getUpgradeReason, FEATURE_WHY_IT_MATTERS } from "@/lib/upgradeReasons";
import { getPlanMessaging } from "@/lib/planMessaging";

interface FeatureGateProps {
	feature: keyof ReturnType<typeof usePlanFeatures>["features"];
	children: ReactNode;
	fallback?: ReactNode;
	showUpgrade?: boolean;
}

export default function FeatureGate({ feature, children, fallback, showUpgrade = true }: FeatureGateProps) {
	const { hasFeature, plan } = usePlanFeatures();
	const planMessaging = getPlanMessaging(plan);

	if (hasFeature(feature)) {
		return <>{children}</>;
	}

	if (fallback) {
		return <>{fallback}</>;
	}

	const upgradeReason = getUpgradeReason(feature);
	const whyItMatters = FEATURE_WHY_IT_MATTERS[feature] || "Available in higher plans";
	
	const featureInfo: {
		feature: string;
		whyItMatters: string;
		businessImpact: string;
		riskAvoided: string;
		valueUnlocked: string;
		requiredPlan: "Pro" | "Enterprise";
	} = upgradeReason || {
		feature: "Premium Feature",
		whyItMatters: whyItMatters,
		businessImpact: "This feature is available in higher plans.",
		riskAvoided: "Upgrade to unlock this feature.",
		valueUnlocked: "Get access to advanced capabilities.",
		requiredPlan: (plan === "starter" ? "Pro" : "Enterprise") as "Pro" | "Enterprise"
	};

	// Create concise versions of messages
	const conciseImpact = featureInfo.businessImpact.length > 60 
		? featureInfo.businessImpact.substring(0, 57) + "..."
		: featureInfo.businessImpact;
	const conciseRisk = featureInfo.riskAvoided.length > 60
		? featureInfo.riskAvoided.substring(0, 57) + "..."
		: featureInfo.riskAvoided;
	const conciseValue = featureInfo.valueUnlocked.length > 60
		? featureInfo.valueUnlocked.substring(0, 57) + "..."
		: featureInfo.valueUnlocked;

	return (
		<div className="relative w-full h-full min-h-[200px] overflow-hidden">
			<div className="opacity-50 pointer-events-none w-full h-full">{children}</div>
			<div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-95 rounded-lg border-2 border-gray-200 z-10 overflow-hidden">
				<div className="text-center p-2.5 max-w-sm w-full mx-auto">
					<div className="flex items-center justify-center gap-1.5 mb-2">
						<Lock size={18} className="text-gray-400" />
						<h3 className="text-xs font-semibold text-gray-900">{featureInfo.feature}</h3>
					</div>
					
					{/* Why It Matters - Quick Reference */}
					<div className="mb-1.5 p-1.5 bg-gray-100 rounded">
						<p className="text-[10px] font-semibold text-gray-900 mb-0.5">Why it matters:</p>
						<p className="text-[10px] text-gray-700 leading-tight">{featureInfo.whyItMatters}</p>
					</div>
					
					{/* Business Impact */}
					<div className="mb-1.5 p-1.5 bg-green-50 rounded border border-green-200">
						<div className="flex items-start gap-1.5">
							<Zap size={12} className="text-green-600 mt-0.5 flex-shrink-0" />
							<p className="text-[10px] text-gray-700 text-left leading-tight">{conciseImpact}</p>
						</div>
					</div>

					{/* Risk Avoided */}
					<div className="mb-1.5 p-1.5 bg-orange-50 rounded border border-orange-200">
						<div className="flex items-start gap-1.5">
							<Shield size={12} className="text-orange-600 mt-0.5 flex-shrink-0" />
							<p className="text-[10px] text-gray-700 text-left leading-tight">{conciseRisk}</p>
						</div>
					</div>

					{/* Value Unlocked */}
					<div className="mb-2 p-1.5 bg-blue-50 rounded border border-blue-200">
						<div className="flex items-start gap-1.5">
							<TrendingUp size={12} className="text-blue-600 mt-0.5 flex-shrink-0" />
							<p className="text-[10px] text-gray-700 text-left leading-tight">{conciseValue}</p>
						</div>
					</div>

					{/* Plan-aware messaging */}
					<div className="mb-2 p-1.5 bg-gray-50 rounded border border-gray-200">
						<p className="text-[10px] font-semibold text-gray-900 text-center">
							{planMessaging.upgradePrompt}
						</p>
					</div>

					{showUpgrade && (
						<Link
							href="/dashboard/settings?tab=plans"
							className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-600 text-white rounded text-[10px] font-medium hover:bg-green-700 transition-colors"
						>
							<Crown size={10} />
							Upgrade to {featureInfo.requiredPlan}
						</Link>
					)}
				</div>
			</div>
		</div>
	);
}
