"use client";

import { useEffect, useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { evidenceAPI } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { FolderOpen, Upload, Link2, AlertCircle, CheckCircle2, XCircle, Clock, FileText, X } from "lucide-react";
import { useCompanyStore } from "@/stores";
import { useTranslation } from "@/hooks/useTranslation";
import ETTable from "@/components/ETTable";

interface EvidenceItem {
	_id: string;
	evidenceType: string;
	esgArea: "Environmental" | "Social" | "Governance";
	linkedTo: string;
	status: "Linked" | "Missing" | "Pending";
	expiryDate?: string;
	uploadedAt: string;
}

interface EvidenceDashboard {
	statistics: {
		totalDocuments: number;
		linkedDocuments: number;
		pendingEvidence: number;
		expiringSoon: number;
	};
	evidenceTable: EvidenceItem[];
}

export default function EvidenceVaultPage() {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<EvidenceDashboard | null>(null);
	const [showUploadModal, setShowUploadModal] = useState(false);
	const [showLinkModal, setShowLinkModal] = useState(false);
	const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
	const [uploading, setUploading] = useState(false);
	const [linking, setLinking] = useState(false);
	const [linkToValue, setLinkToValue] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [uploadForm, setUploadForm] = useState({
		evidenceType: "",
		esgArea: "Environmental" as "Environmental" | "Social" | "Governance",
		linkedTo: "",
		expiryDate: "",
	});

	// Use company store
	const { selectedCompany, fetchCompanies } = useCompanyStore();

	useEffect(() => {
		fetchCompanies();
	}, [fetchCompanies]);

	useEffect(() => {
		if (selectedCompany?._id) {
			loadDashboard();
		}
	}, [selectedCompany?._id]);

	const loadDashboard = async () => {
		if (!selectedCompany?._id) return;

		setLoading(true);
		try {
			const response = await evidenceAPI.getDashboard(selectedCompany._id);
			setData(response.data);
		} catch (error: any) {
			showToast.error(error.response?.data?.error || "Failed to load evidence dashboard");
		} finally {
			setLoading(false);
		}
	};

	const handleUpload = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedCompany?._id || !fileInputRef.current?.files?.[0]) {
			showToast.error("Please select a file to upload");
			return;
		}

		setUploading(true);
		try {
			const formData = new FormData();
			formData.append("file", fileInputRef.current.files[0]);
			formData.append("evidenceType", uploadForm.evidenceType);
			formData.append("esgArea", uploadForm.esgArea);
			if (uploadForm.linkedTo) formData.append("linkedTo", uploadForm.linkedTo);
			if (uploadForm.expiryDate) formData.append("expiryDate", uploadForm.expiryDate);

			await evidenceAPI.upload(selectedCompany._id, formData);
			showToast.success("Evidence uploaded successfully");
			setShowUploadModal(false);
			setUploadForm({
				evidenceType: "",
				esgArea: "Environmental",
				linkedTo: "",
				expiryDate: "",
			});
			if (fileInputRef.current) fileInputRef.current.value = "";
			await loadDashboard();
		} catch (error: any) {
			showToast.error(error.response?.data?.error || "Failed to upload evidence");
		} finally {
			setUploading(false);
		}
	};

	const handleLink = async () => {
		if (!selectedEvidence?._id || !linkToValue.trim()) {
			showToast.error("Please enter a value to link to");
			return;
		}

		setLinking(true);
		try {
			await evidenceAPI.link(selectedEvidence._id, linkToValue.trim());
			showToast.success("Evidence linked successfully");
			setShowLinkModal(false);
			setSelectedEvidence(null);
			setLinkToValue("");
			await loadDashboard();
		} catch (error: any) {
			showToast.error(error.response?.data?.error || "Failed to link evidence");
		} finally {
			setLinking(false);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this evidence?")) return;

		try {
			await evidenceAPI.delete(id);
			showToast.success("Evidence deleted successfully");
			await loadDashboard();
		} catch (error: any) {
			showToast.error(error.response?.data?.error || "Failed to delete evidence");
		}
	};

	if (!selectedCompany) {
		return (
			<DashboardLayout>
				<div className="text-center py-12">
					<FolderOpen className="mx-auto text-gray-400 mb-4" size={48} />
					<p className="text-gray-600 mb-4">{t("evidenceVault.noCompanySelected")}</p>
					<p className="text-xs text-gray-500">{t("evidenceVault.selectCompanyFromNav")}</p>
				</div>
			</DashboardLayout>
		);
	}

	if (loading) {
		return (
			<DashboardLayout>
				<div className="flex items-center justify-center py-12">
					<div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
				</div>
			</DashboardLayout>
		);
	}

	// Prepare table columns
	const tableColumns = [
		{ label: "Evidence Type", field: "evidenceType", sortable: true },
		{ label: "ESG Area", field: "esgArea", sortable: true },
		{ label: "Linked To", field: "linkedTo", sortable: true },
		{ label: "Status", field: "status", sortable: true },
		{
			label: "Actions",
			field: "actions",
			sortable: false,
			formatFn: (value: any, row: EvidenceItem) => {
				return (
					<div className="flex items-center gap-2">
						{row.status !== "Linked" && (
							<button
								onClick={() => {
									setSelectedEvidence(row);
									setShowLinkModal(true);
								}}
								className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
								title="Link Evidence"
							>
								<Link2 size={12} />
								Link
							</button>
						)}
						<button
							onClick={() => handleDelete(row._id)}
							className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700"
							title="Delete"
						>
							<X size={12} />
							Delete
						</button>
					</div>
				);
			},
		},
	];

	// Prepare table rows
	const tableRows = (data?.evidenceTable || []).map((evidence) => ({
		_id: evidence._id,
		evidenceType: evidence.evidenceType,
		esgArea: evidence.esgArea,
		linkedTo: evidence.linkedTo,
		status:
			evidence.status === "Linked" ? (
				<span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
					<CheckCircle2 size={12} />
					Linked
				</span>
			) : evidence.status === "Pending" ? (
				<span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
					<Clock size={12} />
					Pending
				</span>
			) : (
				<span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
					<XCircle size={12} />
					Missing
				</span>
			),
		actions: { _id: evidence._id },
	}));

	return (
		<DashboardLayout>
			<div className="space-y-4">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-lg font-semibold text-gray-900 mb-0.5">
							{t("evidenceVault.title") || "Evidence Vault"}
						</h1>
						<p className="text-xs text-gray-600">
							{selectedCompany?.name} - {t("evidenceVault.subtitle") || "Document management for ESG compliance"}
						</p>
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={() => setShowUploadModal(true)}
							className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
						>
							<Upload size={14} />
							Upload Evidence
						</button>
					</div>
				</div>

				{/* Summary Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-2">
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
						<div className="text-xs text-gray-600 mb-1">Total Documents Uploaded</div>
						<div className="text-2xl font-semibold text-gray-900">
							{data?.statistics.totalDocuments || 0}
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
						<div className="text-xs text-gray-600 mb-1">Documents Linked to ESG</div>
						<div className="text-2xl font-semibold text-green-600">
							{data?.statistics.linkedDocuments || 0}
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
						<div className="text-xs text-gray-600 mb-1">Pending Evidence</div>
						<div className="text-2xl font-semibold text-yellow-600">
							{data?.statistics.pendingEvidence || 0}
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
						<div className="text-xs text-gray-600 mb-1">Expiring Soon</div>
						<div className="text-2xl font-semibold text-orange-600">
							{data?.statistics.expiringSoon || 0}
						</div>
					</div>
				</div>

				{/* Evidence Status Table */}
				<ETTable
					columns={tableColumns}
					rows={tableRows}
					loading={loading}
					title={`Evidence Status (${data?.evidenceTable.length || 0})`}
					showSearch={true}
					showDownloadBtn={false}
					showRefreshBtn={true}
					showSettingsBtn={false}
					onRefresh={loadDashboard}
					emptyText="No evidence found. Upload your first document to get started."
					totalRecords={data?.evidenceTable.length || 0}
				/>

				{/* Upload Modal */}
				{showUploadModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-lg font-semibold text-gray-900">Upload Evidence</h2>
								<button
									onClick={() => setShowUploadModal(false)}
									className="text-gray-400 hover:text-gray-600"
								>
									<X size={20} />
								</button>
							</div>
							<form onSubmit={handleUpload} className="space-y-4">
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1">
										File *
									</label>
									<input
										ref={fileInputRef}
										type="file"
										required
										accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
										className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									/>
								</div>
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1">
										Evidence Type *
									</label>
									<input
										type="text"
										required
										value={uploadForm.evidenceType}
										onChange={(e) => setUploadForm({ ...uploadForm, evidenceType: e.target.value })}
										className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
										placeholder="e.g., Electricity Bill, POSH Policy, GST Return"
									/>
								</div>
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1">
										ESG Area *
									</label>
									<select
										required
										value={uploadForm.esgArea}
										onChange={(e) => setUploadForm({ ...uploadForm, esgArea: e.target.value as any })}
										className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									>
										<option value="Environmental">Environmental</option>
										<option value="Social">Social</option>
										<option value="Governance">Governance</option>
									</select>
								</div>
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1">
										Link To (Optional)
									</label>
									<input
										type="text"
										value={uploadForm.linkedTo}
										onChange={(e) => setUploadForm({ ...uploadForm, linkedTo: e.target.value })}
										className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
										placeholder="e.g., Energy Consumption, Policy, Compliance"
									/>
								</div>
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1">
										Expiry Date (Optional)
									</label>
									<input
										type="date"
										value={uploadForm.expiryDate}
										onChange={(e) => setUploadForm({ ...uploadForm, expiryDate: e.target.value })}
										className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									/>
								</div>
								<div className="flex items-center gap-2 pt-2">
									<button
										type="submit"
										disabled={uploading}
										className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
									>
										{uploading ? "Uploading..." : "Upload"}
									</button>
									<button
										type="button"
										onClick={() => setShowUploadModal(false)}
										className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
									>
										Cancel
									</button>
								</div>
							</form>
						</div>
					</div>
				)}

				{/* Link Modal */}
				{showLinkModal && selectedEvidence && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-lg font-semibold text-gray-900">Link Evidence</h2>
								<button
									onClick={() => {
										setShowLinkModal(false);
										setSelectedEvidence(null);
									}}
									className="text-gray-400 hover:text-gray-600"
								>
									<X size={20} />
								</button>
							</div>
							<div className="space-y-4">
								<div>
									<div className="text-xs text-gray-600 mb-1">Evidence Type:</div>
									<div className="text-sm font-medium text-gray-900">{selectedEvidence.evidenceType}</div>
								</div>
								<div>
									<div className="text-xs text-gray-600 mb-1">ESG Area:</div>
									<div className="text-sm font-medium text-gray-900">{selectedEvidence.esgArea}</div>
								</div>
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1">
										Link To *
									</label>
									<input
										type="text"
										required
										value={linkToValue}
										onChange={(e) => setLinkToValue(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												handleLink();
											}
										}}
										className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
										placeholder="e.g., Energy Consumption, Policy, Compliance"
									/>
								</div>
								<div className="flex items-center gap-2 pt-2">
									<button
										onClick={handleLink}
										disabled={linking || !linkToValue.trim()}
										className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
									>
										{linking ? "Linking..." : "Link"}
									</button>
									<button
										type="button"
										onClick={() => {
											setShowLinkModal(false);
											setSelectedEvidence(null);
											setLinkToValue("");
										}}
										className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
									>
										Cancel
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}

