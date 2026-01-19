"use client";

import { useState } from "react";
import { Mail, Phone, MessageSquare, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function SupportPage() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		message: "",
	});
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// In a real app, this would send to your backend
		const mailtoLink = `mailto:support@ecotrack.in?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`)}`;
		window.location.href = mailtoLink;
		setSubmitted(true);
	};

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
					<h1 className="text-lg font-semibold text-gray-900 mb-0.5">Support</h1>
					<p className="text-xs text-gray-600">We're here to help you</p>
				</div>

				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
					<div className="grid md:grid-cols-2 gap-4 mb-6">
						<div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
							<Mail className="text-green-600" size={18} />
							<div>
								<p className="text-xs font-semibold text-gray-900">Email Support</p>
								<a href="mailto:support@ecotrack.in" className="text-xs text-green-600 hover:underline">
									support@ecotrack.in
								</a>
							</div>
						</div>
						<div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
							<Phone className="text-green-600" size={18} />
							<div>
								<p className="text-xs font-semibold text-gray-900">Phone Support</p>
								<a href="tel:+911234567890" className="text-xs text-green-600 hover:underline">
									+91-XXXXX-XXXXX
								</a>
							</div>
						</div>
					</div>

					{!submitted ? (
						<form onSubmit={handleSubmit} className="space-y-3">
							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
								<input
									type="text"
									required
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								/>
							</div>
							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
								<input
									type="email"
									required
									value={formData.email}
									onChange={(e) => setFormData({ ...formData, email: e.target.value })}
									className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								/>
							</div>
							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
								<input
									type="text"
									required
									value={formData.subject}
									onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
									className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								/>
							</div>
							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">Message</label>
								<textarea
									required
									rows={4}
									value={formData.message}
									onChange={(e) => setFormData({ ...formData, message: e.target.value })}
									className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								/>
							</div>
							<button
								type="submit"
								className="w-full flex items-center justify-center gap-1.5 px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
							>
								<Send size={14} />
								Send Message
							</button>
						</form>
					) : (
						<div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-xs">
							Thank you! Your message has been sent. We'll get back to you soon.
						</div>
					)}

					<div className="mt-6 pt-4 border-t border-gray-200">
						<Link href="/" className="text-xs text-green-600 hover:underline">
							← Back to Login
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

