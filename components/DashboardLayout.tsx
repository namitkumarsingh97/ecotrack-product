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
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const [user, setUser] = useState<any>(null);
	const [isHovered, setIsHovered] = useState<any>(false);

	useEffect(() => {
		const token = localStorage.getItem("token");
		const userData = localStorage.getItem("user");

		if (!token) {
			router.push("/auth/login");
			return;
		}

		if (userData) {
			setUser(JSON.parse(userData));
		}
	}, [router]);

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		router.push("/auth/login");
	};

	const navigation = [
		{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
		{ name: "Company", href: "/dashboard/company", icon: Building2 },
		{ name: "Environment", href: "/dashboard/environment", icon: LeafIcon },
		{ name: "Social", href: "/dashboard/social", icon: Users },
		{ name: "Governance", href: "/dashboard/governance", icon: Shield },
		{ name: "Reports", href: "/dashboard/reports", icon: FileText },
	];

	return (
		<div className="min-h-screen bg-gray-50 flex">
			{/* Sidebar */}
			<aside
				className={`bg-white border-r border-gray-200 fixed h-screen transition-all duration-300 ease-in-out ${
					isHovered ? "w-64" : "w-16"
				}`}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				<div className="p-6">
					<div className="flex items-center gap-2 mb-8 justify-center">
						<Leaf className="text-green-600 flex-shrink-0" size={28} />
						<span
							className={`text-xl font-bold text-gray-900 whitespace-nowrap transition-all duration-300 ${
								isHovered
									? "opacity-100 w-auto"
									: "opacity-0 w-0 overflow-hidden"
							}`}
						>
							EcoTrack
						</span>
					</div>

					<nav className="space-y-2">
						{navigation.map((item) => {
							const isActive = pathname === item.href;
							const Icon = item.icon;

							return (
								<Link
									key={item.name}
									href={item.href}
									className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
										isActive
											? "bg-green-50 text-green-600 font-medium"
											: "text-gray-700 hover:bg-gray-50"
									} ${!isHovered ? "justify-center" : ""}`}
								>
									<Icon size={20} className="flex-shrink-0" />
									<span
										className={`whitespace-nowrap transition-all duration-300 ${
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
				<div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
					<div
						className={`mb-4 transition-all duration-300 ${
							isHovered ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
						}`}
					>
						{user && (
							<>
								<p className="text-sm font-medium text-gray-900">{user.name}</p>
								<p className="text-xs text-gray-500">{user.email}</p>
								<span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
									{user.plan?.toUpperCase() || "STARTER"}
								</span>
							</>
						)}
					</div>
					<button
						onClick={handleLogout}
						className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors w-full"
					>
						<LogOut size={18} className="flex-shrink-0" />
						<span
							className={`whitespace-nowrap transition-all duration-300 ${
								isHovered
									? "opacity-100 w-auto"
									: "opacity-0 w-0 overflow-hidden"
							}`}
						>
							Logout
						</span>
					</button>
				</div>
			</aside>

			<main
				className={`flex-1 p-8 transition-all duration-300 ${
					isHovered ? "ml-64" : "ml-16"
				}`}
			>
				{children}
			</main>
		</div>
	);
}
