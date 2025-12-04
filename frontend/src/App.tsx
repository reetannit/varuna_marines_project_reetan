import React, { useState } from 'react';
import { Header } from './adapters/ui/components/common/Header';
import { TabNavigation } from './adapters/ui/components/common/TabNavigation';
import { RoutesTab } from './adapters/ui/components/routes/RoutesTab';
import { CompareTab } from './adapters/ui/components/compare/CompareTab';
import { BankingTab } from './adapters/ui/components/banking/BankingTab';
import { PoolingTab } from './adapters/ui/components/pooling/PoolingTab';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('routes');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'routes':
        return <RoutesTab />;
      case 'compare':
        return <CompareTab />;
      case 'banking':
        return <BankingTab />;
      case 'pooling':
        return <PoolingTab />;
      default:
        return <RoutesTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderTabContent()}
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            FuelEU Maritime Compliance Platform • EU Regulation 2023/1805
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
