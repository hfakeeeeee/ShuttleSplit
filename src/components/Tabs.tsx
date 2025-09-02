import React from 'react';

interface TabProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Tabs: React.FC<TabProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'summary', label: 'Summary & Payment', icon: 'fas fa-chart-line' },
    { id: 'settings', label: 'Settings & Configuration', icon: 'fas fa-cog' }
  ];

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <i className={tab.icon}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
