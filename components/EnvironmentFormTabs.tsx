"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import ETTabs, { Tab } from "@/components/ETTabs";

interface EnvironmentFormTabsProps {
	formData: any;
	setFormData: (data: any) => void;
	companies?: any[];
}

export default function EnvironmentFormTabs({
	formData,
	setFormData,
}: EnvironmentFormTabsProps) {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState("energy");

	// Count required fields in each tab
	const getRequiredFieldsCount = (tabKey: string): number => {
		switch (tabKey) {
			case "energy":
				// Required: electricityKwh, fuelLitres, scope1Emissions, scope2Emissions
				return 4;
			case "water":
				// Required: waterUsageKL, totalWasteTonnes
				return 2;
			case "resource":
				// No required fields
				return 0;
			case "policies":
				// No required fields (all checkboxes/optional)
				return 0;
			default:
				return 0;
		}
	};

	const tabs: Tab[] = [
		{ 
			key: "energy", 
			label: t("environment.tabs.energyEmissions") || "Energy & Emissions"
		},
		{ 
			key: "water", 
			label: t("environment.tabs.waterWaste") || "Water & Waste"
		},
		{ 
			key: "resource", 
			label: t("environment.tabs.resourceEfficiency") || "Resource Efficiency"
		},
		{ 
			key: "policies", 
			label: t("environment.tabs.policiesCompliance") || "Policies & Compliance"
		},
	];

	return (
		<ETTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
			{/* Tab 1: Energy & Emissions */}
			{activeTab === "energy" && (
				<div className="space-y-3">
					<div className="flex items-center justify-between mb-2">
						<h3 className="text-sm font-semibold text-gray-900">
							{t("environment.tabs.energyEmissions") || "Energy & Emissions"}
						</h3>
						<span className="text-xs font-semibold text-red-500">
							Required Fields: {getRequiredFieldsCount("energy")}
						</span>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Total Energy Consumption
							</label>
							<input
								type="number"
								min="0"
								step="0.01"
								value={formData.totalEnergyConsumption || ""}
								onChange={(e) =>
									setFormData({ ...formData, totalEnergyConsumption: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Total energy (kWh equivalent)"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Electricity (kWh) *
							</label>
							<input
								type="number"
								required
								min="0"
								step="0.01"
								value={formData.electricityKwh || ""}
								onChange={(e) =>
									setFormData({ ...formData, electricityKwh: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="50000"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Fuel (litres or equivalent) *
							</label>
							<input
								type="number"
								required
								min="0"
								step="0.01"
								value={formData.fuelLitres || ""}
								onChange={(e) =>
									setFormData({ ...formData, fuelLitres: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="5000"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Renewable Energy (%)
							</label>
							<input
								type="number"
								min="0"
								max="100"
								step="0.1"
								value={formData.renewableEnergyPercent || ""}
								onChange={(e) =>
									setFormData({ ...formData, renewableEnergyPercent: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="20"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Non-Renewable Energy (%)
							</label>
							<input
								type="number"
								min="0"
								max="100"
								step="0.1"
								value={formData.nonRenewableEnergyPercent || ""}
								onChange={(e) =>
									setFormData({ ...formData, nonRenewableEnergyPercent: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="80"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Scope 1 Emissions (tons CO2e) *
							</label>
							<input
								type="number"
								required
								min="0"
								step="0.01"
								value={formData.scope1Emissions || ""}
								onChange={(e) =>
									setFormData({ ...formData, scope1Emissions: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Direct emissions"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Scope 2 Emissions (tons CO2e) *
							</label>
							<input
								type="number"
								required
								min="0"
								step="0.01"
								value={formData.scope2Emissions || ""}
								onChange={(e) =>
									setFormData({ ...formData, scope2Emissions: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Indirect emissions"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Scope 3 Emissions (tons CO2e) (Optional)
							</label>
							<input
								type="number"
								min="0"
								step="0.01"
								value={formData.scope3Emissions || ""}
								onChange={(e) =>
									setFormData({ ...formData, scope3Emissions: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Value chain emissions"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Emissions Intensity (tons CO2e per unit)
							</label>
							<input
								type="number"
								min="0"
								step="0.01"
								value={formData.emissionsIntensity || ""}
								onChange={(e) =>
									setFormData({ ...formData, emissionsIntensity: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Per revenue/production/output"
							/>
						</div>
					</div>
				</div>
			)}

			{/* Tab 2: Water & Waste */}
			{activeTab === "water" && (
				<div className="space-y-3">
					<div className="flex items-center justify-between mb-2">
						<h3 className="text-sm font-semibold text-gray-900">
							{t("environment.tabs.waterWaste") || "Water & Waste"}
						</h3>
						<span className="text-xs font-semibold text-red-500">
							Required Fields: {getRequiredFieldsCount("water")}
						</span>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Water Usage (KL) *
							</label>
							<input
								type="number"
								required
								min="0"
								step="0.01"
								value={formData.waterUsageKL || ""}
								onChange={(e) =>
									setFormData({ ...formData, waterUsageKL: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="1000"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Water Source - Surface (KL)
							</label>
							<input
								type="number"
								min="0"
								step="0.01"
								value={formData.waterSourceSurface || ""}
								onChange={(e) =>
									setFormData({ ...formData, waterSourceSurface: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Surface water"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Water Source - Groundwater (KL)
							</label>
							<input
								type="number"
								min="0"
								step="0.01"
								value={formData.waterSourceGroundwater || ""}
								onChange={(e) =>
									setFormData({ ...formData, waterSourceGroundwater: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Groundwater"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Water Source - Municipal (KL)
							</label>
							<input
								type="number"
								min="0"
								step="0.01"
								value={formData.waterSourceMunicipal || ""}
								onChange={(e) =>
									setFormData({ ...formData, waterSourceMunicipal: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Municipal supply"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Water Source - Other (KL)
							</label>
							<input
								type="number"
								min="0"
								step="0.01"
								value={formData.waterSourceOther || ""}
								onChange={(e) =>
									setFormData({ ...formData, waterSourceOther: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Other sources"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Total Waste (metric tonnes) *
							</label>
							<input
								type="number"
								required
								min="0"
								step="0.01"
								value={formData.totalWasteTonnes || ""}
								onChange={(e) =>
									setFormData({ ...formData, totalWasteTonnes: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Total waste"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Hazardous Waste (tonnes)
							</label>
							<input
								type="number"
								min="0"
								step="0.01"
								value={formData.hazardousWasteTonnes || ""}
								onChange={(e) =>
									setFormData({ ...formData, hazardousWasteTonnes: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Hazardous waste"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Non-Hazardous Waste (tonnes)
							</label>
							<input
								type="number"
								min="0"
								step="0.01"
								value={formData.nonHazardousWasteTonnes || ""}
								onChange={(e) =>
									setFormData({ ...formData, nonHazardousWasteTonnes: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Non-hazardous waste"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Recycled Waste (tonnes)
							</label>
							<input
								type="number"
								min="0"
								step="0.01"
								value={formData.recycledWasteTonnes || ""}
								onChange={(e) =>
									setFormData({ ...formData, recycledWasteTonnes: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Recycled waste"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Diverted from Disposal (tonnes)
							</label>
							<input
								type="number"
								min="0"
								step="0.01"
								value={formData.divertedFromDisposalTonnes || ""}
								onChange={(e) =>
									setFormData({ ...formData, divertedFromDisposalTonnes: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Diverted from disposal"
							/>
						</div>

						<div className="md:col-span-2 lg:col-span-4">
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Wastewater Treatment Metrics
							</label>
							<textarea
								rows={3}
								value={formData.wastewaterTreatmentMetrics || ""}
								onChange={(e) =>
									setFormData({ ...formData, wastewaterTreatmentMetrics: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Describe wastewater treatment practices and metrics"
							/>
						</div>

						<div className="md:col-span-2 lg:col-span-4">
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Water Reuse/Recycling Practices
							</label>
							<textarea
								rows={3}
								value={formData.waterReuseRecyclingPractices || ""}
								onChange={(e) =>
									setFormData({ ...formData, waterReuseRecyclingPractices: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Describe water reuse and recycling practices"
							/>
						</div>
					</div>
				</div>
			)}

			{/* Tab 3: Resource Efficiency */}
			{activeTab === "resource" && (
				<div className="space-y-3">
					<div className="flex items-center justify-between mb-2">
						<h3 className="text-sm font-semibold text-gray-900">
							{t("environment.tabs.resourceEfficiency") || "Resource Efficiency"}
						</h3>
						<span className="text-xs font-semibold text-red-500">
							Required Fields: {getRequiredFieldsCount("resource")}
						</span>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<div className="md:col-span-2 lg:col-span-4">
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Recycling Initiatives
							</label>
							<textarea
								rows={3}
								value={formData.recyclingInitiatives || ""}
								onChange={(e) =>
									setFormData({ ...formData, recyclingInitiatives: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Describe recycling initiatives and programs"
							/>
						</div>

						<div className="md:col-span-2 lg:col-span-4">
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Materials Reuse
							</label>
							<textarea
								rows={3}
								value={formData.materialsReuse || ""}
								onChange={(e) =>
									setFormData({ ...formData, materialsReuse: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Describe materials reuse programs and practices"
							/>
						</div>

						<div className="md:col-span-2 lg:col-span-4">
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Energy Savings Programs
							</label>
							<textarea
								rows={3}
								value={formData.energySavingsPrograms || ""}
								onChange={(e) =>
									setFormData({ ...formData, energySavingsPrograms: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Describe energy savings programs and initiatives"
							/>
						</div>

						<div className="md:col-span-2 lg:col-span-4">
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Water Efficiency Improvements
							</label>
							<textarea
								rows={3}
								value={formData.waterEfficiencyImprovements || ""}
								onChange={(e) =>
									setFormData({ ...formData, waterEfficiencyImprovements: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Describe water efficiency improvements and programs"
							/>
						</div>
					</div>
				</div>
			)}

			{/* Tab 4: Policies & Compliance */}
			{activeTab === "policies" && (
				<div className="space-y-3">
					<div className="flex items-center justify-between mb-2">
						<h3 className="text-sm font-semibold text-gray-900">
							{t("environment.tabs.policiesCompliance") || "Policies & Compliance"}
						</h3>
						<span className="text-xs font-semibold text-red-500">
							Required Fields: {getRequiredFieldsCount("policies")}
						</span>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<div className="md:col-span-2 lg:col-span-4">
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={formData.environmentalPolicyExists || false}
									onChange={(e) =>
										setFormData({ ...formData, environmentalPolicyExists: e.target.checked })
									}
									className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
								/>
								<span className="text-xs font-medium text-gray-700">
									Existence of written environmental policy
								</span>
							</label>
						</div>

						{formData.environmentalPolicyExists && (
							<div className="md:col-span-2 lg:col-span-4">
								<label className="block text-xs font-medium text-gray-700 mb-1">
									Environmental Policy Document (URL or reference)
								</label>
								<input
									type="text"
									value={formData.environmentalPolicyDocument || ""}
									onChange={(e) =>
										setFormData({ ...formData, environmentalPolicyDocument: e.target.value })
									}
									className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder="URL or document reference"
								/>
							</div>
						)}

						<div className="md:col-span-2 lg:col-span-4">
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={formData.complianceWithLocalLaws || false}
									onChange={(e) =>
										setFormData({ ...formData, complianceWithLocalLaws: e.target.checked })
									}
									className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
								/>
								<span className="text-xs font-medium text-gray-700">
									Compliance with local environmental laws
								</span>
							</label>
						</div>

						<div className="md:col-span-2 lg:col-span-4">
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={formData.environmentalRiskAssessments || false}
									onChange={(e) =>
										setFormData({ ...formData, environmentalRiskAssessments: e.target.checked })
									}
									className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
								/>
								<span className="text-xs font-medium text-gray-700">
									Environmental risk assessments conducted
								</span>
							</label>
						</div>

						{formData.environmentalRiskAssessments && (
							<div className="md:col-span-2 lg:col-span-4">
								<label className="block text-xs font-medium text-gray-700 mb-1">
									Risk Assessment Details
								</label>
								<textarea
									rows={4}
									value={formData.riskAssessmentDetails || ""}
									onChange={(e) =>
										setFormData({ ...formData, riskAssessmentDetails: e.target.value })
									}
									className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder="Describe environmental risk assessments conducted"
								/>
							</div>
						)}
					</div>
				</div>
			)}
		</ETTabs>
	);
}
