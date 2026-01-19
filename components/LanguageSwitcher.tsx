"use client";

import { useState, useEffect, useRef } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { getLocaleName, type Locale } from "@/lib/i18n";

export default function LanguageSwitcher() {
	const { locale, changeLocale } = useTranslation();
	const [showMenu, setShowMenu] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setShowMenu(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const languages: { code: Locale; name: string; nativeName: string }[] = [
		{ code: "en", name: "English", nativeName: "English" },
		{ code: "hi", name: "Hindi", nativeName: "हिंदी" },
	];

	const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

	return (
		<div className="relative" ref={menuRef}>
			<button
				onClick={() => setShowMenu(!showMenu)}
				className="flex items-center gap-1.5 px-2.5 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
			>
				<Globe size={14} />
				<span className="font-medium text-gray-700">{currentLanguage.nativeName}</span>
				<ChevronDown size={12} />
			</button>

			{showMenu && (
				<div className="absolute right-0 mt-2 w-40 bg-white rounded-lg border border-gray-200 shadow-lg z-50 py-1">
					{languages.map((lang) => (
						<button
							key={lang.code}
							onClick={() => {
								changeLocale(lang.code);
								setShowMenu(false);
							}}
							className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 transition-colors ${
								locale === lang.code
									? "bg-green-50 text-green-600 font-medium"
									: "text-gray-700"
							}`}
						>
							<div className="flex items-center justify-between">
								<span>{lang.nativeName}</span>
								<span className="text-gray-500 text-[10px]">{lang.name}</span>
							</div>
						</button>
					))}
				</div>
			)}
		</div>
	);
}

