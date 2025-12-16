import React, { useState } from 'react';

interface TabProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  hasRegisterTab?: boolean;
}

const Tabs: React.FC<TabProps> = ({ activeTab, onTabChange, hasRegisterTab = false }) => {
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const tabs = [
    { id: 'summary', label: 'Summary & Payment', icon: 'fas fa-chart-line' },
    ...(hasRegisterTab ? [{ id: 'register', label: 'Register', icon: 'fas fa-clipboard-list' }] : []),
    { id: 'settings', label: 'Settings & Configuration', icon: 'fas fa-cog' }
  ];

  // Hidden trigger: triple-click on the Settings tab within 1 second to reveal diagnostics
  const handleSettingsClick = () => {
    const now = Date.now();
    
    // Check if this is a quick successive click (within 1 second)
    if (now - lastClickTime < 1000) {
      const newCount = clickCount + 1;
      
      if (newCount >= 3) {
        // Third click - reveal diagnostics panel
        onTabChange('diag');
        setClickCount(0);
        setLastClickTime(0);
        return;
      }
      
      // First or second quick click
      setClickCount(newCount);
      setLastClickTime(now);
      onTabChange('settings');
    } else {
      // First click or timeout - reset counter
      setClickCount(1);
      setLastClickTime(now);
      onTabChange('settings');
    }
  };

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => tab.id === 'settings' ? handleSettingsClick() : onTabChange(tab.id)}
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
