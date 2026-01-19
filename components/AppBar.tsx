"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, Bell, Settings, LogOut, User, Building2, ChevronDown, CreditCard, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { companyAPI } from "@/lib/api";
import { showToast } from "@/lib/toast";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "@/hooks/useTranslation";
import { useCompanyStore } from "@/stores";

interface AppBarProps {
	user?: any;
}

export default function AppBar({ user }: AppBarProps) {
	const router = useRouter();
	const pathname = usePathname();
	const { t, locale } = useTranslation();
	const [showProfileMenu, setShowProfileMenu] = useState(false);
	const [showCompanyModal, setShowCompanyModal] = useState(false);
	const [showPlanModal, setShowPlanModal] = useState(false);
	const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
	const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro" | "enterprise">("starter");
	const [dateTime, setDateTime] = useState("");
	const profileRef = useRef<HTMLDivElement>(null);
	const companyModalRef = useRef<HTMLDivElement>(null);
	const planModalRef = useRef<HTMLDivElement>(null);
	
	// Use company store
	const { companies, selectedCompany, setSelectedCompany, fetchCompanies } = useCompanyStore();

	useEffect(() => {
		// Update date/time every minute
		const updateDateTime = () => {
			const now = new Date();
			setDateTime(
				now.toLocaleString(locale === "hi" ? "hi-IN" : "en-IN", {
					day: "2-digit",
					month: "short",
					year: "numeric",
					hour: "2-digit",
					minute: "2-digit",
				})
			);
		};

		updateDateTime();
		const interval = setInterval(updateDateTime, 60000);

		return () => clearInterval(interval);
	}, [locale]);

	useEffect(() => {
		// Fetch companies from store (with caching)
		fetchCompanies();
		if (user?.plan) {
			setSelectedPlan(user.plan);
		}
		if (selectedCompany?._id) {
			setSelectedCompanyId(selectedCompany._id);
		}
	}, [user, selectedCompany, fetchCompanies]);

	useEffect(() => {
		// Close menus when clicking outside
		const handleClickOutside = (event: MouseEvent) => {
			if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
				setShowProfileMenu(false);
			}
			if (companyModalRef.current && !companyModalRef.current.contains(event.target as Node)) {
				setShowCompanyModal(false);
			}
			if (planModalRef.current && !planModalRef.current.contains(event.target as Node)) {
				setShowPlanModal(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleCompanyChange = async () => {
		if (!selectedCompanyId) return;
		
		const company = companies.find(c => c._id === selectedCompanyId);
		if (company) {
			// Update store
			setSelectedCompany(company);
			showToast.success(`Switched to ${company.name}`);
			setShowCompanyModal(false);
			// Reload page to reflect changes
			window.location.reload();
		}
	};

	const handlePlanChange = async () => {
		if (!user || user.role !== "ADMIN") return;
		
		// Store test plan in localStorage for admin testing
		localStorage.setItem("admin_test_plan", selectedPlan);
		
		// Update user plan temporarily
		const updatedUser = { ...user, plan: selectedPlan };
		localStorage.setItem("user", JSON.stringify(updatedUser));
		
		// Clear feature cache
		if (typeof window !== "undefined") {
			const { clearFeatureCache } = await import("@/lib/features");
			clearFeatureCache();
		}
		
		showToast.success(`Plan changed to ${selectedPlan.toUpperCase()}. Refresh to see changes.`);
		setShowPlanModal(false);
	};

	const getUserInitials = () => {
		if (!user?.name) return "U";
		const words = user.name.trim().split(/\s+/);
		if (words.length === 1) {
			return words[0].substring(0, 2).toUpperCase();
		}
		return (words[0][0] + (words[1]?.[0] || "")).toUpperCase();
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		router.push("/auth/login");
	};

	return (
		<nav className="fixed top-0 left-0 right-0 z-50 h-12 bg-white border-b border-gray-200 shadow-xs">
			<div className="flex items-center justify-between h-full px-4 pr-6 gap-6">
				{/* Left: Logo */}
				<div className="flex items-center gap-4">
					<Link href="/dashboard" className="flex items-center gap-2">
						<Image
							src="/logo-no-bg.png"
							alt="EcoTrack India"
							width={120}
							height={32}
							className="h-8 w-auto object-contain"
						/>
					</Link>
				</div>

				{/* Center: Quick Search (hidden on mobile) */}
				<div className="hidden md:flex flex-1 max-w-md">
					<div className="relative w-full">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
						<input
							type="text"
							placeholder={t("navbar.quickSearch")}
							className="w-full pl-10 pr-4 py-1 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent text-md text-gray-500 hover:bg-gray-50"
						/>
					</div>
				</div>

				{/* Right: Company Info & User Profile */}
				<div className="flex items-center gap-3">
					{/* Language Switcher */}
					<LanguageSwitcher />
					{/* Company Dropdown (if multiple companies) */}
					{companies.length > 1 && (
						<div className="hidden md:block relative" ref={companyModalRef}>
							<button
								onClick={() => setShowCompanyModal(!showCompanyModal)}
								className="flex items-center gap-1.5 px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
							>
								<Building2 size={14} />
								<span className="font-medium text-gray-700">{selectedCompany?.name || "Select Company"}</span>
								<ChevronDown size={12} />
							</button>
							
							{showCompanyModal && (
								<div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 shadow-lg z-50 p-2">
									<div className="text-xs font-semibold text-gray-700 mb-2 px-2">{t("navbar.switchCompany")}</div>
									<select
										value={selectedCompanyId}
										onChange={(e) => setSelectedCompanyId(e.target.value)}
										className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-2"
									>
										<option value="">Select Company</option>
										{companies.map((comp) => (
											<option key={comp._id} value={comp._id}>
												{comp.name}
											</option>
										))}
									</select>
									<div className="flex gap-2">
										<button
											onClick={handleCompanyChange}
											disabled={!selectedCompanyId}
											className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
										>
											{t("common.submit")}
										</button>
										<button
											onClick={() => setShowCompanyModal(false)}
											className="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-lg"
										>
											{t("common.cancel")}
										</button>
									</div>
								</div>
							)}
						</div>
					)}

					{/* Plan Dropdown (Admin only) */}
					{user?.role === "ADMIN" && (
						<div className="hidden md:block relative" ref={planModalRef}>
							<button
								onClick={() => setShowPlanModal(!showPlanModal)}
								className="flex items-center gap-1.5 px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
							>
								<CreditCard size={14} />
								<span className="font-medium text-gray-700">{user?.plan?.toUpperCase() || "STARTER"}</span>
								<ChevronDown size={12} />
							</button>
							
							{showPlanModal && (
								<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-50 p-2">
									<div className="text-xs font-semibold text-gray-700 mb-2 px-2">{t("navbar.switchPlan")} ({t("navbar.testMode")})</div>
									<select
										value={selectedPlan}
										onChange={(e) => setSelectedPlan(e.target.value as "starter" | "pro" | "enterprise")}
										className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-2"
									>
										<option value="starter">Starter</option>
										<option value="pro">Pro</option>
										<option value="enterprise">Enterprise</option>
									</select>
									<div className="flex gap-2">
										<button
											onClick={handlePlanChange}
											className="flex-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700"
										>
											{t("common.submit")}
										</button>
										<button
											onClick={() => setShowPlanModal(false)}
											className="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-lg"
										>
											{t("common.cancel")}
										</button>
									</div>
								</div>
							)}
						</div>
					)}

					{/* Company Name & Date (hidden on mobile) */}
					<div className="hidden md:block text-right">
						<p className="text-xs font-semibold text-gray-900 sm:text-sm">{selectedCompany?.name || "Company"}</p>
						<p className="text-xs text-gray-500">{dateTime}</p>
					</div>

					{/* User Profile */}
					<div className="relative" ref={profileRef}>
						<button
							onClick={() => setShowProfileMenu(!showProfileMenu)}
							className="flex items-center gap-x-4 overflow-hidden"
						>
							<div className="flex h-8 w-10 items-center justify-center rounded bg-green-600 border-2 border-slate-500 text-white text-sm font-semibold">
								{getUserInitials()}
							</div>
						</button>

						{/* Profile Dropdown Menu */}
						{showProfileMenu && (
							<div className="absolute right-2 mt-2 w-48 rounded border border-gray-200 bg-white shadow-xs py-2 z-50">
								<div className="px-4 py-2 border-b border-gray-200 text-center">
									<p className="text-sm font-semibold text-gray-900">{user?.name || "User"}</p>
									<p className="text-xs text-gray-500">{user?.email || ""}</p>
									<span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
										{user?.plan?.toUpperCase() || "STARTER"}
									</span>
								</div>
								{companies.length > 1 && (
									<button
										onClick={() => {
											setShowProfileMenu(false);
											if (selectedCompany?._id) {
												setSelectedCompanyId(selectedCompany._id);
											}
											setShowCompanyModal(true);
										}}
										className="w-full flex items-center gap-2 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
									>
										<Building2 size={16} />
										{t("navbar.switchCompany")}
									</button>
								)}
								{user?.role === "ADMIN" && (
									<>
										<button
											onClick={() => {
												setShowProfileMenu(false);
												setShowPlanModal(true);
											}}
											className="w-full flex items-center gap-2 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
										>
											<CreditCard size={16} />
											{t("navbar.switchPlan")}
										</button>
										<div className="border-t border-gray-200 my-1"></div>
										<Link
											href="/dashboard/admin/clients"
											target="_blank"
											rel="noopener noreferrer"
											onClick={() => setShowProfileMenu(false)}
											className="w-full flex items-center gap-2 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
										>
											<Building2 size={16} />
											{t("admin.clientOnboarding")}
										</Link>
										<Link
											href="/dashboard/admin/users"
											target="_blank"
											rel="noopener noreferrer"
											onClick={() => setShowProfileMenu(false)}
											className="w-full flex items-center gap-2 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
										>
											<Users size={16} />
											{t("admin.userManagement")}
										</Link>
										<div className="border-t border-gray-200 my-1"></div>
									</>
								)}
								<Link
									href="/dashboard/company"
									className="flex items-center gap-2 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
									onClick={() => setShowProfileMenu(false)}
								>
									<Building2 size={16} />
									{t("navbar.companySettings")}
								</Link>
								<Link
									href="/dashboard/settings"
									className="flex items-center gap-2 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
									onClick={() => setShowProfileMenu(false)}
								>
									<Settings size={16} />
									{t("common.settings")}
								</Link>
								<div className="border-t border-gray-200 my-1"></div>
								<button
									onClick={() => {
										setShowProfileMenu(false);
										handleLogout();
									}}
									className="w-full flex items-center gap-2 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
								>
									<LogOut size={16} />
									{t("common.logout")}
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}

