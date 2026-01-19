"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { adminAPI } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { Building2, User, Mail, Key, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ClientOnboardingPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [showCredentials, setShowCredentials] = useState(false);
	const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);

	const [formData, setFormData] = useState({
		// Company fields
		companyName: "",
		industry: "Manufacturing",
		employeeCount: "",
		annualRevenue: "",
		location: "",
		reportingYear: new Date().getFullYear(),
		// User fields
		email: "",
		name: "",
		plan: "starter" as "starter" | "pro" | "enterprise",
		password: "",
		sendInvitation: true,
	});

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

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: name === "employeeCount" || name === "annualRevenue" || name === "reportingYear"
				? value === "" ? "" : Number(value)
				: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setShowCredentials(false);
		setCredentials(null);

		try {
			const response = await adminAPI.createClient({
				companyName: formData.companyName,
				industry: formData.industry,
				employeeCount: Number(formData.employeeCount),
				annualRevenue: Number(formData.annualRevenue),
				location: formData.location,
				reportingYear: formData.reportingYear,
				email: formData.email,
				name: formData.name,
				plan: formData.plan,
				password: formData.password || undefined,
				sendInvitation: formData.sendInvitation,
			});

			showToast.success("Client created successfully!");

			// If invitation email was not sent, show credentials
			if (!formData.sendInvitation && response.data?.temporaryPassword) {
				setCredentials({
					email: formData.email,
					password: response.data.temporaryPassword,
				});
				setShowCredentials(true);
			}

			// Reset form
			setFormData({
				companyName: "",
				industry: "Manufacturing",
				employeeCount: "",
				annualRevenue: "",
				location: "",
				reportingYear: new Date().getFullYear(),
				email: "",
				name: "",
				plan: "starter",
				password: "",
				sendInvitation: true,
			});
		} catch (error: any) {
			const errorMsg =
				error.response?.data?.error ||
				error.response?.data?.errors?.[0]?.msg ||
				"Failed to create client";
			showToast.error(errorMsg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<DashboardLayout>
			<div className="max-w-4xl mx-auto">
				<div className="mb-4">
					<h1 className="text-lg font-semibold text-gray-900 mb-0.5">Client Onboarding</h1>
					<p className="text-xs text-gray-600">
						Create a new client account with company and user credentials
					</p>
				</div>

				{/* Credentials Display (if email not sent) */}
				{showCredentials && credentials && (
					<div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
						<div className="flex items-start justify-between mb-2">
							<h3 className="text-sm font-semibold text-yellow-800">Client Credentials</h3>
							<button
								onClick={() => setShowCredentials(false)}
								className="text-yellow-600 hover:text-yellow-800"
							>
								<X size={16} />
							</button>
						</div>
						<div className="space-y-2 text-xs">
							<p className="text-yellow-700">
								<strong>Email:</strong> {credentials.email}
							</p>
							<p className="text-yellow-700">
								<strong>Password:</strong>{" "}
								<code className="bg-yellow-100 px-2 py-1 rounded">{credentials.password}</code>
							</p>
							<p className="text-yellow-600 mt-2">
								⚠️ Please save these credentials securely. They will not be shown again.
							</p>
						</div>
					</div>
				)}

				<form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
					{/* Company Information Section */}
					<div className="mb-6">
						<div className="flex items-center gap-2 mb-3">
							<Building2 size={18} className="text-green-600" />
							<h2 className="text-sm font-semibold text-gray-900">Company Information</h2>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">
									Company Name <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="companyName"
									value={formData.companyName}
									onChange={handleChange}
									required
									className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder="Enter company name"
								/>
							</div>

							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">
									Industry <span className="text-red-500">*</span>
								</label>
								<select
									name="industry"
									value={formData.industry}
									onChange={handleChange}
									required
									className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
									Employee Count <span className="text-red-500">*</span>
								</label>
								<input
									type="number"
									name="employeeCount"
									value={formData.employeeCount}
									onChange={handleChange}
									required
									min="10"
									max="500"
									className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder="10-500"
								/>
							</div>

							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">
									Annual Revenue (₹) <span className="text-red-500">*</span>
								</label>
								<input
									type="number"
									name="annualRevenue"
									value={formData.annualRevenue}
									onChange={handleChange}
									required
									min="0"
									className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder="Enter annual revenue"
								/>
							</div>

							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">
									Location <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="location"
									value={formData.location}
									onChange={handleChange}
									required
									className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder="City, State"
								/>
							</div>

							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">
									Reporting Year
								</label>
								<input
									type="number"
									name="reportingYear"
									value={formData.reportingYear}
									onChange={handleChange}
									min="2020"
									max="2030"
									className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								/>
							</div>
						</div>
					</div>

					<div className="border-t border-gray-200 my-6"></div>

					{/* User Information Section */}
					<div className="mb-6">
						<div className="flex items-center gap-2 mb-3">
							<User size={18} className="text-green-600" />
							<h2 className="text-sm font-semibold text-gray-900">User Account</h2>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">
									Full Name <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="name"
									value={formData.name}
									onChange={handleChange}
									required
									className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder="Enter full name"
								/>
							</div>

							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">
									Email <span className="text-red-500">*</span>
								</label>
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									required
									className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder="user@company.com"
								/>
							</div>

							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">
									Plan <span className="text-red-500">*</span>
								</label>
								<select
									name="plan"
									value={formData.plan}
									onChange={handleChange}
									required
									className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								>
									<option value="starter">Starter (₹1,999/month)</option>
									<option value="pro">Pro (₹4,999/month)</option>
									<option value="enterprise">Enterprise (Custom)</option>
								</select>
							</div>

							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">
									Password (Optional)
								</label>
								<input
									type="text"
									name="password"
									value={formData.password}
									onChange={handleChange}
									minLength={6}
									className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder="Leave empty to auto-generate"
								/>
								<p className="text-xs text-gray-500 mt-1">
									If left empty, a secure password will be generated automatically
								</p>
							</div>
						</div>

						<div className="mt-4">
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									name="sendInvitation"
									checked={formData.sendInvitation}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, sendInvitation: e.target.checked }))
									}
									className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
								/>
								<span className="text-xs text-gray-700">
									Send invitation email with credentials to user
								</span>
							</label>
						</div>
					</div>

					{/* Submit Button */}
					<div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
						<button
							type="button"
							onClick={() => router.back()}
							className="px-4 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading}
							className="flex items-center gap-2 px-4 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? (
								<>
									<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
									Creating...
								</>
							) : (
								<>
									<Save size={14} />
									Create Client
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</DashboardLayout>
	);
}

