import React, { useState } from 'react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  onClose: () => void;
  onSave: (settings: AppSettings) => void;
  onShowNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSave,
  onShowNotification
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);

  const handleInputChange = (field: keyof AppSettings, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData(prev => ({
          ...prev,
          momoQRImage: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(formData);
    onShowNotification('Settings saved successfully!', 'success');
    onClose();
  };

  const handleClose = () => {
    setFormData(settings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><i className="fas fa-credit-card"></i> Payment Settings</h3>
          <button className="close-btn" onClick={handleClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="bankName">Bank Name</label>
            <input
              type="text"
              id="bankName"
              placeholder="Enter bank name"
              value={formData.bankName}
              onChange={(e) => handleInputChange('bankName', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="accountNumber">Account Number</label>
            <input
              type="text"
              id="accountNumber"
              placeholder="Enter account number"
              value={formData.accountNumber}
              onChange={(e) => handleInputChange('accountNumber', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="accountHolder">Account Holder</label>
            <input
              type="text"
              id="accountHolder"
              placeholder="Enter account holder name"
              value={formData.accountHolder}
              onChange={(e) => handleInputChange('accountHolder', e.target.value)}
            />
          </div>
          
          <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />
          
          <div className="form-group">
            <label htmlFor="momoNumber">MoMo Number</label>
            <input
              type="text"
              id="momoNumber"
              placeholder="Enter MoMo phone number"
              value={formData.momoNumber}
              onChange={(e) => handleInputChange('momoNumber', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="momoQRImage">MoMo QR Code Image</label>
            <input
              type="file"
              id="momoQRImage"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ marginBottom: '0.5rem' }}
            />
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              Upload your MoMo QR code image (JPG, PNG, etc.)
            </small>
            {formData.momoQRImage && (
              <div style={{ marginTop: '0.5rem' }}>
                <img 
                  src={formData.momoQRImage} 
                  alt="MoMo QR Preview" 
                  style={{ 
                    maxWidth: '100px', 
                    maxHeight: '100px', 
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)'
                  }} 
                />
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleSave}>
            Save Settings
          </button>
          <button className="btn btn-secondary" onClick={handleClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
