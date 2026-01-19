"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import ETTabs, { Tab } from "@/components/ETTabs";

interface SocialFormTabsProps {
	formData: any;
	setFormData: (data: any) => void;
}

export default function SocialFormTabs({
	formData,
	setFormData,
}: SocialFormTabsProps) {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState("demographics");

	const tabs: Tab[] = [
		{ key: "demographics", label: t("social.tabs.workforceDemographics") || "Workforce Demographics" },
		{ key: "safety", label: t("social.tabs.employeeSafety") || "Employee Safety & Welfare" },
		{ key: "labor", label: t("social.tabs.laborPractices") || "Labor Practices & Compensation" },
		{ key: "rights", label: t("social.tabs.humanRights") || "Human Rights & Inclusivity" },
		{ key: "community", label: t("social.tabs.communityCSR") || "Community & CSR" },
		{ key: "stakeholder", label: t("social.tabs.stakeholderEngagement") || "Stakeholder Engagement" },
	];

	return (
		<ETTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
			{/* Tab 1: Workforce Demographics */}
			{activeTab === "demographics" && (
				<div className="space-y-3">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Total Employees (Permanent) *
							</label>
							<input
								type="number"
								required
								min="0"
								value={formData.totalEmployeesPermanent || ""}
								onChange={(e) =>
									setFormData({ ...formData, totalEmployeesPermanent: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Permanent employees"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Total Employees (Contractual) *
							</label>
							<input
								type="number"
								required
								min="0"
								value={formData.totalEmployeesContractual || ""}
								onChange={(e) =>
									setFormData({ ...formData, totalEmployeesContractual: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Contractual employees"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Female % of Workforce *
							</label>
							<input
								type="number"
								required
								min="0"
								max="100"
								step="0.1"
								value={formData.femalePercentWorkforce || ""}
								onChange={(e) =>
									setFormData({ ...formData, femalePercentWorkforce: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="30"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Women in Management (%)
							</label>
							<input
								type="number"
								min="0"
								max="100"
								step="0.1"
								value={formData.womenInManagementPercent || ""}
								onChange={(e) =>
									setFormData({ ...formData, womenInManagementPercent: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="25"
							/>
						</div>

						<div className="md:col-span-2">
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Representation of Vulnerable Groups
							</label>
							<textarea
								rows={3}
								value={formData.vulnerableGroupsRepresentation || ""}
								onChange={(e) =>
									setFormData({ ...formData, vulnerableGroupsRepresentation: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Describe representation of vulnerable groups (PwD, LGBTQ+, etc.)"
							/>
						</div>
					</div>
				</div>
			)}

			{/* Tab 2: Employee Safety & Welfare */}
			{activeTab === "safety" && (
				<div className="space-y-3">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Accident Incidents *
							</label>
							<input
								type="number"
								required
								min="0"
								value={formData.accidentIncidents || ""}
								onChange={(e) =>
									setFormData({ ...formData, accidentIncidents: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Number of accidents"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Near Miss Incidents
							</label>
							<input
								type="number"
								min="0"
								value={formData.nearMissIncidents || ""}
								onChange={(e) =>
									setFormData({ ...formData, nearMissIncidents: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Number of near misses"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Total Training Hours per Employee *
							</label>
							<input
								type="number"
								required
								min="0"
								step="0.1"
								value={formData.totalTrainingHoursPerEmployee || ""}
								onChange={(e) =>
									setFormData({ ...formData, totalTrainingHoursPerEmployee: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="20"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Safety Drills Conducted
							</label>
							<input
								type="number"
								min="0"
								value={formData.safetyDrillsConducted || ""}
								onChange={(e) =>
									setFormData({ ...formData, safetyDrillsConducted: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Number of drills"
							/>
						</div>

						<div className="md:col-span-2">
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Health & Safety Policies
							</label>
							<textarea
								rows={3}
								value={formData.healthSafetyPolicies || ""}
								onChange={(e) =>
									setFormData({ ...formData, healthSafetyPolicies: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Describe health & safety policies in place"
							/>
						</div>

						<div className="md:col-span-2">
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Awareness Sessions Conducted
							</label>
							<textarea
								rows={3}
								value={formData.awarenessSessions || ""}
								onChange={(e) =>
									setFormData({ ...formData, awarenessSessions: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Describe safety awareness sessions conducted"
							/>
						</div>
					</div>
				</div>
			)}

			{/* Tab 3: Labor Practices & Compensation */}
			{activeTab === "labor" && (
				<div className="space-y-3">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div className="md:col-span-2">
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={formData.fairWagePolicyExists || false}
									onChange={(e) =>
										setFormData({ ...formData, fairWagePolicyExists: e.target.checked })
									}
									className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
								/>
								<span className="text-xs font-medium text-gray-700">
									Fair wage policy exists
								</span>
							</label>
						</div>

						{formData.fairWagePolicyExists && (
							<div className="md:col-span-2">
								<label className="block text-xs font-medium text-gray-700 mb-1">
									Fair Wage Policy Details
								</label>
								<textarea
									rows={3}
									value={formData.fairWagePolicyDetails || ""}
									onChange={(e) =>
										setFormData({ ...formData, fairWagePolicyDetails: e.target.value })
									}
									className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder="Describe fair wage policy"
								/>
							</div>
						)}

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Median Remuneration (₹)
							</label>
							<input
								type="number"
								min="0"
								step="0.01"
								value={formData.medianRemuneration || ""}
								onChange={(e) =>
									setFormData({ ...formData, medianRemuneration: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Median salary"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Pay Ratio (CEO to Median)
							</label>
							<input
								type="number"
								min="0"
								step="0.1"
								value={formData.payRatio || ""}
								onChange={(e) =>
									setFormData({ ...formData, payRatio: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Pay ratio"
							/>
						</div>

						<div className="md:col-span-2">
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Internal Grievance Redressal Mechanism
							</label>
							<textarea
								rows={3}
								value={formData.grievanceRedressalMechanism || ""}
								onChange={(e) =>
									setFormData({ ...formData, grievanceRedressalMechanism: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Describe grievance redressal mechanism"
							/>
						</div>
					</div>
				</div>
			)}

			{/* Tab 4: Human Rights & Inclusivity */}
			{activeTab === "rights" && (
				<div className="space-y-3">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div className="md:col-span-2">
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Human Rights Awareness/Training
							</label>
							<textarea
								rows={3}
								value={formData.humanRightsTraining || ""}
								onChange={(e) =>
									setFormData({ ...formData, humanRightsTraining: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Describe human rights awareness and training programs"
							/>
						</div>

						<div className="md:col-span-2">
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={formData.accessibilityMeasures || false}
									onChange={(e) =>
										setFormData({ ...formData, accessibilityMeasures: e.target.checked })
									}
									className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
								/>
								<span className="text-xs font-medium text-gray-700">
									Accessibility and non-discrimination measures in place
								</span>
							</label>
						</div>

						{formData.accessibilityMeasures && (
							<div className="md:col-span-2">
								<label className="block text-xs font-medium text-gray-700 mb-1">
									Accessibility Measures Details
								</label>
								<textarea
									rows={3}
									value={formData.accessibilityMeasuresDetails || ""}
									onChange={(e) =>
										setFormData({ ...formData, accessibilityMeasuresDetails: e.target.value })
									}
									className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder="Describe accessibility measures"
								/>
							</div>
						)}

						<div className="md:col-span-2">
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={formData.antiHarassmentProcessExists || false}
									onChange={(e) =>
										setFormData({ ...formData, antiHarassmentProcessExists: e.target.checked })
									}
									className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
								/>
								<span className="text-xs font-medium text-gray-700">
									Workplace anti-harassment processes in place
								</span>
							</label>
						</div>

						{formData.antiHarassmentProcessExists && (
							<div className="md:col-span-2">
								<label className="block text-xs font-medium text-gray-700 mb-1">
									Anti-Harassment Process Details
								</label>
								<textarea
									rows={3}
									value={formData.antiHarassmentProcessDetails || ""}
									onChange={(e) =>
										setFormData({ ...formData, antiHarassmentProcessDetails: e.target.value })
									}
									className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder="Describe anti-harassment processes"
								/>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Tab 5: Community & CSR */}
			{activeTab === "community" && (
				<div className="space-y-3">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								CSR Spend (₹)
							</label>
							<input
								type="number"
								min="0"
								step="0.01"
								value={formData.csrSpend || ""}
								onChange={(e) =>
									setFormData({ ...formData, csrSpend: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="CSR expenditure"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								CSR Spend as % of Profit
							</label>
							<input
								type="number"
								min="0"
								max="100"
								step="0.1"
								value={formData.csrSpendPercent || ""}
								onChange={(e) =>
									setFormData({ ...formData, csrSpendPercent: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Percentage"
							/>
						</div>

						<div className="md:col-span-2">
							<label className="block text-xs font-medium text-gray-700 mb-1">
								CSR Activities
							</label>
							<textarea
								rows={3}
								value={formData.csrActivities || ""}
								onChange={(e) =>
									setFormData({ ...formData, csrActivities: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Describe CSR activities and programs"
							/>
						</div>

						<div className="md:col-span-2">
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Community Engagement Programs
							</label>
							<textarea
								rows={3}
								value={formData.communityEngagementPrograms || ""}
								onChange={(e) =>
									setFormData({ ...formData, communityEngagementPrograms: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Describe community engagement programs"
							/>
						</div>

						<div className="md:col-span-2">
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Impact Assessments
							</label>
							<textarea
								rows={3}
								value={formData.impactAssessments || ""}
								onChange={(e) =>
									setFormData({ ...formData, impactAssessments: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Employment creation, local development impact assessments"
							/>
						</div>
					</div>
				</div>
			)}

			{/* Tab 6: Stakeholder Engagement */}
			{activeTab === "stakeholder" && (
				<div className="space-y-3">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div className="md:col-span-2">
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Key Stakeholder Groups
							</label>
							<textarea
								rows={3}
								value={formData.keyStakeholderGroups || ""}
								onChange={(e) =>
									setFormData({ ...formData, keyStakeholderGroups: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Identify key stakeholder groups (employees, customers, suppliers, community, etc.)"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Engagement Frequency
							</label>
							<input
								type="text"
								value={formData.engagementFrequency || ""}
								onChange={(e) =>
									setFormData({ ...formData, engagementFrequency: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Monthly, Quarterly, Annually, etc."
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Type of Engagement
							</label>
							<input
								type="text"
								value={formData.engagementType || ""}
								onChange={(e) =>
									setFormData({ ...formData, engagementType: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Surveys, meetings, forums, etc."
							/>
						</div>

						<div className="md:col-span-2">
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Communication Outcomes
							</label>
							<textarea
								rows={4}
								value={formData.communicationOutcomes || ""}
								onChange={(e) =>
									setFormData({ ...formData, communicationOutcomes: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Describe communication outcomes and feedback received"
							/>
						</div>
					</div>
				</div>
			)}
		</ETTabs>
	);
}

