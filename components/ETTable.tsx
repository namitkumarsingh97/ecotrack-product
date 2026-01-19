"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import { Download, RefreshCw, Settings, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { exportToExcel } from "@/lib/export";

interface Column {
	label: string;
	field: string;
	sortable?: boolean;
	formatFn?: (value: any, row?: any) => string | ReactNode;
}

interface ETTableProps {
	columns: Column[];
	rows: any[];
	loading?: boolean;
	error?: string;
	title?: string;
	showSelection?: boolean;
	lineNumbers?: boolean;
	showSearch?: boolean;
	showDownloadBtn?: boolean;
	showRefreshBtn?: boolean;
	showSettingsBtn?: boolean;
	disableDownload?: boolean;
	showSort?: boolean;
	paginationEnabled?: boolean;
	placeholder?: string;
	rowCount?: number;
	downloadName?: string;
	excelColumns?: Record<string, string>;
	excelRows?: any[];
	emptyText?: string;
	totalRecords?: number;
	onRefresh?: () => void;
	onSettingsClick?: () => void;
	onRowClick?: (row: any) => void;
	onSelectedRowsChange?: (rows: any[]) => void;
	onDirectBtnClick?: () => void;
	onPerPageChange?: (params: any) => void;
	onPageChange?: (params: any) => void;
	onSearch?: (params: any) => void;
	onSortChange?: (params: any) => void;
	onPrint?: () => void;
	onPdf?: () => void;
	onColumnFilterChange?: (params: any) => void;
	rowStyleClassFn?: (row: any) => string;
	children?: ReactNode;
	tableActions?: ReactNode;
}

export default function ETTable({
	columns,
	rows,
	loading = false,
	error = "",
	title = "",
	showSelection = false,
	lineNumbers = false,
	showSearch = true,
	showDownloadBtn = true,
	showRefreshBtn = false,
	showSettingsBtn = false,
	disableDownload = false,
	showSort = true,
	paginationEnabled = true,
	placeholder = "Search table...",
	rowCount = 20,
	downloadName = "",
	excelColumns,
	excelRows,
	emptyText = "No records found",
	totalRecords = 0,
	onRefresh,
	onSettingsClick,
	onRowClick,
	onSelectedRowsChange,
	onDirectBtnClick,
	onPerPageChange,
	onPageChange,
	onSearch,
	onSortChange,
	onPrint,
	onPdf,
	onColumnFilterChange,
	rowStyleClassFn,
	children,
	tableActions,
}: ETTableProps) {
	const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedRows, setSelectedRows] = useState<any[]>([]);
	const [sortConfig, setSortConfig] = useState<{ field: string; direction: "asc" | "desc" } | null>(null);
	const tableRef = useRef<HTMLDivElement>(null);

	const showActionBar = showSettingsBtn || showRefreshBtn || !!onDirectBtnClick || showDownloadBtn || !!tableActions;

	// Filtered and sorted rows
	const filteredRows = rows.filter((row) => {
		if (!searchTerm) return true;
		const searchLower = searchTerm.toLowerCase();
		return Object.values(row).some((val) =>
			String(val).toLowerCase().includes(searchLower)
		);
	});

	const sortedRows = sortConfig
		? [...filteredRows].sort((a, b) => {
				const aVal = a[sortConfig.field];
				const bVal = b[sortConfig.field];
				if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
				if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
				return 0;
		  })
		: filteredRows;

	// Pagination
	const totalPages = Math.ceil(sortedRows.length / rowCount);
	const startIndex = (currentPage - 1) * rowCount;
	const paginatedRows = paginationEnabled
		? sortedRows.slice(startIndex, startIndex + rowCount)
		: sortedRows;

	const handleSort = (field: string) => {
		if (!showSort) return;
		setSortConfig((prev) => {
			if (prev?.field === field) {
				return prev.direction === "asc" ? { field, direction: "desc" } : null;
			}
			return { field, direction: "asc" };
		});
	};

	const handleDownload = () => {
		const downloadData = excelRows && excelRows.length > 0 ? excelRows : rows;
		
		exportToExcel(downloadData, {
			filename: downloadName || title || "data",
			sheetName: title || "Sheet1",
		});
	};

	const handlePrint = () => {
		setDownloadMenuOpen(false);
		if (onPrint) {
			onPrint();
		} else {
			window.print();
		}
	};

	const handleRowClick = (row: any) => {
		if (onRowClick) {
			onRowClick(row);
		}
	};

	const handleSelectRow = (row: any, checked: boolean) => {
		if (checked) {
			setSelectedRows([...selectedRows, row]);
		} else {
			setSelectedRows(selectedRows.filter((r) => r !== row));
		}
		if (onSelectedRowsChange) {
			onSelectedRowsChange(checked ? [...selectedRows, row] : selectedRows.filter((r) => r !== row));
		}
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedRows([...paginatedRows]);
		} else {
			setSelectedRows([]);
		}
		if (onSelectedRowsChange) {
			onSelectedRowsChange(checked ? [...paginatedRows] : []);
		}
	};

	useEffect(() => {
		if (onSearch && searchTerm) {
			const timeoutId = setTimeout(() => {
				onSearch({ searchTerm });
			}, 500);
			return () => clearTimeout(timeoutId);
		}
	}, [searchTerm, onSearch]);

	if (error) {
		return (
			<div className="mt-2">
				<p className="mt-4 text-red-500 text-xs">{error}</p>
			</div>
		);
	}

	return (
		<div className="mt-2">
			{showActionBar && (
				<div className="flex items-center gap-2 w-full bg-gray-100 border-t border-l border-r border-gray-200 px-2 py-1">
					{title && <div className="text-sm font-medium text-gray-900">{title}</div>}
					<div className="flex-1">{tableActions}</div>
					<div className="flex items-center gap-2 justify-end">
						{showSettingsBtn && (
							<button
								onClick={onSettingsClick}
								className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
								title="Column Configuration"
							>
								<Settings size={14} />
							</button>
						)}
						{showRefreshBtn && (
							<button
								onClick={onRefresh}
								className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
								title="Refresh"
							>
								<RefreshCw size={14} />
							</button>
						)}
						{onDirectBtnClick && (
							<button
								onClick={onDirectBtnClick}
								disabled={disableDownload}
								className={`p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors ${
									disableDownload ? "opacity-50 cursor-not-allowed" : ""
								}`}
								title={disableDownload ? "Loading Data..." : "Download"}
							>
								<Download size={14} />
							</button>
						)}
						{showDownloadBtn && (
							<div
								className="relative mt-0.5"
								onMouseEnter={() => !disableDownload && setDownloadMenuOpen(true)}
								onMouseLeave={() => setDownloadMenuOpen(false)}
							>
								<button
									disabled={disableDownload}
									className={`p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors ${
										disableDownload ? "opacity-50 cursor-not-allowed" : ""
									}`}
									title={disableDownload ? "Loading Data..." : "Download"}
								>
									<Download size={14} />
								</button>
								{downloadMenuOpen && !disableDownload && (
									<div
										className="absolute right-0 top-full z-50 min-w-[180px] rounded border border-gray-300 bg-white py-1 shadow-sm"
										onMouseEnter={() => setDownloadMenuOpen(true)}
										onMouseLeave={() => setDownloadMenuOpen(false)}
									>
										<button
											onClick={handlePrint}
											className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
										>
											Print
										</button>
										<button
											onClick={handleDownload}
											className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
										>
											Download as XLS
										</button>
									</div>
								)}
								{downloadMenuOpen && disableDownload && (
									<div
										className="absolute right-0 top-full z-50 w-44 rounded border border-gray-300 bg-white py-2 shadow-sm"
										onMouseEnter={() => setDownloadMenuOpen(true)}
										onMouseLeave={() => setDownloadMenuOpen(false)}
									>
										<div className="px-3 text-sm text-gray-500">Loading Data...</div>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			)}

			{showSearch && (
				<div className="bg-white border-l border-r border-gray-200 px-2 py-1.5">
					<div className="relative">
						<Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
						<input
							type="text"
							placeholder={placeholder}
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-8 pr-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
						/>
					</div>
				</div>
			)}

			<div className="bg-white border border-gray-200 overflow-hidden" ref={tableRef}>
				{loading ? (
					<div className="flex justify-center py-10">
						<div className="text-xs text-gray-500">Loading...</div>
					</div>
				) : (
					<>
						<div className="overflow-x-auto">
							<table className="w-full border-collapse">
								<thead className="bg-gray-50 border-b border-gray-200">
									<tr>
										{showSelection && (
											<th className="px-2 py-2 text-left">
												<input
													type="checkbox"
													checked={selectedRows.length === paginatedRows.length && paginatedRows.length > 0}
													onChange={(e) => handleSelectAll(e.target.checked)}
													className="rounded border-gray-300"
												/>
											</th>
										)}
										{lineNumbers && (
											<th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												#
											</th>
										)}
										{columns.map((col) => (
											<th
												key={col.field}
												onClick={() => col.sortable !== false && handleSort(col.field)}
												className={`px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
													col.sortable !== false ? "cursor-pointer hover:bg-gray-100" : ""
												}`}
											>
												<div className="flex items-center gap-1">
													{col.label}
													{sortConfig?.field === col.field && (
														<span className="text-xs">
															{sortConfig.direction === "asc" ? "↑" : "↓"}
														</span>
													)}
												</div>
											</th>
										))}
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{paginatedRows.length === 0 ? (
										<tr>
											<td
												colSpan={columns.length + (showSelection ? 1 : 0) + (lineNumbers ? 1 : 0)}
												className="px-2 py-8 text-center text-xs text-gray-500"
											>
												{emptyText}
											</td>
										</tr>
									) : (
										paginatedRows.map((row, index) => {
											const rowClass = rowStyleClassFn ? rowStyleClassFn(row) : "";
											return (
												<tr
													key={index}
													onClick={() => handleRowClick(row)}
													className={`hover:bg-gray-50 ${rowClass}`}
												>
													{showSelection && (
														<td className="px-2 py-2">
															<input
																type="checkbox"
																checked={selectedRows.some((r) => r === row)}
																onChange={(e) => handleSelectRow(row, e.target.checked)}
																onClick={(e) => e.stopPropagation()}
																className="rounded border-gray-300"
															/>
														</td>
													)}
													{lineNumbers && (
														<td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
															{startIndex + index + 1}
														</td>
													)}
													{columns.map((col) => (
														<td
															key={col.field}
															className="px-2 py-2 whitespace-nowrap text-xs text-gray-900"
														>
															{col.formatFn ? col.formatFn(row[col.field], row) : String(row[col.field] || "")}
														</td>
													))}
												</tr>
											);
										})
									)}
								</tbody>
							</table>
						</div>
						{paginationEnabled && (
							<div className="bg-gray-50 border-t border-gray-200 px-2 py-1.5 flex items-center justify-between">
								<div className="text-xs text-gray-600">
									Showing {startIndex + 1} to {Math.min(startIndex + rowCount, sortedRows.length)} of{" "}
									{sortedRows.length} entries
								</div>
								<div className="flex items-center gap-1">
									<button
										onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
										disabled={currentPage === 1 || totalPages <= 1}
										className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<ChevronLeft size={14} />
									</button>
									<span className="text-xs text-gray-600 px-2">
										Page {currentPage} of {totalPages || 1}
									</span>
									<button
										onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
										disabled={currentPage === totalPages || totalPages <= 1}
										className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<ChevronRight size={14} />
									</button>
								</div>
							</div>
						)}
					</>
				)}
			</div>
			{children}
		</div>
	);
}

