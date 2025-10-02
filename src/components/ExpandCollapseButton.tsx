import React from 'react';

interface ExpandCollapseButtonProps {
  isAllExpanded: boolean;
  onClick: () => void;
}

const ExpandCollapseButton: React.FC<ExpandCollapseButtonProps> = ({ isAllExpanded, onClick }) => {
  return (
    <button 
      className="btn-expand-collapse"
      onClick={onClick}
      aria-label={isAllExpanded ? 'Collapse all sections' : 'Expand all sections'}
    >
      <i className={`fas ${isAllExpanded ? 'fa-compress-alt' : 'fa-expand-alt'}`}></i>
      {isAllExpanded ? 'Collapse All' : 'Expand All'}
    </button>
  );
};

export default ExpandCollapseButton;