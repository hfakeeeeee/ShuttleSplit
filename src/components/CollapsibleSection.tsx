import React, { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  icon?: string; // Font Awesome icon class
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  children,
  defaultExpanded = true,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <section className={`card collapsible-section ${className}`}>
      <div className="section-header collapsible-header" onClick={toggleExpanded}>
        <h2>
          {icon && <i className={icon}></i>}
          {title}
        </h2>
        <button 
          className="btn-toggle" 
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
        >
          <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
        </button>
      </div>
      <div className={`collapsible-content ${isExpanded ? 'expanded' : 'collapsed'}`}>
        {children}
      </div>
    </section>
  );
};

export default CollapsibleSection;