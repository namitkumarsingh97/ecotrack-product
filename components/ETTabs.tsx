"use client";

import { ReactNode } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export interface Tab {
	key: string;
	label: string;
	icon?: ReactNode;
}

type ValidationStatus = "pending" | "validated" | "none";

interface ETTabsProps {
	tabs: Tab[];
	activeTab: string;
	onTabChange: (tabKey: string) => void;
	mandatoryFieldsCount?: number;
	showMandatoryFields?: boolean;
	validationConfig?: Record<string, ValidationStatus>;
	children?: ReactNode;
}

export default function ETTabs({
	tabs,
	activeTab,
	onTabChange,
	mandatoryFieldsCount,
	showMandatoryFields = true,
	validationConfig,
	children,
}: ETTabsProps) {
	return (
		<div>
			<div className="flex flex-wrap items-center justify-between gap-4 mb-2 mt-4">
				<div className="flex gap-2 border-b border-gray-300 overflow-x-auto flex-nowrap scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
					{tabs.map((tab) => (
						<button
							key={tab.key}
							type="button"
							onClick={() => onTabChange(tab.key)}
							className={`px-4 py-1.5 cursor-pointer rounded-t-md font-semibold border-b-2 focus:outline-none transition text-xs whitespace-nowrap flex-shrink-0 inline-flex items-center gap-1.5 ${
								activeTab === tab.key
									? "bg-green-600 text-white border-green-600"
									: "bg-gray-100 text-gray-700 border-transparent hover:bg-green-100"
							}`}
						>
							{tab.icon && <span className="text-xs">{tab.icon}</span>}
							{tab.label}
							{validationConfig && validationConfig[tab.key] === "validated" && (
								<span title="All required fields filled">
									<CheckCircle2 size={12} className="text-green-500 ml-1" />
								</span>
							)}
							{validationConfig && validationConfig[tab.key] === "pending" && (
								<span title="Required fields missing">
									<AlertTriangle size={12} className="text-yellow-500 ml-1" />
								</span>
							)}
						</button>
					))}
				</div>
				{showMandatoryFields && mandatoryFieldsCount !== undefined && (
					<span className="text-xs font-semibold text-red-500">
						* Mandatory fields: {mandatoryFieldsCount}
					</span>
				)}
			</div>

			<div className="space-y-6">{children}</div>
		</div>
	);
}

