'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { companyAPI, metricsAPI } from '@/lib/api';
import { Shield, Save } from 'lucide-react';

export default function GovernancePage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [formData, setFormData] = useState({
    boardMembers: '',
    independentDirectors: '',
    antiCorruptionPolicy: false,
    dataPrivacyPolicy: false,
    complianceViolations: '',
    period: `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const response = await companyAPI.getAll();
      setCompanies(response.data.companies);
      if (response.data.companies.length > 0) {
        setSelectedCompanyId(response.data.companies[0]._id);
      }
    } catch (error) {
      console.error('Failed to load companies:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const data = {
        companyId: selectedCompanyId,
        boardMembers: parseInt(formData.boardMembers),
        independentDirectors: parseInt(formData.independentDirectors),
        antiCorruptionPolicy: formData.antiCorruptionPolicy,
        dataPrivacyPolicy: formData.dataPrivacyPolicy,
        complianceViolations: parseInt(formData.complianceViolations),
        period: formData.period,
      };

      await metricsAPI.createGovernance(data);
      setMessage({ type: 'success', text: 'Governance metrics saved successfully!' });

      // Reset form
      setFormData({
        boardMembers: '',
        independentDirectors: '',
        antiCorruptionPolicy: false,
        dataPrivacyPolicy: false,
        complianceViolations: '',
        period: `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to save metrics' });
    } finally {
      setLoading(false);
    }
  };

  if (companies.length === 0) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Please add a company first</p>
          <a href="/dashboard/company" className="text-blue-600 hover:underline">
            Go to Company Page
          </a>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Governance Metrics</h1>
          <p className="text-gray-600">Track board composition, policies, and compliance</p>
        </div>

        {message.text && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="text-purple-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Governance Data</h2>
              <p className="text-sm text-gray-600">Enter your governance and compliance information</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Company *
              </label>
              <select
                required
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {companies.map((company) => (
                  <option key={company._id} value={company._id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reporting Period *
              </label>
              <input
                type="text"
                required
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2026-Q1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Board Members *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.boardMembers}
                  onChange={(e) => setFormData({ ...formData, boardMembers: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Independent Directors *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.independentDirectors}
                  onChange={(e) => setFormData({ ...formData, independentDirectors: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compliance Violations *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.complianceViolations}
                  onChange={(e) => setFormData({ ...formData, complianceViolations: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="antiCorruption"
                  checked={formData.antiCorruptionPolicy}
                  onChange={(e) => setFormData({ ...formData, antiCorruptionPolicy: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="antiCorruption" className="ml-3 text-sm font-medium text-gray-700">
                  Anti-Corruption Policy in place
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="dataPrivacy"
                  checked={formData.dataPrivacyPolicy}
                  onChange={(e) => setFormData({ ...formData, dataPrivacyPolicy: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="dataPrivacy" className="ml-3 text-sm font-medium text-gray-700">
                  Data Privacy Policy in place
                </label>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                {loading ? 'Saving...' : 'Save Metrics'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

