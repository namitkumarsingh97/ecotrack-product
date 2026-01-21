"use client";

import { useTrialStatus } from "@/hooks/useTrialStatus";
import { useCompanyStore } from "@/stores";
import { useTranslation } from "@/hooks/useTranslation";
import { AlertCircle, Clock, CreditCard } from "lucide-react";
import Link from "next/link";

export default function TrialBanner() {
	const { selectedCompany } = useCompanyStore();
	const trialStatus = useTrialStatus();
	const { t } = useTranslation();

	// Only show for Pro plan on trial
	if (!trialStatus.isTrial || selectedCompany?.plan !== "pro") {
		return null;
	}

	if (trialStatus.isExpired) {
		return (
			<div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4">
				<div className="flex items-center gap-2">
					<AlertCircle size={16} className="text-red-600 flex-shrink-0" />
					<div className="flex-1">
						<p className="text-xs font-semibold text-red-900">
							{t("admin.trial.trialExpired")}
						</p>
						<p className="text-xs text-red-700 mt-0.5">
							{t("admin.trial.trialEnded")}
						</p>
					</div>
					<Link
						href="/dashboard/settings?tab=plans"
						className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
					>
						{t("admin.trial.upgradeToContinue")}
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mb-4">
			<div className="flex items-center gap-2">
				<Clock size={16} className="text-yellow-600 flex-shrink-0" />
				<div className="flex-1">
					<p className="text-xs font-semibold text-yellow-900">
						{t("admin.trial.trialActive")} - {trialStatus.daysRemaining} {trialStatus.daysRemaining === 1 ? "day" : "days"} {t("common.left")}
					</p>
					<p className="text-xs text-yellow-700 mt-0.5">
						Trial ends on {trialStatus.trialEndDate?.toLocaleDateString()}
					</p>
				</div>
				<Link
					href="/dashboard/settings?tab=plans"
					className="flex items-center gap-1 px-3 py-1 bg-yellow-600 text-white rounded text-xs font-medium hover:bg-yellow-700 transition-colors"
				>
					<CreditCard size={12} />
					{t("admin.trial.convertToPaid")}
				</Link>
			</div>
		</div>
	);
}

