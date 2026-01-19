"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { adminAPI, companyAPI } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { exportToExcel } from "@/lib/export";
import { SkeletonTable } from "@/components/Skeleton";
import { useTranslation } from "@/hooks/useTranslation";
import {
	Users,
	Plus,
	Edit,
	Trash2,
	Key,
	Mail,
	UserPlus,
	Search,
	Filter,
	Download,
	Building2,
	CreditCard,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface User {
	id: string;
	email: string;
	name: string;
	plan: "starter" | "pro" | "enterprise";
	role: "USER" | "ADMIN" | "AUDITOR";
	createdAt: string;
	updatedAt: string;
}

export default function AdminUsersPage() {
	const router = useRouter();
	const { t } = useTranslation();
	const [users, setUsers] = useState<User[]>([]);
	const [companies, setCompanies] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [filterRole, setFilterRole] = useState<string>("all");
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	
	// Test mode dropdowns (for admin to test different plans/companies)
	const [testCompanyId, setTestCompanyId] = useState<string>("");
	const [testPlan, setTestPlan] = useState<"starter" | "pro" | "enterprise">("starter");
	const [currentUser, setCurrentUser] = useState<any>(null);

	const [formData, setFormData] = useState({
		email: "",
		name: "",
		plan: "starter" as "starter" | "pro" | "enterprise",
		role: "USER" as "USER" | "ADMIN" | "AUDITOR",
		sendInvitation: true,
	});

	useEffect(() => {
		loadUsers();
		loadCompanies();
		loadCurrentUser();
	}, []);
	
	// Load companies for testing
	const loadCompanies = async () => {
		try {
			const response = await companyAPI.getAll();
			setCompanies(response.data.companies);
			if (response.data.companies.length > 0) {
				// Load test company from localStorage or use first company
				const savedTestCompany = localStorage.getItem("admin_test_company");
				if (savedTestCompany) {
					setTestCompanyId(savedTestCompany);
				} else {
					setTestCompanyId(response.data.companies[0]._id);
				}
			}
		} catch (error) {
			console.error("Failed to load companies:", error);
		}
	};
	
	// Load current user for plan testing
	const loadCurrentUser = async () => {
		try {
			const userData = localStorage.getItem("user");
			if (userData) {
				const user = JSON.parse(userData);
				setCurrentUser(user);
				// Load test plan from localStorage or use current plan
				const savedTestPlan = localStorage.getItem("admin_test_plan") as "starter" | "pro" | "enterprise" | null;
				if (savedTestPlan) {
					setTestPlan(savedTestPlan);
				} else {
					setTestPlan(user.plan || "starter");
				}
			}
		} catch (error) {
			console.error("Failed to load current user:", error);
		}
	};
	
	// Handle test company change
	const handleTestCompanyChange = (companyId: string) => {
		setTestCompanyId(companyId);
		localStorage.setItem("admin_test_company", companyId);
		showToast.success("Test company changed. Refresh to see changes.");
	};
	
	// Handle test plan change
	const handleTestPlanChange = (plan: "starter" | "pro" | "enterprise") => {
		setTestPlan(plan);
		localStorage.setItem("admin_test_plan", plan);
		// Clear feature cache to force refresh
		if (typeof window !== "undefined") {
			const { clearFeatureCache } = require("@/lib/features");
			clearFeatureCache();
		}
		showToast.success(`Test plan changed to ${plan.toUpperCase()}. Refresh page to see module changes.`);
	};

	const loadUsers = async () => {
		try {
			setLoading(true);
			setError("");
			const response = await adminAPI.getUsers();
			setUsers(response.data.users);
		} catch (err: any) {
			if (err.response?.status === 401) {
				// Unauthorized - token invalid or expired
				setError("Your session has expired. Please login again.");
				setTimeout(() => {
					router.push("/auth/login");
				}, 2000);
			} else if (err.response?.status === 403) {
				// Forbidden - not admin
				setError("Admin access required. You don't have permission to access this page.");
				setTimeout(() => {
					router.push("/dashboard");
				}, 3000);
			} else {
				const errorMsg = err.response?.data?.error || "Failed to load users";
				setError(errorMsg);
				showToast.error(errorMsg);
			}
		} finally {
			setLoading(false);
		}
	};

	const handleCreateUser = async (e: React.FormEvent) => {
		e.preventDefault();
		setActionLoading("create");

		try {
			await adminAPI.createUser(formData);
			setShowCreateModal(false);
			setFormData({
				email: "",
				name: "",
				plan: "starter",
				role: "USER",
				sendInvitation: true,
			});
			showToast.success("User created successfully!");
			await loadUsers();
		} catch (err: any) {
			showToast.error(err.response?.data?.error || "Failed to create user");
		} finally {
			setActionLoading(null);
		}
	};

	const handleUpdateUser = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedUser) return;

		setActionLoading("update");

		try {
			await adminAPI.updateUser(selectedUser.id, {
				name: formData.name,
				plan: formData.plan,
				role: formData.role,
			});
			setShowEditModal(false);
			setSelectedUser(null);
			showToast.success("User updated successfully!");
			await loadUsers();
		} catch (err: any) {
			showToast.error(err.response?.data?.error || "Failed to update user");
		} finally {
			setActionLoading(null);
		}
	};

	const handleResetPassword = async (userId: string) => {
		if (!confirm("Are you sure you want to reset this user's password?")) return;

		setActionLoading(`reset-${userId}`);

		try {
			const response = await adminAPI.resetUserPassword(userId, true);
			showToast.success("Password reset successfully! User will receive email with new password.");
		} catch (err: any) {
			showToast.error(err.response?.data?.error || "Failed to reset password");
		} finally {
			setActionLoading(null);
		}
	};

	const handleDeleteUser = async (userId: string) => {
		if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

		setActionLoading(`delete-${userId}`);

		try {
			await adminAPI.deleteUser(userId);
			showToast.success("User deleted successfully!");
			await loadUsers();
		} catch (err: any) {
			showToast.error(err.response?.data?.error || "Failed to delete user");
		} finally {
			setActionLoading(null);
		}
	};

	const openEditModal = (user: User) => {
		setSelectedUser(user);
		setFormData({
			email: user.email,
			name: user.name,
			plan: user.plan,
			role: user.role,
			sendInvitation: false,
		});
		setShowEditModal(true);
	};

	// Filter users
	const filteredUsers = users.filter((user) => {
		const matchesSearch =
			user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.email.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesRole = filterRole === "all" || user.role === filterRole;
		return matchesSearch && matchesRole;
	});

	const getRoleBadgeColor = (role: string) => {
		switch (role) {
			case "ADMIN":
				return "bg-purple-100 text-purple-700";
			case "AUDITOR":
				return "bg-blue-100 text-blue-700";
			default:
				return "bg-gray-100 text-gray-700";
		}
	};

	const getPlanBadgeColor = (plan: string) => {
		switch (plan) {
			case "enterprise":
				return "bg-green-100 text-green-700";
			case "pro":
				return "bg-blue-100 text-blue-700";
			default:
				return "bg-gray-100 text-gray-700";
		}
	};

	const handleExport = () => {
		if (filteredUsers.length === 0) {
			showToast.error("No users to export");
			return;
		}

		const exportData = filteredUsers.map((user) => ({
			Name: user.name,
			Email: user.email,
			Plan: user.plan.toUpperCase(),
			Role: user.role,
			"Created At": new Date(user.createdAt).toLocaleDateString(),
		}));

		exportToExcel(exportData, {
			filename: `users-export-${new Date().toISOString().split("T")[0]}.xlsx`,
			sheetName: "Users",
		});
		showToast.success("Users exported successfully!");
	};

	if (loading) {
		return (
			<DashboardLayout>
				<div className="flex items-center justify-center h-48">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
				</div>
			</DashboardLayout>
		);
	}

	if (error && error.includes("Admin access required")) {
		return (
			<DashboardLayout>
				<div className="max-w-2xl mx-auto text-center py-8">
					<div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
						<p className="font-semibold mb-1">Access Denied</p>
						<p>{error}</p>
						<p className="text-xs mt-1">Redirecting to dashboard...</p>
					</div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="space-y-3">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-lg font-semibold text-gray-900 mb-0.5">User Management</h1>
						<p className="text-xs text-gray-600">Manage users, roles, and access</p>
					</div>
					<div className="flex gap-2">
						<button
							onClick={handleExport}
							disabled={users.length === 0}
							className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<Download size={14} />
							Export
						</button>
						<button
							onClick={() => setShowCreateModal(true)}
							className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
						>
							<UserPlus size={14} />
							Create User
						</button>
					</div>
				</div>

				{/* Admin Test Mode Dropdowns */}
				<div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
					<div className="flex items-center gap-2 mb-2">
						<span className="text-xs font-semibold text-purple-900">Admin Test Mode:</span>
						<span className="text-xs text-purple-700">Switch company/plan to test features</span>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						{/* Company Dropdown */}
						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
								<Building2 size={12} />
								Test Company
							</label>
							<select
								value={testCompanyId}
								onChange={(e) => handleTestCompanyChange(e.target.value)}
								className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
							>
								<option value="">Select Company (for testing)</option>
								{companies.map((company) => (
									<option key={company._id} value={company._id}>
										{company.name}
									</option>
								))}
							</select>
						</div>

						{/* Plan Dropdown */}
						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
								<CreditCard size={12} />
								Test Plan
							</label>
							<select
								value={testPlan}
								onChange={(e) => handleTestPlanChange(e.target.value as "starter" | "pro" | "enterprise")}
								className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
							>
								<option value="starter">Starter</option>
								<option value="pro">Pro</option>
								<option value="enterprise">Enterprise</option>
							</select>
						</div>
					</div>
					<div className="mt-2 text-xs text-purple-600">
						💡 Changes affect feature visibility. Refresh page to see module changes.
					</div>
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
						{error}
					</div>
				)}

				{/* Filters */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
					<div className="flex flex-col md:flex-row gap-3">
						<div className="flex-1 relative">
							<Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
							<input
								type="text"
								placeholder="Search by name or email..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
							/>
						</div>
						<div className="flex items-center gap-2">
							<Filter size={14} className="text-gray-400" />
							<select
								value={filterRole}
								onChange={(e) => setFilterRole(e.target.value)}
								className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
							>
								<option value="all">All Roles</option>
								<option value="ADMIN">Admin</option>
								<option value="USER">User</option>
								<option value="AUDITOR">Auditor</option>
							</select>
						</div>
					</div>
				</div>

				{/* Users Table */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
					{loading ? (
						<SkeletonTable rows={5} cols={5} />
					) : (
						<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 border-b border-gray-200">
								<tr>
									<th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										User
									</th>
									<th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Plan
									</th>
									<th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Role
									</th>
									<th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Created
									</th>
									<th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{filteredUsers.length === 0 ? (
									<tr>
										<td colSpan={5} className="px-2 py-8 text-center text-gray-500">
											<Users size={36} className="mx-auto mb-3 text-gray-300" />
											<p className="text-xs">No users found</p>
										</td>
									</tr>
								) : (
									filteredUsers.map((user) => (
										<tr key={user.id} className="hover:bg-gray-50">
											<td className="px-2 py-2 whitespace-nowrap">
												<div>
													<div className="text-xs font-medium text-gray-900">{user.name}</div>
													<div className="text-xs text-gray-500">{user.email}</div>
												</div>
											</td>
											<td className="px-2 py-2 whitespace-nowrap">
												<span
													className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getPlanBadgeColor(
														user.plan
													)}`}
												>
													{user.plan.toUpperCase()}
												</span>
											</td>
											<td className="px-2 py-2 whitespace-nowrap">
												<span
													className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getRoleBadgeColor(
														user.role
													)}`}
												>
													{user.role}
												</span>
											</td>
											<td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
												{new Date(user.createdAt).toLocaleDateString()}
											</td>
											<td className="px-2 py-2 whitespace-nowrap text-right text-xs font-medium">
												<div className="flex items-center justify-end gap-1">
													<button
														onClick={() => openEditModal(user)}
														className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
														title="Edit User"
													>
														<Edit size={14} />
													</button>
													<button
														onClick={() => handleResetPassword(user.id)}
														disabled={actionLoading === `reset-${user.id}`}
														className="text-yellow-600 hover:text-yellow-900 p-1 hover:bg-yellow-50 rounded transition-colors disabled:opacity-50"
														title="Reset Password"
													>
														<Key size={14} />
													</button>
													<button
														onClick={() => handleDeleteUser(user.id)}
														disabled={actionLoading === `delete-${user.id}`}
														className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
														title="Delete User"
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
					)}
				</div>

				{/* Stats */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-3">
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
						<div className="text-xs text-gray-600">Total Users</div>
						<div className="text-lg font-semibold text-gray-900">{users.length}</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
						<div className="text-xs text-gray-600">Admins</div>
						<div className="text-lg font-semibold text-purple-600">
							{users.filter((u) => u.role === "ADMIN").length}
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
						<div className="text-xs text-gray-600">Regular Users</div>
						<div className="text-lg font-semibold text-gray-600">
							{users.filter((u) => u.role === "USER").length}
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
						<div className="text-xs text-gray-600">Auditors</div>
						<div className="text-lg font-semibold text-blue-600">
							{users.filter((u) => u.role === "AUDITOR").length}
						</div>
					</div>
				</div>
			</div>

			{/* Create User Modal */}
			{showCreateModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg border border-gray-200 shadow-lg max-w-lg w-full p-4 gap-3">
						<h2 className="text-lg font-semibold text-gray-900 mb-3">Create New User</h2>
						<form onSubmit={handleCreateUser} className="space-y-3">
							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
								<input
									type="email"
									required
									value={formData.email}
									onChange={(e) => setFormData({ ...formData, email: e.target.value })}
									className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder="user@company.com"
								/>
							</div>
							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
								<input
									type="text"
									required
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder="Full Name"
								/>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1">Plan</label>
									<select
										value={formData.plan}
										onChange={(e) =>
											setFormData({ ...formData, plan: e.target.value as any })
										}
										className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									>
										<option value="starter">Starter</option>
										<option value="pro">Pro</option>
										<option value="enterprise">Enterprise</option>
									</select>
								</div>
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
									<select
										value={formData.role}
										onChange={(e) =>
											setFormData({ ...formData, role: e.target.value as any })
										}
										className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									>
										<option value="USER">User</option>
										<option value="ADMIN">Admin</option>
										<option value="AUDITOR">Auditor</option>
									</select>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									id="sendInvitation"
									checked={formData.sendInvitation}
									onChange={(e) =>
										setFormData({ ...formData, sendInvitation: e.target.checked })
									}
									className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
								/>
								<label htmlFor="sendInvitation" className="text-xs text-gray-700">
									Send invitation email with temporary password
								</label>
							</div>
							<div className="flex gap-2 pt-3">
								<button
									type="submit"
									disabled={actionLoading === "create"}
									className="flex-1 px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-400 transition-colors"
								>
									{actionLoading === "create" ? "Creating..." : "Create User"}
								</button>
								<button
									type="button"
									onClick={() => {
										setShowCreateModal(false);
										setFormData({
											email: "",
											name: "",
											plan: "starter",
											role: "USER",
											sendInvitation: true,
										});
									}}
									className="px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Edit User Modal */}
			{showEditModal && selectedUser && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg border border-gray-200 shadow-lg max-w-lg w-full p-4 gap-3">
						<h2 className="text-lg font-semibold text-gray-900 mb-3">Edit User</h2>
						<form onSubmit={handleUpdateUser} className="space-y-3">
							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
								<input
									type="email"
									value={formData.email}
									disabled
									className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
								/>
								<p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
							</div>
							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
								<input
									type="text"
									required
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								/>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1">Plan</label>
									<select
										value={formData.plan}
										onChange={(e) =>
											setFormData({ ...formData, plan: e.target.value as any })
										}
										className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									>
										<option value="starter">Starter</option>
										<option value="pro">Pro</option>
										<option value="enterprise">Enterprise</option>
									</select>
								</div>
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
									<select
										value={formData.role}
										onChange={(e) =>
											setFormData({ ...formData, role: e.target.value as any })
										}
										className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									>
										<option value="USER">User</option>
										<option value="ADMIN">Admin</option>
										<option value="AUDITOR">Auditor</option>
									</select>
								</div>
							</div>
							<div className="flex gap-2 pt-3">
								<button
									type="submit"
									disabled={actionLoading === "update"}
									className="flex-1 px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-400 transition-colors"
								>
									{actionLoading === "update" ? "Updating..." : "Update User"}
								</button>
								<button
									type="button"
									onClick={() => {
										setShowEditModal(false);
										setSelectedUser(null);
									}}
									className="px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</DashboardLayout>
	);
}

