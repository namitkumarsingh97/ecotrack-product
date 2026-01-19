"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import ETTabs, { Tab } from "@/components/ETTabs";

interface GovernanceFormTabsProps {
	formData: any;
	setFormData: (data: any) => void;
}

export default function GovernanceFormTabs({
	formData,
	setFormData,
}: GovernanceFormTabsProps) {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState("board");

	const tabs: Tab[] = [
		{ key: "board", label: t("governance.tabs.boardLeadership") || "Board & Leadership" },
		{ key: "policies", label: t("governance.tabs.policiesEthics") || "Policies & Ethics" },
		{ key: "risk", label: t("governance.tabs.riskManagement") || "Risk Management" },
		{ key: "transparency", label: t("governance.tabs.transparencyReporting") || "Transparency & Reporting" },
		{ key: "supplier", label: t("governance.tabs.supplierCustomer") || "Supplier & Customer Governance" },
	];

	return (
		<ETTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
			{/* Tab 1: Board & Leadership */}
			{activeTab === "board" && (
				<div className="space-y-3">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Total Board Members *
							</label>
							<input
								type="number"
								required
								min="1"
								value={formData.boardMembers || ""}
								onChange={(e) =>
									setFormData({ ...formData, boardMembers: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="5"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Independent Directors *
							</label>
							<input
								type="number"
								required
								min="0"
								value={formData.independentDirectors || ""}
								onChange={(e) =>
									setFormData({ ...formData, independentDirectors: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="2"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Board Diversity (%)
							</label>
							<input
								type="number"
								min="0"
								max="100"
								step="0.1"
								value={formData.boardDiversityPercent || ""}
								onChange={(e) =>
									setFormData({ ...formData, boardDiversityPercent: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="40"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								ESG Committee Exists
							</label>
							<select
								value={formData.esgCommitteeExists ? "yes" : "no"}
								onChange={(e) =>
									setFormData({ ...formData, esgCommitteeExists: e.target.value === "yes" })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
							>
								<option value="no">No</option>
								<option value="yes">Yes</option>
							</select>
						</div>

						{formData.esgCommitteeExists && (
							<div className="md:col-span-2">
								<label className="block text-xs font-medium text-gray-700 mb-1">
									ESG Committee Structure
								</label>
								<textarea
									rows={3}
									value={formData.esgCommitteeStructure || ""}
									onChange={(e) =>
										setFormData({ ...formData, esgCommitteeStructure: e.target.value })
									}
									className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder="Describe ESG committee structure and composition"
								/>
							</div>
						)}

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Board ESG Discussion Frequency
							</label>
							<input
								type="text"
								value={formData.boardEsgDiscussionFrequency || ""}
								onChange={(e) =>
									setFormData({ ...formData, boardEsgDiscussionFrequency: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Quarterly, Annually, etc."
							/>
						</div>
					</div>
				</div>
			)}

			{/* Tab 2: Policies & Ethics */}
			{activeTab === "policies" && (
				<div className="space-y-3">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div className="md:col-span-2">
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={formData.codeOfConductExists || false}
									onChange={(e) =>
										setFormData({ ...formData, codeOfConductExists: e.target.checked })
									}
									className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
								/>
								<span className="text-xs font-medium text-gray-700">
									Written code of conduct / ethics exists
								</span>
							</label>
						</div>

						{formData.codeOfConductExists && (
							<div className="md:col-span-2">
								<label className="block text-xs font-medium text-gray-700 mb-1">
									Code of Conduct Details
								</label>
								<textarea
									rows={3}
									value={formData.codeOfConductDetails || ""}
									onChange={(e) =>
										setFormData({ ...formData, codeOfConductDetails: e.target.value })
									}
									className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder="Describe code of conduct and ethics policies"
								/>
							</div>
						)}

						<div className="md:col-span-2">
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={formData.antiCorruptionPolicy || false}
									onChange={(e) =>
										setFormData({ ...formData, antiCorruptionPolicy: e.target.checked })
									}
									className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
								/>
								<span className="text-xs font-medium text-gray-700">
									Anti-corruption / bribery policies exist
								</span>
							</label>
						</div>

						{formData.antiCorruptionPolicy && (
							<div className="md:col-span-2">
								<label className="block text-xs font-medium text-gray-700 mb-1">
									Anti-Corruption Policy Details
								</label>
								<textarea
									rows={3}
									value={formData.antiCorruptionPolicyDetails || ""}
									onChange={(e) =>
										setFormData({ ...formData, antiCorruptionPolicyDetails: e.target.value })
									}
									className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder="Describe anti-corruption and bribery policies"
								/>
							</div>
						)}

						<div className="md:col-span-2">
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={formData.whistleblowerPolicyExists || false}
									onChange={(e) =>
										setFormData({ ...formData, whistleblowerPolicyExists: e.target.checked })
									}
									className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
								/>
								<span className="text-xs font-medium text-gray-700">
									Whistleblower policy exists
								</span>
							</label>
						</div>

						{formData.whistleblowerPolicyExists && (
							<div className="md:col-span-2">
								<label className="block text-xs font-medium text-gray-700 mb-1">
									Whistleblower Policy Details
								</label>
								<textarea
									rows={3}
									value={formData.whistleblowerPolicyDetails || ""}
									onChange={(e) =>
										setFormData({ ...formData, whistleblowerPolicyDetails: e.target.value })
									}
									className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder="Describe whistleblower policy and mechanisms"
								/>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Tab 3: Risk Management */}
			{activeTab === "risk" && (
				<div className="space-y-3">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div className="md:col-span-2">
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Identified ESG Risks
							</label>
							<textarea
								rows={4}
								value={formData.identifiedEsgRisks || ""}
								onChange={(e) =>
									setFormData({ ...formData, identifiedEsgRisks: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="List identified ESG risks and their nature"
							/>
						</div>

						<div className="md:col-span-2">
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Risk Mitigation Plans
							</label>
							<textarea
								rows={4}
								value={formData.riskMitigationPlans || ""}
								onChange={(e) =>
									setFormData({ ...formData, riskMitigationPlans: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Describe mitigation plans for identified risks"
							/>
						</div>

						<div className="md:col-span-2">
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Monitoring and Escalation Mechanisms
							</label>
							<textarea
								rows={3}
								value={formData.monitoringEscalationMechanisms || ""}
								onChange={(e) =>
									setFormData({ ...formData, monitoringEscalationMechanisms: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Describe monitoring and escalation mechanisms"
							/>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Compliance Violations *
							</label>
							<input
								type="number"
								required
								min="0"
								value={formData.complianceViolations || ""}
								onChange={(e) =>
									setFormData({ ...formData, complianceViolations: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="0"
							/>
						</div>

						<div className="md:col-span-2">
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Audit Results / Compliance Checks
							</label>
							<textarea
								rows={3}
								value={formData.auditResults || ""}
								onChange={(e) =>
									setFormData({ ...formData, auditResults: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Describe audit results and compliance check outcomes"
							/>
						</div>
					</div>
				</div>
			)}

			{/* Tab 4: Transparency & Reporting */}
			{activeTab === "transparency" && (
				<div className="space-y-3">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div className="md:col-span-2">
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={formData.materialEsgRisksDisclosed || false}
									onChange={(e) =>
										setFormData({ ...formData, materialEsgRisksDisclosed: e.target.checked })
									}
									className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
								/>
								<span className="text-xs font-medium text-gray-700">
									Disclosure of material ESG risks
								</span>
							</label>
						</div>

						{formData.materialEsgRisksDisclosed && (
							<div className="md:col-span-2">
								<label className="block text-xs font-medium text-gray-700 mb-1">
									Material ESG Risks Disclosure Details
								</label>
								<textarea
									rows={3}
									value={formData.materialEsgRisksDetails || ""}
									onChange={(e) =>
										setFormData({ ...formData, materialEsgRisksDetails: e.target.value })
									}
									className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder="Describe material ESG risks disclosed"
								/>
							</div>
						)}

						<div className="md:col-span-2">
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Reporting Governance Policies
							</label>
							<textarea
								rows={3}
								value={formData.reportingGovernancePolicies || ""}
								onChange={(e) =>
									setFormData({ ...formData, reportingGovernancePolicies: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Describe reporting governance policies and frameworks"
							/>
						</div>

						<div className="md:col-span-2">
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={formData.thirdPartyAuditExists || false}
									onChange={(e) =>
										setFormData({ ...formData, thirdPartyAuditExists: e.target.checked })
									}
									className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
								/>
								<span className="text-xs font-medium text-gray-700">
									Assurance / third-party audit linkage exists
								</span>
							</label>
						</div>

						{formData.thirdPartyAuditExists && (
							<div className="md:col-span-2">
								<label className="block text-xs font-medium text-gray-700 mb-1">
									Third-Party Audit Details
								</label>
								<textarea
									rows={3}
									value={formData.thirdPartyAuditDetails || ""}
									onChange={(e) =>
										setFormData({ ...formData, thirdPartyAuditDetails: e.target.value })
									}
									className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder="Describe third-party audit and assurance mechanisms"
								/>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Tab 5: Supplier & Customer Governance */}
			{activeTab === "supplier" && (
				<div className="space-y-3">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div className="md:col-span-2">
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={formData.supplierEsgGuidelinesExists || false}
									onChange={(e) =>
										setFormData({ ...formData, supplierEsgGuidelinesExists: e.target.checked })
									}
									className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
								/>
								<span className="text-xs font-medium text-gray-700">
									Supplier ESG guidelines exist
								</span>
							</label>
						</div>

						{formData.supplierEsgGuidelinesExists && (
							<div className="md:col-span-2">
								<label className="block text-xs font-medium text-gray-700 mb-1">
									Supplier ESG Guidelines Details
								</label>
								<textarea
									rows={3}
									value={formData.supplierEsgGuidelinesDetails || ""}
									onChange={(e) =>
										setFormData({ ...formData, supplierEsgGuidelinesDetails: e.target.value })
									}
									className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder="Describe supplier ESG guidelines and requirements"
								/>
							</div>
						)}

						<div className="md:col-span-2">
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Fair Business Assurance Practices
							</label>
							<textarea
								rows={3}
								value={formData.fairBusinessPractices || ""}
								onChange={(e) =>
									setFormData({ ...formData, fairBusinessPractices: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Describe fair business assurance practices"
							/>
						</div>

						<div className="md:col-span-2">
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Contractual Governance Clauses
							</label>
							<textarea
								rows={4}
								value={formData.contractualGovernanceClauses || ""}
								onChange={(e) =>
									setFormData({ ...formData, contractualGovernanceClauses: e.target.value })
								}
								className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Describe contractual governance clauses in supplier/customer agreements"
							/>
						</div>
					</div>
				</div>
			)}
		</ETTabs>
	);
}

