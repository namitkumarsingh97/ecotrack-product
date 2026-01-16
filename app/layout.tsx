import type { Metadata } from "next";
import "./globals.css";

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
			<body>{children}</body>
		</html>
	);
}
