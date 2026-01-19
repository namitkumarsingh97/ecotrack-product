"use client";

import Link from "next/link";
import Image from "next/image";

export default function PrivacyPolicyPage() {
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
					<h1 className="text-lg font-semibold text-gray-900 mb-0.5">Privacy Policy</h1>
					<p className="text-xs text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
				</div>

				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
					<section>
						<h2 className="text-sm font-semibold text-gray-900 mb-2">1. Information We Collect</h2>
						<p className="text-xs text-gray-600 leading-relaxed">
							We collect information that you provide directly to us, including your name, email address, company information, and ESG metrics data when you use our services.
						</p>
					</section>

					<section>
						<h2 className="text-sm font-semibold text-gray-900 mb-2">2. How We Use Your Information</h2>
						<p className="text-xs text-gray-600 leading-relaxed">
							We use the information we collect to provide, maintain, and improve our services, process your requests, and communicate with you about your account and our services.
						</p>
					</section>

					<section>
						<h2 className="text-sm font-semibold text-gray-900 mb-2">3. Data Security</h2>
						<p className="text-xs text-gray-600 leading-relaxed">
							We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
						</p>
					</section>

					<section>
						<h2 className="text-sm font-semibold text-gray-900 mb-2">4. Data Sharing</h2>
						<p className="text-xs text-gray-600 leading-relaxed">
							We do not sell, trade, or rent your personal information to third parties. We may share your information only with your consent or as required by law.
						</p>
					</section>

					<section>
						<h2 className="text-sm font-semibold text-gray-900 mb-2">5. Your Rights</h2>
						<p className="text-xs text-gray-600 leading-relaxed">
							You have the right to access, update, or delete your personal information at any time. You can do this through your account settings or by contacting us at privacy@ecotrack.in.
						</p>
					</section>

					<section>
						<h2 className="text-sm font-semibold text-gray-900 mb-2">6. Contact Us</h2>
						<p className="text-xs text-gray-600 leading-relaxed">
							If you have any questions about this Privacy Policy, please contact us at{" "}
							<a href="mailto:privacy@ecotrack.in" className="text-green-600 hover:underline">
								privacy@ecotrack.in
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

