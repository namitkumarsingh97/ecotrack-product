/**
 * Export utilities for Excel/CSV export
 * Based on the reference SaaS product's export functionality
 */
import * as XLSX from "xlsx";

export interface ExportOptions {
	filename?: string;
	sheetName?: string;
	headers?: string[];
}

/**
 * Export data to Excel file
 */
export function exportToExcel<T extends Record<string, any>>(
	data: T[],
	options: ExportOptions = {}
): void {
	const {
		filename = `export-${new Date().toISOString().split("T")[0]}.xlsx`,
		sheetName = "Sheet1",
		headers,
	} = options;

	// Create workbook
	const wb = XLSX.utils.book_new();

	// Prepare data
	let exportData: any[] = data;

	// If headers are provided, map data to headers
	if (headers && headers.length > 0) {
		exportData = data.map((row) => {
			const mappedRow: Record<string, any> = {};
			headers.forEach((header, index) => {
				const keys = Object.keys(row);
				if (keys[index]) {
					mappedRow[header] = row[keys[index]];
				}
			});
			return mappedRow;
		});
	}

	// Create worksheet
	const ws = XLSX.utils.json_to_sheet(exportData);

	// Add worksheet to workbook
	XLSX.utils.book_append_sheet(wb, ws, sheetName);

	// Write file
	XLSX.writeFile(wb, filename);
}

/**
 * Export data to CSV file
 */
export function exportToCSV<T extends Record<string, any>>(
	data: T[],
	options: Omit<ExportOptions, "sheetName"> = {}
): void {
	const { filename = `export-${new Date().toISOString().split("T")[0]}.csv`, headers } = options;

	// Get headers from data if not provided
	const dataHeaders = headers || (data.length > 0 ? Object.keys(data[0]) : []);

	// Create CSV content
	const csvRows: string[] = [];

	// Add header row
	if (dataHeaders.length > 0) {
		csvRows.push(dataHeaders.join(","));
	}

	// Add data rows
	data.forEach((row) => {
		const values = dataHeaders.map((header) => {
			const value = row[header];
			// Escape commas and quotes in CSV
			if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
				return `"${value.replace(/"/g, '""')}"`;
			}
			return value ?? "";
		});
		csvRows.push(values.join(","));
	});

	// Create blob and download
	const csvContent = csvRows.join("\n");
	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	const link = document.createElement("a");
	const url = URL.createObjectURL(blob);

	link.setAttribute("href", url);
	link.setAttribute("download", filename);
	link.style.visibility = "hidden";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

/**
 * Format date for export
 */
export function formatDateForExport(date: Date | string | null | undefined): string {
	if (!date) return "";
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleDateString("en-IN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
}

/**
 * Format number for export
 */
export function formatNumberForExport(value: number | null | undefined): string {
	if (value === null || value === undefined) return "";
	return value.toLocaleString("en-IN", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

