"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { companyAPI, esgAPI } from "@/lib/api";
import { FileText, Download, Calendar } from "lucide-react";

export default function ReportsPage() {
	const [companies, setCompanies] = useState<any[]>([]);
	const [selectedCompanyId, setSelectedCompanyId] = useState("");
	const [esgScores, setEsgScores] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			const companiesRes = await companyAPI.getAll();
			setCompanies(companiesRes.data.companies);

			if (companiesRes.data.companies.length > 0) {
				const companyId = companiesRes.data.companies[0]._id;
				setSelectedCompanyId(companyId);
				await loadScores(companyId);
			}
		} catch (error) {
			console.error("Failed to load data:", error);
		}
	};

	const loadScores = async (companyId: string) => {
		try {
			const scoresRes = await esgAPI.getScore(companyId);
			setEsgScores(scoresRes.data.scores);
		} catch (error) {
			console.error("Failed to load scores:", error);
		}
	};

	const handleCompanyChange = async (companyId: string) => {
		setSelectedCompanyId(companyId);
		await loadScores(companyId);
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
				text: "PDF report downloaded successfully!",
			});
		} catch (error: any) {
			setMessage({ type: "error", text: "Failed to download PDF report" });
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
				text: "Excel report downloaded successfully!",
			});
		} catch (error: any) {
			setMessage({ type: "error", text: "Failed to download Excel report" });
		} finally {
			setLoading(false);
		}
	};

	if (companies.length === 0) {
		return (
			<DashboardLayout>
				<div className="text-center py-12">
					<p className="text-gray-600 mb-4">Please add a company first</p>
					<a
						href="/dashboard/company"
						className="text-green-600 hover:underline"
					>
						Go to Company Page
					</a>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="max-w-6xl mx-auto">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">ESG Reports</h1>
					<p className="text-gray-600">
						Download and share your ESG compliance reports
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

				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Select Company
					</label>
					<select
						value={selectedCompanyId}
						onChange={(e) => handleCompanyChange(e.target.value)}
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
					>
						{companies.map((company) => (
							<option key={company._id} value={company._id}>
								{company.name}
							</option>
						))}
					</select>
				</div>

				{esgScores.length === 0 ? (
					<div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
						<FileText className="mx-auto text-gray-400 mb-4" size={48} />
						<h3 className="text-xl font-semibold text-gray-900 mb-2">
							No Reports Available
						</h3>
						<p className="text-gray-600 mb-6">
							Add metrics and calculate ESG scores to generate reports
						</p>
						<a
							href="/dashboard/environment"
							className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
						>
							Add Metrics
						</a>
					</div>
				) : (
					<div className="space-y-4">
						<h2 className="text-xl font-semibold text-gray-900 mb-4">
							Available Reports
						</h2>

						{esgScores.map((score) => (
							<div
								key={score._id}
								className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4">
										<div className="p-3 bg-green-100 rounded-lg">
											<FileText className="text-green-600" size={24} />
										</div>
										<div>
											<h3 className="text-lg font-semibold text-gray-900">
												ESG Report - {score.period}
											</h3>
											<div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
												<span className="flex items-center gap-1">
													<Calendar size={16} />
													{new Date(score.calculatedAt).toLocaleDateString(
														"en-IN",
													)}
												</span>
												<span>
													Overall Score:{" "}
													<strong>{score.overallScore.toFixed(1)}</strong>
												</span>
											</div>
										</div>
									</div>

									<div className="flex gap-3">
										<button
											onClick={() => handleDownloadPDF(score.period)}
											disabled={loading}
											className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
										>
											<Download size={18} />
											PDF
										</button>
										<button
											onClick={() => handleDownloadExcel(score.period)}
											disabled={loading}
											className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
										>
											<Download size={18} />
											Excel
										</button>
									</div>
								</div>

								{/* Score Summary */}
								<div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
									<div>
										<p className="text-xs text-gray-600 mb-1">Overall</p>
										<p className="text-2xl font-bold text-gray-900">
											{score.overallScore.toFixed(1)}
										</p>
									</div>
									<div>
										<p className="text-xs text-gray-600 mb-1">Environmental</p>
										<p className="text-2xl font-bold text-green-600">
											{score.environmentalScore.toFixed(1)}
										</p>
									</div>
									<div>
										<p className="text-xs text-gray-600 mb-1">Social</p>
										<p className="text-2xl font-bold text-green-600">
											{score.socialScore.toFixed(1)}
										</p>
									</div>
									<div>
										<p className="text-xs text-gray-600 mb-1">Governance</p>
										<p className="text-2xl font-bold text-purple-600">
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
