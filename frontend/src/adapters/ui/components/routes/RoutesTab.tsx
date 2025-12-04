import React from 'react';
import { Route } from '../../../../core/domain/entities';
import { useRoutes } from '../../hooks';
import { LoadingSpinner, ErrorMessage, StatusBadge } from '../common/StatusComponents';
import { FUELEU_CONSTANTS } from '../../../../core/domain/entities/value-objects';

export const RoutesTab: React.FC = () => {
  const { routes, loading, error, refetch } = useRoutes();

  const getComplianceStatus = (actualIntensity: number): 'COMPLIANT' | 'NON_COMPLIANT' => {
    return actualIntensity <= FUELEU_CONSTANTS.TARGET_2025_GHG_INTENSITY 
      ? 'COMPLIANT' 
      : 'NON_COMPLIANT';
  };

  if (loading) return <LoadingSpinner message="Loading routes..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      {/* Routes Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Routes ({routes.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vessel Type
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distance (nm)
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fuel (tons)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fuel Type
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GHG Intensity
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {routes.map((route: Route) => (
                <tr key={route.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {route.routeId}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {route.ship}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">
                    {route.distance.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">
                    {route.fuelConsumption.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {route.fuelType}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">
                    {route.actualGHGIntensity.toFixed(2)} gCO₂e/MJ
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <StatusBadge status={getComplianceStatus(route.actualGHGIntensity)} />
                  </td>
                </tr>
              ))}
              {routes.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No routes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-blue-900">2025 Target</h4>
            <p className="text-sm text-blue-700">
              Maximum GHG Intensity: {FUELEU_CONSTANTS.TARGET_2025_GHG_INTENSITY.toFixed(2)} gCO₂e/MJ
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-900">
              {routes.length > 0 
                ? (routes.reduce((sum, r) => sum + r.actualGHGIntensity, 0) / routes.length).toFixed(2)
                : '-'
              }
            </p>
            <p className="text-sm text-blue-700">Average GHG Intensity</p>
          </div>
        </div>
      </div>
    </div>
  );
};
