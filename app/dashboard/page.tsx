'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import KPICard from '@/components/KPICard';
import ScoreCard from '@/components/ScoreCard';
import { companyAPI, esgAPI } from '@/lib/api';
import { Building2, TrendingUp, Users, Leaf, Shield, FileText } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [esgScores, setEsgScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const companiesRes = await companyAPI.getAll();
      setCompanies(companiesRes.data.companies);

      if (companiesRes.data.companies.length > 0) {
        const company = companiesRes.data.companies[0];
        setSelectedCompany(company);

        const scoresRes = await esgAPI.getScore(company._id);
        setEsgScores(scoresRes.data.scores);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const latestScore = esgScores[0];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (companies.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <Building2 className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to EcoTrack India!
          </h2>
          <p className="text-gray-600 mb-8">
            Let's get started by adding your company information.
          </p>
          <Link
            href="/dashboard/company"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Add Company
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ESG Dashboard
          </h1>
          <p className="text-gray-600">
            {selectedCompany?.name} - {selectedCompany?.reportingYear}
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Companies"
            value={companies.length}
            icon={Building2}
            color="blue"
          />
          <KPICard
            title="Overall ESG Score"
            value={latestScore ? latestScore.overallScore.toFixed(1) : 'N/A'}
            icon={TrendingUp}
            color="green"
          />
          <KPICard
            title="Employees"
            value={selectedCompany?.employeeCount || 0}
            icon={Users}
            color="purple"
          />
          <KPICard
            title="Reports Generated"
            value={esgScores.length}
            icon={FileText}
            color="yellow"
          />
        </div>

        {/* ESG Scores */}
        {latestScore ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ScoreCard
              title="Overall ESG Score"
              score={latestScore.overallScore}
              description="Weighted average of all ESG metrics"
            />
            <ScoreCard
              title="Environmental"
              score={latestScore.environmentalScore}
              description="40% weight in overall score"
            />
            <ScoreCard
              title="Social"
              score={latestScore.socialScore}
              description="30% weight in overall score"
            />
            <ScoreCard
              title="Governance"
              score={latestScore.governanceScore}
              description="30% weight in overall score"
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <TrendingUp className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No ESG Scores Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Add your company metrics to calculate ESG scores
            </p>
            <Link
              href="/dashboard/environment"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Add Metrics
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            icon={Leaf}
            title="Environmental Data"
            description="Track energy, water, waste & emissions"
            href="/dashboard/environment"
            color="green"
          />
          <QuickActionCard
            icon={Users}
            title="Social Metrics"
            description="Monitor workforce & safety data"
            href="/dashboard/social"
            color="blue"
          />
          <QuickActionCard
            icon={Shield}
            title="Governance Info"
            description="Update board & compliance details"
            href="/dashboard/governance"
            color="purple"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

function QuickActionCard({ icon: Icon, title, description, href, color }: any) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600 hover:bg-green-100',
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
  };

  return (
    <Link
      href={href}
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all group"
    >
      <div className={`inline-flex p-3 rounded-lg mb-4 ${colorClasses[color]}`}>
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
        {title}
      </h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </Link>
  );
}

