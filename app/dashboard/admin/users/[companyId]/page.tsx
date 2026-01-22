"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { adminAPI, companyAPI } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { SkeletonTable } from "@/components/Skeleton";
import { useTranslation } from "@/hooks/useTranslation";
import {
	Users,
	Edit,
	Trash2,
	Key,
	ArrowLeft,
	Building2,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";

interface User {
	id: string;
	email: string;
	name: string;
	companyId?: string | null;
	companyName?: string | null;
	plan: "starter" | "pro" | "enterprise";
	role: "USER" | "ADMIN" | "AUDITOR";
	createdAt: string;
	updatedAt: string;
}

export default function CompanyUsersPage() {
	const router = useRouter();
	const params = useParams();
	const companyId = params.companyId as string;
	const { t } = useTranslation();
	const [users, setUsers] = useState<User[]>([]);
	const [company, setCompany] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [showEditModal, setShowEditModal] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		plan: "starter" as "starter" | "pro" | "enterprise",
		role: "USER" as "USER" | "ADMIN" | "AUDITOR",
	});

	useEffect(() => {
		if (companyId) {
			loadCompanyUsers();
			loadCompany();
		}
	}, [companyId]);

	const loadCompany = async () => {
		try {
			const response = await companyAPI.getById(companyId);
			setCompany(response.data.company);
		} catch (error) {
			console.error("Failed to load company:", error);
		}
	};

	const loadCompanyUsers = async () => {
		try {
			setLoading(true);
			setError("");
			const response = await adminAPI.getUsers();
			// Filter users by companyId
			const companyUsers = response.data.users.filter(
				(user: User) => user.companyId === companyId
			);
			setUsers(companyUsers);
		} catch (err: any) {
			if (err.response?.status === 401) {
				setError("Your session has expired. Please login again.");
				setTimeout(() => {
					router.push("/auth/login");
				}, 2000);
			} else if (err.response?.status === 403) {
				setError("Admin access required.");
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
			await loadCompanyUsers();
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
			await adminAPI.resetUserPassword(userId, true);
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
			await loadCompanyUsers();
		} catch (err: any) {
			showToast.error(err.response?.data?.error || "Failed to delete user");
		} finally {
			setActionLoading(null);
		}
	};

	const openEditModal = (user: User) => {
		setSelectedUser(user);
		setFormData({
			name: user.name,
			plan: user.plan,
			role: user.role,
		});
		setShowEditModal(true);
	};

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
					<div className="flex items-center gap-3">
						<button
							onClick={() => router.push("/dashboard/admin/users")}
							className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
							title="Back to Users"
						>
							<ArrowLeft size={18} className="text-gray-600" />
						</button>
						<div>
							<h1 className="text-lg font-semibold text-gray-900 mb-0.5">
								{company?.name || "Company"} Users
							</h1>
							<p className="text-xs text-gray-600">
								Manage users from {company?.name || "this company"}
							</p>
						</div>
					</div>
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
						{error}
					</div>
				)}

				{/* Company Info Card */}
				{company && (
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
						<div className="flex items-center gap-3">
							<Building2 size={20} className="text-gray-600" />
							<div>
								<h3 className="text-sm font-semibold text-gray-900">{company.name}</h3>
								<p className="text-xs text-gray-500">
									{company.industry} • {company.location}
								</p>
							</div>
							<div className="ml-auto">
								<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanBadgeColor(company.plan)}`}>
									{company.plan?.toUpperCase() || "STARTER"}
								</span>
							</div>
						</div>
					</div>
				)}

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
									{users.length === 0 ? (
										<tr>
											<td colSpan={5} className="px-2 py-8 text-center text-gray-500">
												<Users size={36} className="mx-auto mb-3 text-gray-300" />
												<p className="text-xs">No users found for this company</p>
											</td>
										</tr>
									) : (
										users.map((user) => (
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
				<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
						<div className="text-xs text-gray-600">Total Users</div>
						<div className="text-lg font-semibold text-gray-900">{users.length}</div>
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
									value={selectedUser.email}
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

