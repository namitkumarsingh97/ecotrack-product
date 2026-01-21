"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { metricsAPI } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { Shield, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { useCompanyStore } from "@/stores";
import GovernanceFormTabs from "@/components/GovernanceFormTabs";

export default function CreateGovernancePage() {
	const router = useRouter();
	const { t } = useTranslation();
	const { companies, selectedCompany, fetchCompanies } = useCompanyStore();
	const [periods, setPeriods] = useState<string[]>([]);
	const [loadingPeriods, setLoadingPeriods] = useState(false);
	const [formData, setFormData] = useState({
		period: `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
		companyId: "",
		// Tab 1: Board & Leadership
		boardMembers: "",
		independentDirectors: "",
		boardDiversityPercent: "",
		esgCommitteeExists: false,
		esgCommitteeStructure: "",
		boardEsgDiscussionFrequency: "",
		// Tab 2: Policies & Ethics
		codeOfConductExists: false,
		codeOfConductDetails: "",
		antiCorruptionPolicy: false,
		antiCorruptionPolicyDetails: "",
		whistleblowerPolicyExists: false,
		whistleblowerPolicyDetails: "",
		// Tab 3: Risk Management
		identifiedEsgRisks: "",
		riskMitigationPlans: "",
		monitoringEscalationMechanisms: "",
		complianceViolations: "",
		auditResults: "",
		// Tab 4: Transparency & Reporting
		materialEsgRisksDisclosed: false,
		materialEsgRisksDetails: "",
		reportingGovernancePolicies: "",
		thirdPartyAuditExists: false,
		thirdPartyAuditDetails: "",
		// Tab 5: Supplier & Customer Governance
		supplierEsgGuidelinesExists: false,
		supplierEsgGuidelinesDetails: "",
		fairBusinessPractices: "",
		contractualGovernanceClauses: "",
		// Legacy fields
		dataPrivacyPolicy: false,
	});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetchCompanies();
		// Use selectedCompany from top navigation
		if (selectedCompany?._id && !formData.companyId) {
			setFormData((prev) => ({
				...prev,
				companyId: selectedCompany._id,
			}));
		} else if (companies.length > 0 && !formData.companyId && !selectedCompany) {
			// Fallback to first company if no selection
			setFormData((prev) => ({
				...prev,
				companyId: companies[0]._id,
			}));
		}
	}, [fetchCompanies, companies, selectedCompany]);

	useEffect(() => {
		const loadPeriods = async () => {
			setLoadingPeriods(true);
			try {
				const response = await metricsAPI.getPeriods();
				setPeriods(response.data.periods || []);
			} catch (error: any) {
				console.error('Failed to load periods:', error);
				showToast.error("Failed to load periods");
			} finally {
				setLoadingPeriods(false);
			}
		};
		loadPeriods();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const companyId = selectedCompany?._id;
			if (!companyId) {
				showToast.error("Please select a company from the top navigation");
				return;
			}

			// Prepare data - convert strings to numbers where needed
			const data: any = {
				companyId: companyId,
				period: formData.period,
			};

			// Tab 1: Board & Leadership
			if (formData.boardMembers) data.boardMembers = parseInt(formData.boardMembers);
			if (formData.independentDirectors) data.independentDirectors = parseInt(formData.independentDirectors);
			if (formData.boardDiversityPercent) data.boardDiversityPercent = parseFloat(formData.boardDiversityPercent);
			data.esgCommitteeExists = formData.esgCommitteeExists;
			if (formData.esgCommitteeStructure) data.esgCommitteeStructure = formData.esgCommitteeStructure;
			if (formData.boardEsgDiscussionFrequency) data.boardEsgDiscussionFrequency = formData.boardEsgDiscussionFrequency;

			// Tab 2: Policies & Ethics
			data.codeOfConductExists = formData.codeOfConductExists;
			if (formData.codeOfConductDetails) data.codeOfConductDetails = formData.codeOfConductDetails;
			data.antiCorruptionPolicy = formData.antiCorruptionPolicy;
			if (formData.antiCorruptionPolicyDetails) data.antiCorruptionPolicyDetails = formData.antiCorruptionPolicyDetails;
			data.whistleblowerPolicyExists = formData.whistleblowerPolicyExists;
			if (formData.whistleblowerPolicyDetails) data.whistleblowerPolicyDetails = formData.whistleblowerPolicyDetails;

			// Tab 3: Risk Management
			if (formData.identifiedEsgRisks) data.identifiedEsgRisks = formData.identifiedEsgRisks;
			if (formData.riskMitigationPlans) data.riskMitigationPlans = formData.riskMitigationPlans;
			if (formData.monitoringEscalationMechanisms) data.monitoringEscalationMechanisms = formData.monitoringEscalationMechanisms;
			if (formData.complianceViolations) data.complianceViolations = parseInt(formData.complianceViolations);
			if (formData.auditResults) data.auditResults = formData.auditResults;

			// Tab 4: Transparency & Reporting
			data.materialEsgRisksDisclosed = formData.materialEsgRisksDisclosed;
			if (formData.materialEsgRisksDetails) data.materialEsgRisksDetails = formData.materialEsgRisksDetails;
			if (formData.reportingGovernancePolicies) data.reportingGovernancePolicies = formData.reportingGovernancePolicies;
			data.thirdPartyAuditExists = formData.thirdPartyAuditExists;
			if (formData.thirdPartyAuditDetails) data.thirdPartyAuditDetails = formData.thirdPartyAuditDetails;

			// Tab 5: Supplier & Customer Governance
			data.supplierEsgGuidelinesExists = formData.supplierEsgGuidelinesExists;
			if (formData.supplierEsgGuidelinesDetails) data.supplierEsgGuidelinesDetails = formData.supplierEsgGuidelinesDetails;
			if (formData.fairBusinessPractices) data.fairBusinessPractices = formData.fairBusinessPractices;
			if (formData.contractualGovernanceClauses) data.contractualGovernanceClauses = formData.contractualGovernanceClauses;

			// Legacy fields
			data.dataPrivacyPolicy = formData.dataPrivacyPolicy;

			await metricsAPI.createGovernance(data);
			showToast.success(t("governance.saveSuccess"));
			router.push("/dashboard/governance");
		} catch (error: any) {
			showToast.error(error.response?.data?.error || t("common.error"));
		} finally {
			setLoading(false);
		}
	};

	if (companies.length === 0 || !selectedCompany) {
		return (
			<DashboardLayout>
				<div className="text-center py-12">
					<Shield className="mx-auto text-gray-400 mb-4" size={48} />
					<p className="text-gray-600 mb-4">{t("governance.noCompany")}</p>
					<p className="text-xs text-gray-500 mb-2">Please select a company from the top navigation or</p>
					<Link href="/dashboard/company" className="text-green-600 hover:underline">
						{t("governance.goToCompany")}
					</Link>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="px-4 md:px-6 lg:px-8">
				<div className="mb-4">
					<Link
						href="/dashboard/governance"
						className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 mb-2"
					>
						<ArrowLeft size={14} />
						{t("common.back")} {t("governance.title")}
					</Link>
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-center gap-4 flex-1">
							<div>
								<h1 className="text-lg font-semibold text-gray-900 mb-0.5">{t("governance.createMetric")}</h1>
								<p className="text-xs text-gray-600">{t("governance.addNewMetrics")}</p>
							</div>
							{/* Period Selection */}
							<div className="flex flex-col">
								<label className="block text-xs font-medium text-gray-700 mb-1">
									{t("dashboard.period")} *
								</label>
								<select
									required
									value={formData.period}
									onChange={(e) => setFormData({ ...formData, period: e.target.value })}
									disabled={loadingPeriods}
									className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
								>
									{loadingPeriods ? (
										<option value="">{t("common.loading")}...</option>
									) : periods.length > 0 ? (
										periods.map((period) => (
											<option key={period} value={period}>
												{period}
											</option>
										))
									) : (
										<option value={formData.period}>{formData.period}</option>
									)}
								</select>
							</div>
						</div>
						<div className="flex gap-2">
							<Link
								href="/dashboard/governance"
								className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded font-medium transition-colors"
							>
								{t("common.cancel")}
							</Link>
							<button
								onClick={(e) => {
									e.preventDefault();
									const form = document.querySelector('form');
									if (form) {
										form.requestSubmit();
									}
								}}
								disabled={loading}
								className="flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
							>
								<Save size={14} />
								{loading ? t("common.loading") : t("common.create")}
							</button>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
					<form onSubmit={handleSubmit} className="space-y-4">

						{/* Tab Form Component */}
						<GovernanceFormTabs
							formData={formData}
							setFormData={setFormData}
						/>
					</form>
				</div>
			</div>
		</DashboardLayout>
	);
}

