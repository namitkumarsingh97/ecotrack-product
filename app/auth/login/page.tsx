"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
	const router = useRouter();

	useEffect(() => {
		// Redirect to root which now shows the login page
		router.replace("/");
	}, [router]);

	return null;
}
