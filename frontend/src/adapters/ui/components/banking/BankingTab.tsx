import React, { useState } from 'react';
import { useBanking, useRoutes } from '../../hooks';
import { LoadingSpinner, ErrorMessage } from '../common/StatusComponents';

export const BankingTab: React.FC = () => {
  const [selectedShip, setSelectedShip] = useState('');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { routes } = useRoutes();
  const { records, loading, error, fetchRecords, bankSurplus } = useBanking();

  // Get unique vessel types from routes
  const vesselTypes = Array.from(new Set(routes.map(r => r.ship)));

  const handleFetchRecords = () => {
    if (selectedShip) {
      setSuccessMessage(null);
      fetchRecords(selectedShip, selectedYear);
    }
  };

  const handleBankSurplus = async () => {
    if (selectedShip) {
      setSuccessMessage(null);
      try {
        await bankSurplus(selectedShip, selectedYear);
        setSuccessMessage('Surplus banked successfully!');
        fetchRecords(selectedShip, selectedYear);
      } catch {
        // Error handled by hook - will show in error state
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Article 20 Header */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🏦</span>
          <div>
            <h3 className="font-medium text-blue-900">Article 20 - Banking</h3>
            <p className="text-sm text-blue-700 mt-1">
              Ships with positive compliance balance (surplus) can bank it for use in future years.
              Banked surplus can be carried forward for up to 2 reporting periods.
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Banking Operations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vessel Type
            </label>
            <select
              value={selectedShip}
              onChange={(e) => setSelectedShip(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select vessel type...</option>
              {vesselTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleFetchRecords}
              disabled={!selectedShip || loading}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              View Records
            </button>
            <button
              onClick={handleBankSurplus}
              disabled={!selectedShip || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Bank Surplus
            </button>
          </div>
        </div>

        {loading && <LoadingSpinner message="Processing..." />}
        {error && <ErrorMessage message={error} />}
        {successMessage && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-sm font-medium">✅ {successMessage}</p>
          </div>
        )}
      </div>

      {/* Banking Records */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Banking Records</h3>
        </div>
        <div className="p-4">
          {records.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ship ID</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Year</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount (gCO₂e)</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Applied</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{record.shipId}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">{record.year}</td>
                      <td className="px-4 py-3 text-sm text-green-600 text-right font-medium">
                        {(record.bankedAmount / 1000000).toFixed(2)}M
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">
                        {(record.usedAmount / 1000000).toFixed(2)}M
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {selectedShip 
                ? 'No banking records found for this vessel'
                : 'Select a vessel type to view banking records'}
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
        <h4 className="font-medium text-yellow-900 mb-2">Banking Rules (FuelEU Maritime)</h4>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>Only positive compliance balance (surplus) can be banked</li>
          <li>Banked surplus is valid for 2 subsequent reporting periods</li>
          <li>Ships can also borrow up to 2% of their compliance limit in advance</li>
          <li>Borrowed amounts must be repaid in the next reporting period</li>
        </ul>
      </div>
    </div>
  );
};
