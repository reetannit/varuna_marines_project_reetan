import React, { useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useComparison } from '../../hooks';
import { LoadingSpinner, ErrorMessage, StatusBadge } from '../common/StatusComponents';
import { FUELEU_CONSTANTS } from '../../../../core/domain/entities/value-objects';

export const CompareTab: React.FC = () => {
  const { comparisons, loading, error, fetchComparison } = useComparison();

  useEffect(() => {
    fetchComparison();
  }, [fetchComparison]);

  if (loading) return <LoadingSpinner message="Loading comparison data..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchComparison} />;

  const chartData = comparisons.map(c => ({
    name: c.routeId,
    ship: c.ship,
    actual: c.actualGHGIntensity,
    target: c.targetGHGIntensity,
    difference: c.difference,
  }));

  const totalCB = comparisons.reduce((sum, c) => sum + c.complianceBalance, 0);
  const compliantCount = comparisons.filter(c => c.status === 'COMPLIANT').length;
  const nonCompliantCount = comparisons.filter(c => c.status === 'NON_COMPLIANT').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total Routes</p>
          <p className="text-2xl font-bold text-gray-900">{comparisons.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 border border-green-200">
          <p className="text-sm text-green-700">Compliant</p>
          <p className="text-2xl font-bold text-green-600">{compliantCount}</p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4 border border-red-200">
          <p className="text-sm text-red-700">Non-Compliant</p>
          <p className="text-2xl font-bold text-red-600">{nonCompliantCount}</p>
        </div>
        <div className={`rounded-lg shadow p-4 border ${
          totalCB >= 0 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <p className={`text-sm ${totalCB >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            Total Compliance Balance
          </p>
          <p className={`text-2xl font-bold ${
            totalCB >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {(totalCB / 1000000).toFixed(2)}M gCO₂e
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          GHG Intensity Comparison
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis 
                label={{ 
                  value: 'gCO₂e/MJ', 
                  angle: -90, 
                  position: 'insideLeft' 
                }} 
              />
              <Tooltip 
                formatter={(value: number) => `${value.toFixed(2)} gCO₂e/MJ`}
                labelFormatter={(label) => `Route: ${label}`}
              />
              <Legend />
              <ReferenceLine 
                y={FUELEU_CONSTANTS.TARGET_2025_GHG_INTENSITY} 
                stroke="#ef4444" 
                strokeDasharray="5 5"
                label={{ value: 'Target', fill: '#ef4444', fontSize: 12 }}
              />
              <Bar 
                dataKey="actual" 
                name="Actual GHG Intensity" 
                fill="#3b82f6"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-500 mt-2 text-center">
          Red dashed line indicates the 2025 target: {FUELEU_CONSTANTS.TARGET_2025_GHG_INTENSITY.toFixed(2)} gCO₂e/MJ
        </p>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Detailed Comparison
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vessel</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Target</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actual</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Difference</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">CB (gCO₂e)</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {comparisons.map((c) => (
                <tr key={c.routeId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.routeId}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{c.ship}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right">
                    {c.targetGHGIntensity.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right">
                    {c.actualGHGIntensity.toFixed(2)}
                  </td>
                  <td className={`px-4 py-3 text-sm text-right font-medium ${
                    c.difference >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {c.difference >= 0 ? '+' : ''}{c.difference.toFixed(2)}
                  </td>
                  <td className={`px-4 py-3 text-sm text-right font-medium ${
                    c.complianceBalance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(c.complianceBalance / 1000000).toFixed(2)}M
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
