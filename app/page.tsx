"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";

export default function HomePage() {
	const router = useRouter();
	const { t } = useTranslation();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	// Check if user is already logged in
	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			router.push("/dashboard");
		}
	}, [router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const response = await authAPI.login(formData);
			localStorage.setItem("token", response.data.token);
			localStorage.setItem("user", JSON.stringify(response.data.user));
			showToast.success(t("auth.loginSuccess"));
			router.push("/dashboard");
		} catch (err: any) {
			const errorMsg = err.response?.data?.error || t("auth.loginFailed");
			setError(errorMsg);
			showToast.error(errorMsg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex">
			{/* Left Side - Branding (hidden on mobile) */}
			<div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-green-600 to-green-800 text-white flex-col items-center justify-center p-6 relative overflow-hidden">
				<div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
				<div className="relative z-10 text-center">
					<div className="flex items-center justify-center mb-6">
						<Image
							src="/logo.png"
							alt="EcoTrack India"
							width={200}
							height={60}
							className="h-auto w-auto max-w-[200px] object-contain"
						/>
					</div>
					<h2 className="text-lg font-semibold mb-3">ESG & Sustainability Made Simple</h2>
					<p className="text-green-100 text-sm mb-4">
						One-click ESG reporting for Indian SMBs
					</p>
					<div className="space-y-2 text-left max-w-md text-sm">
						<div className="flex items-center gap-2">
							<div className="w-1.5 h-1.5 bg-white rounded-full"></div>
							<span>Track Environmental Metrics</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-1.5 h-1.5 bg-white rounded-full"></div>
							<span>Monitor Social Impact</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-1.5 h-1.5 bg-white rounded-full"></div>
							<span>Generate Compliance Reports</span>
						</div>
					</div>
				</div>
				<div className="absolute bottom-3 text-xs text-green-100">
					© {new Date().getFullYear()} EcoTrack India. All rights reserved.
				</div>
			</div>

			{/* Right Side - Login Form */}
			<div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
				<div className="max-w-md w-full bg-white rounded-lg shadow-xl p-4">
					{/* Mobile Logo */}
					<div className="md:hidden flex items-center justify-center mb-4">
						<Image
							src="/logo-no-bg.png"
							alt="EcoTrack India"
							width={150}
							height={40}
							className="h-auto w-auto max-w-[150px] object-contain"
						/>
					</div>

					<div className="mb-4">
						<h1 className="text-lg font-semibold text-gray-900 mb-0.5">{t("auth.welcomeBack")}</h1>
						<p className="text-xs text-gray-600">{t("auth.loginSubtitle")}</p>
					</div>

					{error && (
						<div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 text-xs">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-3">
						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								{t("common.email")}
							</label>
							<input
								type="email"
								required
								value={formData.email}
								onChange={(e) => setFormData({ ...formData, email: e.target.value })}
								className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="you@company.com"
							/>
						</div>

						<div>
							<div className="flex items-center justify-between mb-1">
								<label className="block text-xs font-medium text-gray-700">{t("auth.password")}</label>
								<Link
									href="/auth/forgot-password"
									className="text-xs text-green-600 hover:text-green-700 font-medium"
								>
									{t("auth.forgotPassword")}
								</Link>
							</div>
							<input
								type="password"
								required
								value={formData.password}
								onChange={(e) => setFormData({ ...formData, password: e.target.value })}
								className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="••••••••"
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
						>
							{loading ? (
								<>{t("auth.loggingIn")}</>
							) : (
								<>
									{t("auth.login")}
									<ArrowRight size={14} />
								</>
							)}
						</button>
					</form>

					<div className="mt-4 text-center text-xs text-gray-600">
						<p>
							{t("auth.needAccount")}{" "}
							<a href="mailto:sales@ecotrack.in" className="text-green-600 hover:text-green-700 font-medium">
								{t("auth.contactSales")}
							</a>
						</p>
					</div>

					{/* Footer Links */}
					<div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap justify-center gap-3 text-xs text-gray-600">
						<a 
							href="https://ecotrack-india.vercel.app/" 
							target="_blank" 
							rel="noopener noreferrer"
							className="hover:text-green-600 transition-colors"
						>
							About Us
						</a>
						<Link href="/support" className="hover:text-green-600 transition-colors">
							Support
						</Link>
						<Link href="/privacy" className="hover:text-green-600 transition-colors">
							Privacy Policy
						</Link>
						<Link href="/terms" className="hover:text-green-600 transition-colors">
							Terms
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
