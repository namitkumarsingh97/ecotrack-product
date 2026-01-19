"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { companyAPI } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { Building2, Edit, Trash2, Plus } from "lucide-react";
import { useCompanyStore } from "@/stores";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";
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
	const [editingCompany, setEditingCompany] = useState<any>(null);
	const [formData, setFormData] = useState({
		name: "",
		industry: "Manufacturing",
		employeeCount: "",
		annualRevenue: "",
		location: "",
		reportingYear: new Date().getFullYear(),
	});
	const [loading, setLoading] = useState(false);
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [message, setMessage] = useState({ type: "", text: "" });

	// Use company store
	const { companies, fetchCompanies, updateCompany } = useCompanyStore();

	useEffect(() => {
		// Fetch companies from store (with caching)
		fetchCompanies();
	}, [fetchCompanies]);

	const handleEdit = (company: any) => {
		setEditingCompany(company);
		setFormData({
			name: company.name,
			industry: company.industry,
			employeeCount: company.employeeCount.toString(),
			annualRevenue: company.annualRevenue.toString(),
			location: company.location,
			reportingYear: company.reportingYear,
		});
	};

	const handleCancel = () => {
		setEditingCompany(null);
		setFormData({
			name: "",
			industry: "Manufacturing",
			employeeCount: "",
			annualRevenue: "",
			location: "",
			reportingYear: new Date().getFullYear(),
		});
		setMessage({ type: "", text: "" });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage({ type: "", text: "" });

		try {
			const data = {
				...formData,
				employeeCount: parseInt(formData.employeeCount),
				annualRevenue: parseFloat(formData.annualRevenue),
			};

			if (editingCompany?._id) {
				await companyAPI.update(editingCompany._id, data);
				// Update store
				updateCompany(editingCompany._id, data);
				setMessage({ type: "success", text: t("company.companyUpdated") });
				handleCancel();
				await fetchCompanies();
			} else {
				await companyAPI.create(data);
				setMessage({ type: "success", text: t("company.companyCreated") });
				handleCancel();
				await fetchCompanies();
			}
		} catch (error: any) {
			setMessage({
				type: "error",
				text: error.response?.data?.error || t("company.companyUpdateFailed"),
			});
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (companyId: string) => {
		if (!confirm(t("company.deleteConfirm"))) return;

		try {
			setActionLoading(`delete-${companyId}`);
			await companyAPI.delete(companyId);
			showToast.success(t("company.companyDeleted"));
			await fetchCompanies();
		} catch (error: any) {
			showToast.error(error.response?.data?.error || t("company.companyDeleteFailed"));
		} finally {
			setActionLoading(null);
		}
	};

	return (
		<DashboardLayout>
			<div className="space-y-4">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-lg font-semibold text-gray-900 mb-0.5">
							{t("company.title")}
						</h1>
						<p className="text-xs text-gray-600">
							{t("company.subtitle")}
						</p>
					</div>
					{!editingCompany && (
						<button
							onClick={() => setEditingCompany({})}
							className="flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
						>
							<Plus size={14} />
							{t("common.create")}
						</button>
					)}
				</div>

				{message.text && (
					<div
						className={`px-3 py-2 rounded-lg text-xs ${
							message.type === "success"
								? "bg-green-50 border border-green-200 text-green-700"
								: "bg-red-50 border border-red-200 text-red-700"
						}`}
					>
						{message.text}
					</div>
				)}

				{/* Create/Edit Form */}
				{editingCompany !== null && (
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<div className="p-2 bg-green-100 rounded-lg">
									<Building2 className="text-green-600" size={18} />
								</div>
								<div>
									<h2 className="text-sm font-semibold text-gray-900">
										{editingCompany._id ? t("common.edit") : t("common.create")} {t("company.companyProfile")}
									</h2>
								</div>
							</div>
							<button
								onClick={handleCancel}
								className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
							>
								{t("common.cancel")}
							</button>
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
										className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
										className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
										className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
										className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
										className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
										className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									/>
								</div>
							</div>

							<div className="flex gap-2 pt-3">
								<button
									type="submit"
									disabled={loading}
									className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
								>
									{loading ? t("common.loading") : editingCompany._id ? t("company.updateCompany") : t("company.createCompany")}
								</button>
								<button
									type="button"
									onClick={handleCancel}
									className="px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
								>
									{t("common.cancel")}
								</button>
							</div>
						</form>
					</div>
				)}

				{/* Companies Table */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 border-b border-gray-200">
								<tr>
									<th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										{t("company.companyName")}
									</th>
									<th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										{t("company.industry")}
									</th>
									<th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										{t("company.employeeCount")}
									</th>
									<th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										{t("company.location")}
									</th>
									<th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
										{t("common.actions")}
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{companies.length === 0 ? (
									<tr>
										<td colSpan={5} className="px-2 py-8 text-center text-xs text-gray-500">
											<Building2 size={32} className="mx-auto mb-2 text-gray-300" />
											<p>{t("company.noCompanies")}</p>
										</td>
									</tr>
								) : (
									companies.map((company) => (
										<tr key={company._id} className="hover:bg-gray-50">
											<td className="px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
												{company.name}
											</td>
											<td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
												{company.industry}
											</td>
											<td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
												{company.employeeCount}
											</td>
											<td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
												{company.location}
											</td>
											<td className="px-2 py-2 whitespace-nowrap text-right text-xs font-medium">
												<div className="flex items-center justify-end gap-1">
													<button
														onClick={() => handleEdit(company)}
														className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
														title={t("common.edit")}
													>
														<Edit size={14} />
													</button>
													<button
														onClick={() => handleDelete(company._id)}
														disabled={actionLoading === `delete-${company._id}`}
														className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
														title={t("common.delete")}
													>
														<Trash2 size={14} />
													</button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
