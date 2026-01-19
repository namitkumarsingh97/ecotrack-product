"use client";

import { Leaf, Mail, Phone, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
	const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@ecotrack.in";
	const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+91-XXXXX-XXXXX";

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-green-50 flex items-center justify-center p-4">
			<div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
				<div className="flex items-center justify-center gap-2 mb-8">
					<Leaf className="text-green-600" size={32} />
					<span className="text-2xl font-bold text-gray-900">
						EcoTrack India
					</span>
				</div>

				<h1 className="text-2xl font-bold text-center mb-2">Request Access</h1>
				<p className="text-gray-600 text-center mb-8">
					EcoTrack India is a B2B SaaS platform. Accounts are created by administrators.
				</p>

				<div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
					<p className="text-blue-800 text-sm mb-4">
						To get started with EcoTrack India, please contact us to request an account. We'll set up your company profile and send you login credentials.
					</p>
					
					<div className="space-y-3">
						<a
							href={`mailto:${supportEmail}?subject=Request Access - EcoTrack India&body=Hello,%0D%0A%0D%0AI would like to request access to EcoTrack India.%0D%0A%0D%0ACompany Name:%0D%0AEmail:%0D%0APhone:%0D%0A%0D%0AThank you!`}
							className="flex items-center gap-3 text-blue-700 hover:text-blue-800 transition-colors"
						>
							<Mail size={20} className="text-blue-600" />
							<span className="font-medium">{supportEmail}</span>
						</a>
						
						{supportPhone && (
							<a
								href={`tel:${supportPhone.replace(/\s/g, '')}`}
								className="flex items-center gap-3 text-blue-700 hover:text-blue-800 transition-colors"
							>
								<Phone size={20} className="text-blue-600" />
								<span className="font-medium">{supportPhone}</span>
							</a>
						)}
					</div>
				</div>

				<div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
					<h3 className="font-semibold text-green-900 mb-2">What happens next?</h3>
					<ol className="text-sm text-green-800 space-y-2 list-decimal list-inside">
						<li>Contact us via email or phone</li>
						<li>We'll create your account and company profile</li>
						<li>You'll receive login credentials via email</li>
						<li>Login and start tracking your ESG metrics!</li>
					</ol>
				</div>

				<Link
					href="/auth/login"
					className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
				>
					<ArrowLeft size={16} />
					Back to Login
				</Link>
			</div>
		</div>
	);
}
