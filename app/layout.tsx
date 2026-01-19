import type { Metadata } from "next";
import "./globals.css";
import Toaster from "@/components/Toaster";
import LocaleInitializer from "@/components/LocaleInitializer";

export const metadata: Metadata = {
	title: "EcoTrack India - ESG & Sustainability SaaS",
	description: "One-click ESG & sustainability reporting for Indian SMBs",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>
				<LocaleInitializer />
				{children}
				<Toaster />
			</body>
		</html>
	);
}
