"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { adminAPI } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { Building2, User, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";

export default function ClientOnboardingPage() {
	const router = useRouter();
	const { t } = useTranslation();
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

			showToast.success(t("admin.clientCreated"));

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
				t("admin.clientCreateFailed");
			showToast.error(errorMsg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<DashboardLayout>
			<div className="space-y-4">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-lg font-semibold text-gray-900 mb-0.5">
							{t("admin.clientOnboarding")}
						</h1>
						<p className="text-xs text-gray-600">
							{t("admin.clientOnboardingSubtitle")}
						</p>
					</div>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => router.back()}
							className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded font-medium transition-colors"
						>
							{t("common.cancel")}
						</button>
						<button
							type="submit"
							form="client-form"
							disabled={loading}
							className="flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
						>
							{loading ? (
								<>
									<div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
									{t("common.loading")}
								</>
							) : (
								<>
									<Save size={14} />
									{t("admin.createClient")}
								</>
							)}
						</button>
					</div>
				</div>

				{/* Credentials Display (if email not sent) */}
				{showCredentials && credentials && (
					<div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm p-3">
						<div className="flex items-start justify-between mb-2">
							<h3 className="text-xs font-semibold text-yellow-800">
								{t("admin.clientCredentials")}
							</h3>
							<button
								onClick={() => setShowCredentials(false)}
								className="text-yellow-600 hover:text-yellow-800 transition-colors"
							>
								<X size={14} />
							</button>
						</div>
						<div className="space-y-1.5 text-xs">
							<p className="text-yellow-700">
								<strong>{t("common.email")}:</strong> {credentials.email}
							</p>
							<p className="text-yellow-700">
								<strong>{t("common.password")}:</strong>{" "}
								<code className="bg-yellow-100 px-2 py-0.5 rounded text-xs font-mono">
									{credentials.password}
								</code>
							</p>
							<p className="text-yellow-600 mt-2 text-xs">
								⚠️ {t("admin.saveCredentialsWarning")}
							</p>
						</div>
					</div>
				)}

				<form id="client-form" onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
					{/* Company Information Section */}
					<div className="mb-4">
						<div className="flex items-center gap-2 mb-3">
							<div className="p-1.5 bg-green-100 rounded-lg">
								<Building2 size={16} className="text-green-600" />
							</div>
							<h2 className="text-sm font-semibold text-gray-900">
								{t("admin.companyInformation")}
							</h2>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">
									{t("company.companyName")} <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="companyName"
									value={formData.companyName}
									onChange={handleChange}
									required
									className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder={t("company.companyNamePlaceholder")}
								/>
							</div>

							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">
									{t("company.industry")} <span className="text-red-500">*</span>
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
									{t("company.employeeCount")} <span className="text-red-500">*</span>
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
									{t("company.annualRevenue")} (₹) <span className="text-red-500">*</span>
								</label>
								<input
									type="number"
									name="annualRevenue"
									value={formData.annualRevenue}
									onChange={handleChange}
									required
									min="0"
									className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder={t("company.annualRevenuePlaceholder")}
								/>
							</div>

							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">
									{t("company.location")} <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="location"
									value={formData.location}
									onChange={handleChange}
									required
									className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder={t("company.locationPlaceholder")}
								/>
							</div>

							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">
									{t("company.reportingYear")}
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

					<div className="border-t border-gray-200 my-4"></div>

					{/* User Information Section */}
					<div className="mb-4">
						<div className="flex items-center gap-2 mb-3">
							<div className="p-1.5 bg-green-100 rounded-lg">
								<User size={16} className="text-green-600" />
							</div>
							<h2 className="text-sm font-semibold text-gray-900">
								{t("admin.userAccount")}
							</h2>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">
									{t("common.name")} <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="name"
									value={formData.name}
									onChange={handleChange}
									required
									className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder={t("admin.fullNamePlaceholder")}
								/>
							</div>

							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">
									{t("common.email")} <span className="text-red-500">*</span>
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
									{t("admin.plan")} <span className="text-red-500">*</span>
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
									{t("common.password")} ({t("common.optional")})
								</label>
								<input
									type="text"
									name="password"
									value={formData.password}
									onChange={handleChange}
									minLength={6}
									className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder={t("admin.passwordAutoGenerate")}
								/>
								<p className="text-xs text-gray-500 mt-1">
									{t("admin.passwordAutoGenerateDesc")}
								</p>
							</div>
						</div>

						<div className="mt-3">
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
									{t("admin.sendInvitationEmail")}
								</span>
							</label>
						</div>
					</div>
				</form>
			</div>
		</DashboardLayout>
	);
}
