import React, { useState } from 'react';
import { usePooling, useRoutes } from '../../hooks';
import { LoadingSpinner, ErrorMessage } from '../common/StatusComponents';

export const PoolingTab: React.FC = () => {
  const [selectedShips, setSelectedShips] = useState<string[]>([]);
  const [poolYear, setPoolYear] = useState(2025);
  
  const { routes } = useRoutes();
  const { pool, loading, error, createPool } = usePooling();

  // Get unique vessel types from routes
  const vesselTypes = Array.from(new Set(routes.map(r => r.ship)));

  const handleToggleShip = (ship: string) => {
    setSelectedShips(prev => 
      prev.includes(ship) 
        ? prev.filter(s => s !== ship)
        : [...prev, ship]
    );
  };

  const handleCreatePool = async () => {
    if (selectedShips.length < 2) {
      alert('Please select at least 2 vessels for pooling');
      return;
    }
    try {
      await createPool(selectedShips, poolYear);
      alert('Pool created successfully!');
      setSelectedShips([]);
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Article 21 Header */}
      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🤝</span>
          <div>
            <h3 className="font-medium text-purple-900">Article 21 - Pooling</h3>
            <p className="text-sm text-purple-700 mt-1">
              Ships can form compliance pools to meet requirements together. Ships with 
              surplus compliance balance can offset those with deficits within the same pool.
            </p>
          </div>
        </div>
      </div>

      {/* Create Pool */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Pool</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              value={poolYear}
              onChange={(e) => setPoolYear(parseInt(e.target.value))}
              className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Vessels (minimum 2)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {vesselTypes.map((ship) => (
                <button
                  key={ship}
                  onClick={() => handleToggleShip(ship)}
                  className={`px-4 py-3 rounded-md text-sm font-medium transition-colors border ${
                    selectedShips.includes(ship)
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {ship}
                  {selectedShips.includes(ship) && ' ✓'}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Selected: {selectedShips.length} vessel(s)
            </p>
          </div>

          <button
            onClick={handleCreatePool}
            disabled={selectedShips.length < 2 || loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create Pool
          </button>
        </div>

        {loading && <LoadingSpinner message="Creating pool..." />}
        {error && <ErrorMessage message={error} />}
      </div>

      {/* Pool Result */}
      {pool && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pool Created</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">Pool ID</p>
              <p className="font-mono text-sm">{pool.id}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">Year</p>
              <p className="text-xl font-bold text-gray-900">{pool.year}</p>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
        <h4 className="font-medium text-yellow-900 mb-2">Pooling Rules (FuelEU Maritime)</h4>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>Ships can voluntarily form pools for compliance purposes</li>
          <li>The pool's combined compliance balance is calculated as the sum of all members</li>
          <li>If pool has net positive balance, all members are considered compliant</li>
          <li>Pools must be registered before the end of each reporting period</li>
          <li>Pool manager is responsible for reporting and penalty payments</li>
        </ul>
      </div>
    </div>
  );
};
