"use client";

import { redirect, useRouter } from "next/navigation";

export default function HomePage() {
	redirect("/auth/login");
}
