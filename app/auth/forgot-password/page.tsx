"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPasswordPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess(false);
		setLoading(true);

		try {
			await authAPI.forgotPassword({ email });
			setSuccess(true);
		} catch (err: any) {
			setError(err.response?.data?.error || "Failed to send reset email");
		} finally {
			setLoading(false);
		}
	};

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

				<h1 className="text-lg font-semibold text-center mb-0.5">Forgot Password?</h1>
				<p className="text-xs text-gray-600 text-center mb-4">
					Enter your email address and we'll send you a link to reset your password.
				</p>

				{error && (
					<div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 text-xs">
						{error}
					</div>
				)}

				{success ? (
					<div className="space-y-3">
						<div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg mb-3">
							<div className="flex items-start gap-2">
								<Mail className="text-green-600 mt-0.5" size={14} />
								<div>
									<p className="text-xs font-semibold mb-0.5">Check your email</p>
									<p className="text-xs">
										If an account with <strong>{email}</strong> exists, we've sent you a password reset link.
									</p>
									<p className="text-xs mt-1">
										The link will expire in 1 hour.
									</p>
								</div>
							</div>
						</div>

						<div className="space-y-3">
							<p className="text-xs text-gray-600 text-center">
								Didn't receive the email? Check your spam folder or try again.
							</p>
							
							<button
								onClick={() => {
									setSuccess(false);
									setEmail("");
								}}
								className="w-full py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg font-medium transition-colors border border-green-200"
							>
								Try Another Email
							</button>

							<Link
								href="/auth/login"
								className="flex items-center justify-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors"
							>
								<ArrowLeft size={12} />
								Back to Login
							</Link>
						</div>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-3">
						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Email Address
							</label>
							<input
								type="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="you@company.com"
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
						>
							{loading ? "Sending..." : "Send Reset Link"}
						</button>

						<Link
							href="/auth/login"
							className="flex items-center justify-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors"
						>
							<ArrowLeft size={12} />
							Back to Login
						</Link>
					</form>
				)}
			</div>
		</div>
	);
}

