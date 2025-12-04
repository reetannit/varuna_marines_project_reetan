import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-primary-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⛽</span>
            <div>
              <h1 className="text-xl font-bold">FuelEU Maritime</h1>
              <p className="text-xs text-primary-200">Compliance Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-primary-200">
              Target: 89.34 gCO₂e/MJ (2025)
            </span>
            <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </header>
  );
};
