"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { metricsAPI } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { Leaf, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import EnvironmentFormTabs from "@/components/EnvironmentFormTabs";

export default function EditEnvironmentPage() {
	const router = useRouter();
	const params = useParams();
	const { t } = useTranslation();
	const id = params.id as string;
	const [formData, setFormData] = useState({
		period: "",
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
		// Legacy fields for backward compatibility
		electricityUsageKwh: "",
		fuelConsumptionLitres: "",
		wasteGeneratedKg: "",
		carbonEmissionsTons: "",
	});
	const [loading, setLoading] = useState(false);
	const [loadingData, setLoadingData] = useState(true);

	useEffect(() => {
		loadMetric();
	}, [id]);

	const loadMetric = async () => {
		try {
			setLoadingData(true);
			const response = await metricsAPI.getEnvironmentalById(id);
			const metric = response.data.metric;
			setFormData({
				period: metric.period || "",
				companyId: metric.companyId || "",
				// Tab 1: Energy & Emissions
				totalEnergyConsumption: metric.totalEnergyConsumption?.toString() || "",
				electricityKwh: metric.electricityKwh?.toString() || metric.electricityUsageKwh?.toString() || "",
				fuelLitres: metric.fuelLitres?.toString() || metric.fuelConsumptionLitres?.toString() || "",
				renewableEnergyPercent: metric.renewableEnergyPercent?.toString() || "",
				nonRenewableEnergyPercent: metric.nonRenewableEnergyPercent?.toString() || "",
				scope1Emissions: metric.scope1Emissions?.toString() || "",
				scope2Emissions: metric.scope2Emissions?.toString() || "",
				scope3Emissions: metric.scope3Emissions?.toString() || "",
				emissionsIntensity: metric.emissionsIntensity?.toString() || "",
				// Tab 2: Water & Waste
				waterUsageKL: metric.waterUsageKL?.toString() || "",
				waterSourceSurface: metric.waterSourceSurface?.toString() || "",
				waterSourceGroundwater: metric.waterSourceGroundwater?.toString() || "",
				waterSourceMunicipal: metric.waterSourceMunicipal?.toString() || "",
				waterSourceOther: metric.waterSourceOther?.toString() || "",
				totalWasteTonnes: metric.totalWasteTonnes?.toString() || "",
				hazardousWasteTonnes: metric.hazardousWasteTonnes?.toString() || "",
				nonHazardousWasteTonnes: metric.nonHazardousWasteTonnes?.toString() || "",
				recycledWasteTonnes: metric.recycledWasteTonnes?.toString() || "",
				divertedFromDisposalTonnes: metric.divertedFromDisposalTonnes?.toString() || "",
				wastewaterTreatmentMetrics: metric.wastewaterTreatmentMetrics || "",
				waterReuseRecyclingPractices: metric.waterReuseRecyclingPractices || "",
				// Tab 3: Resource Efficiency
				recyclingInitiatives: metric.recyclingInitiatives || "",
				materialsReuse: metric.materialsReuse || "",
				energySavingsPrograms: metric.energySavingsPrograms || "",
				waterEfficiencyImprovements: metric.waterEfficiencyImprovements || "",
				// Tab 4: Policies & Compliance
				environmentalPolicyExists: metric.environmentalPolicyExists || false,
				environmentalPolicyDocument: metric.environmentalPolicyDocument || "",
				complianceWithLocalLaws: metric.complianceWithLocalLaws || false,
				environmentalRiskAssessments: metric.environmentalRiskAssessments || false,
				riskAssessmentDetails: metric.riskAssessmentDetails || "",
				// Legacy fields
				electricityUsageKwh: metric.electricityUsageKwh?.toString() || "",
				fuelConsumptionLitres: metric.fuelConsumptionLitres?.toString() || "",
				wasteGeneratedKg: metric.wasteGeneratedKg?.toString() || "",
				carbonEmissionsTons: metric.carbonEmissionsTons?.toString() || "",
			});
		} catch (error: any) {
			showToast.error(t("environment.loadFailed"));
			router.push("/dashboard/environment");
		} finally {
			setLoadingData(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			// Prepare data - convert strings to numbers where needed
			const data: any = {
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

			// Legacy fields for backward compatibility
			if (formData.electricityUsageKwh) data.electricityUsageKwh = parseFloat(formData.electricityUsageKwh);
			if (formData.fuelConsumptionLitres) data.fuelConsumptionLitres = parseFloat(formData.fuelConsumptionLitres);
			if (formData.wasteGeneratedKg) data.wasteGeneratedKg = parseFloat(formData.wasteGeneratedKg);
			if (formData.carbonEmissionsTons) data.carbonEmissionsTons = parseFloat(formData.carbonEmissionsTons);

			await metricsAPI.updateEnvironmental(id, data);
			showToast.success(t("environment.updateSuccess"));
			router.push("/dashboard/environment");
		} catch (error: any) {
			showToast.error(error.response?.data?.error || t("common.error"));
		} finally {
			setLoading(false);
		}
	};

	if (loadingData) {
		return (
			<DashboardLayout>
				<div className="flex items-center justify-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
							<h1 className="text-lg font-semibold text-gray-900 mb-0.5">{t("environment.editMetric")}</h1>
							<p className="text-xs text-gray-600">{t("environment.updateMetrics")}</p>
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
						/>
					</form>
				</div>
			</div>
		</DashboardLayout>
	);
}

