"use client";

import { useEffect, useState } from "react";
import { plansAPI } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { Check, X, Crown, Zap, Rocket, Info } from "lucide-react";
import { FEATURE_WHY_IT_MATTERS, getUpgradeReason } from "@/lib/upgradeReasons";

interface Plan {
	_id?: string;
	name: string;
	type: "starter" | "pro" | "enterprise";
	price: number;
	features: {
		esgTrackingDashboard: boolean;
		unlimitedReportExports: boolean;
		yearOnYearComparison: boolean;
		multiYearTrendAnalysis: boolean;
		brsrCompliantTemplates: boolean;
		industrySpecificTemplates: boolean;
		customReportBranding: boolean;
		basicEsgScoring: boolean;
		advancedAnalytics: boolean;
		benchmarking: boolean;
		complianceDeadlineAlerts: boolean;
		customComplianceFrameworks: boolean;
		emailSupport: boolean;
		priorityEmailSupport: boolean;
		dedicatedAccountManager: boolean;
		dedicatedSuccessManager: boolean;
		trainingOnboardingSupport: boolean;
		support247: boolean;
		maxUsers: number;
		apiAccess: boolean;
		whiteLabelOptions: boolean;
		customIntegrations: boolean;
		advancedSecuritySSO: boolean;
		onPremiseDeployment: boolean;
		customSLAGuarantees: boolean;
	};
}

interface PlanSelectorProps {
	currentPlan: "starter" | "pro" | "enterprise";
	onPlanChange?: (plan: "starter" | "pro" | "enterprise") => void;
	userRole?: string;
}

export default function PlanSelector({ currentPlan, onPlanChange, userRole }: PlanSelectorProps) {
	const [plans, setPlans] = useState<Plan[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro" | "enterprise">(currentPlan);

	useEffect(() => {
		loadPlans();
	}, []);

	const loadPlans = async () => {
		setLoading(true);
		try {
			const response = await plansAPI.getAll();
			setPlans(response.data.plans);
		} catch (error: any) {
			showToast.error("Failed to load plans");
		} finally {
			setLoading(false);
		}
	};

	const handlePlanSelect = async (planType: "starter" | "pro" | "enterprise") => {
		if (planType === selectedPlan) return;
		
		if (userRole !== "ADMIN") {
			showToast.error("Only admins can change plans");
			return;
		}

		setLoading(true);
		try {
			await plansAPI.updatePlan(planType);
			setSelectedPlan(planType);
			if (onPlanChange) {
				onPlanChange(planType);
			}
			showToast.success(`Plan changed to ${planType}`);
		} catch (error: any) {
			showToast.error(error.response?.data?.error || "Failed to update plan");
		} finally {
			setLoading(false);
		}
	};

	const getPlanIcon = (type: string) => {
		switch (type) {
			case "starter":
				return <Zap size={20} className="text-green-600" />;
			case "pro":
				return <Crown size={20} className="text-yellow-600" />;
			case "enterprise":
				return <Rocket size={20} className="text-purple-600" />;
			default:
				return null;
		}
	};

	const getPlanBadge = (type: string) => {
		if (type === "pro") {
			return (
				<span className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-semibold px-2 py-0.5 rounded-bl-lg rounded-tr-lg">
					Most Popular
				</span>
			);
		}
		return null;
	};

	if (loading && plans.length === 0) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
			{plans.map((plan) => {
				const isSelected = selectedPlan === plan.type;
				const isCurrent = currentPlan === plan.type;

				return (
					<div
						key={plan.type}
						className={`relative bg-white rounded-lg shadow-sm border-2 p-6 transition-all ${
							isSelected
								? "border-green-600 shadow-md"
								: "border-gray-200 hover:border-gray-300"
						} ${plan.type === "pro" ? "scale-105" : ""}`}
					>
						{getPlanBadge(plan.type)}
						
						<div className="flex items-center gap-2 mb-4">
							{getPlanIcon(plan.type)}
							<h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
						</div>

						<div className="mb-4">
							{plan.price === -1 ? (
								<div>
									<div className="text-2xl font-bold text-gray-900">Custom</div>
									<div className="text-sm text-gray-600">Contact Sales</div>
								</div>
							) : (
								<div>
									<span className="text-2xl font-bold text-gray-900">₹{plan.price.toLocaleString()}</span>
									<span className="text-sm text-gray-600">/month</span>
								</div>
							)}
						</div>

						{isCurrent && (
							<div className="mb-4 px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold text-center">
								Current Plan
							</div>
						)}

						{userRole === "ADMIN" && !isCurrent && (
							<button
								onClick={() => handlePlanSelect(plan.type)}
								disabled={loading}
								className="w-full mb-4 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
							>
								{loading ? "Updating..." : "Select Plan"}
							</button>
						)}

						{plan.type === "starter" && (
							<div className="space-y-2 text-xs text-gray-700">
								<div className="font-semibold text-gray-900 mb-2">Perfect for small businesses getting started with ESG compliance</div>
								<div className="space-y-1">
									<div className="flex items-center gap-2">
										<Check size={14} className="text-green-600 flex-shrink-0" />
										<span>Full ESG tracking dashboard</span>
									</div>
									<div className="flex items-center gap-2">
										<Check size={14} className="text-green-600 flex-shrink-0" />
										<span>Unlimited report exports (PDF & Excel)</span>
									</div>
									<div className="flex items-center gap-2">
										<Check size={14} className="text-green-600 flex-shrink-0" />
										<span>Year-on-year comparison</span>
									</div>
									<div className="flex items-center gap-2">
										<Check size={14} className="text-green-600 flex-shrink-0" />
										<span>Email support</span>
									</div>
									<div className="flex items-center gap-2">
										<Check size={14} className="text-green-600 flex-shrink-0" />
										<span>BRSR-compliant templates</span>
									</div>
									<div className="flex items-center gap-2">
										<Check size={14} className="text-green-600 flex-shrink-0" />
										<span>Basic ESG scoring</span>
									</div>
									<div className="flex items-center gap-2">
										<Check size={14} className="text-green-600 flex-shrink-0" />
										<span>Compliance deadline alerts</span>
									</div>
									<div className="flex items-center gap-2">
										<Check size={14} className="text-green-600 flex-shrink-0" />
										<span>Up to {plan.features.maxUsers} users</span>
									</div>
									<div className="flex items-center gap-2">
										<X size={14} className="text-gray-400 flex-shrink-0" />
										<span className="text-gray-500">No API access</span>
									</div>
									<div className="flex items-center gap-2">
										<X size={14} className="text-gray-400 flex-shrink-0" />
										<span className="text-gray-500">Standard support only</span>
									</div>
								</div>
							</div>
						)}

						{plan.type === "pro" && (
							<div className="space-y-2 text-xs text-gray-700">
								<div className="font-semibold text-gray-900 mb-2">For growing businesses that need advanced features and priority support</div>
								<div className="space-y-1">
									<div className="flex items-center gap-2">
										<Check size={14} className="text-green-600 flex-shrink-0" />
										<span>Everything in Starter</span>
									</div>
									<div className="flex items-start gap-2">
										<Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
										<div className="flex-1">
											<span>Advanced analytics & benchmarking</span>
											{FEATURE_WHY_IT_MATTERS.benchmarking && (
												<div className="text-xs text-gray-500 mt-0.5 italic">
													{FEATURE_WHY_IT_MATTERS.benchmarking}
												</div>
											)}
										</div>
									</div>
									<div className="flex items-start gap-2">
										<Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
										<div className="flex-1">
											<span>Industry-specific templates</span>
											{FEATURE_WHY_IT_MATTERS.industrySpecificTemplates && (
												<div className="text-xs text-gray-500 mt-0.5 italic">
													{FEATURE_WHY_IT_MATTERS.industrySpecificTemplates}
												</div>
											)}
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Check size={14} className="text-green-600 flex-shrink-0" />
										<span>Priority email support</span>
									</div>
									<div className="flex items-start gap-2">
										<Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
										<div className="flex-1">
											<span>API access</span>
											{FEATURE_WHY_IT_MATTERS.apiAccess && (
												<div className="text-xs text-gray-500 mt-0.5 italic">
													{FEATURE_WHY_IT_MATTERS.apiAccess}
												</div>
											)}
										</div>
									</div>
									<div className="flex items-start gap-2">
										<Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
										<div className="flex-1">
											<span>Custom report branding</span>
											{FEATURE_WHY_IT_MATTERS.customReportBranding && (
												<div className="text-xs text-gray-500 mt-0.5 italic">
													{FEATURE_WHY_IT_MATTERS.customReportBranding}
												</div>
											)}
										</div>
									</div>
									<div className="flex items-start gap-2">
										<Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
										<div className="flex-1">
											<span>Multi-year trend analysis</span>
											{FEATURE_WHY_IT_MATTERS.multiYearTrendAnalysis && (
												<div className="text-xs text-gray-500 mt-0.5 italic">
													{FEATURE_WHY_IT_MATTERS.multiYearTrendAnalysis}
												</div>
											)}
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Check size={14} className="text-green-600 flex-shrink-0" />
										<span>Up to {plan.features.maxUsers} users</span>
									</div>
									<div className="flex items-center gap-2">
										<Check size={14} className="text-green-600 flex-shrink-0" />
										<span>Dedicated account manager</span>
									</div>
									<div className="flex items-center gap-2">
										<Check size={14} className="text-green-600 flex-shrink-0" />
										<span>Training & onboarding support</span>
									</div>
								</div>
							</div>
						)}

						{plan.type === "enterprise" && (
							<div className="space-y-2 text-xs text-gray-700">
								<div className="font-semibold text-gray-900 mb-2">For large organizations with complex compliance needs</div>
								<div className="space-y-1">
									<div className="flex items-center gap-2">
										<Check size={14} className="text-green-600 flex-shrink-0" />
										<span>Everything in Pro</span>
									</div>
									<div className="flex items-center gap-2">
										<Check size={14} className="text-green-600 flex-shrink-0" />
										<span>Unlimited users</span>
									</div>
									<div className="flex items-start gap-2">
										<Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
										<div className="flex-1">
											<span>White-label options</span>
											{FEATURE_WHY_IT_MATTERS.whiteLabelOptions && (
												<div className="text-xs text-gray-500 mt-0.5 italic">
													{FEATURE_WHY_IT_MATTERS.whiteLabelOptions}
												</div>
											)}
										</div>
									</div>
									<div className="flex items-start gap-2">
										<Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
										<div className="flex-1">
											<span>Custom integrations</span>
											{FEATURE_WHY_IT_MATTERS.customIntegrations && (
												<div className="text-xs text-gray-500 mt-0.5 italic">
													{FEATURE_WHY_IT_MATTERS.customIntegrations}
												</div>
											)}
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Check size={14} className="text-green-600 flex-shrink-0" />
										<span>24/7 priority support</span>
									</div>
									<div className="flex items-center gap-2">
										<Check size={14} className="text-green-600 flex-shrink-0" />
										<span>Dedicated success manager</span>
									</div>
									<div className="flex items-center gap-2">
										<Check size={14} className="text-green-600 flex-shrink-0" />
										<span>Custom compliance frameworks</span>
									</div>
									<div className="flex items-center gap-2">
										<Check size={14} className="text-green-600 flex-shrink-0" />
										<span>Advanced security & SSO</span>
									</div>
									<div className="flex items-center gap-2">
										<Check size={14} className="text-green-600 flex-shrink-0" />
										<span>On-premise deployment option</span>
									</div>
									<div className="flex items-center gap-2">
										<Check size={14} className="text-green-600 flex-shrink-0" />
										<span>Custom SLA guarantees</span>
									</div>
								</div>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}

