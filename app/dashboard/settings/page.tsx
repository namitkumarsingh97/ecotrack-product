"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { showToast } from "@/lib/toast";
import { Settings, User, Lock, Bell, Shield } from "lucide-react";
import { useUserStore } from "@/stores";
import { useTranslation } from "@/hooks/useTranslation";

export default function SettingsPage() {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(true);

	// Use user store
	const { user, fetchUser, isLoading } = useUserStore();

	useEffect(() => {
		// Fetch user from store (with caching)
		fetchUser().finally(() => {
			setLoading(false);
		});
	}, [fetchUser]);

	if (loading || isLoading) {
		return (
			<DashboardLayout>
				<div className="flex items-center justify-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="space-y-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 mb-1">{t("settings.title")}</h1>
					<p className="text-sm text-gray-600">{t("settings.subtitle")}</p>
				</div>

				{/* Profile Settings */}
				<div className="bg-white rounded-lg border border-gray-200 p-4">
					<div className="flex items-center gap-3 mb-4">
						<div className="p-2 bg-green-100 rounded-lg">
							<User className="text-green-600" size={20} />
						</div>
						<div>
							<h2 className="text-base font-semibold text-gray-900">{t("settings.profileInformation")}</h2>
							<p className="text-xs text-gray-500">{t("settings.updatePersonalInfo")}</p>
						</div>
					</div>
					<div className="space-y-3">
						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">{t("common.name")}</label>
							<input
								type="text"
								value={user?.name || ""}
								disabled
								className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-gray-50"
							/>
							<p className="text-xs text-gray-500 mt-1">{t("settings.contactAdminToChange")}</p>
						</div>
						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">{t("common.email")}</label>
							<input
								type="email"
								value={user?.email || ""}
								disabled
								className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-gray-50"
							/>
							<p className="text-xs text-gray-500 mt-1">{t("settings.contactAdminToChangeEmail")}</p>
						</div>
						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">{t("admin.plan")}</label>
							<input
								type="text"
								value={user?.plan?.toUpperCase() || "STARTER"}
								disabled
								className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-gray-50"
							/>
						</div>
					</div>
				</div>

				{/* Security Settings */}
				<div className="bg-white rounded-lg border border-gray-200 p-4">
					<div className="flex items-center gap-3 mb-4">
						<div className="p-2 bg-blue-100 rounded-lg">
							<Lock className="text-blue-600" size={20} />
						</div>
						<div>
							<h2 className="text-base font-semibold text-gray-900">{t("settings.security")}</h2>
							<p className="text-xs text-gray-500">{t("settings.managePassword")}</p>
						</div>
					</div>
					<div className="space-y-3">
						<button
							onClick={() => showToast.info(t("settings.passwordResetComingSoon"))}
							className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
						>
							{t("auth.changePassword")}
						</button>
					</div>
				</div>

				{/* Notifications */}
				<div className="bg-white rounded-lg border border-gray-200 p-4">
					<div className="flex items-center gap-3 mb-4">
						<div className="p-2 bg-yellow-100 rounded-lg">
							<Bell className="text-yellow-600" size={20} />
						</div>
						<div>
							<h2 className="text-base font-semibold text-gray-900">{t("settings.notifications")}</h2>
							<p className="text-xs text-gray-500">{t("settings.managePreferences")}</p>
						</div>
					</div>
					<div className="space-y-3">
						<label className="flex items-center gap-2">
							<input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 border-gray-300 rounded" />
							<span className="text-sm text-gray-700">{t("settings.emailNotifications")}</span>
						</label>
						<label className="flex items-center gap-2">
							<input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 border-gray-300 rounded" />
							<span className="text-sm text-gray-700">{t("settings.esgReportReminders")}</span>
						</label>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}

