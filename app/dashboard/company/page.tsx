"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { companyAPI } from "@/lib/api";
import { Building2, Save } from "lucide-react";

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
	const [companies, setCompanies] = useState<any[]>([]);
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
	const [message, setMessage] = useState({ type: "", text: "" });

	useEffect(() => {
		loadCompanies();
	}, []);

	const loadCompanies = async () => {
		try {
			const response = await companyAPI.getAll();
			setCompanies(response.data.companies);

			if (response.data.companies.length > 0) {
				const company = response.data.companies[0];
				setFormData({
					name: company.name,
					industry: company.industry,
					employeeCount: company.employeeCount.toString(),
					annualRevenue: company.annualRevenue.toString(),
					location: company.location,
					reportingYear: company.reportingYear,
				});
			} else {
				setIsEditing(true);
			}
		} catch (error) {
			console.error("Failed to load companies:", error);
		}
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

			if (companies.length > 0) {
				await companyAPI.update(companies[0]._id, data);
				setMessage({ type: "success", text: "Company updated successfully!" });
			} else {
				await companyAPI.create(data);
				setMessage({ type: "success", text: "Company created successfully!" });
			}

			setIsEditing(false);
			await loadCompanies();
		} catch (error: any) {
			setMessage({
				type: "error",
				text: error.response?.data?.error || "Failed to save company",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<DashboardLayout>
			<div className="max-w-4xl mx-auto">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						Company Information
					</h1>
					<p className="text-gray-600">
						Manage your company profile and details
					</p>
				</div>

				{message.text && (
					<div
						className={`mb-6 px-4 py-3 rounded-lg ${
							message.type === "success"
								? "bg-green-50 border border-green-200 text-green-700"
								: "bg-red-50 border border-red-200 text-red-700"
						}`}
					>
						{message.text}
					</div>
				)}

				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-3">
							<div className="p-3 bg-green-100 rounded-lg">
								<Building2 className="text-green-600" size={24} />
							</div>
							<div>
								<h2 className="text-xl font-semibold text-gray-900">
									Company Profile
								</h2>
								<p className="text-sm text-gray-600">
									Basic information about your organization
								</p>
							</div>
						</div>
						{!isEditing && companies.length > 0 && (
							<button
								onClick={() => setIsEditing(true)}
								className="px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
							>
								Edit
							</button>
						)}
					</div>

					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Company Name *
								</label>
								<input
									type="text"
									required
									disabled={!isEditing}
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
									placeholder="Acme Industries Pvt Ltd"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Industry *
								</label>
								<select
									required
									disabled={!isEditing}
									value={formData.industry}
									onChange={(e) =>
										setFormData({ ...formData, industry: e.target.value })
									}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
								>
									{industries.map((industry) => (
										<option key={industry} value={industry}>
											{industry}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Number of Employees *
								</label>
								<input
									type="number"
									required
									min="10"
									max="500"
									disabled={!isEditing}
									value={formData.employeeCount}
									onChange={(e) =>
										setFormData({ ...formData, employeeCount: e.target.value })
									}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
									placeholder="100"
								/>
								<p className="text-xs text-gray-500 mt-1">
									Between 10-500 employees
								</p>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Annual Revenue (₹) *
								</label>
								<input
									type="number"
									required
									min="0"
									disabled={!isEditing}
									value={formData.annualRevenue}
									onChange={(e) =>
										setFormData({ ...formData, annualRevenue: e.target.value })
									}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
									placeholder="50000000"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Location *
								</label>
								<input
									type="text"
									required
									disabled={!isEditing}
									value={formData.location}
									onChange={(e) =>
										setFormData({ ...formData, location: e.target.value })
									}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
									placeholder="Mumbai, Maharashtra"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Reporting Year *
								</label>
								<input
									type="number"
									required
									min="2020"
									max="2030"
									disabled={!isEditing}
									value={formData.reportingYear}
									onChange={(e) =>
										setFormData({
											...formData,
											reportingYear: parseInt(e.target.value),
										})
									}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
								/>
							</div>
						</div>

						{isEditing && (
							<div className="flex gap-4 pt-4">
								<button
									type="submit"
									disabled={loading}
									className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
								>
									<Save size={20} />
									{loading ? "Saving..." : "Save Company"}
								</button>
								{companies.length > 0 && (
									<button
										type="button"
										onClick={() => {
											setIsEditing(false);
											loadCompanies();
										}}
										className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold"
									>
										Cancel
									</button>
								)}
							</div>
						)}
					</form>
				</div>
			</div>
		</DashboardLayout>
	);
}
