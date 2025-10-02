import React from 'react';
import { SessionSettings } from '../types';
import CollapsibleSection from './CollapsibleSection';

interface SessionSettingsProps {
  settings: SessionSettings;
  onUpdate: (settings: Partial<SessionSettings>) => void;
  isExpanded?: boolean;
  onToggle?: (isExpanded: boolean) => void;
}

const SessionSettingsComponent: React.FC<SessionSettingsProps> = ({ settings, onUpdate, isExpanded, onToggle }) => {
  const handleInputChange = (field: keyof SessionSettings, value: string) => {
    const numValue = parseFloat(value) || 0;
    onUpdate({ [field]: numValue });
  };

  const [localExpanded, setLocalExpanded] = React.useState(true);

  const handleToggle = (newState: boolean) => {
    setLocalExpanded(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  return (
    <CollapsibleSection 
      title="Session Settings"
      icon="fas fa-cog"
      className="session-settings"
      defaultExpanded={true}
      isExpanded={isExpanded !== undefined ? isExpanded : localExpanded}
      onToggle={handleToggle}
    >
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="courtFee">Court Fee per Session</label>
          <div className="input-wrapper">
            <span className="currency">₫</span>
            <input
              type="number"
              id="courtFee"
              placeholder="Enter court fee"
              min="0"
              value={settings.courtFee || ''}
              onChange={(e) => handleInputChange('courtFee', e.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="shuttlecockPrice">Shuttlecock Price</label>
          <div className="input-wrapper">
            <span className="currency">₫</span>
            <input
              type="number"
              id="shuttlecockPrice"
              placeholder="Enter shuttlecock price"
              min="0"
              value={settings.shuttlecockPrice || ''}
              onChange={(e) => handleInputChange('shuttlecockPrice', e.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="shuttlecockCount">Number of Shuttlecocks Used</label>
          <div className="input-wrapper">
            <i className="fas fa-feather-alt"></i>
            <input
              type="number"
              id="shuttlecockCount"
              placeholder="Enter count"
              min="0"
              value={settings.shuttlecockCount || ''}
              onChange={(e) => handleInputChange('shuttlecockCount', e.target.value)}
            />
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
};

export default SessionSettingsComponent;
