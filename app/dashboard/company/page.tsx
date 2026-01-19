"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { companyAPI } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { Building2, Edit, Save } from "lucide-react";
import { useCompanyStore } from "@/stores";
import { useTranslation } from "@/hooks/useTranslation";
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

export default function CompanyPage() {
	const router = useRouter();
	const { t } = useTranslation();
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		industry: "Manufacturing",
		employeeCount: "",
		annualRevenue: "",
		location: "",
		reportingYear: new Date().getFullYear(),
	});
	const [loading, setLoading] = useState(false);

	// Use company store
	const { companies, selectedCompany, fetchCompanies, updateCompany } = useCompanyStore();

	useEffect(() => {
		// Fetch companies from store (with caching)
		fetchCompanies();
	}, [fetchCompanies]);

	useEffect(() => {
		// Load selected company data into form
		if (selectedCompany && !isEditing) {
			setFormData({
				name: selectedCompany.name || "",
				industry: selectedCompany.industry || "Manufacturing",
				employeeCount: selectedCompany.employeeCount?.toString() || "",
				annualRevenue: selectedCompany.annualRevenue?.toString() || "",
				location: selectedCompany.location || "",
				reportingYear: selectedCompany.reportingYear || new Date().getFullYear(),
			});
		}
	}, [selectedCompany, isEditing]);

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleCancel = () => {
		setIsEditing(false);
		if (selectedCompany) {
			setFormData({
				name: selectedCompany.name || "",
				industry: selectedCompany.industry || "Manufacturing",
				employeeCount: selectedCompany.employeeCount?.toString() || "",
				annualRevenue: selectedCompany.annualRevenue?.toString() || "",
				location: selectedCompany.location || "",
				reportingYear: selectedCompany.reportingYear || new Date().getFullYear(),
			});
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedCompany?._id) {
			showToast.error("No company selected");
			return;
		}

		setLoading(true);

		try {
			const data = {
				...formData,
				employeeCount: parseInt(formData.employeeCount),
				annualRevenue: parseFloat(formData.annualRevenue),
			};

			await companyAPI.update(selectedCompany._id, data);
			// Update store
			updateCompany(selectedCompany._id, data);
			showToast.success(t("company.companyUpdated"));
			setIsEditing(false);
			await fetchCompanies();
		} catch (error: any) {
			showToast.error(error.response?.data?.error || t("company.companyUpdateFailed"));
		} finally {
			setLoading(false);
		}
	};

	if (!selectedCompany) {
		return (
			<DashboardLayout>
				<div className="text-center py-12">
					<Building2 className="mx-auto text-gray-400 mb-4" size={48} />
					<p className="text-gray-600 mb-4">{t("company.noCompany")}</p>
					<p className="text-xs text-gray-500 mb-2">Please select a company from the top navigation</p>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="space-y-4">
				{/* Header with Edit Button at Top Right */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-lg font-semibold text-gray-900 mb-0.5">
							{t("company.title")}
						</h1>
						<p className="text-xs text-gray-600">{t("company.subtitle")}</p>
					</div>
					{!isEditing && (
						<button
							onClick={handleEdit}
							className="flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
						>
							<Edit size={14} />
							{t("common.edit")}
						</button>
					)}
				</div>

				{/* Stats */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-2">
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
						<div className="text-xs text-gray-600">Company Name</div>
						<div className="text-lg font-semibold text-gray-900 truncate">
							{selectedCompany.name}
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
						<div className="text-xs text-gray-600">Industry</div>
						<div className="text-lg font-semibold text-green-600">
							{selectedCompany.industry}
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
						<div className="text-xs text-gray-600">Employees</div>
						<div className="text-lg font-semibold text-blue-600">
							{selectedCompany.employeeCount?.toLocaleString() || "0"}
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
						<div className="text-xs text-gray-600">Annual Revenue (₹)</div>
						<div className="text-lg font-semibold text-orange-600">
							{(selectedCompany.annualRevenue || 0).toLocaleString()}
						</div>
					</div>
				</div>

				{/* Company Details Form/Card */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
					{isEditing ? (
						<>
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-2">
									<div className="p-2 bg-green-100 rounded-lg">
										<Building2 className="text-green-600" size={18} />
									</div>
									<div>
										<h2 className="text-sm font-semibold text-gray-900">
											{t("company.editCompanyProfile")}
										</h2>
									</div>
								</div>
								<div className="flex gap-2">
									<button
										onClick={handleCancel}
										className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded font-medium transition-colors"
									>
										{t("common.cancel")}
									</button>
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

							<form onSubmit={handleSubmit} className="space-y-3">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									<div>
										<label className="block text-xs font-medium text-gray-700 mb-1">
											{t("company.companyName")} *
										</label>
										<input
											type="text"
											required
											value={formData.name}
											onChange={(e) =>
												setFormData({ ...formData, name: e.target.value })
											}
											className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
											placeholder="Acme Industries Pvt Ltd"
										/>
									</div>

									<div>
										<label className="block text-xs font-medium text-gray-700 mb-1">
											{t("company.industry")} *
										</label>
										<select
											required
											value={formData.industry}
											onChange={(e) =>
												setFormData({ ...formData, industry: e.target.value })
											}
											className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
										>
											{industries.map((industry) => (
												<option key={industry} value={industry}>
													{industry}
												</option>
											))}
										</select>
									</div>

									<div>
										<label className="block text-xs font-medium text-gray-700 mb-1">
											{t("company.employeeCount")} *
										</label>
										<input
											type="number"
											required
											min="10"
											max="500"
											value={formData.employeeCount}
											onChange={(e) =>
												setFormData({ ...formData, employeeCount: e.target.value })
											}
											className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
											placeholder="100"
										/>
									</div>

									<div>
										<label className="block text-xs font-medium text-gray-700 mb-1">
											{t("company.annualRevenue")} (₹) *
										</label>
										<input
											type="number"
											required
											min="0"
											value={formData.annualRevenue}
											onChange={(e) =>
												setFormData({ ...formData, annualRevenue: e.target.value })
											}
											className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
											placeholder="50000000"
										/>
									</div>

									<div>
										<label className="block text-xs font-medium text-gray-700 mb-1">
											{t("company.location")} *
										</label>
										<input
											type="text"
											required
											value={formData.location}
											onChange={(e) =>
												setFormData({ ...formData, location: e.target.value })
											}
											className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
											placeholder="Mumbai, Maharashtra"
										/>
									</div>

									<div>
										<label className="block text-xs font-medium text-gray-700 mb-1">
											{t("company.reportingYear")} *
										</label>
										<input
											type="number"
											required
											min="2020"
											max="2030"
											value={formData.reportingYear}
											onChange={(e) =>
												setFormData({
													...formData,
													reportingYear: parseInt(e.target.value),
												})
											}
											className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
										/>
									</div>
								</div>
							</form>
						</>
					) : (
						<>
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-2">
									<div className="p-2 bg-green-100 rounded-lg">
										<Building2 className="text-green-600" size={18} />
									</div>
									<div>
										<h2 className="text-sm font-semibold text-gray-900">
											{t("company.companyProfile")}
										</h2>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1">
										{t("company.companyName")}
									</label>
									<div className="text-xs text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
										{selectedCompany.name}
									</div>
								</div>

								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1">
										{t("company.industry")}
									</label>
									<div className="text-xs text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
										{selectedCompany.industry}
									</div>
								</div>

								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1">
										{t("company.employeeCount")}
									</label>
									<div className="text-xs text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
										{selectedCompany.employeeCount?.toLocaleString() || "0"}
									</div>
								</div>

								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1">
										{t("company.annualRevenue")} (₹)
									</label>
									<div className="text-xs text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
										{(selectedCompany.annualRevenue || 0).toLocaleString()}
									</div>
								</div>

								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1">
										{t("company.location")}
									</label>
									<div className="text-xs text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
										{selectedCompany.location}
									</div>
								</div>

								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1">
										{t("company.reportingYear")}
									</label>
									<div className="text-xs text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
										{selectedCompany.reportingYear || "-"}
									</div>
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</DashboardLayout>
	);
}
