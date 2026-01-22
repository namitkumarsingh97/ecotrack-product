"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { tasksAPI, metricsAPI } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { Bell, CheckCircle2, AlertCircle, Clock, TrendingUp, ArrowRight, Plus } from "lucide-react";
import { useCompanyStore } from "@/stores";
import { useTranslation } from "@/hooks/useTranslation";
import ETTable from "@/components/ETTable";
import Link from "next/link";

interface TaskItem {
	_id: string;
	title: string;
	relatedTo: "Evidence" | "Compliance" | "Data" | "Score";
	esgArea: "Environmental" | "Social" | "Governance" | "Overall";
	due: string;
	dueDate: string;
	impact: string;
	priority: "High" | "Medium" | "Low";
	status: "Pending" | "In Progress" | "Completed" | "Overdue";
}

interface TasksDashboard {
	statistics: {
		pendingTasks: number;
		overdueTasks: number;
		dueThisWeek: number;
		completedTasks: number;
	};
	todayFocus: number;
	todayFocusTasks: TaskItem[];
	taskTable: TaskItem[];
}

export default function AlertsTasksPage() {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<TasksDashboard | null>(null);
	const [periods, setPeriods] = useState<string[]>([]);
	const [selectedPeriod, setSelectedPeriod] = useState<string>("latest");

	// Use company store
	const { selectedCompany, fetchCompanies } = useCompanyStore();

	useEffect(() => {
		fetchCompanies();
	}, [fetchCompanies]);

	useEffect(() => {
		// Load periods
		const loadPeriods = async () => {
			try {
				const response = await metricsAPI.getPeriods();
				const backendPeriods = response.data.periods || [];
				setPeriods(backendPeriods);
			} catch (error) {
				console.error("Failed to load periods:", error);
			}
		};
		loadPeriods();
	}, []);

	useEffect(() => {
		if (selectedCompany?._id) {
			loadDashboard();
		}
	}, [selectedCompany?._id, selectedPeriod]);

	const loadDashboard = async () => {
		if (!selectedCompany?._id) return;

		setLoading(true);
		try {
			const period = selectedPeriod === "latest" ? undefined : selectedPeriod;
			const response = await tasksAPI.getDashboard(selectedCompany._id, period);
			setData(response.data);
		} catch (error: any) {
			showToast.error(error.response?.data?.error || "Failed to load tasks dashboard");
		} finally {
			setLoading(false);
		}
	};

	const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

	const handleCompleteTask = async (taskId: string) => {
		// Prevent multiple clicks
		if (completingTaskId === taskId) return;
		
		setCompletingTaskId(taskId);
		try {
			const period = selectedPeriod === "latest" ? undefined : selectedPeriod;
			const response = await tasksAPI.updateStatus(taskId, "Completed", period);
			
			// Log response for debugging
			console.log("Task completion response:", response);
			
			// Explicitly check response status - axios should throw for 400+, but double-check
			if (response && response.status >= 200 && response.status < 300) {
				// Success - task was actually completed
				showToast.success("Task marked as completed");
				await loadDashboard();
			} else {
				// Unexpected status code
				throw new Error(`Unexpected response status: ${response?.status}`);
			}
		} catch (error: any) {
			// Log error for debugging
			console.error("Task completion error details:", {
				error,
				response: error.response,
				status: error.response?.status,
				data: error.response?.data
			});
			
			// Check if it's an axios error with response (400, 500, etc.)
			if (error.response) {
				const status = error.response.status;
				const errorMessage = error.response?.data?.error || "Failed to update task";
				
				// Validation error (400) - task cannot be completed
				if (status === 400) {
					showToast.error(errorMessage);
					console.warn("Task completion validation failed:", errorMessage);
					// Don't reload dashboard - task is still pending
					return;
				}
				
				// Other errors (404, 500, etc.)
				showToast.error(errorMessage);
				console.error("Task completion error:", error);
			} else if (error.request) {
				// Request was made but no response received
				showToast.error("Network error. Please check your connection and try again.");
				console.error("Network error:", error);
			} else {
				// Something else happened
				showToast.error("Failed to update task. Please try again.");
				console.error("Unexpected error:", error);
			}
		} finally {
			setCompletingTaskId(null);
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "High":
				return "text-red-600 bg-red-100";
			case "Medium":
				return "text-yellow-600 bg-yellow-100";
			case "Low":
				return "text-blue-600 bg-blue-100";
			default:
				return "text-gray-600 bg-gray-100";
		}
	};

	const getDueColor = (due: string) => {
		if (due === "Overdue" || due === "Today") return "text-red-600";
		if (due === "Tomorrow" || due.includes("days") && parseInt(due) <= 3) return "text-yellow-600";
		return "text-gray-600";
	};

	if (!selectedCompany) {
		return (
			<DashboardLayout>
				<div className="text-center py-12">
					<Bell className="mx-auto text-gray-400 mb-4" size={48} />
					<p className="text-gray-600 mb-4">{t("alertsTasks.noCompanySelected") || "No company selected"}</p>
					<p className="text-xs text-gray-500">{t("alertsTasks.selectCompanyFromNav") || "Please select a company from the top navigation"}</p>
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

	if (!data) {
		return (
			<DashboardLayout>
				<div className="text-center py-12">
					<Bell className="mx-auto text-gray-400 mb-4" size={48} />
					<h3 className="text-sm font-semibold text-gray-900 mb-2">{t("alertsTasks.noTasks") || "No tasks available"}</h3>
					<p className="text-xs text-gray-600 mb-4">{t("alertsTasks.tasksWillAppear") || "Tasks will appear here based on your ESG data"}</p>
				</div>
			</DashboardLayout>
		);
	}

	// Prepare table columns
	const tableColumns = [
		{ label: "Task", field: "title", sortable: true },
		{ label: "Related To", field: "relatedTo", sortable: true },
		{ label: "ESG Area", field: "esgArea", sortable: true },
		{ 
			label: "Due", 
			field: "due", 
			sortable: true,
			formatFn: (value: any, row: any) => {
				return (
					<span className={`font-medium ${getDueColor(row.dueText)}`}>
						{row.dueText}
					</span>
				);
			}
		},
		{ 
			label: "Impact", 
			field: "impact", 
			sortable: false,
			formatFn: (value: any, row: any) => {
				return (
					<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(row.priority)}`}>
						{row.priority === "High" && <TrendingUp size={10} />}
						{row.impactText}
					</span>
				);
			}
		},
		{
			label: "Actions",
			field: "actions",
			sortable: false,
			formatFn: (value: any, row: TaskItem) => {
				return (
					<div className="flex items-center gap-2">
						{row.status !== "Completed" && (
							<button
								onClick={() => handleCompleteTask(row._id)}
								disabled={completingTaskId === row._id}
								className={`flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 ${
									completingTaskId === row._id ? "opacity-50 cursor-not-allowed" : ""
								}`}
								title="Mark as Completed"
							>
								{completingTaskId === row._id ? (
									<>
										<div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
										Completing...
									</>
								) : (
									<>
										<CheckCircle2 size={12} />
										Complete
									</>
								)}
							</button>
						)}
					</div>
				);
			},
		},
	];

	// Prepare table rows
	const tableRows = data.taskTable.map((task) => ({
		_id: task._id,
		title: task.title,
		relatedTo: task.relatedTo,
		esgArea: task.esgArea,
		due: task.due, // Keep original for sorting
		dueText: task.due, // For rendering
		impact: task.impact, // Keep original for reference
		impactText: task.impact, // For rendering
		priority: task.priority,
		status: task.status,
		actions: { _id: task._id },
	}));

	return (
		<DashboardLayout>
			<div className="space-y-4">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-lg font-semibold text-gray-900 mb-0.5">
							{t("alertsTasks.title") || "Alerts & Tasks"}
						</h1>
						<p className="text-xs text-gray-600">
							{selectedCompany?.name} - {t("alertsTasks.subtitle") || "Action dashboard for ESG improvements"}
						</p>
					</div>
					<div className="flex items-center gap-2">
						{periods.length > 0 && (
							<select
								value={selectedPeriod}
								onChange={(e) => setSelectedPeriod(e.target.value)}
								className="px-3 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
							>
								<option value="latest">Latest Period</option>
								{periods.map((period) => (
									<option key={period} value={period}>
										{period}
									</option>
								))}
							</select>
						)}
					</div>
				</div>

				{/* Today's Focus */}
				{data.todayFocus > 0 && (
					<div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-sm border border-orange-200 p-4">
						<div className="flex items-start gap-3">
							<AlertCircle className="text-orange-600 mt-0.5 flex-shrink-0" size={20} />
							<div className="flex-1">
								<h2 className="text-sm font-semibold text-gray-900 mb-1">
									Today's Focus
								</h2>
								<p className="text-sm text-gray-700 mb-3">
									{data.todayFocus} {data.todayFocus === 1 ? "task" : "tasks"} pending {data.todayFocus === 1 ? "that" : "that"} can improve your ESG score
								</p>
								<div className="space-y-2">
									{data.todayFocusTasks.slice(0, 3).map((task) => (
										<div
											key={task._id}
											className="flex items-center justify-between p-2 bg-white rounded border border-orange-200"
										>
											<div className="flex-1">
												<div className="text-xs font-medium text-gray-900">{task.title}</div>
												<div className="text-xs text-gray-600">{task.esgArea} • {task.impact}</div>
											</div>
											<button
												onClick={() => handleCompleteTask(task._id)}
												className="ml-2 px-2 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700"
											>
												Complete
											</button>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Task Summary Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-2">
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
						<div className="text-xs text-gray-600 mb-1">Pending Tasks</div>
						<div className="text-2xl font-semibold text-yellow-600">
							{data.statistics.pendingTasks}
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
						<div className="text-xs text-gray-600 mb-1">Overdue</div>
						<div className="text-2xl font-semibold text-red-600">
							{data.statistics.overdueTasks}
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
						<div className="text-xs text-gray-600 mb-1">Due this week</div>
						<div className="text-2xl font-semibold text-orange-600">
							{data.statistics.dueThisWeek}
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
						<div className="text-xs text-gray-600 mb-1">Completed</div>
						<div className="text-2xl font-semibold text-green-600">
							{data.statistics.completedTasks}
						</div>
					</div>
				</div>

				{/* Task Table */}
				<ETTable
					columns={tableColumns}
					rows={tableRows}
					loading={loading}
					title={`Tasks (${data.taskTable.length})`}
					showSearch={true}
					showDownloadBtn={false}
					showRefreshBtn={true}
					showSettingsBtn={false}
					onRefresh={loadDashboard}
					emptyText="No tasks found. Tasks will be generated based on your ESG data gaps."
					totalRecords={data.taskTable.length}
				/>
			</div>
		</DashboardLayout>
	);
}

