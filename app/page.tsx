'use client';

import { useRouter } from 'next/navigation';
import { Leaf, TrendingUp, Shield, FileText, CheckCircle } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Leaf className="text-green-600" size={32} />
            <span className="text-2xl font-bold text-gray-900">EcoTrack India</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/auth/login')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Login
            </button>
            <button
              onClick={() => router.push('/auth/register')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          One-Click ESG Reporting for<br />
          <span className="text-blue-600">Indian SMBs</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Automated ESG & sustainability reporting aligned to Indian + global standards.
          No Big-4 complexity. No massive costs. Just results.
        </p>
        <button
          onClick={() => router.push('/auth/register')}
          className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 shadow-lg"
        >
          Start Free Trial
        </button>
        <p className="text-sm text-gray-500 mt-4">No credit card required • 14-day free trial</p>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why EcoTrack India?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<TrendingUp className="text-blue-600" size={40} />}
            title="Automated Scoring"
            description="AI-powered ESG score calculation based on your metrics"
          />
          <FeatureCard
            icon={<Leaf className="text-green-600" size={40} />}
            title="India-Specific"
            description="Aligned to Indian compliance and global ESG standards"
          />
          <FeatureCard
            icon={<FileText className="text-purple-600" size={40} />}
            title="Export Reports"
            description="PDF & Excel reports ready for investors and auditors"
          />
          <FeatureCard
            icon={<Shield className="text-red-600" size={40} />}
            title="Compliance Ready"
            description="Meet tender requirements and investor expectations"
          />
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingCard
            name="Starter"
            price="₹1,999"
            period="per month"
            features={[
              'Manual data entry',
              'Basic ESG scoring',
              'JSON reports',
              'Email support'
            ]}
            popular={false}
          />
          <PricingCard
            name="Pro"
            price="₹4,999"
            period="per month"
            features={[
              'Everything in Starter',
              'Auto scoring engine',
              'PDF report exports',
              'Priority support',
              'Multi-period tracking'
            ]}
            popular={true}
          />
          <PricingCard
            name="Enterprise"
            price="Custom"
            period="contact us"
            features={[
              'Everything in Pro',
              'Multi-year audits',
              'Excel exports',
              'Dedicated account manager',
              'Custom integrations'
            ]}
            popular={false}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf size={24} />
            <span className="text-xl font-bold">EcoTrack India</span>
          </div>
          <p className="text-gray-400">
            Empowering Indian SMBs with world-class ESG reporting
          </p>
          <p className="text-gray-500 text-sm mt-4">
            © 2026 EcoTrack India. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function PricingCard({ name, price, period, features, popular }: any) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 p-8 ${popular ? 'border-blue-600 relative' : 'border-gray-200'}`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
          Most Popular
        </div>
      )}
      <h3 className="text-2xl font-bold mb-2">{name}</h3>
      <div className="mb-6">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-gray-600 ml-2">{period}</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature: string, index: number) => (
          <li key={index} className="flex items-start gap-2">
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <button className={`w-full py-3 rounded-lg font-semibold ${popular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
        Choose Plan
      </button>
    </div>
  );
}

