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
	const [periods, setPeriods] = useState<string[]>([]);
	const [loadingPeriods, setLoadingPeriods] = useState(false);

	useEffect(() => {
		fetchCompanies();
	}, [fetchCompanies]);

	useEffect(() => {
		if (params.id) {
			loadMetric(params.id as string);
		}
	}, [params.id]);

	useEffect(() => {
		const loadPeriods = async () => {
			setLoadingPeriods(true);
			try {
				const response = await metricsAPI.getPeriods();
				const loadedPeriods = response.data.periods || [];
				
				// If formData.period exists and is not in the list, add it
				if (formData.period && !loadedPeriods.includes(formData.period)) {
					loadedPeriods.push(formData.period);
					loadedPeriods.sort().reverse(); // Sort descending
				}
				
				setPeriods(loadedPeriods);
			} catch (error: any) {
				console.error('Failed to load periods:', error);
				showToast.error("Failed to load periods");
			} finally {
				setLoadingPeriods(false);
			}
		};
		loadPeriods();
	}, [formData.period]);

	const loadMetric = async (id: string) => {
		try {
			setMetricLoading(true);
			const response = await metricsAPI.getSocialById(id);
			const metric = response.data.metric;

			if (!metric) {
				showToast.error("Metric not found");
				router.push("/dashboard/social");
				return;
			}

			// Helper function to safely convert number to string
			const numToString = (value: any): string => {
				if (value === null || value === undefined) return "";
				if (typeof value === "number") return value.toString();
				return String(value);
			};

			// Helper function to safely convert ObjectId to string
			const idToString = (value: any): string => {
				if (!value) return "";
				if (typeof value === "object" && value.toString) return value.toString();
				return String(value);
			};

			const periodValue = metric.period || "";
			
			// Ensure the period from backend is in the periods list
			if (periodValue && !periods.includes(periodValue)) {
				setPeriods((prev) => {
					const updated = [...prev, periodValue];
					return updated.sort().reverse(); // Sort descending
				});
			}

			setFormData({
				period: periodValue,
				companyId: idToString(metric.companyId),
				// Tab 1
				totalEmployeesPermanent: numToString(metric.totalEmployeesPermanent),
				totalEmployeesContractual: numToString(metric.totalEmployeesContractual),
				femalePercentWorkforce: numToString(metric.femalePercentWorkforce),
				womenInManagementPercent: numToString(metric.womenInManagementPercent),
				vulnerableGroupsRepresentation: metric.vulnerableGroupsRepresentation || "",
				// Tab 2
				accidentIncidents: numToString(metric.accidentIncidents),
				nearMissIncidents: numToString(metric.nearMissIncidents),
				totalTrainingHoursPerEmployee: numToString(metric.totalTrainingHoursPerEmployee),
				safetyDrillsConducted: numToString(metric.safetyDrillsConducted),
				healthSafetyPolicies: metric.healthSafetyPolicies || "",
				awarenessSessions: metric.awarenessSessions || "",
				// Tab 3
				fairWagePolicyExists: Boolean(metric.fairWagePolicyExists),
				fairWagePolicyDetails: metric.fairWagePolicyDetails || "",
				medianRemuneration: numToString(metric.medianRemuneration),
				payRatio: numToString(metric.payRatio),
				grievanceRedressalMechanism: metric.grievanceRedressalMechanism || "",
				// Tab 4
				humanRightsTraining: metric.humanRightsTraining || "",
				accessibilityMeasures: Boolean(metric.accessibilityMeasures),
				accessibilityMeasuresDetails: metric.accessibilityMeasuresDetails || "",
				antiHarassmentProcessExists: Boolean(metric.antiHarassmentProcessExists),
				antiHarassmentProcessDetails: metric.antiHarassmentProcessDetails || "",
				// Tab 5
				csrSpend: numToString(metric.csrSpend),
				csrSpendPercent: numToString(metric.csrSpendPercent),
				csrActivities: metric.csrActivities || "",
				communityEngagementPrograms: metric.communityEngagementPrograms || "",
				impactAssessments: metric.impactAssessments || "",
				// Tab 6
				keyStakeholderGroups: metric.keyStakeholderGroups || "",
				engagementFrequency: metric.engagementFrequency || "",
				engagementType: metric.engagementType || "",
				communicationOutcomes: metric.communicationOutcomes || "",
				// Legacy
				totalEmployees: numToString(metric.totalEmployees),
				femaleEmployees: numToString(metric.femaleEmployees),
				avgTrainingHours: numToString(metric.avgTrainingHours),
				workplaceIncidents: numToString(metric.workplaceIncidents),
				employeeTurnoverPercent: numToString(metric.employeeTurnoverPercent),
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
				<div className="flex items-center justify-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
			<div className="px-4 md:px-6 lg:px-8">
				<div className="mb-4">
					<Link
						href="/dashboard/social"
						className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 mb-2"
					>
						<ArrowLeft size={14} />
						{t("common.back")} {t("social.title")}
					</Link>
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-center gap-4 flex-1">
							<div>
								<h1 className="text-lg font-semibold text-gray-900 mb-0.5">{t("social.editMetric")}</h1>
								<p className="text-xs text-gray-600">{t("social.updateMetrics")}</p>
							</div>
							{/* Period Selection */}
							<div className="flex flex-col">
								<label className="block text-xs font-medium text-gray-700 mb-1">
									{t("dashboard.period")} *
								</label>
								<select
									required
									value={formData.period || ""}
									onChange={(e) => setFormData({ ...formData, period: e.target.value })}
									disabled={loadingPeriods || metricLoading}
									className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
								>
									{loadingPeriods || metricLoading ? (
										<option value="">{t("common.loading")}...</option>
									) : periods.length > 0 ? (
										<>
											{!formData.period && <option value="">Select period</option>}
											{periods.map((period) => (
												<option key={period} value={period}>
													{period}
												</option>
											))}
											{formData.period && !periods.includes(formData.period) && (
												<option value={formData.period}>{formData.period}</option>
											)}
										</>
									) : formData.period ? (
										<option value={formData.period}>{formData.period}</option>
									) : (
										<option value="">No periods available</option>
									)}
								</select>
							</div>
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

