'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { companyAPI, metricsAPI, esgAPI } from '@/lib/api';
import { Leaf, Save, Calculator } from 'lucide-react';

export default function EnvironmentPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [formData, setFormData] = useState({
    electricityUsageKwh: '',
    fuelConsumptionLitres: '',
    waterUsageKL: '',
    wasteGeneratedKg: '',
    renewableEnergyPercent: '',
    carbonEmissionsTons: '',
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
        electricityUsageKwh: parseFloat(formData.electricityUsageKwh),
        fuelConsumptionLitres: parseFloat(formData.fuelConsumptionLitres),
        waterUsageKL: parseFloat(formData.waterUsageKL),
        wasteGeneratedKg: parseFloat(formData.wasteGeneratedKg),
        renewableEnergyPercent: parseFloat(formData.renewableEnergyPercent),
        carbonEmissionsTons: parseFloat(formData.carbonEmissionsTons),
        period: formData.period,
      };

      await metricsAPI.createEnvironmental(data);
      setMessage({ type: 'success', text: 'Environmental metrics saved successfully!' });

      // Reset form
      setFormData({
        electricityUsageKwh: '',
        fuelConsumptionLitres: '',
        waterUsageKL: '',
        wasteGeneratedKg: '',
        renewableEnergyPercent: '',
        carbonEmissionsTons: '',
        period: `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to save metrics' });
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateScore = async () => {
    if (!selectedCompanyId) return;

    try {
      await esgAPI.calculate(selectedCompanyId, formData.period);
      setMessage({ type: 'success', text: 'ESG score calculated! Check the dashboard.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to calculate score' });
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Environmental Metrics</h1>
          <p className="text-gray-600">Track energy, water, waste, and carbon emissions</p>
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
            <div className="p-3 bg-green-100 rounded-lg">
              <Leaf className="text-green-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Environmental Data</h2>
              <p className="text-sm text-gray-600">Enter your environmental metrics for the period</p>
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
                  Electricity Usage (kWh) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.electricityUsageKwh}
                  onChange={(e) => setFormData({ ...formData, electricityUsageKwh: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuel Consumption (Litres) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.fuelConsumptionLitres}
                  onChange={(e) => setFormData({ ...formData, fuelConsumptionLitres: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Water Usage (KL) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.waterUsageKL}
                  onChange={(e) => setFormData({ ...formData, waterUsageKL: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waste Generated (kg) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.wasteGeneratedKg}
                  onChange={(e) => setFormData({ ...formData, wasteGeneratedKg: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Renewable Energy (%) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.renewableEnergyPercent}
                  onChange={(e) => setFormData({ ...formData, renewableEnergyPercent: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carbon Emissions (tons) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.carbonEmissionsTons}
                  onChange={(e) => setFormData({ ...formData, carbonEmissionsTons: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100"
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
              <button
                type="button"
                onClick={handleCalculateScore}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
              >
                <Calculator size={20} />
                Calculate ESG Score
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

