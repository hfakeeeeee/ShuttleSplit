import React from 'react';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-top">
          <div className="logo">
            <i className="fa-solid fa-shuttlecock"></i>
            <h1>ShuttleSplit</h1>
          </div>
        </div>
        <div className="header-bottom">
          <div className="keyboard-shortcuts">
            <small style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>
              💡 Shortcuts: Ctrl+1 (Summary) | Ctrl+2 (Settings)
            </small>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
