"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export default function Footer() {
	const { t } = useTranslation();
	const currentYear = new Date().getFullYear();

	return (
		<footer className="bg-white border-t border-gray-200 mt-auto">
			<div className="max-w-7xl mx-auto px-4 py-3">
				<div className="flex flex-col md:flex-row items-center justify-between">
					<div className="text-xs text-gray-600">
						{t("footer.copyright", { year: currentYear.toString() })}
					</div>
					<div className="flex items-center gap-4 mt-3 md:mt-0">
						<a
							href="https://ecotrack-india.vercel.app/"
							target="_blank"
							rel="noopener noreferrer"
							className="text-xs text-gray-600 hover:text-green-600 transition-colors"
						>
							{t("footer.aboutUs")}
						</a>
						<Link
							href="/support"
							className="text-xs text-gray-600 hover:text-green-600 transition-colors"
						>
							{t("footer.support")}
						</Link>
						<Link
							href="/privacy"
							className="text-xs text-gray-600 hover:text-green-600 transition-colors"
						>
							{t("footer.privacyPolicy")}
						</Link>
						<Link
							href="/terms"
							className="text-xs text-gray-600 hover:text-green-600 transition-colors"
						>
							{t("footer.termsOfService")}
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}

