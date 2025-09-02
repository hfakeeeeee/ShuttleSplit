import React from 'react';
import { SessionSettings } from '../types';

interface SessionSettingsProps {
  settings: SessionSettings;
  onUpdate: (settings: Partial<SessionSettings>) => void;
}

const SessionSettingsComponent: React.FC<SessionSettingsProps> = ({ settings, onUpdate }) => {
  const handleInputChange = (field: keyof SessionSettings, value: string) => {
    const numValue = parseFloat(value) || 0;
    onUpdate({ [field]: numValue });
  };

  return (
    <section className="card session-settings">
      <h2><i className="fas fa-cog"></i> Session Settings</h2>
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
          <label htmlFor="shuttlecockPrice">Shuttlecock Price (per piece)</label>
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
    </section>
  );
};

export default SessionSettingsComponent;
