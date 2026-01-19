"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authAPI } from "@/lib/api";
import { Lock, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ResetPasswordPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const [formData, setFormData] = useState({
		password: "",
		confirmPassword: "",
	});
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(false);
	const [passwordStrength, setPasswordStrength] = useState("");

	useEffect(() => {
		if (!token) {
			setError("Invalid reset link. Please request a new password reset.");
		}
	}, [token]);

	useEffect(() => {
		// Calculate password strength
		const password = formData.password;
		if (password.length === 0) {
			setPasswordStrength("");
			return;
		}

		let strength = 0;
		if (password.length >= 6) strength++;
		if (password.length >= 8) strength++;
		if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
		if (/\d/.test(password)) strength++;
		if (/[^a-zA-Z\d]/.test(password)) strength++;

		if (strength <= 2) setPasswordStrength("weak");
		else if (strength <= 3) setPasswordStrength("medium");
		else setPasswordStrength("strong");
	}, [formData.password]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		// Validation
		if (formData.password.length < 6) {
			setError("Password must be at least 6 characters long");
			return;
		}

		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (!token) {
			setError("Invalid reset token");
			return;
		}

		setLoading(true);

		try {
			await authAPI.resetPassword({
				token,
				password: formData.password,
			});
			setSuccess(true);
			// Redirect to login after 3 seconds
			setTimeout(() => {
				router.push("/auth/login");
			}, 3000);
		} catch (err: any) {
			setError(
				err.response?.data?.error ||
					"Failed to reset password. The link may have expired."
			);
		} finally {
			setLoading(false);
		}
	};

	if (success) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-green-50 to-green-50 flex items-center justify-center p-4">
				<div className="max-w-md w-full bg-white rounded-lg shadow-xl p-4 text-center">
					<div className="flex items-center justify-center mb-4">
						<Image
							src="/logo-no-bg.png"
							alt="EcoTrack India"
							width={150}
							height={40}
							className="h-auto w-auto max-w-[150px] object-contain"
						/>
					</div>

					<div className="mb-4">
						<CheckCircle className="mx-auto text-green-600 mb-3" size={48} />
						<h1 className="text-lg font-semibold text-gray-900 mb-0.5">
							Password Reset Successful!
						</h1>
						<p className="text-xs text-gray-600">
							Your password has been reset successfully. You can now login with your new password.
						</p>
					</div>

					<Link
						href="/auth/login"
						className="inline-block px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
					>
						Go to Login
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-green-50 flex items-center justify-center p-4">
			<div className="max-w-md w-full bg-white rounded-lg shadow-xl p-4">
					<div className="flex items-center justify-center mb-4">
						<Image
							src="/logo-no-bg.png"
							alt="EcoTrack India"
							width={150}
							height={40}
							className="h-auto w-auto max-w-[150px] object-contain"
						/>
					</div>

				<h1 className="text-lg font-semibold text-center mb-0.5">Reset Password</h1>
				<p className="text-xs text-gray-600 text-center mb-4">
					Enter your new password below
				</p>

				{error && (
					<div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 text-xs">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-3">
					<div>
						<label className="block text-xs font-medium text-gray-700 mb-1">
							New Password
						</label>
						<input
							type="password"
							required
							value={formData.password}
							onChange={(e) =>
								setFormData({ ...formData, password: e.target.value })
							}
							className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
							placeholder="••••••••"
							minLength={6}
						/>
						{formData.password && (
							<div className="mt-1.5">
								<div className="flex gap-1.5 mb-0.5">
									<div
										className={`h-1 flex-1 rounded ${
											passwordStrength === "weak"
												? "bg-red-500"
												: passwordStrength === "medium"
												? "bg-yellow-500"
												: passwordStrength === "strong"
												? "bg-green-500"
												: "bg-gray-200"
										}`}
									/>
									<div
										className={`h-1 flex-1 rounded ${
											passwordStrength === "medium" || passwordStrength === "strong"
												? passwordStrength === "strong"
													? "bg-green-500"
													: "bg-yellow-500"
												: "bg-gray-200"
										}`}
									/>
									<div
										className={`h-1 flex-1 rounded ${
											passwordStrength === "strong" ? "bg-green-500" : "bg-gray-200"
										}`}
									/>
								</div>
								<p className="text-xs text-gray-500">
									{passwordStrength === "weak" && "Weak password"}
									{passwordStrength === "medium" && "Medium strength"}
									{passwordStrength === "strong" && "Strong password"}
								</p>
							</div>
						)}
						<p className="text-xs text-gray-500 mt-0.5">
							Minimum 6 characters
						</p>
					</div>

					<div>
						<label className="block text-xs font-medium text-gray-700 mb-1">
							Confirm New Password
						</label>
						<input
							type="password"
							required
							value={formData.confirmPassword}
							onChange={(e) =>
								setFormData({ ...formData, confirmPassword: e.target.value })
							}
							className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
							placeholder="••••••••"
							minLength={6}
						/>
						{formData.confirmPassword &&
							formData.password !== formData.confirmPassword && (
								<p className="text-xs text-red-600 mt-0.5">
									Passwords do not match
								</p>
							)}
					</div>

					<button
						type="submit"
						disabled={loading || !token}
						className="w-full py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
					>
						{loading ? "Resetting..." : "Reset Password"}
					</button>

					<Link
						href="/auth/login"
						className="flex items-center justify-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors"
					>
						<ArrowLeft size={12} />
						Back to Login
					</Link>
				</form>
			</div>
		</div>
	);
}

