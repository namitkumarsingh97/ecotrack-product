"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { esgAPI } from "@/lib/api";
import { FileText, Download, Calendar } from "lucide-react";
import { useCompanyStore, useESGStore } from "@/stores";
import { useTranslation } from "@/hooks/useTranslation";

export default function ReportsPage() {
	const { t } = useTranslation();
	const [selectedCompanyId, setSelectedCompanyId] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });

	// Use stores
	const { companies, selectedCompany, fetchCompanies } = useCompanyStore();
	const { 
		scores: esgScoresMap, 
		fetchScores,
		isLoading: esgLoading
	} = useESGStore();

	// Get scores for selected company
	const esgScores = selectedCompanyId ? (esgScoresMap[selectedCompanyId] || []) : [];

	useEffect(() => {
		// Fetch companies from store (with caching)
		fetchCompanies();
	}, [fetchCompanies]);

	useEffect(() => {
		// Set initial selected company
		if (selectedCompany?._id && !selectedCompanyId) {
			setSelectedCompanyId(selectedCompany._id);
		}
	}, [selectedCompany, selectedCompanyId]);

	useEffect(() => {
		// Fetch scores when company changes (with caching)
		if (selectedCompanyId) {
			fetchScores(selectedCompanyId);
		}
	}, [selectedCompanyId, fetchScores]);

	const handleCompanyChange = async (companyId: string) => {
		setSelectedCompanyId(companyId);
		// Scores will be fetched automatically via useEffect
	};

	const handleDownloadPDF = async (period: string) => {
		setLoading(true);
		setMessage({ type: "", text: "" });

		try {
			const response = await esgAPI.getReport(selectedCompanyId, "pdf", period);

			// Create blob and download
			const blob = new Blob([response.data], { type: "application/pdf" });
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `ESG-Report-${period}.pdf`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			setMessage({
				type: "success",
				text: t("reports.pdfDownloadSuccess"),
			});
		} catch (error: any) {
			setMessage({ type: "error", text: t("reports.pdfDownloadFailed") });
		} finally {
			setLoading(false);
		}
	};

	const handleDownloadExcel = async (period: string) => {
		setLoading(true);
		setMessage({ type: "", text: "" });

		try {
			const response = await esgAPI.getReport(
				selectedCompanyId,
				"excel",
				period,
			);

			// Create blob and download
			const blob = new Blob([response.data], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			});
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `ESG-Report-${period}.xlsx`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			setMessage({
				type: "success",
				text: t("reports.excelDownloadSuccess"),
			});
		} catch (error: any) {
			setMessage({ type: "error", text: t("reports.excelDownloadFailed") });
		} finally {
			setLoading(false);
		}
	};

	if (companies.length === 0) {
		return (
			<DashboardLayout>
				<div className="text-center py-8">
					<p className="text-xs text-gray-600 mb-3">{t("reports.noCompany")}</p>
					<a
						href="/dashboard/company"
						className="text-xs text-green-600 hover:underline"
					>
						{t("reports.goToCompany")}
					</a>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="max-w-6xl mx-auto">
				<div className="mb-4">
					<h1 className="text-lg font-semibold text-gray-900 mb-0.5">{t("reports.title")}</h1>
					<p className="text-xs text-gray-600">
						{t("reports.subtitle")}
					</p>
				</div>

				{message.text && (
					<div
						className={`mb-3 px-3 py-2 rounded-lg text-xs ${
							message.type === "success"
								? "bg-green-50 border border-green-200 text-green-700"
								: "bg-red-50 border border-red-200 text-red-700"
						}`}
					>
						{message.text}
					</div>
				)}

				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
					<label className="block text-xs font-medium text-gray-700 mb-1">
						{t("reports.selectCompany")}
					</label>
					<select
						value={selectedCompanyId}
						onChange={(e) => handleCompanyChange(e.target.value)}
						className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
					>
						{companies.map((company) => (
							<option key={company._id} value={company._id}>
								{company.name}
							</option>
						))}
					</select>
				</div>

				{esgScores.length === 0 ? (
					<div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
						<FileText className="mx-auto text-gray-400 mb-3" size={36} />
						<h3 className="text-sm font-semibold text-gray-900 mb-1">
							{t("reports.noReports")}
						</h3>
						<p className="text-xs text-gray-600 mb-4">
							{t("reports.generateReport")}
						</p>
						<a
							href="/dashboard/environment"
							className="inline-block px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
						>
							{t("dashboard.addMetrics")}
						</a>
					</div>
				) : (
					<div className="space-y-3">
						<h2 className="text-sm font-semibold text-gray-900 mb-3">
							{t("reports.availableReports")}
						</h2>

						{esgScores.map((score) => (
							<div
								key={score._id}
								className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="p-2 bg-green-100 rounded-lg">
											<FileText className="text-green-600" size={18} />
										</div>
										<div>
											<h3 className="text-sm font-semibold text-gray-900">
												{t("reports.esgReport")} - {score.period}
											</h3>
											<div className="flex items-center gap-3 mt-0.5 text-xs text-gray-600">
												<span className="flex items-center gap-1">
													<Calendar size={12} />
													{score.calculatedAt ? new Date(score.calculatedAt).toLocaleDateString(
														"en-IN",
													) : "-"}
												</span>
												<span>
													{t("reports.overall")} {t("reports.score")}:{" "}
													<strong>{score.overallScore.toFixed(1)}</strong>
												</span>
											</div>
										</div>
									</div>

									<div className="flex gap-2">
										<button
											onClick={() => handleDownloadPDF(score.period)}
											disabled={loading}
											className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
										>
											<Download size={14} />
											PDF
										</button>
										<button
											onClick={() => handleDownloadExcel(score.period)}
											disabled={loading}
											className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
										>
											<Download size={14} />
											Excel
										</button>
									</div>
								</div>

								{/* Score Summary */}
								<div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-200">
									<div>
										<p className="text-xs text-gray-600 mb-0.5">{t("reports.overall")}</p>
										<p className="text-lg font-semibold text-gray-900">
											{score.overallScore.toFixed(1)}
										</p>
									</div>
									<div>
										<p className="text-xs text-gray-600 mb-0.5">{t("reports.environmental")}</p>
										<p className="text-lg font-semibold text-green-600">
											{score.environmentalScore.toFixed(1)}
										</p>
									</div>
									<div>
										<p className="text-xs text-gray-600 mb-0.5">{t("reports.social")}</p>
										<p className="text-lg font-semibold text-green-600">
											{score.socialScore.toFixed(1)}
										</p>
									</div>
									<div>
										<p className="text-xs text-gray-600 mb-0.5">{t("reports.governance")}</p>
										<p className="text-lg font-semibold text-purple-600">
											{score.governanceScore.toFixed(1)}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}
