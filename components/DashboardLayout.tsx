"use client";

import { useRouter, usePathname } from "next/navigation";
import {
	Leaf,
	LayoutDashboard,
	Building2,
	Leaf as LeafIcon,
	Users,
	Shield,
	FileText,
	LogOut,
	Menu,
	BarChart3,
	Database,
	FolderOpen,
	CheckCircle2,
	Bell,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useInactivity } from "@/hooks/useInactivity";
import AppBar from "@/components/AppBar";
import Footer from "@/components/Footer";
import { useTranslation } from "@/hooks/useTranslation";
import { useUserStore, useCompanyStore } from "@/stores";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const { t } = useTranslation();
	const [isHovered, setIsHovered] = useState<any>(false);
	
	// Use stores
	const { user, isAuthenticated, fetchUser, logout: storeLogout } = useUserStore();
	const { selectedCompany, fetchCompanies } = useCompanyStore();

	useEffect(() => {
		const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
		
		if (!token) {
			router.push("/auth/login");
			return;
		}

		// Fetch user and companies from stores (with caching)
		fetchUser();
		fetchCompanies();
	}, [router, fetchUser, fetchCompanies]);

	// Redirect if not authenticated
	useEffect(() => {
		if (user === null && !isAuthenticated) {
			const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
			if (!token) {
				router.push("/auth/login");
			}
		}
	}, [user, isAuthenticated, router]);

	const handleLogout = () => {
		storeLogout();
		router.push("/auth/login");
	};

	// Enable inactivity timeout (25 min inactivity → 5 min warning → logout)
	useInactivity({
		timeout: 25 * 60 * 1000, // 25 minutes
		warningTime: 5 * 60 * 1000, // 5 minutes warning
		onLogout: handleLogout,
		enabled: !!user, // Only enable when user is logged in
	});

	const navigation = [
		{ name: t("sidebar.dashboard"), href: "/dashboard", icon: LayoutDashboard },
		{ name: t("sidebar.company"), href: "/dashboard/company", icon: Building2 },
		{ name: t("sidebar.environment"), href: "/dashboard/environment", icon: LeafIcon },
		{ name: t("sidebar.social"), href: "/dashboard/social", icon: Users },
		{ name: t("sidebar.governance"), href: "/dashboard/governance", icon: Shield },
		{ name: t("sidebar.reports"), href: "/dashboard/reports", icon: FileText },
		{ name: t("sidebar.esgScorecard"), href: "/dashboard/esg-scorecard", icon: BarChart3 },
		{ name: t("sidebar.dataCollectionHub"), href: "/dashboard/data-collection", icon: Database },
		{ name: t("sidebar.evidenceVault"), href: "/dashboard/evidence-vault", icon: FolderOpen },
		{ name: t("sidebar.complianceCenter"), href: "/dashboard/compliance", icon: CheckCircle2 },
		{ name: t("sidebar.alertsTasks"), href: "/dashboard/alerts-tasks", icon: Bell },
	];

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			{/* Top Navbar */}
			<AppBar user={user} />

			<div className="flex flex-1 pt-12">
				{/* Sidebar */}
				<aside
					className={`bg-white border-r border-gray-200 fixed h-[calc(100vh-3rem)] top-12 transition-all duration-300 ease-in-out ${
						isHovered ? "w-52" : "w-10"
					}`}
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
				>
				<div className="pb-11">
					<nav className="space-y-1 mt-1">
						{navigation.map((item) => {
							const isActive = pathname === item.href;
							const Icon = item.icon;

							return (
								<Link
									key={item.name}
									href={item.href}
									className={`flex items-center gap-2 px-2.5 py-1.5 rounded transition-colors ${
										isActive
											? "bg-green-50 text-green-600 font-medium"
											: "text-gray-700 hover:bg-gray-50"
									} ${!isHovered ? "justify-center" : ""}`}
								>
									<Icon size={16} className="flex-shrink-0" />
									<span
										className={`text-xs whitespace-nowrap transition-all duration-300 ${
											isHovered
												? "opacity-100 w-auto"
												: "opacity-0 w-0 overflow-hidden"
										}`}
									>
										{item.name}
									</span>
								</Link>
							);
						})}
					</nav>
				</div>

				{/* User section at bottom */}
				<div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200">
					<div
						className={`mb-3 transition-all duration-300 ${
							isHovered ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
						}`}
					>
						{user && (
							<>
								<p className="text-xs font-medium text-gray-900">{user.name}</p>
								<p className="text-xs text-gray-500">{user.email}</p>
								<span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
									{user.plan?.toUpperCase() || "STARTER"}
								</span>
							</>
						)}
					</div>
					<button
						onClick={handleLogout}
						className={`flex items-center gap-2 text-xs text-gray-700 hover:text-red-600 transition-colors w-full ${!isHovered ? "justify-center" : ""}`}
					>
						<LogOut size={14} className="flex-shrink-0" />
						<span
							className={`whitespace-nowrap transition-all duration-300 ${
								isHovered
									? "opacity-100 w-auto"
									: "opacity-0 w-0 overflow-hidden"
							}`}
						>
							{t("common.logout")}
						</span>
					</button>
				</div>
			</aside>

				<main
					className={`flex-1 p-4 transition-all duration-300 ${
						isHovered ? "ml-52" : "ml-10"
					}`}
				>
					{children}
				</main>
			</div>

			{/* Footer */}
			<Footer />
		</div>
	);
}
