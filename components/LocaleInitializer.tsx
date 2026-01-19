"use client";

import { useEffect } from "react";
import { initLocale } from "@/utils/i18n";

/**
 * LocaleInitializer Component
 * Initializes locale on app load
 */
export default function LocaleInitializer() {
	useEffect(() => {
		// Initialize locale
		const locale = initLocale();
		
		// Listen for locale changes
		const handleLocaleChange = () => {
			// Force re-render of components using translations
			window.location.reload();
		};

		window.addEventListener("localechange", handleLocaleChange);
		
		return () => {
			window.removeEventListener("localechange", handleLocaleChange);
		};
	}, []);

	return null;
}

