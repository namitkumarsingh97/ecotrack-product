"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { companyAPI, metricsAPI } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { Database, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { useCompanyStore } from "@/stores";
import { useTranslation } from "@/hooks/useTranslation";
import ETTabs, { Tab } from "@/components/ETTabs";
import { useRouter } from "next/navigation";

const industries = [
	"Manufacturing",
	"IT/Software",
	"Textiles",
	"Pharmaceuticals",
	"Food Processing",
	"Automotive",
	"Chemicals",
	"Others",
];

export default function DataCollectionHubPage() {
	const router = useRouter();
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState("company");
	const [saving, setSaving] = useState(false);
	const [loading, setLoading] = useState(false);

	// Use company store
	const { selectedCompany, fetchCompanies } = useCompanyStore();

	// Company Basics Form Data
	const [companyData, setCompanyData] = useState({
		legalName: "",
		cin: "",
		gst: "",
		industry: "Manufacturing",
		employeeCount: "",
		locations: [""],
		reportingYear: new Date().getFullYear(),
	});

	// Environment Data Form Data
	const [environmentData, setEnvironmentData] = useState({
		// Energy
		electricityUnits: "",
		dieselFuelUsage: "",
		renewableUsage: false,
		// Water
		waterSource: "municipal",
		waterConsumption: "",
		waterRecycling: false,
		// Waste
		solidWasteQty: "",
		hazardousWaste: false,
		disposalMethod: "",
	});

	// Social Data Form Data
	const [socialData, setSocialData] = useState({
		// Workforce
		totalEmployees: "",
		permanentEmployees: "",
		contractEmployees: "",
		maleCount: "",
		femaleCount: "",
		// Health & Safety
		injuries: "",
		safetyTraining: false,
		// Training
		avgTrainingHours: "",
	});

	// Governance Data Form Data
	const [governanceData, setGovernanceData] = useState({
		// Policies
		codeOfConduct: false,
		antiBriberyPolicy: false,
		poshPolicy: false,
		// Compliance
		gstCompliance: "",
		pfEsic: false,
	});

	useEffect(() => {
		fetchCompanies();
	}, [fetchCompanies]);

	useEffect(() => {
		if (selectedCompany) {
			loadCompanyData();
		}
	}, [selectedCompany]);

	const loadCompanyData = async () => {
		if (!selectedCompany?._id) return;

		setLoading(true);
		try {
			// Load company details
			const companyResponse = await companyAPI.getById(selectedCompany._id);
			const company = companyResponse.data.company;

			setCompanyData({
				legalName: company.legalName || company.name || "",
				cin: company.cin || "",
				gst: company.gst || "",
				industry: company.industry || "Manufacturing",
				employeeCount: company.employeeCount?.toString() || "",
				locations: company.locations?.length > 0 ? company.locations : [company.location || ""],
				reportingYear: company.reportingYear || new Date().getFullYear(),
			});

			// Load latest metrics for the current period
			const currentYear = new Date().getFullYear();
			const currentQuarter = Math.floor((new Date().getMonth() + 3) / 3);
			const currentPeriod = `${currentYear}-Q${currentQuarter}`;

			try {
				const [envResponse, socialResponse, govResponse] = await Promise.all([
					metricsAPI.getEnvironmental(selectedCompany._id).catch(() => ({ data: { metrics: [] } })),
					metricsAPI.getSocial(selectedCompany._id).catch(() => ({ data: { metrics: [] } })),
					metricsAPI.getGovernance(selectedCompany._id).catch(() => ({ data: { metrics: [] } })),
				]);

				const envMetrics = envResponse.data.metrics?.find((m: any) => m.period === currentPeriod);
				const socialMetrics = socialResponse.data.metrics?.find((m: any) => m.period === currentPeriod);
				const govMetrics = govResponse.data.metrics?.find((m: any) => m.period === currentPeriod);

				if (envMetrics) {
					setEnvironmentData({
						electricityUnits: envMetrics.electricityKwh?.toString() || envMetrics.electricityUsageKwh?.toString() || "",
						dieselFuelUsage: envMetrics.fuelLitres?.toString() || envMetrics.fuelConsumptionLitres?.toString() || "",
						renewableUsage: (envMetrics.renewableEnergyPercent || 0) > 0,
						waterSource: envMetrics.waterSourceMunicipal ? "municipal" : envMetrics.waterSourceGroundwater ? "borewell" : "municipal",
						waterConsumption: envMetrics.waterUsageKL?.toString() || "",
						waterRecycling: !!envMetrics.waterReuseRecyclingPractices,
						solidWasteQty: envMetrics.totalWasteTonnes?.toString() || envMetrics.wasteGeneratedKg?.toString() || "",
						hazardousWaste: (envMetrics.hazardousWasteTonnes || 0) > 0,
						disposalMethod: envMetrics.wastewaterTreatmentMetrics || "",
					});
				}

				if (socialMetrics) {
					setSocialData({
						totalEmployees: (socialMetrics.totalEmployeesPermanent || 0) + (socialMetrics.totalEmployeesContractual || 0) || socialMetrics.totalEmployees?.toString() || "",
						permanentEmployees: socialMetrics.totalEmployeesPermanent?.toString() || "",
						contractEmployees: socialMetrics.totalEmployeesContractual?.toString() || "",
						maleCount: "",
						femaleCount: "",
						injuries: socialMetrics.accidentIncidents?.toString() || "",
						safetyTraining: (socialMetrics.totalTrainingHoursPerEmployee || 0) > 0,
						avgTrainingHours: socialMetrics.totalTrainingHoursPerEmployee?.toString() || socialMetrics.avgTrainingHours?.toString() || "",
					});
				}

				if (govMetrics) {
					setGovernanceData({
						codeOfConduct: govMetrics.codeOfConductExists || false,
						antiBriberyPolicy: govMetrics.antiCorruptionPolicy || false,
						poshPolicy: govMetrics.whistleblowerPolicyExists || false,
						gstCompliance: "",
						pfEsic: false,
					});
				}
			} catch (error) {
				console.error("Error loading metrics:", error);
			}
		} catch (error: any) {
			showToast.error(error.response?.data?.error || "Failed to load company data");
		} finally {
			setLoading(false);
		}
	};

	const calculateCompletion = () => {
		let totalFields = 0;
		let completedFields = 0;

		// Company Basics
		const companyFields = ["legalName", "cin", "gst", "industry", "employeeCount", "reportingYear"];
		totalFields += companyFields.length;
		companyFields.forEach((field) => {
			if (field === "locations") {
				if (companyData.locations.some((loc) => loc.trim() !== "")) completedFields++;
			} else if (companyData[field as keyof typeof companyData]) {
				completedFields++;
			}
		});
		if (companyData.locations.some((loc) => loc.trim() !== "")) completedFields++;

		// Environment
		const envFields = ["electricityUnits", "dieselFuelUsage", "waterConsumption", "solidWasteQty"];
		totalFields += envFields.length;
		envFields.forEach((field) => {
			if (environmentData[field as keyof typeof environmentData]) completedFields++;
		});

		// Social
		const socialFields = ["totalEmployees", "permanentEmployees", "contractEmployees", "injuries", "avgTrainingHours"];
		totalFields += socialFields.length;
		socialFields.forEach((field) => {
			if (socialData[field as keyof typeof socialData]) completedFields++;
		});

		// Governance
		const govFields = ["codeOfConduct", "antiBriberyPolicy", "poshPolicy", "gstCompliance"];
		totalFields += govFields.length;
		govFields.forEach((field) => {
			if (field === "gstCompliance") {
				if (governanceData.gstCompliance) completedFields++;
			} else if (governanceData[field as keyof typeof governanceData]) {
				completedFields++;
			}
		});

		return Math.round((completedFields / totalFields) * 100);
	};

	const handleSaveDraft = async () => {
		if (!selectedCompany?._id) {
			showToast.error("Please select a company");
			return;
		}

		setSaving(true);
		try {
			// Save company basics
			await companyAPI.update(selectedCompany._id, {
				legalName: companyData.legalName,
				cin: companyData.cin,
				gst: companyData.gst,
				industry: companyData.industry,
				employeeCount: parseInt(companyData.employeeCount) || 0,
				locations: companyData.locations.filter((loc) => loc.trim() !== ""),
				reportingYear: companyData.reportingYear,
			});

			// Save metrics (create or update)
			const currentYear = new Date().getFullYear();
			const currentQuarter = Math.floor((new Date().getMonth() + 3) / 3);
			const currentPeriod = `${currentYear}-Q${currentQuarter}`;

			// Environment metrics
			try {
				const envResponse = await metricsAPI.getEnvironmental(selectedCompany._id);
				const existingEnv = envResponse.data.metrics?.find((m: any) => m.period === currentPeriod);

				const envPayload = {
					period: currentPeriod,
					electricityKwh: parseFloat(environmentData.electricityUnits) || 0,
					fuelLitres: parseFloat(environmentData.dieselFuelUsage) || 0,
					renewableEnergyPercent: environmentData.renewableUsage ? 50 : 0,
					waterUsageKL: parseFloat(environmentData.waterConsumption) || 0,
					waterSourceMunicipal: environmentData.waterSource === "municipal",
					waterSourceGroundwater: environmentData.waterSource === "borewell",
					totalWasteTonnes: parseFloat(environmentData.solidWasteQty) || 0,
					hazardousWasteTonnes: environmentData.hazardousWaste ? parseFloat(environmentData.solidWasteQty) * 0.1 : 0,
					wastewaterTreatmentMetrics: environmentData.disposalMethod,
					waterReuseRecyclingPractices: environmentData.waterRecycling ? "Yes" : "",
				};

				if (existingEnv) {
					await metricsAPI.updateEnvironmental(existingEnv._id, envPayload);
				} else {
					await metricsAPI.createEnvironmental({ ...envPayload, companyId: selectedCompany._id });
				}
			} catch (error) {
				console.error("Error saving environment data:", error);
			}

			// Social metrics
			try {
				const socialResponse = await metricsAPI.getSocial(selectedCompany._id);
				const existingSocial = socialResponse.data.metrics?.find((m: any) => m.period === currentPeriod);

				const socialPayload = {
					period: currentPeriod,
					totalEmployeesPermanent: parseInt(socialData.permanentEmployees) || 0,
					totalEmployeesContractual: parseInt(socialData.contractEmployees) || 0,
					femalePercentWorkforce: socialData.totalEmployees
						? ((parseInt(socialData.femaleCount) || 0) / parseInt(socialData.totalEmployees)) * 100
						: 0,
					accidentIncidents: parseInt(socialData.injuries) || 0,
					totalTrainingHoursPerEmployee: parseFloat(socialData.avgTrainingHours) || 0,
				};

				if (existingSocial) {
					await metricsAPI.updateSocial(existingSocial._id, socialPayload);
				} else {
					await metricsAPI.createSocial({ ...socialPayload, companyId: selectedCompany._id });
				}
			} catch (error) {
				console.error("Error saving social data:", error);
			}

			// Governance metrics
			try {
				const govResponse = await metricsAPI.getGovernance(selectedCompany._id);
				const existingGov = govResponse.data.metrics?.find((m: any) => m.period === currentPeriod);

				const govPayload = {
					period: currentPeriod,
					codeOfConductExists: governanceData.codeOfConduct,
					antiCorruptionPolicy: governanceData.antiBriberyPolicy,
					whistleblowerPolicyExists: governanceData.poshPolicy,
				};

				if (existingGov) {
					await metricsAPI.updateGovernance(existingGov._id, govPayload);
				} else {
					await metricsAPI.createGovernance({ ...govPayload, companyId: selectedCompany._id });
				}
			} catch (error) {
				console.error("Error saving governance data:", error);
			}

			showToast.success("Data saved as draft successfully");
		} catch (error: any) {
			showToast.error(error.response?.data?.error || "Failed to save data");
		} finally {
			setSaving(false);
		}
	};

	const completionPercentage = calculateCompletion();

	const tabs: Tab[] = [
		{ key: "company", label: "Company Basics" },
		{ key: "environment", label: "Environment Data" },
		{ key: "social", label: "Social Data" },
		{ key: "governance", label: "Governance Data" },
	];

	if (!selectedCompany) {
		return (
			<DashboardLayout>
				<div className="text-center py-12">
					<Database className="mx-auto text-gray-400 mb-4" size={48} />
					<p className="text-gray-600 mb-4">{t("dataCollection.noCompanySelected")}</p>
					<p className="text-xs text-gray-500">{t("dataCollection.selectCompanyFromNav")}</p>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="space-y-4">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-lg font-semibold text-gray-900 mb-0.5">
							{t("dataCollection.title")}
						</h1>
						<p className="text-xs text-gray-600">
							{selectedCompany?.name} - {t("dataCollection.subtitle")}
						</p>
					</div>
					<div className="flex items-center gap-3">
						{/* Completion Indicator */}
						<div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-2">
							<div className="text-xs text-gray-600">Completion:</div>
							<div className="flex items-center gap-2">
								<div className="w-24 bg-gray-200 rounded-full h-2">
									<div
										className="bg-green-600 h-2 rounded-full transition-all"
										style={{ width: `${completionPercentage}%` }}
									></div>
								</div>
								<span className="text-sm font-semibold text-gray-900">{completionPercentage}%</span>
							</div>
						</div>
						<button
							onClick={handleSaveDraft}
							disabled={saving}
							className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
						>
							<Save size={14} />
							{saving ? "Saving..." : "Save as Draft"}
						</button>
					</div>
				</div>

				{/* Tabs */}
				<ETTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
					{/* Tab 1: Company Basics */}
					{activeTab === "company" && (
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
							<h2 className="text-sm font-semibold text-gray-900 mb-4">Company Basics</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1">
										Legal Name *
									</label>
									<input
										type="text"
										value={companyData.legalName}
										onChange={(e) => setCompanyData({ ...companyData, legalName: e.target.value })}
										className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
										placeholder="Enter legal name"
									/>
								</div>
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1">
										CIN (Corporate Identification Number)
									</label>
									<input
										type="text"
										value={companyData.cin}
										onChange={(e) => setCompanyData({ ...companyData, cin: e.target.value })}
										className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
										placeholder="Enter CIN"
									/>
								</div>
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1">
										GST Number
									</label>
									<input
										type="text"
										value={companyData.gst}
										onChange={(e) => setCompanyData({ ...companyData, gst: e.target.value })}
										className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
										placeholder="Enter GST number"
									/>
								</div>
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1">
										Industry *
									</label>
									<select
										value={companyData.industry}
										onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
										className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									>
										{industries.map((ind) => (
											<option key={ind} value={ind}>
												{ind}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1">
										Employee Count *
									</label>
									<input
										type="number"
										value={companyData.employeeCount}
										onChange={(e) => setCompanyData({ ...companyData, employeeCount: e.target.value })}
										className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
										placeholder="Enter employee count"
										min="10"
										max="500"
									/>
								</div>
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1">
										Reporting Year *
									</label>
									<input
										type="number"
										value={companyData.reportingYear}
										onChange={(e) => setCompanyData({ ...companyData, reportingYear: parseInt(e.target.value) || new Date().getFullYear() })}
										className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
										min="2020"
										max="2030"
									/>
								</div>
								<div className="md:col-span-2">
									<label className="block text-xs font-medium text-gray-700 mb-1">
										Locations
									</label>
									{companyData.locations.map((location, index) => (
										<div key={index} className="flex gap-2 mb-2">
											<input
												type="text"
												value={location}
												onChange={(e) => {
													const newLocations = [...companyData.locations];
													newLocations[index] = e.target.value;
													setCompanyData({ ...companyData, locations: newLocations });
												}}
												className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
												placeholder={`Location ${index + 1}`}
											/>
											{companyData.locations.length > 1 && (
												<button
													type="button"
													onClick={() => {
														const newLocations = companyData.locations.filter((_, i) => i !== index);
														setCompanyData({ ...companyData, locations: newLocations });
													}}
													className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
												>
													Remove
												</button>
											)}
										</div>
									))}
									<button
										type="button"
										onClick={() => setCompanyData({ ...companyData, locations: [...companyData.locations, ""] })}
										className="text-sm text-green-600 hover:text-green-700 font-medium"
									>
										+ Add Location
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Tab 2: Environment Data */}
					{activeTab === "environment" && (
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
							<h2 className="text-sm font-semibold text-gray-900 mb-4">Environment Data</h2>
							<div className="space-y-6">
								{/* Energy Section */}
								<div>
									<h3 className="text-xs font-semibold text-gray-700 mb-3">a) Energy</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-xs font-medium text-gray-700 mb-1">
												Electricity Units (kWh)
											</label>
											<input
												type="number"
												value={environmentData.electricityUnits}
												onChange={(e) => setEnvironmentData({ ...environmentData, electricityUnits: e.target.value })}
												className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
												placeholder="Enter electricity units"
												min="0"
											/>
										</div>
										<div>
											<label className="block text-xs font-medium text-gray-700 mb-1">
												Diesel / Fuel Usage (L)
											</label>
											<input
												type="number"
												value={environmentData.dieselFuelUsage}
												onChange={(e) => setEnvironmentData({ ...environmentData, dieselFuelUsage: e.target.value })}
												className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
												placeholder="Enter fuel usage"
												min="0"
											/>
										</div>
										<div className="md:col-span-2">
											<label className="flex items-center gap-2">
												<input
													type="checkbox"
													checked={environmentData.renewableUsage}
													onChange={(e) => setEnvironmentData({ ...environmentData, renewableUsage: e.target.checked })}
													className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
												/>
												<span className="text-sm text-gray-700">Renewable usage (Yes/No)</span>
											</label>
										</div>
									</div>
								</div>

								{/* Water Section */}
								<div>
									<h3 className="text-xs font-semibold text-gray-700 mb-3">b) Water</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-xs font-medium text-gray-700 mb-1">
												Source
											</label>
											<select
												value={environmentData.waterSource}
												onChange={(e) => setEnvironmentData({ ...environmentData, waterSource: e.target.value })}
												className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
											>
												<option value="municipal">Municipal</option>
												<option value="borewell">Borewell</option>
											</select>
										</div>
										<div>
											<label className="block text-xs font-medium text-gray-700 mb-1">
												Consumption (KL)
											</label>
											<input
												type="number"
												value={environmentData.waterConsumption}
												onChange={(e) => setEnvironmentData({ ...environmentData, waterConsumption: e.target.value })}
												className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
												placeholder="Enter water consumption"
												min="0"
											/>
										</div>
										<div className="md:col-span-2">
											<label className="flex items-center gap-2">
												<input
													type="checkbox"
													checked={environmentData.waterRecycling}
													onChange={(e) => setEnvironmentData({ ...environmentData, waterRecycling: e.target.checked })}
													className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
												/>
												<span className="text-sm text-gray-700">Recycling (Yes/No)</span>
											</label>
										</div>
									</div>
								</div>

								{/* Waste Section */}
								<div>
									<h3 className="text-xs font-semibold text-gray-700 mb-3">c) Waste</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-xs font-medium text-gray-700 mb-1">
												Solid Waste Quantity (tonnes)
											</label>
											<input
												type="number"
												value={environmentData.solidWasteQty}
												onChange={(e) => setEnvironmentData({ ...environmentData, solidWasteQty: e.target.value })}
												className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
												placeholder="Enter solid waste quantity"
												min="0"
											/>
										</div>
										<div>
											<label className="block text-xs font-medium text-gray-700 mb-1">
												Disposal Method
											</label>
											<input
												type="text"
												value={environmentData.disposalMethod}
												onChange={(e) => setEnvironmentData({ ...environmentData, disposalMethod: e.target.value })}
												className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
												placeholder="Enter disposal method"
											/>
										</div>
										<div className="md:col-span-2">
											<label className="flex items-center gap-2">
												<input
													type="checkbox"
													checked={environmentData.hazardousWaste}
													onChange={(e) => setEnvironmentData({ ...environmentData, hazardousWaste: e.target.checked })}
													className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
												/>
												<span className="text-sm text-gray-700">Hazardous waste (Yes/No)</span>
											</label>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Tab 3: Social Data */}
					{activeTab === "social" && (
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
							<h2 className="text-sm font-semibold text-gray-900 mb-4">Social Data</h2>
							<div className="space-y-6">
								{/* Workforce Section */}
								<div>
									<h3 className="text-xs font-semibold text-gray-700 mb-3">a) Workforce</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-xs font-medium text-gray-700 mb-1">
												Total Employees
											</label>
											<input
												type="number"
												value={socialData.totalEmployees}
												onChange={(e) => setSocialData({ ...socialData, totalEmployees: e.target.value })}
												className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
												placeholder="Enter total employees"
												min="0"
											/>
										</div>
										<div>
											<label className="block text-xs font-medium text-gray-700 mb-1">
												Permanent Employees
											</label>
											<input
												type="number"
												value={socialData.permanentEmployees}
												onChange={(e) => setSocialData({ ...socialData, permanentEmployees: e.target.value })}
												className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
												placeholder="Enter permanent employees"
												min="0"
											/>
										</div>
										<div>
											<label className="block text-xs font-medium text-gray-700 mb-1">
												Contract Employees
											</label>
											<input
												type="number"
												value={socialData.contractEmployees}
												onChange={(e) => setSocialData({ ...socialData, contractEmployees: e.target.value })}
												className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
												placeholder="Enter contract employees"
												min="0"
											/>
										</div>
										<div>
											<label className="block text-xs font-medium text-gray-700 mb-1">
												Male Count
											</label>
											<input
												type="number"
												value={socialData.maleCount}
												onChange={(e) => setSocialData({ ...socialData, maleCount: e.target.value })}
												className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
												placeholder="Enter male count"
												min="0"
											/>
										</div>
										<div>
											<label className="block text-xs font-medium text-gray-700 mb-1">
												Female Count
											</label>
											<input
												type="number"
												value={socialData.femaleCount}
												onChange={(e) => setSocialData({ ...socialData, femaleCount: e.target.value })}
												className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
												placeholder="Enter female count"
												min="0"
											/>
										</div>
									</div>
								</div>

								{/* Health & Safety Section */}
								<div>
									<h3 className="text-xs font-semibold text-gray-700 mb-3">b) Health & Safety</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-xs font-medium text-gray-700 mb-1">
												Injuries
											</label>
											<input
												type="number"
												value={socialData.injuries}
												onChange={(e) => setSocialData({ ...socialData, injuries: e.target.value })}
												className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
												placeholder="Enter number of injuries"
												min="0"
											/>
										</div>
										<div className="md:col-span-2">
											<label className="flex items-center gap-2">
												<input
													type="checkbox"
													checked={socialData.safetyTraining}
													onChange={(e) => setSocialData({ ...socialData, safetyTraining: e.target.checked })}
													className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
												/>
												<span className="text-sm text-gray-700">Safety training (Yes/No)</span>
											</label>
										</div>
									</div>
								</div>

								{/* Training Section */}
								<div>
									<h3 className="text-xs font-semibold text-gray-700 mb-3">c) Training</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-xs font-medium text-gray-700 mb-1">
												Avg Training Hours
											</label>
											<input
												type="number"
												value={socialData.avgTrainingHours}
												onChange={(e) => setSocialData({ ...socialData, avgTrainingHours: e.target.value })}
												className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
												placeholder="Enter average training hours"
												min="0"
												step="0.1"
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Tab 4: Governance Data */}
					{activeTab === "governance" && (
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
							<h2 className="text-sm font-semibold text-gray-900 mb-4">Governance Data</h2>
							<div className="space-y-6">
								{/* Policies Section */}
								<div>
									<h3 className="text-xs font-semibold text-gray-700 mb-3">a) Policies</h3>
									<div className="space-y-3">
										<label className="flex items-center gap-2">
											<input
												type="checkbox"
												checked={governanceData.codeOfConduct}
												onChange={(e) => setGovernanceData({ ...governanceData, codeOfConduct: e.target.checked })}
												className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
											/>
											<span className="text-sm text-gray-700">Code of conduct (Yes/No)</span>
										</label>
										<label className="flex items-center gap-2">
											<input
												type="checkbox"
												checked={governanceData.antiBriberyPolicy}
												onChange={(e) => setGovernanceData({ ...governanceData, antiBriberyPolicy: e.target.checked })}
												className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
											/>
											<span className="text-sm text-gray-700">Anti-bribery policy (Yes/No)</span>
										</label>
										<label className="flex items-center gap-2">
											<input
												type="checkbox"
												checked={governanceData.poshPolicy}
												onChange={(e) => setGovernanceData({ ...governanceData, poshPolicy: e.target.checked })}
												className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
											/>
											<span className="text-sm text-gray-700">POSH policy (Yes/No)</span>
										</label>
									</div>
								</div>

								{/* Compliance Section */}
								<div>
									<h3 className="text-xs font-semibold text-gray-700 mb-3">b) Compliance</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-xs font-medium text-gray-700 mb-1">
												GST Compliance
											</label>
											<input
												type="text"
												value={governanceData.gstCompliance}
												onChange={(e) => setGovernanceData({ ...governanceData, gstCompliance: e.target.value })}
												className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
												placeholder="Enter GST compliance status"
											/>
										</div>
										<div className="md:col-span-2">
											<label className="flex items-center gap-2">
												<input
													type="checkbox"
													checked={governanceData.pfEsic}
													onChange={(e) => setGovernanceData({ ...governanceData, pfEsic: e.target.checked })}
													className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
												/>
												<span className="text-sm text-gray-700">PF / ESIC (Yes/No)</span>
											</label>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</ETTabs>
			</div>
		</DashboardLayout>
	);
}
