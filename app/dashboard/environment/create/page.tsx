"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { companyAPI, metricsAPI } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { Leaf, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { useCompanyStore } from "@/stores";
import EnvironmentFormTabs from "@/components/EnvironmentFormTabs";

export default function CreateEnvironmentPage() {
	const router = useRouter();
	const { t } = useTranslation();
	const { companies, selectedCompany, fetchCompanies } = useCompanyStore();
	const [formData, setFormData] = useState({
		period: `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
		companyId: "",
		// Tab 1: Energy & Emissions
		totalEnergyConsumption: "",
		electricityKwh: "",
		fuelLitres: "",
		renewableEnergyPercent: "",
		nonRenewableEnergyPercent: "",
		scope1Emissions: "",
		scope2Emissions: "",
		scope3Emissions: "",
		emissionsIntensity: "",
		// Tab 2: Water & Waste
		waterUsageKL: "",
		waterSourceSurface: "",
		waterSourceGroundwater: "",
		waterSourceMunicipal: "",
		waterSourceOther: "",
		totalWasteTonnes: "",
		hazardousWasteTonnes: "",
		nonHazardousWasteTonnes: "",
		recycledWasteTonnes: "",
		divertedFromDisposalTonnes: "",
		wastewaterTreatmentMetrics: "",
		waterReuseRecyclingPractices: "",
		// Tab 3: Resource Efficiency
		recyclingInitiatives: "",
		materialsReuse: "",
		energySavingsPrograms: "",
		waterEfficiencyImprovements: "",
		// Tab 4: Policies & Compliance
		environmentalPolicyExists: false,
		environmentalPolicyDocument: "",
		complianceWithLocalLaws: false,
		environmentalRiskAssessments: false,
		riskAssessmentDetails: "",
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			// Use selectedCompany from top navigation, fallback to formData.companyId
			const companyId = selectedCompany?._id || formData.companyId;
			if (!companyId) {
				showToast.error("Please select a company from the top navigation");
				return;
			}

			// Prepare data - convert strings to numbers where needed
			const data: any = {
				companyId: companyId,
				period: formData.period,
			};

			// Tab 1: Energy & Emissions
			if (formData.totalEnergyConsumption) data.totalEnergyConsumption = parseFloat(formData.totalEnergyConsumption);
			if (formData.electricityKwh) data.electricityKwh = parseFloat(formData.electricityKwh);
			if (formData.fuelLitres) data.fuelLitres = parseFloat(formData.fuelLitres);
			if (formData.renewableEnergyPercent) data.renewableEnergyPercent = parseFloat(formData.renewableEnergyPercent);
			if (formData.nonRenewableEnergyPercent) data.nonRenewableEnergyPercent = parseFloat(formData.nonRenewableEnergyPercent);
			if (formData.scope1Emissions) data.scope1Emissions = parseFloat(formData.scope1Emissions);
			if (formData.scope2Emissions) data.scope2Emissions = parseFloat(formData.scope2Emissions);
			if (formData.scope3Emissions) data.scope3Emissions = parseFloat(formData.scope3Emissions);
			if (formData.emissionsIntensity) data.emissionsIntensity = parseFloat(formData.emissionsIntensity);

			// Tab 2: Water & Waste
			if (formData.waterUsageKL) data.waterUsageKL = parseFloat(formData.waterUsageKL);
			if (formData.waterSourceSurface) data.waterSourceSurface = parseFloat(formData.waterSourceSurface);
			if (formData.waterSourceGroundwater) data.waterSourceGroundwater = parseFloat(formData.waterSourceGroundwater);
			if (formData.waterSourceMunicipal) data.waterSourceMunicipal = parseFloat(formData.waterSourceMunicipal);
			if (formData.waterSourceOther) data.waterSourceOther = parseFloat(formData.waterSourceOther);
			if (formData.totalWasteTonnes) data.totalWasteTonnes = parseFloat(formData.totalWasteTonnes);
			if (formData.hazardousWasteTonnes) data.hazardousWasteTonnes = parseFloat(formData.hazardousWasteTonnes);
			if (formData.nonHazardousWasteTonnes) data.nonHazardousWasteTonnes = parseFloat(formData.nonHazardousWasteTonnes);
			if (formData.recycledWasteTonnes) data.recycledWasteTonnes = parseFloat(formData.recycledWasteTonnes);
			if (formData.divertedFromDisposalTonnes) data.divertedFromDisposalTonnes = parseFloat(formData.divertedFromDisposalTonnes);
			if (formData.wastewaterTreatmentMetrics) data.wastewaterTreatmentMetrics = formData.wastewaterTreatmentMetrics;
			if (formData.waterReuseRecyclingPractices) data.waterReuseRecyclingPractices = formData.waterReuseRecyclingPractices;

			// Tab 3: Resource Efficiency
			if (formData.recyclingInitiatives) data.recyclingInitiatives = formData.recyclingInitiatives;
			if (formData.materialsReuse) data.materialsReuse = formData.materialsReuse;
			if (formData.energySavingsPrograms) data.energySavingsPrograms = formData.energySavingsPrograms;
			if (formData.waterEfficiencyImprovements) data.waterEfficiencyImprovements = formData.waterEfficiencyImprovements;

			// Tab 4: Policies & Compliance
			data.environmentalPolicyExists = formData.environmentalPolicyExists;
			if (formData.environmentalPolicyDocument) data.environmentalPolicyDocument = formData.environmentalPolicyDocument;
			data.complianceWithLocalLaws = formData.complianceWithLocalLaws;
			data.environmentalRiskAssessments = formData.environmentalRiskAssessments;
			if (formData.riskAssessmentDetails) data.riskAssessmentDetails = formData.riskAssessmentDetails;

			await metricsAPI.createEnvironmental(data);
			showToast.success(t("environment.saveSuccess"));
			router.push("/dashboard/environment");
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
					<Leaf className="mx-auto text-gray-400 mb-4" size={48} />
					<p className="text-gray-600 mb-4">{t("environment.noCompany")}</p>
					<p className="text-xs text-gray-500 mb-2">Please select a company from the top navigation or</p>
					<Link href="/dashboard/company" className="text-green-600 hover:underline">
						{t("environment.goToCompany")}
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
						href="/dashboard/environment"
						className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 mb-2"
					>
						<ArrowLeft size={14} />
						{t("common.back")} {t("environment.title")}
					</Link>
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-lg font-semibold text-gray-900 mb-0.5">{t("environment.createMetric")}</h1>
							<p className="text-xs text-gray-600">{t("environment.addNewMetrics")}</p>
						</div>
						<div className="flex gap-2">
							<Link
								href="/dashboard/environment"
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
									className="w-full md:w-auto px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder="2026-Q1"
								/>
								<p className="text-xs text-gray-500 mt-0.5">{t("environment.periodFormat")}</p>
							</div>
						</div>

						{/* Tab Form Component */}
						<EnvironmentFormTabs
							formData={formData}
							setFormData={setFormData}
							companies={companies}
						/>
					</form>
				</div>
			</div>
		</DashboardLayout>
	);
}

