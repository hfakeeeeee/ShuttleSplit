import React from 'react';
import { useTheme } from './ThemeProvider';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'dark') {
      return <i className="fas fa-moon"></i>;
    } else {
      return <i className="fas fa-sun"></i>;
    }
  };

  const getTooltip = () => {
    if (theme === 'dark') {
      return 'Dark mode';
    } else {
      return 'Light mode';
    }
  };

  return (
    <button
      onClick={handleThemeChange}
      className="theme-toggle"
      title={getTooltip()}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {getIcon()}
    </button>
  );
};

export default ThemeToggle;
