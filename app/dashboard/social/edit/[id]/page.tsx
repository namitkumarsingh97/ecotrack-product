"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { metricsAPI } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { Users, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { useCompanyStore } from "@/stores";
import SocialFormTabs from "@/components/SocialFormTabs";

export default function EditSocialPage() {
	const router = useRouter();
	const params = useParams();
	const { t } = useTranslation();
	const { companies, selectedCompany, fetchCompanies } = useCompanyStore();
	const [formData, setFormData] = useState({
		period: "",
		companyId: "",
		// Tab 1: Workforce Demographics
		totalEmployeesPermanent: "",
		totalEmployeesContractual: "",
		femalePercentWorkforce: "",
		womenInManagementPercent: "",
		vulnerableGroupsRepresentation: "",
		// Tab 2: Employee Safety & Welfare
		accidentIncidents: "",
		nearMissIncidents: "",
		totalTrainingHoursPerEmployee: "",
		safetyDrillsConducted: "",
		healthSafetyPolicies: "",
		awarenessSessions: "",
		// Tab 3: Labor Practices & Compensation
		fairWagePolicyExists: false,
		fairWagePolicyDetails: "",
		medianRemuneration: "",
		payRatio: "",
		grievanceRedressalMechanism: "",
		// Tab 4: Human Rights & Inclusivity
		humanRightsTraining: "",
		accessibilityMeasures: false,
		accessibilityMeasuresDetails: "",
		antiHarassmentProcessExists: false,
		antiHarassmentProcessDetails: "",
		// Tab 5: Community & CSR
		csrSpend: "",
		csrSpendPercent: "",
		csrActivities: "",
		communityEngagementPrograms: "",
		impactAssessments: "",
		// Tab 6: Stakeholder Engagement
		keyStakeholderGroups: "",
		engagementFrequency: "",
		engagementType: "",
		communicationOutcomes: "",
		// Legacy fields
		totalEmployees: "",
		femaleEmployees: "",
		avgTrainingHours: "",
		workplaceIncidents: "",
		employeeTurnoverPercent: "",
	});
	const [loading, setLoading] = useState(false);
	const [metricLoading, setMetricLoading] = useState(true);

	useEffect(() => {
		fetchCompanies();
	}, [fetchCompanies]);

	useEffect(() => {
		if (params.id) {
			loadMetric(params.id as string);
		}
	}, [params.id]);

	const loadMetric = async (id: string) => {
		try {
			setMetricLoading(true);
			const response = await metricsAPI.getSocialById(id);
			const metric = response.data.metric;

			setFormData({
				period: metric.period || "",
				companyId: metric.companyId || "",
				// Tab 1
				totalEmployeesPermanent: metric.totalEmployeesPermanent?.toString() || "",
				totalEmployeesContractual: metric.totalEmployeesContractual?.toString() || "",
				femalePercentWorkforce: metric.femalePercentWorkforce?.toString() || "",
				womenInManagementPercent: metric.womenInManagementPercent?.toString() || "",
				vulnerableGroupsRepresentation: metric.vulnerableGroupsRepresentation || "",
				// Tab 2
				accidentIncidents: metric.accidentIncidents?.toString() || "",
				nearMissIncidents: metric.nearMissIncidents?.toString() || "",
				totalTrainingHoursPerEmployee: metric.totalTrainingHoursPerEmployee?.toString() || "",
				safetyDrillsConducted: metric.safetyDrillsConducted?.toString() || "",
				healthSafetyPolicies: metric.healthSafetyPolicies || "",
				awarenessSessions: metric.awarenessSessions || "",
				// Tab 3
				fairWagePolicyExists: metric.fairWagePolicyExists || false,
				fairWagePolicyDetails: metric.fairWagePolicyDetails || "",
				medianRemuneration: metric.medianRemuneration?.toString() || "",
				payRatio: metric.payRatio?.toString() || "",
				grievanceRedressalMechanism: metric.grievanceRedressalMechanism || "",
				// Tab 4
				humanRightsTraining: metric.humanRightsTraining || "",
				accessibilityMeasures: metric.accessibilityMeasures || false,
				accessibilityMeasuresDetails: metric.accessibilityMeasuresDetails || "",
				antiHarassmentProcessExists: metric.antiHarassmentProcessExists || false,
				antiHarassmentProcessDetails: metric.antiHarassmentProcessDetails || "",
				// Tab 5
				csrSpend: metric.csrSpend?.toString() || "",
				csrSpendPercent: metric.csrSpendPercent?.toString() || "",
				csrActivities: metric.csrActivities || "",
				communityEngagementPrograms: metric.communityEngagementPrograms || "",
				impactAssessments: metric.impactAssessments || "",
				// Tab 6
				keyStakeholderGroups: metric.keyStakeholderGroups || "",
				engagementFrequency: metric.engagementFrequency || "",
				engagementType: metric.engagementType || "",
				communicationOutcomes: metric.communicationOutcomes || "",
				// Legacy
				totalEmployees: metric.totalEmployees?.toString() || "",
				femaleEmployees: metric.femaleEmployees?.toString() || "",
				avgTrainingHours: metric.avgTrainingHours?.toString() || "",
				workplaceIncidents: metric.workplaceIncidents?.toString() || "",
				employeeTurnoverPercent: metric.employeeTurnoverPercent?.toString() || "",
			});
		} catch (error: any) {
			showToast.error(error.response?.data?.error || "Failed to load metric");
			router.push("/dashboard/social");
		} finally {
			setMetricLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const companyId = selectedCompany?._id || formData.companyId;
			if (!companyId) {
				showToast.error("Please select a company from the top navigation");
				return;
			}

			const data: any = {
				companyId: companyId,
				period: formData.period,
			};

			// Tab 1: Workforce Demographics
			if (formData.totalEmployeesPermanent) data.totalEmployeesPermanent = parseInt(formData.totalEmployeesPermanent);
			if (formData.totalEmployeesContractual) data.totalEmployeesContractual = parseInt(formData.totalEmployeesContractual);
			if (formData.femalePercentWorkforce) data.femalePercentWorkforce = parseFloat(formData.femalePercentWorkforce);
			if (formData.womenInManagementPercent) data.womenInManagementPercent = parseFloat(formData.womenInManagementPercent);
			if (formData.vulnerableGroupsRepresentation) data.vulnerableGroupsRepresentation = formData.vulnerableGroupsRepresentation;

			// Tab 2: Employee Safety & Welfare
			if (formData.accidentIncidents) data.accidentIncidents = parseInt(formData.accidentIncidents);
			if (formData.nearMissIncidents) data.nearMissIncidents = parseInt(formData.nearMissIncidents);
			if (formData.totalTrainingHoursPerEmployee) data.totalTrainingHoursPerEmployee = parseFloat(formData.totalTrainingHoursPerEmployee);
			if (formData.safetyDrillsConducted) data.safetyDrillsConducted = parseInt(formData.safetyDrillsConducted);
			if (formData.healthSafetyPolicies) data.healthSafetyPolicies = formData.healthSafetyPolicies;
			if (formData.awarenessSessions) data.awarenessSessions = formData.awarenessSessions;

			// Tab 3: Labor Practices & Compensation
			data.fairWagePolicyExists = formData.fairWagePolicyExists;
			if (formData.fairWagePolicyDetails) data.fairWagePolicyDetails = formData.fairWagePolicyDetails;
			if (formData.medianRemuneration) data.medianRemuneration = parseFloat(formData.medianRemuneration);
			if (formData.payRatio) data.payRatio = parseFloat(formData.payRatio);
			if (formData.grievanceRedressalMechanism) data.grievanceRedressalMechanism = formData.grievanceRedressalMechanism;

			// Tab 4: Human Rights & Inclusivity
			if (formData.humanRightsTraining) data.humanRightsTraining = formData.humanRightsTraining;
			data.accessibilityMeasures = formData.accessibilityMeasures;
			if (formData.accessibilityMeasuresDetails) data.accessibilityMeasuresDetails = formData.accessibilityMeasuresDetails;
			data.antiHarassmentProcessExists = formData.antiHarassmentProcessExists;
			if (formData.antiHarassmentProcessDetails) data.antiHarassmentProcessDetails = formData.antiHarassmentProcessDetails;

			// Tab 5: Community & CSR
			if (formData.csrSpend) data.csrSpend = parseFloat(formData.csrSpend);
			if (formData.csrSpendPercent) data.csrSpendPercent = parseFloat(formData.csrSpendPercent);
			if (formData.csrActivities) data.csrActivities = formData.csrActivities;
			if (formData.communityEngagementPrograms) data.communityEngagementPrograms = formData.communityEngagementPrograms;
			if (formData.impactAssessments) data.impactAssessments = formData.impactAssessments;

			// Tab 6: Stakeholder Engagement
			if (formData.keyStakeholderGroups) data.keyStakeholderGroups = formData.keyStakeholderGroups;
			if (formData.engagementFrequency) data.engagementFrequency = formData.engagementFrequency;
			if (formData.engagementType) data.engagementType = formData.engagementType;
			if (formData.communicationOutcomes) data.communicationOutcomes = formData.communicationOutcomes;

			// Legacy fields
			if (formData.totalEmployees) data.totalEmployees = parseInt(formData.totalEmployees);
			if (formData.femaleEmployees) data.femaleEmployees = parseInt(formData.femaleEmployees);
			if (formData.avgTrainingHours) data.avgTrainingHours = parseFloat(formData.avgTrainingHours);
			if (formData.workplaceIncidents) data.workplaceIncidents = parseInt(formData.workplaceIncidents);
			if (formData.employeeTurnoverPercent) data.employeeTurnoverPercent = parseFloat(formData.employeeTurnoverPercent);

			await metricsAPI.updateSocial(params.id as string, data);
			showToast.success(t("social.updateSuccess"));
			router.push("/dashboard/social");
		} catch (error: any) {
			showToast.error(error.response?.data?.error || t("common.error"));
		} finally {
			setLoading(false);
		}
	};

	if (metricLoading) {
		return (
			<DashboardLayout>
				<div className="text-center py-12">
					<div className="text-xs text-gray-500">Loading...</div>
				</div>
			</DashboardLayout>
		);
	}

	if (companies.length === 0 || !selectedCompany) {
		return (
			<DashboardLayout>
				<div className="text-center py-12">
					<Users className="mx-auto text-gray-400 mb-4" size={48} />
					<p className="text-gray-600 mb-4">{t("social.noCompany")}</p>
					<Link href="/dashboard/company" className="text-green-600 hover:underline">
						{t("social.goToCompany")}
					</Link>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="max-w-6xl mx-auto">
				<div className="mb-4">
					<Link
						href="/dashboard/social"
						className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 mb-2"
					>
						<ArrowLeft size={14} />
						{t("common.back")} {t("social.title")}
					</Link>
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-lg font-semibold text-gray-900 mb-0.5">{t("social.editMetric")}</h1>
							<p className="text-xs text-gray-600">{t("social.updateMetrics")}</p>
						</div>
						<div className="flex gap-2">
							<Link
								href="/dashboard/social"
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
								{loading ? t("common.loading") : t("common.update")}
							</button>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Period Selection */}
						<div className="pb-4 border-b border-gray-200">
							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">
									{t("dashboard.period")} *
								</label>
								<input
									type="text"
									required
									value={formData.period}
									onChange={(e) => setFormData({ ...formData, period: e.target.value })}
									className="w-full md:w-auto px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder="2026-Q1"
								/>
								<p className="text-xs text-gray-500 mt-0.5">{t("social.periodFormat") || "Format: YYYY-QN (e.g., 2026-Q1)"}</p>
							</div>
						</div>

						{/* Tab Form Component */}
						<SocialFormTabs
							formData={formData}
							setFormData={setFormData}
						/>
					</form>
				</div>
			</div>
		</DashboardLayout>
	);
}

