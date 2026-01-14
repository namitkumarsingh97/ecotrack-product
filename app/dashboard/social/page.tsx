'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { companyAPI, metricsAPI } from '@/lib/api';
import { Users, Save } from 'lucide-react';

export default function SocialPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [formData, setFormData] = useState({
    totalEmployees: '',
    femaleEmployees: '',
    avgTrainingHours: '',
    workplaceIncidents: '',
    employeeTurnoverPercent: '',
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
        totalEmployees: parseInt(formData.totalEmployees),
        femaleEmployees: parseInt(formData.femaleEmployees),
        avgTrainingHours: parseFloat(formData.avgTrainingHours),
        workplaceIncidents: parseInt(formData.workplaceIncidents),
        employeeTurnoverPercent: parseFloat(formData.employeeTurnoverPercent),
        period: formData.period,
      };

      await metricsAPI.createSocial(data);
      setMessage({ type: 'success', text: 'Social metrics saved successfully!' });

      // Reset form
      setFormData({
        totalEmployees: '',
        femaleEmployees: '',
        avgTrainingHours: '',
        workplaceIncidents: '',
        employeeTurnoverPercent: '',
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Metrics</h1>
          <p className="text-gray-600">Track workforce diversity, training, and safety</p>
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
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Social Data</h2>
              <p className="text-sm text-gray-600">Enter your workforce and safety metrics</p>
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
                  Total Employees *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.totalEmployees}
                  onChange={(e) => setFormData({ ...formData, totalEmployees: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Female Employees *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.femaleEmployees}
                  onChange={(e) => setFormData({ ...formData, femaleEmployees: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avg Training Hours per Employee *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  value={formData.avgTrainingHours}
                  onChange={(e) => setFormData({ ...formData, avgTrainingHours: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workplace Incidents *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.workplaceIncidents}
                  onChange={(e) => setFormData({ ...formData, workplaceIncidents: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Turnover (%) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.employeeTurnoverPercent}
                  onChange={(e) => setFormData({ ...formData, employeeTurnoverPercent: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12"
                />
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

