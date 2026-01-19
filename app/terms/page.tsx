"use client";

import Link from "next/link";
import Image from "next/image";

export default function TermsPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
			<div className="max-w-4xl mx-auto px-4 py-8">
				<div className="mb-6 text-center">
					<Link href="/" className="inline-block mb-4">
						<Image
							src="/logo-no-bg.png"
							alt="EcoTrack India"
							width={150}
							height={40}
							className="h-auto w-auto max-w-[150px] object-contain mx-auto"
						/>
					</Link>
					<h1 className="text-lg font-semibold text-gray-900 mb-0.5">Terms of Service</h1>
					<p className="text-xs text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
				</div>

				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
					<section>
						<h2 className="text-sm font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
						<p className="text-xs text-gray-600 leading-relaxed">
							By accessing and using EcoTrack India, you accept and agree to be bound by the terms and provision of this agreement.
						</p>
					</section>

					<section>
						<h2 className="text-sm font-semibold text-gray-900 mb-2">2. Use License</h2>
						<p className="text-xs text-gray-600 leading-relaxed">
							Permission is granted to temporarily use EcoTrack India for personal or commercial ESG reporting purposes. This is the grant of a license, not a transfer of title.
						</p>
					</section>

					<section>
						<h2 className="text-sm font-semibold text-gray-900 mb-2">3. Account Responsibility</h2>
						<p className="text-xs text-gray-600 leading-relaxed">
							You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
						</p>
					</section>

					<section>
						<h2 className="text-sm font-semibold text-gray-900 mb-2">4. Data Accuracy</h2>
						<p className="text-xs text-gray-600 leading-relaxed">
							You are responsible for ensuring the accuracy of all data entered into the system. EcoTrack India is not liable for any errors or inaccuracies in reports generated from incorrect data.
						</p>
					</section>

					<section>
						<h2 className="text-sm font-semibold text-gray-900 mb-2">5. Prohibited Uses</h2>
						<p className="text-xs text-gray-600 leading-relaxed">
							You may not use the service for any unlawful purpose or to solicit others to perform unlawful acts. You may not violate any local, state, national, or international law or regulation.
						</p>
					</section>

					<section>
						<h2 className="text-sm font-semibold text-gray-900 mb-2">6. Subscription and Payment</h2>
						<p className="text-xs text-gray-600 leading-relaxed">
							Subscription fees are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law.
						</p>
					</section>

					<section>
						<h2 className="text-sm font-semibold text-gray-900 mb-2">7. Limitation of Liability</h2>
						<p className="text-xs text-gray-600 leading-relaxed">
							EcoTrack India shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
						</p>
					</section>

					<section>
						<h2 className="text-sm font-semibold text-gray-900 mb-2">8. Contact Information</h2>
						<p className="text-xs text-gray-600 leading-relaxed">
							If you have any questions about these Terms of Service, please contact us at{" "}
							<a href="mailto:legal@ecotrack.in" className="text-green-600 hover:underline">
								legal@ecotrack.in
							</a>
						</p>
					</section>

					<div className="pt-4 border-t border-gray-200">
						<Link href="/" className="text-xs text-green-600 hover:underline">
							← Back to Login
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

